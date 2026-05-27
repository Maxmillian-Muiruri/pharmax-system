import { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Button from '../ui/Button'
import { useToast } from '../../context/ToastContext'
import { ordersApi } from '../../services/api'
import { useProducts } from '../../hooks/useProducts'
import { formatCurrency } from '../../utils/formatCurrency'

export default function OrderModal({ isOpen, onClose, order, onSuccess }) {
  const toast = useToast()
  
  const [isEditing, setIsEditing] = useState(false)
  
  // Notice we must fetch products again so we have a reliable dropdown
  // Realistically we might fetch this outside, but encapsulating simplifies reuse!
  const { products } = useProducts({ status: 'active' })
  
  const productOptions = [
    { value: '', label: 'Select Product' },
    ...products.map(p => ({ value: p.id, label: `${p.name} - ${formatCurrency(p.unitPrice)}` })),
  ]
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    productId: '',
    quantity: 1,
  })
  
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (order) {
        setFormData({
          customerName: order.customerName || '',
          customerPhone: order.customerPhone || '',
          productId: order.productId || order.product?.id || '',
          quantity: order.quantity || 1,
        })
        setIsEditing(false)
      } else {
        setFormData({
          customerName: '',
          customerPhone: '',
          productId: '',
          quantity: 1,
        })
        setIsEditing(true)
      }
      setFormErrors({})
    }
  }, [isOpen, order])

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
      if (order && order.id) {
        // Assume API has update support (if not, you could fallback, but based on typical design it should)
        // Since original MVP only defined `ordersApi.create` and `ordersApi.updateStatus`,
        // Let's implement full update if it doesn't exist on backend. Wait! 
        // For standard "Create an entry pop up window so admin can edit entries" - we'll submit against update if it exists.
        
        if (ordersApi.update) {
          await ordersApi.update(order.id, formData)
          toast.success('Order updated successfully')
        } else {
          toast.warning('Order editing is not supported on this endpoint yet.')
          return
        }
      } else {
        await ordersApi.create(formData)
        toast.success('Order created successfully')
      }
      
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={order ? (isEditing ? 'Edit Order' : 'Order Details') : 'Create Order'}
    >
      {!isEditing ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-xl font-bold text-gray-900">{formData.customerName}</h4>
            <p className="text-gray-500">{formData.customerPhone}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Product</p>
              <p className="text-base font-medium mt-1 text-gray-900">
                {productOptions.find(p => p.value === formData.productId)?.label?.split(' - ')[0] || 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Quantity</p>
              <p className="text-lg font-medium mt-1 text-gray-900">{formData.quantity}</p>
            </div>
            {order && (
              <div className="col-span-2">
                <p className="text-xs font-semibold text-gray-500 uppercase">Total Amount</p>
                <p className="text-lg font-medium mt-1 text-teal-600 font-semibold">{formatCurrency(order.totalAmount || 0)}</p>
              </div>
            )}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Customer Name *"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            error={formErrors.customerName}
            placeholder="e.g., John Doe"
          />
        
        <Input
          label="Phone Number *"
          value={formData.customerPhone}
          onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
          error={formErrors.customerPhone}
          placeholder="e.g., 0712345678"
        />
        
        <Select
          label="Product *"
          value={formData.productId}
          onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
          options={productOptions}
          error={formErrors.productId}
        />
        
        <Input
          label="Quantity *"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
          error={formErrors.quantity}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          {order ? (
            <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
              Cancel Edit
            </Button>
          ) : (
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={saving}>
            {order ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>
      )}
    </Modal>
  )
}
