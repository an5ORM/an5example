// AN5 Go Example: SQLite Provider
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
	fmt.Println("--- [Go / SQLite Provider] Starting example ---")
	dbPath := filepath.Join(os.TempDir(), "an5-go-sqlite.sqlite")
	_ = os.Remove(dbPath)
	defer os.Remove(dbPath)

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
			embedding BLOB NULL,
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
	embedding := []float32{1, 0, 0}

	// 1. Create User with vector embedding
	alice := an5.User{
		Id:        "u1",
		Email:     "alice.go@example.com",
		Name:      an5.StringPtr("Alice Go SQLite"),
		Score:     100,
		IsActive:  true,
		Embedding: &embedding,
		CreatedAt: timeNow(),
	}
	if _, err := ctx.User.Create(context.Background(), &alice); err != nil {
		panic(err)
	}
	fmt.Printf("[Go/SQLite] Created user: id=%s, email=%s\n", alice.Id, alice.Email)

	// 2. Query
	users, err := ctx.User.FindMany(context.Background(), an5.User{Email: "alice.go@example.com"})
	if err != nil {
		panic(err)
	}
	fmt.Printf("[Go/SQLite] Found %d user(s).\n", len(users))

	// 3. Cleanup
	if _, err := ctx.User.DeleteMany(context.Background(), an5.User{Email: "alice.go@example.com"}); err != nil {
		panic(err)
	}
	fmt.Println("--- [Go / SQLite Provider] Finished successfully ---")
}
