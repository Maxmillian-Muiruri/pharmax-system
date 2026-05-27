import { useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'
import { useCustomers } from '../hooks/useCustomers'
import { customersApi } from '../services/api'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { formatCurrency } from '../utils/formatCurrency'

export default function Customers() {
  const { customers, loading, error, refetch } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', address: '' })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editId) {
        await customersApi.update(editId, formData)
      } else {
        await customersApi.create(formData)
      }
      setFormData({ name: '', phone: '', email: '', address: '' })
      setShowForm(false)
      setEditId(null)
      refetch()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }, [formData, editId, refetch])

  const handleDelete = useCallback(async (id) => {
    if (!confirm('Delete this customer?')) return
    try {
      await customersApi.remove(id)
      refetch()
    } catch (err) {
      alert(err.message)
    }
  }, [refetch])

  const filtered = customers.filter(c =>
    !searchQuery ||
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageWrapper>
      <Card
        title="Customer List"
        subtitle="Manage your customers and their balances"
        className="border-none shadow-sm mb-6"
        action={
          <button
            onClick={() => { setShowForm(true); setEditId(null); setFormData({ name: '', phone: '', email: '', address: '' }) }}
            className="flex items-center gap-2 px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 transition-colors"
          >
            <Plus size={16} /> Add New
          </button>
        }
      >
        {/* Search */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{editId ? 'Edit' : 'Add'} Customer</h4>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input required placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <input placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary" />
              <div className="flex gap-2 md:col-span-2">
                <button type="submit" disabled={saving} className="px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded hover:bg-gray-300">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
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
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Balance</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length > 0 ? filtered.map(c => (
                    <tr key={c.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-700">{c.name}</td>
                      <td className="py-4 text-sm text-gray-500">{c.phone || '—'}</td>
                      <td className="py-4 text-sm text-gray-500">{c.email || '—'}</td>
                      <td className={`py-4 text-sm font-semibold text-right ${Number(c.balance) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {formatCurrency(c.balance)}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditId(c.id); setFormData({ name: c.name, phone: c.phone||'', email: c.email||'', address: c.address||'' }); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-forty-primary rounded transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="5" className="py-12 text-center text-sm text-gray-400">No customers found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {filtered.length > 0 ? filtered.map(c => (
                <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.phone || '—'}</p>
                    </div>
                    <span className={`text-sm font-bold ${Number(c.balance) > 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {formatCurrency(c.balance)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 truncate flex-1">{c.email || '—'}</p>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <button onClick={() => { setEditId(c.id); setFormData({ name: c.name, phone: c.phone||'', email: c.email||'', address: c.address||'' }); setShowForm(true) }} className="p-1.5 text-gray-400 hover:text-forty-primary rounded transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              )) : (
                <p className="py-12 text-center text-sm text-gray-400">No customers found</p>
              )}
            </div>
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
