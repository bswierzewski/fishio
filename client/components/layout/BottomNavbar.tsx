'use client';

import { CameraIcon, PlusIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navLinks } from '@/lib/config';

import { Button } from '@/components/ui/button';

interface FABAction {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function BottomNavbar() {
  const pathname = usePathname();

  const getFABAction = (): FABAction | null => {
    // Dashboard - Add new catch
    if (pathname === '/dashboard') {
      return {
        href: '/logbook/add',
        label: 'Dodaj połów',
        icon: CameraIcon
      };
    }

    // My competitions - Add new competition
    if (pathname.startsWith('/my-competitions')) {
      return {
        href: '/competitions/add',
        label: 'Nowe zawody',
        icon: PlusIcon
      };
    }

    // Competitions pages - Add new competition
    if (pathname.startsWith('/competitions') && !pathname.includes('/add')) {
      return {
        href: '/competitions/add',
        label: 'Nowe zawody',
        icon: PlusIcon
      };
    }

    // Logbook pages - Add new catch
    if (pathname.startsWith('/logbook') && !pathname.includes('/add')) {
      return {
        href: '/logbook/add',
        label: 'Nowy połów',
        icon: CameraIcon
      };
    }

    // Fisheries pages - Add new fishery
    if (pathname.startsWith('/fisheries') && !pathname.includes('/add')) {
      return {
        href: '/fisheries/add',
        label: 'Nowe łowisko',
        icon: PlusIcon
      };
    }

    // Competition detail pages - Add catch for competition
    const competitionCatchMatch = pathname.match(/^\/competitions\/(\d+)$/);
    if (competitionCatchMatch) {
      const competitionId = competitionCatchMatch[1];
      return {
        href: `/competitions/${competitionId}/catch/new`,
        label: 'Dodaj połów',
        icon: PlusIcon
      };
    }

    // Fishery detail pages - Add catch for this fishery
    const fisheryMatch = pathname.match(/^\/fisheries\/(\d+)$/);
    if (fisheryMatch) {
      const fisheryId = fisheryMatch[1];
      return {
        href: `/logbook/add?fisheryId=${fisheryId}`,
        label: 'Dodaj połów',
        icon: PlusIcon
      };
    }

    // Default: Add new catch
    return {
      href: '/logbook/add',
      label: 'Dodaj połów',
      icon: PlusIcon
    };
  };

  const fabAction = getFABAction();
  const FabIconComponent = fabAction?.icon || PlusIcon;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-2 max-w-md px-2">
      {/* FAB Button - Positioned above the navbar */}
      {fabAction && (
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-10">
          <Link href={fabAction.href}>
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-background shadow-lg hover:bg-primary/90"
              title={fabAction.label}
            >
              <FabIconComponent className="h-6 w-6" />
              <span className="sr-only">{fabAction.label}</span>
            </div>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-around rounded-full bg-secondary p-2 shadow-lg">
        {/* First Navigation Link */}
        {navLinks[0] &&
          (() => {
            const link = navLinks[0];
            const IconComponent = link.icon;
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.title}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-background
                ${isActive ? 'bg-primary' : 'opacity-80 hover:bg-background hover:opacity-100 hover:text-secondary'}
              `}
              >
                <IconComponent className={`h-6 w-6`} />
              </Link>
            );
          })()}

        {/* Second Navigation Link */}
        {navLinks[1] &&
          (() => {
            const link = navLinks[1];
            const IconComponent = link.icon;
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.title}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-background
                ${isActive ? 'bg-primary' : 'opacity-80 hover:bg-background hover:opacity-100 hover:text-secondary'}
              `}
              >
                <IconComponent className={`h-6 w-6`} />
              </Link>
            );
          })()}

        {/* Empty space for FAB button positioning */}
        {fabAction && <div className="h-10 w-10 flex-shrink-0"></div>}

        {/* Third Navigation Link */}
        {navLinks[2] &&
          (() => {
            const link = navLinks[2];
            const IconComponent = link.icon;
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.title}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-background
                ${isActive ? 'bg-primary' : 'opacity-80 hover:bg-background hover:opacity-100 hover:text-secondary'}
              `}
              >
                <IconComponent className={`h-6 w-6`} />
              </Link>
            );
          })()}

        {/* Fourth Navigation Link */}
        {navLinks[3] &&
          (() => {
            const link = navLinks[3];
            const IconComponent = link.icon;
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.title}
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-background
                ${isActive ? 'bg-primary' : 'opacity-80 hover:bg-background hover:opacity-100 hover:text-secondary'}
              `}
              >
                <IconComponent className={`h-6 w-6`} />
              </Link>
            );
          })()}
      </div>
    </nav>
  );
}
