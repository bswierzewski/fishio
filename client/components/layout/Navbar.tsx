'use client';

import { ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { UserButton } from '@clerk/nextjs';
import { InformationCircleIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { pageRoutes } from '@/lib/config';

export default function Navbar() {
  const pathname = usePathname();

  const getCurrentPageTitle = (): string => {
    // Separate static and dynamic routes
    const staticRoutes = pageRoutes.filter((route) => !route.href.includes('['));
    const dynamicRoutes = pageRoutes.filter((route) => route.href.includes('['));

    // Sort both arrays by length (longest first)
    const sortedStaticRoutes = [...staticRoutes].sort((a, b) => b.href.length - a.href.length);
    const sortedDynamicRoutes = [...dynamicRoutes].sort((a, b) => b.href.length - a.href.length);

    // Check static routes first (exact matches and prefix matches)
    for (const route of sortedStaticRoutes) {
      if (pathname === route.href || (route.href !== '/' && pathname.startsWith(route.href))) {
        return route.title;
      }
    }

    // Then check dynamic routes
    for (const route of sortedDynamicRoutes) {
      // Convert dynamic route pattern to regex
      // e.g., "/competitions/[id]/edit" becomes "/competitions/[^/]+/edit"
      const regexPattern = route.href
        .replace(/\[([^\]]+)\]/g, '[^/]+') // Replace [param] with [^/]+
        .replace(/\//g, '\\/'); // Escape forward slashes

      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return route.title;
      }
    }

    return 'Fishio'; // Default title if no match is found
  };

  const pageTitle = getCurrentPageTitle();

  return (
    <nav className="px-5 p-2 z-50 shadow bg-secondary rounded-b-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/about">
          <InformationCircleIcon className="text-background h-8" />
        </Link>

        <span className="font-bold uppercase text-background tracking-widest">{pageTitle}</span>

        <ClerkLoading>
          <div className="h-7 w-7 animate-pulse rounded-full bg-secondary" />
        </ClerkLoading>
        <ClerkLoaded>
          <UserButton />
        </ClerkLoaded>
      </div>
    </nav>
  );
}
