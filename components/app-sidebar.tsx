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
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';

export type AppUser = { id: string; email: string | null } | undefined;

export function AppSidebar({ user }: { user: AppUser }) {
  const { open, setOpenMobile } = useSidebar();

  return (
    <Sidebar className="border-r [&>[data-sidebar=sidebar]]:bg-brand/10">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <div className="flex items-center gap-2 px-2 hover:bg-muted rounded-md cursor-pointer">
                <span className="text-current">
                  <BrandIcon size={36} />
                </span>
              </div>
            </Link>
            {open && <SidebarToggle />}
          </div>
        </SidebarMenu>
      </SidebarHeader>
      {/* Add spacing between header and content */}
      <div className="h-2" />
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
