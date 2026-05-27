// Phase 5 - Role Dashboards
import { Truck, MapPin, CheckCircle, Clock } from 'lucide-react'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../hooks/useOrders'
import { formatCurrency } from '../../utils/formatCurrency'

export default function RiderDashboard() {
  const { user } = useAuth()
  const { orders, loading, error } = useOrders()

  if (loading) {
    return (
      <PageWrapper title="Rider Dashboard">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper title="Rider Dashboard">
        <Card>
          <p className="text-red-500 text-sm">Failed to load data: {error}</p>
        </Card>
      </PageWrapper>
    )
  }

  const outForDelivery = orders.filter(o => o.status === 'out_for_delivery')
  const completedToday = orders.filter(o => {
    if (o.status !== 'completed') return false
    const today = new Date().toDateString()
    return new Date(o.updatedAt || o.createdAt).toDateString() === today
  })
  const totalDelivered = orders.filter(o => o.status === 'completed').length

  return (
    <PageWrapper title="Rider Dashboard">
      <p className="text-sm text-gray-500 mb-6">Welcome, {user?.name || user?.email}</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Active Deliveries</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Truck size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{outForDelivery.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Delivered Today</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
        </Card>

        <Card className="border-none shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-500">Total Delivered</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <MapPin size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalDelivered}</p>
        </Card>
      </div>

      {/* Active Deliveries List */}
      <Card title="Active Deliveries" subtitle={`${outForDelivery.length} in transit`} className="mb-8">
        {outForDelivery.length > 0 ? (
          <div className="space-y-3">
            {outForDelivery.map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-purple-50/50 hover:bg-purple-50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-400">
                    {order.orderNumber} · {order.customerPhone || 'No phone'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  <Badge status={order.status}>In Transit</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Truck size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No active deliveries</p>
          </div>
        )}
      </Card>

      {/* Completed Today */}
      <Card title="Completed Today" subtitle={`${completedToday.length} deliveries`}>
        {completedToday.length > 0 ? (
          <div className="space-y-3">
            {completedToday.map(order => (
              <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{order.customerName}</p>
                  <p className="text-xs text-gray-400">{order.orderNumber}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(order.totalAmount)}</span>
                  <Badge status="completed" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No deliveries completed today</p>
        )}
      </Card>
    </PageWrapper>
  )
}

// TODO: Phase 6
