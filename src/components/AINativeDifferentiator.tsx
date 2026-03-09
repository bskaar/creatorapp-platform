import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Zap, ArrowRight, MessageSquare, Palette, FileText, Target, Play } from 'lucide-react';
import AICoFounderDemo from './AICoFounderDemo';

export default function AINativeDifferentiator() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const aiFeatures = [
    {
      icon: MessageSquare,
      title: 'AI Co-Founder',
      description: 'Strategic guidance that knows your business, goals, and audience',
    },
    {
      icon: Target,
      title: 'Gameplan Generator',
      description: 'Turn ideas into step-by-step action plans in seconds',
    },
    {
      icon: FileText,
      title: 'Content Creation',
      description: 'Headlines, emails, and page copy written for your brand',
    },
    {
      icon: Palette,
      title: 'Visual Design',
      description: 'Color palettes and themes matched to your vision',
    },
  ];

  return (
    <section className="relative py-24 px-4 sm:px-8 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]"></div>
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 px-5 py-2.5 rounded-full text-sm font-semibold border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
              <span>AI-Native Platform</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Your AI Co-Founder{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Isn't an Add-On
              </span>
            </h2>

            <p className="text-lg text-gray-300 leading-relaxed">
              CreatorApp was designed from the ground up with AI collaboration at its core. From your initial business gameplan to page content, email sequences, and strategic coaching—AI works alongside you as a true co-founder, not just a tool.
            </p>

            <div className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">What makes us different?</h4>
                  <ul className="space-y-2 text-gray-400">
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>AI understands your entire business context—not isolated prompts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Assistance throughout every step, from planning to launch</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>Eliminates the "blank page" problem for non-technical creators</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsDemoOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-100 transition-all duration-300 hover:-translate-y-0.5 border border-white/20"
              >
                <Play className="w-5 h-5" />
                Try Interactive Demo
              </button>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {aiFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-colors">
                    <Icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center gap-3 text-gray-400 text-sm">
            <span className="w-12 h-px bg-gray-700"></span>
            <span className="text-cyan-400 font-medium">AI-Native: Built with AI collaboration from day one</span>
            <span className="w-12 h-px bg-gray-700"></span>
          </div>
        </div>
      </div>

      <AICoFounderDemo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </section>
  );
}
