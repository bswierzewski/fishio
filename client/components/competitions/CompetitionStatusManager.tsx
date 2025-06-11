import { Calendar, CheckCircle, ChevronRight, FileText, Play, Settings, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useApiError } from '@/hooks/use-api-error';
import {
  useOrganizerFinishesCompetition,
  useOrganizerOpensRegistrations,
  useOrganizerReopensRegistrations,
  useOrganizerSchedulesCompetition,
  useOrganizerSetsToDraft,
  useOrganizerStartsCompetition
} from '@/lib/api/endpoints/competitions';
import { CompetitionStatus } from '@/lib/api/models';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface CompetitionStatusManagerProps {
  competitionId: number;
  currentStatus: CompetitionStatus;
  isOrganizer: boolean;
  onStatusChange?: () => void;
}

export function CompetitionStatusManager({
  competitionId,
  currentStatus,
  isOrganizer,
  onStatusChange
}: CompetitionStatusManagerProps) {
  // Status management mutations
  const setToDraftMutation = useOrganizerSetsToDraft();
  const openRegistrationsMutation = useOrganizerOpensRegistrations();
  const scheduleCompetitionMutation = useOrganizerSchedulesCompetition();
  const reopenRegistrationsMutation = useOrganizerReopensRegistrations();
  const startCompetitionMutation = useOrganizerStartsCompetition();
  const finishCompetitionMutation = useOrganizerFinishesCompetition();

  // API error handling
  const { handleError } = useApiError();

  // Don't render if user is not organizer
  if (!isOrganizer) {
    return null;
  }

  // Status management handlers
  const handleOpenRegistrations = async () => {
    try {
      await openRegistrationsMutation.mutateAsync({ competitionId });
      toast.success('Rejestracje zostały otwarte!');
      onStatusChange?.();
    } catch (error) {
      handleError(error);
    }
  };

  const handleScheduleCompetition = async () => {
    try {
      await scheduleCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały zaplanowane!');
      onStatusChange?.();
    } catch (error) {
      handleError(error);
    }
  };

  const handleStartCompetition = async () => {
    try {
      await startCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały rozpoczęte!');
      onStatusChange?.();
    } catch (error) {
      handleError(error);
    }
  };

  const handleFinishCompetition = async () => {
    try {
      await finishCompetitionMutation.mutateAsync({ competitionId });
      toast.success('Zawody zostały zakończone!');
      onStatusChange?.();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSetToDraft = async () => {
    try {
      await setToDraftMutation.mutateAsync({
        competitionId,
        data: { competitionId, reason: 'Nie przekazano powodu anulowania' }
      });
      toast.success('Zawody zostały przywrócone do szkicu!');
      onStatusChange?.();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-card shadow">
      <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 p-3">
        <div className="relative z-10 flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span className="text-xs font-medium truncate">Zarządzanie Statusem</span>
        </div>
      </div>
      <div className="p-4">
        {/* Status Flow */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-2">
          {/* Draft */}
          <Button
            variant="outline"
            className="flex flex-col items-center p-2 h-auto text-center min-w-[60px] sm:min-w-[80px] cursor-pointer hover:cursor-pointer relative shadow"
            onClick={handleSetToDraft}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 text-blue-700 ${
                currentStatus === CompetitionStatus.Draft ? 'bg-blue-200' : ''
              }`}
            >
              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            {currentStatus === CompetitionStatus.Draft ? (
              <Badge className="bg-blue-500 text-white text-xs">Szkic</Badge>
            ) : (
              <span className="text-xs font-medium">Szkic</span>
            )}
            {currentStatus === CompetitionStatus.Draft && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
            )}
          </Button>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

          {/* Accepting Registrations */}
          <Button
            variant="outline"
            className="flex flex-col items-center p-2 h-auto text-center min-w-[60px] sm:min-w-[80px] cursor-pointer hover:cursor-pointer relative shadow"
            onClick={handleOpenRegistrations}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 text-green-700 ${
                currentStatus === CompetitionStatus.AcceptingRegistrations ? 'bg-green-200' : ''
              }`}
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            {currentStatus === CompetitionStatus.AcceptingRegistrations ? (
              <Badge className="bg-green-500 text-white text-xs">Rejestracje</Badge>
            ) : (
              <span className="text-xs font-medium text-center leading-tight">Rejestracje</span>
            )}
            {currentStatus === CompetitionStatus.AcceptingRegistrations && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-600 rounded-full border-2 border-white"></div>
            )}
          </Button>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

          {/* Scheduled */}
          <Button
            variant="outline"
            className="flex flex-col items-center p-2 h-auto text-center min-w-[60px] sm:min-w-[80px] cursor-pointer hover:cursor-pointer relative shadow"
            onClick={handleScheduleCompetition}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 text-purple-700 ${
                currentStatus === CompetitionStatus.Scheduled ? 'bg-purple-200' : ''
              }`}
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            {currentStatus === CompetitionStatus.Scheduled ? (
              <Badge className="bg-purple-500 text-white text-xs">Zaplanowane</Badge>
            ) : (
              <span className="text-xs font-medium">Zaplanowane</span>
            )}
            {currentStatus === CompetitionStatus.Scheduled && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-600 rounded-full border-2 border-white"></div>
            )}
          </Button>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

          {/* Ongoing */}
          <Button
            variant="outline"
            className="flex flex-col items-center p-2 h-auto text-center min-w-[60px] sm:min-w-[80px] cursor-pointer hover:cursor-pointer relative shadow"
            onClick={handleStartCompetition}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 text-emerald-700 ${
                currentStatus === CompetitionStatus.Ongoing ? 'bg-emerald-200' : ''
              }`}
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            {currentStatus === CompetitionStatus.Ongoing ? (
              <Badge className="bg-emerald-500 text-white text-xs">W trakcie</Badge>
            ) : (
              <span className="text-xs font-medium">W trakcie</span>
            )}
            {currentStatus === CompetitionStatus.Ongoing && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-600 rounded-full border-2 border-white"></div>
            )}
          </Button>

          {/* Arrow */}
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />

          {/* Finished */}
          <Button
            variant="outline"
            className="flex flex-col items-center p-2 h-auto text-center min-w-[60px] sm:min-w-[80px] cursor-pointer hover:cursor-pointer relative shadow"
            onClick={handleFinishCompetition}
          >
            <div
              className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 text-slate-700 ${
                currentStatus === CompetitionStatus.Finished ? 'bg-slate-200' : ''
              }`}
            >
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            </div>
            {currentStatus === CompetitionStatus.Finished ? (
              <Badge className="bg-slate-500 text-white text-xs">Zakończone</Badge>
            ) : (
              <span className="text-xs font-medium">Zakończone</span>
            )}
            {currentStatus === CompetitionStatus.Finished && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-700 rounded-full border-2 border-white"></div>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
