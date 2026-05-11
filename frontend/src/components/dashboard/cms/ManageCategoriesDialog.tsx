import React, { useState } from 'react';
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
import { Plus, Trash2, Tags, Loader2 } from 'lucide-react';
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
  setError: (error: string | null) => void;
}

export const ManageCategoriesDialog: React.FC<ManageCategoriesDialogProps> = ({
  open,
  onOpenChange,
  categories,
  onSuccess,
  setError,
}) => {
  const [currentCategory, setCurrentCategory] = useState<Partial<Category> | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory || !currentCategory.name) return;

    try {
      setIsLoading(true);
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
      setError('Failed to save category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure? This may affect services in this category.')) return;
    try {
      setIsLoading(true);
      await deleteCategory(id);
      onSuccess();
    } catch (err) {
      setError('Failed to delete category');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-none shadow-2xl">
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-kiln-border/20 pb-4">
            <DialogTitle className="font-serif text-2xl text-kiln-terracotta flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Manage Categories
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentCategory({ name: '', description: '', is_active: true });
              }}
              className="text-kiln-terracotta hover:bg-kiln-terracotta/10"
            >
              <Plus className="h-4 w-4 mr-2" /> New Category
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Category List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
              <Label className="text-warm-stone font-bold uppercase tracking-wider text-[10px]">Existing Categories</Label>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${currentCategory?.id === cat.id ? 'bg-bisque-wash/30 border-kiln-terracotta' : 'border-kiln-border/30 hover:border-kiln-terracotta/50'}`}
                    onClick={() => setCurrentCategory(cat)}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-charcoal-bark">{cat.name}</span>
                      {!cat.is_active && <span className="text-[10px] text-clay-dust uppercase font-bold">Disabled</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 rounded-full text-brick-error hover:bg-brick-error/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(cat.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editor Pane */}
            <div className="space-y-6 bg-bisque-wash/10 p-6 rounded-2xl border border-kiln-border/30">
              <Label className="text-warm-stone font-bold uppercase tracking-wider text-[10px]">
                {currentCategory?.id ? 'Edit Category' : 'Create Category'}
              </Label>

              {currentCategory ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cat_name">Name</Label>
                    <Input
                      id="cat_name"
                      value={currentCategory.name || ''}
                      onChange={(e) => setCurrentCategory({ ...currentCategory!, name: e.target.value })}
                      required
                      className="bg-white border-kiln-border/50 focus-visible:ring-kiln-terracotta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cat_desc">Description</Label>
                    <Textarea
                      id="cat_desc"
                      value={currentCategory.description || ''}
                      onChange={(e) => setCurrentCategory({ ...currentCategory!, description: e.target.value })}
                      className="bg-white border-kiln-border/50 focus-visible:ring-kiln-terracotta resize-none h-20"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="cat_active"
                      checked={currentCategory.is_active}
                      onCheckedChange={(checked) => setCurrentCategory({ ...currentCategory!, is_active: checked === true })}
                    />
                    <Label htmlFor="cat_active" className="text-sm cursor-pointer">Active</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      className="flex-1 bg-kiln-terracotta hover:bg-kiln-terracotta/90 text-white font-bold"
                      disabled={isLoading}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                      {currentCategory.id ? 'Update' : 'Save'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setCurrentCategory(null)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-center text-clay-dust gap-3">
                  <Tags className="h-10 w-10 opacity-20" />
                  <p className="text-xs">Select a category to edit or create a new one</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
