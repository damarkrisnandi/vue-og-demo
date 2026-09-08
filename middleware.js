// Vercel Edge Middleware: rewrites OG/Twitter meta tags per-request based on
// query params, without switching the Vue app itself to SSR.
import { renderOgHtml } from './og-meta.js';

export const config = {
  matcher: '/',
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  if (![...params.keys()].length) {
    return; // no query params, serve the static HTML untouched
  }

  // fetch the static asset directly (not `request`) to avoid re-triggering this middleware
  const assetUrl = new URL('/index.html', url);
  const response = await fetch(assetUrl);
  const html = await response.text();

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');

  return new Response(await renderOgHtml(html, params), { status: response.status, headers });
}

function sanitizeSeed(value) {
  if (!value) return '';
  return value.replace(/[^a-zA-Z0-9-_]/g, '').slice(0, 64);
}

function escapeHtml(value) {
  if (!value) return '';
  return value
    .slice(0, MAX_LEN)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
