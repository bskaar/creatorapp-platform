import { Link } from 'react-router-dom';
import { ArrowRight, Target, Heart, Zap, Shield, Users, Globe } from 'lucide-react';
import Logo from '../components/Logo';

export default function About() {
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
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              About <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">CreatorApp</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-12 flex items-center justify-center">
              <Target className="h-64 w-64 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border-2 border-blue-200">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Creator-First</h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature is designed with creators in mind. We listen to your feedback and continuously improve based on your needs.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-2xl border-2 border-purple-200">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple & Powerful</h3>
              <p className="text-gray-600 leading-relaxed">
                Complex features made simple. Get up and running in minutes, not weeks. No technical expertise required.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl border-2 border-green-200">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6">
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

      <section className="py-20 px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Why Creators Choose CreatorApp</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful creators who trust CreatorApp to power their businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">All-in-One Platform</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Course hosting, email marketing, payment processing, community building, and analytics—all in one place.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>No need for multiple tools or integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Save money on subscriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Everything works together seamlessly</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
              <Globe className="h-12 w-12 text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Built for Growth</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Start small and scale big. Our platform grows with you, from your first student to thousands.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Unlimited courses and products</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Advanced automation tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Powerful analytics and insights</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Build Your Creator Business?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Join CreatorApp today and get access to all the tools you need to succeed.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
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
