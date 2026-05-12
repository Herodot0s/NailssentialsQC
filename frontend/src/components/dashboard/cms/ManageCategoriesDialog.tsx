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
import { Plus, Trash2, Tags, Loader2, X, AlertCircle } from 'lucide-react';
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
      <DialogContent className="max-w-[900px] p-0 overflow-hidden bg-canvas border-none shadow-none gap-0">
        <div className="flex flex-col md:flex-row h-[600px] md:h-[640px] border border-hairline rounded-md overflow-hidden bg-surface-card m-0">
          {/* Left: List Pane (Sidebar style) */}
          <div className="w-full md:w-[170px] flex flex-col border-r border-hairline bg-canvas/30">
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Tags className="h-4 w-4 text-primary" />
                </div>
                <h2 className="heading-sm-mixed text-ink">Categories</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentCategory({ name: '', is_active: true })}
                className="h-8 w-8 rounded-md hover:bg-surface-soft text-body transition-colors"
                title="New Category"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar space-y-1">
              <AnimatePresence mode="popLayout">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setCurrentCategory(cat)}
                    className={`group relative flex items-center justify-between p-3 px-3.5 rounded-md border transition-all cursor-pointer ${currentCategory?.id === cat.id
                      ? 'bg-surface-card border-hairline shadow-[0_2px_4px_rgba(0,0,0,0.02)]'
                      : 'bg-transparent border-transparent hover:bg-surface-soft/40'
                      }`}
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span className={`body-sm truncate ${currentCategory?.id === cat.id ? 'font-semibold text-ink' : 'text-body'}`}>
                        {cat.name}
                      </span>
                      {!cat.is_active && (
                        <span className="utility-xs text-mute opacity-70">Hidden</span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 text-accent-red hover:bg-accent-red-soft transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(cat.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {categories.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-surface-soft/30 p-3 rounded-full mb-3">
                    <Tags className="h-5 w-5 text-stone" />
                  </div>
                  <p className="caption-sm text-mute">No categories crafted</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Detail/Editor Pane */}
          <div className="flex-1 flex flex-col bg-surface-card overflow-hidden">
            {/* Contextual Header */}
            <div className="p-6 pb-4 flex items-center justify-between border-b border-hairline/10">
              <DialogTitle className="heading-sm-mixed text-mute">
                {currentCategory ? (currentCategory.id ? 'Editing Details' : 'New Creation') : 'Studio Settings'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="md:hidden h-8 w-8 rounded-md text-body"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 pt-10 no-scrollbar">
              <AnimatePresence mode="wait">
                {currentCategory ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="max-w-[420px] mx-auto space-y-8"
                  >
                    <div className="space-y-2.5">
                      <h3 className="heading-lg text-ink leading-tight">
                        {currentCategory.id ? 'Refine Category' : 'Craft Category'}
                      </h3>
                      <p className="body-sm text-body leading-relaxed">
                        Define how services are organized in your artisan studio. This name will be visible to customers.
                      </p>
                    </div>

                    {localError && (
                      <div className="p-4 rounded-md bg-accent-red-soft border border-accent-red/20 flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-accent-red shrink-0 mt-0.5" />
                        <p className="body-sm text-accent-red font-medium leading-tight">{localError}</p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="cat_name" className="utility-xs text-mute ml-0.5">Category Name</Label>
                          <Input
                            id="cat_name"
                            value={currentCategory.name || ''}
                            onChange={(e) => setCurrentCategory({ ...currentCategory!, name: e.target.value })}
                            required
                            placeholder="e.g. Signature Spa"
                            className="h-11 bg-canvas/20 border-hairline focus-visible:ring-primary focus-visible:border-primary rounded-md shadow-none body-md transition-all"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-hairline shadow-sm">
                          <div className="flex flex-col">
                            <Label htmlFor="cat_active" className="body-strong cursor-pointer text-ink">Booking Visibility</Label>
                            <span className="caption-sm text-mute">Enable for customer discovery</span>
                          </div>
                          <Checkbox
                            id="cat_active"
                            checked={currentCategory.is_active}
                            onCheckedChange={(checked) => setCurrentCategory({ ...currentCategory!, is_active: checked === true })}
                            className="h-5 w-5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="btn-primary flex-1 h-11"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            currentCategory.id ? 'Save Changes' : 'Create Category'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setCurrentCategory(null)}
                          className="h-11 px-6 rounded-md text-body font-medium hover:bg-surface-soft"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 gap-8"
                  >
                    <div className="space-y-2 max-w-[340px]">
                      <h4 className="heading-md text-ink">Artisan Organization</h4>
                      <p className="body-sm text-body leading-relaxed">
                        Select a category to refine its details, or craft a new one to better organize your studio services.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentCategory({ name: '', is_active: true })}
                      className="border-hairline text-ink font-semibold hover:bg-surface-soft hover:border-body rounded-md px-10 h-11 transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" /> New Category
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
