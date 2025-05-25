'use client';

import { useForm } from '@tanstack/react-form';
import { ArrowLeft, ImagePlus, ListChecks, MapPin, Text, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { useGetFisheryById, useUpdateExistingFishery } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import { FishSpeciesDto, UpdateFisheryCommand } from '@/lib/api/models';

import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

// Style classes
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function EditFisheryPage() {
  const router = useRouter();
  const params = useParams();
  const fisheryId = Number(params.id);

  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [removeCurrentImageFlag, setRemoveCurrentImageFlag] = useState(false);

  // Fetch fishery data
  const {
    data: fishery,
    isLoading: isLoadingFishery,
    error: fisheryError
  } = useGetFisheryById(fisheryId, {
    query: { enabled: !!fisheryId }
  });

  // Fetch fish species
  const {
    data: fishSpeciesPaginatedData,
    isLoading: isLoadingSpecies,
    isError: isErrorSpecies
  } = useGetAllFishSpecies();

  // Update mutation
  const { mutate, isPending } = useUpdateExistingFishery({
    mutation: {
      onSuccess: () => {
        toast.success('Łowisko zostało zaktualizowane.');
        router.push(`/fisheries/${fisheryId}`);
      },
      onError: (error: unknown) => {
        console.error('Błąd podczas aktualizacji łowiska:', error);
        let errorMsg = 'Nie udało się zaktualizować łowiska. Spróbuj ponownie.';
        if (error && typeof error === 'object' && 'response' in error) {
          const response = error.response as { data?: { title?: string; errors?: Record<string, string[]> } };
          if (response.data?.title) {
            errorMsg = response.data.title;
          }
        }
        toast.error(errorMsg);
      }
    }
  });

  const form = useForm({
    defaultValues: {
      id: fisheryId,
      name: '',
      location: '',
      fishSpeciesIds: [] as number[],
      image: null as File | null,
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

      if (fishery.imageUrl) {
        setInitialImageUrl(fishery.imageUrl);
        setSelectedImagePreview(fishery.imageUrl);
      }
      setRemoveCurrentImageFlag(false);
    }
  }, [fishery, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImagePreview(URL.createObjectURL(file));
      form.setFieldValue('image', file);
      setRemoveCurrentImageFlag(false);
    } else {
      setSelectedImagePreview(initialImageUrl);
      form.setFieldValue('image', null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImagePreview(null);
    form.setFieldValue('image', null);
    setRemoveCurrentImageFlag(true);
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

  // Error state
  if (fisheryError || !fishery) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/fisheries">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Listy Łowisk
            </Button>
          </Link>
          <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Błąd</h1>
          <div />
        </div>
        <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} text-center`}>
          <p className="text-destructive">Nie udało się załadować danych łowiska.</p>
          <Link href="/fisheries" className="mt-4 inline-block">
            <Button>Wróć do Listy Łowisk</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href={`/fisheries/${fisheryId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Łowiska
          </Button>
        </Link>
        <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Edytuj Łowisko</h1>
        <Link href={`/fisheries/${fisheryId}`}>
          <Button variant="outline" size="sm">
            Anuluj
          </Button>
        </Link>
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
                  <MapPin className="mr-2 h-5 w-5 opacity-70" /> Lokalizacja (Wymagane)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Np. Miastowo, ul. Nadbrzeżna lub opis dojazdu"
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
                  <ListChecks className="mr-2 h-5 w-5" /> Występujące Gatunki (Opcjonalne)
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2 max-h-60 overflow-y-auto p-2 border border-border rounded-md bg-card">
                  {isLoadingSpecies && (
                    <p className={`col-span-full text-sm ${cardMutedTextColorClass}`}>Ładowanie gatunków...</p>
                  )}
                  {isErrorSpecies && (
                    <p className={`col-span-full text-sm text-destructive ${cardMutedTextColorClass}`}>
                      Nie udało się załadować gatunków ryb.
                    </p>
                  )}
                  {fishSpeciesPaginatedData && fishSpeciesPaginatedData.length === 0 && (
                    <p className={`col-span-full text-sm ${cardMutedTextColorClass}`}>Brak dostępnych gatunków ryb.</p>
                  )}
                  {fishSpeciesPaginatedData?.map((species: FishSpeciesDto) => (
                    <div key={species.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`species-${species.id}`}
                        checked={(field.state.value ?? []).includes(species.id!)}
                        onCheckedChange={() => handleSpeciesChange(species.id!)}
                        className="border-border data-[state=checked]:border-primary"
                      />
                      <Label htmlFor={`species-${species.id}`} className="text-sm font-normal cursor-pointer">
                        {species.name}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className={`text-xs mt-1 ${cardMutedTextColorClass}`}>Zaznacz gatunki występujące na tym łowisku.</p>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Sekcja Zdjęcia Łowiska (Opcjonalne) --- */}
        <div>
          <form.Field name="image">
            {(field) => (
              <>
                <Label
                  htmlFor="fishery-photo-input"
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-2`}
                >
                  <ImagePlus className="mr-2 h-5 w-5" /> Zdjęcie Łowiska (Opcjonalne)
                </Label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6 hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    {selectedImagePreview ? (
                      <div className="relative">
                        <img
                          src={selectedImagePreview}
                          alt="Podgląd zdjęcia łowiska"
                          className="mx-auto h-32 w-auto rounded-md object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <ImagePlus className={`mx-auto h-12 w-12 ${cardMutedTextColorClass}`} />
                    )}

                    <div className="flex text-sm text-muted-foreground justify-center">
                      <label
                        htmlFor="fishery-photo-input"
                        className="relative cursor-pointer rounded-md bg-card font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card hover:text-primary/80"
                      >
                        <span>{selectedImagePreview ? 'Zmień zdjęcie' : 'Załaduj plik'}</span>
                        <input
                          id="fishery-photo-input"
                          name={field.name}
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageChange}
                          onBlur={field.handleBlur}
                        />
                      </label>
                      {!selectedImagePreview && <p className="pl-1">lub przeciągnij i upuść</p>}
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF do 10MB</p>
                  </div>
                </div>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Przycisk Zapisu --- */}
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Aktualizowanie...' : 'Zaktualizuj Łowisko'}
          </Button>
        </div>
      </form>
    </div>
  );
}
