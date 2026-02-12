import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { supabase } from '../lib/supabase';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string;
  published: boolean;
}

export default function MarketingPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    loadPage();
  }, [slug]);

  const loadPage = async () => {
    if (!slug) return;

    setLoading(true);
    setNotFound(false);

    try {
      const { data, error } = await supabase
        .from('marketing_pages')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setNotFound(true);
      } else {
        setPage(data);
        document.title = `${data.title} - CreatorApp`;
      }
    } catch (error) {
      console.error('Error loading page:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-text-secondary hover:text-text-primary font-semibold transition"
              >
                Home
              </Link>
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-text-secondary hover:text-text-primary font-semibold transition"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-bold text-dark mb-4">Page Not Found</h1>
          <p className="text-text-secondary mb-8 text-lg">
            The page you're looking for doesn't exist or hasn't been published yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-text-secondary hover:text-text-primary font-semibold transition"
            >
              Home
            </Link>
            {user ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-text-secondary hover:text-text-primary font-semibold transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-button hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <article className="bg-white rounded-card shadow-light border border-border p-12">
          <div
            className="prose prose-lg max-w-none prose-headings:text-dark prose-headings:font-bold prose-p:text-text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-dark prose-ul:text-text-primary prose-ol:text-text-primary"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(page?.content || '', {
                ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'div', 'span', 'blockquote', 'code', 'pre', 'img'],
                ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'title', 'width', 'height']
              })
            }}
          />
        </article>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary font-semibold transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </main>

      <footer className="py-8 px-6 border-t border-border bg-white mt-20">
        <div className="max-w-7xl mx-auto text-center text-text-secondary text-sm font-medium">
          <p>&copy; 2025 CreatorApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
