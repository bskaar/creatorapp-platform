import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Sparkles,
  ShoppingCart,
  Mail,
  Video,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Clock,
  FileText,
  CheckCircle2,
  Upload,
  Wand2,
  Rocket,
  Star,
  Zap,
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';

interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  goal_type: string;
  thumbnail_url: string | null;
  pages_config: any[];
  email_sequences_config: any[];
  estimated_setup_minutes: number;
  is_featured: boolean;
  is_quick_start: boolean;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

const INDUSTRIES = [
  { id: 'fitness', label: 'Fitness & Health' },
  { id: 'business', label: 'Business & Marketing' },
  { id: 'creative', label: 'Creative & Arts' },
  { id: 'technology', label: 'Technology' },
  { id: 'education', label: 'Education' },
  { id: 'general', label: 'Other' },
];

const BRAND_COLORS = [
  { name: 'Ocean Blue', value: '#0EA5E9' },
  { name: 'Forest Green', value: '#10B981' },
  { name: 'Sunset Orange', value: '#F97316' },
  { name: 'Rose Red', value: '#F43F5E' },
  { name: 'Slate Gray', value: '#64748B' },
  { name: 'Golden Yellow', value: '#EAB308' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Navy', value: '#1E40AF' },
];

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { currentSite, refreshSites } = useSite();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    selectedTemplate: null as FunnelTemplate | null,
    siteName: currentSite?.name || '',
    businessDescription: '',
    industry: '',
    brandColor: BRAND_COLORS[0].value,
    logoUrl: '',
  });

  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    createOnboardingSession();
  }, []);

  useEffect(() => {
    if (currentSite?.name) {
      setFormData(prev => ({ ...prev, siteName: currentSite.name }));
    }
  }, [currentSite]);

  const createOnboardingSession = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('onboarding_sessions')
      .insert({
        user_id: user.id,
        site_id: currentSite?.id,
        current_step: 1,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (data && !error) {
      setSessionId(data.id);
    }
  };

  const updateSessionProgress = async (step: number, data?: any) => {
    if (!sessionId) return;

    await supabase
      .from('onboarding_sessions')
      .update({
        current_step: step,
        last_activity_at: new Date().toISOString(),
        ...data,
      })
      .eq('id', sessionId);
  };

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('funnel_templates')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data && !error) {
      setTemplates(data);
    }
    setTemplatesLoading(false);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'course_sales': return ShoppingCart;
      case 'lead_magnet': return Mail;
      case 'webinar': return Video;
      default: return FileText;
    }
  };

  const getBadge = (template: FunnelTemplate) => {
    if (template.is_featured) {
      return { label: 'Most Popular', color: 'bg-amber-100 text-amber-800', icon: Star };
    }
    if (template.is_quick_start) {
      return { label: 'Quick Start', color: 'bg-emerald-100 text-emerald-800', icon: Zap };
    }
    if (template.category === 'webinar') {
      return { label: 'Unique Feature', color: 'bg-blue-100 text-blue-800', icon: Sparkles };
    }
    return null;
  };

  const handleTemplateSelect = (template: FunnelTemplate) => {
    setFormData({ ...formData, selectedTemplate: template });
    updateSessionProgress(2, { selected_template_id: template.id });
    setCurrentStep(1);
  };

  const handleBrandBasicsNext = () => {
    updateSessionProgress(3, {
      business_description: formData.businessDescription,
      industry: formData.industry,
      brand_color: formData.brandColor,
    });
    setCurrentStep(2);
    generateContent();
  };

  const generateContent = async () => {
    setAiGenerating(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-funnel-content`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            templateId: formData.selectedTemplate?.id,
            businessDescription: formData.businessDescription,
            industry: formData.industry,
            siteName: formData.siteName,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGeneratedContent(data);
      } else {
        setGeneratedContent({
          pages: formData.selectedTemplate?.pages_config || [],
          emailSequences: formData.selectedTemplate?.email_sequences_config || [],
        });
      }
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent({
        pages: formData.selectedTemplate?.pages_config || [],
        emailSequences: formData.selectedTemplate?.email_sequences_config || [],
      });
    } finally {
      setAiGenerating(false);
      setCurrentStep(3);
    }
  };

  const handlePublish = async () => {
    if (!currentSite || !formData.selectedTemplate) return;

    setPublishing(true);
    const startTime = Date.now();

    try {
      const pages = generatedContent?.pages || formData.selectedTemplate.pages_config;

      for (const pageConfig of pages) {
        await supabase
          .from('pages')
          .insert({
            site_id: currentSite.id,
            title: pageConfig.name,
            slug: pageConfig.slug,
            blocks: pageConfig.blocks,
            meta_title: pageConfig.name,
            is_published: true,
            ai_content_generated: true,
          });
      }

      const { data: newFunnel } = await supabase
        .from('funnels')
        .insert({
          site_id: currentSite.id,
          name: formData.selectedTemplate.name,
          description: formData.selectedTemplate.description,
          template_source_id: formData.selectedTemplate.id,
        })
        .select()
        .single();

      await supabase
        .from('sites')
        .update({
          name: formData.siteName,
          settings: {
            ...(currentSite.settings as any || {}),
            brand_color: formData.brandColor,
            industry: formData.industry,
          },
          onboarding_completed: true,
          onboarding_data: {
            template_id: formData.selectedTemplate.id,
            template_name: formData.selectedTemplate.name,
            business_description: formData.businessDescription,
            industry: formData.industry,
            brand_color: formData.brandColor,
            completed_at: new Date().toISOString(),
          },
          is_published: true,
        })
        .eq('id', currentSite.id);

      const timeToPublish = Math.round((Date.now() - startTime) / 1000);

      if (sessionId) {
        await supabase
          .from('onboarding_sessions')
          .update({
            completed_at: new Date().toISOString(),
            time_to_first_publish: timeToPublish,
          })
          .eq('id', sessionId);
      }

      await refreshSites();
      setPublished(true);
      setCurrentStep(4);
    } catch (error) {
      console.error('Error publishing:', error);
      alert('There was an error publishing your site. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const getSiteUrl = () => {
    if (!currentSite) return '';
    const subdomain = currentSite.subdomain || currentSite.name.toLowerCase().replace(/\s+/g, '-');
    return `https://${subdomain}.creatorapp.us`;
  };

  const copyLink = () => {
    navigator.clipboard.writeText(getSiteUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalSteps = 5;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const stepTitles = [
    'Choose Your Goal',
    'Brand Basics',
    'AI Content Generation',
    'Review & Publish',
    'Your Site is Live!',
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8">
        {currentStep < 4 && (
          <div className="bg-white border-b border-gray-200 px-8 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Quick Launch</h2>
                  <p className="text-sm text-gray-500">
                    {stepTitles[currentStep]} - Step {currentStep + 1} of {totalSteps - 1}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>~{formData.selectedTemplate?.estimated_setup_minutes || 20} min total</span>
              </div>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {currentStep === 0 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  What do you want to accomplish first?
                </h3>
                <p className="text-lg text-gray-600">
                  Choose a funnel template and we will build it for you with AI
                </p>
              </div>

              {templatesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
                    <p className="text-gray-600">Loading templates...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {templates.map((template) => {
                    const Icon = getCategoryIcon(template.category);
                    const badge = getBadge(template);

                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className="w-full bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left group"
                      >
                        <div className="flex items-start gap-5">
                          <div
                            className="w-24 h-20 rounded-lg bg-cover bg-center flex-shrink-0"
                            style={{ backgroundImage: `url(${template.thumbnail_url})` }}
                          />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {template.name}
                                  </h4>
                                  {badge && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                                      <badge.icon className="w-3 h-3" />
                                      {badge.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                            </div>

                            <p className="text-gray-600 text-sm mb-3">{template.description}</p>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                {template.pages_config?.length || 0} pages
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" />
                                {template.email_sequences_config?.reduce((t: number, s: any) => t + (s.emails?.length || 0), 0)} emails
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                ~{template.estimated_setup_minutes} min
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentStep === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Tell us about your business
                </h3>
                <p className="text-lg text-gray-600">
                  This helps our AI create personalized content for your funnel
                </p>
              </div>

              <div className="max-w-xl mx-auto space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Site / Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="My Awesome Business"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe what you do
                  </label>
                  <textarea
                    value={formData.businessDescription}
                    onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    placeholder="I help busy professionals learn productivity techniques through online courses and coaching..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The more detail you provide, the better the AI can personalize your content
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INDUSTRIES.map((industry) => (
                      <button
                        key={industry.id}
                        onClick={() => setFormData({ ...formData, industry: industry.id })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          formData.industry === industry.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {industry.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Brand Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BRAND_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setFormData({ ...formData, brandColor: color.value })}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formData.brandColor === color.value
                            ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handleBrandBasicsNext}
                    disabled={!formData.siteName || !formData.businessDescription || !formData.industry}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Generate My Funnel
                    <Wand2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="p-8">
              <div className="max-w-md mx-auto text-center py-16">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto">
                    <Wand2 className="w-12 h-12 text-blue-600 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 w-24 h-24 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Creating Your Funnel
                </h3>
                <p className="text-gray-600 mb-8">
                  Our AI is generating personalized copy for your {formData.selectedTemplate?.name}...
                </p>

                <div className="space-y-3 text-left max-w-xs mx-auto">
                  {[
                    'Analyzing your business description',
                    'Generating page headlines',
                    'Writing persuasive copy',
                    'Creating email sequences',
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm">
                      {aiGenerating && index === 1 ? (
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      <span className={aiGenerating && index > 1 ? 'text-gray-400' : 'text-gray-700'}>
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Your funnel is ready!
                </h3>
                <p className="text-lg text-gray-600">
                  Review what we have created and publish when ready
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Pages Created</h4>
                  <div className="space-y-3">
                    {(generatedContent?.pages || formData.selectedTemplate?.pages_config || []).map((page: any, index: number) => (
                      <div key={index} className="flex items-center gap-4 bg-white rounded-lg p-4 border border-gray-200">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{page.name}</div>
                          <div className="text-sm text-gray-500">/{page.slug}</div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {formData.selectedTemplate?.email_sequences_config?.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Email Sequences</h4>
                    {formData.selectedTemplate.email_sequences_config.map((seq: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{seq.name}</div>
                            <div className="text-sm text-gray-500">
                              {seq.emails?.length || 0} emails ready to send
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">All content is editable</h4>
                      <p className="text-sm text-gray-600">
                        After publishing, you can edit any text, swap images, or adjust layouts in the page editor.
                        The AI has created a starting point - make it your own!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {publishing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        Publish My Site
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="p-8">
              <div className="max-w-lg mx-auto text-center py-8">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-14 h-14 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-lg">🎉</span>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-3">
                  Your Site is Live!
                </h3>
                <p className="text-lg text-gray-600 mb-8">
                  Congratulations! Your {formData.selectedTemplate?.name} is now published and ready to share.
                </p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <label className="block text-sm font-medium text-gray-500 mb-2">Your Site URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={getSiteUrl()}
                      className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-900 font-medium"
                    />
                    <button
                      onClick={copyLink}
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <a
                      href={getSiteUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6 mb-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommended Next Steps</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">1</div>
                      <span className="text-gray-700">Edit your pages to personalize the content</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">2</div>
                      <span className="text-gray-700">Connect Stripe when ready to accept payments</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-xs">3</div>
                      <span className="text-gray-700">Add a custom domain in Settings</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onComplete();
                      navigate('/content');
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Edit My Pages
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onComplete}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {currentStep < 4 && (
          <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
            <button
              onClick={onComplete}
              className="text-gray-500 hover:text-gray-700 text-sm font-medium transition"
            >
              Skip for now - I will set up later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
