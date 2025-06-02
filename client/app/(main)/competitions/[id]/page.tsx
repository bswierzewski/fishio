'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Activity,
  Award,
  Ban,
  BarChart3,
  CalendarDays,
  Clock,
  FileText,
  Fish,
  Hourglass,
  Info,
  ListChecks,
  MapPin,
  Play,
  Plus,
  ShieldCheck,
  Square,
  Trophy,
  UserCheck,
  UserMinus,
  UserPlus,
  Users
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import {
  useGetCompetitionDetailsById,
  useOrganizerAddsParticipant,
  useOrganizerAssignsJudge,
  useOrganizerCancelsCompetition,
  useOrganizerFinishesCompetition,
  useOrganizerRemovesJudge,
  useOrganizerRemovesParticipant,
  useOrganizerStartsCompetition,
  useUserJoinsCompetition
} from '@/lib/api/endpoints/competitions';
import { CompetitionStatus, CompetitionType, ParticipantRole } from '@/lib/api/models';

import { useCurrentUser } from '@/hooks/use-current-user';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const formatDateTime = (dateString: string) => {
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: pl });
};

const getStatusColor = (status: CompetitionStatus) => {
  switch (status) {
    case CompetitionStatus.Upcoming:
    case CompetitionStatus.Scheduled:
    case CompetitionStatus.AcceptingRegistrations:
      return 'text-blue-500';
    case CompetitionStatus.Ongoing:
      return 'text-green-500';
    case CompetitionStatus.Finished:
      return 'text-gray-500';
    case CompetitionStatus.Cancelled:
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getStatusText = (status: CompetitionStatus) => {
  switch (status) {
    case CompetitionStatus.Draft:
      return 'Szkic';
    case CompetitionStatus.PendingApproval:
      return 'Oczekuje na zatwierdzenie';
    case CompetitionStatus.AcceptingRegistrations:
      return 'Przyjmuje rejestracje';
    case CompetitionStatus.Scheduled:
      return 'Zaplanowane';
    case CompetitionStatus.Upcoming:
      return 'Nadchodzące';
    case CompetitionStatus.Ongoing:
      return 'W trakcie';
    case CompetitionStatus.Finished:
      return 'Zakończone';
    case CompetitionStatus.Cancelled:
      return 'Anulowane';
    default:
      return status;
  }
};

const getRoleIcon = (role: ParticipantRole) => {
  switch (role) {
    case ParticipantRole.Organizer:
      return <Trophy className="mr-2 h-4 w-4 text-amber-500" />;
    case ParticipantRole.Judge:
      return <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />;
    case ParticipantRole.Competitor:
      return <UserCheck className="mr-2 h-4 w-4 text-green-500" />;
    default:
      return <UserCheck className="mr-2 h-4 w-4" />;
  }
};

const getRoleText = (role: ParticipantRole) => {
  switch (role) {
    case ParticipantRole.Organizer:
      return 'Organizator';
    case ParticipantRole.Judge:
      return 'Sędzia';
    case ParticipantRole.Competitor:
      return 'Zawodnik';
    default:
      return role;
  }
};

export default function CompetitionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);

  // Get current user information (must be called before any early returns)
  const { id: currentUserId, name: currentUserName } = useCurrentUser();

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
    error,
    refetch
  } = useGetCompetitionDetailsById(competitionId || 0, {
    query: {
      enabled: !!competitionId && paramsResolved
    }
  });

  // Mutations (always call these hooks)
  const joinCompetitionMutation = useUserJoinsCompetition();
  const startCompetitionMutation = useOrganizerStartsCompetition();
  const finishCompetitionMutation = useOrganizerFinishesCompetition();
  const cancelCompetitionMutation = useOrganizerCancelsCompetition();

  // Don't render anything until params are resolved
  if (!paramsResolved) {
    return <CompetitionDetailSkeleton />;
  }

  // Check for invalid ID after params are resolved
  if (!competitionId) {
    notFound();
  }

  if (isLoading) {
    return <CompetitionDetailSkeleton />;
  }

  if (error) {
    notFound();
  }

  if (!competition) {
    notFound();
  }

  // Determine user capabilities based on current user and competition data
  // Now we can use the proper domain user ID for accurate authorization
  const userParticipants = currentUserId
    ? competition.participantsList?.filter((p) => p.userId === currentUserId) || []
    : [];

  const isOrganizer = currentUserId ? competition.organizerId === currentUserId : false;
  const isJudge = userParticipants.some((p) => p.role === ParticipantRole.Judge);
  const isParticipant = userParticipants.length > 0;

  const canJoin =
    !isParticipant &&
    (competition.status === CompetitionStatus.AcceptingRegistrations ||
      competition.status === CompetitionStatus.Upcoming);

  const canRegisterCatch = isJudge && competition.status === CompetitionStatus.Ongoing;
  const canManage = isOrganizer;
  const canStartCompetition = isOrganizer && competition.status === CompetitionStatus.Upcoming;
  const canFinishCompetition = isOrganizer && competition.status === CompetitionStatus.Ongoing;
  const canCancelCompetition =
    isOrganizer &&
    (competition.status === CompetitionStatus.Upcoming ||
      competition.status === CompetitionStatus.AcceptingRegistrations);

  // Separate participants by role
  const organizers = competition.participantsList?.filter((p) => p.role === ParticipantRole.Organizer) || [];
  const judges = competition.participantsList?.filter((p) => p.role === ParticipantRole.Judge) || [];
  const competitors = competition.participantsList?.filter((p) => p.role === ParticipantRole.Competitor) || [];

  const handleJoinCompetition = async () => {
    if (!competitionId) return;

    try {
      await joinCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Pomyślnie dołączono do zawodów!');
      refetch();
    } catch (error) {
      toast.error('Nie udało się dołączyć do zawodów');
    }
  };

  const handleStartCompetition = async () => {
    if (!competitionId) return;

    try {
      await startCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały rozpoczęte!');
      refetch();
    } catch (error) {
      toast.error('Nie udało się rozpocząć zawodów');
    }
  };

  const handleFinishCompetition = async () => {
    if (!competitionId) return;

    try {
      await finishCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały zakończone!');
      refetch();
    } catch (error) {
      toast.error('Nie udało się zakończyć zawodów');
    }
  };

  const handleCancelCompetition = async () => {
    if (!competitionId) return;

    const reason = prompt('Podaj powód anulowania zawodów:');
    if (!reason) return;

    try {
      await cancelCompetitionMutation.mutateAsync({
        competitionId,
        data: { reason }
      });
      toast.success('Zawody zostały anulowane!');
      refetch();
    } catch (error) {
      toast.error('Nie udało się anulować zawodów');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with image and text overlay */}
      <div className="relative overflow-hidden rounded-lg border border-border shadow">
        {competition.imageUrl ? (
          <div className="relative h-48 sm:h-64 w-full">
            <Image
              src={competition.imageUrl}
              alt={`Zdjęcie dla ${competition.name}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 drop-shadow-md">{competition.name}</h1>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm opacity-90 drop-shadow-sm">
                <span className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  {competition.fisheryLocation || competition.fisheryName}
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  {formatDateTime(competition.startTime!)}
                </span>
                <span className="flex items-center">
                  <Trophy className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  Typ: {competition.type === CompetitionType.Public ? 'Otwarte' : 'Zamknięte'}
                </span>
                <span className={`flex items-center font-medium ${getStatusColor(competition.status!)}`}>
                  <CalendarDays className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  Status: {getStatusText(competition.status!)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 bg-card text-foreground">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{competition.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {competition.fisheryLocation || competition.fisheryName}
              </span>
              <span className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {formatDateTime(competition.startTime!)}
              </span>
              <span className="flex items-center">
                <Trophy className="mr-1 h-4 w-4" />
                Typ: {competition.type === CompetitionType.Public ? 'Otwarte' : 'Zamknięte'}
              </span>
              <span className={`flex items-center font-medium ${getStatusColor(competition.status!)}`}>
                <CalendarDays className="mr-1 h-4 w-4" />
                Status: {getStatusText(competition.status!)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {canJoin && (
          <Button
            onClick={handleJoinCompetition}
            disabled={joinCompetitionMutation.isPending}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {joinCompetitionMutation.isPending ? 'Dołączanie...' : 'Dołącz do Zawodów'}
          </Button>
        )}

        {canRegisterCatch && (
          <Link href={`/competitions/${competitionId}/catch/new`}>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Zarejestruj Połów
            </Button>
          </Link>
        )}

        {canManage && (
          <Link href={`/competitions/${competitionId}/manage`}>
            <Button variant="secondary">Zarządzaj Zawodami</Button>
          </Link>
        )}

        {canStartCompetition && (
          <Button
            onClick={handleStartCompetition}
            disabled={startCompetitionMutation.isPending}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            <Play className="mr-2 h-4 w-4" />
            {startCompetitionMutation.isPending ? 'Rozpoczynanie...' : 'Rozpocznij Zawody'}
          </Button>
        )}

        {canFinishCompetition && (
          <Button
            onClick={handleFinishCompetition}
            disabled={finishCompetitionMutation.isPending}
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            <Square className="mr-2 h-4 w-4" />
            {finishCompetitionMutation.isPending ? 'Kończenie...' : 'Zakończ Zawody'}
          </Button>
        )}

        {canCancelCompetition && (
          <Button
            onClick={handleCancelCompetition}
            disabled={cancelCompetitionMutation.isPending}
            variant="destructive"
          >
            <Ban className="mr-2 h-4 w-4" />
            {cancelCompetitionMutation.isPending ? 'Anulowanie...' : 'Anuluj Zawody'}
          </Button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Competition Information Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <Info className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Informacje o Zawodach</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="font-semibold mb-1 text-foreground flex items-center">
                  <UserCheck className="mr-2 h-4 w-4 text-green-600" />
                  Organizator:
                </h3>
                <p className="text-sm text-muted-foreground">{competition.organizerName || 'Nieznany organizator'}</p>
              </div>

              {/* Categories Section */}
              <div>
                <h3 className="font-semibold mb-3 text-foreground flex items-center">
                  <Trophy className="mr-2 h-4 w-4 text-primary" />
                  Kategorie Zawodów:
                </h3>
                <div className="space-y-3">
                  {/* Primary Scoring Category */}
                  {competition.primaryScoringInfo && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-amber-900 text-sm">
                          {competition.primaryScoringInfo}
                          {competition.categories &&
                            competition.categories.find((c) => c.isPrimaryScoring)?.fishSpeciesName && (
                              <span className="text-amber-700/80 font-normal">
                                {' '}
                                ({competition.categories.find((c) => c.isPrimaryScoring)?.fishSpeciesName})
                              </span>
                            )}
                        </h4>
                      </div>
                      <p className="text-xs text-amber-700/80 italic">Decyduje o głównym rankingu zawodów</p>
                    </div>
                  )}

                  {/* Additional Categories */}
                  {competition.categories && competition.categories.filter((c) => !c.isPrimaryScoring).length > 0 && (
                    <>
                      {competition.categories
                        .filter((category) => !category.isPrimaryScoring)
                        .map((category, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-md">
                            <h4 className="font-medium text-foreground text-sm">
                              {category.name}
                              {category.fishSpeciesName && (
                                <span className="text-muted-foreground font-normal"> ({category.fishSpeciesName})</span>
                              )}
                            </h4>
                            {category.description && (
                              <p className="text-xs text-muted-foreground italic mt-1 leading-relaxed">
                                {category.description}
                              </p>
                            )}
                          </div>
                        ))}
                    </>
                  )}

                  {/* No additional categories message */}
                  {(!competition.categories ||
                    competition.categories.filter((c) => !c.isPrimaryScoring).length === 0) &&
                    competition.primaryScoringInfo && (
                      <p className="text-xs text-muted-foreground italic">
                        Brak dodatkowych kategorii w tych zawodach.
                      </p>
                    )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-1 text-foreground flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                  Regulamin:
                </h3>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {competition.rules || 'Brak szczegółowego regulaminu.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-1 text-foreground flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-purple-600" />
                  Czas trwania:
                </h3>
                <p className="text-sm text-muted-foreground">
                  Od: {formatDateTime(competition.startTime!)}
                  <br />
                  Do: {formatDateTime(competition.endTime!)}
                </p>
              </div>
            </div>
          </div>

          {/* Ranking Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <ListChecks className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Ranking / Tablica Wyników</span>
              </div>
            </div>
            <div className="p-4">
              {competition.status === CompetitionStatus.Upcoming ||
              competition.status === CompetitionStatus.AcceptingRegistrations ||
              competition.status === CompetitionStatus.Scheduled ? (
                <p className="text-sm text-muted-foreground">Ranking będzie dostępny po rozpoczęciu zawodów.</p>
              ) : competition.status === CompetitionStatus.Ongoing ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600 animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Zawody w trakcie!</p>
                      <p className="text-xs text-green-600">Wyniki są aktualizowane na bieżąco</p>
                    </div>
                  </div>
                  {competition.resultsToken && (
                    <Link href={`/results/${competition.resultsToken}`} className="block">
                      <Button
                        variant="default"
                        className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <Activity className="mr-2 h-4 w-4 animate-pulse" />
                        Zobacz Wyniki na Żywo
                      </Button>
                    </Link>
                  )}
                </div>
              ) : competition.status === CompetitionStatus.Finished ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Trophy className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Zawody zakończone</p>
                      <p className="text-xs text-blue-600">Oficjalne wyniki są dostępne</p>
                    </div>
                  </div>
                  {competition.resultsToken && (
                    <Link href={`/results/${competition.resultsToken}`} className="block">
                      <Button
                        variant="default"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Zobacz Oficjalne Wyniki
                      </Button>
                    </Link>
                  )}
                </div>
              ) : competition.status === CompetitionStatus.Cancelled ? (
                <p className="text-sm text-red-600">Zawody zostały anulowane. Ranking nie jest dostępny.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Ranking nie jest obecnie dostępny.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Uczestnicy ({competition.participantsCount || 0})</span>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {/* Organizers */}
                {organizers.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-amber-600">Organizatorzy</h4>
                    <ul className="space-y-1 text-sm">
                      {organizers.map((participant) => (
                        <li key={participant.id} className="flex items-center text-muted-foreground">
                          {getRoleIcon(participant.role!)}
                          {participant.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Judges */}
                {judges.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-blue-600">Sędziowie</h4>
                    <ul className="space-y-1 text-sm">
                      {judges.map((participant) => (
                        <li key={participant.id} className="flex items-center text-muted-foreground">
                          {getRoleIcon(participant.role!)}
                          {participant.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Competitors */}
                {competitors.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-green-600">Zawodnicy</h4>
                    <ul className="space-y-1 text-sm">
                      {competitors.map((participant) => (
                        <li key={participant.id} className="flex items-center text-muted-foreground">
                          {getRoleIcon(participant.role!)}
                          {participant.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!competition.participantsList || competition.participantsList.length === 0) && (
                  <p className="text-sm text-muted-foreground">Brak uczestników</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitionDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="relative overflow-hidden rounded-lg border border-border shadow">
        <Skeleton className="h-48 sm:h-64 w-full" />
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="p-4">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="p-4">
              <Skeleton className="h-6 w-40 mb-4" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="p-4">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
