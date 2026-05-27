import { useState, type FormEvent, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, CheckCircle, Clock, Search, MapPin, Phone, Mail, ArrowLeft } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface TimelineStep {
  status: string;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
}

interface OrderData {
  orderNumber: string;
  status: string;
  orderDate: string;
  estimatedDelivery: string;
  currentLocation: string;
  items: OrderItem[];
  customer: {
    name: string;
    phone: string;
    email: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  timeline: TimelineStep[];
  total: number;
}

export function TrackOrder() {
  const params = useParams();
  const orderIdFromUrl = params.id;
  
  const [orderNumber, setOrderNumber] = useState(orderIdFromUrl || '');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSearched, setAutoSearched] = useState(false);

  useEffect(() => {
    if (orderIdFromUrl && !autoSearched) {
      setAutoSearched(true);
      fetchOrderData(orderIdFromUrl);
    }
  }, [orderIdFromUrl]);

  const fetchOrderData = (orderNum: string) => {
    setIsLoading(true);
    setTimeout(() => {
      // Try to find in localStorage
      const storedOrders = JSON.parse(localStorage.getItem('pharmx_orders') || '[]');
      const foundOrder = storedOrders.find((o: any) => 
        o.id === orderNum || 
        o.orderNumber === orderNum ||
        o.id?.includes(orderNum)
      );

      if (foundOrder) {
        setOrderData({
          orderNumber: foundOrder.orderNumber || foundOrder.id,
          status: foundOrder.status || 'processing',
          orderDate: foundOrder.date || new Date().toLocaleDateString(),
          estimatedDelivery: foundOrder.estimatedDelivery || '2-4 hours',
          currentLocation: 'Pharmacy Warehouse',
          items: foundOrder.items || [],
          customer: {
            name: `${foundOrder.shippingInfo?.firstName || ''} ${foundOrder.shippingInfo?.lastName || ''}`.trim() || 'Customer',
            phone: foundOrder.shippingInfo?.phone || '',
            email: foundOrder.shippingInfo?.email || '',
          },
          shippingAddress: {
            street: foundOrder.shippingInfo?.street || '',
            city: foundOrder.shippingInfo?.city || '',
            state: foundOrder.shippingInfo?.state || '',
            zipCode: foundOrder.shippingInfo?.zip || '',
          },
          timeline: [
            { status: 'placed', title: 'Order Placed', description: 'Your order has been received', timestamp: foundOrder.date || '', completed: true },
            { status: 'confirmed', title: 'Payment Confirmed', description: 'Payment successfully processed', timestamp: foundOrder.date || '', completed: true },
            { status: 'processing', title: 'Processing Order', description: 'Pharmacist is preparing your medicines', timestamp: '', completed: foundOrder.status === 'Processing' || foundOrder.status === 'shipped' || foundOrder.status === 'delivered', active: foundOrder.status === 'Processing' },
            { status: 'shipped', title: 'Out for Delivery', description: 'Your order is on the way', timestamp: '', completed: foundOrder.status === 'shipped' || foundOrder.status === 'delivered' },
            { status: 'delivered', title: 'Delivered', description: 'Order successfully delivered', timestamp: '', completed: foundOrder.status === 'delivered' },
          ],
          total: foundOrder.total || 0,
        });
      } else if (orderNum.toUpperCase() === 'ORD-DEMO123') {
        // Demo order
        setOrderData({
          orderNumber: 'ORD-DEMO123',
          status: 'processing',
          orderDate: 'April 18, 2026 at 10:30 AM',
          estimatedDelivery: '2-4 hours',
          currentLocation: 'Pharmacy Warehouse',
          items: [
            { name: 'Paracetamol 500mg Tablets', quantity: 2, price: 8.99 },
            { name: 'Vitamin D3 2000 IU Capsules', quantity: 1, price: 24.99 }
          ],
          customer: { name: 'John Smith', phone: '+254 700 000 000', email: 'john@example.com' },
          shippingAddress: { street: '123 Main Street', city: 'Nairobi', state: 'Kenya', zipCode: '00100' },
          timeline: [
            { status: 'placed', title: 'Order Placed', description: 'Your order has been received', timestamp: 'April 18, 2026 at 10:30 AM', completed: true },
            { status: 'confirmed', title: 'Payment Confirmed', description: 'Payment successfully processed', timestamp: 'April 18, 2026 at 10:31 AM', completed: true },
            { status: 'processing', title: 'Processing Order', description: 'Pharmacist is preparing your medicines', timestamp: '', completed: true, active: true },
            { status: 'shipped', title: 'Out for Delivery', description: 'Your order is on the way', timestamp: '', completed: false },
            { status: 'delivered', title: 'Delivered', description: 'Order successfully delivered', timestamp: '', completed: false },
          ],
          total: 42.97
        });
      } else {
        setOrderData(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (orderNumber.trim()) {
      fetchOrderData(orderNumber.trim());
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      placed: { text: 'Order Placed', className: 'bg-gray-100 text-gray-800' },
      confirmed: { text: 'Payment Confirmed', className: 'bg-cyan-100 text-cyan-800' },
      processing: { text: 'Processing', className: 'bg-yellow-100 text-yellow-800' },
      shipped: { text: 'Out for Delivery', className: 'bg-blue-100 text-blue-800' },
      delivered: { text: 'Delivered', className: 'bg-green-100 text-green-800' }
    };
    const badge = badges[status] || badges.placed;
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>{badge.text}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-teal-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
          <p className="text-gray-600">Enter your order number to see real-time updates</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch}>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your order number (e.g., ORD-123456)"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !orderNumber.trim()}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Track Order
                  </>
                )}
              </button>
            </div>
            
            {!orderData && !isLoading && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Try a demo:</strong> Enter <code className="bg-blue-100 px-2 py-0.5 rounded">ORD-DEMO123</code> to see how order tracking works
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Order Details */}
        {orderData && (
          <>
            {/* Status Overview Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-teal-100 rounded-full p-2">
                    <Package className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Number</p>
                    <p className="font-mono font-medium">{orderData.orderNumber}</p>
                  </div>
                </div>
                {getStatusBadge(orderData.status)}
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">{orderData.estimatedDelivery}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">From order placement</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 rounded-full p-2">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Location</p>
                    <p className="font-medium">{orderData.currentLocation}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Last updated: Just now</p>
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Order Progress</h2>
              </div>
              <div className="p-6">
                <div className="relative">
                  {orderData.timeline.map((step, index) => (
                    <div key={index} className="flex gap-4 pb-8 last:pb-0">
                      {/* Timeline Line */}
                      <div className="relative flex flex-col items-center">
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.completed 
                              ? step.active 
                                ? 'bg-teal-600 ring-4 ring-teal-100' 
                                : 'bg-teal-600'
                              : 'bg-gray-200'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        {index < orderData.timeline.length - 1 && (
                          <div 
                            className={`w-0.5 h-16 ${
                              step.completed ? 'bg-teal-600' : 'bg-gray-200'
                            }`}
                          />
                        )}
                      </div>

                      {/* Timeline Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className={`font-medium ${step.active ? 'text-teal-600' : 'text-gray-900'}`}>
                            {step.title}
                          </h4>
                          {step.timestamp && (
                            <span className="text-sm text-gray-500">{step.timestamp}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{step.description}</p>
                        {step.active && (
                          <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            ⏳ In Progress
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order & Delivery Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">Order Items</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {orderData.items.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        {index < orderData.items.length - 1 && <div className="border-b border-gray-100 mt-3" />}
                      </div>
                    ))}
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="text-lg text-teal-600 font-medium">${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-lg font-semibold">Delivery Information</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Delivering To</p>
                    <p className="font-medium">{orderData.customer.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{orderData.customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-600">{orderData.customer.email}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">
                      {orderData.shippingAddress.street}, {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Order Found */}
        {!orderData && !isLoading && orderNumber && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No order found</p>
            <p className="text-sm text-gray-400">Please check your order number and try again</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default TrackOrder;