const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  console.log('🔍 Database verification...\n');
  
  // Look for orders with out_for_delivery
  const outCount = await prisma.order.count({ where: { status: 'out_for_delivery' } });
  console.log(`  Orders with out_for_delivery: ${outCount}`);
  
  const completedCount = await prisma.order.count({ where: { status: 'completed' } });
  console.log(`  Orders with completed: ${completedCount}`);
  
  const processingCount = await prisma.order.count({ where: { status: 'processing' } });
  console.log(`  Orders with processing: ${processingCount}`);
  
  // Show recent order statuses
  const recent = await prisma.order.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: { id: true, customerName: true, status: true, updatedAt: true },
  });
  console.log('\n  Recent orders:');
  recent.forEach(o => {
    console.log(`    ${o.customerName.padEnd(20)} → ${o.status.padEnd(20)} (${new Date(o.updatedAt).toLocaleTimeString()})`);
  });
  
  await prisma.$disconnect();
}

check().catch(console.error);
