export default function Card({ children, title, subtitle, action, className = '' }) {
  return (
    <div className={`bg-white rounded-lg sm:rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {(title || action || subtitle) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <div className="min-w-0 flex-1">
            {title && <h3 className="text-base font-bold text-gray-900 truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="w-full sm:w-auto flex flex-wrap gap-2">{action}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  )
}
