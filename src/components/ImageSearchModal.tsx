import { useState, useEffect } from 'react';
import { X, Search, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageResult {
  id: number;
  url: string;
  thumbnail: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
}

interface ImageSearchModalProps {
  onSelect: (url: string, alt: string) => void;
  onClose: () => void;
  initialQuery?: string;
}

export default function ImageSearchModal({
  onSelect,
  onClose,
  initialQuery = 'business',
}: ImageSearchModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    searchImages(initialQuery);
  }, []);

  const searchImages = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/search-images?query=${encodeURIComponent(searchQuery)}&per_page=20`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to search images');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setImages(data.images || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search images');
      setImages([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchImages(query);
  };

  const handleSelectImage = (image: ImageResult) => {
    onSelect(image.url, image.alt);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <ImageIcon className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Search Images</h2>
                <p className="text-sm text-gray-600">Powered by Pexels</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for images..."
              className="w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              disabled={isSearching || !query.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isSearching && !hasSearched && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}

          {!isSearching && hasSearched && images.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No images found. Try a different search term.</p>
            </div>
          )}

          {images.length > 0 && (
            <div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 transition"
                    onClick={() => handleSelectImage(image)}
                  >
                    <img
                      src={image.thumbnail}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition">
                        <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium">
                          Select
                        </button>
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                      <p className="text-white text-xs truncate">
                        Photo by {image.photographer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <span>Images provided by</span>
                  <a
                    href="https://www.pexels.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Pexels</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <span>{images.length} results</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
