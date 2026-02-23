import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, MousePointer2, Clock } from 'lucide-react';

interface ScreenshotStep {
  id: number;
  title: string;
  description: string;
  time: string;
  annotations: Annotation[];
  visual: React.ReactNode;
}

interface Annotation {
  id: string;
  x: number;
  y: number;
  label: string;
  type: 'click' | 'type' | 'highlight';
}

interface DemoScreenshotsProps {
  autoPlay?: boolean;
  onStepChange?: (step: number) => void;
}

export default function DemoScreenshots({ autoPlay = false, onStepChange }: DemoScreenshotsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAnnotation, setShowAnnotation] = useState(false);

  const steps: ScreenshotStep[] = [
    {
      id: 1,
      title: 'Sign Up Form',
      description: 'Enter your email and choose a secure password to create your account.',
      time: '~2 min',
      annotations: [
        { id: 'email', x: 50, y: 35, label: 'Enter your email', type: 'click' },
        { id: 'password', x: 50, y: 50, label: 'Create password', type: 'type' },
        { id: 'submit', x: 50, y: 70, label: 'Click to start trial', type: 'click' },
      ],
      visual: (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-auto border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Create Your Account</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="h-11 bg-gray-50 rounded-lg border-2 border-blue-400 px-4 flex items-center text-gray-600">
                you@example.com
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="h-11 bg-gray-50 rounded-lg border border-gray-200 px-4 flex items-center text-gray-400">
                ••••••••
              </div>
            </div>
            <button className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold">
              Start Free Trial
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">14-day trial, credit card required</p>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Name Your Site',
      description: 'Choose a unique name that will become your site URL.',
      time: '~1 min',
      annotations: [
        { id: 'sitename', x: 50, y: 45, label: 'Type your site name', type: 'type' },
        { id: 'continue', x: 50, y: 75, label: 'Click to continue', type: 'click' },
      ],
      visual: (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-auto border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome!</h3>
          <p className="text-gray-600 text-sm mb-6">Let's set up your creator site</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <div className="h-11 bg-blue-50 rounded-lg border-2 border-blue-400 px-4 flex items-center text-gray-900 font-medium">
                mycreatorsite
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your URL: <span className="text-blue-600">mycreatorsite.creatorapp.site</span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <div className="h-20 bg-gray-50 rounded-lg border border-gray-200 p-3 text-sm text-gray-400">
                Describe your site...
              </div>
            </div>
            <button className="w-full h-11 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg font-semibold">
              Continue
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Choose Template',
      description: 'Select a professionally designed template as your starting point.',
      time: '~2 min',
      annotations: [
        { id: 'template', x: 30, y: 50, label: 'Click to select', type: 'click' },
        { id: 'preview', x: 70, y: 30, label: 'Preview templates', type: 'highlight' },
      ],
      visual: (
        <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg mx-auto border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Choose a Template</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border-2 border-blue-500 overflow-hidden shadow-md relative">
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="h-24 bg-gradient-to-br from-blue-500 to-cyan-500" />
              <div className="p-3">
                <p className="font-semibold text-sm">Modern Course</p>
                <p className="text-xs text-gray-500">For online courses</p>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors">
              <div className="h-24 bg-gradient-to-br from-teal-500 to-green-500" />
              <div className="p-3">
                <p className="font-semibold text-sm">Coaching</p>
                <p className="text-xs text-gray-500">For coaches</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: 'Dashboard Overview',
      description: 'Your command center for managing your entire creator business.',
      time: '~3 min',
      annotations: [
        { id: 'nav', x: 10, y: 50, label: 'Navigation menu', type: 'highlight' },
        { id: 'stats', x: 60, y: 30, label: 'Key metrics', type: 'highlight' },
        { id: 'actions', x: 60, y: 70, label: 'Quick actions', type: 'click' },
      ],
      visual: (
        <div className="bg-gray-100 rounded-xl shadow-2xl overflow-hidden max-w-lg mx-auto border border-gray-200">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-12 flex items-center px-4">
            <span className="text-white font-semibold">CreatorApp</span>
          </div>
          <div className="flex">
            <div className="w-14 bg-gray-900 py-4">
              <div className="space-y-3 px-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg ${i === 1 ? 'bg-blue-600' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 bg-white">
              <h4 className="font-semibold text-gray-900 mb-3">Dashboard</h4>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {['Revenue', 'Contacts', 'Views'].map((label) => (
                  <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-gray-900">0</div>
                    <div className="text-xs text-gray-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="h-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200" />
                <div className="h-8 bg-gray-50 rounded-lg border border-gray-200" />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 5,
      title: 'Page Editor',
      description: 'Drag and drop blocks to build your pages visually.',
      time: '~15 min',
      annotations: [
        { id: 'blocks', x: 15, y: 50, label: 'Block library', type: 'highlight' },
        { id: 'canvas', x: 60, y: 50, label: 'Drag blocks here', type: 'click' },
        { id: 'publish', x: 85, y: 15, label: 'Publish when ready', type: 'click' },
      ],
      visual: (
        <div className="bg-gray-100 rounded-xl shadow-2xl overflow-hidden max-w-lg mx-auto border border-gray-200">
          <div className="bg-white border-b border-gray-200 h-10 flex items-center justify-between px-4">
            <span className="text-sm font-medium text-gray-700">Page Editor</span>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs px-3 py-1 rounded-lg font-medium">
              Publish
            </button>
          </div>
          <div className="flex h-56">
            <div className="w-28 bg-gray-50 border-r border-gray-200 p-2">
              <p className="text-xs text-gray-500 mb-2">Blocks</p>
              <div className="space-y-2">
                {['Hero', 'Features', 'CTA', 'Text'].map((block) => (
                  <div key={block} className="bg-white rounded p-2 text-xs font-medium text-gray-700 border border-gray-200 cursor-move hover:border-blue-300 transition-colors">
                    {block}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 p-4 bg-white">
              <div className="space-y-2">
                <div className="h-20 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border-2 border-dashed border-blue-400 flex items-center justify-center text-sm text-blue-600">
                  Hero Section
                </div>
                <div className="h-12 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                  Drop blocks here
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 6,
      title: 'Publish Your Site',
      description: 'One click and your site is live for the world to see.',
      time: '~1 min',
      annotations: [
        { id: 'publish-btn', x: 50, y: 40, label: 'Click to publish', type: 'click' },
        { id: 'url', x: 50, y: 70, label: 'Your live URL', type: 'highlight' },
      ],
      visual: (
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm mx-auto border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-1 bg-white rounded transform rotate-45 translate-x-0.5" />
              <div className="w-5 h-1 bg-white rounded transform -rotate-45 -translate-x-1" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Site Published!</h3>
          <p className="text-gray-600 text-sm mb-4">Your site is now live</p>
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-blue-600 font-medium text-sm">mycreatorsite.creatorapp.site</p>
          </div>
          <div className="flex gap-2 justify-center text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> SSL Secure
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> Fast CDN
            </span>
          </div>
        </div>
      ),
    },
  ];

  const goToStep = useCallback((index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowAnnotation(false);
    setCurrentStep(index);
    onStepChange?.(index);
    setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => setShowAnnotation(true), 300);
    }, 300);
  }, [isAnimating, onStepChange]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowAnnotation(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [autoPlay, steps.length]);

  const step = steps[currentStep];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span className="font-medium text-blue-600">Step {currentStep + 1}</span>
            <span>/</span>
            <span>{steps.length}</span>
            <span className="flex items-center gap-1 ml-2 text-gray-400">
              <Clock className="w-3 h-3" />
              {step.time}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`p-2 rounded-lg transition-all ${
              currentStep === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className={`p-2 rounded-lg transition-all ${
              currentStep === steps.length - 1
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:shadow-md'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-6">{step.description}</p>

      <div className="relative mb-6">
        <div
          className={`transition-all duration-300 ${
            isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
          }`}
        >
          {step.visual}
        </div>

        {showAnnotation && step.annotations.map((annotation, idx) => (
          <div
            key={annotation.id}
            className="absolute pointer-events-none animate-fade-in"
            style={{
              left: `${annotation.x}%`,
              top: `${annotation.y}%`,
              animationDelay: `${idx * 150}ms`,
            }}
          >
            {annotation.type === 'click' && (
              <div className="relative">
                <div className="absolute -translate-x-1/2 -translate-y-1/2">
                  <MousePointer2 className="w-5 h-5 text-blue-600 drop-shadow-md animate-bounce" />
                </div>
                <div className="absolute left-2 top-2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  {annotation.label}
                </div>
              </div>
            )}
            {annotation.type === 'type' && (
              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                <div className="bg-cyan-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg flex items-center gap-1">
                  <span className="animate-pulse">|</span>
                  {annotation.label}
                </div>
              </div>
            )}
            {annotation.type === 'highlight' && (
              <div className="absolute -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-yellow-400/50 rounded-full animate-ping" />
                <div className="absolute left-4 top-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                  {annotation.label}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-2">
        {steps.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToStep(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentStep
                ? 'w-8 bg-gradient-to-r from-blue-600 to-cyan-500'
                : idx < currentStep
                ? 'w-2 bg-blue-300 hover:bg-blue-400'
                : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
