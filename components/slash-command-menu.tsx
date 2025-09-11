'use client';

import { memo, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Command } from '@/lib/commands/registry';

export type SlashCommandMenuProps = {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number; width?: number } | null;
  commands: Array<Command>;
  selectedIndex: number;
  onSelect: (command: Command) => void;
  onHoverIndex?: (index: number) => void;
  onClose: () => void;
  fullWidthAbove?: boolean;
  fullWidthBelow?: boolean;
};

function PureSlashCommandMenu({
  isOpen,
  query,
  position,
  commands,
  selectedIndex,
  onSelect,
  onHoverIndex,
  onClose,
  fullWidthAbove,
  fullWidthBelow,
}: SlashCommandMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const grouped = useMemo(() => {
    const map = new Map<string, Array<Command>>();
    for (const c of commands) {
      const key = c.category || 'General';
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [commands]);

  return (
    <AnimatePresence>
      {isOpen && (fullWidthAbove || fullWidthBelow || position) && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 2 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cn(
            'absolute z-50 max-h-80 overflow-auto rounded-xl border bg-popover text-popover-foreground shadow-lg',
            fullWidthAbove || fullWidthBelow
              ? 'left-0 right-0 w-full'
              : 'w-[22rem]',
          )}
          style={
            fullWidthAbove
              ? { bottom: 'calc(100% + 8px)' }
              : fullWidthBelow
                ? { top: 'calc(100% + 8px)' }
                : position
                  ? {
                      top: position.top,
                      left: position.left,
                      width: position.width,
                    }
                  : undefined
          }
          ref={containerRef}
          role="listbox"
          aria-label="Slash commands"
        >
          <div className="px-3 py-2 border-b text-xs text-muted-foreground">
            {query ? `Search: /${query}` : 'Type to filter commands'}
          </div>
          <div className="p-1">
            {grouped.map(([category, list]) => (
              <div key={category} className="mb-1 last:mb-0">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {category}
                </div>
                <ul className="flex flex-col">
                  {list.map((cmd, idx) => {
                    const absoluteIndex = commands.indexOf(cmd);
                    const isSelected = absoluteIndex === selectedIndex;
                    const Icon = cmd.icon;
                    return (
                      <li key={cmd.id}>
                        <button
                          type="button"
                          onMouseEnter={() => onHoverIndex?.(absoluteIndex)}
                          onClick={() => onSelect(cmd)}
                          className={cn(
                            'w-full flex items-start gap-2 px-3 py-2 rounded-lg text-left transition-colors',
                            isSelected ? 'bg-accent' : 'hover:bg-accent',
                          )}
                        >
                          {Icon ? <Icon className="mt-0.5" size={16} /> : null}
                          <div className="flex-1">
                            <div className="text-sm font-medium leading-tight">
                              {cmd.label}
                            </div>
                            {cmd.description ? (
                              <div className="text-xs text-muted-foreground leading-tight">
                                {cmd.description}
                              </div>
                            ) : null}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const SlashCommandMenu = memo(PureSlashCommandMenu);
