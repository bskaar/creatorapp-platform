import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  X, Sparkles, Send, ArrowRight, ChevronRight, ChevronLeft, Rocket, DollarSign, Mail, Target,
  FileText, LayoutGrid, Check, Wand2, Eye, Settings, Plus, ArrowLeft, Save,
  Monitor, Tablet, Smartphone, Layers, GripVertical, Clock, Play, Pause,
  ChevronUp, ChevronDown, Trash2, GitBranch, List, MousePointer2, Undo, Redo,
  ZoomIn, ZoomOut, Type, Image as ImageIcon, Quote, Users
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
    userMessage: "I want to start an online coaching program for fitness. How should I structure and price it?",
    assistantResponse: `Great question! Here's a scalable structure that works well for online coaching programs:

**Program Structure Options:**

**Group Coaching Model** (Most scalable)
- Weekly group coaching calls (you + multiple clients)
- Community access (Discord, Facebook, or Slack)
- Pre-recorded training content or curriculum
- Great for beginners to coaching

**Hybrid Model** (Best of both worlds)
- Group coaching calls + monthly 1:1 check-ins
- Balances personal attention with scalability
- Can serve more clients while maintaining connection

**Recommended Pricing Tiers:**

**Community Access:** $47-67/month
- Access to group + community
- Pre-recorded content library
- Great entry point

**Group Coaching:** $97-147/month
- Live weekly group calls
- Community access
- Workout templates + resources

**VIP/Hybrid:** $197-247/month
- Everything above +
- Monthly 1:1 check-in call
- Direct messaging access
- Priority support

**Pro tip:** Start with the group model to build your community, then add 1:1 spots as premium upsells.

Would you like me to help you outline what's included in each tier?`,
    followUp: {
      userMessage: "I like the group model! How do I get started?",
      assistantResponse: `Perfect choice! The group model is ideal for getting started. Here's your launch plan:

**Phase 1: Foundation (Week 1-2)**
- Define your niche and ideal client
- Create your signature framework or method
- Set up a simple community space

**Phase 2: Content (Week 2-3)**
- Record 4-6 core training videos
- Create workout templates or resources
- Write your program curriculum

**Phase 3: Launch (Week 3-4)**
- Create a simple landing page
- Set up your checkout flow
- Start with founding members at a special rate

**Founding Member Strategy:**
1. Offer 10-20 spots at $67/month (your "beta" price)
2. Get feedback and testimonials
3. Improve based on real member input
4. Raise price to $97-147 for next cohort

**Simple Tech Stack:**
- Zoom for group calls
- Discord or Facebook for community
- Your landing page + Stripe checkout

Ready to build your program structure and landing page?`
    },
    actionPreview: {
      type: 'product',
      title: 'Online Coaching Program Setup',
      description: 'AI will create your program tiers, checkout, and member intake forms'
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
    benefits: [] as string[],
    testimonial: '',
    cta: ''
  });

  const fullContent = {
    headline: 'Master Natural Light Photography in 7 Days',
    subheadline: 'The free guide that helps beginners capture stunning photos without expensive equipment',
    benefits: [
      'Learn the golden hour secrets pros use',
      'Avoid the #1 lighting mistake beginners make',
      'Get my exact camera settings for any situation'
    ],
    testimonial: '"This guide transformed my Instagram feed overnight!" - Sarah M.',
    cta: 'Get Your Free Guide Now'
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
                  setGeneratedContent(prev => ({
                    ...prev,
                    testimonial: fullContent.testimonial,
                    cta: fullContent.cta
                  }));
                }
              }, 600);
            }
          }, 20);
        }
      }, 25);

      return () => clearInterval(typeHeadline);
    }
  }, [isGenerating]);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
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
          <button className="px-2.5 py-1 text-[10px] bg-slate-700 text-white rounded font-medium">Save</button>
          <button className="px-2.5 py-1 text-[10px] bg-green-600 text-white rounded font-medium">Publish</button>
        </div>
      </div>

      <div className="flex h-80">
        <div className="w-44 bg-slate-800 border-r border-slate-700 p-2.5">
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
              <span>Benefits List</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-700 text-slate-400 text-[10px]">
              <GripVertical className="h-3 w-3 opacity-50" />
              <FileText className="h-3 w-3" />
              <span>Opt-in Form</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-700 text-slate-400 text-[10px]">
              <GripVertical className="h-3 w-3 opacity-50" />
              <Quote className="h-3 w-3" />
              <span>Testimonial</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded hover:bg-slate-700 text-slate-400 text-[10px]">
              <GripVertical className="h-3 w-3 opacity-50" />
              <ImageIcon className="h-3 w-3" />
              <span>Social Proof</span>
            </div>
          </div>
          <button className="w-full mt-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-[10px] text-white flex items-center justify-center gap-1 font-medium">
            <Plus className="h-3 w-3" /> Add Block
          </button>
        </div>

        <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 p-4 overflow-hidden flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md h-full overflow-y-auto">
            <div className="relative">
              {isGenerating && (
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-semibold z-20 shadow-lg">
                  <Wand2 className="h-3 w-3 animate-pulse" />
                  AI generating content...
                </div>
              )}

              <div className="relative h-32 overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Photography"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/40" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <h2 className="text-base font-bold text-white leading-snug drop-shadow-lg min-h-[1.5rem]">
                    {generatedContent.headline || <span className="opacity-40">Your headline here...</span>}
                    {isGenerating && generatedContent.headline && generatedContent.headline.length < fullContent.headline.length && (
                      <span className="inline-block w-0.5 h-5 bg-cyan-400 ml-0.5 animate-pulse" />
                    )}
                  </h2>
                  <p className="text-[11px] text-cyan-200 mt-1.5 min-h-[1rem] drop-shadow">
                    {generatedContent.subheadline || <span className="opacity-40">Supporting text...</span>}
                    {isGenerating && generatedContent.subheadline && generatedContent.subheadline.length < fullContent.subheadline.length && (
                      <span className="inline-block w-0.5 h-3 bg-cyan-400 ml-0.5 animate-pulse" />
                    )}
                  </p>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    What You'll Learn:
                  </p>
                  <div className="space-y-2">
                    {(generatedContent.benefits.length > 0 ? generatedContent.benefits : ['', '', '']).map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${benefit ? 'bg-green-100' : 'bg-slate-200'}`}>
                          <Check className={`h-2.5 w-2.5 ${benefit ? 'text-green-600' : 'text-slate-400'}`} />
                        </div>
                        <span className={`text-[11px] leading-relaxed ${benefit ? 'text-slate-700' : 'text-slate-300'}`}>
                          {benefit || 'Benefit point loading...'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Enter your best email..."
                    className="w-full px-3 py-2.5 text-[11px] border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    readOnly
                  />
                  <button className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-[12px] font-bold rounded-lg shadow-lg transition-all flex items-center justify-center gap-2">
                    {generatedContent.cta || 'Get Your Free Guide'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <p className="text-[9px] text-slate-400 text-center">Join 10,000+ photographers. No spam, ever.</p>
                </div>

                {generatedContent.testimonial && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[10px] font-bold">SM</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-700 italic leading-relaxed">{generatedContent.testimonial}</p>
                        <div className="flex items-center gap-0.5 mt-1">
                          {[1,2,3,4,5].map(i => (
                            <Sparkles key={i} className="h-2.5 w-2.5 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-1">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 border-2 border-white" />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-500">1,247 photographers downloaded today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-52 bg-slate-800 border-l border-slate-700 p-3">
          <span className="text-[10px] text-slate-400 font-medium">Properties</span>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-medium">Block Name</label>
              <input
                type="text"
                value="Hero Section"
                className="w-full mt-1 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-[10px] text-white"
                readOnly
              />
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-medium">Background</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600" />
                <span className="text-[9px] text-slate-400">Gradient + Image</span>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase font-medium">CTA Button</label>
              <div className="mt-1 flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gradient-to-r from-cyan-500 to-blue-600 border border-cyan-400" />
                <span className="text-[9px] text-slate-400">Cyan Gradient</span>
              </div>
            </div>
            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[10px] text-white flex items-center justify-center gap-1.5 font-medium transition">
              <Settings className="h-3 w-3" /> Edit Content
            </button>
            <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[10px] text-white flex items-center justify-center gap-1.5 font-medium transition">
              <Wand2 className="h-3 w-3" /> Regenerate with AI
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
  const [generationComplete, setGenerationComplete] = useState(false);

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
    {
      subject: 'The #1 branding mistake (and how to fix it)',
      content: `Hey [First Name],

Can I share something that might sting a little?

The #1 branding mistake I see small businesses make is... inconsistency.

Different fonts on every post. Colors that don't match. Logos that look different everywhere.

It makes your brand look amateur and confuses your audience.

The fix? Create a simple brand kit:
- 2-3 fonts (one for headlines, one for body)
- 3-5 colors (your main color + supporting colors)
- One logo used consistently

The templates you downloaded yesterday? They're already set up to help with this.

Tomorrow, I'll share a case study that blew my mind.

[Your Name]`,
      delay: 'Day 2'
    },
    {
      subject: 'How Sarah 3x her engagement in 2 weeks',
      content: `Hey [First Name],

Quick story about Sarah, a small bakery owner...

She was posting beautiful photos of her cakes but getting almost no engagement. Maybe 10-15 likes per post.

Then she started using templates to create consistent, branded content.

The result? Within 2 weeks:
- Engagement up 3x
- 47 new followers
- 8 new orders directly from Instagram

What changed? Not the quality of her cakes. Just how she presented them.

Consistent branding + scroll-stopping design = more attention.

Want to see the exact templates Sarah used? Reply and I'll send you her favorites.

[Your Name]`,
      delay: 'Day 4'
    },
    {
      subject: "I almost didn't share this...",
      content: `Hey [First Name],

I debated sending this email...

But I keep getting messages from people who downloaded the templates but haven't used them yet.

I get it. Life gets busy. New projects get pushed to "someday."

So here's a challenge: Pick ONE template. Customize it in the next 15 minutes. Post it today.

That's it. Just one.

Because here's what I've learned: The difference between businesses that grow and those that don't isn't talent or luck.

It's showing up consistently.

Your audience is waiting. Will you show up for them today?

[Your Name]

P.S. Tomorrow I'm sharing something special for those ready to take action...`,
      delay: 'Day 6'
    },
    {
      subject: 'Last chance: 20% off ends tonight',
      content: `Hey [First Name],

Quick heads up: The 20% discount on my Premium Template Bundle expires tonight at midnight.

If you've been enjoying the free templates, the Premium Bundle takes it to the next level:

- 50+ additional templates
- Matching Instagram Story designs
- Editable Canva files
- Lifetime access + updates

Use code WELCOME20 at checkout.

[GET THE BUNDLE - 20% OFF]

After tonight, it goes back to full price.

Thanks for being here,
[Your Name]

P.S. Questions? Just reply to this email. I read every message personally.`,
      delay: 'Day 8'
    },
  ];

  useEffect(() => {
    if (isGenerating && !generationComplete) {
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
              setGenerationComplete(true);
            }
          }, 15);
        }
      }, 40);

      return () => clearInterval(typeSubject);
    }
  }, [isGenerating, generationComplete]);

  const handleEmailClick = (index: number) => {
    if (generationComplete || !isGenerating) {
      setCurrentEmail(index);
    }
  };

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

      <div className="flex h-80">
        <div className="w-48 bg-slate-50 border-r border-slate-200 p-3 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-700">Sequence Steps</span>
            <button className="p-1 bg-blue-600 rounded text-white">
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin">
            {emails.map((email, index) => (
              <div
                key={index}
                onClick={() => handleEmailClick(index)}
                className={`p-2 rounded border transition-all cursor-pointer hover:shadow-sm ${
                  currentEmail === index
                    ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500/50'
                    : generationComplete
                      ? 'border-green-300 bg-green-50 hover:border-green-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    currentEmail === index
                      ? 'bg-blue-600 text-white'
                      : generationComplete
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-200 text-slate-500'
                  }`}>
                    {generationComplete && currentEmail !== index ? <Check className="h-3 w-3" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-slate-400 flex-shrink-0" />
                      <span className="text-[10px] font-medium text-slate-700 truncate">Email {index + 1}</span>
                    </div>
                    <span className="text-[9px] text-slate-500">{email.delay}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 mt-2 border-t border-slate-200">
            <div className="flex items-center justify-between text-[9px] text-slate-500">
              <span>Viewing {currentEmail + 1} of 5</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEmailClick(Math.max(0, currentEmail - 1))}
                  disabled={currentEmail === 0}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleEmailClick(Math.min(4, currentEmail + 1))}
                  disabled={currentEmail === 4}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-4">
          {isGenerating && !generationComplete && currentEmail === 0 && (
            <div className="flex items-center gap-1.5 mb-3 text-cyan-600">
              <Wand2 className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-medium">AI writing email {currentEmail + 1} of 5...</span>
            </div>
          )}

          {generationComplete && (
            <div className="flex items-center gap-1.5 mb-3 text-green-600">
              <Check className="h-4 w-4" />
              <span className="text-xs font-medium">All 5 emails generated - click any email to preview</span>
            </div>
          )}

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 w-14">Subject:</span>
              <span className="text-xs text-slate-800 font-medium flex-1">
                {currentEmail === 0 && !generationComplete ? typedSubject : emails[currentEmail]?.subject || ''}
                {isGenerating && !generationComplete && currentEmail === 0 && typedSubject.length < emails[0].subject.length && (
                  <span className="inline-block w-0.5 h-3 bg-cyan-500 ml-0.5 animate-pulse" />
                )}
              </span>
            </div>
            <div className="p-3 h-44 overflow-y-auto">
              <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {currentEmail === 0 && !generationComplete ? typedContent : emails[currentEmail]?.content || ''}
                {isGenerating && !generationComplete && currentEmail === 0 && typedSubject.length >= emails[0].subject.length && typedContent.length < emails[0].content.length && (
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
  const [animatedStats, setAnimatedStats] = useState({ views: 0, conversions: 0, revenue: 0 });

  const pages = [
    {
      name: 'Opt-in Page',
      type: 'landing',
      slug: '/free-guide',
      stats: { views: 2847, conversions: 892, rate: 31.3 },
      preview: {
        headline: 'Master Natural Light Photography',
        subheadline: 'Get the free 7-day guide used by 10,000+ photographers',
        cta: 'Download Free Guide',
        image: 'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg?auto=compress&cs=tinysrgb&w=400',
        bullets: ['Golden hour secrets', 'Indoor lighting hacks', 'Post-processing tips']
      }
    },
    {
      name: 'Thank You + Upsell',
      type: 'thank_you',
      slug: '/thank-you',
      stats: { views: 892, conversions: 156, rate: 17.5 },
      preview: {
        headline: 'Check Your Inbox!',
        subheadline: 'Your guide is on the way...',
        cta: 'Yes! Add This For $17',
        offer: 'Wait! One-Time Offer',
        offerTitle: 'Lighting Presets Bundle',
        offerPrice: '$17',
        originalPrice: '$47'
      }
    },
    {
      name: 'Sales Page',
      type: 'sales',
      slug: '/masterclass',
      stats: { views: 1205, conversions: 89, rate: 7.4 },
      preview: {
        headline: 'Photography Masterclass',
        subheadline: 'Transform your photos in 30 days or your money back',
        price: '$197',
        originalPrice: '$497',
        cta: 'Enroll Now - 60% Off',
        image: 'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=400',
        testimonial: '"This changed everything!" - Sarah M.',
        modules: 12,
        hours: 24
      }
    },
    {
      name: 'Checkout',
      type: 'checkout',
      slug: '/checkout',
      stats: { views: 89, conversions: 67, rate: 75.3 },
      preview: {
        headline: 'Complete Your Order',
        product: 'Photography Masterclass',
        price: '$197',
        guarantee: '60-Day Money Back Guarantee',
        cta: 'Complete Purchase'
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

  useEffect(() => {
    if (pagesCreated === pages.length) {
      const duration = 1500;
      const steps = 30;
      const targetViews = 5033;
      const targetConversions = 67;
      const targetRevenue = 13199;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        setAnimatedStats({
          views: Math.round(targetViews * progress),
          conversions: Math.round(targetConversions * progress),
          revenue: Math.round(targetRevenue * progress)
        });
        if (step >= steps) clearInterval(interval);
      }, duration / steps);
      return () => clearInterval(interval);
    }
  }, [pagesCreated]);

  const renderPagePreview = (page: typeof pages[0], isCreated: boolean, isCreating: boolean, size: 'small' | 'large' = 'small') => {
    const scale = size === 'large' ? 1 : 0.7;

    if (!isCreated && !isCreating) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-2">
              <FileText className="h-5 w-5 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Queued</span>
          </div>
        </div>
      );
    }

    if (isCreating) {
      return (
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"
               style={{ animation: 'shimmer 2s infinite' }} />
          <div className="text-center relative z-10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center mx-auto mb-2 shadow-lg">
              <Wand2 className="h-6 w-6 text-white animate-pulse" />
            </div>
            <span className="text-[11px] text-cyan-700 font-semibold">AI Generating...</span>
            <div className="flex justify-center gap-1 mt-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      );
    }

    switch (page.type) {
      case 'landing':
        return (
          <div className="h-full flex flex-col bg-white">
            <div className="h-20 bg-cover bg-center relative" style={{ backgroundImage: `url(${page.preview.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 to-slate-900/90" />
              <div className="absolute inset-0 flex flex-col justify-center px-3">
                <h3 className="text-[11px] font-bold text-white leading-tight drop-shadow">{page.preview.headline}</h3>
                <p className="text-[8px] text-cyan-200 mt-1">{page.preview.subheadline}</p>
              </div>
            </div>
            <div className="flex-1 p-2.5 bg-gradient-to-b from-white to-slate-50">
              <div className="space-y-1.5 mb-2.5">
                {page.preview.bullets?.map((bullet, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-2 w-2 text-green-600" />
                    </div>
                    <span className="text-[8px] text-slate-700">{bullet}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="h-5 bg-white rounded border border-slate-200 text-[7px] flex items-center px-2 text-slate-400 shadow-sm">
                  Enter your best email...
                </div>
                <button className="w-full h-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[8px] font-bold rounded shadow-md flex items-center justify-center gap-1">
                  {page.preview.cta}
                  <ArrowRight className="h-3 w-3" />
                </button>
                <p className="text-[6px] text-slate-400 text-center">Join 10,000+ photographers</p>
              </div>
            </div>
          </div>
        );

      case 'thank_you':
        return (
          <div className="h-full flex flex-col bg-gradient-to-b from-green-50 to-white p-3">
            <div className="text-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-1.5 shadow-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-[11px] font-bold text-slate-800">{page.preview.headline}</h3>
              <p className="text-[8px] text-slate-500 mt-0.5">{page.preview.subheadline}</p>
            </div>
            <div className="flex-1 border-2 border-dashed border-amber-400 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 p-2 relative">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[7px] font-bold px-2 py-0.5 rounded">
                {page.preview.offer}
              </div>
              <div className="text-center mt-1">
                <p className="text-[9px] font-bold text-slate-800">{page.preview.offerTitle}</p>
                <div className="flex items-center justify-center gap-1.5 mt-1">
                  <span className="text-[8px] text-slate-400 line-through">{page.preview.originalPrice}</span>
                  <span className="text-[12px] font-bold text-amber-600">{page.preview.offerPrice}</span>
                </div>
              </div>
              <button className="w-full mt-2 h-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-bold rounded shadow-md">
                {page.preview.cta}
              </button>
              <p className="text-[6px] text-slate-500 text-center mt-1">This offer expires when you leave</p>
            </div>
          </div>
        );

      case 'sales':
        return (
          <div className="h-full flex flex-col bg-white">
            <div className="h-16 bg-cover bg-center relative" style={{ backgroundImage: `url(${page.preview.image})` }}>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2">
                <h3 className="text-[10px] font-bold text-white drop-shadow">{page.preview.headline}</h3>
              </div>
            </div>
            <div className="flex-1 p-2 bg-gradient-to-b from-white to-slate-50">
              <p className="text-[7px] text-slate-600 mb-1.5">{page.preview.subheadline}</p>
              <div className="flex items-center gap-2 mb-1.5 bg-slate-100 rounded p-1">
                <div className="flex items-center gap-0.5">
                  <Layers className="h-3 w-3 text-blue-500" />
                  <span className="text-[7px] text-slate-600">{page.preview.modules} modules</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3 text-blue-500" />
                  <span className="text-[7px] text-slate-600">{page.preview.hours}h content</span>
                </div>
              </div>
              <div className="bg-blue-50 rounded p-1.5 mb-1.5 border border-blue-100">
                <p className="text-[7px] text-blue-700 italic">"{page.preview.testimonial}"</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[8px] text-slate-400 line-through">{page.preview.originalPrice}</span>
                  <span className="text-[12px] font-bold text-green-600 ml-1">{page.preview.price}</span>
                </div>
                <button className="px-2 h-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[7px] font-bold rounded shadow">
                  {page.preview.cta}
                </button>
              </div>
            </div>
          </div>
        );

      case 'checkout':
        return (
          <div className="h-full flex flex-col bg-slate-50 p-2">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-5 h-5 rounded bg-green-100 flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-green-600" />
              </div>
              <h3 className="text-[10px] font-bold text-slate-800">{page.preview.headline}</h3>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-2 mb-2 shadow-sm">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-medium text-slate-700">{page.preview.product}</span>
                <span className="text-[10px] font-bold text-slate-800">{page.preview.price}</span>
              </div>
              <div className="h-px bg-slate-100 my-1.5" />
              <div className="flex items-center gap-1">
                <Check className="h-2.5 w-2.5 text-green-500" />
                <span className="text-[7px] text-green-600">{page.preview.guarantee}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-5 bg-white border border-slate-200 rounded text-[7px] px-2 flex items-center text-slate-400 shadow-sm">
                4242 4242 4242 4242
              </div>
              <div className="flex gap-1.5">
                <div className="flex-1 h-5 bg-white border border-slate-200 rounded text-[7px] px-2 flex items-center text-slate-400 shadow-sm">12/28</div>
                <div className="flex-1 h-5 bg-white border border-slate-200 rounded text-[7px] px-2 flex items-center text-slate-400 shadow-sm">123</div>
              </div>
            </div>
            <button className="w-full mt-2 h-7 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[9px] font-bold rounded-lg shadow-md flex items-center justify-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              {page.preview.cta}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xl">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h3 className="text-sm text-white font-semibold">Photography Course Funnel</h3>
            <p className="text-[10px] text-slate-400">{pages.length} pages in sequence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('flow')}
              className={`p-1.5 rounded-md transition ${viewMode === 'flow' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <GitBranch className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
          {pagesCreated === pages.length && (
            <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-[11px] font-semibold rounded-lg transition flex items-center gap-1.5">
              <Rocket className="h-3.5 w-3.5" />
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="p-4 bg-gradient-to-b from-slate-50 to-white">
        {isGenerating && pagesCreated < pages.length && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-white animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">AI building page {pagesCreated + 1} of {pages.length}</p>
              <p className="text-[10px] text-slate-500">Creating {pages[pagesCreated]?.name}...</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {pages.map((_, i) => (
                <div key={i} className={`w-6 h-1.5 rounded-full ${i < pagesCreated ? 'bg-green-500' : i === pagesCreated ? 'bg-cyan-500 animate-pulse' : 'bg-slate-200'}`} />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'flow' && (
          <div className="space-y-4">
            <div className="flex items-stretch gap-3 overflow-x-auto pb-3 scrollbar-thin">
              {pages.map((page, index) => {
                const isCreated = index < pagesCreated;
                const isCreating = index === pagesCreated && isGenerating && pagesCreated < pages.length;
                return (
                  <div key={index} className="flex items-center flex-shrink-0">
                    <button
                      onClick={() => setCurrentSlide(index)}
                      className={`w-28 rounded-xl overflow-hidden transition-all duration-300 ${
                        currentSlide === index
                          ? 'ring-2 ring-blue-500 ring-offset-2 shadow-xl scale-105'
                          : isCreated
                            ? 'ring-2 ring-green-400 shadow-lg hover:shadow-xl hover:scale-102'
                            : isCreating
                              ? 'ring-2 ring-cyan-400 shadow-lg'
                              : 'ring-1 ring-slate-200 shadow hover:shadow-lg'
                      }`}
                    >
                      <div className="h-36 overflow-hidden">
                        {renderPagePreview(page, isCreated, isCreating, 'small')}
                      </div>
                      <div className={`px-2 py-1.5 ${
                        isCreated ? 'bg-green-50' : isCreating ? 'bg-cyan-50' : 'bg-slate-50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-semibold text-slate-700 truncate">{page.name}</span>
                          {isCreated && <Check className="h-3 w-3 text-green-500 flex-shrink-0" />}
                          {isCreating && <Wand2 className="h-3 w-3 text-cyan-500 animate-pulse flex-shrink-0" />}
                        </div>
                        {isCreated && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-[8px] text-green-600 font-medium">{page.stats.rate}% conv</span>
                          </div>
                        )}
                      </div>
                    </button>
                    {index < pages.length - 1 && (
                      <div className="flex flex-col items-center px-2 flex-shrink-0">
                        <ArrowRight className={`h-5 w-5 ${index < pagesCreated ? 'text-green-400' : 'text-slate-300'}`} />
                        {index < pagesCreated && (
                          <span className="text-[8px] text-slate-400 mt-0.5">{pages[index + 1]?.stats.views}</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{pages[currentSlide].name}</span>
                    {currentSlide < pagesCreated && (
                      <span className="text-[9px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Live</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{pages[currentSlide].slug}</span>
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
                      <button
                        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                        disabled={currentSlide === 0}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 transition"
                      >
                        <ChevronLeft className="h-4 w-4 text-slate-500" />
                      </button>
                      <span className="text-[10px] text-slate-600 px-1 font-medium">{currentSlide + 1}/{pages.length}</span>
                      <button
                        onClick={() => setCurrentSlide(Math.min(pages.length - 1, currentSlide + 1))}
                        disabled={currentSlide === pages.length - 1}
                        className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 transition"
                      >
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 flex justify-center bg-gradient-to-b from-slate-100 to-slate-50">
                  <div className="w-52 h-72 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 transition-all duration-500">
                    {renderPagePreview(
                      pages[currentSlide],
                      currentSlide < pagesCreated,
                      currentSlide === pagesCreated && isGenerating && pagesCreated < pages.length,
                      'large'
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 pb-4">
                  {pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === index ? 'bg-blue-500 w-6' : index < pagesCreated ? 'bg-green-400 w-2' : 'bg-slate-300 w-2'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="text-[11px] font-medium text-slate-600">Total Views</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">
                    {pagesCreated === pages.length ? animatedStats.views.toLocaleString() : '--'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-[11px] font-medium text-slate-600">Conversions</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">
                    {pagesCreated === pages.length ? animatedStats.conversions : '--'}
                  </span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span className="text-[11px] font-medium text-slate-600">Revenue</span>
                  </div>
                  <span className="text-2xl font-bold text-emerald-600">
                    {pagesCreated === pages.length ? `$${animatedStats.revenue.toLocaleString()}` : '--'}
                  </span>
                </div>
                {pagesCreated === pages.length && (
                  <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-green-800">Ready to Launch</p>
                        <p className="text-[9px] text-green-600">All pages connected</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 gap-4">
            {pages.map((page, index) => {
              const isCreated = index < pagesCreated;
              const isCreating = index === pagesCreated && isGenerating && pagesCreated < pages.length;
              return (
                <div
                  key={index}
                  className={`rounded-xl overflow-hidden transition-all shadow-lg ${
                    isCreated ? 'ring-2 ring-green-400' : isCreating ? 'ring-2 ring-cyan-400' : 'ring-1 ring-slate-200'
                  }`}
                >
                  <div className="h-40 overflow-hidden">
                    {renderPagePreview(page, isCreated, isCreating, 'small')}
                  </div>
                  <div className={`px-3 py-2 ${isCreated ? 'bg-green-50' : isCreating ? 'bg-cyan-50' : 'bg-slate-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-slate-700">{page.name}</span>
                      {isCreated && <Check className="h-4 w-4 text-green-500" />}
                      {isCreating && <Wand2 className="h-4 w-4 text-cyan-500 animate-pulse" />}
                    </div>
                    {isCreated && (
                      <div className="flex items-center gap-3 text-[9px] text-slate-500">
                        <span>{page.stats.views} views</span>
                        <span>{page.stats.rate}% conv</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-2">
            {pages.map((page, index) => {
              const isCreated = index < pagesCreated;
              const isCreating = index === pagesCreated && isGenerating && pagesCreated < pages.length;
              return (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                    isCreated
                      ? 'bg-green-50 border border-green-200'
                      : isCreating
                        ? 'bg-cyan-50 border border-cyan-200'
                        : 'bg-white border border-slate-200'
                  }`}
                >
                  <div className="w-20 h-28 rounded-lg overflow-hidden shadow-md flex-shrink-0 border border-slate-200">
                    {renderPagePreview(page, isCreated, isCreating, 'small')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-slate-800">{page.name}</h4>
                      {isCreated && (
                        <span className="text-[9px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Live</span>
                      )}
                      {isCreating && (
                        <span className="text-[9px] px-2 py-0.5 bg-cyan-100 text-cyan-700 rounded-full font-medium flex items-center gap-1">
                          <Wand2 className="h-2.5 w-2.5 animate-pulse" />
                          Generating
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mb-2">{page.slug}</p>
                    {isCreated && (
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600">{page.stats.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-600">{page.stats.conversions} conversions</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-16 h-1.5 rounded-full bg-slate-200 overflow-hidden`}>
                            <div
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                              style={{ width: `${page.stats.rate}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-green-600">{page.stats.rate}%</span>
                        </div>
                      </div>
                    )}
                    {!isCreated && !isCreating && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-xs">Waiting in queue</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {index < pages.length - 1 && (
                      <ArrowRight className={`h-5 w-5 ${isCreated ? 'text-green-400' : 'text-slate-300'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pagesCreated === pages.length && viewMode !== 'flow' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Your funnel is complete!</p>
                <p className="text-xs text-green-600">All {pages.length} pages are connected and ready to convert visitors.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-semibold rounded-lg shadow-lg transition flex items-center gap-2">
              <Rocket className="h-4 w-4" />
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
          if (prev < 4) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-2xl">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-sm text-white font-semibold">Online Coaching Program</span>
            <p className="text-[10px] text-slate-400">3 pricing tiers</p>
          </div>
        </div>
        <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-[11px] font-medium transition">Save & Publish</button>
      </div>

      <div className="p-4">
        {isGenerating && step < 4 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Wand2 className="h-3 w-3 text-white animate-pulse" />
            </div>
            <span className="text-xs font-medium text-slate-700">AI configuring your program tiers...</span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-xl border-2 transition-all ${step >= 1 ? 'border-green-400 bg-green-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Community</span>
              {step >= 1 && <Check className="h-4 w-4 text-green-500" />}
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              $67<span className="text-[10px] font-normal text-slate-500">/month</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Community access
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Training library
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Weekly Q&A access
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border-2 transition-all relative ${step >= 2 ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200'}`}>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full">
              POPULAR
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">Group Coaching</span>
              {step >= 2 ? <Check className="h-4 w-4 text-green-500" /> : step === 1 && isGenerating ? (
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : null}
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              $127<span className="text-[10px] font-normal text-slate-500">/month</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Everything in Community
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Weekly group calls
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Workout templates
              </div>
            </div>
          </div>

          <div className={`p-3 rounded-xl border-2 transition-all ${step >= 3 ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide">VIP Hybrid</span>
              {step >= 3 ? <Check className="h-4 w-4 text-green-500" /> : step === 2 && isGenerating ? (
                <div className="flex gap-0.5">
                  <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" />
                  <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : null}
            </div>
            <div className="text-xl font-bold text-slate-900 mb-1">
              $197<span className="text-[10px] font-normal text-slate-500">/month</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Everything in Group
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Monthly 1:1 check-in
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                <Check className="h-2.5 w-2.5 text-green-500 flex-shrink-0" /> Direct messaging
              </div>
            </div>
          </div>
        </div>

        <div className={`mt-4 p-3 rounded-xl border-2 transition-all ${step >= 4 ? 'border-green-400 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step >= 4 ? 'bg-green-100' : 'bg-slate-200'}`}>
                <DollarSign className={`h-4 w-4 ${step >= 4 ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-700">Stripe Checkout</span>
                <p className="text-[9px] text-slate-500">Secure payment processing</p>
              </div>
            </div>
            {step >= 4 ? (
              <span className="text-[10px] text-green-600 flex items-center gap-1 bg-green-100 px-2 py-1 rounded-full font-medium">
                <Check className="h-3 w-3" /> Connected & Ready
              </span>
            ) : step === 3 && isGenerating ? (
              <span className="text-[10px] text-cyan-600 font-medium">Configuring...</span>
            ) : (
              <span className="text-[10px] text-slate-400">Pending</span>
            )}
          </div>
        </div>

        {step >= 4 && (
          <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-500">Founding member pricing - limited spots recommended to start</span>
            </div>
          </div>
        )}
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
