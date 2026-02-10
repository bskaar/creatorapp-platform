import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, User, Globe, Layout, Package, Sparkles, CheckCircle2 } from 'lucide-react';

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

  const steps: DemoStep[] = [
    {
      id: 1,
      title: 'Sign Up in Seconds',
      description: 'Create your account with just an email and password. Start with a 14-day free trial, no credit card required.',
      icon: <User className="h-8 w-8" />,
      visual: (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 w-full max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Your Account</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="w-full h-12 bg-gray-100 rounded-lg border-2 border-gray-300"></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="w-full h-12 bg-gray-100 rounded-lg border-2 border-gray-300"></div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-12 rounded-lg flex items-center justify-center text-white font-semibold">
                Start Free Trial
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">No credit card required</p>
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
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 w-full max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h3>
            <p className="text-gray-600 mb-6">Let's set up your creator site</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <div className="w-full h-12 bg-gray-100 rounded-lg border-2 border-blue-500 px-4 flex items-center text-gray-700">
                  mycreatorsite
                </div>
                <p className="text-xs text-gray-500 mt-1">Your site will be: mycreatorsite.creatorapp.us</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                <div className="w-full h-24 bg-gray-100 rounded-lg border-2 border-gray-300"></div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-12 rounded-lg flex items-center justify-center text-white font-semibold">
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
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 w-full max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Choose a Template</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border-2 border-blue-500 overflow-hidden shadow-md transform scale-105">
              <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-500"></div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Modern Course</span>
                </div>
                <p className="text-xs text-gray-600">Perfect for online courses</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm opacity-75">
              <div className="h-32 bg-gradient-to-br from-green-500 to-teal-500"></div>
              <div className="p-4">
                <span className="font-semibold text-gray-900">Coaching</span>
                <p className="text-xs text-gray-600">Great for coaches</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm opacity-75">
              <div className="h-32 bg-gradient-to-br from-orange-500 to-red-500"></div>
              <div className="p-4">
                <span className="font-semibold text-gray-900">Membership</span>
                <p className="text-xs text-gray-600">Community focused</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden shadow-sm opacity-75">
              <div className="h-32 bg-gradient-to-br from-pink-500 to-purple-500"></div>
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
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 w-full max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Create Your First Product</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-600 text-white p-3 rounded-lg text-center font-medium text-sm">
                    Course
                  </div>
                  <div className="bg-gray-100 text-gray-600 p-3 rounded-lg text-center font-medium text-sm">
                    Membership
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <div className="w-full h-12 bg-gray-100 rounded-lg border-2 border-gray-300 px-4 flex items-center text-gray-700">
                  My Amazing Course
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <div className="w-full h-12 bg-gray-100 rounded-lg border-2 border-gray-300 px-4 flex items-center text-gray-700">
                  $99
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-12 rounded-lg flex items-center justify-center text-white font-semibold">
                Create Product
              </div>
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
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white flex items-center justify-between">
              <span className="font-semibold">Page Editor</span>
              <div className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Publish Site
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-4 border-2 border-dashed border-blue-300">
                  <div className="text-sm font-medium text-gray-700 mb-2">Hero Section</div>
                  <div className="text-xs text-gray-500">Drag to reposition</div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Features</div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-white h-12 rounded"></div>
                    <div className="bg-white h-12 rounded"></div>
                    <div className="bg-white h-12 rounded"></div>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-4 border-2 border-gray-200">
                  <div className="text-sm font-medium text-gray-700 mb-2">Testimonials</div>
                  <div className="flex gap-2 mt-2">
                    <div className="bg-white h-16 rounded flex-1"></div>
                    <div className="bg-white h-16 rounded flex-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-green-50 border-2 border-green-500 rounded-xl p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-green-800 font-semibold">Your site is live!</p>
            <p className="text-sm text-green-700 mt-1">mycreatorsite.creatorapp.us</p>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-scale-in flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 bg-white/90 hover:bg-white rounded-full p-2 transition-all hover:scale-110 shadow-lg"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 text-white flex-shrink-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 rounded-full p-3">
              {step.icon}
            </div>
            <div>
              <div className="text-sm font-medium text-white/80">Step {currentStep + 1} of {steps.length}</div>
              <h2 className="text-3xl font-bold">{step.title}</h2>
            </div>
          </div>
          <p className="text-lg text-white/90 max-w-2xl">{step.description}</p>
        </div>

        <div className="p-8 flex items-center justify-center bg-gray-50 overflow-y-auto flex-1">
          {step.visual}
        </div>

        <div className="bg-white border-t-2 border-gray-100 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:-translate-x-1'
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
              Previous
            </button>

            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-gradient-to-r from-blue-600 to-purple-600'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:translate-x-1"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <a
                href="/signup"
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
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
      `}</style>
    </div>
  );
}
