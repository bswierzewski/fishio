'use client';

import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Award,
  Calendar,
  FileText,
  ImagePlus,
  ListChecks,
  MapPin,
  ShieldCheck,
  Trophy,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { getGetUserCompetitionsListQueryKey, useCreateNewCompetition } from '@/lib/api/endpoints/competitions';
import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies, useGetGlobalCategoryDefinitions } from '@/lib/api/endpoints/lookup-data';
import {
  CategoryType,
  CompetitionType,
  CreateCompetitionCommand,
  GetUserCompetitionsListParams,
  SpecialCategoryDefinitionCommandDto
} from '@/lib/api/models';

import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function AddCompetitionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);

  // API hooks
  const { mutate: createCompetition, isPending } = useCreateNewCompetition({
    mutation: {
      onSuccess: () => {
        toast.success('Zawody zostały utworzone pomyślnie!');
        queryClient.invalidateQueries({
          queryKey: [getGetUserCompetitionsListQueryKey({} as GetUserCompetitionsListParams)]
        });
        router.push('/my-competitions');
      },
      onError: (error: unknown) => {
        console.error('Błąd podczas tworzenia zawodów:', error);
        // Don't show manual error toast - let the axios interceptor handle it
        // The interceptor will show user-friendly validation errors automatically
      }
    }
  });

  const { data: fisheriesData, isLoading: isLoadingFisheries } = useGetAllFisheries({
    PageNumber: 1,
    PageSize: 100
  });

  const { data: fishSpecies, isLoading: isLoadingSpecies } = useGetAllFishSpecies();

  const { data: categoryDefinitions, isLoading: isLoadingCategories } = useGetGlobalCategoryDefinitions({
    FilterByType: CategoryType.MainScoring
  });

  const { data: specialCategoryDefinitions, isLoading: isLoadingSpecialCategories } = useGetGlobalCategoryDefinitions({
    FilterByType: CategoryType.SpecialAchievement
  });

  // Form setup
  const form = useForm({
    defaultValues: {
      name: '',
      startTime: new Date().toISOString().substring(0, 16),
      endTime: '',
      fisheryId: undefined as number | undefined,
      rules: '',
      type: CompetitionType.Public,
      image: null as File | null,
      primaryScoringCategoryDefinitionId: undefined as number | undefined,
      primaryScoringFishSpeciesId: null as number | null,
      specialCategories: [] as SpecialCategoryDefinitionCommandDto[]
    } as CreateCompetitionCommand,
    onSubmit: async ({ value }) => {
      createCompetition({ data: value });
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Partial<Record<keyof CreateCompetitionCommand, string>> = {};

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

        if (!value.primaryScoringCategoryDefinitionId) {
          errors.primaryScoringCategoryDefinitionId = 'Wybór głównej kategorii punktacji jest wymagany.';
        }

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      }
    }
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedImagePreview(URL.createObjectURL(file));
      form.setFieldValue('image', file);
    } else {
      setSelectedImagePreview(null);
      form.setFieldValue('image', null);
    }
  };

  if (isLoadingFisheries || isLoadingCategories || isLoadingSpecialCategories) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/competitions">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Listy Zawodów
            </Button>
          </Link>
          <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Stwórz Nowe Zawody</h1>
          <div></div>
        </div>
        <div className={`p-4 sm:p-6 rounded-lg border border-border shadow ${cardBodyBgClass} space-y-6`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/competitions">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Wróć do Listy Zawodów
          </Button>
        </Link>
        <h1 className={`text-xl sm:text-2xl font-bold ${cardTextColorClass}`}>Stwórz Nowe Zawody</h1>
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
                  type="text"
                  placeholder="Np. Puchar Wiosny"
                  className="bg-card border-border"
                  value={field.state.value ?? ''}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Start and End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <form.Field name="startTime">
              {(field) => (
                <>
                  <Label
                    htmlFor={field.name}
                    className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                  >
                    <Calendar className="mr-2 h-5 w-5" /> Data i Czas Rozpoczęcia (Wymagane)
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    className="bg-card border-border"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>
          <div>
            <form.Field name="endTime">
              {(field) => (
                <>
                  <Label
                    htmlFor={field.name}
                    className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                  >
                    <Calendar className="mr-2 h-5 w-5 opacity-70" /> Data i Czas Zakończenia (Wymagane)
                  </Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="datetime-local"
                    className="bg-card border-border"
                    value={field.state.value ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )}
            </form.Field>
          </div>
        </div>

        {/* Fishery Selection */}
        <div>
          <form.Field name="fisheryId">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <MapPin className="mr-2 h-5 w-5" /> Łowisko (Wymagane)
                </Label>
                <Select
                  value={field.state.value?.toString() || ''}
                  onValueChange={(value) => field.handleChange(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Wybierz łowisko..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {fisheriesData?.items?.map((fishery) => (
                      <SelectItem key={fishery.id} value={fishery.id?.toString() ?? ''}>
                        {fishery.name} {fishery.location && `- ${fishery.location}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Competition Type */}
        <div>
          <form.Field name="type">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <Users className="mr-2 h-5 w-5" /> Typ Zawodów (Wymagane)
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value as CompetitionType)}
                >
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Wybierz typ zawodów..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value={CompetitionType.Public}>Otwarte</SelectItem>
                    <SelectItem value={CompetitionType.Private}>Zamknięte</SelectItem>
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
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

        {/* Primary Scoring Category */}
        <div>
          <form.Field name="primaryScoringCategoryDefinitionId">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <ListChecks className="mr-2 h-5 w-5" /> Główna Kategoria Punktacji (Wymagane)
                </Label>
                <Select
                  value={field.state.value?.toString() || ''}
                  onValueChange={(value) => field.handleChange(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Wybierz główną metodę klasyfikacji..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {categoryDefinitions?.map((category) => (
                      <SelectItem key={category.id} value={category.id?.toString() ?? ''}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Primary Scoring Fish Species (Optional) */}
        <div>
          <form.Field name="primaryScoringFishSpeciesId">
            {(field) => (
              <>
                <Label
                  htmlFor={field.name}
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}
                >
                  <ListChecks className="mr-2 h-5 w-5 opacity-70" /> Gatunek dla Głównej Kategorii (Opcjonalne)
                </Label>
                <Select
                  value={field.state.value?.toString() || 'clear'}
                  onValueChange={(value) => field.handleChange(value === 'clear' ? null : parseInt(value))}
                >
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Wybierz gatunek (opcjonalne)..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="clear">Wszystkie gatunki</SelectItem>
                    {fishSpecies?.map((species) => (
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

        {/* Special Categories */}
        <div>
          <form.Field name="specialCategories">
            {(field) => (
              <>
                <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-2`}>
                  <Award className="mr-2 h-5 w-5" /> Kategorie Specjalne (Opcjonalne)
                </Label>
                <div className="space-y-2">
                  {specialCategoryDefinitions?.map((category) => {
                    const isSelected =
                      field.state.value?.some((cat) => cat.categoryDefinitionId === category.id) || false;

                    return (
                      <div key={category.id} className="flex items-center space-x-3 p-2 rounded-md">
                        <Checkbox
                          id={`special-cat-${category.id}`}
                          onCheckedChange={(checked) => {
                            if (typeof checked === 'boolean' && category.id) {
                              const currentCategories = field.state.value || [];
                              if (checked) {
                                // Add category with proper SpecialCategoryDefinitionCommandDto structure
                                const newCategory: SpecialCategoryDefinitionCommandDto = {
                                  categoryDefinitionId: category.id,
                                  fishSpeciesId: null,
                                  customNameOverride: null
                                };
                                const newCategories = [...currentCategories, newCategory];
                                field.handleChange(newCategories);
                              } else {
                                // Remove category
                                const newCategories = currentCategories.filter(
                                  (cat) => cat.categoryDefinitionId !== category.id
                                );
                                field.handleChange(newCategories);
                              }
                            }
                          }}
                          checked={isSelected}
                          className="border border-border data-[state=checked]:border-primary"
                        />
                        <Label
                          htmlFor={`special-cat-${category.id}`}
                          className="text-sm font-normal cursor-pointer flex-grow"
                        >
                          {category.name}
                          {category.description && (
                            <span className={`block text-xs ${cardMutedTextColorClass}`}>{category.description}</span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        {/* Competition Photo */}
        <div>
          <form.Field name="image">
            {(field) => (
              <>
                <Label
                  htmlFor="competition-photo-input"
                  className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-2`}
                >
                  <ImagePlus className="mr-2 h-5 w-5" /> Zdjęcie Zawodów (Opcjonalne)
                </Label>
                <label
                  htmlFor="competition-photo-input"
                  className="mt-1 flex justify-center rounded-md border-2 border-dashed border-border px-6 pt-5 pb-6 hover:border-primary transition-colors cursor-pointer"
                >
                  <div className="space-y-1 text-center">
                    {selectedImagePreview ? (
                      <img
                        src={selectedImagePreview}
                        alt="Podgląd zdjęcia zawodów"
                        className="mx-auto h-32 w-auto rounded-md object-contain"
                      />
                    ) : (
                      <ImagePlus className={`mx-auto h-12 w-12 ${cardMutedTextColorClass}`} />
                    )}
                    <div className="flex text-sm text-muted-foreground">
                      <span className="font-medium text-primary">Załaduj plik</span>
                      <p className="pl-1">lub przeciągnij i upuść</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF do 10MB</p>
                  </div>
                  <input
                    id="competition-photo-input"
                    name="image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <FieldInfo field={field} />
              </>
            )}
          </form.Field>
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isPending}
          >
            {isPending ? 'Tworzenie...' : 'Stwórz Zawody'}
          </Button>
        </div>
      </form>
    </div>
  );
}
