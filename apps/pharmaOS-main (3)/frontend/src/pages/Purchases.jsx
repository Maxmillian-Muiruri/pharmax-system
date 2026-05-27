import { useState, useCallback } from 'react'
import { Plus, Search, ChevronDown, ChevronUp } from 'lucide-react'
import { usePurchases, usePurchaseSummary } from '../hooks/usePurchases'
import { useSuppliers } from '../hooks/useSuppliers'
import { useProducts } from '../hooks/useProducts'
import { purchasesApi } from '../services/api'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

export default function Purchases() {
  const { purchases, loading, error, refetch } = usePurchases()
  const { summary } = usePurchaseSummary()
  const { suppliers } = useSuppliers()
  const { products } = useProducts()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [expandedRow, setExpandedRow] = useState(null)
  const [formData, setFormData] = useState({
    supplierId: '',
    invoiceNo: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: []
  })
  const [saving, setSaving] = useState(false)

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { productId: '', quantity: 1, unitCost: 0 }] })
  }

  const updateItem = (index, field, value) => {
    const updated = [...formData.items]
    updated[index] = { ...updated[index], [field]: field === 'productId' ? value : Number(value) }
    setFormData({ ...formData, items: updated })
  }

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (formData.items.length === 0) return alert('Add at least one item')
    setSaving(true)
    try {
      await purchasesApi.create({
        supplierId: formData.supplierId,
        invoiceNo: formData.invoiceNo || null,
        purchaseDate: formData.purchaseDate,
        totalAmount,
        notes: formData.notes || null,
        items: formData.items
      })
      setFormData({ supplierId: '', invoiceNo: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '', items: [] })
      setShowForm(false)
      refetch()
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }, [formData, totalAmount, refetch])

  const filtered = purchases.filter(p =>
    !searchQuery ||
    p.supplier?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.invoiceNo?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageWrapper>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="border-none shadow-sm">
          <p className="text-xs text-gray-400 font-medium">This Week ({summary.weekCount})</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(summary.week)}</p>
        </Card>
        <Card className="border-none shadow-sm">
          <p className="text-xs text-gray-400 font-medium">This Month ({summary.monthCount})</p>
          <p className="text-lg sm:text-xl font-bold text-gray-900">{formatCurrency(summary.month)}</p>
        </Card>
      </div>

      <Card
        title="Purchase List"
        subtitle="Stock purchases from suppliers"
        className="border-none shadow-sm mb-6"
        action={
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 transition-colors">
            <Plus size={16} /> New Purchase
          </button>
        }
      >
        <div className="mb-6">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search purchases..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400" />
          </div>
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">New Purchase</h4>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select required value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary">
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input placeholder="Invoice No" value={formData.invoiceNo} onChange={e => setFormData({...formData, invoiceNo: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
                <input required type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="px-3 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase">Items</h5>
                  <button type="button" onClick={addItem} className="text-xs text-forty-primary font-bold hover:underline">+ Add Item</button>
                </div>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-center p-3 bg-white rounded border border-gray-100 sm:p-0 sm:bg-transparent sm:border-0">
                    <select required value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)} className="px-2 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary">
                      <option value="">Product</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="px-2 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
                    <input required type="number" step="0.01" min="0" placeholder="Unit Cost" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', e.target.value)} className="px-2 py-2.5 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-600">{formatCurrency(item.quantity * item.unitCost)}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t">
                <span className="text-sm font-semibold text-gray-700">Total: {formatCurrency(totalAmount)}</span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button type="submit" disabled={saving} className="flex-1 sm:flex-none px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save Purchase'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
                </div>
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
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Supplier</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice No</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Items</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length > 0 ? filtered.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm text-gray-500">{formatDate(p.purchaseDate)}</td>
                      <td className="py-4 text-sm font-medium text-gray-700">{p.supplier?.name || '—'}</td>
                      <td className="py-4 text-sm text-gray-500">{p.invoiceNo || '—'}</td>
                      <td className="py-4 text-sm text-gray-500">{p.items?.length || 0}</td>
                      <td className="py-4 text-sm font-semibold text-right">{formatCurrency(p.totalAmount)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="py-12 text-center text-sm text-gray-400">No purchases recorded</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {filtered.length > 0 ? filtered.map(p => (
                <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{p.supplier?.name || '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.purchaseDate)}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(p.totalAmount)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Invoice: {p.invoiceNo || '—'}</span>
                    <span>{p.items?.length || 0} item(s)</span>
                  </div>
                </div>
              )) : (
                <p className="py-12 text-center text-sm text-gray-400">No purchases recorded</p>
              )}
            </div>
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
