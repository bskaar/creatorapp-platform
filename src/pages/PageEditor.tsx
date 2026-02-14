import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Upload,
  GripVertical,
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
  Monitor,
  Tablet,
  Smartphone,
  Settings,
  X,
  BarChart3,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  Layers,
  Trash2,
  Copy,
  Eye as EyeIcon,
  EyeOff,
  Lock,
  Unlock,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Undo,
  Redo,
  Palette,
  MousePointer2,
  Box,
} from 'lucide-react';
import BlockEditor from '../components/BlockEditor';
import { BlockRenderer } from '../components/publicSite/BlockRenderer';
import TemplatePicker from '../components/TemplatePicker';
import EnhancedBlockLibrary from '../components/EnhancedBlockLibrary';
import AIColorPalette from '../components/AIColorPalette';
import PageVersionHistory from '../components/PageVersionHistory';
import SaveBlockModal from '../components/SaveBlockModal';
import CustomBlocksLibrary from '../components/CustomBlocksLibrary';
import ImportPageModal from '../components/ImportPageModal';
import type { Database } from '../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface Block {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cta' | 'features' | 'testimonial' | 'form' | 'pricing' | 'video' | 'gallery' | 'stats';
  content: Record<string, any>;
  styles?: Record<string, any>;
  locked?: boolean;
  hidden?: boolean;
  name?: string;
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
  const canvasRef = useRef<HTMLDivElement>(null);

  // State
  const [page, setPage] = useState<Page | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showSaveBlockModal, setShowSaveBlockModal] = useState(false);
  const [showCustomBlocksLibrary, setShowCustomBlocksLibrary] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [blockToSave, setBlockToSave] = useState<Block | null>(null);
  const [seoData, setSeoData] = useState({
    seo_title: '',
    seo_description: '',
    seo_image_url: '',
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<string[]>([]);
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 'medium',
  });

  // UI State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [tool, setTool] = useState<'select' | 'hand'>('select');
  const [history, setHistory] = useState<Block[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!currentSite || !pageId) return;
    loadPage();
  }, [currentSite, pageId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Delete' && selectedBlockId) {
        const block = blocks.find(b => b.id === selectedBlockId);
        if (block && !block.locked) {
          deleteBlock(selectedBlockId);
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedBlockId) {
        e.preventDefault();
        duplicateBlock(selectedBlockId);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, blocks, historyIndex]);

  const saveHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(blocks)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

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
      const loadedBlocks = content?.blocks || [];
      setBlocks(loadedBlocks);
      setHistory([JSON.parse(JSON.stringify(loadedBlocks))]);
      setHistoryIndex(0);
      if (content?.theme) {
        setTheme(content.theme);
      }
      setSeoData({
        seo_title: data.seo_title || '',
        seo_description: data.seo_description || '',
        seo_image_url: data.seo_image_url || '',
      });
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
        seo_title: seoData.seo_title || null,
        seo_description: seoData.seo_description || null,
        seo_image_url: seoData.seo_image_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page.id);

    if (!error) {
      const savedToast = document.createElement('div');
      savedToast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-up';
      savedToast.textContent = 'Page saved successfully';
      document.body.appendChild(savedToast);
      setTimeout(() => savedToast.remove(), 2000);
    }

    setSaving(false);
  };

  const handleImportBlocks = (importedBlocks: Block[]) => {
    setBlocks([...blocks, ...importedBlocks]);
    saveHistory();
    setShowImportModal(false);
  };

  const addBlock = (type: string) => {
    const template = BLOCK_TEMPLATES[type as keyof typeof BLOCK_TEMPLATES];
    if (!template) return;

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
      name: `${template.type.charAt(0).toUpperCase() + template.type.slice(1)} Block`,
    };

    setBlocks([...blocks, newBlock]);
    setShowBlockMenu(false);
    setSelectedBlockId(newBlock.id);
    saveHistory();

    if (!recentBlocks.includes(type)) {
      setRecentBlocks([type, ...recentBlocks].slice(0, 5));
    }
  };

  const addCustomBlock = (customBlock: any) => {
    const newBlock: Block = {
      ...customBlock,
      id: `block-${Date.now()}`,
    };
    setBlocks([...blocks, newBlock]);
    setShowCustomBlocksLibrary(false);
    saveHistory();
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, content: { ...b.content, ...content } } : b)));
    saveHistory();
  };

  const updateBlockStyles = (id: string, styles: any) => {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, styles: { ...b.styles, ...styles } } : b)));
    saveHistory();
  };

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id);
    if (!block) return;

    const newBlock: Block = {
      ...JSON.parse(JSON.stringify(block)),
      id: `block-${Date.now()}`,
      name: `${block.name} (Copy)`,
    };

    const index = blocks.findIndex(b => b.id === id);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    setBlocks(newBlocks);
    setSelectedBlockId(newBlock.id);
    saveHistory();
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    saveHistory();
  };

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    setBlocks(newBlocks);
    saveHistory();
  };

  const toggleBlockVisibility = (id: string) => {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, hidden: !b.hidden } : b)));
  };

  const toggleBlockLock = (id: string) => {
    setBlocks(blocks.map(b => (b.id === id ? { ...b, locked: !b.locked } : b)));
  };

  const handleSaveBlockAsCustom = (block: Block) => {
    setBlockToSave(block);
    setShowSaveBlockModal(true);
  };

  const publishPage = async () => {
    if (!page) return;

    const { error } = await supabase
      .from('pages')
      .update({ status: 'published' })
      .eq('id', page.id);

    if (!error) {
      setPage({ ...page, status: 'published' });
      alert('Page published successfully!');
    }
  };

  const handleTemplateSelect = async (template: any) => {
    if (template) {
      setBlocks(template.blocks || []);
      setTheme(template.theme || theme);
      saveHistory();
    }
    setShowTemplatePicker(false);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      moveBlock(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
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

  const getBlockIcon = (type: string) => {
    const icons: Record<string, any> = {
      hero: Layout,
      text: Type,
      image: ImageIcon,
      cta: Sparkles,
      features: Grid3x3,
      testimonial: Quote,
      form: FileText,
      pricing: CreditCard,
      video: Video,
      gallery: ImageIcon,
      stats: BarChart3,
    };
    return icons[type] || Box;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!page) return null;

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="h-screen flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Top Toolbar */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(funnelId ? `/funnels/${funnelId}` : '/funnels')}
            className="p-2 hover:bg-slate-700 rounded-lg transition"
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="h-8 w-px bg-slate-700"></div>
          <div>
            <h1 className="text-sm font-semibold text-white">{page.title}</h1>
            <p className="text-xs text-slate-400">/{page.slug}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tool Selection */}
          <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setTool('select')}
              className={`p-2 rounded ${tool === 'select' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              title="Select Tool (V)"
            >
              <MousePointer2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setTool('hand')}
              className={`p-2 rounded ${tool === 'hand' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              title="Hand Tool (H)"
            >
              <Move className="h-4 w-4" />
            </button>
          </div>

          <div className="h-8 w-px bg-slate-700"></div>

          {/* History */}
          <div className="flex items-center space-x-1">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Cmd+Z)"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 hover:bg-slate-700 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>

          <div className="h-8 w-px bg-slate-700"></div>

          {/* Device Preview */}
          <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              title="Desktop"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewMode('tablet')}
              className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              title="Tablet"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
              title="Mobile"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setZoom(Math.max(25, zoom - 25))}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-400 w-12 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 25))}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-2 hover:bg-slate-700 rounded-lg transition"
              title="Fit to Screen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>

          <div className="h-8 w-px bg-slate-700"></div>

          {/* Actions */}
          <button
            onClick={() => setShowFullPreview(true)}
            className="px-3 py-1.5 text-sm text-white hover:bg-slate-700 rounded-lg transition"
          >
            Preview
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-1.5 text-sm hover:bg-slate-700 rounded-lg transition"
            title="Import from URL"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 text-sm text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {page.status !== 'published' && (
            <button
              onClick={publishPage}
              className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 rounded-lg transition"
            >
              Publish
            </button>
          )}
          {page.status === 'published' && (
            <span className="px-3 py-1.5 text-sm bg-green-600/20 text-green-400 rounded-lg">
              Published
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Layers & Elements */}
        <div
          className={`bg-slate-800 border-r border-slate-700 flex flex-col transition-all duration-300 ${
            leftSidebarOpen ? 'w-64' : 'w-0'
          } overflow-hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Layers</span>
            </h2>
            <button
              onClick={() => setLeftSidebarOpen(false)}
              className="p-1 hover:bg-slate-700 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {blocks.length === 0 ? (
              <div className="text-center text-slate-300 text-sm py-8">
                No blocks yet
              </div>
            ) : (
              blocks.map((block, index) => {
                const Icon = getBlockIcon(block.type);
                return (
                  <div
                    key={block.id}
                    onClick={() => setSelectedBlockId(block.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group transition ${
                      selectedBlockId === block.id
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-slate-700'
                    } ${block.hidden ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <GripVertical
                        className="h-4 w-4 opacity-0 group-hover:opacity-100 transition cursor-grab"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          handleDragOver(index);
                        }}
                        onDragEnd={handleDragEnd}
                      />
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-xs truncate text-slate-200">{block.name || block.type}</span>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBlockVisibility(block.id);
                        }}
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        {block.hidden ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <EyeIcon className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBlockLock(block.id);
                        }}
                        className="p-1 hover:bg-slate-600 rounded"
                      >
                        {block.locked ? (
                          <Lock className="h-3 w-3" />
                        ) : (
                          <Unlock className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t border-slate-700">
            <button
              onClick={() => setShowBlockMenu(true)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Block</span>
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-slate-900 overflow-auto relative">
          {!leftSidebarOpen && (
            <button
              onClick={() => setLeftSidebarOpen(true)}
              className="absolute left-4 top-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}

          <div
            ref={canvasRef}
            className="min-h-full flex items-center justify-center p-8"
            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center top' }}
          >
            <div
              style={{ width: getPreviewWidth() }}
              className="bg-white shadow-2xl rounded-lg overflow-hidden transition-all duration-300"
            >
              {blocks.length === 0 ? (
                <div className="p-24 text-center">
                  <Layout className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Start Building</h3>
                  <p className="text-slate-600 mb-6">Add blocks from the left panel to begin</p>
                  <button
                    onClick={() => setShowBlockMenu(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add Your First Block
                  </button>
                </div>
              ) : (
                <div>
                  {blocks.map((block, index) => {
                    if (block.hidden) return null;
                    return (
                      <div
                        key={block.id}
                        onClick={() => {
                          setSelectedBlockId(block.id);
                          setEditingBlockId(block.id);
                        }}
                        className={`relative cursor-pointer transition ${
                          selectedBlockId === block.id
                            ? 'ring-2 ring-blue-500 ring-inset'
                            : 'hover:ring-1 hover:ring-slate-300 hover:ring-inset'
                        }`}
                      >
                        <BlockRenderer
                          block={block}
                          primaryColor={theme.primaryColor}
                        />
                        {selectedBlockId === block.id && (
                          <div className="absolute top-2 right-2 flex items-center space-x-1 bg-slate-900 rounded-lg p-1 shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingBlockId(editingBlockId === block.id ? null : block.id);
                              }}
                              className="p-1.5 hover:bg-slate-700 rounded text-white"
                              title="Edit"
                            >
                              <Settings className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateBlock(block.id);
                              }}
                              className="p-1.5 hover:bg-slate-700 rounded text-white"
                              title="Duplicate"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!block.locked) deleteBlock(block.id);
                              }}
                              className="p-1.5 hover:bg-slate-700 rounded text-white disabled:opacity-30"
                              disabled={block.locked}
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div
          className={`bg-slate-800 border-l border-slate-700 flex flex-col transition-all duration-300 ${
            rightSidebarOpen ? 'w-80' : 'w-0'
          } overflow-hidden`}
        >
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-sm font-semibold text-white">Properties</h2>
            <button
              onClick={() => setRightSidebarOpen(false)}
              className="p-1 hover:bg-slate-700 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {editingBlockId && selectedBlock ? (
              <div className="bg-white rounded-lg m-2">
                <BlockEditor
                  block={selectedBlock}
                  onUpdate={(content) => updateBlock(selectedBlock.id, content)}
                  onStyleUpdate={(styles) => updateBlockStyles(selectedBlock.id, styles)}
                />
              </div>
            ) : selectedBlock ? (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                    Block Name
                  </label>
                  <input
                    type="text"
                    value={selectedBlock.name || selectedBlock.type}
                    onChange={(e) => {
                      setBlocks(
                        blocks.map((b) =>
                          b.id === selectedBlock.id ? { ...b, name: e.target.value } : b
                        )
                      );
                    }}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">
                    Block Type
                  </label>
                  <div className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm capitalize">
                    {selectedBlock.type}
                  </div>
                </div>

                <button
                  onClick={() => setEditingBlockId(selectedBlock.id)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition flex items-center justify-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Content & Style</span>
                </button>

                <div className="pt-4 border-t border-slate-700 space-y-2">
                  <button
                    onClick={() => handleSaveBlockAsCustom(selectedBlock)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition"
                  >
                    Save as Custom Block
                  </button>
                  <button
                    onClick={() => duplicateBlock(selectedBlock.id)}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition"
                  >
                    Duplicate Block
                  </button>
                  <button
                    onClick={() => {
                      if (!selectedBlock.locked) deleteBlock(selectedBlock.id);
                    }}
                    disabled={selectedBlock.locked}
                    className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm transition disabled:opacity-30"
                  >
                    Delete Block
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                <div className="text-center text-slate-300 text-sm py-12">
                  <Box className="h-12 w-12 mx-auto mb-3 text-slate-500" />
                  <p>Select a block to view properties</p>
                </div>
              </div>
            )}

            <div className="p-4 border-t border-slate-700 space-y-2">
              <button
                onClick={() => setShowThemeSettings(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition flex items-center justify-center space-x-2"
              >
                <Palette className="h-4 w-4" />
                <span>Page Theme</span>
              </button>
              <button
                onClick={() => setShowSeoSettings(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition flex items-center justify-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>SEO Settings</span>
              </button>
              <button
                onClick={() => setShowVersionHistory(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition flex items-center justify-center space-x-2"
              >
                <Clock className="h-4 w-4" />
                <span>Version History</span>
              </button>
              <button
                onClick={() => setShowTemplatePicker(true)}
                className="w-full py-2 bg-slate-900 hover:bg-slate-700 rounded-lg text-sm text-slate-200 transition flex items-center justify-center space-x-2"
              >
                <Layout className="h-4 w-4" />
                <span>Change Template</span>
              </button>
            </div>
          </div>
        </div>

        {!rightSidebarOpen && (
          <button
            onClick={() => setRightSidebarOpen(true)}
            className="absolute right-4 top-4 z-10 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Modals */}
      {showBlockMenu && (
        <EnhancedBlockLibrary
          onAddBlock={addBlock}
          onClose={() => setShowBlockMenu(false)}
          onOpenCustomBlocks={() => {
            setShowBlockMenu(false);
            setShowCustomBlocksLibrary(true);
          }}
          recentBlocks={recentBlocks}
        />
      )}

      {showCustomBlocksLibrary && (
        <CustomBlocksLibrary
          onSelect={addCustomBlock}
          onClose={() => setShowCustomBlocksLibrary(false)}
        />
      )}

      {showSaveBlockModal && blockToSave && (
        <SaveBlockModal
          block={blockToSave}
          onSave={() => {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            toast.textContent = 'Block saved to library';
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
            loadPage();
          }}
          onClose={() => {
            setShowSaveBlockModal(false);
            setBlockToSave(null);
          }}
        />
      )}

      {showImportModal && (
        <ImportPageModal
          onImport={handleImportBlocks}
          onClose={() => setShowImportModal(false)}
        />
      )}

      {showTemplatePicker && (
        <TemplatePicker
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplatePicker(false)}
          pageType={page.page_type as any}
        />
      )}

      {showVersionHistory && (
        <PageVersionHistory
          pageId={page.id}
          onRestore={(version: any) => {
            setBlocks(version.content?.blocks || []);
            setShowVersionHistory(false);
            saveHistory();
          }}
          onClose={() => setShowVersionHistory(false)}
        />
      )}

      {/* Theme Settings Modal */}
      {showThemeSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Theme Settings</h3>
              <button
                onClick={() => setShowThemeSettings(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <AIColorPalette
                onApplyTheme={(newTheme) => {
                  setTheme({ ...theme, ...newTheme });
                  setShowThemeSettings(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* SEO Settings Modal */}
      {showSeoSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">SEO Settings</h3>
              <button
                onClick={() => setShowSeoSettings(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <input
                  type="text"
                  value={seoData.seo_title}
                  onChange={(e) => setSeoData({ ...seoData, seo_title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optimized page title for search engines"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Description</label>
                <textarea
                  value={seoData.seo_description}
                  onChange={(e) => setSeoData({ ...seoData, seo_description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description for search results"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Social Share Image URL</label>
                <input
                  type="url"
                  value={seoData.seo_image_url}
                  onChange={(e) => setSeoData({ ...seoData, seo_image_url: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <button
                onClick={() => {
                  handleSave();
                  setShowSeoSettings(false);
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Save SEO Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Preview Modal */}
      {showFullPreview && (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
          <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
            <h3 className="text-sm font-semibold text-white">Preview Mode</h3>
            <button
              onClick={() => setShowFullPreview(false)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
            >
              Close Preview
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-white">
            <div style={{ width: getPreviewWidth(), margin: '0 auto' }}>
              {blocks.map((block) => {
                if (block.hidden) return null;
                return (
                  <BlockRenderer
                    key={block.id}
                    block={block}
                    primaryColor={theme.primaryColor}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
