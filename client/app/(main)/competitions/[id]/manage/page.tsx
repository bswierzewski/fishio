'use client';

import {
  ArrowLeft,
  Ban,
  BarChart3,
  CalendarDays,
  CheckCircle,
  Clock,
  FileText,
  Hourglass,
  Play,
  Search,
  Settings,
  ShieldCheck,
  Square,
  Trash2,
  Trophy,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useApiError } from '@/hooks/use-api-error';
import {
  useGetCompetitionDetailsById,
  useOrganizerAddsParticipant,
  useOrganizerCancelsCompetition,
  useOrganizerFinishesCompetition,
  useOrganizerOpensRegistrations,
  useOrganizerRemovesParticipant,
  useOrganizerReopensRegistrations,
  useOrganizerRequestsApproval,
  useOrganizerSchedulesCompetition,
  useOrganizerSetsUpcoming,
  useOrganizerStartsCompetition
} from '@/lib/api/endpoints/competitions';
import { useSearchAvailableUsers } from '@/lib/api/endpoints/users';
import { type AddParticipantCommand, CompetitionStatus, ParticipantRole, type UserDto } from '@/lib/api/models';

import { useCurrentUser } from '@/hooks/use-current-user';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

type ParticipantFormData = {
  participantType: 'user' | 'guest';
  selectedUser: UserDto | null;
  guestName: string;
  role: ParticipantRole;
  userSearchTerm: string;
};

