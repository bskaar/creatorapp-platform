import { createClient } from "jsr:@supabase/supabase-js@2";
import { type SubscriptionTier } from "./ai-config.ts";

export interface BrandingContext {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  typography?: {
    headingFont?: string;
    bodyFont?: string;
  };
  toneOfVoice?: string[];
  brandValues?: string[];
  keyPhrases?: string[];
  visualStyle?: string[];
}

export interface BusinessPlanContext {
  businessName?: string;
  businessType?: string;
  missionStatement?: string;
  targetAudience?: {
    description?: string;
    demographics?: string[];
    painPoints?: string[];
  };
  valuePropositions?: string[];
  differentiators?: string[];
  shortTermGoals?: string[];
  longTermGoals?: string[];
}

export interface DocumentContext {
  branding?: BrandingContext;
  businessPlan?: BusinessPlanContext;
  htmlReference?: {
    colorPalette?: string[];
    fontStack?: string[];
  };
  hasDocuments: boolean;
}

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
  documentContext: DocumentContext;
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

  const documentContext = await loadDocumentContext(supabase, siteId, tier);

  const systemContext = buildSystemContextString(businessContext, userContext, documentContext, contextDepth);

  return {
    systemContext,
    businessContext,
    userContext,
    documentContext,
    contextDepth,
  };
}

async function loadDocumentContext(
  supabase: ReturnType<typeof createClient>,
  siteId: string,
  tier: SubscriptionTier
): Promise<DocumentContext> {
  if (tier === 'starter') {
    return { hasDocuments: false };
  }

  const { data: documents } = await supabase
    .from('site_context_documents')
    .select('document_type, extracted_context')
    .eq('site_id', siteId)
    .eq('status', 'ready')
    .is('archived_at', null)
    .order('version', { ascending: false });

  if (!documents || documents.length === 0) {
    return { hasDocuments: false };
  }

  const documentContext: DocumentContext = { hasDocuments: true };

  const seenTypes = new Set<string>();
  for (const doc of documents) {
    if (seenTypes.has(doc.document_type)) continue;
    seenTypes.add(doc.document_type);

    const extracted = doc.extracted_context as Record<string, unknown>;
    if (!extracted) continue;

    switch (doc.document_type) {
      case 'branding':
        documentContext.branding = {
          colors: extracted.colors as BrandingContext['colors'],
          typography: extracted.typography as BrandingContext['typography'],
          toneOfVoice: extracted.toneOfVoice as string[],
          brandValues: extracted.brandValues as string[],
          keyPhrases: extracted.keyPhrases as string[],
          visualStyle: extracted.visualStyle as string[],
        };
        break;
      case 'business_plan':
        documentContext.businessPlan = {
          businessName: extracted.businessName as string,
          businessType: extracted.businessType as string,
          missionStatement: extracted.missionStatement as string,
          targetAudience: extracted.targetAudience as BusinessPlanContext['targetAudience'],
          valuePropositions: extracted.valuePropositions as string[],
          differentiators: extracted.differentiators as string[],
          shortTermGoals: extracted.shortTermGoals as string[],
          longTermGoals: extracted.longTermGoals as string[],
        };
        break;
      case 'html_reference':
        documentContext.htmlReference = {
          colorPalette: extracted.colorPalette as string[],
          fontStack: extracted.fontStack as string[],
        };
        break;
    }
  }

  return documentContext;
}

function buildSystemContextString(
  business: BusinessContext,
  user: UserContext,
  documents: DocumentContext,
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
    if (documents.hasDocuments) {
      context += buildDocumentContextString(documents);
    }
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

  if (documents.hasDocuments) {
    context += buildDocumentContextString(documents);
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

function buildDocumentContextString(documents: DocumentContext): string {
  if (!documents.hasDocuments) return '';

  let context = '\n\nBrand Kit Context (from uploaded documents):';

  if (documents.branding) {
    const b = documents.branding;
    context += '\n\n[BRANDING GUIDELINES]';

    if (b.colors) {
      const colors = Object.entries(b.colors)
        .filter(([_, v]) => v && (typeof v === 'string' ? v : (v as string[]).length > 0))
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('; ');
      if (colors) context += `\n- Brand Colors: ${colors}`;
    }

    if (b.typography?.headingFont || b.typography?.bodyFont) {
      const fonts = [];
      if (b.typography.headingFont) fonts.push(`Headings: ${b.typography.headingFont}`);
      if (b.typography.bodyFont) fonts.push(`Body: ${b.typography.bodyFont}`);
      context += `\n- Typography: ${fonts.join(', ')}`;
    }

    if (b.toneOfVoice && b.toneOfVoice.length > 0) {
      context += `\n- Tone of Voice: ${b.toneOfVoice.join(', ')}`;
    }

    if (b.brandValues && b.brandValues.length > 0) {
      context += `\n- Brand Values: ${b.brandValues.join(', ')}`;
    }

    if (b.keyPhrases && b.keyPhrases.length > 0) {
      context += `\n- Key Phrases: "${b.keyPhrases.slice(0, 3).join('", "')}"`;
    }

    if (b.visualStyle && b.visualStyle.length > 0) {
      context += `\n- Visual Style: ${b.visualStyle.join(', ')}`;
    }
  }

  if (documents.businessPlan) {
    const bp = documents.businessPlan;
    context += '\n\n[BUSINESS STRATEGY]';

    if (bp.businessName) {
      context += `\n- Business: ${bp.businessName}${bp.businessType ? ` (${bp.businessType})` : ''}`;
    }

    if (bp.missionStatement) {
      context += `\n- Mission: ${bp.missionStatement}`;
    }

    if (bp.targetAudience?.description) {
      context += `\n- Target Audience: ${bp.targetAudience.description}`;
      if (bp.targetAudience.painPoints && bp.targetAudience.painPoints.length > 0) {
        context += `\n  Pain Points: ${bp.targetAudience.painPoints.slice(0, 3).join(', ')}`;
      }
    }

    if (bp.valuePropositions && bp.valuePropositions.length > 0) {
      context += `\n- Value Propositions: ${bp.valuePropositions.slice(0, 3).join('; ')}`;
    }

    if (bp.differentiators && bp.differentiators.length > 0) {
      context += `\n- Differentiators: ${bp.differentiators.slice(0, 3).join('; ')}`;
    }

    if (bp.shortTermGoals && bp.shortTermGoals.length > 0) {
      context += `\n- Short-term Goals: ${bp.shortTermGoals.slice(0, 2).join('; ')}`;
    }
  }

  if (documents.htmlReference) {
    const hr = documents.htmlReference;
    context += '\n\n[DESIGN REFERENCE]';

    if (hr.colorPalette && hr.colorPalette.length > 0) {
      context += `\n- Reference Colors: ${hr.colorPalette.slice(0, 6).join(', ')}`;
    }

    if (hr.fontStack && hr.fontStack.length > 0) {
      context += `\n- Reference Fonts: ${hr.fontStack.slice(0, 3).join(', ')}`;
    }
  }

  context += '\n\nIMPORTANT: Use this brand context to ensure all responses align with the user\'s established brand voice, visual identity, and business goals.';

  return context;
}

export function getContextDepthForTier(tier: SubscriptionTier): 'minimal' | 'standard' | 'rich' {
  return CONTEXT_DEPTH_BY_TIER[tier];
}

export function estimateContextTokens(context: AssembledContext): number {
  const charCount = context.systemContext.length;
  return Math.ceil(charCount / 4);
}
