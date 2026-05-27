# PHARMX - Pharmacy E-Commerce Website
## Weekly Progress Report — Week 1

**Team:** Tech Vanguard (Frontend Division)  
**Submission Date:** Sunday, April 6, 2026  
**Repository:** github.com/Skillyme-Cohort-1/pharmX  
**Overall Progress:** 95% | Status: ✅ Ready for Integration Testing

---

## 1. PROJECT OVERVIEW

### What System We Built

PharmX is a full-featured pharmacy e-commerce website built with React 18, Vite, TypeScript, and Tailwind CSS. The system provides customers with an intuitive shopping experience for browsing medicines and health products, with complete cart and checkout functionality including simulated payment processing.

### What Problem It Solves

| Problem | Solution |
|---------|----------|
| Difficulty finding medicines online | Searchable product catalog with filters |
| No product information clarity | Detailed product pages with description, usage, warnings |
| Complex checkout process | Streamlined cart → checkout → payment flow |
| Lack of payment options | M-Pesa and Card payment simulation |
| No feedback on actions | Toast notification system |

---

## 2. SYSTEM EXPLANATION

### How the System Is Structured

The frontend follows a modular architecture:

```
React 18 + Vite
    ↓
React Router v7 (Client-side routing)
    ↓
React Context (State: Cart, Toast)
    ↓
Components (UI Library + Custom)
    ↓
Pages (6 main pages)
```

### Core User Flow

```
Homepage → Products → Product Detail → Cart → Checkout → Payment → Success
              ↑____________________________________________|
```

### Data Flow

1. **Product Browsing:** Products displayed with filtering → User selects product
2. **Add to Cart:** Product added to CartContext → Toast notification shown
3. **Checkout:** Cart items processed → Payment modal opened
4. **Payment:** User enters details → Validation → Processing → Success
5. **Completion:** Cart cleared → Redirect to products → Order confirmed

---

## 3. FRONTEND OVERVIEW

### Screens & Pages Created

| Page | Route | Status | Key Features |
|------|-------|--------|--------------|
| **Home** | `/` | ✅ Complete | Hero, Categories, Products, Promotions, Services, Blog, Newsletter, Testimonials |
| **About** | `/about` | ✅ Complete | Company information, mission, team |
| **Contact** | `/contact` | ✅ Complete | Contact form with validation |
| **Products** | `/products` | ✅ Complete | Search, filters (category, price, stock), sorting, grid/list view |
| **Product Detail** | `/products/:id` | ✅ Complete | Product info, quantity selector, tabs (description/usage/warnings), related products |
| **Cart** | `/cart` | ✅ Complete | Cart items, promo codes, checkout modal, M-Pesa & Card payment |

### UI Component Library

Created 12 reusable UI components in `src/components/ui/`:

| Component | Purpose |
|-----------|---------|
| Button | Primary, secondary, ghost, outline variants |
| Badge | Status indicators with color coding |
| Card | Content container with shadow |
| Input | Text input with styling |
| Select | Dropdown select with onValueChange |
| Checkbox | Custom checkbox with onCheckedChange |
| Label | Form field labels |
| Separator | Horizontal divider |
| Sheet | Mobile slide-out drawer for filters |
| Textarea | Multi-line text input |
| Utils | cn() function for class merging |

### Home Page Sections (14 sections built)

| Section | File | Description |
|---------|------|-------------|
| Announcement Bar | AnnouncementBar.tsx | Top notification bar |
| App Banner | AppBannerSection.tsx | Promotional banner |
| Hero | HeroSection.tsx | Main hero with CTA buttons |
| How It Works | HowItWorksSection.tsx | 3-step guide |
| Promotions | PromotionsSection.tsx | Current deals |
| Services | ServicesSection.tsx | Pharmacy services |
| Categories | CategoriesSection.tsx | Category grid |
| Products | ProductsSection.tsx | Featured products |
| Trending | TrendingSection.tsx | Trending items |
| Blog | BlogSection.tsx | Health articles |
| Newsletter | NewsletterSection.tsx | Email signup |
| Testimonials | TestimonialsSection.tsx | Customer reviews |
| Trust Bar | TrustBar.tsx | Trust indicators |
| Footer | Footer.tsx | Site footer |

