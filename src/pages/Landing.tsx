import { useState, useEffect } from 'react';
import DemoModal from '../components/DemoModal';
import HowItWorksSection from '../components/HowItWorksSection';
import ProductDemoVideo from '../components/ProductDemoVideo';
import StructuredData, { organizationSchema, softwareApplicationSchema } from '../components/StructuredData';
import PremiumHero from '../components/PremiumHero';
import FeatureShowcase from '../components/FeatureShowcase';
import EnhancedFeaturesSection from '../components/EnhancedFeaturesSection';
import PremiumTrustSection from '../components/PremiumTrustSection';
import PublicFooter from '../components/PublicFooter';
import PublicHeader from '../components/PublicHeader';

export default function Landing() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    document.title = 'CreatorApp - All-in-One Platform for Creator Businesses';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Build, grow, and monetize your creator business. All-in-one platform with websites, funnels, email marketing, e-commerce, and AI-powered tools.');
    }
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = 'creator platform, online business, sales funnels, email marketing, e-commerce, course platform, membership sites, creator tools, digital products, online courses';
    document.head.appendChild(metaKeywords);

    return () => {
      const keywords = document.querySelector('meta[name="keywords"]');
      if (keywords) keywords.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <StructuredData data={organizationSchema} id="organization-schema" />
      <StructuredData data={softwareApplicationSchema} id="software-schema" />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      <PublicHeader variant="dark" showFeatures />

      <main id="main-content">
        <PremiumHero onWatchDemo={() => setIsDemoOpen(true)} />

        <FeatureShowcase />

        <EnhancedFeaturesSection />

        <HowItWorksSection onWatchDemo={() => setIsDemoOpen(true)} />

        <PremiumTrustSection />
      </main>

      <PublicFooter />

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <ProductDemoVideo isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} />

      <style>{`
        @keyframes fill-bar {
          from { width: 0; }
        }
        .animate-fill-bar {
          animation: fill-bar 2s ease-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .rotate-y-\\[-5deg\\] {
          transform: rotateY(-5deg) rotateX(5deg);
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
