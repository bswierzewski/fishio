'use client';

import { ArrowLeft, MoreVertical } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { pageRoutes } from '@/lib/config';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export interface PageHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface PageHeaderProps {
  title?: string;
  description?: string;
  actions?: PageHeaderAction[];
  showBackButton?: boolean;
  onBack?: () => void;
}

export function PageHeader({ title, description, actions, showBackButton = true, onBack }: PageHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentPageTitle = (): string => {
    // If title is explicitly provided, use it
    if (title) {
      return title;
    }

    // Otherwise, derive from pathname using the same logic as navbar
    const staticRoutes = pageRoutes.filter((route) => !route.href.includes('['));
    const dynamicRoutes = pageRoutes.filter((route) => route.href.includes('['));

    const sortedStaticRoutes = [...staticRoutes].sort((a, b) => b.href.length - a.href.length);
    const sortedDynamicRoutes = [...dynamicRoutes].sort((a, b) => b.href.length - a.href.length);

    // Check static routes first
    for (const route of sortedStaticRoutes) {
      if (pathname === route.href || (route.href !== '/' && pathname.startsWith(route.href))) {
        return route.title;
      }
    }

    // Then check dynamic routes
    for (const route of sortedDynamicRoutes) {
      const regexPattern = route.href.replace(/\[([^\]]+)\]/g, '[^/]+').replace(/\//g, '\\/');

      const regex = new RegExp(`^${regexPattern}$`);
      if (regex.test(pathname)) {
        return route.title;
      }
    }

    return 'Fishio';
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleActionClick = (action: PageHeaderAction) => {
    if (action.disabled) return;

    if (action.href) {
      router.push(action.href);
    } else if (action.onClick) {
      action.onClick();
    }
  };

  const pageTitle = getCurrentPageTitle();

  // Separate destructive actions from regular ones
  const regularActions = actions?.filter((action) => action.variant !== 'destructive') || [];
  const destructiveActions = actions?.filter((action) => action.variant === 'destructive') || [];

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      {/* Left Section - Back Button */}
      <div className="flex-shrink-0 w-20">
        {showBackButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="p-2 hover:bg-accent/50 transition-colors shadow"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden md:inline ml-1">Powrót</span>
          </Button>
        )}
      </div>

      {/* Center Section - Page Title */}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold text-foreground">{pageTitle}</h1>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>

      {/* Right Section - Actions Dropdown */}
      <div className="flex-shrink-0 w-20 flex justify-end">
        {actions && actions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 hover:bg-accent/50 transition-colors duration-200 border border-transparent hover:border-border/50 rounded-md shadow"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="hidden sm:ml-2 sm:inline text-sm font-medium">Akcje</span>
                <span className="sr-only">Więcej opcji</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-52 rounded-lg border-border/50 shadow-xl backdrop-blur-sm bg-popover/95 p-1.5"
              sideOffset={8}
            >
              {regularActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className="cursor-pointer px-3 py-2.5 rounded-md transition-colors duration-150 hover:bg-accent/80 focus:bg-accent/80 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed gap-3"
                >
                  {action.icon && <span className="flex-shrink-0 text-muted-foreground">{action.icon}</span>}
                  <span className="text-sm font-medium text-foreground truncate">{action.label}</span>
                </DropdownMenuItem>
              ))}

              {/* Add separator if both regular and destructive actions exist */}
              {regularActions.length > 0 && destructiveActions.length > 0 && (
                <DropdownMenuSeparator className="my-1.5 bg-border/60" />
              )}

              {destructiveActions.map((action, index) => (
                <DropdownMenuItem
                  key={`destructive-${index}`}
                  onClick={() => handleActionClick(action)}
                  disabled={action.disabled}
                  className="cursor-pointer px-3 py-2.5 rounded-md transition-colors duration-150 hover:bg-destructive/10 focus:bg-destructive/10 data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed gap-3 text-destructive"
                >
                  {action.icon && <span className="flex-shrink-0 text-destructive">{action.icon}</span>}
                  <span className="text-sm font-medium text-destructive truncate">{action.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
