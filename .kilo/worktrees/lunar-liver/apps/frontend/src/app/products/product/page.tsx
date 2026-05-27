import { useState } from "react";
import { useParams, useNavigate, NavLink } from "react-router-dom";
import { CART_URL, PRODUCTLIST_URL } from "../../../utils";
import { useCart } from '../../../context/CartContext';
import { useToast } from '../../../context/ToastContext';

// ── Mock product data (replace with real API call later) ──────────────────────
const MOCK_PRODUCTS = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    brand: "PharmX Generic",
    category: "Pain Relief",
    price:499,
    originalPrice: 649,
    availability: "In Stock",
    availabilityCount: 142,
    image: null,
    description:
      "Paracetamol 500mg tablets are used for the relief of mild to moderate pain including headache, migraine, nerve pain, toothache, sore throat, period pain, and general aches. Also effective for reducing fever.",
    usage:
      "Adults and children 12 years and over: Take 1–2 tablets every 4–6 hours as needed. Do not take more than 8 tablets in 24 hours. Not suitable for children under 12.",
    warnings: [
      "Do not exceed the recommended dose.",
      "Keep out of reach of children.",
      "Avoid alcohol while taking this medication.",
      "Consult a doctor if symptoms persist beyond 3 days.",
    ],
    tags: ["OTC", "Tablet", "Analgesic"],
    relatedIds: ["2", "3"],
  },
  {
    id: "2",
    name: "Vitamin C 1000mg",
    brand: "NutriShield",
    category: "Vitamins & Supplements",
    price: 899,
    originalPrice: null,
    availability: "In Stock",
    availabilityCount: 88,
    image: null,
    description:
      "High-strength Vitamin C supplement to support immune function, collagen synthesis, and antioxidant protection. Effervescent tablet format for fast absorption.",
    usage:
      "Dissolve one tablet in a glass of water once daily, preferably with a meal.",
    warnings: [
      "Do not exceed the stated dose.",
      "Not a substitute for a balanced diet.",
      "Consult a doctor if pregnant or breastfeeding.",
    ],
    tags: ["Supplement", "Effervescent", "Immune Support"],
    relatedIds: ["1", "3"],
  },
  {
    id: "3",
    name: "Ibuprofen 400mg",
    brand: "PharmX Generic",
    category: "Pain Relief",
    price: 549,
    originalPrice: 749,
    availability: "Low Stock",
    availabilityCount: 12,
    image: null,
    description:
      "Ibuprofen 400mg is a non-steroidal anti-inflammatory drug (NSAID) used to relieve pain, reduce inflammation, and lower fever.",
    usage:
      "Adults: Take 1 tablet 3 times a day. Take with or after food. Do not use for more than 10 days without medical advice.",
    warnings: [
      "Not suitable for people with stomach ulcers.",
      "Avoid if allergic to aspirin or other NSAIDs.",
      "Consult a doctor before use if pregnant.",
      "Keep out of reach of children.",
    ],
    tags: ["OTC", "Tablet", "Anti-inflammatory"],
    relatedIds: ["1", "2"],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getProduct(id: string) {
  return MOCK_PRODUCTS.find((p) => p.id === id) ?? null;
}

function getRelated(ids: string[]) {
  return MOCK_PRODUCTS.filter((p) => ids.includes(p.id));
}

// ── Sub-components ────────────────────────────────────────────────────────────
function ProductImagePlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-slate-100">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100 text-2xl font-semibold text-teal-600">
        {initials}
      </div>
      <span className="text-xs text-slate-400">No image available</span>
    </div>
  );
}

