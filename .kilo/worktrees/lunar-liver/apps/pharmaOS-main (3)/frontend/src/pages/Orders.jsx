import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Table from '../components/ui/Table'
import EmptyState from '../components/ui/EmptyState'
import OrderModal from '../components/forms/OrderModal'
import { useToast } from '../context/ToastContext'
import { useOrders } from '../hooks/useOrders'
import { useProducts } from '../hooks/useProducts'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { ordersApi } from '../services/api'

const statusTabs = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function Orders() {
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    productId: '',
    quantity: 1,
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [processing, setProcessing] = useState({})

  const { orders, loading, refetch } = useOrders({ 
    status: statusFilter || undefined,
    search: search || undefined,
  })
  const { products } = useProducts({ status: 'active' })

  const productOptions = [
    { value: '', label: 'Select Product' },
    ...products.map(p => ({ value: p.id, label: `${p.name} - ${formatCurrency(p.unitPrice)}` })),
  ]

  const handleOpenModal = (order = null) => {
    setSelectedOrder(order)
    setFormData({
      customerName: order ? order.customerName : '',
      customerPhone: order ? order.customerPhone : '',
      productId: order ? (order.productId || order.product?.id) : '',
      quantity: order ? order.quantity : 1,
    })
    setFormErrors({})
    setIsModalOpen(true)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.customerName.trim()) errors.customerName = 'Customer name is required'
    if (!formData.customerPhone.trim()) errors.customerPhone = 'Phone number is required'
    if (!formData.productId) errors.productId = 'Product is required'
    if (formData.quantity < 1) errors.quantity = 'Quantity must be at least 1'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      await ordersApi.create(formData)
      toast.success('Order created successfully')
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to create order')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusUpdate = async (orderId, status) => {
    setProcessing({ ...processing, [orderId]: true })
    try {
      await ordersApi.updateStatus(orderId, status)
      toast.success(`Order ${status}`)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to update order')
    } finally {
      setProcessing({ ...processing, [orderId]: false })
    }
  }

  const getActionButtons = (order) => {
    const isProcessing = processing[order.id]
    
    switch (order.status) {
      case 'pending':
        return (
          <Button 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'processing'); }}
            loading={isProcessing}
          >
            Start Processing
          </Button>
        )
      case 'processing':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="primary"
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'completed'); }}
              loading={isProcessing}
            >
              Complete
            </Button>
            <Button 
              size="sm" 
              variant="danger"
              onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order.id, 'cancelled'); }}
              loading={isProcessing}
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        )
      default:
        return <span className="text-gray-400 text-sm">—</span>
    }
  }

  const columns = [
    { header: 'Customer', accessor: 'customerName', render: (row) => (
      <div>
        <div className="font-medium text-gray-900">{row.customerName}</div>
        <div className="text-xs text-gray-500">{row.customerPhone}</div>
      </div>
    )},
    { header: 'Product', accessor: 'product', render: (row) => (
      <span className="text-gray-700">{row.product?.name || 'Unknown'}</span>
    )},
    { header: 'Qty', accessor: 'quantity', align: 'center', render: (row) => (
      <span>{row.quantity}</span>
    )},
    { header: 'Amount', accessor: 'totalAmount', align: 'right', render: (row) => (
      <span className="font-medium">{formatCurrency(row.totalAmount)}</span>
    )},
    { header: 'Status', accessor: 'status', align: 'center', render: (row) => (
      <Badge status={row.status} />
    )},
    { header: 'Date', accessor: 'createdAt', render: (row) => (
      <span className="text-sm text-gray-500">{formatDate(row.createdAt)}</span>
    )},
    { header: 'Action', align: 'right', render: (row) => getActionButtons(row) },
  ]

  return (
    <PageWrapper 
      title="Orders"
      action={
        <Button onClick={handleOpenModal} className="w-full sm:w-auto">
          Create Order
        </Button>
      }
    >
      {/* Filter Tabs - Mobile scrollable */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              statusFilter === tab.value
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Table - with mobileCard prop */}
      <Table
        columns={columns}
        data={orders}
        loading={loading}
        onRowClick={(row) => handleOpenModal(row)}
        mobileCard={true}
        emptyState={
          <EmptyState
            icon={<ShoppingCart size={48} />}
            title="No orders found"
            description="Create your first order to get started"
            action={
              <Button onClick={handleOpenModal}>
                Create Order
              </Button>
            }
          />
        }
      />

      {/* Create/Edit Order Modal */}
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        onSuccess={() => refetch()}
      />
    </PageWrapper>
  )
}
