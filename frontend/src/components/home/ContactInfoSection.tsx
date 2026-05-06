import React from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

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

  return (
    <section className="bg-background py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="space-y-6 mb-10">
          <span className="flex items-center gap-2 text-xs tracking-[0.3em] text-muted-foreground uppercase">
            <MapPin className="h-4 w-4 text-primary stroke-[1.5]" /> Visit Us
          </span>
          <h2 className="font-serif text-3xl font-light text-foreground">Find Us Here</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary stroke-[1.5] shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{address}</p>
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary stroke-[1.5] shrink-0" />
                <a href={`tel:${phone}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{phone}</a>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary stroke-[1.5] shrink-0" />
                <a href={`mailto:${email}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{email}</a>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {hours && (
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary stroke-[1.5] shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{hours}</p>
              </div>
            )}
            {mapsLink && mapsLink.startsWith('https://') && (
              <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.2em] uppercase border-b border-primary/40 pb-1 hover:border-primary transition-all duration-300 text-foreground">
                <ExternalLink className="h-4 w-4" /> View on Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
