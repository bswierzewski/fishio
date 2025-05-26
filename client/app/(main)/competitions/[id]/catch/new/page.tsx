'use client';

import { ArrowLeft, Camera, Fish, Save } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { useGetCompetitionDetailsById, useJudgeRecordsFishCatch } from '@/lib/api/endpoints/competitions';
import { useGetAllFishSpecies } from '@/lib/api/endpoints/lookup-data';
import { CompetitionStatus, ParticipantRole } from '@/lib/api/models';

import { useCurrentUser } from '@/hooks/use-current-user';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

export default function NewCatchPage({ params }: { params: Promise<{ id: string }> }) {
  const [competitionId, setCompetitionId] = useState<number | null>(null);
  const [paramsResolved, setParamsResolved] = useState(false);

  // Get current user information (must be called before any early returns)
  const { id: currentUserId, name: currentUserName } = useCurrentUser();

  const [formData, setFormData] = useState({
    participantEntryId: '',
    fishSpeciesId: '',
    lengthInCm: '',
    weightInKg: '',
    image: null as File | null,
    catchTime: new Date().toISOString().slice(0, 16) // Current time in YYYY-MM-DDTHH:mm format
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
    isLoading: competitionLoading,
    error: competitionError
  } = useGetCompetitionDetailsById(competitionId || 0, {
    query: {
      enabled: !!competitionId && paramsResolved
    }
  });

  // Fetch fish species
  const { data: fishSpecies, isLoading: fishSpeciesLoading } = useGetAllFishSpecies();

  // Record catch mutation
  const recordCatchMutation = useJudgeRecordsFishCatch();

  // Don't render anything until params are resolved
  if (!paramsResolved) {
    return <NewCatchSkeleton />;
  }

  // Check for invalid ID after params are resolved
  if (!competitionId) {
    notFound();
  }

  if (competitionLoading || fishSpeciesLoading) {
    return <NewCatchSkeleton />;
  }

  if (competitionError || !competition) {
    notFound();
  }

  // Check if user is judge and competition is ongoing
  // Now we can use the proper domain user ID for accurate authorization
  const userParticipants = currentUserId
    ? competition.participantsList?.filter((p) => p.userId === currentUserId) || []
    : [];
  const isJudge = userParticipants.some((p) => p.role === ParticipantRole.Judge);
  const isOngoing = competition.status === CompetitionStatus.Ongoing;

  if (!isJudge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h1 className="text-2xl font-bold text-muted-foreground">Brak uprawnień</h1>
        <p className="text-muted-foreground">Tylko sędziowie mogą rejestrować połowy.</p>
        <Link href={`/competitions/${competitionId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do zawodów
          </Button>
        </Link>
      </div>
    );
  }

  if (!isOngoing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h1 className="text-2xl font-bold text-muted-foreground">Zawody nieaktywne</h1>
        <p className="text-muted-foreground">Można rejestrować połowy tylko podczas trwania zawodów.</p>
        <Link href={`/competitions/${competitionId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do zawodów
          </Button>
        </Link>
      </div>
    );
  }

  // Get competitors for selection
  const competitors = competition.participantsList?.filter((p) => p.role === ParticipantRole.Competitor) || [];

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleInputChange('image', file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!competitionId || !formData.participantEntryId || !formData.fishSpeciesId) {
      toast.error('Wypełnij wszystkie wymagane pola');
      return;
    }

    try {
      await recordCatchMutation.mutateAsync({
        competitionId,
        data: {
          competitionId,
          participantEntryId: parseInt(formData.participantEntryId),
          fishSpeciesId: parseInt(formData.fishSpeciesId),
          lengthInCm: formData.lengthInCm ? parseFloat(formData.lengthInCm) : null,
          weightInKg: formData.weightInKg ? parseFloat(formData.weightInKg) : null,
          image: formData.image,
          catchTime: formData.catchTime
        }
      });

      toast.success('Połów został zarejestrowany!');

      // Reset form
      setFormData({
        participantEntryId: '',
        fishSpeciesId: '',
        lengthInCm: '',
        weightInKg: '',
        image: null,
        catchTime: new Date().toISOString().slice(0, 16)
      });

      // Reset file input
      const fileInput = document.getElementById('image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      toast.error('Nie udało się zarejestrować połowu');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Rejestracja Połowu</h1>
          <p className="text-muted-foreground">{competition.name}</p>
        </div>
        <Link href={`/competitions/${competitionId}`}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót do zawodów
          </Button>
        </Link>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Fish className="h-5 w-5" />
            <span>Szczegóły Połowu</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Participant Selection */}
            <div className="space-y-2">
              <Label htmlFor="participant">Zawodnik *</Label>
              <Select
                value={formData.participantEntryId}
                onValueChange={(value) => handleInputChange('participantEntryId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz zawodnika" />
                </SelectTrigger>
                <SelectContent>
                  {competitors.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id!.toString()}>
                      {participant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fish Species Selection */}
            <div className="space-y-2">
              <Label htmlFor="fishSpecies">Gatunek Ryby *</Label>
              <Select
                value={formData.fishSpeciesId}
                onValueChange={(value) => handleInputChange('fishSpeciesId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz gatunek ryby" />
                </SelectTrigger>
                <SelectContent>
                  {fishSpecies?.map((species) => (
                    <SelectItem key={species.id} value={species.id!.toString()}>
                      {species.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Measurements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="length">Długość (cm)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  placeholder="np. 25.5"
                  value={formData.lengthInCm}
                  onChange={(e) => handleInputChange('lengthInCm', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Waga (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="np. 1.25"
                  value={formData.weightInKg}
                  onChange={(e) => handleInputChange('weightInKg', e.target.value)}
                />
              </div>
            </div>

            {/* Catch Time */}
            <div className="space-y-2">
              <Label htmlFor="catchTime">Czas Połowu *</Label>
              <Input
                id="catchTime"
                type="datetime-local"
                value={formData.catchTime}
                onChange={(e) => handleInputChange('catchTime', e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Zdjęcie Połowu</Label>
              <div className="flex items-center space-x-2">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                <Camera className="h-5 w-5 text-muted-foreground" />
              </div>
              {formData.image && <p className="text-sm text-muted-foreground">Wybrano: {formData.image.name}</p>}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              <Link href={`/competitions/${competitionId}`}>
                <Button type="button" variant="outline">
                  Anuluj
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={recordCatchMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {recordCatchMutation.isPending ? 'Zapisywanie...' : 'Zarejestruj Połów'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function NewCatchSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
