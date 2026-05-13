import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, PlusCircle, Loader2, X, AlertCircle } from 'lucide-react';
import { createAddon, updateAddon, deleteAddon } from '@/api/apiClient';

interface Addon {
  id: number;
  name: string;
  description: string | null;
  price: string;
  is_active: boolean;
}

interface ManageAddonsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addons: Addon[];
  onSuccess: () => void;
}

export const ManageAddonsDialog: React.FC<ManageAddonsDialogProps> = ({
  open,
  onOpenChange,
  addons,
  onSuccess,
}) => {
  const [currentAddon, setCurrentAddon] = useState<Partial<Addon> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAddon || !currentAddon.name || !currentAddon.price) return;

    try {
      setIsLoading(true);
      setLocalError(null);
      const payload = {
        name: currentAddon.name,
        description: currentAddon.description || '',
        price: parseFloat(currentAddon.price),
        is_active: currentAddon.is_active ?? true,
      };

      if (currentAddon.id) {
        await updateAddon(currentAddon.id, payload);
      } else {
        await createAddon(payload);
      }
      setCurrentAddon(null);
      onSuccess();
    } catch (err) {
      setLocalError('Failed to save addon. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this addon?')) return;
    try {
      setIsLoading(true);
      setLocalError(null);
      await deleteAddon(id);
      if (currentAddon?.id === id) setCurrentAddon(null);
      onSuccess();
    } catch (err) {
      setLocalError('Failed to delete addon. It might be in use by past bookings.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] p-0 overflow-hidden bg-canvas border-none shadow-none gap-0">
        <div className="flex flex-col md:flex-row h-[600px] md:h-[640px] border border-hairline rounded-md overflow-hidden bg-surface-card m-0">
          <div className="w-full md:w-[170px] flex flex-col border-r border-hairline bg-canvas/30">
            <div className="p-6 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <PlusCircle className="h-4 w-4 text-primary" />
                </div>
                <h2 className="heading-sm-mixed text-ink">Addons</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentAddon({ name: '', price: '0', is_active: true })}
                className="h-8 w-8 rounded-md hover:bg-surface-soft text-body transition-colors"
                title="New Addon"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6 no-scrollbar space-y-1">
              <AnimatePresence mode="popLayout">
                {addons.map((addon) => (
                  <motion.div
                    key={addon.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setCurrentAddon(addon)}
                    className={`group relative flex items-center justify-between p-3 px-3.5 rounded-md border transition-all cursor-pointer ${currentAddon?.id === addon.id
                      ? 'bg-surface-card border-hairline shadow-[0_2px_4px_rgba(0,0,0,0.02)]'
                      : 'bg-transparent border-transparent hover:bg-surface-soft/40'
                      }`}
                  >
                    <div className="flex flex-col gap-0.5 overflow-hidden">
                      <span
                        className={`body-sm truncate ${currentAddon?.id === addon.id ? 'font-semibold text-ink' : 'text-body'}`}
                      >
                        {addon.name}
                      </span>
                      {!addon.is_active && (
                        <span className="utility-xs text-mute opacity-70">Hidden</span>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 text-accent-red hover:bg-accent-red-soft transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(addon.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {addons.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-surface-soft/30 p-3 rounded-full mb-3">
                    <PlusCircle className="h-5 w-5 text-stone" />
                  </div>
                  <p className="caption-sm text-mute">No addons crafted</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-surface-card overflow-hidden">
            <div className="p-6 pb-4 flex items-center justify-between border-b border-hairline/10">
              <DialogTitle className="heading-sm-mixed text-mute">
                {currentAddon
                  ? currentAddon.id
                    ? 'Editing Addon'
                    : 'New Addon'
                  : 'Addons Settings'}
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
                {currentAddon ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="max-w-[420px] mx-auto space-y-8"
                  >
                    <div className="space-y-2.5">
                      <h3 className="heading-lg text-ink leading-tight">
                        {currentAddon.id ? 'Refine Addon' : 'Craft Addon'}
                      </h3>
                      <p className="body-sm text-body leading-relaxed">
                        Define enhancements customers can add to their bookings.
                      </p>
                    </div>

                    {localError && (
                      <div className="p-4 rounded-md bg-accent-red-soft border border-accent-red/20 flex items-start gap-3">
                        <AlertCircle className="h-4 w-4 text-accent-red shrink-0 mt-0.5" />
                        <p className="body-sm text-accent-red font-medium leading-tight">
                          {localError}
                        </p>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="addon_name" className="utility-xs text-mute ml-0.5">
                            Addon Name
                          </Label>
                          <Input
                            id="addon_name"
                            value={currentAddon.name || ''}
                            onChange={(e) =>
                              setCurrentAddon({ ...currentAddon!, name: e.target.value })
                            }
                            required
                            placeholder="e.g. Addons"
                            className="h-11 bg-canvas/20 border-hairline focus-visible:ring-primary focus-visible:border-primary rounded-md shadow-none body-md transition-all"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="addon_price" className="utility-xs text-mute ml-0.5">
                            Price (₱)
                          </Label>
                          <Input
                            id="addon_price"
                            type="number"
                            step="0.01"
                            value={currentAddon.price || ''}
                            onChange={(e) =>
                              setCurrentAddon({ ...currentAddon!, price: e.target.value })
                            }
                            required
                            placeholder="0.00"
                            className="h-11 bg-canvas/20 border-hairline focus-visible:ring-primary focus-visible:border-primary rounded-md shadow-none body-md transition-all"
                          />
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-hairline shadow-sm">
                          <div className="flex flex-col">
                            <Label
                              htmlFor="addon_active"
                              className="body-strong cursor-pointer text-ink"
                            >
                              Booking Visibility
                            </Label>
                            <span className="caption-sm text-mute">
                              Enable for customer discovery
                            </span>
                          </div>
                          <Checkbox
                            id="addon_active"
                            checked={currentAddon.is_active}
                            onCheckedChange={(checked) =>
                              setCurrentAddon({
                                ...currentAddon!,
                                is_active: checked === true,
                              })
                            }
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
                          ) : currentAddon.id ? (
                            'Save Changes'
                          ) : (
                            'Create Addon'
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setCurrentAddon(null)}
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
                      <h4 className="heading-md text-ink">Addons Organization</h4>
                      <p className="body-sm text-body leading-relaxed">
                        Select an addon to refine its details, or craft a new one to offer
                        enhancements for your studio services.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentAddon({ name: '', price: '0', is_active: true })}
                      className="border-hairline text-ink font-semibold hover:bg-surface-soft hover:border-body rounded-md px-10 h-11 transition-all"
                    >
                      <Plus className="h-4 w-4 mr-2" /> New Addon
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
