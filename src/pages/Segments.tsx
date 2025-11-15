import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { Users, Plus, Trash2, Edit, X, Loader2, Filter } from 'lucide-react';

interface Segment {
  id: string;
  name: string;
  description: string;
  conditions: any;
  contact_count: number;
  is_dynamic: boolean;
  created_at: string;
}

export default function Segments() {
  const { currentSite } = useSite();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_dynamic: true,
  });

  useEffect(() => {
    if (currentSite) {
      loadSegments();
    }
  }, [currentSite]);

  const loadSegments = async () => {
    if (!currentSite) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('contact_segments')
        .select('*')
        .eq('site_id', currentSite.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setSegments(data || []);
    } catch (err: any) {
      console.error('Error loading segments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSite) return;

    setSaving(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('contact_segments')
        .insert({
          site_id: currentSite.id,
          name: formData.name,
          description: formData.description,
          is_dynamic: formData.is_dynamic,
          conditions: { rules: [] },
        });

      if (insertError) throw insertError;

      setShowNewModal(false);
      setFormData({ name: '', description: '', is_dynamic: true });
      loadSegments();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this segment? This action cannot be undone.')) return;

    try {
      const { error: deleteError } = await supabase
        .from('contact_segments')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      loadSegments();
    } catch (err: any) {
      console.error('Error deleting segment:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Segments</h1>
          <p className="text-gray-600 mt-1">
            Create and manage audience segments for targeted campaigns
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="h-5 w-5" />
          <span>New Segment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Segments</p>
              <p className="text-2xl font-bold text-gray-900">{segments.length}</p>
            </div>
            <Filter className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Dynamic Segments</p>
              <p className="text-2xl font-bold text-green-600">
                {segments.filter((s) => s.is_dynamic).length}
              </p>
            </div>
            <Filter className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">
                {segments.reduce((sum, s) => sum + s.contact_count, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-gray-600" />
          </div>
        </div>
      </div>

      {segments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Segments Yet</h2>
          <p className="text-gray-600 mb-6">
            Create your first segment to organize and target your contacts
          </p>
          <button
            onClick={() => setShowNewModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create First Segment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{segment.name}</h3>
                  {segment.description && (
                    <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Link
                    to={`/segments/${segment.id}`}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(segment.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Contacts</span>
                  <span className="font-semibold text-gray-900">{segment.contact_count}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      segment.is_dynamic
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {segment.is_dynamic ? 'Dynamic' : 'Static'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Create New Segment</h2>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="High-Value Customers"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe this segment"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_dynamic"
                  checked={formData.is_dynamic}
                  onChange={(e) => setFormData({ ...formData, is_dynamic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_dynamic" className="ml-2 text-sm text-gray-700">
                  Dynamic segment (automatically updates)
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
