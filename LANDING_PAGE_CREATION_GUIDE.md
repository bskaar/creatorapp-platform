# Landing Page Creation & Import Guide

## Overview

Your platform offers **4 powerful ways** to create landing pages, each suited for different use cases:

1. **AI-Generated Pages** (NEW) - Fully automated with AI
2. **Professional Templates** - Start with themed designs
3. **Import from URL** - Clone existing pages
4. **Build from Scratch** - Complete creative control

---

## 1. AI-Generated Pages ✨ (Recommended)

### What It Does
- Generates complete landing pages in 15 seconds
- Creates custom color themes
- Writes compelling copy
- Structures layout for conversion

### How It Works

```typescript
// User provides:
- Industry (e.g., "Fitness Coaching")
- Target Audience (e.g., "Busy professionals")
- Page Purpose (e.g., "Lead Magnet")
- Tone (e.g., "Energetic")
- Key Features (optional)

// AI generates:
1. Hero section with headline & subheadline
2. Feature section (3 key benefits)
3. Social proof (testimonial)
4. Call-to-action section
5. Custom color theme
```

### User Flow

```
Create New Page → "AI Generate" button → Fill form → Preview → Use Page
```

### Implementation

The new `AIPageGenerator` component handles this:

```typescript
import AIPageGenerator from '../components/AIPageGenerator';

// In PageEditor or page creation flow:
{showAIGenerator && (
  <AIPageGenerator
    siteId={currentSite.id}
    onGenerate={(blocks, theme) => {
      setBlocks(blocks);
      setPageTheme(theme);
      setShowAIGenerator(false);
    }}
    onClose={() => setShowAIGenerator(false)}
  />
)}
```

### When to Use
- **First-time users**: Quickest path to a professional page
- **Rapid prototyping**: Test ideas fast
- **Writer's block**: Get AI-written copy as a starting point
- **Non-designers**: Get professional layouts automatically

---

## 2. Professional Templates

### What They Include
- Pre-designed layouts
- Themed color palettes
- Structured content blocks
- Industry-specific designs

### Available Templates
- Landing Pages
- Sales Pages
- Course Pages
- Webinar Registration
- Lead Magnets
- Portfolio
- About Pages

### User Flow

```
Create Page → Choose Template → Browse by Category → Select → Customize
```

### How It Works

```typescript
// TemplatePicker shows:
<TemplatePicker
  onSelect={(template) => {
    if (template) {
      setBlocks(template.blocks);
      setPageTheme(template.theme);
    }
  }}
  onClose={() => setShowTemplatePicker(false)}
/>

// Templates include:
{
  id: 'uuid',
  name: 'Fitness Landing Page',
  category: 'landing',
  blocks: [...],
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    gradient: 'linear-gradient(...)',
    style: 'energetic'
  }
}
```

### When to Use
- **Professional look needed**: Start with proven designs
- **Industry-specific needs**: Use category filters
- **Brand consistency**: Templates maintain design system
- **Time-sensitive**: Faster than building from scratch

---

## 3. Import from URL 🔗

### What It Does
- Scrapes any public webpage
- Extracts structure and content
- Converts to editable blocks
- Preserves images and text

### How It Works

The `ImportPageModal` component uses an edge function:

```typescript
// User enters URL
"https://competitor-site.com/landing"

// Edge function fetches & parses
{
  url: string
} → Edge Function → {
  blocks: [
    { type: 'hero', content: {...} },
    { type: 'features', content: {...} },
    { type: 'testimonial', content: {...} }
  ]
}

// Blocks added to page editor
```

### Edge Function (Already Implemented)
`supabase/functions/import-page-from-url/index.ts`

```typescript
// Fetches HTML
// Parses structure with Cheerio/JSDOM
// Extracts:
- Headings → hero blocks
- Images → image blocks
- Feature lists → feature blocks
- CTAs → cta blocks
// Returns structured JSON
```

### User Flow

```
Page Editor → Import Button → Enter URL → Preview Blocks → Add to Page
```

### Supported Content
- ✅ Headings and text
- ✅ Images and media
- ✅ Call-to-action buttons
- ✅ Feature sections
- ✅ List content
- ✅ Page structure

### When to Use
- **Competitor research**: Import and analyze competitors
- **Client sites**: Import client's existing pages
- **Redesigns**: Start with current content
- **Inspiration**: Import design inspiration
- **Migration**: Moving from another platform

### Limitations
- Public pages only (no auth-protected content)
- Some dynamic content may not import
- Complex layouts may need adjustment
- Images may need optimization

---

## 4. Build from Scratch

### What You Get
- Blank canvas
- Full creative control
- Drag & drop blocks
- AI assistance available

### Block Library
- Hero sections
- Text blocks
- Images & galleries
- Features grid
- Testimonials
- Forms & CTAs
- Pricing tables
- Video embeds
- Statistics
- And more...

### AI Assistance
Even when building from scratch, users can:
- Generate text with AI
- Create color palettes with AI
- Get design suggestions
- Optimize copy

### When to Use
- **Unique requirements**: Custom layouts
- **Brand-specific**: Very specific design needs
- **Iterative design**: Build piece by piece
- **Advanced users**: Full control desired

---

## Combining Methods 🎨

The real power comes from **combining these approaches**:

### Example 1: AI + Customization
```
1. Generate page with AI (30 seconds)
2. Replace AI images with your photos
3. Adjust colors to match brand
4. Add custom sections as needed
```

### Example 2: Import + AI Enhancement
```
1. Import competitor page (get structure)
2. Use AI to rewrite all copy
3. Apply your color theme
4. Add your unique selling points
```

### Example 3: Template + AI Content
```
1. Start with template (good structure)
2. Use AI to generate industry-specific content
3. Import images from inspiration site
4. Customize with your brand
```

