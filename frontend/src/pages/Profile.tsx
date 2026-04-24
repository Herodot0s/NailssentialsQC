import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  User,
  Mail,
  Phone,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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

      // Now fetch the actual customer profile for extended fields
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
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-full text-primary">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your account information and preferences.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 mb-6 border ${
            message.type === 'success'
              ? 'bg-success-color/10 border-success-color/20 text-success-color'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      <form onSubmit={handleUpdate}>
        <div className="grid gap-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="pl-10 h-11 focus-visible:ring-primary font-medium"
                    placeholder="Juan Dela Cruz"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground">
                    Email (Locked)
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      disabled
                      value={profile.email}
                      className="pl-10 h-11 bg-muted/50 border-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-muted-foreground">
                    Phone (Locked)
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="text"
                      disabled
                      value={profile.phone}
                      className="pl-10 h-11 bg-muted/50 border-muted text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-6">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Special Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  value={profile.allergies}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setProfile({ ...profile, allergies: e.target.value })
                  }
                  rows={3}
                  className="min-h-[100px] resize-none focus-visible:ring-primary"
                  placeholder="Tell us about any allergies (e.g., Latex, specific products) to ensure your safety."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Special Notes / Preferences</Label>
                <Textarea
                  id="notes"
                  value={profile.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setProfile({ ...profile, notes: e.target.value })
                  }
                  rows={3}
                  className="min-h-[100px] resize-none focus-visible:ring-primary"
                  placeholder="Tell us your favorite technicians, coffee/tea preferences, or any other details."
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t py-6 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-11 px-8 font-bold shadow-lg shadow-primary/20"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Profile Changes
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Profile;
