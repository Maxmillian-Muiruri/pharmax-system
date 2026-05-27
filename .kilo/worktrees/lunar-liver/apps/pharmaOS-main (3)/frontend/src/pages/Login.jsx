import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'
import { Pill, Shield, TrendingUp, Package, Truck, Users, CreditCard, ClipboardCheck, Bike } from 'lucide-react'

// User type configuration for demo
const USER_TYPES = [
  {
    type: 'SUPER_ADMIN',
    email: 'superadmin1@pharmaos.com',
    label: 'Super Admin',
    description: 'Full system access',
    icon: Shield,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    type: 'ADMIN',
    email: 'admin1@pharmaos.com',
    label: 'Admin',
    description: 'Products, orders & settings',
    icon: Users,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    type: 'FINANCE',
    email: 'finance@pharmaos.com',
    label: 'Finance',
    description: 'Transactions & reports',
    icon: CreditCard,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  {
    type: 'MANAGER',
    email: 'manager@pharmaos.com',
    label: 'Manager',
    description: 'Analytics & operations',
    icon: TrendingUp,
    color: 'bg-indigo-500',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  {
    type: 'PHARMACIST',
    email: 'pharmacist1@pharmaos.com',
    label: 'Pharmacist',
    description: 'POS & prescriptions',
    icon: ClipboardCheck,
    color: 'bg-teal-500',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
  },
  {
    type: 'RECEIVING_BAY',
    email: 'receiving@pharmaos.com',
    label: 'Receiving Bay',
    description: 'Inventory & suppliers',
    icon: Package,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    type: 'DISPATCH',
    email: 'dispatch@pharmaos.com',
    label: 'Dispatch',
    description: 'Orders & deliveries',
    icon: Truck,
    color: 'bg-cyan-500',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
  },
  {
    type: 'RIDER',
    email: 'rider@pharmaos.com',
    label: 'Rider',
    description: 'Delivery tracking',
    icon: Bike,
    color: 'bg-pink-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
  },
]

const DEFAULT_PASSWORD = 'pharma123'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selectedType, setSelectedType] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showDemoSelector, setShowDemoSelector] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await login(email, password)
    setIsLoading(false)
  }

  const handleUserTypeSelect = (userType) => {
    setSelectedType(userType)
    setEmail(userType.email)
    setPassword(DEFAULT_PASSWORD)
    setShowDemoSelector(false)
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gray-900 overflow-hidden relative">
        {/* Abstract pill shapes background */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10 flex items-center gap-2 text-white">
          <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center pl-0.5">
            <Pill size={18} className="text-white transform -rotate-45" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-teal-400">Pharma</span>OS
          </span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            The operational backbone of the modern pharmacy.
          </h1>
          <p className="text-gray-400 text-lg">
            Streamline your inventory, manage orders seamlessly, and rely on real-time data to serve your patients better.
          </p>
          
          {/* Demo credentials display */}
          <div className="mt-8 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wider">Demo Access</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <span>8 different user roles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <span>Role-based access control</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                <span>Instant demo mode</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Tech Vanguard. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile branding */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded bg-teal-500 flex items-center justify-center pl-0.5">
              <Pill size={18} className="text-white transform -rotate-45" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              <span className="text-teal-600">Pharma</span>OS
            </span>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500">Please sign in to your account to continue.</p>
          </div>

          {/* Demo User Type Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Select Role to Demo
              </h3>
              <button
                type="button"
                onClick={() => setShowDemoSelector(!showDemoSelector)}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
              >
                {showDemoSelector ? 'Hide' : 'Show All'} ({USER_TYPES.length})
              </button>
            </div>

            {/* Quick select - Top 4 roles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {USER_TYPES.slice(0, 4).map((userType) => {
                const Icon = userType.icon
                const isSelected = selectedType?.type === userType.type
                return (
                  <button
                    key={userType.type}
                    type="button"
                    onClick={() => handleUserTypeSelect(userType)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? `${userType.borderColor} ${userType.bgColor} shadow-sm`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${userType.color} flex items-center justify-center text-white`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center">
                      {userType.label.split(' ')[0]}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Expanded role selector */}
            {showDemoSelector && (
              <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                {USER_TYPES.slice(4).map((userType) => {
                  const Icon = userType.icon
                  const isSelected = selectedType?.type === userType.type
                  return (
                    <button
                      key={userType.type}
                      type="button"
                      onClick={() => handleUserTypeSelect(userType)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                        isSelected
                          ? `${userType.borderColor} ${userType.bgColor}`
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${userType.color} flex items-center justify-center text-white shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-semibold text-gray-900">{userType.label}</div>
                        <div className="text-xs text-gray-500">{userType.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Selected role indicator */}
            {selectedType && (
              <div className={`mt-3 p-3 ${selectedType.bgColor} border ${selectedType.borderColor} rounded-lg`}>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full ${selectedType.color} flex items-center justify-center text-white`}>
                    <selectedType.icon size={14} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900">{selectedType.label}</div>
                    <div className="text-xs text-gray-600">{selectedType.email}</div>
                  </div>
                  <div className="text-xs text-gray-500 font-mono bg-white/50 px-2 py-1 rounded">
                    Password: {DEFAULT_PASSWORD}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setSelectedType(null)
                }}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-150"
                placeholder="Select a role above or enter email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow duration-150"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-base flex justify-center"
              size="lg"
              loading={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Development info */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
              <div className="flex items-center justify-between mb-2">
                <strong className="text-sm">🚀 Demo Mode Available</strong>
              </div>
              <p className="mb-2">Click any role above to auto-fill credentials and explore different user permissions.</p>
              <div className="space-y-1 font-mono text-blue-700">
                <div>All passwords: <code className="bg-blue-100 px-1.5 py-0.5 rounded">{DEFAULT_PASSWORD}</code></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

