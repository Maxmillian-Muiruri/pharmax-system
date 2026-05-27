import prisma from '../lib/prisma.js'
import { sendSuccess } from '../utils/responseHelper.js'

/**
 * Get all customers with optional search
 */
export async function getAllCustomers(req, res, next) {
  try {
    const { search, sort = 'name', order = 'asc' } = req.query

    const where = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { [sort]: order },
      include: {
        _count: {
          select: { orders: true }
        }
      }
    })

    sendSuccess(res, 200, customers)
  } catch (error) {
    next(error)
  }
}

/**
 * Get top customers by order value
 */
export async function getTopCustomers(req, res, next) {
  try {
    const topCustomers = await prisma.customer.findMany({
      where: {
        orders: { some: { status: 'completed' } }
      },
      include: {
        orders: {
          where: { status: 'completed' },
          select: { totalAmount: true }
        }
      }
    })

    const result = topCustomers
      .map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        orderCount: c.orders.length,
        totalSpent: Number(c.orders.reduce((sum, o) => sum + o.totalAmount, 0)),
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    sendSuccess(res, 200, result)
  } catch (error) {
    next(error)
  }
}

/**
 * Get single customer
 */
export async function getCustomer(req, res, next) {
  try {
    const { id } = req.params
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { orders: true }
        }
      }
    })

    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found', code: 'NOT_FOUND' })
    }

    sendSuccess(res, 200, customer)
  } catch (error) {
    next(error)
  }
}

/**
 * Create customer
 */
export async function createCustomer(req, res, next) {
  try {
    const { name, phone, email, address } = req.body

    const customer = await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
      }
    })

    sendSuccess(res, 201, customer, 'Customer created successfully')
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'A customer with this email already exists', code: 'DUPLICATE' })
    }
    next(error)
  }
}

/**
 * Update customer
 */
export async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params
    const { name, phone, email, address } = req.body

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(email !== undefined && { email }),
        ...(address !== undefined && { address }),
      }
    })

    sendSuccess(res, 200, customer, 'Customer updated successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Customer not found', code: 'NOT_FOUND' })
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, error: 'A customer with this email already exists', code: 'DUPLICATE' })
    }
    next(error)
  }
}

/**
 * Delete customer
 */
export async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params

    const orderCount = await prisma.order.count({ where: { customerId: id } })
    if (orderCount > 0) {
      return res.status(409).json({ success: false, error: `Cannot delete customer with ${orderCount} order(s)`, code: 'HAS_ORDERS' })
    }

    await prisma.customer.delete({ where: { id } })
    sendSuccess(res, 200, null, 'Customer deleted successfully')
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'Customer not found', code: 'NOT_FOUND' })
    }
    next(error)
  }
}
