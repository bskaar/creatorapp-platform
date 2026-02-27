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
  BarChart3
} from 'lucide-react';

type UserStage = 'new' | 'launched' | 'growing' | 'established';
type FunnelType = 'course' | 'webinar' | 'lead_magnet' | 'general';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  link: string;
  icon: typeof FileText;
  priority: number;
}

interface ContextualRecommendationsProps {
  userStage: UserStage;
  funnelType: FunnelType;
  hasProducts: boolean;
  hasContacts: boolean;
  hasStripe: boolean;
  hasEmailSequence: boolean;
}

export default function ContextualRecommendations({
  userStage,
  funnelType,
  hasProducts,
  hasContacts,
  hasStripe,
  hasEmailSequence
}: ContextualRecommendationsProps) {
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

      if (funnelType === 'lead_magnet' && !hasEmailSequence) {
        recommendations.push({
          id: 'create-email-sequence',
          title: 'Create welcome email sequence',
          description: 'Nurture new leads with automated emails',
          link: '/email',
          icon: Mail,
          priority: 1
        });
      }

      recommendations.push({
        id: 'share-site',
        title: 'Share your site',
        description: 'Let people know about your new funnel',
        link: '/analytics',
        icon: Megaphone,
        priority: 3
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Recommended Next Steps</h3>
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <Link
              key={rec.id}
              to={rec.link}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all group"
            >
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
