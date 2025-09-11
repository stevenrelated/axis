import { PreviewMessage, ThinkingMessage } from './message';
import { Greeting } from './greeting';
import { memo, useEffect, type Dispatch, type SetStateAction } from 'react';
import type { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { useMessages } from '@/hooks/use-messages';
import type { ChatMessage, Attachment } from '@/lib/types';
import { useDataStream } from './data-stream-provider';
import { Conversation, ConversationContent } from './elements/conversation';
import { ArrowDownIcon } from 'lucide-react';
import { MultimodalInput } from './multimodal-input';
import type { VisibilityType } from './visibility-selector';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers<ChatMessage>['status'];
  votes: Array<Vote> | undefined;
  messages: ChatMessage[];
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  regenerate: UseChatHelpers<ChatMessage>['regenerate'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
  selectedModelId: string;
  // Props for centered input in new conversations
  input?: string;
  setInput?: Dispatch<SetStateAction<string>>;
  stop?: () => void;
  attachments?: Array<Attachment>;
  setAttachments?: Dispatch<SetStateAction<Array<Attachment>>>;
  sendMessage?: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType?: VisibilityType;
  usage?: any;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  regenerate,
  isReadonly,
  isArtifactVisible,
  selectedModelId,
  input,
  setInput,
  stop,
  attachments,
  setAttachments,
  sendMessage,
  selectedVisibilityType,
  usage,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    isAtBottom,
    scrollToBottom,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });

  useDataStream();

  useEffect(() => {
    if (status === 'submitted') {
      requestAnimationFrame(() => {
        const container = messagesContainerRef.current;
        if (container) {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        }
      });
    }
  }, [status, messagesContainerRef]);

  return (
    <div
      ref={messagesContainerRef}
      className={`overflow-y-scroll flex-1 touch-pan-y overscroll-behavior-contain -webkit-overflow-scrolling-touch pt-12 ${
        messages.length === 0 ? 'flex items-center justify-center' : ''
      }`}
      style={{ overflowAnchor: 'none' }}
    >
      <Conversation className="flex flex-col gap-4 pt-64 pb-4 mx-auto min-w-0 max-w-4xl md:gap-6 md:px-4 md:pb-2 md:pt-4">
        <ConversationContent className="flex flex-col gap-4 md:gap-6 w-full">
          {messages.length === 0 && (
            <div className="flex justify-center w-full">
              <Greeting />
            </div>
          )}

          {/* Centered input for new conversations */}
          {messages.length === 0 &&
            !hasSentMessage &&
            input !== undefined &&
            setInput &&
            stop &&
            attachments !== undefined &&
            setAttachments &&
            sendMessage &&
            selectedVisibilityType && (
              <div className="flex justify-center items-center mt-8 w-full">
                <div className="w-full max-w-3xl">
                  <MultimodalInput
                    chatId={chatId}
                    input={input}
                    setInput={setInput}
                    status={status}
                    stop={stop}
                    attachments={attachments}
                    setAttachments={setAttachments}
                    messages={messages}
                    setMessages={setMessages}
                    sendMessage={sendMessage}
                    selectedVisibilityType={selectedVisibilityType}
                    selectedModelId={selectedModelId}
                    usage={usage}
                  />
                </div>
              </div>
            )}

          {messages.map((message, index) => (
            <PreviewMessage
              key={message.id}
              chatId={chatId}
              message={message}
              isLoading={
                status === 'streaming' && messages.length - 1 === index
              }
              vote={
                votes
                  ? votes.find((vote) => vote.messageId === message.id)
                  : undefined
              }
              setMessages={setMessages}
              regenerate={regenerate}
              isReadonly={isReadonly}
              requiresScrollPadding={
                hasSentMessage && index === messages.length - 1
              }
              isArtifactVisible={isArtifactVisible}
            />
          ))}

          {status === 'submitted' &&
            messages.length > 0 &&
            messages[messages.length - 1].role === 'user' &&
            selectedModelId !== 'chat-model-reasoning' && <ThinkingMessage />}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </ConversationContent>
      </Conversation>

      {!isAtBottom && (
        <button
          className="absolute bottom-40 left-1/2 z-10 p-2 rounded-full border shadow-lg transition-colors -translate-x-1/2 bg-background hover:bg-muted"
          onClick={() => scrollToBottom('smooth')}
          type="button"
          aria-label="Scroll to bottom"
        >
          <ArrowDownIcon className="size-4" />
        </button>
      )}
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return false;
});
