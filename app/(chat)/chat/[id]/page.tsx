import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';

import { getSupabaseSession } from '@/lib/supabase/ssr';
import { Chat } from '@/components/chat';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/utils';

const getCachedChat = (id: string) =>
  unstable_cache(async () => getChatById({ id }), ['chat-by-id', id], {
    tags: ['chat', id],
    revalidate: 60,
  })();

const getCachedMessages = (id: string) =>
  unstable_cache(
    async () => getMessagesByChatId({ id }),
    ['messages-by-chat-id', id],
    { tags: ['messages', id], revalidate: 60 },
  )();

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const [chat, session] = await Promise.all([
    getCachedChat(id),
    getSupabaseSession(),
  ]);

  if (!chat) {
    notFound();
  }

  if (chat.visibility === 'private') {
    if (!session?.user || session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getCachedMessages(id);

  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
    return (
      <>
        <Chat
          key={chat.id}
          id={chat.id}
          initialMessages={uiMessages}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
          session={session}
          autoResume={true}
          initialLastContext={chat.lastContext ?? undefined}
        />
        <DataStreamHandler />
      </>
    );
  }

  return (
    <>
      <Chat
        key={chat.id}
        id={chat.id}
        initialMessages={uiMessages}
        initialChatModel={chatModelFromCookie.value}
        initialVisibilityType={chat.visibility}
        isReadonly={session?.user?.id !== chat.userId}
        session={session}
        autoResume={true}
        initialLastContext={chat.lastContext ?? undefined}
      />
      <DataStreamHandler />
    </>
  );
}
