import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '@/api/apiClient';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  image_url?: string;
  is_popular?: boolean;
}

const PREMIUM_EASE = [0.32, 0.72, 0, 1] as const;

const TrendingTreatments = ({ services: initialServices }: { services?: Service[] }) => {
  const [popularServices, setPopularServices] = useState<Service[]>(initialServices || []);
  const [isLoading, setIsLoading] = useState(!initialServices);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialServices) return;

    const fetchServices = async () => {
      try {
        const response = await getServices();
        if (response.data.success) {
          const services: Service[] = response.data.data;
          const filtered = services.filter((s) => s.is_popular).slice(0, 4); // Limit to 4 per user request
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
      <section className="py-32 bg-warm-canvas">
        <div className="container px-6 mx-auto">
          <div className="h-8 w-48 bg-kiln-border/20 animate-pulse rounded-full mb-12" />
          <div className="flex gap-4 h-[600px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 bg-kiln-border/10 rounded-3xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (popularServices.length === 0) return null;

  return (
    <section className="py-32 bg-warm-canvas overflow-hidden" data-testid="trending-treatments">
      <div className="container px-6 mx-auto mb-20">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-8">
          <div className="space-y-4">
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-kiln-terracotta font-semibold tracking-[0.3em] text-[10px] uppercase"
            >
              <Star className="h-3 w-3 fill-kiln-terracotta" /> The Signature Selection
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-serif text-5xl md:text-7xl lg:text-8xl font-light text-charcoal-bark tracking-tight"
            >
              Trending <span className="italic text-kiln-terracotta font-light"></span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-md"
          >
            <p className="text-warm-stone text-lg font-light leading-relaxed">
              An immersive preview of our most coveted experiences, designed to transition you from
              the everyday into the extraordinary.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Cinematic Ribbon Container */}
      <div className="relative h-[600px] md:h-[700px] w-full px-4 md:px-0">
        <div
          ref={scrollContainerRef}
          className="flex flex-col md:flex-row h-full w-full gap-4 md:gap-2 overflow-x-auto md:overflow-visible no-scrollbar pb-8"
        >
          {popularServices.map((service, index) => (
            <motion.div
              key={service.id}
              layout
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                layout: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { delay: index * 0.1 },
              }}
              className={`relative cursor-pointer group rounded-[2.5rem] overflow-hidden flex-shrink-0 md:flex-shrink
                ${hoveredIndex === index ? 'md:flex-[3]' : 'md:flex-1'} 
                w-full md:w-auto h-[400px] md:h-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]`}
            >
              {/* Background Image with Parallax-ish Effect */}
              <motion.div
                className="absolute inset-0 z-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.8, ease: PREMIUM_EASE }}
              >
                <img
                  src={
                    service.image_url ||
                    `https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=1200&index=${index}`
                  }
                  alt={service.name}
                  className="object-cover w-full h-full grayscale-[20%] group-hover:grayscale-0 transition-all duration-700"
                />
                {/* Refined Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-bark/80 via-charcoal-bark/20 to-transparent" />
                <div
                  className={`absolute inset-0 bg-kiln-terracotta/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                />
              </motion.div>

              {/* Content Overlay */}
              <div className="absolute inset-0 z-10 p-8 md:p-12 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <motion.div
                    layout="position"
                    className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full"
                  >
                    <span className="text-[11px] font-bold text-white tracking-widest uppercase">
                      ₱{service.price}
                    </span>
                  </motion.div>
                  <motion.span
                    layout="position"
                    className="text-[10px] text-white/60 tracking-[0.2em] uppercase pt-3"
                  >
                    {service.duration} MIN
                  </motion.span>
                </div>

                <div className="space-y-4">
                  <motion.h3
                    layout="position"
                    className={`font-serif text-white leading-tight transition-all duration-500
                      ${hoveredIndex === index ? 'text-4xl md:text-5xl lg:text-6xl' : 'text-2xl md:text-3xl'}`}
                  >
                    {service.name}
                  </motion.h3>

                  <AnimatePresence>
                    {(hoveredIndex === index || window.innerWidth < 768) && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.4, ease: PREMIUM_EASE }}
                        className="space-y-8"
                      >
                        <p className="text-white/80 font-light text-lg max-w-md leading-relaxed line-clamp-3 md:line-clamp-none">
                          {service.description}
                        </p>
                        <Link to={`/services?id=${service.id}`}>
                          <Button className="bg-white text-charcoal-bark hover:bg-bisque-wash rounded-full px-8 py-6 h-auto text-xs font-bold tracking-widest uppercase group/btn">
                            Details
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Minimal "Closed" indicator for desktop */}
              {hoveredIndex !== index && (
                <div className="hidden md:flex absolute inset-0 z-20 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center">
                    <ArrowRight className="text-white h-5 w-5 rotate-[-45deg]" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="container px-6 mx-auto mt-20 flex justify-center md:justify-end">
        <Link
          to="/services"
          className="group flex items-center gap-4 text-charcoal-bark text-xs font-bold tracking-[0.3em] uppercase"
        >
          Explore All Treatments
          <div className="h-[1px] w-12 bg-kiln-border group-hover:w-24 group-hover:bg-kiln-terracotta transition-all duration-500" />
        </Link>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </section>
  );
};

export default TrendingTreatments;
