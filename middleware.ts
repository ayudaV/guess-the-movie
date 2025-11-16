import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple CORS middleware applied to API routes.
// Adjust ALLOWED_ORIGINS to restrict to specific origins in production.
const ALLOWED_ORIGINS = new Set(['*']);

const CORS_HEADERS = (origin = '*') => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
});

export function middleware(request: NextRequest) {
  const { method } = request;
  const origin = request.headers.get('origin') ?? '*';

  // Decide which origin to send back. For now we allow all (*) or echo origin.
  let allowed = '*';
  if (!ALLOWED_ORIGINS.has('*')) {
    if (ALLOWED_ORIGINS.has(origin)) {
      allowed = origin;
    } else {
      allowed = '';
    }
  }

  // For preflight requests, return early with the CORS headers.
  if (method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: CORS_HEADERS(allowed || '*') });
  }

  // For other requests, continue and attach headers to the response.
  const res = NextResponse.next();
  const headers = CORS_HEADERS(allowed || '*');
  for (const [k, v] of Object.entries(headers)) {
    res.headers.set(k, v as string);
  }

  return res;
}

export const config = {
  // Only run middleware for API routes to reduce overhead.
  matcher: ['/api/:path*'],
};
