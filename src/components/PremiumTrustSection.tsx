import { Link } from 'react-router-dom';
import { Shield, Lock, CreditCard, ArrowRight, CheckCircle2, Zap, Globe, Headphones } from 'lucide-react';

export default function PremiumTrustSection() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-100/50 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold border border-blue-500/20 mb-6">
            <Shield className="w-4 h-4" />
            Built for Creators Who Mean Business
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Professional tools, rock-solid infrastructure, and the support you need - without the technical headaches.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {[
            {
              icon: Shield,
              title: 'Secure Platform',
              description: 'SSL encryption on all sites. Your data and your customers\' data is protected.',
              gradient: 'from-blue-500 to-blue-600',
              bgGradient: 'from-blue-50 to-blue-100',
            },
            {
              icon: Lock,
              title: 'You Own Your Data',
              description: 'Export your contacts, content, and data anytime. No lock-in, no restrictions.',
              gradient: 'from-teal-500 to-teal-600',
              bgGradient: 'from-teal-50 to-teal-100',
            },
            {
              icon: CreditCard,
              title: 'No Platform Fees',
              description: '$0 fees on your sales. Simple subscription - we never take a cut of your revenue.',
              gradient: 'from-cyan-500 to-cyan-600',
              bgGradient: 'from-cyan-50 to-cyan-100',
            },
            {
              icon: Headphones,
              title: 'Expert Support',
              description: 'Real humans ready to help. Get answers fast so you can focus on growing.',
              gradient: 'from-emerald-500 to-emerald-600',
              bgGradient: 'from-emerald-50 to-emerald-100',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-500`}></div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:from-blue-500 group-hover:via-cyan-500 group-hover:to-teal-500 rounded-t-2xl transition-all duration-500"></div>

              <div className="relative">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-3xl p-10 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-blue-400/10 via-cyan-400/20 to-blue-400/10 rounded-full blur-3xl rotate-12"></div>

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                Limited Time Offer
              </div>

              <h3 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Start Building Your Business Today
              </h3>
              <p className="text-lg md:text-xl text-white/90 mb-10 max-w-xl mx-auto leading-relaxed">
                Get started with a 14-day free trial. Credit card required, but you won't be charged until after your trial ends.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50 to-blue-50/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
                  <span className="relative">Start Your Free Trial</span>
                  <ArrowRight className="h-5 w-5 relative group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
                >
                  <Globe className="h-5 w-5" />
                  View Pricing
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/80">
                {['14-Day Free Trial', 'Credit Card Required', 'Cancel Anytime'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
