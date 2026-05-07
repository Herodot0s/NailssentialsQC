import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getActivePackages } from '@/api/apiClient';
import PackageCard from './PackageCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PackageDiscoverySection() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['activePackages'],
    queryFn: () => getActivePackages(),
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<any>(null);

  const packages = response?.data?.data || [];

  useEffect(() => {
    if (isAutoPlaying && packages.length > 0) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % packages.length);
      }, 5000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, packages.length]);

  if (isLoading || error || packages.length === 0) {
    return null;
  }

  const next = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % packages.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + packages.length) % packages.length);
  };

  // Get visible indices for the "infinite" feel
  const getVisibleIndices = () => {
    const total = packages.length;
    if (total === 1) return [0];
    if (total === 2) return [0, 1];
    
    const prevIdx = (activeIndex - 1 + total) % total;
    const nextIdx = (activeIndex + 1) % total;
    return [prevIdx, activeIndex, nextIdx];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <section className="bg-background py-24 border-y border-border/50 overflow-hidden relative">
      {/* Background Decorative Element */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
      
      <div className="container max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="max-w-2xl">
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-[11px] tracking-[0.4em] uppercase font-semibold text-primary mb-4"
            >
              Curated Collections
            </motion.p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl font-light text-foreground leading-tight"
            >
              Elevate Your <em className="italic text-primary/80">Self-Care</em>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg font-light mt-6 max-w-lg leading-relaxed"
            >
              Hand-picked combinations designed for complete tranquility. 
              Our packages offer a seamless journey through our signature services.
            </motion.p>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={prev}
              className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
              aria-label="Previous package"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={next}
              className="w-14 h-14 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
              aria-label="Next package"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="relative h-[720px] md:h-[780px] flex items-center justify-center">
          <div className="flex items-center justify-center gap-8 w-full">
            <AnimatePresence mode="popLayout" initial={false}>
              {visibleIndices.map((idx, i) => {
                const pkg = packages[idx];
                const isCenter = idx === activeIndex;
                
                return (
                  <motion.div
                    key={`${pkg.id}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.8, x: i === 0 ? -100 : i === 2 ? 100 : 0 }}
                    animate={{ 
                      opacity: isCenter ? 1 : 0.4, 
                      scale: isCenter ? 1 : 0.85,
                      x: 0,
                      zIndex: isCenter ? 20 : 10,
                    }}
                    exit={{ opacity: 0, scale: 0.8, x: i === 0 ? -200 : i === 2 ? 200 : 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                    className={`shrink-0 w-full md:w-[400px] h-auto md:h-[680px] ${!isCenter ? 'hidden md:block cursor-pointer' : ''}`}
                    onClick={() => !isCenter && setActiveIndex(idx)}
                  >
                    <PackageCard pkg={pkg} isFocused={isCenter} />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {packages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex(idx);
              }}
              className={`h-1.5 transition-all duration-500 rounded-full ${
                idx === activeIndex 
                  ? 'w-12 bg-primary' 
                  : 'w-2 bg-border hover:bg-muted-foreground'
              }`}
              aria-label={`Go to package ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