---

## 4. TEAM CONTRIBUTIONS

### Maxmillin — Frontend Engineer
**Focus Area:** Homepage, Header, Footer, Product Listing, About, Contact, UI Components

**Key Deliverables:**
- Built Homepage (`app/page.tsx`) - assembled all 14 sections
- Implemented Header component with:
  - Logo and navigation links (Home, Products, About, Contact)
  - Cart icon with item count badge
  - Mobile-responsive hamburger menu
  - Scroll-aware styling (transparent to solid)
- Created Footer component with:
  - Company info, quick links, contact details
  - Social media links
  - Newsletter subscription form

- Built About Page (`app/about/page.tsx`):
  - Company story section
  - Mission and vision statements  
  - Team members section with photos
  - Statistics (years, products, customers)
- Built Contact Page (`app/contact/page.tsx`):
  - Contact form with name, email, subject, message fields
  - Form validation with error messages
  - Subject dropdown (General, Order, Product, Partnership, Other)
  - Submit button with toast feedback
- Created custom UI components: Label, Select, Checkbox, Sheet

---

### Yvonne & Roy — Frontend Engineers
**Focus Area:** Product Detail Page

**Key Deliverables:**
- Built Product Detail Page (`app/products/product/page.tsx`):
  - Breadcrumb navigation
  - Product image with placeholder fallback
  - Category and availability badge
  - Price with discount calculation
  - Quantity selector (+/-)
  - Add to Cart / Buy Now buttons with state change
  - Trust chips (Verified Medicine, Secure Packaging, Fast Delivery)
  - Tabbed content (Description, Usage, Warnings)
  - Related products section
  - 404 handling for invalid product IDs

---

### Chris — Frontend Engineer
**Focus Area:** Cart & Checkout, Payment System

**Key Deliverables:**
- Built Cart Page (`app/cart/page.tsx`):
  - Cart item list with quantity controls (+/-)
  - Stock status indicators (In Stock, Low Stock, Out of Stock)
  - Promo code system (PHARMA10 - 10%, HEALTH20 - 20%)
  - Order summary with VAT (16%) calculation
  - Free delivery threshold (KSh 2,500) progress bar
  - Checkout modal with order summary
- Implemented Payment System:
  - **M-Pesa Payment Modal:**
    - Phone number input with validation
    - Simulated STK push prompt (spinner animation)
    - "Check your phone and enter PIN" message
    - Success confirmation with green checkmark
  - **Card Payment Modal:**
    - Card number input (auto-formatted with spaces)
    - Expiry date input (MM/YY format)
    - CVV input (3-4 digits)
    - Cardholder name input
    - Full validation (16-digit card, valid expiry, CVV, name required)
    - Processing animation (spinner)
    - Success confirmation
- Replaced all alerts with toast notifications
- Implemented post-payment: clear cart + redirect to products page
- Added prescription items warning banner

---

### Solomon & George — Frontend Engineers
**Focus Area:** Product List Page Enhancement

**Key Deliverables:**
- Built and enhanced Product List Page (`app/products/page.tsx`):
  - Full filtering system integration with sidebar
  - Active filter tags showing selected filters with clear individual or all
  - Empty state design when no products match filters
  - Mobile responsive design with touch-friendly interactions
  - Implemented product card click navigation to detail page
  - Added quantity selector and add-to-cart functionality on product cards
  - Grid and list view toggle with smooth transition
  - Integrated search functionality across product name, description, and use fields
  - Category filter with checkboxes for multiple selections
  - Price range filter with predefined ranges (Under 500, 500-1500, 1500-3000, Over 3000)
  - Sorting functionality (Featured, Price Low to High, Price High to Low, Name A-Z, Highest Rated)

