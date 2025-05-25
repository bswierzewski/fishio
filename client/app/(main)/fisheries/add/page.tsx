'use client';

import { useForm } from '@tanstack/react-form';
// Formularze zazwyczaj wymagają stanu po stronie klienta
import { ArrowLeft, ImagePlus, ListChecks, MapPin, Text } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { useCreateFishery, useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
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
  const { mutate, isPending } = useCreateFishery({
    mutation: {
      onSuccess: () => {
        toast.success('Łowisko zostało dodane.');
        router.push('/fisheries');
      },
      onError: (error: unknown) => {
        console.error('Błąd podczas dodawania łowiska:', error);
        let errorMsg = 'Nie udało się dodać łowiska. Spróbuj ponownie.';
        if (error && typeof error === 'object' && 'response' in error) {
          const response = error.response as { data?: { title?: string; errors?: Record<string, string[]> } };
          if (response.data?.title) {
            errorMsg = response.data.title;
          }
          // If there are specific field errors, you could potentially display them
          // For example, by setting them in a local state or directly on the form if the library supports it.
          // if (response.data?.errors) { /* ... */ }
        }
        toast.error(errorMsg);
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

  const handleSpeciesChange = (speciesId: number) => {
    const currentSpecies = form.getFieldValue('fishSpeciesIds') || [];
    const newSpecies = currentSpecies.includes(speciesId)
      ? currentSpecies.filter((id) => id !== speciesId)
      : [...currentSpecies, speciesId];
    form.setFieldValue('fishSpeciesIds', newSpecies);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/fisheries">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Listy Łowisk
          </Button>
        </Link>
        <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Dodaj Nowe Łowisko</h1>
        <div>{/* Pusty div dla wyrównania */}</div>
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
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6 hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    {selectedImagePreview ? (
                      <img
                        src={selectedImagePreview}
                        alt="Podgląd zdjęcia łowiska"
                        className="mx-auto h-32 w-auto rounded-md object-contain"
                      />
                    ) : (
                      <ImagePlus className={`mx-auto h-12 w-12 ${cardMutedTextColorClass}`} />
                    )}
                    <div className="flex text-sm text-muted-foreground">
                      <label
                        htmlFor="fishery-photo-input"
                        className="relative cursor-pointer rounded-md bg-card font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-card hover:text-primary/80"
                      >
                        <span>Załaduj plik</span>
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
                      <p className="pl-1">lub przeciągnij i upuść</p>
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
            {isPending ? 'Dodawanie...' : 'Dodaj Łowisko'}
          </Button>
        </div>
      </form>
    </div>
  );
}
