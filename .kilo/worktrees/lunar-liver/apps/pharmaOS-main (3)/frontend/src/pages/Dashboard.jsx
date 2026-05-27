import { useState, useEffect } from 'react'
import { Package, Users, UserSquare2, AlertTriangle, TrendingUp, TrendingDown, MoreHorizontal, ShoppingCart, Lock } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { formatCurrency } from '../utils/formatCurrency'
import { productsApi, ordersApi, analyticsApi } from '../services/api'
import { useTopCustomers } from '../hooks/useCustomers'

// Access Denied Component
function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
      <Lock size={32} className="mb-2" />
      <p className="text-sm font-medium">Access Denied</p>
      <p className="text-xs mt-1">You don't have permission to view this data</p>
    </div>
  )
}

// --- Dashboard Component ---

function MetricCard({ title, value, trend, icon: Icon, colorClass, iconBg }) {
  return (
    <Card className="border-none shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={colorClass} />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-400 font-medium">
          <span className={trend.includes('+') ? 'text-green-500' : 'text-red-500'}>{trend}</span>
        </p>
      </div>
    </Card>
  )
}

export default function Dashboard() {
  const [data, setData] = useState({
    products: [],
    lowStock: [],
    expired: [],
    salesTrend: [],
    profitLoss: [],
    revenue: {},
    purchaseTrend: [],
    dashboardKPIs: null,
    reportData: [],
    salesPurchaseData: [],
  })
  const [permissions, setPermissions] = useState({
    analytics: true,
    products: true,
    orders: true,
    customers: true,
  })
  const [loading, setLoading] = useState(true)
  const { customers: topCustomers } = useTopCustomers()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch each endpoint individually to handle 403s gracefully
      const results = await Promise.allSettled([
        productsApi.getAll({}),
        ordersApi.getAll({}),
        analyticsApi.sales(30),
        analyticsApi.profitLoss({ months: 7 }),
        analyticsApi.revenue({ period: 30 }),
        analyticsApi.dashboard(),
      ])

      const [productsRes, ordersRes, trendRes, profitLossRes, revenueRes, dashboardRes] = results

      // Track permissions
      const newPermissions = {
        analytics: true,
        products: true,
        orders: true,
        customers: true,
      }

      // Helper: any rejection means no access for that section
      const isRejected = (result) => result.status === 'rejected'

      // Check permissions
      if (isRejected(productsRes)) newPermissions.products = false
      if (isRejected(ordersRes)) newPermissions.orders = false
      if (isRejected(trendRes) || isRejected(profitLossRes) || isRejected(revenueRes) || isRejected(dashboardRes)) {
        newPermissions.analytics = false
      }

      setPermissions(newPermissions)

      // Extract data or use defaults
      const products = productsRes.status === 'fulfilled' ? (productsRes.value.data || []) : []
      const profitLoss = profitLossRes.status === 'fulfilled' ? (profitLossRes.value.data || []) : []
      const revenue = revenueRes.status === 'fulfilled' ? (revenueRes.value.data || {}) : {}
      const salesTrend = trendRes.status === 'fulfilled' ? (trendRes.value.data?.data || []) : []
      const dashboardKPIs = dashboardRes.status === 'fulfilled' ? (dashboardRes.value.data || null) : null

      // Build purchase trend data for sales & purchase chart
      const salesPurchaseData = salesTrend.map(d => ({
        day: d.formattedDate.split(' ')[1] || d.formattedDate,
        sales: d.amount,
        purchase: Math.round(d.amount * 0.6), // Estimated purchase ratio
      }))

      // Revenue breakdown for donut chart
      const reportData = [
        { name: 'Sales', value: revenue.sales || 0, color: '#8231D3' },
        { name: 'Other Income', value: revenue.income || 0, color: '#00987F' },
        { name: 'Expenses', value: revenue.expenses || 0, color: '#EF4444' },
      ].filter(d => d.value > 0)

      setData({
        products,
        lowStock: products.filter(p => p.quantity < (p.minimumStock || 10)).slice(0, 5),
        expired: products.filter(p => p.status === 'expired').slice(0, 5),
        salesTrend,
        profitLoss,
        revenue,
        salesPurchaseData,
        reportData,
        dashboardKPIs,
      })
    } catch (err) {
      console.error('Failed to fetch dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  const kpis = data.dashboardKPIs || {}
  const reportData = data.reportData || []
  const salesPurchaseData = data.salesPurchaseData || []
  const profitLoss = data.profitLoss || []

  return (
    <PageWrapper>
      {/* 4-Card KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Customers"
          value={permissions.analytics ? (kpis.totalCustomers || 0) : '—'}
          trend={permissions.analytics ? "+0 Today" : "Restricted"}
          icon={Users}
          colorClass="text-forty-accent"
          iconBg="bg-forty-accent/10"
        />
        <MetricCard
          title="Total Suppliers"
          value={permissions.analytics ? (kpis.totalSuppliers || 0) : '—'}
          trend={permissions.analytics ? "+0 Today" : "Restricted"}
          icon={UserSquare2}
          colorClass="text-forty-primary"
          iconBg="bg-forty-primary/10"
        />
        <MetricCard
          title="Stock Medicine"
          value={permissions.products ? (kpis.stockMedicine || 0) : '—'}
          trend={permissions.products ? "+0 Today" : "Restricted"}
          icon={Package}
          colorClass="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <MetricCard
          title="Expired Medicine"
          value={permissions.products ? (kpis.expiredCount || 0) : '—'}
          trend={permissions.products ? "+0 Today" : "Restricted"}
          icon={AlertTriangle}
          colorClass="text-forty-red"
          iconBg="bg-forty-red/10"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Profit / Loss Bar Chart */}
        <Card title="Monthly Profit / Loss" className="lg:col-span-3 shadow-sm border-none">
          <div className="h-[220px] sm:h-[300px]">
            {permissions.analytics ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={profitLoss}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#8231D3" radius={[4, 4, 0, 0]} barSize={20} name="Revenue" />
                  <Bar dataKey="cost" fill="#FFB444" radius={[4, 4, 0, 0]} barSize={20} name="Cost" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <AccessDenied />
            )}
          </div>
        </Card>

        {/* Overall Report Donut Chart */}
        <Card title="Revenue Breakdown" className="lg:col-span-2 shadow-sm border-none">
          {permissions.analytics ? (
            <>
              {/* Legend — above the chart for clear visibility */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {reportData.length > 0 ? reportData.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col gap-1 px-2 sm:px-3 py-2 rounded-lg"
                    style={{ backgroundColor: `${item.color}12` }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 uppercase tracking-wide truncate">{item.name}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-gray-800 truncate">{formatCurrency(item.value)}</p>
                  </div>
                )) : (
                  <div className="col-span-3 text-xs text-gray-400 text-center py-1">No data available</div>
                )}
              </div>

              {/* Donut chart — no center text */}
              <div className="h-[200px]">
                {reportData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData}
                        cx="50%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {reportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
                )}
              </div>

              {/* Net summary — below chart, full width, clearly visible */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl mt-3 ${data.revenue.net >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${data.revenue.net >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className={`text-xs font-semibold ${data.revenue.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {data.revenue.net >= 0 ? 'Net Revenue' : 'Net Loss'}
                  </span>
                </div>
                <span className={`text-sm font-bold ${data.revenue.net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {data.revenue.net >= 0
                    ? formatCurrency(data.revenue.net || 0)
                    : formatCurrency(Math.abs(data.revenue.net))}
                </span>
              </div>
            </>
          ) : (
            <AccessDenied />
          )}
        </Card>
      </div>

      {/* Secondary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales & Purchase Trends */}
        <Card title="Sales & Purchase" className="lg:col-span-2 shadow-sm border-none">
          <div className="h-[220px] sm:h-[300px]">
            {permissions.analytics ? (
              salesPurchaseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesPurchaseData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="sales" stroke="#8231D3" strokeWidth={3} dot={false} name="Sales" />
                    <Line type="monotone" dataKey="purchase" stroke="#00987F" strokeWidth={3} dot={false} name="Purchases" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>
              )
            ) : (
              <AccessDenied />
            )}
          </div>
        </Card>

        {/* Low Stock Table */}
        <Card
          title="Low Stock"
          subtitle="Total Summary"
          action={<button className="text-xs text-forty-primary font-bold">View All</button>}
          className="shadow-sm border-none"
        >
          {permissions.products ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Medicine Name</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Batch</th>
                    <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.lowStock.length > 0 ? data.lowStock.map((item) => (
                    <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 text-sm font-medium text-gray-700">{item.name}</td>
                      <td className="py-3 text-xs text-gray-400">NZ421</td>
                      <td className="py-3 text-sm font-bold text-red-500 text-right">{item.quantity}</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="py-4 text-center text-xs text-gray-400">No low stock items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <AccessDenied />
          )}
        </Card>
      </div>

      {/* Bottom Grid: Top 5 and Expired */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <Card title="Top 5 Product" className="shadow-sm border-none">
          {permissions.products ? (
            <div className="space-y-4">
              {data.products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-forty-accent/20 to-forty-primary/20 flex items-center justify-center">
                      <Package size={20} className="text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                    <p className="text-[10px] text-gray-400">Batch: NZ421  |  Price: {formatCurrency(product.unitPrice)}</p>
                  </div>
                  <button className="p-1 text-gray-300 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                </div>
              ))}
            </div>
          ) : (
            <AccessDenied />
          )}
        </Card>

        {/* Top 5 Customers */}
        <Card title="Top 5 Customer" className="shadow-sm border-none">
          {permissions.customers ? (
            <div className="space-y-4">
              {topCustomers.length > 0 ? topCustomers.map((customer, idx) => (
                <div key={customer.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-forty-accent/10 text-forty-accent flex items-center justify-center font-bold text-sm">
                    {customer.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900 truncate">{customer.name}</h4>
                    <p className="text-[10px] text-gray-400">{customer.phone} · {formatCurrency(customer.totalSpent)}</p>
                  </div>
                  <button className="p-1 text-gray-300 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                </div>
              )) : (
                <div className="text-center py-8">
                  <p className="text-xs text-gray-400 font-medium">No customer data yet</p>
                </div>
              )}
            </div>
          ) : (
            <AccessDenied />
          )}
        </Card>

        {/* Expired Products */}
        <Card title="Expired Product" className="shadow-sm border-none">
          <div className="space-y-4">
            {data.expired.length > 0 ? data.expired.map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex-shrink-0 flex items-center justify-center text-red-500">
                  <Package size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                  <p className="text-[10px] text-red-500 font-medium">Expired: Nov 24, 2024</p>
                </div>
                <button className="p-1 text-gray-300 hover:text-gray-600"><MoreHorizontal size={16} /></button>
              </div>
            )) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 text-gray-400">
                  <AlertTriangle size={24} />
                </div>
                <p className="text-xs text-gray-400 font-medium">No expired products found</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}
