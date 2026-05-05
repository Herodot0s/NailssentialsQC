import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Upload, X } from 'lucide-react';
import { getAllStaff, getServices, uploadFile, createExhibit } from '../../api/apiClient';
import type { StaffMember, Service } from '../../types/api';

interface ExhibitFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ExhibitForm: React.FC<ExhibitFormProps> = ({ onSuccess, onCancel }) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [staffId, setStaffId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, svcRes] = await Promise.all([getAllStaff(), getServices()]);
        
        // Handle paginated or array response for staff
        const staffData = staffRes.data.data;
        setStaff(Array.isArray(staffData) ? staffData : (staffData?.items || []));
        
        // Handle paginated or array response for services
        const svcData = svcRes.data.data;
        setServices(Array.isArray(svcData) ? svcData : (svcData?.items || []));
      } catch (err) {
        console.error('Failed to fetch form data', err);
        setError('Failed to load staff and services');
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !title || !staffId) {
      setError('Please fill in all required fields and select an image');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Upload Image
      setIsUploading(true);
      const uploadRes = await uploadFile(imageFile);
      setIsUploading(false);

      if (!uploadRes.data.success) {
        throw new Error('Image upload failed');
      }

      const imageUrl = uploadRes.data.data.url;

      // 2. Create Exhibit
      await createExhibit({
        title,
        image_url: imageUrl,
        staff_id: parseInt(staffId),
        service_id: serviceId ? parseInt(serviceId) : undefined,
      });

      onSuccess();
    } catch (err: any) {
      console.error('Submit exhibit error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create exhibit');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {error && (
        <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md border border-destructive/20">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Exhibit Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Autumn Floral Set"
          className="rounded-none border-gray-200 h-11"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="staff" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Artist (Staff) *</Label>
          <Select value={staffId} onValueChange={(val) => setStaffId(val || '')} required>
            <SelectTrigger id="staff" className="rounded-none border-gray-200 h-11">
              <SelectValue placeholder="Select Artist">
                {staffId ? staff.find(s => s.id.toString() === staffId)?.fullName || staffId : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-none border-none shadow-2xl">
              {staff.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.fullName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="service" className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Service Context (Optional)</Label>
          <Select value={serviceId} onValueChange={(val) => setServiceId(val || '')}>
            <SelectTrigger id="service" className="rounded-none border-gray-200 h-11">
              <SelectValue placeholder="None">
                {serviceId && serviceId !== 'none' ? services.find(s => s.id.toString() === serviceId)?.name || serviceId : serviceId === 'none' ? 'None' : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-none border-none shadow-2xl">
              <SelectItem value="none">None</SelectItem>
              {services.map((s) => (
                <SelectItem key={s.id} value={s.id.toString()}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">High-Res Image *</Label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-none hover:border-primary/50 transition-colors bg-gray-50/50">
          {previewUrl ? (
            <div className="relative w-full aspect-video">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 p-1 bg-white shadow-lg rounded-full hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-1 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-300 stroke-[1]" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-transparent rounded-md font-bold text-primary hover:text-primary/80"
                >
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">PNG, JPG, WEBP up to 4MB</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-none h-12 px-6 uppercase tracking-widest text-[10px] font-bold">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isUploading}
          className="rounded-none h-12 px-10 uppercase tracking-widest text-[10px] font-bold shadow-xl shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? 'Uploading Image...' : 'Creating...'}
            </>
          ) : (
            'Publish Exhibit'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExhibitForm;
