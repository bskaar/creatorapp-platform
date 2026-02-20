import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AddDomainRequest {
  action: 'add' | 'remove' | 'verify' | 'check';
  domain: string;
  site_id?: string;
}

interface VercelDomainResponse {
  name: string;
  apexName: string;
  projectId: string;
  verified: boolean;
  verification?: Array<{
    type: string;
    domain: string;
    value: string;
    reason: string;
  }>;
  configuredBy?: string;
  error?: {
    code: string;
    message: string;
  };
}

async function addDomainToVercel(domain: string): Promise<{ success: boolean; data?: VercelDomainResponse; error?: string }> {
  try {
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID');
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID');

    if (!vercelToken || !vercelProjectId) {
      return { success: false, error: 'Vercel configuration missing' };
    }

    let url = `https://api.vercel.com/v10/projects/${vercelProjectId}/domains`;
    if (vercelTeamId) {
      url += `?teamId=${vercelTeamId}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error?.code === 'domain_already_in_use') {
        return { success: false, error: 'Domain is already in use by another Vercel project' };
      }
      if (data.error?.code === 'domain_already_added') {
        return { success: true, data };
      }
      return { success: false, error: data.error?.message || 'Failed to add domain to Vercel' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error adding domain to Vercel:', error);
    return { success: false, error: error.message };
  }
}

async function removeDomainFromVercel(domain: string): Promise<{ success: boolean; error?: string }> {
  try {
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID');
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID');

    if (!vercelToken || !vercelProjectId) {
      return { success: false, error: 'Vercel configuration missing' };
    }

    let url = `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}`;
    if (vercelTeamId) {
      url += `?teamId=${vercelTeamId}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    });

    if (!response.ok && response.status !== 404) {
      const data = await response.json();
      return { success: false, error: data.error?.message || 'Failed to remove domain from Vercel' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing domain from Vercel:', error);
    return { success: false, error: error.message };
  }
}

async function checkDomainInVercel(domain: string): Promise<{ exists: boolean; verified: boolean; verification?: any[]; error?: string }> {
  try {
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID');
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID');

    if (!vercelToken || !vercelProjectId) {
      return { exists: false, verified: false, error: 'Vercel configuration missing' };
    }

    let url = `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}`;
    if (vercelTeamId) {
      url += `?teamId=${vercelTeamId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    });

    if (response.status === 404) {
      return { exists: false, verified: false };
    }

    if (!response.ok) {
      const data = await response.json();
      return { exists: false, verified: false, error: data.error?.message };
    }

    const data = await response.json();
    return {
      exists: true,
      verified: data.verified === true,
      verification: data.verification,
    };
  } catch (error) {
    console.error('Error checking domain in Vercel:', error);
    return { exists: false, verified: false, error: error.message };
  }
}

async function verifyDomainInVercel(domain: string): Promise<{ verified: boolean; error?: string }> {
  try {
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID');
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID');

    if (!vercelToken || !vercelProjectId) {
      return { verified: false, error: 'Vercel configuration missing' };
    }

    let url = `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}/verify`;
    if (vercelTeamId) {
      url += `?teamId=${vercelTeamId}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return { verified: false, error: data.error?.message || 'Verification failed' };
    }

    return { verified: data.verified === true };
  } catch (error) {
    console.error('Error verifying domain in Vercel:', error);
    return { verified: false, error: error.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, domain, site_id }: AddDomainRequest = await req.json();

    if (!action || !domain) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action and domain' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanDomain = domain.toLowerCase().trim();

    let result;

    switch (action) {
      case 'add': {
        result = await addDomainToVercel(cleanDomain);

        if (result.success && site_id) {
          await supabase
            .from('sites')
            .update({
              vercel_domain_added: true,
              vercel_domain_verified: result.data?.verified || false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', site_id);
        }

        return new Response(
          JSON.stringify({
            success: result.success,
            message: result.success ? 'Domain added to Vercel successfully' : result.error,
            verified: result.data?.verified || false,
            verification: result.data?.verification,
          }),
          { status: result.success ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'remove': {
        result = await removeDomainFromVercel(cleanDomain);

        if (result.success && site_id) {
          await supabase
            .from('sites')
            .update({
              vercel_domain_added: false,
              vercel_domain_verified: false,
              updated_at: new Date().toISOString(),
            })
            .eq('id', site_id);
        }

        return new Response(
          JSON.stringify({
            success: result.success,
            message: result.success ? 'Domain removed from Vercel' : result.error,
          }),
          { status: result.success ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'verify': {
        result = await verifyDomainInVercel(cleanDomain);

        if (result.verified && site_id) {
          await supabase
            .from('sites')
            .update({
              vercel_domain_verified: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', site_id);
        }

        return new Response(
          JSON.stringify({
            success: result.verified,
            verified: result.verified,
            message: result.verified ? 'Domain verified in Vercel' : (result.error || 'Domain not yet verified'),
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check': {
        result = await checkDomainInVercel(cleanDomain);

        return new Response(
          JSON.stringify({
            exists: result.exists,
            verified: result.verified,
            verification: result.verification,
            error: result.error,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Use: add, remove, verify, or check' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Vercel domain management error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
