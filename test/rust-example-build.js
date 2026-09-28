#!/usr/bin/env node
/**
 * Build + run the an5example generated Rust client.
 *
 * The generated crate is a type-safe query builder, so this script:
 *   1. `cargo build` the generated client (catches codegen regressions)
 *   2. `cargo run` examples/rust, which executes the generated SQL against a
 *      temporary SQLite database through the generated model handles.
 *
 * `an5-adapters` is not published on crates.io yet, so the adapter has to be
 * resolved to a local checkout. The location is discovered here and passed to
 * cargo as a `[patch.crates-io]` override instead of being hardcoded in
 * examples/rust/Cargo.toml, because that relative path is only valid inside the
 * monorepo checkout and breaks in a standalone an5example clone.
 *
 * Pass --run-only to skip the client build step and just run the example.
 *
 * Skips gracefully when cargo or the adapter checkout is missing.
 *
 * Run: node test/rust-example-build.js [--run-only]
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const exampleRoot = path.join(__dirname, '..');
const generatedDir = path.join(exampleRoot, 'generated', 'rust');
const exampleDir = path.join(exampleRoot, 'examples', 'rust');
const runOnly = process.argv.includes('--run-only');

/**
 * Locate the `an5Adapters/rust` crate. Looks beside this repo first (monorepo
 * layout), then walks up in case an5example was cloned inside a workspace.
 */
function findAdapterDir() {
  const candidates = [
    path.resolve(exampleRoot, '..', 'an5Adapters', 'rust'),
    path.resolve(exampleRoot, '..', '..', 'an5Adapters', 'rust'),
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'Cargo.toml'))) return dir;
  }
  return null;
}

function haveCargo() {
  try {
    execFileSync('cargo', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!fs.existsSync(path.join(generatedDir, 'Cargo.toml'))) {
  console.log('rust-example-build: generated/rust not found, run `npm run generate` first');
  process.exit(0);
}
if (!fs.existsSync(path.join(exampleDir, 'Cargo.toml'))) {
  console.log('rust-example-build: examples/rust not found, skipping');
  process.exit(0);
}
if (!haveCargo()) {
  console.log('rust-example-build: cargo not installed, skipping');
  process.exit(0);
}

const adapterDir = findAdapterDir();
if (!adapterDir) {
  console.log('rust-example-build: an5Adapters/rust not found (an5-adapters is not on crates.io yet), skipping');
  process.exit(0);
}

const targetDir = process.env.CARGO_TARGET_DIR || path.join(os.tmpdir(), 'an5-cargo-target');
fs.mkdirSync(targetDir, { recursive: true });
const env = { ...process.env, CARGO_TARGET_DIR: targetDir };
const cargoConfig = [`--config`, `patch.crates-io.an5-adapters.path="${adapterDir}"`];

try {
  if (!runOnly) {
    console.log('[1/2] build generated an5client crate');
    execFileSync('cargo', [...cargoConfig, 'build'], { cwd: generatedDir, stdio: 'inherit', env });
  }

  console.log(runOnly ? 'run Rust CRUD example against SQLite' : '[2/2] run Rust CRUD example against SQLite');
  execFileSync('cargo', [...cargoConfig, 'run', '--quiet'], {
    cwd: exampleDir,
    stdio: 'inherit',
    env,
  });

  console.log('an5example Rust CRUD example passed');
} catch (err) {
  const msg = String((err && err.message) || err);
  if (/offline|network|failed to download|no matching package|failed to query/i.test(msg)) {
    console.log('rust-example-build: crates.io unreachable, skipping the live example run');
    process.exit(0);
  }
  throw err;
}
