export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="py-16 text-center">
      {icon && (
        <div className="text-gray-300 mb-4 flex justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}
