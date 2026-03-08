import { Link } from 'react-router-dom';
import { ArrowRight, Play, Sparkles, TrendingUp, Mail, DollarSign, BarChart3 } from 'lucide-react';

interface PremiumHeroProps {
  onWatchDemo: () => void;
}

function DashboardMockup() {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl transform scale-105"></div>
      <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200/50">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-slate-700 rounded-lg px-4 py-1 text-xs text-gray-300">
              creatorapp.com/dashboard
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="w-14 bg-slate-900 py-4 flex flex-col items-center gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg"></div>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold text-gray-800">Welcome back!</div>
                <div className="text-xs text-gray-500">Here's what's happening today</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium">
                + New Page
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Revenue', value: '$12,489', change: '+12%', color: 'emerald' },
                { label: 'Visitors', value: '8,294', change: '+8%', color: 'blue' },
                { label: 'Conversions', value: '3.2%', change: '+0.5%', color: 'cyan' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="text-[10px] text-gray-500">{stat.label}</div>
                  <div className="text-sm font-bold text-gray-800">{stat.value}</div>
                  <div className={`text-[10px] text-${stat.color}-600`}>{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-semibold text-gray-800">Recent Activity</div>
                <div className="text-[10px] text-blue-600">View All</div>
              </div>
              <div className="space-y-2">
                {[
                  { action: 'New subscriber', name: 'john@example.com', time: '2m ago' },
                  { action: 'Product purchased', name: 'Digital Course', time: '15m ago' },
                  { action: 'Page view', name: '/landing-page', time: '1h ago' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px]">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-600">{item.action}:</span>
                      <span className="text-gray-800 font-medium ml-1">{item.name}</span>
                    </div>
                    <span className="text-gray-400">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 border border-gray-100 animate-float-slow">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">New Sale!</div>
            <div className="text-[10px] text-emerald-600">+$297.00</div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-xl p-3 border border-gray-100 animate-float-delayed">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-800">Email Sent</div>
            <div className="text-[10px] text-blue-600">2,847 delivered</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PremiumHero({ onWatchDemo }: PremiumHeroProps) {
  return (
    <section className="relative min-h-screen pt-24 sm:pt-32 pb-16 px-4 sm:px-8 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cyan-600/20 via-transparent to-transparent"></div>

        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse-slower"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-full blur-[150px]"></div>

        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>

        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-twinkle"></div>
        <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-twinkle-delayed"></div>
        <div className="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-white/50 rounded-full animate-twinkle"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-8rem)]">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-400 px-5 py-2.5 rounded-full text-sm font-semibold border border-cyan-500/30">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Creator Platform</span>
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] text-white">
            Build Your{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Creator Business
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 rounded-full opacity-50"></span>
            </span>
            {' '}All in One Place
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-xl">
            Everything you need to create, launch, and scale your online business. Build websites, sell products, run email campaigns, and grow your audience with AI-powered tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/signup"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-1 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <span className="relative">Start Your Free Trial</span>
              <ArrowRight className="h-5 w-5 relative group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={onWatchDemo}
              className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-white/30">
                <Play className="h-5 w-5 text-white ml-0.5" />
              </div>
              See How It Works
            </button>
          </div>

          <div className="flex items-center gap-6 pt-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-400 text-sm">14-Day Free Trial</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-400 text-sm">No Platform Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-400 text-sm">Cancel Anytime</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <DashboardMockup />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white/50 rounded-full animate-scroll-indicator"></div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes twinkle-delayed {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.1; }
        }
        @keyframes scroll-indicator {
          0% { transform: translateY(0); opacity: 1; }
          50% { transform: translateY(8px); opacity: 0; }
          51% { transform: translateY(-8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-float-slow { animation: float-slow 3s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 3.5s ease-in-out infinite 0.5s; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulse-slower 5s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-twinkle-delayed { animation: twinkle-delayed 2.5s ease-in-out infinite; }
        .animate-scroll-indicator { animation: scroll-indicator 2s ease-in-out infinite; }
      `}</style>
    </section>
  );
}
