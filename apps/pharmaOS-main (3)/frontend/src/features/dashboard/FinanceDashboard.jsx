// Phase 5 - Role Dashboards
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { useIncomeSummary } from '../../hooks/useIncomes'
import { useExpenseSummary } from '../../hooks/useExpenses'
import { useTransactions } from '../../hooks/useTransactions'
import { formatCurrency } from '../../utils/formatCurrency'

export default function FinanceDashboard() {
  const { user } = useAuth()
  const { summary: incomeSummary, loading: incomeLoading, error: incomeError } = useIncomeSummary()
  const { summary: expenseSummary, loading: expenseLoading } = useExpenseSummary()
  const { transactions, summary: txSummary, loading: txLoading } = useTransactions()

  const loading = incomeLoading || expenseLoading || txLoading

  if (loading) {
    return (
      <PageWrapper title="Finance Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (incomeError) {
    return (
      <PageWrapper title="Finance Dashboard">
        <Card>
          <p className="text-red-500 text-sm">Failed to load financial data: {incomeError}</p>
        </Card>
      </PageWrapper>
    )
  }

  const netToday = (incomeSummary.today || 0) - (expenseSummary.today || 0)
  const netMonth = (incomeSummary.month || 0) - (expenseSummary.month || 0)

  return (
    <PageWrapper title="Finance Dashboard">
      <p className="text-sm text-gray-500 mb-6">Welcome, {user?.name || user?.email}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Income (Month)</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(incomeSummary.month || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Today: {formatCurrency(incomeSummary.today || 0)}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Expenses (Month)</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <TrendingDown size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(expenseSummary.month || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">Today: {formatCurrency(expenseSummary.today || 0)}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Net Today</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${netToday >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <DollarSign size={20} className={netToday >= 0 ? 'text-emerald-500' : 'text-red-500'} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${netToday >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(netToday))}
          </p>
          <p className="text-xs text-gray-400 mt-1">{netToday >= 0 ? 'Profit' : 'Loss'}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Net Month</h3>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${netMonth >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <BarChart3 size={20} className={netMonth >= 0 ? 'text-emerald-500' : 'text-red-500'} />
            </div>
          </div>
          <p className={`text-2xl font-bold ${netMonth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatCurrency(Math.abs(netMonth))}
          </p>
          <p className="text-xs text-gray-400 mt-1">{netMonth >= 0 ? 'Profit' : 'Loss'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Income Breakdown */}
        <Card title="Income Summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Today</span>
              <span className="text-sm font-bold text-green-700">{formatCurrency(incomeSummary.today || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">This Week</span>
              <span className="text-sm font-bold text-green-700">{formatCurrency(incomeSummary.week || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">This Month</span>
              <span className="text-sm font-bold text-green-700">{formatCurrency(incomeSummary.month || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">All Time</span>
              <span className="text-sm font-bold text-green-700">{formatCurrency(incomeSummary.total || 0)}</span>
            </div>
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card title="Expense Summary">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Today</span>
              <span className="text-sm font-bold text-red-700">{formatCurrency(expenseSummary.today || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">This Week</span>
              <span className="text-sm font-bold text-red-700">{formatCurrency(expenseSummary.week || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">This Month</span>
              <span className="text-sm font-bold text-red-700">{formatCurrency(expenseSummary.month || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">All Time</span>
              <span className="text-sm font-bold text-red-700">{formatCurrency(expenseSummary.total || 0)}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card title="Recent Transactions" subtitle={`${transactions.length} entries`}>
        {transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Type</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Product</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.slice(0, 8).map(tx => (
                  <tr key={tx.id}>
                    <td className="py-2">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        tx.type === 'sale' ? 'bg-green-100 text-green-700' :
                        tx.type === 'restock' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 text-sm text-gray-700 truncate max-w-[200px]">
                      {tx.product?.name || '—'}
                    </td>
                    <td className="py-2 text-sm font-bold text-gray-900 text-right">
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No transactions found</p>
        )}
      </Card>
    </PageWrapper>
  )
}

// TODO: Phase 6
