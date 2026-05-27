// Phase 3 - Route Protection
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
// Phase 3 addition
import PermissionGuard from './components/auth/PermissionGuard'
import RoleBasedRedirect from './components/auth/RoleBasedRedirect'
import { PERMISSIONS } from './config/permissions'
import { ROUTES } from './config/routes'

import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import POSView from './pages/Sales/POSView'
import PharmacistPOS from './pages/Sales/PharmacistPOS'
import SalesList from './pages/Sales/SalesList'
import Customers from './pages/Customers'
import Suppliers from './pages/Suppliers'
import Purchases from './pages/Purchases'
import PurchaseNew from './pages/PurchaseNew'
import Expenses from './pages/Expenses'
import Incomes from './pages/Incomes'
import DueList from './pages/DueList'
import Tax from './pages/Tax'
import Settings from './pages/Settings'
import StockList from './pages/StockList'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Prescriptions from './pages/Prescriptions'
import Reports from './pages/Reports'
import ListTemplate from './components/templates/ListTemplate'
import FormTemplate, { FormField, FormInput, FormSelect } from './components/templates/FormTemplate'
import Badge from './components/ui/Badge'
import { formatCurrency } from './utils/formatCurrency'

// --- Master Column Definitions ---
const COLS = {
  PRODUCTS: [
    { key: 'name', label: 'Medicine Name' },
    { key: 'generic', label: 'Generic' },
    { key: 'stock', label: 'Stock', className: 'text-center' },
    { key: 'price', label: 'Price', render: (val) => formatCurrency(val) },
  ],
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Role-based redirect for root path */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Sales */}
            <Route path="/sales/new" element={<PermissionGuard requiredPermission={PERMISSIONS.ACCESS_POS}><POSView /></PermissionGuard>} />
            <Route path="/pos" element={<PermissionGuard requiredPermission={PERMISSIONS.ACCESS_POS}><PharmacistPOS /></PermissionGuard>} />
            <Route path="/sales" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_ORDERS}><SalesList /></PermissionGuard>} />

            {/* Purchases */}
            <Route path="/purchases/new" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_PURCHASES}><PurchaseNew /></PermissionGuard>} />
            <Route path="/purchases" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_PURCHASES}><Purchases /></PermissionGuard>} />

            {/* Products */}
            <Route path="/orders" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_ORDERS}><Orders /></PermissionGuard>} />
            <Route path="/prescriptions" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_PRESCRIPTIONS}><Prescriptions /></PermissionGuard>} />
            <Route path="/products" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_PRODUCTS}><Products /></PermissionGuard>} />
            <Route path="/products/barcodes" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_PRODUCTS}>
              <ListTemplate title="Print Barcodes" subtitle="Generate labels for current stock" storageKey="products_barcodes" columns={COLS.PRODUCTS} initialData={[]} />
            </PermissionGuard>} />

            {/* Customers & Suppliers */}
            <Route path="/customers" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_CUSTOMERS}><Customers /></PermissionGuard>} />
            <Route path="/customers/new" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_CUSTOMERS}><Navigate to="/customers" replace /></PermissionGuard>} />

            <Route path="/suppliers" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_SUPPLIERS}><Suppliers /></PermissionGuard>} />
            <Route path="/suppliers/new" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_SUPPLIERS}><Navigate to="/suppliers" replace /></PermissionGuard>} />

            {/* Financials */}
            <Route path="/incomes" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_FINANCIALS}><Incomes /></PermissionGuard>} />
            <Route path="/expenses" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_FINANCIALS}><Expenses /></PermissionGuard>} />
            <Route path="/tax" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_FINANCIALS}><Tax /></PermissionGuard>} />
            <Route path="/due-list" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_FINANCIALS}><DueList /></PermissionGuard>} />

            {/* Reports & Specialized */}
            <Route path="/reports" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_REPORTS}><Reports /></PermissionGuard>} />
            <Route path="/settings" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_SETTINGS}><Settings /></PermissionGuard>} />

            {/* Stock List */}
            <Route path="/stock/current" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_STOCK}>
              <StockList filter="current" />
            </PermissionGuard>} />
            <Route path="/stock/expired" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_STOCK}>
              <StockList filter="expired" />
            </PermissionGuard>} />
            <Route path="/stock/low" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_STOCK}>
              <StockList filter="low" />
            </PermissionGuard>} />
            <Route path="/stock/outofstock" element={<PermissionGuard requiredPermission={PERMISSIONS.VIEW_STOCK}>
              <StockList filter="outofstock" />
            </PermissionGuard>} />

            {/* Unauthorized access page */}
            <Route path="/unauthorized" element={
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You do not have permission to view this page.</p>
              </div>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/unauthorized" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App

// TODO: Phase 4