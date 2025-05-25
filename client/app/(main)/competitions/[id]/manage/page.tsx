'use client';

import { ArrowLeft, BarChart3, Settings, ShieldCheck, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useGetCompetitionDetailsById } from '@/lib/api/endpoints/competitions';
import { ParticipantRole } from '@/lib/api/models';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompetitionManagePage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);

  // Resolve params properly with useEffect
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        const numId = parseInt(resolvedParams.id, 10);

        if (!isNaN(numId)) {
          setCompetitionId(numId);
        }
        setParamsResolved(true);
      } catch (error) {
        setParamsResolved(true);
      }
    };

    resolveParams();
  }, [params]);

  // Fetch competition details (always call hooks in the same order)
  const {
    data: competition,
    isLoading,
    error
  } = useGetCompetitionDetailsById(competitionId || 0, {
    query: {
      enabled: !!competitionId && paramsResolved
    }
  });

  // Don't render anything until params are resolved
  if (!paramsResolved) {
    return <ManagementSkeleton />;
  }

  // Check for invalid ID after params are resolved
  if (!competitionId) {
    notFound();
  }

  if (isLoading) {
    return <ManagementSkeleton />;
  }

  if (error || !competition) {
    notFound();
  }

  // Check if user is organizer (in real app, get from auth context)
  const currentUserId = 1;
  const userParticipant = competition.participantsList?.find((p) => p.userId === currentUserId);
  const isOrganizer = userParticipant?.role === ParticipantRole.Organizer;

  if (!isOrganizer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h1 className="text-2xl font-bold text-muted-foreground">Brak uprawnień</h1>
        <p className="text-muted-foreground">Nie masz uprawnień do zarządzania tymi zawodami.</p>
        <Link href={`/competitions/${competitionId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do zawodów
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zarządzanie Zawodami</h1>
          <p className="text-muted-foreground">{competition.name}</p>
        </div>
        <Link href={`/competitions/${competitionId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do zawodów
          </Button>
        </Link>
      </div>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Participants Management */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Uczestnicy</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Zarządzaj uczestnikami zawodów, dodawaj nowych zawodników i gości.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Dodaj Uczestnika
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <Users className="mr-2 h-4 w-4" />
                Lista Uczestników
              </Button>
            </div>
          </div>
        </div>

        {/* Judges Management */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Sędziowie</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Zarządzaj sędziami, przydzielaj uprawnienia do oceniania połowów.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Dodaj Sędziego
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Lista Sędziów
              </Button>
            </div>
          </div>
        </div>

        {/* Competition Settings */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Ustawienia</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">Edytuj szczegóły zawodów, kategorie punktacji i regulamin.</p>
            <div className="space-y-2">
              <Link href={`/competitions/${competitionId}/edit`}>
                <Button className="w-full" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edytuj Zawody
                </Button>
              </Link>
              <Button variant="outline" className="w-full" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Kategorie Punktacji
              </Button>
            </div>
          </div>
        </div>

        {/* Results Management */}
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
          <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
            <div className="relative z-10 flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium truncate">Wyniki</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">Przeglądaj i zarządzaj wynikami zawodów, eksportuj raporty.</p>
            <div className="space-y-2">
              <Button className="w-full" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" />
                Zobacz Wyniki
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                Eksportuj Raport
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-medium truncate">Statystyki Zawodów</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{competition.participantsCount || 0}</div>
              <div className="text-sm text-muted-foreground">Uczestników</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {competition.participantsList?.filter((p) => p.role === ParticipantRole.Judge).length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Sędziów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Połowów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{competition.categories?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Kategorii</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
        <div className="p-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
