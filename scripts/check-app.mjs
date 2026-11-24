import { readFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'esbuild';

const sourceRoot = fileURLToPath(new URL('../src/my-progress/', import.meta.url));
const pending = [resolve(sourceRoot, 'main.js')];
const seen = new Set();

while (pending.length) {
  const file = pending.pop();
  if (seen.has(file)) continue;
  seen.add(file);
  const source = await readFile(file, 'utf8');
  await transform(source, { loader: 'js', target: 'es2020', sourcefile: file });
  const requireFromFile = createRequire(file);
  const specifiers = [...source.matchAll(/(?:from\s*|import\s*)['"]([^'"]+)['"]/g)].map((match) => match[1]);
  for (const specifier of specifiers) {
    if (specifier.startsWith('.')) {
      const dependency = resolve(dirname(file), specifier);
      await access(dependency);
      pending.push(dependency);
    } else if (!specifier.startsWith('node:')) {
      requireFromFile.resolve(specifier);
    }
  }
}

console.log('My Progress source syntax and direct dependency checks passed (no bundle or files written).');
