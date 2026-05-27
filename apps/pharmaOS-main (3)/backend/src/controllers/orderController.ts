import { Response } from 'express';
import prisma from '../lib/prisma.js';
import { AuthenticatedRequest } from '../middleware/auth';

// Create new order (Final Checkout)
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const {
      items,
      shippingInfo,
      billingInfo,
      totalAmount,
      deliveryOption,
      prescriptionId
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Validate required fields - simplified for single product order
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required and must not be empty'
      });
    }

    // For this schema, we'll create one order per item
    const firstItem = items[0];
    if (!firstItem.productId || !firstItem.quantity) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and quantity are required'
      });
    }

    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();

    // Get product details for pricing
    const product = await prisma.product.findUnique({
      where: { id: firstItem.productId }
    });

    if (!product) {
      return res.status(400).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Calculate totals
    const itemTotal = parseFloat(product.unitPrice.toString()) * firstItem.quantity;
    const deliveryFee = deliveryOption === 'express' ? 9.99 : 5.99;
    const tax = Math.round(itemTotal * 0.08 * 100) / 100;
    const finalTotal = itemTotal + deliveryFee + tax;

    // Start transaction
    const order = await prisma.$transaction(async (tx: any) => {
      // Create the order (single product per order based on schema)
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId,
          customerName: shippingInfo?.firstName + ' ' + shippingInfo?.lastName || 'Customer',
          customerPhone: shippingInfo?.phone || '',
          customerEmail: shippingInfo?.email || '',
          productId: firstItem.productId,
          quantity: firstItem.quantity,
          totalAmount: finalTotal,
          status: 'pending',
          paymentMethod: billingInfo?.paymentMethod || 'Cash',
          shippingAddress: shippingInfo,
          isPrescriptionOrder: !!prescriptionId,
          prescriptionId: prescriptionId || null
        }
      });

      // Clear this item from user's cart after successful order creation
      await tx.cartItem.deleteMany({
        where: {
          userId: userId,
          productId: firstItem.productId
        }
      });

      return newOrder;
    });

    // Fetch the complete order with product details
    const completeOrder = await prisma.order.findUnique({
      where: {
        id: order.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: completeOrder,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order'
    });
  }
};

// Get user's orders (Orders List)
export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
};

// Get specific order details (Order Details)
export const getOrderById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const idStr = Array.isArray(id) ? id[0] : id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: idStr,
        userId: userId // Ensure user can only access their own orders
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order details retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details'
    });
  }
};

// Track order by orderNumber or id (Live Tracking)
export const trackOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    const idStr = Array.isArray(id) ? id[0] : id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Try to find by orderNumber first, then by id
    let order = await prisma.order.findFirst({
      where: {
        orderNumber: idStr,
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            userType: true
          }
        }
      }
    });

    // If not found by orderNumber, try by id
    if (!order) {
      order = await prisma.order.findFirst({
        where: {
          id: idStr,
          userId: userId
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              userType: true
            }
          }
        }
      });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track order'
    });
  }
};

// Update order status (for admin use)
export const updateOrderStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const idStr = Array.isArray(id) ? id[0] : id;

    if (!status || !['pending', 'processing', 'out_for_delivery', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required'
      });
    }

    const order = await prisma.order.update({
      where: {
        id: idStr
      },
      data: {
        status: status,
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    });
  }
};
