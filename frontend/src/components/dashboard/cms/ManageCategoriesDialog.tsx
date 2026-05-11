import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Tags, Loader2, X, Sparkles, AlertCircle } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '@/api/apiClient';

interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface ManageCategoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onSuccess: () => void;
}

export const ManageCategoriesDialog: React.FC<ManageCategoriesDialogProps> = ({
  open,
  onOpenChange,
  categories,
  onSuccess,
}) => {
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory || !currentCategory.name) return;

    try {
      setIsLoading(true);
      setLocalError(null);
      const payload = {
        name: currentCategory.name,
        description: currentCategory.description || '',
        is_active: currentCategory.is_active ?? true,
      };

      if (currentCategory.id) {
        await updateCategory(currentCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      setCurrentCategory(null);
      onSuccess();
    } catch (err) {
      setLocalError('Failed to save category. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    // Custom confirm could be better but sticking to native for speed unless asked
    if (!window.confirm('Are you sure? This may affect services in this category.')) return;
    try {
      setIsLoading(true);
      setLocalError(null);
      await deleteCategory(id);
      if (currentCategory?.id === id) setCurrentCategory(null);
      onSuccess();
    } catch (err) {
      setLocalError('Failed to delete category. It might be in use by active services.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-linen-mist border-none shadow-2xl gap-0">
        <div className="flex flex-col md:flex-row h-[80vh] max-h-[700px]">
          {/* Left: List Pane */}
          <div className="w-full md:w-[380px] flex flex-col border-r border-kiln-border/20 bg-white/50 backdrop-blur-sm">
            <div className="p-6 border-b border-kiln-border/10 flex items-center justify-between bg-white/80">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-bisque-wash/50 rounded-lg text-kiln-terracotta">
                  <Tags className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-xl text-charcoal-bark tracking-tight">Categories</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentCategory({ name: '', description: '', is_active: true })}
                className="h-9 w-9 rounded-full hover:bg-kiln-terracotta/10 text-kiln-terracotta"
                title="New Category"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 no-scrollbar space-y-2">
              <AnimatePresence mode="popLayout">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setCurrentCategory(cat)}
                    className={`group relative flex flex-col p-4 rounded-2xl border transition-all cursor-pointer ${
                      currentCategory?.id === cat.id
                        ? 'bg-white border-kiln-terracotta shadow-premium ring-1 ring-kiln-terracotta/20'
                        : 'bg-transparent border-transparent hover:bg-white/60 hover:border-kiln-border/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-bold text-sm tracking-tight transition-colors ${
                          currentCategory?.id === cat.id ? 'text-kiln-terracotta' : 'text-charcoal-bark'
                        }`}>
                          {cat.name}
                        </span>
                        {cat.description && (
                          <span className="text-xs text-clay-dust line-clamp-1 italic font-serif">
                            {cat.description}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {!cat.is_active && (
                          <div className="h-1.5 w-1.5 rounded-full bg-clay-dust animate-pulse" />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 text-brick-error hover:bg-brick-error/10 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(cat.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-clay-dust/60">
                  <div className="p-4 rounded-full bg-bisque-wash/20 mb-3">
                    <Tags className="h-8 w-8 opacity-20" />
                  </div>
                  <p className="text-xs font-serif italic">No categories yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Detail/Editor Pane */}
          <div className="flex-1 flex flex-col bg-linen-mist/30 overflow-hidden">
            <div className="p-6 flex items-center justify-between md:justify-end">
              <DialogTitle className="md:hidden font-serif text-xl text-kiln-terracotta">
                {currentCategory?.id ? 'Edit Category' : 'New Category'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-full hover:bg-kiln-terracotta/10"
              >
                <X className="h-5 w-5 text-warm-stone" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-0 no-scrollbar">
              <AnimatePresence mode="wait">
                {currentCategory ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-md mx-auto space-y-8"
                  >
                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl text-charcoal-bark flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-kiln-terracotta" />
                        {currentCategory.id ? 'Refine Category' : 'Craft Category'}
                      </h3>
                      <p className="text-sm text-clay-dust">Define how services are organized in your studio.</p>
                    </div>

                    {localError && (
                      <div className="p-4 rounded-xl bg-brick-error/10 border border-brick-error/20 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-brick-error shrink-0 mt-0.5" />
                        <p className="text-sm text-brick-error font-medium leading-tight">{localError}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cat_name" className="text-[10px] font-bold uppercase tracking-widest text-warm-stone ml-1">Category Name</Label>
                          <Input
                            id="cat_name"
                            value={currentCategory.name || ''}
                            onChange={(e) => setCurrentCategory({ ...currentCategory!, name: e.target.value })}
                            required
                            placeholder="e.g. Signature Spa"
                            className="h-12 bg-white border-kiln-border/30 focus-visible:ring-kiln-terracotta rounded-xl shadow-sm text-lg font-serif"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cat_desc" className="text-[10px] font-bold uppercase tracking-widest text-warm-stone ml-1">Description</Label>
                          <Textarea
                            id="cat_desc"
                            value={currentCategory.description || ''}
                            onChange={(e) => setCurrentCategory({ ...currentCategory!, description: e.target.value })}
                            placeholder="Describe the essence of this category..."
                            className="bg-white border-kiln-border/30 focus-visible:ring-kiln-terracotta rounded-xl shadow-sm min-h-[120px] resize-none leading-relaxed italic font-serif"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-kiln-border/20 shadow-sm">
                          <div className="flex flex-col">
                            <Label htmlFor="cat_active" className="text-sm font-bold text-charcoal-bark cursor-pointer">Visibility</Label>
                            <span className="text-[10px] text-clay-dust">Show in customer booking app</span>
                          </div>
                          <Checkbox
                            id="cat_active"
                            checked={currentCategory.is_active}
                            onCheckedChange={(checked) => setCurrentCategory({ ...currentCategory!, is_active: checked === true })}
                            className="h-5 w-5 data-[state=checked]:bg-kiln-terracotta data-[state=checked]:border-kiln-terracotta"
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 h-12 bg-kiln-terracotta hover:bg-kiln-terracotta/90 text-white font-bold rounded-xl shadow-premium active:scale-95 transition-all"
                        >
                          {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            currentCategory.id ? 'Update Category' : 'Create Category'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setCurrentCategory(null)}
                          className="h-12 px-6 rounded-xl text-warm-stone font-medium"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center gap-6"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-kiln-terracotta/5 blur-3xl rounded-full" />
                      <div className="relative p-8 rounded-full bg-white shadow-card border border-kiln-border/10">
                        <Tags className="h-12 w-12 text-kiln-terracotta/40" />
                      </div>
                    </div>
                    <div className="space-y-2 max-w-[240px]">
                      <h4 className="font-serif text-xl text-charcoal-bark">Studio Selection</h4>
                      <p className="text-xs text-clay-dust leading-relaxed">Select a category from the list to refine its details or craft a new organizational home for your services.</p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentCategory({ name: '', description: '', is_active: true })}
                      className="border-kiln-border/50 text-kiln-terracotta font-bold hover:bg-kiln-terracotta/5 rounded-xl px-8"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Start Crafting
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
