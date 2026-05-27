import { useState, useEffect, useCallback } from 'react'
import { transactionsApi } from '../services/api'

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 })

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await transactionsApi.getAll(filters)
      setTransactions(res.data?.transactions || [])
      setPagination(res.data?.pagination || { page: 1, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  const fetchSummary = useCallback(async () => {
    try {
      const res = await transactionsApi.getSummary()
      setSummary(res.data)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    Promise.all([fetchTransactions(), fetchSummary()])
  }, [fetchTransactions, fetchSummary])

  return { 
    transactions, 
    summary, 
    loading, 
    error, 
    pagination,
    refetch: fetchTransactions 
  }
}
