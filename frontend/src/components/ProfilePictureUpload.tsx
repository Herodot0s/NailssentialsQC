import React, { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { uploadFile } from '../api/apiClient';

interface ProfilePictureUploadProps {
  currentUrl?: string;
  fullName: string;
  onUploadComplete: (url: string) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentUrl,
  fullName,
  onUploadComplete,
}) => {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG)');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be under 2MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      // Convert to base64 (strip the data:mime;base64, prefix)
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];

      const result = await uploadFile(base64Content, file.name, file.type);

      if (result.data?.success) {
        onUploadComplete(result.data.data.url);
      } else {
        setError(result.data?.message || 'Upload failed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed. Please try again.';
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
        Profile Picture
      </Label>
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24 rounded-none border-2 border-primary/10">
          <AvatarImage src={preview || currentUrl} className="object-cover" />
          <AvatarFallback className="bg-primary/5 font-serif text-3xl text-primary">
            {fullName.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFileSelect}
            disabled={uploading}
            className="rounded-none text-[9px] uppercase font-bold tracking-widest"
          >
            {uploading ? (
              <>
                <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Photo'
            )}
          </Button>
          {(preview || currentUrl) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="rounded-none text-[9px] uppercase font-bold tracking-widest text-destructive hover:bg-destructive/10"
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      {error && (
        <p className="text-[10px] text-destructive font-bold">{error}</p>
      )}
      <p className="text-[9px] text-muted-foreground italic">
        JPG or PNG, max 2MB. Recommended: 256x256px.
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
