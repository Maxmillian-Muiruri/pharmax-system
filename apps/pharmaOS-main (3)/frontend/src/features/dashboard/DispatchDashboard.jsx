// Phase 5 - Role Dashboards
import { Truck, Package, ShoppingCart, Clock } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'
import { formatCurrency } from '../../utils/formatCurrency'

export default function DispatchDashboard() {
  const { user } = useAuth()
  const { orders, loading: ordersLoading, error: ordersError } = useOrders()
  const { products, loading: productsLoading } = useProducts()

  const loading = ordersLoading || productsLoading

  if (loading) {
    return (
      <PageWrapper title="Dispatch Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (ordersError) {
    return (
      <PageWrapper title="Dispatch Dashboard">
        <Card>
          <p className="text-red-500 text-sm">Failed to load data: {ordersError}</p>
        </Card>
      </PageWrapper>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const processingOrders = orders.filter(o => o.status === 'processing')
  const outForDelivery = orders.filter(o => o.status === 'out_for_delivery')
  const completedOrders = orders.filter(o => o.status === 'completed')
  const lowStock = products.filter(p => p.quantity < (p.minimumStock || 10))

  return (
    <PageWrapper title="Dispatch Dashboard">
      <p className="text-sm text-gray-500 mb-6">Welcome, {user?.name || user?.email}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Clock size={20} className="text-yellow-500" />
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
            <h3 className="text-sm font-medium text-gray-500">Out for Delivery</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Truck size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{outForDelivery.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Completed</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedOrders.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Orders to Process */}
        <Card title="Orders to Process" subtitle={`${pendingOrders.length + processingOrders.length} actionable`}>
          {[...pendingOrders, ...processingOrders].length > 0 ? (
            <div className="space-y-3">
              {[...pendingOrders, ...processingOrders].slice(0, 8).map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.orderNumber} · Qty: {order.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No orders to process</p>
          )}
        </Card>

        {/* Out for Delivery */}
        <Card title="Out for Delivery" subtitle={`${outForDelivery.length} active`}>
          {outForDelivery.length > 0 ? (
            <div className="space-y-3">
              {outForDelivery.slice(0, 8).map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.orderNumber}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0 ml-2">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No active deliveries</p>
          )}
        </Card>
      </div>

      {/* Low Stock Notice */}
      {lowStock.length > 0 && (
        <Card title="Low Stock Notice" subtitle={`${lowStock.length} items below minimum`}>
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
        </Card>
      )}
    </PageWrapper>
  )
}

// TODO: Phase 6
