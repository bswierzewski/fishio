'use client';

import { formatDateTimeLocal } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { ArrowLeft, Calendar, Fish, Ruler, Users, Weight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetCompetitionDetailsById, useJudgeRecordsFishCatch } from '@/lib/api/endpoints/competitions';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import type { FishSpeciesDto, RecordCompetitionFishCatchCommand } from '@/lib/api/models';

import type { ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';

export default function NewCatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const router = useRouter();

  // Resolve params
  useEffect(() => {
    params.then((resolvedParams) => {
      setCompetitionId(parseInt(resolvedParams.id));
    });
  }, [params]);

  const { data: competition, isLoading: isLoadingCompetition } = useGetCompetitionDetailsById(competitionId!, {
    query: { enabled: !!competitionId }
  });

  const { data: fishSpecies } = useGetAllFishSpecies();

  const recordCatchMutation = useJudgeRecordsFishCatch({
    mutation: {
      onSuccess: () => {
        toast.success('Połów został zarejestrowany!');
        // Reset form
        form.reset();
      },
      onError: (error) => {
        console.error('Error recording catch:', error);
        toast.error('Nie udało się zarejestrować połowu');
      }
    }
  });

  const form = useForm({
    defaultValues: {
      participantEntryId: '',
      fishSpeciesId: '',
      lengthInCm: '',
      weightInKg: '',
      imageUrl: null as string | null,
      imagePublicId: null as string | null,
      catchTime: formatDateTimeLocal()
    },
    onSubmit: async ({ value }) => {
      if (!competitionId) {
        toast.error('Błąd: ID zawodów jest nieznane');
        return;
      }

      const command: RecordCompetitionFishCatchCommand = {
        competitionId,
        participantEntryId: parseInt(value.participantEntryId),
        fishSpeciesId: parseInt(value.fishSpeciesId),
        lengthInCm: value.lengthInCm ? parseFloat(value.lengthInCm) : null,
        weightInKg: value.weightInKg ? parseFloat(value.weightInKg) : null,
        imageUrl: value.imageUrl,
        imagePublicId: value.imagePublicId,
        catchTime: value.catchTime
      };

      await recordCatchMutation.mutateAsync({
        competitionId,
        data: command
      });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {};

        if (!value.participantEntryId) {
          errors.participantEntryId = 'Wybór uczestnika jest wymagany.';
        }

        if (!value.fishSpeciesId) {
          errors.fishSpeciesId = 'Wybór gatunku ryby jest wymagany.';
        }

        if (!value.catchTime) {
          errors.catchTime = 'Czas połowu jest wymagany.';
        }

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      }
    }
  });

  const handleImageChange = (result: ImageUploadResult | null) => {
    if (result) {
      form.setFieldValue('imageUrl', result.imageUrl);
      form.setFieldValue('imagePublicId', result.imagePublicId);
    } else {
      form.setFieldValue('imageUrl', null);
      form.setFieldValue('imagePublicId', null);
    }
  };

  if (isLoadingCompetition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Zawody nie znalezione</h1>
          <Link href="/competitions">
            <Button>Wróć do listy zawodów</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href={`/competitions/${competitionId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Zawodów
            </Button>
          </Link>
          <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Zarejestruj Połów</h1>
          <div></div>
        </div>

        <Card className={cardBodyBgClass}>
          <CardHeader>
            <CardTitle className={cardTextColorClass}>{competition.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              {/* Participant Selection */}
              <div>
                <form.Field name="participantEntryId">
                  {(field) => (
                    <>
                      <Label className="text-sm font-medium text-foreground flex items-center mb-2">
                        <Users className="mr-2 h-4 w-4" />
                        Uczestnik (Wymagane)
                      </Label>
                      <Select value={field.state.value || ''} onValueChange={(value) => field.handleChange(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz uczestnika..." />
                        </SelectTrigger>
                        <SelectContent>
                          {competition.participantsList?.map((participant) => (
                            <SelectItem key={participant.id} value={participant.id?.toString() ?? ''}>
                              {participant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldInfo field={field} />
                    </>
                  )}
                </form.Field>
              </div>

              {/* Fish Species Selection */}
              <div>
                <form.Field name="fishSpeciesId">
                  {(field) => (
                    <>
                      <Label className="text-sm font-medium text-foreground flex items-center mb-2">
                        <Fish className="mr-2 h-4 w-4" />
                        Gatunek Ryby (Wymagane)
                      </Label>
                      <Select value={field.state.value || ''} onValueChange={(value) => field.handleChange(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz gatunek..." />
                        </SelectTrigger>
                        <SelectContent>
                          {fishSpecies?.map((species: FishSpeciesDto) => (
                            <SelectItem key={species.id} value={species.id?.toString() ?? ''}>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <form.Field name="lengthInCm">
                    {(field) => (
                      <>
                        <Label
                          htmlFor={field.name}
                          className="text-sm font-medium text-foreground flex items-center mb-2"
                        >
                          <Ruler className="mr-2 h-4 w-4" />
                          Długość (cm)
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
                          className="text-sm font-medium text-foreground flex items-center mb-2"
                        >
                          <Weight className="mr-2 h-4 w-4" />
                          Waga (kg)
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
                        className="text-sm font-medium text-foreground flex items-center mb-2"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        Czas Połowu (Wymagane)
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="datetime-local"
                        value={field.state.value || ''}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      <FieldInfo field={field} />
                    </>
                  )}
                </form.Field>
              </div>

              {/* Image Upload */}
              <ImageUpload
                id="catch-image"
                label="Zdjęcie Połowu (Opcjonalne)"
                folderName="competition-catches"
                onImageChange={handleImageChange}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={recordCatchMutation.isPending}>
                {recordCatchMutation.isPending ? 'Rejestrowanie...' : 'Zarejestruj Połów'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
