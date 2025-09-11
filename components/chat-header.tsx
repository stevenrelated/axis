'use client';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { memo } from 'react';
import type { VisibilityType } from './visibility-selector';
import type { AppSession } from '@/lib/auth/session';

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: AppSession | null;
}) {
  const router = useRouter();
  const { open } = useSidebar();

  const { width: windowWidth } = useWindowSize();

  return (
    <header className="flex absolute top-0 left-0 right-0 z-10 bg-transparent h-12 items-center px-3 md:px-2 gap-2">
      {(!open || windowWidth < 768) && <SidebarToggle />}

      {(!open || windowWidth < 768) && (
        <Button
          variant="ghost"
          className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
          onClick={() => {
            // Navigate to a fresh chat without forcing a hard refresh
            router.push('/?new=1');
          }}
        >
          {/* PlusIcon is only visible on desktop */}
          <span className="hidden md:inline">
            <PlusIcon />
          </span>
          <span className="md:sr-only">New Chat</span>
        </Button>
      )}

      {/* Visibility selector temporarily disabled */}
      {/*
      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-2"
        />
      )}
      */}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return (
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
  );
});
