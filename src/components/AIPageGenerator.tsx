import { useState } from 'react';
import { X, Wand2, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AIPageGeneratorProps {
  onGenerate: (blocks: any[], theme: any) => void;
  onClose: () => void;
  siteId: string;
}

interface GenerationParams {
  industry: string;
  purpose: string;
  tone: string;
  targetAudience: string;
  keyFeatures: string;
}

export default function AIPageGenerator({ onGenerate, onClose, siteId }: AIPageGeneratorProps) {
  const [params, setParams] = useState<GenerationParams>({
    industry: '',
    purpose: 'landing',
    tone: 'professional',
    targetAudience: '',
    keyFeatures: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ blocks: any[]; theme: any } | null>(null);

  const purposes = [
    { id: 'landing', label: 'Landing Page', desc: 'Convert visitors into customers' },
    { id: 'sales', label: 'Sales Page', desc: 'Sell a product or service' },
    { id: 'lead_magnet', label: 'Lead Magnet', desc: 'Capture email addresses' },
    { id: 'webinar', label: 'Webinar Registration', desc: 'Get webinar signups' },
    { id: 'course', label: 'Course Landing', desc: 'Promote an online course' },
    { id: 'portfolio', label: 'Portfolio', desc: 'Showcase your work' },
  ];

  const tones = [
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'friendly', label: 'Friendly', icon: '😊' },
    { id: 'energetic', label: 'Energetic', icon: '⚡' },
    { id: 'luxury', label: 'Luxury', icon: '💎' },
    { id: 'playful', label: 'Playful', icon: '🎨' },
    { id: 'minimal', label: 'Minimal', icon: '◽' },
  ];

  const handleGenerate = async () => {
    if (!params.industry || !params.targetAudience) {
      setError('Please fill in at least industry and target audience');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-visual-theme`;

      const themeResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          industry: params.industry,
          mood: params.tone,
          style: params.purpose,
        }),
      });

      const themeData = await themeResponse.json();

      if (!themeResponse.ok) {
        throw new Error(themeData.error || 'Failed to generate theme');
      }

      const contentResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generate-text`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `Create a complete ${params.purpose} page for a ${params.industry} business.
                    Target audience: ${params.targetAudience}
                    Tone: ${params.tone}
                    Key features: ${params.keyFeatures}

                    Generate:
                    1. Compelling hero headline (8-10 words)
                    2. Hero subheadline (15-20 words)
                    3. Three main features with titles and descriptions
                    4. Social proof testimonial quote
                    5. CTA headline and button text

                    Format as JSON with keys: heroHeadline, heroSubheadline, features (array), testimonialQuote, ctaHeadline, ctaButton`,
            type: 'structured',
            site_id: siteId,
          }),
        }
      );

      const contentData = await contentResponse.json();

      if (!contentResponse.ok) {
        throw new Error(contentData.error || 'Failed to generate content');
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(contentData.text);
      } catch {
        throw new Error('Failed to parse AI response');
      }

      const blocks = [
        {
          id: `hero-${Date.now()}`,
          type: 'hero',
          content: {
            headline: parsedContent.heroHeadline,
            subheadline: parsedContent.heroSubheadline,
            ctaText: parsedContent.ctaButton || 'Get Started',
            ctaUrl: '#',
            backgroundImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
          },
          styles: {
            backgroundColor: themeData.theme.primaryColor,
            gradient: themeData.theme.gradient,
          },
        },
        {
          id: `features-${Date.now()}`,
          type: 'features',
          content: {
            headline: 'Why Choose Us',
            subheadline: 'Everything you need to succeed',
            features: parsedContent.features?.slice(0, 3).map((f: any, i: number) => ({
              title: f.title || `Feature ${i + 1}`,
              description: f.description || f.desc || 'Benefit description',
              icon: ['🚀', '⚡', '🎯'][i],
            })) || [],
          },
        },
        {
          id: `testimonial-${Date.now()}`,
          type: 'testimonial',
          content: {
            quote: parsedContent.testimonialQuote || 'This product changed my business!',
            author: 'Happy Customer',
            role: params.targetAudience,
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
          },
        },
        {
          id: `cta-${Date.now()}`,
          type: 'cta',
          content: {
            headline: parsedContent.ctaHeadline || 'Ready to Get Started?',
            description: `Join ${params.targetAudience.toLowerCase()} who are already succeeding`,
            buttonText: parsedContent.ctaButton || 'Start Free Trial',
            buttonUrl: '#',
          },
          styles: {
            backgroundColor: themeData.theme.secondaryColor,
          },
        },
      ];

      setPreview({ blocks, theme: themeData.theme });
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'Failed to generate page');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (preview) {
      onGenerate(preview.blocks, preview.theme);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Page Generator</h2>
              <p className="text-sm text-gray-600">Let AI create a custom page for your brand</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!preview ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry / Business Type *
                  </label>
                  <input
                    type="text"
                    value={params.industry}
                    onChange={(e) => setParams({ ...params, industry: e.target.value })}
                    placeholder="e.g., Fitness, SaaS, E-commerce"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Audience *
                  </label>
                  <input
                    type="text"
                    value={params.targetAudience}
                    onChange={(e) => setParams({ ...params, targetAudience: e.target.value })}
                    placeholder="e.g., Busy professionals, Small business owners"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Page Purpose
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {purposes.map((purpose) => (
                    <button
                      key={purpose.id}
                      onClick={() => setParams({ ...params, purpose: purpose.id })}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        params.purpose === purpose.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      disabled={loading}
                    >
                      <div className="font-semibold text-gray-900 mb-1">{purpose.label}</div>
                      <div className="text-xs text-gray-600">{purpose.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tone & Style
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {tones.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setParams({ ...params, tone: tone.id })}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        params.tone === tone.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                      disabled={loading}
                    >
                      <div className="text-2xl mb-1">{tone.icon}</div>
                      <div className="text-xs font-medium text-gray-700">{tone.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Key Features / Benefits (Optional)
                </label>
                <textarea
                  value={params.keyFeatures}
                  onChange={(e) => setParams({ ...params, keyFeatures: e.target.value })}
                  placeholder="List 3-5 key features or benefits you want to highlight..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-700">
                    <strong>AI will generate:</strong> Complete page layout with hero section, features,
                    testimonials, and CTA. Plus a custom color theme matching your brand.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Preview Your AI-Generated Page</h3>
                  <p className="text-sm text-gray-600">
                    {preview.blocks.length} blocks created • Custom theme applied
                  </p>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Generate Different Version
                </button>
              </div>

              <div className="border-2 border-purple-200 rounded-lg p-4 bg-gradient-to-br from-white to-purple-50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-sm font-semibold text-gray-700">Theme Colors:</div>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                      style={{ backgroundColor: preview.theme.primaryColor }}
                      title="Primary"
                    />
                    {preview.theme.secondaryColor && (
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                        style={{ backgroundColor: preview.theme.secondaryColor }}
                        title="Secondary"
                      />
                    )}
                    {preview.theme.accentColor && (
                      <div
                        className="w-8 h-8 rounded-lg shadow-sm border-2 border-white"
                        style={{ backgroundColor: preview.theme.accentColor }}
                        title="Accent"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {preview.blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                          {block.type}
                        </span>
                        <span className="text-xs text-gray-400">Block {index + 1}</span>
                      </div>
                      {block.type === 'hero' && (
                        <div>
                          <p className="font-bold text-gray-900 text-lg mb-1">{block.content.headline}</p>
                          <p className="text-sm text-gray-600">{block.content.subheadline}</p>
                          <button className="mt-2 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg">
                            {block.content.ctaText}
                          </button>
                        </div>
                      )}
                      {block.type === 'features' && (
                        <div>
                          <p className="font-semibold text-gray-900 mb-2">{block.content.headline}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {block.content.features.map((feature: any, idx: number) => (
                              <div key={idx} className="text-xs">
                                <div className="text-lg mb-1">{feature.icon}</div>
                                <div className="font-semibold text-gray-800">{feature.title}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {block.type === 'testimonial' && (
                        <div>
                          <p className="text-sm text-gray-700 italic mb-2">"{block.content.quote}"</p>
                          <p className="text-xs text-gray-600">— {block.content.author}</p>
                        </div>
                      )}
                      {block.type === 'cta' && (
                        <div>
                          <p className="font-bold text-gray-900 mb-1">{block.content.headline}</p>
                          <p className="text-sm text-gray-600">{block.content.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
          {!preview ? (
            <>
              <p className="text-sm text-gray-600">
                * Required fields • Takes 10-15 seconds to generate
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading || !params.industry || !params.targetAudience}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center space-x-2 font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      <span>Generate Page</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                You can customize all content and styling after adding to your page
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setPreview(null)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-8 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2 font-semibold"
                >
                  <span>Use This Page</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
