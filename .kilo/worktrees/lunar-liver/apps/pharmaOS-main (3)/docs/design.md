# PharmaOS — UI/UX Design Specification

> **Document Type:** Design System & UI/UX Guide  
> **Version:** 1.0  
> **Product:** PharmaOS — Pharmacy Internal Management System  
> **Team:** Tech Vanguard  
> **Audience:** Developers, Designers, Investors  
> **Last Updated:** April 1, 2026  

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Brand Identity](#2-brand-identity)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout Grid](#5-spacing--layout-grid)
6. [Component Library](#6-component-library)
7. [Page-by-Page Specifications](#7-page-by-page-specifications)
8. [Motion & Animation](#8-motion--animation)
9. [Iconography](#9-iconography)
10. [Responsive Design](#10-responsive-design)
11. [Accessibility](#11-accessibility)
12. [Design Tokens Reference](#12-design-tokens-reference)
13. [Investor-Facing Presentation Notes](#13-investor-facing-presentation-notes)

---

## 1. Design Philosophy

### Core Principles

PharmaOS is built on four non-negotiable design pillars:

| Principle | Definition | How It Shows |
|---|---|---|
| **Clarity First** | Zero cognitive load for first-time users | Dashboard communicates health in < 30 seconds |
| **Trust Through Data** | Every number is real and sourced | Live KPI cards, live charts, no static mocks in production |
| **Speed as a Feature** | Interactions feel instant, never sluggish | Skeleton loaders, optimistic UI, smooth table updates |
| **Professional Restraint** | Premium without being flashy | Conservative palette, tight typography, purposeful animation |

### User Mental Model

The user opens PharmaOS and should instinctively feel:

> *"I can see everything that matters, reach anything in two clicks, and trust the numbers I'm reading."*

This is achieved through:
- A persistent **left sidebar** that always shows where you are
- A **dashboard** that acts as command centre, not just a homepage
- **Colour-coded status badges** that communicate urgency without reading
- **Progressive disclosure** — detailed data is one click away from any summary

---

## 2. Brand Identity

### Product Name & Wordmark

```
PharmaOS
```

- **Font:** Inter, 700 (Bold)
- **Letter spacing:** -0.02em (tight, modern)
- **Render:** "Pharma" in `teal-600`, "OS" in `gray-400`
- **Usage:** Always shown in the sidebar header; never stretched or recoloured

### Tagline

> *"The operational backbone of the modern pharmacy."*

Used in onboarding screens, marketing collateral, and investor decks.

### Logo Mark Concept

A simple geometric mark: a stylised pill/capsule shape with a thin vertical line through it, suggesting precision and digital technology. Rendered in `teal-600` on a white or dark background.

```
  ╭───╮
  │ ▎ │   ← PharmaOS logomark (conceptual)
  ╰───╯
```

### Brand Voice

| Attribute | Description |
|---|---|
| **Tone** | Confident, professional, clinically precise |
| **Language** | Plain English — no medical jargon unless domain-specific |
| **Error messages** | Helpful, not technical ("Only 3 units available" not "CONSTRAINT_VIOLATION") |
| **Success messages** | Brief and confirmatory ("Product added" not "Operation completed successfully") |

---

## 3. Color System

### Primary Palette

The palette is intentionally clinical — rooted in teal (trust, healthcare) with a dark sidebar and warm neutral surfaces.

```
┌─────────────────────────────────────────────────────────────────────┐
│  PRIMARY          SEMANTIC STATES                                   │
│                                                                     │
│  Teal-600         Green-600      Red-600        Amber-500           │
│  #0D9488          #16A34A        #DC2626        #F59E0B             │
│  Buttons, Links   Active/OK      Danger/Expiry  Warning/Near-Exp   │
│                                                                     │
│  Blue-600         Gray-50        Gray-900       White               │
│  #2563EB          #F9FAFB        #111827        #FFFFFF             │
│  Info/Processing  Page BG        Sidebar BG     Cards               │
└─────────────────────────────────────────────────────────────────────┘
```

### Full Token Table

| Token Name | Hex Value | Tailwind Class | Usage |
|---|---|---|---|
| `color-primary` | `#0D9488` | `teal-600` | Primary buttons, active nav, links |
| `color-primary-hover` | `#0F766E` | `teal-700` | Button hover states |
| `color-primary-light` | `#CCFBF1` | `teal-50` | Subtle primary tints, highlights |
| `color-success` | `#16A34A` | `green-600` | Completed orders, active products |
| `color-success-bg` | `#DCFCE7` | `green-100` | Success badge background |
| `color-danger` | `#DC2626` | `red-600` | Expired products, delete actions, errors |
| `color-danger-bg` | `#FEE2E2` | `red-100` | Danger badge background |
| `color-warning` | `#D97706` | `amber-600` | Near-expiry, low stock, caution |
| `color-warning-bg` | `#FEF3C7` | `amber-100` | Warning badge background |
| `color-info` | `#2563EB` | `blue-600` | Processing orders, info states |
| `color-info-bg` | `#DBEAFE` | `blue-100` | Info badge background |
| `color-neutral-50` | `#F9FAFB` | `gray-50` | Page background |
| `color-neutral-100` | `#F3F4F6` | `gray-100` | Table row alternates, dividers |
| `color-neutral-200` | `#E5E7EB` | `gray-200` | Borders, input outlines |
| `color-neutral-500` | `#6B7280` | `gray-500` | Secondary text, placeholders |
| `color-neutral-700` | `#374151` | `gray-700` | Primary body text |
| `color-neutral-900` | `#111827` | `gray-900` | Sidebar background, headings |
| `color-white` | `#FFFFFF` | `white` | Card backgrounds |

### Status Colour Mapping

Every status in the system maps to a specific colour pair (text + background):

| Status | Text Color | Background | Badge Class |
|---|---|---|---|
| `active` | `green-800` | `green-100` | `bg-green-100 text-green-800` |
| `expired` | `red-800` | `red-100` | `bg-red-100 text-red-800` |
| `near_expiry` | `amber-800` | `amber-100` | `bg-amber-100 text-amber-800` |
| `out_of_stock` | `gray-600` | `gray-100` | `bg-gray-100 text-gray-600` |
| `pending` | `yellow-800` | `yellow-100` | `bg-yellow-100 text-yellow-800` |
| `processing` | `blue-800` | `blue-100` | `bg-blue-100 text-blue-800` |
| `completed` | `green-800` | `green-100` | `bg-green-100 text-green-800` |
| `cancelled` | `gray-600` | `gray-100` | `bg-gray-100 text-gray-600` |
| `sale` | `green-800` | `green-100` | `bg-green-100 text-green-800` |
| `restock` | `blue-800` | `blue-100` | `bg-blue-100 text-blue-800` |
| `write_off` | `red-800` | `red-100` | `bg-red-100 text-red-800` |

### Dark Mode (Stretch Goal)

If dark mode is implemented, the following surface-level swaps apply:

| Light | Dark |
|---|---|
| `gray-50` (page bg) | `gray-950` |
| `white` (card bg) | `gray-900` |
| `gray-200` (borders) | `gray-700` |
| `gray-700` (body text) | `gray-200` |

---

## 4. Typography

### Font Stack

**Primary Font:** Inter (Google Fonts)

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

> Inter was purpose-designed for screen readability at high information density. It is the standard in modern SaaS UIs (Linear, Vercel, Notion).

### Type Scale

| Role | Size | Weight | Line Height | Class | Usage |
|---|---|---|---|---|---|
| `display` | 30px / 1.875rem | 700 | 1.2 | `text-3xl font-bold` | Page hero titles (rare) |
| `h1` | 24px / 1.5rem | 700 | 1.3 | `text-2xl font-bold` | Page headers |
| `h2` | 20px / 1.25rem | 600 | 1.35 | `text-xl font-semibold` | Section headings, card titles |
| `h3` | 16px / 1rem | 600 | 1.4 | `text-base font-semibold` | Subsection labels |
| `body` | 14px / 0.875rem | 400 | 1.5 | `text-sm` | All prose, table cells, descriptions |
| `label` | 12px / 0.75rem | 500 | 1.4 | `text-xs font-medium` | Form labels, badge text |
| `caption` | 11px / 0.6875rem | 400 | 1.4 | `text-[11px]` | Timestamps, meta info |

### KPI Number Style

KPI card values (e.g., revenue totals) use a distinct type treatment:

```css
font-size: 2rem;      /* 32px */
font-weight: 700;
letter-spacing: -0.02em;
color: gray-900;
```

This makes metric values instantly scannable at a glance.

---

## 5. Spacing & Layout Grid

### Base Unit

All spacing is based on a **4px base unit**, multiplied in Tailwind's default scale.

```
4px  → space-1  (micro gaps)
8px  → space-2  (inline gaps, icon margins)
12px → space-3  (tight element spacing)
16px → space-4  (standard padding — cards, sections)
24px → space-6  (between grouped elements)
32px → space-8  (between major sections)
48px → space-12 (page-level breathing room)
```

### Layout Structure

```
┌────────────────────────────────────────────────────────┐
│  SIDEBAR (240px, fixed)   │  MAIN CONTENT AREA         │
│                           │                            │
│  [Logo]                   │  [Header — page title]     │
│  [Nav Item — active]      │                            │
│  [Nav Item]               │  [Content — scrollable]    │
│  [Nav Item]               │                            │
│  [Nav Item]               │                            │
│  [Nav Item]               │                            │
│  [Nav Item]               │                            │
│                           │                            │
│  [Alert Count Badge]      │                            │
└────────────────────────────────────────────────────────┘
```

- **Sidebar width:** 240px (collapsible to 64px on tablet viewport)
- **Main content max-width:** 1280px, centred, `px-6 py-6`
- **Card padding:** 24px (p-6)
- **Table cell padding:** 12px vertical, 16px horizontal
- **Section gap:** 24px between distinct UI sections on one page

### Grid System

Use CSS Grid where layout is two-dimensional:

```css
/* KPI cards grid */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
gap: 1.5rem; /* 24px */

/* Two-column dashboard (charts + alerts) */
grid-template-columns: 2fr 1fr;
gap: 1.5rem;
```

---

## 6. Component Library

### 6.1 Button

Buttons use consistent padding, rounded corners, and focus rings.

```
Variants:
  primary    → bg-teal-600 text-white hover:bg-teal-700
  secondary  → bg-white text-gray-700 border border-gray-200 hover:bg-gray-50
  danger     → bg-red-600 text-white hover:bg-red-700
  ghost      → text-gray-600 hover:bg-gray-100

Sizes:
  sm  → px-3 py-1.5 text-xs
  md  → px-4 py-2 text-sm       ← default
  lg  → px-6 py-3 text-base

Shared attributes:
  border-radius: rounded-lg (8px)
  font-weight: font-medium (500)
  transition: transition-colors duration-150
  focus: focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
  disabled: opacity-50 cursor-not-allowed
```

**Loading state:** Show a 16px spinner inline-left of the label. Disable the button. Label becomes "Saving…" or "Processing…".

### 6.2 Badge / StatusPill

Small, pill-shaped label used for status indicators.

```
border-radius: rounded-full
padding: px-2.5 py-0.5
font-size: text-xs font-medium
color: from STATUS_STYLES map (see Section 3)
```

Example rendering:
```
[● Active]   [● Expired]   [● Pending]   [● Completed]
green         red           yellow         green
```

The `●` dot icon precedes every badge to reinforce the colour signal for colour-blind users.

### 6.3 Card

The foundational surface container.

```css
background: white
border-radius: rounded-xl (12px)
border: 1px solid gray-200
padding: p-6 (24px)
box-shadow: shadow-sm (0 1px 2px rgba(0,0,0,0.05))
```

**KPI Card variant:** adds a coloured left border (4px) matching the card's semantic colour (teal for revenue, red for expired, etc.) and a large metric number with a trend indicator.

**Chart Card variant:** has a card title row with a period selector (tab group) on the right.

### 6.4 Modal

Modals are used for Add/Edit forms and destructive confirmations.

```
Overlay:   bg-gray-900/50 backdrop-blur-sm
Container: bg-white rounded-2xl shadow-2xl
Width:     max-w-lg w-full
Padding:   p-6
Animation: scale-in from 95% to 100% over 150ms
```

**Structure:**
```
┌──────────────────────────────────┐
│  Title                   [×]     │
├──────────────────────────────────┤
│                                  │
│  Form fields / content           │
│                                  │
├──────────────────────────────────┤
│         [Cancel]  [Save Changes] │
└──────────────────────────────────┘
```

- Escape key always closes
- Clicking the overlay closes (except Confirm Delete which requires explicit action)
- Focus is trapped inside the modal when open

### 6.5 Table

Data tables are the primary content unit across all list screens.

```
Container: overflow-x-auto (horizontal scroll on small screens)
Header row: bg-gray-50 text-xs uppercase font-semibold text-gray-500 tracking-wide
Body row: text-sm text-gray-700, hover:bg-gray-50 transition-colors
Row border: divide-y divide-gray-100
```

**Column alignment rules:**
- Text columns: left-aligned
- Number/currency columns: right-aligned
- Status badge columns: centred
- Action button columns: right-aligned

**Sortable columns:** Show a sort icon (↕) next to the header. Active sort shows ↑ or ↓ in teal.

**Loading skeleton:** Each cell replaced by a `bg-gray-200 animate-pulse rounded h-4` bar while fetching.

**Empty state:** Full-width centred block with icon, heading, description, and optional CTA button.

### 6.6 Form Inputs

```
Label:       text-sm font-medium text-gray-700, mb-1.5
Input base:  w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
             transition-shadow duration-150
Placeholder: text-gray-400
Error state: border-red-500 focus:ring-red-500
Error msg:   text-xs text-red-600 mt-1 (inline, below the field)
Disabled:    bg-gray-50 text-gray-400 cursor-not-allowed
```

**Select dropdowns** match the same visual spec as inputs. Use a custom caret icon.

**Date inputs** must visibly show the format hint `(YYYY-MM-DD)` in the label or placeholder.

### 6.7 Toast Notifications

Non-intrusive, auto-dismissing feedback messages.

```
Position: fixed top-4 right-4 z-50
Width: max-w-sm w-full
Stack: up to 3 toasts, oldest at top, newest at bottom
Animation: slide-in from right over 200ms, fade-out over 150ms
Auto-dismiss: 4 seconds

Variants:
  success  → border-l-4 border-green-500, bg-white
  error    → border-l-4 border-red-500, bg-white
  warning  → border-l-4 border-amber-500, bg-white
  info     → border-l-4 border-blue-500, bg-white
```

**Structure per toast:**
```
┌────────────────────────────────────┐
│ [Icon]  Message text          [×]  │
└────────────────────────────────────┘
```

### 6.8 Loading Spinner

Used in three contexts:

1. **Full page:** Centred in the content area, large (40px), teal, with "Loading…" below
2. **Inline button:** Small (16px), white, replaces button content
3. **Inline search bar:** Small (16px), teal, right side of input

```css
/* CSS ring spinner */
border: 2px solid transparent;
border-top-color: currentColor;
border-radius: 50%;
animation: spin 600ms linear infinite;
```

### 6.9 Empty State

Consistent "nothing to show" pattern.

```
Container: py-16 text-center
Icon:      48px Lucide icon, text-gray-300
Heading:   h3, text-gray-900, font-semibold, mt-4
Text:      text-sm text-gray-500, mt-2
Button:    primary, mt-6 (optional — only when action is appropriate)
```

### 6.10 Confirm Delete Modal

A specialised danger confirmation modal.

```
Title:   "Remove [Product Name]?"
Body:    "This action cannot be undone. This will permanently delete [Product Name] from your inventory."
Buttons: [Cancel] (secondary) | [Remove Product] (danger)
```

---

## 7. Page-by-Page Specifications

### 7.1 Dashboard (Priority #1)

The command centre. A pharmacist should understand their day within 30 seconds of opening this screen.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: "Dashboard"              [Run Expiry Scan ▶]               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Sales    │ │ Monthly  │ │ Pending  │ │ Expired  │ │ Low      │ │
│  │ Today    │ │ Revenue  │ │ Orders   │ │ Products │ │ Stock    │ │
│  │          │ │          │ │          │ │          │ │ Items    │ │
│  │ KES X    │ │ KES X    │ │    N     │ │    N     │ │    N     │ │
│  │ ↑ 12%    │ │ ↑ 8%     │ │ —        │ │ ↓ Action │ │ ↓ Action │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│                                                                     │
│  ┌──────────────────────────────────┐ ┌──────────────────────────┐ │
│  │  7-Day Revenue Trend             │ │  Recent Alerts           │ │
│  │  [Line Chart]                    │ │  🔴 Amoxicillin expired   │ │
│  │                                  │ │  🟠 Panadol expires 3d    │ │
│  │                                  │ │  🟡 Metformin low stock   │ │
│  │                                  │ │  [Mark All Read]         │ │
│  └──────────────────────────────────┘ └──────────────────────────┘ │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────────┤
│  │  🔍 Ask PharmaOS anything…              [Search]               │ │
│  │  Prompt Results ↓                                               │ │
│  └──────────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────────┘
```

#### KPI Card Design

Each card:
- Has a **coloured left border accent** (4px):
  - Revenue: `teal-500`
  - Pending Orders: `amber-500`
  - Expired: `red-500`
  - Low Stock: `orange-500`
- Shows a **trend row**: small arrow icon + percentage vs yesterday/last month
  - ↑ green = improving, ↓ red = worsening (except for Expired/Low Stock where ↑ is bad)
- Has a **small icon** top-right (Lucide: `TrendingUp`, `ShoppingCart`, `AlertTriangle`, `Package`)

#### Revenue Chart

- **Library:** Recharts `LineChart`
- **Height:** 280px within `ResponsiveContainer`
- **Line:** `stroke="#0D9488"` (teal-600), `strokeWidth={2}`, smooth curve (`type="monotone"`)
- **Area fill:** Light teal gradient from the line to the x-axis at 30% opacity
- **Axes:** No left axis line, only horizontal gridlines in `gray-100`
- **Tooltip:** White card with date + "KES X,XXX" formatted value

#### Alerts Panel

- Max-height: 320px with `overflow-y-auto` (scrollable internally)
- Each row: `flex items-start gap-3 py-3 border-b cursor-pointer hover:bg-gray-50`
- Icon: `🔴` (expired) / `🟠` (near_expiry) / `🟡` (low_stock)
- On row click: fade the row out, decrement the badge count
- "Mark All Read" is a ghost button at the panel footer

#### Prompt-to-Action Bar

- Full width bar with a large search input and a "Search" button
- Placeholder: `"Try: 'show expired drugs', 'low stock', 'pending orders'"`
- Results area slides down smoothly (max-height transition) when results arrive
- Result card shows: label heading, count badge, mini table or summary, "View Full List →" link

---

### 7.2 Inventory Management

The most data-dense screen. Must remain scannable and actionable.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: "Inventory"              [+ Add Product] [⬆ Import CSV]    │
├─────────────────────────────────────────────────────────────────────┤
│  [ All ] [ Active ] [ Expired ] [ Near-Expiry ] [ Low Stock ]       │
│  🔍 Search products…                                                │
├─────────────────────────────────────────────────────────────────────┤
│  Name            Category   Qty   Unit Price  Expiry      Status    │
│  ─────────────────────────────────────────────────────────────────  │
│  Amoxicillin     Antibiotic  12   KES 250     Apr 15 '26  [Active]  │
│  Panadol Extra   Analgesic    5   KES 80      Apr 5 '26   [Near ⚠] │
│  Metformin 500mg Diabetic     0   KES 120     Jun 30 '26  [OOS]    │
│  Ciprofloxacin   Antibiotic  —    KES 350     Mar 1 '26   [Expired]│
│  ...                                                 [Edit] [Delete]│
└─────────────────────────────────────────────────────────────────────┘
```

#### Filter Tabs

Tabs are pill-shaped, not underline-style:
```
Active tab: bg-teal-600 text-white
Inactive:   bg-white text-gray-600 border border-gray-200 hover:bg-gray-50
```

Each filter tab shows a count badge on the right: `[Expired (5)]`

#### Table Column Specs

| Column | Min Width | Alignment | Notes |
|---|---|---|---|
| Name | 200px | Left | Bold text, `font-medium` |
| Category | 120px | Left | `text-gray-500` |
| Qty | 80px | Right | Red if < 10, bold red if 0 |
| Unit Price | 120px | Right | Always `formatCurrency()` |
| Expiry Date | 130px | Left | `formatDate()`, red if past |
| Status | 110px | Centre | StatusPill component |
| Actions | 100px | Right | Icon buttons: pencil, trash |

#### Row Urgency Visual Cues

- **Expired rows:** Entire row has a subtle `bg-red-50` tint
- **Near-expiry rows:** Subtle `bg-amber-50` tint
- **Out of stock rows:** Text in `text-gray-400` to convey inactivity

#### Add/Edit Modal Fields

```
Product Name*         [text input                    ]
Category              [select — Antibiotics, Analgesics, Antifungals, Vitamins, Diabetic, Other]
Quantity*             [number input, min: 0           ]
Unit Price (KES)*     [number input, step: 0.01       ]
Expiry Date*          [date input, YYYY-MM-DD         ]
Supplier              [text input (optional)          ]

[Cancel]              [Save Product / Update Product  ]
```

---

### 7.3 Order Management

Clarity of flow state is the priority here — admin must know what to do next for each order.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: "Orders"                                                   │
├─────────────────────────────────────────────────────────────────────┤
│  [ All ] [ Pending (5) ] [ Processing (2) ] [ Completed ] [ Cancelled ]│
│  🔍 Search by customer name…                                        │
├─────────────────────────────────────────────────────────────────────┤
│  Customer    Phone         Product        Qty  Amount  Status  Date  Action      │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  James K.    0712 XXX XXX  Amoxicillin    2   KES 500  [Pending]  Apr 1  [Start Processing]│
│  Mary A.     0723 XXX XXX  Panadol        5   KES 400  [Processing] Apr 1 [Complete] [Cancel]│
│  John M.     0701 XXX XXX  Metformin      10  KES 1200 [Completed] Mar 31  —                │
└─────────────────────────────────────────────────────────────────────┘
```

#### Action Button Rules

Action buttons use **context-appropriate styling**:
- "Start Processing" → `secondary` button
- "Mark Complete" → `primary` button (teal)
- "Cancel" → `danger` ghost button (red text, no background)

When clicking "Mark Complete":
1. Button shows loading spinner
2. After success: row status badge updates in-place (no full reload)
3. Toast: "Order completed — inventory updated"

---

### 7.4 Analytics

Data storytelling. Must look premium — this is the investor showcase screen.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: "Analytics"                                                │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Revenue Trend          [ 7 Days ] [ 30 Days ] [ 90 Days ]   │   │
│  │  Total: KES 284,500                                           │   │
│  │  [Line Chart with gradient area fill]                          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Top Products    [By Units] [By Revenue]  [Week|Month|All]   │   │
│  │  [Horizontal Bar Chart — top 5 products]                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Chart Styling Rules

**Revenue Line Chart:**
- Line: teal-600, `strokeWidth: 2.5`
- Area gradient: `teal-600 → transparent` at 20% opacity
- Dots: appear on hover only (5px radius, teal fill)
- X-axis: dates formatted as `"Apr 1"`, no gridlines
- Y-axis: hidden label (values in tooltip only)
- Tooltip: white rounded card with bold date and `formatCurrency()` value

**Top Products Bar Chart:**
- Bars: horizontal, `fill="#0D9488"` (teal), `radius: [0, 4, 4, 0]` (rounded right end)
- Bar height: 28px, gap between bars: 12px
- Labels: product name left of bar (in Y-axis), value right of bar end
- Animate on load: bars expand from left to right over 500ms

---

### 7.5 Transactions

An audit log. Clarity and filterability are the design priorities.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: "Transaction Log"                                          │
├─────────────────────────────────────────────────────────────────────┤
│  Date Range: [Today] [This Week] [This Month]   Type: [All ▾]      │
├─────────────────────────────────────────────────────────────────────┤
│  Date/Time          Type       Product       Qty   Amount    Notes  │
│  ──────────────────────────────────────────────────────────────     │
│  Apr 1, 2026 09:15  [Sale]     Amoxicillin   2     KES 500   —     │
│  Apr 1, 2026 08:40  [Restock]  Panadol       50    KES 4000  Bulk  │
│  Mar 31, 2026 17:20 [Write-Off] Ciproflox.   5    KES 1750  Expired│
├─────────────────────────────────────────────────────────────────────┤
│  Showing 25 of 143 records | Total: KES 48,250     [← Prev] [Next →]│
└─────────────────────────────────────────────────────────────────────┘
```

---

### 7.6 CSV Import

A focused, single-task screen. Should feel safe and guided.

#### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER: "Import Products"                                          │
│  Migrate your existing inventory data in seconds.                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                                                          │       │
│  │   ⬆  Drop your CSV file here                            │       │
│  │      or  [ Browse Files ]                               │       │
│  │      Accepts: .csv, max 5MB                             │       │
│  │                                                          │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                     │
│  Expected columns: name, category, quantity, unit_price,            │
│  expiry_date (YYYY-MM-DD), supplier                                 │
│  [ Download Template CSV ]                                          │
│                                                                     │
│  ── After Upload: Preview ─────────────────────────────────         │
│  [Mini table showing first 5 rows of the CSV]                       │
│                                                                     │
│  [Cancel]                           [Confirm Import (38 rows) →]   │
│                                                                     │
│  ── After Import: Result ──────────────────────────────────         │
│  ✅ Imported:  38 products                                          │
│  ⚠️  Skipped:   2 (duplicate names)                                 │
│  ❌ Errors:    1 (row 14: invalid expiry date format)               │
│  [Download Error Report]                                            │
└─────────────────────────────────────────────────────────────────────┘
```

#### Drag-and-Drop Zone Styling

```css
/* Idle */
border: 2px dashed gray-200;
border-radius: 12px;
background: gray-50;
padding: 48px 24px;

/* Drag-over state */
border-color: teal-400;
background: teal-50;
```

---

## 8. Motion & Animation

All animations must have a purpose: confirm an action, guide attention, or signal a state change.

### Principles

1. **Fast and subtle** — nothing over 300ms for UI transitions
2. **Easing** — always use `ease-out` for entrances, `ease-in` for exits
3. **Never decorative** — every animation carries meaning

### Animation Catalogue

| Interaction | Animation | Duration | Easing |
|---|---|---|---|
| Modal open | Scale from 95% to 100% + fade in | 150ms | ease-out |
| Modal close | Scale from 100% to 95% + fade out | 100ms | ease-in |
| Toast enter | Slide in from right (translateX: 48px → 0) + fade | 200ms | ease-out |
| Toast exit | Fade out | 150ms | ease-in |
| Page transition | Fade in (opacity: 0 → 1) | 150ms | ease-out |
| Dropdown open | Scale from 95% + fade | 100ms | ease-out |
| Row hover | `bg-gray-50` background transition | 100ms | - |
| Button hover | Background colour transition | 150ms | - |
| Badge count update | Scale bounce (1 → 1.2 → 1) | 300ms | ease-out |
| Chart load | Bars/lines draw in from origin | 500ms | ease-out |
| Prompt results reveal | max-height expand from 0 | 200ms | ease-out |
| Alert mark-read | Opacity fade + shrink height | 200ms | ease-in |
| Scan button loading | Spinner rotation | continuous | linear |

### CSS Custom Properties for Timing

```css
:root {
  --duration-fast:   100ms;
  --duration-base:   150ms;
  --duration-slow:   300ms;
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in:  cubic-bezier(0.4, 0, 1, 1);
}
```

---

## 9. Iconography

**Library:** Lucide React (consistent stroke-based icon set)

### Icon Usage Map

| Context | Icon Name | Size |
|---|---|---|
| Sidebar: Dashboard | `LayoutDashboard` | 20px |
| Sidebar: Inventory | `Package` | 20px |
| Sidebar: Orders | `ShoppingCart` | 20px |
| Sidebar: Analytics | `BarChart2` | 20px |
| Sidebar: Transactions | `Receipt` | 20px |
| Sidebar: Import | `Upload` | 20px |
| KPI: Revenue | `TrendingUp` | 20px |
| KPI: Pending | `Clock` | 20px |
| KPI: Expired | `AlertTriangle` | 20px |
| KPI: Low Stock | `AlertCircle` | 20px |
| Alert: Expired | `XCircle` | 16px (red) |
| Alert: Near-Expiry | `Clock` | 16px (amber) |
| Alert: Low Stock | `AlertCircle` | 16px (yellow) |
| Action: Edit | `Pencil` | 16px |
| Action: Delete | `Trash2` | 16px |
| Action: Search | `Search` | 16px |
| Action: Close | `X` | 16px |
| Status: Up trend | `TrendingUp` | 14px (green) |
| Status: Down trend | `TrendingDown` | 14px (red) |
| CSV upload area | `UploadCloud` | 40px (gray-300) |
| Empty states | Context-appropriate | 48px (gray-300) |

### Icon Rules

- Never mix icon libraries on the same screen
- All icons use `currentColor` for colour inheritance
- Minimum touch target for icon-only buttons: 32px × 32px
- Add `aria-label` to all icon-only buttons

---

## 10. Responsive Design

PharmaOS is a desktop-first internal tool. Minimum supported viewport: **768px**.

### Breakpoints

| Breakpoint | Width | Layout Behaviour |
|---|---|---|
| `sm` (tablet) | 768px | Sidebar collapses to icon-only (64px); 2-col KPI grid |
| `md` | 1024px | Sidebar expands; 3-col KPI grid |
| `lg` (default) | 1280px | Full layout; 5-col KPI grid; two-column dashboard bottom |
| `xl` | 1536px | Content max-width 1280px, centred |

### Tablet Adaptations (768px – 1023px)

- Sidebar: collapses to 64px; only icons shown; tooltip on hover shows label
- KPI cards: 2 per row
- Dashboard bottom section: stacks vertically (chart above, alerts below)
- Tables: horizontal scroll on overflow; most columns still visible
- Modals: full-width on very small tablet (95vw max-width)

### Overflow Handling

All tables must be wrapped in:
```jsx
<div className="overflow-x-auto rounded-xl border border-gray-200">
  <table className="min-w-full divide-y divide-gray-100">
```

Never truncate currency or product names without a tooltip on hover.

---

## 11. Accessibility

PharmaOS targets **WCAG 2.1 Level AA** compliance where feasible.

### Colour Contrast

| Text / Background | Contrast Ratio | Pass? |
|---|---|---|
| `gray-700` on `white` | 8.6:1 | ✅ AA |
| `teal-white` button text | 4.7:1 | ✅ AA |
| `red-800` on `red-100` badge | 5.5:1 | ✅ AA |
| `gray-500` placeholder | 4.6:1 | ✅ AA |

### Keyboard Navigation

- All interactive elements reachable by `Tab`
- Modals trap focus within when open
- `Escape` closes modals and dropdowns
- Filter tabs navigable with `Arrow` keys
- Form submission on `Enter`
- Action buttons reachable without mouse

### Semantic HTML

```html
<!-- Page structure -->
<nav>      ← Sidebar
<main>     ← Content area
<header>   ← Page header bar
<section>  ← Logical content sections (KPI row, chart section)
<table>    ← All data tables (never divs)
<thead> <tbody> <tr> <th scope="col"> <td>
<dialog>   ← Modals (with role="dialog" aria-modal="true")
<button>   ← All interactive controls (never <div onClick>)
```

### Screen Reader Support

```html
<!-- Badge counts -->
<span aria-label="5 unread alerts">5</span>

<!-- Loading states -->
<div role="status" aria-live="polite">Loading products...</div>

<!-- Toast messages -->
<div role="alert" aria-live="assertive">Product added successfully</div>

<!-- Icon-only buttons -->
<button aria-label="Edit Amoxicillin">
  <PencilIcon />
</button>
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Design Tokens Reference

Complete Tailwind config additions for the PharmaOS design system:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
      },
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
      },
      animation: {
        'spin-fast': 'spin 600ms linear infinite',
        'fade-in':   'fadeIn 150ms ease-out',
        'slide-in':  'slideIn 200ms ease-out',
        'scale-in':  'scaleIn 150ms ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(48px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
```

---

## 13. Investor-Facing Presentation Notes

> This section helps team members frame the PharmaOS design when presenting to investors, judges, or evaluators.

### Why This Design Wins

PharmaOS is not a student project with a generic admin template. It is a **domain-specific, professional-grade** healthcare SaaS UI built with intent. Here's the story to tell:

#### 1. The 30-Second Insight Promise

> *"A pharmacist opens the dashboard and within 30 seconds knows: how much money was made today, how many orders need attention, what drugs are expiring, and what's running out of stock — without clicking anything or reading documentation. That's the design promise, and every visual decision serves it."*

#### 2. Colour as a Safety System

> *"We use colour not for aesthetics, but as a safety protocol. Red means action required: expired drugs that cannot be dispensed. Amber means warning: stock expiring this week. Green means healthy. This mirrors clinical safety colour conventions pharmacists already understand, reducing training time to zero."*

#### 3. The KPI Card Architecture

> *"Each KPI card has been designed to answer one question and one question only. We resist the temptation to pack them with information. The moment each card tells two stories, it tells neither. Simple number, context label, trend direction — that's it."*

#### 4. Design Signals Production Readiness

> *"Investors evaluate a product's maturity through its design. Loading states, error states, empty states, confirmation dialogs for destructive actions, toast feedback, live data — these signal that PharmaOS is built for real users in real environments, not just demonstrations."*

#### 5. Market Fit Through Familiarity

> *"The sidebar-first layout, the data table interaction patterns, the filter tab style — these are the conventions of enterprise SaaS tools that pharmacy staff have encountered in other modern software. We're not asking users to learn a new paradigm. We're meeting them where they are."*

### Talking Points for the Demo

When walking stakeholders through the dashboard:

1. **Open the dashboard** — pause 10 seconds — "Before we do anything, you can already see that we have 3 pending orders, 2 expired products, and today's revenue is KES 12,400. That's the promise delivered."

2. **Click an expired product alert** — "Notice the badge counts down. The system remembers what you've seen. You're not managing notifications — you're managing your pharmacy."

3. **Run the expiry scan** — "This is the engine. Every night at midnight, PharmaOS scans every product in inventory. If something has crossed its expiry date, it gets flagged automatically. No manual check needed. In a 200-drug inventory, that's the difference between patient safety and patient risk."

4. **Complete an order** — "Watch what happens when we mark this complete. The order closes, the inventory decrements, a transaction record is written, and if we've just crossed the low-stock threshold, an alert fires. Four database operations in one atomic commit. That's production-grade engineering."

5. **Type in the prompt bar: "show expired drugs"** — "Natural language queries. No navigation required. A pharmacist who just wants to know what's expired types a question and gets an answer."

---

### Visual Hierarchy Summary

```
Hierarchy Level 1 — Immediate Read (< 3 seconds):
  KPI numbers, status badge colours, alert icons

Hierarchy Level 2 — Contextual Read (< 10 seconds):
  KPI labels, chart shapes and trends, alert messages

Hierarchy Level 3 — Detailed Read (on demand):
  Table rows, filter tabs, modal forms, transaction details
```

Every design decision in PharmaOS serves one of these three hierarchy levels. Nothing exists for decoration.

---

*PharmaOS Design Specification v1.0 — Tech Vanguard — April 1, 2026*  
*Authors: Victor Chogo (Tech Lead) · Lynn Gathoni (Frontend Lead)*
