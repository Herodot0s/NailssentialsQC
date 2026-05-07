import React from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/motion/AnimatedCard';
import { Button } from '@/components/ui/button';
import { PREMIUM_EASE } from '@/lib/motion';

interface ContactInfoSectionProps {
  phone?: string;
  address?: string;
  hours?: string;
  email?: string;
  mapsLink?: string;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  phone, address, hours, email, mapsLink,
}) => {
  // Hide section if all fields are empty
  const hasAny = [phone, address, hours, email, mapsLink].some(v => v && v.trim() !== '');
  if (!hasAny) return null;

  const userImage = "https://scontent.fmnl3-3.fna.fbcdn.net/v/t39.30808-6/506120168_122108135750898795_5073906802378404612_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeEbmC_TATBbFX2bVq2E23r1yXGoMs0ewzzJcagyzR7DPKvMj7SjP1K6dQN3UysQwoeLpxcjbImSge_5b36rY-Xl&_nc_ohc=9x7So1tdgpYQ7kNvwE8yOPN&_nc_oc=Adqg0eq6u8IWc4w2DDRLQ8TMRAz8TpZEz8aqsWP8UhYJWrSiHm3xaFqhSlNB-bitHTI&_nc_zt=23&_nc_ht=scontent.fmnl3-3.fna&_nc_gid=MfU_u1wve31DOP8T264iRA&_nc_ss=7b2a8&oh=00_Af5xxizNKUXB6rGa_o_o9Ag9R58uxcTP6vVUxRRxoIvcJg&oe=6A01EAD3";

  // If no mapsLink is provided, we can use a default search for Nailssentials QC
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=REPLACE_WITH_YOUR_API_KEY&q=Nailssentials+QC+Quezon+City`;
  // For demonstration without an API key, we use a standard embed link pattern if possible, 
  // but usually standard iframes use the /place/address pattern.
  const mapEmbedSrc = mapsLink ? mapsLink.replace('https://goo.gl/maps/', 'https://www.google.com/maps/embed/v1/place?q=') : `https://www.google.com/maps?q=${encodeURIComponent(address || 'Nailssentials QC Quezon City')}&output=embed`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here if available
  };

  return (
    <section className="bg-primary-ultra py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Visual & Brand — 5 columns */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: PREMIUM_EASE }}
              className="space-y-6"
            >
              <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-primary font-bold uppercase">
                <MapPin className="h-3.5 w-3.5" /> Visit the Studio
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1]">
                Where Tranquility <br /> Meets Precision
              </h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md">
                Located in the heart of Quezon City, our studio is a sanctuary designed for your comfort and rejuvenation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: PREMIUM_EASE }}
              className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-premium group"
            >
              <img 
                src={userImage} 
                alt="Nailssentials QC Studio" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-bark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </motion.div>
          </div>

          {/* Right Column: Interaction & Map — 7 columns */}
          <div className="lg:col-span-7 space-y-10 lg:pt-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedCard className="bg-white border-none shadow-card p-8 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary-ultra rounded-xl text-primary">
                    <MapPin className="h-6 w-6" />
                  </div>
                  {address && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-primary h-8 w-8"
                      onClick={() => copyToClipboard(address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-2">Our Address</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {address || 'Quezon City, Metro Manila'}
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-white border-none shadow-card p-8 space-y-4" delay={100}>
                <div className="p-3 bg-primary-ultra rounded-xl text-primary w-fit">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-2">Opening Hours</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hours || 'Daily: 10:00 AM - 8:00 PM'}
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-white border-none shadow-card p-8 space-y-4 md:col-span-2" delay={200}>
                <div className="flex flex-wrap gap-8">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-semibold">Connect via Phone</span>
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <a href={`tel:${phone}`} className="text-lg text-foreground hover:text-primary transition-colors">
                        {phone || '+63 (000) 000-0000'}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-semibold">Inquiries via Email</span>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <a href={`mailto:${email}`} className="text-lg text-foreground hover:text-primary transition-colors">
                        {email || 'hello@nailssentials.com'}
                      </a>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>

            {/* Map Embed Container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: PREMIUM_EASE }}
              className="relative w-full aspect-video md:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-premium border border-primary/10"
            >
              <iframe
                title="Google Maps Location"
                src={mapEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[0.2] contrast-[1.1]"
              />
              {mapsLink && (
                <div className="absolute bottom-6 right-6">
                  <a 
                    href={mapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 bg-white text-charcoal-bark px-6 py-3 rounded-xl text-xs font-bold tracking-[0.1em] uppercase shadow-premium hover:bg-primary hover:text-white transition-all duration-300"
                  >
                    Open in Maps <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
