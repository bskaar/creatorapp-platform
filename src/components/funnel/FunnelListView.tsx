import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CreditCard as Edit, Trash2, Eye, GripVertical, Copy, BarChart3, ExternalLink, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';
import { BottomSheet, BottomSheetAction } from '../responsive/BottomSheet';
import { TouchButton } from '../responsive/TouchButton';
import type { Database } from '../../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface FunnelListViewProps {
  funnelId: string;
  pages: Page[];
  onDeletePage: (pageId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  onToggleStatus?: (pageId: string, newStatus: 'published' | 'draft') => void;
  onReorderPages?: (pages: Page[]) => void;
  onAddPage: () => void;
}

export function FunnelListView({
  funnelId,
  pages,
  onDeletePage,
  onDuplicatePage,
  onToggleStatus,
  onReorderPages,
  onAddPage,
}: FunnelListViewProps) {
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showActions, setShowActions] = useState(false);
  const [expandedPage, setExpandedPage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleTouchStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleTouchMove = (e: React.TouchEvent, index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newPages = [...pages];
    const [draggedPage] = newPages.splice(draggedIndex, 1);
    newPages.splice(index, 0, draggedPage);

    if (onReorderPages) {
      onReorderPages(newPages);
    }
    setDraggedIndex(index);
  };

  const handleTouchEnd = () => {
    setDraggedIndex(null);
  };

  const handlePagePress = (page: Page) => {
    setSelectedPage(page);
    setShowActions(true);
  };

  const handleToggleExpand = (pageId: string) => {
    setExpandedPage(expandedPage === pageId ? null : pageId);
  };

  const getPageTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      landing: { bg: 'bg-blue-100', text: 'text-blue-700' },
      sales_page: { bg: 'bg-green-100', text: 'text-green-700' },
      optin: { bg: 'bg-purple-100', text: 'text-purple-700' },
      checkout: { bg: 'bg-amber-100', text: 'text-amber-700' },
      thank_you: { bg: 'bg-teal-100', text: 'text-teal-700' },
      upsell: { bg: 'bg-orange-100', text: 'text-orange-700' },
      content: { bg: 'bg-gray-100', text: 'text-gray-700' },
      webinar: { bg: 'bg-pink-100', text: 'text-pink-700' },
    };
    return colors[type] || colors.landing;
  };

  return (
    <div className="space-y-3">
      {pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pages yet</h3>
          <p className="text-gray-500 mb-6">Start building your funnel by adding your first page</p>
          <TouchButton onClick={onAddPage} fullWidth>
            Add First Page
          </TouchButton>
        </div>
      ) : (
        <>
          {pages.map((page, index) => {
            const colors = getPageTypeColor(page.page_type);
            const isExpanded = expandedPage === page.id;

            return (
              <div
                key={page.id}
                className={`bg-white rounded-xl border border-gray-200 overflow-hidden transition-all ${
                  draggedIndex === index ? 'opacity-50 scale-[0.98]' : ''
                }`}
              >
                <div className="flex items-center">
                  <div
                    className="flex items-center justify-center w-10 h-full py-4 touch-none cursor-grab"
                    onTouchStart={() => handleTouchStart(index)}
                    onTouchMove={(e) => handleTouchMove(e, index)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <GripVertical className="h-5 w-5 text-gray-300" />
                  </div>

                  <button
                    onClick={() => handleToggleExpand(page.id)}
                    className="flex-1 flex items-center py-4 pr-4 text-left min-h-[72px]"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-500">{index + 1}</span>
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{page.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {page.page_type.replace('_', ' ')}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            page.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {page.status}
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-4 w-4" />
                          <span>{page.views_count || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4" />
                          <span>{page.conversions_count || 0} conversions</span>
                        </div>
                      </div>

                      {onToggleStatus && (
                        <button
                          onClick={() =>
                            onToggleStatus(page.id, page.status === 'published' ? 'draft' : 'published')
                          }
                          className="flex items-center gap-2 text-sm"
                        >
                          {page.status === 'published' ? (
                            <>
                              <ToggleRight className="h-5 w-5 text-green-600" />
                              <span className="text-green-600">Live</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-5 w-5 text-gray-400" />
                              <span className="text-gray-500">Draft</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-gray-500">/{page.slug}</p>

                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to={`/funnels/${funnelId}/pages/${page.id}`}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium min-h-[48px]"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Page
                      </Link>
                      <button
                        onClick={() => handlePagePress(page)}
                        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium min-h-[48px]"
                      >
                        More Options
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <TouchButton onClick={onAddPage} variant="secondary" fullWidth icon={<Plus className="h-5 w-5" />}>
            Add Page
          </TouchButton>
        </>
      )}

      <BottomSheet
        isOpen={showActions}
        onClose={() => {
          setShowActions(false);
          setSelectedPage(null);
        }}
        title={selectedPage?.title}
        snapPoints={[0.4]}
      >
        {selectedPage && (
          <div className="space-y-1">
            <BottomSheetAction
              icon={<ExternalLink className="h-5 w-5" />}
              label="Preview Page"
              onClick={() => {
                window.open(`/p/${selectedPage.slug}`, '_blank');
                setShowActions(false);
              }}
            />
            {onDuplicatePage && (
              <BottomSheetAction
                icon={<Copy className="h-5 w-5" />}
                label="Duplicate Page"
                onClick={() => {
                  onDuplicatePage(selectedPage.id);
                  setShowActions(false);
                }}
              />
            )}
            {onToggleStatus && (
              <BottomSheetAction
                icon={
                  selectedPage.status === 'published' ? (
                    <ToggleLeft className="h-5 w-5" />
                  ) : (
                    <ToggleRight className="h-5 w-5" />
                  )
                }
                label={selectedPage.status === 'published' ? 'Unpublish' : 'Publish'}
                onClick={() => {
                  onToggleStatus(
                    selectedPage.id,
                    selectedPage.status === 'published' ? 'draft' : 'published'
                  );
                  setShowActions(false);
                }}
              />
            )}
            <div className="border-t my-2" />
            <BottomSheetAction
              icon={<Trash2 className="h-5 w-5" />}
              label="Delete Page"
              variant="danger"
              onClick={() => {
                onDeletePage(selectedPage.id);
                setShowActions(false);
                setSelectedPage(null);
              }}
            />
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
