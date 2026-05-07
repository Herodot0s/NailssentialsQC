import React from 'react';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ServicePackage } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface PackageCardProps {
  pkg: ServicePackage;
  isFocused?: boolean;
}

export default function PackageCard({ pkg, isFocused = false }: PackageCardProps) {
  const { addPackageToCart, isPackageInCart } = useCart();
  const navigate = useNavigate();

  const pkgPrice = parseFloat(pkg.price);
  const totalValue = parseFloat(pkg.services_total);
  const savings = totalValue > pkgPrice ? totalValue - pkgPrice : 0;
  const hasSavings = savings > 0;
  const inCart = isPackageInCart(pkg.id);

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (inCart) {
      navigate('/booking');
    } else {
      addPackageToCart({
        packageId: pkg.id,
        packageName: pkg.name,
        packagePrice: pkgPrice,
        services: pkg.services.map(s => ({
          id: s.id,
          name: s.name,
          price: parseFloat(s.price),
          duration: s.duration_minutes
        }))
      });
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: isFocused ? 1 : 0.6,
        scale: isFocused ? 1.05 : 0.95,
        y: 0,
        filter: isFocused ? 'blur(0px)' : 'blur(1px)',
        zIndex: isFocused ? 10 : 1
      }}
      transition={{
        duration: 0.5,
        ease: [0.32, 0.72, 0, 1]
      }}
      className={`bg-white border-none transition-shadow duration-500 rounded-3xl overflow-hidden group flex flex-col h-full relative ${
        isFocused ? 'shadow-premium ring-1 ring-primary/10' : 'shadow-card'
      }`}
    >
      <div className="h-56 w-full bg-[#F5E6D9]/30 flex items-center justify-center overflow-hidden relative shrink-0">
        {pkg.image_url ? (
          <motion.img 
            src={pkg.image_url} 
            alt={pkg.name} 
            animate={{ scale: isFocused ? 1.1 : 1 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="h-full w-full object-cover" 
          />
        ) : (
          <Sparkles className="w-12 h-12 text-primary/30" />
        )}
        
        {hasSavings && (
          <div className="absolute top-4 right-4 bg-primary text-white text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-lg">
            Save ₱{savings.toFixed(0)}
          </div>
        )}
      </div>

      <div className="p-8 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary mb-3">
            Curated Bundle
          </p>
          <h3 className="font-serif text-2xl font-light text-charcoal-bark mb-1">
            {pkg.name}
          </h3>
          <p className="text-[11px] uppercase tracking-[0.1em] font-medium text-warm-stone mb-6">
            {pkg.services.length} services included
          </p>

          <ul className="space-y-2 mb-8">
            {pkg.services.map(service => (
              <li key={service.id} className="text-sm text-warm-stone font-light flex items-start gap-2">
                <span className="text-primary/40 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/20 shrink-0" />
                <span className="leading-tight">{service.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-6 shrink-0">
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-serif text-2xl font-light text-primary">
              ₱{pkgPrice.toFixed(2)}
            </span>
            {hasSavings && (
              <span className="font-serif text-sm font-light text-warm-stone/50 line-through">
                ₱{totalValue.toFixed(2)}
              </span>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleAction}
              className={`w-full h-12 rounded-xl uppercase tracking-[0.2em] text-[11px] font-bold transition-all ${
                inCart 
                  ? 'bg-forest-confirm hover:bg-forest-confirm/90 text-white' 
                  : 'bg-primary hover:bg-primary-hover text-white shadow-premium hover:shadow-xl'
              }`}
            >
              {inCart ? (
                <>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  View in Cart
                </>
              ) : (
                'Book Package'
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
