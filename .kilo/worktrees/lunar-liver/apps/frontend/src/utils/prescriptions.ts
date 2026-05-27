import type { PrescriptionFile, PrescriptionRequest, PrescriptionStatus, StoredOrder } from "../types";

const PRESCRIPTIONS_STORAGE_KEY = "pharmx_prescriptions";
const PRESCRIPTION_CHECKOUT_KEY = "pharmx_checkout_prescription_id";
const ORDERS_STORAGE_KEY = "pharmx_orders";
const PRESCRIPTIONS_EVENT = "pharmx:prescriptions-updated";
const ORDERS_EVENT = "pharmx:orders-updated";

function dispatchUpdate(eventName: string) {
  window.dispatchEvent(new Event(eventName));
}

export function createPrescriptionId() {
  return "RX-" + Date.now().toString().slice(-6);
}

export function getPrescriptionUpdateEventName() {
  return PRESCRIPTIONS_EVENT;
}

export function getOrdersUpdateEventName() {
  return ORDERS_EVENT;
}

export function getStoredPrescriptions(): PrescriptionRequest[] {
  const raw = localStorage.getItem(PRESCRIPTIONS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as PrescriptionRequest[];
    return parsed.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}

export function saveStoredPrescriptions(items: PrescriptionRequest[]) {
  localStorage.setItem(PRESCRIPTIONS_STORAGE_KEY, JSON.stringify(items));
  dispatchUpdate(PRESCRIPTIONS_EVENT);
}

export function addPrescription(item: PrescriptionRequest) {
  const next = [item, ...getStoredPrescriptions()];
  saveStoredPrescriptions(next);
}

export function updatePrescription(
  id: string,
  updates: Partial<PrescriptionRequest>,
) {
  const next = getStoredPrescriptions().map((item) =>
    item.id === id ? { ...item, ...updates } : item,
  );
  saveStoredPrescriptions(next);
}

export function getPrescriptionById(id: string | null) {
  if (!id) return null;
  return getStoredPrescriptions().find((item) => item.id === id) ?? null;
}

export function setCheckoutPrescriptionId(id: string) {
  localStorage.setItem(PRESCRIPTION_CHECKOUT_KEY, id);
}

export function getCheckoutPrescriptionId() {
  return localStorage.getItem(PRESCRIPTION_CHECKOUT_KEY);
}

export function clearCheckoutPrescriptionId() {
  localStorage.removeItem(PRESCRIPTION_CHECKOUT_KEY);
}

export function saveOrder(order: StoredOrder) {
  const next = [order, ...getStoredOrders()];
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
  dispatchUpdate(ORDERS_EVENT);
}

export function getStoredOrders(): StoredOrder[] {
  const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
  if (!raw) return [];

  try {
    return JSON.parse(raw) as StoredOrder[];
  } catch {
    return [];
  }
}

export function getStoredOrderById(id: string | undefined) {
  if (!id) return null;
  return getStoredOrders().find((item) => item.id === id) ?? null;
}

export function getPrescriptionStatusMeta(status: PrescriptionStatus) {
  const statusMap: Record<
    PrescriptionStatus,
    { label: string; bg: string; color: string; border: string }
  > = {
    under_review: {
      label: "Under Review",
      bg: "#fef3c7",
      color: "#a16207",
      border: "#fcd34d",
    },
    available: {
      label: "Available",
      bg: "#dcfce7",
      color: "#15803d",
      border: "#86efac",
    },
    out_of_stock: {
      label: "Out of Stock",
      bg: "#ffedd5",
      color: "#c2410c",
      border: "#fdba74",
    },
    rejected: {
      label: "Rejected",
      bg: "#fee2e2",
      color: "#dc2626",
      border: "#fca5a5",
    },
  };

  return statusMap[status];
}

export function readFilesAsDataUrls(files: File[]) {
  return Promise.all(
    files.map(
      (file) =>
        new Promise<PrescriptionFile>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve({
              name: file.name,
              size: file.size,
              type: file.type,
              dataUrl: String(reader.result ?? ""),
            });
          reader.readAsDataURL(file);
        }),
    ),
  );
}

export function simulatePrescriptionReview(id: string) {
  window.setTimeout(() => {
    const current = getPrescriptionById(id);
    if (!current || current.status !== "under_review") {
      return;
    }

    const rand = Math.random();
    let status: PrescriptionStatus = "available";
    let reviewNotes =
      "Your prescription has been verified and the requested medicines are available.";
    let estimatedPrice: number | null = Number((Math.random() * 2800 + 700).toFixed(2));

    if (rand < 0.05) {
      status = "rejected";
      reviewNotes =
        "We could not verify this prescription. Please upload a clearer or more recent copy.";
      estimatedPrice = null;
    } else if (rand < 0.2) {
      status = "out_of_stock";
      reviewNotes =
        "The prescription looks valid, but one or more medicines are currently out of stock.";
      estimatedPrice = null;
    }

    updatePrescription(id, {
      status,
      reviewNotes,
      estimatedPrice,
      reviewedAt: new Date().toISOString(),
    });
  }, 5000);
}
