import { useState } from 'react';
import {
  X,
  Search,
  Type,
  Image as ImageIcon,
  Layout,
  Sparkles,
  FileText,
  CreditCard,
  Quote,
  Video,
  Grid3x3,
  BarChart3,
  Mail,
  Users,
} from 'lucide-react';

interface BlockType {
  type: string;
  label: string;
  description: string;
  icon: any;
  category: string;
}

interface EnhancedBlockLibraryProps {
  onAddBlock: (type: string) => void;
  onClose: () => void;
  recentBlocks?: string[];
}

const blockTypes: BlockType[] = [
  { type: 'hero', label: 'Hero Section', description: 'Large header with call-to-action', icon: Sparkles, category: 'Layout' },
  { type: 'text', label: 'Text Block', description: 'Paragraph or rich text content', icon: Type, category: 'Content' },
  { type: 'heading', label: 'Heading', description: 'Section title or heading', icon: FileText, category: 'Content' },
  { type: 'image', label: 'Image', description: 'Single image with caption', icon: ImageIcon, category: 'Media' },
  { type: 'video', label: 'Video', description: 'Embedded video player', icon: Video, category: 'Media' },
  { type: 'features', label: 'Features Grid', description: 'Showcase multiple features', icon: Grid3x3, category: 'Layout' },
  { type: 'testimonial', label: 'Testimonial', description: 'Customer quote with photo', icon: Quote, category: 'Social' },
  { type: 'cta', label: 'Call to Action', description: 'Prominent action button', icon: Sparkles, category: 'Layout' },
  { type: 'pricing', label: 'Pricing Table', description: 'Compare pricing tiers', icon: CreditCard, category: 'Commerce' },
  { type: 'stats', label: 'Statistics', description: 'Display key numbers', icon: BarChart3, category: 'Content' },
  { type: 'form', label: 'Form', description: 'Contact or lead capture form', icon: Mail, category: 'Interactive' },
  { type: 'team', label: 'Team Members', description: 'Staff profiles grid', icon: Users, category: 'Social' },
  { type: 'gallery', label: 'Image Gallery', description: 'Multiple images grid', icon: Layout, category: 'Media' },
  { type: 'spacer', label: 'Spacer', description: 'Add vertical space', icon: Layout, category: 'Layout' },
];

const categories = [
  { id: 'all', label: 'All Blocks', icon: Layout },
  { id: 'Layout', label: 'Layout', icon: Layout },
  { id: 'Content', label: 'Content', icon: Type },
  { id: 'Media', label: 'Media', icon: ImageIcon },
  { id: 'Social', label: 'Social', icon: Users },
  { id: 'Commerce', label: 'Commerce', icon: CreditCard },
  { id: 'Interactive', label: 'Interactive', icon: Sparkles },
];

export default function EnhancedBlockLibrary({
  onAddBlock,
  onClose,
  recentBlocks = [],
}: EnhancedBlockLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredBlocks = blockTypes.filter((block) => {
    const matchesSearch =
      block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || block.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const recentBlockTypes = blockTypes.filter((block) => recentBlocks.includes(block.type));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add Block</h2>
              <p className="text-gray-600 mt-1">Choose a block to add to your page</p>
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
              placeholder="Search blocks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition flex items-center space-x-2 ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {recentBlockTypes.length > 0 && selectedCategory === 'all' && !searchTerm && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Recently Used</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {recentBlockTypes.map((block) => {
                    const Icon = block.icon;
                    return (
                      <button
                        key={block.type}
                        onClick={() => {
                          onAddBlock(block.type);
                          onClose();
                        }}
                        className="group p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition text-left"
                      >
                        <Icon className="h-6 w-6 text-blue-600 mb-2" />
                        <div className="text-sm font-medium text-gray-900">{block.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{block.description}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              {recentBlockTypes.length > 0 && selectedCategory === 'all' && !searchTerm && (
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">All Blocks</h3>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredBlocks.map((block) => {
                  const Icon = block.icon;
                  return (
                    <button
                      key={block.type}
                      onClick={() => {
                        onAddBlock(block.type);
                        onClose();
                      }}
                      className="group p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-md transition text-left"
                    >
                      <Icon className="h-6 w-6 text-blue-600 mb-2" />
                      <div className="text-sm font-medium text-gray-900">{block.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{block.description}</div>
                    </button>
                  );
                })}
              </div>

              {filteredBlocks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600">No blocks found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
