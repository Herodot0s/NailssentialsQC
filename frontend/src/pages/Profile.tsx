import React, { useState, useEffect } from 'react';
import { motion, type Variants } from 'framer-motion';
import apiClient from '../api/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User2,
  Mail,
  Phone,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';

const PREMIUM_EASE = [0.32, 0.72, 0, 1] as const;

const Profile: React.FC = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    allergies: '',
    notes: '',
    preferences: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/auth/me');
      const userData = res.data.data.user;

      const profRes = await apiClient.get('/customers/profile');
      if (profRes.data.success) {
        const cp = profRes.data.data;
        setProfile({
          fullName: cp.full_name,
          email: userData.email || '',
          phone: userData.phone || '',
          allergies: cp.allergies || '',
          notes: cp.notes || '',
          preferences: cp.preferences || {},
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage(null);

      const res = await apiClient.put('/customers/profile', {
        fullName: profile.fullName,
        allergies: profile.allergies,
        notes: profile.notes,
        preferences: profile.preferences,
      });

      if (res.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 bg-warm-canvas">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-serif text-warm-stone italic">Refining your retreat...</p>
      </div>
    );
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: PREMIUM_EASE },
    },
  };

  // Artisanal Input Classes
  const artisanalInput = "border-0 border-b-2 border-kiln-border rounded-none bg-transparent px-0 h-11 focus-visible:ring-0 focus-visible:border-primary transition-colors font-medium placeholder:text-clay-dust";
  const artisanalTextarea = "border-0 border-b-2 border-kiln-border rounded-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-primary transition-colors font-medium placeholder:text-clay-dust resize-none";

  return (
    <div className="min-h-screen bg-warm-canvas selection:bg-bisque-wash">
      <motion.div 
        className="max-w-7xl mx-auto py-16 px-6 lg:px-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* ASYMMETRIC LEAD: Editorial Column */}
          <motion.div className="lg:col-span-5 space-y-10" variants={itemVariants}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Member Profile</span>
              </div>
              <h1 className="font-serif text-5xl lg:text-6xl font-light leading-[1.1] text-charcoal-bark">
                Your <br />
                <span className="italic text-primary/80">Signature</span> <br />
                Retreat
              </h1>
              <p className="text-warm-stone text-lg max-w-md leading-relaxed">
                Refine your personal preferences and requirements to ensure every visit to Nailssentials is perfectly tailored to you.
              </p>
            </div>

            <div className="pt-10 border-t border-kiln-border space-y-6">
              <div className="flex items-center gap-4 text-charcoal-bark">
                <div className="p-3 rounded-full bg-bisque-wash text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-clay-dust">Member Since</p>
                  <p className="font-medium font-serif italic text-lg">May 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-charcoal-bark">
                <div className="p-3 rounded-full bg-bisque-wash text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-clay-dust">Account Status</p>
                  <p className="font-medium font-serif italic text-lg">Verified Artisan</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FUNCTIONAL COLUMN: The Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleUpdate} className="space-y-12">
              
              {message && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-5 rounded-[20px] flex items-center gap-4 border ${
                    message.type === 'success'
                      ? 'bg-forest-confirm/5 border-forest-confirm/20 text-forest-confirm'
                      : 'bg-brick-error/5 border-brick-error/20 text-brick-error'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <AlertCircle className="h-6 w-6" />
                  )}
                  <span className="font-serif italic text-lg">{message.text}</span>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-none bg-white rounded-[32px] overflow-hidden group transition-all duration-500 hover:shadow-premium">
                  <CardContent className="p-10 space-y-10">
                    <div className="flex items-center gap-3 pb-4 border-b border-kiln-border/50">
                      <User2 className="h-5 w-5 text-primary" />
                      <h2 className="font-serif text-2xl text-charcoal-bark">Basic Identity</h2>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="text-[11px] font-bold uppercase tracking-widest text-clay-dust">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          required
                          value={profile.fullName}
                          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                          className={artisanalInput}
                          placeholder="Juan Dela Cruz"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        <div className="space-y-2 opacity-60">
                          <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-clay-dust">Email Address</Label>
                          <div className="flex items-center gap-2 border-b-2 border-kiln-border h-11">
                            <Mail className="h-4 w-4 text-clay-dust" />
                            <span className="font-medium text-charcoal-bark">{profile.email || '—'}</span>
                          </div>
                        </div>
                        <div className="space-y-2 opacity-60">
                          <Label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-clay-dust">Phone Number</Label>
                          <div className="flex items-center gap-2 border-b-2 border-kiln-border h-11">
                            <Phone className="h-4 w-4 text-clay-dust" />
                            <span className="font-medium text-charcoal-bark">{profile.phone || '—'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="border-none shadow-none bg-white rounded-[32px] overflow-hidden group transition-all duration-500 hover:shadow-premium">
                  <CardContent className="p-10 space-y-10">
                    <div className="flex items-center gap-3 pb-4 border-b border-kiln-border/50">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                      <h2 className="font-serif text-2xl text-charcoal-bark">Special Requirements</h2>
                    </div>

                    <div className="space-y-10">
                      <div className="space-y-2">
                        <Label htmlFor="allergies" className="text-[11px] font-bold uppercase tracking-widest text-clay-dust">Known Allergies</Label>
                        <Textarea
                          id="allergies"
                          value={profile.allergies}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setProfile({ ...profile, allergies: e.target.value })
                          }
                          rows={2}
                          className={artisanalTextarea}
                          placeholder="e.g., Latex, certain essential oils..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-[11px] font-bold uppercase tracking-widest text-clay-dust">Signature Preferences</Label>
                        <Textarea
                          id="notes"
                          value={profile.notes}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setProfile({ ...profile, notes: e.target.value })
                          }
                          rows={2}
                          className={artisanalTextarea}
                          placeholder="Coffee preferences, favorite technicians, or ambient requests..."
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants} className="flex justify-end pt-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-14 px-12 rounded-xl bg-primary text-white font-bold uppercase tracking-[0.2em] text-xs shadow-premium transition-all duration-300"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Refining...
                      </>
                    ) : (
                      <>
                        <Save className="mr-3 h-5 w-5" />
                        Commit Changes
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
