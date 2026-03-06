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
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-card shadow-medium p-8 text-white relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/5 rounded-full -ml-24 -mb-24" />
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 backdrop-blur-sm flex items-center justify-center border border-cyan-500/30">
                <Sparkles className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Meet Your AI Co-Founder</h2>
                <p className="text-slate-400">Your 24/7 marketing coach, always ready to help</p>
              </div>
            </div>
          </div>

          <p className="text-slate-300 mb-6 text-lg leading-relaxed">
            I'm trained on proven digital marketing strategies and years of creator economy expertise.
            I'll help you build funnels, write copy, generate leads, and grow your business step by step.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handlePromptClick('How do I create my first sales funnel?')}
              className="text-left p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10 hover:border-cyan-500/30"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-cyan-400" />
              <p className="text-sm font-medium text-slate-200">How do I create my first sales funnel?</p>
            </button>
            <button
              onClick={() => handlePromptClick('What should my lead magnet be?')}
              className="text-left p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10 hover:border-cyan-500/30"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-cyan-400" />
              <p className="text-sm font-medium text-slate-200">What should my lead magnet be?</p>
            </button>
            <button
              onClick={() => handlePromptClick('Help me price my digital product')}
              className="text-left p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10 hover:border-cyan-500/30"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-cyan-400" />
              <p className="text-sm font-medium text-slate-200">Help me price my digital product</p>
            </button>
            <button
              onClick={() => handlePromptClick('Write a welcome email sequence for me')}
              className="text-left p-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl transition-all duration-200 group border border-white/10 hover:border-cyan-500/30"
            >
              <MessageCircle className="w-5 h-5 mb-2 text-cyan-400" />
              <p className="text-sm font-medium text-slate-200">Write a welcome email sequence for me</p>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateGameplan}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-teal-400 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg shadow-cyan-500/25"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Create Your Personalized Gameplan</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-400">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
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
