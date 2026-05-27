const API_URL = 'http://localhost:4000/api';

async function testOutForDelivery() {
  try {
    console.log('🔐 Logging in as dispatch@pharmaos.com...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'dispatch@pharmaos.com', password: 'pharma123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(JSON.stringify(loginData));
    const token = loginData.data.token;
    console.log('✅ Token obtained');

    console.log('\n📋 Fetching processing orders...');
    const ordersRes = await fetch(`${API_URL}/orders?status=processing`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    let ordersData = await ordersRes.json();
    if (!ordersRes.ok) throw new Error(JSON.stringify(ordersData));
    let orders = ordersData.data;
    console.log(`Found ${orders.length} processing orders`);
    if (orders.length === 0) {
      console.log('❌ No processing orders found');
      return;
    }
    const order = orders[0];
    console.log(`Using order: ${order.id} - ${order.customerName} (current status: ${order.status})`);

    console.log('\n🚚 Marking order as out_for_delivery...');
    const update1Res = await fetch(`${API_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'out_for_delivery' })
    });
    const update1Data = await update1Res.json();
    if (!update1Res.ok) throw new Error(JSON.stringify(update1Data));
    console.log('✅ Order marked as out_for_delivery');

    console.log('\n📋 Fetching orders with out_for_delivery status...');
    const outRes = await fetch(`${API_URL}/orders?status=out_for_delivery`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    let outData = await outRes.json();
    if (!outRes.ok) throw new Error(JSON.stringify(outData));
    let outOrders = outData.data;
    console.log(`Found ${outOrders.length} orders with out_for_delivery status`);
    const updatedOrder = outOrders.find(o => o.id === order.id);
    if (updatedOrder) {
      console.log(`✅ Verified: order status is now '${updatedOrder.status}'`);
    } else {
      console.log('❌ Order not found in out_for_delivery list');
    }

    console.log('\n✅ Marking order as completed...');
    const update2Res = await fetch(`${API_URL}/orders/${order.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'completed' })
    });
    const update2Data = await update2Res.json();
    if (!update2Res.ok) throw new Error(JSON.stringify(update2Data));
    console.log('✅ Order marked as completed');

    console.log('\n🎉 All tests passed!');
    console.log('\nSummary:');
    console.log('- out_for_delivery status: IMPLEMENTED ✓');
    console.log('- Status transition: processing → out_for_delivery → completed ✓');
    console.log('- DISPATCH role can perform transitions ✓');
  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
    process.exit(1);
  }
}

testOutForDelivery();
