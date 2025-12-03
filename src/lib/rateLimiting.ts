import { supabase } from './supabase';

export interface RateLimitResult {
  allowed: boolean;
  remainingCalls?: number;
  resetAt?: string;
  blockedUntil?: string;
  message: string;
}

export interface RateLimitConfig {
  endpoint: string;
  maxCalls?: number;
  windowHours?: number;
}

const DEFAULT_LIMITS: Record<string, number> = {
  default: 1000,
  anonymous: 100,
  payment: 10,
  export: 5,
  ai: 50,
};

export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const identifier = user?.id || 'anonymous';
    const identifierType = user ? 'user_id' : 'ip_address';

    const maxCalls = config.maxCalls || DEFAULT_LIMITS.default;
    const windowHours = config.windowHours || 1;

    const { data, error } = await supabase.rpc('check_rate_limit', {
      p_identifier: identifier,
      p_identifier_type: identifierType,
      p_endpoint: config.endpoint,
      p_max_calls: maxCalls,
      p_window_hours: windowHours,
    });

    if (error) {
      console.error('Rate limit check error:', error);
      return {
        allowed: true,
        message: 'Rate limit check failed, allowing request',
      };
    }

    return {
      allowed: data.allowed,
      remainingCalls: data.remaining_calls,
      resetAt: data.reset_at,
      blockedUntil: data.blocked_until,
      message: data.message,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return {
      allowed: true,
      message: 'Rate limit system error, allowing request',
    };
  }
}

export async function getRateLimitStatus(
  endpoint?: string
): Promise<any[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase.rpc('get_rate_limit_status', {
      p_identifier: user.id,
      p_endpoint: endpoint || null,
    });

    if (error) {
      console.error('Error getting rate limit status:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getRateLimitStatus:', error);
    return [];
  }
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Allowed': result.allowed.toString(),
  };

  if (result.remainingCalls !== undefined) {
    headers['X-RateLimit-Remaining'] = result.remainingCalls.toString();
  }

  if (result.resetAt) {
    headers['X-RateLimit-Reset'] = result.resetAt;
  }

  if (result.blockedUntil) {
    headers['X-RateLimit-Retry-After'] = result.blockedUntil;
  }

  return headers;
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public blockedUntil?: string,
    public resetAt?: string
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export async function withRateLimit<T>(
  config: RateLimitConfig,
  fn: () => Promise<T>
): Promise<T> {
  const result = await checkRateLimit(config);

  if (!result.allowed) {
    throw new RateLimitError(
      result.message,
      result.blockedUntil,
      result.resetAt
    );
  }

  return fn();
}
