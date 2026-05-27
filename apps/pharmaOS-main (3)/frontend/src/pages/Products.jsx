import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { productsApi } from '../services/api'
import { useToast } from '../context/ToastContext'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { formatCurrency } from '../utils/formatCurrency'

export default function Products() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  // Initialise from URL param so navbar search lands with the query pre-filled
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null)
  const [formData, setFormData] = useState({
    name: '', generic: '', category: '', quantity: 0,
    unitPrice: 0, purchasePrice: 0, expiryDate: '', batchNumber: '', minimumStock: 10,
  })
  const [saving, setSaving] = useState(false)

  // Sync search field when URL param changes (navbar search navigates here)
  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '')
  }, [searchParams])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsApi.getAll({})
      setProducts(res.data || [])
    } catch (err) {
      toast.error('Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const filtered = products.filter(p =>
    !searchQuery ||
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.generic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.batchNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) { toast.error('Product name is required'); return }
    if (!formData.expiryDate) { toast.error('Expiry date is required'); return }
    setSaving(true)
    try {
      if (editId) {
        await productsApi.update(editId, formData)
        toast.success('Product updated successfully')
      } else {
        await productsApi.create(formData)
        toast.success('Product created successfully')
      }
      setFormData({ name: '', generic: '', category: '', quantity: 0, unitPrice: 0, purchasePrice: 0, expiryDate: '', batchNumber: '', minimumStock: 10 })
      setShowForm(false)
      setEditId(null)
      fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }, [formData, editId, fetchProducts, toast])

  const handleEdit = useCallback((product) => {
    setEditId(product.id)
    setFormData({
      name: product.name || '', generic: product.generic || '', category: product.category || '',
      quantity: product.quantity || 0, unitPrice: Number(product.unitPrice) || 0,
      purchasePrice: Number(product.purchasePrice) || 0,
      expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
      batchNumber: product.batchNumber || '', minimumStock: product.minimumStock || 10,
    })
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productsApi.remove(id)
      toast.success('Product deleted successfully')
      fetchProducts()
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    }
  }, [fetchProducts, toast])

  const emptyForm = { name: '', generic: '', category: '', quantity: 0, unitPrice: 0, purchasePrice: 0, expiryDate: '', batchNumber: '', minimumStock: 10 }

  return (
    <PageWrapper>
      <Card
        title="All Products"
        subtitle="Complete inventory management"
        className="border-none shadow-sm mb-6"
        action={
          <button
            onClick={() => { setShowForm(true); setEditId(null); setFormData(emptyForm) }}
            className="flex items-center gap-2 px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 transition-colors"
          >
            <Plus size={16} /> Add New
          </button>
        }
      >
        {/* Search */}
        <div className="mb-6">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-md text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Inline Form */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{editId ? 'Edit' : 'Add'} Product</h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <input required placeholder="Product Name *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary sm:col-span-2" />
              <input placeholder="Generic Name" value={formData.generic} onChange={e => setFormData({...formData, generic: e.target.value})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input placeholder="Batch Number" value={formData.batchNumber} onChange={e => setFormData({...formData, batchNumber: e.target.value})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input type="number" min="0" placeholder="Quantity *" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input type="number" min="0" step="0.01" placeholder="Unit Price (KES) *" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input type="number" min="0" step="0.01" placeholder="Purchase Price (KES)" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input type="date" required value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input type="number" min="0" placeholder="Minimum Stock" value={formData.minimumStock} onChange={e => setFormData({...formData, minimumStock: parseInt(e.target.value) || 10})} className="px-3 py-2.5 sm:py-2 border border-gray-200 rounded text-base sm:text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <div className="flex gap-2 sm:col-span-2 md:col-span-3">
                <button type="submit" disabled={saving} className="flex-1 sm:flex-none px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="flex-1 sm:flex-none px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">No products found{searchQuery ? ` for "${searchQuery}"` : ''}</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medicine Name</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Generic</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Stock</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Purchase Price</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit Price</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Expiry</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(p => (
                    <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-700">{p.name}</td>
                      <td className="py-4 text-sm text-gray-500">{p.generic || '—'}</td>
                      <td className="py-4 text-sm text-gray-500">{p.category || '—'}</td>
                      <td className={`py-4 text-sm font-semibold text-center ${p.quantity < (p.minimumStock || 10) ? 'text-red-500' : 'text-gray-700'}`}>{p.quantity}</td>
                      <td className="py-4 text-sm text-gray-700">{formatCurrency(p.purchasePrice)}</td>
                      <td className="py-4 text-sm font-medium text-gray-700">{formatCurrency(p.unitPrice)}</td>
                      <td className="py-4 text-sm text-gray-500">
                        {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-forty-primary rounded transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {filtered.map(p => (
                <div key={p.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.generic || p.category || '—'}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(p.unitPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className={p.quantity < (p.minimumStock || 10) ? 'text-red-500 font-semibold' : ''}>Qty: {p.quantity}</span>
                      <span>{p.expiryDate ? new Date(p.expiryDate).toLocaleDateString('en-KE', { month: 'short', year: 'numeric' }) : '—'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-gray-400 hover:text-forty-primary rounded transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
