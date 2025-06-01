'use client';

import { formatDateTimeLocal } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { ArrowLeft, Calendar, FileText, Fish, MapPin, Ruler, Weight } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import { useGetLogbookEntryDetailsById, useUpdateExistingLogbookEntry } from '@/lib/api/endpoints/logbook';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import type { FishSpeciesDto, UpdateLogbookEntryCommand } from '@/lib/api/models';

import type { ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function EditLogbookEntryPage() {
  const router = useRouter();
  const params = useParams();
  const entryId = params.id as string;

  const [removeCurrentImageFlag, setRemoveCurrentImageFlag] = useState(false);

  const {
    data: logbookEntry,
    isLoading: isLoadingEntry,
    error: errorLoadingEntry
  } = useGetLogbookEntryDetailsById(Number(entryId), {
    query: { enabled: !!entryId }
  });

  const { data: fisheries } = useGetAllFisheries({ PageNumber: 1, PageSize: 100 });
  const { data: fishSpecies } = useGetAllFishSpecies();
  const { mutate: updateLogbookEntry, isPending: isUpdatingEntry } = useUpdateExistingLogbookEntry({
    mutation: {
      onSuccess: () => {
        toast.success('Wpis został zaktualizowany pomyślnie!');
        router.push('/logbook');
      },
      onError: (error) => {
        console.error('Error updating logbook entry:', error);
        toast.error('Nie udało się zaktualizować wpisu');
      }
    }
  });

  const form = useForm({
    defaultValues: {
      imageUrl: null as string | null,
      imagePublicId: null as string | null,
      lengthInCm: '',
      weightInKg: '',
      catchTime: '',
      fishSpeciesId: '',
      fisheryId: '',
      notes: ''
    },
    onSubmit: async ({ value }) => {
      const command: UpdateLogbookEntryCommand = {
        id: Number(entryId),
        imageUrl: value.imageUrl,
        imagePublicId: value.imagePublicId,
        removeCurrentImage: removeCurrentImageFlag,
        catchTime: value.catchTime || null,
        lengthInCm: value.lengthInCm ? parseFloat(value.lengthInCm) : null,
        weightInKg: value.weightInKg ? parseFloat(value.weightInKg) : null,
        notes: value.notes || null,
        fishSpeciesId: value.fishSpeciesId ? parseInt(value.fishSpeciesId) : null,
        fisheryId: value.fisheryId ? parseInt(value.fisheryId) : null
      };

      updateLogbookEntry({ id: Number(entryId), data: command });
    }
  });

  useEffect(() => {
    if (logbookEntry) {
      form.setFieldValue('imageUrl', logbookEntry.imageUrl || null);
      form.setFieldValue('imagePublicId', null); // We don't have this from the response
      form.setFieldValue('lengthInCm', logbookEntry.lengthInCm?.toString() ?? '');
      form.setFieldValue('weightInKg', logbookEntry.weightInKg?.toString() ?? '');
      form.setFieldValue(
        'catchTime',
        logbookEntry.catchTime ? formatDateTimeLocal(new Date(logbookEntry.catchTime)) : ''
      );
      form.setFieldValue('fishSpeciesId', logbookEntry.fishSpeciesId?.toString() ?? '');
      form.setFieldValue('fisheryId', logbookEntry.fisheryId?.toString() ?? '');
      form.setFieldValue('notes', logbookEntry.notes || '');
      setRemoveCurrentImageFlag(false);
    }
  }, [logbookEntry, form]);

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

  if (isLoadingEntry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-8 w-64" />
          <div />
        </div>
        <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}>
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (errorLoadingEntry || !logbookEntry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/logbook">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Dziennika
            </Button>
          </Link>
          <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Wpis nie znaleziony</h1>
          <div></div>
        </div>
        <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass}`}>
          <p className={cardMutedTextColorClass}>Nie udało się załadować wpisu z dziennika.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <Link href="/logbook">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Dziennika
          </Button>
        </Link>
        <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Edytuj Wpis</h1>
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
        {/* Image Upload */}
        <ImageUpload
          id="catch-photo-input"
          label="Zdjęcie Ryby (Wymagane)"
          required
          currentImageUrl={logbookEntry.imageUrl}
          folderName="logbook"
          onImageChange={handleImageChange}
        />

        {/* Fish Species */}
        <div>
          <form.Field name="fishSpeciesId">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <Fish className="mr-2 h-5 w-5" /> Gatunek
                </Label>
                <Select value={field.state.value || undefined} onValueChange={(value) => field.handleChange(value)}>
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Wybierz gatunek ryby..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {fishSpecies?.map((species: FishSpeciesDto) => (
                      <SelectItem key={species.id} value={species?.id?.toString() ?? ''}>
                        {species.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Measurements */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <form.Field name="lengthInCm">
              {(field) => (
                <>
                  <Label
                    htmlFor={field.name}
                    className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                  >
                    <Ruler className="mr-2 h-5 w-5" /> Długość (cm)
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="0.1"
                    placeholder="np. 25.5"
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-card border-border"
                  />
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>
          <div>
            <form.Field name="weightInKg">
              {(field) => (
                <>
                  <Label
                    htmlFor={field.name}
                    className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                  >
                    <Weight className="mr-2 h-5 w-5" /> Waga (kg)
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    step="0.01"
                    placeholder="np. 1.25"
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="bg-card border-border"
                  />
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>
        </div>

        {/* Catch Time */}
        <div>
          <form.Field name="catchTime">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <Calendar className="mr-2 h-5 w-5" /> Czas Połowu
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-card border-border"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Fishery */}
        <div>
          <form.Field name="fisheryId">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <MapPin className="mr-2 h-5 w-5" /> Łowisko
                </Label>
                <Select value={field.state.value || undefined} onValueChange={(value) => field.handleChange(value)}>
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Wybierz łowisko..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {fisheries?.items?.map((fishery) => (
                      <SelectItem key={fishery.id} value={fishery?.id?.toString() ?? ''}>
                        {fishery.name} - {fishery.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Notes */}
        <div>
          <form.Field name="notes">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <FileText className="mr-2 h-5 w-5" /> Notatki
                </Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Dodaj notatki o połowie..."
                  value={field.state.value || ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-card border-border min-h-[100px]"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isUpdatingEntry}
          >
            {isUpdatingEntry ? 'Zapisywanie...' : 'Zapisz Zmiany'}
          </Button>
        </div>
      </form>
    </div>
  );
}
