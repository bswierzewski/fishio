'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface FishImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function FishImage({ src, alt, className, width = 400, height = 300, priority = false }: FishImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const imageSrc = imageError || !src ? '/images/fish/default-fish.svg' : src;

  return (
    <div className={cn('relative overflow-hidden bg-gray-100 rounded-lg flex items-center justify-center', className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={cn('object-contain transition-opacity duration-300', isLoading ? 'opacity-0' : 'opacity-100')}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImageError(true);
          setIsLoading(false);
        }}
      />
    </div>
  );
}
