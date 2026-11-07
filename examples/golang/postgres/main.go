// AN5 Go Example: PostgreSQL Provider
//
// Provider: PostgreSQL
// Protocol: postgres://, postgresql://
package main

import (
	"database/sql"
	"fmt"
	"os"

	an5 "an5client"
)

func main() {
	connStr := os.Getenv("POSTGRES_URL")
	if connStr == "" {
		connStr = os.Getenv("DATABASE_URL")
	}
	if connStr == "" {
		connStr = "postgres://postgres:postgres@localhost:5432/an5_example"
	}

	fmt.Println("--- [Go / PostgreSQL Provider] Starting example ---")
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Printf("[Go/PostgreSQL] SKIPPED: could not initialize driver: %v\n", err)
		return
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		fmt.Printf("[Go/PostgreSQL] SKIPPED: Server not reachable at %s (%v)\n", connStr, err)
		fmt.Println("  To run live: set POSTGRES_URL=postgres://user:password@localhost:5432/mydb")
		fmt.Println("--- [Go / PostgreSQL Provider] Completed (offline safe) ---")
		return
	}

	_ = an5.NewAn5DbContextWithConnStr(db, "postgres")
	fmt.Println("[Go/PostgreSQL] Connected successfully to PostgreSQL instance.")
	fmt.Println("--- [Go / PostgreSQL Provider] Finished successfully ---")
}
