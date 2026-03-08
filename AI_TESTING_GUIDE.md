# AI Features Testing Guide

## Deployment Status

All AI Edge Functions have been successfully deployed and are ACTIVE:

1. **ai-generate-text** - Claude-powered text generation (tier-based model selection)
2. **ai-coach-chat** - AI Co-Founder chat (tier-based model selection)
3. **ai-generate-gameplan** - Business gameplan generation
4. **search-images** - Pexels image search integration
5. **generate-color-palette** - AI color scheme generation (Haiku 4.5)
6. **generate-visual-theme** - Theme generation (Haiku 4.5)

## AI Model Orchestration

CreatorApp uses intelligent model routing based on subscription tier and task complexity:

| Model | API ID | Pricing | Used For |
|-------|--------|---------|----------|
| Claude Opus 4.6 | claude-opus-4-6 | $5/$25 per 1M tokens | Enterprise complex tasks |
| Claude Sonnet 4.6 | claude-sonnet-4-6 | $3/$15 per 1M tokens | Pro tier tasks |
| Claude Haiku 4.5 | claude-haiku-4-5 | $1/$5 per 1M tokens | Growth/Starter, simple tasks |

**Tier Routing:**
- Enterprise: Opus for complex, Sonnet for simple
- Pro: Sonnet for complex, Haiku for simple
- Growth/Starter: Haiku for all tasks
- Color palettes/themes: Always Haiku (regardless of tier)

## API Keys Configuration

API keys have been configured in Supabase Secrets:
- `ANTHROPIC_API_KEY` - Primary AI provider
- `OPENAI_API_KEY` - Fallback provider
- `PEXELS_API_KEY` - Image search

## 🧪 Testing Checklist

### Test 1: AI Text Generation (OpenAI)

**Where to test:** Edit any block in the Page Editor

**Test cases:**

1. **Headline Generation**
   - Navigate to a page editor
   - Add a Hero block
   - Click "Generate with AI" button below the headline field
   - Enter prompt: "Create a headline for a fitness coaching business"
   - Verify: Headline is generated and inserted into the field

2. **Subheadline Generation**
   - In the same Hero block
   - Click "Generate with AI" below subheadline
   - Enter prompt: "Supporting text about personal transformation"
   - Verify: Subheadline is generated

3. **CTA Button Text**
   - Add a CTA block
   - Generate button text
   - Quick prompt: "Get started now"
   - Verify: Short, actionable button text is generated

4. **Paragraph Content**
   - Add a Text block
   - Generate paragraph content
   - Prompt: "Write about the benefits of online coaching"
   - Verify: Multiple sentences of body copy generated

5. **Testimonial**
   - Add a Testimonial block
   - Generate testimonial
   - Prompt: "Customer success story about weight loss"
   - Verify: Realistic testimonial generated

### Test 2: Pexels Image Search

**Where to test:** Any block with image fields

**Test cases:**

1. **Image Block**
   - Add an Image block to the page
   - Click "Search Images" button
   - Search term: "business meeting"
   - Verify: Grid of 20 images appears
   - Click an image
   - Verify: Image URL is inserted into the field

2. **Hero Background Image**
   - Edit a Hero block
   - Click "Search Images" for backgroundImage field
   - Search: "mountain landscape"
   - Select an image
   - Verify: Background image URL is updated

3. **Search Various Terms**
   - Test searches: "fitness", "technology", "food", "fashion"
   - Verify: Relevant images appear for each category
   - Verify: Photographer attribution is shown

### Test 3: AI Color Palette Generator

**Where to test:** Theme Settings in Page Editor

**Test cases:**

1. **Professional Tech Palette**
   - Click "Theme" button in page editor
   - Click "AI Color Palette"
   - Select mood: "Professional"
   - Select industry: "Technology"
   - Click "Generate Palette"
   - Verify: 5 colors generated (primary, secondary, accent, neutral, background)
   - Click "Apply Palette"
   - Verify: Primary and secondary colors are updated in theme

