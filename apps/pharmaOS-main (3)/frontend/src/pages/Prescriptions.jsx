// Phase 6 - Page Permissions
import { useState, useEffect } from "react";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Table from "../components/ui/Table";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../context/ToastContext";
import { usePrescriptions } from "../hooks/usePrescriptions";
import { prescriptionsApi, productsApi } from "../services/api";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import { usePermissions } from "../hooks/usePermissions"; // Phase 6 addition
import { PERMISSIONS } from "../config/permissions"; // Phase 6 addition

const statusTabs = [
  { value: "", label: "All" },
  { value: "under_review", label: "Under Review" },
  { value: "available", label: "Available" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "rejected", label: "Rejected" },
  { value: "dispensed", label: "Dispensed" },
];

const statusColors = {
  under_review: { bg: "#fef3c7", border: "#fcd34d", color: "#92400e" },
  available: { bg: "#d1fae5", border: "#6ee7b7", color: "#065f46" },
  out_of_stock: { bg: "#fed7aa", border: "#fdba74", color: "#92400e" },
  rejected: { bg: "#fee2e2", border: "#fca5a5", color: "#991b1b" },
  dispensed: { bg: "#c7d2fe", border: "#a5b4fc", color: "#312e81" },
};

export default function Prescriptions() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("under_review");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const [verifyFormData, setVerifyFormData] = useState({
    status: "available",
    shippingPrice: "",
    shippingInfo: "",
    reviewNotes: "",
  });
  const [currentMedicine, setCurrentMedicine] = useState({
    productId: "",
    medicineName: "",
    productQuantity: 1,
    estimatedPrice: "",
  });
  const [medicineItems, setMedicineItems] = useState([]);
  const [verifyErrors, setVerifyErrors] = useState({});
  const [verifying, setVerifying] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { hasPermission } = usePermissions(); // Phase 6 addition

  const { prescriptions, loading, error, refetch } = usePrescriptions({
    status: statusFilter || undefined,
    search: search || undefined,
  });

  // Debug: log runtime state for prescriptions list
  console.debug("Prescriptions page state", {
    length: prescriptions.length,
    loading,
    error,
  });

  const handleOpenModal = (prescription) => {
    setSelectedPrescription(prescription);
    const defaultMedicine = {
      productId: prescription.productId || "",
      medicineName: prescription.product?.name || "",
      productQuantity: prescription.productQuantity || 1,
      estimatedPrice: prescription.estimatedPrice
        ? prescription.estimatedPrice.toString()
        : "",
    };

    setVerifyFormData({
      status: prescription.status === "under_review" ? "" : prescription.status,
      shippingPrice: "",
      shippingInfo: "",
      reviewNotes: prescription.reviewNotes || "",
    });
    setCurrentMedicine(defaultMedicine);
    setMedicineItems(prescription.productId ? [defaultMedicine] : []);
    setVerifyErrors({});
    setIsModalOpen(true);
  };

  const handleAddMedicine = () => {
    const errors = {};
    if (!currentMedicine.productId) {
      errors.productId =
        "Select a medicine before adding it to the prescription list.";
    }
    if (!currentMedicine.medicineName.trim()) {
      errors.medicineName = "Medicine name is required.";
    }
    if (!currentMedicine.estimatedPrice.trim()) {
      errors.estimatedPrice = "Estimated price is required.";
    } else if (
      isNaN(parseFloat(currentMedicine.estimatedPrice)) ||
      parseFloat(currentMedicine.estimatedPrice) <= 0
    ) {
      errors.estimatedPrice =
        "Estimated price must be a valid positive number.";
    }
    if (currentMedicine.productQuantity < 1) {
      errors.productQuantity = "Quantity must be at least 1.";
    }

    if (Object.keys(errors).length > 0) {
      setVerifyErrors(errors);
      return;
    }

    setMedicineItems((prev) => [...prev, currentMedicine]);
    setCurrentMedicine({
      productId: "",
      medicineName: "",
      productQuantity: 1,
      estimatedPrice: "",
    });
    setVerifyErrors({});
  };

  const handleRemoveMedicine = (index) => {
    setMedicineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!verifyFormData.status) errors.status = "Status is required";
    if (verifyFormData.status === "available") {
      const hasActiveItem =
        medicineItems.length > 0 || currentMedicine.productId !== "";
      if (!hasActiveItem) {
        errors.productId =
          "Add at least one medicine before approving this prescription.";
      }
      if (
        currentMedicine.productId !== "" &&
        !currentMedicine.medicineName.trim()
      ) {
        errors.medicineName =
          "Medicine name is required when approving this prescription";
      }
      if (
        currentMedicine.productId !== "" &&
        !currentMedicine.estimatedPrice.trim()
      ) {
        errors.estimatedPrice =
          "Estimated price is required when marking as available";
      } else if (
        currentMedicine.productId !== "" &&
        (isNaN(parseFloat(currentMedicine.estimatedPrice)) ||
          parseFloat(currentMedicine.estimatedPrice) <= 0)
      ) {
        errors.estimatedPrice =
          "Estimated price must be a valid positive number";
      }
      if (!verifyFormData.shippingPrice.trim()) {
        errors.shippingPrice =
          "Shipping price is required when marking as available";
      } else if (
        isNaN(parseFloat(verifyFormData.shippingPrice)) ||
        parseFloat(verifyFormData.shippingPrice) < 0
      ) {
        errors.shippingPrice =
          "Shipping price must be a valid non-negative number";
      }
    }
    setVerifyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setVerifying(true);
    try {
      const preparedItems = [
        ...medicineItems,
        currentMedicine.productId ? currentMedicine : null,
      ].filter(Boolean);
      const medicinePrice = preparedItems.reduce(
        (total, item) => total + parseFloat(item.estimatedPrice || 0),
        0,
      );
      const shippingPrice = parseFloat(verifyFormData.shippingPrice) || 0;
      const totalPrice = medicinePrice + shippingPrice;

      const itemNotes = preparedItems.map((item, index) => {
        return `Item ${index + 1}: ${item.medicineName} x${item.productQuantity} — KES ${parseFloat(
          item.estimatedPrice,
        ).toFixed(2)}`;
      });

      const reviewNotes = [
        itemNotes.length > 0 ? itemNotes.join("\n") : null,
        verifyFormData.shippingPrice?.trim()
          ? `Shipping price: KES ${shippingPrice.toFixed(2)}`
          : null,
        verifyFormData.shippingInfo?.trim()
          ? `Shipping details: ${verifyFormData.shippingInfo.trim()}`
          : null,
        verifyFormData.reviewNotes?.trim()
          ? verifyFormData.reviewNotes.trim()
          : null,
        `Total payable: KES ${totalPrice.toFixed(2)}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      await prescriptionsApi.updateStatus(selectedPrescription.id, {
        status: verifyFormData.status,
        reviewNotes,
        estimatedPrice:
          verifyFormData.status === "available" ? medicinePrice : undefined,
        productId: preparedItems[0]?.productId || undefined,
        productQuantity:
          verifyFormData.status === "available"
            ? Number(preparedItems[0]?.productQuantity) || 1
            : undefined,
      });
      toast.success(
        `Prescription updated and marked as ${verifyFormData.status}`,
      );
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to verify prescription");
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = statusColors[status] || statusColors.under_review;
    return (
      <Badge
        style={{
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          color: colors.color,
        }}
      >
        {status.replace("_", " ").charAt(0).toUpperCase() +
          status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const loadProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await productsApi.getAll({ limit: 100 });
        setAvailableProducts(res.data || []);
      } catch (err) {
        toast.error(
          "Unable to load inventory products for prescription verification",
        );
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [isModalOpen, toast]);

  const columns = [
    {
      header: "Prescription ID",
      render: (row) => (
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{row.id}</div>
            <div className="text-sm text-gray-500">
              {formatDate(row.createdAt)}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Patient",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.patientName}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: "Doctor / Hospital",
      render: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {row.doctorName}
          </div>
          <div className="text-sm text-gray-500">{row.hospitalName}</div>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => getStatusBadge(row.status),
    },
    {
      header: "Estimated Price",
      render: (row) => (
        <div>
          {row.estimatedPrice ? (
            <div className="font-medium text-gray-900">
              {formatCurrency(row.estimatedPrice)}
            </div>
          ) : (
            <div className="text-sm text-gray-500">-</div>
          )}
        </div>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          {row.status === "under_review" && hasPermission(PERMISSIONS.VERIFY_PRESCRIPTIONS) && ( // Phase 6 addition
            <Button size="sm" onClick={() => handleOpenModal(row)}>
              Verify
            </Button>
          )} {/* Phase 6 addition */}
          {row.status !== "under_review" && hasPermission(PERMISSIONS.EDIT_ORDERS) && ( // Phase 6 addition
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleOpenModal(row)}
            >
              Edit
            </Button>
          )} {/* Phase 6 addition */}
          {row.files && row.files.length > 0 && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setPreviewFile({
                  ...row.files[0],
                  data: row.files[0].data || row.files[0].dataUrl || "",
                })
              }
            >
              View Files
            </Button>
          )}
          {/* Quick reject action */}
          {hasPermission(PERMISSIONS.VERIFY_PRESCRIPTIONS) && ( // Phase 6 addition
            <Button
              size="sm"
              variant="danger"
              onClick={async (e) => {
                e.stopPropagation();
                const ok = window.confirm(
                  "Are you sure you want to reject this prescription?",
                );
                if (!ok) return;
                try {
                  await prescriptionsApi.updateStatus(row.id, {
                    status: "rejected",
                  });
                  toast.success("Prescription rejected");
                  refetch();
                } catch (err) {
                  toast.error(err.message || "Failed to reject prescription");
                }
              }}
            >
              Reject
            </Button>
          )} {/* Phase 6 addition */}
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Prescription Verification" icon={<FileText />}>
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap bg-white p-4 rounded-lg border border-gray-200">
          <Input
            placeholder="Search by patient name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px]"
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusTabs}
            className="min-w-[150px]"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 flex-wrap">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-teal-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
          <p className="font-semibold">Prescription approval flow</p>
          <p className="mt-1">
            When you mark a prescription as <strong>Available</strong>, it means
            the pharmacy has approved it and the customer can now proceed to
            checkout.
          </p>
          <p className="mt-1">
            If medicines are not available, choose <strong>Out of Stock</strong>{" "}
            or <strong>Reject</strong>.
          </p>
        </div>

        {/* Table or Empty State */}
        {loading ? (
          <div className="text-center py-12">Loading prescriptions...</div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-semibold">Unable to load prescriptions</p>
            <p>{error}</p>
            <p className="mt-2 text-gray-600">
              Please refresh the page or check your network/authentication
              settings.
            </p>
          </div>
        ) : prescriptions.length === 0 ? (
          <EmptyState
            icon={<FileText size={48} className="text-gray-400" />}
            title="No prescriptions found"
            description="There are no prescriptions matching your filters"
          />
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table columns={columns} data={prescriptions} />
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {isModalOpen && selectedPrescription && (
        <Modal
          isOpen={isModalOpen}
          title={`Verify Prescription ${selectedPrescription.id}`}
          onClose={() => setIsModalOpen(false)}
          size="lg"
        >
          <div className="space-y-6">
            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="text-sm text-gray-600">Patient Name</div>
                <div className="font-medium">
                  {selectedPrescription.patientName}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Email</div>
                <div className="font-medium">{selectedPrescription.email}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Phone</div>
                <div className="font-medium">
                  {selectedPrescription.phoneNumber}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Doctor</div>
                <div className="font-medium">
                  {selectedPrescription.doctorName}
                </div>
              </div>
            </div>

            {/* Files Section */}
            {selectedPrescription.files &&
              selectedPrescription.files.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    Uploaded Files
                  </div>
                  <div className="space-y-2">
                    {selectedPrescription.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setPreviewFile({
                              ...file,
                              data: file.data || file.dataUrl || "",
                            })
                          }
                        >
                          Preview
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Notes Section */}
            {selectedPrescription.notes && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Patient Notes
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
                  {selectedPrescription.notes}
                </div>
              </div>
            )}

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Status *
                </label>
                <Select
                  value={verifyFormData.status}
                  onChange={(e) =>
                    setVerifyFormData({
                      ...verifyFormData,
                      status: e.target.value,
                    })
                  }
                  options={[
                    { value: "", label: "Select status..." },
                    {
                      value: "available",
                      label: "Available - Medicines in stock",
                    },
                    {
                      value: "out_of_stock",
                      label: "Out of Stock - Unavailable",
                    },
                    { value: "rejected", label: "Rejected - Cannot fulfill" },
                  ]}
                  className="w-full"
                />
                {verifyErrors.status && (
                  <div className="text-red-600 text-sm mt-1">
                    {verifyErrors.status}
                  </div>
                )}
              </div>

              {verifyFormData.status === "available" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select product from inventory *
                    </label>
                    <Select
                      value={currentMedicine.productId}
                      onChange={(e) => {
                        const selected = availableProducts.find(
                          (item) => item.id === e.target.value,
                        );
                        setCurrentMedicine((prev) => ({
                          ...prev,
                          productId: e.target.value,
                          medicineName: selected?.name || prev.medicineName,
                          productQuantity: 1,
                          estimatedPrice: selected
                            ? parseFloat(selected.unitPrice).toFixed(2)
                            : prev.estimatedPrice,
                        }));
                        setVerifyErrors((prev) => ({
                          ...prev,
                          productId: undefined,
                          medicineName: undefined,
                          estimatedPrice: undefined,
                        }));
                      }}
                      options={[{ value: "", label: "Choose product" }].concat(
                        availableProducts.map((product) => ({
                          value: product.id,
                          label: `${product.name} — ${product.quantity} in stock — KES ${formatCurrency(
                            product.unitPrice,
                          )}`,
                        })),
                      )}
                      className="w-full"
                      disabled={loadingProducts}
                    />
                    {verifyErrors.productId && (
                      <div className="text-red-600 text-sm mt-1">
                        {verifyErrors.productId}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medicine / Prescription Item *
                    </label>
                    <Input
                      placeholder="Enter medicine name or description"
                      value={currentMedicine.medicineName}
                      onChange={(e) =>
                        setCurrentMedicine((prev) => ({
                          ...prev,
                          medicineName: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                    {verifyErrors.medicineName && (
                      <div className="text-red-600 text-sm mt-1">
                        {verifyErrors.medicineName}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={currentMedicine.productQuantity}
                        onChange={(e) => {
                          const quantity = Number(e.target.value) || 1;
                          const product = availableProducts.find(
                            (item) => item.id === currentMedicine.productId,
                          );
                          setCurrentMedicine((prev) => ({
                            ...prev,
                            productQuantity: quantity,
                            estimatedPrice: product
                              ? (
                                  quantity * parseFloat(product.unitPrice)
                                ).toFixed(2)
                              : prev.estimatedPrice,
                          }));
                        }}
                        className="w-full"
                      />
                      {verifyErrors.productQuantity && (
                        <div className="text-red-600 text-sm mt-1">
                          {verifyErrors.productQuantity}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Price (KES) *
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter estimated price"
                        value={currentMedicine.estimatedPrice}
                        onChange={(e) =>
                          setCurrentMedicine((prev) => ({
                            ...prev,
                            estimatedPrice: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                      {verifyErrors.estimatedPrice && (
                        <div className="text-red-600 text-sm mt-1">
                          {verifyErrors.estimatedPrice}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button type="button" onClick={handleAddMedicine}>
                      Add medicine
                    </Button>
                    {medicineItems.length > 0 && (
                      <div className="text-sm text-gray-600">
                        {medicineItems.length} medicine(s) added
                      </div>
                    )}
                  </div>

                  {medicineItems.length > 0 && (
                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="text-sm font-semibold text-gray-900 mb-3">
                        Medicines list
                      </div>
                      <div className="space-y-3">
                        {medicineItems.map((item, index) => (
                          <div
                            key={`${item.productId}-${index}`}
                            className="grid gap-3 md:grid-cols-[1fr_auto] items-center rounded-lg border border-gray-200 bg-white p-3"
                          >
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.medicineName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Qty: {item.productQuantity} · KES{" "}
                                {parseFloat(item.estimatedPrice || 0).toFixed(
                                  2,
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="secondary"
                              className="h-10"
                              onClick={() => handleRemoveMedicine(index)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Price (KES) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Enter shipping price"
                      value={verifyFormData.shippingPrice}
                      onChange={(e) =>
                        setVerifyFormData({
                          ...verifyFormData,
                          shippingPrice: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                    {verifyErrors.shippingPrice && (
                      <div className="text-red-600 text-sm mt-1">
                        {verifyErrors.shippingPrice}
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping / Delivery Info
                    </label>
                    <textarea
                      value={verifyFormData.shippingInfo}
                      onChange={(e) =>
                        setVerifyFormData({
                          ...verifyFormData,
                          shippingInfo: e.target.value,
                        })
                      }
                      placeholder="Enter shipping or delivery instructions"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      rows="3"
                    />
                  </div>

                  {(medicineItems.length > 0 ||
                    currentMedicine.medicineName ||
                    currentMedicine.estimatedPrice ||
                    verifyFormData.shippingInfo) && (
                    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="text-sm font-semibold text-gray-900 mb-3">
                        Quote preview
                      </div>
                      <div className="grid gap-3 text-sm text-gray-700">
                        {medicineItems.length > 0 ? (
                          medicineItems.map((item, index) => (
                            <div key={`${item.productId}-${index}`}>
                              <div className="text-gray-500">
                                Item {index + 1}
                              </div>
                              <div className="font-medium text-gray-900">
                                {item.medicineName} x{item.productQuantity}
                              </div>
                              <div className="text-gray-500">
                                KES{" "}
                                {parseFloat(item.estimatedPrice || 0).toFixed(
                                  2,
                                )}
                              </div>
                            </div>
                          ))
                        ) : currentMedicine.medicineName ? (
                          <div>
                            <div className="text-gray-500">Medicine</div>
                            <div className="font-medium text-gray-900">
                              {currentMedicine.medicineName}
                            </div>
                          </div>
                        ) : null}
                        {(currentMedicine.estimatedPrice ||
                          medicineItems.length > 0) && (
                          <div>
                            <div className="text-gray-500">Estimated Price</div>
                            <div className="font-medium text-gray-900">
                              KES{" "}
                              {(
                                medicineItems.reduce(
                                  (sum, item) =>
                                    sum + parseFloat(item.estimatedPrice || 0),
                                  0,
                                ) +
                                parseFloat(currentMedicine.estimatedPrice || 0)
                              ).toFixed(2)}
                            </div>
                          </div>
                        )}
                        {verifyFormData.shippingPrice && (
                          <div>
                            <div className="text-gray-500">Shipping Price</div>
                            <div className="font-medium text-gray-900">
                              KES{" "}
                              {parseFloat(
                                verifyFormData.shippingPrice || 0,
                              ).toFixed(2)}
                            </div>
                          </div>
                        )}
                        {verifyFormData.shippingInfo && (
                          <div>
                            <div className="text-gray-500">
                              Shipping / Delivery
                            </div>
                            <div className="font-medium text-gray-900 whitespace-pre-line">
                              {verifyFormData.shippingInfo}
                            </div>
                          </div>
                        )}
                        {(currentMedicine.estimatedPrice ||
                          verifyFormData.shippingPrice ||
                          medicineItems.length > 0) && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="text-gray-500">Total Quote</div>
                            <div className="font-semibold text-gray-900">
                              KES{" "}
                              {(
                                medicineItems.reduce(
                                  (sum, item) =>
                                    sum + parseFloat(item.estimatedPrice || 0),
                                  0,
                                ) +
                                parseFloat(
                                  currentMedicine.estimatedPrice || 0,
                                ) +
                                parseFloat(verifyFormData.shippingPrice || 0)
                              ).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pharmacy Notes
                </label>
                <textarea
                  value={verifyFormData.reviewNotes}
                  onChange={(e) =>
                    setVerifyFormData({
                      ...verifyFormData,
                      reviewNotes: e.target.value,
                    })
                  }
                  placeholder="Add pharmacist notes (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows="4"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={verifying}
                >
                  Cancel
                </Button>
                {hasPermission(PERMISSIONS.VERIFY_PRESCRIPTIONS) && ( // Phase 6 addition
                  <Button
                    type="submit"
                    loading={verifying}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <CheckCircle size={16} />
                    Approve & Save
                  </Button>
                )} {/* Phase 6 addition */}
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <Modal
          isOpen={!!previewFile}
          title="File Preview"
          onClose={() => setPreviewFile(null)}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600">File Name</div>
              <div className="font-medium">{previewFile.name}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">File Size</div>
              <div className="font-medium">
                {(previewFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
            {/* If it's a base64 image */}
            {(() => {
              const previewData = previewFile.data || previewFile.dataUrl || "";

              if (
                previewFile.type === "application/pdf" &&
                previewData.startsWith("data:application/pdf")
              ) {
                return (
                  <div className="mt-4">
                    <iframe
                      title={previewFile.name}
                      src={previewData}
                      className="w-full h-[70vh] rounded-lg border border-gray-200"
                    />
                  </div>
                );
              }

              if (previewData.startsWith("data:image")) {
                return (
                  <div className="mt-4">
                    <img
                      src={previewData}
                      alt={previewFile.name}
                      className="max-w-full max-h-96 mx-auto rounded-lg border border-gray-200"
                    />
                  </div>
                );
              }

              return (
                <div className="text-sm text-gray-500 text-center pt-4">
                  {previewData
                    ? "Preview available for this file type"
                    : "File preview not available"}
                </div>
              );
            })()}
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
}
