import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExhibits } from '../api/apiClient';
import type { Exhibit } from '../types/api';
import { Loader2, Sparkles, Filter, ExternalLink, Camera, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const Gallery: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getExhibits();
        const data = res.data.data;
        setExhibits(data);
        
        // Extract unique categories (services)
        const cats = ['All', ...new Set(data.map((ex: Exhibit) => ex.service?.name).filter(Boolean) as string[])];
        setCategories(cats);
      } catch (err) {
        console.error('Failed to fetch exhibits', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredExhibits = activeFilter === 'All' 
    ? exhibits 
    : exhibits.filter(ex => ex.service?.name === activeFilter);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[1]" />
        <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-muted-foreground animate-pulse">Curating Masterpieces...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-60" />
        <div className="container max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none rounded-none px-4 py-1.5 text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
                The Portfolio
              </Badge>
              <h1 className="font-serif text-6xl md:text-8xl font-light text-foreground leading-[1.1] tracking-tight">
                Nail Art <br/><span className="italic text-primary/40">Exhibit</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed max-w-xl"
            >
              A curated collection of our finest work, showcasing the intersection of technical precision and artistic vision.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-y border-gray-100">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-primary shrink-0">
               <Filter className="h-4 w-4" /> Filter by
            </div>
            <div className="flex gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-6 py-2.5 text-[10px] uppercase font-bold tracking-widest transition-all rounded-none ${
                    activeFilter === cat 
                      ? 'bg-black text-white shadow-xl shadow-black/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-20 px-6">
        <div className="container max-w-7xl mx-auto">
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode='popLayout'>
              {filteredExhibits.map((ex, index) => (
                <motion.div
                  key={ex.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group relative"
                >
                  <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    <img 
                      src={ex.image_url} 
                      alt={ex.title} 
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                       <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <Badge className="bg-primary text-white border-none rounded-none text-[8px] uppercase tracking-widest font-bold">
                             {ex.service?.name || 'Signature Art'}
                          </Badge>
                          <h3 className="font-serif text-3xl text-white font-light leading-tight">
                             {ex.title}
                          </h3>
                          <div className="flex items-center justify-between pt-4 border-t border-white/20">
                             <div className="flex items-center gap-2 text-white/60 text-[10px] uppercase font-bold tracking-tighter">
                                <Camera className="h-3 w-3" /> By {ex.artist?.full_name || 'Artisan'}
                             </div>
                             <div className="flex gap-3">
                                <button className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-white">
                                   <Heart className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => window.open(ex.image_url, '_blank')}
                                  className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-white"
                                >
                                   <ExternalLink className="h-4 w-4" />
                                </button>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredExhibits.length === 0 && (
            <div className="py-40 text-center space-y-6">
               <Sparkles className="h-16 w-16 text-primary/20 mx-auto stroke-[1]" />
               <h3 className="font-serif text-2xl font-light italic text-muted-foreground">No masterpieces found in this category.</h3>
               <Button 
                 variant="outline" 
                 onClick={() => setActiveFilter('All')}
                 className="rounded-none uppercase tracking-widest text-[10px] font-bold border-primary/20"
               >
                 View All Work
               </Button>
            </div>
          )}
        </div>
      </section>

      {/* Inspiration CTA */}
      <section className="py-32 bg-gray-50 border-t border-gray-100">
        <div className="container max-w-4xl mx-auto px-6 text-center space-y-12">
           <div className="space-y-4">
              <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary">Ready for your transformation?</p>
              <h2 className="font-serif text-4xl md:text-5xl font-light">Bring your <span className="italic">inspiration</span> to life.</h2>
           </div>
           <p className="text-muted-foreground font-light text-lg">
              Our artisans are ready to translate these designs or create something entirely unique for you.
           </p>
           <div className="pt-4 flex flex-col sm:flex-row justify-center gap-6">
              <Button className="h-14 px-12 rounded-none uppercase tracking-[0.2em] text-xs font-bold shadow-2xl shadow-primary/20">
                 Book Appointment
              </Button>
              <Button variant="outline" className="h-14 px-12 rounded-none uppercase tracking-[0.2em] text-xs font-bold">
                 View Service Menu
              </Button>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
