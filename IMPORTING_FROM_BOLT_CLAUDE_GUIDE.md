# Importing Pages from Bolt, Claude & Other AI Tools

## Overview

You can now import HTML pages created in **any tool** directly into your platform:

- ✅ **Bolt.new** - AI-generated web apps
- ✅ **Claude.ai** - AI-written HTML
- ✅ **ChatGPT** - Generated landing pages
- ✅ **Figma** - Exported HTML
- ✅ **Local HTML files** - Any HTML you've created
- ✅ **Any URL** - Public webpages

---

## 🎯 Quick Start Guide

### Option 1: Import from Bolt.new

```
1. Create your page in Bolt.new
2. Copy the entire HTML from Bolt's preview
3. In your platform: Page Editor → Import → "Paste HTML" tab
4. Paste the HTML code
5. Click "Parse HTML to Blocks"
6. Preview and import!
```

### Option 2: Import from Claude/ChatGPT

```
1. Ask Claude: "Create a landing page for [your business]"
2. Copy the generated HTML code
3. In your platform: Page Editor → Import → "Paste HTML" tab
4. Paste the HTML
5. Click "Parse HTML to Blocks"
6. Customize and publish!
```

### Option 3: Import from Any URL

```
1. Find a page you like (competitor, inspiration, your own site)
2. Copy the page URL
3. In your platform: Page Editor → Import → "From URL" tab
4. Paste the URL
5. Click "Import"
6. Edit and make it yours!
```

---

## 📋 Step-by-Step: Bolt.new to Your Platform

### Step 1: Create in Bolt

Ask Bolt to create your page:

```
"Create a modern landing page for a fitness coaching business with:
- Hero section with CTA
- 3 key benefits
- Testimonial
- Pricing section
- Contact form"
```

### Step 2: Export the HTML

In Bolt.new:
1. Click on the preview pane
2. Right-click → "View Page Source" (or Ctrl+U / Cmd+U)
3. Select all HTML (Ctrl+A / Cmd+A)
4. Copy (Ctrl+C / Cmd+C)

Alternative method:
1. Open browser DevTools (F12)
2. Click "Elements" or "Inspector" tab
3. Right-click on `<html>` tag
4. Select "Copy" → "Copy Outer HTML"

### Step 3: Import to Your Platform

1. Go to your page editor
2. Click **"Import"** button (or similar import option)
3. Switch to **"Paste HTML"** tab
4. Paste your HTML code
5. Click **"Parse HTML to Blocks"**
6. Wait 2-3 seconds for parsing

### Step 4: Review Preview

The system will extract:
- ✅ Headlines → Hero blocks
- ✅ Paragraphs → Text blocks
- ✅ Images → Image blocks
- ✅ Lists → Feature blocks
- ✅ Buttons → CTA blocks

You'll see:
- Number of blocks created
- Number of images found
- Preview of all content

### Step 5: Import & Customize

1. Click **"Add to Page"**
2. Content appears in your page editor
3. Now you can:
   - Replace images with your logos
   - Edit text content
   - Adjust colors and styling
   - Rearrange blocks
   - Add/remove sections

---

## 🖼️ Replacing Images & Logos

### Where Images Come From

When you import HTML:
- External images are linked (http URLs)
- Some images might be placeholders
- Stock photos from Bolt/Claude
- Icons and graphics

### How to Replace with Your Own

**Method 1: In Block Editor**

```
1. Click on any image block
2. Look for "Edit" or image icon
3. Choose:
   - Upload from computer
   - Search stock photos (Pexels)
   - Enter image URL
4. Save changes
```

**Method 2: Using File Upload**

```
1. Go to Settings → Media Library (if available)
2. Upload all your brand assets (logos, images)
3. Return to page editor
4. Click image blocks
5. Select from your uploaded media
```

**Method 3: Direct URL Replace**

```
1. Upload your image to any hosting (Imgur, Cloudinary, etc.)
2. Copy the image URL
3. In block editor, find image URL field
4. Replace with your URL
5. Save
```

### Best Practices for Images

- **Logos**: Use PNG with transparent background
- **Photos**: Optimize to under 500KB (use TinyPNG)
- **Dimensions**:
  - Hero backgrounds: 1920x1080px
  - Section images: 1200x800px
  - Thumbnails: 400x300px
  - Logos: 300x100px (or maintain aspect ratio)

---

## 🎨 What Gets Imported

### Successfully Imported

