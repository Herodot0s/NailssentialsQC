import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import {
  getCategories,
  getServices,
  createService,
  updateService,
  uploadFile,
  getAddons,
} from '@/api/apiClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Edit,
  Power,
  PowerOff,
  Sparkles,
  AlertCircle,
  Loader2,
  ImagePlus,
  X,
  Tags,
} from 'lucide-react';
import { ManageCategoriesDialog } from './ManageCategoriesDialog';
import { ManageAddonsDialog } from './ManageAddonsDialog';

interface Addon {
  id: number;
  name: string;
  description: string | null;
  price: string;
  is_active: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration_minutes: number;
  price: string;
  is_popular: boolean;
  is_active: boolean;
  category_id: number;
  category?: Category;
  image_url?: string | null;
  experience_description?: string | null;
  what_to_expect?: string | null;
}

const scrollbarHideStyles = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const ManageServices: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCategories, setIsEditingCategories] = useState(false);
  const [isEditingAddons, setIsEditingAddons] = useState(false);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  const popularCount = useMemo(() => services.filter((s) => s.is_popular).length, [services]);

  const getCategoryColor = (id: number | string) => {
    // Map category IDs to harmonious OKLCH colors aligned with the earthy palette
    const idNum = typeof id === 'string' ? parseInt(id) || 0 : id;
    const colors = [
      'oklch(60% 0.08 40)', // Warm Terracotta
      'oklch(55% 0.06 140)', // Muted Sage
      'oklch(65% 0.10 70)', // Ochre
      'oklch(50% 0.07 30)', // Deep Clay
      'oklch(60% 0.05 230)', // Dusk Blue
    ];
    return colors[idNum % colors.length];
  };

  const deferredSearch = useDeferredValue(searchQuery);

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch = svc.name.toLowerCase().includes(deferredSearch.toLowerCase());
      const matchesCategory =
        selectedCategoryId === 'all' || svc.category_id === selectedCategoryId;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && svc.is_active) ||
        (statusFilter === 'disabled' && !svc.is_active);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [services, deferredSearch, selectedCategoryId, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [catRes, svcRes, addonsRes] = await Promise.all([
        getCategories({ showAll: true }),
        getServices({ showAll: true }),
        getAddons({ showAll: true }),
      ]);
      setCategories(catRes.data.data);
      setServices(svcRes.data.data);
      setAddons(addonsRes.data.data || []);
    } catch {
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (svc: Service) => {
    setCurrentService(svc);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setCurrentService({
      name: '',
      description: '',
      experience_description: '',
      what_to_expect: '',
      image_url: '',
      duration_minutes: 60,
      price: '0',
      category_id: categories[0]?.id || 0,
      is_popular: false,
      is_active: true,
    });
    setIsEditing(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const options = {
        maxSizeMB: 1, // Compress to max 1MB
        maxWidthOrHeight: 1920, // Max width/height
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const res = await uploadFile(compressedFile);
      if (res.data?.success) {
        setCurrentService((prev) => ({ ...prev!, image_url: res.data.data.url }));
      }
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentService) return;

    // Validation
    if (parseFloat(currentService.price || '0') < 0) {
      setError('Price cannot be negative');
      return;
    }
    if (parseInt(String(currentService.duration_minutes || '0')) <= 0) {
      setError('Duration must be greater than 0');
      return;
    }
    if (parseInt(String(currentService.duration_minutes || '0')) > 600) {
      setError('Service duration cannot exceed 10 hours (600 minutes), as it would not fit within store operating hours.');
      return;
    }

    try {
      const payload = {
        name: currentService.name!,
        price: parseFloat(currentService.price || '0'),
        duration_minutes: currentService.duration_minutes!,
        category_id: currentService.category_id!,
        is_active: currentService.is_active,
        is_popular: currentService.is_popular,
        image_url: currentService.image_url,
        experience_description: currentService.experience_description,
        what_to_expect: currentService.what_to_expect,
      };

      if (currentService.id) {
        await updateService(currentService.id, payload);
      } else {
        await createService(payload);
      }
      setIsEditing(false);
      fetchData();
    } catch (err) {
      setError('Failed to save service');
    }
  };

  const toggleStatus = async (svc: Service) => {
    try {
      await updateService(svc.id, {
        is_active: !svc.is_active,
        price: parseFloat(svc.price),
      });
      fetchData();
    } catch (err) {
      setError('Failed to toggle status');
    }
  };

  if (isLoading && services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-mute font-medium">Loading service management...</p>
      </div>
    );
  }

  // Floating Manage Services
  return (
    <div className="container max-w-7xl mx-auto py-12 px-6">
      <style>{scrollbarHideStyles}</style>
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1"></div>
          <div className="flex gap-3">
            <Button
              onClick={() => setIsEditingCategories(true)}
              variant="outline"
              className="h-11 px-6 border-hairline text-body font-bold hover:bg-surface-soft/50"
            >
              <Tags className="mr-2 h-5 w-5" />
              Manage Categories
            </Button>
            <Button
              onClick={() => setIsEditingAddons(true)}
              variant="outline"
              className="h-11 px-6 border-hairline text-body font-bold hover:bg-surface-soft/50"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Manage Addons
            </Button>
            <Button
              onClick={handleAddNew}
              className="h-11 px-8 bg-primary border-none shadow-sm hover:brightness-105 transition-all active:scale-95 text-white font-bold"
            >
              <Plus className="mr-2 h-5 w-5" />
              New Service
            </Button>
          </div>
        </div>

        {/* Artisan's Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-y border-hairline/20 bg-surface-soft/20 -mx-6 px-6">
          <div className="flex flex-1 items-center gap-6 w-full md:w-auto">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-mute group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 border-0 border-b border-hairline rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-primary transition-all h-10 text-ink placeholder:text-mute"
              />
            </div>

            <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                  selectedCategoryId === 'all'
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-white/50 text-body border border-hairline/20 hover:bg-white'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{
                    backgroundColor:
                      selectedCategoryId === cat.id
                        ? getCategoryColor(cat.id)
                        : 'rgba(255,255,255,0.5)',
                    color: selectedCategoryId === cat.id ? 'white' : getCategoryColor(cat.id),
                    borderColor:
                      selectedCategoryId === cat.id
                        ? 'transparent'
                        : `${getCategoryColor(cat.id)}30`,
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase whitespace-nowrap border transition-all hover:brightness-95`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center bg-white/40 rounded-full p-1 border border-hairline/20 backdrop-blur-sm">
              {(['all', 'active', 'disabled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all ${
                    statusFilter === status
                      ? 'bg-white text-primary shadow-sm ring-1 ring-hairline/10'
                      : 'text-mute hover:text-body'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-accent-red-soft border border-accent-red/20 text-accent-red text-sm p-4 rounded-2xl flex items-center gap-3 mb-8 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <Card className="border-none shadow-premium bg-white/80 backdrop-blur-md overflow-hidden rounded-3xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-surface-soft/20 border-b border-hairline/10">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="pl-8 h-14 text-[10px] font-bold uppercase tracking-widest text-mute">
                  Service Name
                </TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-mute">
                  Category
                </TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-mute">
                  Price
                </TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-mute">
                  Duration
                </TableHead>
                <TableHead className="h-14 text-[10px] font-bold uppercase tracking-widest text-mute">
                  Status
                </TableHead>
                <TableHead className="pr-8 h-14 text-right text-[10px] font-bold uppercase tracking-widest text-mute">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredServices.map((svc) => (
                  <motion.tr
                    key={svc.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="group border-b border-hairline/10 hover:bg-surface-soft/10 transition-colors"
                  >
                    <TableCell className="pl-8 py-5">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-serif text-lg text-ink group-hover:text-primary transition-colors leading-none">
                          {svc.name}
                        </span>
                        {svc.is_popular && (
                          <Badge className="w-fit text-[9px] h-4 px-2 bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-widest rounded-full">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          backgroundColor: `${getCategoryColor(svc.category_id)}10`,
                          color: getCategoryColor(svc.category_id),
                          borderColor: `${getCategoryColor(svc.category_id)}20`,
                        }}
                        className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full border"
                      >
                        {svc.category?.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-serif font-bold text-xl text-primary/90">
                      ₱{parseFloat(svc.price).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-body text-sm font-medium">
                      {svc.duration_minutes}{' '}
                      <span className="text-[10px] uppercase tracking-tighter opacity-60">min</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-2 w-2 rounded-full ring-4 ${
                            svc.is_active
                              ? 'bg-accent-green ring-accent-green/10'
                              : 'bg-mute ring-mute/10'
                          }`}
                        />
                        <span
                          className={`text-[10px] font-bold tracking-widest uppercase ${
                            svc.is_active ? 'text-accent-green' : 'text-mute'
                          }`}
                        >
                          {svc.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(svc)}
                          className="h-9 w-9 rounded-full bg-white border border-hairline/10 shadow-sm text-body hover:text-primary hover:border-primary/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatus(svc)}
                          className={`h-9 w-9 rounded-full bg-white border border-hairline/10 shadow-sm ${
                            svc.is_active
                              ? 'text-accent-red hover:bg-accent-red-soft/20 hover:border-accent-red/20'
                              : 'text-accent-green hover:bg-accent-green-soft/20 hover:border-accent-green/20'
                          }`}
                        >
                          {svc.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          {filteredServices.length === 0 && !isLoading && (
            <div className="text-center py-20 text-mute/60 font-serif italic text-lg">
              No services match your current selection.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-[500px] sm:max-w-[500px] w-full p-0 overflow-hidden bg-canvas gap-0 border-none shadow-none">
          <div className="grid grid-cols-1 h-[85vh]">
            {/* LEFT PANE: Editor */}
            <div className="h-full overflow-y-auto p-8 bg-white no-scrollbar flex flex-col gap-8 relative">
              <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10 -mx-8 px-8 py-4 border-b border-hairline">
                <DialogTitle className="heading-md flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  {currentService?.id ? 'Artisan Studio' : 'Craft New Service'}
                </DialogTitle>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsEditing(false)}
                    className="rounded-md"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || isUploading}
                    className="btn-primary"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Save Service
                  </Button>
                </div>
              </div>

              <div className="space-y-8 pb-12">
                {/* Image Upload Area */}
                <div className="space-y-3">
                  <Label className="text-body font-bold uppercase tracking-wider text-xs">
                    Hero Image
                  </Label>
                  <div className="relative group">
                    {currentService?.image_url ? (
                      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-hairline/30 shadow-inner">
                        <img
                          src={currentService.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="bg-white/90 hover:bg-white text-ink"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Change Image
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setCurrentService((prev) => ({ ...prev!, image_url: '' }))
                            }
                          >
                            <X className="h-4 w-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center h-64 w-full rounded-2xl border-2 border-dashed border-hairline/50 bg-surface-soft/20 hover:bg-surface-soft/40 hover:border-primary/50 transition-colors cursor-pointer group-hover:shadow-sm"
                      >
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-3 text-primary">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="text-sm font-medium">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-mute group-hover:text-primary transition-colors">
                            <div className="p-4 bg-white rounded-full shadow-sm">
                              <ImagePlus className="h-8 w-8" />
                            </div>
                            <span className="text-sm font-medium">
                              Click to upload a high-quality photo
                            </span>
                            <span className="text-xs opacity-70">JPEG, PNG or WebP (max 5MB)</span>
                          </div>
                        )}
                      </label>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </div>
                </div>

                {/* Core Details */}
                <div className="space-y-4">
                  <Label className="text-body font-bold uppercase tracking-wider text-xs border-b border-hairline/30 pb-2 block">
                    Core Details
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={currentService?.name || ''}
                        onChange={(e) =>
                          setCurrentService({ ...currentService!, name: e.target.value })
                        }
                        required
                        className="h-12 text-lg font-serif focus-visible:ring-primary bg-canvas/30"
                        placeholder="e.g. Signature Botanical Spa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={currentService?.category_id?.toString()}
                        onValueChange={(val: string | null) =>
                          val &&
                          setCurrentService({ ...currentService!, category_id: parseInt(val) })
                        }
                      >
                        <SelectTrigger
                          id="category"
                          className="h-12 focus:ring-primary bg-canvas/30"
                        >
                          <SelectValue placeholder="Select Category">
                            {categories.find((c) => c.id === currentService?.category_id)?.name}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="flex items-center gap-1.5">
                          Price (₱) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={currentService?.price || ''}
                          onChange={(e) =>
                            setCurrentService({ ...currentService!, price: e.target.value })
                          }
                          required
                          className="h-12 focus-visible:ring-primary font-serif font-bold text-primary bg-canvas/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="flex items-center gap-1.5">
                          Duration *
                        </Label>
                        <div className="relative">
                          <Input
                            id="duration"
                            type="number"
                            value={currentService?.duration_minutes || ''}
                            onChange={(e) =>
                              setCurrentService({
                                ...currentService!,
                                duration_minutes: parseInt(e.target.value),
                              })
                            }
                            required
                            className="h-12 pr-12 focus-visible:ring-primary bg-canvas/30"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-mute">
                            min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editorial Content */}
                <div className="space-y-5">
                  <Label className="text-body font-bold uppercase tracking-wider text-xs border-b border-hairline/30 pb-2 block">
                    Editorial Storytelling
                  </Label>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex justify-between items-center">
                      Short Description
                      <span className="text-[10px] text-mute font-normal uppercase">
                        Used in catalogs
                      </span>
                    </Label>
                    <Textarea
                      id="description"
                      value={currentService?.description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCurrentService({ ...currentService!, description: e.target.value })
                      }
                      className="min-h-[80px] resize-none focus-visible:ring-primary bg-canvas/30"
                      placeholder="A brief, captivating summary of the service..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="experience"
                      className="flex justify-between items-center text-primary"
                    >
                      The Experience
                      <span className="text-[10px] text-mute font-normal uppercase">
                        Deep dive narrative
                      </span>
                    </Label>
                    <Textarea
                      id="experience"
                      value={currentService?.experience_description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCurrentService({
                          ...currentService!,
                          experience_description: e.target.value,
                        })
                      }
                      className="min-h-[140px] resize-y focus-visible:ring-primary bg-canvas/30 leading-relaxed"
                      placeholder="Describe the sensory journey, the techniques used, and the feeling of luxury..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expect" className="flex justify-between items-center">
                      What to Expect
                      <span className="text-[10px] text-mute font-normal uppercase">
                        Step by step / Highlights
                      </span>
                    </Label>
                    <Textarea
                      id="expect"
                      value={currentService?.what_to_expect || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCurrentService({ ...currentService!, what_to_expect: e.target.value })
                      }
                      className="min-h-[120px] resize-y focus-visible:ring-primary bg-canvas/30"
                      placeholder="• Warm herbal soak&#10;• Precision cuticle care&#10;• Extended massage..."
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-hairline/30">
                  <div className="flex flex-col gap-4 bg-canvas/20 p-5 rounded-2xl border border-hairline/30">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="is_active"
                        checked={currentService?.is_active}
                        onCheckedChange={(checked) =>
                          setCurrentService({ ...currentService!, is_active: checked === true })
                        }
                        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="is_active"
                          className="text-sm font-bold cursor-pointer text-ink"
                        >
                          Active Status
                        </Label>
                        <p className="text-xs text-mute">
                          When active, customers can discover and book this service.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="is_popular"
                        checked={currentService?.is_popular}
                        disabled={!currentService?.is_popular && popularCount >= 4}
                        onCheckedChange={(checked) =>
                          setCurrentService({ ...currentService!, is_popular: checked === true })
                        }
                        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="is_popular"
                          className={`text-sm font-bold cursor-pointer flex items-center gap-1.5 ${!currentService?.is_popular && popularCount >= 4 ? 'text-mute' : 'text-primary'}`}
                        >
                          Featured / Popular <Sparkles className="h-3 w-3" />
                        </Label>
                        <p className="text-xs text-mute">
                          {!currentService?.is_popular && popularCount >= 4
                            ? 'Maximum of 4 trending treatments reached. Disable another to feature this one.'
                            : 'Highlights this service with a special badge in the public catalog (Max 4).'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <ManageCategoriesDialog
        open={isEditingCategories}
        onOpenChange={setIsEditingCategories}
        categories={categories}
        onSuccess={fetchData}
      />
      <ManageAddonsDialog
        open={isEditingAddons}
        onOpenChange={setIsEditingAddons}
        addons={addons}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default ManageServices;
