import { useState, useEffect, useCallback } from "react";
import { prescriptionsApi } from "../services/api";

export function usePrescriptions(filters = {}) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await prescriptionsApi.getAll(filters);
      const data = res?.data ?? res ?? [];
      const arr = Array.isArray(data) ? data : [];
      setPrescriptions(arr);
      // Debug: log fetched prescriptions shape/length
      console.debug("usePrescriptions fetched", {
        length: arr.length,
        sample: arr[0],
      });
    } catch (err) {
      setError(err.message);
      setPrescriptions([]);
      console.error("Failed to load prescriptions", err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  return { prescriptions, loading, error, refetch: fetchPrescriptions };
}
