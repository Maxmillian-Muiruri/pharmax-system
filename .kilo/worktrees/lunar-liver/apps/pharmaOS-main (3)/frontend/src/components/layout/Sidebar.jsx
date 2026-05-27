import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Truck, 
  Package, 
  Users, 
  UserSquare2, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Clock, 
  BarChart3, 
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  {
    label: 'Sales',
    icon: ShoppingCart,
    subItems: [
      { to: '/pos', label: 'Pharmacist POS' },
      { to: '/sales/new', label: 'Sale New' },
      { to: '/sales', label: 'Sale List' },
    ]
  },
  { 
    label: 'Purchases', 
    icon: Truck,
    subItems: [
      { to: '/purchases/new', label: 'Purchase New' },
      { to: '/purchases', label: 'Purchase List' },
    ]
  },
  { 
    label: 'Stock List', 
    icon: Receipt,
    subItems: [
      { to: '/stock/current', label: 'Current Stock' },
      { to: '/stock/expired', label: 'Expired Stock' },
    ]
  },
  { 
    label: 'Products', 
    icon: Package,
    subItems: [
      { to: '/products', label: 'Add Product' },
      { to: '/products', label: 'All Product' },
      { to: '/products/barcodes', label: 'Print Barcode' },
    ]
  },
  { 
    label: 'Customer', 
    icon: Users,
    subItems: [
      { to: '/customers/new', label: 'Add Customer' },
      { to: '/customers', label: 'All Customer' },
    ]
  },
  { 
    label: 'Supplier', 
    icon: UserSquare2,
    subItems: [
      { to: '/suppliers/new', label: 'Add Supplier' },
      { to: '/suppliers', label: 'All Supplier' },
    ]
  },
  { to: '/incomes', label: 'Incomes', icon: TrendingUp },
  { to: '/expenses', label: 'Expenses', icon: TrendingDown },
  { to: '/tax', label: 'Tax', icon: Receipt },
  { to: '/due-list', label: 'Due List', icon: Clock },
  { to: '/reports', label: 'Reports', icon: BarChart3, adminOnly: true },
  { to: '/settings', label: 'Manage Settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const [expandedMenus, setExpandedMenus] = useState({})
  const [isHovered, setIsHovered] = useState(false)

  const isEffectiveOpen = isOpen || isHovered

  const toggleMenu = (label) => {
    setExpandedMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }))
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed inset-y-0 left-0 z-40 bg-forty-dark text-white flex flex-col transition-all duration-300 ease-in-out transform overflow-x-hidden overflow-y-auto custom-scrollbar
          ${isEffectiveOpen ? 'w-[300px] translate-x-0' : 'w-0 -translate-x-full lg:w-[80px] lg:translate-x-0'}
          lg:static lg:inset-0
        `}
      >
        {/* Inner container - Uses flex col to center content in mini mode */}
        <div className={`h-full flex flex-col transition-all duration-300 ${!isEffectiveOpen ? 'lg:items-center' : ''}`}>
          {/* Logo Section */}
          <div className="flex items-center justify-between px-6 py-6 h-16 border-b border-white/5 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-forty-primary flex items-center justify-center shrink-0">
                <Package size={20} className="text-white" />
              </div>
              <span className={`text-xl font-bold tracking-tight transition-all duration-300 overflow-hidden whitespace-nowrap ${!isEffectiveOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100 ml-3'}`}>
                PharmaOS
              </span>
            </div>
            
            {/* Close button - Mobile only */}
            <button 
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-white/10 transition-colors text-gray-400"
            >
              <X size={24} />
            </button>
          </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems
            .filter((item) => !item.adminOnly || user?.userType === 'ADMIN' || user?.userType === 'SUPER_ADMIN')
            .map((item) => {
              const Icon = item.icon
              const isExpanded = expandedMenus[item.label]
              
              if (item.subItems) {
                return (
                  <div key={item.label} className="space-y-1 text-center w-full">
                    <button
                      onClick={() => isEffectiveOpen ? toggleMenu(item.label) : null}
                      title={!isEffectiveOpen ? item.label : ''}
                      className={`w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group ${!isEffectiveOpen ? 'lg:justify-center' : 'justify-start'}`}
                    >
                      <Icon size={20} className="text-gray-400 group-hover:text-forty-primary shrink-0" />
                      <span className={`text-left transition-all duration-300 overflow-hidden whitespace-nowrap ${!isEffectiveOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto flex-1 opacity-100 ml-3'}`}>
                        {item.label}
                      </span>
                      {isEffectiveOpen && (
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                    {isExpanded && isEffectiveOpen && (
                      <div className="space-y-1">
                        {item.subItems.map(subItem => (
                          <NavLink
                            key={subItem.to}
                            to={subItem.to}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `block pl-2 pr-4 py-3 text-base font-medium transition-colors ${
                                isActive ? 'text-forty-primary' : 'text-gray-400 hover:text-white'
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  title={!isEffectiveOpen ? item.label : ''}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 text-base font-medium transition-all duration-300 w-full ${
                      isActive
                        ? 'bg-white text-forty-dark rounded-full shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-white/5 rounded-lg'
                    } ${!isEffectiveOpen ? 'lg:justify-center' : 'justify-start'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={20} className={`shrink-0 ${isActive ? 'text-forty-dark' : 'text-gray-400'}`} />
                      <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-left ${!isEffectiveOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto flex-1 opacity-100 ml-3'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              )
            })}
        </nav>

        {/* User / Sign Out Profile */}
        <div className="p-4 border-t border-white/5">
          <div className={`flex items-center gap-3 px-4 py-3 mb-4 ${!isOpen ? 'lg:justify-center lg:px-0' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-forty-primary flex items-center justify-center shrink-0 text-sm font-bold text-white uppercase">
              {user?.name
                ? user.name.trim().split(' ').map(w => w[0]).join('').slice(0, 2)
                : (user?.email?.[0] ?? '?').toUpperCase()}
            </div>
            <div className={`transition-opacity duration-300 ${!isOpen ? 'lg:opacity-0 lg:hidden' : 'opacity-100'}`}>
              <p className="text-sm font-bold text-white leading-none mb-1">
                {user?.name || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500">
                {user?.userType?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              onClose()
            }}
            className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all duration-300 w-full ${!isEffectiveOpen ? 'lg:justify-center' : 'justify-start'}`}
          >
            <LogOut size={20} className="shrink-0" />
            <span className={`transition-all duration-300 overflow-hidden whitespace-nowrap text-left ${!isEffectiveOpen ? 'lg:w-0 lg:opacity-0' : 'w-auto opacity-100 ml-3'}`}>
              Sign Out
            </span>
          </button>
        </div>
      </div>
    </aside>
    </>
  )
}

