import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface DomainVerificationRequest {
  site_id: string;
  domain: string;
}

async function addDomainToVercel(domain: string): Promise<{ success: boolean; verified?: boolean; error?: string }> {
  try {
    const vercelToken = Deno.env.get('VERCEL_TOKEN');
    const vercelProjectId = Deno.env.get('VERCEL_PROJECT_ID');
    const vercelTeamId = Deno.env.get('VERCEL_TEAM_ID');

    if (!vercelToken || !vercelProjectId) {
      console.log('Vercel configuration not set, skipping Vercel domain addition');
      return { success: false, error: 'Vercel not configured' };
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
      if (data.error?.code === 'domain_already_added') {
        return { success: true, verified: true };
      }
      console.error('Vercel API error:', data);
      return { success: false, error: data.error?.message || 'Failed to add domain' };
    }

    return { success: true, verified: data.verified || false };
  } catch (error) {
    console.error('Error adding domain to Vercel:', error);
    return { success: false, error: error.message };
  }
}

async function verifyDNSRecord(domain: string, expectedToken: string): Promise<boolean> {
  try {
    const rootDomain = domain.replace(/^www\./, '');
    const txtRecordName = `_creatorapp-verification.${rootDomain}`;

    const response = await fetch(`https://dns.google/resolve?name=${txtRecordName}&type=TXT`);
    const data = await response.json();

    if (data.Answer) {
      for (const record of data.Answer) {
        if (record.type === 16) {
          const txtValue = record.data.replace(/"/g, '');
          if (txtValue === expectedToken) {
            return true;
          }
        }
      }
    }

    return false;
  } catch (error) {
    console.error('DNS verification error:', error);
    return false;
  }
}

async function verifyCNAMERecord(domain: string, expectedTarget: string): Promise<boolean> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=CNAME`);
    const data = await response.json();

    if (data.Answer) {
      for (const record of data.Answer) {
        if (record.type === 5) {
          const cnameValue = record.data.toLowerCase().replace(/\.$/, '');
          const expectedValue = expectedTarget.toLowerCase().replace(/\.$/, '');
          if (cnameValue === expectedValue) {
            return true;
          }
        }
      }
    }

    const aResponse = await fetch(`https://dns.google/resolve?name=${domain}&type=A`);
    const aData = await aResponse.json();

    if (aData.Answer) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('CNAME verification error:', error);
    return false;
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { site_id, domain }: DomainVerificationRequest = await req.json();

    if (!site_id || !domain) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('id, slug, domain_verification_token, custom_domain')
      .eq('id', site_id)
      .maybeSingle();

    if (siteError || !site) {
      return new Response(
        JSON.stringify({ error: 'Site not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!site.domain_verification_token) {
      return new Response(
        JSON.stringify({ error: 'No verification token found' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const expectedTarget = `${site.slug}.creatorapp.site`;

    const [txtVerified, cnameVerified] = await Promise.all([
      verifyDNSRecord(domain, site.domain_verification_token),
      verifyCNAMERecord(domain, expectedTarget),
    ]);

    if (txtVerified && cnameVerified) {
      const vercelResult = await addDomainToVercel(domain);

      await supabase
        .from('sites')
        .update({
          domain_verification_status: 'verified',
          domain_verified_at: new Date().toISOString(),
          dns_records: {
            txt_verified: true,
            cname_verified: true,
            last_checked: new Date().toISOString(),
          },
          vercel_domain_added: vercelResult.success,
          vercel_domain_verified: vercelResult.verified || false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', site_id);

      return new Response(
        JSON.stringify({
          verified: true,
          message: vercelResult.success
            ? 'Domain verified and added to hosting successfully!'
            : 'Domain DNS verified! Note: Automatic hosting setup pending - contact support if domain does not work within 24 hours.',
          vercel_added: vercelResult.success,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      const errors = [];
      if (!txtVerified) errors.push('TXT record not found or incorrect');
      if (!cnameVerified) errors.push('CNAME record not found or incorrect');

      await supabase
        .from('sites')
        .update({
          domain_verification_status: 'failed',
          dns_records: {
            txt_verified: txtVerified,
            cname_verified: cnameVerified,
            last_checked: new Date().toISOString(),
            errors,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', site_id);

      return new Response(
        JSON.stringify({
          verified: false,
          message: `Domain verification failed: ${errors.join(', ')}`,
          details: {
            txt_verified: txtVerified,
            cname_verified: cnameVerified,
            errors,
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Domain verification error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});