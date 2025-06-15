'use client';

import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { BarChart3, Calendar, Edit, Fish as FishIcon, List, MapPin, Plus, Trash2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

import { useApiError } from '@/hooks/use-api-error';
import { useDeleteExistingFishery, useGetFisheryById } from '@/lib/api/endpoints/fisheries';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';

import { useCurrentUser } from '@/hooks/use-current-user';

import { PageHeader, PageHeaderAction } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FishImage } from '@/components/ui/fish-image';
import { Skeleton } from '@/components/ui/skeleton';

const formatDateInternal = (dateInput: Date | string | number) => {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  return format(date, 'dd MMMM yyyy', { locale: pl });
};

const formatLastCatchDate = (dateInput: Date | string | number | null | undefined) => {
  if (!dateInput) return null;
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  return format(date, 'dd.MM.yyyy', { locale: pl });
};

export default function FisheryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const idParam = params.id as string;
  const fisheryId = parseInt(idParam, 10);

  // Get current user information
  const { id: currentUserId } = useCurrentUser();

  // Fetch fishery data using the hook
  const {
    data: fishery,
    isLoading,
    error,
    isError
  } = useGetFisheryById(fisheryId, {
    query: { enabled: !isNaN(fisheryId) }
  });

  // Fetch all fish species to get image URLs
  const { data: allFishSpecies } = useGetAllFishSpecies();

  // Delete mutation
  const deleteFisheryMutation = useDeleteExistingFishery();

  // API error handling
  const { handleError } = useApiError();

  useEffect(() => {
    if (isNaN(fisheryId)) {
      notFound();
      return;
    }
    if (!isLoading && (isError || !fishery)) {
      notFound();
    }
  }, [isLoading, isError, fishery, fisheryId]);

  // Helper function to get fish species image URL by ID
  const getFishSpeciesImageUrl = (speciesId: number) => {
    const species = allFishSpecies?.find((s) => s.id === speciesId);
    return species?.imageUrl || null;
  };

  if (isLoading || isNaN(fisheryId)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !fishery) {
    return null;
  }

  const definedSpeciesForDisplay = fishery.fishSpecies || [];

  // Determine permissions based on ownership
  const isOwner = currentUserId && fishery.ownerId === currentUserId;
  const canEdit = isOwner;
  const canDelete = isOwner;
  const canAddCatchHere = true;

  // Extract statistics from the API response
  const statistics = fishery.statistics || {};
  const totalCatches = statistics.totalCatchesCount || 0;
  const totalAnglers = statistics.totalAnglers || 0;
  const totalCompetitions = statistics.totalCompetitions || 0;
  const lastCatchDate = statistics.lastCatchDate;

  // Fish species with catch data
  const enhancedFishSpecies = fishery.fishSpecies || [];

  // Handle delete fishery
  const handleDeleteFishery = async () => {
    if (!fishery.id) return;

    if (!window.confirm('Czy na pewno chcesz usunąć to łowisko? Tej operacji nie można cofnąć.')) {
      return;
    }

    try {
      await deleteFisheryMutation.mutateAsync({ id: fishery.id });

      // Invalidate all fisheries queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/fisheries'] });

      toast.success('Łowisko zostało usunięte!');
      router.push('/fisheries');
    } catch (error) {
      handleError(error);
    }
  };

  const pageActions: PageHeaderAction[] = [];

  if (canEdit) {
    pageActions.push({
      label: 'Edytuj',
      href: `/fisheries/${fishery.id}/edit`,
      icon: <Edit className="h-4 w-4" />
    });
  }

  if (canDelete) {
    pageActions.push({
      label: deleteFisheryMutation.isPending ? 'Usuwanie...' : 'Usuń',
      onClick: handleDeleteFishery,
      icon: deleteFisheryMutation.isPending ? undefined : <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      disabled: deleteFisheryMutation.isPending
    });
  }

  if (canAddCatchHere) {
    pageActions.push({
      label: 'Dodaj Połów',
      href: `/logbook/add?fisheryId=${fishery.id}`,
      icon: <Plus className="h-4 w-4" />
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader actions={pageActions.length > 0 ? pageActions : undefined} />

      {/* Hero Section with Fishery Image and Basic Info */}
      <div className="relative overflow-hidden rounded-lg shadow-lg">
        {fishery.imageUrl ? (
          <div className="relative h-48 sm:h-64 lg:h-80 w-full">
            <Image
              src={fishery.imageUrl}
              alt={`Zdjęcie łowiska ${fishery.name}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-md">{fishery.name}</h1>
              {fishery.location && (
                <div className="flex items-center text-sm sm:text-base opacity-90 drop-shadow-sm mb-2">
                  <MapPin className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />
                  {fishery.location}
                </div>
              )}
              {fishery.ownerName && (
                <div className="flex items-center text-sm opacity-80 drop-shadow-sm">
                  <User className="mr-1.5 h-4 w-4" />
                  Dodane przez: {fishery.ownerName}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-accent">{fishery.name}</h1>
            {fishery.location && (
              <div className="flex items-center text-sm sm:text-base text-accent mb-2">
                <MapPin className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5" />
                {fishery.location}
              </div>
            )}
            {fishery.ownerName && (
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-1.5 h-4 w-4" />
                Dodane przez: {fishery.ownerName}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Statistics Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Statystyki Łowiska</span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">{totalCatches}</div>
                  <div className="text-xs text-muted-foreground">Połowy</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">{totalAnglers}</div>
                  <div className="text-xs text-muted-foreground">Wędkarze</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">{totalCompetitions}</div>
                  <div className="text-xs text-muted-foreground">Zawody</div>
                </div>
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-foreground">
                    {lastCatchDate ? formatLastCatchDate(lastCatchDate) : '-'}
                  </div>
                  <div className="text-xs text-muted-foreground">Ostatni połów</div>
                </div>
              </div>
              {totalCatches === 0 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Brak zarejestrowanych połowów na tym łowisku
                </p>
              )}
            </div>
          </div>

          {/* Recent Catches Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Nadchodzące Zawody</span>
              </div>
            </div>
            <div className="p-4">
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">Brak nadchodzących zawodów na tym łowisku</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Lista zawodów zaplanowanych na tym łowisku będzie dostępna wkrótce
                </p>
                <Link href={`/competitions/add`}>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Organizuj zawody
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Catches Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <FishIcon className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Ostatnie Połowy</span>
              </div>
            </div>
            <div className="p-4">
              {totalCatches > 0 ? (
                <div className="text-center py-8">
                  <FishIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Lista ostatnich połowów będzie dostępna wkrótce</p>
                  <p className="text-sm text-muted-foreground">
                    Łącznie zarejestrowano {totalCatches} połowów na tym łowisku
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FishIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground mb-4">Brak zarejestrowanych połowów na tym łowisku</p>
                  <Link href={`/logbook/add?fisheryId=${fishery.id}`}>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj pierwszy połów
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fish Species Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Występujące Gatunki</span>
                <span className="ml-auto bg-black/20 text-slate-100 px-2 py-1 rounded-md text-xs font-medium">
                  {definedSpeciesForDisplay.length}
                </span>
              </div>
            </div>
            <div className="p-4">
              {definedSpeciesForDisplay.length > 0 ? (
                <div className="space-y-3">
                  {enhancedFishSpecies.map((species) => (
                    <div
                      key={species.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 flex items-center">
                        <FishImage
                          src={species.imageUrl}
                          alt={species.name || 'Ryba'}
                          className="w-10 h-10 rounded-md"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium truncate">{species.name}</span>
                          {species.catchesCount !== undefined && (
                            <div className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              {species.catchesCount} {species.catchesCount === 1 ? 'połów' : 'połowów'}
                            </div>
                          )}
                        </div>
                        {(species.averageLength || species.averageWeight) && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {species.averageLength && `Śr. długość: ${species.averageLength} cm`}
                            {species.averageLength && species.averageWeight && ' • '}
                            {species.averageWeight && `Śr. waga: ${species.averageWeight} kg`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <List className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Brak zdefiniowanych gatunków dla tego łowiska</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
