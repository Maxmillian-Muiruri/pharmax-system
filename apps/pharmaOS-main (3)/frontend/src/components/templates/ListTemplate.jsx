import { useState } from 'react'
import { Search, Plus, Filter, Download, MoreVertical, Edit2, Trash2 } from 'lucide-react'
import PageWrapper from '../layout/PageWrapper'
import Card from '../ui/Card'
import useLocalStorage from '../../hooks/useLocalStorage'

/**
 * ListTemplate: A master component for creating PharmaOS-style list pages.
 * Handles search, filtering, and data display in a high-density table.
 */
export default function ListTemplate({
  title,
  subtitle,
  storageKey,
  columns,
  onAddClick,
  onEditClick,
  onDeleteClick,
  initialData = [],
  data: externalData,
  loading = false,
}) {
  const [localStorageData, localStorageActions] = useLocalStorage(storageKey, initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [entriesPerPage, setEntriesPerPage] = useState(10)

  // Use external data if provided, otherwise use localStorage
  const data = externalData !== undefined ? externalData : localStorageData

  // Filter data based on search
  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  )

  return (
    <PageWrapper>
      {/* List Header Card */}
      <Card 
        title={title} 
        subtitle={subtitle}
        className="border-none shadow-sm mb-6"
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onAddClick}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-forty-primary text-white text-xs font-bold rounded hover:bg-forty-primary/90 transition-colors"
            >
              <Plus size={16} />
              Add New
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-forty-accent text-white text-xs font-bold rounded hover:bg-forty-accent/90 transition-colors">
              <Download size={16} />
              Export
            </button>
          </div>
        }
      >
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 border-b border-gray-50 pb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            Show 
            <select 
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-forty-primary"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map((col, idx) => (
                  <th 
                    key={idx} 
                    className={`py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider ${col.className || ''}`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forty-primary mb-2"></div>
                      <p className="text-sm font-medium">Loading data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.slice(0, entriesPerPage).map((item, rowIdx) => (
                  <tr key={item.id || rowIdx} className="group hover:bg-gray-50/50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`py-4 text-sm font-medium text-gray-700 ${col.className || ''}`}>
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onEditClick?.(item)} className="p-1.5 text-gray-400 hover:text-forty-primary hover:bg-forty-primary/10 rounded transition-colors"><Edit2 size={14} /></button>
                        <button onClick={() => onDeleteClick?.(item) || localStorageActions.removeItem?.(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={14} /></button>
                        <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded transition-colors"><MoreVertical size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Filter size={48} className="mb-2 opacity-20" />
                      <p className="text-sm font-medium">No records found matching your search</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {filteredData.length > 0 ? filteredData.slice(0, entriesPerPage).map((item, rowIdx) => (
            <div key={item.id || rowIdx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              {columns.map((col, colIdx) => (
                <div key={colIdx} className="flex justify-between items-start gap-2 py-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">{col.label}</span>
                  <span className="text-sm text-gray-800 text-right">
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-50">
                <button onClick={() => onEditClick?.(item)} className="p-1.5 text-gray-400 hover:text-forty-primary rounded transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => removeItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          )) : (
            <div className="py-12 text-center text-sm text-gray-400">No records found</div>
          )}
        </div>

        {/* Pagination Info */}
        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-6">
          <p className="text-xs text-gray-400 font-medium">
            Showing 1 to {Math.min(filteredData.length, entriesPerPage)} of {filteredData.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 border border-gray-200 rounded text-xs font-bold text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-forty-primary text-white rounded text-xs font-bold">1</button>
            <button className="px-3 py-1 border border-gray-200 rounded text-xs font-bold text-gray-400 hover:bg-gray-50 transition-colors">Next</button>
          </div>
        </div>
      </Card>
    </PageWrapper>
  )
}
