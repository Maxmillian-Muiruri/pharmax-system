// Phase 5 - Role Dashboards
import { Package, Users, UserSquare2, AlertTriangle, ShoppingCart } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useAnalytics } from '../../hooks/useAnalytics'
import { useProducts } from '../../hooks/useProducts'
import { useOrders } from '../../hooks/useOrders'
import { useAlerts } from '../../hooks/useAlerts'
import { useTopCustomers } from '../../hooks/useCustomers'
import { formatCurrency } from '../../utils/formatCurrency'

export default function AdminDashboard() {
  const { user } = useAuth()
  const { salesData, topProducts, loading: analyticsLoading, error: analyticsError } = useAnalytics()
  const { products, loading: productsLoading } = useProducts()
  const { orders, loading: ordersLoading } = useOrders()
  const { alerts, unreadCount, loading: alertsLoading } = useAlerts()
  const { customers: topCustomers } = useTopCustomers()

  const loading = analyticsLoading || productsLoading || ordersLoading || alertsLoading

  if (loading) {
    return (
      <PageWrapper title="Admin Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (analyticsError) {
    return (
      <PageWrapper title="Admin Dashboard">
        <Card>
          <p className="text-red-500 text-sm">Failed to load dashboard data: {analyticsError}</p>
        </Card>
      </PageWrapper>
    )
  }

  const lowStock = products.filter(p => p.quantity < (p.minimumStock || 10))
  const expiredCount = products.filter(p => p.status === 'expired').length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalRevenue = salesData.reduce((sum, d) => sum + (d.amount || 0), 0)

  return (
    <PageWrapper title="Admin Dashboard">
      <p className="text-sm text-gray-500 mb-6">Welcome back, {user?.name || user?.email}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Package size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          <p className="text-xs text-gray-400 mt-1">{lowStock.length} low stock</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Pending Orders</h3>
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-yellow-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
          <p className="text-xs text-gray-400 mt-1">{orders.length} total orders</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Expired Items</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
          <p className="text-xs text-gray-400 mt-1">{unreadCount} unread alerts</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Recent Sales</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <Users size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Alerts */}
        <Card title="Recent Alerts" subtitle={`${unreadCount} unread`}>
          {alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-700 truncate">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      <Badge status={alert.type}>{alert.type.replace('_', ' ')}</Badge>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No unread alerts</p>
          )}
        </Card>

        {/* Top Products */}
        <Card title="Top Products">
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 5).map(product => (
                <div key={product.id || product.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate">{product.name}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0 ml-2">
                    {product.totalUnits || product.units || 0} units
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No product data</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock */}
        <Card title="Low Stock Items" subtitle={`${lowStock.length} items`}>
          {lowStock.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="py-2 text-xs font-bold text-gray-400 uppercase">Medicine</th>
                    <th className="py-2 text-xs font-bold text-gray-400 uppercase text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {lowStock.slice(0, 5).map(item => (
                    <tr key={item.id}>
                      <td className="py-2 text-sm text-gray-700">{item.name}</td>
                      <td className="py-2 text-sm font-bold text-red-500 text-right">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No low stock items</p>
          )}
        </Card>

        {/* Top Customers */}
        <Card title="Top Customers">
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.slice(0, 5).map(customer => (
                <div key={customer.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-forty-accent/10 text-forty-accent flex items-center justify-center font-bold text-xs">
                    {customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{customer.name}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(customer.totalSpent || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No customer data</p>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}

// TODO: Phase 6
