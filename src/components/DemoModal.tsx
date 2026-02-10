import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, User, Globe, Layout, Package, Sparkles, CheckCircle2, Pause, Play } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const AUTO_ADVANCE_DELAY = 5000; // 5 seconds

  const steps: DemoStep[] = [
    {
      id: 1,
      title: 'Sign Up in Seconds',
      description: 'Create your account with just an email and password. Start with a 14-day free trial, no credit card required.',
      icon: <User className="h-8 w-8" />,
      visual: (
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-white rounded-2xl p-8 border-2 border-blue-200 w-full max-w-md mx-auto shadow-xl">
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Create Your Account
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="w-full h-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 hover:border-blue-400 transition-colors px-4 flex items-center text-gray-400">
                  you@example.com
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="w-full h-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 hover:border-blue-400 transition-colors px-4 flex items-center text-gray-400">
                  ••••••••
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient h-12 rounded-lg flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                Start Free Trial
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <p className="text-sm text-gray-600">No credit card required</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Name Your Site',
      description: 'Choose a unique name for your creator site. This will be your brand identity and subdomain.',
      icon: <Globe className="h-8 w-8" />,
      visual: (
        <div className="bg-gradient-to-br from-green-50 via-teal-50 to-white rounded-2xl p-8 border-2 border-green-200 w-full max-w-md mx-auto shadow-xl">
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Welcome!</h3>
                <p className="text-gray-600 text-sm">Let's set up your creator site</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <div className="w-full h-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-500 px-4 flex items-center text-gray-900 font-medium shadow-sm">
                  mycreatorsite
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  Your site: <span className="font-semibold text-blue-600">mycreatorsite.creatorapp.us</span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                <div className="w-full h-24 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 hover:border-blue-400 transition-colors p-3 text-sm text-gray-400">
                  Tell your audience what you're about...
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient h-12 rounded-lg flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                Continue
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Choose Your Template',
      description: 'Select from beautiful, professionally-designed templates. All fully customizable to match your brand.',
      icon: <Layout className="h-8 w-8" />,
      visual: (
        <div className="bg-gradient-to-br from-orange-50 via-pink-50 to-white rounded-2xl p-8 border-2 border-orange-200 w-full max-w-2xl mx-auto shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Layout className="h-6 w-6 text-orange-600" />
              Choose a Template
            </h3>
            <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
              4 Available
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border-2 border-blue-500 overflow-hidden shadow-lg transform scale-105 transition-all hover:scale-110 cursor-pointer relative">
              <div className="absolute top-3 right-3 z-10">
                <div className="bg-blue-600 text-white rounded-full p-1.5 shadow-lg">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
                  <div className="h-8 bg-white/20 m-4 rounded"></div>
                  <div className="grid grid-cols-3 gap-2 m-4">
                    <div className="h-12 bg-white/20 rounded"></div>
                    <div className="h-12 bg-white/20 rounded"></div>
                    <div className="h-12 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-gray-900">Modern Course</span>
                </div>
                <p className="text-xs text-gray-600">Perfect for online courses</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md hover:shadow-lg hover:border-green-400 transition-all cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-green-500 to-teal-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10">
                  <div className="h-6 bg-white/20 m-4 rounded"></div>
                  <div className="space-y-2 m-4">
                    <div className="h-3 bg-white/20 rounded w-3/4"></div>
                    <div className="h-3 bg-white/20 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <span className="font-semibold text-gray-900">Coaching</span>
                <p className="text-xs text-gray-600">Great for coaches</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md hover:shadow-lg hover:border-orange-400 transition-all cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-orange-500 to-red-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10">
                  <div className="h-8 bg-white/20 m-4 rounded-full"></div>
                  <div className="grid grid-cols-2 gap-2 m-4">
                    <div className="h-8 bg-white/20 rounded"></div>
                    <div className="h-8 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <span className="font-semibold text-gray-900">Membership</span>
                <p className="text-xs text-gray-600">Community focused</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-md hover:shadow-lg hover:border-pink-400 transition-all cursor-pointer">
              <div className="h-32 bg-gradient-to-br from-pink-500 to-purple-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10">
                  <div className="flex gap-2 m-4">
                    <div className="w-16 h-20 bg-white/20 rounded"></div>
                    <div className="w-16 h-20 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <span className="font-semibold text-gray-900">Digital Products</span>
                <p className="text-xs text-gray-600">Sell downloads</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'Add Your First Product',
      description: 'Create your first course, membership, or digital product in minutes with our intuitive builder.',
      icon: <Package className="h-8 w-8" />,
      visual: (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-white rounded-2xl p-8 border-2 border-purple-200 w-full max-w-md mx-auto shadow-xl">
          <div className="bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <Package className="h-8 w-8 text-purple-600" />
              <h3 className="text-2xl font-bold text-gray-900">Create Your First Product</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-xl text-center font-medium text-sm shadow-lg transform scale-105 cursor-pointer border-2 border-purple-400">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Course
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 p-3 rounded-xl text-center font-medium text-sm hover:shadow-md transition-all cursor-pointer border border-gray-200">
                    Membership
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <div className="w-full h-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300 px-4 flex items-center text-gray-900 font-medium shadow-sm">
                  My Amazing Course
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <div className="w-full h-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-300 px-4 flex items-center text-gray-900 font-bold text-lg shadow-sm">
                  $99
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient h-12 rounded-lg flex items-center justify-center text-white font-semibold shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                Create Product
              </div>
            </div>
            <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-xs text-gray-600 text-center">
                Add lessons, set pricing, and publish instantly
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Customize & Launch',
      description: 'Customize your site with our drag-and-drop editor, then publish with one click. Your site goes live instantly!',
      icon: <Sparkles className="h-8 w-8" />,
      visual: (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-8 border-2 border-emerald-200 w-full max-w-2xl mx-auto shadow-xl">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient p-4 text-white flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-bold">Page Editor</span>
              </div>
              <div className="bg-white text-green-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow cursor-pointer animate-pulse-subtle">
                <CheckCircle2 className="h-4 w-4" />
                Publish Site
              </div>
            </div>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-lg p-4 border-2 border-dashed border-blue-400 shadow-md hover:shadow-lg transition-all cursor-move">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-bold text-gray-800">Hero Section</div>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                    Drag to reposition
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all cursor-move">
                  <div className="text-sm font-bold text-gray-800 mb-2">Features</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 h-12 rounded shadow-sm"></div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 h-12 rounded shadow-sm"></div>
                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 h-12 rounded shadow-sm"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition-all cursor-move">
                  <div className="text-sm font-bold text-gray-800 mb-2">Testimonials</div>
                  <div className="flex gap-2 mt-2">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 h-16 rounded flex-1 shadow-sm"></div>
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-100 h-16 rounded flex-1 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-5 text-center shadow-lg animate-slide-in">
            <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 shadow-md">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <p className="text-green-800 font-bold text-lg">Your site is live!</p>
            <p className="text-sm text-green-700 mt-2 font-medium bg-white px-4 py-2 rounded-lg inline-block shadow-sm">
              mycreatorsite.creatorapp.us
            </p>
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-green-700">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                SSL Secure
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Fast CDN
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Ready to Share
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(0);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Auto-advance functionality
  useEffect(() => {
    if (!isOpen || isPaused || currentStep >= steps.length - 1) {
      return;
    }

    // Progress bar animation
    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / AUTO_ADVANCE_DELAY) * 100, 100);
      setProgress(newProgress);
    }, 50);

    // Auto-advance timer
    timerRef.current = setTimeout(() => {
      nextStep();
    }, AUTO_ADVANCE_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentStep, isPaused, isOpen]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      setIsPaused(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 bg-white/95 hover:bg-white rounded-full p-2.5 transition-all hover:scale-110 shadow-lg hover:shadow-xl"
        >
          <X className="h-6 w-6 text-gray-700" />
        </button>

        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] animate-gradient px-8 py-8 text-white flex-shrink-0">
          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
            <div
              className="h-full bg-white/90 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 animate-float shadow-lg">
                {step.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-white/80 flex items-center gap-2">
                  Step {currentStep + 1} of {steps.length}
                  <button
                    onClick={togglePause}
                    className="ml-2 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-all hover:scale-110"
                    title={isPaused ? "Resume auto-play" : "Pause auto-play"}
                  >
                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </button>
                </div>
                <h2 className="text-3xl font-bold drop-shadow-lg">{step.title}</h2>
              </div>
            </div>
          </div>
          <p className="text-lg text-white/95 max-w-2xl drop-shadow">{step.description}</p>
        </div>

        <div className="p-8 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-y-auto flex-1">
          <div key={currentStep} className="animate-slide-in w-full">
            {step.visual}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-white border-t-2 border-gray-200 px-8 py-6 flex-shrink-0 shadow-lg">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-md ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 hover:-translate-x-1 hover:shadow-lg'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <div className="flex gap-3 items-center">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStep(index);
                    setProgress(0);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-10 bg-gradient-to-r from-blue-600 to-purple-600 shadow-md'
                      : index < currentStep
                      ? 'w-2.5 bg-blue-400 hover:bg-blue-500 cursor-pointer'
                      : 'w-2.5 bg-gray-300 hover:bg-gray-400 cursor-pointer'
                  }`}
                  title={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:translate-x-1 shadow-md"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <a
                href="/signup"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 shadow-md animate-pulse-subtle"
              >
                <CheckCircle2 className="h-5 w-5" />
                Get Started Free
              </a>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.5s ease-out;
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
