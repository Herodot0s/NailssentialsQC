import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, getServices } from '../api/apiClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Clock, Sparkles, AlertCircle, Loader2, ArrowRight, CheckCircle2, ShoppingCart } from 'lucide-react';
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

const Services: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();

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
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header Section */}
      <header className="relative py-24 px-6 text-center bg-primary-ultra/30 border-b border-primary/5 overflow-hidden">
        <div className="container max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary">Curated Treatments</p>
          <h1 className="font-serif text-5xl md:text-8xl font-light tracking-tight text-foreground leading-none">
            Our <span className="italic">Services</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto font-light leading-relaxed">
            Discover our menu of premium spa experiences, each designed for your total relaxation and beauty.
          </p>
        </div>
      </header>

      <PackageDiscoverySection />

      <main className="container max-w-5xl mx-auto py-16 px-6 sm:px-12">
        {error && (
          <div className="bg-destructive/5 border border-destructive/10 text-destructive text-xs tracking-widest uppercase p-4 rounded-none flex items-center gap-3 mb-12 max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Tabs defaultValue="all" onValueChange={setActiveCategoryId} className="w-full space-y-16">
          <div className="flex justify-center border-b border-primary/5 animate-in fade-in duration-1000 delay-200">
            <TabsList className="bg-transparent p-0 h-auto flex-wrap justify-center rounded-none gap-8">
              <TabsTrigger
                value="all"
                className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 py-4 transition-all hover:text-primary"
              >
                All Services
              </TabsTrigger>
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id.toString()}
                  className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 py-4 transition-all hover:text-primary"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={activeCategoryId} className="mt-0 outline-none">
            <div className="flex flex-col gap-0">
              {filteredServices.map((svc, index) => (
                <Sheet key={svc.id}>
                  <SheetTrigger className="w-full text-left outline-none group">
                    <div 
                      className="flex flex-col md:flex-row md:items-center justify-between py-12 border-b border-primary/10 last:border-none transition-all hover:bg-primary-ultra/20 px-4 -mx-4 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                      style={{ animationDelay: `${index * 100}ms`, animationDuration: '700ms' }}
                    >
                      <div className="flex gap-8 items-start md:items-center flex-1">
                        <div className="hidden sm:flex w-16 h-16 shrink-0 rounded-full border-[0.5px] border-primary/20 items-center justify-center text-primary text-xl font-serif font-light group-hover:bg-primary group-hover:text-white group-hover:scale-110 transition-all duration-700">
                          {svc.name.charAt(0)}
                        </div>
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center gap-4">
                            <h3 className="font-serif text-2xl font-light text-foreground group-hover:text-primary transition-colors">
                              {svc.name}
                            </h3>
                            {svc.is_popular && (
                              <Badge className="bg-primary/5 text-primary border-none uppercase tracking-[0.2em] text-[8px] font-bold px-2 py-0.5 rounded-none group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xl line-clamp-2">
                            {svc.description ||
                              'Experience our premium service tailored just for you. Quality and relaxation guaranteed.'}
                          </p>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center text-muted-foreground text-[10px] tracking-widest uppercase font-bold">
                              <Clock className="mr-2 h-3 w-3 stroke-[2]" />
                              {svc.duration_minutes} Minutes
                            </div>
                            <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500">Read More —</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 md:mt-0 flex items-center justify-between md:justify-end gap-12">
                        <div className="text-2xl font-serif font-light text-foreground group-hover:scale-105 transition-transform duration-500">
                          ₱{parseFloat(svc.price).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-3 text-[10px] tracking-[0.2em] uppercase font-bold text-primary group-hover:text-foreground transition-all group/btn">
                          <span>Select</span>
                          <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-2 transition-transform duration-500" />
                        </div>
                      </div>
                    </div>
                  </SheetTrigger>
                  <SheetContent side="right" className="p-0 border-none overflow-y-auto w-full sm:max-w-xl">
                    <div className="relative h-72 w-full overflow-hidden">
                      <img 
                        src={getServiceImage(svc.category_id)} 
                        alt={svc.name}
                        className="w-full h-full object-cover animate-in fade-in zoom-in-105 duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                         <Badge className="bg-white/20 backdrop-blur-md text-white border-none uppercase tracking-[0.2em] text-[8px] font-bold">
                           {getCategoryName(svc.category_id)}
                         </Badge>
                      </div>
                    </div>

                    <div className="p-8 space-y-10">
                      <SheetHeader className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                        <div className="flex justify-between items-start gap-4">
                          <SheetTitle className="text-4xl leading-tight">{svc.name}</SheetTitle>
                          <div className="text-3xl font-serif font-light text-primary">
                            ₱{parseFloat(svc.price).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-muted-foreground text-[10px] tracking-widest uppercase font-bold">
                          <Clock className="h-3 w-3 stroke-[2] text-primary" />
                          {svc.duration_minutes} Minutes Treatment
                        </div>
                      </SheetHeader>

                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                        <h4 className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground border-b border-primary/10 pb-2">The Experience</h4>
                        <p className="text-lg font-serif font-light leading-relaxed text-foreground/80 italic">
                          "{svc.description || 'Experience our premium service tailored just for you. Quality and relaxation guaranteed.'}"
                        </p>
                        <p className="text-sm font-light leading-relaxed text-muted-foreground">
                          At NailssentialsQC, we believe that every treatment should be a ritual. 
                          This service is performed by our expert technicians using only the 
                          highest-grade botanical products in our signature tranquil environment.
                        </p>
                      </div>

                      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
                         <h4 className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground border-b border-primary/10 pb-2">What to Expect</h4>
                         <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                               <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                               <span className="text-sm font-light text-foreground/70">Personalized consultation to match your preferences.</span>
                            </li>
                            <li className="flex items-start gap-3">
                               <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                               <span className="text-sm font-light text-foreground/70">Premium medical-grade sterilization for all instruments.</span>
                            </li>
                            <li className="flex items-start gap-3">
                               <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                               <span className="text-sm font-light text-foreground/70">Signature aromatic oils and luxury finishing products.</span>
                            </li>
                         </ul>
                      </div>

                      <div className="pt-8 sticky bottom-0 bg-white pb-8 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-1000 fill-mode-both">
                        {cart.find(i => i.serviceId === svc.id) ? (
                          <Button 
                            className="w-full h-14 rounded-none text-xs uppercase tracking-[0.2em] font-bold bg-success-color hover:bg-success-color/90 text-white"
                            onClick={() => navigate('/booking')}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View in Cart
                          </Button>
                        ) : (
                          <Button 
                            className="w-full h-14 rounded-none text-xs uppercase tracking-[0.2em] font-bold shadow-2xl hover:scale-[1.02] transition-transform duration-500"
                            onClick={() => {
                              addToCart({
                                serviceId: svc.id,
                                serviceName: svc.name,
                                price: parseFloat(svc.price),
                                duration: svc.duration_minutes
                              });
                            }}
                          >
                            Add to Cart
                          </Button>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              ))}
            </div>

            {filteredServices.length === 0 && !error && (
              <div className="text-center py-32 bg-primary-ultra/10 border border-dashed border-primary/10 animate-in fade-in duration-500">
                <p className="text-[10px] tracking-[0.2em] uppercase font-bold text-muted-foreground italic">
                  No services found in this category.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Signature Accent */}
      <footer className="py-24 border-t border-primary/5 text-center">
        <Sparkles className="w-8 h-8 text-primary/20 mx-auto stroke-[1.2] animate-pulse" />
      </footer>
    </div>
  );
};

export default Services;
