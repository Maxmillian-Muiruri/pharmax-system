export const STATUS_STYLES = {
  // Product status
  active: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  near_expiry: 'bg-amber-100 text-amber-800',
  out_of_stock: 'bg-gray-100 text-gray-600',
  // Order status
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
  // Transaction type
  sale: 'bg-green-100 text-green-800',
  restock: 'bg-blue-100 text-blue-800',
  write_off: 'bg-red-100 text-red-800',
}

export function statusBadge(status) {
  return STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'
}
