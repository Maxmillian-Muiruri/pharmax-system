import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart } from 'recharts'
import PageWrapper from '../components/layout/PageWrapper'
import Card from '../components/ui/Card'
import { analyticsApi } from '../services/api'
import { formatCurrency } from '../utils/formatCurrency'

const periodTabs = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' },
]

const metricTabs = [
  { value: 'units', label: 'By Units' },
  { value: 'revenue', label: 'By Revenue' },
]

const periodFilterTabs = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
]

export default function Analytics() {
  const [salesPeriod, setSalesPeriod] = useState(7)
  const [productMetric, setProductMetric] = useState('units')
  const [productPeriod, setProductPeriod] = useState('week')
  const [salesData, setSalesData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)

  useEffect(() => {
    fetchAnalytics()
  }, [salesPeriod, productMetric, productPeriod])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [salesRes, productsRes] = await Promise.all([
        analyticsApi.sales(salesPeriod),
        analyticsApi.topProducts({ metric: productMetric, period: productPeriod }),
      ])
      setSalesData(salesRes.data?.data || [])
      setTopProducts(productsRes.data?.data || [])
      setTotalRevenue(salesRes.data?.total || 0)
    } catch (err) {
      console.error('Failed to load analytics', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper title="Analytics">
      <div className="space-y-4 sm:space-y-6">
        {/* Sales Trend Chart */}
        <Card
          title="Revenue Trend"
          action={
            <div className="flex gap-1 sm:gap-2 overflow-x-auto">
              {periodTabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setSalesPeriod(tab.value)}
                  className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    salesPeriod === tab.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          }
        >
          {loading ? (
            <div className="h-64 sm:h-72 flex items-center justify-center text-gray-500">Loading...</div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-xs sm:text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
              <ResponsiveContainer width="100%" height={240} minHeight={240}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="formattedDate"
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9CA3AF"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#0D9488"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    fillOpacity={0.3}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#0D9488"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </>
          )}
        </Card>

        {/* Top Products Chart */}
        <Card
          title="Top Products"
          action={
            <div className="flex flex-wrap gap-2">
              <div className="flex gap-1.5">
                {metricTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setProductMetric(tab.value)}
                    className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      productMetric === tab.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {periodFilterTabs.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setProductPeriod(tab.value)}
                    className={`px-2 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                      productPeriod === tab.value
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          {loading ? (
            <div className="h-72 flex items-center justify-center text-gray-500">Loading...</div>
          ) : topProducts.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-500">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 60, right: 10 }}>
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={productMetric === 'revenue' ? (v) => `KES ${v}` : (v) => v}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#374151"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value, name, props) => [
                    productMetric === 'revenue' ? formatCurrency(value) : value,
                    productMetric === 'revenue' ? 'Revenue' : 'Units Sold'
                  ]}
                />
                <Bar
                  dataKey={productMetric === 'revenue' ? 'revenue' : 'units'}
                  fill="#0D9488"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </PageWrapper>
  )
}
