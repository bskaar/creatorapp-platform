import { useState, useEffect } from 'react';
import { UserPlus, Palette, LayoutGrid, Rocket, Clock, Play, Info, ArrowRight } from 'lucide-react';

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  gradient: string;
}

interface HowItWorksSectionProps {
  onWatchDemo?: () => void;
}

export default function HowItWorksSection({ onWatchDemo }: HowItWorksSectionProps) {
  const [activeStep, setActiveStep] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);

  const steps: TimelineStep[] = [
    {
      id: 1,
      title: 'Create Account',
      description: 'Sign up with email and password. Start your 14-day free trial.',
      time: '2 min',
      icon: <UserPlus className="h-6 w-6" />,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 2,
      title: 'Set Up Your Site',
      description: 'Name your site, add a description, and choose your template.',
      time: '5 min',
      icon: <Palette className="h-6 w-6" />,
      gradient: 'from-teal-500 to-teal-600',
    },
    {
      id: 3,
      title: 'Build Your Pages',
      description: 'Use our drag-and-drop editor to customize your site.',
      time: '15 min',
      icon: <LayoutGrid className="h-6 w-6" />,
      gradient: 'from-cyan-500 to-cyan-600',
    },
    {
      id: 4,
      title: 'Launch',
      description: 'Publish your site and start sharing with the world.',
      time: '1 min',
      icon: <Rocket className="h-6 w-6" />,
      gradient: 'from-emerald-500 to-emerald-600',
    },
  ];

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev % 4) + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const handleStepClick = (stepId: number) => {
    setIsAnimating(false);
    setActiveStep(stepId);
  };

  return (
    <section className="py-24 px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50 overflow-hidden" aria-labelledby="how-it-works-heading">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 px-5 py-2 rounded-full text-sm font-semibold border border-emerald-500/20 mb-6">
            <Clock className="w-4 h-4" />
            Launch in Under 30 Minutes
          </div>
          <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Four simple steps to launch your creator business
          </p>
        </div>

        <div className="hidden lg:block mb-16">
          <div className="relative">
            <div className="grid grid-cols-4 gap-6">
              {steps.map((step, index) => {
                const isActive = activeStep === step.id;
                const isPast = activeStep > step.id;

                return (
                  <div
                    key={step.id}
                    className="relative"
                    onClick={() => handleStepClick(step.id)}
                  >
                    <div className={`relative cursor-pointer transition-all duration-500 ${isActive ? 'transform -translate-y-2' : ''}`}>
                      <div className={`relative rounded-2xl p-6 transition-all duration-500 ${
                        isActive
                          ? 'bg-white shadow-xl border-2 border-gray-100'
                          : 'bg-gray-50 hover:bg-white hover:shadow-lg border-2 border-transparent'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 ${
                            isActive || isPast
                              ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg`
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {step.icon}
                          </div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-500 ${
                            isActive
                              ? `bg-gradient-to-r ${step.gradient} text-white`
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {step.time}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                            isActive || isPast
                              ? `bg-gradient-to-r ${step.gradient} text-white`
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {step.id}
                          </div>
                          <h3 className={`text-lg font-bold transition-colors duration-300 ${
                            isActive ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {step.title}
                          </h3>
                        </div>

                        <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                          isActive ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </p>

                        {isActive && (
                          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full bg-gradient-to-r ${step.gradient}`} />
                        )}
                      </div>
                    </div>

                    {index < steps.length - 1 && (
                      <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                        <ArrowRight className={`w-6 h-6 transition-all duration-500 ${
                          isPast ? 'text-emerald-500' : 'text-gray-300'
                        }`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md border border-gray-100">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => handleStepClick(step.id)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      activeStep === step.id
                        ? `bg-gradient-to-r ${step.gradient} scale-125`
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    aria-label={`Go to step ${step.id}`}
                  />
                ))}
                <button
                  onClick={() => setIsAnimating(!isAnimating)}
                  className={`ml-2 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    isAnimating
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {isAnimating ? 'Auto' : 'Paused'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden space-y-4 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                activeStep === step.id
                  ? 'bg-white border-gray-200 shadow-lg'
                  : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-md'
              }`}
            >
              <div className="relative flex flex-col items-center">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeStep >= step.id
                    ? `bg-gradient-to-br ${step.gradient} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-0.5 h-8 mt-3 rounded-full transition-all duration-300 ${
                    activeStep > step.id ? 'bg-emerald-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      activeStep >= step.id
                        ? `bg-gradient-to-r ${step.gradient} text-white`
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.id}
                    </span>
                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full transition-all ${
                    activeStep === step.id
                      ? `bg-gradient-to-r ${step.gradient} text-white`
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {step.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 p-6 mb-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold">Note:</span> Setup time varies based on your content and customization needs.
                External integrations like Stripe (for payments) and Resend (for email) require separate account setup.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onWatchDemo}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 text-white ml-0.5" />
            </div>
            Watch the Demo
          </button>
        </div>
      </div>
    </section>
  );
}
