import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoredOrderById } from '../../../utils/prescriptions';

// Types
type OrderStatus = 'Processing' | 'In Progress' | 'On the Way' | 'Delivered' | 'Cancelled' | 'Confirmed';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  estimatedDelivery: string;
  status: OrderStatus;
  shippingInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  paymentMethod: string;
  transactionId: string;
}

// Status configuration
const STATUS_CONFIG: Record<OrderStatus, { bg: string; color: string; icon: string }> = {
  Processing:   { bg: '#fef9c3', color: '#a16207', icon: ' ' },
  'In Progress':{ bg: '#dbeafe', color: '#1d4ed8', icon: ' ' },
  'On the Way': { bg: '#fce7f3', color: '#be185d', icon: ' ' },
  Delivered:    { bg: '#dcfce7', color: '#15803d', icon: ' ' },
  Cancelled:    { bg: '#fee2e2', color: '#dc2626', icon: ' ' },
  Confirmed:    { bg: '#dcfce7', color: '#15803d', icon: ' ' },
};

// Timeline steps based on order status
const getTimelineSteps = (status: OrderStatus) => {
  const allSteps = [
    { key: 'ordered', label: 'Order Placed', completed: true, timestamp: '10:12 PM' },
    { key: 'processing', label: 'Processing', completed: ['Processing', 'In Progress', 'On the Way', 'Delivered'].includes(status), timestamp: '10:15 PM' },
    { key: 'progress', label: 'In Progress', completed: ['In Progress', 'On the Way', 'Delivered'].includes(status), timestamp: status === 'In Progress' ? '10:30 PM' : '10:45 PM' },
    { key: 'ontheway', label: 'On the Way', completed: ['On the Way', 'Delivered'].includes(status), timestamp: status === 'On the Way' ? '11:00 AM' : '11:15 AM' },
    { key: 'delivered', label: 'Delivered', completed: status === 'Delivered', timestamp: status === 'Delivered' ? '12:30 PM' : 'Expected 12:30 PM' },
  ];
  return allSteps;
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 12,
      fontWeight: 700,
      padding: '4px 12px',
      borderRadius: 999,
      letterSpacing: '.4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
    }}>
      <span style={{ fontSize: 14 }}>{cfg.icon}</span>
      {status}
    </span>
  );
}

function TimelineStep({ step, isLast }: { step: any; isLast: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      {/* Icon and line */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: step.completed ? '#0d4f5c' : '#e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: step.completed ? '#fff' : '#94a3b8',
          fontWeight: 600,
        }}>
          {step.completed ? ' ' : ' '}
        </div>
        {!isLast && (
          <div style={{
            width: 2, height: 60,
            background: step.completed ? '#0d4f5c' : '#e2e8f0',
            marginTop: 8,
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, paddingTop: 8 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#12251e', marginBottom: 4 }}>
          {step.label}
        </div>
        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>
          {step.timestamp}
        </div>
        {step.completed && step.key === 'delivered' && (
          <div style={{ fontSize: 11, color: '#15803d', fontWeight: 500 }}>
            Order successfully delivered to your address
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock order data - in real app, this would be fetched from API
  useEffect(() => {
const stored = getStoredOrderById(id);
    setTimeout(() => {
      if (stored) {
        setOrder({
          id: stored.id,
          date: stored.date,
          items: stored.items,
          total: stored.total,
          estimatedDelivery: stored.estimatedDelivery,
          status: stored.status === 'Confirmed' ? 'Processing' : stored.status,
          shippingInfo: stored.shippingInfo,
          paymentMethod: stored.paymentMethod ?? 'Not provided',
          transactionId: stored.transactionId,
        });
      }
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{
            width: 40, height: 40, border: '3px solid #e2e8f0',
            borderTopColor: '#0d4f5c', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 1rem'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#64748b' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: '#dc2626', marginBottom: 16 }}>Order Not Found</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>The order you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/orders')}
            style={{
              background: '#0d4f5c', color: '#fff', border: 'none',
              borderRadius: 8, padding: '10px 20px', cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
            }}
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps(order.status);

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button
          onClick={() => navigate('/orders')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
            color: '#64748b', fontSize: 14, fontFamily: 'inherit',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Orders
        </button>
      </div>

      <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, color: '#0d4f5c', marginBottom: 8 }}>
        Track Order
      </h1>
      <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>
        Order ID: <strong style={{ color: '#0d4f5c' }}>{order.id}</strong>
      </p>

      {/* Status Overview */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '20px', marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#12251e', marginBottom: 4 }}>
              Current Status
            </h3>
            <p style={{ fontSize: 13, color: '#64748b' }}>
              Estimated delivery: {order.estimatedDelivery}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Progress bar */}
        <div style={{ background: '#e2e8f0', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%', background: '#0d4f5c',
              width: order.status === 'Processing' ? '20%' :
                    order.status === 'In Progress' ? '40%' :
                    order.status === 'On the Way' ? '75%' :
                    order.status === 'Delivered' ? '100%' : '0%',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '24px', marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#12251e', marginBottom: 20 }}>
          Order Timeline
        </h3>
        {timelineSteps.map((step, index) => (
          <TimelineStep
            key={step.key}
            step={step}
            isLast={index === timelineSteps.length - 1}
          />
        ))}
      </div>

      {/* Order Details */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '20px', marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#12251e', marginBottom: 16 }}>
          Order Details
        </h3>
        
        {/* Items */}
        <div style={{ marginBottom: 16 }}>
          {order.items.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: index < order.items.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#12251e' }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Qty: {item.quantity}</div>
                </div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0d4f5c' }}>
                KES{item.price.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#12251e' }}>Total</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0d4f5c' }}>KES{order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Delivery & Payment Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '16px',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#12251e', marginBottom: 12 }}>
            Delivery Address
          </h4>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 600, color: '#12251e', marginBottom: 4 }}>
              {order.shippingInfo.firstName} {order.shippingInfo.lastName}
            </div>
            <div>{order.shippingInfo.street}</div>
            <div>{order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zip}</div>
            <div style={{ marginTop: 4 }}> {order.shippingInfo.phone}</div>
            <div>{order.shippingInfo.email}</div>
          </div>
        </div>

        <div style={{
          background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
          padding: '16px',
        }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, color: '#12251e', marginBottom: 12 }}>
            Payment Information
          </h4>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
            <div style={{ marginBottom: 4 }}>Method: <span style={{ color: '#12251e', fontWeight: 500 }}>{order.paymentMethod}</span></div>
            <div>Transaction ID: <span style={{ color: '#12251e', fontWeight: 500 }}>{order.transactionId}</span></div>
            <div style={{ marginTop: 8 }}>
              <StatusBadge status={order.status === 'Cancelled' ? 'Cancelled' : 'Confirmed'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
