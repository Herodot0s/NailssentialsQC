import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { AnimatedCard } from '@/components/motion/AnimatedCard';

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
      <section className="py-24 bg-white" data-testid="trending-treatments">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col items-center mb-16 text-center space-y-4">
            <div className="h-4 w-32 bg-gray-100 animate-pulse rounded-full" />
            <div className="h-10 w-64 bg-gray-100 animate-pulse rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] bg-gray-50 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (popularServices.length === 0) return null;

  return (
    <section className="py-24 bg-white" data-testid="trending-treatments">
      <div className="container px-6 mx-auto">
        <div className="flex flex-col items-center mb-16 text-center space-y-4">
          <span className="flex items-center gap-2 text-primary font-medium tracking-[0.2em] text-[10px] uppercase">
            <Star className="h-3 w-3 fill-primary" /> Curated for You
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground tracking-tight">
            Trending <span className="italic">Treatments</span>
          </h2>
          <p className="text-muted-foreground max-w-lg text-sm md:text-base font-light">
            Discover our most sought-after experiences, hand-picked by our master artisans.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {popularServices.map((service, index) => (
            <AnimatedCard key={service.id} delay={index * 100}>
              <div className="group relative flex flex-col h-full" data-testid="service-card">
                {/* Image Container with rounded-3xl (32px) */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl mb-4">
                  <img
                    src={service.image_url || `https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=800&index=${index}`}
                    alt={service.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Price Tag */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm">
                    <span className="text-xs font-semibold text-foreground">₱{service.price}</span>
                  </div>
                </div>

                <div className="flex flex-col flex-grow px-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest pt-1">
                      {service.duration} MIN
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-light line-clamp-2 mb-6">
                    {service.description}
                  </p>
                  
                  <div className="mt-auto">
                    <Link to="/booking">
                      <Button
                        variant="outline"
                        className="w-full h-11 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl border-foreground/10 hover:border-primary hover:text-primary transition-all duration-300"
                      >
                        Explore Treatment
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link to="/services">
            <Button
              variant="link"
              className="text-foreground text-xs font-bold tracking-[0.2em] uppercase border-b border-primary/20 pb-1 rounded-none hover:border-primary transition-all duration-300"
            >
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingTreatments;
