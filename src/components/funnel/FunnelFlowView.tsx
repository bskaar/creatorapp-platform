import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, MoreVertical, GripVertical, ArrowRight, ArrowDown, Copy, BarChart3, ExternalLink, ZoomIn, ZoomOut, FileText, LayoutGrid as Layout } from 'lucide-react';
import { useDeviceType } from '../../hooks/useDeviceType';
import type { Database } from '../../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface FunnelFlowViewProps {
  funnelId: string;
  pages: Page[];
  onDeletePage: (pageId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  onReorderPages?: (pages: Page[]) => void;
  onAddPage: () => void;
}

export function FunnelFlowView({
  funnelId,
  pages,
  onDeletePage,
  onDuplicatePage,
  onReorderPages,
  onAddPage,
}: FunnelFlowViewProps) {
  const [zoom, setZoom] = useState(100);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet, isPortrait } = useDeviceType();

  const isVerticalLayout = isMobile || (isTablet && isPortrait);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    if (onReorderPages) {
      onReorderPages(newPages);
    }
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getPageTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; accent: string }> = {
      landing: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', accent: 'bg-blue-500' },
      sales_page: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', accent: 'bg-green-500' },
      optin: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', accent: 'bg-cyan-500' },
      checkout: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', accent: 'bg-amber-500' },
      thank_you: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', accent: 'bg-teal-500' },
      upsell: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', accent: 'bg-orange-500' },
      content: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', accent: 'bg-gray-500' },
      webinar: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', accent: 'bg-pink-500' },
    };
    return colors[type] || colors.landing;
  };

  const extractPreviewContent = (content: unknown) => {
    if (!content || typeof content !== 'object') return null;

    const blocks = Array.isArray(content) ? content : (content as { blocks?: unknown[] }).blocks;
    if (!Array.isArray(blocks)) return null;

    let heroImage: string | null = null;
    let headline: string | null = null;
    let subheadline: string | null = null;

    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue;
      const b = block as Record<string, unknown>;

      if (!heroImage && b.type === 'hero' && b.props) {
        const props = b.props as Record<string, unknown>;
        if (props.backgroundImage && typeof props.backgroundImage === 'string') {
          heroImage = props.backgroundImage;
        }
        if (!headline && props.headline && typeof props.headline === 'string') {
          headline = props.headline;
        }
        if (!subheadline && props.subheadline && typeof props.subheadline === 'string') {
          subheadline = props.subheadline;
        }
      }

      if (!heroImage && b.type === 'image' && b.props) {
        const props = b.props as Record<string, unknown>;
        if (props.src && typeof props.src === 'string') {
          heroImage = props.src;
        }
      }

      if (!headline && (b.type === 'heading' || b.type === 'text') && b.props) {
        const props = b.props as Record<string, unknown>;
        if (props.text && typeof props.text === 'string' && props.text.length > 0) {
          headline = props.text;
        }
      }

      if (heroImage && headline) break;
    }

    return { heroImage, headline, subheadline };
  };

  const renderPageCard = (page: Page, index: number) => {
    const colors = getPageTypeColor(page.page_type);
    const preview = useMemo(() => extractPreviewContent(page.content), [page.content]);

    return (
      <div
        key={page.id}
        draggable={!isVerticalLayout}
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        className={`relative group bg-white rounded-xl border-2 shadow-sm hover:shadow-md transition-all ${
          !isVerticalLayout ? 'cursor-move w-72' : 'w-full'
        } ${draggedIndex === index ? 'opacity-50' : ''} ${colors.border}`}
      >
        {!isVerticalLayout && (
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition cursor-grab">
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <div className={`px-3 py-2 ${colors.bg} rounded-t-xl border-b ${colors.border}`}>
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-gray-900 truncate text-sm flex-1">{page.title}</h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                page.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {page.status}
            </span>
          </div>
        </div>

        <div className="relative">
          {preview?.heroImage ? (
            <div className="h-32 overflow-hidden bg-gray-100">
              <img
                src={preview.heroImage}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {preview.headline && (
                <div className="absolute bottom-2 left-3 right-3">
                  <p className="text-white text-xs font-medium line-clamp-2 drop-shadow-sm">
                    {preview.headline}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className={`h-32 ${colors.bg} flex flex-col items-center justify-center p-4`}>
              <div className={`w-10 h-10 rounded-lg ${colors.accent} bg-opacity-20 flex items-center justify-center mb-2`}>
                <Layout className={`h-5 w-5 ${colors.text}`} />
              </div>
              {preview?.headline ? (
                <p className="text-xs text-gray-600 text-center line-clamp-2">{preview.headline}</p>
              ) : (
                <p className="text-xs text-gray-500 text-center">
                  {page.page_type.replace('_', ' ')} page
                </p>
              )}
            </div>
          )}

          <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
            {page.page_type.replace('_', ' ')}
          </div>
        </div>

        <div className="px-3 py-2 border-t">
          <p className="text-xs text-gray-500 truncate mb-2">/{page.slug}</p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{page.views_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>{page.conversions_count || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t rounded-b-xl">
          <Link
            to={`/funnels/${funnelId}/pages/${page.id}`}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Link>

          <div className="relative" ref={activeMenu === page.id ? menuRef : undefined}>
            <button
              onClick={() => setActiveMenu(activeMenu === page.id ? null : page.id)}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {activeMenu === page.id && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border z-10">
                <button
                  onClick={() => {
                    if (onDuplicatePage) onDuplicatePage(page.id);
                    setActiveMenu(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </button>
                <a
                  href={`/p/${page.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </a>
                <button
                  onClick={() => {
                    onDeletePage(page.id);
                    setActiveMenu(null);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isVerticalLayout) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b">
          <h3 className="font-semibold text-gray-900">Funnel Flow</h3>
          <span className="text-sm text-gray-500">{pages.length} steps</span>
        </div>

        <div className="p-4 space-y-3">
          {pages.map((page, index) => {
            const isLast = index === pages.length - 1;

            return (
              <div key={page.id} className="flex flex-col items-center">
                {renderPageCard(page, index)}

                {!isLast && (
                  <div className="flex flex-col items-center py-2 relative group/connector">
                    <div className="w-0.5 h-6 bg-gray-300" />
                    <ArrowDown className="h-4 w-4 text-gray-400 -mt-1" />

                    <button
                      onClick={onAddPage}
                      className="absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/connector:opacity-100 transition bg-white border border-gray-300 rounded-full p-1 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                      title="Add step here"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onAddPage}
            className="w-full flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-600 transition group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center mb-2 transition">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Add Step</span>
          </button>

          {pages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
              <p className="text-gray-500 mb-4 text-center">Start building your funnel by adding your first page</p>
              <button
                onClick={onAddPage}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Add First Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <h3 className="font-semibold text-gray-900">Funnel Flow</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-500 w-12 text-center">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="overflow-x-auto p-6"
        style={{ minHeight: '300px' }}
      >
        <div
          className="flex items-center gap-0"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'left center' }}
        >
          {pages.map((page, index) => {
            const isLast = index === pages.length - 1;

            return (
              <div key={page.id} className="flex items-center">
                {renderPageCard(page, index)}

                {!isLast && (
                  <div className="flex items-center px-2 relative group/connector">
                    <div className="w-12 h-0.5 bg-gray-300" />
                    <ArrowRight className="h-4 w-4 text-gray-400 -ml-1" />

                    <button
                      onClick={onAddPage}
                      className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/connector:opacity-100 transition bg-white border border-gray-300 rounded-full p-1 hover:border-blue-500 hover:text-blue-600 shadow-sm"
                      title="Add step here"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <button
            onClick={onAddPage}
            className="ml-4 flex flex-col items-center justify-center w-48 h-40 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-600 transition group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-blue-50 flex items-center justify-center mb-2 transition">
              <Plus className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Add Step</span>
          </button>
        </div>
      </div>

      {pages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
          <p className="text-gray-500 mb-4">Start building your funnel by adding your first page</p>
          <button
            onClick={onAddPage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Add First Page
          </button>
        </div>
      )}
    </div>
  );
}
