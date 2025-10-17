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
} from 'lucide-react';
import type { Database } from '../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface Block {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cta' | 'features' | 'testimonial' | 'form';
  content: Record<string, any>;
}

const BLOCK_TEMPLATES = {
  hero: {
    type: 'hero',
    content: {
      headline: 'Your Compelling Headline Here',
      subheadline: 'Supporting text that explains your value proposition',
      ctaText: 'Get Started',
      ctaUrl: '#',
    },
  },
  text: {
    type: 'text',
    content: {
      text: 'Add your text content here.',
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
      features: [
        { title: 'Feature 1', description: 'Benefit description' },
        { title: 'Feature 2', description: 'Benefit description' },
        { title: 'Feature 3', description: 'Benefit description' },
      ],
    },
  },
  testimonial: {
    type: 'testimonial',
    content: {
      quote: 'This product changed my life! Highly recommended.',
      author: 'Jane Doe',
      role: 'CEO, Company',
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
        content: { blocks },
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

      <div className="max-w-4xl mx-auto px-6 py-8">
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
                  <BlockEditor block={block} onUpdate={(content) => updateBlock(block.id, content)} />
                ) : (
                  <BlockPreview block={block} pageId={page.id} />
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

      {showBlockMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose a Block</h2>

            <div className="grid grid-cols-2 gap-4">
              <BlockOption
                icon={<Sparkles />}
                title="Hero"
                description="Large header with headline and CTA"
                onClick={() => addBlock('hero')}
              />
              <BlockOption
                icon={<Type />}
                title="Text"
                description="Paragraph or body text content"
                onClick={() => addBlock('text')}
              />
              <BlockOption
                icon={<ImageIcon />}
                title="Image"
                description="Single image with optional caption"
                onClick={() => addBlock('image')}
              />
              <BlockOption
                icon={<Sparkles />}
                title="Call to Action"
                description="Prominent CTA section"
                onClick={() => addBlock('cta')}
              />
              <BlockOption
                icon={<Layout />}
                title="Features"
                description="Showcase key features or benefits"
                onClick={() => addBlock('features')}
              />
              <BlockOption
                icon={<Type />}
                title="Testimonial"
                description="Customer quote or review"
                onClick={() => addBlock('testimonial')}
              />
              <BlockOption
                icon={<FileText />}
                title="Contact Form"
                description="Capture leads with a contact form"
                onClick={() => addBlock('form')}
              />
            </div>

            <button
              onClick={() => setShowBlockMenu(false)}
              className="w-full mt-6 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
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

function BlockEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (content: Record<string, any>) => void;
}) {
  const [content, setContent] = useState(block.content);

  const handleChange = (key: string, value: any) => {
    const updated = { ...content, [key]: value };
    setContent(updated);
    onUpdate(updated);
  };

  return (
    <div className="p-6 space-y-4">
      {Object.entries(content).map(([key, value]) => {
        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {key}
              </label>
              <p className="text-sm text-gray-500">List editing (simplified for demo)</p>
            </div>
          );
        }

        return (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      })}
    </div>
  );
}

function BlockPreview({ block, pageId }: { block: Block; pageId: string }) {
  const { content } = block;

  switch (block.type) {
    case 'hero':
      return (
        <div className="p-12 text-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <h1 className="text-4xl font-bold mb-4">{content.headline}</h1>
          <p className="text-xl mb-8 opacity-90">{content.subheadline}</p>
          <button className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold">
            {content.ctaText}
          </button>
        </div>
      );

    case 'text':
      return (
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed">{content.text}</p>
        </div>
      );

    case 'image':
      return (
        <div className="p-6">
          <img src={content.url} alt={content.alt} className="w-full rounded-lg" />
          {content.caption && (
            <p className="text-sm text-gray-600 mt-2 text-center">{content.caption}</p>
          )}
        </div>
      );

    case 'cta':
      return (
        <div className="p-12 text-center bg-blue-50">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.headline}</h2>
          <p className="text-lg text-gray-600 mb-8">{content.description}</p>
          <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold">
            {content.buttonText}
          </button>
        </div>
      );

    case 'features':
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{content.headline}</h2>
          <div className="grid grid-cols-3 gap-6">
            {content.features?.map((feature: any, i: number) => (
              <div key={i} className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'testimonial':
      return (
        <div className="p-8 bg-gray-50">
          <blockquote className="text-lg text-gray-700 italic mb-4">"{content.quote}"</blockquote>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div>
              <p className="font-semibold text-gray-900">{content.author}</p>
              <p className="text-sm text-gray-600">{content.role}</p>
            </div>
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{content.headline}</h2>
            <p className="text-gray-600 mb-6 text-center">{content.description}</p>

            <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
              {content.fields?.map((field: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    disabled
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
              ))}
              <button
                disabled
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold opacity-70 cursor-not-allowed"
              >
                {content.submitButtonText}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Preview only - Form will be functional on published page
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return <div className="p-6 text-gray-500">Unknown block type</div>;
  }
}
