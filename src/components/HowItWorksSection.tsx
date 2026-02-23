import { useState } from 'react';
import { UserPlus, Palette, LayoutGrid, Rocket, Clock, ChevronRight, Play, Info } from 'lucide-react';

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface HowItWorksSectionProps {
  onWatchDemo?: () => void;
}

export default function HowItWorksSection({ onWatchDemo }: HowItWorksSectionProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const steps: TimelineStep[] = [
    {
      id: 1,
      title: 'Create Account',
      description: 'Sign up with email and password. Start your 14-day free trial.',
      time: '~2 min',
      icon: <UserPlus className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      id: 2,
      title: 'Set Up Your Site',
      description: 'Name your site, add a description, and choose your template.',
      time: '~5 min',
      icon: <Palette className="h-6 w-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
    },
    {
      id: 3,
      title: 'Build Your Pages',
      description: 'Use our drag-and-drop editor to customize your site.',
      time: '~15 min',
      icon: <LayoutGrid className="h-6 w-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
    },
    {
      id: 4,
      title: 'Launch',
      description: 'Publish your site and start sharing with the world.',
      time: '~1 min',
      icon: <Rocket className="h-6 w-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
    },
  ];

  const totalTime = '~30 min';

  return (
    <section className="py-24 px-8 bg-gradient-to-b from-white via-gray-50 to-white" aria-labelledby="how-it-works-heading">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold border border-blue-500/20 mb-6">
            <Clock className="w-4 h-4" />
            Quick Setup
          </div>
          <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            From Sign Up to Launch in{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              {totalTime}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Set up your landing page and start offering services quickly. Here's how it works.
          </p>
        </div>

        <div className="hidden lg:block relative mb-12">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-teal-200 via-cyan-200 to-emerald-200 -translate-y-1/2 rounded-full" />

          <div className="relative flex justify-between items-start">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="relative flex flex-col items-center w-1/4 px-4"
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <div
                  className={`relative z-10 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg ${
                    activeStep === step.id
                      ? `${step.bgColor} ${step.borderColor} border-2 scale-110`
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={activeStep === step.id ? step.color : 'text-gray-500'}>
                    {step.icon}
                  </div>
                  <div className={`absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-md ${
                    activeStep === step.id
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {step.id}
                  </div>
                </div>

                <div className={`mt-6 text-center transition-all duration-300 ${
                  activeStep === step.id ? 'transform -translate-y-1' : ''
                }`}>
                  <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                  <div className={`inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full mb-2 ${step.bgColor} ${step.color}`}>
                    <Clock className="w-3 h-3" />
                    {step.time}
                  </div>
                  <p className={`text-sm text-gray-600 transition-all duration-300 ${
                    activeStep === step.id ? 'opacity-100' : 'opacity-70'
                  }`}>
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <ChevronRight className="absolute top-6 -right-2 w-5 h-5 text-gray-300 z-20" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:hidden space-y-4 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all duration-300 ${step.bgColor} ${step.borderColor}`}
            >
              <div className="relative">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-white shadow-md ${step.color}`}>
                  {step.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                  {step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute top-full left-1/2 w-0.5 h-4 bg-gray-200 -translate-x-1/2 mt-2" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full bg-white ${step.color}`}>
                    {step.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">Note:</span> Setup time varies based on your content and customization needs.
                External integrations like Stripe (for payments) and Resend (for email) require separate account setup which may add additional time.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onWatchDemo}
            className="inline-flex items-center gap-3 bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 shadow-md hover:shadow-lg group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 text-white ml-0.5" />
            </div>
            Watch How It Works
          </button>
        </div>
      </div>
    </section>
  );
}
