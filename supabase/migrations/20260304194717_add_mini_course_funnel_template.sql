/*
  # Mini-Course Funnel Template

  1. New Template
    - Free or low-cost mini-course funnel
    - Curriculum preview and enrollment
    - Lesson delivery pages
    - Upgrade offer at completion

  2. Pages Included
    - Course landing page
    - Enrollment confirmation
    - Lesson pages (3-5 lessons)
    - Completion/upgrade page
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
  'Mini-Course Funnel',
  'Deliver a free or low-cost mini-course that builds trust and leads to your main offer. Perfect for lead generation or low-ticket entry points.',
  'course',
  'build_list',
  'https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=800',
  '[]'::jsonb,
  '[
    {
      "name": "Course Landing Page",
      "slug": "course",
      "type": "landing",
      "description": "Mini-course enrollment page",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Free Mini-Course: [Course Name]",
            "subheadline": "Learn [skill/topic] in just [X] lessons. Master the fundamentals and start seeing results right away.",
            "ctaText": "Enroll Free",
            "ctaLink": "#enroll",
            "badge": "Free Course",
            "backgroundImage": "https://images.pexels.com/photos/4145153/pexels-photo-4145153.jpeg?auto=compress&cs=tinysrgb&w=1200"
          }
        },
        {
          "type": "course_overview",
          "content": {
            "headline": "What You Will Learn",
            "description": "This [X]-lesson mini-course covers everything you need to [achieve outcome]. Perfect for [target audience] who want to [desired result].",
            "stats": [
              {"label": "Lessons", "value": "[X]"},
              {"label": "Duration", "value": "[X] hours"},
              {"label": "Level", "value": "Beginner"}
            ]
          }
        },
        {
          "type": "curriculum",
          "content": {
            "headline": "Course Curriculum",
            "lessons": [
              {
                "number": 1,
                "title": "[Lesson 1 Title]",
                "description": "Learn the foundations of [topic]. We cover [key concepts] and set you up for success.",
                "duration": "[X] min"
              },
              {
                "number": 2,
                "title": "[Lesson 2 Title]",
                "description": "Dive deeper into [topic]. You will learn [specific skills] that build on Lesson 1.",
                "duration": "[X] min"
              },
              {
                "number": 3,
                "title": "[Lesson 3 Title]",
                "description": "Put it all together with [practical application]. Leave with [tangible outcome].",
                "duration": "[X] min"
              }
            ],
            "bonus": {
              "title": "Bonus: [Bonus Name]",
              "description": "Get this exclusive [resource] when you complete the course"
            }
          }
        },
        {
          "type": "instructor",
          "content": {
            "headline": "Your Instructor",
            "name": "[Instructor Name]",
            "bio": "I have been teaching [topic] for [X] years and have helped [number]+ students [achieve result]. I created this free course because I believe everyone deserves access to [skill/knowledge].",
            "image": "https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=400",
            "credentials": ["[Credential 1]", "[Credential 2]", "[Credential 3]"]
          }
        },
        {
          "type": "testimonials",
          "content": {
            "headline": "What Students Are Saying",
            "testimonials": [
              {
                "quote": "This mini-course gave me a solid foundation. I went from confused to confident in just a few hours.",
                "name": "[Student Name]",
                "title": "[Role/Background]"
              },
              {
                "quote": "I have paid for courses that delivered less value than this free one. Highly recommend!",
                "name": "[Student Name]",
                "title": "[Role/Background]"
              }
            ]
          }
        },
        {
          "type": "enrollment_form",
          "content": {
            "headline": "Enroll Now - It is Free!",
            "fields": ["email", "firstName"],
            "ctaText": "Start Learning",
            "privacyNote": "No spam. Unsubscribe anytime.",
            "instantAccess": true
          }
        },
        {
          "type": "faq",
          "content": {
            "headline": "Questions? We Have Answers",
            "questions": [
              {"q": "Is this really free?", "a": "Yes, completely free! No credit card required."},
              {"q": "How long do I have access?", "a": "Lifetime access. Learn at your own pace."},
              {"q": "What if I get stuck?", "a": "Each lesson includes resources and you can always reach out with questions."},
              {"q": "Is this for beginners?", "a": "Yes! This course is designed for beginners with no prior experience."}
            ]
          }
        }
      ]
    },
    {
      "name": "Enrollment Confirmed",
      "slug": "enrolled",
      "type": "thank_you",
      "description": "Enrollment confirmation page",
      "blocks": [
        {
          "type": "confirmation",
          "content": {
            "headline": "You Are Enrolled!",
            "message": "Welcome to [Course Name]. You now have full access to all lessons.",
            "ctaText": "Start Lesson 1",
            "ctaLink": "/course/lesson-1"
          }
        },
        {
          "type": "quick_start",
          "content": {
            "headline": "Getting Started",
            "steps": [
              "Lesson 1 is available now - start whenever you are ready",
              "Each lesson builds on the previous one",
              "Complete the exercises for best results",
              "Join our community for support and accountability"
            ]
          }
        },
        {
          "type": "social_share",
          "content": {
            "headline": "Know Someone Who Would Love This?",
            "description": "Share this free course with friends or colleagues",
            "shareButtons": ["copy_link", "twitter", "linkedin", "email"]
          }
        }
      ]
    },
    {
      "name": "Lesson 1",
      "slug": "lesson-1",
      "type": "content",
      "description": "First lesson content",
      "blocks": [
        {
          "type": "lesson_header",
          "content": {
            "lessonNumber": 1,
            "totalLessons": 3,
            "title": "[Lesson 1 Title]",
            "description": "In this lesson, you will learn the foundations of [topic]."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "lesson_1_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_notes",
          "content": {
            "headline": "Lesson Notes",
            "content": "[Summary of key points covered in this lesson]\n\n**Key Takeaways:**\n- [Takeaway 1]\n- [Takeaway 2]\n- [Takeaway 3]"
          }
        },
        {
          "type": "exercise",
          "content": {
            "headline": "Your Exercise",
            "instructions": "Apply what you learned by completing this exercise:\n\n[Exercise description and instructions]",
            "downloadText": "Download Worksheet",
            "downloadLink": "[WORKSHEET_LINK]"
          }
        },
        {
          "type": "lesson_navigation",
          "content": {
            "prevLesson": null,
            "nextLesson": {"title": "[Lesson 2 Title]", "slug": "lesson-2"},
            "ctaText": "Continue to Lesson 2"
          }
        }
      ]
    },
    {
      "name": "Lesson 2",
      "slug": "lesson-2",
      "type": "content",
      "description": "Second lesson content",
      "blocks": [
        {
          "type": "lesson_header",
          "content": {
            "lessonNumber": 2,
            "totalLessons": 3,
            "title": "[Lesson 2 Title]",
            "description": "Building on Lesson 1, we now dive into [topic]."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "lesson_2_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_notes",
          "content": {
            "headline": "Lesson Notes",
            "content": "[Summary of key points covered in this lesson]\n\n**Key Takeaways:**\n- [Takeaway 1]\n- [Takeaway 2]\n- [Takeaway 3]"
          }
        },
        {
          "type": "exercise",
          "content": {
            "headline": "Your Exercise",
            "instructions": "[Exercise description and instructions]"
          }
        },
        {
          "type": "lesson_navigation",
          "content": {
            "prevLesson": {"title": "[Lesson 1 Title]", "slug": "lesson-1"},
            "nextLesson": {"title": "[Lesson 3 Title]", "slug": "lesson-3"},
            "ctaText": "Continue to Lesson 3"
          }
        }
      ]
    },
    {
      "name": "Lesson 3",
      "slug": "lesson-3",
      "type": "content",
      "description": "Third lesson content",
      "blocks": [
        {
          "type": "lesson_header",
          "content": {
            "lessonNumber": 3,
            "totalLessons": 3,
            "title": "[Lesson 3 Title]",
            "description": "Our final lesson brings everything together."
          }
        },
        {
          "type": "video_embed",
          "content": {
            "placeholder": "lesson_3_video",
            "aspectRatio": "16:9"
          }
        },
        {
          "type": "lesson_notes",
          "content": {
            "headline": "Lesson Notes",
            "content": "[Summary of key points covered in this lesson]\n\n**Key Takeaways:**\n- [Takeaway 1]\n- [Takeaway 2]\n- [Takeaway 3]"
          }
        },
        {
          "type": "exercise",
          "content": {
            "headline": "Your Final Exercise",
            "instructions": "[Final exercise that brings everything together]"
          }
        },
        {
          "type": "lesson_navigation",
          "content": {
            "prevLesson": {"title": "[Lesson 2 Title]", "slug": "lesson-2"},
            "nextLesson": null,
            "ctaText": "Complete the Course",
            "ctaLink": "/course/complete"
          }
        }
      ]
    },
    {
      "name": "Course Complete",
      "slug": "complete",
      "type": "thank_you",
      "description": "Course completion page with upgrade offer",
      "blocks": [
        {
          "type": "completion_header",
          "content": {
            "headline": "Congratulations! You Completed [Course Name]!",
            "message": "You have learned the fundamentals of [topic]. Here is what you accomplished:",
            "achievements": [
              "[Achievement 1]",
              "[Achievement 2]",
              "[Achievement 3]"
            ],
            "confetti": true
          }
        },
        {
          "type": "certificate_download",
          "content": {
            "headline": "Download Your Certificate",
            "description": "You earned it! Download your certificate of completion.",
            "ctaText": "Download Certificate",
            "ctaLink": "[CERTIFICATE_LINK]"
          }
        },
        {
          "type": "next_steps_offer",
          "content": {
            "headline": "Ready to Go Further?",
            "description": "You have built a solid foundation. Now take your skills to the next level with [Full Course Name].",
            "productName": "[Full Course Name]",
            "benefits": [
              "[X] additional in-depth lessons",
              "[Benefit 2]",
              "[Benefit 3]",
              "Direct access to [Instructor Name]",
              "Certificate of completion"
            ],
            "price": "$[Price]",
            "discount": "Mini-course graduates save [X]%",
            "salePrice": "$[Sale Price]",
            "ctaText": "Upgrade to the Full Course",
            "ctaLink": "/full-course",
            "image": "https://images.pexels.com/photos/4145190/pexels-photo-4145190.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
        },
        {
          "type": "testimonial_single",
          "content": {
            "quote": "The mini-course was great, but the full course took everything to another level. Best investment I have made.",
            "name": "[Student Name]",
            "title": "Full Course Graduate"
          }
        },
        {
          "type": "feedback_request",
          "content": {
            "headline": "We Would Love Your Feedback",
            "description": "How was your experience with [Course Name]? Your feedback helps us improve.",
            "ctaText": "Leave Feedback",
            "ctaLink": "[FEEDBACK_LINK]"
          }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "name": "Mini-Course Delivery Sequence",
      "trigger": "course_enrollment",
      "emails": [
        {
          "subject": "Welcome! Your first lesson is ready",
          "body": "Hi {{first_name}},\n\nWelcome to [Course Name]! I am excited to have you.\n\nYour first lesson is ready and waiting:\n\n[LESSON_1_LINK]\n\nHere is what you will learn in Lesson 1:\n- [Key point 1]\n- [Key point 2]\n- [Key point 3]\n\nCarve out [X] minutes and dive in!\n\n[Instructor Name]",
          "delay_hours": 0
        },
        {
          "subject": "Lesson 2 is ready for you",
          "body": "Hi {{first_name}},\n\nGreat job completing Lesson 1!\n\nLesson 2 is now available:\n\n[LESSON_2_LINK]\n\nIn this lesson, we build on what you learned and dive into [topic]. This is where things start to get exciting.\n\nSee you inside!\n\n[Instructor Name]",
          "delay_hours": 24
        },
        {
          "subject": "Your final lesson awaits",
          "body": "Hi {{first_name}},\n\nYou are almost there! Lesson 3 (your final lesson) is ready:\n\n[LESSON_3_LINK]\n\nIn this lesson, we bring everything together. By the end, you will be able to [outcome].\n\nLet us finish strong!\n\n[Instructor Name]",
          "delay_hours": 48
        },
        {
          "subject": "You did it! Plus a special offer",
          "body": "Hi {{first_name}},\n\nCongratulations on completing [Course Name]!\n\nYou now have a solid foundation in [topic]. But why stop here?\n\nAs a mini-course graduate, you have exclusive access to [Full Course Name] at a special price:\n\n[UPGRADE_LINK]\n\nThis offer is only available to mini-course graduates and expires in [X] days.\n\nProud of you!\n\n[Instructor Name]",
          "delay_hours": 72
        },
        {
          "subject": "Last chance: Your exclusive offer expires soon",
          "body": "Hi {{first_name}},\n\nJust a reminder - your exclusive discount on [Full Course Name] expires tomorrow.\n\nIf you are ready to take your [skill] to the next level, this is the time:\n\n[UPGRADE_LINK]\n\nNo pressure if it is not the right time. You will always have access to the mini-course.\n\n[Instructor Name]",
          "delay_hours": 144
        }
      ]
    }
  ]'::jsonb,
  20,
  false,
  true,
  10,
  '["education", "coaching", "creative", "business", "technology"]'::jsonb,
  '["educational", "encouraging", "supportive"]'::jsonb,
  'Generate content for a mini-course funnel (free or low-cost course with 3-5 lessons). Use educational and encouraging language. Structure content clearly with progressive lessons. Include practical exercises. The upgrade offer should feel natural, not pushy.',
  '{
    "[Course Name]": "Name of the mini-course",
    "[Full Course Name]": "Name of the premium/full course",
    "[Instructor Name]": "Course instructor name",
    "[topic]": "Main subject or skill",
    "[X]": "Number placeholder for lessons, duration, etc.",
    "[Lesson X Title]": "Individual lesson titles"
  }'::jsonb,
  'beginner'
) ON CONFLICT DO NOTHING;