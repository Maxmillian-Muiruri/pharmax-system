import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function Table({ 
  columns = [], 
  data = [], 
  loading = false,
  emptyState,
  onRowClick,
  className = '',
  mobileCard = false // Use card view on mobile
}) {
  if (loading) {
    return (
      <div className="border rounded-xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50 hidden md:table-header-group">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 block md:table-row-group">
            {[1, 2, 3, 4, 5].map((row) => (
              <tr key={row} className="animate-pulse block md:table-row mb-4 md:mb-0 border md:border-0 rounded-lg overflow-hidden">
                {columns.map((_, idx) => (
                  <td key={idx} className="px-3 sm:px-4 py-3 block md:table-cell before:content-[attr(data-label)] before:font-semibold before:text-gray-600 before:block md:before:none before:mb-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (data.length === 0) {
    if (emptyState) {
      return emptyState
    }
    return (
      <EmptyState
        title="No data available"
        description="There are no records to display at this time."
      />
    )
  }

  // Mobile card view
  if (mobileCard) {
    return (
      <div className="space-y-3 md:space-y-0 md:border md:rounded-xl md:overflow-hidden">
        {/* Desktop table view */}
        <div className="hidden md:block border rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={`px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.map((row, rowIdx) => (
                <tr 
                  key={rowIdx} 
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td 
                      key={colIdx} 
                      className={`px-3 sm:px-4 py-3 text-sm ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden space-y-3">
          {data.map((row, rowIdx) => (
            <div
              key={rowIdx}
              className={`bg-white border rounded-lg p-4 space-y-2 ${onRowClick ? 'cursor-pointer active:bg-gray-50' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex justify-between items-start gap-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{col.header}</span>
                  <span className="text-sm text-gray-900 text-right flex-1">
                    {col.render ? col.render(row) : row[col.accessor]}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Standard table view
  return (
    <div className={`border rounded-xl overflow-x-auto ${className}`}>
      <table className="w-full divide-y divide-gray-100">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-3 sm:px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx} 
              className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col, colIdx) => (
                <td 
                  key={colIdx} 
                  className={`px-3 sm:px-4 py-3 text-sm whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                >
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
