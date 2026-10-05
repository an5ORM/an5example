#!/usr/bin/env node
/**
 * Compile and run the an5example Kotlin example.
 *
 * The gate builds the JVM adapter, the generated client and the example with `kotlinc`, then
 * runs the resulting class — the same toolchain every other Kotlin gate in this repository
 * uses. `build.gradle.kts` is deliberately not part of this: Gradle is not available in the
 * environments that run these tests, and a build file nothing executes is a build file nobody
 * notices has broken.
 *
 * `generated/kotlin` has to exist, which means `npm run generate` first.
 *
 * Skips when no Kotlin compiler or JDK is on hand.
 *
 * Run: node test/kotlin-example-build.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const exampleRoot = path.join(__dirname, '..');
const repoRoot = path.resolve(exampleRoot, '..');
const adapters = path.join(repoRoot, 'an5Adapters');
const generatedKotlin = path.join(exampleRoot, 'generated', 'kotlin');
const generatedJava = path.join(exampleRoot, 'generated', 'java');
const exampleSources = path.join(exampleRoot, 'examples', 'kotlin', 'src', 'main', 'kotlin');

function sources(dir, extension) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return sources(full, extension);
      return entry.name.endsWith(extension) ? [full] : [];
    });
}

function kotlinc() {
  const candidates = [
    process.env.KOTLIN_HOME && path.join(process.env.KOTLIN_HOME, 'bin', 'kotlinc'),
    'kotlinc',
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      execFileSync(candidate, ['-version'], { stdio: 'ignore' });
      if (candidate.includes(path.sep)) return candidate;
      const resolved = execFileSync('which', [candidate], { encoding: 'utf8' }).trim();
      return resolved || candidate;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

function javac() {
  if (process.env.JAVA_HOME && fs.existsSync(path.join(process.env.JAVA_HOME, 'bin', 'javac'))) {
    return path.join(process.env.JAVA_HOME, 'bin', 'javac');
  }
  try {
    execFileSync('javac', ['-version'], { stdio: 'ignore' });
    return 'javac';
  } catch {
    return null;
  }
}

const compiler = kotlinc();
const javaCompiler = javac();
if (!compiler || !javaCompiler) {
  console.log('kotlin-example-build: no Kotlin compiler or JDK installed, skipping');
  process.exit(0);
}
if (!fs.existsSync(path.join(generatedKotlin, 'An5Db.kt'))) {
  console.log('kotlin-example-build: generated/kotlin not found, run `npm run generate` first');
  process.exit(0);
}
if (sources(exampleSources, '.kt').length === 0) {
  console.log('kotlin-example-build: examples/kotlin not found, skipping');
  process.exit(0);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'an5-kotlin-example-'));
try {
  const javaClasses = path.join(work, 'classes');
  fs.mkdirSync(javaClasses, { recursive: true });

  const javaList = path.join(work, 'java-sources.txt');
  const javaFiles = [
    ...sources(path.join(adapters, 'java', 'src', 'main', 'java'), '.java'),
    ...sources(generatedJava, '.java'),
  ];
  fs.writeFileSync(javaList, javaFiles.join('\n'), 'utf8');
  execFileSync(javaCompiler, ['-d', javaClasses, `@${javaList}`], { stdio: 'inherit' });

  // The stdlib travels with the compiler, so it is both on the compile classpath and the
  // runtime one; without it the class files load and then fail on the first null check.
  const stdlib = path.join(path.dirname(path.dirname(compiler)), 'lib', 'kotlin-stdlib.jar');
  const kotlinFiles = [
    ...sources(path.join(adapters, 'kotlin', 'src', 'main', 'kotlin'), '.kt'),
    ...sources(generatedKotlin, '.kt'),
    ...sources(exampleSources, '.kt'),
  ];
  const kotlinClasses = path.join(work, 'kotlin');
  execFileSync(
    compiler,
    ['-classpath', [javaClasses, stdlib].filter((entry) => fs.existsSync(entry)).join(path.delimiter), '-d', kotlinClasses, ...kotlinFiles],
    { stdio: 'inherit' }
  );

  // The SQLite driver is fetched once into a shared directory, like the adapter's own smoke
  // test does; without it the example has nothing to open a database with.
  const libDir = process.env.AN5_JAVA_LIB_DIR || path.join(os.tmpdir(), 'an5-java-libs');
  const driverUrl =
    'https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.46.1.3/sqlite-jdbc-3.46.1.3.jar';
  fs.mkdirSync(libDir, { recursive: true });
  const driverJar = path.join(libDir, path.basename(driverUrl));
  if (!fs.existsSync(driverJar)) {
    try {
      console.log(`kotlin-example-build: fetching ${path.basename(driverJar)}`);
      execFileSync('curl', ['-fsSL', '--retry', '3', '--retry-all-errors', '-o', driverJar, driverUrl], {
        stdio: 'inherit',
      });
    } catch {
      console.log('kotlin-example-build: sqlite-jdbc unavailable, compiled but not run');
      process.exit(0);
    }
  }

  const javaBin = javaCompiler.replace(/javac$/, 'java');
  const classpath = [kotlinClasses, javaClasses, stdlib, driverJar]
    .filter((entry) => fs.existsSync(entry))
    .join(path.delimiter);
  console.log('run the Kotlin CRUD example against SQLite');
  execFileSync(javaBin, ['-cp', classpath, 'an5.example.CrudExampleKt'], { stdio: 'inherit' });

  console.log('an5example Kotlin CRUD example passed');
} finally {
  fs.rmSync(work, { recursive: true, force: true });
}
