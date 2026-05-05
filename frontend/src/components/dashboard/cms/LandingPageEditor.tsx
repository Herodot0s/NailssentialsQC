import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { getCmsSettings, saveCmsSettings } from '@/api/apiClient';
import type { SiteSettingsData } from '@/types/api';

const DEFAULTS: SiteSettingsData = {
  hero: { tagline: 'Experience Pure Tranquility', headline: 'Elevate Your Natural Beauty', subheadline: 'Discover a haven of serenity where expert craftsmanship meets premium self-care. Welcome to the NailssentialsQC sanctuary.', bg_image_url: 'https://images.unsplash.com/photo-1600334129128-685c4582f98c?auto=format&fit=crop&q=80&w=2070', button_label: 'Book Your Sanctuary' },
  signature: { label: 'Signature Experience', headline: 'The Nailssentials Ritual', body: 'Step into a world where time slows down. Our signature ritual combines aromatherapy, precision technique, and an atmosphere of absolute luxury to revitalize your spirit.', link_label: 'Discover the Menu', bg_image_url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&q=80&w=2070' },
  footer: { headline: 'Prepare for your visit.', button_label: 'JOIN THE PRIVILEGE CLUB' },
  contact: { phone: '', address: '', hours: '', email: '', maps_link: '' },
};

type SectionKey = 'hero' | 'signature' | 'footer' | 'contact';

interface SectionConfig {
  key: SectionKey;
  title: string;
  description: string;
  fields: { key: string; label: string; type?: 'textarea' }[];
}

const SECTIONS: SectionConfig[] = [
  { key: 'hero', title: 'Hero Section', description: 'The first thing visitors see — tagline, headline, and call-to-action.', fields: [{ key: 'tagline', label: 'Tagline' }, { key: 'headline', label: 'Headline' }, { key: 'subheadline', label: 'Subheadline', type: 'textarea' }, { key: 'bg_image_url', label: 'Background Image URL' }, { key: 'button_label', label: 'Primary Button Label' }] },
  { key: 'signature', title: 'Signature Experience', description: "Highlight your salon's unique offering below the hero.", fields: [{ key: 'label', label: 'Section Label' }, { key: 'headline', label: 'Headline' }, { key: 'body', label: 'Body Paragraph', type: 'textarea' }, { key: 'link_label', label: 'Link Label' }, { key: 'bg_image_url', label: 'Image URL' }] },
  { key: 'footer', title: 'Footer Call-to-Action', description: 'The closing section that drives registration.', fields: [{ key: 'headline', label: 'Headline' }, { key: 'button_label', label: 'Button Label' }] },
  { key: 'contact', title: 'Contact Information', description: 'Phone, address, and hours — hidden on landing page if all fields are empty.', fields: [{ key: 'phone', label: 'Phone Number' }, { key: 'address', label: 'Address' }, { key: 'hours', label: 'Operating Hours' }, { key: 'email', label: 'Email Address' }, { key: 'maps_link', label: 'Google Maps Link' }] },
];

export const LandingPageEditor: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettingsData>(DEFAULTS);
  const [saving, setSaving] = useState<SectionKey | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getCmsSettings()
      .then(r => { if (r.data.success && r.data.data) setSettings(s => ({ ...s, ...r.data.data })); })
      .catch(() => setLoadError(true));
  }, []);

  const handleChange = (section: SectionKey, key: string, value: string) => {
    setSettings(s => ({ ...s, [section]: { ...(s[section] as any), [key]: value } }));
  };

  const handleSave = async (section: SectionConfig) => {
    setSaving(section.key);
    const sectionData = settings[section.key] as Record<string, string> | undefined;
    const settingsArr = section.fields.map(f => ({ section: section.key, key: f.key, value: sectionData?.[f.key] ?? '' }));
    try {
      await saveCmsSettings({ settings: settingsArr });
      // Show success (toast if available, else alert fallback)
      if ((window as any).__toast) (window as any).__toast.success('Changes saved successfully.');
      else alert('Changes saved successfully.');
    } catch {
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {loadError && <p className="text-sm text-destructive">Failed to load current content. Showing defaults.</p>}
      {SECTIONS.map(section => {
        const sectionData = settings[section.key] as Record<string, string> | undefined;
        return (
          <Card key={section.key} className="rounded-none border-gray-100">
            <CardHeader>
              <CardTitle className="font-serif text-lg font-light">{section.title}</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">{section.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {section.fields.map(f => (
                <div key={f.key} className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{f.label}</Label>
                  {f.type === 'textarea' ? (
                    <Textarea rows={3} value={sectionData?.[f.key] ?? ''} onChange={e => handleChange(section.key, f.key, e.target.value)} className="resize-none text-sm rounded-none" />
                  ) : (
                    <Input value={sectionData?.[f.key] ?? ''} onChange={e => handleChange(section.key, f.key, e.target.value)} className="text-sm rounded-none" />
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end border-t border-gray-50 pt-4">
              <Button onClick={() => handleSave(section)} disabled={saving === section.key} className="rounded-none px-6 text-[10px] uppercase tracking-widest font-bold h-10">
                {saving === section.key ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
