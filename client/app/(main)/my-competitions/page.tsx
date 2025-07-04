'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Activity,
  Award,
  CheckCircle2,
  Clock,
  Edit,
  Filter,
  ListChecks,
  Plus,
  Search,
  ShieldCheck,
  Trophy,
  UserCheck
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useGetUserCompetitionsList } from '@/lib/api/endpoints/competitions';
import { CompetitionStatus } from '@/lib/api/models/competitionStatus';
import { MyCompetitionFilter } from '@/lib/api/models/myCompetitionFilter';
import { MyCompetitionSummaryDto } from '@/lib/api/models/myCompetitionSummaryDto';
import { ParticipantRole } from '@/lib/api/models/participantRole';

import { useDebounce } from '@/hooks/use-debounce';

import { PageHeader, PageHeaderAction } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Style nagłówka karty (dopasuj do navbara)
const cardHeaderBgClass = 'bg-slate-800';
const cardHeaderTextColorClass = 'text-slate-100';
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function MyCompetitionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<MyCompetitionFilter>(MyCompetitionFilter.All);
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 12;

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Track if search is currently pending
  const isSearchPending = searchTerm !== debouncedSearchTerm;

  const {
    data: competitionsData,
    isLoading,
    error,
    refetch
  } = useGetUserCompetitionsList({
    SearchTerm: debouncedSearchTerm || undefined,
    Filter: filter,
    PageNumber: pageNumber,
    PageSize: pageSize
  });

  const competitions = competitionsData?.items || [];

  const pageActions: PageHeaderAction[] = [
    {
      label: 'Utwórz Zawody',
      href: '/competitions/add',
      icon: <Plus className="h-4 w-4" />
    },
    {
      label: 'Wszystkie Zawody',
      href: '/competitions',
      icon: <Trophy className="h-4 w-4" />
    }
  ];

  const getStatusLabel = (status?: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.Ongoing:
        return 'Trwające';
      case CompetitionStatus.Finished:
        return 'Zakończone';
      case CompetitionStatus.Cancelled:
        return 'Anulowane';
      case CompetitionStatus.AcceptingRegistrations:
        return 'Rejestracja';
      case CompetitionStatus.Scheduled:
        return 'Zaplanowane';
      default:
        return 'Nieznany';
    }
  };

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

  const getRoleIconAndLabel = (competition: MyCompetitionSummaryDto) => {
    // First check if user is organizer
    if (competition.isOrganizer) {
      return { icon: <Edit className="h-3 w-3" />, label: 'Organizator' };
    }

    // Then check participant role
    switch (competition.userRole) {
      case ParticipantRole.Judge:
        return { icon: <ShieldCheck className="h-3 w-3" />, label: 'Sędzia' };
      case ParticipantRole.Competitor:
        return { icon: <UserCheck className="h-3 w-3" />, label: 'Uczestnik' };
      default:
        return { icon: <UserCheck className="h-3 w-3" />, label: 'Uczestnik' };
    }
  };

  // Reset page number when search term changes
  useEffect(() => {
    setPageNumber(1);
  }, [debouncedSearchTerm]);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader actions={pageActions} />

        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-center">
          <p className="text-destructive">Wystąpił błąd podczas ładowania zawodów.</p>
          <Button onClick={() => refetch()} variant="outline" className="mt-2">
            Spróbuj ponownie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader actions={pageActions} />

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
        <Select
          value={filter}
          onValueChange={(value) => {
            setFilter(value as MyCompetitionFilter);
            setPageNumber(1);
          }}
        >
          <SelectTrigger className="w-[140px] md:w-[180px]">
            <Filter className="h-4 w-4 md:mr-2" />
            <SelectValue placeholder="Filtruj" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MyCompetitionFilter.All}>Wszystkie</SelectItem>
            <SelectItem value={MyCompetitionFilter.Active}>Aktywne</SelectItem>
            <SelectItem value={MyCompetitionFilter.Finished}>Zakończone</SelectItem>
            <SelectItem value={MyCompetitionFilter.Organized}>Organizowane</SelectItem>
            <SelectItem value={MyCompetitionFilter.Judged}>Sędziowane</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="rounded-lg border border-border bg-card shadow">
                <div className="h-10 bg-slate-200 rounded-t-lg"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Siatka Kart Moich Zawodów */}
      {!isLoading && competitions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {competitions.map((comp) => {
            const userRole = getRoleIconAndLabel(comp);
            const statusInfo = getStatusStyles(comp.status);

            return (
              <Link key={comp.id} href={`/competitions/${comp.id}`} className="group flex flex-col">
                <div className="flex flex-col flex-grow overflow-hidden rounded-lg border border-border bg-card shadow transition-shadow group-hover:shadow-md">
                  {/* Nagłówek Karty */}
                  <div
                    className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} relative flex h-10 flex-shrink-0 items-center justify-between p-3`}
                  >
                    <div className="flex items-center space-x-2">
                      {comp.imageUrl && (
                        <div className="absolute inset-0 z-0">
                          <Image src={comp.imageUrl} alt="" fill className="object-cover opacity-20" />
                        </div>
                      )}
                      <div className="relative z-10 flex items-center space-x-2">
                        <Trophy className="h-4 w-4" />
                        <span className="text-xs font-medium truncate">Zawody</span>
                      </div>
                    </div>
                    {userRole.icon && (
                      <div className="relative z-10 flex items-center space-x-1 rounded-full bg-black/20 px-2 py-0.5">
                        {userRole.icon}
                        <span className="text-[10px] font-medium">{userRole.label}</span>
                      </div>
                    )}
                  </div>

                  {/* Treść Karty */}
                  <div className={`flex flex-grow flex-col justify-between p-3 ${cardBodyBgClass}`}>
                    <div>
                      <h3 className={`mb-1 truncate text-base font-semibold ${cardTextColorClass}`}>{comp.name}</h3>
                      <p className={`text-xs ${cardMutedTextColorClass}`}>
                        {comp.startTime ? format(new Date(comp.startTime), 'dd.MM.yyyy', { locale: pl }) : 'Brak daty'}
                      </p>
                      <p className={`truncate text-xs ${cardMutedTextColorClass}`}>
                        {comp.fisheryName || 'Brak lokalizacji'}
                      </p>

                      {/* Informacje o Kategoriach */}
                      {comp.primaryScoringInfo && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <ListChecks className="mr-1.5 h-3.5 w-3.5 text-primary" />
                            <span className="font-medium text-foreground/90">Główna:</span>
                            <span className="ml-1.5 truncate">{comp.primaryScoringInfo}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status na dole karty */}
                  <div
                    className={`flex items-center space-x-1 text-[10px] font-semibold p-2 ${statusInfo.textColor} ${statusInfo.bgColorClass}`}
                  >
                    {statusInfo.icon}
                    <span>{statusInfo.label}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : !isLoading ? (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            Nie jesteś jeszcze zapisany/a na żadne zawody ani żadnych nie organizujesz.
          </p>
          <Link href="/competitions" className="inline-block mr-2">
            <Button variant="outline">Przeglądaj Otwarte Zawody</Button>
          </Link>
          <Link href="/competitions/add" className="inline-block">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Stwórz Zawody
            </Button>
          </Link>
        </div>
      ) : null}

      {/* Pagination */}
      {!isLoading && competitionsData && competitionsData.totalPages && competitionsData.totalPages > 1 ? (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber === 1}
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground">
            Strona {pageNumber} z {competitionsData.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPageNumber(Math.min(competitionsData.totalPages || 1, pageNumber + 1))}
            disabled={pageNumber === competitionsData.totalPages}
          >
            Następna
          </Button>
        </div>
      ) : null}
    </div>
  );
}
