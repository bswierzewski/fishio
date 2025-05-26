// app/results/[token]/page.tsx
import { Competition, ResultEntry, SpecialCategoryResult } from '@/lib/definitions';
import { staticCompetitions, staticResults, staticSpecialCategories } from '@/lib/static-data';
import { Activity, Award, BarChart3, Clock, Fish, Hourglass, PieChart, TrendingUp, Trophy, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Style dla jasnego motywu (spójne z resztą aplikacji)
const sectionHeaderBgClass = 'bg-slate-800'; // Ciemny nagłówek sekcji
const sectionHeaderTextColorClass = 'text-slate-100'; // Jasny tekst w nagłówku
// Zakładamy, że bg-card, text-foreground, text-muted-foreground, border-border
// są zdefiniowane w globals.css i pasują do jasnego motywu

const formatDateTime = (date: Date) => {
  return date.toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const findWinnerByMaxField = (
  results: ResultEntry[],
  field: keyof ResultEntry,
  secondaryField?: keyof ResultEntry
): ResultEntry | null => {
  if (!results || results.length === 0) return null;
  return results
    .filter((r) => r[field] != null)
    .reduce(
      (winner, current) => {
        if (!winner || (current[field] as number) > (winner[field] as number)) return current;
        if (secondaryField && (current[field] as number) === (winner[field] as number)) {
          if (!winner[secondaryField] || (current[secondaryField] as number) > (winner[secondaryField] as number))
            return current;
        }
        return winner;
      },
      null as ResultEntry | null
    );
};

export default async function PublicResultsPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const competition = staticCompetitions.find((c) => c.resultsToken === token);

  if (!competition) {
    notFound();
  }

  let results: ResultEntry[] = [];
  let specialCategories: SpecialCategoryResult[] = [];
  let mainChartData: { name: string; score: number }[] = [];
  let categoriesChartData: { category: string; winner: string; value: number | undefined }[] = [];

  if (competition.status === 'finished' || competition.status === 'ongoing') {
    results = staticResults; // Użyj pełnych wyników dla zakończonych/trwających
    specialCategories = [
      {
        id: 'biggest-weight',
        title: 'Najcięższa Ryba',
        winnerData: findWinnerByMaxField(results, 'biggestFishWeightKg', 'biggestFishLengthCm'),
        criterionDescription: 'Największa waga pojedynczej ryby.',
        valueDisplay: (winner) => `${winner.biggestFishWeightKg} kg (${winner.biggestFishSpecies})`
      },
      {
        id: 'longest-fish',
        title: 'Najdłuższa Ryba',
        winnerData: findWinnerByMaxField(results, 'biggestFishLengthCm', 'biggestFishWeightKg'),
        criterionDescription: 'Największa długość pojedynczej ryby.',
        valueDisplay: (winner) => `${winner.biggestFishLengthCm} cm (${winner.biggestFishSpecies})`
      },
      {
        id: 'most-catches',
        title: 'Najwięcej Złowionych Ryb',
        winnerData: findWinnerByMaxField(results, 'catchesCount'),
        criterionDescription: 'Łączna liczba złowionych ryb.',
        valueDisplay: (winner) => `${winner.catchesCount} szt.`
      }
    ];
    mainChartData = results.slice(0, 5).map((r) => ({
      name: r.participantName.split(' ').slice(0, 2).join(' '),
      score: parseFloat(r.score.replace(' kg', '').replace(',', '.'))
    }));
    categoriesChartData = specialCategories
      .filter((cat) => cat.winnerData)
      .map((cat) => ({
        category: cat.title,
        winner: cat.winnerData!.participantName,
        value:
          cat.id === 'most-catches'
            ? cat.winnerData!.catchesCount
            : cat.id === 'longest-fish'
              ? cat.winnerData!.biggestFishLengthCm
              : cat.winnerData!.biggestFishWeightKg
      }));
  }

  return (
    // Używamy klas zdefiniowanych w globals.css dla jasnego motywu
    <div className="min-h-screen bg-background text-foreground py-8 sm:py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary hover:opacity-80">
            🐟 Fishio - {competition.status === 'ongoing' ? 'Wyniki na Żywo' : 'Wyniki Zawodów'}
          </Link>
        </div>

        {/* Karta główna */}
        <div className="rounded-lg shadow-xl overflow-hidden bg-card border border-border">
          {/* Nagłówek Karty z info o zawodach */}
          {/* Używamy ciemniejszego tła dla nagłówka, np. jak w sekcjach na dashboardzie */}
          <div className={`${sectionHeaderBgClass} ${sectionHeaderTextColorClass} p-4 sm:p-6 text-center`}>
            {competition.imageUrl && (
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-3 rounded-full overflow-hidden border-4 border-slate-300 shadow-md">
                <Image src={competition.imageUrl} alt={competition.name} layout="fill" objectFit="cover" />
              </div>
            )}
            <h1 className="text-xl sm:text-2xl font-bold mb-1">{competition.name}</h1>{' '}
            {/* Tekst jasny na ciemnym tle */}
            <div className="flex items-center justify-center text-xs sm:text-sm opacity-90">
              {' '}
              {/* Tekst jasny na ciemnym tle */}
              <Clock className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              <span>
                {competition.status === 'upcoming' && `Rozpoczęcie: ${formatDateTime(competition.startTime)}`}
                {competition.status === 'ongoing' && `Trwają (do: ${formatDateTime(competition.endTime)})`}
                {competition.status === 'finished' &&
                  `Zakończono: ${formatDateTime(competition.endTime || competition.startTime)}`}
              </span>
            </div>
          </div>

          {/* --- Zawartość zależna od statusu --- */}
          {competition.status === 'upcoming' && (
            <div className="p-6 sm:p-8 text-center bg-card">
              {' '}
              {/* Używamy bg-card */}
              <Hourglass className="mx-auto h-16 w-16 mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2 text-foreground">Zawody jeszcze się nie rozpoczęły</h2>
              <p className="text-muted-foreground text-sm">
                Oficjalne wyniki pojawią się tutaj po zakończeniu zawodów. Zapraszamy do śledzenia strony!
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Planowany start: {formatDateTime(competition.startTime)}
              </p>
            </div>
          )}

          {(competition.status === 'ongoing' || competition.status === 'finished') && results.length > 0 && (
            <>
              {/* Główna Tabela Wyników */}
              <div className="p-4 sm:p-6 bg-card">
                {/* Używamy bg-card */}
                <h2 className="text-lg font-semibold mb-4 flex items-center text-foreground">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  {competition.status === 'ongoing'
                    ? 'Wyniki na Żywo (Nieoficjalne)'
                    : 'Oficjalne Wyniki (Klasyfikacja Główna)'}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                      {/* Lekko inne tło dla nagłówka tabeli */}
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          #
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          Uczestnik
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          Liczba Ryb
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                        >
                          Wynik (Suma)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-card">
                      {results.map((result) => (
                        <tr
                          key={result.rank}
                          className={`${result.rank <= 3 && competition.status === 'finished' ? 'font-semibold bg-primary/10' : ''} hover:bg-muted/30`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">{result.rank}.</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-foreground">
                            <div className="flex items-center">
                              <User className="mr-2 h-4 w-4 text-muted-foreground" />
                              {result.participantName}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {result.catchesCount !== undefined ? result.catchesCount : '-'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-foreground">
                            {result.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sekcja Zwycięzców Kategorii Specjalnych (tylko dla zakończonych) */}
              {competition.status === 'finished' && specialCategories.filter((cat) => cat.winnerData).length > 0 && (
                <div className="p-4 sm:p-6 border-t border-border bg-card">
                  {' '}
                  {/* Używamy bg-card */}
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-foreground">
                    <Award className="mr-2 h-5 w-5 text-amber-500" /> Zwycięzcy Kategorii Specjalnych
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {specialCategories.map(
                      (category) =>
                        category.winnerData && (
                          <div key={category.id} className="p-4 rounded-lg bg-card border border-amber-500/30 shadow">
                            <h3 className="font-semibold text-amber-600 mb-1">{category.title}</h3>
                            <p className="text-foreground text-lg font-bold">{category.winnerData.participantName}</p>
                            <p className="text-muted-foreground text-sm">
                              Wynik:{' '}
                              <span className="font-medium text-amber-700">
                                {category.valueDisplay(category.winnerData)}
                              </span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">({category.criterionDescription})</p>
                          </div>
                        )
                    )}
                  </div>
                </div>
              )}

              {/* Sekcja Wykresów */}
              <div className="p-4 sm:p-6 border-t border-border bg-card grid grid-cols-1 lg:grid-cols-2 gap-6">
                {' '}
                {/* Używamy bg-card */}
                <div>
                  <h3 className="text-md font-semibold mb-3 flex items-center text-foreground">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    {competition.status === 'ongoing' ? 'Ranking na Żywo' : 'Ranking Ogólny'} (Top{' '}
                    {mainChartData.length})
                  </h3>
                  <div className="flex items-center justify-center h-56 sm:h-64 rounded-lg border-2 border-dashed border-border text-muted-foreground text-sm p-4">
                    Placeholder dla Wykresu Słupkowego (Wyniki:{' '}
                    {mainChartData.map((d) => `${d.name}: ${d.score}kg`).join('; ')})
                  </div>
                </div>
                {competition.status === 'finished' && (
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
              <p className="text-xs p-4 text-center text-muted-foreground bg-card">
                {' '}
                {/* Używamy bg-card */}
                Wykresy zostaną zaimplementowane z użyciem biblioteki do wykresów.
              </p>
            </>
          )}
          {(competition.status === 'ongoing' || competition.status === 'finished') && results.length === 0 && (
            <div className="p-6 sm:p-8 text-center bg-card">
              {' '}
              {/* Używamy bg-card */}
              <Fish className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Brak zarejestrowanych wyników.</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs">
          <p className="text-muted-foreground">Wyniki wygenerowane przez Fisho &copy; {new Date().getFullYear()}</p>
          <Link href="/" className="block mt-1 text-primary hover:underline">
            Wróć do strony głównej Fisho
          </Link>
        </div>
      </div>
    </div>
  );
}
