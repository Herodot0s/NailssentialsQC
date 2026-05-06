import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import React from 'react';
import landingPageBg from '@/assets/img/landing_page_bg.svg';

interface HeroProps {
  tagline?: string;
  headline?: string;
  subheadline?: string;
  bgImageUrl?: string;
  buttonLabel?: string;
}

const Hero: React.FC<HeroProps> = ({
  tagline = 'Experience Pure Luxury',
  headline = 'Life Is Not Perfect, But Your Nails Can Be',
  subheadline = 'Discover a haven of serenity where expert craftsmanship meets premium self-care. Welcome to the NailssentialsQC sanctuary.',
  bgImageUrl,
  buttonLabel = 'Book Your Appointment'
}) => {
  const finalBgUrl = landingPageBg;
  return (
    <section className="relative h-[85vh] min-h-[600px] flex items-end overflow-hidden" data-testid="hero-section">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={finalBgUrl}
          alt="NailssentialsQC salon interior"
          className="w-full h-full object-cover"
        />
        {/* Bottom gradient for text readability (Warm charcoal instead of pure black) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614]/90 via-[#1A1614]/40 to-transparent" />
      </div>

      <div className="container relative z-10 px-6 pb-16 md:pb-24 lg:pb-32 w-full h-full flex flex-col justify-end animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-forwards" style={{ animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
          {/* Left Column: Eyebrow + Huge Headline */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="h-[1px] w-12 bg-white/40" />
              <p className="text-white/80 uppercase tracking-[0.2em] text-[11px] font-bold">{tagline}</p>
            </div>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-light text-white leading-[1.05] tracking-tight">
              {headline.split('Perfect').reduce((parts: React.ReactNode[], part, i, arr) => {
                if (i < arr.length - 1) {
                  return [...parts, part, <span key={i} className="italic text-primary-light">Perfect</span>];
                }
                return [...parts, part];
              }, [] as React.ReactNode[])}
            </h1>
          </div>

          {/* Right Column: Subheadline + CTAs */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-8 lg:pb-4">
            <p className="text-base md:text-xl text-white/80 font-light leading-relaxed max-w-xl">
              {subheadline}
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6 pt-6 lg:pt-8 border-t border-white/10">
              <Link to="/booking" className="w-full sm:w-auto">
                <Button size="lg" className="w-full bg-white text-charcoal-bark hover:bg-primary-light hover:text-charcoal-bark shadow-premium">
                  {buttonLabel}
                </Button>
              </Link>
              <Link
                to="/services"
                className="group flex items-center h-12 px-2 text-white/90 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-200 hover:text-white"
              >
                Explore
                <ChevronRight className="ml-2 h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

