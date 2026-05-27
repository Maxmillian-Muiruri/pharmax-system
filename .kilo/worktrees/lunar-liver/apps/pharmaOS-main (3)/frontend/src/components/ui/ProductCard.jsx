import { formatCurrency } from '../../utils/formatCurrency'

export default function ProductCard({ name, price, stock, image, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group flex flex-col text-left bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-forty-primary hover:shadow-lg transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}
    >
      {/* Image Container */}
      <div className="h-20 w-full bg-gray-50 overflow-hidden relative">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2 space-y-1">
        <h4 className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight">{name}</h4>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[11px] font-black text-forty-primary">{formatCurrency(price)}</p>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${
            stock > 10
              ? 'bg-emerald-50 text-emerald-700'
              : stock > 0
              ? 'bg-amber-50 text-amber-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {stock > 0 ? `${stock} left` : 'Out'}
          </span>
        </div>
      </div>
    </button>
  )
}
