import { useState, useCallback } from 'react'
import { useSettings } from '../hooks/useSettings'
import { settingsApi } from '../services/api'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'

export default function Settings() {
  const { settings, loading, error, refetch } = useSettings()
  const [formData, setFormData] = useState({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await settingsApi.updateBulk(formData)
      setMessage('Settings saved successfully!')
      refetch()
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }, [formData, refetch])

  const fields = [
    { key: 'pharmacyName', label: 'Pharmacy Name', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'currency', label: 'Currency', type: 'select', options: ['KES', 'USD', 'EUR', 'GBP'] },
    { key: 'taxRate', label: 'Tax Rate (%)', type: 'number' },
    { key: 'lowStockThreshold', label: 'Low Stock Threshold', type: 'number' },
    { key: 'nearExpiryDays', label: 'Near Expiry Days', type: 'number' },
  ]

  return (
    <PageWrapper>
      <Card title="Settings" subtitle="Manage your pharmacy configuration" className="border-none shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500 py-8 text-center">{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
            {fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    value={formData[field.key] ?? settings[field.key] ?? ''}
                    onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-md text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary"
                  >
                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    value={formData[field.key] ?? settings[field.key] ?? ''}
                    onChange={e => setFormData({...formData, [field.key]: e.target.value})}
                    className="w-full px-3 py-2.5 sm:py-2 border border-gray-200 rounded-md text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary"
                  />
                )}
              </div>
            ))}

            {message && (
              <p className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2.5 sm:py-2 bg-forty-primary text-white text-sm font-bold rounded hover:bg-forty-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        )}
      </Card>
    </PageWrapper>
  )
}
