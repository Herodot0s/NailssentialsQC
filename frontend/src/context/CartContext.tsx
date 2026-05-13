import React, { createContext, useContext, useState, useEffect } from 'react';
import type { CartItem, CartChildService } from '@/types/CartItem';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (serviceId: number, packageId?: number) => void;
  updateCartItem: (serviceId: number, updates: Partial<CartItem>) => void;
  addPackageToCart: (pkg: {
    packageId: number;
    packageName: string;
    packagePrice: number;
    services: Array<{ id: number; name: string; price: number; duration: number }>;
  }) => void;
  updateChildService: (
    packageId: number,
    childServiceId: number,
    updates: Partial<CartChildService>,
  ) => void;
  isPackageInCart: (packageId: number) => boolean;
  clearCart: () => void;
  totalPrice: number;
  totalDuration: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('bookingCart');
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map((item: any) => ({ ...item, type: item.type || 'service' }));
  });

  useEffect(() => {
    localStorage.setItem('bookingCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      if (prev.find((i) => i.serviceId === item.serviceId)) return prev;
      return [...prev, { ...item, type: item.type || 'service' }];
    });
  };

  const removeFromCart = (serviceId: number, packageId?: number) => {
    if (packageId) {
      setCart((prev) => prev.filter((i) => !(i.type === 'package' && i.packageId === packageId)));
    } else {
      setCart((prev) => prev.filter((i) => i.serviceId !== serviceId));
    }
  };

  const updateCartItem = (serviceId: number, updates: Partial<CartItem>) => {
    setCart((prev) => prev.map((i) => (i.serviceId === serviceId ? { ...i, ...updates } : i)));
  };

  const addPackageToCart = (pkg: {
    packageId: number;
    packageName: string;
    packagePrice: number;
    services: Array<{ id: number; name: string; price: number; duration: number }>;
  }) => {
    setCart((prev) => {
      const exists = prev.some(
        (item) => item.type === 'package' && item.packageId === pkg.packageId,
      );
      if (exists) return prev;

      const newItem: CartItem = {
        serviceId: -pkg.packageId,
        serviceName: pkg.packageName,
        price: pkg.packagePrice,
        duration: pkg.services.reduce((sum, s) => sum + s.duration, 0),
        type: 'package',
        packageId: pkg.packageId,
        packageName: pkg.packageName,
        packagePrice: pkg.packagePrice,
        childServices: pkg.services.map((s) => ({
          serviceId: s.id,
          serviceName: s.name,
          price: s.price,
          duration: s.duration,
        })),
      };
      return [...prev, newItem];
    });
  };

  const updateChildService = (
    packageId: number,
    childServiceId: number,
    updates: Partial<CartChildService>,
  ) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.type === 'package' && item.packageId === packageId) {
          return {
            ...item,
            childServices: item.childServices?.map((child) =>
              child.serviceId === childServiceId ? { ...child, ...updates } : child,
            ),
          };
        }
        return item;
      }),
    );
  };

  const isPackageInCart = (packageId: number) => {
    return cart.some((item) => item.type === 'package' && item.packageId === packageId);
  };

  const clearCart = () => setCart([]);

  const totalPrice = cart.reduce((sum, item) => {
    if (item.type === 'package' && item.packagePrice != null) {
      return sum + item.packagePrice;
    }
    return sum + item.price;
  }, 0);

  const totalDuration = cart.reduce((sum, item) => sum + item.duration, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateCartItem,
        addPackageToCart,
        updateChildService,
        isPackageInCart,
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
