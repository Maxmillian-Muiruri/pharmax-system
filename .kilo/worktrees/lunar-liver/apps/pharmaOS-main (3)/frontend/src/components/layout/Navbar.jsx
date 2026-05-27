import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bell, Menu, Search, ChevronDown, LogOut,
  Settings, CheckCheck, X, Package, AlertTriangle,
  TrendingDown, Info
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useAlerts } from '../../hooks/useAlerts'
import { alertsApi, productsApi } from '../../services/api'
import { formatCurrency } from '../../utils/formatCurrency'

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatRole(userType) {
  if (!userType) return ''
  return userType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

function getInitials(name, email) {
  if (name && name.trim())
    return name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (email || '?')[0].toUpperCase()
}

const STATUS_STYLES = {
  active:      { pill: 'bg-green-100 text-green-700',  dot: 'bg-green-500'  },
  expired:     { pill: 'bg-red-100 text-red-700',      dot: 'bg-red-500'    },
  near_expiry: { pill: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-500'  },
  out_of_stock:{ pill: 'bg-gray-100 text-gray-500',    dot: 'bg-gray-400'   },
}

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.out_of_stock
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${s.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status.replace(/_/g, ' ')}
    </span>
  )
}

/** Closes dropdown when clicking outside */
function useClickOutside(ref, onClose) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, onClose])
}

// ─── Search with suggestions ─────────────────────────────────────────────────

function NavSearch() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  useClickOutside(wrapperRef, () => setOpen(false))

  // Debounced search — fires 300 ms after the user stops typing
  const search = useCallback((q) => {
    clearTimeout(debounceRef.current)
    if (!q.trim()) { setResults([]); setOpen(false); return }
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await productsApi.getAll({ search: q.trim(), limit: 8 })
        setResults(res.data || [])
        setOpen(true)
        setActiveIdx(-1)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 300)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    setQuery(val)
    search(val)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  // Navigate to Inventory with the product highlighted via search param
  const handleSelect = (product) => {
    setOpen(false)
    setQuery('')
    setResults([])
    navigate(`/products?search=${encodeURIComponent(product.name)}`)
  }

  // Full search → Inventory filtered
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    navigate(`/products?search=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault()
      handleSelect(results[activeIdx])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && query.trim().length > 0

  return (
    <div ref={wrapperRef} className="relative hidden md:block">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 focus-within:bg-white/20 rounded-full px-4 py-1.5 w-64 lg:w-96 transition-colors">
          {loading
            ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
            : <Search size={16} className="text-white/70 shrink-0" />
          }
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search products..."
            autoComplete="off"
            className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-white/50 text-white w-full outline-none"
          />
          {query && (
            <button type="button" onClick={handleClear} className="text-white/50 hover:text-white transition-colors shrink-0">
              <X size={14} />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {results.length === 0 && !loading ? (
            <div className="px-4 py-6 text-center">
              <Package size={24} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400 font-medium">No products found</p>
              <p className="text-xs text-gray-300 mt-0.5">Try a different name or category</p>
            </div>
          ) : (
            <>
              <ul role="listbox">
                {results.map((product, idx) => (
                  <li
                    key={product.id}
                    role="option"
                    aria-selected={idx === activeIdx}
                    onMouseEnter={() => setActiveIdx(idx)}
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(product) }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                      idx === activeIdx ? 'bg-gray-50' : 'hover:bg-gray-50'
                    } ${idx !== 0 ? 'border-t border-gray-50' : ''}`}
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-forty-primary/8 flex items-center justify-center shrink-0 bg-gray-100">
                      <Package size={16} className="text-gray-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {/* Highlight matching text */}
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        <Highlight text={product.name} query={query} />
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {product.category && (
                          <span className="text-xs text-gray-400">{product.category}</span>
                        )}
                        {product.category && <span className="text-gray-200">·</span>}
                        <span className="text-xs text-gray-400">Qty: {product.quantity}</span>
                      </div>
                    </div>

                    {/* Right side: price + status */}
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-gray-800">{formatCurrency(product.unitPrice)}</span>
                      <StatusPill status={product.status} />
                    </div>
                  </li>
                ))}
              </ul>

              {/* Footer — view all */}
              <div
                onMouseDown={(e) => { e.preventDefault(); handleSubmit({ preventDefault: () => {} }) }}
                className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <span className="text-xs text-gray-500">
                  {results.length} result{results.length !== 1 ? 's' : ''} for <strong>"{query}"</strong>
                </span>
                <span className="text-xs font-semibold text-forty-primary">View all →</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/** Bolds the matching portion of text */
