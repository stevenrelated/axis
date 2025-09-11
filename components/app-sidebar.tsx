'use client';

import { BrandIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarToggle } from '@/components/sidebar-toggle';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export type AppUser = { id: string; email: string | null } | undefined;

export function AppSidebar({ user }: { user: AppUser }) {
  const { open, setOpenMobile, state } = useSidebar();

  return (
    <Sidebar
      className="border-r [&>[data-sidebar=sidebar]]:bg-brand/10 group-data-[collapsible=icon]:[&>[data-sidebar=sidebar]]:px-0"
      collapsible="icon"
    >
      <SidebarHeader className="group-data-[collapsible=icon]:p-4">
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-2 items-center transition-all duration-200 group-data-[collapsible=icon]:gap-0"
            >
              <div className="flex items-center justify-center gap-2 px-2 py-2 hover:bg-muted rounded-md cursor-pointer transition-all duration-200 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center h-10">
                <span className="text-current">
                  <BrandIcon size={24} />
                </span>
              </div>
            </Link>
            <SidebarMenuItem className="group-data-[collapsible=icon]:hidden">
              <SidebarToggle />
            </SidebarMenuItem>
          </div>
        </SidebarMenu>
      </SidebarHeader>

      {/* Add spacing between header and content */}

      <SidebarContent className="group-data-[collapsible=icon]:p-3">
        <SidebarHistory user={user} />
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:p-3">
        {user && <SidebarUserNav user={user} />}
      </SidebarFooter>
    </Sidebar>
  );
}
