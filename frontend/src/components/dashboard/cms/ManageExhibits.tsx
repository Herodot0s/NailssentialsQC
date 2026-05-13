import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Image as ImageIcon, ExternalLink, Sparkles } from 'lucide-react';
import { getExhibits, deleteExhibit } from '@/api/apiClient';
import type { Exhibit } from '@/types/api';
import ExhibitForm from '@/components/gallery/ExhibitForm';

const ManageExhibits: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExhibits = async () => {
    try {
      setIsLoading(true);
      const res = await getExhibits();
      setExhibits(res.data.data);
    } catch (err) {
      console.error('Failed to fetch exhibits', err);
      setError('Failed to load exhibits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExhibits();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this exhibit from the public gallery?'))
      return;

    try {
      await deleteExhibit(id);
      fetchExhibits();
    } catch (err) {
      console.error('Delete exhibit error:', err);
      alert('Failed to delete exhibit');
    }
  };

  if (isLoading && exhibits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4 bg-gray-50/30">
        <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[1.5]" />
        <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-muted-foreground">
          Loading Gallery Assets...
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase font-bold text-primary mb-2">
            Content Management
          </p>
          <h1 className="font-serif text-4xl font-light text-foreground flex items-center gap-3">
            <ImageIcon className="h-10 w-10 text-primary/40 stroke-[1]" />
            Nail Art <span className="italic">Exhibit</span>
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md text-sm font-light">
            Curate the public gallery by showcasing the salon's best work. Upload high-res images
            and assign artist credits.
          </p>
        </div>
        <Button
          onClick={() => setIsFormOpen(true)}
          className="rounded-none gap-2 px-8 h-14 text-[11px] uppercase font-bold tracking-[0.2em] shadow-xl shadow-primary/20"
        >
          <Plus className="h-5 w-5" /> Publish New Work
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs p-4 rounded-none mb-8 flex items-center gap-3 font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {exhibits.map((ex) => (
          <Card
            key={ex.id}
            className="rounded-none border-none shadow-sm group overflow-hidden bg-white"
          >
            <div className="aspect-[4/5] relative overflow-hidden">
              <img
                src={ex.image_url}
                alt={ex.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-none bg-white text-foreground hover:bg-primary hover:text-white border-none text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => window.open(ex.image_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> View
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-none text-[10px] uppercase font-bold tracking-widest"
                  onClick={() => handleDelete(ex.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Remove
                </Button>
              </div>
            </div>
            <CardHeader className="p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold tracking-widest text-primary/60">
                    {ex.artist?.full_name || 'Anonymous Artist'}
                  </p>
                  <CardTitle className="font-serif text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                    {ex.title}
                  </CardTitle>
                </div>
                {ex.service && (
                  <Badge
                    variant="outline"
                    className="rounded-none border-gray-100 text-[8px] uppercase font-bold tracking-tighter bg-gray-50/50"
                  >
                    {ex.service.name}
                  </Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}

        {exhibits.length === 0 && !isLoading && (
          <div className="col-span-full py-32 text-center bg-gray-50/50 border border-dashed border-gray-200">
            <ImageIcon className="mx-auto h-16 w-16 text-gray-200 stroke-[1] mb-4" />
            <p className="text-muted-foreground font-serif italic text-lg">
              No exhibits published yet.
            </p>
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/40 mt-2">
              Start your gallery by clicking "Publish New Work"
            </p>
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-2xl rounded-none border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-primary p-10 text-white">
            <DialogHeader className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/60">
                New Submission
              </p>
              <DialogTitle className="font-serif text-5xl font-light tracking-tight">
                Create <span className="italic">Exhibit</span>
              </DialogTitle>
              <DialogDescription className="text-white/40 font-light text-sm">
                Fill in the details below to add a new masterpiece to the salon's public portfolio.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10">
            <ExhibitForm
              onSuccess={() => {
                setIsFormOpen(false);
                fetchExhibits();
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageExhibits;
