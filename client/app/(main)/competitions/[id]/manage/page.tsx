'use client';

import { ArrowLeft, BarChart3, Settings, ShieldCheck, Trash2, User, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import {
  useGetCompetitionDetailsById,
  useOrganizerAddsParticipant,
  useOrganizerAssignsJudge,
  useOrganizerRemovesJudge,
  useOrganizerRemovesParticipant
} from '@/lib/api/endpoints/competitions';
import { type AddParticipantCommand, type AssignJudgeCommand, ParticipantRole } from '@/lib/api/models';

import { useCurrentUser } from '@/hooks/use-current-user';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompetitionManagePage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);

  // Get current user information (must be called before any early returns)
  const { id: currentUserId, name: currentUserName } = useCurrentUser();

  // Dialog states
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [addJudgeOpen, setAddJudgeOpen] = useState(false);
  const [participantsListOpen, setParticipantsListOpen] = useState(false);
  const [judgesListOpen, setJudgesListOpen] = useState(false);

  // Form states
  const [participantForm, setParticipantForm] = useState({
    guestName: '',
    role: ParticipantRole.Competitor as ParticipantRole
  });
  const [judgeForm, setJudgeForm] = useState({
    userIdToAssignAsJudge: ''
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

  // Mutations
  const addParticipantMutation = useOrganizerAddsParticipant();
  const removeParticipantMutation = useOrganizerRemovesParticipant();
  const assignJudgeMutation = useOrganizerAssignsJudge();
  const removeJudgeMutation = useOrganizerRemovesJudge();

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
  // Now we can use the proper domain user ID for accurate authorization
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
  const participants =
    competition.participantsList?.filter(
      (p) => p.role === ParticipantRole.Competitor || p.role === ParticipantRole.Guest
    ) || [];
  const judges = competition.participantsList?.filter((p) => p.role === ParticipantRole.Judge) || [];

  // Handler functions
  const handleAddParticipant = async () => {
    if (!participantForm.guestName.trim()) {
      toast.error('Nazwa uczestnika jest wymagana');
      return;
    }

    try {
      const command: AddParticipantCommand = {
        competitionId: competitionId,
        guestName: participantForm.guestName.trim(),
        role: participantForm.role
      };

      await addParticipantMutation.mutateAsync({
        competitionId: competitionId,
        data: command
      });

      toast.success('Uczestnik został dodany pomyślnie!');
      setParticipantForm({ guestName: '', role: ParticipantRole.Competitor });
      setAddParticipantOpen(false);
      refetch();
    } catch (error) {
      toast.error('Nie udało się dodać uczestnika');
    }
  };

  const handleAddJudge = async () => {
    if (!judgeForm.userIdToAssignAsJudge.trim()) {
      toast.error('Wybór użytkownika jest wymagany');
      return;
    }

    try {
      const command: AssignJudgeCommand = {
        competitionId: competitionId,
        userIdToAssignAsJudge: parseInt(judgeForm.userIdToAssignAsJudge)
      };

      await assignJudgeMutation.mutateAsync({
        competitionId: competitionId,
        data: command
      });

      toast.success('Sędzia został dodany pomyślnie!');
      setJudgeForm({ userIdToAssignAsJudge: '' });
      setAddJudgeOpen(false);
      refetch();
    } catch (error) {
      toast.error('Nie udało się dodać sędziego');
    }
  };

  const handleRemoveParticipant = async (participantId: number) => {
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

  const handleRemoveJudge = async (judgeId: number) => {
    try {
      await removeJudgeMutation.mutateAsync({
        competitionId: competitionId,
        judgeParticipantEntryId: judgeId
      });

      toast.success('Sędzia został usunięty');
      refetch();
    } catch (error) {
      toast.error('Nie udało się usunąć sędziego');
    }
  };

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
              <Dialog open={addParticipantOpen} onOpenChange={setAddParticipantOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Dodaj Uczestnika
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj Uczestnika</DialogTitle>
                    <DialogDescription>Dodaj nowego uczestnika do zawodów jako gościa.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="guestName">Nazwa uczestnika</Label>
                      <Input
                        id="guestName"
                        value={participantForm.guestName}
                        onChange={(e) => setParticipantForm((prev) => ({ ...prev, guestName: e.target.value }))}
                        placeholder="Wprowadź nazwę uczestnika"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Rola</Label>
                      <Select
                        value={participantForm.role}
                        onValueChange={(value) =>
                          setParticipantForm((prev) => ({ ...prev, role: value as ParticipantRole }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ParticipantRole.Competitor}>Zawodnik</SelectItem>
                          <SelectItem value={ParticipantRole.Guest}>Gość</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddParticipantOpen(false)}>
                      Anuluj
                    </Button>
                    <Button onClick={handleAddParticipant} disabled={addParticipantMutation.isPending}>
                      {addParticipantMutation.isPending ? 'Dodawanie...' : 'Dodaj'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={participantsListOpen} onOpenChange={setParticipantsListOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Lista Uczestników ({participants.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Lista Uczestników</DialogTitle>
                    <DialogDescription>Zarządzaj uczestnikami zawodów.</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {participants.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Brak uczestników</p>
                    ) : (
                      <div className="space-y-2">
                        {participants.map((participant) => (
                          <div key={participant.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{participant.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {participant.role === ParticipantRole.Competitor ? 'Zawodnik' : 'Gość'}
                                  {participant.addedByOrganizer && ' • Dodany przez organizatora'}
                                </p>
                              </div>
                            </div>
                            {participant.addedByOrganizer && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveParticipant(participant.id!)}
                                disabled={removeParticipantMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
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
              <Dialog open={addJudgeOpen} onOpenChange={setAddJudgeOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="sm">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Dodaj Sędziego
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Dodaj Sędziego</DialogTitle>
                    <DialogDescription>Dodaj nowego sędziego do zawodów.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="judgeUser">Użytkownik do mianowania sędzią</Label>
                      <Input
                        id="judgeUser"
                        value={judgeForm.userIdToAssignAsJudge}
                        onChange={(e) => setJudgeForm((prev) => ({ ...prev, userIdToAssignAsJudge: e.target.value }))}
                        placeholder="Wprowadź ID użytkownika"
                        type="number"
                      />
                      <p className="text-xs text-muted-foreground">
                        Uwaga: Tylko zarejestrowani użytkownicy mogą być sędziami. Wprowadź ID użytkownika.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddJudgeOpen(false)}>
                      Anuluj
                    </Button>
                    <Button onClick={handleAddJudge} disabled={assignJudgeMutation.isPending}>
                      {assignJudgeMutation.isPending ? 'Dodawanie...' : 'Dodaj'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={judgesListOpen} onOpenChange={setJudgesListOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" size="sm">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Lista Sędziów ({judges.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Lista Sędziów</DialogTitle>
                    <DialogDescription>Zarządzaj sędziami zawodów.</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    {judges.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Brak sędziów</p>
                    ) : (
                      <div className="space-y-2">
                        {judges.map((judge) => (
                          <div key={judge.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <ShieldCheck className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="font-medium">{judge.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  Sędzia
                                  {judge.addedByOrganizer && ' • Dodany przez organizatora'}
                                </p>
                              </div>
                            </div>
                            {judge.addedByOrganizer && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveJudge(judge.id!)}
                                disabled={removeJudgeMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
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
              <div className="text-2xl font-bold">{judges.length}</div>
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
