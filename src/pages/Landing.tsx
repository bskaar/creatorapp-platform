import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Mail, DollarSign, TrendingUp, Users, BarChart3, Zap, CheckCircle2, ArrowRight, Play, MessageCircle, Sparkles, Brain } from 'lucide-react';
import Logo from '../components/Logo';
import DemoModal from '../components/DemoModal';

export default function Landing() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
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
            <h1 id="hero-heading" className="text-6xl lg:text-7xl font-bold leading-tight text-dark">
              Build & Grow Your{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Creator Business
              </span>
              <br />
              With AI-Powered Tools
            </h1>

            <p className="text-xl text-text-secondary leading-relaxed max-w-xl">
              The first all-in-one platform with a built-in AI Co-Founder. Get personalized strategies,
              generate content instantly, and scale your business with Claude-powered intelligence.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-10 py-4 rounded-button font-semibold text-lg hover:shadow-button-hover transition-all duration-300 hover:-translate-y-1"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </Link>
              <button
                onClick={() => setIsDemoOpen(true)}
                className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-button font-semibold text-lg border-2 border-primary hover:bg-primary hover:text-white transition-all duration-300 hover:-translate-y-1"
                aria-label="Watch product demo video"
              >
                <Play className="h-5 w-5" aria-hidden="true" />
                Watch Demo
              </button>
            </div>

            <div className="space-y-4 pt-6">
              <div className="flex gap-12">
                <div>
                  <div className="text-4xl font-bold text-primary">14 Days</div>
                  <div className="text-text-secondary text-base font-bold mt-1">Free Trial</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">$0</div>
                  <div className="text-text-secondary text-base font-bold mt-1">Platform Fees*</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary">Unlimited</div>
                  <div className="text-text-secondary text-base font-bold mt-1">Courses & Students</div>
                </div>
              </div>
              <p className="text-sm text-text-secondary italic">
                *We don't take a cut of your success. Standard Stripe transaction fees apply.
              </p>
            </div>
          </div>

          <div className="relative perspective-1000">
            <div className="bg-white rounded-[20px] p-8 shadow-heavy transform hover:rotate-y-0 transition-transform duration-700 rotate-y-[-5deg]">
              <div className="flex items-center justify-between pb-6 border-b-2 border-border">
                <h3 className="text-2xl font-bold text-dark">Your Dashboard</h3>
              </div>
              <div className="grid grid-cols-2 gap-6 mt-6">
                <div className="bg-gradient-to-br from-light-bg to-white p-6 rounded-2xl border-2 border-border hover:border-primary transition-all hover:-translate-y-2 hover:shadow-medium">
                  <div className="text-sm font-medium text-text-secondary mb-2">Active Students</div>
                  <div className="text-4xl font-bold text-primary mb-3">1,247</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-primary to-accent rounded-full animate-fill-bar"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-light-bg to-white p-6 rounded-2xl border-2 border-border hover:border-accent transition-all hover:-translate-y-2 hover:shadow-medium">
                  <div className="text-sm font-medium text-text-secondary mb-2">Revenue This Month</div>
                  <div className="text-4xl font-bold text-accent mb-3">$24.8K</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-gradient-to-r from-primary to-accent rounded-full animate-fill-bar"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-light-bg to-white p-6 rounded-2xl border-2 border-border hover:border-primary transition-all hover:-translate-y-2 hover:shadow-medium">
                  <div className="text-sm font-medium text-text-secondary mb-2">Course Completion</div>
                  <div className="text-4xl font-bold text-primary mb-3">89%</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[89%] bg-gradient-to-r from-primary to-accent rounded-full animate-fill-bar"></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-light-bg to-white p-6 rounded-2xl border-2 border-border hover:border-accent transition-all hover:-translate-y-2 hover:shadow-medium">
                  <div className="text-sm font-medium text-text-secondary mb-2">Email Open Rate</div>
                  <div className="text-4xl font-bold text-accent mb-3">45%</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-primary to-accent rounded-full animate-fill-bar"></div>
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
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 text-primary px-5 py-2 rounded-button text-sm font-semibold border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4" />
              AI-Powered Platform
            </div>
            <h2 id="features-heading" className="text-5xl lg:text-6xl font-bold text-dark mb-6">
              Your AI Co-Founder.<br/>
              Your Complete Platform.
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              The only creator platform with Claude AI built-in. Get strategic guidance,
              generate content, and automate your workflow—all powered by cutting-edge AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-primary via-primary-dark to-accent rounded-card p-12 border-2 border-primary shadow-heavy hover:shadow-heavy transition-all duration-300 hover:-translate-y-3 group relative overflow-hidden md:col-span-2 lg:col-span-3">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/30 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-[70px] h-[70px] bg-white/20 backdrop-blur-sm rounded-[18px] flex items-center justify-center group-hover:scale-105 transition-all">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white mb-2">AI Co-Founder</h3>
                      <p className="text-white/90 text-lg">Powered by Claude AI</p>
                    </div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold text-sm flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    Available 24/7
                  </div>
                </div>
                <p className="text-white/90 mb-6 leading-relaxed text-lg max-w-3xl">
                  Your personal AI business strategist trained on proven digital marketing frameworks.
                  Get instant advice on funnels, copywriting, product strategy, and growth tactics.
                  It's like having a marketing expert on call whenever you need guidance.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Strategic Gameplans</div>
                      <div className="text-sm text-white/80">Custom business roadmaps</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Content Generation</div>
                      <div className="text-sm text-white/80">Copy, emails, and course outlines</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-white">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Real-Time Coaching</div>
                      <div className="text-sm text-white/80">Chat for instant answers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent transition-all group-hover:rotate-[5deg] group-hover:scale-105">
                <Brain className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">AI Content Tools</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Generate professional content in seconds with AI-powered writing and design tools.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  AI copywriting assistant
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Theme & color palette generator
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Smart image search
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent transition-all group-hover:rotate-[5deg] group-hover:scale-105">
                <Video className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Course Builder</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Create beautiful, engaging courses with our drag-and-drop builder. No coding required.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Video, audio & text content
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Quizzes & assessments
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Drip content scheduling
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent transition-all group-hover:rotate-[5deg] group-hover:scale-105">
                <Mail className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Email Marketing</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Build your list and nurture relationships with powerful email automation.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Automated email sequences
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Beautiful email templates
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Segmentation & tagging
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent transition-all group-hover:rotate-[5deg] group-hover:scale-105">
                <DollarSign className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Smart Payments</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Accept payments seamlessly with our integrated checkout system.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  One-time & subscriptions
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Payment plans & trials
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Global currency support
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent transition-all group-hover:rotate-[5deg] group-hover:scale-105">
                <TrendingUp className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Sales Funnels</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Convert visitors with high-performing landing pages and sales funnels.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Professional templates
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Custom domain support
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Built-in analytics
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent transition-all group-hover:rotate-[5deg] group-hover:scale-105">
                <Users className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Community Building</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Foster engagement with built-in community features and discussion forums.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Discussion boards
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Direct messaging
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Member profiles
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-card p-12 border-2 border-border hover:border-primary transition-all duration-300 hover:-translate-y-3 hover:shadow-medium group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              <div className="w-[70px] h-[70px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-[18px] flex items-center justify-center mb-6 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-accent transition-all group-hover:rotate-[5deg] group-hover:scale-105">
                <BarChart3 className="h-8 w-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-dark mb-4">Advanced Analytics</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Get deep insights into your business performance with real-time analytics.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Revenue tracking
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Engagement metrics
                </li>
                <li className="flex items-center gap-3 text-text-primary">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Custom reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-8 bg-gradient-to-br from-light-bg via-white to-pink-50">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-[30px] p-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                Ready to Transform Your Creator Business?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of successful creators who've already made the switch.
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 bg-white text-primary px-10 py-4 rounded-button font-semibold text-lg hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-heavy"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
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
                The complete solution for modern creator businesses.
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
