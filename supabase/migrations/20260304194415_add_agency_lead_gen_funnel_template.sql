/*
  # Digital Agency Lead Generation Funnel Template

  1. New Template
    - Agency lead generation with case studies
    - Free audit/consultation offer
    - Strategy call booking

  2. Pages Included
    - Case study showcase page
    - Free audit request page
    - Consultation booking confirmation
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
  'Digital Agency Lead Generation',
  'Convert prospects into qualified leads with case studies, free audits, and strategy call booking. Perfect for marketing agencies, web development firms, and creative studios.',
  'agency',
  'book_call',
  'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=800',
  '[]'::jsonb,
  '[
    {
      "name": "Homepage",
      "slug": "home",
      "type": "landing",
      "description": "Main agency landing page with case studies",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "We Help [Industry] Businesses [Achieve Result]",
            "subheadline": "Award-winning [service type] agency trusted by 100+ brands to deliver measurable results. See what we can do for you.",
            "ctaText": "Get Your Free Audit",
            "ctaLink": "/audit",
            "secondaryCta": "View Our Work",
            "secondaryCtaLink": "#case-studies",
            "backgroundImage": "https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200"
          }
        },
        {
          "type": "client_logos",
          "content": {
            "headline": "Trusted By Industry Leaders",
            "logos": ["client_logo_1", "client_logo_2", "client_logo_3", "client_logo_4", "client_logo_5", "client_logo_6"]
          }
        },
        {
          "type": "services_overview",
          "content": {
            "headline": "What We Do",
            "services": [
              {"title": "[Service 1]", "description": "Strategic [service] that drives growth and engagement", "icon": "target"},
              {"title": "[Service 2]", "description": "Data-driven [service] that delivers measurable ROI", "icon": "trending-up"},
              {"title": "[Service 3]", "description": "Creative [service] that stands out from the competition", "icon": "zap"},
              {"title": "[Service 4]", "description": "Technical [service] built for performance and scale", "icon": "code"}
            ]
          }
        },
        {
          "type": "results_stats",
          "content": {
            "headline": "Results That Speak for Themselves",
            "stats": [
              {"number": "150%", "label": "Average ROI Increase"},
              {"number": "2.5M+", "label": "Revenue Generated"},
              {"number": "100+", "label": "Clients Served"},
              {"number": "98%", "label": "Client Retention"}
            ]
          }
        },
        {
          "type": "case_studies",
          "content": {
            "headline": "Featured Case Studies",
            "studies": [
              {
                "client": "[Client Name 1]",
                "industry": "[Industry]",
                "challenge": "Needed to increase online leads by 50% while reducing cost per acquisition",
                "result": "Generated 150% more leads with 30% lower cost per lead in 6 months",
                "metrics": [{"label": "Lead Increase", "value": "+150%"}, {"label": "Cost Reduction", "value": "-30%"}],
                "image": "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=800",
                "testimonial": "Working with [Agency Name] transformed our marketing. The results exceeded our expectations."
              },
              {
                "client": "[Client Name 2]",
                "industry": "[Industry]",
                "challenge": "Struggling with brand awareness and market positioning",
                "result": "Achieved 200% increase in brand recognition and 3x social engagement",
                "metrics": [{"label": "Brand Awareness", "value": "+200%"}, {"label": "Engagement", "value": "3x"}],
                "image": "https://images.pexels.com/photos/3182759/pexels-photo-3182759.jpeg?auto=compress&cs=tinysrgb&w=800",
                "testimonial": "They understood our vision and brought it to life in ways we never imagined."
              },
              {
                "client": "[Client Name 3]",
                "industry": "[Industry]",
                "challenge": "E-commerce conversion rate was below industry average",
                "result": "Doubled conversion rate and increased average order value by 45%",
                "metrics": [{"label": "Conversion Rate", "value": "2x"}, {"label": "AOV Increase", "value": "+45%"}],
                "image": "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800",
                "testimonial": "The team is incredibly strategic and always delivers beyond expectations."
              }
            ]
          }
        },
        {
          "type": "process",
          "content": {
            "headline": "How We Work",
            "steps": [
              {"step": 1, "title": "Discovery", "description": "We start with a deep dive into your business, goals, and competitive landscape"},
              {"step": 2, "title": "Strategy", "description": "We develop a custom strategy tailored to your unique needs and objectives"},
              {"step": 3, "title": "Execution", "description": "Our team brings the strategy to life with precision and creativity"},
              {"step": 4, "title": "Optimization", "description": "We continuously analyze, test, and refine for maximum performance"}
            ]
          }
        },
        {
          "type": "team_preview",
          "content": {
            "headline": "Meet the Team Behind the Results",
            "description": "Our team combines strategic thinking with creative excellence. With backgrounds at top agencies and Fortune 500 brands, we bring enterprise-level expertise to every project.",
            "team": [
              {"name": "[Founder Name]", "role": "Founder & CEO", "image": "team_1"},
              {"name": "[Name]", "role": "Creative Director", "image": "team_2"},
              {"name": "[Name]", "role": "Head of Strategy", "image": "team_3"}
            ]
          }
        },
        {
          "type": "testimonials",
          "content": {
            "headline": "What Our Clients Say",
            "testimonials": [
              {
                "quote": "[Agency Name] is not just a vendor - they are a true strategic partner. They genuinely care about our success.",
                "name": "[Name]",
                "title": "CMO, [Company]",
                "image": "testimonial_1"
              },
              {
                "quote": "The ROI we have seen from working with them has been incredible. They consistently exceed expectations.",
                "name": "[Name]",
                "title": "CEO, [Company]",
                "image": "testimonial_2"
              }
            ]
          }
        },
        {
          "type": "cta_section",
          "content": {
            "headline": "Ready to Grow Your Business?",
            "description": "Get a free comprehensive audit of your current [marketing/website/brand] and discover opportunities for improvement.",
            "ctaText": "Request Your Free Audit",
            "ctaLink": "/audit",
            "note": "No obligation. Results delivered in 48 hours."
          }
        }
      ]
    },
    {
      "name": "Free Audit Request",
      "slug": "audit",
      "type": "optin",
      "description": "Free audit or assessment request page",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Get Your Free [Service] Audit",
            "subheadline": "Discover exactly what is holding your [marketing/website/brand] back and get actionable recommendations to improve results.",
            "backgroundImage": "https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1200"
          }
        },
        {
          "type": "audit_includes",
          "content": {
            "headline": "What Your Free Audit Includes",
            "items": [
              {"title": "Competitive Analysis", "description": "See how you stack up against top competitors in your space"},
              {"title": "Performance Review", "description": "Detailed analysis of your current [marketing/website] performance"},
              {"title": "Opportunity Identification", "description": "Specific areas where you can improve and grow"},
              {"title": "Action Plan", "description": "Prioritized recommendations you can implement immediately"},
              {"title": "Expert Consultation", "description": "30-minute call to discuss findings and answer questions"}
            ]
          }
        },
        {
          "type": "audit_form",
          "content": {
            "headline": "Request Your Free Audit",
            "fields": [
              {"name": "firstName", "label": "First Name", "type": "text", "required": true},
              {"name": "lastName", "label": "Last Name", "type": "text", "required": true},
              {"name": "email", "label": "Business Email", "type": "email", "required": true},
              {"name": "company", "label": "Company Name", "type": "text", "required": true},
              {"name": "website", "label": "Website URL", "type": "url", "required": true},
              {"name": "revenue", "label": "Annual Revenue Range", "type": "select", "options": ["Under $500K", "$500K - $1M", "$1M - $5M", "$5M - $10M", "$10M+"], "required": true},
              {"name": "challenge", "label": "Biggest Challenge", "type": "textarea", "placeholder": "What is your biggest marketing/business challenge right now?", "required": true}
            ],
            "submitText": "Get My Free Audit",
            "privacyNote": "Your information is confidential. We never share your data."
          }
        },
        {
          "type": "social_proof_mini",
          "content": {
            "stats": [
              {"number": "500+", "label": "Audits Completed"},
              {"number": "92%", "label": "Implement Recommendations"},
              {"number": "48hrs", "label": "Average Delivery"}
            ]
          }
        },
        {
          "type": "faq",
          "content": {
            "headline": "Frequently Asked Questions",
            "questions": [
              {"q": "Is this really free?", "a": "Yes, completely free with no obligation. We provide value upfront because we believe in the quality of our work."},
              {"q": "How long does the audit take?", "a": "We will deliver your comprehensive audit within 48 hours of your request."},
              {"q": "What happens after the audit?", "a": "We will schedule a 30-minute call to walk through the findings. If you want to work together, great. If not, you still keep all the insights."},
              {"q": "Do you work with businesses my size?", "a": "We work with businesses of all sizes, from startups to enterprise. The audit will help us determine if we are a good fit."}
            ]
          }
        }
      ]
    },
    {
      "name": "Audit Confirmation",
      "slug": "audit-requested",
      "type": "thank_you",
      "description": "Confirmation page after audit request",
      "blocks": [
        {
          "type": "confirmation",
          "content": {
            "headline": "Your Audit Request Is Confirmed!",
            "message": "Thank you for requesting a free audit. Our team is already analyzing your [website/marketing] and preparing your personalized recommendations.",
            "nextSteps": [
              "Check your email for a confirmation with next steps",
              "Expect your detailed audit report within 48 hours",
              "We will reach out to schedule your consultation call"
            ]
          }
        },
        {
          "type": "timeline",
          "content": {
            "headline": "What Happens Next",
            "steps": [
              {"time": "Now", "action": "Our team begins your analysis"},
              {"time": "24-48 Hours", "action": "You receive your detailed audit report"},
              {"time": "Within 72 Hours", "action": "We schedule your consultation call"}
            ]
          }
        },
        {
          "type": "case_study_preview",
          "content": {
            "headline": "While You Wait: See How We Helped [Client]",
            "description": "Learn how we helped a similar business achieve 150% increase in leads.",
            "ctaText": "Read the Case Study",
            "ctaLink": "/case-studies/example"
          }
        },
        {
          "type": "calendar_booking",
          "content": {
            "headline": "Want to Skip the Wait?",
            "description": "Book a strategy call now and we will deliver your audit results live.",
            "ctaText": "Book a Strategy Call",
            "ctaLink": "[CALENDLY_LINK]"
          }
        }
      ]
    },
    {
      "name": "Strategy Call Booked",
      "slug": "call-booked",
      "type": "thank_you",
      "description": "Confirmation after booking strategy call",
      "blocks": [
        {
          "type": "confirmation",
          "content": {
            "headline": "Your Strategy Call Is Booked!",
            "message": "We are looking forward to speaking with you. Here is everything you need to know before our call.",
            "calendarDetails": true
          }
        },
        {
          "type": "call_prep",
          "content": {
            "headline": "How to Prepare for Your Call",
            "items": [
              "Have access to your analytics (Google Analytics, ad accounts, etc.)",
              "Think about your top 3 business goals for the next 12 months",
              "Consider your current marketing budget and timeline",
              "Prepare any questions you have for our team"
            ]
          }
        },
        {
          "type": "calendar_buttons",
          "content": {
            "headline": "Add to Your Calendar",
            "buttons": ["google", "apple", "outlook"]
          }
        },
        {
          "type": "team_intro",
          "content": {
            "headline": "You Will Be Speaking With",
            "name": "[Consultant Name]",
            "role": "[Title]",
            "bio": "With [X] years of experience in [industry], [Name] has helped over [number] businesses achieve their growth goals.",
            "image": "consultant_photo"
          }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "name": "Audit Request Follow-up",
      "trigger": "audit_request",
      "emails": [
        {
          "subject": "Your free audit request is confirmed",
          "body": "Hi {{first_name}},\n\nThank you for requesting a free [Service] audit for {{company}}!\n\nOur team is already diving into your [website/marketing] and preparing your personalized analysis.\n\nHere is what you can expect:\n\n1. Within 48 hours: Your detailed audit report\n2. Specific recommendations for improvement\n3. A consultation call to discuss findings\n\nIn the meantime, here is a case study showing how we helped a similar business: [CASE_STUDY_LINK]\n\nWe will be in touch soon!\n\n[Agency Name] Team",
          "delay_hours": 0
        },
        {
          "subject": "Your audit is ready - here are the findings",
          "body": "Hi {{first_name}},\n\nYour comprehensive [Service] audit for {{company}} is complete!\n\nView your full report: [AUDIT_REPORT_LINK]\n\nKey findings:\n- [Finding 1 summary]\n- [Finding 2 summary]\n- [Finding 3 summary]\n\nWe have identified several opportunities that could significantly impact your results.\n\nWant to discuss these findings? Book a call with our team:\n\n[BOOKING_LINK]\n\nBest,\n\n[Consultant Name]\n[Agency Name]",
          "delay_hours": 48
        },
        {
          "subject": "Did you have a chance to review your audit?",
          "body": "Hi {{first_name}},\n\nI wanted to follow up on the audit we sent for {{company}}.\n\nDid you get a chance to review the findings? I would love to walk you through the recommendations and answer any questions.\n\nBook a quick call here: [BOOKING_LINK]\n\nNo pressure - just want to make sure you get maximum value from the audit.\n\nBest,\n\n[Consultant Name]",
          "delay_hours": 120
        }
      ]
    }
  ]'::jsonb,
  25,
  false,
  false,
  7,
  '["agency", "marketing", "web_development", "creative", "consulting"]'::jsonb,
  '["professional", "confident", "results-focused"]'::jsonb,
  'Generate content for a digital agency lead generation funnel. Position the agency as a strategic partner, not just a vendor. Emphasize measurable results, case studies, and ROI. Use confident but not arrogant language. Focus on business outcomes rather than technical details.',
  '{
    "[Agency Name]": "Name of the digital agency",
    "[Service 1-4]": "Core services offered",
    "[Industry]": "Target industry or niche",
    "[Client Name]": "Example client names",
    "[Founder Name]": "Agency founder or principal",
    "[Service]": "Primary service type (marketing, web, etc.)"
  }'::jsonb,
  'intermediate'
) ON CONFLICT DO NOTHING;