| Element | Becomes |
|---------|---------|
| `<h1>` + `<p>` | Hero block |
| `<h2>`, `<h3>` | Section headers |
| `<p>` | Text blocks |
| `<img>` | Image blocks |
| `<ul>`, `<ol>` | Feature blocks |
| `<button>`, `<a class="btn">` | CTA blocks |
| Form elements | Form blocks (if detected) |

### May Need Adjustment

- Complex CSS animations → May simplify
- JavaScript interactions → May not import
- Custom fonts → Use platform fonts or add manually
- Video embeds → May need to re-embed
- iframes → May need manual addition

### Not Imported

- `<script>` tags (security)
- `<style>` tags (use platform styling)
- External CSS files (apply platform theme)
- JavaScript files

---

## 💡 Pro Tips & Workflows

### Workflow 1: Design in Bolt, Refine Here

```
1. Rapid prototype in Bolt (5 minutes)
2. Import HTML to platform (1 minute)
3. Replace all images with your brand assets (10 minutes)
4. Adjust colors to match brand (5 minutes)
5. Connect to your domain (instant)
Total: ~20 minutes for professional page
```

### Workflow 2: Claude + Your Assets

```
1. Get HTML structure from Claude
2. Import to platform
3. Use AI Color Palette tool for brand colors
4. Upload your photos/logos
5. AI-enhance copy with built-in AI tools
Result: AI-designed page with your unique branding
```

### Workflow 3: Competitor Analysis

```
1. Find competitor landing page
2. Import their URL
3. See their structure in blocks
4. Replace ALL content with yours
5. Apply different theme/colors
6. Add unique sections
Result: Competitive structure, unique content
```

### Workflow 4: Template Mashup

```
1. Import Bolt page for structure
2. Import competitor page for inspiration
3. Use platform template for color theme
4. Cherry-pick best blocks from each
5. Add AI-generated content
Result: Best-of-breed hybrid page
```

---

## 🔧 Troubleshooting

### "No blocks were extracted"

**Problem**: HTML too simple or malformed

**Solutions**:
- Ensure HTML has proper structure (`<html>`, `<body>`)
- Add content: headings, paragraphs, images
- Check for syntax errors in HTML
- Try with just the `<body>` content

### "Images not loading"

**Problem**: Image URLs are relative or broken

