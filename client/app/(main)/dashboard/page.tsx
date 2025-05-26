'use client';

import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Fish,
  // Ikona dla braku połowów
  ListChecks,
  // Ikona dla braku zawodów
  MapPin,
  Plus,
  Search,
  // Ikona dla odkrywania
  Trophy
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useGetUserDashboardData } from '@/lib/api/endpoints/dashboard';
import {
  DashboardCompetitionSummaryDto,
  DashboardFisherySummaryDto,
  DashboardLogbookSummaryDto
} from '@/lib/api/models';
import { CompetitionStatus } from '@/lib/api/models';

import { useMediaQuery } from '@/hooks/use-media-query';

const cardHeaderBgClass = 'bg-secondary';
const cardHeaderTextColorClass = 'text-secondary-foreground';
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';
const cardHeight = 'h-46';

// --- Komponent Pomocniczy dla Karty Akcji ---
const ActionCard = ({
  href,
  text,
  icon: Icon,
  src,
  className = '' // Dodano className dla dodatkowych stylów
}: {
  href: string;
  text: string;
  icon: React.ElementType;
  src?: string;
  className?: string;
}) => (
  <Link href={href} className={`block w-44 flex-shrink-0 h-full ${className}`}>
    <div className="relative flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card p-3 text-center transition-colors hover:bg-muted/50">
      {src && <Image src={src} alt="" layout="fill" objectFit="contain" className="opacity-10 z-0 p-4" />}
      <Icon className="h-8 w-8 text-primary mb-2 relative z-10" />
      <span className="text-sm font-medium text-foreground relative z-10">{text}</span>
    </div>
  </Link>
);

