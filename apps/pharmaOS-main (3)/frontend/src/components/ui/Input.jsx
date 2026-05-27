export default function Input({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-3 sm:px-4 py-2.5 sm:py-2 text-base sm:text-sm border rounded-lg transition-shadow
          focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
          ${error ? 'border-red-500' : 'border-gray-200'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
