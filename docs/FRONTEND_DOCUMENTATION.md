# PharmX Frontend Documentation

## Overview

PharmX is a pharmacy e-commerce frontend application built with React, TypeScript, and Vite. It provides a complete online pharmacy experience including product browsing, prescription management, shopping cart, checkout, and order tracking.

---

## Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS + Custom CSS
- **Icons**: Lucide React
- **UI Components**: Custom Radix UI-based components

---

## Project Structure

```
apps/frontend/src/
├── main.tsx                    # Application entry point
├── App.tsx                     # Main app component with router configuration
├── assets/                      # Static assets (images, icons)
│   └── products/               # Product images
├── components/                 # Reusable UI components
│   ├── ui/                    # Base UI components (Button, Input, Card, Badge, etc.)
│   ├── dev/                   # Development utilities (LayoutWrapper, ErrorPage)
│   ├── Header.tsx             # Main navigation header
│   ├── Footer.tsx              # Site footer
│   ├── HeroSection.tsx        # Homepage hero section
│   ├── ProductCard.tsx        # Product display card
│   ├── ProductsSection.tsx    # Products grid section
│   ├── CategoriesSection.tsx  # Product categories
│   ├── CartSidebar.tsx        # Slide-out cart
│   ├── ChatBubble.tsx         # Customer support chat widget
│   ├── BackToTop.tsx          # Scroll to top button
│   ├── AnnouncementBar.tsx   # Top announcement bar
│   ├── TrendingSection.tsx    # Trending products
│   ├── PromotionsSection.tsx # Promotional banners
│   ├── ServicesSection.tsx   # Services offered
│   ├── HowItWorksSection.tsx # How it works explanation
│   ├── BlogSection.tsx       # Blog posts
│   ├── CountdownTimer.tsx    # Countdown for promotions
│   ├── NewsletterSection.tsx # Newsletter signup
│   ├── TestimonialsSection.tsx# Customer testimonials
│   ├── TrustBar.tsx          # Trust indicators
│   ├── AppBannerSection.tsx  # App download banner
│   └── fallbackImg/           # Image fallback component
├── context/                    # React Context providers
│   ├── index.tsx              # APP Context (legacy)
│   ├── CartContext.tsx        # Shopping cart state management
│   └── ToastContext.tsx       # Toast notification system
├── app/                        # Page components (routes)
│   ├── page.tsx               # Home page
│   ├── layout.tsx             # Root layout
│   ├── about/page.tsx         # About page
│   ├── contact/page.tsx       # Contact page
│   ├── cart/page.tsx          # Shopping cart page
│   ├── checkout/page.tsx      # Checkout flow (shipping, payment, review)
│   ├── prescription/page.tsx  # Upload prescription form
│   ├── prescriptions/page.tsx # My prescriptions list
│   ├── my-orders/page.tsx     # My orders list
│   ├── orders/[id]/page.tsx   # Order detail page
│   ├── products/
│   │   ├── page.tsx           # Product listing page
│   │   ├── layout.tsx         # Products layout
│   │   └── product/page.tsx   # Product detail page
│   └── auth/
│       ├── page.tsx           # Auth layout
│       ├── signin/page.tsx    # Sign in page
│       └── signup/page.tsx    # Sign up page
├── trackorder/
│   └── OrderTracking.tsx      # Public order tracking page
├── hooks/                      # Custom React hooks
│   ├── useFadeInOnScroll.ts   # Scroll animation hook
│   ├── useCountUp.ts          # Number counter animation
│   └── index.ts               # Hook exports
├── utils/                      # Utility functions
│   ├── index.ts               # Route URLs and navigation links
│   └── prescriptions.ts       # Prescription & order localStorage utilities
├── types/                      # TypeScript type definitions
│   └── index.ts               # All application types
└── styles/
    └── index.css              # Global styles + Tailwind
```

---

## Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Main landing page |
| `/products` | ProductList | Product catalog |
| `/products/:id` | ProductDetail | Single product details |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Multi-step checkout |
| `/prescription` | UploadPrescription | Upload prescription form |
| `/prescriptions` | MyPrescriptions | View all prescriptions |
| `/orders` | MyOrders | User's order list |
| `/orders/:id` | Order detail | Individual order details |
| `/track` | TrackOrder | Public order tracking (search) |
| `/track/:id` | TrackOrder | Auto-loaded order tracking |
| `/about` | AboutPage | About us page |
| `/contact` | ContactPage | Contact page |
| `/auth` | Auth | Auth layout |
| `/auth/signin` | Signin | Login page |
| `/auth/signup` | Signup | Registration page |

---

## Core Features

### 1. Product Catalog
- Product listing with grid layout
- Product detail page with:
  - Image gallery
  - Description, usage, warnings tabs
  - Related products
  - Add to cart functionality
- Search products
- Category filtering

### 2. Shopping Cart (CartContext)
- Add/remove items
- Update quantities
- Calculate subtotal
- Persists in component state
- Free delivery threshold calculation
- Promo code support (PHARMA10, HEALTH20)

### 3. Checkout Flow (3 Steps)
1. **Shipping**: Enter delivery address and delivery option (Standard/Express)
2. **Payment**: Select payment method (Credit Card / M-Pesa) and enter details
3. **Review**: Review order and place order
- Automatic redirect to orders page after successful payment
- Order saved to localStorage

### 4. Prescriptions System
- **Upload Prescription**: 
  - Form with patient details (name, phone, email, address)
  - Doctor and hospital information
  - File upload (images/PDFs)
  - Additional notes
- **My Prescriptions**: 
  - List view with status badges:
    - Under Review (yellow) - being processed
    - Available (green) - ready for checkout
    - Out of Stock (orange) - items unavailable
    - Rejected (red) - invalid prescription
- **Review Simulation**: 
  - Auto-review after 5 seconds (demo)
  - Random status assignment

### 5. Orders System
- **My Orders**: 
  - List of all orders
  - Search by order number/product name
  - Filter by status (Processing, In Progress, On the Way, Delivered, Cancelled)
  - Stats dashboard showing totals
- **Order Detail**: 
  - Full order information
  - Shipping details
  - Payment information
  - Timeline visualization
  
- **Order Tracking** (`/track`):
  - Public page - no login required
  - Search by order number
  - Visual timeline showing:
    - Order Placed
    - Payment Confirmed
    - Processing Order
    - Out for Delivery
    - Delivered
  - Status badges with color coding
  - Delivery information display
  - Direct navigation from My Orders page

### 6. Toast Notifications (ToastContext)
- Success, error, info, warning types
- Auto-dismiss with configurable duration
- Used throughout the application for user feedback

---

## Data Storage

The application uses **localStorage** for persistence:

| Key | Data |
|-----|------|
| `pharmx_prescriptions` | Array of prescription requests |
| `pharmx_checkout_prescription_id` | Active prescription ID for checkout |
| `pharmx_orders` | Array of completed orders |

---

## Context Providers

### CartProvider
Wraps the application to provide cart functionality:
- `items`: Cart items array
- `addItem(item)`: Add item to cart
- `removeItem(id)`: Remove item
- `updateQuantity(id, qty)`: Update quantity
- `clearCart()`: Clear all items
- `getItemCount()`: Get number of items
- `getSubtotal()`: Calculate total

### ToastProvider
Provides toast notifications:
- `addToast({ type, message, duration })`: Show toast
- Types: `success`, `error`, `info`, `warning`

---

## UI Components

Located in `components/ui/`:

