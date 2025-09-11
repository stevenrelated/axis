'use client';

import type { LanguageModelUsage, UIMessage } from 'ai';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
  // useMemo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { ArrowUpIcon, PaperclipIcon, StopIcon, CpuIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { SuggestedActions } from './suggested-actions';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputSubmit,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputAttachmentsTrigger,
} from './elements/prompt-input';
import { SelectItem } from '@/components/ui/select';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';
import type { Attachment, ChatMessage } from '@/lib/types';
import { chatModels } from '@/lib/ai/models';
import { saveChatModelAsCookie } from '@/app/(chat)/actions';
import { startTransition } from 'react';
import { SlashCommandMenu } from '@/components/slash-command-menu';
import { useSlashCommands } from '@/hooks/use-slash-commands';
// import { searchCommands } from '@/lib/commands/registry';
// import { getContextWindow, normalizeUsage } from 'tokenlens';
// import { Context } from './elements/context';
// import { myProvider } from '@/lib/ai/providers';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  sendMessage,
  className,
  selectedVisibilityType,
  selectedModelId,
  usage,
}: {
  chatId: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  status: UseChatHelpers<ChatMessage>['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
  usage?: LanguageModelUsage;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  // Auto-resize textarea based on content
  const autoResizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = 'auto';

      // Get CSS variable values with fallbacks
      const computedStyle = getComputedStyle(textarea);
      const rootStyles = getComputedStyle(document.documentElement);

      // Try to get values from CSS variables first, then computed style
      const minHeightVar = rootStyles
        .getPropertyValue('--input-min-height')
        .trim();
      const maxHeightVar = rootStyles
        .getPropertyValue('--input-max-height')
        .trim();

      const minHeight = minHeightVar
        ? Number.parseInt(minHeightVar)
        : Number.parseInt(computedStyle.minHeight) || 40;
      const maxHeight = maxHeightVar
        ? Number.parseInt(maxHeightVar)
        : Number.parseInt(computedStyle.maxHeight) || 200;

      // Calculate new height
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);

      textarea.style.height = `${newHeight}px`;
    }
  }, []);

  // Auto-resize when input changes
  useEffect(() => {
    autoResizeTextarea();
  }, [input, autoResizeTextarea]);

  // Auto-resize on window resize and textarea focus (in case CSS variables change)
  useEffect(() => {
    const handleResize = () => {
      autoResizeTextarea();
    };

    const handleTextareaFocus = () => {
      // Small delay to ensure CSS is applied
      setTimeout(() => autoResizeTextarea(), 10);
    };

    window.addEventListener('resize', handleResize);

    if (textareaRef.current) {
      textareaRef.current.addEventListener('focus', handleTextareaFocus);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('focus', handleTextareaFocus);
      }
    };
  }, [autoResizeTextarea]);

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      // Auto-resize immediately after input is restored
      autoResizeTextarea();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    // Auto-resize immediately after input change
    autoResizeTextarea();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  // Slash commands state
  const slash = useSlashCommands();

  const submitForm = useCallback(() => {
    window.history.replaceState({}, '', `/chat/${chatId}`);

    sendMessage({
      role: 'user',
      parts: [
        ...attachments.map((attachment) => ({
          type: 'file' as const,
          url: attachment.url,
          name: attachment.name,
          mediaType: attachment.contentType,
        })),
        {
          type: 'text',
          text: input,
        },
      ],
    });

    setAttachments([]);
    setLocalStorageInput('');
    setInput('');

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    input,
    setInput,
    attachments,
    sendMessage,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: pathname,
          contentType: contentType,
        };
      }
      if (response.status === 401) {
        toast.error('Please sign in to upload files.');
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      } else {
        const { error } = await response.json();
        toast.error(error);
      }
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  // const modelResolver = useMemo(() => {
  //   return myProvider.languageModel(selectedModelId);
  // }, [selectedModelId]);

  // const contextMax = useMemo(() => {
  //   // Resolve from selected model; stable across chunks.
  //   const cw = getContextWindow(modelResolver.modelId);
  //   return cw.combinedMax ?? cw.inputMax ?? 0;
  // }, [modelResolver]);

  // const usedTokens = useMemo(() => {
  //   // Prefer explicit usage data part captured via onData
  //   if (!usage) return 0; // update only when final usage arrives
  //   const n = normalizeUsage(usage);
  //   return typeof n.total === 'number'
  //     ? n.total
  //     : (n.input ?? 0) + (n.output ?? 0);
  // }, [usage]);

  // const contextProps = useMemo(
  //   () => ({
  //     maxTokens: contextMax,
  //     usedTokens,
  //     usage,
  //     modelId: modelResolver.modelId,
  //   }),
  //   [contextMax, usedTokens, usage, modelResolver],
  // );

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div className="flex relative flex-col gap-4 w-full">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute -top-12 left-1/2 z-50 -translate-x-1/2"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <input
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <div className="relative overflow-visible py-2">
        <SlashCommandMenu
          isOpen={slash.isOpen}
          query={slash.query}
          position={null}
          commands={slash.commands}
          selectedIndex={slash.selectedIndex}
          onHoverIndex={(i) => slash.setSelectedIndex(i)}
          onSelect={(cmd) => {
            const text = `/${cmd.label} `;
            setInput(text);
            requestAnimationFrame(() => {
              const el = textareaRef.current;
              if (el) el.selectionStart = el.selectionEnd = text.length;
            });
            slash.close();
            textareaRef.current?.focus();
          }}
          onClose={() => slash.close()}
          fullWidthBelow
        />

        <PromptInput
          className="rounded-3xl transition-all duration-200 bg-primary/5 border-0 outline-none focus-within:ring-1 focus-within:ring-muted-foreground/50 hover:ring-1 hover:ring-muted-foreground/50"
          onSubmit={(event) => {
            event.preventDefault();
            if (status !== 'ready') {
              toast.error('Please wait for the model to finish its response!');
            } else {
              submitForm();
            }
          }}
        >
          {(attachments.length > 0 || uploadQueue.length > 0) && (
            <div
              data-testid="attachments-preview"
              className="flex overflow-x-scroll flex-row gap-2 items-end px-3 py-2"
            >
              {attachments.map((attachment) => (
                <PreviewAttachment
                  key={attachment.url}
                  attachment={attachment}
                  onRemove={() => {
                    setAttachments((currentAttachments) =>
                      currentAttachments.filter(
                        (a) => a.url !== attachment.url,
                      ),
                    );
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                />
              ))}

              {uploadQueue.map((filename) => (
                <PreviewAttachment
                  key={filename}
                  attachment={{
                    url: '',
                    name: filename,
                    contentType: '',
                  }}
                  isUploading={true}
                />
              ))}
            </div>
          )}
          <div className="flex flex-row gap-2 items-start">
            <PromptInputTextarea
              data-testid="multimodal-input"
              ref={textareaRef}
              placeholder="Send a message or press '/' to use slash commands"
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                // Detect opening and live filtering
                if (value.startsWith('/')) {
                  // Compute caret-based position
                  const rect = textareaRef.current?.getBoundingClientRect();
                  const offsetTop = rect ? rect.top + window.scrollY : 0;
                  const offsetLeft = rect ? rect.left + window.scrollX : 0;
                  if (!slash.isOpen) {
                    slash.open(
                      rect
                        ? {
                            top: offsetTop - 8,
                            left: offsetLeft + 8,
                            width: rect.width,
                          }
                        : { top: 0, left: 0 },
                      value.slice(1),
                    );
                  } else {
                    slash.setQuery(value.slice(1));
                  }
                } else if (slash.isOpen) {
                  // Close when prefix is gone
                  slash.close();
                }
                handleInput(e);
              }}
              // minHeight and maxHeight now controlled by CSS variables
              // disableAutoResize={false} // Enable natural auto-expansion (false is default)
              className="!text-base flex-grow resize-none py-4 px-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-transparent !border-0 !border-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none placeholder:text-muted-foreground"
              autoFocus
              onKeyDownOverride={(e) => {
                if (!slash.isOpen) {
                  // Open immediately on typing '/'
                  if (
                    e.key === '/' &&
                    !e.shiftKey &&
                    !e.ctrlKey &&
                    !e.metaKey &&
                    !e.altKey
                  ) {
                    const rect = textareaRef.current?.getBoundingClientRect();
                    const offsetTop = rect ? rect.top + window.scrollY : 0;
                    const offsetLeft = rect ? rect.left + window.scrollX : 0;
                    slash.open(
                      rect
                        ? {
                            top: offsetTop - 8,
                            left: offsetLeft + 8,
                            width: rect.width,
                          }
                        : { top: 0, left: 0 },
                      '',
                    );
                  }
                  return false;
                }

                // When menu is open, handle navigation
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  slash.move(1);
                  return true;
                }
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  slash.move(-1);
                  return true;
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  slash.close();
                  return true;
                }
                if (e.key === 'Enter') {
                  // prevent sending message when selecting a command
                  e.preventDefault();
                  const selected = slash.commands[slash.selectedIndex];
                  if (selected) {
                    // UI-only: insert command label and close
                    const text = `/${selected.label} `;
                    setInput(text);
                    // Move caret to end
                    requestAnimationFrame(() => {
                      const el = textareaRef.current;
                      if (el) {
                        el.selectionStart = el.selectionEnd = text.length;
                      }
                    });
                  }
                  slash.close();
                  return true;
                }
                return false;
              }}
            />{' '}
            {/* <Context {...contextProps} /> */}
          </div>
          <PromptInputToolbar className="px-3 py-2 !border-t-0 !border-top-0 shadow-none dark:!border-transparent dark:border-0">
            <PromptInputTools className="gap-2">
              <AttachmentsButton
                fileInputRef={fileInputRef}
                status={status}
                selectedModelId={selectedModelId}
              />
              <ModelSelectorCompact selectedModelId={selectedModelId} />
            </PromptInputTools>

            {status === 'submitted' ? (
              <StopButton stop={stop} setMessages={setMessages} />
            ) : (
              <PromptInputSubmit
                status={status}
                disabled={!input.trim() || uploadQueue.length > 0}
                className="p-2 rounded-full transition-colors duration-200 text-brand-foreground bg-brand hover:bg-brand/50 disabled:bg-muted disabled:text-muted-foreground"
              >
                <ArrowUpIcon size={16} />
              </PromptInputSubmit>
            )}
          </PromptInputToolbar>
        </PromptInput>
      </div>

      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 && (
          <div className="mt-6">
            <SuggestedActions
              sendMessage={sendMessage}
              chatId={chatId}
              selectedVisibilityType={selectedVisibilityType}
              setInput={setInput}
            />
          </div>
        )}
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;

    return true;
  },
);

