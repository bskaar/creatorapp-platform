import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Copy,
} from 'lucide-react';

interface GlobalSection {
  id: string;
  name: string;
  description: string | null;
  section_type: string;
  content: any;
  styles: any;
  is_active: boolean;
  usage_count: number;
  created_at: string;
}

interface GlobalSectionManagerProps {
  onSelect?: (sectionId: string) => void;
  onClose: () => void;
  mode?: 'browse' | 'manage';
}

const SECTION_TYPES = [
  { value: 'header', label: 'Header', description: 'Site-wide navigation header' },
  { value: 'footer', label: 'Footer', description: 'Site-wide footer content' },
  { value: 'announcement', label: 'Announcement', description: 'Promotional banner' },
  { value: 'newsletter', label: 'Newsletter', description: 'Email signup form' },
  { value: 'sidebar', label: 'Sidebar', description: 'Sidebar content' },
  { value: 'custom', label: 'Custom', description: 'Custom reusable section' },
];

export default function GlobalSectionManager({
  onSelect,
  onClose,
  mode = 'browse'
}: GlobalSectionManagerProps) {
  const { currentSite } = useSite();
  const [sections, setSections] = useState<GlobalSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSection, setEditingSection] = useState<GlobalSection | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (currentSite) {
      loadSections();
    }
  }, [currentSite]);

  const loadSections = async () => {
    if (!currentSite) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('global_sections')
      .select('*')
      .eq('site_id', currentSite.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSections(data);
    }
    setLoading(false);
  };

  const handleToggleActive = async (section: GlobalSection) => {
    const { error } = await supabase
      .from('global_sections')
      .update({ is_active: !section.is_active })
      .eq('id', section.id);

    if (!error) {
      setSections(sections.map(s =>
        s.id === section.id ? { ...s, is_active: !s.is_active } : s
      ));
    }
  };

  const handleDelete = async (section: GlobalSection) => {
    if (!confirm(`Are you sure you want to delete "${section.name}"? This will remove it from all ${section.usage_count} pages using it.`)) {
      return;
    }

    const { error } = await supabase
      .from('global_sections')
      .delete()
      .eq('id', section.id);

    if (!error) {
      setSections(sections.filter(s => s.id !== section.id));
    }
  };

  const filteredSections = filterType === 'all'
    ? sections
    : sections.filter(s => s.section_type === filterType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Global Sections</h2>
            <span className="text-sm text-gray-500">({filteredSections.length} sections)</span>
          </div>
          <div className="flex items-center gap-2">
            {mode === 'manage' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                New Section
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Types
            </button>
            {SECTION_TYPES.map(type => (
              <button
                key={type.value}
                onClick={() => setFilterType(type.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading global sections...</div>
            </div>
          ) : filteredSections.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {filterType === 'all' ? 'No global sections yet' : `No ${filterType} sections`}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Create reusable sections like headers and footers
              </p>
              {mode === 'manage' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Create Your First Section
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSections.map(section => (
                <div
                  key={section.id}
                  className={`border rounded-lg p-4 transition-all ${
                    section.is_active
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{section.name}</h3>
                        {!section.is_active && (
                          <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                        {section.section_type}
                      </span>
                    </div>
                  </div>

                  {section.description && (
                    <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Used on {section.usage_count} pages</span>
                    <span>{new Date(section.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {onSelect && (
                      <button
                        onClick={() => {
                          onSelect(section.id);
                          onClose();
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Add to Page
                      </button>
                    )}
                    {mode === 'manage' && (
                      <>
                        <button
                          onClick={() => handleToggleActive(section)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title={section.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {section.is_active ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingSection(section)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                          title="Edit section"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(section)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete section"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Global sections are reusable content blocks that appear across multiple pages.
            When you update a global section, it updates everywhere it's used.
          </p>
        </div>
      </div>

      {showCreateModal && (
        <CreateSectionModal
          onClose={() => setShowCreateModal(false)}
          onSave={() => {
            setShowCreateModal(false);
            loadSections();
          }}
        />
      )}
    </div>
  );
}

interface CreateSectionModalProps {
  onClose: () => void;
  onSave: () => void;
}

function CreateSectionModal({ onClose, onSave }: CreateSectionModalProps) {
  const { currentSite } = useSite();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [sectionType, setSectionType] = useState('custom');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this section');
      return;
    }

    if (!currentSite) {
      setError('No site selected');
      return;
    }

    setSaving(true);
    setError('');

    const { error: saveError } = await supabase
      .from('global_sections')
      .insert({
        site_id: currentSite.id,
        name: name.trim(),
        description: description.trim() || null,
        section_type: sectionType,
        content: { blocks: [] },
        styles: {},
        is_active: true,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

    setSaving(false);

    if (saveError) {
      setError('Failed to create section. Please try again.');
      console.error('Error creating section:', saveError);
      return;
    }

    onSave();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Global Section</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Main Navigation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Section Type
            </label>
            <select
              value={sectionType}
              onChange={(e) => setSectionType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SECTION_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Describe this section's purpose"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              After creating the section, you'll be able to add content blocks and styling.
              Use the page editor to design your section.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Creating...' : 'Create Section'}
          </button>
        </div>
      </div>
    </div>
  );
}
