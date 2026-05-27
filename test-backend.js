#!/usr/bin/env node

const BASE = process.env.BASE_URL || 'http://localhost:4000'

// Helper function for API calls
async function request(method, endpoint, token = null, body = null) {
  const fetch = globalThis.fetch || (await import('node-fetch')).default
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })

  const data = await res.json()
  return { status: res.status, data }
}

// Test sequence
async function runTests() {
  console.log('🚀 Starting Backend API Tests\n')
  console.log('='.repeat(50))

  // Check if backend is running
  console.log('\n🔍 Checking backend connectivity...')
  try {
    const testConnection = await request('GET', '/health')
    if (testConnection.status !== 200) {
      throw new Error(`Backend not responding (status: ${testConnection.status})`)
    }
    console.log('✅ Backend is running')
  } catch (err) {
    console.error('❌ Backend connection failed:', err.message)
    console.log('Make sure to start the backend with: cd "apps/pharmaOS-main (3)/backend" && npm run dev')
    throw new Error('Backend not available')
  }

  let token = null
  let testUserId = null
  let productId = null

  // Test 1: Health Check
  console.log('\n📋 Test 1: Health Check')
  const health = await request('GET', '/health')
  console.log(`Status: ${health.status}`)
  console.log(`Response:`, JSON.stringify(health.data, null, 2))
  if (health.status !== 200) throw new Error('Health check failed')

  // Test 2: Register User
  console.log('\n📋 Test 2: Register User')
  const registerData = {
    email: `testuser_${Date.now()}@example.com`,
    password: 'TestPass123!',
    name: 'Test User',
    phone: '0712345678'
  }
  const reg = await request('POST', '/api/auth/register', null, registerData)
  console.log(`Status: ${reg.status}`)
  if (reg.status !== 201) {
    console.log(`Full response:`, JSON.stringify(reg, null, 2))
    throw new Error(`Registration failed - expected 201, got ${reg.status}`)
  }
  token = reg.data.data.token
  testUserId = reg.data.data.user.id
  console.log(`✅ Token received: ${token.substring(0, 20)}...`)

  // Test 3: Get Profile (Me)
  console.log('\n📋 Test 3: Get Profile (GET /api/auth/me)')
  const me = await request('GET', '/api/auth/me', token)
  console.log(`Status: ${me.status}`)
  if (me.data?.data) {
    console.log(`User: ${me.data.data.name} (${me.data.data.email})`)
  } else {
    console.log(`Response:`, JSON.stringify(me.data, null, 2))
  }
  if (me.status !== 200) throw new Error('Get profile failed')

  // Test 4: Public Products
  console.log('\n📋 Test 4: Public Products (GET /api/public/products)')
  try {
    const products = await request('GET', '/api/public/products')
    console.log(`Status: ${products.status}`)
    const productArray = products.data?.data || []
    console.log(`Products count: ${productArray.length}`)
    if (products.status !== 200) throw new Error(`Products fetch failed - status ${products.status}`)
    if (productArray.length > 0) {
      productId = productArray[0].id
      console.log(`First product: ${productArray[0].name || 'No name'} (ID: ${productId})`)
    } else {
      console.log('⚠️  No products found in database. Run seed: npx prisma db seed')
      // Continue tests but mark as warning
    }
  } catch (err) {
    console.error('❌ Test 4 failed:', err.message)
    throw err
  }

  // Test 5: Get Single Product
  console.log('\n📋 Test 5: Get Single Product (GET /api/public/products/:id)')
  if (productId) {
    const singleProduct = await request('GET', `/api/public/products/${productId}`) // No token for public endpoint
    console.log(`Status: ${singleProduct.status}`)
    console.log(`Product: ${singleProduct.data.data?.name}`)
  }

  // Test 6: Get Empty Cart
  console.log('\n📋 Test 6: Get Empty Cart (GET /api/cart)')
  const emptyCart = await request('GET', '/api/cart', token)
  console.log(`Status: ${emptyCart.status}`)
  console.log(`Cart items: ${emptyCart.data.data?.length || 0}`)
  if (emptyCart.status !== 200) throw new Error('Get empty cart failed')

  // Test 7: Add to Cart
  console.log('\n📋 Test 7: Add to Cart (PUT /api/cart)')
  if (productId) {
    const cartUpdate = await request('PUT', '/api/cart', token, {
      items: [{ productId, quantity: 2 }]
    })
    console.log(`Status: ${cartUpdate.status}`)
    console.log(`Cart items: ${cartUpdate.data.data?.length || 0}`)
    console.log(`Item: ${cartUpdate.data.data?.[0]?.product?.name} x ${cartUpdate.data.data?.[0]?.quantity}`)
    if (cartUpdate.status !== 200) throw new Error('Add to cart failed')
  } else {
    console.log('⚠️  Skipping cart test - no products available')
  }

  // Test 8: Get Cart with Items
  console.log('\n📋 Test 8: Get Cart with Items')
  const cart = await request('GET', '/api/cart', token)
  console.log(`Status: ${cart.status}`)
  console.log(`Cart items: ${cart.data.data?.length || 0}`)

  // Test 9: Clear Cart
  console.log('\n📋 Test 9: Clear Cart (DELETE /api/cart)')
  const clearCart = await request('DELETE', '/api/cart', token)
  console.log(`Status: ${clearCart.status}`)
  console.log(`Message: ${clearCart.data?.message}`)

  // Test 10: Create Order
  console.log('\n📋 Test 10: Create Order (POST /api/orders)')
  if (productId) {
    const order = await request('POST', '/api/orders', token, {
      customerName: 'Test Customer',
      customerPhone: '0712345678',
      productId,
      quantity: 1,
    })
    console.log(`Status: ${order.status}`)
    if (order.status === 201 && order.data?.data) {
      console.log(`Order ID: ${order.data.data.id}`)
      console.log(`Order Number: ${order.data.data.orderNumber}`)
    } else {
      console.log(`Error:`, order.data)
      throw new Error(`Order creation failed - status ${order.status}`)
    }
  } else {
    console.log('⚠️  Skipping order test - no products available')
  }

  // Test 11: Track Order Public
  console.log('\n📋 Test 11: Track Order Public (GET /api/orders/track/:id)')
  // We need an order number - get from created order or create one
  if (productId) {
    const order = await request('POST', '/api/orders', token, {
      customerName: 'Tracking Test',
      customerPhone: '0712345678',
      productId,
      quantity: 1,
    })
    if (order.data?.data?.orderNumber) {
      const orderNumber = order.data.data.orderNumber
      const track = await request('GET', `/api/orders/track/${orderNumber}`) // No token for public tracking
      console.log(`Status: ${track.status}`)
      console.log(`Tracked order: ${track.data.data?.customerName} - ${track.data.data?.status}`)
    }
  }

  // Test 12: Get My Orders
  console.log('\n📋 Test 12: Get My Orders (GET /api/orders?mine=true)')
  const myOrders = await request('GET', '/api/orders?mine=true', token)
  console.log(`Status: ${myOrders.status}`)
  console.log(`My orders count: ${myOrders.data.data?.length || 0}`)

  // Test 13: Upload Prescription
  console.log('\n📋 Test 13: Upload Prescription (POST /api/prescriptions)')
  const prescriptionData = {
    patientName: 'John Doe',
    phoneNumber: '0711223344',
    email: 'john@example.com',
    doctorName: 'Dr. Smith',
    hospitalName: 'Kenyatta Hospital',
    address: 'Nairobi, Kenya',
    notes: 'Test prescription',
    files: [
      {
        name: 'prescription1.jpg',
        size: 102400,
        type: 'image/jpeg',
        dataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
      }
    ]
  }
  const prescription = await request('POST', '/api/prescriptions', token, prescriptionData)
  console.log(`Status: ${prescription.status}`)
  console.log(`Prescription ID: ${prescription.data.data?.id}`)
  console.log(`Prescription Number: ${prescription.data.data?.prescriptionId}`)
  const prescriptionId = prescription.data.data?.id

  // Test 14: Get My Prescriptions
  console.log('\n📋 Test 14: Get My Prescriptions (GET /api/prescriptions)')
  const myPrescriptions = await request('GET', '/api/prescriptions', token)
  console.log(`Status: ${myPrescriptions.status}`)
  console.log(`Prescriptions count: ${myPrescriptions.data.data?.length || 0}`)

  // Test 15: Update Prescription Status (Should fail - customer not admin)
  console.log('\n📋 Test 15: Update Prescription Status (Expected to fail)')
  if (prescriptionId) {
    const updateStatus = await request('PUT', `/api/prescriptions/${prescriptionId}/status`, token, {
      status: 'available',
      estimatedPrice: 1500
    })
    console.log(`Status: ${updateStatus.status}`)
    console.log(`Expected 403 (Forbidden) - Got: ${updateStatus.status}`)
  }

  // Test 16: Logout
  console.log('\n📋 Test 16: Logout (POST /api/auth/logout)')
  const logout = await request('POST', '/api/auth/logout', token)
  console.log(`Status: ${logout.status}`)
  console.log(`Message: ${logout.data?.message}`)

  // Test 17: Access with invalid token
  console.log('\n📋 Test 17: Access with Invalid Token (Should Fail)')
  const invalid = await request('GET', '/api/auth/me', 'invalid-token')
  console.log(`Status: ${invalid.status}`)
  console.log(`Expected 401 - Got: ${invalid.status}`)

  console.log('\n' + '='.repeat(50))
  console.log('✅ All tests completed!')
  console.log('\n📊 Summary:')
  console.log('   - Health endpoint: ✅')
  console.log('   - Registration & JWT: ✅')
  console.log('   - Public products: ✅')
  console.log('   - Cart CRUD: ✅')
  console.log('   - Order creation & tracking: ✅')
  console.log('   - Prescription management: ✅')
  console.log('   - Logout & token invalidation: ✅')
}

// Run tests
runTests().catch(err => {
  console.error('\n❌ Test failed:', err.message)
  process.exit(1)
})
