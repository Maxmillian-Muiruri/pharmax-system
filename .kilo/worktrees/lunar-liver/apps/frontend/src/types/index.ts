export type TNodeChildrentType = {
  children?: React.ReactNode;
};

export type TAppContextType = {};

export type Product = {
  id: string | number;
  name: string;
  image: string;
  category: string;
  use?: string;
  rating: number;
  price: number;
  discount?: number; 
  originalPrice?: number; 
  stock?: boolean;
  description?: string;
  reviewCount?: number;
  inStock?: boolean;
  stockStatus?: "in-stock" | "low-stock" | "out-of-stock";
};

export type PrescriptionStatus =
  | "under_review"
  | "available"
  | "out_of_stock"
  | "rejected";

export type PrescriptionFile = {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
};

export type PrescriptionRequest = {
  id: string;
  userId?: string;
  patientName: string;
  phoneNumber: string;
  email: string;
  doctorName: string;
  hospitalName: string;
  address: string;
  notes: string;
  createdAt: string;
  reviewedAt: string | null;
  status: PrescriptionStatus;
  estimatedPrice: number | null;
  reviewNotes: string;
  files: PrescriptionFile[];
};

export type StoredOrderItem = {
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export type StoredOrder = {
  id: string;
  userId?: string;
  date: string;
  items: StoredOrderItem[];
  total: number;
  estimatedDelivery: string;
  status: "Processing" | "In Progress" | "On the Way" | "Delivered" | "Cancelled" | "Confirmed";
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: string | null;
  transactionId: string;
  isPrescriptionOrder?: boolean;
  prescriptionId?: string | null;
};
