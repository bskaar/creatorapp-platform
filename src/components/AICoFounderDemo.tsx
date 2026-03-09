import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Sparkles, Send, ArrowRight, ChevronRight, Rocket, DollarSign, Mail, Target,
  FileText, Layout, Palette, MousePointer, Check, Wand2, Eye, Settings, Plus
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ActionPreview {
  type: 'page' | 'email' | 'funnel' | 'product';
  title: string;
  description: string;
  mockupSteps: {
    label: string;
    preview: 'landing' | 'email-editor' | 'funnel-builder' | 'product-setup';
  }[];
}

interface DemoScenario {
  id: string;
  icon: typeof Rocket;
  title: string;
  subtitle: string;
  userMessage: string;
  assistantResponse: string;
  followUp?: {
    userMessage: string;
    assistantResponse: string;
  };
  actionPreview: ActionPreview;
}

const demoScenarios: DemoScenario[] = [
  {
    id: 'launch',
    icon: Rocket,
    title: 'Plan My Course Launch',
    subtitle: 'Get a step-by-step launch strategy',
    userMessage: "I'm launching my first online course about photography. Where do I even start?",
    assistantResponse: `Great choice launching a photography course! Here's your personalized 4-week launch gameplan:

**Week 1: Foundation**
- Define your ideal student (hobbyist vs aspiring pro)
- Outline 5-7 core modules based on transformation
- Create a free "Quick Start Guide" as your lead magnet

**Week 2: Build Anticipation**
- Set up a simple landing page with waitlist
- Start sharing behind-the-scenes content
- Collect early testimonials from beta students

**Week 3: Pre-Launch**
- Open early-bird pricing (15-20% off)
- Launch a 3-email welcome sequence
- Host a free live workshop to demonstrate expertise

**Week 4: Launch**
- Open cart with urgency (limited seats or time)
- Daily emails highlighting different benefits
- Celebrate wins publicly to build momentum

Want me to help you create your lead magnet landing page first?`,
    followUp: {
      userMessage: "Yes! What should I put on the landing page?",
      assistantResponse: `Perfect! Here's a high-converting lead magnet page structure:

**Above the Fold:**
- Headline: "Master [Specific Skill] in [Timeframe]"
- Example: "Master Natural Light Photography in 7 Days"
- Subheadline addressing their pain point
- Email capture form with compelling CTA button

**Social Proof:**
- 2-3 testimonials or student results
- Number of photographers you've helped
- Any credentials or media features

**What They'll Learn:**
- 3-5 bullet points with specific outcomes
- Use numbers and timeframes when possible
- Focus on transformation, not features

**About You (Brief):**
- 2-3 sentences establishing credibility
- Photo of you with camera builds trust

Shall I help you write the headline and bullet points?`
    },
    actionPreview: {
      type: 'page',
      title: 'Lead Magnet Landing Page',
      description: 'AI will generate your page with headline, benefits, and opt-in form',
      mockupSteps: [
        { label: 'Generate Page Content', preview: 'landing' },
        { label: 'Customize Design', preview: 'landing' },
        { label: 'Connect Email Automation', preview: 'email-editor' }
      ]
    }
  },
  {
    id: 'pricing',
    icon: DollarSign,
    title: 'Price My Coaching',
    subtitle: 'Find your profitable price point',
    userMessage: "I want to start offering 1-on-1 coaching for fitness. How should I price it?",
    assistantResponse: `Let's find your sweet spot! Here's my pricing framework for fitness coaching:

**Step 1: Calculate Your Floor**
- Minimum hourly rate you need: $X
- Time per client (sessions + prep + support)
- Overhead costs (software, certifications)

**Step 2: Research Your Ceiling**
- Generic online coaches: $150-300/month
- Specialized coaches: $300-600/month
- Premium/transformation coaches: $600-2000/month

**Step 3: My Recommendation**
For a new coach with solid expertise, I'd suggest:

**Starter Package:** $297/month
- 4 weekly check-ins (30 min each)
- Custom workout plan
- Basic nutrition guidance
- WhatsApp/email support

**Premium Package:** $497/month
- Everything above +
- 2 longer sessions (60 min)
- Detailed meal planning
- Priority support + accountability

**Pro tip:** Start with 3-5 clients at the lower tier, collect testimonials, then raise prices for new clients.

Would you like me to help you outline what's included in each package?`,
    followUp: {
      userMessage: "That's helpful! But I'm nervous about charging that much...",
      assistantResponse: `Totally normal feeling! Let me reframe this for you:

**The Math That Matters:**
- A gym membership is $50-100/month with zero personalization
- A personal trainer in-person is $60-150 per session
- You're offering personalized attention, accountability, AND results

**What You're Really Selling:**
- Not your time—your transformation
- A client who loses 30 lbs, gains confidence, feels healthy
- That's worth $3,000-5,000 to most people

**Confidence Builder Strategy:**
1. Start with 2-3 "founding member" clients at $197
2. Over-deliver and document their results
3. After 60 days, raise to $297 for new clients
4. Use those testimonials everywhere

**Script for the nervous moment:**
"My investment is $297/month. This includes [list everything]. Most clients see [specific result] within [timeframe]. Does that work for your budget?"

Then be quiet. Let them respond.

You've got this! Want me to help write your coaching offer page?`
    },
    actionPreview: {
      type: 'product',
      title: 'Coaching Product Setup',
      description: 'AI will create your pricing tiers, checkout, and intake forms',
      mockupSteps: [
        { label: 'Create Product Tiers', preview: 'product-setup' },
        { label: 'Build Sales Page', preview: 'landing' },
        { label: 'Set Up Checkout', preview: 'product-setup' }
      ]
    }
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Write My Email Sequence',
    subtitle: 'Convert subscribers to customers',
    userMessage: "I need a welcome email sequence for my digital product business. Can you help?",
    assistantResponse: `Absolutely! Here's a proven 5-email welcome sequence that builds trust and drives sales:

**Email 1: The Warm Welcome (Send immediately)**
- Thank them for joining
- Deliver your lead magnet
- Share your origin story (2-3 sentences)
- Set expectations for future emails

**Email 2: The Value Bomb (Day 2)**
- Share your best tip related to their problem
- No selling—pure value
- Builds credibility and opens future emails

**Email 3: The Story (Day 4)**
- Share a transformation story (yours or a client's)
- Connect emotionally to their struggle
- Subtle mention of your solution

**Email 4: The Soft Pitch (Day 6)**
- Address the #1 objection
- Introduce your product as the solution
- Include one testimonial
- Soft CTA to learn more

**Email 5: The Direct Offer (Day 8)**
- Clear, direct pitch
- Limited-time bonus or discount
- Strong CTA with urgency
- P.S. with social proof

**Subject Line Tips:**
- Keep under 40 characters
- Use curiosity or benefit
- Avoid spam triggers

Want me to draft Email 1 for you based on your business?`,
    followUp: {
      userMessage: "Yes please! I sell Canva templates for small business owners.",
      assistantResponse: `Here's your welcome email draft:

---

**Subject:** Your templates are inside (+ a quick hello)

Hey [First Name]!

Your [Lead Magnet Name] templates are ready and waiting for you:

**[DOWNLOAD BUTTON]**

Quick story: I started making Canva templates because I watched small business owners spend HOURS on graphics that should take minutes. As someone who's designed for 50+ brands, I wanted to give you the same professional look—without the professional price tag.

Over the next week, I'll share:
- My best tips for customizing templates (even if you're not "creative")
- The branding mistakes I see small businesses make
- How to create scroll-stopping content in under 10 minutes

For now, go grab your templates and start playing!

Talk soon,
[Your Name]

P.S. Hit reply and tell me—what's your biggest struggle with creating content for your business? I read every response.

---

**Why this works:**
- Delivers value immediately
- Personal story builds connection
- Sets expectations (reduces unsubscribes)
- P.S. drives engagement and gives you market research

Want me to draft Email 2 next?`
    },
    actionPreview: {
      type: 'email',
      title: '5-Email Welcome Sequence',
      description: 'AI will write all 5 emails and set up timing automatically',
      mockupSteps: [
        { label: 'Generate All 5 Emails', preview: 'email-editor' },
        { label: 'Set Timing & Triggers', preview: 'email-editor' },
        { label: 'Connect to Opt-in Form', preview: 'funnel-builder' }
      ]
    }
  },
  {
    id: 'funnel',
    icon: Target,
    title: 'Build My First Funnel',
    subtitle: 'Turn visitors into customers',
    userMessage: "Everyone talks about sales funnels but I don't really get them. Can you explain in simple terms?",
    assistantResponse: `Let's demystify this! A funnel is just a path you guide people through. Think of it like dating:

**The Dating Analogy:**
1. **See someone interesting** (They find your content)
2. **Get their number** (They give you their email)
3. **First date** (They consume your free content)
4. **Second date** (They engage more, trust builds)
5. **Committed relationship** (They buy from you)

**A Simple Starter Funnel:**

**Page 1: Lead Magnet Page**
"Get my free [valuable thing]"
→ Collects email

**Page 2: Thank You Page**
"Here's your download + check out my [low-cost offer]"
→ Optional small purchase ($27-47)

**Page 3: Email Sequence**
5-7 emails that build trust and pitch your main offer

**That's it!** No complex tech, no 47-step process.

**Your First Funnel Should Be:**
- Free guide/checklist/template → Email sequence → One product

**Results to expect:**
- 30-50% opt-in rate (if targeting right people)
- 1-3% buy on thank you page
- 2-5% buy from email sequence

Want me to map out a specific funnel for your business?`,
    followUp: {
      userMessage: "That makes so much sense! Can you suggest a funnel for someone who teaches watercolor painting?",
      assistantResponse: `Love it! Here's your watercolor teaching funnel:

**Lead Magnet: "5 Brushstrokes Every Beginner Gets Wrong (And How to Fix Them)"**
- Specific, solves immediate problem
- Shows your expertise without giving everything away

**Thank You Page Offer: "Color Mixing Cheat Sheet" - $17**
- Low-risk purchase builds buyer relationship
- Complements the free guide perfectly

**Email Sequence (7 days):**
- Day 1: Deliver guide + your story
- Day 2: Common mistake #1 deep dive
- Day 3: Share a student transformation
- Day 4: Your favorite supplies (can be affiliate)
- Day 5: Quick win tutorial
- Day 6: Introduce your course/membership
- Day 7: Limited-time enrollment bonus

**Main Offer: "Watercolor Foundations" Course - $197-297**
- 6-8 module video course
- Project-based learning
- Community access

**Numbers Game:**
- 1,000 visitors → 350 email signups
- 350 signups → 10 cheat sheet buyers ($170)
- 350 signups → 14 course buyers ($2,758)

That's ~$3,000 from 1,000 targeted visitors.

Ready to build this? Let's start with your lead magnet page!`
    },
    actionPreview: {
      type: 'funnel',
      title: 'Complete Sales Funnel',
      description: 'AI will create all pages, products, and email sequence together',
      mockupSteps: [
        { label: 'Generate Funnel Pages', preview: 'funnel-builder' },
        { label: 'Create Tripwire Product', preview: 'product-setup' },
        { label: 'Build Email Sequence', preview: 'email-editor' }
      ]
    }
  }
];

