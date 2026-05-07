import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, Leaf, ShieldCheck, Star } from 'lucide-react';
import Hero from '@/components/home/Hero';
import TrendingTreatments from '@/components/home/TrendingTreatments';
import landingPageBg from '@/assets/img/landing_page_bg.svg';
import { ContactInfoSection } from '@/components/home/ContactInfoSection';
import { FaqAccordionSection } from '@/components/home/FaqAccordionSection';
import { getCmsSettings, getCmsContent } from '@/api/apiClient';

const Home = () => {
  const { data: settingsRes } = useQuery({
    queryKey: ['cms-settings'],
    queryFn: () => getCmsSettings().then(r => r.data.data),
    staleTime: 10 * 60 * 1000,
  });

  const { data: faqRes } = useQuery({
    queryKey: ['cms-faqs-landing'],
    queryFn: () => getCmsContent({ type: 'faq', limit: 5, activeOnly: true }).then(r => Array.isArray(r.data.data) ? r.data.data : []),
    staleTime: 10 * 60 * 1000,
  });

  const s = settingsRes;
  const faqs = faqRes ?? [];

  // Fallback defaults
  const sigLabel = s?.signature?.label ?? 'Signature Experience';
  const sigHeadline = s?.signature?.headline ?? 'The Nailssentials Ritual';
  const sigBody = s?.signature?.body ?? 'Step into a world where time slows down. Our signature ritual combines aromatherapy, precision technique, and an atmosphere of absolute luxury to revitalize your spirit.';
  const sigLinkLabel = s?.signature?.link_label ?? 'Discover the Menu';
  const sigBgUrl = s?.signature?.bg_image_url || landingPageBg;
  const footerHeadline = s?.footer?.headline ?? 'Prepare for your visit.';
  const footerButtonLabel = s?.footer?.button_label ?? 'JOIN THE PRIVILEGE CLUB';

  return (
    <main className="flex flex-col min-h-[calc(100vh-64px)] overflow-x-hidden" data-testid="home-page">
      <Hero
        tagline={s?.hero?.tagline}
        headline={s?.hero?.headline && s?.hero?.headline !== 'Elevate Your Natural Beauty' ? s?.hero?.headline : undefined}
        subheadline={s?.hero?.subheadline}
        buttonLabel={s?.hero?.button_label}
      />

      {/* Philosophy Section — varied layout, lead statement + two supporting values */}
      <section className="py-24 md:py-32 bg-background relative">
        <div className="container px-6 mx-auto max-w-5xl">
          {/* Lead Value — full width, large */}
          <div className="mb-20 md:mb-24">
            <div className="flex items-center gap-2 mb-8">
              <Sparkles className="w-3.5 h-3.5 text-primary stroke-[2]" />
              <span className="text-primary font-bold tracking-[0.2em] text-[11px] uppercase">Our Philosophy</span>
            </div>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-tight leading-tight max-w-3xl mb-6">
              We curate only the most exquisite products to grace your skin and nails.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg font-light leading-relaxed max-w-xl">
              Every detail at Nailssentials is chosen with intention, from the tools we sterilize to the artisans we train.
            </p>
          </div>

          {/* Two supporting values — asymmetric grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16">
            <div className="md:col-span-2 space-y-4">
              <Leaf className="w-6 h-6 text-primary stroke-[1.5]" />
              <h3 className="font-serif text-xl text-foreground">Medical-Grade Hygiene</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Hospital-standard sterilization protocols protect every client. Your health is never a compromise.
              </p>
            </div>
            <div className="md:col-span-3 md:border-l md:border-primary/10 md:pl-16 space-y-4">
              <ShieldCheck className="w-6 h-6 text-primary stroke-[1.5]" />
              <h3 className="font-serif text-xl text-foreground">Artisan Technicians</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
                Our technicians are dedicated artisans of beauty. Each holds specialized certifications and undergoes continuous training to deliver results that exceed expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      <TrendingTreatments />

      {/* Contact Info Section (new — hidden when empty) */}
      <ContactInfoSection
        phone={s?.contact?.phone}
        address={s?.contact?.address}
        hours={s?.contact?.hours}
        email={s?.contact?.email}
        mapsLink={s?.contact?.maps_link}
      />

      {/* FAQ Accordion Section (new — hidden when no active FAQs) */}
      <FaqAccordionSection faqs={faqs} />

      {/* Footer CTA */}
      <section className="py-24 text-center bg-primary text-primary-foreground">
        <div className="container mx-auto px-6 max-w-xl space-y-8">
          <h2 className="font-serif text-3xl md:text-4xl font-light text-primary-foreground">{footerHeadline}</h2>
          <Link to="/register">
            <Button size="lg" className="px-12 bg-white text-primary hover:bg-primary-light hover:text-primary shadow-premium">
              {footerButtonLabel}
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
