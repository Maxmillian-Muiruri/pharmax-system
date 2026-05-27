import { getAuthUser } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  name?: string;
  image?: string;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface BillingInfo {
  paymentMethod: 'Credit/Debit Card' | 'M-Pesa' | null;
  cardNumber?: string;
  expiry?: string;
  cvv?: string;
  name?: string;
  mpesaPhoneNumber?: string;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  billingInfo: BillingInfo;
  totalAmount: number;
  deliveryOption: 'standard' | 'express';
  prescriptionId?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'Processing' | 'In Progress' | 'On the Way' | 'Delivered' | 'Cancelled' | 'Confirmed';
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  shippingInfo: ShippingInfo;
  billingInfo: BillingInfo;
  deliveryOption: 'standard' | 'express';
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  prescriptionId?: string;
}

export interface OrderResponse {
  success: boolean;
  data?: Order;
  message?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data?: Order[];
  message?: string;
}

export interface OrderTrackingResponse {
  success: boolean;
  data?: Order;
  message?: string;
}

class OrderService {
  private getAuthHeaders() {
    const user = getAuthUser();
    return {
      'Content-Type': 'application/json',
      ...(user?.token && { Authorization: `Bearer ${user.token}` }),
    };
  }

  // Create new order (Final Checkout)
  async createOrder(orderData: CreateOrderRequest): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create order');
      }

      return {
        success: true,
        data: data.data,
        message: data.message || 'Order created successfully',
      };
    } catch (error) {
      console.error('Error creating order:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      };
    }
  }

  // Get user's orders (Orders List)
  async getOrders(): Promise<OrdersListResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-orders`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      return {
        success: true,
        data: data.data || [],
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch orders',
      };
    }
  }

  // Get specific order details (Order Details)
  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-orders/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order details');
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch order details',
      };
    }
  }

  // Track order by orderNumber or id (Live Tracking)
  async trackOrder(trackingId: string): Promise<OrderTrackingResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/user-orders/track/${trackingId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to track order');
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      console.error('Error tracking order:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to track order',
      };
    }
  }

  // Update order status (for admin use)
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<OrderResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }

      return {
        success: true,
        data: data.data,
        message: data.message || 'Order status updated successfully',
      };
    } catch (error) {
      console.error('Error updating order status:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update order status',
      };
    }
  }
}

export const orderService = new OrderService();
