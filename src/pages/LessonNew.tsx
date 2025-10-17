import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function LessonNew() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video',
    content_text: '',
    media_url: '',
    media_duration_seconds: '',
    is_preview: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setError('');
    setLoading(true);

    try {
      const { data: lessons } = await supabase
        .from('lessons')
        .select('order_index')
        .eq('product_id', productId)
        .order('order_index', { ascending: false })
        .limit(1);

      const nextOrderIndex = lessons && lessons.length > 0 ? lessons[0].order_index + 1 : 0;

      const { error: insertError } = await supabase
        .from('lessons')
        .insert({
          product_id: productId,
          title: formData.title,
          description: formData.description || null,
          content_type: formData.content_type as 'video' | 'audio' | 'text' | 'pdf' | 'quiz',
          content_text: formData.content_text || null,
          media_url: formData.media_url || null,
          media_duration_seconds: formData.media_duration_seconds ? parseInt(formData.media_duration_seconds) : null,
          is_preview: formData.is_preview,
          order_index: nextOrderIndex,
        });

      if (insertError) throw insertError;

      navigate(`/content/${productId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create lesson');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(`/content/${productId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Lesson</h1>
          <p className="text-gray-600 mt-1">Create a new lesson for this product</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Lesson Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Introduction to React Hooks"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of what students will learn..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="content_type" className="block text-sm font-medium text-gray-700 mb-2">
              Content Type *
            </label>
            <select
              id="content_type"
              name="content_type"
              required
              value={formData.content_type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="text">Text Content</option>
              <option value="pdf">PDF Document</option>
              <option value="quiz">Quiz</option>
            </select>
          </div>

          <div>
            <label htmlFor="media_duration_seconds" className="block text-sm font-medium text-gray-700 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              id="media_duration_seconds"
              name="media_duration_seconds"
              min="0"
              value={formData.media_duration_seconds}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 600 for 10 minutes"
            />
          </div>
        </div>

        {['video', 'audio', 'pdf'].includes(formData.content_type) && (
          <div>
            <label htmlFor="media_url" className="block text-sm font-medium text-gray-700 mb-2">
              Media URL *
            </label>
            <input
              type="url"
              id="media_url"
              name="media_url"
              required
              value={formData.media_url}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/video.mp4"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload your media to Supabase Storage or use a CDN URL
            </p>
          </div>
        )}

        {formData.content_type === 'text' && (
          <div>
            <label htmlFor="content_text" className="block text-sm font-medium text-gray-700 mb-2">
              Text Content *
            </label>
            <textarea
              id="content_text"
              name="content_text"
              required
              rows={10}
              value={formData.content_text}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Write your lesson content here... (Markdown supported)"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can use Markdown formatting for rich text content
            </p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_preview"
            name="is_preview"
            checked={formData.is_preview}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_preview" className="text-sm font-medium text-gray-700">
            Make this a free preview lesson
          </label>
        </div>
        <p className="text-sm text-gray-500 pl-6">
          Preview lessons can be viewed by anyone without purchasing
        </p>

        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(`/content/${productId}`)}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Create Lesson</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
