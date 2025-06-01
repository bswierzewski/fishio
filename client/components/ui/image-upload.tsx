import { Button } from './button';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { ImagePlus, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

import {
  type DeferredImageData,
  type ImageUploadResult,
  useDeferredImageUpload,
  useImageUpload
} from '@/hooks/use-image-upload';

export interface ImageUploadProps {
  id?: string;
  label?: string;
  required?: boolean;
  currentImageUrl?: string | null;
  folderName?: string;
  onImageChange: (result: ImageUploadResult | null) => void;
  onRemove?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ImageUpload({
  id = 'image-upload',
  label = 'Zdjęcie',
  required = false,
  currentImageUrl,
  folderName = 'uploads',
  onImageChange,
  onRemove,
  className,
  disabled = false
}: ImageUploadProps) {
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(currentImageUrl || null);

  const { uploadImage, isUploading } = useImageUpload({
    folderName,
    onSuccess: (result) => {
      setSelectedImagePreview(result.imageUrl);
      onImageChange(result);
    },
    onError: () => {
      setSelectedImagePreview(currentImageUrl || null);
      onImageChange(null);
    }
  });

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setSelectedImagePreview(currentImageUrl || null);
      onImageChange(null);
      return;
    }

    // Show preview immediately for better UX
    setSelectedImagePreview(URL.createObjectURL(file));

    // Upload the image
    await uploadImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImagePreview(null);
    onImageChange(null);
    onRemove?.();

    // Reset the file input
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemoveImage();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground flex items-center">
        <ImagePlus className="mr-2 h-5 w-5" />
        {label} {required && '*'}
      </Label>

      <label
        htmlFor={id}
        className={cn(
          'mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6 transition-colors cursor-pointer',
          'hover:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'pointer-events-none'
        )}
      >
        <div className="space-y-1 text-center">
          {selectedImagePreview ? (
            <div className="relative">
              <img
                src={selectedImagePreview}
                alt="Podgląd zdjęcia"
                className="mx-auto h-32 w-auto rounded-md object-contain"
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveImageClick}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ) : (
            <>
              {isUploading ? (
                <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
              ) : (
                <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
              )}
            </>
          )}

          <div className="flex text-sm text-muted-foreground justify-center">
            <span className="font-medium text-primary">
              {isUploading ? 'Przesyłanie...' : selectedImagePreview ? 'Zmień zdjęcie' : 'Załaduj plik'}
            </span>
            {!selectedImagePreview && !isUploading && <p className="pl-1">lub przeciągnij i upuść</p>}
          </div>

          {!isUploading && <p className="text-xs text-muted-foreground">PNG, JPG, GIF do 10MB</p>}
        </div>

        <input
          id={id}
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleImageChange}
          disabled={disabled || isUploading}
        />
      </label>
    </div>
  );
}

// New component for deferred uploads - only uploads when form is submitted
export interface DeferredImageUploadProps {
  id?: string;
  label?: string;
  required?: boolean;
  currentImageUrl?: string | null;
  folderName?: string;
  onImageSelect: (imageData: DeferredImageData | null) => void;
  onUploadReady?: (uploadFn: () => Promise<ImageUploadResult | null>) => void;
  className?: string;
  disabled?: boolean;
}

export function DeferredImageUpload({
  id = 'deferred-image-upload',
  label = 'Zdjęcie',
  required = false,
  currentImageUrl,
  folderName = 'uploads',
  onImageSelect,
  onUploadReady,
  className,
  disabled = false
}: DeferredImageUploadProps) {
  const { selectedImage, selectImage, uploadSelectedImage, isUploading } = useDeferredImageUpload({ folderName });

  // Expose the upload function to parent component
  useEffect(() => {
    if (onUploadReady) {
      onUploadReady(uploadSelectedImage);
    }
  }, [uploadSelectedImage, onUploadReady]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    selectImage(file || null);
    onImageSelect(file ? { file, previewUrl: URL.createObjectURL(file) } : null);
  };

  const handleRemoveImage = () => {
    selectImage(null);
    onImageSelect(null);

    // Reset the file input
    const fileInput = document.getElementById(id) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemoveImage();
  };

  const displayImage = selectedImage?.previewUrl || currentImageUrl;

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={id} className="text-sm font-medium text-foreground flex items-center">
        <ImagePlus className="mr-2 h-5 w-5" />
        {label} {required && '*'}
      </Label>

      <label
        htmlFor={id}
        className={cn(
          'mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6 transition-colors cursor-pointer',
          'hover:border-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'pointer-events-none'
        )}
      >
        <div className="space-y-1 text-center">
          {displayImage ? (
            <div className="relative">
              <img src={displayImage} alt="Podgląd zdjęcia" className="mx-auto h-32 w-auto rounded-md object-contain" />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveImageClick}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ) : (
            <>
              {isUploading ? (
                <Loader2 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
              ) : (
                <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
              )}
            </>
          )}

          <div className="flex text-sm text-muted-foreground justify-center">
            <span className="font-medium text-primary">
              {isUploading ? 'Przesyłanie...' : displayImage ? 'Zmień zdjęcie' : 'Załaduj plik'}
            </span>
            {!displayImage && !isUploading && <p className="pl-1">lub przeciągnij i upuść</p>}
          </div>

          <p className="text-xs text-muted-foreground">PNG, JPG, GIF do 10MB</p>
          {selectedImage && !isUploading && (
            <p className="text-xs text-amber-600">Zdjęcie zostanie przesłane po wysłaniu formularza</p>
          )}
        </div>

        <input
          id={id}
          type="file"
          className="sr-only"
          accept="image/*"
          onChange={handleImageChange}
          disabled={disabled || isUploading}
        />
      </label>
    </div>
  );
}
