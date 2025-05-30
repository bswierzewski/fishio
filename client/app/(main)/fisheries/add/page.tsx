'use client';

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
// Formularze zazwyczaj wymagają stanu po stronie klienta
import { ArrowLeft, ImagePlus, ListChecks, MapPin, Text, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { getGetAllFisheriesQueryKey, useCreateFishery, useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import { CreateFisheryCommand, FishSpeciesDto } from '@/lib/api/models';

import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Style (dopasuj do reszty aplikacji)
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function AddFisheryPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useCreateFishery({
    mutation: {
      onSuccess: () => {
        toast.success('Łowisko zostało dodane.');
        // Invalidate fisheries cache to refresh the list
        queryClient.invalidateQueries({
          queryKey: getGetAllFisheriesQueryKey({ PageNumber: 1, PageSize: 20 })
        });
        router.push('/fisheries');
      },
      onError: (error: unknown) => {
        console.error('Błąd podczas dodawania łowiska:', error);
        // Don't show manual error toast - let the axios interceptor handle it
        // The interceptor will show user-friendly validation errors automatically
      }
    }
  });

  // Fetch all species, assuming PageSize large enough or a mechanism to get all if available
  const {
    data: fishSpeciesPaginatedData,
    isLoading: isLoadingSpecies,
    isError: isErrorSpecies
  } = useGetAllFishSpecies();

  const form = useForm({
    defaultValues: {
      name: '',
      location: '',
      description: '',
      fishSpeciesIds: [] as number[],
      image: null as File | null
    } as CreateFisheryCommand,
    onSubmit: async ({ value }) => {
      mutate({ data: value });
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
        // Description is optional, so no validation here unless specified
        // Image is optional, so no validation here unless specified

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      }
    }
  });

  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImagePreview(URL.createObjectURL(file));
      // The `image` field in CreateFisheryCommand is `Blob | null`.
      // HTML input type="file" provides a `File` object, which is a specific type of Blob.
      form.setFieldValue('image', file);
    } else {
      setSelectedImagePreview(null);
      form.setFieldValue('image', null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImagePreview(null);
    form.setFieldValue('image', null);
    // Reset the file input
    const fileInput = document.getElementById('fishery-photo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemoveImage();
  };

  const handleSpeciesChange = (speciesId: number) => {
    const currentSpecies = form.getFieldValue('fishSpeciesIds') || [];
    const newSpecies = currentSpecies.includes(speciesId)
      ? currentSpecies.filter((id) => id !== speciesId)
      : [...currentSpecies, speciesId];
    form.setFieldValue('fishSpeciesIds', newSpecies);
  };

  return (
    <div className="space-y-6">
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

        {/* --- Sekcja Opis Łowiska --- */}
        <div>
          <form.Field name="description">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <Text className="mr-2 h-5 w-5" /> Opis Łowiska (Opcjonalne)
                </Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Dodaj krótki opis łowiska, np. charakterystyka, zasady, ciekawe miejsca."
                  className="bg-card border-border min-h-[80px]"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Sekcja Występujące Gatunki --- */}
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
                <label
                  htmlFor="fishery-photo-input"
                  className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6 hover:border-primary transition-colors cursor-pointer"
                >
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
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 hover:cursor-pointer"
                          onClick={handleRemoveImageClick}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <ImagePlus className={`mx-auto h-12 w-12 ${cardMutedTextColorClass}`} />
                    )}
                    <div className="flex text-sm text-muted-foreground">
                      <span className="font-medium text-primary">
                        {selectedImagePreview ? 'Zmień zdjęcie' : 'Załaduj plik'}
                      </span>
                      {!selectedImagePreview && <p className="pl-1">lub przeciągnij i upuść</p>}
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF do 10MB</p>
                  </div>
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
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* --- Przycisk Zapisu --- */}
        <div className="pt-2">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Dodawanie...' : 'Dodaj Łowisko'}
          </Button>
        </div>
      </form>
    </div>
  );
}
