# PharmaOS API Documentation

**Base URL:** `http://localhost:3000/api`

---

## Table of Contents

1. [Products](#products)
2. [Orders](#orders)
3. [Transactions](#transactions)
4. [Alerts](#alerts)
5. [Analytics](#analytics)
6. [Import](#import)
7. [Prompt](#prompt)

---

## Products

### Get All Products
```
GET /api/products
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `expired`, `near_expiry`, `out_of_stock`)
- `search` (optional): Search by product name
- `sort` (optional): Sort field (`name`, `quantity`, `unitPrice`, `expiryDate`, `status`, `createdAt`)
- `order` (optional): Sort order (`asc`, `desc`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Amoxicillin 500mg",
      "category": "Antibiotics",
      "quantity": 150,
      "unitPrice": "250.00",
      "expiryDate": "2027-04-01",
      "supplier": null,
      "status": "active",
      "createdAt": "2026-04-01T10:00:00Z",
      "updatedAt": "2026-04-01T10:00:00Z"
    }
  ]
}
```

### Create Product
```
POST /api/products
```

**Body:**
```json
{
  "name": "Paracetamol 500mg",
  "category": "Analgesics",
  "quantity": 100,
  "unitPrice": 50.00,
  "expiryDate": "2027-12-31",
  "supplier": "Pharma Supplies Ltd"
}
```

**Response:**
```json
{
  "success": true,
  "data": { /* created product */ },
  "message": "Product created successfully"
}
```

### Update Product
```
PUT /api/products/:id
```

**Body:** (all fields optional)
```json
{
  "name": "Paracetamol Extra",
  "quantity": 120,
  "unitPrice": 55.00
}
```

### Delete Product
```
DELETE /api/products/:id
```

**Note:** Fails if product has existing orders (409 Conflict)

---

## Orders

### Get All Orders
```
GET /api/orders
```

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `processing`, `completed`, `cancelled`)
- `search` (optional): Search by customer name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "customerName": "John Doe",
      "customerPhone": "0712345678",
      "productId": "uuid",
      "quantity": 2,
      "totalAmount": "500.00",
      "status": "pending",
      "notes": null,
      "createdAt": "2026-04-01T10:00:00Z",
      "product": {
        "id": "uuid",
        "name": "Amoxicillin 500mg",
        "unitPrice": "250.00"
      }
    }
  ]
}
```

### Create Order
```
POST /api/orders
```

**Body:**
```json
{
  "customerName": "Jane Smith",
  "customerPhone": "0723456789",
  "productId": "uuid-of-product",
  "quantity": 3
}
```

**Note:** `totalAmount` is calculated server-side

### Update Order Status
```
PUT /api/orders/:id/status
```

**Body:**
```json
{
  "status": "processing"
}
```

**Valid Transitions:**
- `pending` → `processing` or `cancelled`
- `processing` → `completed` or `cancelled`
- `completed` → (no transitions allowed)
- `cancelled` → (no transitions allowed)

**Note:** When status is set to `completed`:
- Product quantity is decremented
- Product status is recalculated
- Transaction record is created
- Low stock alert is created if applicable

---

## Transactions

### Get All Transactions
```
GET /api/transactions
```

**Query Parameters:**
- `type` (optional): Filter by type (`sale`, `restock`, `write_off`)
- `from` (optional): Start date (ISO format)
- `to` (optional): End date (ISO format)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 25)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "orderId": "uuid",
        "productId": "uuid",
        "type": "sale",
        "quantity": 2,
        "amount": "500.00",
        "notes": null,
        "createdAt": "2026-04-01T10:00:00Z",
        "product": {
          "id": "uuid",
          "name": "Amoxicillin 500mg"
        },
        "order": {
          "id": "uuid",
          "customerName": "John Doe"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 50,
      "totalPages": 2
    }
  }
}
```

### Get Transaction Summary
```
GET /api/transactions/summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "today": 1250.00,
    "week": 8400.00,
    "month": 32500.00,
    "totalTransactions": 45
  }
}
```

---

## Alerts

### Get Alerts
```
GET /api/alerts
```

**Query Parameters:**
- `type` (optional): Filter by type (`expired`, `near_expiry`, `low_stock`)
- `is_read` (optional): Filter by read status (`true`, `false`)
- `limit` (optional): Max results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "productId": "uuid",
      "type": "expired",
      "message": "Amoxicillin 500mg has expired",
      "isRead": false,
      "triggeredAt": "2026-04-01T00:00:00Z",
      "product": {
        "id": "uuid",
        "name": "Amoxicillin 500mg"
      }
    }
  ]
}
```

### Run Expiry Scan
```
POST /api/alerts/run
```

**Response:**
```json
{
  "success": true,
  "data": {
    "expired": 5,
    "nearExpiry": 3,
    "alertsCreated": 2
  },
  "message": "Scan complete: 5 expired, 3 near expiry, 2 alerts created"
}
```

### Mark Alert as Read
```
PUT /api/alerts/:id/read
```

### Mark All Alerts as Read
```
PUT /api/alerts/read-all
```

---

## Analytics

### Get Sales Trend
```
GET /api/analytics/sales?period=7
```

**Query Parameters:**
- `period` (optional): Number of days (`7`, `30`, `90`)

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "date": "2026-03-25",
        "amount": 1250.50,
        "formattedDate": "Mar 25"
      },
      {
        "date": "2026-03-26",
        "amount": 2340.00,
        "formattedDate": "Mar 26"
      }
    ],
    "total": 28450.00,
    "period": 7
  }
}
```

