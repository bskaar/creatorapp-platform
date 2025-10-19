import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Clock, RotateCcw, Eye, X, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface PageVersion {
  id: string;
  version_number: number;
  content: any;
  metadata: any;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
  is_published: boolean;
  block_count: number;
}

interface PageVersionHistoryProps {
  pageId: string;
  currentContent: any;
  onRestore: (content: any, metadata: any) => void;
  onClose: () => void;
}

export default function PageVersionHistory({
  pageId,
  currentContent,
  onRestore,
  onClose
}: PageVersionHistoryProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<PageVersion | null>(null);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);

  useEffect(() => {
    loadVersions();
  }, [pageId]);

  const loadVersions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('page_versions')
      .select('*')
      .eq('page_id', pageId)
      .order('version_number', { ascending: false });

    if (data) {
      setVersions(data);
    }
    setLoading(false);
  };

  const handleRestore = async (version: PageVersion) => {
    if (confirm(`Are you sure you want to restore version ${version.version_number}? This will create a new version with the restored content.`)) {
      onRestore(version.content, version.metadata);
      onClose();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const toggleExpand = (versionId: string) => {
    setExpandedVersionId(expandedVersionId === versionId ? null : versionId);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
          <div className="p-6 flex items-center justify-center">
            <div className="text-gray-600">Loading version history...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
            <span className="text-sm text-gray-500">({versions.length} versions)</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Version List */}
        <div className="flex-1 overflow-y-auto p-6">
          {versions.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No version history yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Versions are created automatically when you save changes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`border rounded-lg transition-all ${
                    selectedVersion?.id === version.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Version {version.version_number}
                          </span>
                          {index === 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current
                            </span>
                          )}
                          {version.is_published && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Published
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(version.created_at)}</span>
                          <span>•</span>
                          <span>{version.block_count} blocks</span>
                        </div>

                        {version.metadata?.title && (
                          <div className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Title:</span> {version.metadata.title}
                          </div>
                        )}

                        {version.change_summary && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 rounded p-2">
                            {version.change_summary}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toggleExpand(version.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                          title="View details"
                        >
                          {expandedVersionId === version.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>

                        {index !== 0 && (
                          <button
                            onClick={() => handleRestore(version)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Restore
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedVersionId === version.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
                        <div className="space-y-1 text-sm text-gray-600">
                          {version.metadata?.slug && (
                            <div><span className="font-medium">Slug:</span> {version.metadata.slug}</div>
                          )}
                          {version.metadata?.seo_title && (
                            <div><span className="font-medium">SEO Title:</span> {version.metadata.seo_title}</div>
                          )}
                          {version.metadata?.seo_description && (
                            <div><span className="font-medium">SEO Description:</span> {version.metadata.seo_description}</div>
                          )}
                        </div>

                        {version.content && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Content Structure</h4>
                            <div className="bg-gray-50 rounded p-3 text-xs font-mono text-gray-700 max-h-40 overflow-y-auto">
                              {version.content.blocks && Array.isArray(version.content.blocks) ? (
                                <div className="space-y-1">
                                  {version.content.blocks.map((block: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <FileText className="w-3 h-3" />
                                      <span>Block {idx + 1}: {block.type}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <pre>{JSON.stringify(version.content, null, 2).substring(0, 300)}...</pre>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Versions are automatically created when you save changes to your page.
            You can restore any previous version at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