export default function CompetitionManagePage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);

  // Get current user information (must be called before any early returns)
  const { id: currentUserId, name: currentUserName } = useCurrentUser();

  // Form state
  const [participantForm, setParticipantForm] = useState<ParticipantFormData>({
    participantType: 'user',
    selectedUser: null,
    guestName: '',
    role: ParticipantRole.Competitor,
    userSearchTerm: ''
  });

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

  // User search
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch: searchUsers
  } = useSearchAvailableUsers(
    {
      SearchTerm: participantForm.userSearchTerm,
      MaxResults: 10
    },
    {
      query: {
        enabled: false // We'll trigger this manually
      }
    }
  );

  // Mutations
  const addParticipantMutation = useOrganizerAddsParticipant();
  const removeParticipantMutation = useOrganizerRemovesParticipant();

  // Status management mutations
  const requestApprovalMutation = useOrganizerRequestsApproval();
  const openRegistrationsMutation = useOrganizerOpensRegistrations();
  const scheduleCompetitionMutation = useOrganizerSchedulesCompetition();
  const setUpcomingMutation = useOrganizerSetsUpcoming();
  const reopenRegistrationsMutation = useOrganizerReopensRegistrations();
  const startCompetitionMutation = useOrganizerStartsCompetition();
  const finishCompetitionMutation = useOrganizerFinishesCompetition();
  const cancelCompetitionMutation = useOrganizerCancelsCompetition();

  // API error handling
  const { handleError } = useApiError();

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

  // Check if user is organizer
  const isOrganizer = currentUserId ? competition.organizerId === currentUserId : false;

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

  // Separate participants by role
  const organizers = competition.participantsList?.filter((p) => p.role === ParticipantRole.Organizer) || [];
  const judges = competition.participantsList?.filter((p) => p.role === ParticipantRole.Judge) || [];
  const competitors = competition.participantsList?.filter((p) => p.role === ParticipantRole.Competitor) || [];

  // Helper functions
  const getRoleIcon = (role: ParticipantRole) => {
    switch (role) {
      case ParticipantRole.Organizer:
        return <Trophy className="h-4 w-4 text-amber-500" />;
      case ParticipantRole.Judge:
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case ParticipantRole.Competitor:
        return <UserCheck className="h-4 w-4 text-green-500" />;
      default:
        return <UserCheck className="h-4 w-4" />;
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

  // Handler functions
  const handleUserSearch = async () => {
    if (participantForm.userSearchTerm.trim().length >= 2) {
      await searchUsers();
    }
  };

  const handleSelectUser = (user: UserDto) => {
    setParticipantForm((prev) => ({
      ...prev,
      selectedUser: user,
      userSearchTerm: user.name || ''
    }));
  };

  const handleClearUserSelection = () => {
    setParticipantForm((prev) => ({
      ...prev,
      selectedUser: null,
      userSearchTerm: ''
    }));
  };

  const resetForm = () => {
    setParticipantForm({
      participantType: 'user',
      selectedUser: null,
      guestName: '',
      role: ParticipantRole.Competitor,
      userSearchTerm: ''
    });
  };

  const handleAddParticipant = async () => {
    // Validation
    if (participantForm.participantType === 'user' && !participantForm.selectedUser) {
      toast.error('Wybierz użytkownika z listy');
      return;
    }

    if (participantForm.participantType === 'guest' && !participantForm.guestName.trim()) {
      toast.error('Nazwa gościa jest wymagana');
      return;
    }

    // Guests can only be Competitors
    if (participantForm.participantType === 'guest' && participantForm.role !== ParticipantRole.Competitor) {
      toast.error('Goście mogą mieć tylko rolę Zawodnik');
      return;
    }

    try {
      const command: AddParticipantCommand = {
        competitionId: competitionId,
        userId: participantForm.participantType === 'user' ? participantForm.selectedUser?.id : undefined,
        guestName: participantForm.participantType === 'guest' ? participantForm.guestName.trim() : undefined,
        role: participantForm.role
      };

      await addParticipantMutation.mutateAsync({
        competitionId: competitionId,
        data: command
      });

      const participantName =
        participantForm.participantType === 'user' ? participantForm.selectedUser?.name : participantForm.guestName;

      toast.success(`${participantName} został dodany jako ${getRoleText(participantForm.role)}!`);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Nie udało się dodać uczestnika');
    }
  };

  const handleRemoveParticipant = async (participantId: number, participantName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć uczestnika "${participantName}"?`)) {
      return;
    }

    try {
      await removeParticipantMutation.mutateAsync({
        competitionId: competitionId,
        participantEntryId: participantId
      });

      toast.success('Uczestnik został usunięty');
      refetch();
    } catch (error) {
      toast.error('Nie udało się usunąć uczestnika');
    }
  };

  // Status management handlers
  const handleRequestApproval = async () => {
    if (!competitionId) return;

    try {
      await requestApprovalMutation.mutateAsync({ competitionId });
      toast.success('Wniosek o zatwierdzenie został wysłany!');
      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleOpenRegistrations = async () => {
    if (!competitionId) return;

    try {
      await openRegistrationsMutation.mutateAsync({ competitionId });
      toast.success('Rejestracje zostały otwarte!');
      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleScheduleCompetition = async () => {
    if (!competitionId) return;

    try {
      await scheduleCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały zaplanowane!');
      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSetUpcoming = async () => {
    if (!competitionId) return;

    try {
      await setUpcomingMutation.mutateAsync({ competitionId });
      toast.success('Status zawodów został zmieniony na "Nadchodzące"!');
      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleReopenRegistrations = async () => {
    if (!competitionId) return;

    try {
      await reopenRegistrationsMutation.mutateAsync({ competitionId });
      toast.success('Rejestracje zostały ponownie otwarte!');
      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleStartCompetition = async () => {
    if (!competitionId) return;

    try {
      await startCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały rozpoczęte!');
      refetch();
    } catch (error) {
      handleError(error);
    }
  };

  const handleFinishCompetition = async () => {
    if (!competitionId) return;

    try {
      await finishCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały zakończone!');
      refetch();
    } catch (error) {
      handleError(error);
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
      handleError(error);
    }
  };

  // Helper functions for status management
  const getStatusColor = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.Draft:
        return 'text-gray-500';
      case CompetitionStatus.PendingApproval:
        return 'text-yellow-500';
      case CompetitionStatus.AcceptingRegistrations:
      case CompetitionStatus.Scheduled:
      case CompetitionStatus.Upcoming:
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

  const getStatusIcon = (status: CompetitionStatus) => {
    switch (status) {
      case CompetitionStatus.Draft:
        return <FileText className="h-4 w-4" />;
      case CompetitionStatus.PendingApproval:
        return <Hourglass className="h-4 w-4" />;
      case CompetitionStatus.AcceptingRegistrations:
        return <UserPlus className="h-4 w-4" />;
      case CompetitionStatus.Scheduled:
        return <CalendarDays className="h-4 w-4" />;
      case CompetitionStatus.Upcoming:
        return <Clock className="h-4 w-4" />;
      case CompetitionStatus.Ongoing:
        return <Play className="h-4 w-4" />;
      case CompetitionStatus.Finished:
        return <CheckCircle className="h-4 w-4" />;
      case CompetitionStatus.Cancelled:
        return <Ban className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Determine available status actions
  const getAvailableActions = (status: CompetitionStatus) => {
    const actions = [];

    switch (status) {
      case CompetitionStatus.Draft:
        actions.push({
          label: 'Wyślij do zatwierdzenia',
          action: handleRequestApproval,
          loading: requestApprovalMutation.isPending,
          variant: 'default' as const,
          icon: <Hourglass className="mr-2 h-4 w-4" />
        });
        actions.push({
          label: 'Otwórz rejestracje',
          action: handleOpenRegistrations,
          loading: openRegistrationsMutation.isPending,
          variant: 'default' as const,
          icon: <UserPlus className="mr-2 h-4 w-4" />
        });
        break;

      case CompetitionStatus.AcceptingRegistrations:
        actions.push({
          label: 'Zaplanuj zawody',
          action: handleScheduleCompetition,
          loading: scheduleCompetitionMutation.isPending,
          variant: 'default' as const,
          icon: <CalendarDays className="mr-2 h-4 w-4" />
        });
        break;

      case CompetitionStatus.Scheduled:
        actions.push({
          label: 'Ustaw jako nadchodzące',
          action: handleSetUpcoming,
          loading: setUpcomingMutation.isPending,
          variant: 'default' as const,
          icon: <Clock className="mr-2 h-4 w-4" />
        });
        actions.push({
          label: 'Ponownie otwórz rejestracje',
          action: handleReopenRegistrations,
          loading: reopenRegistrationsMutation.isPending,
          variant: 'outline' as const,
          icon: <UserPlus className="mr-2 h-4 w-4" />
        });
        actions.push({
          label: 'Rozpocznij zawody',
          action: handleStartCompetition,
          loading: startCompetitionMutation.isPending,
          variant: 'default' as const,
          icon: <Play className="mr-2 h-4 w-4" />
        });
        break;

      case CompetitionStatus.Upcoming:
        actions.push({
          label: 'Ponownie otwórz rejestracje',
          action: handleReopenRegistrations,
          loading: reopenRegistrationsMutation.isPending,
          variant: 'outline' as const,
          icon: <UserPlus className="mr-2 h-4 w-4" />
        });
        actions.push({
          label: 'Rozpocznij zawody',
          action: handleStartCompetition,
          loading: startCompetitionMutation.isPending,
          variant: 'default' as const,
          icon: <Play className="mr-2 h-4 w-4" />
        });
        break;

      case CompetitionStatus.Ongoing:
        actions.push({
          label: 'Zakończ zawody',
          action: handleFinishCompetition,
          loading: finishCompetitionMutation.isPending,
          variant: 'default' as const,
          icon: <Square className="mr-2 h-4 w-4" />
        });
        break;
    }

    // Cancel action (available for most statuses except Finished and Cancelled)
    if (status !== CompetitionStatus.Finished && status !== CompetitionStatus.Cancelled) {
      actions.push({
        label: 'Anuluj zawody',
        action: handleCancelCompetition,
        loading: cancelCompetitionMutation.isPending,
        variant: 'destructive' as const,
        icon: <Ban className="mr-2 h-4 w-4" />
      });
    }

    return actions;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Zarządzanie Zawodami</h1>
          <p className="text-muted-foreground">{competition.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/competitions/${competitionId}/edit`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Ustawienia
            </Button>
          </Link>
          <Link href={`/competitions/${competitionId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Powrót
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="text-xs font-medium truncate">Statystyki Zawodów</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{competitors.length}</div>
              <div className="text-sm text-muted-foreground">Zawodników</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{judges.length}</div>
              <div className="text-sm text-muted-foreground">Sędziów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{organizers.length}</div>
              <div className="text-sm text-muted-foreground">Organizatorów</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{competition.categories?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Kategorii</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Management */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-xs font-medium truncate">Zarządzanie Statusem</span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Status Flow Information */}
          <div>
            <h3 className="font-medium mb-4 text-foreground">Przepływ statusów:</h3>
            <div className="space-y-3">
              {/* Draft Status */}
              <div className="flex items-center space-x-2">
                <Badge
                  variant={competition.status === CompetitionStatus.Draft ? 'default' : 'outline'}
                  className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.Draft ? 'bg-gray-600' : ''}`}
                >
                  <FileText className="mr-1 h-4 w-4" />
                  Szkic
                </Badge>
                <span className="text-gray-400">→</span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={competition.status !== CompetitionStatus.Draft || requestApprovalMutation.isPending}
                    onClick={handleRequestApproval}
                    className="h-8 text-xs"
                  >
                    <Hourglass className="mr-1 h-3 w-3" />
                    Wyślij do zatwierdzenia
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={competition.status !== CompetitionStatus.Draft || openRegistrationsMutation.isPending}
                    onClick={handleOpenRegistrations}
                    className="h-8 text-xs"
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Otwórz rejestracje
                  </Button>
                </div>
              </div>

              {/* PendingApproval Status */}
              <div className="flex items-center space-x-2">
                <Badge
                  variant={competition.status === CompetitionStatus.PendingApproval ? 'default' : 'outline'}
                  className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.PendingApproval ? 'bg-yellow-600' : ''}`}
                >
                  <Hourglass className="mr-1 h-4 w-4" />
                  Oczekuje na zatwierdzenie
                </Badge>
                <span className="text-gray-400">→</span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={true}
                    className="h-8 text-xs opacity-50 cursor-not-allowed"
                  >
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Zatwierdzenie przez administratora
                  </Button>
                </div>
              </div>

              {/* AcceptingRegistrations Status */}
              <div className="flex items-center space-x-2">
                <Badge
                  variant={competition.status === CompetitionStatus.AcceptingRegistrations ? 'default' : 'outline'}
                  className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.AcceptingRegistrations ? 'bg-blue-600' : ''}`}
                >
                  <UserPlus className="mr-1 h-4 w-4" />
                  Przyjmuje rejestracje
                </Badge>
                <span className="text-gray-400">→</span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      competition.status !== CompetitionStatus.AcceptingRegistrations ||
                      scheduleCompetitionMutation.isPending
                    }
                    onClick={handleScheduleCompetition}
                    className="h-8 text-xs"
                  >
                    <CalendarDays className="mr-1 h-3 w-3" />
                    Zaplanuj zawody
                  </Button>
                </div>
              </div>

              {/* Scheduled Status */}
              <div className="flex items-center space-x-2">
                <Badge
                  variant={competition.status === CompetitionStatus.Scheduled ? 'default' : 'outline'}
                  className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.Scheduled ? 'bg-blue-600' : ''}`}
                >
                  <CalendarDays className="mr-1 h-4 w-4" />
                  Zaplanowane
                </Badge>
                <span className="text-gray-400">→</span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={competition.status !== CompetitionStatus.Scheduled || setUpcomingMutation.isPending}
                    onClick={handleSetUpcoming}
                    className="h-8 text-xs"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Ustaw jako nadchodzące
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      competition.status !== CompetitionStatus.Scheduled || reopenRegistrationsMutation.isPending
                    }
                    onClick={handleReopenRegistrations}
                    className="h-8 text-xs"
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Ponownie otwórz rejestracje
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={competition.status !== CompetitionStatus.Scheduled || startCompetitionMutation.isPending}
                    onClick={handleStartCompetition}
                    className="h-8 text-xs"
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Rozpocznij zawody
                  </Button>
                </div>
              </div>

              {/* Upcoming Status */}
              <div className="flex items-center space-x-2">
                <Badge
                  variant={competition.status === CompetitionStatus.Upcoming ? 'default' : 'outline'}
                  className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.Upcoming ? 'bg-blue-600' : ''}`}
                >
                  <Clock className="mr-1 h-4 w-4" />
                  Nadchodzące
                </Badge>
                <span className="text-gray-400">→</span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={
                      competition.status !== CompetitionStatus.Upcoming || reopenRegistrationsMutation.isPending
                    }
                    onClick={handleReopenRegistrations}
                    className="h-8 text-xs"
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Ponownie otwórz rejestracje
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={competition.status !== CompetitionStatus.Upcoming || startCompetitionMutation.isPending}
                    onClick={handleStartCompetition}
                    className="h-8 text-xs"
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Rozpocznij zawody
                  </Button>
                </div>
              </div>

              {/* Ongoing Status */}
              <div className="flex items-center space-x-2">
                <Badge
                  variant={competition.status === CompetitionStatus.Ongoing ? 'default' : 'outline'}
                  className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.Ongoing ? 'bg-green-600' : ''}`}
                >
                  <Play className="mr-1 h-4 w-4" />W trakcie
                </Badge>
                <span className="text-gray-400">→</span>
                <div className="flex flex-wrap gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={competition.status !== CompetitionStatus.Ongoing || finishCompetitionMutation.isPending}
                    onClick={handleFinishCompetition}
                    className="h-8 text-xs"
                  >
                    <Square className="mr-1 h-3 w-3" />
                    Zakończ zawody
                  </Button>
                </div>
              </div>

              {/* Terminal States */}
              <div className="flex items-center space-x-2">
                <div className="flex gap-2">
                  <Badge
                    variant={competition.status === CompetitionStatus.Finished ? 'default' : 'outline'}
                    className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.Finished ? 'bg-gray-600' : ''}`}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Zakończone
                  </Badge>
                  <Badge
                    variant={competition.status === CompetitionStatus.Cancelled ? 'default' : 'outline'}
                    className={`px-3 py-1.5 h-8 ${competition.status === CompetitionStatus.Cancelled ? 'bg-red-600' : ''}`}
                  >
                    <Ban className="mr-1 h-4 w-4" />
                    Anulowane
                  </Badge>
                </div>
                <span className="text-gray-400 text-xs">(Statusy końcowe)</span>
              </div>

              {/* Cancel Action - Available for most statuses */}
              {competition.status !== CompetitionStatus.Finished &&
                competition.status !== CompetitionStatus.Cancelled && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-muted-foreground font-medium">Akcja specjalna:</span>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={cancelCompetitionMutation.isPending}
                        onClick={handleCancelCompetition}
                        className="h-8 text-xs"
                      >
                        <Ban className="mr-1 h-3 w-3" />
                        {cancelCompetitionMutation.isPending ? 'Anulowanie...' : 'Anuluj zawody'}
                      </Button>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Participant Form */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span className="text-xs font-medium truncate">Dodaj Uczestnika</span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-muted-foreground">
            Dodaj nowego uczestnika do zawodów. Możesz wybrać zarejestrowanego użytkownika lub dodać gościa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Participant Type Selection */}
            <div className="space-y-2">
              <Label>Typ uczestnika</Label>
              <Select
                value={participantForm.participantType}
                onValueChange={(value: 'user' | 'guest') => {
                  setParticipantForm((prev) => ({
                    ...prev,
                    participantType: value,
                    selectedUser: null,
                    guestName: '',
                    userSearchTerm: '',
                    role: value === 'guest' ? ParticipantRole.Competitor : prev.role
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Zarejestrowany użytkownik</SelectItem>
                  <SelectItem value="guest">Gość (anonimowy)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Selection or Guest Name */}
            <div className="space-y-2">
              {participantForm.participantType === 'user' ? (
                <>
                  <Label>Wybierz użytkownika</Label>
                  {participantForm.selectedUser ? (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="font-medium text-sm">{participantForm.selectedUser.name}</p>
                          <p className="text-xs text-muted-foreground">{participantForm.selectedUser.email}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleClearUserSelection}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Wyszukaj użytkownika..."
                        value={participantForm.userSearchTerm}
                        onChange={(e) => setParticipantForm((prev) => ({ ...prev, userSearchTerm: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleUserSearch();
                          }
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUserSearch}
                        disabled={isSearching || participantForm.userSearchTerm.trim().length < 2}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Label htmlFor="guestName">Nazwa gościa</Label>
                  <Input
                    id="guestName"
                    value={participantForm.guestName}
                    onChange={(e) => setParticipantForm((prev) => ({ ...prev, guestName: e.target.value }))}
                    placeholder="Wprowadź nazwę gościa"
                  />
                </>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>Rola</Label>
              <Select
                value={participantForm.role}
                onValueChange={(value) => setParticipantForm((prev) => ({ ...prev, role: value as ParticipantRole }))}
                disabled={participantForm.participantType === 'guest'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ParticipantRole.Competitor}>Zawodnik</SelectItem>
                  <SelectItem value={ParticipantRole.Judge}>Sędzia</SelectItem>
                  <SelectItem value={ParticipantRole.Organizer}>Organizator</SelectItem>
                </SelectContent>
              </Select>
              {participantForm.participantType === 'guest' && (
                <p className="text-xs text-muted-foreground">Goście mogą mieć tylko rolę Zawodnik</p>
              )}
            </div>

            {/* Add Button */}
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={handleAddParticipant} disabled={addParticipantMutation.isPending} className="w-full">
                {addParticipantMutation.isPending ? 'Dodawanie...' : 'Dodaj'}
              </Button>
            </div>
          </div>

          {/* User Search Results */}
          {participantForm.participantType === 'user' &&
            !participantForm.selectedUser &&
            searchResults &&
            searchResults.length > 0 && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm font-medium mb-3">Wyniki wyszukiwania:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {searchResults.map((user) => (
                    <button
                      key={user.id}
                      className="w-full p-3 text-left hover:bg-background rounded-lg flex items-center space-x-2 transition-colors"
                      onClick={() => handleSelectUser(user)}
                    >
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          {participantForm.participantType === 'user' &&
            !participantForm.selectedUser &&
            participantForm.userSearchTerm.trim().length >= 2 &&
            searchResults &&
            searchResults.length === 0 && <p className="text-sm text-muted-foreground">Nie znaleziono użytkowników</p>}
        </div>
      </div>

      {/* Participants List */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="text-xs font-medium truncate">
              Uczestnicy ({competition.participantsList?.length || 0})
            </span>
          </div>
        </div>
        <div className="p-4">
          {!competition.participantsList || competition.participantsList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Brak uczestników</p>
          ) : (
            <div className="space-y-6">
              {/* Organizers */}
              {organizers.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    <h3 className="font-medium text-amber-600">Organizatorzy ({organizers.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {organizers.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(participant.role!)}
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <div className="flex items-center space-x-2">
                              {participant.addedByOrganizer && (
                                <span className="text-xs text-muted-foreground">• Dodany przez organizatora</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {participant.addedByOrganizer && participant.userId !== currentUserId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveParticipant(participant.id!, participant.name!)}
                            disabled={removeParticipantMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Judges */}
              {judges.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium text-blue-600">Sędziowie ({judges.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {judges.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {getRoleIcon(participant.role!)}
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <div className="flex items-center space-x-2">
                              {participant.addedByOrganizer && (
                                <span className="text-xs text-muted-foreground">• Dodany przez organizatora</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {participant.addedByOrganizer && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveParticipant(participant.id!, participant.name!)}
                            disabled={removeParticipantMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competitors */}
              {competitors.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <UserCheck className="h-4 w-4 text-green-500" />
                    <h3 className="font-medium text-green-600">Zawodnicy ({competitors.length})</h3>
                  </div>
                  <div className="space-y-3">
                    {competitors.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {!participant.userId ? (
                            <UserX className="h-4 w-4 text-gray-500" />
                          ) : (
                            getRoleIcon(participant.role!)
                          )}
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <div className="flex items-center space-x-2">
                              {participant.addedByOrganizer && (
                                <span className="text-xs text-muted-foreground">• Dodany przez organizatora</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {participant.addedByOrganizer && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveParticipant(participant.id!, participant.name!)}
                            disabled={removeParticipantMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 h-10"></div>
        <div className="p-4">
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

      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 h-10"></div>
        <div className="p-4">
          <Skeleton className="h-4 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 h-10"></div>
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 h-10"></div>
        <div className="p-4 space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-24" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 h-10"></div>
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