2. **Creative Fashion Palette**
   - Generate with mood: "Creative", industry: "Fashion"
   - Verify: Different color scheme generated
   - Verify: Description explains the palette choice

3. **Multiple Generations**
   - Generate 3 different palettes
   - Verify: Each generation produces unique colors
   - Verify: Colors are in proper hex format (#RRGGBB)

## 🔍 Error Handling Tests

### Test API Key Issues

To verify error handling is working:

1. **Graceful Degradation**
   - If an API call fails, verify error message is displayed
   - Verify: Rest of the editor continues to work
   - Verify: Error message is user-friendly

2. **Loading States**
   - Click generate button
   - Verify: Button shows "Generating..." with spinner
   - Verify: Button is disabled during generation
   - Verify: No double-clicking possible

3. **Network Errors**
   - Check console for any network errors
   - Verify: CORS headers are working (no CORS errors)
   - Verify: Authentication is passed correctly

## 📊 Expected Behavior

### AI Text Generation
- **Response time:** 2-5 seconds
- **Quality:** Professional, context-aware copy
- **Format:** Clean text, no quotes or formatting artifacts
- **Length:** Appropriate for field type (headlines short, paragraphs longer)

### Pexels Image Search
- **Response time:** 1-3 seconds
- **Results:** 20 high-quality images
- **Format:** Properly sized thumbnails and full-resolution URLs
- **Attribution:** Photographer name and link included

### Color Palette Generator
- **Response time:** 2-5 seconds (uses Claude Haiku 4.5)
- **Colors:** 5 cohesive colors in hex format
- **Description:** Brief explanation of palette choice
- **Quality:** Accessible, professional color combinations

## 🐛 Common Issues & Solutions

### Issue: "Anthropic API key not configured"
- **Cause:** Secret not properly set in Supabase
- **Solution:** Verify secret name is exactly `ANTHROPIC_API_KEY`
- **Status:** Primary AI provider - should be configured

### Issue: "OpenAI API key not configured"
- **Cause:** Fallback provider secret not set
- **Solution:** Verify secret name is exactly `OPENAI_API_KEY`
- **Note:** OpenAI is used as fallback if Anthropic fails

### Issue: "Pexels API key not configured"
- **Cause:** Secret not properly set
- **Solution:** Verify secret name is exactly `PEXELS_API_KEY`
- **Status:** ✅ Should be resolved (keys added)

### Issue: "Not authenticated" error
- **Cause:** User not logged in
- **Solution:** Ensure user is logged in before accessing page editor
- **Status:** JWT verification is enabled on all functions

### Issue: CORS errors in console
- **Cause:** Missing or incorrect CORS headers
- **Solution:** All functions include proper CORS headers
- **Status:** ✅ CORS headers properly configured

## ✨ Success Criteria

All features are working correctly if:

1. ✅ AI text generates within 5 seconds
2. ✅ Generated text is relevant to prompts
3. ✅ Images load and can be selected
4. ✅ Color palettes apply to theme
5. ✅ No console errors during operation
6. ✅ Error messages are clear if something fails
7. ✅ Loading states show during API calls
8. ✅ All generated content can be manually edited after

## 🚀 Quick Test Script

Fastest way to test all features:

1. Login to the application
2. Navigate to Funnels → Create/Edit a page
3. Add a Hero block
4. Test text generation on headline field
5. Test image search on background image
6. Click Theme button
7. Test color palette generator
8. Verify all three features work end-to-end

Total test time: ~5 minutes

## 📝 Testing Notes

After testing, document:
- [ ] Which features worked perfectly
- [ ] Any errors or issues encountered
- [ ] Response times observed
- [ ] Quality of generated content
- [ ] User experience feedback

## 🎯 Next Steps After Testing

If all tests pass:
- Features are ready for production use
- Users can start leveraging AI to create content faster
- Monitor usage and API costs

If issues found:
- Check browser console for detailed errors
- Verify API keys are correct format
- Check Supabase function logs for server-side errors
