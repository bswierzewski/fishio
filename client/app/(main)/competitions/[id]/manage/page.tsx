'use client';

import {
  ArrowLeft,
  Ban,
  BarChart3,
  CheckCircle,
  Clock,
  Edit3,
  FileCheck,
  MapPin,
  Save,
  Search,
  ShieldCheck,
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
  useGetCompetitionParticipantsWithAssignments,
  useOrganizerAddsParticipant,
  useOrganizerApprovesParticipant,
  useOrganizerRejectsParticipant,
  useOrganizerRemovesParticipant,
  useUpdateParticipantAssignment
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

type EditingParticipant = {
  id: number;
  sector: string;
  stand: string;
};

export default function CompetitionManagePage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<EditingParticipant | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

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

  // Fetch participants with assignments
  const {
    data: assignmentsData,
    isLoading: isAssignmentsLoading,
    refetch: refetchAssignments
  } = useGetCompetitionParticipantsWithAssignments(competitionId || 0, {
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
  const updateAssignmentMutation = useUpdateParticipantAssignment();

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

  const getStatusIcon = (status: ParticipantStatus) => {
    switch (status) {
      case ParticipantStatus.Waiting:
        return (
          <div title="Oczekuje na zatwierdzenie">
            <Clock className="h-4 w-4 text-yellow-500" />
          </div>
        );
      case ParticipantStatus.Approved:
        return (
          <div title="Zatwierdzony">
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
        );
      case ParticipantStatus.Rejected:
        return (
          <div title="Odrzucony">
            <XCircle className="h-4 w-4 text-red-500" />
          </div>
        );
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get assignment data for a participant
  const getParticipantAssignment = (participantId: number) => {
    return assignmentsData?.participants?.find((p) => p.id === participantId);
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
      refetchAssignments();
    } catch (error) {
      handleError(error);
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
      refetchAssignments();
    } catch (error) {
      handleError(error);
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
      handleError(error);
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
      handleError(error);
    }
  };

  const handleSaveAssignment = async () => {
    if (!editingParticipant) return;

    try {
      await updateAssignmentMutation.mutateAsync({
        competitionId: competitionId,
        participantId: editingParticipant.id,
        data: {
          sector: editingParticipant.sector.trim() || null,
          stand: editingParticipant.stand.trim() || null
        }
      });

      toast.success('Przypisanie zostało zaktualizowane');
      setEditingParticipant(null);
      refetchAssignments();
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

      {/* Add Participant Form */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span className="text-xs font-medium truncate">Dodaj Uczestnika</span>
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* First row: Participant Type and Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Second row: User Selection or Guest Name */}
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

          {/* Third row: Add Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleAddParticipant}
              disabled={addParticipantMutation.isPending}
              className="w-full sm:w-auto"
            >
              {addParticipantMutation.isPending ? 'Dodawanie...' : 'Dodaj uczestnika'}
            </Button>
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

      {/* Staff (Organizers and Judges) */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="text-xs font-medium truncate">
              Obsługa Zawodów (
              {competition.participantsList?.filter(
                (p) =>
                  p.status === ParticipantStatus.Approved &&
                  (p.role === ParticipantRole.Organizer || p.role === ParticipantRole.Judge)
              ).length || 0}
              )
            </span>
          </div>
        </div>
        <div className="p-4">
          {!competition.participantsList ||
          competition.participantsList.filter(
            (p) =>
              p.status === ParticipantStatus.Approved &&
              (p.role === ParticipantRole.Organizer || p.role === ParticipantRole.Judge)
          ).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Brak obsługi zawodów</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Osoba</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Rola</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {competition.participantsList
                    .filter(
                      (p) =>
                        p.status === ParticipantStatus.Approved &&
                        (p.role === ParticipantRole.Organizer || p.role === ParticipantRole.Judge)
                    )
                    .map((participant) => (
                      <tr key={participant.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">{getRoleIcon(participant.role!)}</div>
                            <div>
                              <span className="font-medium">{participant.name}</span>
                              {!participant.userId && (
                                <Badge variant="outline" className="text-xs ml-2">
                                  Gość
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-sm">{getRoleText(participant.role!)}</span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center justify-end space-x-2">
                            {participant.role !== ParticipantRole.Organizer && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveParticipant(participant.id!, participant.name!)}
                                disabled={removeParticipantMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Usuń z obsługi"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
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

      {/* Competitors */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span className="text-xs font-medium truncate">
              Zawodnicy (
              {competition.participantsList?.filter(
                (p) => p.status === ParticipantStatus.Approved && p.role === ParticipantRole.Competitor
              ).length || 0}
              )
            </span>
          </div>
        </div>
        <div className="p-4">
          {!competition.participantsList ||
          competition.participantsList.filter(
            (p) => p.status === ParticipantStatus.Approved && p.role === ParticipantRole.Competitor
          ).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Brak zatwierdzonych zawodników</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Zawodnik</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {competition.participantsList
                    .filter((p) => p.status === ParticipantStatus.Approved && p.role === ParticipantRole.Competitor)
                    .map((participant) => {
                      const assignment = getParticipantAssignment(participant.id!);

                      return (
                        <tr key={participant.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <UserCheck
                                  className={`h-4 w-4 ${participant.userId ? 'text-green-500' : 'text-gray-500'}`}
                                />
                              </div>
                              <div>
                                <div className="font-medium">{participant.name}</div>
                                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                  {assignment?.sector && (
                                    <div className="flex items-center space-x-1">
                                      <MapPin className="h-3 w-3" />
                                      <span>Sektor {assignment.sector}</span>
                                    </div>
                                  )}
                                  {assignment?.stand && (
                                    <div className="flex items-center space-x-1">
                                      <span>•</span>
                                      <span>Stanowisko {assignment.stand}</span>
                                    </div>
                                  )}
                                  {!assignment?.sector && !assignment?.stand && <span>Brak przypisania</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingParticipant({
                                    id: participant.id!,
                                    sector: assignment?.sector || '',
                                    stand: assignment?.stand || ''
                                  });
                                  setAssignmentDialogOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                                title="Edytuj sektor i stanowisko"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectParticipant(participant.id!, participant.name!)}
                                disabled={rejectParticipantMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                title="Odrzuć zawodnika"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pending Applications */}
      <div className="overflow-hidden rounded-lg bg-card shadow">
        <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
          <div className="relative z-10 flex items-center space-x-2">
            <FileCheck className="h-4 w-4" />
            <span className="text-xs font-medium truncate">
              Zgłoszenia (
              {competition.participantsList?.filter((p) => p.status !== ParticipantStatus.Approved).length || 0})
            </span>
          </div>
        </div>
        <div className="p-4">
          {!competition.participantsList ||
          competition.participantsList.filter((p) => p.status !== ParticipantStatus.Approved).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Brak oczekujących zgłoszeń</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Zgłoszenie</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-muted-foreground">Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {competition.participantsList
                    .filter((p) => p.status !== ParticipantStatus.Approved)
                    .map((participant) => (
                      <tr
                        key={participant.id}
                        className="border-b border-border hover:bg-muted/50 transition-colors h-16"
                      >
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <UserCheck
                                className={`h-4 w-4 ${participant.userId ? 'text-green-500' : 'text-gray-500'}`}
                              />
                            </div>
                            <div>
                              <span className="font-medium">{participant.name}</span>
                              <div className="text-xs text-muted-foreground">{getRoleText(participant.role!)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center">{getStatusIcon(participant.status!)}</div>
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
                                      title="Zatwierdź uczestnika"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleRejectParticipant(participant.id!, participant.name!)}
                                      disabled={rejectParticipantMutation.isPending}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      title="Odrzuć zgłoszenie"
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
                                    title="Zatwierdź uczestnika"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                )}
                                {participant.userId !== currentUserId && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveParticipant(participant.id!, participant.name!)}
                                    disabled={removeParticipantMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Usuń uczestnika"
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

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edytuj przypisanie</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sector" className="text-right">
                Sektor
              </Label>
              <Input
                id="sector"
                value={editingParticipant?.sector || ''}
                onChange={(e) => setEditingParticipant((prev) => (prev ? { ...prev, sector: e.target.value } : null))}
                placeholder="Nazwa sektora"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stand" className="text-right">
                Stanowisko
              </Label>
              <Input
                id="stand"
                value={editingParticipant?.stand || ''}
                onChange={(e) => setEditingParticipant((prev) => (prev ? { ...prev, stand: e.target.value } : null))}
                placeholder="Nr stanowiska"
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setAssignmentDialogOpen(false);
                setEditingParticipant(null);
              }}
            >
              Anuluj
            </Button>
            <Button
              onClick={async () => {
                await handleSaveAssignment();
                setAssignmentDialogOpen(false);
              }}
              disabled={updateAssignmentMutation.isPending}
            >
              {updateAssignmentMutation.isPending ? 'Zapisywanie...' : 'Zapisz'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
