import { getAuthUser } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  addedAt?: string;
}

export interface CartResponse {
  success: boolean;
  data?: CartItem[];
  message?: string;
}

export interface CartUpdateResponse {
  success: boolean;
  message?: string;
}

class CartService {
  private getAuthHeaders() {
    const user = getAuthUser();
    return {
      'Content-Type': 'application/json',
      ...(user?.token && { Authorization: `Bearer ${user.token}` }),
    };
  }

  // Get cart from backend (Remote Sync)
  async getCart(): Promise<CartResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch cart');
      }

      return {
        success: true,
        data: data.data || [],
      };
    } catch (error) {
      console.error('Error fetching cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch cart',
      };
    }
  }

  // Update cart in backend (Clear & Replace logic)
  async updateCart(cartItems: CartItem[]): Promise<CartUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ items: cartItems }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update cart');
      }

      return {
        success: true,
        message: data.message || 'Cart updated successfully',
      };
    } catch (error) {
      console.error('Error updating cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update cart',
      };
    }
  }

  // Clear cart after successful checkout
  async clearCart(): Promise<CartUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear cart');
      }

      return {
        success: true,
        message: data.message || 'Cart cleared successfully',
      };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to clear cart',
      };
    }
  }

  // Add single item to cart
  async addToCart(item: Omit<CartItem, 'id' | 'addedAt'>): Promise<CartUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(item),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item to cart');
      }

      return {
        success: true,
        message: data.message || 'Item added to cart successfully',
      };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add item to cart',
      };
    }
  }

  // Update single item quantity
  async updateCartItemQuantity(itemId: string, quantity: number): Promise<CartUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update cart item');
      }

      return {
        success: true,
        message: data.message || 'Cart item updated successfully',
      };
    } catch (error) {
      console.error('Error updating cart item:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update cart item',
      };
    }
  }

  // Remove single item from cart
  async removeFromCart(itemId: string): Promise<CartUpdateResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove item from cart');
      }

      return {
        success: true,
        message: data.message || 'Item removed from cart successfully',
      };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove item from cart',
      };
    }
  }

  // Sync local cart with backend (Clear & Replace)
  async syncCart(localCartItems: CartItem[]): Promise<{ local: CartItem[], remote: CartItem[] }> {
    try {
      // First, get remote cart
      const remoteResponse = await this.getCart();
      const remoteCart = remoteResponse.success ? remoteResponse.data || [] : [];

      // Update remote cart with local items
      if (localCartItems.length > 0) {
        await this.updateCart(localCartItems);
      }

      return {
        local: localCartItems,
        remote: remoteCart,
      };
    } catch (error) {
      console.error('Error syncing cart:', error);
      return {
        local: localCartItems,
        remote: [],
      };
    }
  }
}

export const cartService = new CartService();
