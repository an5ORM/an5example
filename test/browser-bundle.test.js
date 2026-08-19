/**
 * Browser bundle check: verifies @an5/adapters/browser can be bundled for a
 * browser target (no Node builtins leaking into the graph) with esbuild, and
 * that the SqliteBrowserEngine + createBrowserSqliteAdapter entry points exist.
 *
 * Run: node test/browser-bundle.test.js
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const OUT = path.join(__dirname, '.tmp-browser-bundle.js');

async function main() {
  await esbuild.build({
    entryPoints: [require.resolve('@an5/adapters/browser')],
    bundle: true,
    platform: 'browser',
    format: 'esm',
    target: 'es2020',
    outfile: OUT,
    logLevel: 'silent',
    // Cloud/Node-only packages (Google Sheets auth + node DB drivers) are not
    // part of the SQLite browser surface; keep them out of the bundle.
    external: [
      'fs', 'path', 'os', 'crypto', 'stream', 'util', 'http', 'https', 'net', 'tls', 'zlib',
      'querystring', 'url', 'events', 'assert', 'buffer', 'child_process', 'string_decoder',
      'mssql', 'pg', 'mysql2', 'googleapis', 'google-auth-library', 'gaxios',
    ],
  });

  const bundle = fs.readFileSync(OUT, 'utf8');
  assert.ok(bundle.includes('SqliteBrowserEngine'), 'bundle should include SqliteBrowserEngine');
  assert.ok(bundle.includes('createBrowserSqliteAdapter'), 'bundle should include createBrowserSqliteAdapter');

  fs.unlinkSync(OUT);
  console.log('an5example browser bundle check passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});