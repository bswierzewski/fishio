'use client';

import { Award, Filter, ListChecks, Plus, Search, Trophy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useGetOpenCompetitionsList } from '@/lib/api/endpoints/competitions';
import { CompetitionSummaryDto } from '@/lib/api/models';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Style nagłówka karty (dopasuj do navbara)
const cardHeaderBgClass = 'bg-slate-800'; // Użyj swoich zdefiniowanych klas lub zmiennych CSS
const cardHeaderTextColorClass = 'text-slate-100';
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function CompetitionsPage() {
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 12; // Show more competitions per page

  // Fetch open competitions using the API
  const {
    data: competitionsResponse,
    isLoading,
    error,
    refetch
  } = useGetOpenCompetitionsList({
    PageNumber: pageNumber,
    PageSize: pageSize
  });

  const openCompetitions = competitionsResponse?.items || [];
  const hasNextPage = competitionsResponse?.hasNextPage || false;
  const hasPreviousPage = competitionsResponse?.hasPreviousPage || false;

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

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Otwarte Zawody</h1>
          <Link href="/competitions/add">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Stwórz Nowe Zawody
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Szukaj zawodów..."
              className="w-full rounded-lg bg-card pl-9 border-border"
              disabled
            />
          </div>
          <Button variant="outline" disabled>
            <Filter className="mr-2 h-4 w-4" /> Filtruj
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
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Otwarte Zawody</h1>
          <Link href="/competitions/add">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Stwórz Nowe Zawody
            </Button>
          </Link>
        </div>

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
      {/* Nagłówek strony i przycisk dodawania */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Otwarte Zawody</h1>
        <Link href="/competitions/add">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Stwórz Nowe Zawody
          </Button>
        </Link>
      </div>

      {/* Pasek Wyszukiwania i Filtrowania */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Szukaj zawodów..."
            className="w-full rounded-lg bg-card pl-9 border-border"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filtruj
        </Button>
      </div>

      {/* Siatka Kart Zawodów */}
      {openCompetitions.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {openCompetitions.map((comp: CompetitionSummaryDto) => {
              const startDate = comp.startTime ? new Date(comp.startTime) : null;

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
            {/* {searchTerm ? 'Nie znaleziono zawodów pasujących do wyszukiwania.' : 'Nie znaleziono otwartych zawodów.'} */}
            {'Nie znaleziono otwartych zawodów.'}
          </p>
          <Link href="/competitions/add" className="mt-4 inline-block">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Stwórz Pierwsze Zawody
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
