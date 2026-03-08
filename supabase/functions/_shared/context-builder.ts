import { createClient } from "jsr:@supabase/supabase-js@2";
import { type SubscriptionTier } from "./ai-config.ts";

export interface BusinessContext {
  siteName: string;
  industry: string;
  targetAudience?: string;
  businessGoals?: string;
  experienceLevel?: string;
  productsCount?: number;
  funnelsCount?: number;
  contactsCount?: number;
}

export interface UserContext {
  recentActivity?: string[];
  onboardingComplete: boolean;
  accountAge?: string;
}

export interface AssembledContext {
  systemContext: string;
  businessContext: BusinessContext;
  userContext: UserContext;
  contextDepth: 'minimal' | 'standard' | 'rich';
}

const CONTEXT_DEPTH_BY_TIER: Record<SubscriptionTier, 'minimal' | 'standard' | 'rich'> = {
  enterprise: 'rich',
  pro: 'standard',
  growth: 'minimal',
  starter: 'minimal',
};

export async function assembleContext(
  supabase: ReturnType<typeof createClient>,
  siteId: string,
  userId: string,
  tier: SubscriptionTier
): Promise<AssembledContext> {
  const contextDepth = CONTEXT_DEPTH_BY_TIER[tier];

  const { data: siteData } = await supabase
    .from('sites')
    .select('name, industry, onboarding_data, created_at')
    .eq('id', siteId)
    .single();

  const businessContext: BusinessContext = {
    siteName: siteData?.name || 'Your Business',
    industry: siteData?.industry || 'General',
  };

  const userContext: UserContext = {
    onboardingComplete: false,
  };

  if (siteData?.onboarding_data) {
    const onboarding = siteData.onboarding_data as Record<string, unknown>;
    if (onboarding.targetAudience) {
      businessContext.targetAudience = String(onboarding.targetAudience);
    }
    if (onboarding.businessGoals) {
      businessContext.businessGoals = String(onboarding.businessGoals);
    }
    if (onboarding.experienceLevel) {
      businessContext.experienceLevel = String(onboarding.experienceLevel);
    }
    userContext.onboardingComplete = true;
  }

  if (siteData?.created_at) {
    const createdAt = new Date(siteData.created_at);
    const now = new Date();
    const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation < 7) {
      userContext.accountAge = 'new';
    } else if (daysSinceCreation < 30) {
      userContext.accountAge = 'recent';
    } else {
      userContext.accountAge = 'established';
    }
  }

  if (contextDepth === 'standard' || contextDepth === 'rich') {
    const [productsResult, funnelsResult, contactsResult] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
      supabase.from('funnels').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    ]);

    businessContext.productsCount = productsResult.count || 0;
    businessContext.funnelsCount = funnelsResult.count || 0;
    businessContext.contactsCount = contactsResult.count || 0;
  }

  if (contextDepth === 'rich') {
    const { data: recentConversations } = await supabase
      .from('ai_conversations')
      .select('title')
      .eq('site_id', siteId)
      .eq('user_id', userId)
      .order('last_message_at', { ascending: false })
      .limit(5);

    if (recentConversations && recentConversations.length > 0) {
      userContext.recentActivity = recentConversations.map(c => c.title);
    }
  }

  const systemContext = buildSystemContextString(businessContext, userContext, contextDepth);

  return {
    systemContext,
    businessContext,
    userContext,
    contextDepth,
  };
}

function buildSystemContextString(
  business: BusinessContext,
  user: UserContext,
  depth: 'minimal' | 'standard' | 'rich'
): string {
  let context = `\n\nUser's Business Context:
- Business Name: ${business.siteName}
- Industry: ${business.industry}`;

  if (business.targetAudience) {
    context += `\n- Target Audience: ${business.targetAudience}`;
  }

  if (business.businessGoals) {
    context += `\n- Business Goals: ${business.businessGoals}`;
  }

  if (depth === 'minimal') {
    return context;
  }

  if (business.experienceLevel) {
    context += `\n- Experience Level: ${business.experienceLevel}`;
  }

  if (business.productsCount !== undefined) {
    context += `\n- Products Created: ${business.productsCount}`;
  }

  if (business.funnelsCount !== undefined) {
    context += `\n- Funnels Created: ${business.funnelsCount}`;
  }

  if (business.contactsCount !== undefined) {
    context += `\n- Contact List Size: ${business.contactsCount}`;
  }

  if (depth === 'standard') {
    return context;
  }

  if (user.accountAge) {
    const ageDescriptions: Record<string, string> = {
      new: 'New user (less than a week)',
      recent: 'Recent user (1-4 weeks)',
      established: 'Established user (1+ months)',
    };
    context += `\n- Account Status: ${ageDescriptions[user.accountAge] || user.accountAge}`;
  }

  if (user.recentActivity && user.recentActivity.length > 0) {
    context += `\n- Recent Topics Discussed: ${user.recentActivity.slice(0, 3).join(', ')}`;
  }

  return context;
}

export function getContextDepthForTier(tier: SubscriptionTier): 'minimal' | 'standard' | 'rich' {
  return CONTEXT_DEPTH_BY_TIER[tier];
}

export function estimateContextTokens(context: AssembledContext): number {
  const charCount = context.systemContext.length;
  return Math.ceil(charCount / 4);
}
