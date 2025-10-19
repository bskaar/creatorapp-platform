import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSite } from '../contexts/SiteContext';
import {
  BookmarkCheck,
  Search,
  Star,
  Trash2,
  X,
  Filter,
  TrendingUp,
  Calendar,
  Tag as TagIcon,
} from 'lucide-react';

interface CustomBlock {
  id: string;
  name: string;
  description: string | null;
  category: string;
  block_data: any;
  thumbnail_url: string | null;
  usage_count: number;
  is_favorite: boolean;
  created_by: string | null;
  created_at: string;
  tags: string[];
}

interface CustomBlocksLibraryProps {
  onSelect: (blockData: any) => void;
  onClose: () => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Blocks' },
  { value: 'hero', label: 'Hero' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'cta', label: 'CTA' },
  { value: 'features', label: 'Features' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'form', label: 'Form' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'video', label: 'Video' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'stats', label: 'Stats' },
  { value: 'custom', label: 'Custom' },
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Recently Added', icon: Calendar },
  { value: 'popular', label: 'Most Used', icon: TrendingUp },
  { value: 'favorites', label: 'Favorites', icon: Star },
];

export default function CustomBlocksLibrary({ onSelect, onClose }: CustomBlocksLibraryProps) {
  const { currentSite } = useSite();
  const [blocks, setBlocks] = useState<CustomBlock[]>([]);
  const [filteredBlocks, setFilteredBlocks] = useState<CustomBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    if (currentSite) {
      loadBlocks();
    }
  }, [currentSite]);

  useEffect(() => {
    filterAndSortBlocks();
  }, [blocks, searchQuery, selectedCategory, sortBy, showFavoritesOnly]);

  const loadBlocks = async () => {
    if (!currentSite) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('custom_blocks')
      .select('*')
      .eq('site_id', currentSite.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBlocks(data);
    }
    setLoading(false);
  };

  const filterAndSortBlocks = () => {
    let filtered = [...blocks];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        block =>
          block.name.toLowerCase().includes(query) ||
          block.description?.toLowerCase().includes(query) ||
          block.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(block => block.category === selectedCategory);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter(block => block.is_favorite);
    }

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.usage_count - a.usage_count);
        break;
      case 'favorites':
        filtered.sort((a, b) => {
          if (a.is_favorite === b.is_favorite) return 0;
          return a.is_favorite ? -1 : 1;
        });
        break;
      case 'recent':
      default:
        filtered.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    setFilteredBlocks(filtered);
  };

  const handleSelectBlock = async (block: CustomBlock) => {
    await supabase.rpc('increment_block_usage', { block_id: block.id });

    onSelect({
      type: block.block_data.type,
      content: block.block_data.content,
      styles: block.block_data.styles,
    });
    onClose();
  };

  const handleToggleFavorite = async (block: CustomBlock) => {
    const { error } = await supabase
      .from('custom_blocks')
      .update({ is_favorite: !block.is_favorite })
      .eq('id', block.id);

    if (!error) {
      setBlocks(blocks.map(b =>
        b.id === block.id ? { ...b, is_favorite: !b.is_favorite } : b
      ));
    }
  };

  const handleDeleteBlock = async (block: CustomBlock) => {
    if (!confirm(`Are you sure you want to delete "${block.name}"?`)) {
      return;
    }

    const { error } = await supabase
      .from('custom_blocks')
      .delete()
      .eq('id', block.id);

    if (!error) {
      setBlocks(blocks.filter(b => b.id !== block.id));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Custom Blocks Library</h2>
            <span className="text-sm text-gray-500">({filteredBlocks.length} blocks)</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-gray-200 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, description, or tags..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                showFavoritesOnly
                  ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
              Favorites
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Sort by:</span>
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                  sortBy === option.value
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <option.icon className="w-3.5 h-3.5" />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading custom blocks...</div>
            </div>
          ) : filteredBlocks.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {blocks.length === 0 ? 'No custom blocks yet' : 'No blocks found'}
              </p>
              <p className="text-sm text-gray-400">
                {blocks.length === 0
                  ? 'Save blocks from the editor to build your library'
                  : 'Try adjusting your search or filters'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map(block => (
                <div
                  key={block.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 hover:shadow-md transition-all bg-white"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {block.name}
                        </h3>
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded mt-1">
                          {block.category}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(block);
                        }}
                        className={`ml-2 transition-colors ${
                          block.is_favorite ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${block.is_favorite ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {block.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {block.description}
                      </p>
                    )}

                    {block.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {block.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                          >
                            <TagIcon className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {block.tags.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-gray-500">
                            +{block.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Used {block.usage_count} times</span>
                      <span>{new Date(block.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSelectBlock(block)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Use Block
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Save frequently used blocks to quickly reuse them across your pages.
            Use the save icon next to any block in the editor to add it here.
          </p>
        </div>
      </div>
    </div>
  );
}
