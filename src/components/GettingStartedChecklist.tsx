import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  CheckCircle,
  Circle,
  Home,
  Package,
  CreditCard,
  Mail,
  Globe,
  ChevronRight,
  X,
  Sparkles,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  icon: any;
}

export default function GettingStartedChecklist() {
  const { currentSite } = useSite();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem(`checklist-dismissed-${currentSite?.id}`);
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, [currentSite]);

  useEffect(() => {
    if (!currentSite || dismissed) return;
    checkProgress();
  }, [currentSite, dismissed]);

  const checkProgress = async () => {
    if (!currentSite) return;

    try {
      const [pagesResult, productsResult, stripeResult, domainsResult] = await Promise.all([
        supabase
          .from('pages')
          .select('id')
          .eq('site_id', currentSite.id)
          .in('slug', ['home', ''])
          .maybeSingle(),
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', currentSite.id),
        supabase
          .from('sites')
          .select('stripe_account_id')
          .eq('id', currentSite.id)
          .maybeSingle(),
        supabase
          .from('custom_domains')
          .select('id', { count: 'exact', head: true })
          .eq('site_id', currentSite.id)
          .eq('verified', true),
      ]);

      const hasHomepage = !!pagesResult.data;
      const hasProducts = (productsResult.count || 0) > 0;
      const hasStripe = !!stripeResult.data?.stripe_account_id;
      const hasDomain = (domainsResult.count || 0) > 0;

      const checklistItems: ChecklistItem[] = [
        {
          id: 'homepage',
          title: 'Create your homepage',
          description: 'Design a beautiful landing page to welcome visitors',
          completed: hasHomepage,
          link: '/funnels',
          icon: Home,
        },
        {
          id: 'product',
          title: 'Add your first product',
          description: 'Create a course, membership, or digital product',
          completed: hasProducts,
          link: '/content/new',
          icon: Package,
        },
        {
          id: 'payments',
          title: 'Connect payment processor',
          description: 'Set up Stripe to start accepting payments',
          completed: hasStripe,
          link: '/settings?tab=payments',
          icon: CreditCard,
        },
        {
          id: 'email',
          title: 'Set up email marketing',
          description: 'Create your first email campaign or sequence',
          completed: false,
          link: '/email',
          icon: Mail,
        },
        {
          id: 'domain',
          title: 'Connect custom domain',
          description: 'Use your own domain name for a professional look',
          completed: hasDomain,
          link: '/settings?tab=domain',
          icon: Globe,
        },
      ];

      setItems(checklistItems);
      setLoading(false);
    } catch (err) {
      console.error('Failed to check progress:', err);
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(`checklist-dismissed-${currentSite?.id}`, 'true');
  };

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allCompleted = completedCount === totalCount;

  if (dismissed || loading || allCompleted) return null;

  return (
    <div className="bg-white rounded-card shadow-light border border-border p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full -mr-16 -mt-16"></div>

      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4 mb-6 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-dark mb-1">Getting Started</h3>
          <p className="text-text-secondary font-medium">
            Complete these steps to launch your creator business
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-text-secondary">
            {completedCount} of {totalCount} completed
          </span>
          <span className="text-sm font-bold text-primary">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-border rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.link}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${
                item.completed
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 border border-transparent hover:border-primary/20'
              }`}
            >
              <div className={`flex-shrink-0 ${item.completed ? 'text-green-600' : 'text-text-secondary group-hover:text-primary'}`}>
                {item.completed ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </div>

              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.completed
                  ? 'bg-green-100'
                  : 'bg-white group-hover:bg-gradient-to-br group-hover:from-primary/10 group-hover:to-accent/10'
              }`}>
                <Icon className={`w-5 h-5 ${item.completed ? 'text-green-600' : 'text-text-secondary group-hover:text-primary'}`} />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold mb-1 ${
                  item.completed ? 'text-green-900 line-through' : 'text-dark group-hover:text-primary'
                }`}>
                  {item.title}
                </h4>
                <p className="text-sm text-text-secondary font-medium">
                  {item.description}
                </p>
              </div>

              {!item.completed && (
                <ChevronRight className="w-5 h-5 text-text-secondary group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
