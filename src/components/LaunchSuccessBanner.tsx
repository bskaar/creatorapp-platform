import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, Check, X, Share2, Twitter, Linkedin } from 'lucide-react';

interface LaunchSuccessBannerProps {
  siteName: string;
  subdomain: string;
  customDomain?: string | null;
  templateName?: string;
  onDismiss: () => void;
}

export default function LaunchSuccessBanner({
  siteName,
  subdomain,
  customDomain,
  templateName,
  onDismiss
}: LaunchSuccessBannerProps) {
  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const displayDomain = customDomain && !customDomain.startsWith('www.') ? `www.${customDomain}` : (customDomain || `${subdomain}.creatorapp.site`);
  const siteUrl = `https://${displayDomain}`;

  const copyLink = () => {
    navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`I just launched my ${templateName || 'new site'} with CreatorApp! Check it out:`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(siteUrl)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`, '_blank');
  };

  return (
    <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-white/70 hover:text-white transition z-10"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Your site is live!</h2>
            <p className="text-emerald-100">Congratulations on launching {siteName}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
          <p className="text-sm text-emerald-100 mb-2">Your site URL</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-lg font-medium truncate">
              {siteUrl}
            </code>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Site
          </a>

          <div className="relative">
            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-semibold rounded-lg hover:bg-white/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Your Launch
            </button>

            {showShareOptions && (
              <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px] z-20">
                <button
                  onClick={shareOnTwitter}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Twitter className="w-4 h-4 text-sky-500" />
                  <span className="font-medium">Twitter</span>
                </button>
                <button
                  onClick={shareOnLinkedIn}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  <span className="font-medium">LinkedIn</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
