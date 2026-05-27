/**
 * Create alert only if no unread alert of same type exists for product
 */
export async function createAlertIfNotExists(prismaClient, productId, type, message) {
  const existing = await prismaClient.alert.findFirst({
    where: { 
      productId, 
      type, 
      isRead: false 
    },
  })
  
  if (existing) return null

  return prismaClient.alert.create({
    data: { productId, type, message },
  })
}
