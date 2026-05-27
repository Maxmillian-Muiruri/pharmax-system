import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().optional(),
  quantity: z.number().int().min(0),
  unitPrice: z.number().min(0),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format"),
  supplier: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(0).optional(),
  unitPrice: z.number().min(0).optional(),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
    .optional(),
  supplier: z.string().optional(),
});

export const createOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          productId: z.string(),
          quantity: z.number().int().min(1),
        }),
      )
      .min(1)
      .optional(),
    prescriptionId: z.string().optional(),
    totalAmount: z.number().optional(),
    shippingAddress: z.any().optional(),
    deliveryMethod: z.string().optional(),
    paymentMethod: z.string().optional(),
  })
  .passthrough()
  .refine(
    (data) => (data.items && data.items.length > 0) || !!data.prescriptionId,
    {
      message: "Either items or prescriptionId is required",
      path: ["items", "prescriptionId"],
    },
  );

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "out_for_delivery",
    "completed",
    "cancelled",
  ]),
});

export const promptSchema = z.object({
  query: z.string().min(1).max(500),
});

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
});
