"""
AN5 example: generated Python client + runtime adapter.

Runnable against a reachable database via the AN5_DATABASE_URL environment
variable (postgres://... or Server=...;...). When the variable is unset the
script verifies that the generated client imports, registers metadata and can
be constructed — a compile/import smoke check.

Run:
    python -m compileall -q examples/python
    AN5_DATABASE_URL=postgres://u:p@host:5432/db python examples/python/crud.py
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "generated", "python"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "an5Adapters", "python"))

import an5_client  # noqa: E402
import an5_metadata  # noqa: E402


def main():
    conn = os.getenv("AN5_DATABASE_URL")
    db = an5_client.An5Client(conn)

    if not conn:
        print("an5example Python client import check passed (AN5_DATABASE_URL not set)")
        return

    db.user.create(data={"email": "py@example.com", "name": "Py", "score": 1})
    u = db.user.find_first(where={"email": "py@example.com"})
    assert u and u["email"] == "py@example.com", "create/find via Python client"
    db.user.delete_many(where={"email": "py@example.com"})
    print("an5example Python CRUD smoke passed")


if __name__ == "__main__":
    main()