---

## Recommended Workflow by User Type

### 👤 Complete Beginner
```
1. Use AI Generator (fastest)
2. Replace images with your own
3. Edit text to match your message
4. Done!
```

### 👤 Small Business Owner
```
1. Import competitor's page (understand structure)
2. Use AI to rewrite content for your business
3. Apply template theme or AI-generated colors
4. Add your branding
```

### 👤 Agency / Designer
```
1. Start with template for structure
2. Customize every detail
3. Use AI for rapid content variations
4. Build custom blocks as needed
```

### 👤 Enterprise Team
```
1. Import existing site (maintain content)
2. Apply new template theme
3. Use AI to refresh copy
4. Add new conversion-optimized sections
```

---

## Integration Points

### In PageEditor Component

Add these buttons to the page creation flow:

```typescript
const [showModal, setShowModal] = useState<'ai' | 'template' | 'import' | null>(null);

// Toolbar buttons:
<button onClick={() => setShowModal('ai')}>
  <Wand2 /> AI Generate
</button>

<button onClick={() => setShowModal('template')}>
  <Layout /> Choose Template
</button>

<button onClick={() => setShowModal('import')}>
  <Download /> Import from URL
</button>

// Render modals:
{showModal === 'ai' && (
  <AIPageGenerator
    siteId={siteId}
    onGenerate={(blocks, theme) => {
      setBlocks(blocks);
      setPageTheme(theme);
      setShowModal(null);
    }}
    onClose={() => setShowModal(null)}
  />
)}

{showModal === 'template' && (
  <TemplatePicker
    onSelect={(template) => {
      if (template) {
        setBlocks(template.blocks);
        setPageTheme(template.theme);
      }
      setShowModal(null);
    }}
    onClose={() => setShowModal(null)}
  />
)}

{showModal === 'import' && (
  <ImportPageModal
    onImport={(blocks) => {
      setBlocks([...existingBlocks, ...blocks]);
      setShowModal(null);
    }}
    onClose={() => setShowModal(null)}
  />
)}
```

---

## Best Practices

### For AI Generation
1. **Be specific**: "Fitness coaching for busy professionals" > "Fitness"
2. **Provide context**: Add key features to guide AI
3. **Iterate**: Generate multiple versions
4. **Customize**: Always personalize AI output

### For Templates
1. **Preview first**: Check on mobile/tablet
2. **Replace images**: Use your own high-quality images
3. **Adjust colors**: Match your brand
4. **Test CTAs**: Ensure buttons work

### For Import
1. **Check copyright**: Only import where you have rights
2. **Verify content**: Review all imported text
3. **Optimize images**: Compressed images may be low quality
4. **Test responsiveness**: Imported layouts may need adjustment

### For Scratch Builds
1. **Plan structure**: Sketch layout first
2. **Use grid system**: Maintain alignment
3. **Leverage AI**: Use AI for individual sections
4. **Save blocks**: Save custom blocks for reuse

---

## Technical Architecture

### Data Flow

```
User Action → Component → Edge Function → AI/Parser → Database → UI Update
```

### Components
- `AIPageGenerator` - NEW full-page AI generation
- `TemplatePicker` - Browse and select templates
- `ImportPageModal` - Import from URL
- `PageEditor` - Main editor canvas
- `BlockEditor` - Edit individual blocks
- `AITextGenerator` - AI for individual sections
- `AIColorPalette` - AI theme generation

### Edge Functions
- `ai-generate-text` - Generate content
- `generate-visual-theme` - Generate color themes
- `import-page-from-url` - Parse external pages
- `search-images` - Find stock images

### Database Tables
- `pages` - Store page data
- `page_templates` - Pre-built templates
- `custom_blocks` - User-saved blocks
- `page_versions` - Version history

---

## Future Enhancements

### Phase 1 (Next Sprint)
- [ ] AI A/B test variation generator
- [ ] Bulk template import
- [ ] Template marketplace
- [ ] Share templates between sites

### Phase 2
- [ ] AI landing page optimizer
- [ ] Import from Figma
- [ ] Video to landing page (AI)
- [ ] Voice-to-page (describe your page)

### Phase 3
- [ ] Multi-page import (full site)
- [ ] Canva integration
- [ ] WordPress import
- [ ] Competitive analysis (AI suggests improvements)

---

## Analytics & Insights

Track which method users prefer:

```sql
-- Track page creation method
ALTER TABLE pages ADD COLUMN creation_method text
CHECK (creation_method IN ('ai', 'template', 'import', 'scratch'));

-- Analytics query
SELECT
  creation_method,
  COUNT(*) as pages_created,
  AVG(EXTRACT(epoch FROM (published_at - created_at))/60) as avg_time_to_publish_minutes
FROM pages
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY creation_method;
```

---

## Summary

### Quick Decision Tree

```
Need page fast? → AI Generate
Know exact design? → Build from Scratch
Like competitor's page? → Import
Want proven layout? → Use Template
Want inspiration? → Browse Templates
Have existing page? → Import
No design skills? → AI Generate
Professional designer? → Scratch or Template
```

### Key Benefits

| Method | Speed | Quality | Customization | Best For |
|--------|-------|---------|---------------|----------|
| AI Generate | ⚡⚡⚡ | ⭐⭐⭐ | ⭐⭐ | Beginners |
| Templates | ⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Most users |
| Import | ⚡⚡ | ⭐⭐ | ⭐⭐⭐ | Migration |
| Scratch | ⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Designers |

---

## Support Resources

- Documentation: `/documentation`
- Video Tutorials: [Link to tutorials]
- Example Sites: [Link to showcase]
- Community: [Link to community]
