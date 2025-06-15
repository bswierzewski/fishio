'use client';

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, FileText, Fish, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useApiError } from '@/hooks/use-api-error';
import { useCreateFishery } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import type { CreateFisheryCommand, FishSpeciesDto } from '@/lib/api/models';

import { type DeferredImageData, type ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FishImage } from '@/components/ui/fish-image';
import { DeferredImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function AddFisheryPage() {
  const router = useRouter();
  const { data: fishSpecies, isLoading: isLoadingSpecies } = useGetAllFishSpecies();
  const queryClient = useQueryClient();

  // API error handling
  const { handleError } = useApiError();

  const [selectedImageData, setSelectedImageData] = useState<DeferredImageData | null>(null);
  const [uploadImageFunction, setUploadImageFunction] = useState<(() => Promise<ImageUploadResult | null>) | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { mutate, isPending } = useCreateFishery({
    mutation: {
      onSuccess: () => {
        toast.success('Łowisko zostało utworzone pomyślnie!');
        queryClient.invalidateQueries({ queryKey: ['/api/fisheries'] });
        router.push('/fisheries');
      },
      onError: (error) => {
        console.error('Error creating fishery:', error);
        handleError(error);
      }
    }
  });

  const form = useForm({
    defaultValues: {
      name: '',
      location: '',
      description: '',
      fishSpeciesIds: [] as number[]
    },
    onSubmit: async ({ value }) => {
      // First upload the image if one is selected
      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;

      if (selectedImageData && uploadImageFunction) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadImageFunction();
          if (!uploadResult) {
            handleError(new Error('Failed to upload image'));
            return;
          }
          imageUrl = uploadResult.imageUrl;
          imagePublicId = uploadResult.imagePublicId;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const command: CreateFisheryCommand = {
        ...value,
        imageUrl,
        imagePublicId
      };

      mutate({ data: command });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Partial<Record<keyof CreateFisheryCommand, string>> = {};
        if (!value.name || String(value.name).trim().length === 0) {
          errors.name = 'Nazwa łowiska jest wymagana.';
        }
        if (!value.location || String(value.location).trim().length === 0) {
          errors.location = 'Lokalizacja jest wymagana.';
        }
        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      }
    }
  });

  const handleSpeciesChange = useCallback((speciesId: number) => {
    const currentSpecies = form.getFieldValue('fishSpeciesIds') || [];
    const newSpecies = currentSpecies.includes(speciesId)
      ? currentSpecies.filter((id) => id !== speciesId)
      : [...currentSpecies, speciesId];
    form.setFieldValue('fishSpeciesIds', newSpecies);
  }, []);

  const isSubmitting = isPending || isUploadingImage;

  return (
    <div className="space-y-6">
      <PageHeader onBack={() => router.push('/fisheries')} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}
      >
        {/* --- Sekcja Nazwa Łowiska --- */}
        <div>
          <form.Field name="name">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <MapPin className="mr-2 h-5 w-5" /> Nazwa Łowiska (Wymagane)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Np. Jezioro Słoneczne, Rzeka Wędkarska"
                  className="bg-card border-border"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Sekcja Lokalizacja --- */}
        <div>
          <form.Field name="location">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <MapPin className="mr-2 h-5 w-5" /> Lokalizacja (Wymagane)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Np. Warszawa, ul. Rybacka 123"
                  className="bg-card border-border"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Sekcja Opis --- */}
        <div>
          <form.Field name="description">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <FileText className="mr-2 h-5 w-5" /> Opis Łowiska (Opcjonalne)
                </Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Opisz łowisko, jego charakterystykę, dostępne udogodnienia..."
                  className="bg-card border-border min-h-[100px]"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Sekcja Gatunki Ryb --- */}
        <div>
          <form.Field name="fishSpeciesIds">
            {(field) => (
              <>
                <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-3`}>
                  <Fish className="mr-2 h-5 w-5" /> Gatunki Ryb (Opcjonalne)
                </Label>
                <div className="border border-border rounded-lg p-4 bg-card">
                  {isLoadingSpecies ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-pulse flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <span className={cardMutedTextColorClass}>Ładowanie gatunków...</span>
                      </div>
                    </div>
                  ) : fishSpecies && fishSpecies.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {fishSpecies.map((species: FishSpeciesDto) => {
                          const isSelected = (field.state.value || []).includes(species.id!);
                          return (
                            <div
                              key={species.id}
                              className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                isSelected
                                  ? 'border-primary bg-primary/5 shadow-sm'
                                  : 'border-border bg-card hover:border-primary/50'
                              }`}
                              onClick={() => handleSpeciesChange(species.id!)}
                            >
                              <div className="flex items-center space-x-3">
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    isSelected ? 'bg-primary border-primary' : 'border-border bg-background'
                                  }`}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                </div>
                                <div className="flex-shrink-0 flex items-center">
                                  <FishImage
                                    src={species.imageUrl}
                                    alt={species.name || 'Ryba'}
                                    className="w-12 h-12 rounded-md"
                                    width={48}
                                    height={48}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <Label
                                    htmlFor={`species-${species.id}`}
                                    className={`text-sm font-medium cursor-pointer block truncate ${
                                      isSelected ? 'text-primary' : cardTextColorClass
                                    }`}
                                  >
                                    {species.name}
                                  </Label>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className={`text-xs ${cardMutedTextColorClass}`}>
                          Zaznacz gatunki występujące na tym łowisku. Wybrano: {(field.state.value || []).length} z{' '}
                          {fishSpecies.length}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Fish className={`mx-auto h-12 w-12 ${cardMutedTextColorClass} mb-2`} />
                      <p className={`${cardMutedTextColorClass}`}>Brak dostępnych gatunków</p>
                    </div>
                  )}
                </div>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Sekcja Zdjęcia Łowiska (Opcjonalne) --- */}
        <div>
          <DeferredImageUpload
            id="fishery-photo-input"
            label="Zdjęcie Łowiska (Opcjonalne)"
            folderName="fisheries"
            onImageSelect={(imageData) => {
              setSelectedImageData(imageData);
            }}
            onUploadReady={(uploadFn) => {
              setUploadImageFunction(() => uploadFn);
            }}
          />
        </div>

        {/* --- Przycisk Submit --- */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isUploadingImage ? 'Przesyłanie zdjęcia...' : isPending ? 'Dodawanie...' : 'Dodaj Łowisko'}
          </Button>
        </div>
      </form>
    </div>
  );
}
