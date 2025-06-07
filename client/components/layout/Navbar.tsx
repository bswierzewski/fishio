'use client';

import SidebarDrawer from './SidebarDrawer';
import { ClerkLoaded, ClerkLoading } from '@clerk/clerk-react';
import { UserButton } from '@clerk/nextjs';
import { Bars3Icon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="px-5 p-2 z-50 shadow bg-secondary rounded-b-md">
      <div className="container mx-auto flex justify-between items-center">
        <SidebarDrawer>
          <div className="flex h-8 w-8 items-center justify-center text-background hover:cursor-pointer">
            <Bars3Icon className="h-8 w-8" />
            <span className="sr-only">Otwórz menu</span>
          </div>
        </SidebarDrawer>

        <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="Fishio Logo" width={24} height={24} className="flex-shrink-0" />
          <span className="font-bold uppercase text-background">Fishio</span>
        </Link>

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
