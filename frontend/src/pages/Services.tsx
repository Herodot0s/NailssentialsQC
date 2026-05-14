import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCategories, getServices } from '../api/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Clock,
  Sparkles,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShoppingCart,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PackageDiscoverySection from '@/components/packages/PackageDiscoverySection';
import { useMemo } from 'react';

// Optimized Unsplash helper
const getOptimizedUrl = (url: string, width = 800) => {
  const baseUrl = url.split('?')[0];
  return `${baseUrl}?auto=format&fit=crop&q=80&w=${width}`;
};

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
  image_url?: string | null;
  experience_description?: string | null;
  what_to_expect?: string | null;
}

const categoryConfigs: Record<
  string,
  { image: string; color: string; tint: string; glow: string }
> = {
  Nails: {
    image:
      'https://images.unsplash.com/photo-1632345033839-23190224213d?auto=format&fit=crop&q=80&w=1000',
    color: '#B8794E', // Kiln Terracotta
    tint: 'rgba(184, 121, 78, 0.05)',
    glow: 'rgba(184, 121, 78, 0.12)',
  },
  'Waxing & Threading': {
    image:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1000',
    color: '#C08261', // Warm Terracotta
    tint: 'rgba(192, 130, 97, 0.05)',
    glow: 'rgba(192, 130, 97, 0.12)',
  },
  Spa: {
    image:
      'https://images.unsplash.com/photo-1544161515-4af6b1d462c2?auto=format&fit=crop&q=80&w=1000',
    color: '#2C8C66', // Forest green (semantic forest-confirm)
    tint: 'rgba(44, 140, 102, 0.05)',
    glow: 'rgba(44, 140, 102, 0.12)',
  },
  default: {
    image:
      'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&q=80&w=1000',
    color: '#B8794E',
    tint: 'rgba(184, 121, 78, 0.03)',
    glow: 'rgba(184, 121, 78, 0.08)',
  },
};

const PREMIUM_EASE = [0.32, 0.72, 0, 1] as const;
const morphTransition = {
  duration: 0.5,
  ease: PREMIUM_EASE,
} as const;

