'use client';

import { formatDateTimeLocal, parseLocalDateTime } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, FileText, MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetCompetitionDetailsById, useUpdateExistingCompetition } from '@/lib/api/endpoints/competitions';
import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import type { CompetitionType, UpdateCompetitionCommand } from '@/lib/api/models';

import { type DeferredImageData, type ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { DeferredImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';

export default function EditCompetitionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState<DeferredImageData | null>(null);
  const [uploadImageFunction, setUploadImageFunction] = useState<(() => Promise<ImageUploadResult | null>) | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isImageMarkedForRemoval, setIsImageMarkedForRemoval] = useState(false);

  // Resolve params properly with useEffect
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        const numId = parseInt(resolvedParams.id, 10);

        if (!isNaN(numId)) {
          setCompetitionId(numId);
        }
        setParamsResolved(true);
      } catch (error) {
        setParamsResolved(true);
      }
    };

    resolveParams();
  }, [params]);

  // Fetch competition details
  const {
    data: competition,
    isLoading: isLoadingCompetition,
    error: competitionError
  } = useGetCompetitionDetailsById(competitionId || 0, {
    query: {
      enabled: !!competitionId && paramsResolved
    }
  });

  // Fetch fisheries for the dropdown
  const {
    data: fisheries,
    isLoading: isLoadingFisheries,
    error: fisheriesError
  } = useGetAllFisheries({ PageNumber: 1, PageSize: 100 });

  const { mutate: updateCompetition, isPending } = useUpdateExistingCompetition({
    mutation: {
      onSuccess: () => {
        toast.success('Zawody zostały zaktualizowane pomyślnie!');
        queryClient.invalidateQueries({ queryKey: ['competitions'] });
        queryClient.invalidateQueries({ queryKey: [`/api/competitions/${competitionId}`] });
        router.push(`/competitions/${competitionId}`);
      },
      onError: (error) => {
        console.error('Error updating competition:', error);
        toast.error('Nie udało się zaktualizować zawodów');
      }
    }
  });

  // Form setup
  const form = useForm({
    defaultValues: {
      id: 0,
      name: '',
      startTime: '',
      endTime: '',
      fisheryId: 0,
      rules: '',
      type: 'Public' as CompetitionType,
      imageUrl: null as string | null,
      imagePublicId: null as string | null,
      removeCurrentImage: false
    } as UpdateCompetitionCommand,
    onSubmit: async ({ value }) => {
      if (!competitionId) return;

      // First upload the image if one is selected
      let imageUrl: string | null = value.imageUrl || null;
      let imagePublicId: string | null = value.imagePublicId || null;
      let removeCurrentImage = value.removeCurrentImage;

      if (selectedImageData && uploadImageFunction) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadImageFunction();
          if (uploadResult) {
            imageUrl = uploadResult.imageUrl;
            imagePublicId = uploadResult.imagePublicId;
            removeCurrentImage = false; // Don't remove if we're adding a new image
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Nie udało się przesłać zdjęcia');
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const command: UpdateCompetitionCommand = {
        ...value,
        id: competitionId,
        startTime: value.startTime ? parseLocalDateTime(value.startTime) : undefined,
        endTime: value.endTime ? parseLocalDateTime(value.endTime) : undefined,
        imageUrl,
        imagePublicId,
        removeCurrentImage
      };

      updateCompetition({ id: competitionId, data: command });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Partial<Record<keyof UpdateCompetitionCommand, string>> = {};

        if (!value.name || String(value.name).trim().length === 0) {
          errors.name = 'Nazwa zawodów jest wymagana.';
        }

        if (!value.startTime) {
          errors.startTime = 'Data rozpoczęcia jest wymagana.';
        }

        if (!value.endTime) {
          errors.endTime = 'Data zakończenia jest wymagana.';
        }

        if (value.startTime && value.endTime && new Date(value.startTime) >= new Date(value.endTime)) {
          errors.endTime = 'Data zakończenia musi być późniejsza niż data rozpoczęcia.';
        }

        if (!value.fisheryId) {
          errors.fisheryId = 'Wybór łowiska jest wymagany.';
        }

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      }
    }
  });

  // Update form values when competition data is loaded
  useEffect(() => {
    if (competition) {
      form.setFieldValue('id', competition.id || 0);
      form.setFieldValue('name', competition.name || '');
      form.setFieldValue(
        'startTime',
        competition.startTime ? formatDateTimeLocal(new Date(competition.startTime)) : ''
      );
      form.setFieldValue('endTime', competition.endTime ? formatDateTimeLocal(new Date(competition.endTime)) : '');
      form.setFieldValue('fisheryId', competition.fisheryId || 0);
      form.setFieldValue('rules', competition.rules || '');
      form.setFieldValue('type', competition.type || 'Public');
      form.setFieldValue('imageUrl', competition.imageUrl);
      form.setFieldValue('imagePublicId', null);
      form.setFieldValue('removeCurrentImage', false);
    }
  }, [competition, form]);

  // Don't render anything until params are resolved
  if (!paramsResolved) {
    return <EditCompetitionSkeleton />;
  }

  // Check for invalid ID after params are resolved
  if (!competitionId) {
    notFound();
  }

  if (isLoadingCompetition || isLoadingFisheries) {
    return <EditCompetitionSkeleton />;
  }

  if (competitionError || !competition) {
    notFound();
  }

  const isSubmitting = isPending || isUploadingImage;

  return (
    <div className="space-y-6">
      <PageHeader onBack={() => router.push(`/competitions/${competitionId}`)} />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}
      >
        {/* Competition Name */}
        <div>
          <form.Field name="name">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <Trophy className="mr-2 h-5 w-5" /> Nazwa Zawodów (Wymagane)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Np. Mistrzostwa Wędkarskie 2024"
                  className="bg-card border-border"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Start Time */}
        <div>
          <form.Field name="startTime">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <Calendar className="mr-2 h-5 w-5" /> Data Rozpoczęcia (Wymagane)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-card border-border"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* End Time */}
        <div>
          <form.Field name="endTime">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <Calendar className="mr-2 h-5 w-5" /> Data Zakończenia (Wymagane)
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="datetime-local"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="bg-card border-border"
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Fishery Selection */}
        <div>
          <form.Field name="fisheryId">
            {(field) => {
              // Don't render the Select until we have both competition and fisheries data
              if (!competition || !fisheries?.items || fisheries.items.length === 0) {
                return (
                  <>
                    <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
                      <MapPin className="mr-2 h-5 w-5" /> Łowisko (Wymagane)
                    </Label>
                    <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
                  </>
                );
              }

              return (
                <>
                  <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
                    <MapPin className="mr-2 h-5 w-5" /> Łowisko (Wymagane)
                  </Label>
                  <Select
                    key={`fishery-select-${field.state.value}`}
                    value={field.state.value?.toString() || ''}
                    onValueChange={(value) => field.handleChange(value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger className="w-full bg-card border-border">
                      <SelectValue placeholder="Wybierz łowisko..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {fisheries.items.map((fishery) => (
                        <SelectItem key={fishery.id} value={fishery.id?.toString() ?? ''}>
                          {fishery.name} - {fishery.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />
                </>
              );
            }}
          </form.Field>
        </div>

        {/* Rules */}
        <div>
          <form.Field name="rules">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <FileText className="mr-2 h-5 w-5" /> Regulamin (Opcjonalne)
                </Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Wpisz regulamin zawodów..."
                  className="bg-card border-border min-h-[100px]"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Competition Photo */}
        <div>
          <DeferredImageUpload
            id="competition-photo-input"
            label="Zdjęcie Zawodów (Opcjonalne)"
            folderName="competitions"
            currentImageUrl={isImageMarkedForRemoval ? null : competition.imageUrl}
            onImageSelect={(imageData) => {
              setSelectedImageData(imageData);
              // If user removes the image (imageData is null), mark for removal
              if (!imageData && competition.imageUrl) {
                form.setFieldValue('removeCurrentImage', true);
                form.setFieldValue('imageUrl', null);
                setIsImageMarkedForRemoval(true);
              } else if (imageData) {
                // If user selects a new image, don't remove the current one
                form.setFieldValue('removeCurrentImage', false);
                setIsImageMarkedForRemoval(false);
              }
            }}
            onUploadReady={(uploadFn) => {
              setUploadImageFunction(() => uploadFn);
            }}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isUploadingImage
              ? 'Przesyłanie zdjęcia...'
              : isPending
                ? 'Aktualizowanie zawodów...'
                : 'Zaktualizuj Zawody'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function EditCompetitionSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeader showBackButton={false} />
      <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
