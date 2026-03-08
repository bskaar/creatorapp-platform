import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../components/Logo';
import DemoModal from '../components/DemoModal';
import HowItWorksSection from '../components/HowItWorksSection';
import ProductDemoVideo from '../components/ProductDemoVideo';
import StructuredData, { organizationSchema, softwareApplicationSchema } from '../components/StructuredData';
import PremiumHero from '../components/PremiumHero';
import FeatureShowcase from '../components/FeatureShowcase';
import EnhancedFeaturesSection from '../components/EnhancedFeaturesSection';
import PremiumTrustSection from '../components/PremiumTrustSection';
import PublicFooter from '../components/PublicFooter';

export default function Landing() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <nav className="fixed top-0 w-full bg-slate-900 z-50 border-b border-white/10 isolate" aria-label="Main navigation">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link to="/" className="flex items-center relative z-10">
              <Logo variant="light" className="scale-100 sm:scale-125" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition text-white"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:flex items-center space-x-8 relative z-10">
              <a href="#features" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </a>
              <Link to="/pricing" className="text-gray-300 hover:text-white font-medium transition-colors relative group">
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-7 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 backdrop-blur-xl border-t border-white/10 px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg font-medium"
            >
              Features
            </a>
            <Link
              to="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg font-medium"
            >
              Pricing
            </Link>
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-gray-300 hover:bg-white/5 hover:text-white rounded-lg font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold text-center"
            >
              Start Free Trial
            </Link>
          </div>
        )}
      </nav>

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
        .rotate-y-\[-5deg\] {
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
