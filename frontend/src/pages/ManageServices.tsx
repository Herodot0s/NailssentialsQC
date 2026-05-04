import React, { useState, useEffect } from 'react';
import { getCategories, getServices, createService, updateService } from '../api/apiClient';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
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
  Plus,
  Edit,
  Power,
  PowerOff,
  Sparkles,
  AlertCircle,
  Loader2,
  Settings,
  DollarSign,
  Clock,
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
}

const ManageServices: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Partial<Service> | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      duration_minutes: 60,
      price: '0',
      category_id: categories[0]?.id || 0,
      is_popular: false,
      is_active: true,
    });
    setIsEditing(true);
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
        duration: currentService.duration_minutes!,
        category_id: currentService.category_id!,
        is_active: currentService.is_active,
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
        <p className="text-muted-foreground font-medium">Loading service management...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-10 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Manage Services
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your salon's service menu and pricing.
          </p>
        </div>
        <Button onClick={handleAddNew} className="h-11 px-6 shadow-sm">
          <Plus className="mr-2 h-5 w-5" />
          Add New Service
        </Button>
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
              {services.map((svc) => (
                <TableRow key={svc.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="pl-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-foreground">{svc.name}</span>
                      {svc.is_popular && (
                        <Badge
                          variant="secondary"
                          className="w-fit text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider"
                        >
                          Popular
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-medium">
                      {svc.category?.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-primary">
                    ₱{parseFloat(svc.price).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {svc.duration_minutes} min
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={svc.is_active ? 'default' : 'secondary'}
                      className={svc.is_active ? 'bg-success-color text-white' : ''}
                    >
                      {svc.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(svc)}
                        className="h-9 w-9 p-0"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(svc)}
                        className={`h-9 w-9 p-0 ${svc.is_active ? 'text-destructive hover:text-destructive hover:bg-destructive/10' : 'text-success-color hover:text-success-color hover:bg-success-color/10'}`}
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {services.length === 0 && !isLoading && (
            <div className="text-center py-20 text-muted-foreground italic">
              No services found. Click "Add New Service" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {currentService?.id ? 'Edit Service' : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              Update the service details below. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                type="text"
                value={currentService?.name}
                onChange={(e) => setCurrentService({ ...currentService!, name: e.target.value })}
                required
                className="h-11 focus-visible:ring-primary"
                placeholder="e.g. Premium Gel Manicure"
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
                <SelectTrigger id="category" className="h-11 focus:ring-primary">
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
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  Price (₱) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={currentService?.price}
                  onChange={(e) => setCurrentService({ ...currentService!, price: e.target.value })}
                  required
                  className="h-11 focus-visible:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Duration (min) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={currentService?.duration_minutes}
                  onChange={(e) =>
                    setCurrentService({
                      ...currentService!,
                      duration_minutes: parseInt(e.target.value),
                    })
                  }
                  required
                  className="h-11 focus-visible:ring-primary"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentService?.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCurrentService({ ...currentService!, description: e.target.value })
                }
                className="min-h-[100px] resize-none focus-visible:ring-primary"
                placeholder="Describe the service benefits and process..."
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="is_popular"
                checked={currentService?.is_popular}
                onCheckedChange={(checked) =>
                  setCurrentService({ ...currentService!, is_popular: checked === true })
                }
              />
              <Label
                htmlFor="is_popular"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Mark as Popular (Show badge in catalog)
              </Label>
            </div>

            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 px-8 font-bold shadow-lg shadow-primary/20"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save Service'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageServices;
