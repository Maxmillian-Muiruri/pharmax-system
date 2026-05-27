import { useState } from 'react'
import { Search } from 'lucide-react'
import { useOrders } from '../../hooks/useOrders'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

const statusBadgeMap = {
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  cancelled: 'cancelled',
}

export default function SalesList() {
  const { orders, loading, error } = useOrders()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const completedOrders = orders
    .filter(o => o.status === 'completed')
    .filter(o => !statusFilter || o.status === statusFilter)
    .filter(o =>
      !searchQuery ||
      o.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <PageWrapper>
      <Card
        title="Sales List"
        subtitle="All completed sales transactions"
        className="border-none shadow-sm mb-6"
      >
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
            {['', 'completed', 'pending', 'processing', 'cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-colors whitespace-nowrap shrink-0 ${statusFilter === s ? 'bg-forty-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search sales..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400" />
          </div>
        </div>

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
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Qty</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {completedOrders.length > 0 ? completedOrders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm text-gray-500">{formatDate(o.createdAt)}</td>
                      <td className="py-4 text-sm font-medium text-gray-700">{o.customerName}</td>
                      <td className="py-4 text-sm text-gray-500">{o.product?.name || '—'}</td>
                      <td className="py-4 text-sm text-gray-500 text-center">{o.quantity}</td>
                      <td className="py-4 text-sm text-gray-500 capitalize">{o.paymentMethod || '—'}</td>
                      <td className="py-4 text-sm"><Badge status={statusBadgeMap[o.status]}>{o.status}</Badge></td>
                      <td className="py-4 text-sm font-semibold text-right">{formatCurrency(o.totalAmount)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="py-12 text-center text-sm text-gray-400">No sales records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {completedOrders.length > 0 ? completedOrders.map(o => (
                <div key={o.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{o.customerName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{o.product?.name || '—'}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(o.totalAmount)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDate(o.createdAt)}</span>
                      <span>Qty: {o.quantity}</span>
                      <span className="capitalize">{o.paymentMethod || '—'}</span>
                    </div>
                    <Badge status={statusBadgeMap[o.status]}>{o.status}</Badge>
                  </div>
                </div>
              )) : (
                <p className="py-12 text-center text-sm text-gray-400">No sales records found</p>
              )}
            </div>
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
