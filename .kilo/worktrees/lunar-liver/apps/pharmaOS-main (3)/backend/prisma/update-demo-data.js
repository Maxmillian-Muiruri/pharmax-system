/**
 * Update demo data to fix negative net revenue on dashboard
 * Run this on production to rebalance expenses and income
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating demo data for balanced dashboard...')

  // Delete existing expenses and incomes
  await prisma.expense.deleteMany()
  await prisma.income.deleteMany()
  console.log('🗑️  Cleared old expenses and incomes')

  // Helper functions
  function daysAgo(days) {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date
  }

  // Create balanced expenses (total: ~31,000 instead of 211,000)
  await Promise.all([
    prisma.expense.create({ data: { category: 'Rent', amount: 8000.00, date: daysAgo(1), notes: 'Monthly pharmacy rent' } }),
    prisma.expense.create({ data: { category: 'Utilities', amount: 2500.00, date: daysAgo(3), notes: 'Electricity and water' } }),
    prisma.expense.create({ data: { category: 'Salaries', amount: 12000.00, date: daysAgo(5), notes: 'Staff salaries - pharmacists' } }),
    prisma.expense.create({ data: { category: 'Transport', amount: 1500.00, date: daysAgo(7), notes: 'Delivery van fuel' } }),
    prisma.expense.create({ data: { category: 'Insurance', amount: 3000.00, date: daysAgo(10), notes: 'Business insurance premium' } }),
    prisma.expense.create({ data: { category: 'Maintenance', amount: 1200.00, date: daysAgo(15), notes: 'Refrigerator repair' } }),
    prisma.expense.create({ data: { category: 'Licenses', amount: 2000.00, date: daysAgo(20), notes: 'Pharmacy board license renewal' } }),
    prisma.expense.create({ data: { category: 'Marketing', amount: 800.00, date: daysAgo(25), notes: 'Social media advertising' } }),
  ])
  console.log('✅ Created 8 balanced expenses')

  // Create income data (total: ~25,100)
  await Promise.all([
    prisma.income.create({ data: { category: 'Consultation', amount: 8500.00, date: daysAgo(2), notes: 'Pharmacist consultation fees' } }),
    prisma.income.create({ data: { category: 'Delivery', amount: 3200.00, date: daysAgo(8), notes: 'Home delivery charges collected' } }),
    prisma.income.create({ data: { category: 'Services', amount: 6800.00, date: daysAgo(14), notes: 'Blood pressure monitoring service' } }),
    prisma.income.create({ data: { category: 'Consultation', amount: 4500.00, date: daysAgo(20), notes: 'Health screening services' } }),
    prisma.income.create({ data: { category: 'Delivery', amount: 2100.00, date: daysAgo(27), notes: 'Medical supply delivery' } }),
  ])
  console.log('✅ Created 5 incomes')

  console.log('🎉 Demo data updated successfully!')
  console.log('📊 Expected net revenue: Sales (~11,820) + Income (~25,100) - Expenses (~31,000) = ~5,920')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
