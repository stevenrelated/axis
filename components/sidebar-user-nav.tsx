'use client';

import Image from 'next/image';
// import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase/client';
import { toast } from './toast';
// import { LoaderIcon } from './icons';

export function SidebarUserNav({
  user,
}: { user: { id: string; email: string | null } }) {
  const router = useRouter();
  // const { setTheme, resolvedTheme } = useTheme();

  const isGuest = false;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Tooltip>
              <TooltipTrigger asChild>
                <SidebarMenuButton
                  data-testid="user-nav-button"
                  className="data-[state=open]:bg-sidebar-accent bg-brand/0 data-[state=open]:text-sidebar-accent-foreground h-10 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!p-0 [&>img]:!size-6"
                >
                  <Image
                    src={`https://avatar.vercel.sh/${user.email}`}
                    alt={user.email ?? 'User Avatar'}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 flex-shrink-0"
                  />
                  <span
                    data-testid="user-email"
                    className="truncate group-data-[collapsible=icon]:hidden"
                  >
                    {user?.email}
                  </span>
                </SidebarMenuButton>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="group-data-[collapsible=icon]:block hidden"
              >
                {user?.email}
              </TooltipContent>
            </Tooltip>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="user-nav-menu"
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            {/**
             * Theme toggle temporarily disabled to enforce system theme as the single source of truth.
             * If re-enabling, remove comments below and import/use `useTheme`.
             *
             * <DropdownMenuItem
             *   data-testid="user-nav-item-theme"
             *   className="cursor-pointer"
             *   onSelect={() =>
             *     setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
             *   }
             * >
             *   {`Toggle ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
             * </DropdownMenuItem>
             */}

            <DropdownMenuItem asChild data-testid="user-nav-item-auth">
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={async () => {
                  const { error } = await supabaseBrowser.auth.signOut();
                  if (error) {
                    toast({ type: 'error', description: 'Failed to sign out' });
                  } else {
                    toast({ type: 'success', description: 'Signed out' });
                    router.push('/login');
                    router.refresh();
                  }
                }}
              >
                {'Sign out'}
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild data-testid="user-nav-item-settings">
              <button type="button" className="w-full cursor-pointer">
                {'Settings'}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
