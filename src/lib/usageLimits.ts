import { supabase } from './supabase';

export interface UsageLimits {
  max_products: number | null;
  max_funnels: number | null;
  max_contacts: number;
  max_emails_per_month: number;
  max_team_members: number;
}

export interface UsageCount {
  products_count: number;
  funnels_count: number;
  contacts_count: number;
  emails_sent_this_month: number;
  team_members_count: number;
}

export async function checkResourceLimit(
  siteId: string,
  resource: 'products' | 'funnels' | 'contacts' | 'team_members'
): Promise<{ allowed: boolean; current: number; limit: number | null; message?: string }> {
  const { data: site, error } = await supabase
    .from('sites')
    .select(`
      *,
      subscription_plan:subscription_plans(*)
    `)
    .eq('id', siteId)
    .maybeSingle();

  if (error || !site) {
    return { allowed: false, current: 0, limit: null, message: 'Site not found' };
  }

  const plan = site.subscription_plan as any;
  const limits: UsageLimits = plan?.limits || {
    max_products: 1,
    max_funnels: 1,
    max_contacts: 2500,
    max_emails_per_month: 5000,
    max_team_members: 1,
  };

  let currentCount = 0;
  let limit: number | null = null;
  let resourceName = '';

  switch (resource) {
    case 'products':
      limit = limits.max_products;
      resourceName = 'products';
      const { count: productsCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', siteId);
      currentCount = productsCount || 0;
      break;

    case 'funnels':
      limit = limits.max_funnels;
      resourceName = 'funnels';
      const { count: funnelsCount } = await supabase
        .from('funnels')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', siteId);
      currentCount = funnelsCount || 0;
      break;

    case 'contacts':
      limit = limits.max_contacts;
      resourceName = 'contacts';
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', siteId);
      currentCount = contactsCount || 0;
      break;

    case 'team_members':
      limit = limits.max_team_members;
      resourceName = 'team members';
      const { count: membersCount } = await supabase
        .from('site_members')
        .select('id', { count: 'exact', head: true })
        .eq('site_id', siteId);
      currentCount = (membersCount || 0) + 1;
      break;
  }

  const allowed = limit === null || currentCount < limit;

  return {
    allowed,
    current: currentCount,
    limit,
    message: allowed
      ? undefined
      : `You've reached your plan limit of ${limit} ${resourceName}. Please upgrade to add more.`,
  };
}

export async function updateUsageCounts(siteId: string): Promise<void> {
  const [products, funnels, contacts, members] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    supabase.from('funnels').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
    supabase.from('site_members').select('id', { count: 'exact', head: true }).eq('site_id', siteId),
  ]);

  const usageCounts: UsageCount = {
    products_count: products.count || 0,
    funnels_count: funnels.count || 0,
    contacts_count: contacts.count || 0,
    emails_sent_this_month: 0,
    team_members_count: (members.count || 0) + 1,
  };

  await supabase
    .from('sites')
    .update({ usage_counts: usageCounts })
    .eq('id', siteId);
}

export function formatUsagePercentage(current: number, limit: number | null): number {
  if (limit === null) return 0;
  return Math.min((current / limit) * 100, 100);
}

export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'red';
  if (percentage >= 75) return 'yellow';
  return 'green';
}
