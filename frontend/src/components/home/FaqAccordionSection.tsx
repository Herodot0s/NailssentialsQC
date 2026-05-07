import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { PREMIUM_EASE } from '@/lib/motion';
import type { SiteContent } from '@/types/api';

interface FaqAccordionSectionProps {
  faqs: SiteContent[];
}

export const FaqAccordionSection: React.FC<FaqAccordionSectionProps> = ({ faqs }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-warm-canvas overflow-hidden">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
          <div className="space-y-4">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] tracking-[0.3em] text-primary font-bold uppercase block"
            >
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-serif text-4xl md:text-5xl font-light text-foreground"
            >
              Common Inquiries
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/policies"
              className="group inline-flex items-center gap-3 text-xs font-bold tracking-[0.2em] uppercase text-warm-stone hover:text-primary transition-colors duration-300"
            >
              Full Policy Directory
              <div className="h-px w-8 bg-kiln-border group-hover:w-12 group-hover:bg-primary transition-all duration-500" />
            </Link>
          </motion.div>
        </div>

        <LayoutGroup>
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isExpanded = expandedId === faq.id;

              return (
                <motion.div
                  key={faq.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    layout: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.5, delay: index * 0.1 }
                  }}
                  className={`relative overflow-hidden transition-all duration-500 ${isExpanded
                    ? 'bg-white rounded-[2rem] shadow-premium ring-1 ring-primary/5'
                    : 'bg-transparent rounded-none border-b border-kiln-border/60'
                    }`}
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                    className="w-full text-left px-4 md:px-8 py-7 flex items-start gap-6 group"
                  >
                    <span className={`text-[11px] tracking-widest font-bold font-sans mt-1.5 transition-colors duration-300 ${isExpanded ? 'text-primary' : 'text-clay-dust'}`}>
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-grow">
                      <h3 className={`font-serif text-xl md:text-2xl transition-colors duration-500 ${isExpanded ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                        {faq.title}
                      </h3>

                      <AnimatePresence mode="wait">
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: PREMIUM_EASE as any }}
                          >
                            <div className="pt-6 pb-2 pr-12">
                              <p className="text-[15px] text-warm-stone leading-relaxed font-light">
                                {faq.body}
                              </p>
                              <div className="mt-8 flex gap-4">
                                <div className="h-1 w-12 rounded-full bg-primary-light" />
                                <div className="h-1 w-4 rounded-full bg-primary-ultra" />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className={`mt-1 p-2 rounded-full transition-all duration-500 ${isExpanded ? 'bg-primary text-white rotate-180' : 'bg-primary-ultra text-primary group-hover:bg-primary-light'}`}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </div>
                  </button>

                  {/* Decorative background for expanded state */}
                  {isExpanded && (
                    <motion.div
                      layoutId={`bg-${faq.id}`}
                      className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,var(--color-primary-ultra)_0%,transparent_70%)] -z-10"
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 pt-10 border-t border-kiln-border/30 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <p className="text-sm text-warm-stone font-light text-center md:text-left italic">
            "We believe clarity is the first step toward tranquility."
          </p>
          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-bisque-wash flex items-center justify-center overflow-hidden">
                </div>
              ))}
            </div>
            <div className="text-left">
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