// --- Komponent Pomocniczy dla Placeholderu ---
const EmptySectionPlaceholder = ({ message, icon: Icon }: { message: string; icon: React.ElementType }) => (
  <div className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-border rounded-lg h-full w-full bg-muted/20">
    <Icon className="h-10 w-10 text-muted-foreground mb-3" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

// --- Główny Komponent Dashboardu ---
export default function DashboardPage() {
  const { data, isLoading, error } = useGetUserDashboardData({ MaxFeaturedItems: 8, MaxRecentItems: 8 });

  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');

  let sliceCount = 2;
  if (isLg) sliceCount = 8;
  else if (isMd) sliceCount = 6;
  else if (isSm) sliceCount = 3;

  const getStatusStyles = (status?: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.Ongoing:
        return {
          borderColor: 'border-green-500',
          textColor: 'text-green-500',
          icon: <Activity className="h-3.5 w-3.5" />,
          label: 'Trwające',
          bgColorClass: 'bg-green-500/10'
        };
      case CompetitionStatus.Upcoming:
      case CompetitionStatus.Scheduled:
      case CompetitionStatus.AcceptingRegistrations:
        return {
          borderColor: 'border-blue-500',
          textColor: 'text-blue-500',
          icon: <Clock className="h-3.5 w-3.5" />,
          label: 'Nadchodzące',
          bgColorClass: 'bg-blue-500/10'
        };
      case CompetitionStatus.Finished:
        return {
          borderColor: 'border-slate-500',
          textColor: 'text-slate-500',
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: 'Zakończone',
          bgColorClass: 'bg-slate-500/10'
        };
      case CompetitionStatus.Cancelled:
        return {
          borderColor: 'border-red-500',
          textColor: 'text-red-500',
          icon: <Clock className="h-3.5 w-3.5" />,
          label: 'Anulowane',
          bgColorClass: 'bg-red-500/10'
        };
      default:
        return {
          borderColor: 'border-border',
          textColor: 'text-muted-foreground',
          icon: null,
          label: status ? String(status) : 'Nieznany',
          bgColorClass: 'bg-muted/10'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Ładowanie panelu głównego...</p>
      </div>
    );
  }

  if (error) {
    console.error('Błąd podczas ładowania danych dashboardu:', error);
    return (
      <div className="text-red-500 text-center mt-10 p-4">
        Wystąpił błąd podczas ładowania danych. Spróbuj ponownie później.
      </div>
    );
  }

  // Nawet jeśli 'data' jest null, chcemy wyświetlić strukturę i ActionCards
  const myCompetitions = [...(data?.myUpcomingCompetitions || []), ...(data?.myRecentCompetitions || [])].slice(
    0,
    sliceCount
  );

  const recentCatches = (data?.recentLogbookEntries || []).slice(0, sliceCount);
  const openCompetitions = (data?.openCompetitions || []).slice(0, sliceCount);
  const featuredFisheries = (data?.featuredFisheries || []).slice(0, sliceCount);

  return (
    <div>
      {/* --- Sekcja Moje Zawody --- */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-foreground">Moje Zawody</h2>
        <div className={`flex space-x-4 overflow-x-auto pb-4 ${cardHeight} items-stretch`}>
          {myCompetitions.length > 0 ? (
            myCompetitions.map((comp: DashboardCompetitionSummaryDto) => {
              const statusInfo = getStatusStyles(comp.status);
              return (
                <Link
                  href={`/competitions/${comp.id}`}
                  className="w-44 flex-shrink-0 h-full" // h-full dodane
                  key={`my-comp-${comp.id}`}
                >
                  <div className="h-full flex-shrink-0 overflow-hidden rounded-lg shadow border border-border flex flex-col bg-card hover:shadow-md transition-shadow">
                    <div
                      className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-2 flex items-center space-x-1.5 relative h-9 flex-shrink-0`}
                    >
                      <div className="relative z-10 flex items-center space-x-1">
                        <Trophy className="h-4 w-4" />
                        <span className="text-[12px] font-medium truncate">Zawody</span>
                      </div>
                    </div>
                    <div className={`p-2 flex-grow flex flex-col justify-between ${cardBodyBgClass}`}>
                      <div>
                        <h3 className={`text-sm font-semibold ${cardTextColorClass} truncate`}>{comp.name}</h3>
                        <p className={`text-xs ${cardMutedTextColorClass}`}>
                          {new Date(comp.startTime ?? new Date()).toLocaleDateString('pl-PL')}
                        </p>
                        <p className={`text-xs ${cardMutedTextColorClass} truncate`}>
                          {comp.fisheryName || 'Brak lokalizacji'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-1 text-[10px] font-semibold p-2 ${statusInfo.textColor} ${statusInfo.bgColorClass}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <EmptySectionPlaceholder
              message="Nie bierzesz udziału w żadnych nadchodzących zawodach. Stwórz własne lub dołącz do istniejących!"
              icon={ListChecks}
            />
          )}
          {/* Karta akcji zawsze widoczna */}
          <ActionCard
            href="/my-competitions"
            text="Moje Zawody"
            icon={Trophy} // Zmieniono ikonę na bardziej pasującą
            src="/laurel_wreath_black.svg"
            className={featuredFisheries.length === 0 && !isSm ? 'hidden' : ''} // Dodaj margines, jeśli placeholder jest widoczny
          />
        </div>
      </section>

      {/* --- Sekcja Ostatnie Połowy --- */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-foreground">Ostatnie Połowy</h2>
        <div className={`flex space-x-4 overflow-x-auto pb-4 ${cardHeight} items-stretch`}>
          {recentCatches.length > 0 ? (
            recentCatches.map((entry: DashboardLogbookSummaryDto) => (
              <Link href={`/logbook/${entry.id}`} className="w-44 flex-shrink-0 h-full" key={`log-${entry.id}`}>
                <div className="h-full w-full overflow-hidden rounded-lg shadow border border-border flex flex-col bg-card hover:shadow-md transition-shadow">
                  <div className="relative h-full w-full bg-muted flex-shrink-0">
                    <Image
                      src={entry.imageUrl || '/placeholder-fish.svg'}
                      alt={entry.fishSpeciesName || 'Złowiona ryba'}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptySectionPlaceholder message="Brak zarejestrowanych połowów. Dodaj swój pierwszy połów!" icon={Fish} />
          )}
          <ActionCard href="/logbook/add" text="Dodaj Nowy Połów" icon={Plus} src="/koi.svg" />
        </div>
      </section>

      {/* --- Sekcja Odkryj Otwarte Zawody --- */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-foreground">Odkryj Otwarte Zawody</h2>
        <div className={`flex space-x-4 overflow-x-auto pb-4 ${cardHeight} items-stretch`}>
          {openCompetitions.length > 0 ? (
            openCompetitions.map((comp: DashboardCompetitionSummaryDto) => (
              <Link
                href={`/competitions/${comp.id}`}
                className="w-44 flex-shrink-0 h-full"
                key={`open-comp-${comp.id}`}
              >
                <div className="h-full w-full overflow-hidden rounded-lg shadow border border-border flex flex-col bg-card hover:shadow-md transition-shadow">
                  <div
                    className={`${cardHeaderBgClass} ${cardHeaderTextColorClass} p-3 flex items-center space-x-2 relative h-10 flex-shrink-0`}
                  >
                    <div className="relative z-10 flex items-center space-x-2">
                      <Trophy className="h-4 w-4" />
                      <span className="text-xs font-medium truncate">Otwarte Zawody</span>
                    </div>
                  </div>
                  <div className={`p-3 flex-grow flex flex-col justify-between ${cardBodyBgClass}`}>
                    <div>
                      <h3 className={`text-sm font-semibold ${cardTextColorClass} mb-1 truncate`}>{comp.name}</h3>
                      <p className={`text-xs ${cardMutedTextColorClass}`}>
                        {new Date(comp.startTime ?? new Date()).toLocaleDateString('pl-PL')}
                      </p>
                      <p className={`text-xs ${cardMutedTextColorClass} truncate`}>
                        {comp.fisheryName || 'Brak lokalizacji'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptySectionPlaceholder
              message="Obecnie brak otwartych zawodów. Sprawdź później lub stwórz własne!"
              icon={Search}
            />
          )}
          <ActionCard href="/competitions" text="Przeglądaj Zawody" icon={ArrowRight} src="/laurel_wreath_green.svg" />
        </div>
      </section>

      {/* --- Sekcja Lista Łowisk --- */}
      <section>
        <h2 className="text-xl font-bold mb-4 text-foreground">Polecane Łowiska</h2>
        <div className={`flex space-x-4 overflow-x-auto pb-4 ${cardHeight} items-stretch`}>
          {featuredFisheries.length > 0 ? (
            featuredFisheries.map((fishery: DashboardFisherySummaryDto) => (
              <Link
                href={`/fisheries/${fishery.id}`}
                className="w-44 flex-shrink-0 h-full group"
                key={`fishery-${fishery.id}`}
              >
                <div className="relative h-full w-full flex-shrink-0 overflow-hidden rounded-lg shadow border border-border flex flex-col justify-end hover:shadow-md transition-shadow">
                  {fishery.imageUrl ? (
                    <Image
                      src={fishery.imageUrl}
                      alt={fishery.name ?? 'Łowisko'}
                      layout="fill"
                      objectFit="cover"
                      className="z-0 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center z-0">
                      <MapPin className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
                  <div className="relative z-20 p-3 text-white">
                    <h3 className="text-sm font-semibold drop-shadow-sm truncate">{fishery.name}</h3>
                    <p className="text-xs opacity-90 drop-shadow-sm truncate">
                      {fishery.location || 'Brak lokalizacji'}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptySectionPlaceholder
              message="Brak polecanych łowisk. Dodaj nowe łowisko do naszej bazy!"
              icon={MapPin} // Lub inna ikona
            />
          )}
          <ActionCard
            href="/fisheries/add"
            text="Dodaj Łowisko"
            icon={Plus}
            src="/pond.svg"
            className={featuredFisheries.length === 0 && !isSm ? 'hidden' : ''} // Ukryj na mobilce jeśli placeholder
          />
        </div>
      </section>
    </div>
  );
}
