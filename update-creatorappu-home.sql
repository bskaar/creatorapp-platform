UPDATE pages
SET
  content = '{
    "blocks": [
      {
        "id": "hero-main",
        "type": "hero",
        "styles": {
          "padding": "80px 20px 60px",
          "textAlign": "center",
          "backgroundColor": "#ffffff"
        },
        "content": {
          "badge": "No Coding Experience Required",
          "headline": "Prototype Anything with AI",
          "headlineHighlight": "Anything",
          "subheadline": "Turn your ideas into working AI prototypes in weeks, not months. Learn the proven SPARK framework and master the art of building functional AI products without writing a single line of code.",
          "ctaText": "Join the Course & Build Your First AI Prototype",
          "ctaUrl": "/pricing"
        }
      },
      {
        "id": "stats-section",
        "type": "stats",
        "styles": {
          "padding": "40px 20px",
          "backgroundColor": "#f8fafc"
        },
        "content": {
          "stats": [
            {
              "value": "6",
              "label": "Weeks",
              "color": "#3B82F6"
            },
            {
              "value": "6",
              "label": "Modules",
              "color": "#3B82F6"
            },
            {
              "value": "100+",
              "label": "Prototype Ideas",
              "color": "#3B82F6"
            }
          ]
        }
      },
      {
        "id": "what-youll-learn",
        "type": "feature-cards",
        "styles": {
          "padding": "60px 20px",
          "backgroundColor": "#f0f4ff"
        },
        "content": {
          "headline": "What You will Learn",
          "icon": "Brain",
          "cards": [
            {
              "title": "Master AI Fundamentals",
              "description": "Understand how AI works and identify opportunities",
              "icon": "CheckCircle"
            },
            {
              "title": "The SPARK Framework",
              "description": "Proven 5-step process for building AI prototypes",
              "icon": "CheckCircle"
            },
            {
              "title": "Build Real Products",
              "description": "Create functional AI prototypes from scratch",
              "icon": "CheckCircle"
            },
            {
              "title": "No-Code Tools Mastery",
              "description": "Leverage powerful AI tools without programming",
              "icon": "CheckCircle"
            }
          ]
        }
      },
      {
        "id": "spark-framework",
        "type": "gradient-card",
        "styles": {
          "padding": "60px 20px",
          "backgroundColor": "#ffffff"
        },
        "content": {
          "badge": "Complete 6-Module Curriculum",
          "headline": "From Idea to Working AI Prototype",
          "description": "Follow our proven SPARK framework to build functional AI prototypes. Each module builds on the last, taking you from beginner to confident AI builder in just 6 weeks.",
          "frameworkTitle": "The SPARK Framework",
          "frameworkSubtitle": "Your 5-Step Prototyping Process",
          "frameworkBadge": "Proven Framework",
          "steps": [
            {
              "letter": "S",
              "title": "Scope",
              "description": "Define your problem"
            },
            {
              "letter": "P",
              "title": "Plan",
              "description": "Design your solution"
            },
            {
              "letter": "A",
              "title": "Assemble",
              "description": "Build with AI tools"
            },
            {
              "letter": "R",
              "title": "Refine",
              "description": "Test and iterate"
            },
            {
              "letter": "K",
              "title": "Knowledge",
              "description": "Share and learn"
            }
          ]
        }
      },
      {
        "id": "curriculum-modules",
        "type": "module-list",
        "styles": {
          "padding": "60px 20px",
          "backgroundColor": "#faf8ff"
        },
        "content": {
          "headline": "6-Week Complete Curriculum",
          "modules": [
            {
              "number": 1,
              "title": "AI Fundamentals",
              "description": "Build your foundation in AI technology and understand how to identify AI opportunities.",
              "topics": [
                "How AI actually works",
                "Finding AI opportunities",
                "AI tools ecosystem"
              ]
            },
            {
              "number": 2,
              "title": "Prompt Engineering",
              "description": "Master the art of communicating with AI to get the results you want.",
              "topics": [
                "Effective prompt patterns",
                "Advanced techniques",
                "Testing and iteration"
              ]
            },
            {
              "number": 3,
              "title": "No-Code AI Platforms",
              "description": "Explore and master the best no-code tools for building AI applications.",
              "topics": [
                "Platform comparison",
                "Tool selection criteria",
                "Hands-on practice"
              ]
            },
            {
              "number": 4,
              "title": "The SPARK Process",
              "description": "Learn the systematic 5-step framework for building successful AI prototypes.",
              "topics": [
                "Framework deep-dive",
                "Real-world examples",
                "Step-by-step walkthrough"
              ]
            },
            {
              "number": 5,
              "title": "Building Your Prototype",
              "description": "Apply everything you have learned to build your first functional AI prototype.",
              "topics": [
                "Scoping your project",
                "Building systematically",
                "Testing and refining"
              ]
            },
            {
              "number": 6,
              "title": "Launch & Scale",
              "description": "Take your prototype from concept to market with proven launch strategies.",
              "topics": [
                "User testing methods",
                "Iteration strategies",
                "Scaling your solution"
              ]
            }
          ]
        }
      },
      {
        "id": "final-cta",
        "type": "cta",
        "styles": {
          "padding": "80px 20px",
          "backgroundColor": "#0f172a",
          "textColor": "#ffffff"
        },
        "content": {
          "headline": "Start Building AI Prototypes Today",
          "description": "Join the course and master the SPARK framework. Build functional AI products without writing code.",
          "buttonText": "View Course Options & Pricing",
          "buttonUrl": "/pricing",
          "features": [
            "6-week structured curriculum",
            "No coding experience required",
            "Build real AI prototypes",
            "Lifetime course access"
          ]
        }
      }
    ]
  }'::jsonb,
  updated_at = now()
WHERE id = '1720d8b7-cae6-443c-8e82-6231fabc75a3';
