import { useState, useEffect, useCallback } from 'react'
import { incomesApi } from '../services/api'

export function useIncomes(filters = {}) {
  const [data, setData] = useState({ incomes: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchIncomes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await incomesApi.getAll(filters)
      setData(res.data || { incomes: [], pagination: {} })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  return { incomes: data.incomes, pagination: data.pagination, loading, error, refetch: fetchIncomes }
}

export function useIncomeSummary(params = {}) {
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0, total: 0, totalCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSummary = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await incomesApi.getSummary(params)
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
