'use client';

import {
  ArrowLeft,
  Ban,
  BarChart3,
  Calendar,
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit3,
  FileCheck,
  FileText,
  Hourglass,
  Play,
  PlayCircle,
  Search,
  Settings,
  ShieldCheck,
  Square,
  StopCircle,
  Trash2,
  Trophy,
  User,
  UserCheck,
  UserPlus,
  UserX,
  Users,
  X,
  XCircle
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useApiError } from '@/hooks/use-api-error';
import {
  useGetCompetitionDetailsById,
  useOrganizerAddsParticipant,
  useOrganizerApprovesParticipant,
  useOrganizerCancelsCompetition,
  useOrganizerFinishesCompetition,
  useOrganizerOpensRegistrations,
  useOrganizerRejectsParticipant,
  useOrganizerRemovesParticipant,
  useOrganizerReopensRegistrations,
  useOrganizerRequestsApproval,
  useOrganizerSchedulesCompetition,
  useOrganizerStartsCompetition
} from '@/lib/api/endpoints/competitions';
import { useSearchAvailableUsers } from '@/lib/api/endpoints/users';
import {
  type AddParticipantCommand,
  CompetitionStatus,
  ParticipantRole,
  ParticipantStatus,
  type UserDto
} from '@/lib/api/models';

import { useCurrentUser } from '@/hooks/use-current-user';

