/*
  # Add Themed Page Templates

  1. Template Additions
    - Insert professionally designed page templates with unique visual themes
    - Each template has distinct color schemes, typography, and styling
    - Categories: landing, sales, course, webinar, lead_magnet, portfolio, about

  2. Theme Properties
    - Primary, secondary, accent, neutral, background colors
    - Typography settings (font family, sizes)
    - Spacing and border radius
    - Visual style identity

  3. Templates Included
    - Modern SaaS (Blue/Purple tech aesthetic)
    - Bold Creative (Vibrant colors, artistic)
    - Minimalist Elegance (Clean, sophisticated)
    - Warm Coaching (Earthy, welcoming)
    - Professional Corporate (Conservative, trustworthy)
    - Energetic Fitness (High energy, motivating)
    - Luxury Premium (Elegant, high-end)
    - Eco Friendly (Natural, green focus)
*/

-- Insert Modern SaaS Landing Page
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Modern SaaS Landing',
  'Perfect for tech startups and SaaS products. Features a bold hero section with modern gradients and clean typography.',
  'landing',
  null,
  '{
    "name": "Modern SaaS",
    "primaryColor": "#6366F1",
    "secondaryColor": "#8B5CF6",
    "accentColor": "#EC4899",
    "neutralColor": "#64748B",
    "backgroundColor": "#F8FAFC",
    "textColor": "#0F172A",
    "fontFamily": "Inter, system-ui, sans-serif",
    "headingFont": "Inter, system-ui, sans-serif",
    "borderRadius": "12px",
    "spacing": "comfortable",
    "style": "modern",
    "gradient": "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-1",
      "type": "hero",
      "content": {
        "headline": "Build Better Products Faster",
        "subheadline": "Modern tools for modern teams. Ship features your users love with our powerful platform.",
        "ctaText": "Start Free Trial",
        "ctaLink": "#",
        "secondaryCtaText": "Watch Demo",
        "image": "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200"
      },
      "style": {
        "backgroundColor": "#F8FAFC",
        "textAlign": "left",
        "padding": "80px 0"
      }
    },
    {
      "id": "features-1",
      "type": "features",
      "content": {
        "headline": "Everything You Need to Succeed",
        "features": [
          {"icon": "⚡", "title": "Lightning Fast", "description": "Optimized performance that scales with your business"},
          {"icon": "🔒", "title": "Enterprise Security", "description": "Bank-level encryption and compliance built-in"},
          {"icon": "📊", "title": "Advanced Analytics", "description": "Real-time insights into your key metrics"}
        ]
      }
    }
  ]'::jsonb,
  true,
  1
) ON CONFLICT (id) DO NOTHING;

-- Insert Bold Creative Landing Page
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Bold Creative',
  'Eye-catching design for creative professionals, agencies, and bold brands. Vibrant colors and dynamic layouts.',
  'landing',
  null,
  '{
    "name": "Bold Creative",
    "primaryColor": "#FF6B6B",
    "secondaryColor": "#4ECDC4",
    "accentColor": "#FFE66D",
    "neutralColor": "#2D3436",
    "backgroundColor": "#FFFFFF",
    "textColor": "#2D3436",
    "fontFamily": "Poppins, sans-serif",
    "headingFont": "Poppins, sans-serif",
    "borderRadius": "20px",
    "spacing": "spacious",
    "style": "creative",
    "gradient": "linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-2",
      "type": "hero",
      "content": {
        "headline": "Create Something Amazing",
        "subheadline": "Unleash your creativity and bring your boldest ideas to life.",
        "ctaText": "Get Started",
        "image": "https://images.pexels.com/photos/1309766/pexels-photo-1309766.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    }
  ]'::jsonb,
  true,
  2
) ON CONFLICT (id) DO NOTHING;

-- Insert Minimalist Elegance
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Minimalist Elegance',
  'Clean, sophisticated design with generous whitespace. Perfect for luxury brands and professional services.',
  'landing',
  null,
  '{
    "name": "Minimalist Elegance",
    "primaryColor": "#000000",
    "secondaryColor": "#2C2C2C",
    "accentColor": "#C9A063",
    "neutralColor": "#6B6B6B",
    "backgroundColor": "#FFFFFF",
    "textColor": "#2C2C2C",
    "fontFamily": "Crimson Text, serif",
    "headingFont": "Playfair Display, serif",
    "borderRadius": "2px",
    "spacing": "generous",
    "style": "minimal",
    "gradient": "linear-gradient(135deg, #2C2C2C 0%, #000000 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-3",
      "type": "hero",
      "content": {
        "headline": "Excellence in Every Detail",
        "subheadline": "Timeless quality meets modern sophistication.",
        "ctaText": "Discover More",
        "image": "https://images.pexels.com/photos/1687678/pexels-photo-1687678.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    }
  ]'::jsonb,
  true,
  3
) ON CONFLICT (id) DO NOTHING;

