'use client';

import { motion } from 'framer-motion';
import { memo, useState, useEffect, useMemo } from 'react';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { VisibilityType } from './visibility-selector';
import type { ChatMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

// Business, work-wellness, and HR-policy related suggestions
const ALL_SUGGESTIONS = [
  'How can I improve my work-life balance?',
  'What are the best practices for remote team management?',
  'How should I prepare for a performance review?',
  'What strategies work best for managing workplace stress?',
  'How can I build better relationships with my colleagues?',
  'What are effective time management techniques for professionals?',
  'How should I handle difficult conversations at work?',
  'What are the key elements of a successful career development plan?',
  'How can I improve my leadership skills?',
  'What wellness programs are most beneficial for employee engagement?',
  'How should I approach salary negotiations?',
  'What are the best ways to maintain work-from-home productivity?',
  'How can I create an inclusive workplace culture?',
  'What mental health resources should every company provide?',
  'How should I handle workplace conflicts professionally?',
  'What are the essential components of employee onboarding?',
  'How can I improve my presentation skills for work?',
  'What strategies work for building team morale?',
  'How should I manage multiple projects simultaneously?',
  'What are the most effective ways to give constructive feedback?',
  'How can I create a professional development plan?',
  'What wellness benefits should I negotiate for?',
  'How should I prepare for a job interview?',
  'What are the best practices for email communication at work?',
  'How can I improve my networking skills?',
  'What strategies work for work-life integration?',
  'How should I handle toxic workplace behavior?',
  'What are the key metrics for measuring team performance?',
  'How can I build resilience in the workplace?',
  'What are effective ways to manage change in organizations?',
  'How should I approach career transitions?',
  'What wellness initiatives have the highest ROI?',
];

interface SuggestedActionsProps {
  chatId: string;
  sendMessage: UseChatHelpers<ChatMessage>['sendMessage'];
  selectedVisibilityType: VisibilityType;
  setInput?: (input: string) => void;
}

function PureSuggestedActions({
  chatId,
  sendMessage,
  selectedVisibilityType,
  setInput,
}: SuggestedActionsProps) {
  // State for managing seen suggestions and current batch
  const [seenSuggestions, setSeenSuggestions] = useState<Set<string>>(
    new Set(),
  );
  const [currentBatch, setCurrentBatch] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set client-side flag and load seen suggestions from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('seen-suggestions');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSeenSuggestions(new Set(parsed));
        } catch (error) {
          console.error('Error parsing stored suggestions:', error);
        }
      }
    }
  }, []);

  // Generate shuffled suggestions based on seen state
  const suggestedActions = useMemo(() => {
    // Don't generate suggestions until we're on the client side
    if (!isClient) {
      return ALL_SUGGESTIONS.slice(0, 4); // Return first 4 as fallback
    }

    if (currentBatch.length === 0 || currentBatch.length < 4) {
      // Get unseen suggestions
      const unseenSuggestions = ALL_SUGGESTIONS.filter(
        (suggestion) => !seenSuggestions.has(suggestion),
      );

      // If we've seen all suggestions, reset and start fresh
      let availableSuggestions = unseenSuggestions;
      if (unseenSuggestions.length < 4) {
        // Reset seen suggestions and use all suggestions
        setSeenSuggestions(new Set());
        availableSuggestions = [...ALL_SUGGESTIONS];
        if (typeof window !== 'undefined') {
          localStorage.removeItem('seen-suggestions');
        }
      }

      // Shuffle the available suggestions using Fisher-Yates algorithm
      const shuffled = [...availableSuggestions];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Take first 4 suggestions
      const newBatch = shuffled.slice(0, 4);
      setCurrentBatch(newBatch);

      // Update seen suggestions
      const newSeenSuggestions = new Set([...seenSuggestions, ...newBatch]);
      setSeenSuggestions(newSeenSuggestions);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'seen-suggestions',
          JSON.stringify([...newSeenSuggestions]),
        );
      }

      return newBatch;
    }

    return currentBatch;
  }, [seenSuggestions, currentBatch, isClient]);

  return (
    <div data-testid="suggested-actions" className="w-full space-y-2 px-1">
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={suggestedAction}
          className={cn(
            'relative pb-2',
            index < suggestedActions.length - 1 && 'border-b border-primary/15',
          )}
        >
          <button
            type="button"
            onClick={() => {
              // Set the suggestion text in the input field instead of auto-sending
              if (setInput) {
                setInput(suggestedAction);
              }
            }}
            className="w-full text-left pr-4 pl-0 hover:pl-4 py-4 hover:bg-primary/5 transition-all duration-200 group flex items-center justify-between rounded-xl"
          >
            <span className="text-foreground text-sm leading-relaxed pr-4">
              {suggestedAction}
            </span>
            <div className="flex-shrink-0 text-brand opacity-60 group-hover:opacity-100 -mr-4 group-hover:mr-0 transition-all duration-200">
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform duration-200"
              >
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.setInput !== nextProps.setInput) return false;

    return true;
  },
);
