import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';

export default function SiteSetup() {
  const { user } = useAuth();
  const { sites } = useSite();
  const navigate = useNavigate();
  const isFirstSite = sites.length === 0;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setLoading(true);

    try {
      const slug = formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');

      const { data: existingSlug } = await supabase
        .from('sites')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existingSlug) {
        setError('This URL is already taken. Please choose another.');
        setLoading(false);
        return;
      }

      const { data: site, error: insertError } = await supabase
        .from('sites')
        .insert({
          name: formData.name,
          slug: slug,
          owner_id: user.id,
          tier: 'launch',
          status: 'active',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase
        .from('site_members')
        .insert({
          site_id: site.id,
          user_id: user.id,
          role: 'owner',
          accepted_at: new Date().toISOString(),
        });

      localStorage.setItem('currentSiteId', site.id);
      navigate('/dashboard');
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Failed to create site');
      setLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {!isFirstSite && (
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
        )}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-xl mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isFirstSite ? 'Welcome!' : 'Create New Site'}
          </h1>
          <p className="text-lg text-gray-600">
            {isFirstSite
              ? "Let's create your first site to get started"
              : 'Add another site to your account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Site Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={handleNameChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="e.g., My Creator Academy"
            />
            <p className="text-sm text-gray-500 mt-1">
              This is your site's display name
            </p>
          </div>

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
              Site URL *
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                id="slug"
                required
                value={formData.slug}
                onChange={handleSlugChange}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                placeholder="my-site"
                pattern="[a-z0-9-]+"
              />
              <span className="text-gray-500">.app</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This will be your site's unique URL. Only lowercase letters, numbers, and hyphens.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !formData.name || !formData.slug}
              className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Creating Your Site...</span>
                </>
              ) : (
                <span>Create My Site</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>You can create multiple sites and switch between them later</p>
        </div>
      </div>
    </div>
  );
}
