import { useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { useExpenses, useExpenseSummary } from '../hooks/useExpenses'
import { expensesApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

export default function Expenses() {
  const { expenses, loading, error, refetch } = useExpenses()
  const { summary } = useExpenseSummary()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!formData.category || !formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please fill in all required fields with valid amounts')
      return
    }
    setSaving(true)
    try {
      await expensesApi.create({ ...formData, amount: parseFloat(formData.amount) })
      toast.success('Expense added successfully')
      setFormData({ category: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' })
      setShowForm(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to add expense')
    } finally {
      setSaving(false)
    }
  }, [formData, refetch, toast])

  const filtered = expenses.filter(e =>
    !searchQuery || e.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = ['Rent', 'Utilities', 'Salaries', 'Transport', 'Insurance', 'Maintenance', 'Licenses', 'Marketing', 'Other']

  return (
    <PageWrapper>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-none shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Today</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.today)}</p>
        </Card>
        <Card className="border-none shadow-sm">
          <p className="text-xs text-gray-400 font-medium">This Week</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.week)}</p>
        </Card>
        <Card className="border-none shadow-sm">
          <p className="text-xs text-gray-400 font-medium">This Month</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.month)}</p>
        </Card>
        <Card className="border-none shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Total ({summary.totalCount})</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.total)}</p>
        </Card>
      </div>

      <Card
        title="Expenses"
        subtitle="Track your pharmacy expenses"
        className="border-none shadow-sm mb-6"
        action={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 transition-colors">
            <Plus size={16} /> Add Expense
          </button>
        }
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search expenses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400" />
          </div>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Expense</h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary">
                <option value="">Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input required type="number" step="0.01" placeholder="Amount" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <div className="flex gap-2 sm:col-span-2 md:col-span-4">
                <button type="submit" disabled={saving} className="flex-1 sm:flex-none px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : error ? (
          <p className="text-sm text-red-500 py-8 text-center">{error}</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Notes</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length > 0 ? filtered.map(e => (
                    <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm text-gray-500">{formatDate(e.date)}</td>
                      <td className="py-4 text-sm font-medium text-gray-700">{e.category}</td>
                      <td className="py-4 text-sm text-gray-500">{e.notes || '—'}</td>
                      <td className="py-4 text-sm"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">{e.status}</span></td>
                      <td className="py-4 text-sm font-semibold text-right text-red-600">{formatCurrency(e.amount)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="py-12 text-center text-sm text-gray-400">No expenses recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {filtered.length > 0 ? filtered.map(e => (
                <div key={e.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-800">{e.category}</p>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(e.amount)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{formatDate(e.date)}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 truncate flex-1 mr-2">{e.notes || '—'}</p>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium shrink-0">{e.status}</span>
                  </div>
                </div>
              )) : (
                <p className="py-12 text-center text-sm text-gray-400">No expenses recorded</p>
              )}
            </div>
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
