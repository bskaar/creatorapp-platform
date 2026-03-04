/*
  # Challenge/Bootcamp Funnel Template

  1. New Template
    - 5-day challenge funnel for engagement and sales
    - Daily content delivery pages
    - Final offer page with special pricing

  2. Pages Included
    - Challenge registration page
    - Day 1-5 content pages
    - Final offer/pitch page
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
  '5-Day Challenge Funnel',
  'Engage your audience with a free 5-day challenge that builds trust and leads to your paid offer. Perfect for coaches, course creators, and service providers.',
  'challenge',
  'challenge_registration',
  'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=800',
  '[]'::jsonb,
  '[
    {
      "name": "Challenge Registration",
      "slug": "challenge",
      "type": "registration",
      "description": "Main challenge signup page",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Join the Free 5-Day [Topic] Challenge",
            "subheadline": "Transform your [area] in just 5 days with daily actionable lessons, live support, and a community of like-minded people cheering you on.",
            "ctaText": "Join the Challenge Free",
            "ctaLink": "#register",
            "backgroundImage": "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "startDate": "[Challenge Start Date]"
          }
        },
        {
          "type": "challenge_overview",
          "content": {
            "headline": "What You Will Learn Each Day",
            "days": [
              {"day": 1, "title": "Foundation Day", "description": "Set yourself up for success with the essential mindset shifts and quick wins to build momentum"},
              {"day": 2, "title": "Strategy Day", "description": "Learn the core framework that makes everything else easier and more effective"},
              {"day": 3, "title": "Implementation Day", "description": "Put what you have learned into action with step-by-step guidance"},
              {"day": 4, "title": "Optimization Day", "description": "Fine-tune your approach and learn the advanced techniques that separate beginners from pros"},
              {"day": 5, "title": "Scale Day", "description": "Create your long-term plan and discover how to maintain your results"}
            ]
          }
        },
        {
          "type": "benefits_list",
          "content": {
            "headline": "What You Get When You Join",
            "benefits": [
              "Daily video lessons delivered straight to your inbox (15-20 minutes each)",
              "Actionable worksheets and templates to implement what you learn",
              "Access to our private community for support and accountability",
              "Live Q&A sessions with [Host Name] on Days 2 and 4",
              "Bonus: Quick-start guide to get results before Day 1 even begins"
            ]
          }
        },
        {
          "type": "testimonials",
          "content": {
            "headline": "What Past Challengers Are Saying",
            "testimonials": [
              {
                "quote": "I have tried so many courses and programs, but this challenge finally made things click. By Day 3, I was seeing real results!",
                "name": "Amanda K.",
                "title": "Challenge Graduate"
              },
              {
                "quote": "The community support was amazing. Having others going through the same journey made all the difference.",
                "name": "David L.",
                "title": "Challenge Graduate"
              }
            ]
          }
        },
        {
          "type": "host_bio",
          "content": {
            "headline": "Meet Your Challenge Host",
            "name": "[Host Name]",
            "bio": "I have helped over [number] people achieve [result] using the exact strategies I will teach you in this challenge. I know what it is like to struggle with [problem], and I created this challenge to give you the shortcut I wish I had.",
            "image": "https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400",
            "credentials": ["[Credential 1]", "[Credential 2]"]
          }
        },
        {
          "type": "countdown",
          "content": {
            "headline": "Challenge Starts In:",
            "style": "flip_clock"
          }
        },
        {
          "type": "registration_form",
          "content": {
            "headline": "Reserve Your Spot Now",
            "fields": ["email", "firstName"],
            "ctaText": "Join the Free Challenge",
            "privacyNote": "We respect your privacy. Unsubscribe anytime."
          }
        },
        {
          "type": "faq",
          "content": {
            "headline": "Frequently Asked Questions",
            "questions": [
              {"q": "Is this really free?", "a": "Yes! The 5-day challenge is completely free. I want to give you a taste of what is possible so you can decide if my teaching style works for you."},
              {"q": "How much time do I need each day?", "a": "Plan for about 30-45 minutes per day: 15-20 minutes for the lesson and 15-25 minutes for the daily action step."},
              {"q": "What if I fall behind?", "a": "No problem! You will have access to all the materials even after the challenge ends, so you can go at your own pace."},
              {"q": "Is there a Facebook group?", "a": "Yes! When you register, you will get access to our private community where you can connect with other challengers and get support."}
            ]
          }
        }
      ]
    },
    {
      "name": "Day 1",
      "slug": "day-1",
      "type": "content",
      "description": "Foundation Day - First lesson",
      "blocks": [
        {
          "type": "day_header",
          "content": {
            "dayNumber": 1,
            "title": "Foundation Day: Setting Yourself Up for Success",
            "description": "Welcome to the challenge! Today we lay the groundwork for your transformation."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "day_1_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_content",
          "content": {
            "headline": "Key Takeaways",
            "points": [
              "The #1 mindset shift that separates successful people from everyone else",
              "How to identify your starting point (without judgment)",
              "The simple daily habit that will 10x your results"
            ]
          }
        },
        {
          "type": "action_step",
          "content": {
            "headline": "Your Day 1 Action Step",
            "description": "Complete the Foundation Worksheet to clarify your starting point and set your intention for the challenge.",
            "downloadText": "Download the Worksheet",
            "downloadLink": "[WORKSHEET_LINK]",
            "timeEstimate": "15 minutes"
          }
        },
        {
          "type": "community_cta",
          "content": {
            "headline": "Share Your Progress",
            "description": "Head over to the community and introduce yourself! Share your #1 goal for this challenge.",
            "ctaText": "Join the Community",
            "ctaLink": "[COMMUNITY_LINK]"
          }
        },
        {
          "type": "next_day_teaser",
          "content": {
            "headline": "Coming Tomorrow: Day 2",
            "description": "Tomorrow we dive into the core strategy that makes everything else work. You do not want to miss it!",
            "unlockTime": "9:00 AM [Timezone]"
          }
        }
      ]
    },
    {
      "name": "Day 2",
      "slug": "day-2",
      "type": "content",
      "description": "Strategy Day - Core framework",
      "blocks": [
        {
          "type": "day_header",
          "content": {
            "dayNumber": 2,
            "title": "Strategy Day: The Core Framework",
            "description": "Today you learn the system that ties everything together."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "day_2_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_content",
          "content": {
            "headline": "Key Takeaways",
            "points": [
              "The [Name] Framework explained step-by-step",
              "Why most people get stuck (and how to avoid it)",
              "The 3 pillars of sustainable success"
            ]
          }
        },
        {
          "type": "action_step",
          "content": {
            "headline": "Your Day 2 Action Step",
            "description": "Map out your personal version of the framework using the Strategy Template.",
            "downloadText": "Download the Template",
            "downloadLink": "[TEMPLATE_LINK]",
            "timeEstimate": "20 minutes"
          }
        },
        {
          "type": "live_qa_reminder",
          "content": {
            "headline": "Live Q&A Today!",
            "description": "Join me live at [TIME] [TIMEZONE] to get your questions answered.",
            "ctaText": "Get the Zoom Link",
            "ctaLink": "[ZOOM_LINK]"
          }
        }
      ]
    },
    {
      "name": "Day 3",
      "slug": "day-3",
      "type": "content",
      "description": "Implementation Day",
      "blocks": [
        {
          "type": "day_header",
          "content": {
            "dayNumber": 3,
            "title": "Implementation Day: Taking Action",
            "description": "Knowledge without action is useless. Today we put it all into practice."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "day_3_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_content",
          "content": {
            "headline": "Key Takeaways",
            "points": [
              "The implementation checklist for immediate results",
              "Common mistakes and how to avoid them",
              "How to troubleshoot when things do not go as planned"
            ]
          }
        },
        {
          "type": "action_step",
          "content": {
            "headline": "Your Day 3 Action Step",
            "description": "Complete at least 3 items from the Implementation Checklist. Document your results!",
            "downloadText": "Download the Checklist",
            "downloadLink": "[CHECKLIST_LINK]",
            "timeEstimate": "30 minutes"
          }
        }
      ]
    },
    {
      "name": "Day 4",
      "slug": "day-4",
      "type": "content",
      "description": "Optimization Day",
      "blocks": [
        {
          "type": "day_header",
          "content": {
            "dayNumber": 4,
            "title": "Optimization Day: Level Up Your Results",
            "description": "Now that you have the basics, let us fine-tune for maximum impact."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "day_4_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_content",
          "content": {
            "headline": "Key Takeaways",
            "points": [
              "Advanced techniques the pros use",
              "How to measure your progress effectively",
              "The optimization loop for continuous improvement"
            ]
          }
        },
        {
          "type": "action_step",
          "content": {
            "headline": "Your Day 4 Action Step",
            "description": "Review your results from Day 3 and identify one area to optimize. Apply the advanced technique from today.",
            "timeEstimate": "25 minutes"
          }
        },
        {
          "type": "live_qa_reminder",
          "content": {
            "headline": "Final Live Q&A Today!",
            "description": "Last chance to get your questions answered live at [TIME] [TIMEZONE].",
            "ctaText": "Join the Live Session",
            "ctaLink": "[ZOOM_LINK]"
          }
        }
      ]
    },
    {
      "name": "Day 5",
      "slug": "day-5",
      "type": "content",
      "description": "Scale Day with special offer",
      "blocks": [
        {
          "type": "day_header",
          "content": {
            "dayNumber": 5,
            "title": "Scale Day: Your Path Forward",
            "description": "You have come so far! Today we create your long-term success plan."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "day_5_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_content",
          "content": {
            "headline": "Key Takeaways",
            "points": [
              "Creating a sustainable routine that sticks",
              "How to maintain momentum after the challenge",
              "The long-term vision for your success"
            ]
          }
        },
        {
          "type": "action_step",
          "content": {
            "headline": "Your Final Action Step",
            "description": "Complete the 90-Day Success Plan worksheet to map out your next 3 months.",
            "downloadText": "Download the 90-Day Plan",
            "downloadLink": "[PLAN_LINK]",
            "timeEstimate": "20 minutes"
          }
        },
        {
          "type": "special_offer",
          "content": {
            "headline": "Ready to Go Even Further?",
            "description": "You have proven you can do this. Now imagine having the full system, ongoing support, and advanced strategies to reach your biggest goals. I have created something special for challenge graduates...",
            "ctaText": "See the Special Offer",
            "ctaLink": "/offer"
          }
        }
      ]
    },
    {
      "name": "Special Offer",
      "slug": "offer",
      "type": "sales_page",
      "description": "Challenge graduate special offer",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "You Did It! Now Take It to the Next Level",
            "subheadline": "As a challenge graduate, you have exclusive access to [Program Name] at a special price - but only for the next 48 hours.",
            "badge": "Challenge Graduate Exclusive"
          }
        },
        {
          "type": "countdown",
          "content": {
            "headline": "This Offer Expires In:",
            "style": "urgency"
          }
        },
        {
          "type": "transformation",
          "content": {
            "headline": "From Challenge to Complete Transformation",
            "before": ["Stuck at the beginner level", "Missing key pieces of the puzzle", "Limited support and guidance"],
            "after": ["Achieving advanced-level results", "Having the complete system", "Ongoing expert guidance and community"]
          }
        },
        {
          "type": "program_overview",
          "content": {
            "headline": "What Is Included in [Program Name]",
            "modules": [
              {"title": "Module 1: [Topic]", "description": "Deep dive into [subject] with advanced techniques"},
              {"title": "Module 2: [Topic]", "description": "Master [skill] with step-by-step guidance"},
              {"title": "Module 3: [Topic]", "description": "Advanced strategies for [outcome]"},
              {"title": "Module 4: [Topic]", "description": "Implementation blueprint for lasting results"}
            ],
            "bonuses": [
              {"title": "Bonus 1: [Name]", "value": "$297"},
              {"title": "Bonus 2: [Name]", "value": "$197"},
              {"title": "Bonus 3: Live Group Coaching Calls", "value": "$497"}
            ]
          }
        },
        {
          "type": "pricing",
          "content": {
            "headline": "Special Challenge Graduate Pricing",
            "originalPrice": "$997",
            "salePrice": "$497",
            "savings": "Save $500",
            "features": ["Lifetime access to all modules", "All bonuses included", "30-day money-back guarantee", "Private community access"],
            "ctaText": "Enroll Now and Save $500",
            "paymentOptions": ["Pay in Full", "3 Monthly Payments of $187"]
          }
        },
        {
          "type": "guarantee",
          "content": {
            "headline": "30-Day Money-Back Guarantee",
            "description": "Try the entire program risk-free. If you do not love it, simply email us within 30 days for a full refund. No questions asked."
          }
        },
        {
          "type": "final_cta",
          "content": {
            "headline": "Your Transformation Is Just Beginning",
            "description": "Do not let the momentum you have built this week fade away. Join [Program Name] and continue your journey with the complete system.",
            "ctaText": "Yes, I Want to Continue My Transformation",
            "ctaLink": "/checkout"
          }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "name": "Challenge Email Sequence",
      "trigger": "challenge_registration",
      "emails": [
        {
          "subject": "You are in! Welcome to the [Challenge Name]",
          "body": "Hi {{first_name}},\n\nExciting news - you are officially registered for the [Challenge Name]!\n\nHere is what to do next:\n\n1. Join our private community: [COMMUNITY_LINK]\n2. Download your Quick-Start Guide: [GUIDE_LINK]\n3. Mark your calendar for Day 1: [DATE]\n\nI am so excited to have you on this journey. This challenge has helped thousands of people achieve [result], and I know it can do the same for you.\n\nSee you on Day 1!\n\n[Host Name]",
          "delay_hours": 0
        },
        {
          "subject": "Day 1 is LIVE - Let us do this!",
          "body": "Hi {{first_name}},\n\nDay 1 of the [Challenge Name] is now live!\n\nClick here to access your first lesson: [DAY_1_LINK]\n\nToday we are covering the essential foundation that makes everything else work. Trust me, you do not want to skip this one.\n\nYour Day 1 action step should take about 15 minutes. Block off the time now!\n\nLet us make this week amazing,\n\n[Host Name]\n\nP.S. Do not forget to introduce yourself in the community! [COMMUNITY_LINK]",
          "delay_hours": 24
        },
        {
          "subject": "Day 2 is ready + Live Q&A today!",
          "body": "Hi {{first_name}},\n\nDay 2 is now live! This is the day where everything starts to click.\n\nAccess Day 2 here: [DAY_2_LINK]\n\nToday we are covering the core framework that ties it all together.\n\nAlso, do not forget about our LIVE Q&A today at [TIME] [TIMEZONE]. Bring your questions!\n\nZoom link: [ZOOM_LINK]\n\n[Host Name]",
          "delay_hours": 48
        },
        {
          "subject": "Day 3: Time to take action!",
          "body": "Hi {{first_name}},\n\nYou are halfway through the challenge! Day 3 is all about implementation.\n\nAccess Day 3: [DAY_3_LINK]\n\nToday is where the magic happens. You will put everything you have learned into practice and start seeing real results.\n\nHow did yesterday go? Reply and let me know!\n\n[Host Name]",
          "delay_hours": 72
        },
        {
          "subject": "Day 4 + Final Q&A Session",
          "body": "Hi {{first_name}},\n\nDay 4 is ready and it is a big one - we are going advanced today!\n\nAccess Day 4: [DAY_4_LINK]\n\nToday we fine-tune your approach and add the finishing touches.\n\nFinal Live Q&A is TODAY at [TIME] [TIMEZONE]. This is your last chance to get personalized feedback!\n\nZoom link: [ZOOM_LINK]\n\n[Host Name]",
          "delay_hours": 96
        },
        {
          "subject": "Day 5: Your Path Forward (+ a surprise)",
          "body": "Hi {{first_name}},\n\nWow - you made it to Day 5! I am so proud of you.\n\nAccess your final lesson: [DAY_5_LINK]\n\nToday we map out your long-term success plan. This is not the end - it is just the beginning of your transformation.\n\nI also have a special surprise for challenge graduates... you will find it at the end of today lesson.\n\nThank you for being part of this journey!\n\n[Host Name]",
          "delay_hours": 120
        },
        {
          "subject": "48 hours left for your exclusive offer",
          "body": "Hi {{first_name}},\n\nJust a reminder - your Challenge Graduate exclusive pricing for [Program Name] expires in 48 hours.\n\nIf you are ready to take your results to the next level, this is your chance to save $500.\n\nSee the offer: [OFFER_LINK]\n\nNo pressure if it is not right for you, but I did not want you to miss it!\n\n[Host Name]",
          "delay_hours": 144
        }
      ]
    }
  ]'::jsonb,
  30,
  true,
  false,
  5,
  '["coaching", "fitness", "business", "education", "creative"]'::jsonb,
  '["energetic", "encouraging", "friendly"]'::jsonb,
  'Generate content for a 5-day challenge funnel. The challenge should feel exciting, actionable, and community-driven. Each day builds on the previous one. Use encouraging language that motivates action while setting realistic expectations. The final offer should feel like a natural next step, not a hard sell.',
  '{
    "[Challenge Name]": "Name of the 5-day challenge",
    "[Topic]": "Main subject or skill being taught",
    "[Host Name]": "Challenge host name",
    "[Program Name]": "The paid program offered at the end",
    "[result]": "The transformation or outcome participants achieve",
    "[TIME]": "Time for live sessions",
    "[TIMEZONE]": "Timezone for scheduling"
  }'::jsonb,
  'intermediate'
) ON CONFLICT DO NOTHING;