-- Insert Warm Coaching
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Warm Coaching',
  'Welcoming and approachable design for coaches, consultants, and personal brands. Earthy tones create trust.',
  'course',
  null,
  '{
    "name": "Warm Coaching",
    "primaryColor": "#D4724B",
    "secondaryColor": "#8B5A3C",
    "accentColor": "#E8B86D",
    "neutralColor": "#4A5759",
    "backgroundColor": "#FBF7F4",
    "textColor": "#3D3D3D",
    "fontFamily": "Lato, sans-serif",
    "headingFont": "Merriweather, serif",
    "borderRadius": "8px",
    "spacing": "comfortable",
    "style": "warm",
    "gradient": "linear-gradient(135deg, #D4724B 0%, #8B5A3C 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-4",
      "type": "hero",
      "content": {
        "headline": "Transform Your Life Today",
        "subheadline": "Personalized coaching to help you reach your full potential.",
        "ctaText": "Book Consultation",
        "image": "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    }
  ]'::jsonb,
  true,
  4
) ON CONFLICT (id) DO NOTHING;

-- Insert Professional Corporate
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Professional Corporate',
  'Traditional corporate design that builds trust. Perfect for B2B companies and professional services.',
  'landing',
  null,
  '{
    "name": "Professional Corporate",
    "primaryColor": "#1E3A8A",
    "secondaryColor": "#1E40AF",
    "accentColor": "#3B82F6",
    "neutralColor": "#64748B",
    "backgroundColor": "#F1F5F9",
    "textColor": "#1E293B",
    "fontFamily": "Roboto, sans-serif",
    "headingFont": "Roboto, sans-serif",
    "borderRadius": "4px",
    "spacing": "standard",
    "style": "corporate",
    "gradient": "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-5",
      "type": "hero",
      "content": {
        "headline": "Partner with Industry Leaders",
        "subheadline": "Enterprise solutions that drive measurable business results.",
        "ctaText": "Schedule Demo",
        "image": "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    }
  ]'::jsonb,
  true,
  5
) ON CONFLICT (id) DO NOTHING;

-- Insert Energetic Fitness
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Energetic Fitness',
  'High-energy design for fitness, wellness, and health brands. Bold colors motivate action.',
  'landing',
  null,
  '{
    "name": "Energetic Fitness",
    "primaryColor": "#DC2626",
    "secondaryColor": "#F59E0B",
    "accentColor": "#10B981",
    "neutralColor": "#1F2937",
    "backgroundColor": "#FFFFFF",
    "textColor": "#111827",
    "fontFamily": "Montserrat, sans-serif",
    "headingFont": "Montserrat, sans-serif",
    "borderRadius": "16px",
    "spacing": "dynamic",
    "style": "energetic",
    "gradient": "linear-gradient(135deg, #DC2626 0%, #F59E0B 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-6",
      "type": "hero",
      "content": {
        "headline": "Unleash Your Power",
        "subheadline": "Transform your body and mind with our proven fitness programs.",
        "ctaText": "Start Training",
        "image": "https://images.pexels.com/photos/4162491/pexels-photo-4162491.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    }
  ]'::jsonb,
  true,
  6
) ON CONFLICT (id) DO NOTHING;

-- Insert Luxury Premium
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Luxury Premium',
  'Elegant high-end design for luxury brands and premium products. Sophisticated and exclusive.',
  'sales',
  null,
  '{
    "name": "Luxury Premium",
    "primaryColor": "#0F172A",
    "secondaryColor": "#1E293B",
    "accentColor": "#D4AF37",
    "neutralColor": "#475569",
    "backgroundColor": "#FAFAFA",
    "textColor": "#0F172A",
    "fontFamily": "Cormorant Garamond, serif",
    "headingFont": "Cormorant Garamond, serif",
    "borderRadius": "0px",
    "spacing": "luxury",
    "style": "luxury",
    "gradient": "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-7",
      "type": "hero",
      "content": {
        "headline": "Exceptional by Design",
        "subheadline": "Experience unparalleled craftsmanship and timeless elegance.",
        "ctaText": "Explore Collection",
        "image": "https://images.pexels.com/photos/1682519/pexels-photo-1682519.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    }
  ]'::jsonb,
  true,
  7
) ON CONFLICT (id) DO NOTHING;

-- Insert Eco Friendly
INSERT INTO page_templates (
  name,
  description,
  category,
  thumbnail_url,
  theme,
  blocks,
  is_active,
  sort_order
) VALUES (
  'Eco Friendly',
  'Natural, sustainable design for eco-conscious brands. Green tones convey environmental values.',
  'landing',
  null,
  '{
    "name": "Eco Friendly",
    "primaryColor": "#059669",
    "secondaryColor": "#047857",
    "accentColor": "#84CC16",
    "neutralColor": "#52525B",
    "backgroundColor": "#F7FEF7",
    "textColor": "#18181B",
    "fontFamily": "Nunito, sans-serif",
    "headingFont": "Nunito, sans-serif",
    "borderRadius": "24px",
    "spacing": "organic",
    "style": "eco",
    "gradient": "linear-gradient(135deg, #059669 0%, #84CC16 100%)"
  }'::jsonb,
  '[
    {
      "id": "hero-8",
      "type": "hero",
      "content": {
        "headline": "Grow a Better Future",
        "subheadline": "Sustainable solutions for a healthier planet and thriving communities.",
        "ctaText": "Join the Movement",
        "image": "https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1200"
      }
    }
  ]'::jsonb,
  true,
  8
) ON CONFLICT (id) DO NOTHING;
