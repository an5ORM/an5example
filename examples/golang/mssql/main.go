// AN5 Go Example: SQL Server (MSSQL) Provider
//
// Provider: Microsoft SQL Server
// Protocol: sqlserver://
package main

import (
	"database/sql"
	"fmt"
	"os"

	an5 "an5client"
)

func main() {
	connStr := os.Getenv("MSSQL_URL")
	if connStr == "" {
		connStr = os.Getenv("DATABASE_URL")
	}
	if connStr == "" {
		connStr = "sqlserver://sa:YourPassword123!@localhost:1433?database=master"
	}

	fmt.Println("--- [Go / SQL Server (MSSQL) Provider] Starting example ---")
	db, err := sql.Open("sqlserver", connStr)
	if err != nil {
		fmt.Printf("[Go/MSSQL] SKIPPED: could not initialize driver: %v\n", err)
		return
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		fmt.Printf("[Go/MSSQL] SKIPPED: Server not reachable at %s (%v)\n", connStr, err)
		fmt.Println("  To run live: set MSSQL_URL=\"sqlserver://sa:Pass!@localhost:1433?database=mydb\"")
		fmt.Println("--- [Go / SQL Server (MSSQL) Provider] Completed (offline safe) ---")
		return
	}

	_ = an5.NewAn5DbContextWithConnStr(db, "mssql")
	fmt.Println("[Go/MSSQL] Connected successfully to SQL Server instance.")
	fmt.Println("--- [Go / SQL Server (MSSQL) Provider] Finished successfully ---")
}
