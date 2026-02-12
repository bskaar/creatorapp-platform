/**
 * Secure CORS Configuration for Edge Functions
 *
 * This module provides secure CORS headers with origin whitelisting
 * to prevent Cross-Site Request Forgery (CSRF) attacks.
 */

const ALLOWED_ORIGINS = [
  'https://creatorapp.us',
  'https://www.creatorapp.us',
  'https://app.creatorapp.us',
  'http://localhost:5173',
  'http://localhost:3000',
];

export function getCorsHeaders(requestOrigin: string | null): HeadersInit {
  const isOriginAllowed = requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin);

  return {
    'Access-Control-Allow-Origin': isOriginAllowed ? requestOrigin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export function handleCorsPreflightRequest(requestOrigin: string | null): Response {
  return new Response(null, {
    status: 200,
    headers: getCorsHeaders(requestOrigin),
  });
}

export function createCorsResponse(
  body: string | null,
  options: {
    status?: number;
    contentType?: string;
    requestOrigin?: string | null;
  } = {}
): Response {
  const {
    status = 200,
    contentType = 'application/json',
    requestOrigin = null,
  } = options;

  const headers: Record<string, string> = {
    ...getCorsHeaders(requestOrigin) as Record<string, string>,
    'Content-Type': contentType,
  };

  return new Response(body, { status, headers });
}