function AvailabilityBadge({
  status,
  count,
}: {
  status: string;
  count: number;
}) {
  const isLow = status === "Low Stock";
  const isOut = status === "Out of Stock";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
        isOut
          ? "bg-red-50 text-red-600"
          : isLow
          ? "bg-amber-50 text-amber-600"
          : "bg-teal-50 text-teal-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isOut ? "bg-red-500" : isLow ? "bg-amber-500" : "bg-teal-500"
        }`}
      />
      {status}
      {!isOut && (
        <span className="text-slate-400 font-normal">· {count} units</span>
      )}
    </span>
  );
}

function TabPanel({
  active,
  id,
  children,
}: {
  active: boolean;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div role="tabpanel" id={id} hidden={!active} className="pt-5">
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { addToast } = useToast();

  const product = getProduct(id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "usage" | "warnings">("description");
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Not found ──
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Product not found</h2>
        <p className="text-sm text-slate-500">This product may have been removed or the link is invalid.</p>
        <NavLink
          to={PRODUCTLIST_URL}
          className="mt-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors"
        >
          Back to Products
        </NavLink>
      </div>
    );
  }

  const related = getRelated(product.relatedIds);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = () => {
    console.log('handleAddToCart called');
    
    // Determine stock status based on availability
    const stockStatus = product.availability === "Out of Stock" ? "out_of_stock" : 
                        product.availability === "Low Stock" ? "low_stock" : "in_stock";
    
    // Determine image type based on tags
    let imageType: "capsule" | "tablet" | "syrup" | "supplement" = "tablet";
    if (product.tags.includes("Tablet")) imageType = "tablet";
    else if (product.tags.includes("Supplement")) imageType = "supplement";
    else if (product.tags.includes("Effervescent")) imageType = "syrup";
    else imageType = "capsule";

    console.log('Adding item to cart:', { name: product.name, quantity, stockStatus });

    addItem({
      name: product.name,
      category: product.category,
      brand: product.brand,
      packSize: "1 pack", // Default pack size
      unitPrice: product.price,
      quantity: quantity,
      requiresPrescription: false, // Default to false, can be updated based on product data
      stockStatus: stockStatus,
      stockCount: product.availabilityCount,
      imageType: imageType,
      image: product.image || undefined,
    });

    // Show success toast
    console.log('Calling addToast');
    addToast({
      type: 'success',
      message: `${quantity} × ${product.name} added to cart!`,
      duration: 3000
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const tabs = [
    { id: "description" as const, label: "Description" },
    { id: "usage" as const, label: "Usage" },
    { id: "warnings" as const, label: "Warnings" },
  ];

  return (
    <div className="space-y-10">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-sm text-slate-500">
        <NavLink to="/" className="hover:text-teal-700 transition-colors">Home</NavLink>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <NavLink to={PRODUCTLIST_URL} className="hover:text-teal-700 transition-colors">Products</NavLink>
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-teal-700 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">

        {/* Left — Image */}
        <div className="space-y-3">
          <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            {product.image ? (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <ProductImagePlaceholder name={product.name} />
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs text-teal-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right — Info */}
        <div className="flex flex-col gap-5">

          {/* Category + Availability */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
              {product.category}
            </span>
            <AvailabilityBadge status={product.availability} count={product.availabilityCount} />
          </div>

          {/* Name & Brand */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{product.name}</h1>
            <p className="mt-1 text-sm text-slate-500">by {product.brand}</p>
          </div>

          {/* Price */}
          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold text-teal-700">
              KSh {product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-base text-slate-400 line-through">
                  KSh {product.originalPrice.toFixed(2)}
                </span>
                <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-700">
                  -{discount}%
                </span>
              </>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Quantity selector */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Quantity</span>
            <div className="flex items-center rounded-lg border border-slate-200 bg-white">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center text-teal-700 hover:bg-teal-50 rounded-l-lg transition-colors"
                aria-label="Decrease quantity"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-10 text-center text-sm font-semibold text-teal-700">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center text-teal-700 hover:bg-teal-50 rounded-r-lg transition-colors"
                aria-label="Increase quantity"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={product.availability === "Out of Stock"}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                addedToCart
                  ? "bg-teal-500 text-white"
                  : product.availability === "Out of Stock"
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-teal-700 text-white hover:bg-teal-800"
              }`}
            >
              {addedToCart ? (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added to Cart
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 8a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                  Add to Cart
                </>
              )}
            </button>

            <button
              onClick={() => navigate(CART_URL)}
              disabled={product.availability === "Out of Stock"}
              className="flex flex-1 items-center justify-center rounded-xl border border-teal-700 bg-white px-6 py-3 text-sm font-semibold text-teal-700 transition-colors hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Buy Now
            </button>
          </div>

          {/* Trust chips */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            {[
              { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "Verified Medicine" },
              { icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4", label: "Secure Packaging" },
              { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", label: "Fast Delivery" },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-teal-100 bg-teal-50 p-3 text-center">
                <svg className="h-5 w-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} />
                </svg>
                <span className="text-xs text-teal-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        {/* Tab list */}
        <div role="tablist" className="flex border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-teal-700 text-teal-700"
                  : "border-transparent text-slate-500 hover:text-teal-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          <TabPanel active={activeTab === "description"} id="tab-description">
            <p className="text-sm leading-relaxed text-slate-600">{product.description}</p>
          </TabPanel>

          <TabPanel active={activeTab === "usage"} id="tab-usage">
            <p className="text-sm leading-relaxed text-slate-600">{product.usage}</p>
          </TabPanel>

          <TabPanel active={activeTab === "warnings"} id="tab-warnings">
            <ul className="space-y-2">
              {product.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {w}
                </li>
              ))}
            </ul>
          </TabPanel>
        </div>
      </div>

      {/* ── Related Products ── */}
      {related.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900">Related Products</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <NavLink
                key={p.id}
                to={`${PRODUCTLIST_URL}/${p.id}`}
                className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md hover:border-teal-200"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                  <span className="text-sm font-semibold text-teal-600">
                    {p.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 group-hover:text-teal-700">
                    {p.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{p.category}</p>
                  <p className="mt-1.5 text-sm font-semibold text-teal-700">
                    KSh {p.price.toFixed(2)}
                  </p>
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
