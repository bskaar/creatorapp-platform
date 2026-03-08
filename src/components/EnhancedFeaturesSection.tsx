import { Video, Mail, DollarSign, TrendingUp, Users, BarChart3, Zap, CheckCircle2, Sparkles } from 'lucide-react';

export default function EnhancedFeaturesSection() {
  const features = [
    {
      icon: TrendingUp,
      title: 'Websites & Funnels',
      description: 'Build beautiful landing pages and high-converting sales funnels with our drag-and-drop page builder.',
      points: ['Drag-and-drop builder', 'Professional templates', 'Custom domain support'],
      color: 'blue',
    },
    {
      icon: Mail,
      title: 'Email Marketing',
      description: 'Create automated email campaigns and sequences that nurture leads and drive sales on autopilot.',
      points: ['Automated sequences', 'Broadcast campaigns', 'Segmentation & tags'],
      color: 'cyan',
    },
    {
      icon: DollarSign,
      title: 'E-Commerce',
      description: 'Sell digital products, online courses, memberships, and physical goods with seamless checkout.',
      points: ['Product management', 'Stripe integration', 'Order management'],
      color: 'teal',
    },
    {
      icon: Video,
      title: 'Webinars & Events',
      description: 'Host live and automated webinars to engage your audience and sell at scale.',
      points: ['Live webinars', 'Automated replays', 'Registration pages'],
      color: 'emerald',
    },
    {
      icon: Users,
      title: 'Contacts & CRM',
      description: 'Manage your audience, track engagement, and build deeper relationships with your customers.',
      points: ['Contact management', 'Activity tracking', 'Custom fields & tags'],
      color: 'blue',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track performance, understand your audience, and make data-driven decisions to grow faster.',
      points: ['Revenue tracking', 'Conversion analytics', 'Custom reports'],
      color: 'cyan',
    },
  ];

  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'group-hover:border-blue-400',
    },
    cyan: {
      gradient: 'from-cyan-500 to-cyan-600',
      bg: 'bg-cyan-50',
      text: 'text-cyan-600',
      border: 'border-cyan-200',
      hover: 'group-hover:border-cyan-400',
    },
    teal: {
      gradient: 'from-teal-500 to-teal-600',
      bg: 'bg-teal-50',
      text: 'text-teal-600',
      border: 'border-teal-200',
      hover: 'group-hover:border-teal-400',
    },
    emerald: {
      gradient: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      hover: 'group-hover:border-emerald-400',
    },
  };

  return (
    <section id="features" className="relative py-24 px-4 sm:px-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 -z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="absolute top-20 right-0 w-72 h-72 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-0 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold border border-blue-500/20 mb-6">
            <Zap className="w-4 h-4" />
            All-In-One Creator Platform
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Everything to Run Your{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Creator Business
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Stop juggling multiple tools. CreatorApp gives you everything you need to build, market, and monetize your online business in one powerful platform.
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-8 md:p-12 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L2c+PC9zdmc+')] opacity-50"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">AI-Powered Platform</h3>
                  <p className="text-blue-200">Work Smarter, Not Harder</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2 border border-white/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Powered by AI
              </div>
            </div>

            <p className="text-blue-100 mb-8 leading-relaxed text-lg max-w-3xl">
              Generate content, design websites, create email campaigns, and analyze performance with AI. CreatorApp's intelligent features help you build and grow faster than ever before.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { title: 'AI Content', desc: 'Generate copy instantly' },
                { title: 'AI Design', desc: 'Beautiful themes' },
                { title: 'AI Analytics', desc: 'Smart insights' },
                { title: 'AI Coach', desc: '24/7 guidance' },
              ].map((item, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/30 to-cyan-400/30 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-cyan-300" />
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-0.5">{item.title}</div>
                      <div className="text-sm text-blue-200">{item.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const colors = colorClasses[feature.color as keyof typeof colorClasses];
            return (
              <div
                key={i}
                className={`group bg-white rounded-2xl p-8 border-2 ${colors.border} ${colors.hover} transition-all duration-500 hover:-translate-y-2 hover:shadow-xl relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                <div className={`absolute inset-0 ${colors.bg} opacity-0 group-hover:opacity-50 transition-opacity duration-500`}></div>

                <div className="relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-5 leading-relaxed">{feature.description}</p>

                  <ul className="space-y-2.5">
                    {feature.points.map((point, j) => (
                      <li key={j} className="flex items-center gap-3 text-slate-700">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center flex-shrink-0`}>
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
