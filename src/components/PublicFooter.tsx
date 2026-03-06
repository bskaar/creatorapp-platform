import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Logo from './Logo';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-gray-400 py-16 px-8" role="contentinfo">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="mb-6">
              <Logo variant="light" />
            </div>
            <p className="text-sm text-gray-400">
              The all-in-one platform for creator businesses. Build, grow, and monetize your online presence.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Product</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><a href="/#features" className="hover:text-white transition-colors">Features</a></li>
              <li><Link to="/pages/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/pages/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/pages/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li>
                <Link
                  to="/pages/contact"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-sm text-center text-gray-500">
          © {new Date().getFullYear()} CreatorApp. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
