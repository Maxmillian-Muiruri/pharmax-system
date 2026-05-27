import { useState, useEffect, useCallback } from 'react'
import { customersApi } from '../services/api'

export function useCustomers(filters = {}) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await customersApi.getAll(filters)
      setCustomers(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return { customers, loading, error, refetch: fetchCustomers }
}

export function useTopCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTop = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await customersApi.getTop()
      setCustomers(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTop()
  }, [fetchTop])

  return { customers, loading, error, refetch: fetchTop }
}
