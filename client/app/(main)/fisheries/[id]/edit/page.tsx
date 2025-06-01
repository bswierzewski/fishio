'use client';

import { useForm } from '@tanstack/react-form';
import { ArrowLeft, FileText, Fish, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetFisheryById, useUpdateExistingFishery } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import type { FishSpeciesDto, UpdateFisheryCommand } from '@/lib/api/models';

import type { ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  const fisheryId = parseInt(params.id as string);

  const { data: fishery, isLoading: isLoadingFishery } = useGetFisheryById(fisheryId);
  const { data: fishSpecies, isLoading: isLoadingSpecies } = useGetAllFishSpecies();
  const { mutate, isPending } = useUpdateExistingFishery({
    mutation: {
      onSuccess: () => {
        toast.success('Łowisko zostało zaktualizowane pomyślnie!');
        router.push('/fisheries');
      },
      onError: (error) => {
        console.error('Error updating fishery:', error);
        toast.error('Nie udało się zaktualizować łowiska');
      }
    }
  });

  const [removeCurrentImageFlag, setRemoveCurrentImageFlag] = useState(false);

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
      const updateData = {
        ...value,
        removeCurrentImage: removeCurrentImageFlag
      };
      mutate({ id: fisheryId, data: updateData });
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
  }, [fishery, form]);

  const handleImageChange = (result: ImageUploadResult | null) => {
    if (result) {
      form.setFieldValue('imageUrl', result.imageUrl);
      form.setFieldValue('imagePublicId', result.imagePublicId);
      setRemoveCurrentImageFlag(false);
    } else {
      form.setFieldValue('imageUrl', null);
      form.setFieldValue('imagePublicId', null);
      setRemoveCurrentImageFlag(true);
    }
  };

  const handleSpeciesChange = (speciesId: number) => {
    const currentSpecies = form.getFieldValue('fishSpeciesIds') || [];
    const newSpecies = currentSpecies.includes(speciesId)
      ? currentSpecies.filter((id) => id !== speciesId)
      : [...currentSpecies, speciesId];
    form.setFieldValue('fishSpeciesIds', newSpecies);
  };

  // Loading state
  if (isLoadingFishery) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-64" />
          <div />
        </div>
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
        <div className="flex items-center justify-between">
          <Link href="/fisheries">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Listy Łowisk
            </Button>
          </Link>
          <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Łowisko nie znalezione</h1>
          <div></div>
        </div>
        <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass}`}>
          <p className={cardMutedTextColorClass}>Nie udało się załadować danych łowiska.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/fisheries">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Listy Łowisk
          </Button>
        </Link>
        <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Edytuj Łowisko</h1>
        <div></div>
      </div>

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
                <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-2`}>
                  <Fish className="mr-2 h-5 w-5" /> Gatunki Ryb (Opcjonalne)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-border rounded-md p-3 bg-card">
                  {isLoadingSpecies ? (
                    <p className={`col-span-full text-center ${cardMutedTextColorClass}`}>Ładowanie gatunków...</p>
                  ) : fishSpecies && fishSpecies.length > 0 ? (
                    fishSpecies.map((species: FishSpeciesDto) => (
                      <div key={species.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`species-${species.id}`}
                          checked={(field.state.value || []).includes(species.id!)}
                          onCheckedChange={() => handleSpeciesChange(species.id!)}
                        />
                        <Label
                          htmlFor={`species-${species.id}`}
                          className={`text-sm cursor-pointer ${cardTextColorClass}`}
                        >
                          {species.name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className={`col-span-full text-center ${cardMutedTextColorClass}`}>Brak dostępnych gatunków</p>
                  )}
                </div>
                <p className={`text-xs mt-1 ${cardMutedTextColorClass}`}>Zaznacz gatunki występujące na tym łowisku.</p>
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