import { PageHeader, PageHeaderAction } from '@/components/layout/PageHeader';
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
  const approveParticipantMutation = useOrganizerApprovesParticipant();
  const rejectParticipantMutation = useOrganizerRejectsParticipant();

  // Status management mutations
  const requestApprovalMutation = useOrganizerRequestsApproval();
  const openRegistrationsMutation = useOrganizerOpensRegistrations();
  const scheduleCompetitionMutation = useOrganizerSchedulesCompetition();
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

  const getStatusText = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.Waiting:
        return 'Oczekuje';
      case ParticipantStatus.Approved:
        return 'Zatwierdzony';
      case ParticipantStatus.Rejected:
        return 'Odrzucony';
      default:
        return status;
    }
  };

  const getStatusColor = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.Waiting:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case ParticipantStatus.Approved:
        return 'bg-green-100 text-green-800 border-green-200';
      case ParticipantStatus.Rejected:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const handleApproveParticipant = async (participantId: number, participantName: string) => {
    try {
      await approveParticipantMutation.mutateAsync({
        competitionId: competitionId,
        participantId: participantId
      });

      toast.success(`${participantName} został zatwierdzony`);
      refetch();
    } catch (error) {
      toast.error('Nie udało się zatwierdzić uczestnika');
    }
  };

  const handleRejectParticipant = async (participantId: number, participantName: string) => {
    if (!confirm(`Czy na pewno chcesz odrzucić zgłoszenie "${participantName}"?`)) {
      return;
    }

    try {
      await rejectParticipantMutation.mutateAsync({
        competitionId: competitionId,
        participantId: participantId
      });

      toast.success(`Zgłoszenie ${participantName} zostało odrzucone`);
      refetch();
    } catch (error) {
      toast.error('Nie udało się odrzucić zgłoszenia');
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

  return (
    <div className="space-y-6">
      <PageHeader onBack={() => (window.location.href = `/competitions/${competitionId}`)} />

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

      {/* Competition Status Management */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="text-xs font-medium truncate">Zarządzanie Statusem</span>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground mb-3">Przepływ statusów:</p>

            {/* Status Flow */}
            <div className="flex flex-col space-y-1">
              {/* Draft */}
              <Button
                variant="outline"
                className="flex items-center justify-between p-2 h-auto text-left w-full cursor-pointer hover:cursor-pointer"
                disabled={true}
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      competition.status === CompetitionStatus.Draft
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <FileText className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Szkic</span>
                </div>
                {competition.status === CompetitionStatus.Draft && (
                  <Badge variant="default" className="bg-blue-500 text-white">
                    Aktualny
                  </Badge>
                )}
              </Button>

              {/* Arrow */}
              <div className="flex justify-center py-1">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>

              {/* Pending Approval */}
              <Button
                variant="outline"
                className="flex items-center justify-between p-2 h-auto text-left w-full cursor-pointer hover:cursor-pointer"
                onClick={competition.status === CompetitionStatus.Draft ? handleRequestApproval : undefined}
                disabled={
                  competition.status !== CompetitionStatus.Draft &&
                  competition.status !== CompetitionStatus.PendingApproval
                }
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      competition.status === CompetitionStatus.PendingApproval
                        ? 'bg-amber-500 text-white'
                        : competition.status === CompetitionStatus.Draft
                          ? 'bg-amber-400 text-white'
                          : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <Hourglass className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Oczekuje na zatwierdzenie</span>
                </div>
                {competition.status === CompetitionStatus.PendingApproval && (
                  <Badge variant="default" className="bg-amber-500 text-white">
                    Aktualny
                  </Badge>
                )}
              </Button>

              {/* Arrow */}
              <div className="flex justify-center py-1">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>

              {/* Accepting Registrations */}
              <Button
                variant="outline"
                className="flex items-center justify-between p-2 h-auto text-left w-full cursor-pointer hover:cursor-pointer"
                onClick={
                  competition.status === CompetitionStatus.Draft
                    ? handleOpenRegistrations
                    : competition.status === CompetitionStatus.Scheduled
                      ? handleReopenRegistrations
                      : undefined
                }
                disabled={
                  competition.status !== CompetitionStatus.Draft &&
                  competition.status !== CompetitionStatus.AcceptingRegistrations &&
                  competition.status !== CompetitionStatus.Scheduled
                }
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      competition.status === CompetitionStatus.AcceptingRegistrations
                        ? 'bg-green-500 text-white'
                        : competition.status === CompetitionStatus.Draft ||
                            competition.status === CompetitionStatus.Scheduled
                          ? 'bg-green-400 text-white'
                          : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <Users className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Przyjmuje rejestracje</span>
                </div>
                {competition.status === CompetitionStatus.AcceptingRegistrations && (
                  <Badge variant="default" className="bg-green-500 text-white">
                    Aktualny
                  </Badge>
                )}
              </Button>

              {/* Arrow */}
              <div className="flex justify-center py-1">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>

              {/* Scheduled */}
              <Button
                variant="outline"
                className="flex items-center justify-between p-2 h-auto text-left w-full cursor-pointer hover:cursor-pointer"
                onClick={
                  competition.status === CompetitionStatus.AcceptingRegistrations
                    ? handleScheduleCompetition
                    : undefined
                }
                disabled={
                  competition.status !== CompetitionStatus.AcceptingRegistrations &&
                  competition.status !== CompetitionStatus.Scheduled
                }
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      competition.status === CompetitionStatus.Scheduled
                        ? 'bg-blue-500 text-white'
                        : competition.status === CompetitionStatus.AcceptingRegistrations
                          ? 'bg-blue-400 text-white'
                          : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <Calendar className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Zaplanowane</span>
                </div>
                {competition.status === CompetitionStatus.Scheduled && (
                  <Badge variant="default" className="bg-blue-500 text-white">
                    Aktualny
                  </Badge>
                )}
              </Button>

              {/* Arrow */}
              <div className="flex justify-center py-1">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>

              {/* Ongoing */}
              <Button
                variant="outline"
                className="flex items-center justify-between p-2 h-auto text-left w-full cursor-pointer hover:cursor-pointer"
                onClick={competition.status === CompetitionStatus.Scheduled ? handleStartCompetition : undefined}
                disabled={
                  competition.status !== CompetitionStatus.Scheduled && competition.status !== CompetitionStatus.Ongoing
                }
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      competition.status === CompetitionStatus.Ongoing
                        ? 'bg-emerald-500 text-white'
                        : competition.status === CompetitionStatus.Scheduled
                          ? 'bg-emerald-400 text-white'
                          : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <Play className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm font-medium">W trakcie</span>
                </div>
                {competition.status === CompetitionStatus.Ongoing && (
                  <Badge variant="default" className="bg-emerald-500 text-white">
                    Aktualny
                  </Badge>
                )}
              </Button>

              {/* Arrow */}
              <div className="flex justify-center py-1">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>

              {/* Finished */}
              <Button
                variant="outline"
                className="flex items-center justify-between p-2 h-auto text-left w-full cursor-pointer hover:cursor-pointer"
                onClick={competition.status === CompetitionStatus.Ongoing ? handleFinishCompetition : undefined}
                disabled={
                  competition.status !== CompetitionStatus.Ongoing && competition.status !== CompetitionStatus.Finished
                }
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      competition.status === CompetitionStatus.Finished
                        ? 'bg-gray-600 text-white'
                        : competition.status === CompetitionStatus.Ongoing
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Zakończone</span>
                </div>
                {competition.status === CompetitionStatus.Finished && (
                  <Badge variant="default" className="bg-gray-600 text-white">
                    Aktualny
                  </Badge>
                )}
              </Button>

              {/* Arrow */}
              <div className="flex justify-center py-1">
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>

              {/* Cancelled Status */}
              <Button
                variant="outline"
                className="flex items-center justify-between p-2 h-auto text-left w-full cursor-pointer hover:cursor-pointer"
                onClick={
                  competition.status !== CompetitionStatus.Finished &&
                  competition.status !== CompetitionStatus.Cancelled
                    ? handleCancelCompetition
                    : undefined
                }
                disabled={
                  competition.status === CompetitionStatus.Finished ||
                  competition.status === CompetitionStatus.Cancelled
                }
              >
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      competition.status === CompetitionStatus.Cancelled
                        ? 'bg-red-500 text-white'
                        : competition.status !== CompetitionStatus.Finished
                          ? 'bg-red-400 text-white'
                          : 'bg-gray-300 text-gray-500'
                    }`}
                  >
                    <XCircle className="h-3 w-3" />
                  </div>
                  <span className="ml-2 text-sm font-medium">Anulowane</span>
                </div>
                {competition.status === CompetitionStatus.Cancelled && (
                  <Badge variant="default" className="bg-red-500 text-white">
                    Aktualny
                  </Badge>
                )}
              </Button>
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
              Uczestnicy i Zgłoszenia ({competition.participantsList?.length || 0})
            </span>
          </div>
        </div>
        <div className="p-4">
          {!competition.participantsList || competition.participantsList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Brak uczestników</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Uczestnik</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Rola</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Źródło</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {competition.participantsList.map((participant) => (
                    <tr key={participant.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-3">
                          {!participant.userId ? (
                            <UserX className="h-4 w-4 text-gray-500" />
                          ) : (
                            getRoleIcon(participant.role!)
                          )}
                          <span className="font-medium">{participant.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-sm text-muted-foreground">{getRoleText(participant.role!)}</span>
                      </td>
                      <td className="py-3 px-3">
                        <Badge className={`text-xs border ${getStatusColor(participant.status!)}`}>
                          {getStatusText(participant.status!)}
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-xs text-muted-foreground">
                          {participant.addedByOrganizer ? 'Dodany przez organizatora' : 'Dołączył samodzielnie'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end space-x-2">
                          {participant.role !== ParticipantRole.Organizer && (
                            <>
                              {participant.status === ParticipantStatus.Waiting && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproveParticipant(participant.id!, participant.name!)}
                                    disabled={approveParticipantMutation.isPending}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectParticipant(participant.id!, participant.name!)}
                                    disabled={rejectParticipantMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {participant.status === ParticipantStatus.Rejected && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApproveParticipant(participant.id!, participant.name!)}
                                  disabled={approveParticipantMutation.isPending}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {participant.status === ParticipantStatus.Approved && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRejectParticipant(participant.id!, participant.name!)}
                                  disabled={rejectParticipantMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              )}
                              {participant.userId !== currentUserId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveParticipant(participant.id!, participant.name!)}
                                  disabled={removeParticipantMutation.isPending}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
      <PageHeader showBackButton={false} />

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