const Services: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, addToCart } = useCart();
  const { user } = useAuth();

  const isStaffOrManager = user?.role === 'staff' || user?.role === 'manager';

  // Auto-select service if ID is in URL
  useEffect(() => {
    if (!isLoading && services.length > 0) {
      const serviceId = searchParams.get('id');
      if (serviceId) {
        const svc = services.find((s) => s.id === parseInt(serviceId));
        if (svc) {
          setSelectedService(svc);
        }
      }
    }
  }, [isLoading, services, searchParams]);

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
    return categories?.find((c) => c.id === id)?.name || 'default';
  };

  const getCategoryConfig = (categoryId: number | string) => {
    const name = typeof categoryId === 'number' ? getCategoryName(categoryId) : categoryId;
    return categoryConfigs[name] || categoryConfigs['default'];
  };

  const activeCategoryConfig = useMemo(() => {
    return activeCategoryId === 'all'
      ? categoryConfigs['default']
      : getCategoryConfig(parseInt(activeCategoryId));
  }, [activeCategoryId, categories]);

  const filteredServices = useMemo(() => {
    return activeCategoryId === 'all'
      ? services || []
      : (services || []).filter((s) => s.category_id === parseInt(activeCategoryId));
  }, [activeCategoryId, services]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary stroke-[1.5]" />
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground">
          Preparing your menu...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-canvas">
      {/* Header Section */}
      <header className="relative py-12 md:py-24 px-6 text-center bg-surface-soft border-b border-hairline overflow-hidden">
        {/* Subtle Brand Color Wash */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container max-w-7xl mx-auto relative z-10 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="utility-xs text-primary">Curated Treatments</p>
          <h1 className="font-serif text-3xl sm:text-5xl md:text-8xl font-light tracking-tight text-ink leading-[1.1] md:leading-none">
            Our <span className="italic">Services</span>
          </h1>
          <p className="text-body text-sm md:text-lg max-w-xl mx-auto font-light leading-relaxed px-2 md:px-0 opacity-80">
            Discover our menu of premium spa experiences, each designed for your total relaxation
            and beauty.
          </p>
        </div>
      </header>

      <PackageDiscoverySection />

      <main
        className="relative transition-colors duration-1000 ease-in-out"
        style={{ backgroundColor: activeCategoryConfig.tint }}
      >
        <div className="container max-w-7xl mx-auto py-12 md:py-32 px-4 md:px-6">
          {error && (
            <div className="bg-destructive/5 border border-destructive/20 text-destructive text-[11px] tracking-widest uppercase p-4 rounded-xl flex items-center gap-3 mb-12 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Tabs defaultValue="all" onValueChange={setActiveCategoryId} className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 md:gap-24 items-start">
              {/* Sticky Sidebar/Top Navigation */}
              <aside className="sticky top-20 md:top-32 z-20 -mx-4 md:mx-0 bg-canvas/95 backdrop-blur-md md:backdrop-blur-none py-3 md:py-0 border-b md:border-none border-hairline/20 md:bg-transparent transition-all">
                <div className="space-y-4 md:space-y-8">
                  <div className="flex flex-col">
                    <h2 className="hidden md:block utility-xs text-primary mb-8 md:mb-12">
                      Categories
                    </h2>
                    <TabsList className="bg-transparent px-4 md:px-0 p-0 h-auto flex w-full max-w-[100vw] md:max-w-none flex-row md:flex-col items-center md:items-start justify-start rounded-none gap-3 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory touch-pan-x pb-1 md:pb-0">
                      <TabsTrigger
                        value="all"
                        style={{
                          color: activeCategoryId === 'all' ? '#B8794E' : undefined,
                          backgroundColor:
                            activeCategoryId === 'all' ? 'rgba(184, 121, 78, 0.08)' : 'transparent',
                        }}
                        className="group relative shrink-0 text-[10px] md:text-[12px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-body/60 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-full md:rounded-none px-5 md:px-6 min-h-[44px] md:min-h-0 py-3 md:py-2.5 transition-all hover:text-primary whitespace-nowrap text-left md:w-full justify-center md:justify-start border border-hairline/30 md:border-none ring-offset-canvas focus-visible:ring-2 focus-visible:ring-primary/20 snap-start"
                      >
                        <span className="relative z-10">All</span>
                        <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-primary opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300" />
                      </TabsTrigger>
                      {categories.map((cat) => {
                        const config = getCategoryConfig(cat.id);
                        return (
                          <TabsTrigger
                            key={cat.id}
                            value={cat.id.toString()}
                            style={{
                              color:
                                activeCategoryId === cat.id.toString() ? config.color : undefined,
                              backgroundColor:
                                activeCategoryId === cat.id.toString()
                                  ? config.tint
                                  : 'transparent',
                            }}
                            className="group relative shrink-0 text-[10px] md:text-[12px] uppercase tracking-[0.2em] md:tracking-[0.3em] font-bold text-body/60 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-full md:rounded-none px-5 md:px-6 min-h-[44px] md:min-h-0 py-3 md:py-2.5 transition-all hover:text-primary whitespace-nowrap text-left md:w-full justify-center md:justify-start border border-hairline/30 md:border-none ring-offset-canvas focus-visible:ring-2 focus-visible:ring-primary/20 snap-start"
                          >
                            <span className="relative z-10">{cat.name}</span>
                            <div
                              className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300"
                              style={{ backgroundColor: config.color }}
                            />
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                </div>
              </aside>

              <TabsContent value={activeCategoryId} className="mt-0 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-16">
                  {filteredServices.map((svc, index) => {
                    const config = getCategoryConfig(svc.category_id);
                    return (
                      <motion.div
                        layoutId={`service-bg-${svc.id}`}
                        key={svc.id}
                        className="flex flex-col rounded-2xl md:rounded-3xl cursor-pointer group bg-surface-card border overflow-hidden"
                        style={{
                          borderColor: 'var(--color-hairline-soft)',
                          backgroundColor: activeCategoryId === 'all' ? 'var(--color-surface-card)' : config.tint,
                        }}
                        whileHover={{
                          borderColor: config.color,
                          boxShadow: `0 20px 40px ${config.glow}`,
                          y: -8,
                          transition: { duration: 0.25, ease: PREMIUM_EASE },
                        }}
                        onClick={() => setSelectedService(svc)}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.05, ease: PREMIUM_EASE }}
                      >
                        <div
                          className="relative w-full overflow-hidden"
                          style={{ aspectRatio: '16/10', backgroundColor: config.tint }}
                        >
                          <motion.img
                            layoutId={`service-image-${svc.id}`}
                            src={svc.image_url || getOptimizedUrl(config.image, 600)}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {svc.is_popular && (
                            <div className="absolute top-3 md:top-4 left-3 md:left-4">
                              <Badge
                                className="border-none uppercase tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[9px] font-bold px-2.5 md:px-3 py-1 md:py-1.5 rounded-full shadow-sm"
                                style={{ backgroundColor: `${config.color}ee`, color: 'white' }}
                              >
                                Most Loved
                              </Badge>
                            </div>
                          )}

                          <div className="absolute bottom-4 md:bottom-6 right-4 md:right-6 overflow-hidden">
                            <motion.div
                              initial={{ y: '100%' }}
                              animate={{ y: 0 }}
                              className="bg-surface-card/95 backdrop-blur-md px-4 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl shadow-premium border border-hairline/20"
                            >
                              <p
                                className="text-xl md:text-2xl font-serif font-light"
                                style={{ color: config.color }}
                              >
                                ₱{parseFloat(svc.price).toLocaleString()}
                              </p>
                            </motion.div>
                          </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-3 md:space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2 md:space-y-3">
                            <div className="flex items-start justify-between gap-4">
                              <motion.h3
                                layoutId={`service-title-${svc.id}`}
                                className="font-serif text-xl md:text-2xl font-light text-ink transition-colors leading-tight"
                                style={{
                                  color: activeCategoryId === 'all' ? undefined : config.color,
                                }}
                              >
                                {svc.name}
                              </motion.h3>
                              <div
                                className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 shrink-0"
                                style={{ borderColor: `${config.color}33`, color: config.color }}
                              >
                                <ArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                            <p className="text-body text-xs md:text-sm font-light leading-relaxed line-clamp-2">
                              {svc.description ||
                                'Experience our premium service tailored just for you. Quality and relaxation guaranteed.'}
                            </p>
                          </div>

                          <motion.div
                            layoutId={`service-meta-${svc.id}`}
                            className="flex items-center gap-4 md:gap-6 pt-3 md:pt-4 border-t border-hairline/20"
                          >
                            <div className="flex items-center text-body text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase font-bold">
                              <Clock
                                className="mr-1.5 md:mr-2 h-3 w-3 stroke-[2]"
                                style={{ color: config.color }}
                              />
                              {svc.duration_minutes} Mins
                            </div>
                            <div
                              className="text-[9px] md:text-[10px] tracking-[0.15em] md:tracking-[0.2em] uppercase font-bold"
                              style={{ color: `${config.color}88` }}
                            >
                              {getCategoryName(svc.category_id)}
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredServices.length === 0 && !error && (
                  <div className="text-center py-48 bg-surface-card/40 rounded-[48px] border border-dashed border-hairline/50 animate-in fade-in duration-700 flex flex-col items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary/30 mb-6 stroke-[1]" />
                    <p className="text-[11px] tracking-[0.3em] uppercase font-bold text-body/60">
                      Your selection is empty
                    </p>
                    <span className="italic normal-case mt-3 block font-serif text-xl text-body">
                      Try exploring another category.
                    </span>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>

      <AnimatePresence>
        {selectedService && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: PREMIUM_EASE }}
              className="fixed inset-0 z-40 bg-canvas/80 backdrop-blur-md"
              onClick={() => setSelectedService(null)}
            />

            <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-12 pointer-events-none">
              <motion.div
                layoutId={`service-bg-${selectedService.id}`}
                className="bg-surface-card w-full max-w-3xl h-[85vh] md:h-auto md:max-h-[90vh] overflow-y-auto rounded-t-[32px] md:rounded-[32px] shadow-premium flex flex-col relative pointer-events-auto"
                transition={morphTransition}
              >
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-hairline/40 rounded-full md:hidden z-40" />

                <div className="sticky top-0 right-0 z-30 flex justify-end p-4 md:p-6 pointer-events-none pt-5 md:pt-6">
                  <button
                    onClick={() => setSelectedService(null)}
                    className="w-11 h-11 md:w-10 md:h-10 rounded-full bg-surface-card/90 backdrop-blur-md flex items-center justify-center text-ink hover:bg-surface-card hover:scale-105 active:scale-95 transition-all shadow-sm pointer-events-auto"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <motion.div
                  layoutId={`service-image-container-${selectedService.id}`}
                  className="relative h-64 md:h-96 w-full shrink-0 overflow-hidden bg-surface-soft md:rounded-t-[32px] border-b border-hairline -mt-14 md:mt-0"
                  style={{ aspectRatio: '16/9' }}
                >
                  <motion.img
                    layoutId={`service-image-${selectedService.id}`}
                    src={
                      selectedService.image_url ||
                      getOptimizedUrl(getCategoryConfig(selectedService.category_id).image, 1000)
                    }
                    className="w-full h-full object-cover"
                    transition={morphTransition}
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-ink/10 to-transparent" />
                  <div className="absolute bottom-6 left-6 md:left-8 right-6 md:right-8 flex justify-between items-end">
                    <Badge className="bg-surface-card/20 backdrop-blur-md text-surface-card border-none uppercase tracking-[0.2em] text-[10px] md:text-[11px] font-bold px-2.5 md:px-3 py-1">
                      {getCategoryName(selectedService.category_id)}
                    </Badge>
                  </div>
                </motion.div>

                <div className="p-6 md:p-12 space-y-8 md:space-y-12">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 md:gap-6">
                    <div className="space-y-3 md:space-y-4 flex-1">
                      <motion.h2
                        layoutId={`service-title-${selectedService.id}`}
                        className="text-3xl md:text-5xl leading-tight font-serif font-light text-ink"
                        style={{ color: getCategoryConfig(selectedService.category_id).color }}
                        transition={morphTransition}
                      >
                        {selectedService.name}
                      </motion.h2>
                      <motion.div
                        layoutId={`service-meta-${selectedService.id}`}
                        className="flex items-center gap-3 md:gap-4 text-body text-[10px] md:text-[11px] tracking-widest uppercase font-bold"
                        transition={morphTransition}
                      >
                        <Clock
                          className="h-3.5 w-3.5 md:h-4 md:w-4 stroke-[2]"
                          style={{ color: getCategoryConfig(selectedService.category_id).color }}
                        />
                        {selectedService.duration_minutes} Minutes Treatment
                      </motion.div>
                    </div>
                    <motion.div
                      layoutId={`service-price-${selectedService.id}`}
                      className="text-2xl md:text-4xl font-serif font-light whitespace-nowrap"
                      style={{ color: getCategoryConfig(selectedService.category_id).color }}
                      transition={morphTransition}
                    >
                      ₱{parseFloat(selectedService.price).toLocaleString()}
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: PREMIUM_EASE }}
                    className="space-y-4 md:space-y-6"
                  >
                    <h4 className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-body border-b border-hairline pb-2 md:pb-3">
                      The Experience
                    </h4>
                    {selectedService.description && (
                      <p className="text-lg md:text-xl font-serif font-light leading-relaxed text-ink/90 italic">
                        "{selectedService.description}"
                      </p>
                    )}
                    <div className="text-sm md:text-base font-light leading-relaxed text-body max-w-2xl whitespace-pre-wrap">
                      {selectedService.experience_description ||
                        'At NailssentialsQC, we believe that every treatment should be a ritual. This service is performed by our expert technicians using only the highest-grade botanical products in our signature tranquil environment.'}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: PREMIUM_EASE }}
                    className="space-y-4 md:space-y-6"
                  >
                    <h4 className="text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-bold text-body border-b border-hairline pb-2 md:pb-3">
                      What to Expect
                    </h4>
                    {selectedService.what_to_expect ? (
                      <div className="text-sm md:text-base font-light leading-relaxed text-ink/80 whitespace-pre-wrap">
                        {selectedService.what_to_expect}
                      </div>
                    ) : (
                      <ul className="space-y-4 md:space-y-5">
                        <li className="flex items-start gap-3 md:gap-4">
                          <CheckCircle2
                            className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5"
                            style={{ color: getCategoryConfig(selectedService.category_id).color }}
                          />
                          <span className="text-sm md:text-base font-light text-ink/80">
                            Personalized consultation to match your preferences and skin type.
                          </span>
                        </li>
                        <li className="flex items-start gap-3 md:gap-4">
                          <CheckCircle2
                            className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5"
                            style={{ color: getCategoryConfig(selectedService.category_id).color }}
                          />
                          <span className="text-sm md:text-base font-light text-ink/80">
                            Premium medical-grade sterilization for all instruments and tools.
                          </span>
                        </li>
                        <li className="flex items-start gap-3 md:gap-4">
                          <CheckCircle2
                            className="h-4 w-4 md:h-5 md:w-5 shrink-0 mt-0.5"
                            style={{ color: getCategoryConfig(selectedService.category_id).color }}
                          />
                          <span className="text-sm md:text-base font-light text-ink/80">
                            Signature aromatic oils and luxury finishing products applied by
                            experts.
                          </span>
                        </li>
                      </ul>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.4, delay: 0.3, ease: PREMIUM_EASE }}
                    className="pt-6 md:pt-8 mt-8 md:mt-12 border-t border-hairline sticky bottom-0 bg-surface-card/95 backdrop-blur-md pb-8 md:pb-8 -mx-6 md:-mx-12 px-6 md:px-12 z-20"
                    style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
                  >
                    {cart.find((i) => i.serviceId === selectedService.id) ? (
                      <Button
                        variant="secondary"
                        className="w-full h-12 md:h-14 rounded-xl text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold bg-forest-confirm hover:bg-forest-confirm/90 text-white shadow-premium active:scale-95 transition-all duration-300 border-none"
                        onClick={() => navigate('/booking')}
                      >
                        <ShoppingCart className="mr-2 md:mr-3 h-4 w-4 md:h-5 md:w-5" />
                        View in Cart
                      </Button>
                    ) : (
                      <Button
                        className="w-full h-12 md:h-14 rounded-xl text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-white shadow-premium hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: getCategoryConfig(selectedService.category_id).color,
                        }}
                        disabled={isStaffOrManager}
                        onClick={() => {
                          addToCart({
                            serviceId: selectedService.id,
                            serviceName: selectedService.name,
                            price: parseFloat(selectedService.price),
                            duration: selectedService.duration_minutes,
                            imageUrl: selectedService.image_url || getOptimizedUrl(getCategoryConfig(selectedService.category_id).image, 600),
                          });
                        }}
                      >
                        {isStaffOrManager ? 'Booking Disabled for Staff' : 'Add to Cart'}
                      </Button>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <footer className="py-24 border-t border-hairline text-center bg-canvas">
        <Sparkles className="w-8 h-8 text-primary/40 mx-auto stroke-[1.2] animate-pulse" />
      </footer>
    </div>
  );
};

export default Services;
