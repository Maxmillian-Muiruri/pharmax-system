import prisma from "../lib/prisma.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

/**
 * Upload a new prescription
 */
export async function uploadPrescription(req, res, next) {
  try {
    const {
      patientName,
      phoneNumber,
      email,
      doctorName,
      hospitalName,
      address,
      notes,
      files,
    } = req.body;

    if (
      !patientName ||
      !phoneNumber ||
      !email ||
      !doctorName ||
      !hospitalName ||
      !address
    ) {
      return sendError(res, 400, "Missing required fields", "VALIDATION_ERROR");
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return sendError(
        res,
        400,
        "At least one file is required",
        "VALIDATION_ERROR",
      );
    }

    // Generate prescription ID (e.g., RX-291066)
    const prescriptionId =
      "RX-" + Math.random().toString(36).toUpperCase().slice(2, 8);

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionId,
        patientName,
        phoneNumber,
        email,
        doctorName,
        hospitalName,
        address,
        notes: notes || "",
        files,
        status: "under_review",
        userId: req.user.id,
      },
    });

    sendSuccess(res, 201, prescription, "Prescription uploaded successfully");
  } catch (error) {
    next(error);
  }
}

/**
 * Get all prescriptions for the authenticated user
 */
export async function getUserPrescriptions(req, res, next) {
  try {
    const { status, search } = req.query;
    const where = {};

    if (req.user.userType === "CUSTOMER") {
      where.userId = req.user.id;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { patientName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { doctorName: { contains: search, mode: "insensitive" } },
        { hospitalName: { contains: search, mode: "insensitive" } },
        { prescriptionId: { contains: search, mode: "insensitive" } },
      ];
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

    sendSuccess(res, 200, prescriptions);
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single prescription (must belong to user)
 */
export async function getPrescription(req, res, next) {
  try {
    const { id } = req.params;

    const prescription = await prisma.prescription.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
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

    sendSuccess(res, 200, prescription);
  } catch (error) {
    next(error);
  }
}

/**
 * Update prescription status (admin only)
 */
export async function updatePrescriptionStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reviewNotes, estimatedPrice, productId, productQuantity } =
      req.body;

    if (!status) {
      return sendError(res, 400, "Status is required", "VALIDATION_ERROR");
    }

    const validStatuses = [
      "under_review",
      "available",
      "out_of_stock",
      "rejected",
      "dispensed",
    ];
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, "Invalid status value", "VALIDATION_ERROR");
    }

    if (status === "available" && !productId) {
      return sendError(
        res,
        400,
        "A product must be selected before marking a prescription available",
        "VALIDATION_ERROR",
      );
    }

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        return sendError(res, 404, "Selected product not found", "NOT_FOUND");
      }
    }

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes || "",
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
        productId: productId || null,
        productQuantity: productId
          ? Math.max(1, Number(productQuantity) || 1)
          : undefined,
      },
    });

    sendSuccess(
      res,
      200,
      prescription,
      "Prescription status updated successfully",
    );
  } catch (error) {
    next(error);
  }
}
