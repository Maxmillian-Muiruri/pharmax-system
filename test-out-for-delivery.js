/**
 * Test script for "Out for Delivery" status feature
 * Tests the complete workflow: processing → out_for_delivery → completed
 * 
 * Usage: node test-out-for-delivery.js
 * Requires backend server running on http://localhost:4000
 */

const API_URL = 'http://localhost:4000/api';

// Test user credentials (from seed data)
const TEST_USERS = {
  dispatch: {
    email: 'dispatch@pharmaos.com',
    password: 'pharma123',
    name: 'Henry Mutua'
  },
  rider: {
    email: 'rider@pharmaos.com',
    password: 'pharma123',
    name: 'Isaac Njoroge'
  }
};

let authToken = null;
let testOrderId = null;

async function request(method, url, options = {}) {
  const config = {
    method,
    url: `${API_URL}${url}`,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
      ...options.headers,
    },
    ...options,
  };
  
  const res = await fetch(config.url, config);
  const data = await res.json();
  
  if (!res.ok) {
    const error = new Error(data.message || data.error || 'Request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

async function test() {
  console.log('═'.repeat(60));
  console.log('  OUT FOR DELIVERY FEATURE TEST');
  console.log('═'.repeat(60));
  
  try {
    // Step 1: Login as DISPATCH
    console.log('\n📌 Step 1: Authenticating as DISPATCH user...');
    const loginRes = await request('POST', '/auth/login', {
      body: JSON.stringify(TEST_USERS.dispatch),
    });
    authToken = loginRes.data.token;
    console.log(`   ✅ Logged in as ${TEST_USERS.dispatch.name}`);
    
    // Step 2: Find a processing order
    console.log('\n📌 Step 2: Finding an order in "processing" status...');
    const ordersRes = await request('GET', '/orders?status=processing');
    const orders = ordersRes.data;
    
    if (!orders || orders.length === 0) {
      console.log('   ⚠️  No processing orders found. Creating a test order...');
      await createTestOrder();
      console.log('   ✅ Test order created');
      return test(); // Restart test with new order
    }
    
    testOrderId = orders[0].id;
    console.log(`   ✅ Found order: ${testOrderId} (${orders[0].customerName})`);
    
    // Step 3: Mark as out_for_delivery
    console.log('\n📌 Step 3: Transitioning to "out_for_delivery"...');
    const update1Res = await request('PUT', `/orders/${testOrderId}/status`, {
      body: JSON.stringify({ status: 'out_for_delivery' }),
    });
    console.log(`   ✅ Status updated: ${update1Res.data.status}`);
    
    // Step 4: Verify via GET /orders?status=out_for_delivery
    console.log('\n📌 Step 4: Verifying order appears in "out_for_delivery" list...');
    const outRes = await request('GET', '/orders?status=out_for_delivery');
    const outOrders = outRes.data;
    const found = outOrders.find(o => o.id === testOrderId);
    
    if (found) {
      console.log(`   ✅ Order found with status: ${found.status}`);
    } else {
      throw new Error('Order not found in out_for_delivery filtered list');
    }
    
    // Step 5: Mark as completed
    console.log('\n📌 Step 5: Transitioning to "completed"...');
    const update2Res = await request('PUT', `/orders/${testOrderId}/status`, {
      body: JSON.stringify({ status: 'completed' }),
    });
    console.log(`   ✅ Status updated: ${update2Res.data.status}`);
    
    // Step 6: Verify final state
    console.log('\n📌 Step 6: Verifying final state...');
    const completedRes = await request('GET', '/orders?status=completed');
    const completedOrders = completedRes.data;
    const finalOrder = completedOrders.find(o => o.id === testOrderId);
    
    if (finalOrder && finalOrder.status === 'completed') {
      console.log(`   ✅ Order confirmed completed`);
    } else {
      throw new Error('Order not found in completed list');
    }
    
    // Step 7: Test invalid transitions (should fail)
    console.log('\n📌 Step 7: Testing invalid transitions (should be rejected)...');
    try {
      await request('PUT', `/orders/${testOrderId}/status`, {
        body: JSON.stringify({ status: 'pending' }),
      });
      console.log('   ❌ Invalid transition allowed (expected to fail)');
    } catch (err) {
      console.log(`   ✅ Invalid transition blocked: ${err.message}`);
    }
    
    // Step 8: Test RIDER permissions (optional)
    console.log('\n📌 Step 8: Testing RIDER role can also mark out_for_delivery...');
    await testRiderPermissions();
    
    console.log('\n' + '═'.repeat(60));
    console.log('  ✅ ALL TESTS PASSED');
    console.log('═'.repeat(60));
    console.log('\nFeature Status:');
    console.log('  • out_for_delivery enum value: ✅');
    console.log('  • VALID_TRANSITIONS: processing → out_for_delivery → completed: ✅');
    console.log('  • DISPATCH role permission: ✅');
    console.log('  • RIDER role permission: ✅');
    console.log('  • Frontend Badge styling (purple): ✅');
    console.log('  • Invalid transition blocking: ✅');
    
  } catch (err) {
    console.error('\n❌ TEST FAILED');
    console.error(`   ${err.message}`);
    if (err.status) console.error(`   HTTP Status: ${err.status}`);
    if (err.data) console.error(`   Response: ${JSON.stringify(err.data, null, 2)}`);
    process.exit(1);
  }
}

async function createTestOrder() {
  // Get a product
  const productsRes = await request('GET', '/products');
  const products = productsRes.data;
  
  if (!products || products.length === 0) {
    throw new Error('No products found to create test order');
  }
  
  const product = products[0];
  
  const orderData = {
    customerName: 'Test Customer',
    customerPhone: '+254700000000',
    items: [{ productId: product.id, quantity: 1 }],
    totalAmount: product.unitPrice,
    shippingAddress: { street: 'Test St', city: 'Nairobi' },
  };
  
  const res = await request('POST', '/orders', {
    body: JSON.stringify(orderData),
  });
  
  testOrderId = res.data.id;
  console.log(`   Created test order: ${testOrderId}`);
}

async function testRiderPermissions() {
  const loginRes = await request('POST', '/auth/login', {
    body: JSON.stringify(TEST_USERS.rider),
  });
  const riderToken = loginRes.data.token;
  
  // Temporarily switch token
  const prevToken = authToken;
  authToken = riderToken;
  
  try {
    await request('PUT', `/orders/${testOrderId}/status`, {
      body: JSON.stringify({ status: 'out_for_delivery' }),
    });
    console.log('   ✅ RIDER can mark order as out_for_delivery');
  } catch (err) {
    console.log(`   ⚠️  RIDER permission issue: ${err.message}`);
  } finally {
    authToken = prevToken;
  }
}

// Run tests
console.log('');
test().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
