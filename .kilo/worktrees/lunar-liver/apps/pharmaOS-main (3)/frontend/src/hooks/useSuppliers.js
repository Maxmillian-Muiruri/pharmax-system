import { useState, useEffect, useCallback } from 'react'
import { suppliersApi } from '../services/api'

export function useSuppliers(filters = {}) {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await suppliersApi.getAll(filters)
      setSuppliers(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  return { suppliers, loading, error, refetch: fetchSuppliers }
}
