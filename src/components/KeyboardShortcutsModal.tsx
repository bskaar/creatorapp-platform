import { X, Keyboard } from 'lucide-react';
import { formatShortcut } from '../hooks/useKeyboardShortcuts';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const shortcuts = [
  {
    category: 'General',
    items: [
      { key: 's', ctrlKey: true, metaKey: true, description: 'Save current work' },
      { key: 'k', ctrlKey: true, metaKey: true, description: 'Open command palette' },
      { key: '/', ctrlKey: true, metaKey: true, description: 'Show keyboard shortcuts' },
      { key: 'Escape', description: 'Close modal or cancel' },
    ]
  },
  {
    category: 'Navigation',
    items: [
      { key: 'd', ctrlKey: true, metaKey: true, description: 'Go to dashboard' },
      { key: 'f', ctrlKey: true, metaKey: true, description: 'Go to funnels' },
      { key: 'c', ctrlKey: true, metaKey: true, description: 'Go to contacts' },
      { key: 'p', ctrlKey: true, metaKey: true, description: 'Go to products' },
    ]
  },
  {
    category: 'Editor',
    items: [
      { key: 's', ctrlKey: true, metaKey: true, description: 'Save page' },
      { key: 'p', ctrlKey: true, metaKey: true, description: 'Preview page' },
      { key: 'b', ctrlKey: true, metaKey: true, description: 'Add new block' },
      { key: 'd', ctrlKey: true, metaKey: true, description: 'Duplicate block' },
      { key: 'Delete', description: 'Delete selected block' },
      { key: 'z', ctrlKey: true, metaKey: true, description: 'Undo' },
      { key: 'z', ctrlKey: true, metaKey: true, shiftKey: true, description: 'Redo' },
    ]
  },
  {
    category: 'Search',
    items: [
      { key: 'f', ctrlKey: true, metaKey: true, description: 'Find in page' },
      { key: 'g', ctrlKey: true, metaKey: true, description: 'Find next' },
      { key: 'g', ctrlKey: true, metaKey: true, shiftKey: true, description: 'Find previous' },
    ]
  }
];

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">{item.description}</span>
                      <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-800">
                        {formatShortcut(item as any)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Press <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs font-mono">Ctrl+/</kbd> or{' '}
            <kbd className="px-2 py-0.5 bg-gray-200 rounded text-xs font-mono">⌘/</kbd> to view this dialog anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
