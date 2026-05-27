import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { calculateProductStatus } from "../utils/dateUtils.js";
import { createAlertIfNotExists } from "../utils/alertManager.js";

/**
 * Valid order status transitions
 */
const VALID_TRANSITIONS = {
  pending: ["processing", "cancelled"],
  processing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

/**
 * Check if status transition is valid
 */
function canTransition(currentStatus, nextStatus) {
  return VALID_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

/**
 * Get all orders with optional filtering
 */
export async function getAllOrders(req, res, next) {
  try {
    const {
      status,
      search,
      sort = "createdAt",
      order = "desc",
      mine,
    } = req.query;

    const where = {};

    // If mine=true OR user is CUSTOMER, filter by user's orders only
    if (mine === "true" || req.user.userType === "CUSTOMER") {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.customerName = { contains: search, mode: "insensitive" };
    }

    const validSorts = ["customerName", "totalAmount", "status", "createdAt"];
    const sortBy = validSorts.includes(sort) ? sort : "createdAt";
    const sortOrder = order.toLowerCase() === "asc" ? "asc" : "desc";

    const orders = await prisma.order.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
          },
        },
      },
    });

    sendSuccess(res, 200, orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!order) {
      return sendError(res, 404, "Order not found", "NOT_FOUND");
    }

    if (req.user.userType === "CUSTOMER" && order.userId !== req.user.id) {
      return sendError(res, 403, "Access denied", "FORBIDDEN");
    }

    sendSuccess(res, 200, order);
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new order
 */
export async function createOrder(req, res, next) {
  try {
    const {
      items,
      totalAmount,
      paymentMethod,
      shippingAddress,
      deliveryMethod,
      prescriptionId,
    } = req.body;

    if ((!items || !items.length) && !prescriptionId) {
      return sendError(
        res,
        400,
        "Order items or prescription reference are required",
        "BAD_REQUEST",
      );
    }

    let productsData = [];
    let prescription = null;

    if (prescriptionId) {
      prescription = await prisma.prescription.findUnique({
        where: { id: prescriptionId },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              unitPrice: true,
              quantity: true,
            },
          },
        },
      });
      if (!prescription) {
        return sendError(res, 404, "Prescription not found", "NOT_FOUND");
      }
      if (prescription.status !== "available") {
        return sendError(
          res,
          400,
          "Prescription must be available before checkout",
          "INVALID_PRESCRIPTION_STATUS",
        );
      }
      if (prescription.productId && prescription.product) {
        const requiredQuantity = prescription.productQuantity || 1;
        if (prescription.product.quantity < requiredQuantity) {
          return sendError(
            res,
            400,
            "Not enough stock for the selected prescription product",
            "INSUFFICIENT_STOCK",
          );
        }
      }
    }

    if (items && items.length) {
      productsData = await Promise.all(
        items.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
          });
          if (!product) {
            throw new Error(`Product not found: ${item.productId}`);
          }
          return {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.unitPrice,
            name: product.name,
          };
        }),
      );
    }

    if (prescription && !productsData.length && !prescription.productId) {
      return sendError(
        res,
        400,
        "Prescription must be linked to an inventory product before checkout",
        "INVALID_PRESCRIPTION_LINK",
      );
    }

    const baseAmount = prescription
      ? Number(prescription.estimatedPrice ?? 0)
      : productsData.reduce(
          (acc, curr) => acc + Number(curr.unitPrice) * curr.quantity,
          0,
        );

    const deliveryFee = deliveryMethod === "express" ? 9.99 : 5.99;
    const tax = Math.round(baseAmount * 0.08 * 100) / 100;
    const finalTotalAmount = totalAmount || baseAmount + deliveryFee + tax;
    const masterOrderNumber =
      "ORD-" + Math.random().toString(36).toUpperCase().slice(2, 8);

    const primaryItem = productsData[0];
    const prescriptionQuantity = prescription?.productQuantity ?? 1;

    const shippingAddressObj =
      typeof shippingAddress === "string"
        ? { street: shippingAddress }
        : shippingAddress || {};

    const orderCreatePayload = {
      orderNumber: masterOrderNumber,
      customerName: shippingAddressObj.firstName
        ? `${shippingAddressObj.firstName} ${shippingAddressObj.lastName}`
        : req.user.name || "Customer",
      customerPhone: shippingAddressObj.phone || "N/A",
      customerEmail: shippingAddressObj.email || null,
      quantity: primaryItem?.quantity ?? prescriptionQuantity,
      totalAmount: finalTotalAmount,
      status: "pending",
      paymentMethod: paymentMethod || "Cash",
      shippingAddress: shippingAddressObj,
      isPrescriptionOrder: Boolean(prescriptionId),
      prescriptionId: prescriptionId ?? undefined,
    };

    if (req.user.userType === "CUSTOMER") {
      orderCreatePayload.user = { connect: { id: req.user.id } };
    }

    if (primaryItem?.productId) {
      orderCreatePayload.product = { connect: { id: primaryItem.productId } };
    } else if (prescription?.productId) {
      orderCreatePayload.product = { connect: { id: prescription.productId } };
    }

    const order = await prisma.order.create({
      data: orderCreatePayload,
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    sendSuccess(res, 201, order, "Order created successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Update order
 */
export async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { customerName, customerPhone, productId, quantity } = req.body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return sendError(res, 404, "Order not found", "NOT_FOUND");
    }

    // Cannot structurally modify completed or cancelled orders
    if (
      existingOrder.status === "completed" ||
      existingOrder.status === "cancelled"
    ) {
      return sendError(res, 400, "Cannot edit finalized orders", "FINALIZED");
    }

    // Fetch product to get updated price
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return sendError(res, 404, "Product not found", "NOT_FOUND");
    }

    const totalAmount = Number(product.unitPrice) * quantity;

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        customerName,
        customerPhone,
        productId,
        quantity,
        totalAmount,
      },
      include: {
        product: { select: { id: true, name: true } },
      },
    });

    sendSuccess(res, 200, updatedOrder, "Order updated successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    // Fetch current order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!order) {
      return sendError(res, 404, "Order not found", "NOT_FOUND");
    }

    // Validate transition
    if (!canTransition(order.status, newStatus)) {
      return sendError(
        res,
        400,
        `Cannot transition from ${order.status} to ${newStatus}`,
        "INVALID_TRANSITION",
      );
    }

    // Handle completion with atomic transaction
    if (newStatus === "completed") {
      await completeOrder(id, order);
    } else if (newStatus === "cancelled") {
      await prisma.order.update({
        where: { id },
        data: { status: "cancelled" },
      });
    } else {
      // Just update status for pending -> processing or processing -> out_for_delivery
      await prisma.order.update({
        where: { id },
        data: { status: newStatus },
      });
    }

    // Fetch updated order
    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    sendSuccess(res, 200, updatedOrder, "Order status updated successfully");
  } catch (error) {
    console.error("Order status update error:", error);
    if (error.message === "INSUFFICIENT_STOCK") {
      return sendError(
        res,
        409,
        "Insufficient stock. Update inventory first.",
        "INSUFFICIENT_STOCK",
      );
    }
    next(error);
  }
}

