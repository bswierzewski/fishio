// lib/definitions.ts

// Definicja dostępnej kategorii punktacji/klasyfikacji
export interface ScoringCategoryOption {
  id: string; // Np. 'total_weight', 'total_length', 'points_per_fish'
  name: string; // Np. "Suma Wag", "Suma Długości", "Punkty za Sztukę"
  description?: string;
}

// Definicja dostępnej kategorii specjalnej
export interface SpecialCategoryOption extends ScoringCategoryOption {
  // Może mieć dodatkowe pola specyficzne dla kategorii specjalnych w przyszłości
  // Np. czy wymaga dodatkowych danych przy zgłaszaniu ryby
}

export interface Competition {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  location: string;
  status: 'upcoming' | 'ongoing' | 'finished';
  type: 'open' | 'closed';
  resultsToken: string; // Token do logowania się na zawody
  imageUrl?: string;
  rules_text?: string; // Dodajmy też to, bo używamy w szczegółach zawodów
  main_scoring_category_id?: string | null; // ID głównej kategorii punktacji
  selected_special_category_ids?: string[]; // Tablica ID wybranych kategorii specjalnych
}

export interface LogbookEntry {
  id: string;
  species: string;
  catchTime: Date;
  photoUrl: string;
  lengthCm?: number | null;
  weightKg?: number | null;
  fisheryId?: string | null;
  notes?: string | null; // Dodajmy też to, bo używamy w szczegółach zawodów
}

export interface FishSpecies {
  id: number; // Lub number, jeśli używasz SERIAL
  name: string;
  imageUrl?: string | null;
}

export interface Fishery {
  id: string;
  name: string;
  location: string;
  imageUrl?: string;
  species_ids?: number[]; // Lub number[], jeśli ID gatunków są liczbowe
}

export interface ResultEntry {
  rank: number;
  participantName: string;
  score: string; // Główny wynik, np. "15.25 kg" (suma wag)
  catchesCount?: number; // Łączna liczba złowionych ryb

  // Dane dla potencjalnych kategorii specjalnych
  biggestFishWeightKg?: number;
  biggestFishLengthCm?: number;
  biggestFishSpecies?: string;
  // Można dodać więcej, np.
  // heaviestPredatorWeightKg?: number;
  // heaviestPredatorSpecies?: string;
}

// Nowy interfejs dla definicji kategorii specjalnych
export interface SpecialCategoryResult {
  id: string;
  title: string; // Np. "Największa Ryba (Waga)", "Najdłuższa Ryba", "Najwięcej Sztuk"
  winnerData?: ResultEntry | null; // Zwycięzca tej kategorii
  // Można dodać pole opisujące kryterium, np. 'weight', 'length', 'count'
  criterionDescription: string; // Np. "Największa waga pojedynczej ryby"
  valueDisplay: (winner: ResultEntry) => string; // Funkcja do wyświetlania wartości zwycięzcy
}
