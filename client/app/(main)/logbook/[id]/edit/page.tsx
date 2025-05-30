'use client';

import { formatDateTimeLocal, parseLocalDateTime } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Fish, ImagePlus, MapPin, Ruler, StickyNote, Weight, X } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import {
  getGetLogbookEntryDetailsByIdQueryKey,
  useGetLogbookEntryDetailsById,
  useUpdateExistingLogbookEntry
} from '@/lib/api/endpoints/logbook';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import {
  HttpValidationProblemDetails,
  LogbookEntryDto,
  ProblemDetails,
  UpdateLogbookEntryCommand
} from '@/lib/api/models';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function EditLogbookEntryPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const entryId = params.id as string;

  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [initialImageUrl, setInitialImageUrl] = useState<string | null>(null);
  const [removeCurrentImageFlag, setRemoveCurrentImageFlag] = useState(false);

  const [fishSpeciesId, setFishSpeciesId] = useState<string | undefined>(undefined);

  const {
    data: logbookEntry,
    isLoading: isLoadingEntry,
    error: errorLoadingEntry
  } = useGetLogbookEntryDetailsById(Number(entryId), {
    query: { enabled: !!entryId }
  });

  const { data: fisheries } = useGetAllFisheries({ PageNumber: 1, PageSize: 100 });
  const { data: fishSpecies } = useGetAllFishSpecies();
  const { mutate: updateLogbookEntry, isPending: isUpdatingEntry } = useUpdateExistingLogbookEntry();

  const [lengthCm, setLengthCm] = useState<number | undefined>(undefined);
  const [weightKg, setWeightKg] = useState<number | undefined>(undefined);
  const [caughtAt, setCaughtAt] = useState('');
  const [fisheryId, setFisheryId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (logbookEntry) {
      setFishSpeciesId(logbookEntry.fishSpeciesId?.toString() ?? undefined);
      setLengthCm(logbookEntry.lengthInCm ?? undefined);
      setWeightKg(logbookEntry.weightInKg ?? undefined);
      setCaughtAt(logbookEntry.catchTime ? formatDateTimeLocal(new Date(logbookEntry.catchTime)) : '');
      setFisheryId(logbookEntry.fisheryId?.toString() ?? undefined);
      setNotes(logbookEntry.notes || '');
      if (logbookEntry.imageUrl) {
        setInitialImageUrl(logbookEntry.imageUrl);
        setSelectedImagePreview(logbookEntry.imageUrl);
      }
      setRemoveCurrentImageFlag(false);
    }
  }, [logbookEntry]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImagePreview(URL.createObjectURL(file));
      setSelectedImageFile(file);
      setRemoveCurrentImageFlag(false);
    } else {
      setSelectedImagePreview(initialImageUrl);
      setSelectedImageFile(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImagePreview(null);
    setSelectedImageFile(null);
    setRemoveCurrentImageFlag(true);
  };

  const handleRemoveImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemoveImage();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!entryId) {
      toast.error('Błąd: ID wpisu jest nieznane.');
      return;
    }

    // Validate that an image is present (either existing or newly uploaded)
    if (!selectedImagePreview && !selectedImageFile) {
      toast.error('Zdjęcie ryby jest wymagane.');
      return;
    }

    const updateCommand: UpdateLogbookEntryCommand = {
      id: Number(entryId),
      lengthInCm: lengthCm,
      weightInKg: weightKg,
      catchTime: caughtAt ? parseLocalDateTime(caughtAt) : null,
      fishSpeciesId: fishSpeciesId && fishSpeciesId !== 'none' ? Number(fishSpeciesId) : null,
      fisheryId: fisheryId ? Number(fisheryId) : null,
      notes: notes || null,
      removeCurrentImage: removeCurrentImageFlag,
      image: selectedImageFile
    };

    updateLogbookEntry(
      { id: Number(entryId), data: updateCommand },
      {
        onSuccess: () => {
          toast.success('Wpis w dzienniku został pomyślnie zaktualizowany!');
          queryClient.invalidateQueries({
            queryKey: ['/api/logbook']
          });
          queryClient.invalidateQueries({
            queryKey: getGetLogbookEntryDetailsByIdQueryKey(Number(entryId))
          });
          router.push('/logbook');
        },
        onError: (error: HttpValidationProblemDetails | ProblemDetails) => {
          console.error('Error updating logbook entry:', error);
          // Don't show manual error toast - let the axios interceptor handle it
          // The interceptor will show user-friendly validation errors automatically
        }
      }
    );
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
      if ('title' in error && typeof error.title === 'string') return error.title;
      if ('detail' in error && typeof error.detail === 'string') return error.detail;
      if ('message' in error && typeof error.message === 'string') return error.message;
    }
    return 'Wystąpił nieoczekiwany błąd.';
  };

  if (isLoadingEntry) return <p className="text-center py-10">Ładowanie danych wpisu...</p>;
  if (errorLoadingEntry)
    return (
      <p className="text-center py-10 text-destructive">Błąd ładowania danych: {getErrorMessage(errorLoadingEntry)}</p>
    );
  if (!logbookEntry && !isLoadingEntry)
    return <p className="text-center py-10">Nie znaleziono wpisu o ID: {entryId}.</p>;

  return (
    <div className="space-y-6 pb-16">
      <form
        onSubmit={handleSubmit}
        className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}
      >
        <div>
          <Label
            htmlFor="catch-photo-input"
            className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-2`}
          >
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

        <div>
          <Label htmlFor="species" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <Fish className="mr-2 h-5 w-5" /> Gatunek
          </Label>
          {fishSpecies ? (
            <Select
              key={fishSpeciesId || 'select-species-placeholder'}
              name="species"
              value={fishSpeciesId || 'none'}
              onValueChange={(value) => setFishSpeciesId(value === 'none' ? undefined : value)}
            >
              <SelectTrigger className="w-full bg-input border-border">
                <SelectValue placeholder="Wybierz gatunek ryby..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">Nie wybrano</SelectItem>
                {fishSpecies.map((species) => (
                  <SelectItem key={species.id} value={species?.id?.toString() ?? ''}>
                    {species.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input disabled placeholder="Ładowanie listy gatunków..." className="bg-input border-border" />
          )}
        </div>

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
              className="bg-input border-border"
              value={lengthCm ?? ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => setLengthCm(e.target.value ? parseFloat(e.target.value) : undefined)}
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
              className="bg-input border-border"
              value={weightKg ?? ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => setWeightKg(e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="catch-time" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <Calendar className="mr-2 h-5 w-5" /> Data i Czas Połowu (Wymagane)
          </Label>
          <Input
            id="catch-time"
            name="catch-time"
            type="datetime-local"
            className="bg-input border-border"
            value={caughtAt}
            onChange={(e) => setCaughtAt(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="fishery" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <MapPin className="mr-2 h-5 w-5" /> Łowisko (Opcjonalne)
          </Label>
          {fisheries?.items ? (
            <Select
              key={fisheryId || 'select-fishery-placeholder'}
              name="fishery"
              value={fisheryId || 'none'}
              onValueChange={(value) => setFisheryId(value === 'none' ? undefined : value)}
            >
              <SelectTrigger className="w-full bg-input border-border">
                <SelectValue placeholder="Wybierz łowisko z listy..." />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">Brak / Nieokreślone</SelectItem>
                {fisheries.items.map((f) => (
                  <SelectItem key={f.id} value={f.id?.toString() ?? ''}>
                    {f.name} {f.location ? `(${f.location})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input disabled placeholder="Ładowanie listy łowisk..." className="bg-input border-border" />
          )}
        </div>

        <div>
          <Label htmlFor="notes" className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
            <StickyNote className="mr-2 h-5 w-5" /> Notatki (Opcjonalne)
          </Label>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Dodatkowe informacje o połowie, przynęta, pogoda..."
            className="bg-input border-border min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" disabled={isUpdatingEntry || isLoadingEntry}>
            {isUpdatingEntry ? 'Aktualizowanie wpisu...' : 'Zapisz Zmiany'}
          </Button>
        </div>
      </form>
    </div>
  );
}
