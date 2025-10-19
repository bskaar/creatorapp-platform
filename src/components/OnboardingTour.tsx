import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ steps, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  useEffect(() => {
    if (step?.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        setTimeout(() => {
          const rect = element.getBoundingClientRect();
          const tooltipWidth = 320;
          const tooltipHeight = 200;
          const spacing = 20;

          let top = rect.top;
          let left = rect.left;

          switch (step.position || 'bottom') {
            case 'top':
              top = rect.top - tooltipHeight - spacing;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
              break;
            case 'bottom':
              top = rect.bottom + spacing;
              left = rect.left + rect.width / 2 - tooltipWidth / 2;
              break;
            case 'left':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.left - tooltipWidth - spacing;
              break;
            case 'right':
              top = rect.top + rect.height / 2 - tooltipHeight / 2;
              left = rect.right + spacing;
              break;
          }

          top = Math.max(10, Math.min(top, window.innerHeight - tooltipHeight - 10));
          left = Math.max(10, Math.min(left, window.innerWidth - tooltipWidth - 10));

          setPosition({ top, left });

          element.style.position = 'relative';
          element.style.zIndex = '1000';
          element.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5)';
          element.style.borderRadius = '8px';
        }, 100);

        return () => {
          if (element) {
            element.style.position = '';
            element.style.zIndex = '';
            element.style.boxShadow = '';
            element.style.borderRadius = '';
          }
        };
      }
    }
  }, [step, currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (targetElement) {
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
      targetElement.style.boxShadow = '';
      targetElement.style.borderRadius = '';
    }
    onComplete();
  };

  const handleSkip = () => {
    if (targetElement) {
      targetElement.style.position = '';
      targetElement.style.zIndex = '';
      targetElement.style.boxShadow = '';
      targetElement.style.borderRadius = '';
    }
    onSkip();
  };

  if (!step) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-[999]" onClick={handleSkip} />

      <div
        className="fixed z-[1001] bg-white rounded-xl shadow-2xl border-2 border-blue-500 w-80 transition-all"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-gray-700 mb-4">{step.content}</p>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-blue-600'
                      : index < currentStep
                      ? 'w-1.5 bg-blue-400'
                      : 'w-1.5 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                {isLastStep ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const dashboardTourSteps: TourStep[] = [
  {
    target: '[data-tour="nav-dashboard"]',
    title: 'Welcome to Your Dashboard',
    content: 'This is your command center where you can see an overview of your site performance, recent activity, and quick actions.',
    position: 'bottom'
  },
  {
    target: '[data-tour="nav-funnels"]',
    title: 'Funnels & Pages',
    content: 'Create and manage your sales funnels and landing pages. Build complete customer journeys from first visit to conversion.',
    position: 'right'
  },
  {
    target: '[data-tour="nav-contacts"]',
    title: 'Contact Management',
    content: 'View and manage all your contacts, leads, and customers in one place. Segment, tag, and track their journey.',
    position: 'right'
  },
  {
    target: '[data-tour="nav-products"]',
    title: 'Products & Commerce',
    content: 'Manage your products, variants, inventory, and pricing. Set up payment processing and track orders.',
    position: 'right'
  },
  {
    target: '[data-tour="user-menu"]',
    title: 'Settings & Profile',
    content: 'Access your account settings, site configuration, and team management from here.',
    position: 'bottom'
  }
];

export const pageEditorTourSteps: TourStep[] = [
  {
    target: '[data-tour="add-block"]',
    title: 'Add Content Blocks',
    content: 'Click here to add new content blocks to your page. Choose from heroes, text, images, forms, and more.',
    position: 'left'
  },
  {
    target: '[data-tour="block-library"]',
    title: 'Block Library',
    content: 'Browse our extensive library of pre-built blocks and templates to speed up your page building.',
    position: 'left'
  },
  {
    target: '[data-tour="save-button"]',
    title: 'Save Your Work',
    content: 'Don\'t forget to save! Use Ctrl+S (Cmd+S on Mac) or click here to save your changes.',
    position: 'bottom'
  },
  {
    target: '[data-tour="preview"]',
    title: 'Preview Mode',
    content: 'See how your page looks on different devices before publishing.',
    position: 'bottom'
  },
  {
    target: '[data-tour="version-history"]',
    title: 'Version History',
    content: 'Access previous versions of your page and restore them if needed. Never lose your work!',
    position: 'bottom'
  }
];
