import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  image_url?: string;
  is_popular?: boolean;
}

interface TrendingTreatmentsProps {
  services?: Service[];
}

const TrendingTreatments = ({ services: initialServices }: TrendingTreatmentsProps) => {
  const [popularServices, setPopularServices] = useState<Service[]>(initialServices || []);
  const [isLoading, setIsLoading] = useState(!initialServices);

  useEffect(() => {
    if (initialServices) return;

    const fetchServices = async () => {
      try {
        const response = await getServices();
        if (response.data.success) {
          const services: Service[] = response.data.data;
          // Limit to top 6 popular services per T-02-01-02
          const filtered = services
            .filter(s => s.is_popular)
            .slice(0, 6);
          setPopularServices(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch trending treatments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [initialServices]);

  if (isLoading) {
    return (
      <section className="py-24 bg-background" data-testid="trending-treatments">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <div className="h-4 w-32 bg-secondary animate-pulse rounded-full" />
              <div className="h-10 w-64 bg-secondary animate-pulse rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className={i === 1 ? 'lg:col-span-8 lg:row-span-2 aspect-[16/9] md:aspect-[2/1] bg-secondary/50 rounded-3xl animate-pulse' : 'lg:col-span-4 aspect-[4/5] bg-secondary/50 rounded-3xl animate-pulse'} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (popularServices.length === 0) return null;

  return (
    <section className="py-24 bg-background" data-testid="trending-treatments">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4 md:max-w-2xl">
            <span className="flex items-center gap-2 text-primary font-medium tracking-[0.2em] text-[11px] uppercase">
              <Star className="h-3 w-3 fill-primary" /> Curated for You
            </span>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight leading-tight">
              Trending <span className="italic text-primary">Treatments</span>
            </h2>
          </div>
          <div className="md:max-w-sm pb-2">
            <p className="text-muted-foreground text-sm md:text-base font-light leading-relaxed">
              Discover our most sought-after experiences, hand-picked by our master artisans to elevate your self-care ritual.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {popularServices.map((service, index) => {
            const isFeatured = index === 0;
            return (
              <motion.div 
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
                className={`${isFeatured ? 'lg:col-span-8 lg:row-span-2' : 'lg:col-span-4'} group flex flex-col bg-white rounded-3xl overflow-hidden border border-transparent hover:border-primary/10 shadow-sm hover:shadow-premium transition-all duration-500`}
                data-testid="service-card"
              >
                <div className={`flex flex-col h-full ${isFeatured ? 'md:flex-row' : ''}`}>
                  {/* Image Container */}
                  <div className={`relative overflow-hidden ${isFeatured ? 'md:w-1/2 aspect-[4/3] md:aspect-auto' : 'aspect-[4/3] w-full'}`}>
                    <img
                      src={service.image_url || `https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=800&index=${index}`}
                      alt={service.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[#1A1614]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Price Tag */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
                      <span className="text-[11px] font-semibold text-charcoal-bark tracking-widest">₱{service.price}</span>
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className={`flex flex-col flex-grow ${isFeatured ? 'md:w-1/2 p-8 lg:p-12 justify-center' : 'p-6 lg:p-8'}`}>
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <h3 className={`font-serif text-foreground group-hover:text-primary transition-colors leading-tight ${isFeatured ? 'text-3xl lg:text-4xl' : 'text-xl'}`}>
                        {service.name}
                      </h3>
                      {!isFeatured && (
                        <span className="text-[11px] text-muted-foreground uppercase tracking-widest pt-1 shrink-0">
                          {service.duration} MIN
                        </span>
                      )}
                    </div>
                    
                    {isFeatured && (
                      <span className="text-[11px] text-primary uppercase tracking-[0.2em] font-semibold mb-6 block">
                        {service.duration} Minute Immersion
                      </span>
                    )}

                    <p className={`text-muted-foreground font-light leading-relaxed mb-8 ${isFeatured ? 'text-base lg:text-lg' : 'text-sm line-clamp-2'}`}>
                      {service.description}
                    </p>
                    
                    <div className="mt-auto">
                      <Link to="/booking">
                        <Button
                          variant={isFeatured ? "default" : "outline"}
                          className={isFeatured ? 'w-auto px-8 shadow-sm hover:shadow-premium transition-shadow' : 'w-full shadow-sm hover:shadow-premium transition-shadow'}
                        >
                          {isFeatured ? 'Book Ritual' : 'Explore'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link 
            to="/services"
            className="inline-block text-foreground text-xs font-bold tracking-[0.2em] uppercase border-b border-primary/20 pb-1 hover:border-primary transition-all duration-300"
          >
            View Full Menu
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingTreatments;
