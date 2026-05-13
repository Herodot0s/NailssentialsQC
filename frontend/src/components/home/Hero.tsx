import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import landingPageBg from '@/assets/img/landing_page_bg.svg';

interface HeroProps {
  tagline?: string;
  headline?: string;
  subheadline?: string;
  buttonLabel?: string;
}

const Hero: React.FC<HeroProps> = ({
  tagline = 'Experience Pure Luxury',
  headline = 'Life Is Not Perfect, But Your Nails Can Be',
  subheadline = 'Discover a haven of serenity where expert craftsmanship meets premium self-care. Welcome to the NailssentialsQC sanctuary.',
  buttonLabel = 'Artisan Exhibit',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-driven parallax effects
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const textOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headlineWords = headline.split(' ');
  const perfectIndex = headlineWords.findIndex((w) => w.toLowerCase() === 'perfect');

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[700px] flex items-end overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background Layer with Breathing and Parallax */}
      <motion.div
        style={{ y: backgroundY, scale: backgroundScale }}
        className="absolute inset-0 z-0"
      >
        <motion.img
          src={landingPageBg}
          alt="NailssentialsQC salon interior"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{
            scale: [1.1, 1.12, 1.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        {/* Deep, warm editorial gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1614] via-[#1A1614]/40 to-transparent" />
        <div className="absolute inset-0 bg-[#1A1614]/10 mix-blend-multiply" />
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="container relative z-10 px-6 pb-20 md:pb-32 lg:pb-40 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-end">
          {/* Left Column: Eyebrow + Huge Headline */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 0.2 }}
              className="flex items-center gap-4 mb-8"
            >
              <div className="h-[1px] w-12 bg-primary-light/40" />
              <p className="text-primary-light/90 uppercase tracking-[0.3em] text-[11px] font-semibold">
                {tagline}
              </p>
            </motion.div>

            <h1 className="font-serif text-5xl md:text-7xl lg:text-[6.5rem] font-light text-white leading-[0.95] tracking-tight">
              {headlineWords.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 1,
                    ease: [0.32, 0.72, 0, 1],
                    delay: 0.4 + i * 0.05,
                  }}
                  className={`inline-block mr-[0.2em] ${i === perfectIndex ? 'italic text-primary-light font-normal' : ''}`}
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </div>

          {/* Right Column: Subheadline + CTAs */}
          <div className="lg:col-span-4 lg:col-start-9 space-y-10 lg:pb-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 1.2 }}
              className="text-lg md:text-xl text-white/70 font-light leading-relaxed max-w-xl"
            >
              {subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1], delay: 1.4 }}
              className="flex flex-col sm:flex-row items-center lg:items-start gap-8 pt-8 border-t border-white/10"
            >
              <Link to="/gallery" className="w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    className="w-full bg-white text-charcoal-bark hover:bg-primary-light hover:text-charcoal-bark shadow-premium h-14 px-8 rounded-xl text-xs uppercase tracking-widest font-bold"
                  >
                    {buttonLabel}
                  </Button>
                </motion.div>
              </Link>

              <Link
                to="/services"
                className="group flex items-center h-14 px-4 text-white/90 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors duration-200 hover:text-white"
              >
                <span className="relative">
                  Services
                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary-light transition-all duration-300 group-hover:w-full" />
                </span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <ChevronRight className="ml-3 h-4 w-4 text-primary-light" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Decorative Artisan Detail: Subtle corner mask or grain */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
    </section>
  );
};

export default Hero;
