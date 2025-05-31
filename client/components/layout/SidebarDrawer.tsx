'use client';

import { ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { UserButton } from '@clerk/nextjs';
import {
  BookOpenIcon,
  CalendarIcon,
  HomeIcon,
  InformationCircleIcon,
  MapPinIcon,
  PlusIcon,
  TrophyIcon
} from '@heroicons/react/24/solid';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { useCurrentUser } from '@/hooks/use-current-user';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface SidebarDrawerProps {
  children: React.ReactNode;
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface NavigationSection {
  title: string;
  items: NavigationItem[];
}

export default function SidebarDrawer({ children }: SidebarDrawerProps) {
  const pathname = usePathname();
  const { name, email } = useCurrentUser();
  const [open, setOpen] = useState(false);

  const navigationSections: NavigationSection[] = [
    {
      title: 'Główne',
      items: [
        {
          href: '/dashboard',
          label: 'Start',
          icon: HomeIcon,
          description: 'Strona główna aplikacji'
        },
        {
          href: '/my-competitions',
          label: 'Moje zawody',
          icon: CalendarIcon,
          description: 'Zawody w których uczestniczę'
        }
      ]
    },
    {
      title: 'Przeglądaj',
      items: [
        {
          href: '/competitions',
          label: 'Wszystkie zawody',
          icon: TrophyIcon,
          description: 'Przeglądaj dostępne zawody'
        },
        {
          href: '/fisheries',
          label: 'Łowiska',
          icon: MapPinIcon,
          description: 'Baza łowisk'
        }
      ]
    },
    {
      title: 'Moje dane',
      items: [
        {
          href: '/logbook',
          label: 'Dziennik połowów',
          icon: BookOpenIcon,
          description: 'Mój prywatny dziennik'
        }
      ]
    },
    {
      title: 'Dodaj nowe',
      items: [
        {
          href: '/competitions/add',
          label: 'Nowe zawody',
          icon: PlusIcon,
          description: 'Stwórz nowe zawody'
        },
        {
          href: '/fisheries/add',
          label: 'Nowe łowisko',
          icon: PlusIcon,
          description: 'Dodaj łowisko do bazy'
        },
        {
          href: '/logbook/add',
          label: 'Nowy połów',
          icon: PlusIcon,
          description: 'Zapisz nowy połów'
        }
      ]
    },
    {
      title: 'Informacje',
      items: [
        {
          href: '/about',
          label: 'O aplikacji',
          icon: InformationCircleIcon,
          description: 'Informacje o aplikacji'
        }
      ]
    }
  ];

  const isActive = (href: string) => {
    // Always check for exact match first
    if (pathname === href) {
      return true;
    }

    // Special case for dashboard - only exact match
    if (href === '/dashboard') {
      return false;
    }

    // For other routes, only show as active if we're on a direct child route
    // but not if there's a more specific route that should be active instead
    const allRoutes = navigationSections.flatMap((section) => section.items.map((item) => item.href));
    const moreSpecificRoute = allRoutes.find(
      (route) => route !== href && route.startsWith(href + '/') && pathname.startsWith(route)
    );

    // If there's a more specific route that matches, don't show this as active
    if (moreSpecificRoute) {
      return false;
    }

    // Otherwise, check if current path starts with this href
    return pathname.startsWith(href + '/');
  };

  const handleLinkClick = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="left" className="w-80 p-0">
        <VisuallyHidden>
          <SheetTitle>Menu nawigacyjne</SheetTitle>
        </VisuallyHidden>
        <div className="flex h-full flex-col bg-background">
          {/* Header with user info */}
          <div className="bg-slate-800 text-slate-100 p-6">
            <div className="flex items-center space-x-4">
              <ClerkLoading>
                <div className="h-10 w-10 animate-pulse rounded-full bg-slate-600" />
              </ClerkLoading>
              <ClerkLoaded>
                <UserButton />
              </ClerkLoaded>
              <div className="flex-1 min-w-0">
                <h2 className="text-left text-lg font-semibold truncate text-slate-100">{name || 'Użytkownik'}</h2>
                {email && <p className="text-sm text-slate-300 truncate">{email}</p>}
              </div>
            </div>
          </div>

          {/* Navigation content */}
          <div className="flex-1 overflow-y-auto pt-1">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.title}>
                {/* Section header with black background spanning full width */}
                <div className="bg-slate-800 text-slate-100 relative flex h-10 flex-shrink-0 items-center space-x-2 px-6">
                  <div className="relative z-10 flex items-center space-x-2">
                    <span className="text-xs font-medium truncate uppercase tracking-wider">{section.title}</span>
                  </div>
                </div>

                {/* Section items */}
                <div className="px-4 py-3 space-y-1">
                  {section.items.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link key={item.href} href={item.href} onClick={handleLinkClick}>
                        <div
                          className={`flex items-center space-x-3 rounded-lg px-3 py-3 text-sm transition-all duration-200 hover:bg-muted ${
                            active ? 'bg-primary text-primary-foreground' : 'text-foreground hover:text-foreground'
                          }`}
                        >
                          <IconComponent className="h-5 w-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{item.label}</div>
                            {item.description && (
                              <div
                                className={`text-xs truncate ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                              >
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
