export const ROOT_URL_PREFIX = "/";

export const AUTH_URL_PREFIX = "/auth";

export const LOGIN_URL = "/signin";

export const SIGNUP_URL = `${AUTH_URL_PREFIX}/signup`;

export const PRODUCTLIST_URL = "/products";

export const PRODUCTDETAIL_URL = "/products/:id";

export const CHECKOUT_URL = "/checkout";

export const PRESCRIPTION_URL = "/prescription";

export const PRESCRIPTIONS_URL = "/prescriptions";

export const PROFILE_URL = "/profile";

export const ORDERS_URL = "/orders";

export const ORDERDETAIL_URL = "/orders/:id";

export const TRACK_URL = "/track";

export const TRACK_ORDER_URL = "/track/:id";

export const CART_URL = "/cart";

export const navLinks = [
  { to: ROOT_URL_PREFIX, label: "Home" },
  { to: PRODUCTLIST_URL, label: "Products" },
  { to: PRESCRIPTION_URL, label: "Upload Prescription" },
  { to: PRESCRIPTIONS_URL, label: "My Prescriptions" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: ORDERS_URL, label: "My Orders" },
  { to: TRACK_URL, label: "Track Order" },
  { to: CART_URL, label: "Cart" },
];
