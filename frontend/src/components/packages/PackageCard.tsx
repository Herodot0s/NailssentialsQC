import React from 'react';
import { Sparkles, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ServicePackage } from '@/types/api';
import { useCart } from '@/context/CartContext';
import { useNavigate } from 'react-router-dom';

interface PackageCardProps {
  pkg: ServicePackage;
  index: number;
}

export default function PackageCard({ pkg, index }: PackageCardProps) {
  const { addPackageToCart, isPackageInCart } = useCart();
  const navigate = useNavigate();

  const pkgPrice = parseFloat(pkg.price);
  const totalValue = parseFloat(pkg.services_total);
  const savings = totalValue > pkgPrice ? totalValue - pkgPrice : 0;
  const hasSavings = savings > 0;
  const inCart = isPackageInCart(pkg.id);

  const handleAction = () => {
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
    <div 
      className="bg-white border-none shadow-lg hover:shadow-2xl transition-shadow duration-500 rounded-none overflow-hidden group animate-in fade-in slide-in-from-bottom-4 fill-mode-both flex flex-col h-full"
      style={{ animationDelay: `${index * 150}ms`, animationDuration: '700ms' }}
    >
      <div className="h-48 w-full bg-primary-ultra/30 flex items-center justify-center overflow-hidden relative shrink-0">
        {pkg.image_url ? (
          <img 
            src={pkg.image_url} 
            alt={pkg.name} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
        ) : (
          <Sparkles className="w-12 h-12 text-primary/30" />
        )}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[8px] uppercase tracking-[0.3em] font-bold text-primary mb-2">
            Curated Bundle
          </p>
          <h3 className="font-serif text-2xl font-light mb-1">
            {pkg.name}
          </h3>
          <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">
            {pkg.services.length} services included
          </p>

          <ul className="space-y-1.5 mb-6">
            {pkg.services.map(service => (
              <li key={service.id} className="text-xs text-muted-foreground font-light flex items-start gap-2">
                <span className="text-primary/40 mt-0.5">•</span>
                <span>{service.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="font-serif text-xl font-light text-primary">
              ₱{pkgPrice.toFixed(2)}
            </span>
            {hasSavings && (
              <span className="font-serif text-sm font-light text-muted-foreground line-through decoration-muted-foreground/30">
                ₱{totalValue.toFixed(2)}
              </span>
            )}
            {hasSavings && (
              <span className="bg-success-color/10 text-success-color text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 whitespace-nowrap">
                Save ₱{savings.toFixed(2)}
              </span>
            )}
          </div>

          <Button 
            onClick={handleAction}
            className={`w-full h-12 rounded-none uppercase tracking-widest text-[10px] font-bold transition-all ${
              inCart 
                ? 'bg-success-color hover:bg-success-color/90 text-white' 
                : 'hover:shadow-lg hover:shadow-primary/20'
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
        </div>
      </div>
    </div>
  );
}
