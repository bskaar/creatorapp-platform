/*
  # Membership/Community and Tripwire Funnel Templates

  1. Membership/Community Funnel
    - Landing page with community benefits
    - Checkout page
    - Welcome/onboarding page
    - Trial-to-paid conversion page

  2. Tripwire/Low-Ticket Funnel
    - Mini sales page for $7-47 products
    - One-click checkout
    - Immediate upsell page
*/

INSERT INTO funnel_templates (
  name,
  description,
  category,
  goal_type,
  thumbnail_url,
  preview_images,
  pages_config,
  email_sequences_config,
  estimated_setup_minutes,
  is_featured,
  is_quick_start,
  sort_order,
  industry_tags,
  tone_suggestions,
  ai_prompt_context,
  placeholder_map,
  difficulty_level
) VALUES (
  'Membership Community Funnel',
  'Launch and grow a thriving membership community with recurring revenue. Includes landing page, checkout, welcome experience, and trial conversion pages.',
  'membership',
  'subscription',
  'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
  '[]'::jsonb,
  '[
    {
      "name": "Membership Landing",
      "slug": "join",
      "type": "sales_page",
      "description": "Main membership sales page",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Join [Community Name]: The [Industry] Community That Gets Results",
            "subheadline": "Connect with [number]+ like-minded [audience] who are committed to [achieving outcome]. Get expert guidance, accountability, and the support you need to succeed.",
            "ctaText": "Start Your Free Trial",
            "ctaLink": "#pricing",
            "backgroundImage": "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "badge": "7-Day Free Trial"
          }
        },
        {
          "type": "pain_points",
          "content": {
            "headline": "Are You Tired Of...",
            "points": [
              "Going it alone without support or accountability",
              "Consuming endless content without seeing real results",
              "Feeling stuck while others seem to be passing you by",
              "Not having access to people who understand your journey"
            ]
          }
        },
        {
          "type": "solution",
          "content": {
            "headline": "What If You Had a Community That Actually Helped You Grow?",
            "description": "[Community Name] is different. We are not just another Facebook group or online forum. We are a curated community of [audience] who are actively working toward [shared goal]. With live events, expert guidance, and genuine connections, you will have everything you need to succeed.",
            "image": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
        },
        {
          "type": "membership_includes",
          "content": {
            "headline": "What You Get Inside [Community Name]",
            "categories": [
              {
                "title": "Community & Connection",
                "items": [
                  "Private members-only community platform",
                  "Weekly virtual meetups and networking sessions",
                  "Member directory to find collaboration partners",
                  "Local chapter events in major cities"
                ]
              },
              {
                "title": "Expert Guidance",
                "items": [
                  "Monthly live Q&A sessions with [Expert/Host]",
                  "Guest expert workshops every month",
                  "Resource library with templates and guides",
                  "Direct access to ask questions and get feedback"
                ]
              },
              {
                "title": "Accountability & Growth",
                "items": [
                  "Accountability partner matching",
                  "Monthly goal-setting workshops",
                  "Progress tracking and celebrations",
                  "Private mastermind groups"
                ]
              }
            ]
          }
        },
        {
          "type": "testimonials",
          "content": {
            "headline": "What Our Members Are Saying",
            "testimonials": [
              {
                "quote": "Joining [Community Name] was the best investment I made this year. The connections and support have been invaluable.",
                "name": "Rachel T.",
                "title": "[Role/Industry]",
                "result": "Achieved [specific result] in 3 months"
              },
              {
                "quote": "I finally found my people. This community understands the unique challenges we face and provides real solutions.",
                "name": "Marcus J.",
                "title": "[Role/Industry]",
                "result": "Grew business by [X]%"
              },
              {
                "quote": "The accountability alone is worth the membership. Having people who push you to show up makes all the difference.",
                "name": "Aisha M.",
                "title": "[Role/Industry]",
                "result": "Launched first [project/product]"
              }
            ]
          }
        },
        {
          "type": "host_bio",
          "content": {
            "headline": "Founded By [Host Name]",
            "name": "[Host Name]",
            "bio": "I started [Community Name] because I experienced firsthand how powerful community can be. After [personal story/achievement], I knew I wanted to create a space where others could experience the same transformation. Today, our community has helped [number]+ members achieve [outcomes].",
            "image": "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400",
            "credentials": ["[Credential 1]", "[Credential 2]"]
          }
        },
        {
          "type": "pricing",
          "content": {
            "headline": "Choose Your Membership",
            "plans": [
              {
                "name": "Monthly",
                "price": "$[Price]",
                "period": "per month",
                "features": ["Full community access", "All live events", "Resource library", "Cancel anytime"],
                "ctaText": "Start Free Trial"
              },
              {
                "name": "Annual",
                "price": "$[Annual Price]",
                "period": "per year",
                "savings": "Save [X]%",
                "features": ["Everything in Monthly", "2 months free", "Bonus: [Exclusive bonus]", "Priority event access"],
                "ctaText": "Start Free Trial",
                "popular": true
              }
            ],
            "trial": "7-day free trial. Cancel anytime.",
            "guarantee": "30-day money-back guarantee if you are not satisfied."
          }
        },
        {
          "type": "faq",
          "content": {
            "headline": "Frequently Asked Questions",
            "questions": [
              {"q": "How is this different from a Facebook group?", "a": "Unlike free groups, our community is carefully curated. Members are committed (they are paying), engagement is high, and you get structured programming with live events and expert guidance."},
              {"q": "How much time do I need to commit?", "a": "As much or as little as you want! Some members attend every live event, others pop in occasionally. The community is always there when you need it."},
              {"q": "What if I am too busy to participate?", "a": "All live sessions are recorded. You can engage asynchronously in the community at your own pace."},
              {"q": "Can I cancel anytime?", "a": "Yes! You can cancel your membership at any time, no questions asked."}
            ]
          }
        },
        {
          "type": "final_cta",
          "content": {
            "headline": "Ready to Join a Community That Actually Helps You Grow?",
            "description": "Start your 7-day free trial today and experience the power of [Community Name].",
            "ctaText": "Start Your Free Trial",
            "ctaLink": "/checkout"
          }
        }
      ]
    },
    {
      "name": "Checkout",
      "slug": "checkout",
      "type": "checkout",
      "description": "Membership checkout page",
      "blocks": [
        {
          "type": "checkout_header",
          "content": {
            "headline": "Complete Your Membership",
            "securityNote": "Secure checkout powered by Stripe"
          }
        },
        {
          "type": "order_summary",
          "content": {
            "productName": "[Community Name] Membership",
            "trial": "7-day free trial",
            "price": "$[Price]/month after trial"
          }
        },
        {
          "type": "checkout_form",
          "content": {
            "fields": ["email", "firstName", "lastName", "card"],
            "ctaText": "Start My Free Trial",
            "trialNote": "You will not be charged until your trial ends. Cancel anytime."
          }
        },
        {
          "type": "trust_badges",
          "content": {
            "badges": ["Secure Payment", "Cancel Anytime", "30-Day Guarantee"]
          }
        }
      ]
    },
    {
      "name": "Welcome",
      "slug": "welcome",
      "type": "thank_you",
      "description": "New member welcome page",
      "blocks": [
        {
          "type": "welcome_header",
          "content": {
            "headline": "Welcome to [Community Name]!",
            "message": "You are officially part of the community. Here is how to get started and make the most of your membership.",
            "confetti": true
          }
        },
        {
          "type": "getting_started",
          "content": {
            "headline": "Your First Steps",
            "steps": [
              {"step": 1, "title": "Complete Your Profile", "description": "Add a photo and bio so other members can find you", "ctaText": "Set Up Profile", "ctaLink": "[PROFILE_LINK]"},
              {"step": 2, "title": "Introduce Yourself", "description": "Post in the Welcome thread and say hello", "ctaText": "Go to Welcome Thread", "ctaLink": "[WELCOME_THREAD]"},
              {"step": 3, "title": "Attend Your First Event", "description": "Join our next live session this [day] at [time]", "ctaText": "See Events Calendar", "ctaLink": "[EVENTS_LINK]"},
              {"step": 4, "title": "Connect With Members", "description": "Find 3 people to connect with this week", "ctaText": "Browse Directory", "ctaLink": "[DIRECTORY_LINK]"}
            ]
          }
        },
        {
          "type": "upcoming_events",
          "content": {
            "headline": "Upcoming Events",
            "events": [
              {"title": "[Event Name]", "date": "[Date/Time]", "host": "[Host]"},
              {"title": "[Event Name]", "date": "[Date/Time]", "host": "[Host]"}
            ],
            "ctaText": "View Full Calendar"
          }
        },
        {
          "type": "quick_wins",
          "content": {
            "headline": "Quick Wins to Get Started",
            "items": [
              "Download the welcome guide: [GUIDE_LINK]",
              "Join the #introductions channel",
              "Set up your notification preferences",
              "Find an accountability partner"
            ]
          }
        }
      ]
    },
    {
      "name": "Trial Ending",
      "slug": "upgrade",
      "type": "sales_page",
      "description": "Trial-to-paid conversion page",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Your Trial Is Almost Over",
            "subheadline": "In the past [X] days, you have experienced what [Community Name] has to offer. Ready to continue your journey?",
            "urgency": "Your trial ends in [X] days"
          }
        },
        {
          "type": "trial_recap",
          "content": {
            "headline": "What You Have Experienced",
            "stats": [
              {"label": "Events Attended", "value": "[X]"},
              {"label": "Connections Made", "value": "[X]"},
              {"label": "Resources Accessed", "value": "[X]"}
            ]
          }
        },
        {
          "type": "continue_benefits",
          "content": {
            "headline": "What You Will Keep Getting",
            "benefits": [
              "Access to all live events and workshops",
              "Your connections and accountability partners",
              "The resource library that keeps growing",
              "The support and community that helps you succeed"
            ]
          }
        },
        {
          "type": "pricing_reminder",
          "content": {
            "headline": "Continue Your Membership",
            "monthlyPrice": "$[Price]/month",
            "annualPrice": "$[Annual Price]/year (Save [X]%)",
            "ctaText": "Continue My Membership",
            "ctaLink": "/billing"
          }
        },
        {
          "type": "testimonial_single",
          "content": {
            "quote": "I almost did not continue after my trial, but I am so glad I did. The community has been instrumental in my growth.",
            "name": "[Member Name]",
            "title": "Member since [Year]"
          }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "name": "Member Onboarding Sequence",
      "trigger": "membership_signup",
      "emails": [
        {
          "subject": "Welcome to [Community Name]! Here is how to get started",
          "body": "Hi {{first_name}},\n\nWelcome to [Community Name]! I am so excited to have you join us.\n\nHere are your first steps:\n\n1. Complete your profile: [PROFILE_LINK]\n2. Introduce yourself: [WELCOME_THREAD]\n3. Check out upcoming events: [EVENTS_LINK]\n\nYour first goal: Connect with at least 3 other members this week. The magic of this community is in the connections you make.\n\nSee you inside!\n\n[Host Name]",
          "delay_hours": 0
        },
        {
          "subject": "Do not miss your first live event!",
          "body": "Hi {{first_name}},\n\nHow is your first week going?\n\nQuick reminder: We have a live [event type] coming up on [Date] at [Time].\n\nTopic: [Event Topic]\n\nThis is a great way to meet other members and get value right away.\n\nAdd it to your calendar: [CALENDAR_LINK]\n\nHope to see you there!\n\n[Host Name]",
          "delay_hours": 48
        },
        {
          "subject": "Have you found your accountability partner yet?",
          "body": "Hi {{first_name}},\n\nMembers who find an accountability partner in their first week are 3x more likely to achieve their goals.\n\nHere is how to find yours:\n\n1. Check out the #accountability channel\n2. Post what you are working on\n3. Connect with someone who has similar goals\n\nGo find your partner: [COMMUNITY_LINK]\n\n[Host Name]",
          "delay_hours": 96
        },
        {
          "subject": "Your trial ends in 3 days",
          "body": "Hi {{first_name}},\n\nJust a heads up - your free trial ends in 3 days.\n\nI hope you have been enjoying [Community Name]! Here is what you will keep getting as a member:\n\n- All live events and workshops\n- Your connections and accountability partners\n- The resource library\n- The community that has your back\n\nTo continue your membership, no action is needed - your subscription will begin automatically.\n\nTo cancel, just visit your account settings before [Date].\n\nQuestions? Reply to this email.\n\n[Host Name]",
          "delay_hours": 96
        }
      ]
    }
  ]'::jsonb,
  25,
  true,
  false,
  8,
  '["membership", "community", "coaching", "education", "business"]'::jsonb,
  '["warm", "inclusive", "encouraging"]'::jsonb,
  'Generate content for a membership community funnel. Emphasize connection, belonging, and transformation through community. Use inclusive language that makes prospects feel like they have found their people. Highlight both the practical benefits and emotional value of being part of the community.',
  '{
    "[Community Name]": "Name of the membership community",
    "[Host Name]": "Community founder or host",
    "[Price]": "Monthly membership price",
    "[Annual Price]": "Annual membership price",
    "[audience]": "Target member type",
    "[Industry]": "Industry or niche"
  }'::jsonb,
  'intermediate'
) ON CONFLICT DO NOTHING;

