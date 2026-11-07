"""
AN5 Python Example: SQL Server (MSSQL) Provider

Provider: Microsoft SQL Server
Protocol: sqlserver://, Server=host;Database=db;User Id=...;Password=...;

Run:
    python examples/python/mssql/crud.py
    MSSQL_URL="Server=localhost;Database=master;User Id=sa;Password=Pass!;TrustServerCertificate=True;" python examples/python/mssql/crud.py
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "generated", "python"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "an5Adapters", "python"))

import an5_client


def main():
    conn_str = (
        os.getenv("MSSQL_URL")
        or os.getenv("DATABASE_URL")
        or "Server=localhost;Database=master;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True;"
    )

    print("--- [Python / SQL Server (MSSQL) Provider] Starting example ---")
    try:
        db = an5_client.An5Client(conn_str)
        # Probe connection
        db.execute_raw("SELECT 1;")
    except Exception as ex:
        print(
            f"[Python/MSSQL] SKIPPED: SQL Server not reachable at {conn_str}.\n"
            f"  Reason: {str(ex).splitlines()[0]}\n"
            '  To run live: set MSSQL_URL="Server=localhost;Database=master;User Id=sa;Password=YourPassword123!;TrustServerCertificate=True;"'
        )
        print("--- [Python / SQL Server (MSSQL) Provider] Completed (offline safe) ---\n")
        return

    try:
        # Create schema
        db.execute_raw("IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;")
        db.execute_raw("IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;")
        db.execute_raw(
            """
            CREATE TABLE dbo.users (
              id        NVARCHAR(100) PRIMARY KEY,
              email     NVARCHAR(255) NOT NULL UNIQUE,
              name      NVARCHAR(255) NULL,
              isActive  BIT NOT NULL DEFAULT 1,
              score     INT NOT NULL DEFAULT 0,
              createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
            );
            """
        )
        db.execute_raw(
            """
            CREATE TABLE dbo.orders (
              id        NVARCHAR(100) PRIMARY KEY,
              userId    NVARCHAR(100) NOT NULL,
              total     INT NOT NULL DEFAULT 0,
              status    NVARCHAR(50) NULL,
              createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
              CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES dbo.users(id)
            );
            """
        )
        print("[Python/MSSQL] Initialized SQL Server tables.")

        # CRUD
        db.user.create(data={"id": "u_py_1", "email": "alice.mssql@example.com", "name": "Alice MSSQL", "score": 220})
        u = db.user.find_first(where={"email": "alice.mssql@example.com"})
        assert u and u["email"] == "alice.mssql@example.com"
        print(f"[Python/MSSQL] Created and retrieved user: {u['email']}")

        db.user.delete_many(where={"email": "alice.mssql@example.com"})
        print("[Python/MSSQL] Cleanup completed.")
        print("--- [Python / SQL Server (MSSQL) Provider] Finished successfully ---\n")
    finally:
        db.adapter.close()


if __name__ == "__main__":
    main()
