'use client';

import { formatDateTimeLocal } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, FileText, Fish, MapPin, Ruler, Weight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import { useCreateNewLogbookEntry } from '@/lib/api/endpoints/logbook';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import type { CreateLogbookEntryCommand, FishSpeciesDto } from '@/lib/api/models';

import { type DeferredImageData, type ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { DeferredImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function AddLogbookEntryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const preselectedFisheryId = searchParams.get('fisheryId');

  const [selectedImageData, setSelectedImageData] = useState<DeferredImageData | null>(null);
  const [showImageError, setShowImageError] = useState(false);
  const [uploadImageFunction, setUploadImageFunction] = useState<(() => Promise<ImageUploadResult | null>) | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: fisheries } = useGetAllFisheries({ PageNumber: 1, PageSize: 20 });
  const { data: fishSpecies } = useGetAllFishSpecies();
  const { mutate: createNewLogbookEntry, isPending: isCreatingEntry } = useCreateNewLogbookEntry({
    mutation: {
      onSuccess: () => {
        toast.success('Wpis został dodany do dziennika!');
        queryClient.invalidateQueries({
          queryKey: ['/api/logbook']
        });
        router.push('/logbook');
      },
      onError: (error) => {
        console.error('Error creating logbook entry:', error);
        toast.error('Nie udało się dodać wpisu do dziennika');
      }
    }
  });

  const form = useForm({
    defaultValues: {
      catchTime: formatDateTimeLocal(),
      lengthInCm: '',
      weightInKg: '',
      notes: '',
      fishSpeciesId: '',
      fisheryId: preselectedFisheryId || ''
    },
    onSubmit: async ({ value }) => {
      // Check if image is required and missing
      if (!selectedImageData) {
        setShowImageError(true);
        toast.error('Zdjęcie ryby jest wymagane');
        return;
      }

      setShowImageError(false);

      // First upload the image if one is selected
      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;

      if (selectedImageData && uploadImageFunction) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadImageFunction();
          if (!uploadResult) {
            toast.error('Nie udało się przesłać zdjęcia');
            return;
          }
          imageUrl = uploadResult.imageUrl;
          imagePublicId = uploadResult.imagePublicId;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const command: CreateLogbookEntryCommand = {
        imageUrl,
        imagePublicId,
        catchTime: value.catchTime || undefined,
        lengthInCm: value.lengthInCm ? parseFloat(value.lengthInCm) : undefined,
        weightInKg: value.weightInKg ? parseFloat(value.weightInKg) : undefined,
        notes: value.notes || undefined,
        fishSpeciesId: value.fishSpeciesId ? parseInt(value.fishSpeciesId) : undefined,
        fisheryId: value.fisheryId ? parseInt(value.fisheryId) : undefined
      };

      createNewLogbookEntry({ data: command });
    }
  });

  const isSubmitting = isCreatingEntry || isUploadingImage;

  return (
    <div className="space-y-6">
      <PageHeader onBack={() => router.push('/logbook')} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}
      >
        {/* --- Sekcja Zdjęcia --- */}
        <div>
          <DeferredImageUpload
            id="catch-photo-input"
            label="Zdjęcie Ryby (Wymagane)"
            required
            folderName="logbook"
            onImageSelect={(imageData) => {
              setSelectedImageData(imageData);
              if (imageData) {
                setShowImageError(false);
              }
            }}
            onUploadReady={(uploadFn) => {
              setUploadImageFunction(() => uploadFn);
            }}
          />
          {showImageError && <p className="text-destructive text-sm mt-1">Zdjęcie ryby jest wymagane.</p>}
        </div>

        {/* --- Sekcja Gatunek --- */}
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

        {/* --- Sekcja Wymiary --- */}
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

        {/* --- Sekcja Czas Połowu --- */}
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

        {/* --- Sekcja Łowisko --- */}
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

        {/* --- Sekcja Notatki --- */}
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

        {/* --- Przycisk Submit --- */}
        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isUploadingImage ? 'Przesyłanie zdjęcia...' : isCreatingEntry ? 'Dodawanie...' : 'Dodaj do Dziennika'}
          </Button>
        </div>
      </form>
    </div>
  );
}
