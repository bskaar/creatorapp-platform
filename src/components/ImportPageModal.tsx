import { useState } from 'react';
import { X, Download, Loader2, Globe, Code, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImportPageModalProps {
  onClose: () => void;
  onImport: (blocks: any[]) => void;
}

type ImportMode = 'url' | 'html';

export default function ImportPageModal({ onClose, onImport }: ImportPageModalProps) {
  const [mode, setMode] = useState<ImportMode>('url');
  const [url, setUrl] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewBlocks, setPreviewBlocks] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);

  const parseHtmlToBlocks = (html: string): any[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const blocks: any[] = [];
    const images: string[] = [];

    // Extract hero sections (h1 + p or large headers)
    const h1Elements = doc.querySelectorAll('h1');
    h1Elements.forEach((h1) => {
      const nextP = h1.nextElementSibling;
      const subheadline = nextP?.tagName === 'P' ? nextP.textContent : '';

      blocks.push({
        id: `hero-${Date.now()}-${Math.random()}`,
        type: 'hero',
        content: {
          headline: h1.textContent || 'Headline',
          subheadline: subheadline || 'Subheadline text',
          ctaText: 'Get Started',
          ctaUrl: '#',
          backgroundImage: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1600',
        },
      });
    });

    // Extract images
    const imgElements = doc.querySelectorAll('img');
    imgElements.forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src) {
        images.push(src);
        blocks.push({
          id: `image-${Date.now()}-${Math.random()}`,
          type: 'image',
          content: {
            url: src,
            alt: img.getAttribute('alt') || 'Image',
            caption: img.getAttribute('title') || '',
          },
        });
      }
    });

    // Extract text blocks (paragraphs)
    const paragraphs = doc.querySelectorAll('p');
    paragraphs.forEach((p) => {
      const text = p.textContent?.trim();
      if (text && text.length > 20) {
        blocks.push({
          id: `text-${Date.now()}-${Math.random()}`,
          type: 'text',
          content: {
            text: text,
          },
        });
      }
    });

    // Extract buttons/CTAs
    const buttons = doc.querySelectorAll('button, a.button, a.btn, [role="button"]');
    if (buttons.length > 0) {
      const buttonTexts = Array.from(buttons)
        .map(btn => btn.textContent?.trim())
        .filter(text => text && text.length > 0);

      if (buttonTexts.length > 0) {
        blocks.push({
          id: `cta-${Date.now()}-${Math.random()}`,
          type: 'cta',
          content: {
            headline: 'Ready to Get Started?',
            description: 'Take action today',
            buttonText: buttonTexts[0] || 'Get Started',
            buttonUrl: '#',
          },
        });
      }
    }

    // Extract feature lists
    const lists = doc.querySelectorAll('ul, ol');
    lists.forEach((list) => {
      const items = Array.from(list.querySelectorAll('li'));
      if (items.length >= 3) {
        blocks.push({
          id: `features-${Date.now()}-${Math.random()}`,
          type: 'features',
          content: {
            headline: 'Features',
            subheadline: 'Everything you need',
            features: items.slice(0, 6).map((item, idx) => ({
              title: item.textContent?.trim() || `Feature ${idx + 1}`,
              description: 'Feature description',
              icon: ['🚀', '⚡', '🎯', '💡', '🎨', '📊'][idx],
            })),
          },
        });
      }
    });

    setExtractedImages(images);
    return blocks;
  };

  const handleImportFromUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-page-from-url`;

      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import page');
      }

      if (data.success && data.blocks) {
        setPreviewBlocks(data.blocks);
        setShowPreview(true);
      } else {
        throw new Error('No blocks were extracted from the page');
      }
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import page. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImportFromHtml = () => {
    if (!htmlContent.trim()) {
      setError('Please paste HTML content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const blocks = parseHtmlToBlocks(htmlContent);

      if (blocks.length === 0) {
        throw new Error('No content could be extracted from the HTML');
      }

      setPreviewBlocks(blocks);
      setShowPreview(true);
    } catch (err: any) {
      console.error('HTML parsing error:', err);
      setError(err.message || 'Failed to parse HTML content');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (mode === 'url') {
      handleImportFromUrl();
    } else {
      handleImportFromHtml();
    }
  };

  const handleConfirmImport = () => {
    onImport(previewBlocks);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Download className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Import Page</h2>
              <p className="text-sm text-gray-600">From URL or paste HTML (Bolt, Claude, etc.)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="border-b px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setMode('url')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                mode === 'url'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>From URL</span>
              </div>
            </button>
            <button
              onClick={() => setMode('html')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                mode === 'html'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Paste HTML</span>
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showPreview ? (
            <div className="space-y-6">
              {mode === 'url' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="url"
                          value={url}
                          onChange={(e) => {
                            setUrl(e.target.value);
                            setError('');
                          }}
                          placeholder="https://example.com/page"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={loading}
                        />
                      </div>
                      <button
                        onClick={handleImport}
                        disabled={loading || !url.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 whitespace-nowrap"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Importing...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            <span>Import</span>
                          </>
                        )}
                      </button>
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <h3 className="font-semibold text-gray-900">How it works:</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">1.</span>
                        <span>Enter the URL of any public webpage you want to import</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">2.</span>
                        <span>We'll fetch and analyze the page structure, extracting text, images, and layout</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">3.</span>
                        <span>Content is converted into editable blocks that match our page builder</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-bold text-blue-600 mr-2">4.</span>
                        <span>Preview the imported blocks and customize them before adding to your page</span>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste HTML Code
                    </label>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => {
                        setHtmlContent(e.target.value);
                        setError('');
                      }}
                      placeholder="Paste your HTML here (from Bolt, Claude, or any source)..."
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      disabled={loading}
                    />
                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}
                  </div>

                  <button
                    onClick={handleImport}
                    disabled={loading || !htmlContent.trim()}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Parsing HTML...</span>
                      </>
                    ) : (
                      <>
                        <Code className="h-4 w-4" />
                        <span>Parse HTML to Blocks</span>
                      </>
                    )}
                  </button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Perfect for:
                    </h4>
                    <ul className="space-y-1 text-sm text-blue-700">
                      <li>• Pages created in Bolt.new</li>
                      <li>• HTML generated by Claude or ChatGPT</li>
                      <li>• Exported HTML from design tools</li>
                      <li>• Local HTML files you've created</li>
                      <li>• Any custom HTML code</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">💡 Pro Tip:</h4>
                    <p className="text-sm text-green-700">
                      After importing, use the image replacement tool to upload your own logos and images. All content can be edited in the page builder!
                    </p>
                  </div>
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Supported Content:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
                  <div>✓ Headings and text</div>
                  <div>✓ Images and media</div>
                  <div>✓ Call-to-action buttons</div>
                  <div>✓ Feature sections</div>
                  <div>✓ List content</div>
                  <div>✓ Page structure</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">Preview Imported Content</h3>
                  <p className="text-sm text-gray-600">
                    {previewBlocks.length} blocks extracted • {extractedImages.length} images found
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setPreviewBlocks([]);
                    setExtractedImages([]);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Import Different {mode === 'url' ? 'URL' : 'HTML'}
                </button>
              </div>

              {extractedImages.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ImageIcon className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-900 mb-2">
                        {extractedImages.length} Images Found
                      </h4>
                      <p className="text-sm text-amber-700 mb-3">
                        After importing, you can replace any image with your own logos and assets using the image editor in each block.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {extractedImages.slice(0, 6).map((imgUrl, idx) => (
                          <div
                            key={idx}
                            className="h-16 w-16 rounded border-2 border-white shadow-sm overflow-hidden bg-white"
                          >
                            <img
                              src={imgUrl}
                              alt={`Image ${idx + 1}`}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23ddd" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        ))}
                        {extractedImages.length > 6 && (
                          <div className="h-16 w-16 rounded border-2 border-dashed border-amber-300 flex items-center justify-center bg-amber-100">
                            <span className="text-xs font-semibold text-amber-700">
                              +{extractedImages.length - 6}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {previewBlocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {block.type}
                      </span>
                      <span className="text-xs text-gray-400">Block {index + 1}</span>
                    </div>
                    {block.type === 'hero' && (
                      <div>
                        <p className="font-semibold text-gray-900">{block.content.headline}</p>
                        <p className="text-sm text-gray-600 mt-1">{block.content.subheadline}</p>
                      </div>
                    )}
                    {block.type === 'text' && (
                      <p className="text-sm text-gray-700 line-clamp-3">{block.content.text}</p>
                    )}
                    {block.type === 'image' && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={block.content.url}
                          alt={block.content.alt}
                          className="h-16 w-16 object-cover rounded"
                        />
                        <span className="text-sm text-gray-600">{block.content.alt || 'Image'}</span>
                      </div>
                    )}
                    {block.type === 'features' && (
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">{block.content.headline}</p>
                        <div className="space-y-1">
                          {block.content.features.map((feature: any, idx: number) => (
                            <p key={idx} className="text-xs text-gray-600">• {feature.title}</p>
                          ))}
                        </div>
                      </div>
                    )}
                    {block.type === 'cta' && (
                      <div>
                        <p className="font-semibold text-gray-900">{block.content.headline}</p>
                        <p className="text-sm text-gray-600 mt-1">{block.content.description}</p>
                        <p className="text-xs text-blue-600 mt-2">Button: {block.content.buttonText}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showPreview && (
          <div className="border-t p-6 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              These blocks will be added to your page. You can edit them after importing.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
