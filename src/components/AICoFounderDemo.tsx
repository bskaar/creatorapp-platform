import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Sparkles, Send, ArrowRight, ChevronRight, ChevronLeft, Rocket, DollarSign, Mail, Target,
  FileText, LayoutGrid, Check, Wand2, Eye, Settings, Plus, ArrowLeft, Save,
  Monitor, Tablet, Smartphone, Layers, GripVertical, Clock, Play, Pause,
  ChevronUp, ChevronDown, Trash2, GitBranch, List, MousePointer2, Undo, Redo,
  ZoomIn, ZoomOut, Type, Image as ImageIcon, Quote
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ActionPreview {
  type: 'page' | 'email' | 'funnel' | 'product';
  title: string;
  description: string;
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
      description: 'AI will generate your page with headline, benefits, and opt-in form'
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
      description: 'AI will create your pricing tiers, checkout, and intake forms'
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
      description: 'AI will write all 5 emails and set up timing automatically'
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
      description: 'AI will create all pages, products, and email sequence together'
    }
  }
];

interface AICoFounderDemoProps {
  isOpen: boolean;
  onClose: () => void;
}

function PageEditorMockup({ isGenerating }: { isGenerating: boolean }) {
  const [generatedContent, setGeneratedContent] = useState({
    headline: '',
    subheadline: '',
    benefits: [] as string[]
  });

  const fullContent = {
    headline: 'Master Natural Light Photography in 7 Days',
    subheadline: 'The free guide that helps beginners capture stunning photos without expensive equipment',
    benefits: [
      'Learn the golden hour secrets pros use',
      'Avoid the #1 lighting mistake beginners make',
      'Get my exact camera settings for any situation'
    ]
  };

  useEffect(() => {
    if (isGenerating) {
      let headlineIndex = 0;
      let subheadlineIndex = 0;
      let benefitIndex = 0;

      const typeHeadline = setInterval(() => {
        if (headlineIndex <= fullContent.headline.length) {
          setGeneratedContent(prev => ({
            ...prev,
            headline: fullContent.headline.slice(0, headlineIndex)
          }));
          headlineIndex++;
        } else {
          clearInterval(typeHeadline);

          const typeSubheadline = setInterval(() => {
            if (subheadlineIndex <= fullContent.subheadline.length) {
              setGeneratedContent(prev => ({
                ...prev,
                subheadline: fullContent.subheadline.slice(0, subheadlineIndex)
              }));
              subheadlineIndex++;
            } else {
              clearInterval(typeSubheadline);

              const typeBenefits = setInterval(() => {
                if (benefitIndex < fullContent.benefits.length) {
                  setGeneratedContent(prev => ({
                    ...prev,
                    benefits: [...fullContent.benefits.slice(0, benefitIndex + 1)]
                  }));
                  benefitIndex++;
                } else {
                  clearInterval(typeBenefits);
                }
              }, 800);
            }
          }, 25);
        }
      }, 30);

      return () => clearInterval(typeHeadline);
    }
  }, [isGenerating]);

  return (
    <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-2xl">
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <button className="p-1.5 hover:bg-slate-700 rounded text-slate-400">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <div>
            <span className="text-xs text-white font-medium">Lead Magnet Page</span>
            <span className="text-[10px] text-slate-500 ml-2">/free-guide</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-slate-900 rounded p-0.5">
            <button className="p-1 rounded bg-slate-700"><MousePointer2 className="h-3 w-3 text-slate-300" /></button>
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <button className="p-1 text-slate-500"><Undo className="h-3 w-3" /></button>
          <button className="p-1 text-slate-500"><Redo className="h-3 w-3" /></button>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <div className="flex items-center bg-slate-900 rounded p-0.5">
            <button className="p-1 rounded bg-slate-700"><Monitor className="h-3 w-3 text-slate-300" /></button>
            <button className="p-1 rounded text-slate-500"><Tablet className="h-3 w-3" /></button>
            <button className="p-1 rounded text-slate-500"><Smartphone className="h-3 w-3" /></button>
          </div>
          <div className="h-4 w-px bg-slate-700 mx-1" />
          <button className="px-2 py-1 text-[10px] bg-slate-700 text-white rounded">Save</button>
          <button className="px-2 py-1 text-[10px] bg-green-600 text-white rounded">Publish</button>
        </div>
      </div>

      <div className="flex h-64">
        <div className="w-40 bg-slate-800 border-r border-slate-700 p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Layers className="h-3 w-3" /> Layers
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-blue-600 text-white text-[10px]">
              <GripVertical className="h-3 w-3 opacity-50" />
              <LayoutGrid className="h-3 w-3" />
              <span>Hero Section</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-700 text-slate-400 text-[10px]">
              <GripVertical className="h-3 w-3 opacity-50" />
              <Type className="h-3 w-3" />
              <span>Benefits</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-700 text-slate-400 text-[10px]">
              <GripVertical className="h-3 w-3 opacity-50" />
              <FileText className="h-3 w-3" />
              <span>Opt-in Form</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-700 text-slate-400 text-[10px]">
              <GripVertical className="h-3 w-3 opacity-50" />
              <Quote className="h-3 w-3" />
              <span>Testimonials</span>
            </div>
          </div>
          <button className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-[10px] text-white flex items-center justify-center gap-1">
            <Plus className="h-3 w-3" /> Add Block
          </button>
        </div>

        <div className="flex-1 bg-slate-900 p-4 overflow-hidden">
          <div className="bg-white rounded shadow-lg mx-auto max-w-sm h-full overflow-hidden">
            <div className="h-full relative">
              {isGenerating && (
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-cyan-500 text-white px-2 py-1 rounded-full text-[10px] font-medium z-10">
                  <Wand2 className="h-3 w-3 animate-pulse" />
                  AI generating...
                </div>
              )}
              <div className="p-4 bg-gradient-to-br from-slate-800 to-slate-900 text-white h-28 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=400')] opacity-30 bg-cover bg-center" />
                <div className="relative z-10">
                  <h2 className="text-sm font-bold leading-tight min-h-[1.25rem]">
                    {generatedContent.headline || <span className="opacity-30">Your headline here...</span>}
                    {isGenerating && generatedContent.headline && generatedContent.headline.length < fullContent.headline.length && (
                      <span className="inline-block w-0.5 h-4 bg-cyan-400 ml-0.5 animate-pulse" />
                    )}
                  </h2>
                  <p className="text-[10px] text-slate-300 mt-1 min-h-[1rem]">
                    {generatedContent.subheadline || <span className="opacity-30">Supporting text...</span>}
                  </p>
                </div>
              </div>
              <div className="p-3 space-y-2">
                <p className="text-[9px] font-medium text-slate-700 uppercase tracking-wide">What you'll learn:</p>
                {(generatedContent.benefits.length > 0 ? generatedContent.benefits : ['', '', '']).map((benefit, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <Check className={`h-3 w-3 mt-0.5 flex-shrink-0 ${benefit ? 'text-green-500' : 'text-slate-200'}`} />
                    <span className={`text-[10px] ${benefit ? 'text-slate-700' : 'text-slate-300'}`}>
                      {benefit || 'Benefit point...'}
                    </span>
                  </div>
                ))}
                <div className="pt-2 flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Enter your email"
                    className="flex-1 px-2 py-1.5 text-[10px] border border-slate-200 rounded bg-slate-50"
                    readOnly
                  />
                  <button className="px-3 py-1.5 bg-cyan-500 text-white text-[10px] font-medium rounded whitespace-nowrap">
                    Get Free Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-48 bg-slate-800 border-l border-slate-700 p-2">
          <span className="text-[10px] text-slate-400 font-medium">Properties</span>
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-[9px] text-slate-500 uppercase">Block Name</label>
              <input
                type="text"
                value="Hero Section"
                className="w-full mt-0.5 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-[10px] text-white"
                readOnly
              />
            </div>
            <button className="w-full py-1.5 bg-blue-600 rounded text-[10px] text-white flex items-center justify-center gap-1">
              <Settings className="h-3 w-3" /> Edit Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailSequenceMockup({ isGenerating }: { isGenerating: boolean }) {
  const [currentEmail, setCurrentEmail] = useState(0);
  const [typedSubject, setTypedSubject] = useState('');
  const [typedContent, setTypedContent] = useState('');

  const emails = [
    {
      subject: 'Your templates are inside (+ a quick hello)',
      content: `Hey [First Name]!

Your Social Media Templates are ready and waiting for you:

[DOWNLOAD BUTTON]

Quick story: I started making Canva templates because I watched small business owners spend HOURS on graphics that should take minutes.

Over the next week, I'll share:
- My best tips for customizing templates
- The branding mistakes I see small businesses make
- How to create scroll-stopping content in under 10 minutes

Talk soon,
[Your Name]`,
      delay: 'Immediately'
    },
    { subject: 'The #1 branding mistake (and how to fix it)', content: '', delay: 'Day 2' },
    { subject: 'How Sarah 3x her engagement in 2 weeks', content: '', delay: 'Day 4' },
    { subject: "I almost didn't share this...", content: '', delay: 'Day 6' },
    { subject: 'Last chance: 20% off ends tonight', content: '', delay: 'Day 8' },
  ];

  useEffect(() => {
    if (isGenerating) {
      const fullSubject = emails[0].subject;
      const fullContent = emails[0].content;
      let subjectIndex = 0;
      let contentIndex = 0;

      const typeSubject = setInterval(() => {
        if (subjectIndex <= fullSubject.length) {
          setTypedSubject(fullSubject.slice(0, subjectIndex));
          subjectIndex++;
        } else {
          clearInterval(typeSubject);

          const typeContent = setInterval(() => {
            if (contentIndex <= fullContent.length) {
              setTypedContent(fullContent.slice(0, contentIndex));
              contentIndex++;
            } else {
              clearInterval(typeContent);
              setTimeout(() => setCurrentEmail(1), 1000);
            }
          }, 15);
        }
      }, 40);

      return () => clearInterval(typeSubject);
    }
  }, [isGenerating]);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-xl">
      <div className="bg-slate-800 px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-slate-700 rounded text-slate-400">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xs text-white font-medium">Welcome Sequence</span>
            <span className="text-[10px] text-slate-400 ml-2">5 emails</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 px-2 py-1 bg-green-600/20 text-green-400 rounded text-[10px]">
            <Play className="h-3 w-3" /> Activate
          </button>
          <button className="px-2 py-1 bg-blue-600 text-white rounded text-[10px]">Save</button>
        </div>
      </div>

      <div className="flex h-72">
        <div className="w-48 bg-slate-50 border-r border-slate-200 p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-700">Sequence Steps</span>
            <button className="p-1 bg-blue-600 rounded text-white">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2">
            {emails.map((email, index) => (
              <div
                key={index}
                className={`p-2 rounded border transition-all ${
                  currentEmail === index
                    ? 'border-blue-500 bg-blue-50'
                    : index < currentEmail
                      ? 'border-green-300 bg-green-50'
                      : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    currentEmail === index
                      ? 'bg-blue-600 text-white'
                      : index < currentEmail
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {index < currentEmail ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <span className="text-[10px] font-medium text-slate-700 truncate">Email {index + 1}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{email.delay}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-4">
          {isGenerating && currentEmail === 0 && (
            <div className="flex items-center gap-1.5 mb-3 text-cyan-600">
              <Wand2 className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-medium">AI writing email {currentEmail + 1} of 5...</span>
            </div>
          )}

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-14">Subject:</span>
              <span className="text-xs text-slate-800 font-medium flex-1">
                {typedSubject || emails[currentEmail]?.subject || ''}
                {isGenerating && currentEmail === 0 && typedSubject.length < emails[0].subject.length && (
                  <span className="inline-block w-0.5 h-3 bg-cyan-500 ml-0.5 animate-pulse" />
                )}
              </span>
            </div>
            <div className="p-3 h-44 overflow-y-auto">
              <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {typedContent || ''}
                {isGenerating && currentEmail === 0 && typedSubject.length >= emails[0].subject.length && typedContent.length < emails[0].content.length && (
                  <span className="inline-block w-0.5 h-3 bg-cyan-500 ml-0.5 animate-pulse" />
                )}
              </pre>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Send: {emails[currentEmail]?.delay || 'Immediately'}
            </span>
            <span className="flex items-center gap-1 text-green-600">
              <Check className="h-3 w-3" />
              Auto-connected to opt-in form
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FunnelBuilderMockup({ isGenerating }: { isGenerating: boolean }) {
  const [pagesCreated, setPagesCreated] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewMode, setViewMode] = useState<'flow' | 'grid' | 'list'>('flow');

  const pages = [
    {
      name: 'Opt-in Page',
      type: 'landing',
      preview: {
        headline: 'Master Natural Light Photography',
        subheadline: 'Get the free 7-day guide',
        cta: 'Download Free Guide',
        image: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    },
    {
      name: 'Thank You',
      type: 'thank_you',
      preview: {
        headline: 'Check Your Inbox!',
        subheadline: 'Your guide is on the way',
        cta: 'Get the Pro Version - $17',
        offer: 'Special One-Time Offer'
      }
    },
    {
      name: 'Sales Page',
      type: 'sales',
      preview: {
        headline: 'Photography Masterclass',
        subheadline: 'Transform your photos in 30 days',
        price: '$197',
        cta: 'Enroll Now',
        image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    },
    {
      name: 'Checkout',
      type: 'checkout',
      preview: {
        headline: 'Complete Your Order',
        product: 'Photography Masterclass',
        price: '$197',
        cta: 'Pay Now'
      }
    },
  ];

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setPagesCreated(prev => {
          if (prev < pages.length) {
            setCurrentSlide(prev);
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const renderPagePreview = (page: typeof pages[0], index: number, isCreated: boolean, isCreating: boolean) => {
    if (!isCreated && !isCreating) {
      return (
        <div className="h-full flex items-center justify-center bg-slate-100">
          <div className="text-center">
            <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <span className="text-[10px] text-slate-400">Queued</span>
          </div>
        </div>
      );
    }

    if (isCreating) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-50">
          <div className="text-center">
            <Wand2 className="h-8 w-8 text-cyan-500 mx-auto mb-2 animate-pulse" />
            <span className="text-[10px] text-cyan-600 font-medium">AI Generating...</span>
          </div>
        </div>
      );
    }

    switch (page.type) {
      case 'landing':
        return (
          <div className="h-full flex flex-col">
            <div className="h-16 bg-cover bg-center relative" style={{ backgroundImage: `url(${page.preview.image})` }}>
              <div className="absolute inset-0 bg-slate-900/60" />
              <div className="absolute inset-0 flex flex-col justify-center px-3">
                <h3 className="text-[10px] font-bold text-white leading-tight">{page.preview.headline}</h3>
                <p className="text-[8px] text-slate-200 mt-0.5">{page.preview.subheadline}</p>
              </div>
            </div>
            <div className="flex-1 p-2 bg-white">
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Check className="h-2 w-2 text-green-500" />
                  <span className="text-[7px] text-slate-600">Golden hour techniques</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-2 w-2 text-green-500" />
                  <span className="text-[7px] text-slate-600">Camera settings guide</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-2 w-2 text-green-500" />
                  <span className="text-[7px] text-slate-600">Pro editing tips</span>
                </div>
              </div>
              <div className="mt-2">
                <div className="h-4 bg-slate-100 rounded text-[6px] flex items-center px-1.5 text-slate-400">your@email.com</div>
                <button className="w-full mt-1 h-5 bg-cyan-500 text-white text-[7px] font-medium rounded">{page.preview.cta}</button>
              </div>
            </div>
          </div>
        );

      case 'thank_you':
        return (
          <div className="h-full flex flex-col bg-white p-3">
            <div className="text-center mb-2">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                <Check className="h-3 w-3 text-green-500" />
              </div>
              <h3 className="text-[10px] font-bold text-slate-800">{page.preview.headline}</h3>
              <p className="text-[8px] text-slate-500">{page.preview.subheadline}</p>
            </div>
            <div className="flex-1 border border-dashed border-cyan-300 rounded bg-cyan-50 p-2">
              <div className="text-[7px] text-cyan-600 font-medium text-center mb-1">{page.preview.offer}</div>
              <div className="bg-white rounded p-1.5 border border-cyan-200">
                <p className="text-[7px] text-slate-700 text-center">Color Mixing Cheat Sheet</p>
                <p className="text-[9px] font-bold text-center text-slate-800">$17</p>
              </div>
              <button className="w-full mt-1.5 h-5 bg-cyan-500 text-white text-[7px] font-medium rounded">{page.preview.cta}</button>
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="h-full flex flex-col">
            <div className="h-14 bg-cover bg-center relative" style={{ backgroundImage: `url(${page.preview.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2">
                <h3 className="text-[9px] font-bold text-white">{page.preview.headline}</h3>
              </div>
            </div>
            <div className="flex-1 p-2 bg-white">
              <p className="text-[7px] text-slate-600 mb-1.5">{page.preview.subheadline}</p>
              <div className="flex items-center gap-1 mb-1">
                <div className="flex -space-x-1">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-3 h-3 rounded-full bg-slate-300 border border-white" />
                  ))}
                </div>
                <span className="text-[6px] text-slate-500">500+ students enrolled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800">{page.preview.price}</span>
                <button className="px-2 h-5 bg-green-500 text-white text-[7px] font-medium rounded">{page.preview.cta}</button>
              </div>
            </div>
          </div>
        );

      case 'checkout':
        return (
          <div className="h-full flex flex-col bg-slate-50 p-2">
            <h3 className="text-[9px] font-bold text-slate-800 mb-2">{page.preview.headline}</h3>
            <div className="bg-white rounded border border-slate-200 p-1.5 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-slate-700">{page.preview.product}</span>
                <span className="text-[9px] font-bold text-slate-800">{page.preview.price}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-4 bg-white border border-slate-200 rounded text-[6px] px-1.5 flex items-center text-slate-400">Card number</div>
              <div className="flex gap-1">
                <div className="flex-1 h-4 bg-white border border-slate-200 rounded text-[6px] px-1.5 flex items-center text-slate-400">MM/YY</div>
                <div className="flex-1 h-4 bg-white border border-slate-200 rounded text-[6px] px-1.5 flex items-center text-slate-400">CVC</div>
              </div>
            </div>
            <button className="w-full mt-2 h-6 bg-green-500 text-white text-[8px] font-medium rounded flex items-center justify-center gap-1">
              <DollarSign className="h-3 w-3" />
              {page.preview.cta}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-xl">
      <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-slate-200 rounded text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xs text-slate-800 font-medium">Photography Course Funnel</span>
            <span className="text-[10px] text-slate-500 ml-2">{pages.length} pages</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white rounded p-0.5 border border-slate-200">
          <button
            onClick={() => setViewMode('flow')}
            className={`p-1 rounded ${viewMode === 'flow' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}
          >
            <GitBranch className="h-3 w-3" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}
          >
            <LayoutGrid className="h-3 w-3" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}
          >
            <List className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {isGenerating && pagesCreated < pages.length && (
          <div className="flex items-center gap-1.5 mb-3 text-cyan-600">
            <Wand2 className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-medium">AI building page {pagesCreated + 1} of {pages.length}...</span>
          </div>
        )}

        {viewMode === 'flow' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {pages.map((page, index) => {
                const isCreated = index < pagesCreated;
                const isCreating = index === pagesCreated && isGenerating && pagesCreated < pages.length;
                return (
                  <div key={index} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => setCurrentSlide(index)}
                      className={`w-24 rounded-lg border-2 overflow-hidden transition-all ${
                        currentSlide === index
                          ? 'border-blue-500 shadow-lg scale-105'
                          : isCreated
                            ? 'border-green-400'
                            : isCreating
                              ? 'border-cyan-400'
                              : 'border-slate-200'
                      }`}
                    >
                      <div className="h-28 overflow-hidden">
                        {renderPagePreview(page, index, isCreated, isCreating)}
                      </div>
                      <div className={`px-1.5 py-1 text-[9px] font-medium text-center ${
                        isCreated ? 'bg-green-50 text-green-700' : isCreating ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {page.name}
                      </div>
                    </button>
                    {index < pages.length - 1 && (
                      <div className="flex items-center px-1.5 flex-shrink-0">
                        <ArrowRight className={`h-4 w-4 ${index < pagesCreated ? 'text-green-400' : 'text-slate-300'}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
              <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-700">{pages[currentSlide].name}</span>
                  {currentSlide < pagesCreated && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded">Live</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4 text-slate-500" />
                  </button>
                  <span className="text-[10px] text-slate-500 px-1">{currentSlide + 1} / {pages.length}</span>
                  <button
                    onClick={() => setCurrentSlide(Math.min(pages.length - 1, currentSlide + 1))}
                    disabled={currentSlide === pages.length - 1}
                    className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="p-4 flex justify-center">
                <div className="w-48 h-64 bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200">
                  {renderPagePreview(
                    pages[currentSlide],
                    currentSlide,
                    currentSlide < pagesCreated,
                    currentSlide === pagesCreated && isGenerating && pagesCreated < pages.length
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {pages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentSlide === index ? 'bg-blue-500 w-4' : index < pagesCreated ? 'bg-green-400' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 gap-3">
            {pages.map((page, index) => {
              const isCreated = index < pagesCreated;
              const isCreating = index === pagesCreated && isGenerating && pagesCreated < pages.length;
              return (
                <div
                  key={index}
                  className={`rounded-lg border-2 overflow-hidden transition-all ${
                    isCreated ? 'border-green-400' : isCreating ? 'border-cyan-400' : 'border-slate-200'
                  }`}
                >
                  <div className="h-32 overflow-hidden">
                    {renderPagePreview(page, index, isCreated, isCreating)}
                  </div>
                  <div className={`px-2 py-1.5 flex items-center justify-between ${
                    isCreated ? 'bg-green-50' : isCreating ? 'bg-cyan-50' : 'bg-slate-50'
                  }`}>
                    <span className="text-[10px] font-medium text-slate-700">{page.name}</span>
                    {isCreated && <Check className="h-3 w-3 text-green-500" />}
                    {isCreating && <Wand2 className="h-3 w-3 text-cyan-500 animate-pulse" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagesCreated === pages.length && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-green-700">Funnel complete! All pages connected and ready to publish.</span>
            </div>
            <button className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-medium rounded hover:bg-green-700 transition">
              Publish Funnel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductSetupMockup({ isGenerating }: { isGenerating: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev < 3) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-xl">
      <div className="bg-slate-100 px-3 py-2 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-slate-200 rounded text-slate-500">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <span className="text-xs text-slate-800 font-medium">Coaching Product Setup</span>
        </div>
        <button className="px-2 py-1 bg-blue-600 text-white rounded text-[10px]">Save</button>
      </div>

      <div className="p-4">
        {isGenerating && (
          <div className="flex items-center gap-1.5 mb-4 text-cyan-600">
            <Wand2 className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-medium">AI configuring your products...</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg border-2 transition-all ${step >= 1 ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Starter Package</span>
              {step >= 1 && <Check className="h-4 w-4 text-green-500" />}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-2">
              $297<span className="text-sm font-normal text-slate-500">/month</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check className="h-3 w-3 text-green-500" /> 4 weekly check-ins
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check className="h-3 w-3 text-green-500" /> Custom workout plan
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check className="h-3 w-3 text-green-500" /> Email support
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 transition-all ${step >= 2 ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Premium Package</span>
              {step >= 2 ? <Check className="h-4 w-4 text-green-500" /> : step === 1 && isGenerating ? (
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : null}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-2">
              $497<span className="text-sm font-normal text-slate-500">/month</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check className="h-3 w-3 text-green-500" /> Everything in Starter
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check className="h-3 w-3 text-green-500" /> 2 longer sessions (60 min)
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <Check className="h-3 w-3 text-green-500" /> Priority support
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-lg border transition-all ${step >= 3 ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className={`h-4 w-4 ${step >= 3 ? 'text-green-500' : 'text-slate-400'}`} />
              <span className="text-xs font-medium text-slate-700">Stripe Checkout</span>
            </div>
            {step >= 3 ? (
              <span className="text-[10px] text-green-600 flex items-center gap-1">
                <Check className="h-3 w-3" /> Connected & Ready
              </span>
            ) : step === 2 && isGenerating ? (
              <span className="text-[10px] text-cyan-600">Configuring...</span>
            ) : (
              <span className="text-[10px] text-slate-400">Pending</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getMockupComponent(type: string, isGenerating: boolean) {
  switch (type) {
    case 'page':
      return <PageEditorMockup isGenerating={isGenerating} />;
    case 'email':
      return <EmailSequenceMockup isGenerating={isGenerating} />;
    case 'funnel':
      return <FunnelBuilderMockup isGenerating={isGenerating} />;
    case 'product':
      return <ProductSetupMockup isGenerating={isGenerating} />;
    default:
      return <PageEditorMockup isGenerating={isGenerating} />;
  }
}

export default function AICoFounderDemo({ isOpen, onClose }: AICoFounderDemoProps) {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [hasAskedFollowUp, setHasAskedFollowUp] = useState(false);
  const [showActionPreview, setShowActionPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
      setIsGenerating(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (showActionPreview) {
      const timer = setTimeout(() => setIsGenerating(true), 500);
      return () => clearTimeout(timer);
    }
  }, [showActionPreview]);

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
    setIsGenerating(false);
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
                {showActionPreview ? 'Watch AI build it for you' : 'See how AI helps build your business'}
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
            <div className="p-4 sm:p-6">
              <div className="mb-4">
                <button
                  onClick={() => {
                    setShowActionPreview(false);
                    setIsGenerating(false);
                  }}
                  className="text-sm text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 mb-3"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to conversation
                </button>
                <h3 className="text-lg font-bold text-white mb-1">
                  Building Your {selectedScenario.actionPreview.title}
                </h3>
                <p className="text-sm text-slate-400">{selectedScenario.actionPreview.description}</p>
              </div>

              <div className="transform origin-top">
                {getMockupComponent(selectedScenario.actionPreview.type, isGenerating)}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
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
                        setIsGenerating(false);
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
