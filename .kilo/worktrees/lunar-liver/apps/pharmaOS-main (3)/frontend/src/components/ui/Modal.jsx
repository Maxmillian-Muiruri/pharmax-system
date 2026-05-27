import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null

  const sizes = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className={`relative w-full ${sizes[size]} p-4 sm:p-6 my-4 sm:my-8 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg sm:rounded-2xl shadow-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto`}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white z-10">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 pr-4 break-words flex-1">{title}</h3>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  )
}
