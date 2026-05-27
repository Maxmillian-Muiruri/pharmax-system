import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrdersUpdateEventName, getStoredOrders } from '../../utils/prescriptions';
import type { StoredOrder } from '../../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'Processing' | 'In Progress' | 'On the Way' | 'Delivered' | 'Cancelled';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  estimatedDelivery: string;
  status: OrderStatus;
  isPrescriptionOrder?: boolean;
  prescriptionId?: string | null;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { bg: string; color: string }> = {
  Processing:   { bg: '#fef9c3', color: '#a16207' },
  'In Progress':{ bg: '#dbeafe', color: '#1d4ed8' },
  'On the Way': { bg: '#fce7f3', color: '#be185d' },
  Delivered:    { bg: '#dcfce7', color: '#15803d' },
  Cancelled:    { bg: '#fee2e2', color: '#dc2626' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 10px',
      borderRadius: 999,
      letterSpacing: '.4px',
    }}>
      ● {status}
    </span>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();

  return (
    <div style={{
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '16px 20px',
      background: '#fff',
      marginBottom: 12,
    }}>
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0d4f5c', fontFamily: "'Sora', sans-serif" }}>
          {order.id}
        </span>
        {order.isPrescriptionOrder && (
          <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>
            Rx {order.prescriptionId ?? ''}
          </span>
        )}
        <StatusBadge status={order.status} />
      </div>

      {/* Middle row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 12, color: '#64748b', marginBottom: 10, flexWrap: 'wrap' }}>
        <span>Order Date&nbsp; <strong style={{ color: '#12251e' }}>{order.date}</strong></span>
        <span>Estimated Delivery&nbsp; <strong style={{ color: '#12251e' }}>{order.estimatedDelivery}</strong></span>
        <span>Items:&nbsp; <strong style={{ color: '#12251e' }}>{order.items.reduce((s, i) => s + i.quantity, 0)} item(s)</strong></span>
        <span>Total:&nbsp; <strong style={{ color: '#0d4f5c' }}>${order.total.toFixed(2)}</strong></span>

        {/* Action buttons — pushed right */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            onClick={() => navigate(`/track/${order.id}`)}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              color: '#0d4f5c',
              background: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            Track Order
          </button>
          <button
            onClick={() => navigate(`/orders/${order.id}`)}
            style={{
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 12,
              color: '#64748b',
              background: '#fff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Items preview */}
      <div style={{ fontSize: 12, color: '#64748b' }}>
        {order.items.map(i => i.name).join(', ')}
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats({ orders }: { orders: Order[] }) {
  const total      = orders.length;
  const delivered  = orders.filter(o => o.status === 'Delivered').length;
  const inProgress = orders.filter(o => o.status === 'In Progress' || o.status === 'Processing').length;
  const onTheWay   = orders.filter(o => o.status === 'On the Way').length;

  const items = [
    { label: 'Total Orders', value: total,      color: '#0d4f5c' },
    { label: 'Delivered',    value: delivered,  color: '#15803d' },
    { label: 'In Progress',  value: inProgress, color: '#1d4ed8' },
    { label: 'On the Way',   value: onTheWay,   color: '#be185d' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 20 }}>
      {items.map(item => (
        <div key={item.label} style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: '18px 16px',
          background: '#fff',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, color: item.color }}>{item.value}</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── MyOrders ─────────────────────────────────────────────────────────────────

const MyOrders = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrders = () => {
      const userJson = localStorage.getItem('pharmacie_user');
      const userObj = userJson ? JSON.parse(userJson) : null;
      const currentUserId = userObj?.userId || null;

      const stored = getStoredOrders() as StoredOrder[];
      const userOrders = stored.filter(order => 
        order.userId && order.userId === currentUserId
      );
      
      setOrders(
        userOrders.map((order) => ({
          id: order.id,
          date: order.date,
          items: order.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          total: order.total,
          estimatedDelivery: order.estimatedDelivery,
          status: order.status === 'Confirmed' ? 'Processing' : order.status,
          isPrescriptionOrder: order.isPrescriptionOrder,
          prescriptionId: order.prescriptionId,
        })),
      );
    };

    loadOrders();
    const eventName = getOrdersUpdateEventName();
    window.addEventListener(eventName, loadOrders);
    return () => window.removeEventListener(eventName, loadOrders);
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some(i => i.name.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'All' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem', fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 700, color: '#0d4f5c', marginBottom: 4 }}>
        My Orders
      </h1>
      <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>View and track all your orders in one place.</p>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <svg
            width="15" height="15"
            viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order number or product name..."
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 36,
              paddingRight: 12,
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 13,
              color: '#12251e',
              background: '#fff',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filter dropdown */}
        <div style={{ position: 'relative' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'All')}
            style={{
              height: 40,
              padding: '0 14px',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              background: '#fff',
              fontSize: 13,
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontFamily: 'inherit',
            }}
          >
            <option value="All">All statuses</option>
            <option value="Processing">Processing</option>
            <option value="In Progress">In Progress</option>
            <option value="On the Way">On the Way</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: 14, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 }}>
          {orders.length === 0 ? (
            <>
              <p style={{ marginBottom: 14 }}>You have no orders yet.</p>
              <button
                onClick={() => navigate('/products')}
                style={{ border: 'none', borderRadius: 10, background: '#0d4f5c', color: '#fff', padding: '10px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
              >
                Start Shopping
              </button>
            </>
          ) : 'No orders found.'}
        </div>
      ) : (
        filtered.map(order => <OrderCard key={order.id} order={order} />)
      )}

      {/* Stats grid */}
      <Stats orders={orders} />
    </div>
  );
};

export default MyOrders;
