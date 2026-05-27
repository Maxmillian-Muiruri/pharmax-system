import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

/**
 * Get all suppliers
 */
export async function getAllSuppliers(req, res, next) {
  try {
    const { search, sort = 'name', order = 'asc' } = req.query

    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactPerson: { contains: search, mode: 'insensitive' } },
      ]
    }

    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { [sort]: order },
      include: {
        _count: {
          select: { products: true, purchases: true }
        }
      }
    })

    sendSuccess(res, 200, suppliers)
  } catch (error) {
    next(error)
  }
}

/**
 * Get single supplier
 */
export async function getSupplier(req, res, next) {
  try {
    const { id } = req.params
    const supplier = await prisma.supplier.findUnique({
      where: { id },
      include: {
        products: { take: 10, select: { id: true, name: true, quantity: true, unitPrice: true, status: true } },
        purchases: { orderBy: { createdAt: 'desc' }, take: 5 },
      }
    })

    if (!supplier) {
      return res.status(404).json({ success: false, error: 'Supplier not found', code: 'NOT_FOUND' })
    }

    sendSuccess(res, 200, supplier)
  } catch (error) {
    next(error)
  }
}

/**
 * Create supplier
 */
export async function createSupplier(req, res, next) {
  try {
    const { name, phone, contactPerson, email, address } = req.body

    const supplier = await prisma.supplier.create({
      data: {
        name,
        phone: phone || null,
        contactPerson: contactPerson || null,
        email: email || null,
        address: address || null,
      }
    })

    sendSuccess(res, 201, supplier, 'Supplier created successfully')
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'A supplier with this email already exists', code: 'DUPLICATE' })
    }
    next(error)
  }
}

/**
 * Update supplier
 */
export async function updateSupplier(req, res, next) {
  try {
    const { id } = req.params
    const { name, phone, contactPerson, email, address } = req.body

    const supplier = await prisma.supplier.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(contactPerson !== undefined && { contactPerson }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
      }
    })

    sendSuccess(res, 200, supplier, 'Supplier updated successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Supplier not found', code: 'NOT_FOUND' })
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'A supplier with this email already exists', code: 'DUPLICATE' })
    }
    next(error)
  }
}

/**
 * Delete supplier
 */
export async function deleteSupplier(req, res, next) {
  try {
    const { id } = req.params

    const productCount = await prisma.product.count({ where: { supplierId: id } })
    if (productCount > 0) {
      return res.status(409).json({ success: false, error: `Cannot delete supplier with ${productCount} product(s)`, code: 'HAS_PRODUCTS' })
    }

    await prisma.supplier.delete({ where: { id } })
    sendSuccess(res, 200, null, 'Supplier deleted successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Supplier not found', code: 'NOT_FOUND' })
    }
    next(error)
  }
}
