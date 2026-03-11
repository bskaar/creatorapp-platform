import { useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Book, Video, Mail, DollarSign, LayoutGrid as Layout, Settings, Sparkles, Search, ExternalLink, Calendar } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery('');
    const element = categoryRefs.current[categoryName];
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  const faqCategories = [
    { name: 'AI & Intelligence', icon: Sparkles },
    { name: 'Courses & Content', icon: Video },
    { name: 'Webinars & Events', icon: Calendar },
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
      answer: 'AI features are included with all paid plans. Usage limits vary by plan tier - check your plan details in Settings > Subscription for specific limits. The AI Co-Founder is designed to be used regularly as part of your daily workflow. If you need higher usage limits, you can upgrade to a higher tier plan.'
    },
    {
      category: 'AI & Intelligence',
      question: 'How accurate and reliable is the AI Co-Founder?',
      answer: 'The AI Co-Founder is powered by Claude AI and provides advice based on proven marketing frameworks and best practices. While it\'s an incredibly powerful tool, it\'s designed to augment your decision-making, not replace it. Always review and adapt AI suggestions to fit your specific business context and audience.'
    },
    {
      category: 'AI & Intelligence',
      question: 'How is my data protected when using AI features?',
      answer: 'We take your privacy seriously. When you use AI features, we anonymize personally identifiable information (PII) before processing. This means names, emails, phone numbers and other identifying details are removed or masked before being sent to AI providers. Your data is NOT used to train AI models - we use API access only.'
    },
    {
      category: 'AI & Intelligence',
      question: 'Which AI providers power CreatorApp features?',
      answer: 'We use trusted AI providers including Anthropic (Claude) and OpenAI. Our intelligent model orchestration system automatically selects the best AI model for each task based on complexity, ensuring optimal results. This means simple tasks use faster models while complex tasks use more powerful ones.'
    },
    {
      category: 'AI & Intelligence',
      question: 'What AI-generated content is stored?',
      answer: 'We store usage metrics to track your AI usage against plan limits, content you explicitly save (like gameplans and generated copy), and conversation history within chat sessions. You own all content you generate using AI features, and you can request deletion of AI-related data through support.'
    },
    {
      category: 'AI & Intelligence',
      question: 'Can I use CreatorApp without AI features?',
      answer: 'Yes! AI features are optional enhancements. All core functionality - website building, course hosting, email marketing, payment processing, and analytics - works independently without using AI. You can choose when and if to use AI assistance.'
    },
    {
      category: 'Courses & Content',
      question: 'How do I create my first course?',
      answer: 'Navigate to the Content section from your dashboard and click "New Product." Choose "Course" as your product type, give it a name and description, set your pricing, and click Create. Then you can add lessons with video, audio, text, quizzes, and downloadable resources using our easy course builder.'
    },
    {
      category: 'Courses & Content',
      question: 'What types of content can I add to my courses?',
      answer: 'You can add multiple content types to your courses: video lessons (upload or embed from YouTube/Vimeo), audio files, text content with rich formatting, downloadable PDFs and resources, quizzes and assessments, and embedded content. Mix and match to create engaging learning experiences.'
    },
    {
      category: 'Courses & Content',
      question: 'Can I drip-release content over time?',
      answer: 'Yes! CreatorApp supports drip content scheduling. You can set specific dates when lessons become available, or release content based on when a student enrolls (e.g., Day 1, Day 7, etc.). This helps maintain engagement and prevents students from feeling overwhelmed. Configure drip settings in each lesson\'s settings panel.'
    },
    {
      category: 'Courses & Content',
      question: 'How do I organize my content into modules?',
      answer: 'Within each course, you can create sections or modules to organize related lessons. Simply group lessons together, name each section, and arrange them in the order you want students to progress through the material. Drag and drop to reorder sections and lessons easily.'
    },
    {
      category: 'Courses & Content',
      question: 'How do students access purchased courses?',
      answer: 'After purchase, students receive an email with login instructions. They can access their courses through your site\'s student portal. Course progress is automatically tracked, and students can resume where they left off. You can view student progress in the Analytics section.'
    },
    {
      category: 'Webinars & Events',
      question: 'How do webinars work in CreatorApp?',
      answer: 'CreatorApp provides a webinar registration and replay management system that integrates with your preferred streaming platform (YouTube Live, Zoom, Vimeo, etc.). You create a webinar event, share the registration link, collect attendee signups, and then host your live stream on your external platform. After the event, you can offer replay access through CreatorApp.'
    },
    {
      category: 'Webinars & Events',
      question: 'How do I create a webinar?',
      answer: 'Go to Webinars from your dashboard and click "New Webinar." Fill in the title, description, date/time, timezone, and duration. Choose your webinar type (live, automated, or hybrid). Add your stream URL (the link to your YouTube Live, Zoom meeting, or other platform). Optionally set a maximum attendee limit and configure replay settings. Click Create to publish your webinar.'
    },
    {
      category: 'Webinars & Events',
      question: 'What is the difference between live, automated, and hybrid webinars?',
      answer: 'Live webinars happen in real-time at the scheduled date. Automated webinars play a pre-recorded video on a schedule, appearing live to attendees. Hybrid webinars combine both approaches - you might have a recorded presentation but answer questions live. Choose the type that fits your content and availability.'
    },
    {
      category: 'Webinars & Events',
      question: 'Where do I host my actual webinar stream?',
      answer: 'CreatorApp handles registration and replay management, but you host the live stream on an external platform. Popular options include YouTube Live (free, unlimited attendees), Zoom (requires paid plan for longer sessions), Vimeo Livestream, or any platform that provides a viewable link. Add your stream URL when creating the webinar.'
    },
    {
      category: 'Webinars & Events',
      question: 'How do I share my webinar registration link?',
      answer: 'After creating a webinar, copy the registration URL from the webinar details. Share this link in your emails, landing pages, social media, or anywhere you promote your event. When people visit the link, they see your webinar details and can register with their email address.'
    },
    {
      category: 'Webinars & Events',
      question: 'Can I limit the number of attendees?',
      answer: 'Yes! When creating or editing a webinar, you can set a maximum attendee limit. Once that number of people register, the webinar shows as "full" and no more registrations are accepted. This is useful for creating urgency or managing capacity for interactive sessions.'
    },
    {
      category: 'Webinars & Events',
      question: 'How do I enable webinar replays?',
      answer: 'In your webinar settings, toggle "Enable Replay" to on. Set a replay delay (how many hours after the live event before the replay becomes available - use 0 for immediate access). Add your replay URL (usually a YouTube or Vimeo video link). Registered attendees can then access the replay through your site.'
    },
    {
      category: 'Webinars & Events',
      question: 'How do attendees access the replay?',
      answer: 'Registered attendees visit the replay page and verify their email address. If they are registered and the replay delay period has passed, they can view the embedded replay video. Unregistered visitors are prompted to register first. Replay views are tracked in your webinar analytics.'
    },
    {
      category: 'Webinars & Events',
      question: 'Are webinar registrants added to my contact list?',
      answer: 'Yes! When someone registers for your webinar, they are automatically added to your Contacts with a "webinar" source tag. This allows you to follow up with attendees, add them to email sequences, and track their engagement across your platform.'
    },
    {
      category: 'Webinars & Events',
      question: 'How do I track webinar attendance and engagement?',
      answer: 'View your webinar analytics to see registration counts, attendance data, and replay views. The system tracks who registered, when they registered, and replay engagement. Use this data to follow up with attendees and improve future webinars.'
    },
    {
      category: 'Webinars & Events',
      question: 'Can I cancel or reschedule a webinar?',
      answer: 'Yes. Edit your webinar to change the date/time, or change the status to "cancelled" if needed. Registered attendees are not automatically notified of changes, so you should send an email announcement to your registrant list to inform them of any schedule changes or cancellations.'
    },
    {
      category: 'Webinars & Events',
      question: 'How do I send the streaming link to registrants?',
      answer: 'Currently, you need to send the stream URL to registrants via email. Create an email campaign targeting your webinar registrants (they are automatically tagged in your Contacts). Include the streaming link, date/time reminder, and any instructions for joining. Schedule this email to send shortly before your webinar starts.'
    },
    {
      category: 'Email Marketing',
      question: 'How does email marketing work in CreatorApp?',
      answer: 'CreatorApp includes built-in email marketing tools accessible from the Email section. You can create broadcast emails to send to all or specific segments of your audience, set up automated email sequences that trigger based on user actions, and use beautiful email templates that match your brand.'
    },
    {
      category: 'Email Marketing',
      question: 'Can I segment my email list?',
      answer: 'Yes! Navigate to Contacts > Segments to create audience segments. You can segment based on tags, purchase history, course enrollment, engagement level, and custom criteria. This allows you to send targeted messages to the right people at the right time.'
    },
    {
      category: 'Email Marketing',
      question: 'What email automation options are available?',
      answer: 'In the Automations section, you can create automated email sequences for: welcome series for new subscribers, course completion follow-ups, abandoned cart reminders, post-purchase nurture sequences, and custom workflows based on user behavior and tags. Set triggers, delays, and conditions to create sophisticated automation flows.'
    },
    {
      category: 'Email Marketing',
      question: 'How do I send a broadcast email?',
      answer: 'Go to Email > Campaigns and click "New Campaign." Choose your recipient segment, compose your email using the visual editor, preview it, and schedule or send immediately. Track opens, clicks, and other metrics in the campaign analytics.'
    },
    {
      category: 'Email Marketing',
      question: 'How do I add contacts to my email list?',
      answer: 'Contacts are added automatically when someone purchases a product, signs up through your forms, or registers for a webinar. You can also add contacts manually from Contacts > Add Contact, or import a CSV file. Use tags to organize your contacts.'
    },
    {
      category: 'Payments & Pricing',
      question: 'How do I set up Stripe payments?',
      answer: 'Go to Settings > Payment and click "Connect Stripe." You\'ll be redirected to Stripe to either log in to your existing account or create a new one. Once connected, you can immediately start accepting payments for your products. Stripe handles all secure payment processing.'
    },
    {
      category: 'Payments & Pricing',
      question: 'What pricing models can I use?',
      answer: 'CreatorApp supports multiple pricing models for your products: one-time payments, monthly subscriptions, annual subscriptions, payment plans (split payments over time), free trials with automatic conversion, and free products for lead generation. Configure pricing in the product editor.'
    },
    {
      category: 'Payments & Pricing',
      question: 'How do I create a payment plan?',
      answer: 'When editing a product\'s pricing, select "Payment Plan" and configure the number of payments, amount per payment, and payment interval. For example, 3 payments of $99 each, charged monthly. Students get immediate access while paying over time.'
    },
    {
      category: 'Payments & Pricing',
      question: 'Can I offer discounts and coupons?',
      answer: 'Yes! In Commerce > Settings, you can create discount codes for fixed amounts or percentages, set expiration dates, limit the number of uses, and apply discounts to specific products or your entire catalog. Share coupon codes in emails, on landing pages, or directly with customers.'
    },
    {
      category: 'Payments & Pricing',
      question: 'Where do I view my sales and revenue?',
      answer: 'Your Analytics dashboard shows revenue metrics including total sales, revenue by product, conversion rates, and trends over time. For individual transactions, go to Commerce > Orders to see all orders, payment status, and customer details.'
    },
    {
      category: 'Pages & Design',
      question: 'How do I customize my site design?',
      answer: 'Go to Settings > Site to customize your brand colors, logo, and favicon. For page-level design, use the Page Editor with our drag-and-drop builder. Add blocks, customize colors, fonts, images, and layout. Changes are previewed in real-time before publishing.'
    },
    {
      category: 'Pages & Design',
      question: 'How do I connect my custom domain?',
      answer: 'Go to Settings > Domain and enter your domain name. We\'ll provide the DNS records you need to add at your domain registrar (like GoDaddy, Namecheap, etc.). Once DNS propagates (usually within an hour), your custom domain will be active with automatic SSL.'
    },
    {
      category: 'Pages & Design',
      question: 'What types of pages can I create?',
      answer: 'In Pages, you can create: sales pages for your products, landing pages to capture leads, about pages to tell your story, and custom pages for any purpose. Use our templates or start from scratch with the block editor. Checkout pages are automatically generated for products.'
    },
    {
      category: 'Pages & Design',
      question: 'How do I use the page editor?',
      answer: 'Open any page and click Edit. Use the left sidebar to add blocks like headers, text, images, videos, testimonials, pricing tables, and more. Click any block to edit its content and styling. Drag blocks to reorder them. Preview your changes and click Publish when ready.'
    },
    {
      category: 'Pages & Design',
      question: 'Can I save and reuse custom blocks?',
      answer: 'Yes! After customizing a block, click the save icon to add it to your Custom Blocks library. You can then reuse these blocks across any page. Great for maintaining consistent headers, testimonials, or other frequently used sections.'
    },
    {
      category: 'Account & Settings',
      question: 'How do I change my subscription plan?',
      answer: 'Go to Settings > Subscription to view your current plan and available options. Click "Manage Subscription" to upgrade or downgrade. Upgrades take effect immediately with prorated billing, while downgrades take effect at the end of your current billing period.'
    },
    {
      category: 'Account & Settings',
      question: 'How do I invite team members?',
      answer: 'In Settings > Team, click "Invite Team Member" and enter their email address. Assign a role: Admin (full access), Editor (can edit content but not billing), or Viewer (read-only access). They\'ll receive an email invitation to join your site.'
    },
    {
      category: 'Account & Settings',
      question: 'How do I update my profile?',
      answer: 'Go to Settings > Profile to update your name, email, profile photo, and password. Changes to your email require verification. Your profile photo appears in the dashboard and can be visible to students depending on your site settings.'
    },
    {
      category: 'Account & Settings',
      question: 'What analytics are available?',
      answer: 'The Analytics dashboard provides: revenue tracking and trends, student enrollment and completion rates, email open and click rates, page views and conversion metrics, traffic sources, funnel performance, and more. Filter by date range and export data as needed.'
    },
    {
      category: 'Account & Settings',
      question: 'How do I configure email sending settings?',
      answer: 'Go to Settings > Email to set your "From" name and reply-to address. You can also configure your email signature and default styles. For advanced users, custom domain email sending can be set up for better deliverability.'
    },
    {
      category: 'Account & Settings',
      question: 'How do I cancel my account?',
      answer: 'Go to Settings > Subscription and click "Cancel Subscription." You\'ll retain access until the end of your billing period. Your data is preserved for 30 days in case you change your mind. Contact support if you need to export your data before canceling.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = searchQuery
    ? faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  const displayedFaqs = selectedCategory
    ? filteredFaqs.filter(faq => faq.category === selectedCategory)
    : filteredFaqs;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-dark">Help Center</h1>
          <p className="text-text-secondary mt-2 text-lg">Learn how to use CreatorApp features</p>
        </div>
        <a
          href="mailto:support@creatorapp.us"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
        >
          <Mail className="w-4 h-4" />
          Contact Support
        </a>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search help articles..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setSelectedCategory(null);
          }}
          className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl text-lg focus:border-cyan-500 focus:ring-0 transition-colors"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {faqCategories.map((category) => (
          <button
            key={category.name}
            onClick={() => {
              if (selectedCategory === category.name) {
                setSelectedCategory(null);
              } else {
                scrollToCategory(category.name);
              }
            }}
            className={`bg-white p-5 rounded-xl border-2 transition-all hover:shadow-md text-center cursor-pointer ${
              selectedCategory === category.name
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-gray-200 hover:border-cyan-400'
            }`}
          >
            <category.icon className="h-7 w-7 text-cyan-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-gray-700">{category.name}</div>
          </button>
        ))}
      </div>

      {selectedCategory && (
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Showing:</span>
          <span className="inline-flex items-center gap-2 bg-cyan-100 text-cyan-800 px-3 py-1 rounded-full text-sm font-medium">
            {selectedCategory}
            <button onClick={() => setSelectedCategory(null)} className="hover:text-cyan-600">
              &times;
            </button>
          </span>
        </div>
      )}

      {searchQuery && (
        <p className="text-gray-500">
          Found {displayedFaqs.length} result{displayedFaqs.length !== 1 ? 's' : ''} for "{searchQuery}"
        </p>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {displayedFaqs.length > 0 ? (
            displayedFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const showCategoryHeader = !searchQuery && !selectedCategory && (index === 0 || faqs[index - 1].category !== faq.category);
              const originalIndex = faqs.findIndex(f => f === faq);

              return (
                <div key={originalIndex}>
                  {showCategoryHeader && (
                    <div
                      ref={(el) => (categoryRefs.current[faq.category] = el)}
                      className="px-6 py-4 bg-gray-50 border-b border-gray-100 scroll-mt-24"
                    >
                      <div className="flex items-center gap-3">
                        {(() => {
                          const CategoryIcon = faqCategories.find(cat => cat.name === faq.category)?.icon || Book;
                          return <CategoryIcon className="h-5 w-5 text-cyan-600" />;
                        })()}
                        <h2 className="text-lg font-bold text-gray-900">{faq.category}</h2>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => toggleFAQ(originalIndex)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 pr-4">
                      {searchQuery && (
                        <span className="text-xs text-cyan-600 font-medium block mb-1">{faq.category}</span>
                      )}
                      <span className="font-semibold text-gray-900">{faq.question}</span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-cyan-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
              <p className="text-gray-400 text-sm mt-2">Try different keywords or browse by category</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Still need help?</h2>
        <p className="text-gray-300 mb-6">
          Our support team is here to help you succeed with CreatorApp.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@creatorapp.us"
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <Mail className="h-5 w-5" />
            Email Support
          </a>
          <a
            href="/pages/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
          >
            <ExternalLink className="h-5 w-5" />
            Public FAQ
          </a>
        </div>
      </div>
    </div>
  );
}