interface AICoFounderDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

function LandingPageMockup() {
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-100 px-3 py-2 flex items-center gap-2 border-b">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-400 text-center">
          yoursite.com/free-guide
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="text-xs text-cyan-600 font-medium">AI generating content...</span>
        </div>
        <div className="h-6 bg-gradient-to-r from-slate-800 to-slate-700 rounded w-4/5 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-full" />
        <div className="h-4 bg-slate-200 rounded w-3/4" />
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <div className="h-3 bg-slate-200 rounded w-2/3" />
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <div className="h-3 bg-slate-200 rounded w-3/4" />
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="flex-1 h-10 bg-slate-100 rounded border border-slate-200" />
          <div className="h-10 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-medium">Get Free Guide</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailEditorMockup() {
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-xs font-medium">Email Sequence Builder</span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                n === 1 ? 'bg-cyan-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {n}
            </div>
          ))}
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="text-xs text-cyan-600 font-medium">AI writing email 1 of 5...</span>
        </div>
        <div className="border border-slate-200 rounded p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 w-16">Subject:</span>
            <div className="h-4 bg-slate-100 rounded flex-1" />
          </div>
          <div className="border-t border-slate-100 pt-2 space-y-1.5">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-5/6" />
            <div className="h-3 bg-slate-100 rounded w-4/5" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">Send: Immediately after signup</span>
          <span className="text-green-500 flex items-center gap-1">
            <Check className="w-3 h-3" /> Auto-connected
          </span>
        </div>
      </div>
    </div>
  );
}

