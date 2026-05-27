import { useState } from 'react'
import { Search } from 'lucide-react'
import { useCustomers } from '../hooks/useCustomers'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { formatCurrency } from '../utils/formatCurrency'

export default function DueList() {
  const { customers, loading, error, refetch } = useCustomers()
  const [searchQuery, setSearchQuery] = useState('')

  const dueCustomers = customers
    .filter(c => Number(c.balance) > 0)
    .filter(c =>
      !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => Number(b.balance) - Number(a.balance))

  return (
    <PageWrapper>
      <Card
        title="Due List"
        subtitle="Customers with outstanding balances"
        className="border-none shadow-sm mb-6"
      >
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400" />
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
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Name</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dueCustomers.length > 0 ? dueCustomers.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 text-sm font-medium text-gray-700">{c.name}</td>
                      <td className="py-4 text-sm text-gray-500">{c.phone || '—'}</td>
                      <td className="py-4 text-sm text-gray-500">{c.email || '—'}</td>
                      <td className="py-4 text-sm font-bold text-right text-red-600">{formatCurrency(c.balance)}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="py-12 text-center text-sm text-gray-400">No outstanding balances</td></tr>
                  )}
                </tbody>
              </table>
              {dueCustomers.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                  <span className="text-sm font-semibold text-gray-700">
                    Total Due: {formatCurrency(dueCustomers.reduce((sum, c) => sum + Number(c.balance), 0))}
                  </span>
                </div>
              )}
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden space-y-3">
              {dueCustomers.length > 0 ? dueCustomers.map(c => (
                <div key={c.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{c.phone || '—'}</p>
                      <p className="text-xs text-gray-400">{c.email || '—'}</p>
                    </div>
                    <span className="text-sm font-bold text-red-600">{formatCurrency(c.balance)}</span>
                  </div>
                </div>
              )) : (
                <p className="py-12 text-center text-sm text-gray-400">No outstanding balances</p>
              )}
              {dueCustomers.length > 0 && (
                <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-medium">Total Outstanding</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(dueCustomers.reduce((sum, c) => sum + Number(c.balance), 0))}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </Card>
    </PageWrapper>
  )
}
