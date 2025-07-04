'use client';

import { format } from 'date-fns';
import { BarChart3, Filter, Fish, Plus, Ruler, Search, Weight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useGetCurrentUserLogbookEntries } from '@/lib/api/endpoints/logbook';
import { UserLogbookEntryDto } from '@/lib/api/models';

import { PageHeader, PageHeaderAction } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Style karty (można przenieść do stałych, jeśli się powtarzają)
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function LogbookPage() {
  const { data: logEntries } = useGetCurrentUserLogbookEntries({
    PageNumber: 1,
    PageSize: 20
  });

  const pageActions: PageHeaderAction[] = [
    {
      label: 'Dodaj Połów',
      href: '/logbook/add',
      icon: <Plus className="h-4 w-4" />
    },
    {
      label: 'Statystyki',
      href: '/logbook/statistics',
      icon: <BarChart3 className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader actions={pageActions} />

      {/* Pasek Wyszukiwania i Filtrowania (Opcjonalny) */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Szukaj w dzienniku (np. gatunek)..."
            className="w-full rounded-lg bg-card pl-9 border-border"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Filtruj</span>
        </Button>
      </div>

      {/* Siatka Kart Połowów */}
      {logEntries?.items && logEntries?.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {logEntries.items.map((entry: UserLogbookEntryDto) => (
            <Link key={entry.id} href={`/logbook/${entry.id}`}>
              <div
                // Można dodać Link do szczegółów wpisu, jeśli planujesz taki widok
                // <Link href={`/logbook/${entry.id}`}>
                className="group block overflow-hidden rounded-lg border border-border bg-card shadow transition-shadow hover:shadow-md"
                // </Link>
              >
                {/* Zdjęcie jako główny element */}
                <div className="relative aspect-square w-full bg-muted">
                  {' '}
                  {/* Używamy aspect-square dla kwadratowych kart */}
                  <Image
                    src={entry.imageUrl ?? ''}
                    alt={entry.fishSpeciesName ?? 'Zdjęcie ryby'}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105" // Efekt lekkiego zoomu na hover
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Fish className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Twój dziennik połowów jest pusty.</p>
          <Link href="/logbook/add" className="inline-block">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Dodaj Swój Pierwszy Połów
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
