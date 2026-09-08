// Static file server for container deployments (e.g. Azure Container Apps).
// Serves the Vite build as-is, and templates OG/Twitter meta tags on "/"
// based on query params. No Vue rendering happens here — still not SSR.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderOgHtml } from './og-meta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const indexPath = path.join(distDir, 'index.html');

const app = express();

app.use(express.static(distDir, { index: false }));

app.get('/', async (req, res) => {
  const html = fs.readFileSync(indexPath, 'utf-8');
  const searchParams = new URLSearchParams(req.query);
  res.type('html').send(await renderOgHtml(html, searchParams));
});

// SPA fallback for any other route
app.use((req, res) => {
  res.sendFile(indexPath);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