**Solutions**:
- Use absolute URLs (https://...)
- Re-upload images to your platform
- Use stock photo search in platform
- Replace with placeholder, upload later

### "Layout looks different"

**Problem**: Custom CSS not imported

**Solutions**:
- Use platform's styling tools
- Apply one of the built-in themes
- Adjust block settings manually
- Use AI to generate matching theme colors

### "Missing sections"

**Problem**: Complex HTML structure

**Solutions**:
- Import simpler HTML sections separately
- Manually add missing blocks
- Use template for that section type
- Ask AI to regenerate in simpler HTML

---

## 📚 Examples

### Example 1: Bolt Fitness Page

**What you paste from Bolt:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>FitPro Coaching</title>
</head>
<body>
  <header>
    <h1>Transform Your Body in 90 Days</h1>
    <p>Personal training that fits your schedule and goals</p>
    <button>Start Free Trial</button>
  </header>

  <section>
    <h2>Why Choose FitPro</h2>
    <ul>
      <li>Customized workout plans</li>
      <li>24/7 coach support</li>
      <li>Nutrition guidance included</li>
    </ul>
  </section>

  <img src="https://example.com/trainer.jpg" alt="Trainer" />

  <blockquote>
    "Lost 30 pounds in 12 weeks!" - Sarah M.
  </blockquote>
</body>
</html>
```

**What you get:**

1. **Hero Block**
   - Headline: "Transform Your Body in 90 Days"
   - Subheadline: "Personal training that fits your schedule and goals"
   - CTA: "Start Free Trial"

2. **Features Block**
   - "Why Choose FitPro"
   - 3 features with icons

3. **Image Block**
   - Trainer photo (you'll replace with your trainer)

4. **Testimonial Block**
   - Quote: "Lost 30 pounds in 12 weeks!" - Sarah M.

### Example 2: Claude SaaS Page

**Claude prompt:**

```
Create a landing page HTML for a project management SaaS tool called "TaskFlow".
Include hero, features, pricing, and CTA sections. Make it modern and professional.
```

**What Claude gives you:**
- Complete HTML structure
- Professional copy
- Section layouts
- Call-to-action buttons

**After import:**
- All sections become editable blocks
- Replace "TaskFlow" with your brand name
- Upload your screenshot/demo images
- Adjust pricing to your plans
- Change colors with AI theme tool

---

## 🚀 Advanced Techniques

### Combining Multiple Sources

```typescript
// Workflow:
1. Import Bolt page → Get structure
2. Import competitor page → Get ideas
3. Use AI text generator → Fresh copy
4. Apply AI color palette → Brand colors
5. Upload your images → Unique assets

// Result:
Professional page that's uniquely yours!
```

### AI-Enhanced Import Flow

```
1. Import any HTML page
2. For each text block:
   → Use AI text generator to rewrite
   → Maintain structure, change voice
3. For color scheme:
   → Use AI color palette tool
   → Match your brand vibe
4. For images:
   → Use AI image search
   → Or upload your own
5. For optimization:
   → Use AI to enhance headlines
   → A/B test suggestions
```

### Batch Import Workflow

```
If you have multiple pages to migrate:

1. Create a spreadsheet with all page URLs
2. Import each URL one by one
3. Save each as a page template
4. Bulk replace images later
5. Bulk apply brand colors
6. Publish all at once
```

---

## 🎓 Best Practices

### DO ✅

- **Test in Bolt first**: Iterate quickly in Bolt before importing
- **Keep HTML clean**: Simpler HTML imports better
- **Use semantic HTML**: Proper heading hierarchy helps
- **Plan your images**: Know what you'll replace before importing
- **Import early**: Get structure early, refine later
- **Save versions**: Keep original imports as templates

### DON'T ❌

- **Don't rely on inline CSS**: Won't import perfectly
- **Don't use complex animations**: May not translate
- **Don't embed scripts**: Security blocked
- **Don't skip preview**: Always check before importing
- **Don't forget SEO**: Add proper meta tags after import
- **Don't import production pages**: Only use for inspiration

---

## 📊 Feature Comparison

| Feature | URL Import | HTML Import |
|---------|-----------|-------------|
| **Speed** | Medium (5-10 sec) | Fast (1-2 sec) |
| **Source** | Live websites | Any HTML code |
| **Images** | Auto-fetched | URL-based |
| **Styling** | Limited | Limited |
| **Complex layouts** | Better | Good |
| **Offline work** | ❌ No | ✅ Yes |
| **Best for** | Competitors, inspiration | Bolt, Claude, local files |

---

## 🎯 Use Cases

### For Freelancers

```
1. Client sends rough design
2. Build quick version in Bolt
3. Import to platform
4. Replace with client assets
5. Share preview link
6. Get approval faster
```

### For Agencies

```
1. Design system in Bolt
2. Import base template
3. Clone for each client
4. Customize per brand
5. Deploy all sites
6. Manage from dashboard
```

### For Solo Creators

```
1. Describe idea to Claude
2. Get HTML structure
3. Import to platform
4. Add your personality
5. Upload your photos
6. Launch in hours not days
```

### For Marketers

```
1. Import competitor pages
2. Analyze their structure
3. Build better version
4. A/B test variations
5. Track conversions
6. Iterate based on data
```

---

## 🔮 Coming Soon

Features planned for future releases:

- [ ] **Figma Import**: Direct Figma to blocks
- [ ] **Bulk Image Replace**: Upload zip, auto-replace
- [ ] **Style Preservation**: Import CSS styling
- [ ] **Animation Import**: Preserve animations
- [ ] **Font Detection**: Match fonts automatically
- [ ] **Color Extraction**: Auto-detect brand colors
- [ ] **Multi-page Import**: Import entire sites
- [ ] **WordPress Import**: Migrate from WordPress
- [ ] **Component Library**: Save imported blocks

---

## 📞 Support

### Having Issues?

1. Check HTML is valid (use validator.w3.org)
2. Try simpler HTML first
3. Import in sections if needed
4. Check image URLs are absolute
5. Review browser console for errors

### Need Help?

- Documentation: `/documentation`
- Video Tutorials: [Link]
- Community Forum: [Link]
- Support Email: support@yourplatform.com

---

## Summary

**Import from Bolt/Claude in 3 steps:**

1. **Copy HTML** from any source
2. **Paste** into import modal
3. **Customize** and publish

**Then enhance:**
- Replace images with yours
- Apply your brand colors
- Refine copy with AI
- Add unique sections
- Connect your domain

**Result:** Professional landing page in minutes, not hours!