function PureAttachmentsButton({
  fileInputRef,
  status,
  selectedModelId,
}: {
  fileInputRef: React.MutableRefObject<HTMLInputElement | null>;
  status: UseChatHelpers<ChatMessage>['status'];
  selectedModelId: string;
}) {
  const isReasoningModel = selectedModelId === 'chat-model-reasoning';

  return (
    <PromptInputAttachmentsTrigger
      data-testid="attachments-button"
      onClick={() => {
        fileInputRef.current?.click();
      }}
      disabled={status !== 'ready' || isReasoningModel}
      className="hover:bg-muted"
    >
      <PaperclipIcon size={14} />
    </PromptInputAttachmentsTrigger>
  );
}

const AttachmentsButton = memo(PureAttachmentsButton);

function PureModelSelectorCompact({
  selectedModelId,
}: {
  selectedModelId: string;
}) {
  const [optimisticModelId, setOptimisticModelId] = useState(selectedModelId);

  const selectedModel = chatModels.find(
    (model) => model.id === optimisticModelId,
  );

  return (
    <PromptInputModelSelect
      value={selectedModel?.name}
      onValueChange={(modelName) => {
        const model = chatModels.find((m) => m.name === modelName);
        if (model) {
          setOptimisticModelId(model.id);
          startTransition(() => {
            saveChatModelAsCookie(model.id);
          });
        }
      }}
    >
      <PromptInputModelSelectTrigger
        type="button"
        className="text-xs focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=closed]:ring-0"
      >
        <div className="flex items-center gap-2 pr-1">
          <CpuIcon size={16} />
          <span>{selectedModel?.name || 'Select model'}</span>
        </div>
      </PromptInputModelSelectTrigger>
      <PromptInputModelSelectContent>
        {chatModels.map((model) => (
          <SelectItem key={model.id} value={model.name}>
            <div className="flex flex-col gap-1 items-start py-1">
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-muted-foreground">
                {model.description}
              </div>
            </div>
          </SelectItem>
        ))}
      </PromptInputModelSelectContent>
    </PromptInputModelSelect>
  );
}

const ModelSelectorCompact = memo(PureModelSelectorCompact);

function PureStopButton({
  stop,
  setMessages,
}: {
  stop: () => void;
  setMessages: UseChatHelpers<ChatMessage>['setMessages'];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="p-2 rounded-full border transition-colors duration-200 h-fit border-border hover:bg-muted"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
      variant="outline"
      size="sm"
    >
      <StopIcon size={16} />
    </Button>
  );
}

const StopButton = memo(PureStopButton);