| Component | Description |
|-----------|-------------|
| Button | Primary, secondary, outline, ghost variants |
| Input | Text input with styling |
| Card | Card container, header, content, title |
| Badge | Status badges |
| Separator | Horizontal/vertical divider |
| Select | Dropdown select |
| Checkbox | Checkbox input |
| Label | Form label |
| Textarea | Multi-line text input |
| Sheet | Slide-out panel |

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useFadeInOnScroll` | Animate elements on scroll into view |
| `useCountUp` | Animate number counting |

---

## Key Files Explained

### `App.tsx`
- Creates browser router with all routes
- Wraps with ToastProvider and CartProvider
- Defines AppLayout with Header/Footer
- Error handling with ErrorPage and Error404Page

### `utils/index.ts`
- Exports all route URL constants
- Defines navigation links for header
- Route constants: CART_URL, CHECKOUT_URL, ORDERS_URL, etc.

### `utils/prescriptions.ts`
- `getStoredPrescriptions()` - Get all prescriptions from localStorage
- `addPrescription(prescription)` - Add new prescription
- `updatePrescription(id, updates)` - Update prescription status
- `getPrescriptionById(id)` - Get single prescription
- `saveOrder(order)` - Save new order to localStorage
- `getStoredOrders()` - Get all orders
- `getStoredOrderById(id)` - Get single order by ID
- `simulatePrescriptionReview(id)` - Auto-review simulation (demo)
- `createPrescriptionId()` - Generate prescription ID
- `readFilesAsDataUrls(files)` - Convert files to data URLs

### `types/index.ts`
- `StoredOrder` - Order type with items, shipping, status
- `StoredOrderItem` - Individual order item
- `PrescriptionRequest` - Prescription request type
- `PrescriptionStatus` - Review status types (under_review, available, out_of_stock, rejected)
- `PrescriptionFile` - Uploaded file data
- `Product` - Product type
- `TNodeChildrentType` - Children prop type
- `TAppContextType` - App context type

---

## Key Flows

### Checkout Flow
1. User adds products to cart
2. Goes to `/cart` and clicks checkout
3. Fills shipping information
4. Selects payment method (Card or M-Pesa)
5. Reviews order
6. Clicks "Place Order"
7. Order saved to localStorage
8. Cart cleared
9. Redirected to `/orders` page

### Prescription Flow
1. User goes to `/prescription`
2. Fills patient details and uploads files
3. Submits prescription
4. Status set to "Under Review"
5. After 5 seconds (demo), status updates:
   - Available → proceed to checkout
   - Out of Stock → wait or upload new
   - Rejected → upload new prescription
6. Available prescriptions can proceed to checkout

### Order Tracking Flow
1. User goes to `/track` or clicks Track Order in My Orders
2. Enters order number or auto-loaded from URL
3. System fetches order from localStorage
4. Displays:
   - Order status badge
   - Estimated delivery
   - Timeline visualization
   - Order items
   - Delivery information

---

## Running the Application

```bash
cd apps/frontend
npm install
npm run dev      # Development server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

---

## Development Notes

- Uses **Vite** for fast HMR
- **Tailwind CSS** for utility classes
- Custom CSS for complex components
- Responsive design (mobile-first approach)
- Provider pattern for state management
- No backend - all data simulated with localStorage
- Payment simulation (no real payments - M-Pesa STK push simulated)
- React Query available but not heavily used (localStorage-based data)

---

## Environment Variables

Create `.env` file in `apps/frontend/`:

```env
VITE_APP_TITLE=PharmX
# Add more as needed
```

---

## Future Improvements

- User authentication (login/register)
- Backend API integration
- Real payment gateway integration (M-Pesa, Stripe)
- Order status real-time updates
- Email notifications
- Admin dashboard for prescription review
- Prescription validity period tracking
- Order cancellation and returns
- Product reviews and ratings
- Wishlist functionality

---

## Component Hierarchy

```
App
├── ToastProvider
│   └── CartProvider
│       └── RouterProvider
│           └── AppLayout
│               ├── Header
│               │   ├── SearchBar
│               │   └── NavLinks
│               ├── Outlet (page content)
│               │   ├── HomePage (multiple sections)
│               │   ├── ProductList
│               │   ├── ProductDetail
│               │   ├── Cart
│               │   ├── Checkout (multi-step)
│               │   ├── UploadPrescription
│               │   ├── MyPrescriptions
│               │   ├── MyOrders
│               │   ├── TrackOrder
│               │   ├── AboutPage
│               │   └── ContactPage
│               └── Footer
```

---

## API Simulation

Since there's no backend, these functions simulate API behavior:

- `simulatePrescriptionReview()` - 5 second delay then random status
- Checkout payment - 2.5s (card) / 4s (M-Pesa) simulated processing
- Order tracking - instant localStorage lookup

---

*Last Updated: April 2026*
*Version: 1.0.0*
*Project: PharmX - Online Pharmacy*