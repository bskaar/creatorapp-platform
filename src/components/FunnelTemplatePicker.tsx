import { useState, useEffect } from 'react';
import {
  X,
  ShoppingCart,
  Mail,
  Video,
  Star,
  Zap,
  Clock,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Briefcase,
  GraduationCap,
  Palette,
  Eye,
  ChevronRight,
  Target,
  Award,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useDeviceType } from '../hooks/useDeviceType';
import { AdaptiveModal } from './responsive/AdaptiveModal';
import { TouchButton } from './responsive/TouchButton';

interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  goal_type: string;
  thumbnail_url: string | null;
  preview_images: string[];
  pages_config: any[];
  email_sequences_config: any[];
  estimated_setup_minutes: number;
  is_featured: boolean;
  is_quick_start: boolean;
  sort_order: number;
  industry_tags: string[];
  tone_suggestions?: string[];
  ai_prompt_context?: string;
  placeholder_map?: Record<string, string>;
  difficulty_level?: string;
}

interface QuickCustomizeData {
  businessName: string;
  businessDescription: string;
  targetAudience: string;
  tone: string;
  painPoints: string[];
  desiredOutcomes: string[];
}

interface FunnelTemplatePickerProps {
  onSelect: (template: FunnelTemplate, customizeData?: QuickCustomizeData) => void;
  onClose: () => void;
  selectedIndustry?: string;
  showQuickCustomize?: boolean;
}

const INDUSTRIES = [
  { id: 'all', label: 'All', icon: Target },
  { id: 'coaching', label: 'Coaching', icon: Users },
  { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart },
  { id: 'agency', label: 'Agency', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'fitness', label: 'Fitness', icon: TrendingUp },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'business', label: 'Business', icon: Award },
];

const TONES = [
  { id: 'professional', label: 'Professional', description: 'Formal and polished' },
  { id: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
  { id: 'authoritative', label: 'Authoritative', description: 'Expert and confident' },
  { id: 'conversational', label: 'Conversational', description: 'Casual and relatable' },
  { id: 'energetic', label: 'Energetic', description: 'Dynamic and exciting' },
  { id: 'luxury', label: 'Luxury', description: 'Sophisticated and premium' },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'course_sales':
    case 'course':
      return GraduationCap;
    case 'lead_magnet':
      return Mail;
    case 'webinar':
      return Video;
    case 'coaching':
      return Users;
    case 'ecommerce':
      return ShoppingCart;
    case 'agency':
      return Briefcase;
    case 'challenge':
      return TrendingUp;
    case 'membership':
      return Users;
    case 'tripwire':
      return Zap;
    default:
      return FileText;
  }
};

const getCategoryBadge = (template: FunnelTemplate) => {
  if (template.is_featured) {
    return { label: 'Most Popular', color: 'bg-amber-100 text-amber-800', icon: Star };
  }
  if (template.is_quick_start) {
    return { label: 'Quick Start', color: 'bg-emerald-100 text-emerald-800', icon: Zap };
  }
  if (template.difficulty_level === 'beginner') {
    return { label: 'Beginner Friendly', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 };
  }
  return null;
};

const getDifficultyBadge = (level?: string) => {
  switch (level) {
    case 'beginner':
      return { label: 'Beginner', color: 'text-green-600' };
    case 'intermediate':
      return { label: 'Intermediate', color: 'text-amber-600' };
    case 'advanced':
      return { label: 'Advanced', color: 'text-red-600' };
    default:
      return null;
  }
};

