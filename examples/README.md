# AN5 Example Projects by Language & Provider

This directory contains runnable examples demonstrating the use of AN5 ORM generated clients and runtime adapters. The structure mirrors the multi-provider architecture of `@an5/adapters`.

## Provider Support Matrix

| Language | SQLite | PostgreSQL | MySQL | SQL Server (MSSQL) | Google Sheets | NBase Vector DB |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **TypeScript** | `examples/typescript/sqlite` | `examples/typescript/postgres` | `examples/typescript/mysql` | `examples/typescript/mssql` | `examples/typescript/googlesheets` | `examples/typescript/nbase` |
| **Python** | `examples/python/sqlite` | `examples/python/postgres` | — | `examples/python/mssql` | — | — |
| **.NET (C#)** | `examples/dotnet/Sqlite` | `examples/dotnet/Postgres` | — | `examples/dotnet/Mssql` | — | — |
| **Golang** | `examples/golang/sqlite` | `examples/golang/postgres` | — | `examples/golang/mssql` | — | — |

---

## TypeScript Examples (`examples/typescript/`)

Built using `@an5/adapters` and the generated TypeScript model clients.

### 1. SQLite (`examples/typescript/sqlite/crud.ts`)
Operates in-memory (`sqlite://:memory:`) or against a local file. Exercises full CRUD, relation joins (`include: { orders: true }`), aggregations, and `VECTOR(n)` stored as float32 BLOB.
```bash
npx tsc -p tsconfig.json
node dist/examples/typescript/sqlite/crud.js
```

### 2. PostgreSQL (`examples/typescript/postgres/crud.ts`)
Connects to PostgreSQL using `postgres://` or `postgresql://`. Exercises ANSI SQL DDL, transactions (`$transaction`), and relations.
```bash
POSTGRES_URL=postgres://user:password@localhost:5432/mydb node dist/examples/typescript/postgres/crud.js
```

### 3. MySQL / MariaDB (`examples/typescript/mysql/crud.ts`)
Connects to MySQL / MariaDB with backtick quoting, `TINYINT(1)` booleans, and `DATETIME(6)`.
```bash
MYSQL_URL=mysql://root:password@localhost:3306/mydb node dist/examples/typescript/mysql/crud.js
```

### 4. SQL Server / MSSQL (`examples/typescript/mssql/crud.ts`)
Connects to Microsoft SQL Server with schema qualification (`dbo.*`), T-SQL syntax, and native `VECTOR(3)` (SQL Server 2025).
```bash
MSSQL_URL="Server=localhost;Database=master;User Id=sa;Password=Pass!;TrustServerCertificate=True;" \
  node dist/examples/typescript/mssql/crud.js
```

### 5. Google Sheets (`examples/typescript/googlesheets/crud.ts`)
Serverless tabular database mapped to Google Spreadsheet tabs. Supports API key, Service Account Key, and OAuth 2.0.
```bash
SHEETS_URL="googlesheets://<spreadsheetId>;apiKey=AIzaSy..." node dist/examples/typescript/googlesheets/crud.js
```

### 6. NBase Vector DB (`examples/typescript/nbase/crud.ts`)
Dedicated neural vector database supporting standalone similarity search and hybrid relational indexing (`indexVectorsInNBase`).
```bash
NBASE_URL="nbase://localhost:1307" node dist/examples/typescript/nbase/crud.js
```

---

## Python Examples (`examples/python/`)

Uses `an5_client.An5Client` and `an5Adapters.python`.

- **SQLite**: `python3 examples/python/sqlite/crud.py`
- **PostgreSQL**: `POSTGRES_URL=postgres://user:pass@localhost:5432/db python3 examples/python/postgres/crud.py`
- **SQL Server (MSSQL)**: `MSSQL_URL="Server=...;" python3 examples/python/mssql/crud.py`

---

## .NET Examples (`examples/dotnet/`)

Uses `An5DbContext` with ADO.NET providers (`Microsoft.Data.Sqlite`, `Npgsql`, `Microsoft.Data.SqlClient`).

- Run all provider checks:
  ```bash
  dotnet run --project examples/dotnet
  ```

---

## Golang Examples (`examples/golang/`)

Uses `an5client.An5DbContext`.

- **SQLite**: `go -C examples/golang/sqlite run .`
- **PostgreSQL**: `go -C examples/golang/postgres run .`
- **SQL Server**: `go -C examples/golang/mssql run .`
