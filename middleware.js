// Vercel Edge Middleware: rewrites OG/Twitter meta tags per-request based on
// query params, without switching the Vue app itself to SSR.
export const config = {
  matcher: '/',
};

const DEFAULT_SEED = 'vue-og-demo';
const MAX_LEN = 200;

export default async function middleware(request) {
  const url = new URL(request.url);
  const params = url.searchParams;

  if (![...params.keys()].length) {
    return; // no query params, serve the static HTML untouched
  }

  const seed = sanitizeSeed(params.get('seed')) || DEFAULT_SEED;
  const title = escapeHtml(params.get('title'));
  const desc = escapeHtml(params.get('desc'));
  const image = `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/630`;

  // fetch the static asset directly (not `request`) to avoid re-triggering this middleware
  const assetUrl = new URL('/index.html', url);
  const response = await fetch(assetUrl);
  let html = await response.text();

  if (title) {
    html = html
      .replace(/(<title>)[^<]*(<\/title>)/, `$1${title}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${title}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${title}$2`);
  }
  if (desc) {
    html = html
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
  }
  html = html
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);

  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');

  return new Response(html, { status: response.status, headers });
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
