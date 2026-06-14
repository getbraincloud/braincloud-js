// Builds a self-contained browser bundle of the brainCloud JS client.
//
// The default web/node distribution (autobuild/build_js.sh) is just `cat src/*.js`, which
// leaves Node `require()` calls (crypto-js, get-user-locale, form-data, buffer) and an
// appended `exports.*` in the output. That only runs under Node — in a browser it throws
// "require is not defined" / "exports is not defined".
//
// This build resolves those dependencies through esbuild and emits an IIFE that exposes
// window.BrainCloudWrapper / window.BrainCloudClient, so it works from a single <script>
// tag with NO external CryptoJS and NO require/exports shims.

import { build } from 'esbuild';
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const req = createRequire(import.meta.url);
const srcDir = join(here, '..', '..', 'src');
const buildDir = join(here, 'build');
const outDir = join(here, 'lib');
mkdirSync(buildDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

// 1. Assemble the CommonJS concat from src/ (same source set as the web/node build).
const files = readdirSync(srcDir).filter(f => f.endsWith('.js')).sort();
let concat = files.map(f => readFileSync(join(srcDir, f), 'utf8')).join('\n');
// The src files define BrainCloudWrapper / BrainCloudClient as top-level functions; expose
// them as CommonJS exports so esbuild can treat the concat as the bundle's entry module.
concat += '\n\nexports.BrainCloudWrapper = BrainCloudWrapper;\nexports.BrainCloudClient = BrainCloudClient;\n';
const entry = join(buildDir, 'brainCloudClient.concat.js');
writeFileSync(entry, concat);

// 2. Map Node-only specifiers to browser-friendly ones:
//    - form-data        -> native FormData (browsers ship it)
//    - buffer / buffer/  -> the browser-safe `buffer` npm package
const browserResolve = {
  name: 'browser-resolve',
  setup(b) {
    b.onResolve({ filter: /^form-data$/ },
      () => ({ path: join(here, 'shims', 'form-data.js') }));
    // Resolve a subpath (not bare "buffer") so we get the npm package, not Node's core module.
    b.onResolve({ filter: /^buffer\/?$/ },
      () => ({ path: req.resolve('buffer/index.js') }));
  },
};

// Re-expose the classes as browser globals (the classic API) alongside the IIFE return value.
const footer = {
  js: 'if(typeof window!=="undefined"){window.BrainCloudWrapper=brainCloud.BrainCloudWrapper;'
    + 'window.BrainCloudClient=brainCloud.BrainCloudClient;}',
};

const common = {
  entryPoints: [entry],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  globalName: 'brainCloud',
  plugins: [browserResolve],
  footer,
  logLevel: 'info',
};

await build({ ...common, outfile: join(outDir, 'brainCloudClient.browser.js') });
await build({ ...common, minify: true, outfile: join(outDir, 'brainCloudClient.browser.min.js') });

console.log('Done. Wrote lib/brainCloudClient.browser.js and lib/brainCloudClient.browser.min.js');
