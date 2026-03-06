import { Link } from 'react-router-dom';
import { Globe, Eye, EyeOff, ExternalLink, Settings } from 'lucide-react';

interface SiteStatusIndicatorProps {
  isPublished: boolean;
  subdomain: string;
  customDomain?: string | null;
  lastUpdated?: string;
}

export default function SiteStatusIndicator({
  isPublished,
  subdomain,
  customDomain,
  lastUpdated
}: SiteStatusIndicatorProps) {
  const baseDomain = customDomain || `${subdomain}.creatorapp.site`;
  const displayDomain = customDomain && !customDomain.startsWith('www.') ? `www.${customDomain}` : baseDomain;
  const siteUrl = `https://${displayDomain}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
        isPublished
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-700'
      }`}>
        {isPublished ? (
          <>
            <Eye className="w-4 h-4" />
            <span>Live</span>
          </>
        ) : (
          <>
            <EyeOff className="w-4 h-4" />
            <span>Draft</span>
          </>
        )}
      </div>

      {isPublished ? (
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-cyan-600 transition-colors"
        >
          <Globe className="w-4 h-4" />
          <span className="truncate max-w-[200px]">{displayDomain}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <Link
          to="/settings?tab=domain"
          className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Publish your site</span>
        </Link>
      )}

      {lastUpdated && (
        <span className="text-xs text-gray-400 ml-auto">
          Updated {formatDate(lastUpdated)}
        </span>
      )}
    </div>
  );
}
