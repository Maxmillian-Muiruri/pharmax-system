import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Table from '../components/ui/Table'
import EmptyState from '../components/ui/EmptyState'
import ConfirmModal from '../components/ui/ConfirmModal'
import ProductModal from '../components/forms/ProductModal'
import { useToast } from '../context/ToastContext'
import { useProducts } from '../hooks/useProducts'
import { formatCurrency } from '../utils/formatCurrency'
import { formatDate } from '../utils/formatDate'
import { productsApi } from '../services/api'

const categoryOptions = [
  { value: '', label: 'Select Category' },
  { value: 'Antibiotics', label: 'Antibiotics' },
  { value: 'Analgesics', label: 'Analgesics' },
  { value: 'Antifungals', label: 'Antifungals' },
  { value: 'Vitamins', label: 'Vitamins' },
  { value: 'Diabetic', label: 'Diabetic' },
  { value: 'Cardiovascular', label: 'Cardiovascular' },
  { value: 'Gastrointestinal', label: 'Gastrointestinal' },
  { value: 'Antihistamines', label: 'Antihistamines' },
  { value: 'Other', label: 'Other' },
]

const statusTabs = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'near_expiry', label: 'Near-Expiry' },
  { value: 'out_of_stock', label: 'Low Stock' },
]

export default function Inventory() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const toast = useToast()
  
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    unitPrice: 0,
    expiryDate: '',
    supplier: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const statusFilter = searchParams.get('status') || ''
  const searchParam = searchParams.get('search') || ''
  const [search, setSearch] = useState(searchParam)

  // Sync search state when URL param changes (e.g. from navbar search)
  useEffect(() => {
    setSearch(searchParams.get('search') || '')
  }, [searchParams])

  const { products, loading, refetch } = useProducts({ 
    status: statusFilter || undefined,
    search: search || undefined,
  })
    if (product) {
      setSelectedProduct(product)
      setFormData({
        name: product.name,
        category: product.category || '',
        quantity: product.quantity,
        unitPrice: Number(product.unitPrice),
        expiryDate: product.expiryDate.split('T')[0],
        supplier: product.supplier || '',
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        name: '',
        category: '',
        quantity: 0,
        unitPrice: 0,
        expiryDate: '',
        supplier: '',
      })
    }
    setFormErrors({})
    setIsModalOpen(true)
  }

  const handleOpenDeleteModal = (product) => {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name.trim()) errors.name = 'Product name is required'
    if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required'
    if (formData.quantity < 0) errors.quantity = 'Quantity must be >= 0'
    if (formData.unitPrice < 0) errors.unitPrice = 'Price must be >= 0'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setSaving(true)
    try {
      if (selectedProduct) {
        await productsApi.update(selectedProduct.id, formData)
        toast.success('Product updated successfully')
      } else {
        await productsApi.create(formData)
        toast.success('Product created successfully')
      }
      setIsModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await productsApi.remove(selectedProduct.id)
      toast.success('Product deleted successfully')
      setIsDeleteModalOpen(false)
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to delete product')
    } finally {
      setDeleting(false)
    }
  }

  const handleFilterChange = (status) => {
    const newParams = new URLSearchParams(searchParams)
    if (status) {
      newParams.set('status', status)
    } else {
      newParams.delete('status')
    }
    setSearchParams(newParams)
  }

  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => (
      <span className="font-medium text-gray-900">{row.name}</span>
    )},
    { header: 'Category', accessor: 'category', render: (row) => (
      <span className="text-gray-500">{row.category || '-'}</span>
    )},
    { header: 'Qty', accessor: 'quantity', align: 'right', render: (row) => (
      <span className={row.quantity < 10 ? 'text-red-600 font-semibold' : ''}>
        {row.quantity}
      </span>
    )},
    { header: 'Unit Price', accessor: 'unitPrice', align: 'right', render: (row) => (
      <span>{formatCurrency(row.unitPrice)}</span>
    )},
    { header: 'Expiry Date', accessor: 'expiryDate', render: (row) => (
      <span className={row.status === 'expired' ? 'text-red-600' : ''}>
        {formatDate(row.expiryDate)}
      </span>
    )},
    { header: 'Status', accessor: 'status', align: 'center', render: (row) => (
      <Badge status={row.status} />
    )},
    { header: 'Actions', align: 'right', render: (row) => (
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); handleOpenModal(row); }}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row); }}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 size={16} />
        </button>
      </div>
    )},
  ]

  return (
    <PageWrapper 
      title="Inventory"
      action={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate('/import')}>
            ⬆ Import CSV
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={16} className="mr-2" />
            Add Product
          </Button>
        </div>
      }
    >
      {/* Filter Tabs - Mobile scrollable */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleFilterChange(tab.value)}
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
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* Table - with mobileCard prop for responsive view */}
      <Table
        columns={columns}
        data={products}
        loading={loading}
        onRowClick={(row) => handleOpenModal(row)}
        mobileCard={true}
        emptyState={
          <EmptyState
            icon={<Package size={48} />}
            title="No products found"
            description="Add your first product to get started"
            action={
              <Button onClick={() => handleOpenModal()}>
                <Plus size={16} className="mr-2" />
                Add Product
              </Button>
            }
          />
        }
      />

      {/* Add/Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSuccess={() => refetch()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Remove Product"
        message={`This action cannot be undone. This will permanently delete "${selectedProduct?.name}" from your inventory.`}
        confirmLabel="Remove Product"
        loading={deleting}
      />
    </PageWrapper>
  )
}
