'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { BarChart3, Calendar, Edit, Fish as FishIcon, List, MapPin, Plus, Trophy, User, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect } from 'react';

import { useGetFisheryById } from '@/lib/api/endpoints/fisheries';
// Assuming DTOs from generated API client
import { FishSpeciesSimpleDto, FisheryDto } from '@/lib/api/models';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const formatDateInternal = (dateInput: Date | string | number) => {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  return format(date, 'dd MMMM yyyy', { locale: pl });
};

export default function FisheryDetailPage() {
  const params = useParams();
  const idParam = params.id as string;
  const fisheryId = parseInt(idParam, 10);

  // Fetch fishery data using the hook
  const {
    data: fishery,
    isLoading,
    error,
    isError
  } = useGetFisheryById(fisheryId, {
    query: { enabled: !isNaN(fisheryId) }
  });

  useEffect(() => {
    if (isNaN(fisheryId)) {
      notFound();
      return;
    }
    if (!isLoading && (isError || !fishery)) {
      notFound();
    }
  }, [isLoading, isError, fishery, fisheryId]);

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
  const canEdit = true; // This might come from user permissions or API in a real app
  const canAddCatchHere = true;

  return (
    <div className="space-y-6">
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
              {fishery.userName && (
                <div className="flex items-center text-sm opacity-80 drop-shadow-sm">
                  <User className="mr-1.5 h-4 w-4" />
                  Dodane przez: {fishery.userName}
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
            {fishery.userName && (
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="mr-1.5 h-4 w-4" />
                Dodane przez: {fishery.userName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {canEdit && (
          <Link href={`/fisheries/${fishery.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edytuj Łowisko
            </Button>
          </Link>
        )}
        {canAddCatchHere && (
          <Link href={`/logbook/add?fisheryId=${fishery.id}`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Dodaj Połów
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Fishery Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FishIcon className="h-5 w-5" />
                Informacje o Łowisku
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {fishery.created && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Dodano:</span>
                    <span className="font-medium">{formatDateInternal(fishery.created)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <List className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Gatunki ryb:</span>
                  <span className="font-medium">{definedSpeciesForDisplay.length}</span>
                </div>
              </div>

              {/* Placeholder for future statistics when detailed endpoint is available */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Statystyki</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-muted-foreground">-</div>
                    <div className="text-xs text-muted-foreground">Połowy</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-muted-foreground">-</div>
                    <div className="text-xs text-muted-foreground">Wędkarze</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-muted-foreground">-</div>
                    <div className="text-xs text-muted-foreground">Zawody</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-muted-foreground">-</div>
                    <div className="text-xs text-muted-foreground">Ostatni połów</div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Szczegółowe statystyki będą dostępne wkrótce
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Catches Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FishIcon className="h-5 w-5" />
                Ostatnie Połowy
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Fish Species Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Występujące Gatunki
                <span className="ml-auto bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm font-medium">
                  {definedSpeciesForDisplay.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {definedSpeciesForDisplay.length > 0 ? (
                <div className="space-y-2">
                  {definedSpeciesForDisplay.map((species: FishSpeciesSimpleDto) => (
                    <div
                      key={species.id}
                      className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <FishIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium">{species.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <List className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Brak zdefiniowanych gatunków dla tego łowiska</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
