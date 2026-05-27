import prisma from '../lib/prisma.js'
import { sendSuccess, sendError } from '../utils/responseHelper.js'

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
    } = req.body

    if (!patientName || !phoneNumber || !email || !doctorName || !hospitalName || !address) {
      return sendError(res, 400, 'Missing required fields', 'VALIDATION_ERROR')
    }

    if (!files || !Array.isArray(files) || files.length === 0) {
      return sendError(res, 400, 'At least one file is required', 'VALIDATION_ERROR')
    }

    // Generate prescription ID (e.g., RX-291066)
    const prescriptionId = 'RX-' + Math.random().toString(36).toUpperCase().slice(2, 8)

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionId,
        patientName,
        phoneNumber,
        email,
        doctorName,
        hospitalName,
        address,
        notes: notes || '',
        files,
        status: 'under_review',
        userId: req.user.id,
      },
    })

    sendSuccess(res, 201, prescription, 'Prescription uploaded successfully')
  } catch (error) {
    next(error)
  }
}

/**
 * Get all prescriptions for the authenticated user
 */
export async function getUserPrescriptions(req, res, next) {
  try {
    const prescriptions = await prisma.prescription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })

    sendSuccess(res, 200, prescriptions)
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single prescription (must belong to user)
 */
export async function getPrescription(req, res, next) {
  try {
    const { id } = req.params

    const prescription = await prisma.prescription.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    })

    if (!prescription) {
      return sendError(res, 404, 'Prescription not found', 'NOT_FOUND')
    }

    sendSuccess(res, 200, prescription)
  } catch (error) {
    next(error)
  }
}

/**
 * Update prescription status (admin only)
 */
export async function updatePrescriptionStatus(req, res, next) {
  try {
    const { id } = req.params
    const { status, reviewNotes, estimatedPrice } = req.body

    if (!status) {
      return sendError(res, 400, 'Status is required', 'VALIDATION_ERROR')
    }

    const validStatuses = ['under_review', 'available', 'out_of_stock', 'rejected', 'dispensed']
    if (!validStatuses.includes(status)) {
      return sendError(res, 400, 'Invalid status value', 'VALIDATION_ERROR')
    }

    const prescription = await prisma.prescription.update({
      where: { id },
      data: {
        status,
        reviewNotes: reviewNotes || '',
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : undefined,
      },
    })

    sendSuccess(res, 200, prescription, 'Prescription status updated successfully')
  } catch (error) {
    next(error)
  }
}