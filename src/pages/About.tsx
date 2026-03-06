import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Zap, Shield, Users, Globe, BookOpen, Mail, CreditCard, BarChart3, Layout, Sparkles } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

export default function About() {
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
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              About <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">CreatorApp</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Empowering creators to build, grow, and monetize their businesses with an all-in-one platform designed for success.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                CreatorApp was built with a simple yet powerful mission: to give creators the tools they need to succeed without the technical complexity that holds them back.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                We believe every creator deserves access to professional-grade tools that are easy to use, affordable, and designed specifically for their unique needs. Whether you're launching your first online course, building a membership community, or scaling a coaching business, CreatorApp provides everything you need in one integrated platform.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                No more juggling multiple tools, paying for separate subscriptions, or dealing with complicated integrations. CreatorApp brings it all together seamlessly.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-12 flex items-center justify-center">
              <div className="relative w-72 h-72">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 shadow-xl shadow-cyan-500/30 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                </div>

                {[
                  { Icon: BookOpen, label: 'Courses', angle: 0 },
                  { Icon: Mail, label: 'Email', angle: 60 },
                  { Icon: Users, label: 'Community', angle: 120 },
                  { Icon: CreditCard, label: 'Payments', angle: 180 },
                  { Icon: BarChart3, label: 'Analytics', angle: 240 },
                  { Icon: Layout, label: 'Website', angle: 300 },
                ].map(({ Icon, label, angle }, index) => {
                  const radius = 110;
                  const x = Math.cos((angle - 90) * Math.PI / 180) * radius;
                  const y = Math.sin((angle - 90) * Math.PI / 180) * radius;
                  return (
                    <div
                      key={index}
                      className="absolute left-1/2 top-1/2"
                      style={{ transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` }}
                    >
                      <div className="absolute left-1/2 top-1/2 w-px bg-gradient-to-b from-cyan-400/60 to-blue-400/60"
                        style={{
                          height: `${radius - 48}px`,
                          transformOrigin: 'top center',
                          transform: `translate(-50%, 0) rotate(${angle + 180}deg)`,
                        }}
                      />
                      <div className="relative flex flex-col items-center">
                        <div className="w-14 h-14 rounded-full bg-white shadow-lg border-2 border-cyan-200 flex items-center justify-center transition-transform hover:scale-110">
                          <Icon className="h-6 w-6 text-cyan-600" />
                        </div>
                        <span className="mt-1 text-xs font-medium text-gray-600">{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-200">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Creator-First</h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature is designed with creators in mind. We listen to your feedback and continuously improve based on your needs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-white p-8 rounded-2xl border-2 border-cyan-200">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple & Powerful</h3>
              <p className="text-gray-600 leading-relaxed">
                Complex features made simple. Get up and running in minutes, not weeks. No technical expertise required.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-2xl border-2 border-teal-200">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure & Reliable</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level security, 99.9% uptime, and enterprise-grade infrastructure you can count on.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Creators Choose CreatorApp</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful creators who trust CreatorApp to power their businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <Users className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">All-in-One Platform</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Course hosting, email marketing, payment processing, community building, and analytics—all in one place.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>No need for multiple tools or integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Save money on subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-500 mt-1">•</span>
                  <span>Everything works together seamlessly</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <Globe className="h-12 w-12 text-cyan-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Built for Growth</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Start small and scale big. Our platform grows with you, from your first student to thousands.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Unlimited courses and products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Advanced automation tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Powerful analytics and insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Build Your Creator Business?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Join CreatorApp today and get access to all the tools you need to succeed.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-1"
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
