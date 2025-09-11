'use client';

import { DefaultChatTransport, type LanguageModelUsage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import {
  fetcher,
  fetchWithErrorHandlers,
  generateUUID,
  getCachedChatMessages,
  setCachedChatMessages,
} from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { unstable_serialize } from 'swr/infinite';
import { getChatHistoryPaginationKey } from './sidebar-history';
import { toast } from './toast';
import type { AppSession } from '@/lib/auth/session';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import { ChatSDKError } from '@/lib/errors';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { useMessages } from '@/hooks/use-messages';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
  initialLastContext,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: AppSession | null;
  autoResume: boolean;
  initialLastContext?: LanguageModelUsage;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();

  const [input, setInput] = useState<string>('');
  const [usage, setUsage] = useState<LanguageModelUsage | undefined>(
    initialLastContext,
  );

  // Defer local cache hydration to after mount to avoid SSR hydration mismatch
  const cached =
    typeof window !== 'undefined' ? getCachedChatMessages(id) : null;

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    regenerate,
    resumeStream,
  } = useChat<ChatMessage>({
    id,
    messages: initialMessages,
    experimental_throttle: 100,
    generateId: generateUUID,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      fetch: fetchWithErrorHandlers,
      prepareSendMessagesRequest({ messages, id, body }) {
        return {
          body: {
            id,
            message: messages.at(-1),
            selectedChatModel: initialChatModel,
            selectedVisibilityType: visibilityType,
            ...body,
          },
        };
      },
    }),
    onData: (dataPart) => {
      setDataStream((ds) => (ds ? [...ds, dataPart] : []));
      if (dataPart.type === 'data-usage') {
        setUsage(dataPart.data);
      }
    },
    onFinish: () => {
      // Only revalidate history on completion; avoid refetching while toggling
      mutate(unstable_serialize(getChatHistoryPaginationKey), undefined, {
        revalidate: true,
        populateCache: false,
      });
      try {
        setCachedChatMessages(id, messages);
      } catch {}
    },
    onError: (error) => {
      if (error instanceof ChatSDKError) {
        if (error.message?.startsWith('You need to sign in')) {
          toast({ type: 'error', description: 'Please sign in to continue' });
          router.push(`/login?next=${encodeURIComponent(pathname || '/')}`);
          return;
        }
        toast({ type: 'error', description: error.message });
      }
    },
  });

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  // Get hasSentMessage state to determine input positioning
  const { hasSentMessage } = useMessages({
    chatId: id,
    status,
  });

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  // After mount or when id changes, optionally hydrate from local cache
  // Prefer SSR messages; only overlay if cached has equal or more messages
  useEffect(() => {
    try {
      const local = getCachedChatMessages(id);
      if (local && local.length >= initialMessages.length) {
        setMessages(local);
      } else {
        setMessages(initialMessages);
      }
      setInput('');
      setUsage(initialLastContext);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Keep local cache updated on message changes (avoid writing empty arrays)
  useEffect(() => {
    try {
      if (messages.length > 0) {
        setCachedChatMessages(id, messages);
      }
    } catch {}
  }, [id, messages]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background touch-pan-y overscroll-behavior-contain relative">
        <ChatHeader
          chatId={id}
          selectedVisibilityType={initialVisibilityType}
          isReadonly={isReadonly}
          session={session}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          regenerate={regenerate}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          selectedModelId={initialChatModel}
          input={input}
          setInput={setInput}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          sendMessage={sendMessage}
          selectedVisibilityType={visibilityType}
          usage={usage}
        />

        {/* Only show bottom input when there are messages or a message has been sent */}
        {(messages.length > 0 || hasSentMessage) && (
          <div className="sticky bottom-0 flex gap-2 px-2 md:px-4 pb-3 md:pb-4 mx-auto w-full bg-background max-w-4xl z-[1] border-t-0">
            {!isReadonly && (
              <MultimodalInput
                chatId={id}
                input={input}
                setInput={setInput}
                status={status}
                stop={stop}
                attachments={attachments}
                setAttachments={setAttachments}
                messages={messages}
                setMessages={setMessages}
                sendMessage={sendMessage}
                selectedVisibilityType={visibilityType}
                selectedModelId={initialChatModel}
                usage={usage}
              />
            )}
          </div>
        )}
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
        selectedModelId={initialChatModel}
      />
    </>
  );
}
