'use client';

import { AlertTriangle, Filter, Loader2, MapPin, Plus, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { useGetAllFisheries } from '@/lib/api/endpoints/fisheries';
import { FisheryDto as Fishery } from '@/lib/api/models';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Style karty (dopasuj do reszty)
const cardHeaderBgClass = 'bg-slate-800'; // Ciemny nagłówek
const cardHeaderTextColorClass = 'text-slate-100'; // Jasny tekst w nagłówku
const cardBodyBgClass = 'bg-card';
const cardTextColorClass = 'text-foreground';
const cardMutedTextColorClass = 'text-muted-foreground';

export default function FisheriesPage() {
  // Na razie wyświetlamy wszystkie łowiska
  const { data: fisheriesResponse, isLoading, isError, error } = useGetAllFisheries({ PageNumber: 1, PageSize: 20 });

  const fisheries = fisheriesResponse?.items || [];

  // TODO: Dodać logikę wyszukiwania i filtrowania

  return (
    <div className="space-y-6">
      {/* Pasek Wyszukiwania i Filtrowania (Opcjonalny) */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Szukaj łowiska (np. nazwa, lokalizacja)..."
            className="w-full rounded-lg bg-card pl-9 border-border"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filtruj
        </Button>
      </div>

      {/* Siatka Kart Łowisk */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Wczytywanie łowisk...</p>
        </div>
      )}

      {isError && (
        <div className="mt-8 rounded-lg border border-destructive bg-destructive/10 p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive mb-2 font-semibold">Wystąpił błąd podczas ładowania łowisk.</p>
          <p className="text-sm text-destructive/80 mb-4">{(error as Error)?.message || 'Spróbuj ponownie później.'}</p>
          {/* Można dodać przycisk do ponowienia próby */}
        </div>
      )}

      {!isLoading && !isError && fisheries.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {fisheries.map((fishery: Fishery) => (
            <Link key={fishery.id} href={`/fisheries/${fishery.id}`}>
              <div
                // Można dodać Link do szczegółów łowiska, jeśli planujesz
                // <Link href={`/fisheries/${fishery.id}`}>
                className="group block overflow-hidden rounded-lg border border-border bg-card shadow transition-shadow hover:shadow-md"
                // </Link>
              >
                {/* Nagłówek Karty z obrazkiem lub ikoną */}
                <div className="relative h-28 w-full bg-muted flex-shrink-0">
                  {' '}
                  {/* Wysokość dla obrazka/ikony */}
                  {fishery.imageUrl ? (
                    <Image
                      src={fishery.imageUrl}
                      alt={`Zdjęcie łowiska ${fishery.name}`}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    // Placeholder ikona, jeśli brak obrazka
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800">
                      <MapPin className="h-10 w-10 text-slate-400" />
                    </div>
                  )}
                </div>
                {/* Treść Karty */}
                <div className={`p-3 ${cardBodyBgClass}`}>
                  <h3 className={`mb-1 truncate text-base font-semibold ${cardTextColorClass}`}>{fishery.name}</h3>
                  <p className={`truncate text-xs ${cardMutedTextColorClass}`}>{fishery.location}</p>
                  {/* Można dodać przycisk "Zobacz" lub inne akcje */}
                  {/* <Button variant="outline" size="sm" className="w-full mt-3">Zobacz</Button> */}
                </div>
              </div>{' '}
            </Link>
          ))}
        </div>
      )}

      {!isLoading && !isError && fisheries.length === 0 && (
        <div className="mt-8 rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Brak dodanych łowisk w systemie.</p>
          <Link href="/fisheries/add" className="inline-block">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" /> Dodaj Pierwsze Łowisko
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
