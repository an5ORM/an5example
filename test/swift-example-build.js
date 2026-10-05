#!/usr/bin/env node
/**
 * Build and run the an5example Swift example.
 *
 * The example ships a real `Package.swift` — a SwiftPM package is how a Swift consumer
 * declares this dependency — so the gate runs `swift build` and `swift run` against it rather
 * than assembling a throwaway package of its own.
 *
 * What it does rewrite, in a temporary copy, is the runtime URL in both manifests: the
 * example points at the runtime by URL the way a published consumer would, and the generated
 * client does the same. Neither resolves to this checkout, and a package referenced by URL
 * takes the identity of its last path component, which the copy rewrites preserve so the
 * `package:` arguments stay as written. Building the real manifest is the point — a client
 * that ships without a resolvable one is not a client.
 *
 * Skips when no Swift toolchain, no SQLite headers, or no generated client is present.
 *
 * Run: node test/swift-example-build.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const exampleRoot = path.join(__dirname, '..');
const repoRoot = path.resolve(exampleRoot, '..');
const adapters = path.join(repoRoot, 'an5Adapters', 'swift');
const generated = path.join(exampleRoot, 'generated', 'swift');
const exampleDir = path.join(exampleRoot, 'examples', 'swift');

function swift() {
  const candidates = [
    process.env.SWIFT_HOME && path.join(process.env.SWIFT_HOME, 'usr', 'bin', 'swift'),
    'swift',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ['--version'], { stdio: 'ignore' });
      return candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

const toolchain = swift();
const hasSQLiteHeaders = ['/usr/include/sqlite3.h', '/usr/local/include/sqlite3.h'].some((file) =>
  fs.existsSync(file)
);
if (!toolchain || !hasSQLiteHeaders) {
  console.log('swift-example-build: no Swift toolchain or SQLite headers, skipping');
  process.exit(0);
}
if (!fs.existsSync(path.join(generated, 'Package.swift'))) {
  console.log('swift-example-build: generated/swift not found, run `npm run generate` first');
  process.exit(0);
}
if (!fs.existsSync(path.join(exampleDir, 'An5Example', 'Package.swift'))) {
  console.log('swift-example-build: examples/swift not found, skipping');
  process.exit(0);
}

const runtimeUrl = /\.package\(url: "https:\/\/github\.com\/an5ORM\/an5Adapters\.git", from: "[^"]+"\)/;

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'an5-swift-example-'));
try {
  // Mirrors the repository's own shape, because both relative paths in the manifests are
  // written against it: the example under `examples/swift`, the client beside `an5Adapters`.
  // The package directory holds the example's own name, because SwiftPM identifies a package
  // by its directory's last path component and `generated/swift` would otherwise collide with
  // it. The client keeps its `swift` directory name, since that name is the package identity
  // the example's `package:` argument uses, and the runtime copy keeps `an5Adapters` for the
  // same reason on the other side.
  const project = path.join(work, 'proj');
  const packageRoot = path.join(project, 'examples', 'swift', 'An5Example');
  fs.cpSync(exampleDir, path.join(project, 'examples', 'swift'), { recursive: true });
  fs.cpSync(generated, path.join(project, 'generated', 'swift'), { recursive: true });
  fs.cpSync(adapters, path.join(project, 'an5Adapters'), { recursive: true });

  for (const [manifest, replacement] of [
    [path.join(packageRoot, 'Package.swift'), '.package(path: "../../../an5Adapters")'],
    [path.join(project, 'generated', 'swift', 'Package.swift'), '.package(path: "../../an5Adapters")'],
  ]) {
    const source = fs.readFileSync(manifest, 'utf8');
    if (!runtimeUrl.test(source)) {
      throw new Error(`expected a runtime URL in ${manifest}`);
    }
    fs.writeFileSync(manifest, source.replace(runtimeUrl, replacement), 'utf8');
  }

  console.log('[1/2] swift build');
  execFileSync(toolchain, ['build', '--scratch-path', path.join(work, 'build')], {
    cwd: packageRoot,
    stdio: 'inherit',
  });

  console.log('[2/2] run the Swift CRUD example against SQLite');
  execFileSync(toolchain, ['run', '--skip-build', '--scratch-path', path.join(work, 'build')], {
    cwd: packageRoot,
    stdio: 'inherit',
  });

  console.log('an5example Swift CRUD example passed');
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
