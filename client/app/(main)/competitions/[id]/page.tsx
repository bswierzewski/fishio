'use client';

import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import {
  Activity,
  Award,
  BarChart3,
  CalendarDays,
  Clock,
  Edit,
  FileText,
  Fish,
  Info,
  ListChecks,
  MapPin,
  Plus,
  ShieldCheck,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
  Users2,
  XCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useApiError } from '@/hooks/use-api-error';
import {
  useGetCompetitionDetailsById,
  useOrganizerCancelsCompetition,
  useOrganizerFinishesCompetition,
  useOrganizerStartsCompetition,
  useUserJoinsCompetition
} from '@/lib/api/endpoints/competitions';
import { CompetitionStatus, CompetitionType, ParticipantRole } from '@/lib/api/models';
import { ParticipantStatus } from '@/lib/api/models/participantStatus';

import { useCurrentUser } from '@/hooks/use-current-user';

import { CompetitionStatusManager } from '@/components/competitions/CompetitionStatusManager';
import { PageHeader, PageHeaderAction } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const formatDateTime = (dateString: string) => {
  return format(new Date(dateString), 'dd.MM.yyyy HH:mm', { locale: pl });
};

const getStatusColor = (status: CompetitionStatus) => {
  switch (status) {
    case CompetitionStatus.Draft:
      return 'text-blue-500';
    case CompetitionStatus.Scheduled:
    case CompetitionStatus.AcceptingRegistrations:
      return 'text-green-500';
    case CompetitionStatus.Ongoing:
      return 'text-emerald-500';
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
    case CompetitionStatus.AcceptingRegistrations:
      return 'Przyjmuje rejestracje';
    case CompetitionStatus.Scheduled:
      return 'Zaplanowane';
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

const getParticipantStatusText = (status: ParticipantStatus) => {
  switch (status) {
    case ParticipantStatus.Waiting:
      return 'Oczekuje na zatwierdzenie';
    case ParticipantStatus.Approved:
      return 'Zatwierdzony';
    case ParticipantStatus.Rejected:
      return 'Odrzucony';
    default:
      return status;
  }
};

const getParticipantStatusColor = (status: ParticipantStatus) => {
  switch (status) {
    case ParticipantStatus.Waiting:
      return 'text-yellow-600';
    case ParticipantStatus.Approved:
      return 'text-green-600';
    case ParticipantStatus.Rejected:
      return 'text-red-600';
    default:
      return 'text-gray-600';
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

  // API error handling
  const { handleError } = useApiError();

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

  // Get user's registration status
  const userRegistrationStatus = userParticipants.length > 0 ? userParticipants[0].status : null;

  const canJoin = !isParticipant && competition.status === CompetitionStatus.AcceptingRegistrations;

  const canRegisterCatch = (isJudge || isOrganizer) && competition.status === CompetitionStatus.Ongoing;
  const canManage = isOrganizer;
  const canStartCompetition = isOrganizer && competition.status === CompetitionStatus.Scheduled;
  const canFinishCompetition = isOrganizer && competition.status === CompetitionStatus.Ongoing;
  const canCancelCompetition =
    isOrganizer &&
    (competition.status === CompetitionStatus.Scheduled ||
      competition.status === CompetitionStatus.AcceptingRegistrations);

  // Separate participants by role - only show approved participants
  const organizers =
    competition.participantsList?.filter(
      (p) => p.role === ParticipantRole.Organizer && p.status === ParticipantStatus.Approved
    ) || [];
  const judges =
    competition.participantsList?.filter(
      (p) => p.role === ParticipantRole.Judge && p.status === ParticipantStatus.Approved
    ) || [];
  const competitors =
    competition.participantsList?.filter(
      (p) => p.role === ParticipantRole.Competitor && p.status === ParticipantStatus.Approved
    ) || [];

  const handleJoinCompetition = async () => {
    try {
      await joinCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Wysłano prośbę o dołączenie do zawodów!');
      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleCancelCompetition = async () => {
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
      handleError(error);
    }
  };

  const pageActions: PageHeaderAction[] = [];

  if (canRegisterCatch) {
    pageActions.push({
      label: 'Połowy',
      href: `/competitions/${competitionId}/catch`,
      icon: <Fish className="h-4 w-4" />
    });
  }

  if (canManage) {
    pageActions.push({
      label: 'Uczestnicy',
      href: `/competitions/${competitionId}/manage`,
      icon: <Users2 className="h-4 w-4" />
    });
    pageActions.push({
      label: 'Edytuj',
      href: `/competitions/${competitionId}/edit`,
      icon: <Edit className="h-4 w-4" />
    });
  }

  // Add cancel competition action as the last element with destructive styling
  if (canCancelCompetition) {
    pageActions.push({
      label: cancelCompetitionMutation.isPending ? 'Anulowanie...' : 'Anuluj',
      onClick: handleCancelCompetition,
      icon: <XCircle className="h-4 w-4" />,
      variant: 'destructive',
      disabled: cancelCompetitionMutation.isPending
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader actions={pageActions.length > 0 ? pageActions : undefined} />

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

      {/* Competition Status Management - Only for Organizers */}
      <CompetitionStatusManager
        competitionId={competitionId}
        currentStatus={competition.status!}
        isOrganizer={isOrganizer}
        onStatusChange={refetch}
      />

      {/* Action Buttons - Mobile: Icons only, Desktop: Full text */}
      {canJoin && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-3 -mx-4 sm:-mx-6 mb-6">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
            <Button
              onClick={handleJoinCompetition}
              disabled={joinCompetitionMutation.isPending}
              className="bg-accent text-accent-foreground hover:bg-accent/90 flex-shrink-0"
              size="sm"
            >
              <UserPlus className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">
                {joinCompetitionMutation.isPending ? 'Dołączanie...' : 'Dołącz do Zawodów'}
              </span>
            </Button>
          </div>
        </div>
      )}

      {/* User Registration Status */}
      {currentUserId && !isOrganizer && userRegistrationStatus !== null && userRegistrationStatus !== undefined && (
        <div className="rounded-lg border border-border bg-card p-4 shadow">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Status Twojego zgłoszenia:</span>
            </div>
            <span className={`text-sm font-medium ${getParticipantStatusColor(userRegistrationStatus)}`}>
              {getParticipantStatusText(userRegistrationStatus)}
            </span>
          </div>
          {userRegistrationStatus === ParticipantStatus.Waiting && (
            <p className="text-xs text-muted-foreground mt-2">
              Twoje zgłoszenie oczekuje na zatwierdzenie przez organizatora.
            </p>
          )}
          {userRegistrationStatus === ParticipantStatus.Rejected && (
            <p className="text-xs text-muted-foreground mt-2">Twoje zgłoszenie zostało odrzucone przez organizatora.</p>
          )}
        </div>
      )}

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

          {/* Categories Section */}
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
              <div className="relative z-10 flex items-center space-x-2">
                <Trophy className="h-4 w-4" />
                <span className="text-xs font-medium truncate">Kategorie Zawodów</span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Main Category - Primary Scoring */}
              {competition.primaryScoringInfo && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">Kategoria Główna</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-amber-200 to-transparent"></div>
                  </div>

                  <div className="relative overflow-hidden rounded-lg border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 shadow-sm">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-bl-full"></div>
                    <div className="relative p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-md">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-amber-900 text-base leading-tight">
                            {competition.primaryScoringInfo}
                          </h4>
                          {competition.categories &&
                            competition.categories.find((c) => c.isPrimaryScoring)?.fishSpeciesName && (
                              <p className="text-sm text-amber-700 mt-1">
                                Gatunek: {competition.categories.find((c) => c.isPrimaryScoring)?.fishSpeciesName}
                              </p>
                            )}
                          <div className="flex items-center gap-1 mt-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                            <p className="text-xs text-amber-700 font-medium">Decyduje o głównym rankingu zawodów</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Categories */}
              {competition.categories && competition.categories.filter((c) => !c.isPrimaryScoring).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                      <Fish className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">Kategorie Dodatkowe</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                  </div>

                  <div className="grid gap-3">
                    {competition.categories
                      .filter((category) => !category.isPrimaryScoring)
                      .map((category, index) => (
                        <div
                          key={index}
                          className="relative overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50/30 hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-400/10 to-transparent rounded-bl-full"></div>
                          <div className="relative p-3">
                            <div className="flex items-start gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-md shadow-sm">
                                <Fish className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-slate-800 text-sm leading-tight">{category.name}</h4>
                                {category.fishSpeciesName && (
                                  <p className="text-xs text-slate-600 mt-1">Gatunek: {category.fishSpeciesName}</p>
                                )}
                                {category.description && (
                                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{category.description}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* No categories message */}
              {(!competition.categories || competition.categories.length === 0) && !competition.primaryScoringInfo && (
                <div className="text-center py-8">
                  <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3">
                    <Trophy className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Brak zdefiniowanych kategorii dla tych zawodów</p>
                </div>
              )}

              {/* No additional categories message */}
              {(!competition.categories || competition.categories.filter((c) => !c.isPrimaryScoring).length === 0) &&
                competition.primaryScoringInfo && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-600 text-center italic">
                      Brak dodatkowych kategorii - zawody mają tylko kategorię główną
                    </p>
                  </div>
                )}
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
              {competition.resultsToken ? (
                <div className="space-y-4">
                  {/* Status indicator */}
                  {competition.status === CompetitionStatus.AcceptingRegistrations ||
                  competition.status === CompetitionStatus.Scheduled ? (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <Clock className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">Zawody zaplanowane</p>
                        <p className="text-xs text-slate-600">Wyniki będą dostępne po rozpoczęciu</p>
                      </div>
                    </div>
                  ) : competition.status === CompetitionStatus.Ongoing ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Activity className="h-5 w-5 text-green-600 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Zawody w trakcie!</p>
                        <p className="text-xs text-green-600">Wyniki są aktualizowane na bieżąco</p>
                      </div>
                    </div>
                  ) : competition.status === CompetitionStatus.Finished ? (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Zawody zakończone</p>
                        <p className="text-xs text-blue-600">Oficjalne wyniki są dostępne</p>
                      </div>
                    </div>
                  ) : competition.status === CompetitionStatus.Cancelled ? (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-red-800">Zawody anulowane</p>
                        <p className="text-xs text-red-600">Można przeglądać zarejestrowane wyniki</p>
                      </div>
                    </div>
                  ) : null}

                  {/* Results link - always shown when resultsToken exists */}
                  <Link href={`/results/${competition.resultsToken}`} className="block">
                    <Button
                      variant="default"
                      className={`w-full shadow-md hover:shadow-lg transition-all duration-200 ${
                        competition.status === CompetitionStatus.Ongoing
                          ? 'bg-green-600 hover:bg-green-700'
                          : competition.status === CompetitionStatus.Finished
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : competition.status === CompetitionStatus.Cancelled
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-slate-600 hover:bg-slate-700'
                      } text-white`}
                    >
                      {competition.status === CompetitionStatus.Ongoing ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-pulse" />
                          Zobacz Wyniki na Żywo
                        </>
                      ) : competition.status === CompetitionStatus.Finished ? (
                        <>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Zobacz Oficjalne Wyniki
                        </>
                      ) : (
                        <>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Zobacz Wyniki
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mx-auto mb-3">
                    <BarChart3 className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Wyniki nie są jeszcze dostępne</p>
                </div>
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
