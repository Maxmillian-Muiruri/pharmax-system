// Phase 5 - Role Dashboards
import { Package, ShoppingCart, Truck, Users } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'
import { usePurchaseSummary } from '../../hooks/usePurchases'
import { useCustomers } from '../../hooks/useCustomers'
import { formatCurrency } from '../../utils/formatCurrency'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const { orders, loading: ordersLoading, error: ordersError } = useOrders()
  const { products, loading: productsLoading } = useProducts()
  const { summary: purchaseSummary, loading: purchasesLoading } = usePurchaseSummary()
  const { customers, loading: customersLoading } = useCustomers()

  const loading = ordersLoading || productsLoading || purchasesLoading || customersLoading

  if (loading) {
    return (
      <PageWrapper title="Manager Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (ordersError) {
    return (
      <PageWrapper title="Manager Dashboard">
        <Card>
          <p className="text-red-500 text-sm">Failed to load data: {ordersError}</p>
        </Card>
      </PageWrapper>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const processingOrders = orders.filter(o => o.status === 'processing')
  const lowStock = products.filter(p => p.quantity < (p.minimumStock || 10))

  return (
    <PageWrapper title="Manager Dashboard">
      <p className="text-sm text-gray-500 mb-6">Welcome, {user?.name || user?.email}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-yellow-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Processing</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Package size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{processingOrders.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <Package size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{lowStock.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Purchases (Month)</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Truck size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(purchaseSummary.month || 0)}</p>
          <p className="text-xs text-gray-400 mt-1">{purchaseSummary.monthCount || 0} orders</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <Card title="Recent Orders" subtitle={`${orders.length} total`}>
          {orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 6).map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.orderNumber}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge status={order.status} />
                    <span className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No orders found</p>
          )}
        </Card>

        {/* Low Stock */}
        <Card title="Low Stock Items" subtitle={`${lowStock.length} items need restocking`}>
          {lowStock.length > 0 ? (
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
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">All stock levels are healthy</p>
          )}
        </Card>
      </div>

      {/* Customers Summary */}
      <Card title="Customers" subtitle={`${customers.length} total`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Users size={20} className="text-forty-accent mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{customers.length}</p>
            <p className="text-xs text-gray-400">Total</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <ShoppingCart size={20} className="text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{orders.length}</p>
            <p className="text-xs text-gray-400">Orders</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Package size={20} className="text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{products.length}</p>
            <p className="text-xs text-gray-400">Products</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Truck size={20} className="text-purple-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-gray-900">{purchaseSummary.weekCount || 0}</p>
            <p className="text-xs text-gray-400">Purchases (Week)</p>
          </div>
        </div>
      </Card>
    </PageWrapper>
  )
}

// TODO: Phase 6
