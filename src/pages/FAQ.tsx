import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, Mail, Shield, CreditCard, Rocket, Users, Zap } from 'lucide-react';
import PublicHeader from '../components/PublicHeader';
import PublicFooter from '../components/PublicFooter';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  name: string;
  icon: React.ElementType;
  items: FAQItem[];
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({ '0-0': true });

  const toggleFAQ = (categoryIndex: number, itemIndex: number) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const faqCategories: FAQCategory[] = [
    {
      name: 'General Questions',
      icon: HelpCircle,
      items: [
        {
          question: 'What is CreatorApp?',
          answer: 'CreatorApp is an all-in-one platform designed for creators, coaches, and entrepreneurs to build and grow their online business. It combines website building, course hosting, email marketing, payment processing, and AI-powered business tools in a single, easy-to-use platform.'
        },
        {
          question: 'Who is CreatorApp for?',
          answer: 'CreatorApp is built for online course creators, coaches, consultants, content creators, authors, speakers, and anyone looking to monetize their expertise online. Whether you\'re just starting out or scaling an established business, CreatorApp provides the tools you need.'
        },
        {
          question: 'Do I need technical skills to use CreatorApp?',
          answer: 'No technical skills required! CreatorApp features an intuitive drag-and-drop builder, pre-designed templates, and an AI Co-Founder to guide you every step of the way. If you can use social media or send an email, you can build a professional business with CreatorApp.'
        },
        {
          question: 'What makes CreatorApp different from other platforms?',
          answer: 'CreatorApp stands out with its integrated AI Co-Founder (powered by Claude AI), zero transaction fees on sales, and a true all-in-one approach. Unlike piecing together multiple tools, everything works seamlessly together - from your website to courses to emails to payments.'
        }
      ]
    },
    {
      name: 'Pricing & Plans',
      icon: CreditCard,
      items: [
        {
          question: 'How much does CreatorApp cost?',
          answer: 'CreatorApp offers flexible plans starting at $39/month (Starter), $99/month (Pro), and $199/month (Business). Annual plans save you 20%. All plans include core features, with higher tiers offering more contacts, products, team members, and AI usage.'
        },
        {
          question: 'Is there a free trial?',
          answer: 'Yes! We offer a 14-day free trial with full access to all features. A credit card is required to start, but you won\'t be charged until the trial ends. You can cancel anytime during the trial at no cost.'
        },
        {
          question: 'Are there any transaction fees?',
          answer: 'CreatorApp charges zero platform transaction fees on your sales. You only pay standard Stripe processing fees (2.9% + $0.30 per transaction in the US). This means you keep more of your hard-earned revenue compared to platforms that charge additional fees.'
        },
        {
          question: 'Can I change or cancel my plan anytime?',
          answer: 'Absolutely. You can upgrade, downgrade, or cancel your subscription at any time from your account settings. Upgrades take effect immediately, while downgrades apply at the end of your billing period. No cancellation fees or long-term contracts.'
        }
      ]
    },
    {
      name: 'Getting Started',
      icon: Rocket,
      items: [
        {
          question: 'How quickly can I get started?',
          answer: 'You can have your first page live in under 10 minutes. Sign up, choose a template, customize it with your content, and publish. Our AI Co-Founder can even help you generate copy and plan your business strategy from day one.'
        },
        {
          question: 'What\'s included when I sign up?',
          answer: 'Every account includes: a customizable website with your own subdomain (custom domains available), course and product hosting, email marketing tools, payment processing via Stripe, analytics dashboard, AI Co-Founder access, and responsive customer support.'
        },
        {
          question: 'Do you offer onboarding or training?',
          answer: 'Yes! New users get access to getting-started guides, video tutorials, and our AI Co-Founder which can answer questions and provide personalized guidance 24/7. We also offer email support for any questions that come up.'
        },
        {
          question: 'Can I import content from another platform?',
          answer: 'Yes, you can import existing content into CreatorApp. Our page import tool helps you bring in designs from other websites, and you can easily upload videos, documents, and other content to your courses and pages.'
        }
      ]
    },
    {
      name: 'Security & Trust',
      icon: Shield,
      items: [
        {
          question: 'Is my data secure?',
          answer: 'Security is our top priority. We use bank-level SSL/TLS encryption, secure data centers with regular audits, automatic daily backups, and comply with GDPR and other data protection regulations. Your data and your customers\' data are protected with enterprise-grade security.'
        },
        {
          question: 'How are payments processed?',
          answer: 'All payments are processed securely through Stripe, the world\'s leading payment processor used by companies like Amazon, Google, and Shopify. We never store credit card details on our servers - Stripe handles all sensitive payment information.'
        },
        {
          question: 'Do you sell my data?',
          answer: 'Never. Your data belongs to you. We don\'t sell, rent, or share your personal information or your customers\' information with third parties for marketing purposes. Read our Privacy Policy for complete details on how we protect your data.'
        },
        {
          question: 'What happens to my content if I cancel?',
          answer: 'Your content remains accessible for 30 days after cancellation, giving you time to export anything you need. We can also provide data exports upon request. Your students\' course access depends on your product terms.'
        }
      ]
    },
    {
      name: 'Features & Capabilities',
      icon: Zap,
      items: [
        {
          question: 'What is the AI Co-Founder?',
          answer: 'The AI Co-Founder is your personal business strategist powered by Claude AI. It helps you create business gameplans, write compelling copy, develop marketing strategies, and answer any business questions you have - available 24/7 right in your dashboard.'
        },
        {
          question: 'Can I sell courses and digital products?',
          answer: 'Yes! You can sell online courses with video, audio, text, and downloadable content. Plus digital downloads, coaching packages, memberships, and more. Support for one-time payments, subscriptions, and payment plans.'
        },
        {
          question: 'Is email marketing included?',
          answer: 'Yes, full email marketing is built in. Send broadcasts, create automated sequences, segment your audience, and track opens and clicks. No need for a separate email tool - it\'s all integrated.'
        },
        {
          question: 'Can I use my own domain name?',
          answer: 'Absolutely. You can connect your custom domain (like yourbrand.com) to your CreatorApp site. We include free SSL certificates and guide you through the simple DNS setup process.'
        }
      ]
    },
    {
      name: 'Support',
      icon: Users,
      items: [
        {
          question: 'What support options are available?',
          answer: 'All plans include email support with fast response times. You also have 24/7 access to the AI Co-Founder for instant answers, plus comprehensive documentation and video tutorials in our Help Center (available after sign-in).'
        },
        {
          question: 'How quickly do you respond to support requests?',
          answer: 'We aim to respond to all support emails within 24 hours during business days, and often much faster. Urgent issues are prioritized. The AI Co-Founder is available instantly for common questions and guidance.'
        },
        {
          question: 'Is there a community or user forum?',
          answer: 'We\'re building a creator community where you can connect with other CreatorApp users, share strategies, and learn from each other. Stay tuned for updates!'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <PublicHeader variant="dark" />

      <section className="pt-28 pb-12 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:24px_24px]"></div>

        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-cyan-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
            <HelpCircle className="h-4 w-4" />
            Frequently Asked Questions
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Got <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Questions?</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Find answers to common questions about CreatorApp, pricing, features, and getting started
          </p>
        </div>
      </section>

      <section className="py-16 px-8 bg-white">
        <div className="max-w-[900px] mx-auto">
          {faqCategories.map((category, categoryIndex) => (
            <div key={category.name} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
              </div>

              <div className="space-y-3">
                {category.items.map((faq, itemIndex) => {
                  const key = `${categoryIndex}-${itemIndex}`;
                  const isOpen = openItems[key];

                  return (
                    <div
                      key={itemIndex}
                      className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-cyan-400 transition-all"
                    >
                      <button
                        onClick={() => toggleFAQ(categoryIndex, itemIndex)}
                        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 text-lg pr-4">{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp className="h-6 w-6 text-cyan-600 flex-shrink-0" />
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
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-8 bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-gray-300 mb-10">
            Start your 14-day free trial today. No risk, cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:shadow-xl hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-1"
            >
              <Rocket className="h-5 w-5" />
              Start Free Trial
            </Link>
            <a
              href="mailto:support@creatorapp.us"
              className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm text-white border-2 border-white/20 px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              <Mail className="h-5 w-5" />
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
