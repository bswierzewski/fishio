'use client';

// Required for using client-side hooks
import { useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ArrowLeft, CalendarDays, Edit, Fish, MapPin, Ruler, Trash2, Weight } from 'lucide-react';
// For error state
import { Terminal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
// Import useParams & useRouter
import { toast } from 'react-hot-toast';

import { useDeleteExistingLogbookEntry, useGetLogbookEntryDetailsById } from '@/lib/api/endpoints/logbook';
import { HttpValidationProblemDetails, LogbookEntryDto, ProblemDetails } from '@/lib/api/models';

// For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Import useQueryClient

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const cardHeaderBgClass = 'bg-secondary';
const cardHeaderTextColorClass = 'text-secondary-foreground';
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

const formatDate = (date: Date | string) => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd MMMM yyyy, HH:mm', { locale: pl });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Nieprawidłowa data';
  }
};

export default function LogbookEntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient(); // Get queryClient instance
  const id = params.id as string;

  const {
    data: entry,
    isLoading,
    isError,
    error
  } = useGetLogbookEntryDetailsById(parseInt(id, 10), {
    query: {
      enabled: !!id,
      refetchOnMount: 'always'
    }
  });

  const { mutate: deleteLogbookEntry, isPending: isDeletingEntry } = useDeleteExistingLogbookEntry();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-36" /> {/* Back button placeholder */}
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9" /> {/* Edit button placeholder */}
            <Skeleton className="h-9 w-9" /> {/* Delete button placeholder */}
          </div>
        </div>
        <div className={`overflow-hidden rounded-lg border border-border shadow ${cardBodyBgClass}`}>
          <Skeleton className="relative w-full aspect-[4/3] sm:aspect-video bg-muted" /> {/* Image placeholder */}
          <div className="p-4 sm:p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" /> {/* Species name placeholder */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-1/4 mb-1" /> {/* Notes title placeholder */}
              <Skeleton className="h-10 w-full" /> {/* Notes content placeholder */}
            </div>
          </div>
        </div>
        {/* Footer card skeleton */}
        <div className={`overflow-hidden rounded-lg border border-border shadow ${cardBodyBgClass}`}>
          <div className={`${cardHeaderBgClass} p-3 flex items-center space-x-2`}>
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="p-4">
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    let errorMessage = 'Spróbuj ponownie później.';
    if (error) {
      if (typeof error === 'object' && error !== null) {
        if ('detail' in error && typeof (error as any).detail === 'string') {
          errorMessage = (error as any).detail;
        } else if ('title' in error && typeof (error as any).title === 'string') {
          errorMessage = (error as any).title;
        } else if ('message' in error && typeof (error as any).message === 'string') {
          errorMessage = (error as any).message;
        }
      }
    }

    return (
      <Alert variant="destructive" className="mt-4">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Błąd</AlertTitle>
        <AlertDescription>Nie udało się załadować szczegółów wpisu. {errorMessage}</AlertDescription>
      </Alert>
    );
  }

  if (!entry) {
    notFound();
  }

  const fisheryName = entry.fisheryName;
  const fisheryId = entry.fisheryId;

  const handleDeleteEntry = () => {
    if (!entry || !entry.id) {
      toast.error('Błąd: ID wpisu jest nieznane lub wpis nie istnieje.');
      return;
    }

    if (window.confirm('Czy na pewno chcesz usunąć ten wpis z dziennika? Tej operacji nie można cofnąć.')) {
      deleteLogbookEntry(
        { id: entry.id },
        {
          onSuccess: () => {
            toast.success('Wpis w dzienniku został pomyślnie usunięty!');
            // Invalidate the query for the logbook entries list
            queryClient.invalidateQueries({
              queryKey: ['/api/logbook']
            });
            router.push('/logbook');
          },
          onError: (error: HttpValidationProblemDetails | ProblemDetails) => {
            console.error('Error deleting logbook entry:', error);
            // Don't show manual error toast - let the axios interceptor handle it
            // The interceptor will show user-friendly validation errors automatically
          }
        }
      );
    }
  };

  // Logika warunkowa dla przycisków (na razie uproszczona)
  const canEditOrDelete = true; // Załóżmy, że użytkownik jest właścicielem wpisu

  return (
    <div className="space-y-6">
      {/* Przycisk Powrotu i Tytuł */}
      <div className="flex items-center justify-between">
        <Link href="/logbook">
          <Button className="shadow" variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className={`text-2xl sm:text-3xl font-bold ${cardTextColorClass}`}>
          {entry.fishSpeciesName || 'Nieznany gatunek'}
        </h1>
        {/* Opcjonalnie: przyciski edycji/usuwania */}
        {canEditOrDelete && (
          <div className="flex gap-2">
            <Link href={`/logbook/${entry.id}/edit`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edytuj</span>
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDeleteEntry}
              disabled={isDeletingEntry || isLoading} // Disable if deleting or initial load in progress
            >
              {isDeletingEntry ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Usuń</span>
            </Button>
          </div>
        )}
      </div>

      {/* Zdjęcie Ryby */}
      <div className={`overflow-hidden rounded-lg border border-border shadow ${cardBodyBgClass}`}>
        <div className="relative w-full aspect-[4/3] sm:aspect-video bg-muted">
          <Image
            src={entry.imageUrl || '/koi.svg'} // Use existing koi.svg as fallback
            alt={`Zdjęcie ${entry.fishSpeciesName || 'ryby'}`} // Changed to fishSpeciesName and added fallback
            fill
            className="object-cover" // Updated to use className instead of objectFit
            priority
          />
        </div>
      </div>

      {/* Karty z Danymi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Date Card */}
        <div className="border border-border rounded-lg overflow-hidden shadow-sm">
          <div className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-3 flex items-center space-x-2`}>
            <CalendarDays className="h-4 w-4" />
            <span className="text-xs font-medium">Data połowu</span>
          </div>
          <div className={`p-3 ${cardBodyBgClass}`}>
            <p className={`text-sm ${cardTextColorClass}`}>
              {entry.catchTime ? formatDate(entry.catchTime) : 'Brak danych'}
            </p>
          </div>
        </div>

        {/* Length Card */}
        <div className="border border-border rounded-lg overflow-hidden shadow-sm">
          <div className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-3 flex items-center space-x-2`}>
            <Ruler className="h-4 w-4" />
            <span className="text-xs font-medium">Długość</span>
          </div>
          <div className={`p-3 ${cardBodyBgClass}`}>
            <p className={`text-sm ${entry.lengthInCm ? cardTextColorClass : cardMutedTextColorClass}`}>
              {entry.lengthInCm ? `${entry.lengthInCm} cm` : 'Nie podano'}
            </p>
          </div>
        </div>

        {/* Weight Card */}
        <div className="border border-border rounded-lg overflow-hidden shadow-sm">
          <div className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-3 flex items-center space-x-2`}>
            <Weight className="h-4 w-4" />
            <span className="text-xs font-medium">Waga</span>
          </div>
          <div className={`p-3 ${cardBodyBgClass}`}>
            <p className={`text-sm ${entry.weightInKg ? cardTextColorClass : cardMutedTextColorClass}`}>
              {entry.weightInKg ? `${entry.weightInKg} kg` : 'Nie podano'}
            </p>
          </div>
        </div>

        {/* Fishery Card */}
        <div className="border border-border rounded-lg overflow-hidden shadow-sm">
          <div className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-3 flex items-center space-x-2`}>
            <MapPin className="h-4 w-4" />
            <span className="text-xs font-medium">Łowisko</span>
          </div>
          <div className={`p-3 ${cardBodyBgClass}`}>
            {fisheryName && fisheryId ? (
              <Link href={`/fisheries/${fisheryId}`} className="text-sm text-primary hover:underline">
                {fisheryName}
              </Link>
            ) : (
              <p className={`text-sm ${cardMutedTextColorClass}`}>Nie podano</p>
            )}
          </div>
        </div>
      </div>

      {/* Notatki Card */}
      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <div className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-3 flex items-center space-x-2`}>
          <Edit className="h-4 w-4" />
          <span className="text-xs font-medium">Notatki</span>
        </div>
        <div className={`p-4 ${cardBodyBgClass}`}>
          {entry.notes ? (
            <p className={`text-sm whitespace-pre-wrap ${cardTextColorClass}`}>{entry.notes}</p>
          ) : (
            <p className={`text-sm italic ${cardMutedTextColorClass}`}>Brak notatek</p>
          )}
        </div>
      </div>
    </div>
  );
}
