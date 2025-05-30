'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Fish, ImagePlus, MapPin, Ruler, StickyNote, Weight, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import { getGetCurrentUserLogbookEntriesQueryKey, useCreateNewLogbookEntry } from '@/lib/api/endpoints/logbook';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import { CreateLogbookEntryCommand, HttpValidationProblemDetails, ProblemDetails } from '@/lib/api/models';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function AddLogbookEntryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const preselectedFisheryId = searchParams.get('fisheryId');
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const { data: fisheries } = useGetAllFisheries({ PageNumber: 1, PageSize: 20 });
  const { data: fishSpecies } = useGetAllFishSpecies();
  const { mutate: createNewLogbookEntry, isPending: isCreatingEntry } = useCreateNewLogbookEntry();

  // Symulacja obsługi zmiany pliku
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImagePreview(URL.createObjectURL(file));
      setSelectedImage(file);
      // W przyszłości: logika uploadu pliku
    } else {
      setSelectedImagePreview(null);
      setSelectedImage(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImagePreview(null);
    setSelectedImage(null);
    // Reset the file input
    const fileInput = document.getElementById('catch-photo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemoveImage();
  };

  // Symulacja wysłania formularza
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Validate that an image is selected
    if (!selectedImage) {
      toast.error('Zdjęcie ryby jest wymagane.');
      return;
    }

    const formData = new FormData(event.currentTarget);
    const command: CreateLogbookEntryCommand = {
      image: selectedImage,
      lengthInCm: formData.get('length') ? parseFloat(formData.get('length') as string) : undefined,
      weightInKg: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
      catchTime: formData.get('catch-time')
        ? new Date(formData.get('catch-time') as string).toISOString()
        : new Date().toISOString(),
      fishSpeciesId:
        formData.get('species') && formData.get('species') !== 'none'
          ? Number(formData.get('species') as string)
          : undefined,
      fisheryId:
        formData.get('fishery') && formData.get('fishery') !== 'none'
          ? Number(formData.get('fishery') as string)
          : undefined,
      notes: (formData.get('notes') as string) || undefined
    };

    createNewLogbookEntry(
      { data: command },
      {
        onSuccess: () => {
          toast.success('Nowy połów został pomyślnie dodany do dziennika!');
          queryClient.invalidateQueries({
            queryKey: [getGetCurrentUserLogbookEntriesQueryKey({ PageNumber: 1, PageSize: 20 })]
          });
          router.push('/logbook');
        },
        onError: (error: HttpValidationProblemDetails | ProblemDetails | Error) => {
          console.error('Error creating new logbook entry:', error);
          // Don't show manual error toast - let the axios interceptor handle it
          // The interceptor will show user-friendly validation errors automatically
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}
      >
        {/* --- Sekcja Zdjęcia --- */}
        <div>
          <Label htmlFor="catch-photo" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-2`}>
            <ImagePlus className="mr-2 h-5 w-5" /> Zdjęcie Ryby (Wymagane)
          </Label>
          <label
            htmlFor="catch-photo-input"
            className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6 hover:border-primary transition-colors cursor-pointer"
          >
            <div className="space-y-1 text-center">
              {selectedImagePreview ? (
                <div className="relative">
                  <img
                    src={selectedImagePreview}
                    alt="Podgląd zdjęcia"
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
              <div className="flex text-sm text-muted-foreground justify-center">
                <span className="font-medium text-primary">
                  {selectedImagePreview ? 'Zmień zdjęcie' : 'Załaduj plik'}
                </span>
                {!selectedImagePreview && <p className="pl-1">lub przeciągnij i upuść</p>}
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, GIF do 10MB</p>
            </div>
            <input
              id="catch-photo-input"
              name="catch-photo"
              type="file"
              className="sr-only"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* --- Sekcja Gatunek --- */}
        <div>
          <Label htmlFor="species" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <Fish className="mr-2 h-5 w-5" /> Gatunek
          </Label>
          <Select name="species">
            <SelectTrigger className="w-full bg-card border-border">
              <SelectValue placeholder="Wybierz gatunek ryby..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="none">Nie wybrano</SelectItem>
              {fishSpecies?.map((species) => (
                <SelectItem key={species.id} value={species?.id?.toString() ?? ''}>
                  {species.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- Sekcja Wymiary --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="length" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
              <Ruler className="mr-2 h-5 w-5" /> Długość (cm)
            </Label>
            <Input
              id="length"
              name="length"
              type="number"
              step="0.1"
              placeholder="Np. 55.5"
              className="bg-card border-border"
            />
          </div>
          <div>
            <Label htmlFor="weight" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
              <Weight className="mr-2 h-5 w-5" /> Waga (kg)
            </Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              step="0.01"
              placeholder="Np. 2.75"
              className="bg-card border-border"
            />
          </div>
        </div>

        {/* --- Sekcja Data i Czas --- */}
        <div>
          <Label htmlFor="catch-time" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <Calendar className="mr-2 h-5 w-5" /> Data i Czas Połowu (Wymagane)
          </Label>
          {/* W przyszłości: komponent DatePicker z shadcn/ui */}
          <Input
            id="catch-time"
            name="catch-time"
            type="datetime-local"
            className="bg-card border-border"
            defaultValue={new Date().toISOString().substring(0, 16)}
            required
          />
        </div>

        {/* --- Sekcja Łowisko --- */}
        <div>
          <Label htmlFor="fishery" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <MapPin className="mr-2 h-5 w-5" /> Łowisko (Opcjonalne)
          </Label>
          <Select name="fishery" defaultValue={preselectedFisheryId || undefined}>
            <SelectTrigger className="w-full bg-card border-border">
              <SelectValue placeholder="Wybierz łowisko z listy..." />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="none">Brak / Nieokreślone</SelectItem>
              {fisheries?.items?.map((fishery) => (
                <SelectItem key={fishery.id} value={fishery?.id?.toString() ?? ''}>
                  {fishery.name} ({fishery.location})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* --- Sekcja Notatki --- */}
        <div>
          <Label htmlFor="notes" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <StickyNote className="mr-2 h-5 w-5" /> Notatki (Opcjonalne)
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Dodatkowe informacje o połowie, przynęta, pogoda..."
            className="bg-card border-border min-h-[80px]"
          />
        </div>

        {/* --- Przycisk Zapisu --- */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isCreatingEntry}
          >
            {isCreatingEntry ? 'Zapisywanie połowu...' : 'Zapisz Połów w Dzienniku'}
          </Button>
        </div>
      </form>
    </div>
  );
}
