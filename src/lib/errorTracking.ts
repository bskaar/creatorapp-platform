import { supabase } from './supabase';

export type ErrorType =
  | 'javascript'
  | 'api'
  | 'auth'
  | 'payment'
  | 'database'
  | 'network'
  | 'validation'
  | 'other';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface LogErrorParams {
  type: ErrorType;
  message: string;
  stack?: string;
  code?: string;
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  siteId?: string;
}

export async function logError({
  type,
  message,
  stack,
  code,
  severity = 'medium',
  context = {},
  siteId,
}: LogErrorParams): Promise<string | null> {
  try {
    const url = window.location.href;
    const userAgent = navigator.userAgent;

    const { data, error } = await supabase.rpc('log_error', {
      p_error_type: type,
      p_error_message: message,
      p_error_stack: stack || null,
      p_error_code: code || null,
      p_url: url,
      p_severity: severity,
      p_context: context,
      p_site_id: siteId || null,
    });

    if (error) {
      console.error('Failed to log error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error in error logging:', err);
    return null;
  }
}

export function logJavaScriptError(
  error: Error,
  severity: ErrorSeverity = 'medium',
  context?: Record<string, any>
): Promise<string | null> {
  return logError({
    type: 'javascript',
    message: error.message,
    stack: error.stack,
    severity,
    context: {
      ...context,
      errorName: error.name,
    },
  });
}

export function logAPIError(
  endpoint: string,
  statusCode: number,
  message: string,
  context?: Record<string, any>
): Promise<string | null> {
  const severity: ErrorSeverity = statusCode >= 500 ? 'high' : 'medium';

  return logError({
    type: 'api',
    message: `API Error: ${message}`,
    code: statusCode.toString(),
    severity,
    context: {
      ...context,
      endpoint,
      statusCode,
    },
  });
}

export function logAuthError(
  message: string,
  code?: string,
  context?: Record<string, any>
): Promise<string | null> {
  return logError({
    type: 'auth',
    message: `Auth Error: ${message}`,
    code,
    severity: 'high',
    context,
  });
}

export function logPaymentError(
  message: string,
  code?: string,
  context?: Record<string, any>
): Promise<string | null> {
  return logError({
    type: 'payment',
    message: `Payment Error: ${message}`,
    code,
    severity: 'critical',
    context,
  });
}

export function logNetworkError(
  message: string,
  context?: Record<string, any>
): Promise<string | null> {
  return logError({
    type: 'network',
    message: `Network Error: ${message}`,
    severity: 'medium',
    context,
  });
}

export function logValidationError(
  field: string,
  message: string,
  context?: Record<string, any>
): Promise<string | null> {
  return logError({
    type: 'validation',
    message: `Validation Error (${field}): ${message}`,
    severity: 'low',
    context: {
      ...context,
      field,
    },
  });
}

export async function getErrorStats(
  siteId?: string,
  hours: number = 24
): Promise<{
  totalErrors: number;
  criticalErrors: number;
  errorRate: number;
  mostCommonType: string | null;
  mostCommonUrl: string | null;
} | null> {
  try {
    const { data, error } = await supabase.rpc('get_error_stats', {
      p_site_id: siteId || null,
      p_hours: hours,
    });

    if (error) {
      console.error('Failed to get error stats:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return {
        totalErrors: 0,
        criticalErrors: 0,
        errorRate: 0,
        mostCommonType: null,
        mostCommonUrl: null,
      };
    }

    const stats = data[0];
    return {
      totalErrors: stats.total_errors || 0,
      criticalErrors: stats.critical_errors || 0,
      errorRate: stats.error_rate || 0,
      mostCommonType: stats.most_common_type || null,
      mostCommonUrl: stats.most_common_url || null,
    };
  } catch (err) {
    console.error('Error getting error stats:', err);
    return null;
  }
}

export async function getRecentErrors(
  limit: number = 50,
  siteId?: string
): Promise<any[]> {
  try {
    let query = supabase
      .from('error_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (siteId) {
      query = query.eq('site_id', siteId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to get recent errors:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error getting recent errors:', err);
    return [];
  }
}

export async function markErrorResolved(
  errorId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('error_logs')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', errorId);

    if (error) {
      console.error('Failed to mark error as resolved:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error marking error as resolved:', err);
    return false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    logJavaScriptError(
      new Error(event.message),
      'high',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    logError({
      type: 'javascript',
      message: `Unhandled Promise Rejection: ${event.reason}`,
      severity: 'high',
      context: {
        reason: event.reason?.toString(),
      },
    });
  });
}

export async function recordHealthMetric(
  metricType: string,
  metricValue: number,
  siteId?: string,
  metadata?: Record<string, any>
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('record_health_metric', {
      p_metric_type: metricType,
      p_metric_value: metricValue,
      p_site_id: siteId || null,
      p_metadata: metadata || {},
    });

    if (error) {
      console.error('Failed to record health metric:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Error recording health metric:', err);
    return null;
  }
}
