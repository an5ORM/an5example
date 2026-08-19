#!/usr/bin/env node
/**
 * Build + vet the an5example generated Go client. Copies the generated
 * sources into a temporary Go module and runs `go build` + `go vet`.
 *
 * With AN5_GO_LIVE=1 it additionally runs a CRUD smoke against a temp SQLite
 * database via modernc.org/sqlite (requires network on first `go mod download`).
 *
 * Run: node test/go-example-build.js
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const exampleRoot = path.join(__dirname, '..');
const generatedDir = path.join(exampleRoot, 'generated', 'golang');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'an5-go-check-'));
const clientDir = path.join(tmp, 'an5client');

function sh(args, opts) {
  execFileSync('go', args, { stdio: 'inherit', cwd: tmp, env: { ...process.env, GOFLAGS: '-mod=mod', ...opts?.env } });
}

try {
  fs.mkdirSync(clientDir, { recursive: true });
  for (const f of fs.readdirSync(generatedDir).filter((n) => n.endsWith('.go'))) {
    fs.copyFileSync(path.join(generatedDir, f), path.join(clientDir, f));
  }
  fs.writeFileSync(path.join(tmp, 'go.mod'), 'module an5example-go\n\ngo 1.22\n');
  fs.writeFileSync(
    path.join(tmp, 'main.go'),
    [
      'package main',
      '',
      'import (',
      '\t"fmt"',
      '',
      '\tan5 "an5example-go/an5client"',
      ')',
      '',
      'func main() {',
      '\tvar user an5.User',
      '\tuser.Email = "go@example.com"',
      '\tfmt.Println("an5client compiles:", an5.GetDefaultConnectionString() != "", user.Email)',
      '}',
      '',
    ].join('\n'),
  );

  sh(['build', './...']);
  sh(['vet', './...']);
  sh(['run', '.']);
  console.log('an5example Go client build + vet passed');

  if (process.env.AN5_GO_LIVE === '1') {
    fs.writeFileSync(
      path.join(tmp, 'main.go'),
      [
        'package main',
        '',
        'import (',
        '\t"database/sql"',
        '\t"fmt"',
        '\t"os"',
        '\t"path/filepath"',
        '',
        '\t_ "modernc.org/sqlite"',
        '',
        '\tan5 "an5example-go/an5client"',
        ')',
        '',
        'func main() {',
        '\tdbPath := filepath.Join(os.TempDir(), "an5-go-smoke.sqlite")',
        '\tos.Remove(dbPath)',
        '\tdb, err := sql.Open("sqlite", dbPath)',
        '\tif err != nil { panic(err) }',
        '\tdefer db.Close()',
        '',
        '\tddl := []string{',
        '\t\t`CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT, is_active INTEGER NOT NULL DEFAULT 1, score TEXT NOT NULL DEFAULT \'0\', created_at TEXT NOT NULL DEFAULT (strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')))`,',
        '\t\t`CREATE TABLE orders (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, total TEXT NOT NULL, status TEXT, created_at TEXT NOT NULL DEFAULT (strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')))`,',
        '\t}',
        '\tfor _, s := range ddl {',
        '\t\tif _, err := db.Exec(s); err != nil { panic(err) }',
        '\t}',
        '',
        '\tctx := an5.NewAn5DbContextWithConnStr(db, "sqlite")',
        '\tctx.Users.TableName = "users"',
        '\tctx.Orders.TableName = "orders"',
        '',
        '\tuser := an5.User{Id: "u1", Email: "go@example.com", Score: "10", IsActive: true}',
        '\tif err := ctx.User.Create(&user); err != nil { panic(err) }',
        '\tusers, err := ctx.User.FindMany(an5.User{Email: "go@example.com"})',
        '\tif err != nil { panic(err) }',
        '\tif len(users) != 1 || users[0].Id != "u1" { panic(fmt.Sprintf("findMany: got %d users", len(users))) }',
        '\tif err := ctx.User.DeleteMany(an5.User{Email: "go@example.com"}); err != nil { panic(err) }',
        '\tos.Remove(dbPath)',
        '\tfmt.Println("an5example Go CRUD smoke passed")',
        '}',
        '',
      ].join('\n'),
    );
    fs.appendFileSync(path.join(tmp, 'go.mod'), 'require modernc.org/sqlite v1.38.2\n');
    sh(['mod', 'download', 'modernc.org/sqlite']);
    sh(['run', '.']);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}