import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedCard } from '@/components/motion/AnimatedCard';
import { Button } from '@/components/ui/button';
import { PREMIUM_EASE } from '@/lib/motion';

interface ContactInfoSectionProps {
  phone?: string;
  address?: string;
  hours?: string;
  email?: string;
  mapsLink?: string;
  facebookLink?: string;
  instagramLink?: string;
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({
  phone, address, hours, email, mapsLink, facebookLink, instagramLink,
}) => {
  const [copied, setCopied] = useState(false);

  // Hide section if all fields are empty
  const hasAny = [phone, address, hours, email, mapsLink, facebookLink, instagramLink].some(v => v && v.trim() !== '');
  if (!hasAny) return null;

  const studioImage = "https://scontent.fmnl3-3.fna.fbcdn.net/v/t39.30808-6/506120168_122108135750898795_5073906802378404612_n.jpg?stp=cp6_dst-jpg_tt6&_nc_cat=111&ccb=1-7&_nc_sid=2a1932&_nc_eui2=AeEbmC_TATBbFX2bVq2E23r1yXGoMs0ewzzJcagyzR7DPKvMj7SjP1K6dQN3UysQwoeLpxcjbImSge_5b36rY-Xl&_nc_ohc=9x7So1tdgpYQ7kNvwE8yOPN&_nc_oc=Adqg0eq6u8IWc4w2DDRLQ8TMRAz8TpZEz8aqsWP8UhYJWrSiHm3xaFqhSlNB-bitHTI&_nc_zt=23&_nc_ht=scontent.fmnl3-3.fna&_nc_gid=MfU_u1wve31DOP8T264iRA&_nc_ss=7b2a8&oh=00_Af5xxizNKUXB6rGa_o_o9Ag9R58uxcTP6vVUxRRxoIvcJg&oe=6A01EAD3";

  // Google Maps embed logic
  const mapEmbedSrc = mapsLink
    ? mapsLink.replace('https://goo.gl/maps/', 'https://www.google.com/maps/embed/v1/place?q=')
    : `https://www.google.com/maps?q=${encodeURIComponent(address || 'Nailssentials QC Quezon City')}&output=embed`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden border-y border-border/50">
      {/* Background with subtle color strategy */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary-light)_0%,transparent_50%),radial-gradient(circle_at_bottom_left,var(--color-primary-light)_0%,transparent_50%)] opacity-30" />
      <div className="absolute inset-0 bg-primary-ultra" />

      <div className="container relative mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">

          {/* Left Column: Visual & Brand */}
          <div className="lg:col-span-5 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: PREMIUM_EASE as any }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light/40 rounded-full border border-primary/10">
                <MapPin className="h-3 w-3 text-primary" />
                <span className="text-[11px] tracking-[0.3em] text-primary font-semibold uppercase">
                  Visit the salon
                </span>
              </div>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-[1.1]">
                Where Tranquility <br /> Meets Precision
              </h2>
              <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md">
                Located in the heart of Quezon City, our studio is a sanctuary designed for your comfort and rejuvenation.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: PREMIUM_EASE as any }}
              className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-premium group"
            >
              <img
                src={studioImage}
                alt="Nailssentials QC Studio Interior"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-bark/60 via-charcoal-bark/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-bark">Studio Open</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Interaction & Map */}
          <div className="lg:col-span-7 space-y-10 lg:pt-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedCard className="bg-white border-none shadow-card p-8 space-y-5 group/card">
                <div className="flex items-start justify-between">
                  <div className="p-3 bg-primary-light/30 rounded-2xl text-primary ring-1 ring-primary/20 group-hover/card:bg-primary group-hover/card:text-white transition-colors duration-500">
                    <MapPin className="h-6 w-6" />
                  </div>
                  {address && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-primary h-9 w-9 rounded-full hover:bg-primary-light/40 transition-all duration-300"
                      onClick={() => copyToClipboard(address)}
                      title="Copy Address"
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.div
                            key="check"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                          >
                            <Check className="h-4 w-4 text-success" />
                          </motion.div>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                          >
                            <Copy className="h-4 w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-2 group-hover/card:text-primary transition-colors duration-500">Our Address</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">
                    {address || 'Quezon City, Metro Manila'}
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-white border-none shadow-card p-8 space-y-5 group/card" delay={100}>
                <div className="p-3 bg-primary-light/30 rounded-2xl text-primary w-fit ring-1 ring-primary/20 group-hover/card:bg-primary group-hover/card:text-white transition-colors duration-500">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-foreground mb-2 group-hover/card:text-primary transition-colors duration-500">Operating Hours</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed whitespace-pre-line">
                    {hours || '10:00 AM - 9:00 PM'}
                  </p>
                </div>
              </AnimatedCard>

              <AnimatedCard className="bg-white border-none shadow-card p-8 space-y-6 md:col-span-2" delay={200}>
                <div className="flex flex-wrap gap-x-12 gap-y-6">
                  <div className="space-y-3">
                    <span className="text-[11px] tracking-[0.25em] text-primary/70 uppercase font-bold block">Connect via Phone</span>
                    <div className="flex items-center gap-4 group/link">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-light/40 text-primary ring-1 ring-primary/10 group-hover/link:bg-primary group-hover/link:text-white transition-all duration-300">
                        <Phone className="h-4 w-4" />
                      </div>
                      <a href={`tel:${phone}`} className="text-lg font-medium text-foreground hover:text-primary transition-colors duration-300">
                        {phone || '+63 (000) 000-0000'}
                      </a>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[11px] tracking-[0.25em] text-primary/70 uppercase font-bold block">Inquiries via Email</span>
                    <div className="flex items-center gap-4 group/link">
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-light/40 text-primary ring-1 ring-primary/10 group-hover/link:bg-primary group-hover/link:text-white transition-all duration-300">
                        <Mail className="h-4 w-4" />
                      </div>
                      <a href={`mailto:${email}`} className="text-lg font-medium text-foreground hover:text-primary transition-colors duration-300">
                        {email || 'hello@nailssentials.com'}
                      </a>
                    </div>
                  </div>
                  {(facebookLink || instagramLink) && (
                    <div className="space-y-3">
                      <span className="text-[11px] tracking-[0.25em] text-primary/70 uppercase font-bold block">Follow Us</span>
                      <div className="flex items-center gap-4 group/link">
                        {facebookLink && (
                          <a
                            href={facebookLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-light/40 text-primary ring-1 ring-primary/10 group-hover/link:bg-primary group-hover/link:text-white transition-all duration-300"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                          </a>
                        )}
                        {instagramLink && (
                          <a
                            href={instagramLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-light/40 text-primary ring-1 ring-primary/10 group-hover/link:bg-primary group-hover/link:text-white transition-all duration-300"
                          >
                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            </div>

            {/* Map Embed Container with Color glow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: PREMIUM_EASE as any }}
              className="relative w-full aspect-video md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-premium border border-primary/20 bg-primary-light/10 p-1"
            >
              <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
              <iframe
                title="Nailssentials QC Studio Location"
                src={mapEmbedSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-[2.2rem] grayscale-[0.2] contrast-[1.05] hover:grayscale-0 transition-all duration-1000"
              />
              {mapsLink && (
                <div className="absolute bottom-6 right-6">
                  <motion.a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 bg-charcoal-bark text-white px-6 py-4 rounded-2xl text-[11px] font-bold tracking-[0.15em] uppercase shadow-premium hover:bg-primary transition-all duration-500 group"
                  >
                    Open in Maps
                    <ExternalLink className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </motion.a>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
