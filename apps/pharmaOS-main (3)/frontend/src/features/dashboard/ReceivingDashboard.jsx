// Phase 5 - Role Dashboards
import { Package, Truck, UserSquare2, ArrowDownToLine } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { usePurchases, usePurchaseSummary } from '../../hooks/usePurchases'
import { useProducts } from '../../hooks/useProducts'
import { useSuppliers } from '../../hooks/useSuppliers'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ReceivingDashboard() {
  const { user } = useAuth()
  const { purchases, loading: purchasesLoading, error: purchasesError } = usePurchases()
  const { summary: purchaseSummary, loading: summaryLoading } = usePurchaseSummary()
  const { products, loading: productsLoading } = useProducts()
  const { suppliers, loading: suppliersLoading } = useSuppliers()

  const loading = purchasesLoading || summaryLoading || productsLoading || suppliersLoading

  if (loading) {
    return (
      <PageWrapper title="Receiving Bay Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (purchasesError) {
    return (
      <PageWrapper title="Receiving Bay Dashboard">
        <Card>
          <p className="text-red-500 text-sm">Failed to load data: {purchasesError}</p>
        </Card>
      </PageWrapper>
    )
  }

  const lowStock = products.filter(p => p.quantity < (p.minimumStock || 10))

  return (
    <PageWrapper title="Receiving Bay Dashboard">
      <p className="text-sm text-gray-500 mb-6">Welcome, {user?.name || user?.email}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Purchases (Month)</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ArrowDownToLine size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(purchaseSummary.month || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{purchaseSummary.monthCount || 0} orders</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Purchases (Week)</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Truck size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(purchaseSummary.week || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{purchaseSummary.weekCount || 0} orders</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Package size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          <p className="text-xs text-gray-400 mt-1">{lowStock.length} low stock</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Suppliers</h3>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <UserSquare2 size={20} className="text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{suppliers.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Purchases */}
        <Card title="Recent Purchases" subtitle={`${purchases.length} total`}>
          {purchases.length > 0 ? (
            <div className="space-y-3">
              {purchases.slice(0, 6).map(purchase => (
                <div key={purchase.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {purchase.supplier?.name || purchase.supplierName || 'Unknown Supplier'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {purchase.invoiceNumber || purchase.id} · {purchase.itemCount || '—'} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-sm font-bold text-gray-900">
                      {formatCurrency(purchase.totalAmount || purchase.total || 0)}
                    </span>
                    {purchase.status && <Badge status={purchase.status} />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No purchases found</p>
          )}
        </Card>

        {/* Suppliers */}
        <Card title="Suppliers" subtitle={`${suppliers.length} registered`}>
          {suppliers.length > 0 ? (
            <div className="space-y-3">
              {suppliers.slice(0, 6).map(supplier => (
                <div key={supplier.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-forty-primary/10 text-forty-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {supplier.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 truncate">{supplier.name}</p>
                    <p className="text-xs text-gray-400">{supplier.phone || supplier.email || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No suppliers found</p>
          )}
        </Card>
      </div>

      {/* Low Stock */}
      {lowStock.length > 0 && (
        <Card title="Low Stock Items" subtitle={`${lowStock.length} items need restocking`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase">Medicine</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase text-center">Min</th>
                  <th className="py-2 text-xs font-bold text-gray-400 uppercase text-right">Current</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {lowStock.slice(0, 6).map(item => (
                  <tr key={item.id}>
                    <td className="py-2 text-sm text-gray-700">{item.name}</td>
                    <td className="py-2 text-xs text-gray-400 text-center">{item.minimumStock || 10}</td>
                    <td className="py-2 text-sm font-bold text-red-500 text-right">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PageWrapper>
  )
}

// TODO: Phase 6
