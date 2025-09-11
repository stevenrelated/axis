import type { ElementType } from 'react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  category: string;
  // Use ElementType to support icon libraries like lucide-react
  icon?: ElementType;
  // UI-only phase: no real action wiring yet
  // action?: (input: string) => void | Promise<void>;
  aliases?: Array<string>;
  shortcut?: string;
}

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(command: Command) {
    this.commands.set(command.id, command);
  }

  registerMany(commands: Array<Command>) {
    for (const c of commands) this.register(c);
  }

  getAll(): Array<Command> {
    return Array.from(this.commands.values());
  }
}

export function simpleFuzzyIncludes(haystack: string, needle: string): boolean {
  if (!needle) return true;
  const h = haystack.toLowerCase();
  const n = needle.toLowerCase();
  // Basic subsequence check for lightweight fuzzy matching
  let i = 0;
  for (const ch of h) {
    if (ch === n[i]) i++;
    if (i === n.length) return true;
  }
  return false;
}

export function searchCommands(
  commands: Array<Command>,
  query: string,
): Array<Command> {
  if (!query) return commands;
  const q = query.trim();
  return commands
    .map((c) => {
      const hay = [
        c.label,
        c.description ?? '',
        c.category,
        ...(c.aliases ?? []),
      ].join(' ');
      const match = simpleFuzzyIncludes(hay, q);
      return { c, score: match ? q.length : -1 };
    })
    .filter((x) => x.score >= 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.c);
}
