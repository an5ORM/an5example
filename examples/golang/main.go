// AN5 example: generated Go client against SQLite (modernc.org/sqlite).
//
// Creates a temporary SQLite database, runs a CRUD + relation flow through the
// generated an5client package, then cleans up.
//
// Run (first run downloads modernc.org/sqlite deps; needs network):
//   go mod download
//   go run .
package main

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"

	an5 "an5client"
)

func timeNow() time.Time { return time.Now().UTC() }

func main() {
	dbPath := filepath.Join(os.TempDir(), "an5-go-example.sqlite")
	os.Remove(dbPath)

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		panic(err)
	}
	defer db.Close()

	ddl := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			name TEXT NULL,
			is_active INTEGER NOT NULL DEFAULT 1,
			score INTEGER NOT NULL DEFAULT 0,
			created_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
		)`,
		`CREATE TABLE IF NOT EXISTS orders (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL,
			total INTEGER NOT NULL DEFAULT 0,
			status TEXT NULL,
			created_at DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
			FOREIGN KEY (user_id) REFERENCES users(id)
		)`,
	}
	for _, s := range ddl {
		if _, err := db.Exec(s); err != nil {
			panic(err)
		}
	}

	ctx := an5.NewAn5DbContextWithConnStr(db, "sqlite")
	// Generated clients target [dbo]. tables by default; override for SQLite.
	ctx.Users.TableName = "users"
	ctx.Orders.TableName = "orders"

	alice := an5.User{Id: "u1", Email: "alice@example.com", Name: an5.StringPtr("Alice"), Score: "10", IsActive: true, CreatedAt: timeNow()}
	if _, err := ctx.User.Create(context.Background(), &alice); err != nil {
		panic(err)
	}

	if _, err := ctx.Orders.Create(context.Background(), &an5.Order{Id: "o1", UserId: alice.Id, Total: "250", Status: an5.StringPtr("open"), CreatedAt: timeNow()}); err != nil {
		panic(err)
	}

	users, err := ctx.User.FindMany(context.Background(), an5.User{Email: "alice@example.com"})
	if err != nil {
		panic(err)
	}
	fmt.Printf("found %d user(s) matching alice\n", len(users))

	orders, err := ctx.Orders.FindMany(context.Background(), an5.Order{})
	if err != nil {
		panic(err)
	}
	fmt.Printf("total orders: %d\n", len(orders))

	if _, err := ctx.Orders.DeleteMany(context.Background(), an5.Order{}); err != nil {
		panic(err)
	}
	if _, err := ctx.User.DeleteMany(context.Background(), an5.User{Email: "alice@example.com"}); err != nil {
		panic(err)
	}

	os.Remove(dbPath)
	fmt.Println("an5example Go CRUD example passed")
}
