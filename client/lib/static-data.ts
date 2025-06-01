// lib/static-data.ts
import {
  Competition,
  Fishery,
  LogbookEntry,
  ResultEntry,
  ScoringCategoryOption,
  SpecialCategoryOption,
  SpecialCategoryResult
} from './definitions';

// Note: Fish species data is now fetched from the API via GetFishSpeciesQuery
// No longer using static data for fish species

// --- Dostępne Kategorie Punktacji ---
export const availableMainScoringCategories: ScoringCategoryOption[] = [
  {
    id: 'total_weight',
    name: 'Suma Wag Złowionych Ryb',
    description: 'Klasyfikacja na podstawie łącznej wagi wszystkich zgłoszonych ryb.'
  },
  {
    id: 'total_length',
    name: 'Suma Długości Złowionych Ryb',
    description: 'Klasyfikacja na podstawie łącznej długości wszystkich zgłoszonych ryb.'
  },
  {
    id: 'points_per_species',
    name: 'Punkty za Gatunki (Uproszczone)',
    description: 'Każdy gatunek daje określoną liczbę punktów.'
  }
];

// --- Dostępne Kategorie Specjalne ---
export const availableSpecialCategories: SpecialCategoryOption[] = [
  {
    id: 'biggest_weight',
    name: 'Najcięższa Ryba (Waga)',
    description: 'Nagroda za pojedynczą rybę o największej wadze.'
  },
  {
    id: 'longest_fish',
    name: 'Najdłuższa Ryba (Długość)',
    description: 'Nagroda za pojedynczą rybę o największej długości.'
  },
  {
    id: 'most_catches_count',
    name: 'Najwięcej Złowionych Ryb (Sztuk)',
    description: 'Nagroda za największą liczbę złowionych ryb.'
  }
  // Można dodać więcej, np. "Największy Drapieżnik", "Pierwsza Złowiona Ryba"
];

// --- Dane Zawodów ---
export const staticCompetitions: Competition[] = [
  {
    id: '1',
    name: 'Puchar Wiosny 2025',
    startTime: new Date('2025-05-25T07:00:00'),
    endTime: new Date('2025-05-25T15:00:00'),
    location: 'Jezioro Duże, Wędkowo',
    status: 'upcoming',
    type: 'open',
    imageUrl: 'https://cdn.pixabay.com/photo/2020/11/12/21/26/fishing-boat-5736839_1280.jpg',
    rules_text:
      'Łowimy na dwie wędki. Metody dowolne. Liczy się łączna waga złowionych ryb drapieżnych (szczupak, okoń, sandacz).',
    resultsToken: '1a',
    main_scoring_category_id: 'total_weight', // Główna kategoria
    selected_special_category_ids: ['biggest_weight', 'longest_fish'] // Wybrane kategorie specjalne
  },
  {
    id: '2',
    name: 'Nocny Maraton Karpiowy',
    startTime: new Date('2025-06-14T20:00:00'),
    endTime: new Date('2025-06-15T08:00:00'),
    location: 'Rzeka Tajemnicza, Odc. 3',
    status: 'ongoing',
    type: 'closed',
    imageUrl: 'https://cdn.pixabay.com/photo/2018/01/05/02/47/fishing-3062034_1280.jpg',
    resultsToken: '2b',
    main_scoring_category_id: 'total_weight',
    selected_special_category_ids: ['biggest_weight']
  },
  {
    id: '3',
    name: 'Zawody Spławikowe Juniorów',
    startTime: new Date('2025-07-12T09:00:00'),
    endTime: new Date('2025-07-12T14:00:00'),
    location: 'Staw Parkowy',
    status: 'upcoming',
    type: 'open',
    // Zdjęcie dzieci/młodzieży wędkującej
    imageUrl: 'https://cdn.pixabay.com/photo/2018/12/10/22/57/child-fishing-3867994_1280.jpg',
    resultsToken: '3c', // Przykładowy token
    rules_text:
      'Zawody dla dzieci i młodzieży do 16 roku życia. Każdy uczestnik może złowić maksymalnie 5 ryb. Waga ryb będzie mierzona przez sędziów na miejscu.'
  },
  {
    id: '4',
    name: 'Puchar Lata (Zakończone)',
    startTime: new Date('2024-08-15T06:00:00'),
    endTime: new Date('2024-08-15T18:00:00'),
    location: 'Jezioro Glinianki',
    status: 'finished',
    type: 'open',
    // Zdjęcie ogólne wędkarskie
    imageUrl: 'https://cdn.pixabay.com/photo/2019/03/13/00/09/carp-4052148_1280.jpg',
    resultsToken: '4d', // Przykładowy token
    rules_text:
      'Zawody odbywają się w formule "złów i wypuść". Każdy uczestnik może złowić maksymalnie 5 ryb. Waga ryb będzie mierzona przez sędziów na miejscu.'
  }
];

// --- Dane Dziennika Połowów ---
export const staticLogbookEntries: LogbookEntry[] = [
  {
    id: '1',
    species: 'Szczupak',
    catchTime: new Date('2025-05-01T16:45:00'),
    // Zdjęcie szczupaka
    photoUrl: 'https://cdn.pixabay.com/photo/2014/10/05/18/56/wels-475656_1280.jpg',
    lengthCm: 72.5,
    weightKg: 3.1,
    fisheryId: '2' // Powiązane z Rzeką Szybką
  },
  {
    id: '2',
    species: 'Okoń',
    catchTime: new Date('2025-04-28T09:10:00'),
    // Zdjęcie okonia
    photoUrl: 'https://cdn.pixabay.com/photo/2017/10/05/18/01/pike-2820330_1280.jpg',
    lengthCm: 31,
    weightKg: null,
    fisheryId: '1' // Powiązane z Jeziorem Miejskim
  },
  {
    id: '3',
    species: 'Leszcz',
    catchTime: new Date('2025-05-05T07:20:00'),
    // Zdjęcie leszcza (lub podobnej ryby)
    photoUrl: 'https://cdn.pixabay.com/photo/2016/01/01/13/37/nature-1116553_1280.jpg',
    lengthCm: null,
    weightKg: 1.8,
    fisheryId: '3' // Powiązane ze Stawem Rekord
  }
];

