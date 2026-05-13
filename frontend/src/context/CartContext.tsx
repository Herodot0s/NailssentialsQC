import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
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
  const { user, isLoaded } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const cartLoadedForUser = React.useRef<string | null | undefined>(undefined);

  // Load cart on mount or user change
  useEffect(() => {
    if (!isLoaded) return;

    const currentUserId = user?.id || null;

    if (cartLoadedForUser.current !== currentUserId) {
      // User changed or initial load
      const storageKey = currentUserId ? `bookingCart_${currentUserId}` : 'bookingCart';
      const saved = localStorage.getItem(storageKey);
      let newCart = saved ? JSON.parse(saved) : [];
      newCart = newCart.map((item: any) => ({ ...item, type: item.type || 'service' }));

      // Migration/Merge: If logging in from guest, merge guest items into user cart
      if (cartLoadedForUser.current === null && currentUserId) {
        const guestCart = [...cart];
        guestCart.forEach(guestItem => {
          if (!newCart.find((i: CartItem) => i.serviceId === guestItem.serviceId)) {
            newCart.push(guestItem);
          }
        });
        // Clear guest storage after migration
        localStorage.removeItem('bookingCart');
      }

      setCart(newCart);
      cartLoadedForUser.current = currentUserId;
    }
  }, [isLoaded, user?.id, cart]); // Include cart for merge logic

  // Persist cart on changes
  useEffect(() => {
    // Only persist if Clerk is loaded and we have loaded the cart for the current user
    if (!isLoaded || cartLoadedForUser.current === undefined) return;
    
    const currentUserId = user?.id || null;
    
    // Safety check: Don't save if the cart state doesn't match the current user 
    // (prevents overwriting User B's cart with User A's state during transition)
    if (currentUserId !== cartLoadedForUser.current) return;

    const storageKey = currentUserId ? `bookingCart_${currentUserId}` : 'bookingCart';
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, isLoaded, user?.id]);

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
