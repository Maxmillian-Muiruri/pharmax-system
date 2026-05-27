import { useState, useEffect, useCallback } from 'react'
import { alertsApi } from '../services/api'

export function useAlerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await alertsApi.getAll({ is_read: 'false' })
      setAlerts(res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlerts()
  }, [fetchAlerts])

  const unreadCount = alerts.length

  return { alerts, loading, error, unreadCount, refetch: fetchAlerts }
}
