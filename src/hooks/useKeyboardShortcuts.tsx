import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description: string;
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[], enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const modifierKey = isMac ? shortcut.metaKey : shortcut.ctrlKey;
        const matchesModifier = modifierKey ? (isMac ? event.metaKey : event.ctrlKey) : true;
        const matchesShift = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const matchesAlt = shortcut.altKey ? event.altKey : !event.altKey;
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (matchesKey && matchesModifier && matchesShift && matchesAlt) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

export const globalShortcuts: ShortcutConfig[] = [
  {
    key: 's',
    ctrlKey: true,
    metaKey: true,
    callback: () => {},
    description: 'Save current work'
  },
  {
    key: 'k',
    ctrlKey: true,
    metaKey: true,
    callback: () => {},
    description: 'Open command palette'
  },
  {
    key: '/',
    ctrlKey: true,
    metaKey: true,
    callback: () => {},
    description: 'Show keyboard shortcuts'
  },
  {
    key: 'Escape',
    callback: () => {},
    description: 'Close modal or cancel'
  }
];

export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (shortcut.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }

  parts.push(shortcut.key.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
