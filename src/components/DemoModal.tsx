import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, User, Globe, Layout, Package, Sparkles, CheckCircle2, Pause, Play, Brain, MessageCircle, Image, Palette, Clock, Info } from 'lucide-react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DemoStep {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
  illustratedVisual: React.ReactNode;
}

type ViewMode = 'screenshots' | 'illustrated';

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('screenshots');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const AUTO_ADVANCE_DELAY = 5000;

  const stepTimes = ['~2 min', '~2 min', '~3 min', '~5 min', '~5 min', '~2 min'];
  const totalTime = '~20-30 min';

  const steps: DemoStep[] = [
    {
      id: 1,
      title: 'Sign Up in Seconds',
      description: 'Create your account with just an email and password. Start your 14-day free trial. Credit card required, charged after trial ends.',
      time: stepTimes[0],
      icon: <User className="h-8 w-8" />,
      illustratedVisual: (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-6 shadow-xl">
              <User className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Your Account</h3>
            <p className="text-gray-600 mb-6">Quick and simple registration</p>
            <div className="w-full space-y-3">
              <div className="h-12 bg-white rounded-xl border-2 border-blue-200 flex items-center px-4 gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 text-sm">@</span>
                </div>
                <span className="text-gray-400">Your email</span>
              </div>
              <div className="h-12 bg-white rounded-xl border-2 border-gray-200 flex items-center px-4 gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">***</span>
                </div>
                <span className="text-gray-400">Password</span>
              </div>
              <div className="h-12 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                Start Free Trial
              </div>
            </div>
          </div>
        </div>
      ),
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
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-gray-600">Card charged after 14-day trial</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Name Your Site',
      description: 'Choose a unique name for your creator site. This will be your brand identity and subdomain.',
      time: stepTimes[1],
      icon: <Globe className="h-8 w-8" />,
      illustratedVisual: (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-6 shadow-xl">
              <Globe className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Brand Your Space</h3>
            <p className="text-gray-600 mb-6">Your unique identity online</p>
            <div className="w-full bg-white rounded-xl p-6 shadow-lg border border-teal-100">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-teal-500" />
                <div className="h-3 w-3 rounded-full bg-cyan-500" />
                <div className="h-3 w-3 rounded-full bg-blue-500" />
              </div>
              <div className="text-lg font-bold text-gray-900 mb-2">yoursite</div>
              <div className="text-sm text-gray-500">.creatorapp.site</div>
              <div className="mt-4 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" />
            </div>
          </div>
        </div>
      ),
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
                  Your site: <span className="font-semibold text-blue-600">mycreatorsite.creatorapp.site</span>
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
      time: stepTimes[2],
      icon: <Layout className="h-8 w-8" />,
      illustratedVisual: (
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-8 w-full max-w-lg mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center mb-6 shadow-xl">
              <Layout className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Pick Your Style</h3>
            <p className="text-gray-600 mb-6">Beautiful templates, ready to customize</p>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-blue-500 relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg mb-2" />
                <div className="text-sm font-medium text-gray-900">Modern</div>
              </div>
              <div className="bg-white rounded-xl p-3 shadow border border-gray-200">
                <div className="h-16 bg-gradient-to-br from-teal-400 to-green-400 rounded-lg mb-2" />
                <div className="text-sm font-medium text-gray-900">Coaching</div>
              </div>
              <div className="bg-white rounded-xl p-3 shadow border border-gray-200">
                <div className="h-16 bg-gradient-to-br from-orange-400 to-amber-400 rounded-lg mb-2" />
                <div className="text-sm font-medium text-gray-900">Membership</div>
              </div>
              <div className="bg-white rounded-xl p-3 shadow border border-gray-200">
                <div className="h-16 bg-gradient-to-br from-rose-400 to-pink-400 rounded-lg mb-2" />
                <div className="text-sm font-medium text-gray-900">Products</div>
              </div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gradient-to-br from-cyan-50 via-blue-50 to-white rounded-2xl p-8 border-2 border-cyan-200 w-full max-w-2xl mx-auto shadow-xl">
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
      title: 'Meet Your AI Co-Founder',
      description: 'Get strategic guidance from your AI business coach. Ask questions, generate content, and create custom gameplans powered by Claude AI.',
      time: stepTimes[3],
      icon: <Brain className="h-8 w-8" />,
      illustratedVisual: (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mb-6 shadow-xl relative">
              <Brain className="w-12 h-12 text-white" />
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your AI Partner</h3>
            <p className="text-gray-600 mb-6">Strategic guidance at your fingertips</p>
            <div className="w-full space-y-3">
              <div className="bg-white rounded-xl p-4 shadow-lg border border-blue-100 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Ask anything</span>
                </div>
                <div className="text-xs text-gray-500">"How should I price my course?"</div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-4 shadow-lg text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-sm font-medium text-white">AI Response</span>
                </div>
                <div className="text-xs text-white/90">Personalized strategy and step-by-step guidance...</div>
              </div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-2xl p-8 border-2 border-blue-300 w-full max-w-3xl mx-auto shadow-xl">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

            <div className="relative z-10 p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">AI Co-Founder</h3>
                  <p className="text-blue-100 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Powered by Claude AI
                  </p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-4 border border-white/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-2">You:</p>
                    <p className="text-white/90 text-sm bg-white/10 rounded-lg p-3">
                      "How do I create my first sales funnel?"
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white to-blue-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium mb-2">AI Co-Founder:</p>
                    <div className="text-white/90 text-sm bg-white/10 rounded-lg p-3 space-y-2">
                      <p>"Great question! Let's build a simple but effective funnel..."</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          <span>1. Create a lead magnet offer</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          <span>2. Build an opt-in landing page</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-400" />
                          <span>3. Set up email nurture sequence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="text-left p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/10 text-sm">
                  <MessageCircle className="w-4 h-4 mb-2 text-blue-200" />
                  <p className="text-white font-medium text-xs">What should my lead magnet be?</p>
                </button>
                <button className="text-left p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all border border-white/10 text-sm">
                  <MessageCircle className="w-4 h-4 mb-2 text-blue-200" />
                  <p className="text-white font-medium text-xs">Help me price my product</p>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-white rounded-xl p-4 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-900">AI-Powered Features</p>
                <p className="text-xs text-gray-600">Content generation, strategy, and more</p>
              </div>
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: 'Add Your First Product',
      description: 'Create your first course, membership, or digital product in minutes with our intuitive builder.',
      time: stepTimes[4],
      icon: <Package className="h-8 w-8" />,
      illustratedVisual: (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-6 shadow-xl">
              <Package className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Create Products</h3>
            <p className="text-gray-600 mb-6">Courses, memberships, and more</p>
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-emerald-500 relative">
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div className="w-10 h-10 mx-auto bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-sm font-medium text-gray-900">Course</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                <div className="w-10 h-10 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div className="text-sm font-medium text-gray-500">Membership</div>
              </div>
            </div>
            <div className="w-full mt-4 bg-white rounded-xl p-4 shadow-lg border border-emerald-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your Price</span>
                <span className="text-lg font-bold text-emerald-600">$99</span>
              </div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl p-8 border-2 border-emerald-200 w-full max-w-md mx-auto shadow-xl">
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
      id: 6,
      title: 'Customize & Launch',
      description: 'Customize your site with our drag-and-drop editor, then publish with one click. Your site goes live instantly!',
      time: stepTimes[5],
      icon: <Sparkles className="h-8 w-8" />,
      illustratedVisual: (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 w-full max-w-md mx-auto">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-6 shadow-xl relative">
              <Sparkles className="w-12 h-12 text-white" />
              <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">You're Live!</h3>
            <p className="text-gray-600 mb-6">Your site is ready for the world</p>
            <div className="w-full bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-green-600">Site Published</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <span className="text-blue-600 font-medium text-sm">yoursite.creatorapp.site</span>
              </div>
              <div className="flex justify-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> SSL
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> CDN
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" /> Fast
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
      visual: (
        <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-white rounded-2xl p-8 border-2 border-green-200 w-full max-w-2xl mx-auto shadow-xl">
          <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 p-4 text-white flex items-center justify-between shadow-lg">
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
              mycreatorsite.creatorapp.site
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

        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-6 text-white flex-shrink-0">
          <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
            <div
              className="h-full bg-white/90 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 sm:p-3 shadow-lg flex-shrink-0">
                {step.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white/80 flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
                  <span className="whitespace-nowrap">{currentStep + 1}/{steps.length}</span>
                  <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-xs whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {step.time}
                  </span>
                  <button
                    onClick={togglePause}
                    className="bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-all hover:scale-110"
                    title={isPaused ? "Resume auto-play" : "Pause auto-play"}
                  >
                    {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                  </button>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold drop-shadow-lg">{step.title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setViewMode('screenshots')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'screenshots'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Image className="h-4 w-4" />
                <span className="hidden sm:inline">Screenshots</span>
              </button>
              <button
                onClick={() => setViewMode('illustrated')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'illustrated'
                    ? 'bg-white text-blue-600 shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Illustrated</span>
              </button>
            </div>
          </div>
          <p className="text-base text-white/90 max-w-2xl">{step.description}</p>
        </div>

        <div className="p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-y-auto flex-1">
          <div key={`${currentStep}-${viewMode}`} className="animate-slide-in w-full">
            {viewMode === 'illustrated' ? step.illustratedVisual : step.visual}
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex gap-2 items-center">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentStep(index);
                    setProgress(0);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r from-blue-600 to-cyan-500'
                      : index < currentStep
                      ? 'w-2 bg-blue-400 hover:bg-blue-500 cursor-pointer'
                      : 'w-2 bg-gray-300 hover:bg-gray-400 cursor-pointer'
                  }`}
                  title={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <a
                href="/signup"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
                Start Free Trial
              </a>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Total: {totalTime}
              </span>
              <span className="flex items-center gap-1">
                <Info className="h-3 w-3" />
                Step {currentStep + 1}: {step.time}
              </span>
            </div>
            <p className="text-gray-400 max-w-xs text-right">
              Setup time varies. External integrations require separate configuration.
            </p>
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