// --- Dane Łowisk ---
export const staticFisheries: Fishery[] = [
  {
    id: '1',
    name: 'Jezioro Miejskie',
    location: 'Miastowo, ul. Parkowa',
    // Zdjęcie jeziora
    imageUrl: 'https://cdn.pixabay.com/photo/2020/06/24/20/41/truebsee-5337646_1280.jpg',
    species_ids: [1, 2, 3]
  },
  {
    id: '2',
    name: 'Rzeka Szybka - Odcinek PZW',
    location: 'Wioskowo, Most Północny',
    // Zdjęcie rzeki
    imageUrl: 'https://cdn.pixabay.com/photo/2023/09/27/12/15/river-8279466_1280.jpg',
    species_ids: [4, 5, 6]
  },
  {
    id: '3',
    name: 'Staw Komercyjny "Rekord"',
    location: 'Rekordowo 15',
    // Zdjęcie stawu/łowiska komercyjnego
    imageUrl: 'https://cdn.pixabay.com/photo/2022/01/16/22/10/pond-6943316_1280.jpg'
  },
  {
    id: '4',
    name: 'Kanał Żeglugowy',
    location: 'Portowo',
    // Zdjęcie kanału
    imageUrl: 'https://cdn.pixabay.com/photo/2018/10/06/06/56/river-3727391_1280.jpg',
    species_ids: [1, 5, 10]
  }
];

export const staticResults: ResultEntry[] = [
  {
    rank: 1,
    participantName: 'Anna Nowak',
    score: '15.25 kg',
    catchesCount: 5,
    biggestFishWeightKg: 7.8,
    biggestFishLengthCm: 95,
    biggestFishSpecies: 'Szczupak'
  },
  {
    rank: 2,
    participantName: 'Piotr Wiśniewski',
    score: '12.80 kg',
    catchesCount: 4,
    biggestFishWeightKg: 5.2,
    biggestFishLengthCm: 80,
    biggestFishSpecies: 'Sandacz'
  },
  {
    rank: 3,
    participantName: 'Gość: Adam Mały',
    score: '10.50 kg',
    catchesCount: 6,
    biggestFishWeightKg: 6.1,
    biggestFishLengthCm: 88,
    biggestFishSpecies: 'Szczupak'
  }, // Adam ma więcej sztuk
  {
    rank: 4,
    participantName: 'Krzysztof Wójcik',
    score: '9.75 kg',
    catchesCount: 3,
    biggestFishWeightKg: 4.0,
    biggestFishLengthCm: 98,
    biggestFishSpecies: 'Boleń'
  }, // Krzysztof ma dłuższą rybę niż Adam
  {
    rank: 5,
    participantName: 'Gość: Ewa Zielona',
    score: '7.10 kg',
    catchesCount: 2,
    biggestFishWeightKg: 3.5,
    biggestFishLengthCm: 65,
    biggestFishSpecies: 'Okoń'
  }
];

// Funkcje pomocnicze do znajdowania zwycięzców kategorii (uproszczone)
const findWinnerByMaxField = (
  results: ResultEntry[],
  field: keyof ResultEntry,
  secondaryField?: keyof ResultEntry
): ResultEntry | null => {
  if (!results || results.length === 0) return null;
  return results
    .filter((r) => r[field] != null)
    .reduce(
      (winner, current) => {
        if (!winner || (current[field] as number) > (winner[field] as number)) {
          return current;
        }
        if (secondaryField && (current[field] as number) === (winner[field] as number)) {
          if (!winner[secondaryField] || (current[secondaryField] as number) > (winner[secondaryField] as number)) {
            return current;
          }
        }
        return winner;
      },
      null as ResultEntry | null
    );
};

// Definicja i wyłonienie zwycięzców dla kategorii specjalnych
export const staticSpecialCategories: SpecialCategoryResult[] = [
  {
    id: 'biggest-weight',
    title: 'Najcięższa Ryba',
    winnerData: findWinnerByMaxField(staticResults, 'biggestFishWeightKg', 'biggestFishLengthCm'),
    criterionDescription: 'Największa waga pojedynczej ryby.',
    valueDisplay: (winner) => `${winner.biggestFishWeightKg} kg (${winner.biggestFishSpecies})`
  },
  {
    id: 'longest-fish',
    title: 'Najdłuższa Ryba',
    winnerData: findWinnerByMaxField(staticResults, 'biggestFishLengthCm', 'biggestFishWeightKg'),
    criterionDescription: 'Największa długość pojedynczej ryby.',
    valueDisplay: (winner) => `${winner.biggestFishLengthCm} cm (${winner.biggestFishSpecies})`
  },
  {
    id: 'most-catches',
    title: 'Najwięcej Złowionych Ryb',
    winnerData: findWinnerByMaxField(staticResults, 'catchesCount'),
    criterionDescription: 'Łączna liczba złowionych ryb.',
    valueDisplay: (winner) => `${winner.catchesCount} szt.`
  }
];
