import { useState, useEffect } from 'react';
import { X, Sparkles, Search, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail_url: string | null;
  blocks: any[];
  theme: any;
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
    { id: 'coming_soon', label: 'Coming Soon' },
    { id: 'about', label: 'About' },
    { id: 'portfolio', label: 'Portfolio' },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-blue-600" />
                <span>Choose a Template</span>
              </h2>
              <p className="text-gray-600 mt-1">Start with a professional design or build from scratch</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <button
                  onClick={() => onSelect(null)}
                  className="group border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 hover:bg-blue-50 transition text-center"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition">
                    <Sparkles className="h-8 w-8 text-gray-400 group-hover:text-blue-600 transition" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start from Scratch</h3>
                  <p className="text-sm text-gray-600">Build your own custom page</p>
                </button>

                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onSelect(template)}
                    className="group border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition text-left"
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                      {template.thumbnail_url ? (
                        <img
                          src={template.thumbnail_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Sparkles className="h-12 w-12 text-blue-400" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-10 transition flex items-center justify-center">
                        <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transition transform scale-75 group-hover:scale-100">
                          <ArrowRight className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loading && filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No templates found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
