'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ArrowLeft, BarChart3, Calendar, Fish, MapPin, Ruler, TrendingUp, Trophy, Weight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { useGetLogbookStatistics } from '@/lib/api/endpoints/logbook';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function LogbookStatisticsPage() {
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Use the actual API call
  const {
    data: statistics,
    isLoading,
    error
  } = useGetLogbookStatistics(selectedYear === 'all' ? undefined : { Year: parseInt(selectedYear) });

  const formatWeight = (weight: number | null | undefined) => {
    if (!weight) return 'Brak danych';
    return `${weight.toFixed(2)} kg`;
  };

  const formatLength = (length: number | null | undefined) => {
    if (!length) return 'Brak danych';
    return `${length.toFixed(1)} cm`;
  };

  if (isLoading) {
    return <StatisticsPageSkeleton />;
  }

  if (error || !statistics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h1 className="text-2xl font-bold text-muted-foreground">Błąd ładowania</h1>
        <p className="text-muted-foreground">Nie udało się załadować statystyk połowów.</p>
        <Link href="/logbook">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do dziennika
          </Button>
        </Link>
      </div>
    );
  }

  // Handle empty statistics
  if (statistics.totalCatches === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Statystyki Połowów</h1>
            <p className="text-muted-foreground">Analiza twoich wyników wędkarskich</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie lata</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/logbook">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Powrót
              </Button>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {selectedYear === 'all' ? 'Brak danych do wyświetlenia statystyk.' : `Brak połowów w roku ${selectedYear}.`}
          </p>
          <Link href="/logbook/add" className="inline-block">
            <Button>
              <Fish className="mr-2 h-4 w-4" />
              Dodaj Pierwszy Połów
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Statystyki Połowów</h1>
          <p className="text-muted-foreground">Analiza twoich wyników wędkarskich</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie lata</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/logbook">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Fish className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Łączne Połowy</span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold">{statistics.totalCatches || 0}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.firstCatchDate && statistics.lastCatchDate && (
                <>
                  {format(new Date(statistics.firstCatchDate), 'MMM yyyy', { locale: pl })} -{' '}
                  {format(new Date(statistics.lastCatchDate), 'MMM yyyy', { locale: pl })}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Gatunki</span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold">{statistics.uniqueSpecies || 0}</div>
            <p className="text-xs text-muted-foreground">różnych gatunków</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Weight className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Łączna Waga</span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold">{formatWeight(statistics.totalWeightKg)}</div>
            <p className="text-xs text-muted-foreground">śr. {formatWeight(statistics.averageWeightKg)}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Ruler className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Największa Ryba</span>
            </div>
          </div>
          <div className="p-4">
            <div className="text-2xl font-bold">{formatLength(statistics.largestFishLengthCm)}</div>
            <p className="text-xs text-muted-foreground">{formatWeight(statistics.largestFishWeightKg)}</p>
          </div>
        </div>
      </div>

      {/* Weight and Length Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Statistics */}
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Weight className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Statystyki Wagi</span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Łączna waga:</span>
                <span className="text-lg font-bold">{formatWeight(statistics.totalWeightKg)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Średnia waga:</span>
                <span className="text-lg font-bold">{formatWeight(statistics.averageWeightKg)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Największa ryba:</span>
                <span className="text-lg font-bold">{formatWeight(statistics.largestFishWeightKg)}</span>
              </div>
              {statistics.totalCatches && statistics.totalWeightKg && (
                <div className="pt-2 border-t border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Średnia na połów:</span>
                    <span className="text-sm font-medium">
                      {formatWeight(statistics.totalWeightKg / statistics.totalCatches)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Length Statistics */}
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Ruler className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Statystyki Długości</span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Średnia długość:</span>
                <span className="text-lg font-bold">{formatLength(statistics.averageLengthCm)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Największa ryba:</span>
                <span className="text-lg font-bold">{formatLength(statistics.largestFishLengthCm)}</span>
              </div>
              {statistics.sizeRanges && statistics.sizeRanges.length > 0 && (
                <>
                  <div className="pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground mb-2 block">Najczęstszy rozmiar:</span>
                    {(() => {
                      const mostCommon = statistics.sizeRanges.reduce((prev, current) =>
                        (prev.catchCount || 0) > (current.catchCount || 0) ? prev : current
                      );
                      return (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{mostCommon.rangeName}:</span>
                          <span className="text-sm font-medium">{mostCommon.catchCount} ryb</span>
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Species */}
      {statistics.topSpecies && statistics.topSpecies.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Trophy className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Najczęściej Łowione Gatunki</span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {statistics.topSpecies.map((species, index) => (
                <div key={species.fishSpeciesId} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge
                      variant={index === 0 ? 'default' : 'secondary'}
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                    >
                      {index + 1}
                    </Badge>
                    <div>
                      <h3 className="font-medium">{species.speciesName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {species.catchCount} połowów • {formatWeight(species.totalWeightKg)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Największa: {formatLength(species.largestLengthCm)}</div>
                    <div className="text-sm text-muted-foreground">{formatWeight(species.largestWeightKg)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Fisheries and Monthly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Fisheries */}
        {statistics.topFisheries && statistics.topFisheries.length > 0 && (
          <div className="overflow-hidden rounded-lg bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Najlepsze Łowiska</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {statistics.topFisheries.map((fishery, index) => (
                  <div key={fishery.fisheryId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={index === 0 ? 'default' : 'outline'}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{fishery.fisheryName}</div>
                        <div className="text-sm text-muted-foreground">{fishery.uniqueSpecies} gatunków</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{fishery.catchCount}</div>
                      <div className="text-sm text-muted-foreground">{formatWeight(fishery.totalWeightKg)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monthly Breakdown */}
        {statistics.monthlyBreakdown && statistics.monthlyBreakdown.length > 0 && (
          <div className="overflow-hidden rounded-lg bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Aktywność Miesięczna</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {statistics.monthlyBreakdown.map((month) => (
                  <div key={`${month.year}-${month.month}`} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {month.monthName} {month.year}
                      </div>
                      <div className="text-sm text-muted-foreground">{month.uniqueSpecies} gatunków</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{month.catchCount} połowów</div>
                      <div className="text-sm text-muted-foreground">{formatWeight(month.totalWeightKg)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Size Distribution */}
      {statistics.sizeRanges && statistics.sizeRanges.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Rozkład Wielkości Ryb</span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {statistics.sizeRanges.map((range) => (
                <div key={range.rangeName} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{range.rangeName}</span>
                    <span className="text-sm text-muted-foreground">
                      {range.catchCount} ({range.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${range.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weight Distribution */}
      {statistics.topSpecies && statistics.topSpecies.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Weight className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Rozkład Wagi Ryb</span>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {(() => {
                // Calculate weight distribution from all catches
                const allCatches = statistics.topSpecies.flatMap((species) =>
                  Array(species.catchCount || 0).fill(species.averageWeightKg || 0)
                );

                if (allCatches.length === 0) return null;

                const weightRanges = [
                  { name: 'Bardzo małe (0-0.5 kg)', min: 0, max: 0.5 },
                  { name: 'Małe (0.5-1 kg)', min: 0.5, max: 1 },
                  { name: 'Średnie (1-2 kg)', min: 1, max: 2 },
                  { name: 'Duże (2-5 kg)', min: 2, max: 5 },
                  { name: 'Bardzo duże (5+ kg)', min: 5, max: Infinity }
                ];

                const totalCatches = allCatches.length;

                return weightRanges.map((range) => {
                  const count = allCatches.filter(
                    (weight) => weight >= range.min && (range.max === Infinity || weight < range.max)
                  ).length;

                  const percentage = totalCatches > 0 ? Math.round((count / totalCatches) * 100) : 0;

                  return (
                    <div key={range.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{range.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatisticsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Skeletons */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
