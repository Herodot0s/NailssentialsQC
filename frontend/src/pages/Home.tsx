import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, Leaf, ShieldCheck, Star } from 'lucide-react';
import Hero from '@/components/home/Hero';
import TrendingTreatments from '@/components/home/TrendingTreatments';
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
  const sigBgUrl = s?.signature?.bg_image_url ?? 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=2070';
  const footerHeadline = s?.footer?.headline ?? 'Prepare for your visit.';
  const footerButtonLabel = s?.footer?.button_label ?? 'JOIN THE PRIVILEGE CLUB';

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-x-hidden" data-testid="home-page">
      <Hero
        tagline={s?.hero?.tagline}
        headline={s?.hero?.headline}
        subheadline={s?.hero?.subheadline}
        bgImageUrl={s?.hero?.bg_image_url}
        buttonLabel={s?.hero?.button_label}
      />

      {/* Philosophy Section — hardcoded (icons/layout coupled) */}
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

      <TrendingTreatments />

      {/* Signature Experience Section */}
      <section className="bg-primary-ultra overflow-hidden">
        <div className="container mx-auto px-6 py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            <div className="py-24 lg:py-32 lg:pr-24 space-y-10">
              <div className="space-y-4">
                <span className="flex items-center gap-2 text-primary font-medium tracking-widest text-xs uppercase">
                  <Star className="h-3 w-3 fill-primary" /> {sigLabel}
                </span>
                <h2 className="font-serif text-4xl sm:text-6xl font-light text-foreground leading-tight max-w-xl">
                  {sigHeadline}
                </h2>
              </div>
              <p className="text-muted-foreground text-lg font-light leading-relaxed max-w-md">{sigBody}</p>
              <div className="pt-6">
                <Link to="/services" className="inline-block text-foreground text-sm font-bold tracking-[0.2em] uppercase border-b border-primary/40 pb-2 hover:border-primary transition-all duration-300">
                  {sigLinkLabel}
                </Link>
              </div>
            </div>
            <div className="relative h-[600px] lg:h-[800px] w-full">
              <img src={sigBgUrl} alt="Manicure Ritual" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

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
      <section className="py-24 text-center border-t border-primary/10">
        <div className="container mx-auto px-6 max-w-xl space-y-8">
          <h2 className="font-serif text-3xl font-light text-foreground">{footerHeadline}</h2>
          <Link to="/register">
            <Button className="h-14 px-12 tracking-widest bg-black text-white hover:bg-primary border-none transition-all duration-500">
              {footerButtonLabel}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