/**
 * Complete order with atomic DB transaction
 */
async function completeOrder(orderId, order) {
  return await prisma.$transaction(async (tx) => {
    if (!order.productId) {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "completed" },
      });
      return;
    }

    const currentProduct = await tx.product.findUnique({
      where: { id: order.productId },
    });

    if (!currentProduct) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    if (currentProduct.quantity < order.quantity) {
      throw new Error("INSUFFICIENT_STOCK");
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: "completed" },
    });

    const newQty = currentProduct.quantity - order.quantity;
    const newStatus = calculateProductStatus(newQty, currentProduct.expiryDate);

    await tx.product.update({
      where: { id: order.productId },
      data: {
        quantity: newQty,
        status: newStatus,
      },
    });

    await tx.transaction.create({
      data: {
        orderId: order.id,
        productId: order.productId,
        type: "sale",
        quantity: order.quantity,
        amount: order.totalAmount,
      },
    });

    const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD) || 10;
    if (newQty < threshold) {
      await createAlertIfNotExists(
        tx,
        order.productId,
        "low_stock",
        `${currentProduct.name} is running low (${newQty} units remaining)`,
      );
    }
  });
}

/**
 * Get order by ID or orderNumber for tracking (public - no auth required)
 */
export async function trackOrder(req, res, next) {
  try {
    const { identifier } = req.params;

    // Try to find by orderNumber first, then by UUID
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: identifier }, { id: identifier }],
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            unitPrice: true,
          },
        },
      },
    });

    if (!order) {
      return sendError(res, 404, "Order not found", "NOT_FOUND");
    }

    sendSuccess(res, 200, order);
  } catch (error) {
    next(error);
  }
}
