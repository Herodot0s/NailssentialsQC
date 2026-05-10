import React, { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';
import { getCategories, getServices, createService, updateService, uploadFile } from '@/api/apiClient';
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Clock,
  ImagePlus,
  X,
} from 'lucide-react';

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
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  const popularCount = useMemo(() => services.filter(s => s.is_popular).length, [services]);

  const getCategoryColor = (id: number | string) => {
    // Map category IDs to harmonious OKLCH colors
    const idNum = typeof id === 'string' ? parseInt(id) || 0 : id;
    const colors = [
      'oklch(65% 0.12 35)', // Terracotta (Nails)
      'oklch(60% 0.08 145)', // Forest (Spa)
      'oklch(70% 0.1 65)', // Amber (Hair)
      'oklch(60% 0.1 25)', // Brick (Waxing)
      'oklch(65% 0.06 240)', // Slate (Eyelash)
    ];
    return colors[idNum % colors.length];
  };

  const getCategoryBg = (id: number | string) => {
    const idNum = typeof id === 'string' ? parseInt(id) || 0 : id;
    const colors = [
      'oklch(95% 0.02 35)',
      'oklch(95% 0.02 145)',
      'oklch(95% 0.02 65)',
      'oklch(95% 0.02 25)',
      'oklch(95% 0.02 240)',
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
      const [catRes, svcRes] = await Promise.all([getCategories(), getServices()]);
      setCategories(catRes.data.data);
      setServices(svcRes.data.data);
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
        <Loader2 className="h-8 w-8 animate-spin text-kiln-terracotta" />
        <p className="text-warm-stone font-medium">Loading service management...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-6">
      <style>{scrollbarHideStyles}</style>
      <div className="flex flex-col gap-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-1">
          </div>
          <Button
            onClick={handleAddNew}
            className="h-11 px-8 bg-gradient-to-br from-[#B8794E] to-[#9A6440] border-none shadow-premium hover:shadow-card transition-all active:scale-95 text-white font-bold"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Service
          </Button>
        </div>

        {/* Artisan's Toolbar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-y border-kiln-border/50 bg-linen-mist/30 -mx-6 px-6">
          <div className="flex flex-1 items-center gap-6 w-full md:w-auto">
            <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-clay-dust group-focus-within:text-kiln-terracotta transition-colors" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 border-0 border-b border-kiln-border rounded-none bg-transparent focus-visible:ring-0 focus-visible:border-kiln-terracotta transition-all h-10 text-charcoal-bark placeholder:text-clay-dust"
              />
            </div>

            <div className="hidden md:flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategoryId('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all ${selectedCategoryId === 'all'
                  ? 'bg-kiln-terracotta text-white shadow-card'
                  : 'bg-bisque-wash/50 text-warm-stone hover:bg-bisque-wash'
                  }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  style={{
                    backgroundColor: selectedCategoryId === cat.id ? getCategoryColor(cat.id) : getCategoryBg(cat.id),
                    color: selectedCategoryId === cat.id ? 'white' : getCategoryColor(cat.id),
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all shadow-sm hover:brightness-95`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-end">
            <div className="flex items-center bg-bisque-wash/30 rounded-full p-1 border border-kiln-border/30">
              {(['all', 'active', 'disabled'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all ${statusFilter === status
                    ? 'bg-white text-kiln-terracotta shadow-sm'
                    : 'text-clay-dust hover:text-warm-stone'
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
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border-none shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="pl-6 font-bold">Service Name</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Price</TableHead>
                <TableHead className="font-bold">Duration</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="pr-6 text-right font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredServices.map((svc) => (
                  <motion.tr
                    key={svc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.25,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    className="group border-b hover:bg-linen-mist/50 transition-colors"
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-charcoal-bark group-hover:text-kiln-terracotta transition-colors">
                          {svc.name}
                        </span>
                        {svc.is_popular && (
                          <Badge className="w-fit text-[9px] h-4 px-1.5 bg-kiln-terracotta text-white border-none font-bold uppercase tracking-widest shadow-sm">
                            Popular
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        style={{
                          backgroundColor: getCategoryBg(svc.category_id),
                          color: getCategoryColor(svc.category_id),
                          borderColor: `${getCategoryColor(svc.category_id)}20`,
                        }}
                        className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border"
                      >
                        {svc.category?.name}
                      </span>
                    </TableCell>
                    <TableCell className="font-serif font-bold text-kiln-terracotta">
                      ₱{parseFloat(svc.price).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-warm-stone text-sm">
                      {svc.duration_minutes} min
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full shadow-[0_0_8px] ${svc.is_active ? 'bg-forest-confirm shadow-forest-confirm/50' : 'bg-clay-dust shadow-clay-dust/30'
                            }`}
                        />
                        <span
                          className={`text-xs font-bold tracking-tight ${svc.is_active ? 'text-forest-confirm' : 'text-warm-stone'
                            }`}
                        >
                          {svc.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(svc)}
                          className="h-8 w-8 p-0 rounded-full hover:bg-kiln-terracotta/10 hover:text-kiln-terracotta"
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(svc)}
                          className={`h-8 w-8 p-0 rounded-full ${svc.is_active
                            ? 'hover:bg-brick-error/10 hover:text-brick-error'
                            : 'hover:bg-forest-confirm/10 hover:text-forest-confirm'
                            }`}
                        >
                          {svc.is_active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                          <span className="sr-only">{svc.is_active ? 'Disable' : 'Enable'}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          {filteredServices.length === 0 && !isLoading && (
            <div className="text-center py-20 text-warm-stone/60 font-serif italic text-lg">
              No services match your current selection.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-6xl sm:max-w-6xl w-[95vw] p-0 overflow-hidden bg-linen-mist gap-0 border-none shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 h-[85vh]">
            {/* LEFT PANE: Editor */}
            <div className="h-full overflow-y-auto p-8 bg-white no-scrollbar flex flex-col gap-8 border-r border-kiln-border/30 relative">
              
              <div className="flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-md z-10 -mx-8 px-8 py-4 border-b border-kiln-border/20">
                <DialogTitle className="font-serif text-2xl text-kiln-terracotta flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {currentService?.id ? 'Artisan Studio' : 'Craft New Service'}
                </DialogTitle>
                <div className="flex gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || isUploading}
                    className="font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary-hover transition-all"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                    Save Service
                  </Button>
                </div>
              </div>

              <div className="space-y-8 pb-12">
                {/* Image Upload Area */}
                <div className="space-y-3">
                  <Label className="text-warm-stone font-bold uppercase tracking-wider text-xs">Hero Image</Label>
                  <div className="relative group">
                    {currentService?.image_url ? (
                      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-kiln-border/30 shadow-inner">
                        <img 
                          src={currentService.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-charcoal-bark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <Button 
                            type="button" 
                            variant="secondary" 
                            size="sm"
                            className="bg-white/90 hover:bg-white text-charcoal-bark"
                            onClick={() => document.getElementById('image-upload')?.click()}
                          >
                            <Edit className="h-4 w-4 mr-2" /> Change Image
                          </Button>
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => setCurrentService(prev => ({ ...prev!, image_url: '' }))}
                          >
                            <X className="h-4 w-4 mr-2" /> Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <label htmlFor="image-upload" className="flex flex-col items-center justify-center h-64 w-full rounded-2xl border-2 border-dashed border-clay-dust/50 bg-bisque-wash/20 hover:bg-bisque-wash/50 hover:border-kiln-terracotta/50 transition-colors cursor-pointer group-hover:shadow-sm">
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-3 text-kiln-terracotta">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="text-sm font-medium">Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-clay-dust group-hover:text-kiln-terracotta transition-colors">
                            <div className="p-4 bg-white rounded-full shadow-sm">
                              <ImagePlus className="h-8 w-8" />
                            </div>
                            <span className="text-sm font-medium">Click to upload a high-quality photo</span>
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
                  <Label className="text-warm-stone font-bold uppercase tracking-wider text-xs border-b border-kiln-border/30 pb-2 block">Core Details</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="name">Service Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        value={currentService?.name || ''}
                        onChange={(e) => setCurrentService({ ...currentService!, name: e.target.value })}
                        required
                        className="h-12 text-lg font-serif focus-visible:ring-kiln-terracotta bg-bisque-wash/10"
                        placeholder="e.g. Signature Botanical Spa"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={currentService?.category_id?.toString()}
                        onValueChange={(val: string | null) =>
                          val && setCurrentService({ ...currentService!, category_id: parseInt(val) })
                        }
                      >
                        <SelectTrigger id="category" className="h-12 focus:ring-kiln-terracotta bg-bisque-wash/10">
                          <SelectValue placeholder="Select Category" />
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
                          onChange={(e) => setCurrentService({ ...currentService!, price: e.target.value })}
                          required
                          className="h-12 focus-visible:ring-kiln-terracotta font-serif font-bold text-kiln-terracotta bg-bisque-wash/10"
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
                            className="h-12 pr-12 focus-visible:ring-kiln-terracotta bg-bisque-wash/10"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-clay-dust">min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Editorial Content */}
                <div className="space-y-5">
                  <Label className="text-warm-stone font-bold uppercase tracking-wider text-xs border-b border-kiln-border/30 pb-2 block">Editorial Storytelling</Label>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="flex justify-between items-center">
                      Short Description
                      <span className="text-[10px] text-clay-dust font-normal uppercase">Used in catalogs</span>
                    </Label>
                    <Textarea
                      id="description"
                      value={currentService?.description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCurrentService({ ...currentService!, description: e.target.value })
                      }
                      className="min-h-[80px] resize-none focus-visible:ring-kiln-terracotta bg-bisque-wash/10"
                      placeholder="A brief, captivating summary of the service..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="flex justify-between items-center text-kiln-terracotta">
                      The Experience
                      <span className="text-[10px] text-clay-dust font-normal uppercase">Deep dive narrative</span>
                    </Label>
                    <Textarea
                      id="experience"
                      value={currentService?.experience_description || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCurrentService({ ...currentService!, experience_description: e.target.value })
                      }
                      className="min-h-[140px] resize-y focus-visible:ring-kiln-terracotta bg-bisque-wash/10 leading-relaxed"
                      placeholder="Describe the sensory journey, the techniques used, and the feeling of luxury..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expect" className="flex justify-between items-center">
                      What to Expect
                      <span className="text-[10px] text-clay-dust font-normal uppercase">Step by step / Highlights</span>
                    </Label>
                    <Textarea
                      id="expect"
                      value={currentService?.what_to_expect || ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setCurrentService({ ...currentService!, what_to_expect: e.target.value })
                      }
                      className="min-h-[120px] resize-y focus-visible:ring-kiln-terracotta bg-bisque-wash/10"
                      placeholder="• Warm herbal soak&#10;• Precision cuticle care&#10;• Extended massage..."
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-4 border-t border-kiln-border/30">
                  <div className="flex flex-col gap-4 bg-bisque-wash/30 p-5 rounded-2xl border border-kiln-border/50">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="is_active"
                        checked={currentService?.is_active}
                        onCheckedChange={(checked) =>
                          setCurrentService({ ...currentService!, is_active: checked === true })
                        }
                        className="mt-1"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer text-charcoal-bark">
                          Active Status
                        </Label>
                        <p className="text-xs text-clay-dust">When active, customers can discover and book this service.</p>
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
                        className="mt-1 data-[state=checked]:bg-kiln-terracotta data-[state=checked]:border-kiln-terracotta"
                      />
                      <div className="space-y-1">
                        <Label htmlFor="is_popular" className={`text-sm font-bold cursor-pointer flex items-center gap-1.5 ${!currentService?.is_popular && popularCount >= 4 ? 'text-clay-dust' : 'text-kiln-terracotta'}`}>
                          Featured / Popular <Sparkles className="h-3 w-3" />
                        </Label>
                        <p className="text-xs text-clay-dust">
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
            
            {/* RIGHT PANE: Live Preview */}
            <div className="h-full bg-charcoal-bark hidden lg:flex flex-col items-center justify-center relative overflow-hidden p-8">
              {/* Background abstract element */}
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-kiln-terracotta/20 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-forest-confirm/10 rounded-full blur-[80px] mix-blend-screen pointer-events-none" />
              
              <div className="w-full max-w-sm relative z-10 flex flex-col items-center gap-4">
                <p className="text-white/50 text-xs font-bold uppercase tracking-widest text-center w-full mb-2">Live Customer Preview</p>
                
                <div className="bg-white rounded-[2rem] w-[340px] h-[640px] shadow-2xl overflow-hidden flex flex-col border-[6px] border-charcoal-bark/50 relative">
                  {/* Notch */}
                  <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-20 pointer-events-none">
                    <div className="w-32 h-6 bg-charcoal-bark/50 rounded-b-xl backdrop-blur-md" />
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
                    {/* Header Image */}
                    <div className="relative h-72 w-full bg-bisque-wash flex items-center justify-center overflow-hidden">
                      {currentService?.image_url ? (
                        <img src={currentService.image_url} alt="Service" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-clay-dust flex flex-col items-center gap-2 opacity-50">
                          <ImagePlus className="h-10 w-10" />
                          <span className="text-xs font-serif italic">No image provided</span>
                        </div>
                      )}
                      
                      {currentService?.is_popular && (
                        <div className="absolute top-8 left-4">
                          <Badge className="bg-white/90 text-kiln-terracotta border-none shadow-sm font-bold uppercase tracking-widest text-[9px] px-2 py-1 backdrop-blur-md">
                            Popular Choice
                          </Badge>
                        </div>
                      )}

                      {/* Floating Category Badge */}
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-charcoal-bark/80 text-white border-none backdrop-blur-md uppercase tracking-widest text-[9px]">
                          {categories.find(c => c.id === currentService?.category_id)?.name || 'Category'}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl text-charcoal-bark leading-tight">
                          {currentService?.name || 'Service Name'}
                        </h3>
                        <div className="flex items-center gap-4 text-warm-stone text-sm font-medium">
                          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {currentService?.duration_minutes || 0} min</span>
                          <span className="text-kiln-terracotta font-serif font-bold text-lg">₱{parseFloat(currentService?.price || '0').toLocaleString()}</span>
                        </div>
                      </div>

                      {currentService?.description && (
                        <p className="text-clay-dust text-sm leading-relaxed">
                          {currentService.description}
                        </p>
                      )}

                      {currentService?.experience_description && (
                        <div className="space-y-3 pt-4 border-t border-linen-mist">
                          <h4 className="font-serif text-lg text-kiln-terracotta">The Experience</h4>
                          <p className="text-charcoal-bark/80 text-sm leading-relaxed whitespace-pre-wrap">
                            {currentService.experience_description}
                          </p>
                        </div>
                      )}

                      {currentService?.what_to_expect && (
                        <div className="space-y-3 pt-4 border-t border-linen-mist">
                          <h4 className="font-serif text-lg text-charcoal-bark">What to Expect</h4>
                          <p className="text-charcoal-bark/80 text-sm leading-relaxed whitespace-pre-wrap">
                            {currentService.what_to_expect}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fixed Bottom Action */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white to-transparent pt-12">
                    <Button className="w-full h-12 rounded-full bg-charcoal-bark text-white shadow-lg pointer-events-none">
                      Book Appointment
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageServices;
