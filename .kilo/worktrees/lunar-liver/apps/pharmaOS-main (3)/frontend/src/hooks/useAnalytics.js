import { useState, useEffect, useCallback } from 'react'
import { analyticsApi } from '../services/api'

export function useAnalytics() {
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSalesTrend = useCallback(async (period = 7) => {
    try {
      const res = await analyticsApi.sales(period)
      setSalesData(res.data?.data || [])
    } catch (err) {
      setError(err.message)
    }
  }, [])

  const fetchTopProducts = useCallback(async (metric = 'units', period = 'week') => {
    try {
      const res = await analyticsApi.topProducts({ metric, period })
      setTopProducts(res.data?.data || [])
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchSalesTrend(7),
      fetchTopProducts('units', 'week')
    ]).finally(() => setLoading(false))
  }, [fetchSalesTrend, fetchTopProducts])

  return { 
    salesData, 
    topProducts, 
    loading, 
    error, 
    refetchSales: fetchSalesTrend, 
    refetchTopProducts: fetchTopProducts 
  }
}