export default function FunnelTemplatePicker({
  onSelect,
  onClose,
  selectedIndustry: initialIndustry,
  showQuickCustomize = true,
}: FunnelTemplatePickerProps) {
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry || 'all');
  const [previewTemplate, setPreviewTemplate] = useState<FunnelTemplate | null>(null);
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [customizeData, setCustomizeData] = useState<QuickCustomizeData>({
    businessName: '',
    businessDescription: '',
    targetAudience: '',
    tone: 'professional',
    painPoints: ['', '', ''],
    desiredOutcomes: ['', '', ''],
  });

  const { isMobile, isTablet } = useDeviceType();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('funnel_templates')
      .select('*')
      .order('sort_order', { ascending: true });

    if (data && !error) {
      setTemplates(data);
    }
    setLoading(false);
  };

  const filteredTemplates = templates.filter(
    (t) => selectedIndustry === 'all' || t.industry_tags?.includes(selectedIndustry)
  );

  const featuredTemplates = filteredTemplates.filter((t) => t.is_featured);
  const quickStartTemplates = filteredTemplates.filter((t) => t.is_quick_start && !t.is_featured);
  const otherTemplates = filteredTemplates.filter((t) => !t.is_featured && !t.is_quick_start);

  const getPageCount = (template: FunnelTemplate) => {
    return template.pages_config?.length || 0;
  };

  const getEmailCount = (template: FunnelTemplate) => {
    const sequences = template.email_sequences_config || [];
    return sequences.reduce((total: number, seq: any) => total + (seq.emails?.length || 0), 0);
  };

  const handleSelectTemplate = (template: FunnelTemplate, skipCustomize = false) => {
    if (showQuickCustomize && !skipCustomize) {
      setSelectedTemplate(template);
      setCustomizeData((prev) => ({
        ...prev,
        tone: template.tone_suggestions?.[0] || 'professional',
      }));
      setShowCustomize(true);
    } else {
      onSelect(template);
    }
  };

  const handleCustomizeSubmit = () => {
    if (selectedTemplate) {
      const cleanedData = {
        ...customizeData,
        painPoints: customizeData.painPoints.filter((p) => p.trim()),
        desiredOutcomes: customizeData.desiredOutcomes.filter((o) => o.trim()),
      };
      onSelect(selectedTemplate, cleanedData);
    }
  };

  const handleSkipCustomize = () => {
    if (selectedTemplate) {
      onSelect(selectedTemplate);
    }
  };

  const updatePainPoint = (index: number, value: string) => {
    const newPainPoints = [...customizeData.painPoints];
    newPainPoints[index] = value;
    setCustomizeData({ ...customizeData, painPoints: newPainPoints });
  };

  const updateOutcome = (index: number, value: string) => {
    const newOutcomes = [...customizeData.desiredOutcomes];
    newOutcomes[index] = value;
    setCustomizeData({ ...customizeData, desiredOutcomes: newOutcomes });
  };

  if (showCustomize && selectedTemplate) {
    return (
      <AdaptiveModal isOpen={true} onClose={() => setShowCustomize(false)} title="Quick Customize" size="lg">
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            {selectedTemplate.thumbnail_url && (
              <div
                className="w-16 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${selectedTemplate.thumbnail_url})` }}
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{selectedTemplate.name}</h3>
              <p className="text-sm text-gray-500">Personalize this template for your business</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Business Name *
              </label>
              <input
                type="text"
                value={customizeData.businessName}
                onChange={(e) => setCustomizeData({ ...customizeData, businessName: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Acme Coaching"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Describe Your Business *
              </label>
              <textarea
                value={customizeData.businessDescription}
                onChange={(e) => setCustomizeData({ ...customizeData, businessDescription: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="What do you offer? Who do you serve? What makes you unique?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={customizeData.targetAudience}
                onChange={(e) => setCustomizeData({ ...customizeData, targetAudience: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Busy professionals aged 30-45"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Writing Tone
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setCustomizeData({ ...customizeData, tone: tone.id })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition border ${
                      customizeData.tone === tone.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Pain Points Your Audience Has (optional)
              </label>
              <div className="space-y-2">
                {customizeData.painPoints.map((point, index) => (
                  <input
                    key={index}
                    type="text"
                    value={point}
                    onChange={(e) => updatePainPoint(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Pain point ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Outcomes They Desire (optional)
              </label>
              <div className="space-y-2">
                {customizeData.desiredOutcomes.map((outcome, index) => (
                  <input
                    key={index}
                    type="text"
                    value={outcome}
                    onChange={(e) => updateOutcome(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Desired outcome ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={handleSkipCustomize}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Skip & Use Template As-Is
            </button>
            <button
              onClick={handleCustomizeSubmit}
              disabled={!customizeData.businessName || !customizeData.businessDescription}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Personalized Content
            </button>
          </div>
        </div>
      </AdaptiveModal>
    );
  }

  if (previewTemplate) {
    return (
      <AdaptiveModal isOpen={true} onClose={() => setPreviewTemplate(null)} title="Template Preview" size="lg">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            {previewTemplate.thumbnail_url && (
              <div
                className="w-24 h-20 rounded-xl bg-cover bg-center flex-shrink-0"
                style={{ backgroundImage: `url(${previewTemplate.thumbnail_url})` }}
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">{previewTemplate.name}</h2>
              <p className="text-gray-600 text-sm">{previewTemplate.description}</p>
              {previewTemplate.difficulty_level && (
                <span className={`text-xs font-medium ${getDifficultyBadge(previewTemplate.difficulty_level)?.color}`}>
                  {getDifficultyBadge(previewTemplate.difficulty_level)?.label}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{getPageCount(previewTemplate)}</div>
              <div className="text-xs text-gray-600">Pages</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{getEmailCount(previewTemplate)}</div>
              <div className="text-xs text-gray-600">Emails</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{previewTemplate.estimated_setup_minutes}</div>
              <div className="text-xs text-gray-600">Minutes</div>
            </div>
          </div>

          {previewTemplate.tone_suggestions && previewTemplate.tone_suggestions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Recommended Tones</h3>
              <div className="flex flex-wrap gap-2">
                {previewTemplate.tone_suggestions.map((tone) => (
                  <span key={tone} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {tone}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Pages Included</h3>
            <div className="space-y-2">
              {previewTemplate.pages_config.map((page: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm truncate">{page.name}</div>
                    <div className="text-xs text-gray-500 truncate">{page.description}</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>

          {previewTemplate.email_sequences_config && previewTemplate.email_sequences_config.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Email Sequences</h3>
              {previewTemplate.email_sequences_config.map((seq: any, index: number) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 text-sm">{seq.name}</div>
                  <div className="text-xs text-gray-600">
                    {seq.emails?.length || 0} pre-written emails
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
            >
              Back to Templates
            </button>
            <button
              onClick={() => handleSelectTemplate(previewTemplate)}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Use This Template
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </AdaptiveModal>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 md:p-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                Choose Your Funnel
              </h2>
              <p className="text-gray-600 text-sm md:text-base">
                {templates.length} templates with pre-written copy
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {INDUSTRIES.map((industry) => {
              const Icon = industry.icon;
              return (
                <button
                  key={industry.id}
                  onClick={() => setSelectedIndustry(industry.id)}
                  className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap min-h-[40px] ${
                    selectedIndustry === industry.id
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {industry.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading templates...</p>
              </div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No templates found for this industry.</p>
              <button
                onClick={() => setSelectedIndustry('all')}
                className="mt-4 text-blue-600 font-medium hover:underline"
              >
                View all templates
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {featuredTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Most Popular
                  </h3>
                  <div className="grid gap-4">
                    {featuredTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={() => setPreviewTemplate(template)}
                        onSelect={() => handleSelectTemplate(template)}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {quickStartTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-500" />
                    Quick Start
                  </h3>
                  <div className="grid gap-4">
                    {quickStartTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={() => setPreviewTemplate(template)}
                        onSelect={() => handleSelectTemplate(template)}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherTemplates.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All Templates</h3>
                  <div className="grid gap-4">
                    {otherTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={() => setPreviewTemplate(template)}
                        onSelect={() => handleSelectTemplate(template)}
                        isMobile={isMobile}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface TemplateCardProps {
  template: FunnelTemplate;
  onPreview: () => void;
  onSelect: () => void;
  isMobile: boolean;
}

function TemplateCard({ template, onPreview, onSelect, isMobile }: TemplateCardProps) {
  const Icon = getCategoryIcon(template.category);
  const badge = getCategoryBadge(template);
  const difficulty = getDifficultyBadge(template.difficulty_level);

  const pageCount = template.pages_config?.length || 0;
  const emailCount = template.email_sequences_config?.reduce(
    (total: number, seq: any) => total + (seq.emails?.length || 0),
    0
  ) || 0;

  if (isMobile) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                {badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${badge.color}`}>
                    {badge.label}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span>{pageCount} pages</span>
            <span>{emailCount} emails</span>
            <span>~{template.estimated_setup_minutes} min</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onPreview}
              className="flex-1 px-3 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition min-h-[44px] flex items-center justify-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={onSelect}
              className="flex-1 px-3 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition min-h-[44px] flex items-center justify-center gap-1"
            >
              Use
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 group">
      <div className="flex flex-col md:flex-row">
        {template.thumbnail_url && (
          <div
            className="w-full md:w-56 h-40 md:h-auto bg-cover bg-center relative flex-shrink-0"
            style={{ backgroundImage: `url(${template.thumbnail_url})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
            {badge && (
              <div
                className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}
              >
                <badge.icon className="h-3 w-3" />
                {badge.label}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{template.name}</h3>
                {difficulty && (
                  <span className={`text-xs font-medium ${difficulty.color}`}>{difficulty.label}</span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{template.description}</p>

          <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{pageCount} pages</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span>{emailCount} emails</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>~{template.estimated_setup_minutes} min</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onPreview}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={onSelect}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              Use This Template
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
