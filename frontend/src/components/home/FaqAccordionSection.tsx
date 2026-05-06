import React from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronRight } from 'lucide-react';
import type { SiteContent } from '@/types/api';

interface FaqAccordionSectionProps {
  faqs: SiteContent[];
}

export const FaqAccordionSection: React.FC<FaqAccordionSectionProps> = ({ faqs }) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="space-y-4 mb-12">
          <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Common Questions</span>
          <h2 className="font-serif text-3xl font-light text-foreground">Before Your Visit</h2>
        </div>
        <Accordion className="space-y-0">
          {faqs.map(faq => (
            <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border-b border-primary/10">
              <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline py-5">
                {faq.title}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.body}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <div className="mt-10 text-center">
          <Link
            to="/policies"
            className="group inline-flex items-center gap-1 text-sm font-bold tracking-[0.2em] uppercase border-b border-primary/40 pb-2 hover:border-primary transition-all duration-300"
          >
            View all FAQs
            <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
    </section>
  );
};
