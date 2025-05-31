'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { navLinks } from '@/lib/config';

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto mb-2 max-w-md px-2">
      <div className="flex items-center justify-around rounded-full bg-secondary p-2 shadow-lg">
        {navLinks.map((link) => {
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
              <IconComponent className="h-6 w-6" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
