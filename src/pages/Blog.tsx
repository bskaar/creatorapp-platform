import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Rss } from 'lucide-react';
import Logo from '../components/Logo';

export default function Blog() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <Logo variant="light" className="scale-125" />
            </Link>
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-7 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Rss className="h-4 w-4" />
              Blog & Updates
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              CreatorApp <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tips, insights, and updates to help you grow your creator business
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-16 text-center border-2 border-blue-200">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8">
                <Rss className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Coming Soon</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're working on bringing you valuable content, creator tips, platform updates, and success stories.
                Our blog will be launching soon with articles to help you make the most of CreatorApp and grow your business.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Stay in the Loop</h3>
                <p className="text-gray-600 mb-6">
                  Be the first to know when we publish new content. Subscribe to get updates delivered to your inbox.
                </p>
                <div className="flex gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
              <p className="text-gray-500 text-sm">
                In the meantime, check out our{' '}
                <Link to="/pages/documentation" className="text-blue-600 hover:underline font-semibold">
                  Documentation
                </Link>{' '}
                for guides and FAQs.
              </p>
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              What to Expect from Our Blog
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Platform Updates</h4>
                <p className="text-gray-600">
                  Stay informed about new features, improvements, and product releases as we continue to build the best platform for creators.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Creator Success Stories</h4>
                <p className="text-gray-600">
                  Learn from successful creators using CreatorApp. Real stories, real results, and actionable insights you can apply.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-green-400 transition-all">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Growth Tips & Strategies</h4>
                <p className="text-gray-600">
                  Practical advice on marketing, course creation, pricing strategies, and building your audience to grow your creator business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-8">
        <div className="max-w-[1400px] mx-auto text-center">
          <Logo variant="light" className="mb-4 mx-auto" />
          <p className="text-sm mb-4">The complete solution for modern creator businesses.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/pages/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-600">
            © 2026 CreatorApp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
