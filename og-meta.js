// Shared OG/Twitter meta templating logic, used by both middleware.js (Vercel)
// and server.js (container/Azure) so the two deployment paths stay in sync.
const DEFAULT_SEED = 'vue-og-demo';
const MAX_LEN = 200;

export async function renderOgHtml(html, searchParams) {
  if (![...searchParams.keys()].length) {
    return html; // no query params, leave the static HTML untouched
  }

  const title = escapeHtml(searchParams.get('title'));
  const desc = escapeHtml(searchParams.get('desc'));
  const image = await resolveImage(searchParams);

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

  return html
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
}

// Looks up an image by `id` from a backend/DB API; falls back to Picsum by
// `seed` if no id is given, the API is unset, or the lookup fails.
async function resolveImage(searchParams) {
  const id = searchParams.get('id');
  const apiUrl = process.env.IMAGE_API_URL;

  if (id && apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/${encodeURIComponent(id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.imageUrl) return data.imageUrl;
      }
    } catch {
      // ignore and fall back to Picsum below
    }
  }

  const seed = sanitizeSeed(searchParams.get('seed')) || DEFAULT_SEED;
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/630`;
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
