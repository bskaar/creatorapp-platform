import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, MoreVertical, Copy, BarChart3, ExternalLink, FileText } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

interface FunnelGridViewProps {
  funnelId: string;
  pages: Page[];
  onDeletePage: (pageId: string) => void;
  onDuplicatePage?: (pageId: string) => void;
  onAddPage: () => void;
}

export function FunnelGridView({
  funnelId,
  pages,
  onDeletePage,
  onDuplicatePage,
  onAddPage,
}: FunnelGridViewProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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

  const getPageTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      landing: 'Landing',
      sales_page: 'Sales',
      optin: 'Opt-in',
      checkout: 'Checkout',
      thank_you: 'Thank You',
      upsell: 'Upsell',
      content: 'Content',
      webinar: 'Webinar',
    };
    return icons[type] || 'Page';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {pages.map((page, index) => {
          const colors = getPageTypeColor(page.page_type);

          return (
            <div
              key={page.id}
              className={`relative group bg-white rounded-xl border-2 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden ${colors.border}`}
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className={`w-12 h-12 ${colors.accent} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md`}>
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Step {index + 1}
                    </div>
                    <div className={`text-sm font-bold ${colors.text}`}>
                      {getPageTypeIcon(page.page_type)}
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 left-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      page.status === 'published'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {page.status}
                  </span>
                </div>

                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => setActiveMenu(activeMenu === page.id ? null : page.id)}
                    className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm transition"
                  >
                    <MoreVertical className="h-4 w-4 text-gray-600" />
                  </button>

                  {activeMenu === page.id && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border z-20">
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

                <Link
                  to={`/funnels/${funnelId}/pages/${page.id}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all duration-200 group/overlay"
                >
                  <div className="opacity-0 group-hover/overlay:opacity-100 transition-opacity">
                    <span className="px-4 py-2 bg-white rounded-lg shadow-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Edit Page
                    </span>
                  </div>
                </Link>
              </div>

              <div className={`px-4 py-3 ${colors.bg} border-t ${colors.border}`}>
                <h4 className="font-semibold text-gray-900 truncate text-sm">{page.title}</h4>
                <p className="text-xs text-gray-500 truncate mt-0.5">/{page.slug}</p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/50">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{page.views_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" />
                      <span>{page.conversions_count || 0}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${colors.text} uppercase tracking-wide`}>
                    {page.page_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <button
          onClick={onAddPage}
          className="aspect-[4/3] flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold">Add Page</span>
        </button>
      </div>

      {pages.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Plus className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No pages yet</h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Start building your funnel by adding your first page
          </p>
          <button
            onClick={onAddPage}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-lg shadow-blue-600/20"
          >
            Add First Page
          </button>
        </div>
      )}
    </div>
  );
}
