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
import { Loader2, Plus, Trash2, Image as ImageIcon, ExternalLink, Sparkles, Pencil } from 'lucide-react';
import { getExhibits, deleteExhibit } from '@/api/apiClient';
import type { Exhibit } from '@/types/api';
import ExhibitForm from '@/components/gallery/ExhibitForm';

const ManageExhibits: React.FC = () => {
  const [exhibits, setExhibits] = useState<Exhibit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExhibit, setSelectedExhibit] = useState<Exhibit | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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

  const handleEdit = (ex: Exhibit) => {
    setSelectedExhibit(ex);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteExhibit(id);
      fetchExhibits();
    } catch (err) {
      console.error('Delete exhibit error:', err);
      setError('Failed to remove exhibit. Please try again.');
    } finally {
      setDeletingId(null);
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
          onClick={() => {
            setSelectedExhibit(null);
            setIsFormOpen(true);
          }}
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
            className="rounded-none border-none shadow-sm group overflow-hidden bg-white hover:shadow-2xl transition-all duration-500"
          >
            <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
              <img
                src={ex.image_url}
                alt={ex.title}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              
              {/* Overlay with glass effect */}
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6">
                <div className="flex flex-col gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-none bg-white/90 text-foreground hover:bg-primary hover:text-white border-none text-[10px] uppercase font-bold tracking-[0.2em] h-11"
                    onClick={() => window.open(ex.image_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" /> Full View
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="rounded-none bg-white/90 text-foreground hover:bg-primary hover:text-white border-none text-[10px] uppercase font-bold tracking-[0.2em] h-11"
                      onClick={() => handleEdit(ex)}
                    >
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === ex.id}
                      className="rounded-none text-[10px] uppercase font-bold tracking-[0.2em] h-11 bg-red-600/90"
                      onClick={() => {
                        if (window.confirm('Delete this exhibit?')) handleDelete(ex.id);
                      }}
                    >
                      {deletingId === ex.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <CardHeader className="p-6 space-y-3 relative bg-white">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-primary leading-none">
                    {ex.artist?.full_name || 'Artisan'}
                  </p>
                  <CardTitle className="font-serif text-xl font-bold leading-tight group-hover:text-primary transition-colors truncate">
                    {ex.title}
                  </CardTitle>
                </div>
                {ex.service && (
                  <Badge
                    variant="outline"
                    className="rounded-none border-gray-100 text-[8px] uppercase font-bold tracking-widest bg-gray-50/50 px-2 py-0.5 whitespace-nowrap shrink-0"
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
        <DialogContent className="sm:max-w-2xl rounded-none border-none shadow-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <div className="bg-primary p-10 text-white shrink-0">
            <DialogHeader className="space-y-4">
              <p className="text-[10px] uppercase font-bold tracking-[0.4em] text-white/60">
                {selectedExhibit ? 'Update Piece' : 'New Submission'}
              </p>
              <DialogTitle className="font-serif text-5xl font-light tracking-tight">
                {selectedExhibit ? 'Edit' : 'Create'} <span className="italic">Exhibit</span>
              </DialogTitle>
              <DialogDescription className="text-white/40 font-light text-sm">
                {selectedExhibit
                  ? 'Update the details of this gallery masterpiece.'
                  : "Fill in the details below to add a new masterpiece to the salon's public portfolio."}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 overflow-y-auto custom-scrollbar">
            <ExhibitForm
              initialData={selectedExhibit || undefined}
              onSuccess={() => {
                setIsFormOpen(false);
                setSelectedExhibit(null);
                fetchExhibits();
              }}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedExhibit(null);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageExhibits;