function FunnelBuilderMockup() {
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-xs font-medium">Funnel Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-slate-400" />
          <Settings className="w-4 h-4 text-slate-400" />
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="text-xs text-cyan-600 font-medium">AI building your funnel...</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 p-2 bg-cyan-50 border-2 border-cyan-300 rounded-lg text-center">
            <Layout className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
            <span className="text-xs font-medium text-cyan-700">Opt-in Page</span>
            <div className="text-[10px] text-cyan-500 mt-0.5">Creating...</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <FileText className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <span className="text-xs font-medium text-slate-600">Thank You</span>
            <div className="text-[10px] text-slate-400 mt-0.5">Queued</div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
          <div className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <Mail className="w-5 h-5 text-slate-400 mx-auto mb-1" />
            <span className="text-xs font-medium text-slate-600">Emails</span>
            <div className="text-[10px] text-slate-400 mt-0.5">Queued</div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-green-50 rounded border border-green-200 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-700">All pages will be connected automatically</span>
        </div>
      </div>
    </div>
  );
}

function ProductSetupMockup() {
  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-cyan-400" />
          <span className="text-white text-xs font-medium">Product Setup</span>
        </div>
        <span className="text-xs text-slate-400">2 tiers</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="text-xs text-cyan-600 font-medium">AI configuring pricing...</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-xs font-medium text-slate-700 mb-1">Starter</div>
            <div className="text-lg font-bold text-slate-900">$297<span className="text-xs font-normal text-slate-500">/mo</span></div>
            <div className="mt-2 space-y-1">
              <div className="h-2 bg-slate-200 rounded w-full" />
              <div className="h-2 bg-slate-200 rounded w-3/4" />
            </div>
          </div>
          <div className="p-3 bg-cyan-50 border-2 border-cyan-300 rounded-lg">
            <div className="text-xs font-medium text-cyan-700 mb-1">Premium</div>
            <div className="text-lg font-bold text-cyan-900">$497<span className="text-xs font-normal text-cyan-600">/mo</span></div>
            <div className="mt-2 space-y-1">
              <div className="h-2 bg-cyan-200 rounded w-full" />
              <div className="h-2 bg-cyan-200 rounded w-4/5" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-xs text-green-700">Stripe checkout ready</span>
        </div>
      </div>
    </div>
  );
}