function Highlight({ text, query }) {
  if (!query) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-yellow-800 rounded px-0.5 font-bold not-italic">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ─── Navbar ──────────────────────────────────────────────────────────────────

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { alerts, unreadCount, refetch } = useAlerts()

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const notifRef = useRef(null)
  const profileRef = useRef(null)

  useClickOutside(notifRef, () => setShowNotifications(false))
  useClickOutside(profileRef, () => setShowProfile(false))

  const displayName = user?.name || user?.email || 'User'
  const role = formatRole(user?.userType)
  const initials = getInitials(user?.name, user?.email)

  const handleMarkAllRead = async () => {
    setMarkingAll(true)
    try { await alertsApi.markAllRead(); refetch() }
    finally { setMarkingAll(false) }
  }

  const handleMarkOne = async (id) => {
    await alertsApi.markRead(id)
    refetch()
  }

  function alertIcon(type) {
    if (type === 'expired') return <AlertTriangle size={13} />
    if (type === 'near_expiry') return <TrendingDown size={13} />
    return <Info size={13} />
  }

  function alertColor(type) {
    if (type === 'expired') return 'bg-red-100 text-red-600'
    if (type === 'near_expiry') return 'bg-amber-100 text-amber-600'
    return 'bg-blue-100 text-blue-600'
  }

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-forty-primary text-white flex items-center justify-between px-4 lg:px-8 shadow-md">

      {/* Left: Hamburger + Search */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuClick} className="p-2 rounded-md hover:bg-white/10 transition-colors" aria-label="Toggle sidebar">
          <Menu size={24} />
        </button>
        <NavSearch />
      </div>

      {/* Right: Notifications + Profile */}
      <div className="flex items-center gap-2 md:gap-3">

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(v => !v); setShowProfile(false) }}
            className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 border-2 border-forty-primary text-[10px] font-bold flex items-center justify-center rounded-full px-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Notifications</p>
                  {unreadCount > 0 && <p className="text-xs text-gray-400">{unreadCount} unread</p>}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} disabled={markingAll}
                    className="flex items-center gap-1 text-xs font-semibold text-forty-primary hover:text-forty-primary/80 transition-colors disabled:opacity-50">
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {alerts.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">All caught up!</p>
                    <p className="text-xs text-gray-300 mt-0.5">No unread notifications</p>
                  </div>
                ) : alerts.map(alert => (
                  <div key={alert.id} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                    <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${alertColor(alert.type)}`}>
                      {alertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{alert.message}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">{alert.type.replace(/_/g, ' ')}</p>
                    </div>
                    <button onClick={() => handleMarkOne(alert.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-gray-500 transition-all shrink-0" aria-label="Dismiss">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                <button onClick={() => { navigate('/inventory?status=expired'); setShowNotifications(false) }}
                  className="text-xs font-semibold text-forty-primary hover:underline w-full text-center">
                  View all alerts in Inventory →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/20 hidden sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotifications(false) }}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Profile menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold leading-none">{displayName}</p>
              <p className="text-[10px] text-white/70">{role}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold uppercase overflow-hidden border border-white/30 shrink-0">
              {initials}
            </div>
            <ChevronDown size={14} className={`text-white/70 transition-transform duration-200 ${showProfile ? 'rotate-180' : ''}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-forty-primary/10 text-forty-primary text-[10px] font-bold rounded-full uppercase tracking-wide">
                  {role}
                </span>
              </div>
              <div className="py-1">
                <button onClick={() => { navigate('/settings'); setShowProfile(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings size={16} className="text-gray-400" /> Settings
                </button>
              </div>
              <div className="border-t border-gray-100 py-1">
                <button onClick={() => { logout(); setShowProfile(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
