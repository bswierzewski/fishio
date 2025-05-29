import { BookOpenIcon, CalendarIcon, HomeIcon, MapPinIcon, TrophyIcon } from '@heroicons/react/24/solid';

// Main navigation links for bottom navbar - keep these minimal
export const navLinks = [
  { href: '/dashboard', label: 'Start', icon: HomeIcon, title: 'Start' },
  { href: '/my-competitions', label: 'Moje zawody', icon: CalendarIcon, title: 'Moje zawody' },
  { href: '/competitions', label: 'Zawody', icon: TrophyIcon, title: 'Zawody' },
  { href: '/logbook', label: 'Dziennik', icon: BookOpenIcon, title: 'Dziennik' },
  { href: '/fisheries', label: 'Łowiska', icon: MapPinIcon, title: 'Łowiska' }
];

// Extended page titles for all routes in the application - used only for navbar titles
export const pageRoutes = [
  // Main navigation pages
  { href: '/dashboard', title: 'Start' },
  { href: '/my-competitions', title: 'Moje zawody' },
  { href: '/competitions/add', title: 'Dodaj zawody' },
  { href: '/competitions', title: 'Zawody' },
  { href: '/logbook', title: 'Dziennik' },
  { href: '/fisheries', title: 'Łowiska' },
  { href: '/about', title: 'O aplikacji' },

  // Competition-related pages
  { href: '/competitions/[id]/edit', title: 'Edytuj zawody' },
  { href: '/competitions/[id]/manage', title: 'Zarządzaj zawodami' },
  { href: '/competitions/[id]/catch/new', title: 'Dodaj połów' },
  { href: '/competitions/[id]/catch', title: 'Połowy' },
  { href: '/competitions/[id]', title: 'Szczegóły zawodów' },

  // Fisheries-related pages
  { href: '/fisheries/add', title: 'Dodaj łowisko' },
  { href: '/fisheries/[id]', title: 'Szczegóły łowiska' },
  { href: '/fisheries/[id]/edit', title: 'Edytuj łowisko' },

  // Logbook-related pages
  { href: '/logbook/add', title: 'Dodaj wpis do dziennika' },
  { href: '/logbook/[id]', title: 'Szczegóły wpisu' },
  { href: '/logbook/[id]/edit', title: 'Edytuj wpis' },

  // Public pages
  { href: '/results/[token]', title: 'Wyniki zawodów' },
  { href: '/results', title: 'Wyniki' },
  { href: '/sign-in', title: 'Logowanie' },
  { href: '/sign-up', title: 'Rejestracja' },

  // Root page
  { href: '/', title: 'Fishio' }
];
