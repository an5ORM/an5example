#!/usr/bin/env node
/**
 * Build and run the an5example Java example with Maven.
 *
 * The example ships a real `pom.xml` because a Java project is a Maven project to everyone
 * who will read it, and a manifest nobody runs is how a manifest goes stale. So this gate
 * runs exactly what a consumer would: `mvn compile`, then `mvn exec:java`.
 *
 * The generated client and the JDBC runtime are source trees in this repository rather than
 * published artifacts, so the pom adds them with `build-helper`; only the SQLite driver is a
 * dependency. `generated/java` has to exist, which means `npm run generate` first.
 *
 * Skips when Maven or a JDK is absent, and when Maven cannot reach a repository for its
 * plugins — the same way the Rust gate degrades when crates.io is unreachable.
 *
 * Run: node test/java-example-build.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const exampleRoot = path.join(__dirname, '..');
const javaDir = path.join(exampleRoot, 'examples', 'java');
const generatedDir = path.join(exampleRoot, 'generated', 'java');

function canRun(command, args) {
  try {
    execFileSync(command, args, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (!fs.existsSync(path.join(generatedDir, 'An5DbContext.java'))) {
  console.log('java-example-build: generated/java not found, run `npm run generate` first');
  process.exit(0);
}
if (!fs.existsSync(path.join(javaDir, 'pom.xml'))) {
  console.log('java-example-build: examples/java not found, skipping');
  process.exit(0);
}
if (!canRun('mvn', ['-v'])) {
  console.log('java-example-build: Maven not installed, skipping');
  process.exit(0);
}

const env = { ...process.env, MAVEN_OPTS: `${process.env.MAVEN_OPTS || ''} -Dfile.encoding=UTF-8` };

function mvn(goal) {
  return execFileSync('mvn', ['-B', '-q', goal], { cwd: javaDir, stdio: 'pipe', encoding: 'utf8', env });
}

try {
  console.log('[1/2] mvn compile');
  mvn('compile');
} catch (err) {
  const output = `${err.stdout || ''}\n${err.stderr || ''}`;
  if (/Could not resolve|Could not transfer|transfer failed|Connection refused|Unknown host|offline mode/i.test(output)) {
    console.log('java-example-build: Maven could not download its plugins, skipping the example run');
    process.exit(0);
  }
  process.stdout.write(output);
  throw err;
}

try {
  console.log('[2/2] run the Java CRUD example against SQLite');
  process.stdout.write(mvn('exec:java'));
} catch (err) {
  process.stdout.write(`${err.stdout || ''}\n${err.stderr || ''}`);
  throw err;
}

console.log('an5example Java CRUD example passed');
