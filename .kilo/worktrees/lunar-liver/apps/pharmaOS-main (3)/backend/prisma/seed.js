import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Helper to get date offset by days
function daysFromNow(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

// Helper to get date offset by days in past
function daysAgo(days) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data (order matters due to FK constraints)
  await prisma.alert.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.purchaseItem.deleteMany()
  await prisma.purchase.deleteMany()
  await prisma.order.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.income.deleteMany()
  await prisma.setting.deleteMany()
  await prisma.pharmacist.deleteMany()
  await prisma.product.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.supplier.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️  Cleared existing data')

  // ===== USERS =====
  const passwordHash = await bcrypt.hash('pharma123', 12)
  
  // Create users for all roles
  const users = await Promise.all([
    // SUPER_ADMIN (2)
    prisma.user.create({ data: { email: 'superadmin1@pharmaos.com', name: 'Alice Kamau', password: passwordHash, userType: 'SUPER_ADMIN', isActive: true } }),
    prisma.user.create({ data: { email: 'superadmin2@pharmaos.com', name: 'Brian Otieno', password: passwordHash, userType: 'SUPER_ADMIN', isActive: true } }),
    
    // ADMIN (2)
    prisma.user.create({ data: { email: 'admin1@pharmaos.com', name: 'Carol Wanjiku', password: passwordHash, userType: 'ADMIN', isActive: true } }),
    prisma.user.create({ data: { email: 'admin2@pharmaos.com', name: 'David Mwangi', password: passwordHash, userType: 'ADMIN', isActive: true } }),
    
    // FINANCE (1)
    prisma.user.create({ data: { email: 'finance@pharmaos.com', name: 'Eve Akinyi', password: passwordHash, userType: 'FINANCE', isActive: true } }),
    
    // RECEIVING_BAY (1)
    prisma.user.create({ data: { email: 'receiving@pharmaos.com', name: 'Frank Kipchoge', password: passwordHash, userType: 'RECEIVING_BAY', isActive: true } }),
    
    // MANAGER (1)
    prisma.user.create({ data: { email: 'manager@pharmaos.com', name: 'Grace Chebet', password: passwordHash, userType: 'MANAGER', isActive: true } }),
    
    // DISPATCH (1)
    prisma.user.create({ data: { email: 'dispatch@pharmaos.com', name: 'Henry Mutua', password: passwordHash, userType: 'DISPATCH', isActive: true } }),
    
    // RIDER (1)
    prisma.user.create({ data: { email: 'rider@pharmaos.com', name: 'Isaac Njoroge', password: passwordHash, userType: 'RIDER', isActive: true } }),
    
    // PHARMACIST (3 - for pharmacist linking)
    prisma.user.create({ data: { email: 'pharmacist1@pharmaos.com', name: 'Jane Adhiambo', password: passwordHash, userType: 'PHARMACIST', isActive: true } }),
    prisma.user.create({ data: { email: 'pharmacist2@pharmaos.com', name: 'Kevin Wekesa', password: passwordHash, userType: 'PHARMACIST', isActive: true } }),
    prisma.user.create({ data: { email: 'pharmacist3@pharmaos.com', name: 'Linda Njeri', password: passwordHash, userType: 'PHARMACIST', isActive: true } }),
  ])
  
  console.log(`✅ Created ${users.length} users with various roles`)
  console.log('🔑 Default password for all users: pharma123')

  // ===== PHARMACISTS =====
  const pharmacists = await Promise.all([
    // 1 active pharmacist
    prisma.pharmacist.create({
      data: {
        userId: users[9].id, // pharmacist1
        licenseNumber: 'PH-2024-001',
        isActive: true,
      },
    }),
    // 2 inactive pharmacists
    prisma.pharmacist.create({
      data: {
        userId: users[10].id, // pharmacist2
        licenseNumber: 'PH-2024-002',
        isActive: false,
      },
    }),
    prisma.pharmacist.create({
      data: {
        userId: users[11].id, // pharmacist3
        licenseNumber: 'PH-2024-003',
        isActive: false,
      },
    }),
  ])
  
  console.log(`✅ Created ${pharmacists.length} pharmacist records (1 active, 2 inactive)`)

  // ===== SUPPLIERS =====
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: 'Nairobi Pharma Supplies', phone: '0722111222', contactPerson: 'James Ochieng', email: 'orders@nairokipharma.co.ke', address: 'Industrial Area, Nairobi' } }),
    prisma.supplier.create({ data: { name: 'MediKenya Distributors', phone: '0733222333', contactPerson: 'Sarah Akinyi', email: 'sales@medikenya.com', address: 'Moi Avenue, Nairobi' } }),
    prisma.supplier.create({ data: { name: 'HealthFirst Wholesalers', phone: '0744333444', contactPerson: 'Peter Kamau', email: 'info@healthfirst.co.ke', address: 'Kenyatta Ave, Nairobi' } }),
    prisma.supplier.create({ data: { name: 'PharmaDirect Ltd', phone: '0755444555', contactPerson: 'Mary Wanjiru', email: 'supply@pharmadirect.co.ke', address: 'Tom Mboya St, Nairobi' } }),
    prisma.supplier.create({ data: { name: 'Equator Medical Supplies', phone: '0766555666', contactPerson: 'David Kiprop', email: 'orders@equatormedical.co.ke', address: 'River Road, Nairobi' } }),
    prisma.supplier.create({ data: { name: 'Central Pharma Agency', phone: '0777666777', contactPerson: 'Lucy Chebet', email: 'info@centralpharma.co.ke', address: 'Luthuli Ave, Nairobi' } }),
  ])
  console.log(`✅ Created ${suppliers.length} suppliers`)

  // ===== CUSTOMERS =====
  const customers = await Promise.all([
    prisma.customer.create({ data: { name: 'Walk In Customer', phone: '0712345678', email: null, address: '', balance: 0 } }),
    prisma.customer.create({ data: { name: 'Nairobi Hospital', phone: '0722334455', email: 'pharmacy@nairobihospital.co.ke', address: 'Argwings Kodhek Rd', balance: 5000 } }),
    prisma.customer.create({ data: { name: 'City Pharmacy Mombasa', phone: '0700112233', email: 'orders@citypharmacy.co.ke', address: 'Nkrumah Rd, Mombasa', balance: 0 } }),
    prisma.customer.create({ data: { name: 'Grace Wambui', phone: '0711223344', email: 'grace.w@email.com', address: 'Westlands, Nairobi', balance: 250 } }),
    prisma.customer.create({ data: { name: 'James Mwangi', phone: '0722334456', email: 'james.m@email.com', address: 'Kilimani, Nairobi', balance: 0 } }),
    prisma.customer.create({ data: { name: 'Aga Khan University Hospital', phone: '0733445566', email: 'procurement@akh.org', address: '3rd Parklands Ave', balance: 12000 } }),
    prisma.customer.create({ data: { name: 'Faith Adhiambo', phone: '0744556677', email: 'faith.a@email.com', address: 'Kisumu Town', balance: 0 } }),
    prisma.customer.create({ data: { name: 'Kenyatta National Hospital', phone: '0755667788', email: 'pharmacy@knh.go.ke', address: 'Hospital Rd, Upper Hill', balance: 25000 } }),
    prisma.customer.create({ data: { name: 'Peter Kipchoge', phone: '0766778899', email: null, address: 'Eldoret Town', balance: 0 } }),
    prisma.customer.create({ data: { name: 'Lucy Njeri', phone: '0777889900', email: 'lucy.n@email.com', address: 'Thika Road Mall', balance: 750 } }),
  ])
  console.log(`✅ Created ${customers.length} customers`)

  // ===== PRODUCTS =====
  const products = await Promise.all([
    // Active products
    prisma.product.create({ data: { name: 'Amoxicillin 500mg', generic: 'Amoxicillin', category: 'Antibiotics', quantity: 150, purchasePrice: 120.00, unitPrice: 250.00, expiryDate: daysFromNow(365), batchNumber: 'AMX-2024-001', barcode: 'PHARM-ANT-001', minimumStock: 20, status: 'active', supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Paracetamol 500mg', generic: 'Paracetamol', category: 'Analgesics', quantity: 200, purchasePrice: 20.00, unitPrice: 50.00, expiryDate: daysFromNow(400), batchNumber: 'PAR-2024-001', barcode: 'PHARM-ANA-002', minimumStock: 50, status: 'active', supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', category: 'Analgesics', quantity: 180, purchasePrice: 35.00, unitPrice: 80.00, expiryDate: daysFromNow(300), batchNumber: 'IBU-2024-001', barcode: 'PHARM-ANA-003', minimumStock: 30, status: 'active', supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Metformin 500mg', generic: 'Metformin', category: 'Diabetic', quantity: 120, purchasePrice: 50.00, unitPrice: 120.00, expiryDate: daysFromNow(250), batchNumber: 'MET-2024-001', barcode: 'PHARM-DIA-004', minimumStock: 25, status: 'active', supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Vitamin C 1000mg', generic: 'Ascorbic Acid', category: 'Vitamins', quantity: 250, purchasePrice: 45.00, unitPrice: 100.00, expiryDate: daysFromNow(500), batchNumber: 'VTC-2024-001', barcode: 'PHARM-VIT-005', minimumStock: 40, status: 'active', supplierId: suppliers[2].id } }),
    prisma.product.create({ data: { name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Gastrointestinal', quantity: 100, purchasePrice: 80.00, unitPrice: 180.00, expiryDate: daysFromNow(280), batchNumber: 'OMP-2024-001', barcode: 'PHARM-GAS-006', minimumStock: 15, status: 'active', supplierId: suppliers[2].id } }),
    prisma.product.create({ data: { name: 'Cetirizine 10mg', generic: 'Cetirizine', category: 'Antihistamines', quantity: 160, purchasePrice: 40.00, unitPrice: 90.00, expiryDate: daysFromNow(320), batchNumber: 'CET-2024-001', barcode: 'PHARM-ANT-007', minimumStock: 20, status: 'active', supplierId: suppliers[3].id } }),
    prisma.product.create({ data: { name: 'Azithromycin 250mg', generic: 'Azithromycin', category: 'Antibiotics', quantity: 80, purchasePrice: 180.00, unitPrice: 350.00, expiryDate: daysFromNow(290), batchNumber: 'AZI-2024-001', barcode: 'PHARM-ANT-008', minimumStock: 15, status: 'active', supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Multivitamin Complex', generic: 'Multivitamin', category: 'Vitamins', quantity: 140, purchasePrice: 90.00, unitPrice: 200.00, expiryDate: daysFromNow(450), batchNumber: 'MVC-2024-001', barcode: 'PHARM-VIT-009', minimumStock: 20, status: 'active', supplierId: suppliers[2].id } }),
    prisma.product.create({ data: { name: 'Loratadine 10mg', generic: 'Loratadine', category: 'Antihistamines', quantity: 175, purchasePrice: 35.00, unitPrice: 85.00, expiryDate: daysFromNow(310), batchNumber: 'LOR-2024-001', barcode: 'PHARM-ANT-010', minimumStock: 25, status: 'active', supplierId: suppliers[3].id } }),
    // Near-expiry products
    prisma.product.create({ data: { name: 'Panadol Extra', generic: 'Paracetamol + Caffeine', category: 'Analgesics', quantity: 45, purchasePrice: 35.00, unitPrice: 80.00, expiryDate: daysFromNow(5), batchNumber: 'PDX-2023-001', barcode: 'PHARM-ANA-011', minimumStock: 10, status: 'near_expiry', supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Aspirin 75mg', generic: 'Aspirin', category: 'Cardiovascular', quantity: 60, purchasePrice: 25.00, unitPrice: 60.00, expiryDate: daysFromNow(3), batchNumber: 'ASP-2023-001', barcode: 'PHARM-CAR-012', minimumStock: 15, status: 'near_expiry', supplierId: suppliers[4].id } }),
    prisma.product.create({ data: { name: 'Fluconazole 150mg', generic: 'Fluconazole', category: 'Antifungals', quantity: 35, purchasePrice: 100.00, unitPrice: 220.00, expiryDate: daysFromNow(6), batchNumber: 'FLU-2023-001', barcode: 'PHARM-ANT-013', minimumStock: 10, status: 'near_expiry', supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Prednisolone 5mg', generic: 'Prednisolone', category: 'Corticosteroids', quantity: 50, purchasePrice: 65.00, unitPrice: 150.00, expiryDate: daysFromNow(4), batchNumber: 'PRD-2023-001', barcode: 'PHARM-COR-014', minimumStock: 10, status: 'near_expiry', supplierId: suppliers[5].id } }),
    prisma.product.create({ data: { name: 'Ranitidine 150mg', generic: 'Ranitidine', category: 'Gastrointestinal', quantity: 40, purchasePrice: 45.00, unitPrice: 110.00, expiryDate: daysFromNow(7), batchNumber: 'RAN-2023-001', barcode: 'PHARM-GAS-015', minimumStock: 10, status: 'near_expiry', supplierId: suppliers[2].id } }),
    // Expired products
    prisma.product.create({ data: { name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', category: 'Antibiotics', quantity: 30, purchasePrice: 150.00, unitPrice: 300.00, expiryDate: daysAgo(10), batchNumber: 'CIP-2023-001', barcode: 'PHARM-ANT-016', minimumStock: 10, status: 'expired', supplierId: suppliers[0].id } }),
    prisma.product.create({ data: { name: 'Diclofenac 50mg', generic: 'Diclofenac', category: 'Analgesics', quantity: 25, purchasePrice: 50.00, unitPrice: 120.00, expiryDate: daysAgo(5), batchNumber: 'DIC-2023-001', barcode: 'PHARM-ANA-017', minimumStock: 10, status: 'expired', supplierId: suppliers[1].id } }),
    prisma.product.create({ data: { name: 'Insulin Glargine', generic: 'Insulin Glargine', category: 'Diabetic', quantity: 15, purchasePrice: 400.00, unitPrice: 800.00, expiryDate: daysAgo(15), batchNumber: 'INS-2023-001', barcode: 'PHARM-DIA-018', minimumStock: 5, status: 'expired', supplierId: suppliers[4].id } }),
    prisma.product.create({ data: { name: 'Warfarin 5mg', generic: 'Warfarin', category: 'Cardiovascular', quantity: 20, purchasePrice: 80.00, unitPrice: 180.00, expiryDate: daysAgo(8), batchNumber: 'WAR-2023-001', barcode: 'PHARM-CAR-019', minimumStock: 10, status: 'expired', supplierId: suppliers[5].id } }),
    prisma.product.create({ data: { name: 'Clotrimazole Cream', generic: 'Clotrimazole', category: 'Antifungals', quantity: 18, purchasePrice: 120.00, unitPrice: 250.00, expiryDate: daysAgo(20), batchNumber: 'CLO-2023-001', barcode: 'PHARM-ANT-020', minimumStock: 5, status: 'expired', supplierId: suppliers[3].id } }),
    // Out of stock products
    prisma.product.create({ data: { name: 'Atorvastatin 20mg', generic: 'Atorvastatin', category: 'Cardiovascular', quantity: 0, purchasePrice: 200.00, unitPrice: 450.00, expiryDate: daysFromNow(200), batchNumber: 'ATO-2024-001', barcode: 'PHARM-CAR-021', minimumStock: 10, status: 'out_of_stock', supplierId: suppliers[4].id } }),
    prisma.product.create({ data: { name: 'Levothyroxine 50mcg', generic: 'Levothyroxine', category: 'Hormones', quantity: 0, purchasePrice: 130.00, unitPrice: 280.00, expiryDate: daysFromNow(180), batchNumber: 'LEV-2024-001', barcode: 'PHARM-HOR-022', minimumStock: 10, status: 'out_of_stock', supplierId: suppliers[5].id } }),
    prisma.product.create({ data: { name: 'Gabapentin 300mg', generic: 'Gabapentin', category: 'Neurology', quantity: 0, purchasePrice: 150.00, unitPrice: 320.00, expiryDate: daysFromNow(220), batchNumber: 'GAB-2024-001', barcode: 'PHARM-NEU-023', minimumStock: 10, status: 'out_of_stock', supplierId: suppliers[1].id } }),
    // More active products
    prisma.product.create({ data: { name: 'Amlodipine 5mg', generic: 'Amlodipine', category: 'Cardiovascular', quantity: 90, purchasePrice: 90.00, unitPrice: 200.00, expiryDate: daysFromNow(260), batchNumber: 'AML-2024-001', barcode: 'PHARM-CAR-024', minimumStock: 15, status: 'active', supplierId: suppliers[4].id } }),
    prisma.product.create({ data: { name: 'Losartan 50mg', generic: 'Losartan', category: 'Cardiovascular', quantity: 85, purchasePrice: 130.00, unitPrice: 280.00, expiryDate: daysFromNow(240), batchNumber: 'LOS-2024-001', barcode: 'PHARM-CAR-025', minimumStock: 15, status: 'active', supplierId: suppliers[5].id } }),
    prisma.product.create({ data: { name: 'Pantoprazole 40mg', generic: 'Pantoprazole', category: 'Gastrointestinal', quantity: 110, purchasePrice: 100.00, unitPrice: 220.00, expiryDate: daysFromNow(270), batchNumber: 'PAN-2024-001', barcode: 'PHARM-GAS-026', minimumStock: 20, status: 'active', supplierId: suppliers[2].id } }),
    prisma.product.create({ data: { name: 'Montelukast 10mg', generic: 'Montelukast', category: 'Respiratory', quantity: 70, purchasePrice: 180.00, unitPrice: 380.00, expiryDate: daysFromNow(230), batchNumber: 'MON-2024-001', barcode: 'PHARM-RES-027', minimumStock: 10, status: 'active', supplierId: suppliers[3].id } }),
    prisma.product.create({ data: { name: 'Sertraline 50mg', generic: 'Sertraline', category: 'Neurology', quantity: 65, purchasePrice: 200.00, unitPrice: 420.00, expiryDate: daysFromNow(210), batchNumber: 'SER-2024-001', barcode: 'PHARM-NEU-028', minimumStock: 10, status: 'active', supplierId: suppliers[1].id } }),
  ])
  console.log(`✅ Created ${products.length} products`)

  // ===== ORDERS =====
  // Pending orders
  await Promise.all([
    prisma.order.create({ data: { customerName: 'James Kamau', customerPhone: '0712345678', productId: products[0].id, quantity: 2, totalAmount: 500.00, status: 'pending', customerId: customers[4].id } }),
    prisma.order.create({ data: { customerName: 'Mary Wanjiku', customerPhone: '0723456789', productId: products[1].id, quantity: 5, totalAmount: 250.00, status: 'pending', customerId: customers[3].id } }),
    prisma.order.create({ data: { customerName: 'John Mwangi', customerPhone: '0734567890', productId: products[2].id, quantity: 3, totalAmount: 240.00, status: 'pending' } }),
    prisma.order.create({ data: { customerName: 'Grace Akinyi', customerPhone: '0745678901', productId: products[3].id, quantity: 1, totalAmount: 120.00, status: 'pending', customerId: customers[6].id } }),
    prisma.order.create({ data: { customerName: 'Peter Kipchoge', customerPhone: '0756789012', productId: products[4].id, quantity: 4, totalAmount: 400.00, status: 'pending', customerId: customers[8].id } }),
  ])
  // Processing orders
  await Promise.all([
    prisma.order.create({ data: { customerName: 'Sarah Chebet', customerPhone: '0767890123', productId: products[5].id, quantity: 2, totalAmount: 360.00, status: 'processing' } }),
    prisma.order.create({ data: { customerName: 'David Mutua', customerPhone: '0778901234', productId: products[6].id, quantity: 3, totalAmount: 270.00, status: 'processing' } }),
    prisma.order.create({ data: { customerName: 'Lucy Njeri', customerPhone: '0789012345', productId: products[7].id, quantity: 1, totalAmount: 350.00, status: 'processing', customerId: customers[9].id } }),
  ])
  // Completed orders (spread over past 30 days for analytics)
  await Promise.all([
    prisma.order.create({ data: { customerName: 'Michael Otieno', customerPhone: '0790123456', productId: products[0].id, quantity: 5, totalAmount: 1250.00, status: 'completed', createdAt: daysAgo(28), paymentMethod: 'cash', amountPaid: 1250.00, amountDue: 0 } }),
    prisma.order.create({ data: { customerName: 'Anne Wambui', customerPhone: '0701234567', productId: products[1].id, quantity: 10, totalAmount: 500.00, status: 'completed', createdAt: daysAgo(25), paymentMethod: 'mpesa', amountPaid: 500.00, amountDue: 0 } }),
    prisma.order.create({ data: { customerName: 'Robert Kiplagat', customerPhone: '0712345679', productId: products[2].id, quantity: 4, totalAmount: 320.00, status: 'completed', createdAt: daysAgo(22), paymentMethod: 'cash', amountPaid: 320.00, amountDue: 0 } }),
    prisma.order.create({ data: { customerName: 'Elizabeth Adhiambo', customerPhone: '0723456780', productId: products[3].id, quantity: 6, totalAmount: 720.00, status: 'completed', createdAt: daysAgo(19), paymentMethod: 'mpesa', amountPaid: 500.00, amountDue: 220.00 } }),
    prisma.order.create({ data: { customerName: 'Francis Wekesa', customerPhone: '0734567891', productId: products[4].id, quantity: 3, totalAmount: 300.00, status: 'completed', createdAt: daysAgo(16), paymentMethod: 'cash', amountPaid: 300.00, amountDue: 0 } }),
    prisma.order.create({ data: { customerName: 'Catherine Nyambura', customerPhone: '0745678902', productId: products[5].id, quantity: 2, totalAmount: 360.00, status: 'completed', createdAt: daysAgo(13), paymentMethod: 'card', amountPaid: 360.00, amountDue: 0 } }),
    prisma.order.create({ data: { customerName: 'Daniel Kimani', customerPhone: '0756789013', productId: products[6].id, quantity: 8, totalAmount: 720.00, status: 'completed', createdAt: daysAgo(10), paymentMethod: 'mpesa', amountPaid: 720.00, amountDue: 0 } }),
    prisma.order.create({ data: { customerName: 'Walk In Customer', customerPhone: '0712345678', productId: products[8].id, quantity: 3, totalAmount: 600.00, status: 'completed', createdAt: daysAgo(7), paymentMethod: 'cash', amountPaid: 600.00, amountDue: 0 } }),
    prisma.order.create({ data: { customerName: 'Nairobi Hospital', customerPhone: '0722334455', productId: products[9].id, quantity: 20, totalAmount: 1700.00, status: 'completed', createdAt: daysAgo(5), paymentMethod: 'invoice', amountPaid: 1000.00, amountDue: 700.00, customerId: customers[1].id } }),
    prisma.order.create({ data: { customerName: 'City Pharmacy Mombasa', customerPhone: '0700112233', productId: products[10].id, quantity: 10, totalAmount: 800.00, status: 'completed', createdAt: daysAgo(3), paymentMethod: 'mpesa', amountPaid: 800.00, amountDue: 0, customerId: customers[2].id } }),
    prisma.order.create({ data: { customerName: 'Aga Khan Hospital', customerPhone: '0733445566', productId: products[11].id, quantity: 15, totalAmount: 5250.00, status: 'completed', createdAt: daysAgo(1), paymentMethod: 'invoice', amountPaid: 3000.00, amountDue: 2250.00, customerId: customers[5].id } }),
  ])
  // Cancelled order
  await prisma.order.create({
    data: { customerName: 'Jane Moraa', customerPhone: '0767890124', productId: products[7].id, quantity: 2, totalAmount: 700.00, status: 'cancelled' },
  })
  console.log('✅ Created 18 orders')

  // ===== TRANSACTIONS =====
  const completedOrders = await prisma.order.findMany({ where: { status: 'completed' } })
  for (let i = 0; i < completedOrders.length; i++) {
    const order = completedOrders[i]
    await prisma.transaction.create({
      data: {
        orderId: order.id,
        productId: order.productId,
        type: 'sale',
        quantity: order.quantity,
        amount: order.totalAmount,
        createdAt: order.createdAt,
      },
    })
  }
  console.log(`✅ Created ${completedOrders.length} sale transactions`)

  // ===== PURCHASES =====
  const purchase1 = await prisma.purchase.create({
    data: {
      supplierId: suppliers[0].id,
      invoiceNo: 'INV-NPS-2024-001',
      purchaseDate: daysAgo(30),
      totalAmount: 18000.00,
      notes: 'Monthly antibiotic restock',
    },
  })
  await Promise.all([
    prisma.purchaseItem.create({ data: { purchaseId: purchase1.id, productId: products[0].id, quantity: 100, unitCost: 120.00, total: 12000.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase1.id, productId: products[7].id, quantity: 50, unitCost: 120.00, total: 6000.00 } }),
  ])

  const purchase2 = await prisma.purchase.create({
    data: {
      supplierId: suppliers[1].id,
      invoiceNo: 'INV-MKD-2024-002',
      purchaseDate: daysAgo(20),
      totalAmount: 14500.00,
      notes: 'Analgesics and diabetic meds',
    },
  })
  await Promise.all([
    prisma.purchaseItem.create({ data: { purchaseId: purchase2.id, productId: products[1].id, quantity: 200, unitCost: 20.00, total: 4000.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase2.id, productId: products[2].id, quantity: 150, unitCost: 35.00, total: 5250.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase2.id, productId: products[3].id, quantity: 100, unitCost: 52.50, total: 5250.00 } }),
  ])

  const purchase3 = await prisma.purchase.create({
    data: {
      supplierId: suppliers[2].id,
      invoiceNo: 'INV-HFW-2024-003',
      purchaseDate: daysAgo(10),
      totalAmount: 22000.00,
      notes: 'Vitamins and gastrointestinal',
    },
  })
  await Promise.all([
    prisma.purchaseItem.create({ data: { purchaseId: purchase3.id, productId: products[4].id, quantity: 200, unitCost: 45.00, total: 9000.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase3.id, productId: products[5].id, quantity: 80, unitCost: 80.00, total: 6400.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase3.id, productId: products[8].id, quantity: 100, unitCost: 66.00, total: 6600.00 } }),
  ])

  const purchase4 = await prisma.purchase.create({
    data: {
      supplierId: suppliers[3].id,
      invoiceNo: 'INV-PDL-2024-004',
      purchaseDate: daysAgo(5),
      totalAmount: 12600.00,
      notes: 'Antihistamines and respiratory',
    },
  })
  await Promise.all([
    prisma.purchaseItem.create({ data: { purchaseId: purchase4.id, productId: products[6].id, quantity: 150, unitCost: 40.00, total: 6000.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase4.id, productId: products[9].id, quantity: 150, unitCost: 35.00, total: 5250.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase4.id, productId: products[26].id, quantity: 5, unitCost: 270.00, total: 1350.00 } }),
  ])

  const purchase5 = await prisma.purchase.create({
    data: {
      supplierId: suppliers[4].id,
      invoiceNo: 'INV-EMS-2024-005',
      purchaseDate: daysAgo(2),
      totalAmount: 27000.00,
      notes: 'Cardiovascular bulk order',
    },
  })
  await Promise.all([
    prisma.purchaseItem.create({ data: { purchaseId: purchase5.id, productId: products[23].id, quantity: 100, unitCost: 90.00, total: 9000.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase5.id, productId: products[24].id, quantity: 100, unitCost: 130.00, total: 13000.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase5.id, productId: products[11].id, quantity: 100, unitCost: 25.00, total: 2500.00 } }),
    prisma.purchaseItem.create({ data: { purchaseId: purchase5.id, productId: products[12].id, quantity: 50, unitCost: 50.00, total: 2500.00 } }),
  ])

  console.log('✅ Created 5 purchases with 14 items')

  // ===== EXPENSES =====
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
  console.log('✅ Created 8 expenses')

  // ===== INCOMES =====
  await Promise.all([
    prisma.income.create({ data: { category: 'Consultation', amount: 8500.00, date: daysAgo(2), notes: 'Pharmacist consultation fees' } }),
    prisma.income.create({ data: { category: 'Delivery', amount: 3200.00, date: daysAgo(8), notes: 'Home delivery charges collected' } }),
    prisma.income.create({ data: { category: 'Services', amount: 6800.00, date: daysAgo(14), notes: 'Blood pressure monitoring service' } }),
    prisma.income.create({ data: { category: 'Consultation', amount: 4500.00, date: daysAgo(20), notes: 'Health screening services' } }),
    prisma.income.create({ data: { category: 'Delivery', amount: 2100.00, date: daysAgo(27), notes: 'Medical supply delivery' } }),
  ])
  console.log('✅ Created 5 incomes')

  // ===== SETTINGS =====
  await Promise.all([
    prisma.setting.create({ data: { key: 'pharmacyName', value: 'PharmaOS Demo Pharmacy' } }),
    prisma.setting.create({ data: { key: 'address', value: 'Kenyatta Avenue, Nairobi, Kenya' } }),
    prisma.setting.create({ data: { key: 'phone', value: '0700 000 000' } }),
    prisma.setting.create({ data: { key: 'email', value: 'info@pharmaos.co.ke' } }),
    prisma.setting.create({ data: { key: 'currency', value: 'KES' } }),
    prisma.setting.create({ data: { key: 'taxRate', value: '16' } }),
    prisma.setting.create({ data: { key: 'lowStockThreshold', value: '10' } }),
    prisma.setting.create({ data: { key: 'nearExpiryDays', value: '30' } }),
  ])
  console.log('✅ Created 8 settings')

  // ===== ALERTS =====
  for (const product of products.filter(p => p.status === 'expired')) {
    await prisma.alert.create({
      data: {
        productId: product.id,
        type: 'expired',
        message: `${product.name} has expired`,
        isRead: Math.random() > 0.5,
      },
    })
  }
  for (const product of products.filter(p => p.status === 'near_expiry')) {
    const daysLeft = Math.ceil((product.expiryDate - new Date()) / (1000 * 60 * 60 * 24))
    await prisma.alert.create({
      data: {
        productId: product.id,
        type: 'near_expiry',
        message: `${product.name} expires in ${daysLeft} days`,
        isRead: Math.random() > 0.5,
      },
    })
  }
  for (const product of products.filter(p => p.quantity > 0 && p.quantity < p.minimumStock)) {
    await prisma.alert.create({
      data: {
        productId: product.id,
        type: 'low_stock',
        message: `${product.name} is running low (${product.quantity} units remaining)`,
        isRead: Math.random() > 0.5,
      },
    })
  }
  console.log('✅ Created alerts for expired, near-expiry, and low-stock products')

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
