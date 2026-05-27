// Phase 5 - Role Dashboards
import { FileText, Package, ShoppingCart, AlertTriangle } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { usePrescriptions } from '../../hooks/usePrescriptions'
import { useOrders } from '../../hooks/useOrders'
import { useProducts } from '../../hooks/useProducts'
import { useAlerts } from '../../hooks/useAlerts'

export default function PharmacistDashboard() {
  const { user } = useAuth()
  const { prescriptions, loading: rxLoading, error: rxError } = usePrescriptions()
  const { orders, loading: ordersLoading } = useOrders()
  const { products, loading: productsLoading } = useProducts()
  const { alerts, unreadCount, loading: alertsLoading } = useAlerts()

  const loading = rxLoading || ordersLoading || productsLoading || alertsLoading

  if (loading) {
    return (
      <PageWrapper title="Pharmacist Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (rxError) {
    return (
      <PageWrapper title="Pharmacist Dashboard">
        <Card>
          <p className="text-red-500 text-sm">Failed to load data: {rxError}</p>
        </Card>
      </PageWrapper>
    )
  }

  const pendingRx = prescriptions.filter(rx => rx.status === 'under_review')
  const recentOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing')
  const lowStock = products.filter(p => p.quantity < (p.minimumStock || 10))

  return (
    <PageWrapper title="Pharmacist Dashboard">
      <p className="text-sm text-gray-500 mb-6">Welcome, {user?.name || user?.email}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Prescriptions to Review</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <FileText size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingRx.length}</p>
          <p className="text-xs text-gray-400 mt-1">{prescriptions.length} total</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Active Orders</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{recentOrders.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Low Stock</h3>
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Package size={20} className="text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{lowStock.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Alerts</h3>
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Prescriptions Awaiting Review */}
        <Card title="Prescriptions Awaiting Review" subtitle={`${pendingRx.length} pending`}>
          {pendingRx.length > 0 ? (
            <div className="space-y-3">
              {pendingRx.slice(0, 6).map(rx => (
                <div key={rx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{rx.patientName}</p>
                    <p className="text-xs text-gray-400">Dr. {rx.doctorName} · {rx.hospitalName}</p>
                  </div>
                  <Badge status={rx.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No prescriptions awaiting review</p>
          )}
        </Card>

        {/* Active Orders */}
        <Card title="Active Orders" subtitle={`${recentOrders.length} in progress`}>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.slice(0, 6).map(order => (
                <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.orderNumber}</p>
                  </div>
                  <Badge status={order.status} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No active orders</p>
          )}
        </Card>
      </div>

      {/* Alerts */}
      <Card title="Stock Alerts" subtitle={`${unreadCount} unread`}>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-700">{alert.message}</p>
                  <Badge status={alert.type}>{alert.type.replace('_', ' ')}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No alerts</p>
        )}
      </Card>
    </PageWrapper>
  )
}

// TODO: Phase 6
