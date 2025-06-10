'use client';

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Fish, Plus, Ruler, Trash2, User, Users, Weight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useApiError } from '@/hooks/use-api-error';
import {
  useGetCompetitionCatches,
  useGetCompetitionDetailsById,
  useJudgeDeletesFishCatch,
  useJudgeRecordsFishCatch
} from '@/lib/api/endpoints/competitions';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import { ParticipantRole, ParticipantStatus } from '@/lib/api/models';
import type { CompetitionFishCatchDto, FishSpeciesDto, RecordCompetitionFishCatchCommand } from '@/lib/api/models';

import FieldInfo from '@/components/FieldInfo';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FishImage } from '@/components/ui/fish-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';

export default function CatchManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleError } = useApiError();

  const [formKey, setFormKey] = useState(0);

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

  const {
    data: competition,
    isLoading: isLoadingCompetition,
    refetch
  } = useGetCompetitionDetailsById(competitionId || 0, {
    query: {
      enabled: !!competitionId && paramsResolved
    }
  });

  const { data: fishSpecies } = useGetAllFishSpecies();

  const {
    data: catches,
    isLoading: isLoadingCatches,
    refetch: refetchCatches
  } = useGetCompetitionCatches(competitionId || 0, {
    query: {
      enabled: !!competitionId && paramsResolved
    }
  });

  const recordCatchMutation = useJudgeRecordsFishCatch({
    mutation: {
      onSuccess: () => {
        toast.success('Połów został zarejestrowany!');
        form.reset();
        // Force form re-render to reset Select components
        setFormKey((prev) => prev + 1);
        refetch();
        refetchCatches();
        queryClient.invalidateQueries({
          queryKey: ['/api/competitions']
        });
      },
      onError: (error) => {
        console.error('Error recording catch:', error);
        handleError(error);
      }
    }
  });

  const deleteCatchMutation = useJudgeDeletesFishCatch({
    mutation: {
      onSuccess: () => {
        toast.success('Połów został usunięty!');
        refetch();
        refetchCatches();
        queryClient.invalidateQueries({
          queryKey: ['/api/competitions']
        });
      },
      onError: (error) => {
        console.error('Error deleting catch:', error);
        handleError(error);
      }
    }
  });

  const form = useForm({
    defaultValues: {
      participantEntryId: '',
      fishSpeciesId: '',
      lengthInCm: '',
      weightInKg: ''
    },
    onSubmit: async ({ value }) => {
      if (!competitionId) {
        toast.error('Błąd: ID zawodów jest nieznane');
        return;
      }

      // Use current time as catch time (when judge registers it)
      const currentTime = new Date().toISOString();

      const command: RecordCompetitionFishCatchCommand = {
        competitionId,
        participantEntryId: parseInt(value.participantEntryId),
        fishSpeciesId:
          value.fishSpeciesId && value.fishSpeciesId !== 'none' ? parseInt(value.fishSpeciesId) : undefined,
        lengthInCm: value.lengthInCm ? parseFloat(value.lengthInCm) : null,
        weightInKg: value.weightInKg ? parseFloat(value.weightInKg) : null,
        catchTime: currentTime
      };

      console.log('Submitting catch command:', command);
      console.log('Available competitors:', availableCompetitors);

      await recordCatchMutation.mutateAsync({
        competitionId,
        data: command
      });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {};

        if (!value.participantEntryId) {
          errors.participantEntryId =
            availableCompetitors.length > 0
              ? 'Wybór uczestnika jest wymagany.'
              : 'Brak dostępnych zawodników do zarejestrowania połowu.';
        }

        if (!value.lengthInCm && !value.weightInKg) {
          errors.lengthInCm = 'Należy podać przynajmniej długość lub wagę ryby.';
          errors.weightInKg = 'Należy podać przynajmniej długość lub wagę ryby.';
        }

        // Image is now optional - judges can register catches without photos

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      },
      onChange: ({ value }) => {
        // Clear measurement validation errors when at least one measurement is provided
        if (value.lengthInCm || value.weightInKg) {
          return undefined;
        }
        return {};
      }
    }
  });

  const handleDeleteCatch = async (catchId: number) => {
    if (!competitionId) return;

    if (window.confirm('Czy na pewno chcesz usunąć ten połów?')) {
      try {
        await deleteCatchMutation.mutateAsync({
          competitionId,
          fishCatchId: catchId
        });
      } catch (error) {
        // Error is already handled by the mutation's onError callback
        console.error('Failed to delete catch:', error);
      }
    }
  };

  const isSubmitting = recordCatchMutation.isPending;

  // Filter participants to only show approved competitors (not judges or organizers)
  const availableCompetitors =
    competition?.participantsList?.filter(
      (participant) =>
        participant.role === ParticipantRole.Competitor && participant.status === ParticipantStatus.Approved
    ) || [];

  // Don't render anything until params are resolved
  if (!paramsResolved) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (isLoadingCompetition) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="space-y-6">
        <PageHeader onBack={() => router.push('/competitions')} />
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Zawody nie znalezione</h1>
          <Button onClick={() => router.push('/competitions')}>Wróć do listy zawodów</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zarządzanie Połowami"
        description={competition.name ?? undefined}
        onBack={() => router.push(`/competitions/${competitionId}`)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add New Catch Section */}
        <div className="lg:col-span-1">
          <div id="add-catch-form" className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Dodaj Nowy Połów</span>
              </div>
            </div>
            <div className="p-4">
              <form
                key={formKey}
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
                className="space-y-4"
              >
                {/* Participant Selection */}
                <div>
                  <form.Field name="participantEntryId">
                    {(field) => (
                      <>
                        <Label
                          htmlFor={field.name}
                          className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                        >
                          <Users className="mr-2 h-4 w-4" /> Uczestnik
                        </Label>
                        <Select
                          value={field.state.value || undefined}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger className="w-full bg-card border-border">
                            <SelectValue placeholder="Wybierz uczestnika..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {availableCompetitors.length > 0 ? (
                              availableCompetitors.map((participant) => (
                                <SelectItem key={participant.id} value={participant.id?.toString() ?? ''}>
                                  {participant.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="" disabled className="text-muted-foreground">
                                Brak dostępnych zawodników
                              </SelectItem>
                            )}
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
                        <Label
                          htmlFor={field.name}
                          className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                        >
                          <Fish className="mr-2 h-4 w-4" /> Gatunek
                        </Label>
                        <Select
                          value={field.state.value || undefined}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger className="w-full bg-card border-border">
                            <SelectValue placeholder="Wybierz gatunek..." />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="none" className="text-muted-foreground">
                              Nie określono gatunku
                            </SelectItem>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <form.Field name="lengthInCm">
                      {(field) => (
                        <>
                          <Label
                            htmlFor={field.name}
                            className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                          >
                            <Ruler className="mr-1 h-4 w-4" /> Długość (cm)
                          </Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            step="0.1"
                            placeholder="25.5"
                            value={field.state.value || ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="bg-card border-border text-sm"
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
                            <Weight className="mr-1 h-4 w-4" /> Waga (kg)
                          </Label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            step="0.01"
                            placeholder="1.25"
                            value={field.state.value || ''}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className="bg-card border-border text-sm"
                          />
                          <FieldInfo field={field} />
                        </>
                      )}
                    </form.Field>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={isSubmitting}
                  size="sm"
                >
                  {recordCatchMutation.isPending ? 'Dodawanie...' : 'Dodaj Połów'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Registered Catches Section */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <Fish className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Zarejestrowane Połowy ({catches?.length || 0})</span>
              </div>
            </div>
            <div className="p-4">
              {isLoadingCatches ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-12 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : catches && catches.length > 0 ? (
                <div className="space-y-4">
                  {catches.map((catchItem: CompetitionFishCatchDto) => (
                    <div
                      key={catchItem.id}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Fish Image */}
                      <div className="flex-shrink-0">
                        {catchItem.fishSpeciesImageUrl ? (
                          <FishImage
                            src={catchItem.fishSpeciesImageUrl}
                            alt={catchItem.fishSpeciesName || 'Ryba'}
                            className="w-16 h-12 rounded-md"
                            width={64}
                            height={48}
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                            <Fish className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Catch Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium text-gray-900">{catchItem.participantName}</span>
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              <Fish className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {catchItem.fishSpeciesName || 'Nie określono gatunku'}
                              </span>
                            </div>

                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              {catchItem.lengthInCm && (
                                <div className="flex items-center space-x-1">
                                  <Ruler className="h-3 w-3" />
                                  <span>{catchItem.lengthInCm} cm</span>
                                </div>
                              )}
                              {catchItem.weightInKg && (
                                <div className="flex items-center space-x-1">
                                  <Weight className="h-3 w-3" />
                                  <span>{catchItem.weightInKg} kg</span>
                                </div>
                              )}
                              <div>
                                <span>
                                  {catchItem.catchTime &&
                                    format(new Date(catchItem.catchTime), 'dd.MM.yyyy HH:mm', { locale: pl })}
                                </span>
                              </div>
                            </div>

                            <div className="mt-1 text-xs text-gray-400">Sędzia: {catchItem.judgeName}</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCatch(catchItem.id || 0)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={deleteCatchMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Fish className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Brak zarejestrowanych połowów</h3>
                  <p className="text-sm text-gray-500">
                    Nie ma jeszcze żadnych zarejestrowanych połowów w tych zawodach. Użyj formularza po lewej stronie,
                    aby dodać pierwszy połów.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
