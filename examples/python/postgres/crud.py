"""
AN5 Python Example: PostgreSQL Provider

Provider: PostgreSQL
Protocol: postgres://, postgresql://

Run:
    python examples/python/postgres/crud.py
    POSTGRES_URL=postgres://user:pass@localhost:5432/db python examples/python/postgres/crud.py
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "generated", "python"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "an5Adapters", "python"))

import an5_client


def main():
    conn_str = (
        os.getenv("POSTGRES_URL")
        or os.getenv("DATABASE_URL")
        or "postgres://postgres:postgres@localhost:5432/an5_example"
    )

    print("--- [Python / PostgreSQL Provider] Starting example ---")
    try:
        db = an5_client.An5Client(conn_str)
        # Probe connection
        db.execute_raw("SELECT 1;")
    except Exception as ex:
        print(
            f"[Python/PostgreSQL] SKIPPED: Server not reachable at {conn_str}.\n"
            f"  Reason: {str(ex).splitlines()[0]}\n"
            "  To run live: set POSTGRES_URL=postgres://user:password@localhost:5432/mydb"
        )
        print("--- [Python / PostgreSQL Provider] Completed (offline safe) ---\n")
        return

    try:
        # Create schema
        db.execute_raw("DROP TABLE IF EXISTS orders;")
        db.execute_raw("DROP TABLE IF EXISTS users;")
        db.execute_raw(
            """
            CREATE TABLE users (
              id        TEXT PRIMARY KEY,
              email     TEXT NOT NULL UNIQUE,
              name      TEXT NULL,
              "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
              score     INTEGER NOT NULL DEFAULT 0,
              "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            """
        )
        db.execute_raw(
            """
            CREATE TABLE orders (
              id        TEXT PRIMARY KEY,
              "userId"  TEXT NOT NULL,
              total     INTEGER NOT NULL DEFAULT 0,
              status    TEXT NULL,
              "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              CONSTRAINT fk_orders_user FOREIGN KEY ("userId") REFERENCES users(id)
            );
            """
        )
        print("[Python/PostgreSQL] Initialized PostgreSQL tables.")

        # CRUD
        db.user.create(data={"email": "alice.py@example.com", "name": "Alice Py", "score": 150})
        u = db.user.find_first(where={"email": "alice.py@example.com"})
        assert u and u["email"] == "alice.py@example.com"
        print(f"[Python/PostgreSQL] Created and retrieved user: {u['email']}")

        db.user.delete_many(where={"email": "alice.py@example.com"})
        print("[Python/PostgreSQL] Cleanup completed.")
        print("--- [Python / PostgreSQL Provider] Finished successfully ---\n")
    finally:
        db.adapter.close()


if __name__ == "__main__":
    main()
