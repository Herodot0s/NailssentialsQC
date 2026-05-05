import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, Leaf, ShieldCheck, ChevronRight, Star } from 'lucide-react';

const Home = () => (
  <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-x-hidden" data-testid="home-page">
    {/* Hero Section */}
    <section className="relative h-[90vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600334129128-685c4582f98c?auto=format&fit=crop&q=80&w=2070" 
          alt="Luxury Spa Interior"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="container relative z-10 flex flex-col items-center gap-8 text-center px-6">
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out fill-mode-forwards">
          <p className="text-primary-light uppercase tracking-[0.4em] text-sm font-sans">Experience Pure Tranquility</p>
          <h1 className="font-serif text-5xl font-light tracking-tight text-white sm:text-7xl md:text-8xl max-w-5xl leading-[1.1]">
            Elevate Your <span className="italic">Natural</span> Beauty
          </h1>
          <p className="max-w-[700px] mx-auto text-lg text-white/80 sm:text-xl font-light leading-relaxed">
            Discover a haven of serenity where expert craftsmanship meets premium self-care. 
            Welcome to the NailssentialsQC sanctuary.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 mt-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 ease-out fill-mode-forwards">
          <Link to="/booking">
            <Button
              className="h-14 px-10 text-base font-medium tracking-widest uppercase bg-white text-black hover:bg-primary hover:text-white border-none transition-all duration-500"
            >
              Book Your Sanctuary
            </Button>
          </Link>
          <Link 
            to="/services" 
            className="group flex items-center h-14 px-6 text-white text-base font-medium tracking-widest uppercase transition-all duration-300 border-b border-white/30 hover:border-white"
          >
            Explore Services
            <ChevronRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Elegant scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 text-white/40">
        <div className="w-[1px] h-20 bg-gradient-to-b from-white/0 via-white/40 to-white/0" />
      </div>
    </section>

    {/* Philosophy Section (Features Refined) */}
    <section className="py-32 bg-white relative">
      <div className="container px-6 mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Sparkles className="w-8 h-8 text-primary stroke-[1.2]" />
              <div className="h-[1px] flex-grow bg-primary/20" />
            </div>
            <h3 className="text-xs font-sans tracking-[0.3em] text-muted-foreground uppercase">Unrivaled Quality</h3>
            <p className="font-serif text-2xl text-foreground leading-relaxed">
              We curate only the most <span className="italic">exquisite</span> products to grace your skin and nails.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <Leaf className="w-8 h-8 text-primary stroke-[1.2]" />
              <div className="h-[1px] flex-grow bg-primary/20" />
            </div>
            <h3 className="text-xs font-sans tracking-[0.3em] text-muted-foreground uppercase">Pure Hygiene</h3>
            <p className="font-serif text-2xl text-foreground leading-relaxed">
              Medical-grade sterilization ensures your health is protected within our <span className="italic">pristine</span> environment.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-8">
              <ShieldCheck className="w-8 h-8 text-primary stroke-[1.2]" />
              <div className="h-[1px] flex-grow bg-primary/20" />
            </div>
            <h3 className="text-xs font-sans tracking-[0.3em] text-muted-foreground uppercase">Artistic Mastery</h3>
            <p className="font-serif text-2xl text-foreground leading-relaxed">
              Our technicians are not just staff; they are <span className="italic">dedicated</span> artisans of beauty.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* Signature Experience Section */}
    <section className="bg-primary-ultra overflow-hidden">
      <div className="container mx-auto px-6 py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
          <div className="py-24 lg:py-32 lg:pr-24 space-y-10">
            <div className="space-y-4">
              <span className="flex items-center gap-2 text-primary font-medium tracking-widest text-xs uppercase">
                <Star className="h-3 w-3 fill-primary" /> Signature Experience
              </span>
              <h2 className="font-serif text-4xl sm:text-6xl font-light text-foreground leading-tight max-w-xl">
                The Nailssentials <br/><span className="italic">Ritual</span>
              </h2>
            </div>
            <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md">
              Step into a world where time slows down. Our signature ritual combines aromatherapy, 
              precision technique, and an atmosphere of absolute luxury to revitalize your spirit.
            </p>
            <div className="pt-6">
              <Link 
                to="/services" 
                className="inline-block text-foreground text-sm font-bold tracking-[0.2em] uppercase border-b border-primary/40 pb-2 hover:border-primary transition-all duration-300"
              >
                Discover the Menu
              </Link>
            </div>
          </div>
          <div className="relative h-[600px] lg:h-[800px] w-full">
            <img 
              src="https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=2070" 
              alt="Manicure Ritual"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>

    {/* Footer Accents */}
    <section className="py-24 text-center border-t border-primary/10">
      <div className="container mx-auto px-6 max-w-xl space-y-8">
        <h2 className="font-serif text-3xl font-light text-foreground">Prepare for your visit.</h2>
        <Link to="/register">
          <Button
            className="h-14 px-12 tracking-widest bg-black text-white hover:bg-primary border-none transition-all duration-500"
          >
            JOIN THE PRIVILEGE CLUB
          </Button>
        </Link>
      </div>
    </section>
  </div>
);

export default Home;
