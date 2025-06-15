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

import { useApiError } from '@/hooks/use-api-error';
import { useDeleteExistingLogbookEntry, useGetLogbookEntryDetailsById } from '@/lib/api/endpoints/logbook';
import { HttpValidationProblemDetails, LogbookEntryDto, ProblemDetails } from '@/lib/api/models';

// Import useQueryClient

import { PageHeader, PageHeaderAction } from '@/components/layout/PageHeader';
// For loading state
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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

  // API error handling
  const { handleError } = useApiError();

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
        <PageHeader />
        <div className={`overflow-hidden rounded-lg border border-border shadow ${cardBodyBgClass}`}>
          <Skeleton className="relative w-full aspect-[4/3] sm:aspect-video bg-muted" />
          <div className="p-4 sm:p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
            <div>
              <Skeleton className="h-6 w-1/4 mb-1" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
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
      handleError(new Error('Entry ID is unknown or entry does not exist'));
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

  const pageActions: PageHeaderAction[] = [];

  if (canEditOrDelete && entry) {
    pageActions.push({
      label: 'Edytuj',
      href: `/logbook/${entry.id}/edit`,
      icon: <Edit className="h-4 w-4" />
    });

    pageActions.push({
      label: isDeletingEntry ? 'Usuwanie...' : 'Usuń',
      onClick: handleDeleteEntry,
      icon: isDeletingEntry ? undefined : <Trash2 className="h-4 w-4" />,
      variant: 'destructive' as const,
      disabled: isDeletingEntry || isLoading
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader onBack={() => router.push('/logbook')} actions={pageActions.length > 0 ? pageActions : undefined} />

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

      {/* Szczegóły Połowu - Jedna Karta */}
      <div className="border border-border rounded-lg overflow-hidden shadow-sm">
        <div className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-3 flex items-center space-x-2`}>
          <Fish className="h-4 w-4" />
          <span className="text-sm font-medium">Szczegóły połowu</span>
        </div>
        <div className={`p-4 ${cardBodyBgClass} space-y-4`}>
          {/* Gatunek ryby */}
          <div className="flex items-center space-x-3">
            <Fish className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Gatunek</p>
              <p
                className={`text-sm font-medium ${entry.fishSpeciesName ? cardTextColorClass : cardMutedTextColorClass}`}
              >
                {entry.fishSpeciesName || 'Nie podano'}
              </p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Data połowu */}
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Data połowu</p>
              <p className={`text-sm ${cardTextColorClass}`}>
                {entry.catchTime ? formatDate(entry.catchTime) : 'Brak danych'}
              </p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Długość */}
          <div className="flex items-center space-x-3">
            <Ruler className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Długość</p>
              <p className={`text-sm ${entry.lengthInCm ? cardTextColorClass : cardMutedTextColorClass}`}>
                {entry.lengthInCm ? `${entry.lengthInCm} cm` : 'Nie podano'}
              </p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Waga */}
          <div className="flex items-center space-x-3">
            <Weight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Waga</p>
              <p className={`text-sm ${entry.weightInKg ? cardTextColorClass : cardMutedTextColorClass}`}>
                {entry.weightInKg ? `${entry.weightInKg} kg` : 'Nie podano'}
              </p>
            </div>
          </div>

          <hr className="border-border" />

          {/* Łowisko */}
          <div className="flex items-center space-x-3">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Łowisko</p>
              {fisheryName && fisheryId ? (
                <Link href={`/fisheries/${fisheryId}`} className="text-sm text-primary hover:underline">
                  {fisheryName}
                </Link>
              ) : (
                <p className={`text-sm ${cardMutedTextColorClass}`}>Nie podano</p>
              )}
            </div>
          </div>

          <hr className="border-border" />

          {/* Notatki */}
          <div className="flex items-start space-x-3">
            <Edit className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Notatki</p>
              {entry.notes ? (
                <p className={`text-sm whitespace-pre-wrap ${cardTextColorClass}`}>{entry.notes}</p>
              ) : (
                <p className={`text-sm italic ${cardMutedTextColorClass}`}>Brak notatek</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
