import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

import { getUploadSignature } from '@/lib/api/endpoints/images';

export interface ImageUploadResult {
  imageUrl: string;
  imagePublicId: string;
}

export interface UseImageUploadOptions {
  folderName?: string;
  onSuccess?: (result: ImageUploadResult) => void;
  onError?: (error: string) => void;
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<ImageUploadResult | null> => {
    if (!file) {
      const error = 'Nie wybrano pliku do przesłania';
      toast.error(error);
      options.onError?.(error);
      return null;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = 'Wybrany plik nie jest obrazem';
      toast.error(error);
      options.onError?.(error);
      return null;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      const error = 'Plik jest za duży. Maksymalny rozmiar to 10MB';
      toast.error(error);
      options.onError?.(error);
      return null;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique public ID
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const publicId = `${timestamp}_${randomString}`;

      // Get upload signature from backend using generated API method
      const signatureData = await getUploadSignature({
        FolderName: options.folderName || 'uploads',
        PublicId: publicId
      });

      if (
        !signatureData.signature ||
        !signatureData.apiKey ||
        !signatureData.uploadUrl ||
        signatureData.timestamp === undefined
      ) {
        throw new Error('Nieprawidłowa odpowiedź z serwera przy pobieraniu podpisu');
      }

      // Prepare form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folderName || '');
      formData.append('public_id', signatureData.publicId || '');

      // Upload directly to Cloudinary
      const uploadResponse = await fetch(signatureData.uploadUrl, {
        method: 'POST',
        body: formData
      });

      setUploadProgress(100);

      if (!uploadResponse.ok) {
        throw new Error('Nie udało się przesłać pliku do Cloudinary');
      }

      const uploadResult = await uploadResponse.json();

      const result: ImageUploadResult = {
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id
      };

      toast.success('Zdjęcie zostało przesłane pomyślnie');
      options.onSuccess?.(result);

      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się przesłać zdjęcia';
      toast.error(errorMessage);
      options.onError?.(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadProgress
  };
}

// New hook for deferred uploads - only uploads when explicitly called
export interface DeferredImageData {
  file: File;
  previewUrl: string;
}

export interface UseDeferredImageUploadOptions {
  folderName?: string;
}

export function useDeferredImageUpload(options: UseDeferredImageUploadOptions = {}) {
  const [selectedImage, setSelectedImage] = useState<DeferredImageData | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const selectImage = useCallback((file: File | null) => {
    // Clean up previous preview URL
    setSelectedImage((prevImage) => {
      if (prevImage?.previewUrl) {
        URL.revokeObjectURL(prevImage.previewUrl);
      }
      return null;
    });

    if (!file) {
      setSelectedImage(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Wybrany plik nie jest obrazem');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('Plik jest za duży. Maksymalny rozmiar to 10MB');
      return;
    }

    setSelectedImage({
      file,
      previewUrl: URL.createObjectURL(file)
    });
  }, []);

  const uploadSelectedImage = useCallback(async (): Promise<ImageUploadResult | null> => {
    if (!selectedImage) {
      return null;
    }

    setIsUploading(true);

    try {
      // Generate unique public ID
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const publicId = `${timestamp}_${randomString}`;

      // Get upload signature from backend using generated API method
      const signatureData = await getUploadSignature({
        FolderName: options.folderName || 'uploads',
        PublicId: publicId
      });

      if (
        !signatureData.signature ||
        !signatureData.apiKey ||
        !signatureData.uploadUrl ||
        signatureData.timestamp === undefined
      ) {
        throw new Error('Nieprawidłowa odpowiedź z serwera przy pobieraniu podpisu');
      }

      // Prepare form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', selectedImage.file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp.toString());
      formData.append('signature', signatureData.signature);
      formData.append('folder', signatureData.folderName || '');
      formData.append('public_id', signatureData.publicId || '');

      // Upload directly to Cloudinary
      const uploadResponse = await fetch(signatureData.uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error('Nie udało się przesłać pliku do Cloudinary');
      }

      const uploadResult = await uploadResponse.json();

      const result: ImageUploadResult = {
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id
      };

      return result;
    } catch (error) {
      console.error('Image upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się przesłać zdjęcia';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [selectedImage, options.folderName]);

  const clearSelectedImage = useCallback(() => {
    setSelectedImage((prevImage) => {
      if (prevImage?.previewUrl) {
        URL.revokeObjectURL(prevImage.previewUrl);
      }
      return null;
    });
  }, []);

  return {
    selectedImage,
    selectImage,
    uploadSelectedImage,
    clearSelectedImage,
    isUploading
  };
}
