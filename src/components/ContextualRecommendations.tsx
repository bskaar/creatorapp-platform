import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Mail,
  Video,
  Package,
  Users,
  TrendingUp,
  Megaphone,
  CreditCard,
  BarChart3,
  Share2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  X
} from 'lucide-react';

type UserStage = 'new' | 'launched' | 'growing' | 'established';
type FunnelType = 'course' | 'webinar' | 'lead_magnet' | 'general';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  link?: string;
  icon: typeof FileText;
  priority: number;
  action?: 'share';
}

interface ContextualRecommendationsProps {
  userStage: UserStage;
  funnelType: FunnelType;
  hasProducts: boolean;
  hasContacts: boolean;
  hasStripe: boolean;
  hasEmailSequence: boolean;
  siteUrl?: string;
  siteName?: string;
}

export default function ContextualRecommendations({
  userStage,
  funnelType,
  hasProducts,
  hasContacts,
  hasStripe,
  hasEmailSequence,
  siteUrl,
  siteName
}: ContextualRecommendationsProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (siteUrl) {
      navigator.clipboard.writeText(siteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    if (siteUrl) {
      const text = encodeURIComponent(`Check out my site ${siteName || ''}!`);
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(siteUrl)}`, '_blank');
    }
  };

  const shareOnLinkedIn = () => {
    if (siteUrl) {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`, '_blank');
    }
  };

  const getRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];

    if (userStage === 'new') {
      return [];
    }

    if (userStage === 'launched') {
      if (funnelType === 'course' && !hasProducts) {
        recommendations.push({
          id: 'add-product',
          title: 'Add your course or product',
          description: 'Create the digital product you want to sell',
          link: '/commerce/new',
          icon: Package,
          priority: 1
        });
      }

      if (!hasStripe) {
        recommendations.push({
          id: 'connect-stripe',
          title: 'Connect payments',
          description: 'Start accepting payments from your customers',
          link: '/settings?tab=payments',
          icon: CreditCard,
          priority: 2
        });
      }

      if (funnelType === 'webinar') {
        recommendations.push({
          id: 'schedule-webinar',
          title: 'Schedule your webinar',
          description: 'Set a date and start promoting your event',
          link: '/webinars',
          icon: Video,
          priority: 1
        });
      }

      if (!hasEmailSequence) {
        recommendations.push({
          id: 'create-email-sequence',
          title: 'Set up email automation',
          description: 'Nurture leads with automated email sequences',
          link: '/email',
          icon: Mail,
          priority: 2
        });
      }

      recommendations.push({
        id: 'share-site',
        title: 'Share your site',
        description: 'Spread the word on social media',
        icon: Share2,
        priority: 3,
        action: 'share'
      });
    }

    if (userStage === 'growing') {
      if (!hasEmailSequence) {
        recommendations.push({
          id: 'email-automation',
          title: 'Set up email automation',
          description: 'Automate your follow-up sequences',
          link: '/automations',
          icon: Mail,
          priority: 1
        });
      }

      recommendations.push({
        id: 'analyze-traffic',
        title: 'Review your analytics',
        description: 'See how visitors are interacting with your site',
        link: '/analytics',
        icon: BarChart3,
        priority: 2
      });

      if (hasContacts) {
        recommendations.push({
          id: 'segment-contacts',
          title: 'Segment your audience',
          description: 'Create targeted groups for better engagement',
          link: '/contacts',
          icon: Users,
          priority: 3
        });
      }
    }

    if (userStage === 'established') {
      recommendations.push({
        id: 'optimize-funnel',
        title: 'Optimize your funnel',
        description: 'Improve conversion rates with A/B testing',
        link: '/analytics',
        icon: TrendingUp,
        priority: 1
      });

      recommendations.push({
        id: 'expand-products',
        title: 'Add more products',
        description: 'Expand your offerings to increase revenue',
        link: '/commerce/new',
        icon: Package,
        priority: 2
      });

      recommendations.push({
        id: 'review-analytics',
        title: 'Deep dive into analytics',
        description: 'Understand your best-performing content',
        link: '/analytics',
        icon: BarChart3,
        priority: 3
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
  };

  const recommendations = getRecommendations();

  if (recommendations.length === 0) {
    return null;
  }

  const renderRecommendation = (rec: Recommendation) => {
    const Icon = rec.icon;
    const content = (
      <>
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm group-hover:bg-blue-100 transition-colors">
          <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
            {rec.title}
          </h4>
          <p className="text-sm text-gray-500">{rec.description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
      </>
    );

    if (rec.action === 'share') {
      return (
        <button
          key={rec.id}
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group w-full text-left"
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        key={rec.id}
        to={rec.link || '/'}
        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
      >
        {content}
      </Link>
    );
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Next Steps</h3>
        <div className="space-y-3">
          {recommendations.map(renderRecommendation)}
        </div>
      </div>

      {showShareModal && siteUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Share Your Site</h3>
              <p className="text-gray-500 text-sm mt-1">Let people know about your new site</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">Your site URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-medium text-gray-800 truncate">
                  {siteUrl}
                </code>
                <button
                  onClick={copyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={shareOnTwitter}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-sky-50 hover:border-sky-200 transition-colors"
              >
                <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                  <Twitter className="w-5 h-5 text-sky-500" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Share on Twitter</p>
                  <p className="text-sm text-gray-500">Post to your followers</p>
                </div>
              </button>

              <button
                onClick={shareOnLinkedIn}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Linkedin className="w-5 h-5 text-blue-700" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Share on LinkedIn</p>
                  <p className="text-sm text-gray-500">Share with your network</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
