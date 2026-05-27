import { z } from 'zod'

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().optional(),
  quantity: z.number().int().min(0),
  unitPrice: z.number().min(0),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  supplier: z.string().optional(),
})

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format').optional(),
  supplier: z.string().optional(),
})

export const createOrderSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().min(1),
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
})

export const promptSchema = z.object({
  query: z.string().min(1).max(500),
})

export const prescriptionSchema = z.object({
  patientName: z.string().min(1),
  phoneNumber: z.string().min(1),
  email: z.string().email(),
  doctorName: z.string().min(1),
  hospitalName: z.string().min(1),
  address: z.string().min(1),
  notes: z.string().optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        dataUrl: z.string(),
      }),
    )
    .min(1),
})
