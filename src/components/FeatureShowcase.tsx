import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp, ShoppingBag, Users, Mail, GraduationCap, BarChart3 } from 'lucide-react';

interface FeatureTab {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  mockup: React.ReactNode;
}

function FunnelMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span className="ml-3 text-xs text-gray-500 font-medium">Funnel Builder</span>
          </div>
        </div>
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex flex-col items-center">
            <div className="w-full bg-white rounded-xl border-2 border-blue-500 p-4 mb-4 shadow-lg relative">
              <div className="absolute -top-3 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded">Landing Page</div>
              <div className="h-3 w-3/4 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 w-1/2 bg-gray-100 rounded mb-3"></div>
              <div className="h-8 w-24 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg"></div>
            </div>

            <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500 to-cyan-500 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>

            <div className="w-full bg-white rounded-xl border-2 border-teal-500 p-4 mb-4 shadow-lg relative">
              <div className="absolute -top-3 left-4 bg-teal-500 text-white text-xs px-2 py-1 rounded">Order Form</div>
              <div className="flex gap-2 mb-2">
                <div className="h-8 flex-1 bg-gray-100 rounded border border-gray-200"></div>
                <div className="h-8 flex-1 bg-gray-100 rounded border border-gray-200"></div>
              </div>
              <div className="h-8 w-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg"></div>
            </div>

            <div className="w-0.5 h-8 bg-gradient-to-b from-teal-500 to-emerald-500 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-teal-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
              </div>
            </div>

            <div className="w-full bg-white rounded-xl border-2 border-emerald-500 p-4 shadow-lg relative">
              <div className="absolute -top-3 left-4 bg-emerald-500 text-white text-xs px-2 py-1 rounded">Thank You</div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="h-2 w-20 bg-gray-200 rounded mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl -z-10"></div>
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 rounded-full blur-2xl -z-10"></div>
    </div>
  );
}

function StoreMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg"></div>
              <span className="font-bold text-gray-800 text-sm">Artisan Market</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>Shop</span>
              <span>About</span>
              <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-3 h-3 text-amber-600" />
              </div>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-50 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-1">Handcrafted Goods</h3>
              <p className="text-xs text-gray-600">Made with love, delivered with care</p>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Ceramic Vase', price: '$45', color: 'from-rose-200 to-rose-300' },
                { name: 'Woven Basket', price: '$32', color: 'from-amber-200 to-amber-300' },
                { name: 'Candle Set', price: '$28', color: 'from-orange-200 to-orange-300' },
              ].map((product, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className={`h-16 bg-gradient-to-br ${product.color}`}></div>
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-800 truncate">{product.name}</div>
                    <div className="text-xs font-bold text-amber-600">{product.price}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
              <span>12 products</span>
              <span className="text-amber-600 font-medium">View All</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl -z-10"></div>
    </div>
  );
}

function CRMMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">Opportunities</span>
            <div className="text-xs text-gray-500">$15,824,000 value</div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="grid grid-cols-3 gap-3">
            {[
              { stage: 'New Leads', count: 348, value: '$835,200', color: 'blue' },
              { stage: 'Contacted', count: 293, value: '$3,516,000', color: 'cyan' },
              { stage: 'Qualified', count: 10, value: '$216,000', color: 'teal' },
            ].map((col, i) => (
              <div key={i} className="space-y-2">
                <div className={`text-xs font-semibold text-${col.color}-600 mb-2`}>{col.stage}</div>
                <div className="text-[10px] text-gray-500">{col.count} opportunities</div>
                {[1, 2, 3].map((_, j) => (
                  <div key={j} className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br from-${col.color}-400 to-${col.color}-500 flex items-center justify-center text-white text-[8px] font-bold`}>
                        {String.fromCharCode(65 + j)}
                      </div>
                      <div className="text-[10px] font-medium text-gray-800">Lead {j + 1}</div>
                    </div>
                    <div className="text-[10px] text-gray-500">$24,000</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-full blur-2xl -z-10"></div>
    </div>
  );
}

function EmailMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <span className="font-semibold text-gray-800 text-sm">Email Automation</span>
        </div>
        <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-200 rounded"></div>
                  <div className="h-2 w-3/4 bg-gray-100 rounded"></div>
                  <div className="h-2 w-full bg-gray-100 rounded"></div>
                  <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                </div>
                <div className="mt-4 h-8 w-20 bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg"></div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-2 shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-[10px] text-gray-500 font-medium">Trigger</div>
              <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-cyan-500"></div>

              <div className="bg-white rounded-lg border-2 border-blue-200 p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-medium">Email 1</span>
                </div>
              </div>
              <div className="w-0.5 h-4 bg-gray-300"></div>

              <div className="bg-white rounded-lg border-2 border-cyan-200 p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-500" />
                  <span className="text-[10px] font-medium">Email 2</span>
                </div>
              </div>
              <div className="w-0.5 h-4 bg-gray-300"></div>

              <div className="bg-white rounded-lg border-2 border-teal-200 p-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-teal-500" />
                  <span className="text-[10px] font-medium">Email 3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-full blur-2xl -z-10"></div>
    </div>
  );
}

function CourseMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Master Course Academy</span>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-800 mb-2">Module 3: Advanced Strategies</div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              </div>
              <span className="text-xs text-gray-500">75%</span>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Lesson 1: Introduction', done: true },
              { title: 'Lesson 2: Core Concepts', done: true },
              { title: 'Lesson 3: Implementation', done: true },
              { title: 'Lesson 4: Case Studies', done: false, current: true },
              { title: 'Lesson 5: Final Project', done: false },
            ].map((lesson, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-2 rounded-lg ${lesson.current ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-white border border-gray-100'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${lesson.done ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : lesson.current ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-gray-100'}`}>
                  {lesson.done && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-xs ${lesson.current ? 'font-semibold text-emerald-700' : lesson.done ? 'text-gray-500' : 'text-gray-600'}`}>
                  {lesson.title}
                </span>
                {lesson.current && (
                  <span className="ml-auto text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full">Continue</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full blur-2xl -z-10"></div>
    </div>
  );
}

function AnalyticsMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">Analytics Dashboard</span>
            <div className="text-xs text-gray-500">Last 30 days</div>
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-gray-50 to-white">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Revenue', value: '$48,294', change: '+12.5%', color: 'emerald' },
              { label: 'Visitors', value: '24,891', change: '+8.2%', color: 'blue' },
              { label: 'Conversions', value: '3.2%', change: '+0.4%', color: 'cyan' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                <div className="text-[10px] text-gray-500 mb-1">{stat.label}</div>
                <div className="text-sm font-bold text-gray-800">{stat.value}</div>
                <div className={`text-[10px] text-${stat.color}-600 font-medium`}>{stat.change}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3">
            <div className="text-xs font-medium text-gray-800 mb-3">Revenue Over Time</div>
            <div className="flex items-end gap-1 h-20">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[8px] text-gray-400">
              <span>Jan</span>
              <span>Jun</span>
              <span>Dec</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl -z-10"></div>
    </div>
  );
}

const features: FeatureTab[] = [
  {
    id: 'funnels',
    label: 'Your Funnel',
    title: 'Your Funnel',
    description: 'Convert your online visitors into paying customers with powerful funnel builder. Easy to use, incredibly fast, and optimized to turn clicks into cash.',
    icon: <TrendingUp className="w-5 h-5" />,
    mockup: <FunnelMockup />,
  },
  {
    id: 'store',
    label: 'Your Store',
    title: 'Your Store',
    description: 'Build a professional store to sell physical or digital products - whether you build from scratch or start fast with pre-built templates.',
    icon: <ShoppingBag className="w-5 h-5" />,
    mockup: <StoreMockup />,
  },
  {
    id: 'crm',
    label: 'Your CRM',
    title: 'Your CRM',
    description: 'Effortlessly manage your contacts, schedule appointments, track deals, stay organized, and so much more - all in one convenient platform.',
    icon: <Users className="w-5 h-5" />,
    mockup: <CRMMockup />,
  },
  {
    id: 'email',
    label: 'Your Email Marketing',
    title: 'Your Email Marketing',
    description: 'Connect with your audience directly in their inboxes and build meaningful relationships. Deliver personalized emails, updates, and offers that resonate.',
    icon: <Mail className="w-5 h-5" />,
    mockup: <EmailMockup />,
  },
  {
    id: 'courses',
    label: 'Your Online Courses',
    title: 'Your Online Courses',
    description: 'Package your knowledge into a course, coaching program, or membership site that not only generates revenue but also creates a meaningful impact.',
    icon: <GraduationCap className="w-5 h-5" />,
    mockup: <CourseMockup />,
  },
  {
    id: 'analytics',
    label: 'Your Analytics',
    title: 'Your Analytics',
    description: 'Track performance, understand your audience, and make data-driven decisions. Get real-time insights to grow your business faster than ever.',
    icon: <BarChart3 className="w-5 h-5" />,
    mockup: <AnalyticsMockup />,
  },
];

export default function FeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const activeFeature = features[activeTab];

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIG9wYWNpdHk9Ii4wMiIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm mb-2">Not ready to get started?</p>
          <a href="#features" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium transition-colors">Learn More</a>
        </div>

        <div
          className="flex justify-center gap-2 mb-12 overflow-x-auto pb-4 scrollbar-hide"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => setActiveTab(index)}
              className={`px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeTab === index
                  ? 'bg-cyan-100 text-slate-900 shadow-lg shadow-cyan-500/20'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {feature.label}
            </button>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                {activeFeature.title}
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {activeFeature.description}
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5"
              >
                Try for Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="order-1 lg:order-2">
              <div className="transform transition-all duration-500">
                {activeFeature.mockup}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8 gap-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                activeTab === index ? 'bg-cyan-400 w-8' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
