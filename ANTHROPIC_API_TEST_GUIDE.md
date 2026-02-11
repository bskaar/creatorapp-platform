# Anthropic API Integration Test Guide

## Quick Test Instructions

### Option 1: Run Test File (Recommended)
1. Open `test-ai-anthropic-integration.html` in your browser
2. When prompted, enter your Supabase credentials:
   - Supabase URL (from your .env file: `VITE_SUPABASE_URL`)
   - Supabase Anon Key (from your .env file: `VITE_SUPABASE_ANON_KEY`)
3. Click "Run All Tests" button
4. Review results for each function

### Option 2: Test Individual Functions
Click each test button individually to see detailed results for:
- **Text Generation** (Claude Haiku) - Quick copywriting
- **Color Palette** (Claude Haiku) - Accessible color generation
- **Visual Theme** (Claude Haiku) - Complete theme creation
- **AI Coach Chat** (Claude Sonnet) - Strategic advice
- **Gameplan Generator** (Claude Sonnet) - Action plans

## What the Tests Verify

### ✅ API Key Configuration
- Confirms `ANTHROPIC_API_KEY` is correctly set in Supabase
- Validates connection to Anthropic API

### ✅ Function Deployments
- All 5 AI functions are deployed and accessible
- CORS headers configured correctly
- Request/response format working

### ✅ Model Performance
- Claude 3.5 Haiku responding (for simple tasks)
- Claude 3.5 Sonnet responding (for strategic tasks)
- Response times within acceptable range

### ✅ Output Quality
- JSON parsing works correctly
- Generated content meets format requirements
- Error handling works as expected

## Expected Results

### Functions That Work Without Authentication
These 3 functions should return successful results:

1. **Text Generation** ✅
   - Returns: Generated headline text
   - Time: ~1-2 seconds

2. **Color Palette** ✅
   - Returns: 6-color palette with accessibility scores
   - Time: ~1-2 seconds

3. **Visual Theme** ✅
   - Returns: Complete theme object (colors, fonts, spacing)
   - Time: ~2-3 seconds

### Functions That Require Authentication
These 2 functions will return 401 errors (which is correct):

4. **AI Coach Chat** ⚠️
   - Expected: 401 Unauthorized (function deployed correctly)
   - To fully test: Log into your app and use the AI Co-Founder

5. **Gameplan Generator** ⚠️
   - Expected: 401 Unauthorized (function deployed correctly)
   - To fully test: Log into your app and click "Create Gameplan"

## Success Criteria

**All tests pass if:**
- Text Generation, Color Palette, and Visual Theme return successful results
- AI Coach Chat and Gameplan Generator return 401 errors (security working correctly)
- Average response time is under 5 seconds
- No CORS or network errors

## Troubleshooting

### Error: "Anthropic API key not configured"
**Solution**: Set the environment variable in Supabase
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add environment variable: `ANTHROPIC_API_KEY`
3. Value: Your Claude API key from console.anthropic.com
4. Redeploy functions if needed

### Error: "Invalid API key"
**Solution**: Verify your API key
1. Visit console.anthropic.com
2. Check your API key is active
3. Ensure you have sufficient credits
4. Copy the correct key to Supabase

### Error: "Network request failed"
**Solution**: Check CORS and function deployment
1. Verify functions are deployed: `supabase functions list`
2. Check function logs: Supabase Dashboard → Edge Functions → Logs
3. Ensure CORS headers are present in all functions

### All tests returning errors
**Solution**: Check basics
1. Confirm Supabase URL and Anon Key are correct
2. Verify internet connection
3. Check browser console for detailed errors
4. Try deploying functions again

## Testing in Production

Once the test file shows success, test the real user experience:

### 1. Test AI Co-Founder Chat
1. Log into your app
2. Click the floating AI button (bottom-right)
3. Ask: "How do I create my first sales funnel?"
4. Verify you get a detailed, formatted response

### 2. Test Gameplan Generation
1. On Dashboard, find the AI Co-Founder card
2. Click "Create Your Personalized Gameplan"
3. Enter: "Launch my first online course"
4. Verify a gameplan appears with 5-15 tasks

### 3. Test Task Tracking
1. View your gameplan on Dashboard
2. Click checkboxes to complete tasks
3. Verify progress bar updates
4. Confirm completed tasks show as done

### 4. Test Usage Limits
1. Open AI Assistant panel
2. Check header shows remaining requests
3. Verify count decreases after requests
4. Test that limit reached message appears (if applicable)

## API Cost Monitoring

After testing, check your usage:

### Anthropic Console
1. Visit console.anthropic.com
2. Go to Usage & Billing
3. Review API calls and token usage
4. Confirm costs are as expected

### Expected Costs (Approximate)
- **Haiku**: $0.25 per million input tokens, $1.25 per million output tokens
- **Sonnet**: $3 per million input tokens, $15 per million output tokens

**Typical Request Costs:**
- Text Generation: ~$0.001 per request (Haiku)
- Color Palette: ~$0.001 per request (Haiku)
- Visual Theme: ~$0.002 per request (Haiku)
- AI Coach Chat: ~$0.01 per message (Sonnet)
- Gameplan Generation: ~$0.03 per gameplan (Sonnet)

### Daily Usage Projections
**Launch Plan (50 requests/day):**
- Mixed usage: ~$0.50-$2.00 per day
- Annual: ~$180-$730

**Pro Plan (500 requests/day):**
- Mixed usage: ~$5-$20 per day
- Annual: ~$1,825-$7,300

## Support

If tests fail and troubleshooting doesn't help:
1. Check Supabase function logs for detailed error messages
2. Verify environment variables are set correctly
3. Confirm API key has sufficient credits
4. Review ANTHROPIC_API_TEST_GUIDE.md for common issues

## Summary Checklist

- [ ] Test file runs without errors
- [ ] Text Generation returns headline
- [ ] Color Palette returns 6 colors
- [ ] Visual Theme returns complete theme object
- [ ] AI Coach Chat returns 401 (or works if logged in)
- [ ] Gameplan Generator returns 401 (or works if logged in)
- [ ] Average response time under 5 seconds
- [ ] No CORS errors in browser console
- [ ] Anthropic API key is active and has credits
- [ ] All functions deployed to Supabase

Once all items are checked, your Anthropic integration is working correctly!