---

## 5. TECHNICAL IMPLEMENTATION

### State Management

**CartContext** (`context/CartContext.tsx`):
```typescript
- items: CartItem[]
- addItem(item)        // Add product to cart
- removeItem(id)       // Remove product from cart
- updateQuantity(id, qty)  // Update quantity
- clearCart()          // Empty cart
- getSubtotal()        // Calculate total
```

**ToastContext** (`context/ToastContext.tsx`):
```typescript
- addToast(toast)      // Add notification
- auto-dismiss: 4 seconds
- max visible: 3
- types: success, error, info
```

### Routing Configuration

```typescript
createBrowserRouter([
  { path: '/', Component: HomePage },
  { path: '/about', Component: AboutPage },
  { path: '/contact', Component: ContactPage },
  { path: '/products', children: [
    { index: true, Component: ProductList },
    { path: ':id', Component: ProductDetail }
  ]},
  { path: '/cart', Component: Cart }
])
```


## 6. CHALLENGES FACED

| Challenge | Solution |
|-----------|----------|
| Missing UI components (Select, Checkbox, Sheet, Label) | Created all required components from scratch |
| TypeScript type errors in Product type | Fixed type mismatches across components |
| Checkbox onCheckedChange not working | Added custom onCheckedChange handler to input |
| Sheet component not functional | Implemented custom Sheet with React state management |
| Alerts blocking user experience | Replaced all 3 alerts with toast notifications |
| Card payment not implemented | Added Card modal with full form validation |
| Payment flow incomplete | Added clear cart + redirect after successful payment |
| Product card navigation | Added useNavigate to enable clicking product to view details |

---

## 7. WHAT WE LEARNED

1. **Reusable UI components save time** - Creating the component library first enabled faster page development

2. **State management with Context** - Cart and Toast contexts provide clean state without prop drilling

3. **Modular page structure** - Breaking pages into smaller components makes maintenance easier

4. **Validation before processing** - Client-side validation improves UX by providing immediate feedback

5. **Toast notifications > alerts** - Non-blocking notifications are less disruptive to user flow

6. **Mobile-first responsive design** - Using Tailwind's responsive classes ensures mobile compatibility

---

## 8. PROGRESS SUMMARY

| Milestone | Status |
|-----------|--------|
| Header & Footer | ✅ Complete |
| Homepage Sections (14) | ✅ Complete |
| Product Listing Page | ✅ Complete |
| Product Detail Page | ✅ Complete |
| Cart & Checkout | ✅ Complete |
| M-Pesa Payment Modal | ✅ Complete |
| Card Payment Modal | ✅ Complete |
| Toast System | ✅ Complete |
| TypeScript Fixes | ✅ Complete |
| UI Component Library | ✅ Complete |

### Code Statistics

| Metric | Count |
|--------|-------|
| Pages | 6 |
| UI Components | 12 |
| Custom Components | 20+ |
| Home Page Sections | 14 |
| Context Providers | 2 |
| Route Definitions | 6 |

---

## 9. REMAINING TASKS

- [ ] Backend API integration (currently using mock data)
- [ ] Real payment gateway integration (M-Pesa STK, Stripe)
- [ ] Database setup (PostgreSQL)
- [ ] User authentication
- [ ] Order history
- [ ] Automated testing

---

## 10. SUBMISSION CHECKLISTS

### Group Checklist
- ✅ Core pages implemented (6 pages)
- ✅ Navigation and user flow functional
- ✅ All assigned screens delivered
- ✅ Payment system implemented (M-Pesa + Card)
- ✅ Toast notification system working
- ✅ Mobile responsive design verified

### Individual Checklist
- ✅ Contributed to the project this week
- ✅ Understand what the team built
- ✅ Can explain the part worked on
- ✅ Code committed to repository
- ✅ Documentation updated (README.md)

---

**Report Prepared By:** [Your Name]  
**Date:** April 6, 2026  
**Status:** Ready for Backend Integration