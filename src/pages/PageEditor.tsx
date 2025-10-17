import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  GripVertical,
  Type,
  Image as ImageIcon,
  Layout,
  Sparkles,
  FileText,
  CreditCard,
  Quote,
  Video,
  Grid3x3,
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  X,
} from 'lucide-react';
import BlockEditor from '../components/BlockEditor';
import type { Database } from '../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface Block {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cta' | 'features' | 'testimonial' | 'form' | 'pricing' | 'video' | 'gallery' | 'stats';
  content: Record<string, any>;
  styles?: Record<string, any>;
}

const BLOCK_TEMPLATES = {
  hero: {
    type: 'hero',
    content: {
      headline: 'Your Compelling Headline Here',
      subheadline: 'Supporting text that explains your value proposition',
      ctaText: 'Get Started',
      ctaUrl: '#',
      backgroundImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
    },
  },
  text: {
    type: 'text',
    content: {
      text: 'Add your text content here. You can write multiple paragraphs and style them as needed.',
    },
  },
  image: {
    type: 'image',
    content: {
      url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Placeholder image',
      caption: '',
    },
  },
  cta: {
    type: 'cta',
    content: {
      headline: 'Ready to Get Started?',
      description: 'Join thousands of satisfied customers today',
      buttonText: 'Sign Up Now',
      buttonUrl: '#',
    },
  },
  features: {
    type: 'features',
    content: {
      headline: 'Amazing Features',
      subheadline: 'Everything you need to succeed',
      features: [
        { title: 'Feature 1', description: 'Benefit description', icon: '🚀' },
        { title: 'Feature 2', description: 'Benefit description', icon: '⚡' },
        { title: 'Feature 3', description: 'Benefit description', icon: '🎯' },
      ],
    },
  },
  testimonial: {
    type: 'testimonial',
    content: {
      quote: 'This product changed my life! Highly recommended to anyone looking for a solution.',
      author: 'Jane Doe',
      role: 'CEO, Company Inc',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
    },
  },
  form: {
    type: 'form',
    content: {
      headline: 'Get Started Today',
      description: 'Fill out the form below and we\'ll be in touch',
      submitButtonText: 'Submit',
      successMessage: 'Thanks! We\'ll be in touch soon.',
      fields: [
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'first_name', label: 'First Name', type: 'text', required: false },
        { name: 'last_name', label: 'Last Name', type: 'text', required: false },
      ],
    },
  },
  pricing: {
    type: 'pricing',
    content: {
      headline: 'Simple, Transparent Pricing',
      subheadline: 'Choose the plan that works for you',
      plans: [
        { name: 'Starter', price: '$29', period: '/month', features: ['Feature 1', 'Feature 2', 'Feature 3'], buttonText: 'Get Started', highlighted: false },
        { name: 'Pro', price: '$79', period: '/month', features: ['Everything in Starter', 'Feature 4', 'Feature 5', 'Feature 6'], buttonText: 'Get Started', highlighted: true },
        { name: 'Enterprise', price: '$199', period: '/month', features: ['Everything in Pro', 'Feature 7', 'Feature 8', 'Priority Support'], buttonText: 'Contact Us', highlighted: false },
      ],
    },
  },
  video: {
    type: 'video',
    content: {
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      title: 'Watch Our Video',
      description: 'Learn more about what we do',
    },
  },
  gallery: {
    type: 'gallery',
    content: {
      headline: 'Gallery',
      images: [
        { url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Image 1' },
        { url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Image 2' },
        { url: 'https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Image 3' },
        { url: 'https://images.pexels.com/photos/3184294/pexels-photo-3184294.jpeg?auto=compress&cs=tinysrgb&w=600', alt: 'Image 4' },
      ],
    },
  },
  stats: {
    type: 'stats',
    content: {
      headline: 'Numbers That Matter',
      stats: [
        { value: '10K+', label: 'Happy Customers' },
        { value: '99%', label: 'Satisfaction Rate' },
        { value: '24/7', label: 'Support Available' },
        { value: '50+', label: 'Countries' },
      ],
    },
  },
};

export default function PageEditor() {
  const { funnelId, pageId } = useParams<{ funnelId: string; pageId: string }>();
  const { currentSite } = useSite();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 'medium',
  });

  useEffect(() => {
    if (!currentSite || !pageId) return;
    loadPage();
  }, [currentSite, pageId]);

  const loadPage = async () => {
    if (!currentSite || !pageId) return;

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .eq('site_id', currentSite.id)
      .maybeSingle();

    if (data) {
      setPage(data);
      const content = data.content as any;
      setBlocks(content?.blocks || []);
      if (content?.theme) {
        setTheme(content.theme);
      }
    } else {
      navigate('/funnels');
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!page) return;

    setSaving(true);

    const { error } = await supabase
      .from('pages')
      .update({
        content: { blocks, theme },
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id);

    if (!error) {
      alert('Page saved successfully!');
    }

    setSaving(false);
  };

  const addBlock = (type: keyof typeof BLOCK_TEMPLATES) => {
    const template = BLOCK_TEMPLATES[type];
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: template.type as Block['type'],
      content: { ...template.content },
      styles: {
        backgroundColor: '',
        textColor: '',
        padding: 'medium',
        alignment: 'left',
      },
    };

    setBlocks([...blocks, newBlock]);
    setShowBlockMenu(false);
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter((b) => b.id !== blockId));
  };

  const updateBlock = (blockId: string, content: Record<string, any>) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, content } : b)));
  };

  const updateBlockStyles = (blockId: string, styles: Record<string, any>) => {
    setBlocks(blocks.map((b) => (b.id === blockId ? { ...b, styles } : b)));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === blockId);
    if (index === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);
  };

  const publishPage = async () => {
    if (!page) return;

    const { error } = await supabase
      .from('pages')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', page.id);

    if (!error) {
      alert('Page published successfully!');
      loadPage();
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      default:
        return '100%';
    }
  };

  const getPaddingClass = (padding: string) => {
    switch (padding) {
      case 'none': return 'p-0';
      case 'small': return 'p-4';
      case 'medium': return 'p-8';
      case 'large': return 'p-12';
      case 'xlarge': return 'p-16';
      default: return 'p-8';
    }
  };

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/funnels/${funnelId}`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{page.title}</h1>
                <p className="text-sm text-gray-500">/{page.slug}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${
                    previewMode === 'desktop' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  title="Desktop"
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded ${
                    previewMode === 'tablet' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  title="Tablet"
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${
                    previewMode === 'mobile' ? 'bg-white shadow' : 'hover:bg-gray-200'
                  }`}
                  title="Mobile"
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => setShowThemeSettings(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Settings className="h-4 w-4" />
                <span>Theme</span>
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>

              {page.status !== 'published' && (
                <button
                  onClick={publishPage}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  <Eye className="h-4 w-4" />
                  <span>Publish</span>
                </button>
              )}

              {page.status === 'published' && (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  Published
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center py-8 px-6">
        <div style={{ width: getPreviewWidth(), maxWidth: '100%' }} className="transition-all duration-300">
          <div className="space-y-4">
            {blocks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Layout className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Start Building Your Page</h2>
                <p className="text-gray-600 mb-6">Add blocks to create your page layout</p>
                <button
                  onClick={() => setShowBlockMenu(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Your First Block
                </button>
              </div>
            ) : (
              blocks.map((block, index) => (
                <div key={block.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {block.type} Block
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                        className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                        className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() =>
                          setEditingBlockId(editingBlockId === block.id ? null : block.id)
                        }
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingBlockId === block.id ? (
                    <BlockEditor
                      block={block}
                      onUpdate={(content) => updateBlock(block.id, content)}
                      onStyleUpdate={(styles) => updateBlockStyles(block.id, styles)}
                    />
                  ) : (
                    <BlockPreview block={block} getPaddingClass={getPaddingClass} getAlignmentClass={getAlignmentClass} />
                  )}
                </div>
              ))
            )}

            <button
              onClick={() => setShowBlockMenu(true)}
              className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition text-gray-600 hover:text-blue-600 flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Add Block</span>
            </button>
          </div>
        </div>
      </div>

      {showBlockMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Choose a Block</h2>
              <button
                onClick={() => setShowBlockMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <BlockOption icon={<Sparkles />} title="Hero" description="Large header with headline and CTA" onClick={() => addBlock('hero')} />
              <BlockOption icon={<Type />} title="Text" description="Paragraph or body text content" onClick={() => addBlock('text')} />
              <BlockOption icon={<ImageIcon />} title="Image" description="Single image with optional caption" onClick={() => addBlock('image')} />
              <BlockOption icon={<Sparkles />} title="Call to Action" description="Prominent CTA section" onClick={() => addBlock('cta')} />
              <BlockOption icon={<Layout />} title="Features" description="Showcase key features or benefits" onClick={() => addBlock('features')} />
              <BlockOption icon={<Quote />} title="Testimonial" description="Customer quote or review" onClick={() => addBlock('testimonial')} />
              <BlockOption icon={<FileText />} title="Contact Form" description="Capture leads with a contact form" onClick={() => addBlock('form')} />
              <BlockOption icon={<CreditCard />} title="Pricing" description="Display pricing plans" onClick={() => addBlock('pricing')} />
              <BlockOption icon={<Video />} title="Video" description="Embed video content" onClick={() => addBlock('video')} />
              <BlockOption icon={<Grid3x3 />} title="Gallery" description="Image gallery grid" onClick={() => addBlock('gallery')} />
              <BlockOption icon={<BarChart3 />} title="Stats" description="Display key statistics" onClick={() => addBlock('stats')} />
            </div>
          </div>
        </div>
      )}

      {showThemeSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Theme Settings</h2>
              <button
                onClick={() => setShowThemeSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="h-10 w-20 rounded border border-gray-300"
                  />
                  <input
                    type="text"
                    value={theme.secondaryColor}
                    onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                <select
                  value={theme.fontFamily}
                  onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Inter, sans-serif">Inter</option>
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                <select
                  value={theme.borderRadius}
                  onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="none">None</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setShowThemeSettings(false);
                  handleSave();
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BlockOption({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
    >
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3 text-blue-600">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

function BlockPreview({ block, getPaddingClass, getAlignmentClass }: { block: Block; getPaddingClass: (p: string) => string; getAlignmentClass: (a: string) => string }) {
  const { content, styles } = block;
  const paddingClass = getPaddingClass(styles?.padding || 'medium');
  const alignmentClass = getAlignmentClass(styles?.alignment || 'left');
  const bgColor = styles?.backgroundColor || 'transparent';
  const textColor = styles?.textColor || 'inherit';

  const containerStyle = {
    backgroundColor: bgColor,
    color: textColor,
  };

  switch (block.type) {
    case 'hero':
      return (
        <div className={`${paddingClass} text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white relative`} style={{ backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4">{content.headline}</h1>
            <p className="text-xl mb-8 opacity-90">{content.subheadline}</p>
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition">
              {content.ctaText}
            </button>
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={`${paddingClass} ${alignmentClass}`} style={containerStyle}>
          <p className="text-gray-700 leading-relaxed text-lg">{content.text}</p>
        </div>
      );

    case 'image':
      return (
        <div className={`${paddingClass} ${alignmentClass}`} style={containerStyle}>
          <img src={content.url} alt={content.alt} className="w-full rounded-lg" />
          {content.caption && <p className="text-sm text-gray-600 mt-2">{content.caption}</p>}
        </div>
      );

    case 'cta':
      return (
        <div className={`${paddingClass} text-center bg-blue-50`} style={containerStyle}>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.headline}</h2>
          <p className="text-lg text-gray-600 mb-8">{content.description}</p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            {content.buttonText}
          </button>
        </div>
      );

    case 'features':
      return (
        <div className={paddingClass} style={containerStyle}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">{content.headline}</h2>
          {content.subheadline && <p className="text-gray-600 mb-8 text-center">{content.subheadline}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {content.features?.map((feature: any, i: number) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2 text-xl">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'testimonial':
      return (
        <div className={`${paddingClass} bg-gray-50`} style={containerStyle}>
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="text-2xl text-gray-700 italic mb-6">"{content.quote}"</blockquote>
            <div className="flex items-center justify-center space-x-4">
              <img src={content.avatar} alt={content.author} className="w-16 h-16 rounded-full" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">{content.author}</p>
                <p className="text-sm text-gray-600">{content.role}</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'form':
      return (
        <div className={`${paddingClass} bg-gradient-to-br from-gray-50 to-blue-50`} style={containerStyle}>
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{content.headline}</h2>
            <p className="text-gray-600 mb-6 text-center">{content.description}</p>
            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              {content.fields?.map((field: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input type={field.type} disabled placeholder={`Enter ${field.label.toLowerCase()}`} className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
              ))}
              <button disabled className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold opacity-70 cursor-not-allowed">
                {content.submitButtonText}
              </button>
            </div>
          </div>
        </div>
      );

    case 'pricing':
      return (
        <div className={paddingClass} style={containerStyle}>
          <h2 className="text-3xl font-bold text-gray-900 mb-3 text-center">{content.headline}</h2>
          <p className="text-gray-600 mb-10 text-center">{content.subheadline}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.plans?.map((plan: any, i: number) => (
              <div key={i} className={`border rounded-xl p-8 ${plan.highlighted ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'}`}>
                <h3 className="font-bold text-xl mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features?.map((feature: string, j: number) => (
                    <li key={j} className="text-gray-700">✓ {feature}</li>
                  ))}
                </ul>
                <button className={`w-full py-3 rounded-lg font-semibold ${plan.highlighted ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'video':
      return (
        <div className={`${paddingClass} ${alignmentClass}`} style={containerStyle}>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h2>
          <p className="text-gray-600 mb-6">{content.description}</p>
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe src={content.url} className="w-full h-full" allowFullScreen />
          </div>
        </div>
      );

    case 'gallery':
      return (
        <div className={paddingClass} style={containerStyle}>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{content.headline}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {content.images?.map((img: any, i: number) => (
              <img key={i} src={img.url} alt={img.alt} className="w-full h-48 object-cover rounded-lg" />
            ))}
          </div>
        </div>
      );

    case 'stats':
      return (
        <div className={`${paddingClass} bg-blue-600 text-white`} style={containerStyle}>
          <h2 className="text-3xl font-bold mb-10 text-center">{content.headline}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {content.stats?.map((stat: any, i: number) => (
              <div key={i} className="text-center">
                <p className="text-4xl font-bold mb-2">{stat.value}</p>
                <p className="text-blue-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return <div className="p-6 text-gray-500">Unknown block type</div>;
  }
}
