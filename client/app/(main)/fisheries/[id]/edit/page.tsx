'use client';

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, FileText, Fish, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetFisheryById, useUpdateExistingFishery } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import type { FishSpeciesDto, UpdateFisheryCommand } from '@/lib/api/models';

import type { ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FishImage } from '@/components/ui/fish-image';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function EditFisheryPage() {
  const router = useRouter();
  const params = useParams();
  const fisheryId = parseInt(params.id as string, 10);
  const queryClient = useQueryClient();

  const [removeCurrentImageFlag, setRemoveCurrentImageFlag] = useState(false);

  const { data: fishery, isLoading: isLoadingFishery } = useGetFisheryById(fisheryId);
  const { data: fishSpecies, isLoading: isLoadingSpecies } = useGetAllFishSpecies();
  const { mutate, isPending } = useUpdateExistingFishery({
    mutation: {
      onSuccess: () => {
        toast.success('Łowisko zostało zaktualizowane pomyślnie!');
        queryClient.invalidateQueries({ queryKey: ['/api/fisheries'] });
        queryClient.invalidateQueries({ queryKey: [`/api/fisheries/${fisheryId}`] });
        router.push('/fisheries');
      },
      onError: (error) => {
        console.error('Error updating fishery:', error);
        toast.error('Nie udało się zaktualizować łowiska');
      }
    }
  });

  const form = useForm({
    defaultValues: {
      id: fisheryId,
      name: '',
      location: '',
      fishSpeciesIds: [] as number[],
      imageUrl: null as string | null,
      imagePublicId: null as string | null,
      removeCurrentImage: false
    } as UpdateFisheryCommand,
    onSubmit: async ({ value }) => {
      const payload = {
        ...value,
        removeCurrentImage: removeCurrentImageFlag
      };
      mutate({ id: fisheryId, data: payload });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Partial<Record<keyof UpdateFisheryCommand, string>> = {};
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

  // Initialize form with fishery data
  useEffect(() => {
    if (fishery) {
      form.setFieldValue('name', fishery.name || '');
      form.setFieldValue('location', fishery.location || '');
      form.setFieldValue(
        'fishSpeciesIds',
        fishery.fishSpecies?.map((species) => species.id!).filter((id) => id !== undefined) || []
      );
      setRemoveCurrentImageFlag(false);
    }
  }, [fishery]);

  const handleImageChange = useCallback((result: ImageUploadResult | null) => {
    if (result) {
      form.setFieldValue('imageUrl', result.imageUrl);
      form.setFieldValue('imagePublicId', result.imagePublicId);
      setRemoveCurrentImageFlag(false);
    } else {
      form.setFieldValue('imageUrl', null);
      form.setFieldValue('imagePublicId', null);
      setRemoveCurrentImageFlag(true);
    }
  }, []);

  const handleSpeciesChange = useCallback((speciesId: number) => {
    const currentSpecies = form.getFieldValue('fishSpeciesIds') || [];
    const newSpecies = currentSpecies.includes(speciesId)
      ? currentSpecies.filter((id) => id !== speciesId)
      : [...currentSpecies, speciesId];
    form.setFieldValue('fishSpeciesIds', newSpecies);
  }, []);

  // Loading state
  if (isLoadingFishery) {
    return (
      <div className="space-y-6">
        <PageHeader onBack={() => router.push('/fisheries')} />
        <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!fishery) {
    return (
      <div className="space-y-6">
        <PageHeader onBack={() => router.push('/fisheries')} />
        <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass}`}>
          <p className={cardMutedTextColorClass}>Nie udało się załadować danych łowiska.</p>
        </div>
      </div>
    );
  }

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
        <ImageUpload
          id="fishery-photo-input"
          label="Zdjęcie Łowiska (Opcjonalne)"
          currentImageUrl={fishery.imageUrl}
          folderName="fisheries"
          onImageChange={handleImageChange}
        />

        {/* --- Przycisk Submit --- */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isPending}
          >
            {isPending ? 'Zapisywanie...' : 'Zapisz Zmiany'}
          </Button>
        </div>
      </form>
    </div>
  );
}
