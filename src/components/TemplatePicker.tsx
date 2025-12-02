import { useState, useEffect } from 'react';
import { X, Sparkles, Search, ArrowRight, Wand2, Palette } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  blocks: any[];
  theme: {
    name?: string;
    primaryColor: string;
    secondaryColor?: string;
    accentColor?: string;
    gradient?: string;
    style?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
}

interface TemplatePickerProps {
  onSelect: (template: Template | null) => void;
  onClose: () => void;
}

export default function TemplatePicker({ onSelect, onClose }: TemplatePickerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('page_templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (data) {
      setTemplates(data);
    }
    setLoading(false);
  };

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'landing', label: 'Landing Pages' },
    { id: 'sales', label: 'Sales Pages' },
    { id: 'course', label: 'Course Pages' },
    { id: 'webinar', label: 'Webinars' },
    { id: 'lead_magnet', label: 'Lead Magnets' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'about', label: 'About' },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (template.theme.name && template.theme.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStyleBadge = (style?: string) => {
    const badges: Record<string, { label: string; color: string }> = {
      modern: { label: 'Modern', color: 'bg-blue-100 text-blue-700' },
      creative: { label: 'Creative', color: 'bg-pink-100 text-pink-700' },
      minimal: { label: 'Minimal', color: 'bg-gray-100 text-gray-700' },
      warm: { label: 'Warm', color: 'bg-orange-100 text-orange-700' },
      corporate: { label: 'Corporate', color: 'bg-indigo-100 text-indigo-700' },
      energetic: { label: 'Energetic', color: 'bg-red-100 text-red-700' },
      luxury: { label: 'Luxury', color: 'bg-yellow-100 text-yellow-800' },
      eco: { label: 'Eco', color: 'bg-green-100 text-green-700' },
    };

    const badge = style ? badges[style] : null;
    return badge ? (
      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    ) : null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-card max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-8 border-b border-border bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-dark flex items-center gap-3 mb-2">
                <Sparkles className="h-8 w-8 text-primary" />
                Choose Your Template
              </h2>
              <p className="text-text-secondary text-lg font-medium">Start with a professionally designed theme or create with AI</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-text-secondary" />
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates by name, style, or theme..."
                className="w-full pl-12 pr-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium"
              />
            </div>
            <button
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
            >
              <Wand2 className="h-5 w-5" />
              AI Generate
            </button>
          </div>

          {showAIGenerator && (
            <div className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-lg shadow-light">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-dark mb-2">AI Style Generator</h3>
                  <p className="text-sm text-text-secondary font-medium mb-4">
                    Let AI create a custom visual theme based on your brand and industry.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your industry (e.g., fitness, tech)"
                      className="px-4 py-2 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary font-medium"
                    />
                    <input
                      type="text"
                      placeholder="Mood (e.g., energetic, professional)"
                      className="px-4 py-2 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary font-medium"
                    />
                  </div>
                  <button className="mt-3 px-6 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all text-sm">
                    Generate Custom Theme
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-56 border-r border-border bg-gradient-to-b from-slate-50 to-white p-6 overflow-y-auto">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-light'
                      : 'text-text-secondary hover:bg-white hover:shadow-light'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-text-secondary font-medium">Loading templates...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                  onClick={() => onSelect(null)}
                  className="group border-2 border-dashed border-border rounded-card p-8 hover:border-primary hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all text-center"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-blue-100 group-hover:to-purple-100 transition-all shadow-light">
                    <Sparkles className="h-10 w-10 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-bold text-dark mb-2 text-lg">Start from Scratch</h3>
                  <p className="text-sm text-text-secondary font-medium">Build your own custom page with our drag & drop editor</p>
                </button>

                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className="group border-2 border-border rounded-card overflow-hidden hover:border-primary hover:shadow-2xl transition-all duration-300 text-left bg-white"
                  >
                    <div
                      className="aspect-video relative overflow-hidden"
                      style={{
                        background: template.theme.gradient || `linear-gradient(135deg, ${template.theme.primaryColor} 0%, ${template.theme.secondaryColor || template.theme.primaryColor} 100%)`
                      }}
                    >
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-white p-6">
                          <Palette className="h-16 w-16 mb-4 opacity-80" />
                          <div className="flex gap-2 mb-3">
                            <div
                              className="w-8 h-8 rounded-full shadow-lg border-2 border-white"
                              style={{ backgroundColor: template.theme.primaryColor }}
                            />
                            {template.theme.secondaryColor && (
                              <div
                                className="w-8 h-8 rounded-full shadow-lg border-2 border-white"
                                style={{ backgroundColor: template.theme.secondaryColor }}
                              />
                            )}
                            {template.theme.accentColor && (
                              <div
                                className="w-8 h-8 rounded-full shadow-lg border-2 border-white"
                                style={{ backgroundColor: template.theme.accentColor }}
                              />
                            )}
                          </div>
                          <p className="text-sm font-semibold opacity-90">{template.theme.name || 'Custom Theme'}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform">
                          <ArrowRight className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-dark text-lg">{template.name}</h3>
                        {getStyleBadge(template.theme.style)}
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2 font-medium mb-3">{template.description}</p>
                      <div className="flex gap-2 items-center">
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200"
                          style={{ backgroundColor: template.theme.primaryColor }}
                        />
                        <span className="text-xs text-text-secondary font-medium">{template.theme.fontFamily?.split(',')[0] || 'System Font'}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && filteredTemplates.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-dark mb-2">No templates found</h3>
                <p className="text-text-secondary font-medium">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
