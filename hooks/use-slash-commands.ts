'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Command } from '@/lib/commands/registry';
import { CommandRegistry, searchCommands } from '@/lib/commands/registry';
import { DEFAULT_COMMANDS } from '@/lib/commands/defaults';

type Position = { top: number; left: number; width?: number } | null;

export function useSlashCommands() {
  const registryRef = useRef(new CommandRegistry());
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState<Position>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [all, setAll] = useState<Array<Command>>([]);
  const [recent, setRecent] = useState<Array<string>>([]);

  // Initialize registry once
  useEffect(() => {
    const registry = registryRef.current;
    registry.registerMany(DEFAULT_COMMANDS);
    setAll(registry.getAll());
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recent-commands');
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const filtered = useMemo(() => searchCommands(all, query), [all, query]);

  const addRecent = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 8);
      try {
        localStorage.setItem('recent-commands', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const open = useCallback((pos: Position, initialQuery = '') => {
    setPosition(pos);
    setQuery(initialQuery);
    setIsOpen(true);
    setSelectedIndex(0);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const move = useCallback(
    (delta: number) => {
      setSelectedIndex((prev) => {
        const n = filtered.length;
        if (n === 0) return 0;
        return (prev + delta + n) % n;
      });
    },
    [filtered.length],
  );

  return {
    isOpen,
    query,
    setQuery,
    position,
    selectedIndex,
    commands: filtered,
    open,
    close,
    move,
    setPosition,
    setSelectedIndex,
    addRecent,
    recent,
  };
}
