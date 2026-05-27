import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { 
  Search, 
  ShoppingCart, 
  Calculator, 
  Power,
  X,
  Plus,
  ChevronDown
} from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import ProductCard from '../components/ui/ProductCard'
import { formatCurrency } from '../utils/formatCurrency'
// --- Mock Data ---
const INITIAL_PRODUCTS = [
  { id: '1', name: 'Paracetamol Tablets IP', price: 1638.75, stock: 120, image: '/images/products/placeholder.svg' },
  { id: '2', name: 'Curafin 5ml Syrup', price: 942.76, stock: 45, image: '/images/products/placeholder.svg' },
  { id: '3', name: 'Avaspray Nasal 120ml', price: 831.60, stock: 12, image: '/images/products/placeholder.svg' },
]
const INITIAL_SUPPLIERS = ['GSK Pharmaceuticals', 'Abbott Laboratories']
export default function PurchaseNew() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS)
  // 1. Modals state
  const [showStockList, setShowStockList] = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)
  const [calcInput, setCalcInput] = useState('')
  // Modal Form States
  const [newProduct, setNewProduct] = useState({ name: '', category: 'Tablets', price: '', stock: '', description: '' })
  const [newSupplier, setNewSupplier] = useState({ name: '', contact: '', phone: '', email: '', address: '' })
  const handleCalcBtn = (val) => {
    if (val === 'C') { setCalcInput(''); return; }
    if (val === '=') {
      try {
        setCalcInput(String(new Function('return ' + calcInput)()));
      } catch (e) {
        setCalcInput('Error');
      }
      return;
    }
    setCalcInput((prev) => (prev === 'Error' ? val : prev + val));
  }
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [supplier, setSupplier] = useState('Select Supplier')
  
  // Extra fields requested
  const [invoiceNo, setInvoiceNo] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [notes, setNotes] = useState('')
  const [payAmount, setPayAmount] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [deliveryCost, setDeliveryCost] = useState(0)
  const [taxPercent, setTaxPercent] = useState(0)
  const [otherCharge, setOtherCharge] = useState(0)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddSupplier, setShowAddSupplier] = useState(false)
  const handleSaveProduct = () => {
    if (!newProduct.name) return
    const id = (products.length + 1).toString()
    setProducts([...products, { 
      id, 
      ...newProduct, 
      price: parseFloat(newProduct.price) || 0,
      stock: parseInt(newProduct.stock) || 0,
      image: '/images/products/placeholder.svg' 
    }])
    setNewProduct({ name: '', category: 'Tablets', price: '', stock: '', description: '' })
    setShowAddProduct(false)
  }
  const handleSaveSupplier = () => {
    if (!newSupplier.name) return
    setSuppliers([...suppliers, newSupplier.name])
    setNewSupplier({ name: '', contact: '', phone: '', email: '', address: '' })
    setShowAddSupplier(false)
  }
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { 
         ...product, 
         quantity: 1, 
         batch: 'B' + Math.floor(Math.random() * 900 + 100),
         expiryDate: '',
         sellingPrice: 0 
      }]
    })
  }
  const updateCartItem = (id, field, value) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (field === 'quantity') value = Math.max(1, value)
        return { ...item, [field]: value }
      }
      return item
    }))
  }
  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id))

  // -- Generate PDF Receipt -------------------------------------------------
  const generatePDF = () => {
    const doc = new jsPDF()
    const receiptNo = 'P' + Date.now().toString().slice(-6)
    const date = new Date().toLocaleString()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 168, 107)
    doc.text('PharmaOS', 105, 20, { align: 'center' })

    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text('PURCHASE RECEIPT', 105, 30, { align: 'center' })

    // Receipt Info
    doc.setFontSize(10)
    doc.text(`Receipt No: ${receiptNo}`, 14, 45)
    doc.text(`Date: ${date}`, 14, 52)
    doc.text(`Supplier: ${supplier}`, 14, 59)
    doc.text(`Invoice No: ${invoiceNo || 'N/A'}`, 14, 66)
    doc.text(`Payment: ${paymentMethod}`, 14, 73)
    doc.text(`Items: ${totalItems} (${totalQty} qty)`, 14, 80)

    // Items Table
    const items = cart.map(item => [
      item.name,
      item.batch || 'N/A',
      item.quantity.toString(),
      formatCurrency(item.price),
      formatCurrency(item.price * item.quantity)
    ])

    autoTable(doc, {
      startY: 88,
      head: [['Item', 'Batch', 'Qty', 'Price', 'Total']],
      body: items,
      theme: 'striped',
      headStyles: { fillColor: [0, 168, 107], textColor: 255 },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 30 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 35, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' }
      }
    })

    // Totals - lastAutoTable is added to doc object by the plugin
    const finalY = (doc.lastAutoTable?.finalY || 150) + 10
    doc.setFontSize(10)
    doc.text(`Subtotal: ${formatCurrency(subtotal)}`, 150, finalY, { align: 'right' })
    doc.text(`Discount: ${formatCurrency(discount)}`, 150, finalY + 7, { align: 'right' })
    doc.text(`Tax (${taxPercent}%): ${formatCurrency(taxAmount)}`, 150, finalY + 14, { align: 'right' })
    doc.text(`Shipping: ${formatCurrency(deliveryCost)}`, 150, finalY + 21, { align: 'right' })
    doc.text(`Other: ${formatCurrency(otherCharge)}`, 150, finalY + 28, { align: 'right' })

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text(`TOTAL PAYABLE: ${formatCurrency(total)}`, 150, finalY + 40, { align: 'right' })

    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text(`Amount Paid: ${formatCurrency(payAmount)}`, 150, finalY + 50, { align: 'right' })
    if (changeAmount > 0) {
      doc.text(`Change: ${formatCurrency(changeAmount)}`, 150, finalY + 57, { align: 'right' })
    }
    if (dueAmount > 0) {
      doc.setTextColor(255, 0, 0)
      doc.text(`Amount Due: ${formatCurrency(dueAmount)}`, 150, finalY + 64, { align: 'right' })
    }

    // Footer
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text('Thank you for your business!', 105, finalY + 65, { align: 'center' })
    doc.text('PharmaOS - Purchase Management System', 105, finalY + 72, { align: 'center' })

    return doc
  }

  // -- Save Handler ---------------------------------------------------------
  const handleSave = async (print = false) => {
    if (cart.length === 0) { alert('Add at least one product'); return }

    // Here you would typically save to backend
    // For now, just generate PDF if print is requested
    if (print) {
      const doc = generatePDF()
      doc.save(`purchase-receipt-${Date.now()}.pdf`)
    }

    // Reset form
    setCart([])
    setPayAmount(0)
    setDiscount(0)
    setDeliveryCost(0)
    setOtherCharge(0)
    setTaxPercent(0)
    setInvoiceNo('')
    setNotes('')
  }

  const totalItems = useMemo(() => cart.length, [cart])
  const totalQty = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart])
  const taxAmount = useMemo(() => (subtotal * taxPercent) / 100, [subtotal, taxPercent])
  const total = useMemo(() => subtotal + taxAmount - discount + deliveryCost + otherCharge, [subtotal, taxAmount, discount, deliveryCost, otherCharge])
  const changeAmount = useMemo(() => Math.max(0, payAmount - total), [payAmount, total])
  const dueAmount = useMemo(() => Math.max(0, total - payAmount), [total, payAmount])
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  return (
    <PageWrapper title="Purchase New">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[700px]">
        
        {/* Left Section: Product Browser */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[400px]">
          <div className="flex flex-col gap-4 mb-4">
            {/* Filters Row */}
            <div className="relative">
              <select className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm appearance-none focus:ring-1 focus:ring-forty-primary outline-none text-gray-800">
                <option>Select a category</option>
                <option>Tablets</option>
                <option>Syrups</option>
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-forty-primary placeholder:text-gray-400"
                />
              </div>
              <button onClick={() => setShowAddProduct(true)} className="p-3 bg-forty-primary text-white rounded-lg hover:bg-forty-primary/90 transition-colors shrink-0">
                <Plus size={24} />
              </button>
            </div>
          </div>
          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-20">
            {filteredProducts.length === 0 ? (
               <div className="p-4 bg-red-50 text-red-500 border border-red-100 rounded-lg text-sm w-32 h-24 flex items-center justify-center font-medium shadow-sm">
                  No product found
               </div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      price={product.price}
                      stock={product.stock}
                      image={product.image || '/images/products/placeholder.svg'}
                      onClick={() => addToCart(product)}
                    />
                  ))}
                </div>
            )}
          </div>
        </div>
        {/* Right Section: Transaction Panel */}
        <div className="w-full lg:w-[450px] xl:w-[600px] flex flex-col shrink-0">
          <div className="flex flex-col h-full bg-white border border-gray-100 rounded-xl shadow-sm overflow-visible">
            {/* Quick Actions & Header */}
            <div className="p-4 border-b border-gray-100 relative">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-800">Quick Action</h3>
                  <div className="flex gap-1.5">
                    <button onClick={() => setShowStockList(true)} className="px-3 py-2 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 hover:text-forty-primary hover:border-forty-primary hover:bg-forty-primary/5 transition-all">Stock List</button>
                    <button onClick={() => navigate('/purchases')} className="px-3 py-2 bg-white border border-gray-200 rounded text-xs font-bold text-gray-600 hover:text-forty-primary hover:border-forty-primary hover:bg-forty-primary/5 transition-all">Today Purchases</button>
                    <button onClick={() => setShowCalculator(!showCalculator)} className="p-2 bg-white border border-gray-200 rounded text-gray-600 hover:text-forty-primary hover:border-forty-primary hover:bg-forty-primary/5 transition-all relative"><Calculator size={16} /></button>
                    <button onClick={() => navigate('/')} className="p-2 bg-white border border-gray-200 rounded text-red-500 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all"><Power size={16} /></button>
                  </div>
               </div>
               {/* Dropdown Calculator Modal */}
               {showCalculator && (
                 <div className="absolute right-4 top-16 z-50 bg-white border border-gray-200 shadow-xl rounded-xl p-4 w-64">
                   <div className="flex justify-between items-center mb-3">
                     <h4 className="text-sm font-bold">Calculator</h4>
                     <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-red-500"><X size={16}/></button>
                   </div>
                   <input type="text" readOnly value={calcInput || '0'} className="w-full bg-gray-50 border border-gray-200 text-right px-3 py-2 rounded mb-3 font-mono text-lg" />
                   <div className="grid grid-cols-4 gap-2">
                     {['7','8','9','/','4','5','6','*','1','2','3','-','C','0','.','+'].map(btn => (
                       <button key={btn} onClick={() => handleCalcBtn(btn)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded font-bold text-gray-700">{btn}</button>
                     ))}
                     <button onClick={() => handleCalcBtn('=')} className="col-span-4 p-2 bg-forty-primary hover:bg-teal-700 text-white rounded font-bold">=</button>
                   </div>
                 </div>
               )}
               {/* Supplier & Purchase Info */}
               <div className="space-y-3">
                  <div className="flex gap-1">
                     <div className="relative flex-1">
                       <select
                         value={supplier}
                         onChange={(e) => setSupplier(e.target.value)}
                         className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-500 appearance-none focus:outline-none focus:ring-1 focus:ring-forty-primary"
                       >
                         <option>Select Supplier</option>
                         {suppliers.map(s => (<option key={s} value={s}>{s}</option>))}
                       </select>
                       <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                     </div>
                     <button onClick={() => setShowAddSupplier(true)} className="p-2.5 bg-forty-dark text-white rounded-lg hover:bg-black transition-colors shadow-sm">
                       <Plus size={20} />
                     </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                     <input 
                       type="text" placeholder="Invoice No." value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary"
                     />
                     <input 
                       type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)}
                       className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary"
                     />
                  </div>
               </div>
            </div>
            {/* Transaction Table */}
            <div className="flex-1 min-h-[250px] overflow-x-auto overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="border-b border-gray-100">
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 ">Item</th>
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 ">Batch</th>
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 ">Exp Date</th>
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 text-center">Cost</th>
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 text-center">Sell Price</th>
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 text-center">Qty</th>
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 text-right">Sub Total</th>
                    <th className="px-2 py-3 text-[11px] font-black text-gray-800 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cart.length === 0 ? (
                    <tr>
                       <td colSpan="8" className="py-24 text-center text-gray-400">
                          <div className="flex flex-col items-center opacity-40">
                             <ShoppingCart size={40} className="mb-3" />
                             <span className="text-sm font-medium">No Items Found</span>
                             <span className="text-xs mt-1">Add products to get started</span>
                          </div>
                       </td>
                    </tr>
                  ) : (
                    cart.map((item, index) => (
                      <tr key={item.id} className={`hover:bg-forty-primary/5 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-2 py-3 text-[11px] font-bold text-gray-700 min-w-[80px] break-words">{item.name}</td>
                        <td className="px-2 py-3">
                           <input type="text" value={item.batch} onChange={e => updateCartItem(item.id, 'batch', e.target.value)} className="w-16 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-bold outline-none focus:border-forty-primary" />
                        </td>
                        <td className="px-2 py-3">
                           <input type="date" value={item.expiryDate} onChange={e => updateCartItem(item.id, 'expiryDate', e.target.value)} className="w-20 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-bold outline-none focus:border-forty-primary" />
                        </td>
                        <td className="px-2 py-3 text-center">
                           <input type="number" value={item.price} onChange={e => updateCartItem(item.id, 'price', e.target.value)} className="w-14 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-center outline-none focus:border-forty-primary" />
                        </td>
                        <td className="px-2 py-3 text-center">
                           <input type="number" placeholder="Optional" value={item.sellingPrice || ''} onChange={e => updateCartItem(item.id, 'sellingPrice', e.target.value)} className="w-16 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-center outline-none text-gray-500 focus:border-forty-primary" />
                        </td>
                        <td className="px-2 py-3 text-center">
                          <input 
                            type="number" min="1" 
                            value={item.quantity} 
                            onChange={(e) => updateCartItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-12 px-2 py-1.5 border border-gray-200 rounded text-[11px] font-bold text-center outline-none focus:border-forty-primary"
                          />
                        </td>
                        <td className="px-2 py-3 text-[11px] font-black text-forty-primary text-right">{formatCurrency(item.price * item.quantity)}</td>
                        <td className="px-2 py-3 text-center">
                          <button onClick={() => removeFromCart(item.id)} className="p-1.5 px-2 rounded bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* -- Billing Section -- */}
            <div className="p-4 border-t border-gray-100 shrink-0">
              <div className="grid grid-cols-2 gap-x-5">

                {/* Left column: payment fields */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Receive Amount</label>
                    <input
                      type="number" min="0" placeholder="0"
                      value={payAmount}
                      onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-forty-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Change Amount</label>
                    <input readOnly value={changeAmount.toFixed(2)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Due Amount</label>
                    <input readOnly value={dueAmount.toFixed(2)}
                      className={`w-full px-3 py-2 border rounded-lg text-sm font-bold outline-none ${dueAmount > 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-500'}`} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">Payment Type</label>
                    <div className="relative">
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-forty-primary outline-none appearance-none"
                      >
                        <option>Cash</option>
                        <option>Bank Transfer</option>
                        <option>Mobile Money</option>
                        <option>Credit</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Right column: total + adjustments */}
                <div className="space-y-2.5">
                  {/* Total Item */}
                  <div className="flex items-center justify-between py-1 border-b border-gray-100">
                    <span className="text-xs font-bold text-gray-600">TOTAL ITEM</span>
                    <span className="text-xs font-black text-gray-900">{totalItems} ({totalQty})</span>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between py-1">
                    <span className="text-xs font-bold text-gray-600">TOTAL</span>
                    <span className="text-sm font-black text-gray-900">{formatCurrency(subtotal)}</span>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">DISCOUNT</label>
                    <input
                      type="number" min="0" value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-forty-primary outline-none"
                    />
                  </div>

                  {/* Tax Amount (%) */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">TAX AMOUNT (%)</label>
                    <div className="flex gap-1">
                      <input
                        type="number" min="0" value={taxPercent}
                        onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                        className="w-16 px-2 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-center focus:border-forty-primary outline-none"
                      />
                      <input readOnly value={formatCurrency(taxAmount)}
                        className="flex-1 px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-center text-gray-500 outline-none" />
                    </div>
                  </div>

                  {/* Shipping Charge */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">SHIPPING CHARGE</label>
                    <input
                      type="number" min="0" value={deliveryCost}
                      onChange={(e) => setDeliveryCost(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-forty-primary outline-none"
                    />
                  </div>

                  {/* Other Charge */}
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">OTHER CHARGE</label>
                    <input
                      type="number" min="0" value={otherCharge}
                      onChange={(e) => setOtherCharge(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-forty-primary outline-none"
                    />
                  </div>

                  {/* TOTAL PAYABLE */}
                  <div className="flex items-center justify-between py-2 border-t-2 border-gray-200 mt-2">
                    <span className="text-sm font-black text-gray-800">TOTAL PAYABLE</span>
                    <span className="text-lg font-black text-forty-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Final Footer Buttons */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 border-t border-gray-100 mt-auto shrink-0">
               <button 
                onClick={() => { setCart([]); setPayAmount(0); setDiscount(0); setDeliveryCost(0); setTaxPercent(0); setOtherCharge(0); }}
                className="py-3 bg-white border border-[#FF6565] text-[#FF6565] rounded-xl text-xs font-black uppercase hover:bg-red-50 transition-colors shadow-sm"
               >
                 Reset
               </button>
               <button onClick={() => handleSave(false)} className="py-3 bg-white border border-forty-primary text-forty-primary rounded-xl text-xs font-black uppercase hover:bg-teal-50 transition-colors shadow-sm">
                 Save
               </button>
               <button onClick={() => handleSave(true)} className="py-3 bg-forty-primary border border-forty-primary text-white rounded-xl text-xs font-black uppercase hover:bg-forty-primary/90 transition-all shadow-md">
                 Save & Print
               </button>
            </div>
          </div>
        </div>
      </div>
      {/* Add Product Modal Overlay */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-black text-gray-800">Add New Product</h2>
              <button onClick={() => setShowAddProduct(false)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-auto bg-gray-50/50 space-y-4 custom-scrollbar">
               <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Paracetamol 500mg" 
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary outline-none text-gray-600"
                    >
                      <option>Tablets</option>
                      <option>Syrups</option>
                      <option>Injections</option>
                      <option>Ointments</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">Price</label>
                    <input 
                      type="number" 
                      placeholder="0.00" 
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary" 
                    />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">Initial Stock</label>
                    <input 
                      type="number" 
                      placeholder="0" 
                      value={newProduct.stock}
                      onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">Upload Image</label>
                    <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-forty-primary/10 file:text-forty-primary hover:file:bg-forty-primary/20 appearance-none outline-none focus:ring-0" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows="3" 
                    placeholder="Product description..." 
                    value={newProduct.description}
                    onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary resize-none"
                  ></textarea>
               </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => { setShowAddProduct(false); setNewProduct({ name: '', category: 'Tablets', price: '', stock: '', description: '' }); }} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveProduct} className="px-5 py-2.5 bg-forty-primary text-white rounded-xl text-xs font-black uppercase hover:bg-forty-primary/90 transition-colors shadow-sm">Save Product</button>
            </div>
          </div>
        </div>
      )}
      {/* Add Supplier Modal Overlay */}
      {showAddSupplier && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-black text-gray-800">Add New Supplier</h2>
              <button onClick={() => setShowAddSupplier(false)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-auto bg-gray-50/50 space-y-4 custom-scrollbar">
               <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">Supplier / Company Name *</label>
                  <input 
                    type="text" 
                    placeholder="e.g. GSK Pharmaceuticals" 
                    value={newSupplier.name}
                    onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary" 
                  />
               </div>
               <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">Contact Person</label>
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={newSupplier.contact}
                    onChange={e => setNewSupplier({...newSupplier, contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary" 
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">Phone Number *</label>
                    <input 
                      type="tel" 
                      placeholder="+123..." 
                      value={newSupplier.phone}
                      onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="example@email.com" 
                      value={newSupplier.email}
                      onChange={e => setNewSupplier({...newSupplier, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary" 
                    />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-black text-gray-700 mb-1">Company Address</label>
                  <textarea 
                    rows="2" 
                    placeholder="Full address..." 
                    value={newSupplier.address}
                    onChange={e => setNewSupplier({...newSupplier, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-forty-primary resize-none"
                  ></textarea>
               </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button onClick={() => { setShowAddSupplier(false); setNewSupplier({ name: '', contact: '', phone: '', email: '', address: '' }); }} className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-xs font-black uppercase hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveSupplier} className="px-5 py-2.5 bg-forty-primary text-white rounded-xl text-xs font-black uppercase hover:bg-forty-primary/90 transition-colors shadow-sm">Save Supplier</button>
            </div>
          </div>
        </div>
      )}
      {/* Stock List Modal Overlay */}
      {showStockList && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[85vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-xl font-black text-gray-800">Stock List</h2>
              <button onClick={() => setShowStockList(false)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-auto bg-gray-50/50">
               <div className="relative mb-6">
                 <input type="text" placeholder="Search" className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-forty-primary" />
                 <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               </div>
               <div className="bg-white border text-center border-gray-200 rounded-lg overflow-hidden">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="border-b border-gray-100 bg-gray-50">
                       <th className="px-6 py-4 text-xs font-black text-gray-700">SL.</th>
                       <th className="px-6 py-4 text-xs font-black text-gray-700">Product</th>
                       <th className="px-6 py-4 text-xs font-black text-gray-700">Cost</th>
                       <th className="px-6 py-4 text-xs font-black text-gray-700">Qty</th>
                       <th className="px-6 py-4 text-xs font-black text-gray-700">Sale</th>
                       <th className="px-6 py-4 text-xs font-black text-gray-700">Stock Value</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr>
                        <td colSpan="6" className="py-12 text-center text-gray-500 font-medium">No stock products found</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
