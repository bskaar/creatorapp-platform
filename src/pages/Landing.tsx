import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Mail, DollarSign, TrendingUp, Users, BarChart3, Zap, CheckCircle2, ArrowRight, Play, MessageCircle, Sparkles, Brain } from 'lucide-react';
import Logo from '../components/Logo';
import DemoModal from '../components/DemoModal';
import StructuredData, { organizationSchema, softwareApplicationSchema } from '../components/StructuredData';

export default function Landing() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

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
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100" aria-label="Main navigation">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <Logo variant="light" className="scale-125" />
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-text-primary hover:text-primary font-medium transition-colors relative group">
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </a>
              <Link to="/pricing" className="text-text-primary hover:text-primary font-medium transition-colors relative group">
                Pricing
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link to="/login" className="text-text-primary hover:text-primary font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-gradient-to-r from-primary to-primary-dark text-white px-7 py-3 rounded-button font-semibold hover:shadow-button-hover transition-all duration-300 hover:-translate-y-0.5"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content">
      <section className="pt-32 pb-20 px-8 relative overflow-hidden bg-gradient-to-br from-light-bg via-white to-pink-50" aria-labelledby="hero-heading">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px] -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[150px] -z-10"></div>

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold border border-blue-500/20 mb-2">
              <Sparkles className="w-4 h-4" />
              AI-Powered Creator Platform
            </div>
            <h1 id="hero-heading" className="text-6xl lg:text-7xl font-bold leading-tight text-dark">
              Build Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Creator Business
              </span>
              {' '}All in One Place
            </h1>

            <p className="text-xl text-text-secondary leading-relaxed max-w-xl">
              Everything you need to create, launch, and scale your online business. Build websites, sell products, run email campaigns, and grow your audience with AI-powered tools.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex gap-12">
                <div>
                  <div className="text-4xl font-bold text-blue-600">5,000+</div>
                  <div className="text-text-secondary text-base font-bold mt-1">Creators</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600">$10M+</div>
                  <div className="text-text-secondary text-base font-bold mt-1">Revenue Generated</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600">99%</div>
                  <div className="text-text-secondary text-base font-bold mt-1">Uptime</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-[20px] p-8 shadow-heavy">
              <div className="flex items-center gap-3 pb-6 border-b-2 border-border">
                <Zap className="h-8 w-8 text-blue-600" />
                <h3 className="text-2xl font-bold text-dark">Everything You Need</h3>
              </div>
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:-translate-y-1 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-dark mb-1">Websites & Funnels</div>
                    <div className="text-sm text-text-secondary">Build professional sites and high-converting funnels</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:-translate-y-1 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-dark mb-1">Email Marketing</div>
                    <div className="text-sm text-text-secondary">Automated campaigns and sequences that convert</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:-translate-y-1 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-dark mb-1">E-Commerce</div>
                    <div className="text-sm text-text-secondary">Sell products, courses, and memberships seamlessly</div>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:-translate-y-1 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-dark mb-1">AI-Powered Tools</div>
                    <div className="text-sm text-text-secondary">Generate content, designs, and strategies with AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-32 px-8 bg-gradient-to-b from-white to-light-bg" aria-labelledby="features-heading">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 px-5 py-2 rounded-full text-sm font-semibold border border-blue-500/20 mb-6">
              <Zap className="w-4 h-4" />
              All-In-One Creator Platform
            </div>
            <h2 id="features-heading" className="text-5xl lg:text-6xl font-bold text-dark mb-6">
              Everything to Run<br/>
              Your Creator Business
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Stop juggling multiple tools. CreatorApp gives you everything you need to build, market, and monetize your online business in one powerful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 rounded-card p-12 border-2 border-blue-600 shadow-heavy hover:shadow-heavy transition-all duration-300 hover:-translate-y-3 group relative overflow-hidden md:col-span-2 lg:col-span-3">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/30 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-[70px] h-[70px] bg-white/20 backdrop-blur-sm rounded-[18px] flex items-center justify-center group-hover:scale-105 transition-all">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">AI-Powered Platform</h3>
                      <p className="text-white/90 text-lg">Work Smarter, Not Harder</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Powered by AI
                  </div>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed text-lg max-w-3xl">
                  Generate content, design websites, create email campaigns, and analyze performance with AI. CreatorApp's intelligent features help you build and grow faster than ever before.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex items-start gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">AI Content</div>
                      <div className="text-sm text-white/80">Generate copy instantly</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">AI Design</div>
                      <div className="text-sm text-white/80">Beautiful themes</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">AI Analytics</div>
                      <div className="text-sm text-white/80">Smart insights</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">AI Coach</div>
                      <div className="text-sm text-white/80">24/7 guidance</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-blue-600 transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark">Websites & Funnels</h3>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Build beautiful landing pages and high-converting sales funnels with our drag-and-drop page builder.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Drag-and-drop builder
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Professional templates
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Custom domain support
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-blue-600 transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark">Email Marketing</h3>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Create automated email campaigns and sequences that nurture leads and drive sales on autopilot.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Automated sequences
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Broadcast campaigns
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Segmentation & tags
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-blue-600 transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark">E-Commerce</h3>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Sell digital products, online courses, memberships, and physical goods with seamless checkout.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Product management
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Stripe integration
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Order management
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-blue-600 transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark">Webinars & Events</h3>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Host live and automated webinars to engage your audience and sell at scale.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Live webinars
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Automated replays
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Registration pages
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-blue-600 transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark">Contacts & CRM</h3>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Manage your audience, track engagement, and build deeper relationships with your customers.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Contact management
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Activity tracking
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Custom fields & tags
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-blue-600 transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-dark">Analytics & Insights</h3>
              </div>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Track performance, understand your audience, and make data-driven decisions to grow faster.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Revenue tracking
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Conversion analytics
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Custom reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-8 bg-gradient-to-br from-light-bg via-white to-blue-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[30px] p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Build Your Creator Business?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of creators using CreatorApp to build, grow, and monetize their online businesses. Start your free trial today.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-heavy"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  14-Day Free Trial
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  No Credit Card Required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Cancel Anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      <footer className="bg-dark text-gray-400 py-16 px-8" role="contentinfo">
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
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link to="/pages/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
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
          <div className="border-t border-gray-800 pt-8 text-sm text-center text-gray-600">
            © 2026 CreatorApp. All rights reserved.
          </div>
        </div>
      </footer>

      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

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
