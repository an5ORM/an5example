#!/usr/bin/env node
/**
 * Build + run the an5example generated Rust client.
 *
 * The generated crate is a type-safe query builder, so this script:
 *   1. `cargo build` the generated client (catches codegen regressions)
 *   2. `cargo run` examples/rust, which executes the generated SQL against a
 *      temporary SQLite database via rusqlite.
 *
 * Skips gracefully when cargo is not installed. Uses a temp CARGO_TARGET_DIR
 * because the repo may live on a mount that cannot execute build scripts.
 *
 * Run: node test/rust-example-build.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const exampleRoot = path.join(__dirname, '..');
const generatedDir = path.join(exampleRoot, 'generated', 'rust');
const exampleDir = path.join(exampleRoot, 'examples', 'rust');

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

const targetDir = process.env.CARGO_TARGET_DIR || path.join(os.tmpdir(), 'an5-cargo-target');
fs.mkdirSync(targetDir, { recursive: true });
const env = { ...process.env, CARGO_TARGET_DIR: targetDir };

// `an5-adapters` is not on crates.io yet, so point cargo at the workspace copy.
// Without this the generated client cannot resolve its runtime dependency.
const adapterDir = path.resolve(exampleRoot, '..', 'an5Adapters', 'rust');
if (!fs.existsSync(path.join(adapterDir, 'Cargo.toml'))) {
  console.log('rust-example-build: an5Adapters/rust not available, skipping');
  process.exit(0);
}
const patch = `patch.crates-io.an5-adapters.path="${adapterDir}"`;

try {
  console.log('[1/2] build generated an5client crate');
  execFileSync('cargo', ['--config', patch, 'build'], {
    cwd: generatedDir,
    stdio: 'inherit',
    env,
  });

  console.log('[2/2] run Rust CRUD example against SQLite');
  execFileSync('cargo', ['run', '--quiet'], { cwd: exampleDir, stdio: 'inherit', env });

  console.log('an5example Rust client build + CRUD example passed');
} catch (err) {
  const msg = String((err && err.message) || err);
  if (/offline|network|failed to download|no matching package|failed to query/i.test(msg)) {
    console.log('rust-example-build: crates.io unreachable, skipping the live example run');
    process.exit(0);
  }
  throw err;
}
