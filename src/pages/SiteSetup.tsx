import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import { Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {!isFirstSite && (
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-8 inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-semibold transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        )}

        <div className="bg-white rounded-card shadow-light border border-border p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl shadow-light mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-dark mb-3">
              {isFirstSite ? 'Welcome!' : 'Create New Site'}
            </h1>
            <p className="text-text-secondary text-lg font-medium">
              {isFirstSite
                ? "Let's create your first site to get started"
                : 'Add another site to your account'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                Site Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium"
                placeholder="e.g., My Creator Academy"
              />
              <p className="text-sm text-text-secondary mt-2 font-medium">
                This is your site's display name
              </p>
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-semibold text-text-primary mb-2">
                Site URL *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={handleSlugChange}
                  className="flex-1 px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all text-lg font-medium"
                  placeholder="my-site"
                  pattern="[a-z0-9-]+"
                />
                <span className="text-text-secondary font-semibold">.app</span>
              </div>
              <p className="text-sm text-text-secondary mt-2 font-medium">
                This will be your site's unique URL. Only lowercase letters, numbers, and hyphens.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || !formData.name || !formData.slug}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-button hover:shadow-button-hover focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-lg font-bold"
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
        </div>

        <div className="mt-8 text-center">
          <p className="text-text-secondary text-sm font-medium">
            You can create multiple sites and switch between them later
          </p>
          <p className="text-text-secondary text-sm font-medium mt-2">
            &copy; 2025 CreatorApp. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
