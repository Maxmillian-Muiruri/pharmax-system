import { useState } from 'react'
import { FileText } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Badge from '../components/ui/Badge'
import Table from '../components/ui/Table'
import EmptyState from '../components/ui/EmptyState'
import { useTransactions } from '../hooks/useTransactions'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'

const typeTabs = [
  { value: '', label: 'All' },
  { value: 'sale', label: 'Sales' },
  { value: 'restock', label: 'Restocks' },
  { value: 'write_off', label: 'Write-offs' },
]

const dateTabs = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

export default function Transactions() {
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('month')
  const [page, setPage] = useState(1)

  const { transactions, summary, loading, pagination } = useTransactions({
    type: typeFilter || undefined,
    page,
    limit: 25,
  })

  const columns = [
    { header: 'Date/Time', accessor: 'createdAt', render: (row) => (
      <div>
        <div className="font-medium text-gray-900">{formatDate(row.createdAt)}</div>
        <div className="text-xs text-gray-500">
          {new Date(row.createdAt).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    )},
    { header: 'Type', accessor: 'type', render: (row) => (
      <Badge status={row.type} />
    )},
    { header: 'Product', accessor: 'product', render: (row) => (
      <span className="text-gray-700">{row.product?.name || 'Unknown'}</span>
    )},
    { header: 'Qty', accessor: 'quantity', align: 'center', render: (row) => (
      <span>{row.quantity}</span>
    )},
    { header: 'Amount', accessor: 'amount', align: 'right', render: (row) => (
      <span className="font-medium">{formatCurrency(row.amount)}</span>
    )},
    { header: 'Notes', accessor: 'notes', render: (row) => (
      <span className="text-gray-500 text-sm">{row.notes || '—'}</span>
    )},
  ]

  const getDateRange = () => {
    const now = new Date()
    let from = new Date()
    
    if (dateFilter === 'today') {
      from.setHours(0, 0, 0, 0)
    } else if (dateFilter === 'week') {
      from.setDate(now.getDate() - 7)
    } else if (dateFilter === 'month') {
      from.setDate(now.getDate() - 30)
    }
    
    return { from, to: now }
  }

  return (
    <PageWrapper title="Transactions">
      {/* Type Filter - Mobile scrollable */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {typeTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setTypeFilter(tab.value)
              setPage(1)
            }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              typeFilter === tab.value
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date Filter - Mobile scrollable */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {dateTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setDateFilter(tab.value)
              setPage(1)
            }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              dateFilter === tab.value
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table - with mobileCard */}
      <Table
        columns={columns}
        data={transactions}
        loading={loading}
        mobileCard={true}
        emptyState={
          <EmptyState
            icon={<FileText size={48} />}
            title="No transactions found"
            description="Transactions will appear here once orders are completed"
          />
        }
      />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {transactions.length} of {pagination.total} | Total: {formatCurrency(summary?.month || 0)}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
