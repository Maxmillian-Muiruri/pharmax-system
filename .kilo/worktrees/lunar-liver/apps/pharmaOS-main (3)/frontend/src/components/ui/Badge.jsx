import { statusBadge } from '../../utils/statusColor'

export default function Badge({ status, children }) {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    near_expiry: 'bg-amber-100 text-amber-800',
    out_of_stock: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-600',
    sale: 'bg-green-100 text-green-800',
    restock: 'bg-blue-100 text-blue-800',
    write_off: 'bg-red-100 text-red-800',
  }

  const colors = statusColors[status] || statusColors.cancelled
  const dotColors = {
    active: 'bg-green-500',
    expired: 'bg-red-500',
    near_expiry: 'bg-amber-500',
    out_of_stock: 'bg-gray-500',
    pending: 'bg-yellow-500',
    processing: 'bg-blue-500',
    completed: 'bg-green-500',
    cancelled: 'bg-gray-500',
  }

  const dotColor = dotColors[status] || 'bg-gray-500'

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {children || status.replace('_', ' ')}
    </span>
  )
}
