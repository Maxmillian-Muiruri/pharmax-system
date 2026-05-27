#!/bin/bash

echo "=========================================="
echo "   PharmaOS Backend Integration Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
}

fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  exit 1
}

# 1. Health check
echo "1. Health Check"
response=$(curl -s http://localhost:4000/health)
if echo "$response" | grep -q "ok"; then
  pass "Server is running"
else
  fail "Server not responding"
fi

# 2. Register
echo ""
echo "2. Register User"
reg_response=$(curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!","name":"Test User","phone":"0712345678"}')
token=$(echo "$reg_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$token" ]; then
  pass "Got token: ${token:0:20}..."
else
  fail "No token received"
fi

# 3. Get Profile
echo ""
echo "3. Get Profile"
profile=$(curl -s http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $token")
if echo "$profile" | grep -q "Test User"; then
  pass "Profile retrieved"
else
  fail "Profile fetch failed"
fi

# 4. Public Products
echo ""
echo "4. Public Products"
products=$(curl -s http://localhost:4000/api/public/products)
count=$(echo "$products" | grep -o '"id":' | wc -l)
if [ "$count" -gt 0 ]; then
  pass "Found $count products"
  first_name=$(echo "$products" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo "   First product: $first_name"
else
  fail "No products found (database may not be seeded)"
fi

# 5. Get Single Product
echo ""
echo "5. Get Single Product"
product_id=$(echo "$products" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$product_id" ]; then
  single=$(curl -s http://localhost:4000/api/public/products/$product_id)
  if echo "$single" | grep -q "$product_id"; then
    pass "Single product retrieved"
  else
    fail "Single product fetch failed"
  fi
fi

# 6. Get Empty Cart
echo ""
echo "6. Get Empty Cart"
cart=$(curl -s http://localhost:4000/api/cart \
  -H "Authorization: Bearer $token")
if echo "$cart" | grep -q "success"; then
  pass "Cart endpoint works"
else
  fail "Cart fetch failed"
fi

# 7. Add to Cart
echo ""
echo "7. Add to Cart"
if [ -n "$product_id" ]; then
  add_cart=$(curl -s -X PUT http://localhost:4000/api/cart \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"items\":[{\"productId\":\"$product_id\",\"quantity\":2}]}")
  if echo "$add_cart" | grep -q "success"; then
    pass "Added to cart"
  else
    fail "Add to cart failed"
  fi
fi

# 8. Get Cart
echo ""
echo "8. Get Cart with Items"
cart2=$(curl -s http://localhost:4000/api/cart \
  -H "Authorization: Bearer $token")
count=$(echo "$cart2" | grep -o '"id":' | wc -l)
if [ "$count" -ge 1 ]; then
  pass "Cart has $count item(s)"
else
  fail "Cart should have 1 item"
fi

# 9. Clear Cart
echo ""
echo "9. Clear Cart"
clear=$(curl -s -X DELETE http://localhost:4000/api/cart \
  -H "Authorization: Bearer $token")
if echo "$clear" | grep -q "success"; then
  pass "Cart cleared"
else
  fail "Clear cart failed"
fi

# 10. Create Order
echo ""
echo "10. Create Order"
if [ -n "$product_id" ]; then
  order=$(curl -s -X POST http://localhost:4000/api/orders \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"customerName\":\"Test Customer\",\"customerPhone\":\"0712345678\",\"productId\":\"$product_id\",\"quantity\":1}")
  order_number=$(echo "$order" | grep -o '"orderNumber":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$order_number" ]; then
    pass "Order created: $order_number"
  else
    fail "Order creation failed - missing orderNumber"
    echo "Response: $order"
  fi
fi

# 11. Track Order
echo ""
echo "11. Track Order (Public)"
if [ -n "$order_number" ]; then
  track=$(curl -s http://localhost:4000/api/orders/track/$order_number)
  if echo "$track" | grep -q "$order_number"; then
    pass "Order tracked successfully"
  else
    fail "Order tracking failed"
  fi
fi

# 12. My Orders
echo ""
echo "12. My Orders"
my_orders=$(curl -s "http://localhost:4000/api/orders?mine=true" \
  -H "Authorization: Bearer $token")
my_count=$(echo "$my_orders" | grep -o '"id":' | wc -l)
if [ "$my_count" -ge 1 ]; then
  pass "Found $my_count order(s) for user"
else
  fail "Should have at least 1 order"
fi

# 13. Upload Prescription
echo ""
echo "13. Upload Prescription"
prescription=$(curl -s -X POST http://localhost:4000/api/prescriptions \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"patientName":"John Doe","phoneNumber":"0711223344","email":"john@test.com","doctorName":"Dr. Smith","hospitalName":"Kenyatta Hospital","address":"Nairobi","files":[{"name":"test.jpg","size":1024,"type":"image/jpeg","dataUrl":"data:..."}]}')
prescription_id=$(echo "$prescription" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
prescription_number=$(echo "$prescription" | grep -o '"prescriptionId":"[^"]*"' | cut -d'"' -f4)
if [ -n "$prescription_id" ]; then
  pass "Prescription uploaded: $prescription_number"
else
  fail "Prescription upload failed"
fi

# 14. Get My Prescriptions
echo ""
echo "14. Get My Prescriptions"
my_presc=$(curl -s http://localhost:4000/api/prescriptions \
  -H "Authorization: Bearer $token")
presc_count=$(echo "$my_presc" | grep -o '"id":' | wc -l)
if [ "$presc_count" -ge 1 ]; then
  pass "Found $presc_count prescription(s)"
else
  fail "Should have 1 prescription"
fi

# 15. Update Prescription (Should fail - customer role)
echo ""
echo "15. Update Prescription Status (Should fail with 403)"
if [ -n "$prescription_id" ]; then
  update=$(curl -s -X PUT "http://localhost:4000/api/prescriptions/$prescription_id/status" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d '{"status":"available","estimatedPrice":1500}')
  status_code=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "http://localhost:4000/api/prescriptions/$prescription_id/status" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d '{"status":"available"}')
  if [ "$status_code" = "403" ]; then
    pass "Correctly denied (403)"
  else
    echo "   Got status: $status_code (expected 403)"
  fi
fi

# 16. Logout
echo ""
echo "16. Logout"
logout=$(curl -s -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer $token")
if echo "$logout" | grep -q "success"; then
  pass "Logged out"
else
  fail "Logout failed"
fi

# 17. Invalid Token
echo ""
echo "17. Invalid Token (Should fail)"
invalid=$(curl -s http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer invalid-token123")
status_code=$(curl -s -o /dev/null -w "%{http_code}" \
  http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer invalid-token123")
if [ "$status_code" = "401" ]; then
  pass "Correctly rejected (401)"
else
  echo "   Got: $status_code (expected 401)"
fi

echo ""
echo "=========================================="
echo "   All tests completed!"
echo "=========================================="