### Get Top Products
```
GET /api/analytics/top-products?metric=units&period=week
```

**Query Parameters:**
- `metric` (optional): `units` or `revenue`
- `period` (optional): `week`, `month`, `all`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "uuid",
        "name": "Paracetamol 500mg",
        "units": 45,
        "revenue": 2250.00
      },
      {
        "id": "uuid",
        "name": "Amoxicillin 500mg",
        "units": 30,
        "revenue": 7500.00
      }
    ],
    "metric": "units",
    "period": "week"
  }
}
```

---

## Import

### Import Products from CSV
```
POST /api/import/products
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Body:**
- `file`: CSV file (max 5MB)

**CSV Format:**
```csv
name,category,quantity,unitPrice,expiryDate,supplier
Amoxicillin 500mg,Antibiotics,100,250.00,2027-12-31,Pharma Ltd
Paracetamol 500mg,Analgesics,200,50.00,2027-06-30,MediSupply
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": 18,
    "skipped": 1,
    "errors": 1,
    "details": {
      "imported": [/* array of created products */],
      "skipped": [
        {
          "row": 5,
          "name": "Duplicate Product",
          "reason": "Product with this name already exists"
        }
      ],
      "errors": [
        {
          "row": 8,
          "error": "Invalid quantity value"
        }
      ]
    }
  },
  "message": "Import complete: 18 products added"
}
```

---

## Prompt

### Resolve Natural Language Query
```
POST /api/prompt
```

**Body:**
```json
{
  "query": "show expired drugs"
}
```

**Supported Queries:**
- `expired drugs` / `expired products`
- `near expiry` / `expiring soon`
- `low stock` / `running low`
- `pending orders` / `new orders`
- `today's sales` / `revenue today`
- `top products` / `best sellers`

**Response (for product queries):**
```json
{
  "success": true,
  "data": {
    "label": "Expired Products",
    "type": "get_products",
    "results": [
      {
        "id": "uuid",
        "name": "Ciprofloxacin 500mg",
        "status": "expired",
        "quantity": 30,
        "unitPrice": "300.00",
        "expiryDate": "2026-03-20"
      }
    ],
    "count": 5
  }
}
```

**Response (for summary queries):**
```json
{
  "success": true,
  "data": {
    "label": "Today's Sales",
    "type": "get_summary",
    "results": {
      "total": 1250.00,
      "count": 8
    },
    "count": 1
  }
}
```

**Response (unrecognized query):**
```json
{
  "success": true,
  "data": {
    "success": false,
    "suggestions": [
      "show expired drugs",
      "low stock",
      "pending orders",
      "today's sales",
      "near expiry",
      "top products"
    ]
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `NOT_FOUND` - Resource not found (404)
- `VALIDATION_ERROR` - Invalid input (400)
- `DUPLICATE` - Resource already exists (409)
- `INSUFFICIENT_STOCK` - Not enough stock (409)
- `INVALID_TRANSITION` - Invalid order status change (400)
- `HAS_ORDERS` - Cannot delete product with orders (409)
- `SERVER_ERROR` - Internal server error (500)

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider adding:
- Express rate limiter middleware
- Request throttling per IP
- API key authentication

---

## CORS

CORS is enabled for the origin specified in `CLIENT_URL` environment variable (default: `http://localhost:5173`).

---

**PharmaOS API v1.0** - Tech Vanguard © 2026
