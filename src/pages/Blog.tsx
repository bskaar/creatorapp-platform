import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Rss } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function Blog() {
  return (
    <div className="min-h-screen bg-slate-900">
      <PublicHeader variant="dark" />

      <section className="pt-28 pb-20 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]"></div>

        <div className="max-w-[1200px] mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
              <Rss className="h-4 w-4" />
              Blog & Updates
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              CreatorApp <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Blog</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tips, insights, and updates to help you grow your creator business
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-16 text-center border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]"></div>
            <div className="max-w-2xl mx-auto relative z-10">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-cyan-500/25">
                <Rss className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-6">Coming Soon</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                We're working on bringing you valuable content, creator tips, platform updates, and success stories.
                Our blog will be launching soon with articles to help you make the most of CreatorApp and grow your business.
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Stay in the Loop</h3>
                <p className="text-gray-300 mb-6">
                  Be the first to know when we publish new content. Subscribe to get updates delivered to your inbox.
                </p>
                <div className="flex gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-white/10 border-2 border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 text-white placeholder-gray-400"
                  />
                  <button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                    Subscribe
                  </button>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                In the meantime, check out our{' '}
                <Link to="/pages/documentation" className="text-cyan-400 hover:underline font-semibold">
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
              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Platform Updates</h4>
                <p className="text-gray-600">
                  Stay informed about new features, improvements, and product releases as we continue to build the best platform for creators.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Creator Success Stories</h4>
                <p className="text-gray-600">
                  Learn from successful creators using CreatorApp. Real stories, real results, and actionable insights you can apply.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-cyan-400 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4">
                  <ArrowRight className="h-6 w-6 text-white" />
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

      <PublicFooter />
    </div>
  );
}
