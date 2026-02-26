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
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

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
}

interface FunnelTemplatePickerProps {
  onSelect: (template: FunnelTemplate) => void;
  onClose: () => void;
  selectedIndustry?: string;
}

const INDUSTRIES = [
  { id: 'all', label: 'All Industries' },
  { id: 'fitness', label: 'Fitness & Health' },
  { id: 'business', label: 'Business & Marketing' },
  { id: 'creative', label: 'Creative & Arts' },
  { id: 'technology', label: 'Technology' },
  { id: 'education', label: 'Education' },
  { id: 'general', label: 'General' },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'course_sales':
      return ShoppingCart;
    case 'lead_magnet':
      return Mail;
    case 'webinar':
      return Video;
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
  if (template.category === 'webinar') {
    return { label: 'Unique to CreatorApp', color: 'bg-blue-100 text-blue-800', icon: Sparkles };
  }
  return null;
};

export default function FunnelTemplatePicker({
  onSelect,
  onClose,
  selectedIndustry: initialIndustry
}: FunnelTemplatePickerProps) {
  const [templates, setTemplates] = useState<FunnelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry || 'all');
  const [previewTemplate, setPreviewTemplate] = useState<FunnelTemplate | null>(null);

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

  const filteredTemplates = templates.filter(t =>
    selectedIndustry === 'all' || t.industry_tags.includes(selectedIndustry)
  );

  const getPageCount = (template: FunnelTemplate) => {
    return template.pages_config?.length || 0;
  };

  const getEmailCount = (template: FunnelTemplate) => {
    const sequences = template.email_sequences_config || [];
    return sequences.reduce((total: number, seq: any) => total + (seq.emails?.length || 0), 0);
  };

  if (previewTemplate) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Templates
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-start gap-6 mb-8">
                <div
                  className="w-32 h-24 rounded-xl bg-cover bg-center flex-shrink-0"
                  style={{ backgroundImage: `url(${previewTemplate.thumbnail_url})` }}
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{previewTemplate.name}</h2>
                  <p className="text-gray-600">{previewTemplate.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{getPageCount(previewTemplate)}</div>
                  <div className="text-sm text-gray-600">Pages Included</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{getEmailCount(previewTemplate)}</div>
                  <div className="text-sm text-gray-600">Emails Pre-Written</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{previewTemplate.estimated_setup_minutes}</div>
                  <div className="text-sm text-gray-600">Minutes to Launch</div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Pages in This Funnel</h3>
                <div className="space-y-3">
                  {previewTemplate.pages_config.map((page: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{page.name}</div>
                        <div className="text-sm text-gray-500">{page.description}</div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>

              {previewTemplate.email_sequences_config.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Email Sequences Included</h3>
                  {previewTemplate.email_sequences_config.map((seq: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <div className="font-medium text-gray-900 mb-2">{seq.name}</div>
                      <div className="text-sm text-gray-600">
                        {seq.emails?.length || 0} pre-written emails that trigger after {seq.trigger}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => onSelect(previewTemplate)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                Use This Template
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                What do you want to accomplish?
              </h2>
              <p className="text-gray-600 text-lg">
                Choose a funnel template and launch in under 30 minutes
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {INDUSTRIES.map((industry) => (
              <button
                key={industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedIndustry === industry.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {industry.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">Loading templates...</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredTemplates.map((template) => {
                const Icon = getCategoryIcon(template.category);
                const badge = getCategoryBadge(template);

                return (
                  <div
                    key={template.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-300 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div
                        className="w-full md:w-72 h-48 md:h-auto bg-cover bg-center relative"
                        style={{ backgroundImage: `url(${template.thumbnail_url})` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                        {badge && (
                          <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${badge.color}`}>
                            <badge.icon className="h-3.5 w-3.5" />
                            {badge.label}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                              <Icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                              <p className="text-sm text-gray-500">
                                {template.category === 'course_sales' && 'Sell courses, products, or services'}
                                {template.category === 'lead_magnet' && 'Build your email list'}
                                {template.category === 'webinar' && 'Host and monetize webinars'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 mb-4">{template.description}</p>

                        <div className="flex flex-wrap gap-4 mb-6 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="h-4 w-4" />
                            <span>{getPageCount(template)} pages</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{getEmailCount(template)} emails</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>~{template.estimated_setup_minutes} min setup</span>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => onSelect(template)}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                          >
                            Use This Template
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
