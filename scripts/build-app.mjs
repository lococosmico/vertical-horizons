import { build } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Load .env.local for local builds; CI can provide the same public variables as env vars.
try {
  const envText = await readFile(new URL('../.env.local', import.meta.url), 'utf8');
  for (const row of envText.split(/\r?\n/)) {
    const match = row.match(/^\s*(SUPABASE_URL|SUPABASE_PUBLISHABLE_KEY)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
const hostedUrl = /^https:\/\/[\w.-]+\.supabase\.co\/?$/.test(url || '');
const localUrl = /^http:\/\/(localhost|127\.0\.0\.1):54321\/?$/.test(url || '');
let serviceRoleJwt = false;
if (key?.split('.').length === 3) {
  try { serviceRoleJwt = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8')).role === 'service_role'; } catch { /* Publishable key format is not a JWT. */ }
}
if (!url || !key || !(hostedUrl || localUrl) || key.startsWith('sb_secret_') || serviceRoleJwt) {
  throw new Error('Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in .env.local or the build environment. No app bundle was produced.');
}

await mkdir(new URL('../my-progress/assets/', import.meta.url), { recursive: true });
await build({
  entryPoints: [fileURLToPath(new URL('../src/my-progress/main.js', import.meta.url))],
  outfile: fileURLToPath(new URL('../my-progress/assets/app.js', import.meta.url)),
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
  sourcemap: false,
  define: {
    __SUPABASE_URL__: JSON.stringify(url.replace(/\/$/, '')),
    __SUPABASE_PUBLISHABLE_KEY__: JSON.stringify(key),
  },
});
console.log('Built my-progress/assets/app.js. The bundled URL and publishable key are public by design.');
