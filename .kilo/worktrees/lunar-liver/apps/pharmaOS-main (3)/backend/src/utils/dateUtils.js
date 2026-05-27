/**
 * Calculate product status based on quantity and expiry date
 * @param {number} quantity 
 * @param {Date|string} expiryDate 
 * @returns {'active'|'expired'|'near_expiry'|'out_of_stock'}
 */
export function calculateProductStatus(quantity, expiryDate) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  
  const nearExpiryDays = parseInt(process.env.NEAR_EXPIRY_DAYS) || 7
  const nearExpiryDate = new Date(today)
  nearExpiryDate.setDate(today.getDate() + nearExpiryDays)

  if (expiry < today) return 'expired'
  if (expiry <= nearExpiryDate) return 'near_expiry'
  if (quantity === 0) return 'out_of_stock'
  return 'active'
}