INSERT INTO funnel_templates (
  name,
  description,
  category,
  goal_type,
  thumbnail_url,
  preview_images,
  pages_config,
  email_sequences_config,
  estimated_setup_minutes,
  is_featured,
  is_quick_start,
  sort_order,
  industry_tags,
  tone_suggestions,
  ai_prompt_context,
  placeholder_map,
  difficulty_level
) VALUES (
  'Tripwire Low-Ticket Funnel',
  'Convert cold traffic into buyers with an irresistible low-ticket offer ($7-$47). Build your buyer list and upsell to higher-ticket products.',
  'tripwire',
  'sell_product',
  'https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=800',
  '[]'::jsonb,
  '[
    {
      "name": "Tripwire Sales Page",
      "slug": "offer",
      "type": "sales_page",
      "description": "Low-ticket product sales page",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Get [Product Name] for Just $[Price]",
            "subheadline": "The [resource type] that helps you [achieve result] in [timeframe] - even if you have tried everything else.",
            "price": "$[Price]",
            "originalPrice": "$[Original Price]",
            "ctaText": "Yes! I Want This for Just $[Price]",
            "ctaLink": "#checkout",
            "backgroundImage": "https://images.pexels.com/photos/5632397/pexels-photo-5632397.jpeg?auto=compress&cs=tinysrgb&w=1200"
          }
        },
        {
          "type": "problem_agitation",
          "content": {
            "headline": "Let Me Guess...",
            "points": [
              "You have been struggling with [problem] for too long",
              "You have tried [common solutions] but nothing has worked",
              "You are frustrated and ready for something that actually delivers results",
              "You do not have time (or budget) for expensive courses that take forever"
            ]
          }
        },
        {
          "type": "solution_intro",
          "content": {
            "headline": "Introducing [Product Name]",
            "description": "I created this [resource type] to give you exactly what you need - nothing more, nothing less. No fluff, no filler, just the actionable steps to [achieve result].",
            "image": "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
        },
        {
          "type": "whats_inside",
          "content": {
            "headline": "Here is What You Get",
            "items": [
              {"title": "[Component 1]", "description": "The exact [framework/template/script] I use to [achieve specific result]", "value": "$47 Value"},
              {"title": "[Component 2]", "description": "Step-by-step guide to [accomplish task] in [timeframe]", "value": "$37 Value"},
              {"title": "[Component 3]", "description": "[Resource] that eliminates guesswork and saves you hours", "value": "$29 Value"},
              {"title": "Bonus: [Bonus Name]", "description": "Special bonus to help you [additional benefit]", "value": "$27 Value"}
            ],
            "totalValue": "Total Value: $140+",
            "yourPrice": "Your Price Today: $[Price]"
          }
        },
        {
          "type": "author_credibility",
          "content": {
            "headline": "Why Should You Listen to Me?",
            "name": "[Your Name]",
            "bio": "I have [credential/experience]. I have helped [number] people [achieve result]. I created this because I wish I had something like this when I was starting out.",
            "image": "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400"
          }
        },
        {
          "type": "testimonials_mini",
          "content": {
            "headline": "What Others Are Saying",
            "testimonials": [
              {"quote": "Worth 10x the price. I implemented [specific thing] and saw results in [timeframe].", "name": "[Name]"},
              {"quote": "Finally, something that actually works without all the fluff.", "name": "[Name]"},
              {"quote": "I have bought $500 courses that delivered less value than this.", "name": "[Name]"}
            ]
          }
        },
        {
          "type": "checkout_inline",
          "content": {
            "headline": "Get Instant Access Now",
            "price": "$[Price]",
            "originalPrice": "$[Original Price]",
            "ctaText": "Get Instant Access for $[Price]",
            "guarantee": "60-day money-back guarantee",
            "securityNote": "Secure checkout. Instant digital delivery."
          }
        },
        {
          "type": "faq_mini",
          "content": {
            "headline": "Quick Questions",
            "questions": [
              {"q": "How do I access it?", "a": "Instant digital delivery. You will get access immediately after purchase."},
              {"q": "What if it does not work for me?", "a": "60-day money-back guarantee. If you are not happy, just email us for a full refund."},
              {"q": "Is this for beginners?", "a": "Yes! This is designed to work whether you are just starting out or have some experience."}
            ]
          }
        },
        {
          "type": "final_cta",
          "content": {
            "headline": "Ready to [Achieve Result]?",
            "price": "Just $[Price]",
            "ctaText": "Yes! Send Me [Product Name]",
            "ctaLink": "#checkout",
            "urgency": "This price will not last forever"
          }
        }
      ]
    },
    {
      "name": "Order Confirmation + Upsell",
      "slug": "thank-you",
      "type": "upsell",
      "description": "Thank you page with immediate upsell",
      "blocks": [
        {
          "type": "confirmation_header",
          "content": {
            "headline": "Your Order Is Complete!",
            "message": "Check your email for access details. But wait - I have a special one-time offer for you..."
          }
        },
        {
          "type": "upsell_offer",
          "content": {
            "headline": "Wait! Want to Get Even Better Results?",
            "subheadline": "Since you just got [Product Name], I want to offer you something special...",
            "productName": "[Upsell Product Name]",
            "description": "This is the complete [system/course/program] that takes everything in [Product Name] and goes deeper. You get [key benefit 1], [key benefit 2], and [key benefit 3].",
            "originalPrice": "$[Original Upsell Price]",
            "salePrice": "$[Upsell Price]",
            "savings": "Save $[Savings]",
            "urgency": "This special price is only available right now on this page",
            "image": "https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
        },
        {
          "type": "upsell_benefits",
          "content": {
            "headline": "What You Get With [Upsell Product]",
            "benefits": [
              {"title": "[Module/Component 1]", "description": "Deep dive into [topic]"},
              {"title": "[Module/Component 2]", "description": "Complete [system/framework]"},
              {"title": "[Module/Component 3]", "description": "[Hands-on resource]"},
              {"title": "Bonus: [Bonus Name]", "description": "Exclusive [bonus type]"}
            ]
          }
        },
        {
          "type": "upsell_cta",
          "content": {
            "yesText": "Yes! Add This to My Order for Just $[Upsell Price]",
            "noText": "No thanks, I will pass on this special offer",
            "guarantee": "Same 60-day guarantee applies"
          }
        }
      ]
    },
    {
      "name": "Final Thank You",
      "slug": "complete",
      "type": "thank_you",
      "description": "Final confirmation page",
      "blocks": [
        {
          "type": "confirmation",
          "content": {
            "headline": "You Are All Set!",
            "message": "Your purchase is complete. Check your email for access to everything you ordered.",
            "nextSteps": [
              "Check your inbox for the access email",
              "Download/access your [product]",
              "Start with [first step recommendation]"
            ],
            "ctaText": "Access Your Products",
            "ctaLink": "[ACCESS_LINK]"
          }
        },
        {
          "type": "support_info",
          "content": {
            "headline": "Need Help?",
            "email": "support@[domain].com",
            "note": "We typically respond within 24 hours."
          }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "name": "Tripwire Purchase Sequence",
      "trigger": "purchase",
      "emails": [
        {
          "subject": "Your [Product Name] is ready!",
          "body": "Hi {{first_name}},\n\nThank you for purchasing [Product Name]!\n\nAccess your product here: [ACCESS_LINK]\n\nHere is what I recommend you do first:\n\n1. [First action step]\n2. [Second action step]\n3. [Third action step]\n\nIf you have any questions, just reply to this email.\n\nTo your success,\n\n[Your Name]",
          "delay_hours": 0
        },
        {
          "subject": "Did you get a chance to use [Product Name]?",
          "body": "Hi {{first_name}},\n\nI wanted to check in - have you had a chance to use [Product Name] yet?\n\nThe members who see the best results are the ones who [key action]. I want to make sure you get the most out of your purchase.\n\nIf you have any questions or need help, just reply.\n\n[Your Name]",
          "delay_hours": 48
        },
        {
          "subject": "Quick tip for [Product Name]",
          "body": "Hi {{first_name}},\n\nHere is a quick tip that will help you get even more from [Product Name]:\n\n[Actionable tip]\n\nTry this and let me know how it goes!\n\n[Your Name]\n\nP.S. If you have not already, check out [Upsell Product] - it takes everything in [Product Name] to the next level: [UPSELL_LINK]",
          "delay_hours": 120
        }
      ]
    }
  ]'::jsonb,
  15,
  false,
  true,
  9,
  '["digital_products", "coaching", "business", "education", "creative"]'::jsonb,
  '["direct", "energetic", "value-focused"]'::jsonb,
  'Generate content for a low-ticket tripwire funnel ($7-$47 product). Be direct and value-focused. Stack the perceived value heavily. Use urgency and scarcity appropriately. The goal is to convert cold traffic into buyers who can later be upsold to higher-ticket offers.',
  '{
    "[Product Name]": "Name of the tripwire product",
    "[Price]": "Low-ticket price ($7-$47)",
    "[Original Price]": "Compare-at or original price",
    "[Upsell Product Name]": "Name of the upsell offer",
    "[Upsell Price]": "Price of upsell",
    "[resource type]": "Type of product (template, guide, toolkit)",
    "[result]": "Main outcome or transformation"
  }'::jsonb,
  'beginner'
) ON CONFLICT DO NOTHING;