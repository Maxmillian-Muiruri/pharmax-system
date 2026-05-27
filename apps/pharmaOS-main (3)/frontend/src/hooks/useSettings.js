import { useState, useEffect, useCallback } from 'react'
import { settingsApi } from '../services/api'

export function useSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await settingsApi.getAll()
      setSettings(res.data || {})
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return { settings, loading, error, refetch: fetchSettings }
}
