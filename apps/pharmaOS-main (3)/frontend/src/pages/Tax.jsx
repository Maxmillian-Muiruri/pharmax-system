import { useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { useExpenses } from '../hooks/useExpenses'
import { expensesApi } from '../services/api'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

export default function Tax() {
  const { expenses, loading, error, refetch } = useExpenses({ category: 'Licenses' })
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await expensesApi.create({ category: 'Licenses', ...formData, amount: parseFloat(formData.amount) })
      setFormData({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
      setShowForm(false)
      refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [formData, refetch])

  const filtered = expenses.filter(e =>
    !searchQuery || e.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageWrapper>
      <Card
        title="Tax List"
        subtitle="Track tax and license payments"
        className="border-none shadow-sm mb-6"
        action={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 transition-colors">
            <Plus size={16} /> Add Tax Entry
          </button>
        }
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400" />
          </div>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Tax Entry</h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input required type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <div className="flex gap-2 md:col-span-3">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500 py-8 text-center">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes</th>
                  <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length > 0 ? filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 text-sm text-gray-500">{formatDate(e.date)}</td>
                    <td className="py-4 text-sm font-medium text-gray-700">{e.category}</td>
                    <td className="py-4 text-sm text-gray-500">{e.notes || '—'}</td>
                    <td className="py-4 text-sm font-semibold text-right text-red-600">{formatCurrency(e.amount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" className="py-12 text-center text-sm text-gray-400">No tax records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </PageWrapper>
  )
}
