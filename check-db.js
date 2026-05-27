import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkDB() {
  console.log('🔍 Checking database...\n')

  const productCount = await prisma.product.count()
  console.log(`📦 Products in DB: ${productCount}`)

  if (productCount > 0) {
    const sample = await prisma.product.findMany({
      take: 3,
      select: { id: true, name: true, quantity: true, unitPrice: true }
    })
    console.log('Sample products:', sample)
  }

  const orderCount = await prisma.order.count()
  console.log(`📋 Orders in DB: ${orderCount}`)

  const userCount = await prisma.user.count()
  console.log(`👥 Users in DB: ${userCount}`)

  const cartCount = await prisma.cartItem.count()
  console.log(`🛒 Cart items in DB: ${cartCount}`)

  const prescriptionCount = await prisma.prescription.count()
  console.log(`💊 Prescriptions in DB: ${prescriptionCount}`)

  await prisma.$disconnect()
}

checkDB().catch(console.error)
