import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  getCheckoutPrescriptionId,
  getPrescriptionById,
  getPrescriptionStatusMeta,
  getPrescriptionUpdateEventName,
  getStoredPrescriptions,
  setCheckoutPrescriptionId,
} from "../../utils/prescriptions";
import { CHECKOUT_URL, PRESCRIPTION_URL } from "../../utils";
import type { PrescriptionFile, PrescriptionRequest } from "../../types";

export const MyPrescriptions = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState<PrescriptionRequest[]>([]);
  const [preview, setPreview] = useState<PrescriptionFile | null>(null);
  const [activeCheckoutId, setActiveCheckoutId] = useState<string | null>(getCheckoutPrescriptionId());

  useEffect(() => {
    const load = () => {
      const userJson = localStorage.getItem('pharmacie_user');
      const userObj = userJson ? JSON.parse(userJson) : null;
      const currentUserId = userObj?.userId || null;

      const allPrescriptions = getStoredPrescriptions();
      const userPrescriptions = allPrescriptions.filter(p => 
        p.userId && p.userId === currentUserId
      );
      
      setItems(userPrescriptions);
      const currentCheckoutId = getCheckoutPrescriptionId();
      setActiveCheckoutId(
        currentCheckoutId && getPrescriptionById(currentCheckoutId)?.status === "available"
          ? currentCheckoutId
          : null,
      );
    };

    load();
    const eventName = getPrescriptionUpdateEventName();
    window.addEventListener(eventName, load);
    return () => window.removeEventListener(eventName, load);
  }, []);

  const handleCheckout = (id: string) => {
    setCheckoutPrescriptionId(id);
    setActiveCheckoutId(id);
    addToast({
      type: "success",
      message: "Prescription is ready. Continue to checkout.",
      duration: 2500,
    });
    navigate(CHECKOUT_URL);
  };

  return (
    <div
      style={{
        maxWidth: 980,
        margin: "0 auto",
        padding: "1.5rem 1rem 2.5rem",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#0d4f5c",
              marginBottom: 6,
            }}
          >
            My Prescriptions
          </h1>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 650 }}>
            Track each uploaded prescription, view pharmacist notes, and continue to payment once
            the medicines are confirmed as available.
          </p>
        </div>

        <button
          onClick={() => navigate(PRESCRIPTION_URL)}
          style={{
            height: 44,
            border: "none",
            borderRadius: 12,
            background: "#0d4f5c",
            color: "#fff",
            padding: "0 18px",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Sora', sans-serif",
            cursor: "pointer",
          }}
        >
          Upload New Prescription
        </button>
      </div>

      {items.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: "2.5rem 1.5rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "#ecfeff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0d4f5c" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <h2
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#12251e",
              marginBottom: 6,
            }}
          >
            No prescriptions yet
          </h2>
          <p style={{ fontSize: 14, color: "#64748b", marginBottom: 18 }}>
            Upload a hospital or clinic prescription and we&apos;ll review stock availability for you.
          </p>
          <button
            onClick={() => navigate(PRESCRIPTION_URL)}
            style={{
              height: 44,
              border: "none",
              borderRadius: 12,
              background: "#0d4f5c",
              color: "#fff",
              padding: "0 18px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Sora', sans-serif",
              cursor: "pointer",
            }}
          >
            Upload Prescription
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {items.map((item) => (
            <PrescriptionCard
              key={item.id}
              item={item}
              previewFile={setPreview}
              activeCheckoutId={activeCheckoutId}
              onCheckout={handleCheckout}
              onReupload={() => navigate(PRESCRIPTION_URL)}
            />
          ))}
        </div>
      )}

      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 80,
            padding: 20,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 18,
              width: "min(920px, 100%)",
              maxHeight: "88vh",
              overflow: "auto",
              padding: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#12251e" }}>{preview.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{preview.type || "Uploaded file"}</div>
              </div>
              <button
                onClick={() => setPreview(null)}
                style={{
                  border: "none",
                  background: "#f1f5f9",
                  color: "#0f172a",
                  borderRadius: 999,
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ×
              </button>
            </div>
            {preview.type === "application/pdf" ? (
              <iframe
                title={preview.name}
                src={preview.dataUrl}
                style={{ width: "100%", height: "70vh", border: "none", borderRadius: 12 }}
              />
            ) : (
              <img
                src={preview.dataUrl}
                alt={preview.name}
                style={{ width: "100%", maxHeight: "72vh", objectFit: "contain", borderRadius: 12 }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function PrescriptionCard({
  item,
  previewFile,
  activeCheckoutId,
  onCheckout,
  onReupload,
}: {
  item: PrescriptionRequest;
  previewFile: (file: PrescriptionFile) => void;
  activeCheckoutId: string | null;
  onCheckout: (id: string) => void;
  onReupload: () => void;
}) {
  const status = getPrescriptionStatusMeta(item.status);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 14px 32px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          padding: "1rem 1.25rem",
          background: "linear-gradient(180deg, #f8fafc, #ffffff)",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Prescription ID</div>
          <div
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 19,
              fontWeight: 700,
              color: "#0d4f5c",
              marginBottom: 4,
            }}
          >
            {item.id}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>{formatDate(item.createdAt)}</div>
        </div>

        <div
          style={{
            alignSelf: "flex-start",
            background: status.bg,
            border: `1px solid ${status.border}`,
            color: status.color,
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {status.label}
        </div>
      </div>

      <div style={{ padding: "1.25rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginBottom: 18,
          }}
        >
          <InfoBlock
            title="Patient Information"
            rows={[
              ["Name", item.patientName],
              ["Phone", item.phoneNumber],
              ["Email", item.email],
              ["Hospital", item.hospitalName || "Not provided"],
            ]}
          />

          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                color: "#64748b",
                marginBottom: 10,
                fontWeight: 700,
              }}
            >
              Uploaded Files
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {item.files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 12px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#12251e" }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                  <button
                    onClick={() => previewFile(file)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#0d4f5c",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {item.reviewNotes && (
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 14,
              padding: "0.9rem 1rem",
              marginBottom: 18,
            }}
          >
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".08em",
                color: "#1d4ed8",
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              Pharmacist Notes
            </div>
            <p style={{ fontSize: 13, color: "#1e3a8a", marginBottom: item.estimatedPrice ? 10 : 0 }}>
              {item.reviewNotes}
            </p>
            {item.estimatedPrice ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  borderRadius: 999,
                  background: "#dbeafe",
                  color: "#0d4f5c",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Estimated Price: KES {item.estimatedPrice.toFixed(2)}
              </div>
            ) : null}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {item.status === "under_review" ? (
            <WaitingPill />
          ) : null}

          {item.status === "available" ? (
            <button
              onClick={() => onCheckout(item.id)}
              style={{
                border: "none",
                background:
                  activeCheckoutId === item.id
                    ? "linear-gradient(135deg, #15803d, #22c55e)"
                    : "linear-gradient(135deg, #0d4f5c, #1f7a8c)",
                color: "#fff",
                borderRadius: 12,
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Sora', sans-serif",
                cursor: "pointer",
              }}
            >
              {activeCheckoutId === item.id ? "Ready for Checkout" : "Proceed to Payment"}
            </button>
          ) : null}

          {item.status === "out_of_stock" ? (
            <InfoMessage message="We’ll let you know once the requested medicines are available again." color="#c2410c" bg="#fff7ed" border="#fdba74" />
          ) : null}

          {item.status === "rejected" ? (
            <button
              onClick={onReupload}
              style={{
                border: "1px solid #fca5a5",
                background: "#fff1f2",
                color: "#dc2626",
                borderRadius: 12,
                padding: "12px 18px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Sora', sans-serif",
                cursor: "pointer",
              }}
            >
              Upload New Prescription
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color: "#64748b",
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        {title}
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, color: "#12251e", fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WaitingPill() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "#fffbeb",
        border: "1px solid #fcd34d",
        color: "#a16207",
        borderRadius: 12,
        padding: "11px 14px",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "#f59e0b",
          animation: "pharmxPulse 1.2s ease-in-out infinite",
        }}
      />
      Waiting for pharmacist review...
      <style>{`
        @keyframes pharmxPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

function InfoMessage({
  message,
  color,
  bg,
  border,
}: {
  message: string;
  color: string;
  bg: string;
  border: string;
}) {
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
        borderRadius: 12,
        padding: "11px 14px",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-KE", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default MyPrescriptions;
