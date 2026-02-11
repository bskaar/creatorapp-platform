import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Book, Video, Mail, DollarSign, Layout, Settings, HelpCircle, Sparkles } from 'lucide-react';
import Logo from '../components/Logo';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function Documentation() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const element = categoryRefs.current[categoryName];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const faqCategories = [
    { name: 'AI & Intelligence', icon: Sparkles },
    { name: 'Getting Started', icon: Book },
    { name: 'Courses & Content', icon: Video },
    { name: 'Email Marketing', icon: Mail },
    { name: 'Payments & Pricing', icon: DollarSign },
    { name: 'Pages & Design', icon: Layout },
    { name: 'Account & Settings', icon: Settings },
  ];

  const faqs: FAQItem[] = [
    {
      category: 'AI & Intelligence',
      question: 'What is the AI Co-Founder?',
      answer: 'The AI Co-Founder is your personal business strategist powered by Claude AI, one of the most advanced AI models available. It\'s trained on proven digital marketing frameworks and creator economy expertise. Think of it as having a marketing expert available 24/7 to answer questions, provide strategic guidance, generate content, and help you grow your business.'
    },
    {
      category: 'AI & Intelligence',
      question: 'How do I use the AI Co-Founder?',
      answer: 'You can access the AI Co-Founder from your dashboard by clicking the AI Co-Founder card or the floating AI button throughout the platform. Simply ask questions in natural language, request custom gameplans for your business, or use the suggested prompts to get started. The AI understands context about your business and provides personalized advice.'
    },
    {
      category: 'AI & Intelligence',
      question: 'What can the AI Co-Founder help me with?',
      answer: 'The AI Co-Founder can help with: creating personalized business gameplans, developing sales funnel strategies, writing compelling copy for emails and landing pages, suggesting lead magnet ideas, pricing strategies for your products, course outline creation, email sequence planning, marketing campaign ideas, and answering any business or marketing questions you have.'
    },
    {
      category: 'AI & Intelligence',
      question: 'What other AI features are available?',
      answer: 'Beyond the AI Co-Founder chat, CreatorApp includes several AI-powered tools: AI copywriting assistant to generate professional sales copy and content, theme generator that creates custom color palettes and visual themes for your brand, smart image search powered by AI, and content suggestions throughout the platform to help you work faster and more effectively.'
    },
    {
      category: 'AI & Intelligence',
      question: 'Is there a limit on AI usage?',
      answer: 'AI features are included with all paid plans. Usage limits vary by plan tier - check your plan details in Settings for specific limits. The AI Co-Founder is designed to be used regularly as part of your daily workflow. If you need higher usage limits, you can upgrade to a higher tier plan.'
    },
    {
      category: 'AI & Intelligence',
      question: 'How accurate and reliable is the AI Co-Founder?',
      answer: 'The AI Co-Founder is powered by Claude AI and provides advice based on proven marketing frameworks and best practices. While it\'s an incredibly powerful tool, it\'s designed to augment your decision-making, not replace it. Always review and adapt AI suggestions to fit your specific business context and audience.'
    },
    {
      category: 'Getting Started',
      question: 'How do I get started with CreatorApp?',
      answer: 'Getting started is simple! Click "Sign Up" to create your free account. You\'ll enter your email and password, then choose a unique name for your creator site. Next, select a template that fits your brand, and you\'re ready to start building. Credit card required to start your 14-day free trial - you won\'t be charged until the trial ends.'
    },
    {
      category: 'Getting Started',
      question: 'Do I need technical skills to use CreatorApp?',
      answer: 'No technical skills required! CreatorApp is designed for creators, not developers. Our drag-and-drop builder, intuitive interface, pre-built templates, and AI Co-Founder make it easy for anyone to create professional courses and websites without coding knowledge. Plus, the AI can guide you through any questions you have along the way.'
    },
    {
      category: 'Getting Started',
      question: 'What is included in the free trial?',
      answer: 'Your 14-day free trial includes full access to all CreatorApp features: AI Co-Founder and AI-powered tools, course creation, email marketing, payment processing, landing pages, analytics, and more. Credit card required to begin trial, but you won\'t be charged until the 14 days are up. You can explore everything and decide which plan is right for you, or cancel anytime during the trial at no cost.'
    },
    {
      category: 'Courses & Content',
      question: 'How do I create my first course?',
      answer: 'Navigate to the Content section and click "New Product." Choose "Course" as your product type, give it a name and description, set your pricing, and click Create. Then you can add lessons with video, audio, text, quizzes, and downloadable resources using our easy course builder.'
    },
    {
      category: 'Courses & Content',
      question: 'What types of content can I add to my courses?',
      answer: 'You can add multiple content types to your courses: video lessons, audio files, text content with rich formatting, downloadable PDFs and resources, quizzes and assessments, and embedded content. Mix and match to create engaging learning experiences.'
    },
    {
      category: 'Courses & Content',
      question: 'Can I drip-release content over time?',
      answer: 'Yes! CreatorApp supports drip content scheduling. You can set specific dates when lessons become available, or release content based on when a student enrolls (e.g., Day 1, Day 7, etc.). This helps maintain engagement and prevents students from feeling overwhelmed.'
    },
    {
      category: 'Courses & Content',
      question: 'How do I organize my content into modules?',
      answer: 'Within each course, you can create sections or modules to organize related lessons. Simply group lessons together, name each section, and arrange them in the order you want students to progress through the material.'
    },
    {
      category: 'Email Marketing',
      question: 'How does email marketing work in CreatorApp?',
      answer: 'CreatorApp includes built-in email marketing tools. You can create broadcast emails to send to all or specific segments of your audience, set up automated email sequences that trigger based on user actions, and use beautiful email templates that match your brand.'
    },
    {
      category: 'Email Marketing',
      question: 'Can I segment my email list?',
      answer: 'Yes! You can segment your audience based on tags, purchase history, course enrollment, engagement level, and custom criteria. This allows you to send targeted messages to the right people at the right time.'
    },
    {
      category: 'Email Marketing',
      question: 'What email automation options are available?',
      answer: 'You can create automated email sequences for welcome series, course completion follow-ups, abandoned cart reminders, post-purchase nurture sequences, and custom workflows based on user behavior and tags.'
    },
    {
      category: 'Payments & Pricing',
      question: 'How do I set up payments?',
      answer: 'CreatorApp uses Stripe for secure payment processing. During setup, you\'ll connect your Stripe account (or create a new one). Once connected, you can immediately start accepting payments for your courses, memberships, and products.'
    },
    {
      category: 'Payments & Pricing',
      question: 'What pricing models can I use?',
      answer: 'CreatorApp supports multiple pricing models: one-time payments, monthly subscriptions, annual subscriptions, payment plans (split payments over time), free trials with automatic conversion, and custom pricing tiers for different access levels.'
    },
    {
      category: 'Payments & Pricing',
      question: 'What are the transaction fees?',
      answer: 'CreatorApp doesn\'t charge any transaction fees on top of your subscription. You only pay standard Stripe processing fees (2.9% + $0.30 per transaction in the US). Keep more of your revenue compared to platforms that charge additional platform fees.'
    },
    {
      category: 'Payments & Pricing',
      question: 'Can I offer discounts and coupons?',
      answer: 'Yes! You can create discount codes for fixed amounts or percentages, set expiration dates, limit the number of uses, and apply discounts to specific products or your entire catalog. Perfect for launches, promotions, and special offers.'
    },
    {
      category: 'Pages & Design',
      question: 'How do I customize my site design?',
      answer: 'Start by selecting one of our professionally designed templates. Then use the drag-and-drop page editor to customize colors, fonts, images, and layout. Add or remove sections, upload your logo, and make it match your brand—no coding required.'
    },
    {
      category: 'Pages & Design',
      question: 'Can I use my own domain name?',
      answer: 'Yes! You can connect your custom domain (e.g., yoursite.com) to your CreatorApp site. We\'ll guide you through the DNS setup process, and you can manage your domain settings in the Settings section. SSL certificates are included automatically.'
    },
    {
      category: 'Pages & Design',
      question: 'What types of pages can I create?',
      answer: 'You can create various page types: sales pages for your products, landing pages to capture leads, about pages to tell your story, custom pages for any purpose, blog posts (coming soon), and checkout pages (automatically generated). Use our templates or start from scratch.'
    },
    {
      category: 'Pages & Design',
      question: 'Is my site mobile-responsive?',
      answer: 'Absolutely! All CreatorApp templates and pages are fully responsive and optimized for mobile devices. Your content will look great on phones, tablets, and desktop computers automatically.'
    },
    {
      category: 'Account & Settings',
      question: 'How do I change my subscription plan?',
      answer: 'Go to Settings > Subscription to view your current plan and available options. You can upgrade or downgrade at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing period.'
    },
    {
      category: 'Account & Settings',
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from the Settings page. You\'ll retain access to your account and all features until the end of your current billing period. No cancellation fees or penalties.'
    },
    {
      category: 'Account & Settings',
      question: 'How do I invite team members?',
      answer: 'In Settings > Team, you can invite team members by email. Assign different permission levels (Admin, Editor, Viewer) to control what each team member can access and modify on your site.'
    },
    {
      category: 'Account & Settings',
      question: 'Is my data secure?',
      answer: 'Security is our top priority. We use bank-level encryption (SSL/TLS), secure data centers, regular security audits, automatic backups, and comply with GDPR and other data protection regulations. Your data and your students\' data are safe with CreatorApp.'
    },
    {
      category: 'Account & Settings',
      question: 'What analytics are available?',
      answer: 'CreatorApp provides comprehensive analytics including: revenue tracking, student enrollment and completion rates, email open and click rates, page views and conversion metrics, traffic sources, and custom reports. Access all analytics from your Dashboard.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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

      <section className="pt-32 pb-12 px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-[1200px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <HelpCircle className="h-4 w-4" />
            Documentation & FAQ
          </div>
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            How Can We <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Help You?</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to common questions and learn how to make the most of CreatorApp
          </p>
        </div>
      </section>

      <section className="py-12 px-8 bg-white">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {faqCategories.map((category) => (
              <button
                key={category.name}
                onClick={() => scrollToCategory(category.name)}
                className={`bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 transition-all hover:shadow-lg text-center cursor-pointer transform hover:scale-105 ${
                  selectedCategory === category.name
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-500'
                }`}
              >
                <category.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-sm font-semibold text-gray-700">{category.name}</div>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const showCategoryHeader = index === 0 || faqs[index - 1].category !== faq.category;

              return (
                <div key={index}>
                  {showCategoryHeader && (
                    <h2
                      ref={(el) => (categoryRefs.current[faq.category] = el)}
                      className="text-2xl font-bold text-gray-900 mt-12 mb-6 flex items-center gap-3 scroll-mt-24"
                    >
                      {faqCategories.find(cat => cat.name === faq.category)?.icon && (
                        <>
                          {(() => {
                            const CategoryIcon = faqCategories.find(cat => cat.name === faq.category)!.icon;
                            return <CategoryIcon className="h-7 w-7 text-blue-600" />;
                          })()}
                        </>
                      )}
                      {faq.category}
                    </h2>
                  )}
                  <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 text-lg pr-4">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="h-6 w-6 text-blue-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Our support team is here to help you succeed. Reach out anytime!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@creatorapp.us"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Mail className="h-5 w-5" />
              Email Support
            </a>
            <Link
              to="/pages/contact"
              className="inline-flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all duration-300"
            >
              Contact Us
            </Link>
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
            <Link to="/pages/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-sm text-gray-600">
            © 2026 CreatorApp. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
