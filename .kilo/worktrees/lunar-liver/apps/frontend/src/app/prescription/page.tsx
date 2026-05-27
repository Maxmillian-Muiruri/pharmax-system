import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  addPrescription,
  createPrescriptionId,
  readFilesAsDataUrls,
  simulatePrescriptionReview,
} from "../../utils/prescriptions";
import { PRESCRIPTIONS_URL } from "../../utils";
import type { PrescriptionRequest } from "../../types";

type PrescriptionForm = Omit<
  PrescriptionRequest,
  | "id"
  | "createdAt"
  | "reviewedAt"
  | "status"
  | "estimatedPrice"
  | "reviewNotes"
  | "files"
>;

const initialForm: PrescriptionForm = {
  patientName: "",
  phoneNumber: "",
  email: "",
  doctorName: "",
  hospitalName: "",
  address: "",
  notes: "",
};

export const UploadPrescription = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<PrescriptionForm>(initialForm);

  const setField =
    (key: keyof PrescriptionForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFiles = Array.from(event.target.files ?? []);
    if (!nextFiles.length) return;

    setFiles((prev) => [...prev, ...nextFiles]);
    addToast({
      type: "success",
      message: `${nextFiles.length} file${nextFiles.length > 1 ? "s" : ""} added.`,
      duration: 2500,
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!files.length) {
      addToast({
        type: "error",
        message: "Please upload at least one prescription file.",
        duration: 3500,
      });
      return;
    }

    try {
      setSubmitting(true);
      const storedFiles = await readFilesAsDataUrls(files);
      const userJson = localStorage.getItem('pharmacie_user');
      const userObj = userJson ? JSON.parse(userJson) : null;
      const userId = userObj?.userId || null;

      const prescription: PrescriptionRequest = {
        id: createPrescriptionId(),
        userId,
        ...form,
        files: storedFiles,
        createdAt: new Date().toISOString(),
        reviewedAt: null,
        status: "under_review",
        estimatedPrice: null,
        reviewNotes: "",
      };

      addPrescription(prescription);
      simulatePrescriptionReview(prescription.id);

      addToast({
        type: "success",
        message: "Prescription submitted. Our pharmacist is reviewing it now.",
        duration: 3500,
      });
      navigate(PRESCRIPTIONS_URL);
    } catch {
      addToast({
        type: "error",
        message: "We could not upload your prescription. Please try again.",
        duration: 3500,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1160,
        margin: "0 auto",
        padding: "1.5rem 1rem 2.5rem",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#64748b",
            fontSize: 13,
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <h1
          style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: "#0d4f5c",
            marginBottom: 6,
          }}
        >
          Upload Prescription
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", maxWidth: 680 }}>
          Send us the prescription you got from your hospital or clinic and we&apos;ll confirm
          whether the medicines are available before you pay.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 320px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 16,
              padding: "1rem 1.1rem",
            }}
          >
            <h2
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1d4ed8",
                marginBottom: 10,
                fontFamily: "'Sora', sans-serif",
              }}
            >
              Before you upload
            </h2>
            <div style={{ display: "grid", gap: 8, fontSize: 13, color: "#1e3a8a" }}>
              <span>Make sure the patient name and medicine instructions are readable.</span>
              <span>Upload every page if the prescription has more than one page.</span>
              <span>Accepted formats: JPG, PNG, PDF.</span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 18,
              padding: "1.5rem",
              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <h2
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#12251e",
                  marginBottom: 6,
                }}
              >
                Patient Information
              </h2>
              <p style={{ fontSize: 13, color: "#64748b" }}>
                We&apos;ll use this to review the prescription and contact you with the result.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <Field label="Patient Name" value={form.patientName} required onChange={setField("patientName")} />
              <Field label="Phone Number" value={form.phoneNumber} required onChange={setField("phoneNumber")} />
              <Field label="Email Address" value={form.email} required type="email" onChange={setField("email")} />
              <Field label="Doctor Name" value={form.doctorName} onChange={setField("doctorName")} />
              <Field label="Hospital / Clinic" value={form.hospitalName} onChange={setField("hospitalName")} />
              <Field label="Delivery Address" value={form.address} required onChange={setField("address")} />
            </div>

            <div style={{ marginBottom: 18 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                Notes
              </label>
              <textarea
                value={form.notes}
                onChange={setField("notes")}
                placeholder="Optional notes for the pharmacist"
                style={{
                  width: "100%",
                  minHeight: 100,
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 13,
                  color: "#12251e",
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                border: "2px dashed #cbd5e1",
                borderRadius: 16,
                padding: "1.25rem",
                background: "#f8fafc",
                marginBottom: 16,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 14 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #0d4f5c, #2d9caf)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M7 10l5-5 5 5" />
                    <path d="M12 15V5" />
                  </svg>
                </div>
                <h3
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#12251e",
                    marginBottom: 6,
                  }}
                >
                  Upload Prescription Files
                </h3>
                <p style={{ fontSize: 13, color: "#64748b" }}>
                  Add clear photos or PDFs of the prescription from your provider.
                </p>
              </div>

              <div style={{ display: "flex", justifyContent: "center" }}>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "#0d4f5c",
                    color: "#fff",
                    borderRadius: 10,
                    padding: "11px 16px",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    multiple
                    onChange={handleFiles}
                    style={{ display: "none" }}
                  />
                  Choose Files
                </label>
              </div>
            </div>

            {files.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
                {files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "12px 14px",
                      border: "1px solid #dbeafe",
                      background: "#f8fbff",
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
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                height: 48,
                border: "none",
                borderRadius: 12,
                background: submitting ? "#94a3b8" : "linear-gradient(135deg, #0d4f5c, #1f7a8c)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                fontFamily: "'Sora', sans-serif",
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Submitting..." : "Submit Prescription"}
            </button>
          </form>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SidebarCard
            title="How it Works"
            items={[
              "Upload the prescription from your hospital or clinic.",
              "Our pharmacist checks if it is valid and whether medicines are available.",
              "If available, you get a payment button in My Prescriptions.",
              "You complete shipping and payment in checkout.",
            ]}
          />
          <SidebarCard
            title="For This Demo"
            items={[
              "Requests are saved in local storage so they stay in your browser.",
              "Review status changes automatically after 5 seconds.",
              "Available requests unlock the payment flow.",
            ]}
          />
        </aside>
      </div>
    </div>
  );
};

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          width: "100%",
          height: 42,
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "0 14px",
          fontSize: 13,
          color: "#12251e",
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function SidebarCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: "1rem 1.1rem",
      }}
    >
      <h3
        style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          color: "#0d4f5c",
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item) => (
          <div key={item} style={{ display: "flex", gap: 10, fontSize: 13, color: "#475569" }}>
            <span style={{ color: "#0d4f5c", fontWeight: 700 }}>•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UploadPrescription;
