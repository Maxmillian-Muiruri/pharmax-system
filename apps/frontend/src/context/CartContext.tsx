import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { CartItem } from '../app/cart/page';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

const CART_STORAGE_KEY = 'pharmx_cart';

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCartToStorage(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage());
  const auth = useAuth()
  const isAuthenticated = auth ? auth.isAuthenticated : false;
  const lastAuthStatus = useRef(isAuthenticated);
  const isInitialMount = useRef(true);

  // Sync with backend on login or mount
  useEffect(() => {
    if (isAuthenticated && (isInitialMount.current || !lastAuthStatus.current)) {
      cartApi.get()
        .then(res => {
          const remoteItems = res.data.data.map((item: any) => ({
            id: item.productId,
            name: item.product.name,
            unitPrice: Number(item.product.unitPrice),
            quantity: item.quantity,
            image: item.product.image || "",
            brand: "PharmX", // Default as DB doesn't have brand
            packSize: "1",   // Default
            category: item.product.category || "General",
            requiresPrescription: false,
            stockStatus: (item.product.quantity > 0 || item.product.status === 'active') ? 'in_stock' : 'out_of_stock',
            imageType: 'tablet',
          }));

          if (remoteItems.length > 0) {
            setItems(remoteItems);
          } else if (items.length > 0) {
            // Push local cart to server if remote is empty but local has items
            cartApi.update(items.map(i => ({ productId: String(i.id), quantity: i.quantity })));
          }
        })
        .catch(console.error);
    }

    lastAuthStatus.current = isAuthenticated;
    isInitialMount.current = false;
  }, [isAuthenticated]);

  useEffect(() => {
    saveCartToStorage(items);

    // Sync to server if items change and logged in
    if (isAuthenticated) {
      const syncTimeout = setTimeout(() => {
        cartApi.update(items.map(i => ({ productId: String(i.id), quantity: i.quantity })))
          .catch(console.error);
      }, 1000); // Debounce sync
      return () => clearTimeout(syncTimeout);
    }
  }, [items, isAuthenticated]);

  const addItem = (newItem: Omit<CartItem, 'id'> & { id?: string }) => {
    const id = newItem.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const cartItem: CartItem = { ...newItem, id };

    setItems(prevItems => {
      const existingItem = prevItems.find(item =>
        item.name === cartItem.name &&
        item.brand === cartItem.brand &&
        item.packSize === cartItem.packSize
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + cartItem.quantity }
            : item
        );
      }

      return [...prevItems, cartItem];
    });
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemCount = () => {
    // Count distinct products in the cart, not total quantity.
    return items.length;
  };

  const getSubtotal = () => {
    return items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getItemCount,
      getSubtotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
