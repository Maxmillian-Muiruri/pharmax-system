#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')

// Start backend
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'apps/pharmaOS-main (3)/backend'),
  shell: true,
  stdio: ['pipe', 'pipe', 'pipe']
})

let backendReady = false

// Wait for backend to start
backend.stdout.on('data', (data) => {
  const text = data.toString()
  console.log('[BACKEND]', text.trim())
  if (text.includes('🚀 PharmaOS API running')) {
    backendReady = true
    runTests().then(() => {
      backend.kill('SIGTERM')
      process.exit(0)
    })
  }
})

backend.stderr.on('data', (data) => {
  console.error('[BACKEND-ERR]', data.toString().trim())
})

async function testEndpoint(method, endpoint, token = null, body = null) {
  const fetch = (await import('node-fetch')).default
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`http://localhost:4000${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  })
  const data = await res.json()
  return { status: res.status, data }
}

async function runTests() {
  console.log('\n========== RUNNING TESTS ==========\n')
  let token = null

  // 1. Health
  let r = await testEndpoint('GET', '/health')
  console.log('1. Health:', r.status)

  // 2. Register
  r = await testEndpoint('POST', '/api/auth/register', null, {
    email: `test${Date.now()}@test.com`,
    password: 'Test123!',
    name: 'Test User',
    phone: '0712345678'
  })
  console.log('2. Register:', r.status, r.data.data?.token ? '✅' : '❌')
  token = r.data.data?.token

  if (token) {
    // 3. Profile
    r = await testEndpoint('GET', '/api/auth/me', token)
    console.log('3. Profile:', r.status)

    // 4. Public Products
    r = await testEndpoint('GET', '/api/public/products')
    console.log('4. Public Products:', r.status, `Count: ${r.data?.data?.length || 0}`)

    // 5. Single Product
    if (r.data?.data?.[0]?.id) {
      const pid = r.data.data[0].id
      r = await testEndpoint('GET', `/api/public/products/${pid}`, token)
      console.log('5. Single Product:', r.status)
    }

    // 6. Get Cart
    r = await testEndpoint('GET', '/api/cart', token)
    console.log('6. Get Cart:', r.status)

    // 7. Add to Cart
    if (r.data?.data?.[0]?.product?.id || true) {
      // Use first product from products list
      const products = await testEndpoint('GET', '/api/public/products')
      const firstProductId = products.data?.data?.[0]?.id
      if (firstProductId) {
        r = await testEndpoint('PUT', '/api/cart', token, {
          items: [{ productId: firstProductId, quantity: 1 }]
        })
        console.log('7. Add to Cart:', r.status)
      }
    }

    // 8. Create Order
    const products = await testEndpoint('GET', '/api/public/products')
    if (products.data?.data?.[0]?.id) {
      r = await testEndpoint('POST', '/api/orders', token, {
        customerName: 'Test',
        customerPhone: '0712345678',
        productId: products.data.data[0].id,
        quantity: 1
      })
      console.log('8. Create Order:', r.status, r.data.data?.orderNumber ? '✅' : '❌ no orderNumber')
    }

    // 9. My Orders
    r = await testEndpoint('GET', '/api/orders?mine=true', token)
    console.log('9. My Orders:', r.status, `Count: ${r.data?.data?.length || 0}`)

    // 10. Prescription
    r = await testEndpoint('POST', '/api/prescriptions', token, {
      patientName: 'Test',
      phoneNumber: '0711223344',
      email: 'test@test.com',
      doctorName: 'Dr Test',
      hospitalName: 'Test Hospital',
      address: 'Nairobi',
      files: [{ name: 'test.jpg', size: 100, type: 'image/jpeg', dataUrl: 'data:...' }]
    })
    console.log('10. Prescription:', r.status)
  }

  console.log('\n========== TESTS COMPLETE ==========\n')
}

runTests().catch(e => {
  console.error('Test error:', e)
  process.exit(1)
})
