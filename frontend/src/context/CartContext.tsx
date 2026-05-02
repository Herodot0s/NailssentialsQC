import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem } from '@/types/CartItem';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (serviceId: number) => void;
  updateCartItem: (serviceId: number, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  totalPrice: number;
  totalDuration: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bookingCart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bookingCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      if (prev.find((i) => i.serviceId === item.serviceId)) return prev;
      return [...prev, item];
    });
  };

  const removeFromCart = (serviceId: number) => {
    setCart((prev) => prev.filter((i) => i.serviceId !== serviceId));
  };

  const updateCartItem = (serviceId: number, updates: Partial<CartItem>) => {
    setCart((prev) =>
      prev.map((i) => (i.serviceId === serviceId ? { ...i, ...updates } : i)),
    );
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = cart.reduce((sum, item) => sum + item.duration, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        totalPrice,
        totalDuration,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
