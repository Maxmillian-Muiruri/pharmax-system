import { useState, useEffect, useCallback } from 'react'
import { purchasesApi } from '../services/api'

export function usePurchases(filters = {}) {
  const [data, setData] = useState({ purchases: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPurchases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await purchasesApi.getAll(filters)
      setData(res.data || { purchases: [], pagination: {} })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  return { purchases: data.purchases, pagination: data.pagination, loading, error, refetch: fetchPurchases }
}

export function usePurchaseSummary(params = {}) {
  const [summary, setSummary] = useState({ month: 0, week: 0, monthCount: 0, weekCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await purchasesApi.getSummary(params)
      setSummary(res.data || summary)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(params)])

  useEffect(() => {
    fetchSummary()
  }, [fetchSummary])

  return { summary, loading, error, refetch: fetchSummary }
}
