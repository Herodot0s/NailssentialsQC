import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getServices } from '../api/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Clock, Sparkles, AlertCircle, Loader2, ArrowRight, CheckCircle2, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import PackageDiscoverySection from '@/components/packages/PackageDiscoverySection';

interface Category {
  id: number;
  name: string;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string;
  is_popular: boolean;
  category_id: number;
}

const categoryImages: Record<string, string> = {
  'Nail Care': 'https://images.unsplash.com/photo-1632345033839-23190224213d?auto=format&fit=crop&q=80&w=1000',
  'Waxing': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000',
  'Spa Treatments': 'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&q=80&w=1000',
  'default': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=1000',
};

const PREMIUM_EASE = [0.32, 0.72, 0, 1];
const morphTransition = {
  duration: 0.5,
  ease: PREMIUM_EASE
};

const Services: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

  useEffect(() => {
    if (selectedService) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedService]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, svcRes] = await Promise.all([getCategories(), getServices()]);
        setCategories(catRes.data.data || []);
        setServices(svcRes.data.data || []);
      } catch {
        setError('Failed to load services. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getCategoryName = (id: number) => {
    return categories?.find(c => c.id === id)?.name || 'default';
  };

  const getServiceImage = (categoryId: number) => {
    const name = getCategoryName(categoryId);
    return categoryImages[name] || categoryImages['default'];
  };

  const filteredServices =
    activeCategoryId === 'all'
      ? (services || [])
      : (services || []).filter((s) => s.category_id === parseInt(activeCategoryId));

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary stroke-[1.5]" />
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground">Preparing your menu...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-warm-canvas">
      {/* Header Section */}
      <header className="relative py-24 px-6 text-center bg-linen-mist border-b border-kiln-border/50 overflow-hidden">
        <div className="container max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-[11px] tracking-[0.4em] uppercase font-bold text-kiln-terracotta">Curated Treatments</p>
          <h1 className="font-serif text-5xl md:text-8xl font-light tracking-tight text-charcoal-bark leading-none">
            Our <span className="italic">Services</span>
          </h1>
          <p className="text-warm-stone text-lg max-w-xl mx-auto font-light leading-relaxed">
            Discover our menu of premium spa experiences, each designed for your total relaxation and beauty.
          </p>
        </div>
      </header>

      <PackageDiscoverySection />

      <main className="container max-w-5xl mx-auto py-16 px-6 sm:px-12">
        {error && (
          <div className="bg-brick-error/5 border border-brick-error/20 text-brick-error text-[11px] tracking-widest uppercase p-4 rounded-xl flex items-center gap-3 mb-12 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs defaultValue="all" onValueChange={setActiveCategoryId} className="w-full space-y-16">
          <div className="flex justify-center border-b border-kiln-border/50 animate-in fade-in duration-1000 delay-200">
            <TabsList className="bg-transparent p-0 h-auto flex-wrap justify-center rounded-none gap-8">
              <TabsTrigger
                value="all"
                className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone bg-transparent border-b-2 border-transparent data-[state=active]:border-kiln-terracotta data-[state=active]:text-charcoal-bark data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 py-4 transition-all hover:text-kiln-terracotta"
              >
                All Services
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id.toString()}
                  className="text-[11px] uppercase tracking-[0.2em] font-bold text-warm-stone bg-transparent border-b-2 border-transparent data-[state=active]:border-kiln-terracotta data-[state=active]:text-charcoal-bark data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 py-4 transition-all hover:text-kiln-terracotta"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategoryId} className="mt-0 outline-none">
            <div className="flex flex-col">
              {filteredServices.map((svc, index) => (
                <motion.div
                  layoutId={`service-bg-${svc.id}`}
                  key={svc.id}
                  className="flex flex-col md:flex-row md:items-center justify-between py-8 px-6 sm:px-8 mb-4 rounded-3xl cursor-pointer group bg-transparent hover:bg-white transition-colors border border-transparent hover:border-kiln-border/50 hover:shadow-card"
                  onClick={() => setSelectedService(svc)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: PREMIUM_EASE }}
                >
                  <div className="flex gap-6 sm:gap-8 items-start md:items-center flex-1">
                    <motion.div layoutId={`service-image-container-${svc.id}`} className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-2xl bg-bisque-wash border border-kiln-border/30 group-hover:border-kiln-terracotta/20 transition-colors">
                      <motion.img
                        layoutId={`service-image-${svc.id}`}
                        src={getServiceImage(svc.category_id)}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-4">
                        <motion.h3 layoutId={`service-title-${svc.id}`} className="font-serif text-2xl font-light text-charcoal-bark group-hover:text-kiln-terracotta transition-colors">
                          {svc.name}
                        </motion.h3>
                        {svc.is_popular && (
                          <Badge className="bg-bisque-wash text-kiln-terracotta border-none uppercase tracking-[0.2em] text-[11px] font-bold px-3 py-1 rounded-full">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <p className="text-warm-stone text-sm font-light leading-relaxed max-w-xl line-clamp-2">
                        {svc.description || 'Experience our premium service tailored just for you. Quality and relaxation guaranteed.'}
                      </p>
                      <motion.div layoutId={`service-meta-${svc.id}`} className="flex items-center gap-6">
                        <div className="flex items-center text-warm-stone text-[11px] tracking-widest uppercase font-bold">
                          <Clock className="mr-2 h-3 w-3 stroke-[2] text-kiln-terracotta" />
                          {svc.duration_minutes} Minutes
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  <div className="mt-6 md:mt-0 flex items-center justify-between md:justify-end gap-12 sm:pl-8">
                    <motion.div layoutId={`service-price-${svc.id}`} className="text-2xl font-serif font-light text-charcoal-bark group-hover:scale-105 transition-transform origin-right">
                      ₱{parseFloat(svc.price).toLocaleString()}
                    </motion.div>
                    <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full border border-kiln-border text-kiln-terracotta group-hover:bg-kiln-terracotta group-hover:text-white group-hover:border-transparent transition-all duration-300">
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredServices.length === 0 && !error && (
              <div className="text-center py-32 bg-linen-mist rounded-3xl border border-kiln-border animate-in fade-in duration-500">
                <p className="text-[11px] tracking-[0.2em] uppercase font-bold text-warm-stone italic">
                  No services found in this category.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: PREMIUM_EASE }}
              className="fixed inset-0 z-40 bg-warm-canvas/80 backdrop-blur-md"
              onClick={() => setSelectedService(null)}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12 pointer-events-none">
              <motion.div
                layoutId={`service-bg-${selectedService.id}`}
                className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-premium flex flex-col relative pointer-events-auto"
                transition={morphTransition}
              >
                <div className="absolute top-6 right-6 z-10 flex gap-2">
                  <button onClick={() => setSelectedService(null)} className="w-10 h-10 rounded-full bg-white/70 backdrop-blur-md flex items-center justify-center text-charcoal-bark hover:bg-white hover:scale-105 transition-all shadow-sm">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <motion.div layoutId={`service-image-container-${selectedService.id}`} className="relative h-72 sm:h-96 w-full shrink-0 overflow-hidden bg-bisque-wash rounded-t-3xl border-b border-kiln-border">
                  <motion.img
                    layoutId={`service-image-${selectedService.id}`}
                    src={getServiceImage(selectedService.category_id)}
                    className="w-full h-full object-cover"
                    transition={morphTransition}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-bark/60 via-charcoal-bark/10 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                    <Badge className="bg-white/20 backdrop-blur-md text-white border-none uppercase tracking-[0.2em] text-[11px] font-bold px-3 py-1">
                      {getCategoryName(selectedService.category_id)}
                    </Badge>
                  </div>
                </motion.div>

                <div className="p-8 sm:p-12 space-y-12">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                    <div className="space-y-4 flex-1">
                      <motion.h2 layoutId={`service-title-${selectedService.id}`} className="text-4xl sm:text-5xl leading-tight font-serif font-light text-charcoal-bark" transition={morphTransition}>
                        {selectedService.name}
                      </motion.h2>
                      <motion.div layoutId={`service-meta-${selectedService.id}`} className="flex items-center gap-4 text-warm-stone text-[11px] tracking-widest uppercase font-bold" transition={morphTransition}>
                        <Clock className="h-4 w-4 stroke-[2] text-kiln-terracotta" />
                        {selectedService.duration_minutes} Minutes Treatment
                      </motion.div>
                    </div>
                    <motion.div layoutId={`service-price-${selectedService.id}`} className="text-3xl sm:text-4xl font-serif font-light text-kiln-terracotta whitespace-nowrap" transition={morphTransition}>
                      ₱{parseFloat(selectedService.price).toLocaleString()}
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: PREMIUM_EASE }}
                    className="space-y-6"
                  >
                    <h4 className="text-[11px] tracking-[0.2em] uppercase font-bold text-warm-stone border-b border-kiln-border pb-3">The Experience</h4>
                    <p className="text-xl font-serif font-light leading-relaxed text-charcoal-bark/90 italic">
                      "{selectedService.description || 'Experience our premium service tailored just for you. Quality and relaxation guaranteed.'}"
                    </p>
                    <p className="text-base font-light leading-relaxed text-warm-stone max-w-2xl">
                      At NailssentialsQC, we believe that every treatment should be a ritual.
                      This service is performed by our expert technicians using only the
                      highest-grade botanical products in our signature tranquil environment.
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: PREMIUM_EASE }}
                    className="space-y-6"
                  >
                    <h4 className="text-[11px] tracking-[0.2em] uppercase font-bold text-warm-stone border-b border-kiln-border pb-3">What to Expect</h4>
                    <ul className="space-y-5">
                      <li className="flex items-start gap-4">
                        <CheckCircle2 className="h-5 w-5 text-kiln-terracotta shrink-0 mt-0.5" />
                        <span className="text-base font-light text-charcoal-bark/80">Personalized consultation to match your preferences and skin type.</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <CheckCircle2 className="h-5 w-5 text-kiln-terracotta shrink-0 mt-0.5" />
                        <span className="text-base font-light text-charcoal-bark/80">Premium medical-grade sterilization for all instruments and tools.</span>
                      </li>
                      <li className="flex items-start gap-4">
                        <CheckCircle2 className="h-5 w-5 text-kiln-terracotta shrink-0 mt-0.5" />
                        <span className="text-base font-light text-charcoal-bark/80">Signature aromatic oils and luxury finishing products applied by experts.</span>
                      </li>
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.3, ease: PREMIUM_EASE }}
                    className="pt-8 mt-12 border-t border-kiln-border sticky bottom-0 bg-white/95 backdrop-blur-md pb-8 -mx-8 px-8 sm:-mx-12 sm:px-12 z-20"
                  >
                    {cart.find(i => i.serviceId === selectedService.id) ? (
                      <Button
                        className="w-full h-14 rounded-xl text-[11px] uppercase tracking-[0.2em] font-bold bg-forest-confirm hover:bg-forest-confirm/90 text-white shadow-premium transition-all duration-300"
                        onClick={() => navigate('/booking')}
                      >
                        <ShoppingCart className="mr-3 h-5 w-5" />
                        View in Cart
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-14 rounded-xl text-[11px] uppercase tracking-[0.2em] font-bold bg-kiln-terracotta text-white hover:bg-kiln-terracotta-hover shadow-premium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                        onClick={() => {
                          addToCart({
                            serviceId: selectedService.id,
                            serviceName: selectedService.name,
                            price: parseFloat(selectedService.price),
                            duration: selectedService.duration_minutes
                          });
                        }}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <footer className="py-24 border-t border-kiln-border text-center bg-warm-canvas">
        <Sparkles className="w-8 h-8 text-kiln-terracotta/40 mx-auto stroke-[1.2] animate-pulse" />
      </footer>
    </div>
  );
};

export default Services;
