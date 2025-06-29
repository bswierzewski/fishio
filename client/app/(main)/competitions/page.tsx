'use client';

import { Activity, Award, CheckCircle2, Clock, Filter, ListChecks, Plus, Search, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useGetOpenCompetitionsList } from '@/lib/api/endpoints/competitions';
import { CompetitionSummaryDto } from '@/lib/api/models';
import { CompetitionStatus } from '@/lib/api/models/competitionStatus';

import { useDebounce } from '@/hooks/use-debounce';

import { PageHeader, PageHeaderAction } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Style nagłówka karty (dopasuj do navbara)
const cardHeaderBgClass = 'bg-slate-800'; // Użyj swoich zdefiniowanych klas lub zmiennych CSS
const cardHeaderTextColorClass = 'text-slate-100';
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function CompetitionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 12; // Show more competitions per page

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Track if search is currently pending
  const isSearchPending = searchTerm !== debouncedSearchTerm;

  // Fetch open competitions using the API
  const {
    data: competitionsResponse,
    isLoading,
    error,
    refetch
  } = useGetOpenCompetitionsList({
    PageNumber: pageNumber,
    PageSize: pageSize,
    SearchTerm: debouncedSearchTerm || undefined
  });

  const openCompetitions = competitionsResponse?.items || [];
  const hasNextPage = competitionsResponse?.hasNextPage || false;
  const hasPreviousPage = competitionsResponse?.hasPreviousPage || false;

  // Reset page number when search term changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  const getStatusStyles = (status?: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.Ongoing:
        return {
          textColor: 'text-green-500',
          icon: <Activity className="h-3.5 w-3.5" />,
          label: 'Trwające',
          bgColorClass: 'bg-green-500/10'
        };
      case CompetitionStatus.Scheduled:
      case CompetitionStatus.AcceptingRegistrations:
        return {
          textColor: 'text-blue-500',
          icon: <Clock className="h-3.5 w-3.5" />,
          label: status === CompetitionStatus.AcceptingRegistrations ? 'Rejestracja' : 'Zaplanowane',
          bgColorClass: 'bg-blue-500/10'
        };
      case CompetitionStatus.Finished:
        return {
          textColor: 'text-slate-500',
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: 'Zakończone',
          bgColorClass: 'bg-slate-500/10'
        };
      case CompetitionStatus.Cancelled:
        return {
          textColor: 'text-red-500',
          icon: <Clock className="h-3.5 w-3.5" />,
          label: 'Anulowane',
          bgColorClass: 'bg-red-500/10'
        };
      default:
        return {
          textColor: 'text-muted-foreground',
          icon: <Trophy className="h-3.5 w-3.5" />,
          label: 'Nieznany',
          bgColorClass: 'bg-muted/10'
        };
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPageNumber((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const pageActions: PageHeaderAction[] = [
    {
      label: 'Utwórz Zawody',
      href: '/competitions/add',
      icon: <Plus className="h-4 w-4" />
    },
    {
      label: 'Moje Zawody',
      href: '/my-competitions',
      icon: <Trophy className="h-4 w-4" />
    }
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader description="Przeglądaj i dołączaj do otwartych zawodów wędkarskich" actions={pageActions} />

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj po nazwie zawodów lub łowisku..."
              className="w-full rounded-lg bg-card pl-9 border-border"
              value={searchTerm || ''}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled
            />
          </div>
          <Button variant="outline" disabled>
            <Filter className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Filtruj</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex flex-col">
              <div className="flex flex-col flex-grow overflow-hidden rounded-lg border border-border bg-card shadow animate-pulse">
                <div className={`${cardHeaderBgClass} h-10 flex-shrink-0`} />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader actions={pageActions} />

        <div className="mt-8 rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <p className="text-destructive mb-4">Wystąpił błąd podczas ładowania zawodów.</p>
          <Button onClick={() => refetch()} variant="outline">
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Przeglądaj i dołączaj do otwartych zawodów wędkarskich" actions={pageActions} />

      {/* Pasek Wyszukiwania i Filtrowania */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search
            className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
              isSearchPending ? 'text-blue-500 animate-pulse' : 'text-muted-foreground'
            }`}
          />
          <Input
            type="search"
            placeholder="Szukaj po nazwie zawodów lub łowisku..."
            className={`w-full rounded-lg bg-card pl-9 transition-colors ${
              isSearchPending ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-border'
            }`}
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Filtruj</span>
        </Button>
      </div>

      {/* Siatka Kart Zawodów */}
      {openCompetitions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {openCompetitions.map((comp: CompetitionSummaryDto) => {
              const startDate = comp.startTime ? new Date(comp.startTime) : null;
              const statusStyles = getStatusStyles(comp.status);

              return (
                <Link href={`/competitions/${comp.id}`} key={comp.id} className="group flex flex-col">
                  <div className="flex flex-col flex-grow overflow-hidden rounded-lg border border-border bg-card shadow transition-shadow group-hover:shadow-md">
                    {/* Nagłówek Karty */}
                    <div
                      className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} relative flex h-10 flex-shrink-0 items-center space-x-2 p-3`}
                    >
                      {comp.imageUrl && (
                        <Image src={comp.imageUrl} alt="" fill className="opacity-20 z-0 object-cover" />
                      )}
                      <div className="relative z-10 flex items-center space-x-2">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs font-medium truncate">Zawody</span>
                      </div>
                    </div>

                    {/* Treść Karty */}
                    <div className={`flex flex-grow flex-col justify-between p-3 ${cardBodyBgClass}`}>
                      <div>
                        <h3 className={`mb-1 truncate text-base font-semibold ${cardTextColorClass}`}>
                          {comp.name || 'Bez nazwy'}
                        </h3>
                        <p className={`text-xs ${cardMutedTextColorClass}`}>
                          {startDate ? startDate.toLocaleDateString('pl-PL') : 'Brak daty'}
                        </p>
                        <p className={`truncate text-xs ${cardMutedTextColorClass}`}>
                          {comp.fisheryName || 'Brak lokalizacji'}
                        </p>

                        {/* Informacje o Kategorii Głównej */}
                        {comp.primaryScoringInfo && (
                          <div className="mt-2 pt-2 border-t border-border/50">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <ListChecks className="mr-1.5 h-3.5 w-3.5 text-primary" />
                              <span className="font-medium text-foreground/90">Główna:</span>
                              <span className="ml-1.5 truncate">{comp.primaryScoringInfo}</span>
                            </div>
                          </div>
                        )}

                        {/* Liczba uczestników */}
                        {comp.participantsCount !== undefined && comp.participantsCount > 0 && (
                          <div className={`mt-1.5 ${!comp.primaryScoringInfo ? 'pt-2 border-t border-border/50' : ''}`}>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Award className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                              <span className="font-medium text-foreground/90">Uczestnicy:</span>
                              <span className="ml-1.5">{comp.participantsCount}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status na dole karty */}
                    <div
                      className={`flex items-center space-x-1 text-[10px] font-semibold p-2 ${statusStyles.textColor} ${statusStyles.bgColorClass}`}
                    >
                      {statusStyles.icon}
                      <span>{statusStyles.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {(hasNextPage || hasPreviousPage) && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button variant="outline" onClick={handlePreviousPage} disabled={!hasPreviousPage}>
                Poprzednia
              </Button>
              <span className="text-sm text-muted-foreground">Strona {pageNumber}</span>
              <Button variant="outline" onClick={handleNextPage} disabled={!hasNextPage}>
                Następna
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            {debouncedSearchTerm
              ? `Nie znaleziono zawodów pasujących do "${debouncedSearchTerm}".`
              : 'Nie znaleziono otwartych zawodów, do których możesz dołączyć.'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {debouncedSearchTerm
              ? 'Spróbuj innych słów kluczowych lub sprawdź sekcję "Moje Zawody".'
              : 'Sprawdź sekcję "Moje Zawody", aby zobaczyć zawody w których już uczestniczysz.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
            {debouncedSearchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')} className="mb-2 sm:mb-0">
                <Search className="mr-2 h-4 w-4" /> Wyczyść Wyszukiwanie
              </Button>
            )}
            <Link href="/competitions/add" className="inline-block">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" /> Stwórz Nowe Zawody
              </Button>
            </Link>
            <Link href="/my-competitions" className="inline-block">
              <Button variant="outline">
                <Trophy className="mr-2 h-4 w-4" /> Moje Zawody
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
