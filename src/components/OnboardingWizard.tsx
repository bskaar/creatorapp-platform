import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  Sparkles,
  Home,
  Package,
  Mail,
  CheckCircle,
  ChevronRight,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { currentSite, refreshSites } = useSite();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selections, setSelections] = useState({
    businessType: '',
    homepageTemplate: '',
    goal: '',
  });

  const businessTypes = [
    {
      id: 'course',
      title: 'Online Courses',
      description: 'Teach and sell educational content',
      icon: '📚',
    },
    {
      id: 'membership',
      title: 'Membership Site',
      description: 'Build a community with recurring revenue',
      icon: '👥',
    },
    {
      id: 'digital_products',
      title: 'Digital Products',
      description: 'Sell ebooks, templates, or downloads',
      icon: '📦',
    },
    {
      id: 'coaching',
      title: 'Coaching/Consulting',
      description: 'Offer 1-on-1 or group services',
      icon: '💼',
    },
  ];

  const homepageTemplates = [
    {
      id: 'hero-cta',
      title: 'Hero with CTA',
      description: 'Bold headline, benefits, and strong call-to-action',
      preview: 'Simple and conversion-focused',
    },
    {
      id: 'course-showcase',
      title: 'Course Showcase',
      description: 'Perfect for displaying your course or program',
      preview: 'Course details with curriculum',
    },
    {
      id: 'sales-page',
      title: 'Long-Form Sales',
      description: 'Complete sales page with testimonials and FAQ',
      preview: 'High-converting sales layout',
    },
    {
      id: 'minimal',
      title: 'Minimal Landing',
      description: 'Clean, simple design focused on one action',
      preview: 'Less is more approach',
    },
  ];

  const goals = [
    {
      id: 'collect_emails',
      title: 'Collect Email Leads',
      description: 'Build your list with lead magnets',
      icon: Mail,
    },
    {
      id: 'sell_products',
      title: 'Sell Products',
      description: 'Start making sales immediately',
      icon: Package,
    },
    {
      id: 'build_community',
      title: 'Build Community',
      description: 'Create a membership or course',
      icon: Home,
    },
  ];

  const steps = [
    {
      title: 'What are you building?',
      description: 'Help us customize your experience',
      component: 'businessType',
    },
    {
      title: 'Choose your homepage',
      description: 'Pick a template to get started quickly',
      component: 'homepageTemplate',
    },
    {
      title: 'What is your main goal?',
      description: 'We will help you achieve it',
      component: 'goal',
    },
  ];

  const handleBusinessTypeSelect = (typeId: string) => {
    setSelections({ ...selections, businessType: typeId });
    setTimeout(() => setCurrentStep(1), 300);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelections({ ...selections, homepageTemplate: templateId });
    setTimeout(() => setCurrentStep(2), 300);
  };

  const handleGoalSelect = async (goalId: string) => {
    setSelections({ ...selections, goal: goalId });
    await completeOnboarding(goalId);
  };

  const completeOnboarding = async (goalId: string) => {
    if (!currentSite) return;

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('sites')
        .update({
          onboarding_completed: true,
          onboarding_data: {
            business_type: selections.businessType,
            homepage_template: selections.homepageTemplate,
            goal: goalId,
            completed_at: new Date().toISOString(),
          }
        })
        .eq('id', currentSite.id);

      if (updateError) throw updateError;

      await refreshSites();
      onComplete();
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-dark">Welcome to CreatorApp!</h2>
                <p className="text-sm text-text-secondary font-medium">
                  Step {currentStep + 1} of {steps.length}
                </p>
              </div>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold text-dark mb-2">
              {currentStepData.title}
            </h3>
            <p className="text-lg text-text-secondary font-medium">
              {currentStepData.description}
            </p>
          </div>

          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleBusinessTypeSelect(type.id)}
                  className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all text-left group"
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h4 className="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                    {type.title}
                  </h4>
                  <p className="text-text-secondary font-medium">
                    {type.description}
                  </p>
                  <div className="flex items-center text-primary font-semibold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Select <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {homepageTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all text-left group"
                >
                  <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-4 flex items-center justify-center text-text-secondary font-semibold">
                    {template.preview}
                  </div>
                  <h4 className="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                    {template.title}
                  </h4>
                  <p className="text-text-secondary font-medium text-sm">
                    {template.description}
                  </p>
                  <div className="flex items-center text-primary font-semibold mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    Choose Template <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {goals.map((goal) => {
                const Icon = goal.icon;
                return (
                  <button
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal.id)}
                    disabled={loading}
                    className="p-6 border-2 border-border rounded-xl hover:border-primary hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-primary/20 group-hover:to-accent/20 transition-all">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="text-lg font-bold text-dark mb-2 group-hover:text-primary transition-colors">
                      {goal.title}
                    </h4>
                    <p className="text-text-secondary font-medium text-sm">
                      {goal.description}
                    </p>
                    {loading && selections.goal === goal.id && (
                      <div className="flex items-center justify-center mt-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-8 py-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <button
              onClick={onComplete}
              className="text-text-secondary hover:text-text-primary font-semibold transition"
            >
              Skip for now
            </button>
            <div className="flex items-center gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : index < currentStep
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
