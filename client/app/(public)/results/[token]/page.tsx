'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Activity, Award, BarChart3, Clock, Fish, Hourglass, PieChart, TrendingUp, Trophy, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

import { useGetResultsByToken } from '@/lib/api/endpoints/public-results';
import { CompetitionStatus } from '@/lib/api/models';

import { Skeleton } from '@/components/ui/skeleton';

// Style dla jasnego motywu (spójne z resztą aplikacji)
const sectionHeaderBgClass = 'bg-slate-800'; // Ciemny nagłówek sekcji
const sectionHeaderTextColorClass = 'text-slate-100'; // Jasny tekst w nagłówku

const formatDateTime = (dateString: string) => {
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: pl });
};

export default function PublicResultsPage() {
  const params = useParams();
  const token = params.token as string;

  const { data: competitionResults, isLoading, error } = useGetResultsByToken(token);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground py-8 sm:py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80">
              🐟 Fishio - Ładowanie wyników...
            </Link>
          </div>
          <div className="rounded-lg shadow-xl overflow-hidden bg-card border border-border">
            <div className={`${sectionHeaderBgClass} ${sectionHeaderTextColorClass} p-4 sm:p-6 text-center`}>
              <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 rounded-full" />
              <Skeleton className="h-8 w-64 mx-auto mb-2" />
              <Skeleton className="h-4 w-48 mx-auto" />
            </div>
            <div className="p-6 sm:p-8">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competitionResults) {
    notFound();
  }

  const competition = competitionResults;
  const results = competition.mainRanking || [];
  const specialCategories = competition.specialCategoriesResults || [];

  // Prepare chart data
  const mainChartData = results.slice(0, 5).map((r) => ({
    name: r.name?.split(' ').slice(0, 2).join(' ') || 'Uczestnik',
    score: r.totalScore || 0
  }));

  const categoriesChartData = specialCategories
    .filter((cat) => cat.winners && cat.winners.length > 0)
    .map((cat) => ({
      category: cat.categoryName || 'Kategoria',
      winner: cat.winners?.[0]?.participantName || 'Nieznany',
      value: cat.winners?.[0]?.value || 0
    }));

  return (
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80">
            🐟 Fishio - {competition.status === CompetitionStatus.Ongoing ? 'Wyniki na Żywo' : 'Wyniki Zawodów'}
          </Link>
        </div>

        {/* Karta główna */}
        <div className="rounded-lg shadow-xl overflow-hidden bg-card border border-border">
          {/* Nagłówek Karty z info o zawodach */}
          <div className={`${sectionHeaderBgClass} ${sectionHeaderTextColorClass} p-4 sm:p-6 text-center`}>
            {competition.competitionImageUrl && (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 rounded-full overflow-hidden border-4 border-slate-300 shadow-md">
                <Image
                  src={competition.competitionImageUrl}
                  alt={competition.competitionName || 'Zawody'}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold mb-1">{competition.competitionName}</h1>
            <div className="flex items-center justify-center text-xs sm:text-sm opacity-90">
              <Clock className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                {(competition.status === CompetitionStatus.Scheduled ||
                  competition.status === CompetitionStatus.AcceptingRegistrations) &&
                  competition.startTime &&
                  `Rozpoczęcie: ${formatDateTime(competition.startTime)}`}
                {competition.status === CompetitionStatus.Ongoing &&
                  competition.endTime &&
                  `Trwają (do: ${formatDateTime(competition.endTime)})`}
                {competition.status === CompetitionStatus.Finished &&
                  competition.endTime &&
                  `Zakończono: ${formatDateTime(competition.endTime)}`}
              </span>
            </div>
          </div>

          {/* --- Zawartość zależna od statusu --- */}
          {(competition.status === CompetitionStatus.Scheduled ||
            competition.status === CompetitionStatus.AcceptingRegistrations) && (
            <div className="p-6 sm:p-8 text-center bg-card">
              <Hourglass className="mx-auto h-16 w-16 mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Zawody jeszcze się nie rozpoczęły</h2>
              <p className="text-muted-foreground text-sm">
                {competition.upcomingMessage ||
                  'Oficjalne wyniki pojawią się tutaj po zakończeniu zawodów. Zapraszamy do śledzenia strony!'}
              </p>
              {competition.startTime && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Planowany start: {formatDateTime(competition.startTime)}
                </p>
              )}
            </div>
          )}

          {(competition.status === CompetitionStatus.Ongoing || competition.status === CompetitionStatus.Finished) &&
            results.length > 0 && (
              <>
                {/* Główna Tabela Wyników */}
                <div className="p-4 sm:p-6 bg-card">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-foreground">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    {competition.status === CompetitionStatus.Ongoing
                      ? 'Wyniki na Żywo (Nieoficjalne)'
                      : 'Oficjalne Wyniki (Klasyfikacja Główna)'}
                    {competition.primaryScoringCategoryName && (
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({competition.primaryScoringCategoryName})
                      </span>
                    )}
                  </h2>
                  {competition.status === CompetitionStatus.Ongoing && competition.liveRankingPlaceholderMessage && (
                    <p className="text-sm text-muted-foreground mb-4">{competition.liveRankingPlaceholderMessage}</p>
                  )}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            #
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Uczestnik
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Liczba Ryb
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Wynik (Suma)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {results.map((result, index) => (
                          <tr
                            key={result.participantId || index}
                            className={`${index < 3 && competition.status === CompetitionStatus.Finished ? 'font-semibold bg-primary/10' : ''} hover:bg-muted/30`}
                          >
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{index + 1}.</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                              <div className="flex items-center">
                                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                                {result.name || 'Uczestnik'}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                              {result.fishCount !== undefined ? result.fishCount : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-foreground">
                              {result.totalScore?.toFixed(2) || '0.00'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sekcja Zwycięzców Kategorii Specjalnych (tylko dla zakończonych) */}
                {competition.status === CompetitionStatus.Finished && specialCategories.length > 0 && (
                  <div className="p-4 sm:p-6 border-t border-border bg-card">
                    <h2 className="text-lg font-semibold mb-4 flex items-center text-foreground">
                      <Award className="mr-2 h-5 w-5 text-amber-500" /> Zwycięzcy Kategorii Specjalnych
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {specialCategories.map(
                        (category, index) =>
                          category.winners &&
                          category.winners.length > 0 && (
                            <div key={index} className="p-4 rounded-lg bg-card border border-amber-500/30 shadow">
                              <h3 className="font-semibold text-amber-600 mb-1">{category.categoryName}</h3>
                              {category.winners.map((winner, winnerIndex) => (
                                <div key={winnerIndex} className="mb-2 last:mb-0">
                                  <p className="text-foreground text-lg font-bold">{winner.participantName}</p>
                                  <p className="text-muted-foreground text-sm">
                                    Wynik:{' '}
                                    <span className="font-medium text-amber-700">
                                      {winner.value?.toFixed(2)} {winner.unit}
                                      {winner.fishSpeciesName && ` (${winner.fishSpeciesName})`}
                                    </span>
                                  </p>
                                </div>
                              ))}
                              {category.categoryDescription && (
                                <p className="text-xs text-muted-foreground mt-1">({category.categoryDescription})</p>
                              )}
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}

                {/* Sekcja Wykresów */}
                <div className="p-4 sm:p-6 border-t border-border bg-card grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-semibold mb-3 flex items-center text-foreground">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      {competition.status === CompetitionStatus.Ongoing
                        ? 'Ranking na Żywo'
                        : 'Ranking Ogólny'} (Top {mainChartData.length})
                    </h3>
                    <div className="flex items-center justify-center h-56 sm:h-64 rounded-lg border-2 border-dashed border-border text-muted-foreground text-sm p-4">
                      Placeholder dla Wykresu Słupkowego (Wyniki:{' '}
                      {mainChartData.map((d) => `${d.name}: ${d.score.toFixed(2)}`).join('; ')})
                    </div>
                  </div>
                  {competition.status === CompetitionStatus.Finished && (
                    <div>
                      <h3 className="text-md font-semibold mb-3 flex items-center text-foreground">
                        <PieChart className="mr-2 h-5 w-5" /> Analiza Kategorii (Przykład)
                      </h3>
                      <div className="flex items-center justify-center h-56 sm:h-64 rounded-lg border-2 border-dashed border-border text-muted-foreground text-sm p-4">
                        Placeholder dla Wykresu (np. kołowy dla kategorii:{' '}
                        {categoriesChartData.map((d) => `${d.category}: ${d.value}`).join('; ')})
                      </div>
                    </div>
                  )}
                </div>
                {competition.finishedChartsPlaceholderMessage && (
                  <p className="text-xs p-4 text-center text-muted-foreground bg-card">
                    {competition.finishedChartsPlaceholderMessage}
                  </p>
                )}
              </>
            )}

          {(competition.status === CompetitionStatus.Ongoing || competition.status === CompetitionStatus.Finished) &&
            results.length === 0 && (
              <div className="p-6 sm:p-8 text-center bg-card">
                <Fish className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Brak zarejestrowanych wyników.</p>
              </div>
            )}

          {competition.status === CompetitionStatus.Cancelled && (
            <div className="p-6 sm:p-8 text-center bg-card">
              <Hourglass className="mx-auto h-16 w-16 mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Zawody zostały anulowane</h2>
              <p className="text-muted-foreground text-sm">
                {competition.upcomingMessage || 'Te zawody zostały anulowane przez organizatora.'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs">
          <p className="text-muted-foreground">Wyniki wygenerowane przez Fishio &copy; {new Date().getFullYear()}</p>
          <Link href="/" className="block mt-1 text-primary hover:underline">
            Wróć do strony głównej Fishio
          </Link>
        </div>
      </div>
    </div>
  );
}
