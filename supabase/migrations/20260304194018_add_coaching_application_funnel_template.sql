/*
  # Coaching Application Funnel Template

  1. New Template
    - Full coaching application funnel with discovery call booking
    - Includes qualification form and calendar integration
    - Pre-written copy for life coaches, business coaches, health coaches

  2. Pages Included
    - Application landing page with coach credibility
    - Application form with qualification questions
    - Booking confirmation page
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
  'Coaching Application Funnel',
  'Convert high-ticket coaching clients with a qualification-based application process. Perfect for coaches who want to pre-screen leads before offering discovery calls.',
  'coaching',
  'book_call',
  'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
  '[]'::jsonb,
  '[
    {
      "name": "Application Page",
      "slug": "apply",
      "type": "landing",
      "description": "Main application landing page with coach credibility",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Ready to Transform Your Life in the Next 90 Days?",
            "subheadline": "I work with ambitious professionals who are ready to break through their limiting beliefs and create extraordinary results. If that sounds like you, apply for a complimentary strategy session below.",
            "ctaText": "Apply for Your Free Strategy Session",
            "ctaLink": "#apply",
            "backgroundStyle": "gradient",
            "backgroundImage": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200"
          }
        },
        {
          "type": "pain_points",
          "content": {
            "headline": "Is This You Right Now?",
            "points": [
              "You have achieved external success but feel unfulfilled and stuck in your career",
              "You know you are capable of more but cannot seem to break through to the next level",
              "You are exhausted from trying to figure everything out on your own",
              "You are ready to invest in yourself and work with someone who has been where you want to go"
            ]
          }
        },
        {
          "type": "solution",
          "content": {
            "headline": "What If You Had a Proven Roadmap?",
            "description": "In our work together, you will gain clarity on your vision, identify and eliminate the blocks holding you back, and create a strategic action plan that gets real results. My clients typically see breakthroughs within the first 30 days.",
            "image": "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
        },
        {
          "type": "benefits_grid",
          "content": {
            "headline": "What You Will Achieve",
            "benefits": [
              {"title": "Crystal Clear Vision", "description": "Define exactly what success looks like for you and create an inspiring roadmap to get there"},
              {"title": "Breakthrough Confidence", "description": "Eliminate self-doubt and step into the powerful leader you were meant to be"},
              {"title": "Strategic Action Plan", "description": "Know exactly what to focus on each week to move toward your biggest goals"},
              {"title": "Accountability Partner", "description": "Have someone in your corner who believes in you and holds you to your highest standards"}
            ]
          }
        },
        {
          "type": "testimonials",
          "content": {
            "headline": "What My Clients Are Saying",
            "testimonials": [
              {
                "quote": "Working with [Coach Name] completely transformed my approach to leadership. Within 3 months, I was promoted to VP and finally felt like I belonged there.",
                "name": "Sarah M.",
                "title": "Vice President, Tech Company"
              },
              {
                "quote": "I went from feeling stuck and burned out to launching my own consulting practice. The clarity I gained was invaluable.",
                "name": "Michael R.",
                "title": "Founder & Consultant"
              },
              {
                "quote": "The ROI on coaching was incredible. I 3x my income in one year by finally getting out of my own way.",
                "name": "Jennifer L.",
                "title": "Sales Director"
              }
            ]
          }
        },
        {
          "type": "instructor",
          "content": {
            "headline": "Meet Your Coach",
            "name": "[Your Name]",
            "bio": "I am a certified executive coach with over 10 years of experience helping high-achievers break through to their next level. After spending 15 years in corporate leadership, I discovered my true calling: helping others unlock their full potential. I have worked with hundreds of clients across industries including tech, finance, healthcare, and entrepreneurship.",
            "credentials": ["ICF Certified Coach", "MBA, [University]", "Former Fortune 500 Executive"],
            "image": "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400"
          }
        },
        {
          "type": "cta_section",
          "content": {
            "headline": "Ready to Get Started?",
            "description": "Apply for a complimentary 30-minute strategy session. We will discuss your goals, identify what is holding you back, and determine if we are a good fit to work together.",
            "ctaText": "Submit Your Application",
            "ctaLink": "#application-form",
            "note": "Due to high demand, I can only accept a limited number of new clients each month."
          }
        },
        {
          "type": "faq",
          "content": {
            "headline": "Frequently Asked Questions",
            "questions": [
              {"q": "How much does coaching cost?", "a": "Investment varies based on the program that is right for you. We will discuss options during your strategy session. My clients see this as an investment with significant ROI."},
              {"q": "How long is the coaching engagement?", "a": "Most clients work with me for 3-6 months. We will determine the right timeline based on your goals during our initial conversation."},
              {"q": "What if I am not sure coaching is right for me?", "a": "That is exactly what the free strategy session is for! We will explore your situation and I will give you honest feedback on whether coaching would help."},
              {"q": "Do you work with people in my industry?", "a": "I work with ambitious professionals across all industries. The principles of breakthrough performance are universal."}
            ]
          }
        }
      ]
    },
    {
      "name": "Application Form",
      "slug": "application",
      "type": "optin",
      "description": "Qualification form to pre-screen applicants",
      "blocks": [
        {
          "type": "form_header",
          "content": {
            "headline": "Apply for Your Free Strategy Session",
            "description": "Please take a few minutes to tell me about yourself and your goals. This helps me prepare for our conversation and ensures I can provide maximum value.",
            "note": "All information is kept strictly confidential."
          }
        },
        {
          "type": "application_form",
          "content": {
            "fields": [
              {"name": "firstName", "label": "First Name", "type": "text", "required": true},
              {"name": "lastName", "label": "Last Name", "type": "text", "required": true},
              {"name": "email", "label": "Email Address", "type": "email", "required": true},
              {"name": "phone", "label": "Phone Number", "type": "phone", "required": true},
              {"name": "currentRole", "label": "What is your current role/profession?", "type": "text", "required": true},
              {"name": "biggestChallenge", "label": "What is the biggest challenge you are facing right now?", "type": "textarea", "required": true},
              {"name": "desiredOutcome", "label": "What would you most like to achieve in the next 90 days?", "type": "textarea", "required": true},
              {"name": "readyToInvest", "label": "Are you ready and able to invest in yourself?", "type": "select", "required": true},
              {"name": "commitment", "label": "On a scale of 1-10, how committed are you to making a change?", "type": "select", "required": true}
            ],
            "submitText": "Submit Application",
            "privacyNote": "Your information is 100% secure and will never be shared."
          }
        }
      ]
    },
    {
      "name": "Confirmation",
      "slug": "application-received",
      "type": "thank_you",
      "description": "Application confirmation with next steps",
      "blocks": [
        {
          "type": "confirmation",
          "content": {
            "headline": "Application Received!",
            "message": "Thank you for taking the time to apply. I review every application personally and will be in touch within 24-48 hours.",
            "nextSteps": [
              "Check your email for a confirmation message",
              "Add hello@[yourdomain].com to your contacts so you do not miss my reply",
              "If approved, you will receive a link to book your strategy session"
            ],
            "ctaText": "Follow Me on LinkedIn",
            "ctaLink": "https://linkedin.com/in/yourprofile"
          }
        },
        {
          "type": "social_proof_mini",
          "content": {
            "stats": [
              {"number": "500+", "label": "Clients Coached"},
              {"number": "92%", "label": "Success Rate"},
              {"number": "10+", "label": "Years Experience"}
            ]
          }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "name": "Application Follow-up Sequence",
      "trigger": "application_submit",
      "emails": [
        {
          "subject": "Application Received - [Your Name] Coaching",
          "body": "Hi {{first_name}},\n\nThank you for applying for a strategy session with me. I have received your application and will review it personally.\n\nI was particularly interested in what you shared about your biggest challenge. This is exactly the kind of situation where coaching can make a dramatic difference.\n\nYou will hear from me within 24-48 hours with next steps.\n\nTalk soon,\n\n[Your Name]",
          "delay_hours": 0
        },
        {
          "subject": "Your Strategy Session is Approved",
          "body": "Hi {{first_name}},\n\nGreat news - after reviewing your application, I believe you would be an excellent fit for a complimentary strategy session.\n\nClick below to book a time that works for you:\n\n[BOOKING_LINK]\n\nDuring our 30-minute call, we will:\n- Clarify your #1 goal for the next 90 days\n- Identify what is really holding you back\n- Create an initial action plan\n- Discuss whether ongoing coaching would help\n\nLooking forward to connecting!\n\n[Your Name]",
          "delay_hours": 24
        },
        {
          "subject": "Quick reminder to book your session",
          "body": "Hi {{first_name}},\n\nI noticed you have not booked your strategy session yet. Spots fill up quickly, so I wanted to make sure you do not miss out.\n\nBook your session here: [BOOKING_LINK]\n\nIf you have any questions before booking, just reply to this email.\n\n[Your Name]",
          "delay_hours": 72
        }
      ]
    }
  ]'::jsonb,
  20,
  true,
  false,
  4,
  '["coaching", "consulting", "business", "health", "life"]'::jsonb,
  '["authoritative", "warm", "professional"]'::jsonb,
  'Generate content for a high-ticket coaching application funnel. The coach helps ambitious professionals achieve breakthrough results. Use aspirational but grounded language. Emphasize transformation, proven results, and exclusivity. The tone should convey expertise while remaining approachable.',
  '{
    "[Coach Name]": "The coach full name",
    "[Your Name]": "Coach first and/or last name",
    "[University]": "Educational institution name",
    "[yourdomain]": "Coach website domain",
    "90 days": "Coaching program timeframe",
    "30-minute": "Strategy call duration"
  }'::jsonb,
  'intermediate'
) ON CONFLICT DO NOTHING;