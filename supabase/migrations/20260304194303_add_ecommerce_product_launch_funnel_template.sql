/*
  # E-commerce Product Launch Funnel Template

  1. New Template
    - Product launch funnel for physical/digital products
    - Includes teaser, waitlist, launch day, and confirmation pages
    - Pre-written copy for e-commerce launches

  2. Pages Included
    - Coming soon/teaser page
    - Waitlist signup page
    - Launch day sales page
    - Order confirmation
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
  'E-commerce Product Launch',
  'Build anticipation and drive sales with a strategic product launch funnel. Perfect for new product releases, limited editions, or seasonal collections.',
  'ecommerce',
  'sell_product',
  'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800',
  '[]'::jsonb,
  '[
    {
      "name": "Coming Soon",
      "slug": "coming-soon",
      "type": "landing",
      "description": "Teaser page to build anticipation",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "Something Exciting Is Coming",
            "subheadline": "Be the first to know when [Product Name] launches. Join the waitlist for exclusive early access and special launch pricing.",
            "backgroundImage": "https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "ctaText": "Join the Waitlist",
            "ctaLink": "#waitlist"
          }
        },
        {
          "type": "countdown",
          "content": {
            "headline": "Launching In:",
            "style": "elegant",
            "launchDate": "[Launch Date]"
          }
        },
        {
          "type": "teaser_features",
          "content": {
            "headline": "Get Ready For...",
            "features": [
              {"icon": "sparkles", "text": "Premium quality you can feel"},
              {"icon": "leaf", "text": "Sustainably made with care"},
              {"icon": "truck", "text": "Free shipping on launch orders"},
              {"icon": "gift", "text": "Exclusive launch day bonuses"}
            ]
          }
        },
        {
          "type": "product_teaser",
          "content": {
            "image": "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800",
            "headline": "Crafted for Those Who Appreciate the Details",
            "description": "We have been working on something special for over [time period]. Every detail has been carefully considered to bring you a product that exceeds expectations."
          }
        },
        {
          "type": "waitlist_form",
          "content": {
            "headline": "Be First in Line",
            "description": "Waitlist members get early access, special pricing, and exclusive bonuses not available to the public.",
            "fields": ["email", "firstName"],
            "ctaText": "Join the Waitlist",
            "privacyNote": "We respect your inbox. Unsubscribe anytime."
          }
        },
        {
          "type": "social_proof_mini",
          "content": {
            "stats": [
              {"number": "2,500+", "label": "On the Waitlist"},
              {"number": "4.9/5", "label": "Previous Product Rating"}
            ]
          }
        }
      ]
    },
    {
      "name": "Waitlist Confirmed",
      "slug": "waitlist-confirmed",
      "type": "thank_you",
      "description": "Confirmation page for waitlist signups",
      "blocks": [
        {
          "type": "confirmation",
          "content": {
            "headline": "You Are on the List!",
            "message": "Thank you for joining the [Product Name] waitlist. You will be among the first to know when we launch, plus you will get exclusive early access.",
            "nextSteps": [
              "Check your email for a confirmation",
              "Follow us on Instagram for behind-the-scenes sneak peeks",
              "Share with friends who would love this"
            ]
          }
        },
        {
          "type": "share_invite",
          "content": {
            "headline": "Share the Excitement",
            "description": "Know someone who would love [Product Name]? Share this page and help them get on the list too.",
            "shareButtons": ["copy_link", "email", "twitter", "facebook"]
          }
        },
        {
          "type": "social_follow",
          "content": {
            "headline": "Follow Along",
            "description": "Get behind-the-scenes content and launch updates",
            "platforms": ["instagram", "tiktok", "pinterest"]
          }
        }
      ]
    },
    {
      "name": "Launch Day Sales Page",
      "slug": "shop",
      "type": "sales_page",
      "description": "Main product sales page for launch day",
      "blocks": [
        {
          "type": "hero",
          "content": {
            "headline": "[Product Name] Is Here",
            "subheadline": "The wait is over. Get yours now with free shipping on all launch orders.",
            "badge": "Launch Special",
            "backgroundImage": "https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=1200",
            "ctaText": "Shop Now",
            "ctaLink": "#product"
          }
        },
        {
          "type": "product_gallery",
          "content": {
            "images": [
              "https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=800",
              "https://images.pexels.com/photos/5632381/pexels-photo-5632381.jpeg?auto=compress&cs=tinysrgb&w=800",
              "https://images.pexels.com/photos/5632371/pexels-photo-5632371.jpeg?auto=compress&cs=tinysrgb&w=800"
            ],
            "productName": "[Product Name]",
            "price": "$[Price]",
            "comparePrice": "$[Compare Price]",
            "description": "Premium [product type] crafted with attention to every detail. Made from [materials] and designed to [benefit]."
          }
        },
        {
          "type": "launch_offer",
          "content": {
            "headline": "Launch Day Special",
            "offers": [
              {"icon": "truck", "text": "Free shipping on all orders"},
              {"icon": "gift", "text": "Free [bonus item] with every purchase"},
              {"icon": "percent", "text": "15% off your first order"}
            ],
            "urgency": "Launch pricing ends [end date]"
          }
        },
        {
          "type": "features_grid",
          "content": {
            "headline": "Why You Will Love It",
            "features": [
              {"title": "Premium Materials", "description": "Made from [materials] for lasting quality", "icon": "award"},
              {"title": "Thoughtful Design", "description": "Every detail considered for optimal [benefit]", "icon": "heart"},
              {"title": "Sustainably Made", "description": "Eco-conscious production and packaging", "icon": "leaf"},
              {"title": "Satisfaction Guaranteed", "description": "30-day returns, no questions asked", "icon": "shield"}
            ]
          }
        },
        {
          "type": "how_its_made",
          "content": {
            "headline": "The Story Behind [Product Name]",
            "story": "We spent [time period] developing [Product Name] because we believed [reason]. After dozens of iterations and feedback from [number] beta testers, we are proud to bring you a product that truly delivers.",
            "image": "https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=800"
          }
        },
        {
          "type": "testimonials",
          "content": {
            "headline": "What Early Reviewers Are Saying",
            "testimonials": [
              {
                "quote": "I have tried so many [product type] and this is hands down the best. The quality is unmatched.",
                "name": "Emma S.",
                "title": "Beta Tester",
                "verified": true
              },
              {
                "quote": "Worth every penny. The attention to detail is incredible.",
                "name": "James P.",
                "title": "Early Adopter",
                "verified": true
              },
              {
                "quote": "This is exactly what I have been looking for. Already ordered a second one as a gift!",
                "name": "Olivia R.",
                "title": "Beta Tester",
                "verified": true
              }
            ]
          }
        },
        {
          "type": "product_options",
          "content": {
            "headline": "Choose Your [Product Name]",
            "variants": [
              {"name": "[Variant 1]", "price": "$[Price]", "image": "variant_1"},
              {"name": "[Variant 2]", "price": "$[Price]", "image": "variant_2"},
              {"name": "[Variant 3]", "price": "$[Price]", "image": "variant_3"}
            ],
            "ctaText": "Add to Cart"
          }
        },
        {
          "type": "faq",
          "content": {
            "headline": "Frequently Asked Questions",
            "questions": [
              {"q": "What is your return policy?", "a": "We offer 30-day returns on all orders. If you are not completely satisfied, simply return your purchase for a full refund."},
              {"q": "How long does shipping take?", "a": "Orders ship within 1-2 business days. Standard shipping takes 3-5 days, express shipping takes 1-2 days."},
              {"q": "Is this product sustainable?", "a": "Yes! We use eco-friendly materials and sustainable packaging. Our manufacturing process minimizes waste."},
              {"q": "How long will the launch special last?", "a": "Launch pricing and free shipping are available until [end date] or while supplies last."}
            ]
          }
        },
        {
          "type": "final_cta",
          "content": {
            "headline": "Ready to Experience [Product Name]?",
            "description": "Join thousands of satisfied customers who have already discovered the difference.",
            "ctaText": "Get Yours Now",
            "ctaLink": "#product",
            "urgency": "Free shipping ends soon"
          }
        }
      ]
    },
    {
      "name": "Order Confirmation",
      "slug": "thank-you",
      "type": "thank_you",
      "description": "Post-purchase confirmation page",
      "blocks": [
        {
          "type": "order_confirmation",
          "content": {
            "headline": "Thank You for Your Order!",
            "message": "We are so excited to get [Product Name] into your hands. Your order is being prepared with care.",
            "orderDetails": true
          }
        },
        {
          "type": "whats_next",
          "content": {
            "headline": "What Happens Next",
            "steps": [
              {"step": 1, "title": "Order Processing", "description": "Your order is being carefully prepared and packaged"},
              {"step": 2, "title": "Shipping Confirmation", "description": "You will receive an email with tracking information"},
              {"step": 3, "title": "Delivery", "description": "Your package will arrive in 3-5 business days"}
            ]
          }
        },
        {
          "type": "upsell",
          "content": {
            "headline": "Complete Your Collection",
            "description": "Add these complementary items to your order:",
            "products": [
              {"name": "[Accessory 1]", "price": "$[Price]", "image": "accessory_1"},
              {"name": "[Accessory 2]", "price": "$[Price]", "image": "accessory_2"}
            ],
            "ctaText": "Add to Order",
            "discount": "Get 20% off when you add now"
          }
        },
        {
          "type": "share_purchase",
          "content": {
            "headline": "Share Your Excitement",
            "description": "Let your friends know about your new [Product Name]!",
            "shareButtons": ["instagram", "twitter", "facebook"],
            "referralCode": "Share your unique code for 10% off for friends"
          }
        }
      ]
    }
  ]'::jsonb,
  '[
    {
      "name": "Waitlist Nurture Sequence",
      "trigger": "waitlist_signup",
      "emails": [
        {
          "subject": "You are on the [Product Name] waitlist!",
          "body": "Hi {{first_name}},\n\nThank you for joining the [Product Name] waitlist! You are now among the first to know about our launch.\n\nAs a waitlist member, you will get:\n- Early access before the public launch\n- Exclusive launch day pricing\n- Special bonuses only for waitlist members\n\nWe are putting the finishing touches on [Product Name] and cannot wait to share it with you.\n\nStay tuned!\n\n[Brand Name] Team\n\nP.S. Follow us on Instagram for behind-the-scenes sneak peeks: [INSTAGRAM_LINK]",
          "delay_hours": 0
        },
        {
          "subject": "Sneak peek: [Product Name]",
          "body": "Hi {{first_name}},\n\nWe wanted to give you an exclusive look at what we have been working on.\n\n[SNEAK_PEEK_IMAGE]\n\nHere is what makes [Product Name] special:\n\n- [Feature 1 with benefit]\n- [Feature 2 with benefit]\n- [Feature 3 with benefit]\n\nWe are almost ready to launch, and you will be the first to know!\n\n[Brand Name] Team",
          "delay_hours": 72
        },
        {
          "subject": "Launch Day is [Date] - Mark Your Calendar!",
          "body": "Hi {{first_name}},\n\nIt is official - [Product Name] launches on [Date]!\n\nAs a waitlist member, you will get:\n- Early access starting at [Time]\n- Free shipping on your order\n- Exclusive [bonus] worth $[Value]\n\nSet a reminder so you do not miss out. Launch day items tend to sell fast!\n\nSee you soon,\n\n[Brand Name] Team",
          "delay_hours": 168
        },
        {
          "subject": "Tomorrow is the day!",
          "body": "Hi {{first_name}},\n\n[Product Name] launches TOMORROW!\n\nYour early access link will arrive in your inbox at [Time]. Keep an eye out!\n\nHere is what you will get:\n- First access to [Product Name]\n- Free shipping (waitlist exclusive)\n- Free [bonus] with your order\n\nGet ready!\n\n[Brand Name] Team",
          "delay_hours": -24
        },
        {
          "subject": "[LIVE] Your early access to [Product Name]",
          "body": "Hi {{first_name}},\n\nIt is HERE! [Product Name] is now live for waitlist members.\n\nYour exclusive early access link: [SHOP_LINK]\n\nRemember, you get:\n- Free shipping on your order\n- Free [bonus] worth $[Value]\n- First pick before the public launch\n\nDo not wait - early inventory is limited!\n\nHappy shopping,\n\n[Brand Name] Team",
          "delay_hours": 0
        }
      ]
    },
    {
      "name": "Post-Purchase Sequence",
      "trigger": "purchase",
      "emails": [
        {
          "subject": "Order confirmed! Thank you, {{first_name}}",
          "body": "Hi {{first_name}},\n\nThank you for your order! We are so excited that you chose [Product Name].\n\nOrder Summary:\n[ORDER_DETAILS]\n\nWhat happens next:\n1. Your order is being prepared with care\n2. You will receive a shipping confirmation with tracking\n3. Your package will arrive in 3-5 business days\n\nQuestions? Just reply to this email.\n\nThank you for your support!\n\n[Brand Name] Team",
          "delay_hours": 0
        },
        {
          "subject": "Your [Product Name] has shipped!",
          "body": "Hi {{first_name}},\n\nGreat news - your order is on its way!\n\nTrack your package: [TRACKING_LINK]\n\nEstimated delivery: [DELIVERY_DATE]\n\nWe cannot wait for you to experience [Product Name]!\n\n[Brand Name] Team",
          "delay_hours": 48
        },
        {
          "subject": "How are you enjoying [Product Name]?",
          "body": "Hi {{first_name}},\n\nYou have had [Product Name] for about a week now. We would love to hear how you are liking it!\n\nYour feedback helps us improve and helps other customers make informed decisions.\n\nLeave a review: [REVIEW_LINK]\n\nThank you for being part of the [Brand Name] family!\n\n[Brand Name] Team\n\nP.S. Share a photo on Instagram with #[hashtag] for a chance to be featured!",
          "delay_hours": 168
        }
      ]
    }
  ]'::jsonb,
  25,
  false,
  false,
  6,
  '["ecommerce", "retail", "fashion", "beauty", "home"]'::jsonb,
  '["exciting", "premium", "friendly"]'::jsonb,
  'Generate content for an e-commerce product launch funnel. Build anticipation and excitement for a new product. Use aspirational language that highlights product quality and exclusivity. Create urgency around launch timing and limited availability without being pushy.',
  '{
    "[Product Name]": "Name of the product being launched",
    "[Brand Name]": "Company or brand name",
    "[Price]": "Product price",
    "[Compare Price]": "Original or compare-at price",
    "[Launch Date]": "Official launch date",
    "[materials]": "What the product is made from",
    "[product type]": "Category of product",
    "[bonus item]": "Free gift with purchase"
  }'::jsonb,
  'intermediate'
) ON CONFLICT DO NOTHING;