import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative h-[80vh] flex flex-col items-center justify-center overflow-hidden" data-testid="hero-section">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600334129128-685c4582f98c?auto=format&fit=crop&q=80&w=2070" 
          alt="Luxury Spa Interior"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="container relative z-10 flex flex-col items-center gap-6 text-center px-6">
        {/* Modest Premium Typography Container */}
        <div className="bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-3xl max-w-2xl shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
          <p className="text-primary uppercase tracking-[0.3em] text-[10px] font-semibold mb-4">Experience Pure Tranquility</p>
          <h1 className="font-serif text-[22px] md:text-[28px] font-medium tracking-tight text-foreground leading-tight mb-6">
            Elevate Your <span className="italic">Natural</span> Beauty
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-light leading-relaxed mb-8">
            Discover a haven of serenity where expert craftsmanship meets premium self-care. 
            Welcome to the NailssentialsQC sanctuary.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/booking">
              <Button
                className="h-12 px-8 text-xs font-medium tracking-widest uppercase bg-[#FF385C] text-white hover:bg-[#E00B41] rounded-xl border-none transition-all duration-300"
              >
                Book Your Sanctuary
              </Button>
            </Link>
            <Link 
              to="/services" 
              className="group flex items-center h-12 px-6 text-foreground text-xs font-medium tracking-widest uppercase transition-all duration-300 hover:text-primary"
            >
              Explore Services
              <ChevronRight className="ml-1 h-3 w-3 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
