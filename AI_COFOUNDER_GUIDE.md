# AI Co-Founder Feature Guide

## Overview

The AI Co-Founder is your 24/7 marketing coach inspired by ClickFunnels' "Ask Todd" feature. It provides instant expert advice, creates actionable gameplans, and helps you build your creator business step by step.

## Key Features

### 1. Intelligent Chat Assistant
- **Conversational AI**: Powered by Claude 3.5 Sonnet for strategic advice
- **Context-Aware**: Knows your business name, industry, target audience, and goals
- **Educational Responses**: Uses named frameworks (Value Ladder, Dream100, Perfect Webinar)
- **Structured Formatting**: Clear headings, numbered lists, and actionable steps
- **Conversation History**: Saves and retrieves past conversations (last 20 messages for context)

### 2. Gameplan Generator
- **Idea to Action**: Converts business goals into 5-15 specific tasks
- **Prioritized Tasks**: High/Medium/Low priority with time estimates
- **Phased Approach**: Foundation → Growth → Optimization
- **Progress Tracking**: Visual progress bar and completion percentages
- **Task Management**: Check off tasks as you complete them

### 3. Always-Available Access
- **Floating Button**: Bottom-right corner on all pages
- **Dashboard Card**: Prominent placement with quick example prompts
- **Slide-Out Panel**: 450px width on desktop, full-screen on mobile
- **Persistent State**: Maintains conversation across page navigation

### 4. Rate Limiting & Usage Tracking
- **Tiered Limits**: Launch (50/day), Pro (500/day), Scale (unlimited)
- **Visual Feedback**: Shows remaining requests in panel header
- **Automatic Tracking**: Logs every request with model, tokens, and cost
- **Upgrade Prompts**: Clear messaging when limits are reached

## User Experience Flow

### First Interaction
1. User sees prominent AI Co-Founder card on Dashboard
2. Card shows avatar, tagline, and 4 example prompts
3. User clicks "Create Your Personalized Gameplan" or an example prompt
4. AI Assistant panel slides in from the right

### Chat Experience
1. User types question or goal
2. AI responds with educational, framework-based advice
3. Response includes:
   - Named strategy or framework
   - Numbered steps with explanations
   - Time estimates or frequency recommendations
   - "Next Steps" section
4. User can ask follow-up questions (conversation memory maintained)

### Gameplan Creation
1. User clicks "Create Gameplan" button
2. Enters business goal (e.g., "Launch my first online course")
3. AI generates structured plan with:
   - Descriptive title
   - 2-3 sentence overview
   - 5-15 specific tasks
   - Each task has: description, phase, priority, time estimate
4. Gameplan appears on Dashboard in GameplanManager component
5. User checks off tasks as they complete them
6. Progress bar updates automatically

## Technical Architecture

### Database Tables

**ai_conversations**
- Stores conversation metadata
- Links to sites and users
- Tracks last_message_at for sorting

**ai_messages**
- Stores individual messages (user and assistant)
- Contains message content and metadata
- Ordered by created_at

**ai_gameplans**
- Stores gameplan metadata
- Tracks progress_percentage and status
- Links to optional conversation

**ai_task_items**
- Stores individual tasks within gameplans
- Has priority, phase, status, estimated_time
- Trigger automatically updates gameplan progress

**ai_usage_tracking**
- Logs every AI request
- Tracks model_used, tokens_used, cost_cents
- Used for rate limiting

**ai_feedback**
- Stores user feedback on messages
- Enables quality improvement over time

### Edge Functions

**ai-coach-chat**
- Model: Claude 3.5 Sonnet
- Purpose: Strategic conversation and advice
- System Prompt: Comprehensive creator economy knowledge base
- Context: Includes site data, industry, target audience
- Response: Educational, framework-based advice

**ai-generate-gameplan**
- Model: Claude 3.5 Sonnet
- Purpose: Convert goals into structured action plans
- Output: JSON with title, description, tasks array
- Auto-saves: Creates gameplan and task records
- Tracking: Logs usage and costs

**ai-generate-text** (migrated)
- Model: Claude 3.5 Haiku (was OpenAI GPT-4o-mini)
- Purpose: Quick text generation (headlines, CTAs, copy)
- Cost: 10x cheaper, sub-2-second responses

**generate-color-palette** (migrated)
- Model: Claude 3.5 Haiku
- Purpose: Generate accessible color palettes
- Validation: WCAG AA contrast standards

**generate-visual-theme** (migrated)
- Model: Claude 3.5 Haiku
- Purpose: Complete theme generation (colors, typography, spacing)

### React Components

**AIAssistantPanel**
- Main chat interface
- Conversation list sidebar
- Message history display
- Input field with Create Gameplan button
- Usage limit display in header
- Rate limiting checks

**AIFloatingButton**
- Fixed position bottom-right
- Pulsing green indicator
- Opens AIAssistantPanel
- Always visible on all pages

**AICoFounderCard**
- Dashboard feature card
- Gradient background (blue)
- 4 example prompts
- "Create Your Personalized Gameplan" CTA
- Shows online status

**GameplanManager**
- Displays active gameplans
- Progress visualization
- Task list by phase
- Checkbox to mark complete
- Priority badges
- Time estimates

### Custom Hooks

**useAIUsage**
- Checks today's usage count
- Fetches plan limits from subscription_plans
- Returns: maxRequestsPerDay, requestsUsedToday, remainingRequests, isLimitReached
- Provides refreshUsage() function

