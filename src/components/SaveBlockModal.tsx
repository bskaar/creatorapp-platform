import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Save, X, Tag, Star } from 'lucide-react';
import { useSite } from '../contexts/SiteContext';

interface SaveBlockModalProps {
  block: any;
  onSave: () => void;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'text', label: 'Text Content' },
  { value: 'image', label: 'Image' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'features', label: 'Features' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'form', label: 'Form' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'video', label: 'Video' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'stats', label: 'Statistics' },
  { value: 'custom', label: 'Custom' },
];

export default function SaveBlockModal({ block, onSave, onClose }: SaveBlockModalProps) {
  const { currentSite } = useSite();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(block.type || 'custom');
  const [tags, setTags] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this block');
      return;
    }

    if (!currentSite) {
      setError('No site selected');
      return;
    }

    setSaving(true);
    setError('');

    const tagArray = tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const { error: saveError } = await supabase
      .from('custom_blocks')
      .insert({
        site_id: currentSite.id,
        name: name.trim(),
        description: description.trim() || null,
        category,
        block_data: {
          type: block.type,
          content: block.content,
          styles: block.styles || {},
        },
        tags: tagArray,
        is_favorite: isFavorite,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

    setSaving(false);

    if (saveError) {
      setError('Failed to save block. Please try again.');
      console.error('Error saving block:', saveError);
      return;
    }

    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Save className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Save Custom Block</h2>
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
              Block Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Product Hero Section"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional: Describe when to use this block"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., landing page, conversion, hero"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate tags with commas for easier searching
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center gap-2 transition-colors ${
                isFavorite ? 'text-yellow-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-gray-900">Mark as Favorite</p>
              <p className="text-xs text-gray-500">Quick access to frequently used blocks</p>
            </div>
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
            {saving ? 'Saving...' : 'Save Block'}
          </button>
        </div>
      </div>
    </div>
  );
}
