import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CRITICAL_TABLES = [
  "sites",
  "site_members",
  "profiles",
  "pages",
  "products",
  "orders",
  "contacts",
  "subscriptions",
  "stripe_subscriptions",
  "platform_admins",
  "subscription_plans",
  "funnels",
  "email_campaigns",
  "email_sequences",
  "email_templates",
  "custom_blocks",
  "global_sections",
  "webinars",
  "ai_gameplans",
  "invitation_codes",
];

const ALL_TABLES = [
  "ai_conversations",
  "ai_feedback",
  "ai_gameplans",
  "ai_messages",
  "ai_task_items",
  "ai_usage_tracking",
  "analytics_conversions",
  "analytics_events",
  "analytics_page_views",
  "analytics_revenue_summary",
  "analytics_sessions",
  "api_keys",
  "api_rate_limits",
  "audit_logs",
  "automation_workflows",
  "billing",
  "contact_activities",
  "contact_segments",
  "contact_tags",
  "contacts",
  "custom_blocks",
  "data_deletion_requests",
  "discount_codes",
  "email_campaigns",
  "email_sends",
  "email_sequence_steps",
  "email_sequences",
  "email_templates",
  "error_logs",
  "funnel_analytics",
  "funnels",
  "global_sections",
  "inventory_transactions",
  "invitation_code_uses",
  "invitation_codes",
  "lesson_progress",
  "lessons",
  "marketing_pages",
  "orders",
  "page_global_sections",
  "page_submissions",
  "page_templates",
  "page_variants",
  "page_versions",
  "pages",
  "payment_failures",
  "platform_admins",
  "platform_audit_log",
  "platform_metrics",
  "product_access",
  "product_variants",
  "products",
  "profiles",
  "segment_memberships",
  "site_members",
  "sites",
  "stripe_customers",
  "stripe_orders",
  "stripe_subscriptions",
  "stripe_user_orders",
  "stripe_user_subscriptions",
  "subscription_changes",
  "subscription_plans",
  "subscriptions",
  "system_health_metrics",
  "system_settings",
  "tags",
  "user_consent",
  "webhook_events",
  "webhooks",
  "webinar_registrations",
  "webinars",
  "workflow_enrollments",
  "workflow_step_executions",
];

interface BackupRequest {
  action: "create" | "list" | "download" | "delete" | "schedule_info";
  backup_type?: "full" | "critical";
  backup_id?: string;
}

interface BackupMetadata {
  id: string;
  created_at: string;
  backup_type: "full" | "critical";
  tables_count: number;
  total_rows: number;
  size_bytes: number;
  status: "completed" | "failed";
  error?: string;
}

async function exportTable(
  supabaseAdmin: ReturnType<typeof createClient>,
  tableName: string
): Promise<{ data: unknown[]; count: number }> {
  const { data, error, count } = await supabaseAdmin
    .from(tableName)
    .select("*", { count: "exact" })
    .limit(50000);

  if (error) {
    console.error(`Error exporting ${tableName}:`, error.message);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}

async function createBackup(
  supabaseAdmin: ReturnType<typeof createClient>,
  backupType: "full" | "critical"
): Promise<BackupMetadata> {
  const tables = backupType === "full" ? ALL_TABLES : CRITICAL_TABLES;
  const backupId = `backup_${backupType}_${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const backupData: Record<string, unknown[]> = {};
  let totalRows = 0;

  console.log(`Starting ${backupType} backup with ${tables.length} tables...`);

  for (const table of tables) {
    try {
      const { data, count } = await exportTable(supabaseAdmin, table);
      backupData[table] = data;
      totalRows += count;
      console.log(`Exported ${table}: ${count} rows`);
    } catch (err) {
      console.error(`Failed to export ${table}:`, err);
      backupData[table] = [];
    }
  }

  const backupJson = JSON.stringify(backupData, null, 2);
  const sizeBytes = new Blob([backupJson]).size;

  const { error: uploadError } = await supabaseAdmin.storage
    .from("database-backups")
    .upload(`${backupId}.json`, backupJson, {
      contentType: "application/json",
      upsert: false,
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw new Error(`Failed to upload backup: ${uploadError.message}`);
  }

  const metadata: BackupMetadata = {
    id: backupId,
    created_at: new Date().toISOString(),
    backup_type: backupType,
    tables_count: tables.length,
    total_rows: totalRows,
    size_bytes: sizeBytes,
    status: "completed",
  };

  const { error: metaError } = await supabaseAdmin.storage
    .from("database-backups")
    .upload(`${backupId}_meta.json`, JSON.stringify(metadata, null, 2), {
      contentType: "application/json",
      upsert: false,
    });

  if (metaError) {
    console.error("Metadata upload error:", metaError);
  }

  return metadata;
}

async function listBackups(
  supabaseAdmin: ReturnType<typeof createClient>
): Promise<BackupMetadata[]> {
  const { data: files, error } = await supabaseAdmin.storage
    .from("database-backups")
    .list("", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    throw new Error(`Failed to list backups: ${error.message}`);
  }

  const metaFiles = (files || []).filter((f) => f.name.endsWith("_meta.json"));
  const backups: BackupMetadata[] = [];

  for (const file of metaFiles) {
    const { data } = await supabaseAdmin.storage
      .from("database-backups")
      .download(file.name);

    if (data) {
      const text = await data.text();
      backups.push(JSON.parse(text));
    }
  }

  return backups.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

async function getBackupDownloadUrl(
  supabaseAdmin: ReturnType<typeof createClient>,
  backupId: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from("database-backups")
    .createSignedUrl(`${backupId}.json`, 3600);

  if (error) {
    throw new Error(`Failed to create download URL: ${error.message}`);
  }

  return data.signedUrl;
}

async function deleteBackup(
  supabaseAdmin: ReturnType<typeof createClient>,
  backupId: string
): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from("database-backups")
    .remove([`${backupId}.json`, `${backupId}_meta.json`]);

  if (error) {
    throw new Error(`Failed to delete backup: ${error.message}`);
  }
}

async function verifyPlatformAdmin(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string
): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("platform_admins")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  return !!data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const isAdmin = await verifyPlatformAdmin(supabaseAdmin, user.id);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: "Platform admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: BackupRequest = await req.json();
    const { action, backup_type = "critical", backup_id } = body;

    let result: unknown;

    switch (action) {
      case "create":
        result = await createBackup(supabaseAdmin, backup_type);
        break;

      case "list":
        result = await listBackups(supabaseAdmin);
        break;

      case "download":
        if (!backup_id) {
          throw new Error("backup_id required for download");
        }
        result = { download_url: await getBackupDownloadUrl(supabaseAdmin, backup_id) };
        break;

      case "delete":
        if (!backup_id) {
          throw new Error("backup_id required for delete");
        }
        await deleteBackup(supabaseAdmin, backup_id);
        result = { success: true, deleted: backup_id };
        break;

      case "schedule_info":
        result = {
          recommended_schedule: "daily",
          critical_tables: CRITICAL_TABLES,
          all_tables: ALL_TABLES,
          notes: [
            "Critical backups include core business data (sites, users, orders, products)",
            "Full backups include all tables including analytics and logs",
            "Backups are stored in Supabase Storage bucket 'database-backups'",
            "Download URLs are valid for 1 hour",
            "Recommend keeping at least 7 daily backups",
          ],
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Backup error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
