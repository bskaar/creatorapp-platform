import { useState, useEffect } from 'react';
import {
  FileText,
  Palette,
  Target,
  Code,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  Eye,
  Trash2,
  Lock,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useSite } from '../../contexts/SiteContext';
import { supabase } from '../../lib/supabase';

type DocumentType = 'branding' | 'business_plan' | 'html_reference';

interface ContextDocument {
  id: string;
  site_id: string;
  document_type: DocumentType;
  name: string;
  raw_content_preview: string | null;
  extracted_context: Record<string, unknown> | null;
  extraction_model: string | null;
  version: number;
  status: 'processing' | 'ready' | 'failed' | 'archived';
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

interface DocumentTypeConfig {
  type: DocumentType;
  title: string;
  description: string;
  icon: typeof FileText;
  placeholder: string;
  tips: string[];
}

const DOCUMENT_TYPES: DocumentTypeConfig[] = [
  {
    type: 'branding',
    title: 'Branding Guidelines',
    description: 'Upload your brand style guide to help AI match your visual identity',
    icon: Palette,
    placeholder: 'Paste your brand guidelines content here...\n\nInclude information about:\n- Brand colors (hex codes preferred)\n- Typography/fonts\n- Tone of voice\n- Key brand phrases or taglines\n- Visual style preferences',
    tips: [
      'Include specific hex color codes when possible',
      'Describe your brand voice (professional, casual, playful, etc.)',
      'List any brand phrases or taglines you commonly use',
    ],
  },
  {
    type: 'business_plan',
    title: 'Business Strategy',
    description: 'Share your business plan to get more relevant strategic advice',
    icon: Target,
    placeholder: 'Paste your business plan or strategy document here...\n\nInclude information about:\n- Your mission and vision\n- Target audience description\n- Value propositions\n- Competitive advantages\n- Business goals',
    tips: [
      'Describe your ideal customer in detail',
      'List what makes you different from competitors',
      'Include both short-term and long-term goals',
    ],
  },
  {
    type: 'html_reference',
    title: 'Design Reference',
    description: 'Paste HTML/CSS from a website you like to extract its design patterns',
    icon: Code,
    placeholder: 'Paste HTML/CSS code here...\n\nYou can copy the source code from a website you admire to extract:\n- Color palette\n- Typography styles\n- Spacing patterns\n- Layout preferences',
    tips: [
      'Copy the full HTML source including style tags',
      'Include any inline CSS or linked stylesheets',
      'The more complete the code, the better the extraction',
    ],
  },
];

function getTierFromPlan(planName: string | undefined): 'starter' | 'growth' | 'pro' | 'enterprise' {
  if (!planName) return 'starter';
  const normalized = planName.toLowerCase();
  if (normalized.includes('enterprise')) return 'enterprise';
  if (normalized.includes('pro')) return 'pro';
  if (normalized.includes('growth')) return 'growth';
  return 'starter';
}

function getTierLimits(tier: string): { maxDocuments: number; monthlyExtractions: number } {
  const limits: Record<string, { maxDocuments: number; monthlyExtractions: number }> = {
    enterprise: { maxDocuments: 25, monthlyExtractions: 999 },
    pro: { maxDocuments: 10, monthlyExtractions: 5 },
    growth: { maxDocuments: 3, monthlyExtractions: 2 },
    starter: { maxDocuments: 0, monthlyExtractions: 0 },
  };
  return limits[tier] || limits.starter;
}

export default function BrandKitSettings() {
  const { currentSite } = useSite();
  const [documents, setDocuments] = useState<ContextDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [content, setContent] = useState<Record<DocumentType, string>>({
    branding: '',
    business_plan: '',
    html_reference: '',
  });
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ContextDocument | null>(null);
  const [monthlyUsage, setMonthlyUsage] = useState(0);

  const tier = getTierFromPlan(currentSite?.subscription_plan_name);
  const isFeatureAvailable = tier !== 'starter';
  const limits = getTierLimits(tier);

  useEffect(() => {
    if (currentSite && isFeatureAvailable) {
      loadDocuments();
      loadMonthlyUsage();
    } else {
      setLoading(false);
    }
  }, [currentSite, isFeatureAvailable]);

  const loadDocuments = async () => {
    if (!currentSite) return;

    try {
      const { data, error } = await supabase
        .from('site_context_documents')
        .select('*')
        .eq('site_id', currentSite.id)
        .is('archived_at', null)
        .order('document_type')
        .order('version', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyUsage = async () => {
    if (!currentSite) return;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('site_context_documents')
      .select('*', { count: 'exact', head: true })
      .eq('site_id', currentSite.id)
      .gte('created_at', startOfMonth.toISOString());

    setMonthlyUsage(count || 0);
  };

  const handleUpload = async (docType: DocumentType) => {
    if (!currentSite || !content[docType].trim()) return;

    setUploading(docType);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-context-document`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            site_id: currentSite.id,
            document_type: docType,
            content: content[docType],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process document');
      }

      setContent(prev => ({ ...prev, [docType]: '' }));
      await loadDocuments();
      await loadMonthlyUsage();
    } catch (err) {
      console.error('Upload error:', err);
      alert(err instanceof Error ? err.message : 'Failed to upload document');
    } finally {
      setUploading(null);
    }
  };

  const getLatestDocByType = (docType: DocumentType): ContextDocument | undefined => {
    return documents.find(d => d.document_type === docType && d.status === 'ready');
  };

  const getVersionHistory = (docType: DocumentType): ContextDocument[] => {
    return documents.filter(d => d.document_type === docType);
  };

  const activeDocCount = documents.filter(d => d.status === 'ready').length;

  if (!isFeatureAvailable) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gray-100 rounded-xl">
            <Lock className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Brand Kit</h2>
            <p className="text-gray-500">Upload business context to enhance AI responses</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-sm mb-4">
            <Sparkles className="h-8 w-8 text-cyan-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Unlock Brand Kit with Growth Plan
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Upload your branding guidelines, business plan, and design references to get AI responses
            that truly understand your business and match your brand voice.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 max-w-2xl mx-auto">
            {DOCUMENT_TYPES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white/60 rounded-xl p-4 text-left">
                <Icon className="h-5 w-5 text-cyan-600 mb-2" />
                <div className="font-medium text-gray-900 text-sm">{title}</div>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
              </div>
            ))}
          </div>
          <a
            href="/settings?tab=subscription"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all shadow-lg shadow-cyan-500/25"
          >
            Upgrade to Growth
          </a>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Getting Better AI Results Without Brand Kit</h3>
          <p className="text-gray-600 text-sm mb-4">
            While Brand Kit automates context injection, you can still get great results by including
            context in your prompts. Here are some tips:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-xs font-bold">1</span>
              </div>
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">Start with context:</strong> Begin your prompt with
                "I run a [type of business] targeting [audience]. My brand voice is [description]."
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-xs font-bold">2</span>
              </div>
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">Be specific:</strong> Include details like your main
                competitors, unique selling points, and customer pain points.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-cyan-600 text-xs font-bold">3</span>
              </div>
              <div className="text-sm text-gray-600">
                <strong className="text-gray-900">Show examples:</strong> Share examples of content or
                copy you've liked in the past to help the AI match your style.
              </div>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Brand Kit</h2>
            <p className="text-gray-500">Upload business context to enhance AI responses</p>
          </div>
        </div>
        <button
          onClick={() => { loadDocuments(); loadMonthlyUsage(); }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Refresh"
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            <strong className="text-gray-900">{activeDocCount}</strong> / {limits.maxDocuments} documents
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            <strong className="text-gray-900">{monthlyUsage}</strong> / {limits.monthlyExtractions} extractions this month
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {DOCUMENT_TYPES.map((docConfig) => {
          const { type, title, description, icon: Icon, placeholder, tips } = docConfig;
          const latestDoc = getLatestDocByType(type);
          const versionHistory = getVersionHistory(type);
          const isExpanded = expandedDoc === type;
          const isUploading = uploading === type;

          return (
            <div
              key={type}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${latestDoc ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Icon className={`h-5 w-5 ${latestDoc ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </div>
                  {latestDoc && (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </span>
                      <button
                        onClick={() => setPreviewDoc(latestDoc)}
                        className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                        title="Preview extracted context"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {latestDoc ? (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{latestDoc.name}</span>
                        <span className="text-xs text-gray-500">
                          v{latestDoc.version} - {new Date(latestDoc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {latestDoc.extraction_model && (
                        <p className="text-xs text-gray-500">
                          Extracted using {latestDoc.extraction_model}
                        </p>
                      )}
                    </div>

                    {versionHistory.length > 1 && (
                      <div className="relative">
                        <button
                          onClick={() => setExpandedDoc(isExpanded ? null : type)}
                          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                        >
                          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          {versionHistory.length - 1} previous version{versionHistory.length > 2 ? 's' : ''}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 space-y-2">
                            {versionHistory.slice(1).map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div>
                                  <span className="text-sm text-gray-700">{doc.name}</span>
                                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                                    doc.status === 'ready' ? 'bg-gray-200 text-gray-600' :
                                    doc.status === 'failed' ? 'bg-red-100 text-red-600' :
                                    'bg-yellow-100 text-yellow-600'
                                  }`}>
                                    {doc.status}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(doc.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setExpandedDoc(isExpanded ? null : `upload-${type}`)}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Upload new version
                    </button>

                    {expandedDoc === `upload-${type}` && (
                      <div className="mt-4 space-y-4">
                        <textarea
                          value={content[type]}
                          onChange={(e) => setContent(prev => ({ ...prev, [type]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full h-48 p-4 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            {content[type].length.toLocaleString()} characters
                          </p>
                          <button
                            onClick={() => handleUpload(type)}
                            disabled={!content[type].trim() || isUploading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Upload & Extract
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-cyan-50 border border-cyan-100 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-cyan-800 mb-2">Tips for best results:</h4>
                      <ul className="space-y-1">
                        {tips.map((tip, i) => (
                          <li key={i} className="text-sm text-cyan-700 flex items-start gap-2">
                            <span className="text-cyan-400 mt-1">-</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <textarea
                      value={content[type]}
                      onChange={(e) => setContent(prev => ({ ...prev, [type]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full h-48 p-4 border border-gray-200 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {content[type].length.toLocaleString()} characters
                      </p>
                      <button
                        onClick={() => handleUpload(type)}
                        disabled={!content[type].trim() || isUploading || monthlyUsage >= limits.monthlyExtractions}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload & Extract
                          </>
                        )}
                      </button>
                    </div>

                    {monthlyUsage >= limits.monthlyExtractions && (
                      <p className="text-sm text-amber-600 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        You've used all extractions for this month. Resets on the 1st.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {previewDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{previewDoc.name}</h3>
                <p className="text-sm text-gray-500">
                  Extracted context - v{previewDoc.version}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded-lg">
                {JSON.stringify(previewDoc.extracted_context, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
