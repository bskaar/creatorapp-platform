import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../contexts/SiteContext';
import { supabase } from '../lib/supabase';
import {
  CheckCircle,
  Circle,
  FileText,
  Package,
  CreditCard,
  Globe,
  ChevronRight,
  ChevronDown,
  X,
  Rocket,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  ShoppingCart,
  Mail,
  Video,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  link: string;
  icon: any;
  priority: 'required' | 'recommended' | 'advanced';
  timeEstimate?: string;
}

interface OnboardingData {
  template_id?: string;
  template_name?: string;
  business_description?: string;
  industry?: string;
  completed_at?: string;
}

export default function GettingStartedChecklist() {
  const { currentSite } = useSite();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);

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
      const onboarding = currentSite.onboarding_data as OnboardingData | null;
      setOnboardingData(onboarding);

      const [pagesResult, productsResult, stripeResult, domainsResult, funnelsResult] = await Promise.all([
        supabase
          .from('pages')
          .select('id, ai_content_generated')
          .eq('site_id', currentSite.id),
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
        supabase
          .from('funnels')
          .select('id, template_source_id')
          .eq('site_id', currentSite.id),
      ]);

      const hasPages = (pagesResult.data?.length || 0) > 0;
      const hasAiGeneratedPages = pagesResult.data?.some(p => p.ai_content_generated) || false;
      const hasProducts = (productsResult.count || 0) > 0;
      const hasStripe = !!stripeResult.data?.stripe_account_id;
      const hasDomain = (domainsResult.count || 0) > 0;
      const hasFunnel = (funnelsResult.data?.length || 0) > 0;
      const isPublished = currentSite.is_published;

      const templateCategory = onboarding?.template_name?.toLowerCase() || '';
      const isCourseTemplate = templateCategory.includes('course') || templateCategory.includes('sales');
      const isWebinarTemplate = templateCategory.includes('webinar');
      const isLeadMagnetTemplate = templateCategory.includes('lead');

      const requiredItems: ChecklistItem[] = [
        {
          id: 'funnel',
          title: hasFunnel ? 'Funnel pages created' : 'Create your funnel pages',
          description: hasFunnel
            ? `Your ${onboarding?.template_name || 'funnel'} is ready`
            : 'Use a template to create your sales funnel',
          completed: hasFunnel && hasPages,
          link: '/content',
          icon: isCourseTemplate ? ShoppingCart : isWebinarTemplate ? Video : isLeadMagnetTemplate ? Mail : FileText,
          priority: 'required',
        },
        {
          id: 'customize',
          title: hasAiGeneratedPages ? 'Personalize your content' : 'Create your pages',
          description: hasAiGeneratedPages
            ? 'Review AI-generated copy and make it your own'
            : 'Design pages that convert visitors to customers',
          completed: hasPages && !hasAiGeneratedPages,
          link: '/content',
          icon: Edit3,
          priority: 'required',
          timeEstimate: '10 min',
        },
        {
          id: 'publish',
          title: isPublished ? 'Site is live!' : 'Publish your site',
          description: isPublished
            ? `Your site is live on ${currentSite.subdomain}.creatorapp.us`
            : 'Make your site visible to the world',
          completed: isPublished,
          link: '/settings',
          icon: Rocket,
          priority: 'required',
        },
      ];

      const recommendedItems: ChecklistItem[] = [
        {
          id: 'payments',
          title: hasStripe ? 'Payments connected' : 'Connect Stripe',
          description: hasStripe
            ? 'Ready to accept payments'
            : 'Start accepting payments when you\'re ready',
          completed: hasStripe,
          link: '/settings?tab=payments',
          icon: CreditCard,
          priority: 'recommended',
          timeEstimate: '5 min',
        },
      ];

      if (isCourseTemplate || !onboarding?.template_name) {
        recommendedItems.push({
          id: 'product',
          title: hasProducts ? 'Product added' : 'Add your product',
          description: hasProducts
            ? 'Your product is ready to sell'
            : 'Create the course or product you want to sell',
          completed: hasProducts,
          link: '/commerce/new',
          icon: Package,
          priority: 'recommended',
          timeEstimate: '15 min',
        });
      }

      const advancedItems: ChecklistItem[] = [
        {
          id: 'domain',
          title: hasDomain ? 'Custom domain connected' : 'Connect custom domain',
          description: hasDomain
            ? 'Your domain is verified and active'
            : 'Use your own domain for a professional look',
          completed: hasDomain,
          link: '/settings?tab=domain',
          icon: Globe,
          priority: 'advanced',
          timeEstimate: '10 min',
        },
      ];

      setItems([...requiredItems, ...recommendedItems, ...advancedItems]);
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

  const copyLink = () => {
    if (!currentSite) return;
    const url = `https://${currentSite.subdomain || currentSite.name.toLowerCase().replace(/\s+/g, '-')}.creatorapp.us`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const requiredItems = items.filter(i => i.priority === 'required');
  const recommendedItems = items.filter(i => i.priority === 'recommended');
  const advancedItems = items.filter(i => i.priority === 'advanced');

  const requiredCompleted = requiredItems.filter(i => i.completed).length;
  const allRequiredCompleted = requiredCompleted === requiredItems.length;

  const totalCompleted = items.filter(i => i.completed).length;
  const totalCount = items.length;
  const progress = totalCount > 0 ? (totalCompleted / totalCount) * 100 : 0;

  if (dismissed || loading) return null;

  if (allRequiredCompleted && currentSite?.is_published) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-200 p-6 relative overflow-hidden">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-emerald-600 hover:text-emerald-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-emerald-900 mb-1">Your site is live!</h3>
            <p className="text-emerald-700 mb-4">
              Congratulations! Your {onboardingData?.template_name || 'site'} is published and ready to share.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href={`https://${currentSite?.subdomain || currentSite?.name.toLowerCase().replace(/\s+/g, '-')}.creatorapp.us`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 font-medium rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View Site
              </a>
              <button
                onClick={copyLink}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            {(recommendedItems.some(i => !i.completed) || advancedItems.some(i => !i.completed)) && (
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm text-emerald-700 font-medium flex items-center gap-1 hover:text-emerald-800"
                >
                  {showAdvanced ? 'Hide' : 'Show'} optional enhancements
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {showAdvanced && (
                  <div className="mt-3 space-y-2">
                    {[...recommendedItems, ...advancedItems].filter(i => !i.completed).map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.id}
                          to={item.link}
                          className="flex items-center gap-3 p-3 bg-white/50 rounded-lg hover:bg-white transition-colors group"
                        >
                          <Icon className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-800 group-hover:text-emerald-900">
                            {item.title}
                          </span>
                          {item.timeEstimate && (
                            <span className="text-xs text-emerald-600 ml-auto">{item.timeEstimate}</span>
                          )}
                          <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:text-emerald-600" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-50"></div>

      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4 mb-6 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {allRequiredCompleted ? 'Almost there!' : 'Launch your site'}
          </h3>
          <p className="text-gray-600">
            {allRequiredCompleted
              ? 'Complete these optional steps to enhance your site'
              : 'Complete these steps to go live'}
          </p>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">
            {totalCompleted} of {totalCount} completed
          </span>
          <span className="text-sm font-bold text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-cyan-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {requiredItems.length > 0 && !allRequiredCompleted && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Required for Launch
          </h4>
          <div className="space-y-2">
            {requiredItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${
                    item.completed
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                  }`}
                >
                  <div className={`flex-shrink-0 ${item.completed ? 'text-emerald-600' : 'text-gray-400 group-hover:text-blue-600'}`}>
                    {item.completed ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>

                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.completed
                      ? 'bg-emerald-100'
                      : 'bg-white group-hover:bg-blue-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${item.completed ? 'text-emerald-600' : 'text-gray-500 group-hover:text-blue-600'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-sm ${
                      item.completed ? 'text-emerald-800' : 'text-gray-900 group-hover:text-blue-700'
                    }`}>
                      {item.title}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>

                  {!item.completed && item.timeEstimate && (
                    <span className="text-xs text-gray-400 flex-shrink-0">{item.timeEstimate}</span>
                  )}

                  {!item.completed && (
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {recommendedItems.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recommended
          </h4>
          <div className="space-y-2">
            {recommendedItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all group ${
                    item.completed
                      ? 'bg-emerald-50/50'
                      : 'bg-gray-50/50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`flex-shrink-0 ${item.completed ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {item.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4" />
                    )}
                  </div>

                  <Icon className={`w-4 h-4 ${item.completed ? 'text-emerald-600' : 'text-gray-400'}`} />

                  <span className={`text-sm font-medium flex-1 ${
                    item.completed ? 'text-emerald-700' : 'text-gray-700'
                  }`}>
                    {item.title}
                  </span>

                  {!item.completed && item.timeEstimate && (
                    <span className="text-xs text-gray-400">{item.timeEstimate}</span>
                  )}

                  {!item.completed && (
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {advancedItems.length > 0 && (
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1 hover:text-gray-700"
          >
            Advanced
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {showAdvanced && (
            <div className="space-y-2">
              {advancedItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    to={item.link}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all group ${
                      item.completed
                        ? 'bg-emerald-50/50'
                        : 'bg-gray-50/50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${item.completed ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {item.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </div>

                    <Icon className={`w-4 h-4 ${item.completed ? 'text-emerald-600' : 'text-gray-400'}`} />

                    <span className={`text-sm font-medium flex-1 ${
                      item.completed ? 'text-emerald-700' : 'text-gray-700'
                    }`}>
                      {item.title}
                    </span>

                    {!item.completed && item.timeEstimate && (
                      <span className="text-xs text-gray-400">{item.timeEstimate}</span>
                    )}

                    {!item.completed && (
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
