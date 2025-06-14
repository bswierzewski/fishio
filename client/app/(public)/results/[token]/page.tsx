'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Award, Calendar, Clock, Fish, Home, MapPin, Medal, Star, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { useGetResultsByToken } from '@/lib/api/endpoints/public-results';
import { CategoryMetric, CompetitionStatus } from '@/lib/api/models';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicResultsPage() {
  const { token } = useParams<{ token: string }>();

  const { data: competitionResults, isLoading, error } = useGetResultsByToken(token);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !competitionResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-4">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="mb-4">
                <Trophy className="mx-auto h-16 w-16 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Nie znaleziono wyników</h2>
              <p className="text-gray-600">Zawody o podanym tokenie nie zostały znalezione lub nie są dostępne.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.Scheduled:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Zaplanowane
          </Badge>
        );
      case CompetitionStatus.AcceptingRegistrations:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Rejestracje otwarte
          </Badge>
        );
      case CompetitionStatus.Ongoing:
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            W trakcie
          </Badge>
        );
      case CompetitionStatus.Finished:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Zakończone
          </Badge>
        );
      case CompetitionStatus.Cancelled:
        return <Badge variant="destructive">Anulowane</Badge>;
      default:
        return <Badge variant="outline">Nieznany</Badge>;
    }
  };

  const getMetricUnit = (metric: CategoryMetric) => {
    switch (metric) {
      case CategoryMetric.WeightKg:
        return 'kg';
      case CategoryMetric.LengthCm:
        return 'cm';
      case CategoryMetric.FishCount:
        return 'szt.';
      case CategoryMetric.SpeciesVariety:
        return 'gatunków';
      default:
        return '';
    }
  };

  const formatScore = (score: number, metric: CategoryMetric) => {
    const unit = getMetricUnit(metric);
    if (metric === CategoryMetric.WeightKg) {
      return `${score.toFixed(2)} ${unit}`;
    }
    if (metric === CategoryMetric.LengthCm) {
      return `${score.toFixed(1)} ${unit}`;
    }
    return `${score} ${unit}`;
  };

  const getRankingRowClass = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200';
      case 1:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 2:
        return 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200';
      default:
        return 'bg-white border-gray-100 hover:bg-gray-50';
    }
  };

  const getRankingBadgeClass = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md';
      case 1:
        return 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-md';
      case 2:
        return 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  // Find primary scoring category
  const primaryCategory = competitionResults.categoryResults?.find((cat) => cat.isPrimaryScoring);
  const secondaryCategories = competitionResults.categoryResults?.filter((cat) => !cat.isPrimaryScoring) || [];

  // Determine appropriate message based on status
  const getStatusMessage = () => {
    switch (competitionResults.status) {
      case CompetitionStatus.Scheduled:
        return 'Zawody rozpoczną się zgodnie z harmonogramem. Wyniki będą dostępne po rozpoczęciu zawodów.';
      case CompetitionStatus.AcceptingRegistrations:
        return 'Rejestracje są otwarte. Wyniki będą dostępne po rozpoczęciu zawodów.';
      case CompetitionStatus.Ongoing:
        return 'Zawody trwają. Wyniki będą aktualizowane na bieżąco.';
      case CompetitionStatus.Cancelled:
        return 'Zawody zostały anulowane.';
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="p-2 z-50 shadow bg-secondary rounded-b-md">
        <div className="container mx-auto flex justify-between items-center">
          {/* Left placeholder for symmetry */}
          <div className="flex h-8 w-8 items-center justify-center">{/* Empty space for visual balance */}</div>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="Fishio Logo" width={24} height={24} className="flex-shrink-0" />
            <span className="font-bold uppercase text-background">Fishio</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1"></div>
        </div>
      </nav>

      <div className="py-8">
        <div className="mx-auto max-w-6xl px-4 space-y-6">
          {/* Competition Summary */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-medium truncate">Podsumowanie Zawodów</span>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{competitionResults.competitionName}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      <span>
                        {format(new Date(competitionResults.startTime!), 'dd.MM.yyyy HH:mm', { locale: pl })}
                        {' - '}
                        {format(new Date(competitionResults.endTime!), 'dd.MM.yyyy HH:mm', { locale: pl })}
                      </span>
                    </div>
                    {competitionResults.fisheryName && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>{competitionResults.fisheryName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {competitionResults.competitionImageUrl && (
                <div className="mb-4">
                  <img
                    src={competitionResults.competitionImageUrl}
                    alt={competitionResults.competitionName || 'Zdjęcie zawodów'}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-center gap-4 mb-6 text-center">
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full shadow-sm">
                  <Trophy className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">
                    {competitionResults.totalParticipants} uczestników
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-full shadow-sm">
                  <Medal className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">{competitionResults.totalCatches} połowów</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full shadow-sm">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">
                    {competitionResults.categoryResults?.length || 0} kategorii
                  </span>
                </div>
              </div>

              {/* Competition Status Information */}
              {competitionResults.status === CompetitionStatus.Finished && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center shadow">
                  <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">Zawody zakończone!</span>
                  </div>
                  <p className="text-green-600 text-sm">Gratulujemy wszystkim uczestnikom wspaniałych wyników!</p>
                </div>
              )}

              {competitionResults.status === CompetitionStatus.Ongoing && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center shadow">
                  <div className="flex items-center justify-center gap-2 text-yellow-700 mb-2">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Zawody trwają</span>
                  </div>
                  <p className="text-yellow-600 text-sm">{getStatusMessage()}</p>
                </div>
              )}

              {competitionResults.status === CompetitionStatus.Scheduled && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center shadow">
                  <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="font-semibold">Zawody zaplanowane</span>
                  </div>
                  <p className="text-blue-600 text-sm">{getStatusMessage()}</p>
                </div>
              )}

              {competitionResults.status === CompetitionStatus.AcceptingRegistrations && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center shadow">
                  <div className="flex items-center justify-center gap-2 text-green-700 mb-2">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">Rejestracje otwarte</span>
                  </div>
                  <p className="text-green-600 text-sm">{getStatusMessage()}</p>
                </div>
              )}

              {competitionResults.status === CompetitionStatus.Cancelled && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center shadow">
                  <div className="flex items-center justify-center gap-2 text-red-700 mb-2">
                    <div className="text-lg">⚠️</div>
                    <span className="font-semibold">Zawody anulowane</span>
                  </div>
                  <p className="text-red-600 text-sm">{getStatusMessage()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Primary Category Ranking */}
          {primaryCategory && primaryCategory.rankings && primaryCategory.rankings.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                <h2 className="text-xl font-bold text-gray-900">Ranking główny</h2>
              </div>

              <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
                <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
                  <div className="relative z-10 flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-medium truncate">{primaryCategory.categoryName}</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-700 border-b border-gray-800">
                      <tr>
                        <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-16 md:w-auto">
                          Pozycja
                        </th>
                        <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                          Zawodnik
                        </th>
                        <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-20 md:w-auto">
                          Wynik
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {primaryCategory.rankings.map((participant, index) => (
                        <tr key={participant.participantId} className={getRankingRowClass(index)}>
                          <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div
                                className={`flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full font-bold text-xs md:text-sm ${getRankingBadgeClass(index)}`}
                              >
                                {participant.position}
                              </div>
                            </div>
                          </td>
                          <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                            <div className={`text-gray-900 text-sm ${index < 3 ? 'font-bold' : 'font-medium'}`}>
                              {participant.participantName}
                            </div>
                          </td>
                          <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                            <div className={`text-sm text-gray-900 ${index < 3 ? 'font-bold' : 'font-medium'}`}>
                              {participant.valueDisplay ||
                                (primaryCategory.metric
                                  ? formatScore(participant.value || 0, primaryCategory.metric)
                                  : participant.value?.toFixed(2) || '0')}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Categories Tables */}
          {secondaryCategories.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">Kategorie specjalne</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {secondaryCategories.map((category, categoryIndex) => (
                  <div
                    key={category.categoryId}
                    className="overflow-hidden rounded-lg border border-border bg-card shadow"
                  >
                    <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
                      <div className="relative z-10 flex items-center space-x-2">
                        <Award className="h-4 w-4 text-purple-400" />
                        <span className="text-xs font-medium truncate">{category.categoryName}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      {category.rankings && category.rankings.length > 0 ? (
                        <table className="min-w-full">
                          <thead className="bg-gray-700 border-b border-gray-800">
                            <tr>
                              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-16 md:w-auto">
                                Pozycja
                              </th>
                              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                                Zawodnik
                              </th>
                              {category.fishSpeciesName && (
                                <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider hidden md:table-cell">
                                  Gatunek
                                </th>
                              )}
                              <th className="px-2 md:px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider w-20 md:w-auto">
                                Wynik
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {category.rankings
                              .slice(0, category.maxWinnersToDisplay || 10)
                              .map((participant, participantIndex) => (
                                <tr key={participant.participantId} className="hover:bg-purple-50">
                                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
                                        {participant.position}
                                      </div>
                                      {participantIndex < 3 && (
                                        <Medal className="h-3 w-3 md:h-4 md:w-4 text-purple-600 ml-1 md:ml-2" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                                    <div className="font-semibold text-gray-900 text-sm md:text-base">
                                      {participant.participantName}
                                      {category.fishSpeciesName && (
                                        <div className="text-xs text-gray-500 md:hidden mt-1">
                                          {category.fishSpeciesName}
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                  {category.fishSpeciesName && (
                                    <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap hidden md:table-cell">
                                      <div className="text-sm text-gray-600">{category.fishSpeciesName}</div>
                                    </td>
                                  )}
                                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                                    <div className="font-bold text-purple-700 text-sm md:text-base">
                                      {participant.valueDisplay ||
                                        (category.metric
                                          ? formatScore(participant.value || 0, category.metric)
                                          : participant.value?.toFixed(2) || '0')}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-6 text-center">
                          <p className="text-gray-600">Brak wyników w tej kategorii</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
