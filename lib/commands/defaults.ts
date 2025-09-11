import type { Command } from './registry';
import { COMMAND_CATEGORIES } from './categories';
import {
  CodeIcon,
  MessageSquareIcon,
  ImageIcon,
  LinkIcon,
  ListChecksIcon,
  SparklesIcon,
} from 'lucide-react';

export const DEFAULT_COMMANDS: Array<Command> = [
  {
    id: 'ask-ai',
    label: 'Ask AI',
    description: 'Send the current input to the assistant',
    category: COMMAND_CATEGORIES.AI_ACTIONS,
    icon: MessageSquareIcon,
    aliases: ['ask', 'question'],
  },
  {
    id: 'generate-code',
    label: 'Generate code',
    description: 'Create a code snippet from your prompt',
    category: COMMAND_CATEGORIES.AI_ACTIONS,
    icon: CodeIcon,
    aliases: ['code'],
  },
  {
    id: 'generate-image',
    label: 'Generate image',
    description: 'Create an image based on your prompt',
    category: COMMAND_CATEGORIES.AI_ACTIONS,
    icon: ImageIcon,
    aliases: ['img', 'image'],
  },
  {
    id: 'insert-link',
    label: 'Insert link',
    description: 'Add a link to your message',
    category: COMMAND_CATEGORIES.FORMATTING,
    icon: LinkIcon,
    aliases: ['link'],
  },
  {
    id: 'task-list',
    label: 'Insert checklist',
    description: 'Start a task checklist',
    category: COMMAND_CATEGORIES.FORMATTING,
    icon: ListChecksIcon,
    aliases: ['todo', 'checklist'],
  },
  {
    id: 'rewrite',
    label: 'Rewrite for clarity',
    description: 'Improve tone, grammar, and clarity',
    category: COMMAND_CATEGORIES.TOOLS,
    icon: SparklesIcon,
    aliases: ['improve', 'polish'],
  },
];
