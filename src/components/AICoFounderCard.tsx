import { useState } from 'react';
import { Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import AIAssistantPanel from './AIAssistantPanel';

export default function AICoFounderCard() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState('');

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt);
    setIsPanelOpen(true);
  };

  const handleCreateGameplan = () => {
    setSelectedPrompt('');
    setIsPanelOpen(true);
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-card shadow-medium p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Meet Your AI Co-Founder</h2>
                <p className="text-blue-100">Your 24/7 marketing coach, always ready to help</p>
              </div>
            </div>
          </div>

          <p className="text-blue-50 mb-6 text-lg leading-relaxed">
            I'm trained on proven digital marketing strategies and years of creator economy expertise.
            I'll help you build funnels, write copy, generate leads, and grow your business step by step.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handlePromptClick('How do I create my first sales funnel?')}
              className="text-left p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-blue-200" />
              <p className="text-sm font-medium">How do I create my first sales funnel?</p>
            </button>
            <button
              onClick={() => handlePromptClick('What should my lead magnet be?')}
              className="text-left p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-blue-200" />
              <p className="text-sm font-medium">What should my lead magnet be?</p>
            </button>
            <button
              onClick={() => handlePromptClick('Help me price my digital product')}
              className="text-left p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-blue-200" />
              <p className="text-sm font-medium">Help me price my digital product</p>
            </button>
            <button
              onClick={() => handlePromptClick('Write a welcome email sequence for me')}
              className="text-left p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-blue-200" />
              <p className="text-sm font-medium">Write a welcome email sequence for me</p>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateGameplan}
              className="flex-1 px-6 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Create Your Personalized Gameplan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-blue-100">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>AI Co-Founder is online and ready</span>
          </div>
        </div>
      </div>

      <AIAssistantPanel
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
          setSelectedPrompt('');
        }}
        onMinimize={() => {
          setIsPanelOpen(false);
          setSelectedPrompt('');
        }}
        initialMessage={selectedPrompt}
      />
    </>
  );
}
