import { useState, useEffect, useCallback } from 'react'
import { expensesApi } from '../services/api'

export function useExpenses(filters = {}) {
  const [data, setData] = useState({ expenses: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await expensesApi.getAll(filters)
      setData(res.data || { expenses: [], pagination: {} })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return { expenses: data.expenses, pagination: data.pagination, loading, error, refetch: fetchExpenses }
}

export function useExpenseSummary(params = {}) {
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0, total: 0, totalCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await expensesApi.getSummary(params)
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
