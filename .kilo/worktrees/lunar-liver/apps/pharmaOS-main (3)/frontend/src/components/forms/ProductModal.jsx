import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { useToast } from '../../context/ToastContext'
import { productsApi } from '../../services/api'

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

export default function ProductModal({ isOpen, onClose, product, onSuccess }) {
  const toast = useToast()
  
  // Dynamic switch between purely viewing details and editing the database object
  const [isEditing, setIsEditing] = useState(false)
  
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

  // Initialize form when opened or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          name: product.name || '',
          category: product.category || '',
          quantity: product.quantity || 0,
          unitPrice: Number(product.unitPrice) || 0,
          expiryDate: product.expiryDate ? product.expiryDate.split('T')[0] : '',
          supplier: product.supplier || '',
        })
        setIsEditing(false) // Default to view mode for existing product (so it acts as details popup)
      } else {
        setFormData({
          name: '',
          category: '',
          quantity: 0,
          unitPrice: 0,
          expiryDate: '',
          supplier: '',
        })
        setIsEditing(true) // Default to edit mode for new product
      }
      setFormErrors({})
    }
  }, [isOpen, product])

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
      if (product && product.id) {
        await productsApi.update(product.id, formData)
        toast.success('Product updated successfully')
      } else {
        await productsApi.create(formData)
        toast.success('Product created successfully')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? (isEditing ? 'Edit Product' : 'Product Details') : 'Add Product'}
    >
      {/* If in View Mode, show a cleaner layout */}
      {!isEditing ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-gray-900">{formData.name}</h4>
            <p className="text-gray-500">{formData.category || 'Uncategorized'}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Quantity in Stock</p>
              <p className={`text-lg font-medium mt-1 ${formData.quantity < 10 ? 'text-red-600' : 'text-gray-900'}`}>{formData.quantity}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Unit Price</p>
              <p className="text-lg font-medium mt-1 text-gray-900">KES {formData.unitPrice.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Expiry Date</p>
              <p className="text-base mt-1 text-gray-900">{formData.expiryDate}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Supplier</p>
              <p className="text-base mt-1 text-gray-900">{formData.supplier || 'N/A'}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit Details
            </Button>
          </div>
        </div>
      ) : (
        /* Edit Mode layout */
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Product Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="e.g., Amoxicillin 500mg"
          />
        
        <Select
          label="Category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          options={categoryOptions}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantity *"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
            error={formErrors.quantity}
          />
          <Input
            label="Unit Price (KES) *"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
            error={formErrors.unitPrice}
          />
        </div>
        
        <Input
          label="Expiry Date *"
          type="date"
          value={formData.expiryDate}
          onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          error={formErrors.expiryDate}
        />
        
        <Input
          label="Supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder="Optional"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          {product ? (
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel Edit
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={saving}>
            {product ? 'Save Changes' : 'Add Product'}
          </Button>
        </div>
      </form>
      )}
    </Modal>
  )
}
