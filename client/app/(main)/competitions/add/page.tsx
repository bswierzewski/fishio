'use client';

import { formatDateTimeLocal } from '@/lib/utils';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, FileText, Fish, ImagePlus, MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { useCreateNewCompetition } from '@/lib/api/endpoints/competitions';
import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies, useGetGlobalCategoryDefinitions } from '@/lib/api/endpoints/lookup-data';
import { CategoryType } from '@/lib/api/models';
import type {
  CategoryDefinitionDto,
  CompetitionType,
  CreateCompetitionCommand,
  FishSpeciesDto,
  SpecialCategoryDefinitionCommandDto
} from '@/lib/api/models';

import { type DeferredImageData, type ImageUploadResult } from '@/hooks/use-image-upload';

import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FishImage } from '@/components/ui/fish-image';
import { DeferredImageUpload } from '@/components/ui/image-upload';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

// Theme utilities
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-card-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function AddCompetitionPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedImageData, setSelectedImageData] = useState<DeferredImageData | null>(null);
  const [uploadImageFunction, setUploadImageFunction] = useState<(() => Promise<ImageUploadResult | null>) | null>(
    null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: fisheries, isLoading: isLoadingFisheries } = useGetAllFisheries({ PageNumber: 1, PageSize: 100 });
  const { data: categoryDefinitions, isLoading: isLoadingCategories } = useGetGlobalCategoryDefinitions();
  const { data: specialCategoryDefinitions, isLoading: isLoadingSpecialCategories } = useGetGlobalCategoryDefinitions({
    FilterByType: CategoryType.SpecialAchievement
  });
  const { data: fishSpecies } = useGetAllFishSpecies();

  const { mutate: createCompetition, isPending } = useCreateNewCompetition({
    mutation: {
      onSuccess: () => {
        toast.success('Zawody zostały utworzone pomyślnie!');
        queryClient.invalidateQueries({ queryKey: ['competitions'] });
        router.push('/competitions');
      },
      onError: (error) => {
        console.error('Error creating competition:', error);
        toast.error('Nie udało się utworzyć zawodów');
      }
    }
  });

  // Form setup
  const form = useForm({
    defaultValues: {
      name: '',
      startTime: formatDateTimeLocal(),
      endTime: '',
      fisheryId: undefined as number | undefined,
      rules: '',
      type: 'Public' as CompetitionType,
      imageUrl: null as string | null,
      imagePublicId: null as string | null,
      primaryScoringCategoryDefinitionId: undefined as number | undefined,
      primaryScoringFishSpeciesId: null as number | null,
      specialCategories: [] as SpecialCategoryDefinitionCommandDto[]
    } as CreateCompetitionCommand,
    onSubmit: async ({ value }) => {
      // First upload the image if one is selected
      let imageUrl: string | null = null;
      let imagePublicId: string | null = null;

      if (selectedImageData && uploadImageFunction) {
        setIsUploadingImage(true);
        try {
          const uploadResult = await uploadImageFunction();
          if (uploadResult) {
            imageUrl = uploadResult.imageUrl;
            imagePublicId = uploadResult.imagePublicId;
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('Nie udało się przesłać zdjęcia');
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const command: CreateCompetitionCommand = {
        ...value,
        imageUrl,
        imagePublicId
      };

      createCompetition({ data: command });
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

        // Check if primary scoring category requires fish species
        const selectedPrimaryCategory = categoryDefinitions?.find(
          (cat) => cat.id === value.primaryScoringCategoryDefinitionId
        );
        if (selectedPrimaryCategory?.requiresSpecificFishSpecies && !value.primaryScoringFishSpeciesId) {
          errors.primaryScoringFishSpeciesId = 'Ta kategoria wymaga wyboru gatunku ryby.';
        }

        return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
      }
    }
  });

  const isSubmitting = isPending || isUploadingImage;

  // Get selected primary category to check if it requires fish species
  const selectedPrimaryCategory = categoryDefinitions?.find(
    (cat) => cat.id === form.getFieldValue('primaryScoringCategoryDefinitionId')
  );

  // Handle special category fish species selection
  const handleSpecialCategoryFishSpeciesChange = (categoryId: number, fishSpeciesId: number | null) => {
    const currentCategories = form.getFieldValue('specialCategories') || [];
    const updatedCategories = currentCategories.map((cat) =>
      cat.categoryDefinitionId === categoryId ? { ...cat, fishSpeciesId } : cat
    );
    form.setFieldValue('specialCategories', updatedCategories);
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
            {(field) => (
              <>
                <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
                  <MapPin className="mr-2 h-5 w-5" /> Łowisko (Wymagane)
                </Label>
                <Select
                  value={field.state.value?.toString() || ''}
                  onValueChange={(value) => field.handleChange(value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Wybierz łowisko..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {fisheries?.items?.map((fishery) => (
                      <SelectItem key={fishery.id} value={fishery.id?.toString() ?? ''}>
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
            {(field) => {
              // Get selected primary category to check if it requires fish species
              const selectedPrimaryCategory = categoryDefinitions?.find((cat) => cat.id === field.state.value);

              return (
                <>
                  <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-1`}>
                    <Trophy className="mr-2 h-5 w-5" /> Główna Kategoria Punktacji (Wymagane)
                  </Label>
                  <Select
                    value={field.state.value?.toString() || ''}
                    onValueChange={(value) => {
                      const newValue = value ? parseInt(value) : undefined;
                      field.handleChange(newValue);
                      // Reset fish species selection when category changes
                      form.setFieldValue('primaryScoringFishSpeciesId', null);
                    }}
                  >
                    <SelectTrigger className="w-full bg-card border-border">
                      <SelectValue placeholder="Wybierz kategorię..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {categoryDefinitions?.map((category) => (
                        <SelectItem key={category.id} value={category.id?.toString() ?? ''}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldInfo field={field} />

                  {/* Primary Scoring Fish Species Selection - Show only if category requires it */}
                  {selectedPrimaryCategory?.requiresSpecificFishSpecies && (
                    <div className="mt-4">
                      <form.Field name="primaryScoringFishSpeciesId">
                        {(fishField) => (
                          <>
                            <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-3`}>
                              <Fish className="mr-2 h-5 w-5" /> Gatunek Ryby dla Głównej Kategorii (Wymagane)
                            </Label>
                            <div className="border border-border rounded-lg p-4 bg-card">
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                                {fishSpecies?.map((species: FishSpeciesDto) => {
                                  const isSelected = fishField.state.value === species.id;
                                  return (
                                    <div
                                      key={species.id}
                                      className={`relative border rounded-lg p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                        isSelected
                                          ? 'border-primary bg-primary/5 shadow-sm'
                                          : 'border-border bg-card hover:border-primary/50'
                                      }`}
                                      onClick={() => fishField.handleChange(species.id!)}
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div
                                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            isSelected ? 'bg-primary border-primary' : 'border-border bg-background'
                                          }`}
                                        >
                                          {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                                        </div>
                                        <div className="flex-shrink-0 flex items-center">
                                          <FishImage
                                            src={species.imageUrl}
                                            alt={species.name || 'Ryba'}
                                            className="w-12 h-12 rounded-md"
                                            width={48}
                                            height={48}
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <Label
                                            className={`text-sm font-medium cursor-pointer block truncate ${
                                              isSelected ? 'text-primary' : cardTextColorClass
                                            }`}
                                          >
                                            {species.name}
                                          </Label>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                            <FieldInfo field={fishField} />
                          </>
                        )}
                      </form.Field>
                    </div>
                  )}
                </>
              );
            }}
          </form.Field>
        </div>

        {/* Special Categories */}
        <div>
          <form.Field name="specialCategories">
            {(field) => (
              <>
                <Label className={`text-sm font-medium ${cardTextColorClass} flex items-center mb-2`}>
                  <Trophy className="mr-2 h-5 w-5" /> Kategorie Specjalne (Opcjonalne)
                </Label>
                <div className="space-y-4 border border-border rounded-md p-3 bg-card">
                  {specialCategoryDefinitions?.map((category) => {
                    const isSelected = (field.state.value || []).some(
                      (selected) => selected.categoryDefinitionId === category.id
                    );
                    const selectedCategory = (field.state.value || []).find(
                      (selected) => selected.categoryDefinitionId === category.id
                    );

                    return (
                      <div key={category.id} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`special-category-${category.id}`}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentCategories = field.state.value || [];
                              if (checked) {
                                const newCategory: SpecialCategoryDefinitionCommandDto = {
                                  categoryDefinitionId: category.id!,
                                  fishSpeciesId: null,
                                  customNameOverride: null
                                };
                                field.handleChange([...currentCategories, newCategory]);
                              } else {
                                field.handleChange(
                                  currentCategories.filter((c) => c.categoryDefinitionId !== category.id)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={`special-category-${category.id}`}
                            className={`text-sm cursor-pointer ${cardTextColorClass}`}
                          >
                            {category.name}
                          </Label>
                        </div>

                        {/* Fish Species Selection for Special Category - Show only if selected and requires fish species */}
                        {isSelected && category.requiresSpecificFishSpecies && (
                          <div className="ml-6 border border-border rounded-lg p-3 bg-muted/30">
                            <Label className={`text-xs font-medium ${cardMutedTextColorClass} flex items-center mb-2`}>
                              <Fish className="mr-1 h-3 w-3" /> Wybierz gatunek dla tej kategorii:
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {fishSpecies?.map((species: FishSpeciesDto) => {
                                const isSpeciesSelected = selectedCategory?.fishSpeciesId === species.id;
                                return (
                                  <div
                                    key={species.id}
                                    className={`relative border rounded-md p-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                      isSpeciesSelected
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border bg-background hover:border-primary/50'
                                    }`}
                                    onClick={() => handleSpecialCategoryFishSpeciesChange(category.id!, species.id!)}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <div
                                        className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                                          isSpeciesSelected
                                            ? 'bg-primary border-primary'
                                            : 'border-border bg-background'
                                        }`}
                                      >
                                        {isSpeciesSelected && (
                                          <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full" />
                                        )}
                                      </div>
                                      <div className="flex-shrink-0">
                                        <FishImage
                                          src={species.imageUrl}
                                          alt={species.name || 'Ryba'}
                                          className="w-8 h-8 rounded-sm"
                                          width={32}
                                          height={32}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <Label
                                          className={`text-xs font-medium cursor-pointer block truncate ${
                                            isSpeciesSelected ? 'text-primary' : cardTextColorClass
                                          }`}
                                        >
                                          {species.name}
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
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
          <DeferredImageUpload
            id="competition-photo-input"
            label="Zdjęcie Zawodów (Opcjonalne)"
            folderName="competitions"
            onImageSelect={(imageData) => {
              setSelectedImageData(imageData);
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
            {isUploadingImage ? 'Przesyłanie zdjęcia...' : isPending ? 'Tworzenie zawodów...' : 'Stwórz Zawody'}
          </Button>
        </div>
      </form>
    </div>
  );
}
