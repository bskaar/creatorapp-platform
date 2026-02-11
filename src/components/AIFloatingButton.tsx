import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import AIAssistantPanel from './AIAssistantPanel';

export default function AIFloatingButton() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsPanelOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-40 group"
        title="Open AI Co-Founder"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      </button>

      <AIAssistantPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onMinimize={() => setIsPanelOpen(false)}
      />
    </>
  );
}