## Knowledge Base

The AI Co-Founder is trained on:

### Frameworks & Strategies
- Russell Brunson's Value Ladder
- Attractive Character framework
- Hook-Story-Offer formula
- Dream100 Strategy
- Perfect Webinar formula
- Product Launch sequences
- Funnel optimization tactics

### Expertise Areas
- Course & Product Creation
- Pricing Strategies (tripwire, core, high-ticket)
- Email Marketing (welcome, nurture, sales sequences)
- Lead Generation (organic, paid, partnerships)
- Funnel Design (lead magnet, webinar, launch)
- Community Building
- Conversion Psychology

### Communication Style
- Named frameworks when applicable
- Clear headings and numbered lists
- Specific tactics with timeframes
- "Why it works" explanations
- Real-world examples
- Actionable "Next Steps"
- Bold text for key concepts

## Rate Limits by Plan

### Launch Plan
- 50 AI requests per day
- Resets at midnight UTC
- Upgrade prompt shown at limit

### Pro Plan
- 500 AI requests per day
- Suitable for active creators
- Costs tracked for analytics

### Scale Plan
- Unlimited AI requests
- For power users
- Still tracks usage for insights

## Cost Optimization

### Model Selection
- **Haiku for simple tasks**: 10x cheaper
  - Text generation (headlines, CTAs)
  - Color palettes
  - Visual themes
- **Sonnet for strategic work**: Higher quality
  - Conversational advice
  - Gameplan generation
  - Complex analysis

### Prompt Caching
- System prompts cached (90% cost reduction)
- Conversation history truncated to last 20 messages
- Site data fetched once per session

## Usage Examples

### Example 1: First Funnel
**User**: "How do I create my first sales funnel?"

**AI Response**:
"**The Value Ladder Approach**

Here's the proven framework for creating your first sales funnel:

**1. Start with a Lead Magnet (Free)**
- Create a quick-win PDF, checklist, or mini-course
- Solves ONE specific problem your audience has
- Takes 30-60 minutes to create
- Example: '5-Day Email Course on Getting Your First 100 Subscribers'

**2. Build the Thank You Page (Tripwire Offer)**
- After opt-in, offer a low-ticket product ($7-$27)
- Makes the funnel profitable immediately
- 10-20% conversion rate is typical

**3. Create Your Core Offer ($97-$497)**
- Your main product or course
- Promoted via email sequence over 7-14 days
- This is where you make real money

**Why This Works:**
You're building trust incrementally. Free → Small purchase → Larger purchase. Each step qualifies your audience further.

**Next Steps:**
1. Define your lead magnet topic today
2. Create a simple opt-in page (use our templates)
3. Write 3 emails for your sequence
4. Launch and drive traffic"

### Example 2: Gameplan Creation
**User**: "Create a gameplan for launching my first online course"

**AI Generates**:
```
Title: "Launch Your First Online Course in 6 Weeks"
Description: This gameplan takes you from idea validation to your first paying students...

Tasks:
1. [Foundation, High, 2 hours] Validate your course idea with 10 target audience interviews
2. [Foundation, High, 1 day] Create a detailed course outline with 5-8 modules
3. [Foundation, Medium, 3 hours] Set up your course platform and payment processing
4. [Growth, High, 1 week] Record your first 3 modules (aim for progress over perfection)
5. [Growth, High, 2 days] Create a compelling sales page with clear benefits
... (continues with 10 more tasks)
```

## Security & Privacy

- All conversations are user-scoped (RLS policies)
- No cross-user data leakage
- API keys never exposed to client
- Input sanitization on all requests
- Rate limiting prevents abuse
- Conversation history can be deleted

## Future Enhancements

Potential additions (not yet implemented):
- Proactive suggestions based on user behavior
- Content generation buttons in editors
- Performance-based recommendations
- A/B test suggestions
- Funnel optimization analysis
- Webhook for real-time updates
- Voice input support
- Mobile app integration

## Troubleshooting

**Panel won't open?**
- Check browser console for errors
- Verify user is authenticated
- Ensure site is selected

**Rate limit reached?**
- Check Settings → Subscription to view current plan
- Usage resets at midnight UTC
- Upgrade to Pro for 500/day

**AI not responding?**
- Check ANTHROPIC_API_KEY is configured
- Verify edge function deployment
- Check Supabase logs for errors

**Gameplans not showing?**
- Refresh page to reload gameplans
- Check database for ai_gameplans records
- Verify user_id and site_id match

## Monitoring

Track these metrics in production:
- Average response time (target: <5s for Sonnet)
- Token usage per request
- Cost per conversation
- User satisfaction (thumbs up/down)
- Gameplan completion rates
- Feature adoption (% of users who try it)
- Daily active users of AI feature

## Support

For issues or questions:
1. Check browser console for errors
2. Review Supabase function logs
3. Verify environment variables are set
4. Test with simple prompt first
5. Check database RLS policies

## Summary

The AI Co-Founder feature provides instant, expert guidance to help creators build successful businesses. By combining Claude's intelligence with creator economy expertise, structured gameplans, and always-available access, we've created a feature that truly acts as a 24/7 business partner.

Key differentiators from ClickFunnels' Todd:
1. **Executes, not just explains**: Generates gameplans with task tracking
2. **Always visible**: Floating button + dashboard card
3. **Transparent limits**: Clear usage tracking and upgrade paths
4. **Actionable outputs**: Structured plans, not just advice
5. **Context-aware**: Knows your business and goals