function getMockupComponent(preview: string) {
  switch (preview) {
    case 'landing':
      return <LandingPageMockup />;
    case 'email-editor':
      return <EmailEditorMockup />;
    case 'funnel-builder':
      return <FunnelBuilderMockup />;
    case 'product-setup':
      return <ProductSetupMockup />;
    default:
      return <LandingPageMockup />;
  }
}

export default function AICoFounderDemo({ isOpen, onClose }: AICoFounderDemoProps) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [hasAskedFollowUp, setHasAskedFollowUp] = useState(false);
  const [showActionPreview, setShowActionPreview] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSelectedScenario(null);
      setMessages([]);
      setIsTyping(false);
      setShowFollowUp(false);
      setHasAskedFollowUp(false);
      setShowActionPreview(false);
      setActiveStep(0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (showActionPreview && selectedScenario) {
      const stepCount = selectedScenario.actionPreview.mockupSteps.length;
      const interval = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % stepCount);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showActionPreview, selectedScenario]);

  const simulateTyping = (text: string, callback: () => void) => {
    setIsTyping(true);
    const typingDuration = Math.min(1500 + text.length * 5, 3000);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, typingDuration);
  };

  const startScenario = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setMessages([{ role: 'user', content: scenario.userMessage }]);
    setShowFollowUp(false);
    setHasAskedFollowUp(false);
    setShowActionPreview(false);

    simulateTyping(scenario.assistantResponse, () => {
      setMessages(prev => [...prev, { role: 'assistant', content: scenario.assistantResponse }]);
      if (scenario.followUp) {
        setTimeout(() => setShowFollowUp(true), 500);
      }
    });
  };

  const handleFollowUp = () => {
    if (!selectedScenario?.followUp || hasAskedFollowUp) return;

    setHasAskedFollowUp(true);
    setShowFollowUp(false);
    setMessages(prev => [...prev, { role: 'user', content: selectedScenario.followUp!.userMessage }]);

    simulateTyping(selectedScenario.followUp.assistantResponse, () => {
      setMessages(prev => [...prev, { role: 'assistant', content: selectedScenario.followUp!.assistantResponse }]);
    });
  };

  const handleShowBuilder = () => {
    setShowActionPreview(true);
    setActiveStep(0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />

      <div
        ref={modalRef}
        className="relative w-full max-w-5xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">AI Co-Founder Demo</h2>
              <p className="text-sm text-slate-400">
                {showActionPreview ? 'See how AI builds it for you' : 'See how AI helps build your business'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/50 transition text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!selectedScenario ? (
            <div className="p-4 sm:p-8">
              <div className="text-center mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Choose a Scenario to Explore</h3>
                <p className="text-slate-400">See how your AI Co-Founder helps with real business challenges</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {demoScenarios.map((scenario) => {
                  const Icon = scenario.icon;
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => startScenario(scenario)}
                      className="group p-5 sm:p-6 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-500/30 group-hover:to-blue-500/30 transition-colors">
                          <Icon className="w-6 h-6 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold mb-1 group-hover:text-cyan-400 transition-colors">
                            {scenario.title}
                          </h4>
                          <p className="text-sm text-slate-400">{scenario.subtitle}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                <p className="text-center text-cyan-400 text-sm">
                  This is a preview of AI Co-Founder capabilities. Start your free trial to unlock personalized guidance for YOUR business.
                </p>
              </div>
            </div>
          ) : showActionPreview ? (
            <div className="p-4 sm:p-8">
              <div className="mb-6">
                <button
                  onClick={() => setShowActionPreview(false)}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 mb-4"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to conversation
                </button>
                <h3 className="text-xl font-bold text-white mb-2">
                  Next: AI Builds Your {selectedScenario.actionPreview.title}
                </h3>
                <p className="text-slate-400">{selectedScenario.actionPreview.description}</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Build Steps</h4>
                  {selectedScenario.actionPreview.mockupSteps.map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        activeStep === index
                          ? 'bg-cyan-500/10 border-cyan-500/30'
                          : 'bg-slate-800/50 border-slate-700/50'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          activeStep === index
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                            : activeStep > index
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {activeStep > index ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <span className={activeStep === index ? 'text-white font-medium' : 'text-slate-400'}>
                          {step.label}
                        </span>
                      </div>
                      {activeStep === index && (
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <h5 className="text-white font-medium mb-1">Everything Connected</h5>
                        <p className="text-sm text-slate-400">
                          Pages, products, emails, and analytics are automatically linked together. No manual setup required.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Live Preview</h4>
                  <div className="transform scale-95 origin-top">
                    {getMockupComponent(selectedScenario.actionPreview.mockupSteps[activeStep]?.preview || 'landing')}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                <div className="text-center">
                  <h4 className="text-white font-semibold mb-2">Ready to build this for YOUR business?</h4>
                  <p className="text-slate-400 text-sm mb-4">
                    Your AI Co-Founder will personalize everything based on your niche, audience, and goals.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      to="/signup"
                      onClick={onClose}
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                    >
                      Start Free Trial
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedScenario(null);
                        setMessages([]);
                        setShowFollowUp(false);
                        setHasAskedFollowUp(false);
                        setShowActionPreview(false);
                      }}
                      className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all"
                    >
                      Try Another Scenario
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="p-3 sm:p-4 border-b border-slate-700/50 bg-slate-800/50">
                <button
                  onClick={() => {
                    setSelectedScenario(null);
                    setMessages([]);
                    setShowFollowUp(false);
                    setHasAskedFollowUp(false);
                  }}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Try another scenario
                </button>
              </div>

              <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto min-h-[300px] max-h-[45vh]">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          {message.content.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={i} className="font-bold text-white mt-3 first:mt-0 mb-1">{line.replace(/\*\*/g, '')}</p>;
                            }
                            if (line.startsWith('- ')) {
                              return <p key={i} className="text-slate-300 ml-2 my-0.5">{line}</p>;
                            }
                            if (line.trim() === '') {
                              return <div key={i} className="h-2" />;
                            }
                            if (line.startsWith('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={i} className="my-1">
                                  {parts.map((part, j) =>
                                    j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part
                                  )}
                                </p>
                              );
                            }
                            return <p key={i} className="my-1">{line}</p>;
                          })}
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-sm text-slate-400">AI Co-Founder is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {showFollowUp && selectedScenario.followUp && !hasAskedFollowUp && (
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                  <p className="text-xs text-slate-500 mb-2">Suggested follow-up:</p>
                  <button
                    onClick={handleFollowUp}
                    className="w-full p-3 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700/50 hover:border-cyan-500/30 transition-all text-left flex items-center gap-3 group"
                  >
                    <Send className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span className="text-slate-300 group-hover:text-white transition text-sm">
                      {selectedScenario.followUp.userMessage}
                    </span>
                  </button>
                </div>
              )}

              {(hasAskedFollowUp || (!showFollowUp && !isTyping && messages.length >= 2)) && (
                <div className="p-4 sm:p-6 border-t border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-900">
                  <div className="text-center">
                    <p className="text-slate-400 mb-4">
                      See what happens next when AI builds it for you
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        onClick={handleShowBuilder}
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                      >
                        <Wand2 className="w-5 h-5" />
                        See AI Build It
                      </button>
                      <Link
                        to="/signup"
                        onClick={onClose}
                        className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-slate-100 transition-all"
                      >
                        Start Free Trial
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
