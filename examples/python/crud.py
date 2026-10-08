"""
AN5 example: generated Python client + runtime adapter.

Three checks run, in order:

1. The generated client imports and registers metadata (a compile/import smoke).
2. A self-contained SQLite database exercises CRUD and a `VECTOR(3)` column: the
   value has to come back as three floats, sit in the table as a float32 BLOB and
   rank correctly. This is what `npm test` runs, so a regression here fails CI.
3. When AN5_DATABASE_URL points at a reachable server (postgres://... or
   Server=...;...), the same client runs a CRUD smoke against that server too.

Run:
    python -m compileall -q examples/python
    python examples/python/crud.py
    AN5_DATABASE_URL=postgres://u:p@host:5432/db python examples/python/crud.py
"""

import math
import os
import sqlite3
import struct
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "generated", "python"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "an5Adapters", "python"))

import an5_client


def _create_schema(path):
    """Tables matching ./schema — `embedding` is the schema's VECTOR(3)."""
    con = sqlite3.connect(path)
    con.executescript(
        """
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
          id        TEXT PRIMARY KEY,
          email     TEXT NOT NULL UNIQUE,
          name      TEXT NULL,
          isActive  INTEGER NOT NULL DEFAULT 1,
          score     INTEGER NOT NULL DEFAULT 0,
          embedding BLOB NULL,
          createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );

        CREATE TABLE IF NOT EXISTS orders (
          id        TEXT PRIMARY KEY,
          userId    TEXT NOT NULL,
          total     INTEGER NOT NULL DEFAULT 0,
          status    TEXT NULL,
          createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          FOREIGN KEY (userId) REFERENCES users(id)
        );
        """
    )
    con.commit()
    con.close()


def _close(actual, expected, label, tolerance=1e-6):
    assert len(actual) == len(expected), f"{label}: got {actual}, want {expected}"
    for got, want in zip(actual, expected):
        assert math.isclose(got, want, abs_tol=tolerance), f"{label}: got {actual}, want {expected}"


def sqlite_example():
    """CRUD + a VECTOR(n) column, end to end through the generated client."""
    path = os.path.join(tempfile.gettempdir(), "an5-python-example.sqlite")
    for suffix in ("", "-wal", "-shm"):
        try:
            os.remove(path + suffix)
        except OSError:
            pass
    _create_schema(path)

    db = an5_client.An5Client("sqlite:" + path)
    assert db.adapter._dialect == "sqlite", "a .sqlite file has to select the SQLite dialect"

    # A vector written as a list of floats, and one written as legacy JSON text.
    db.user.create(
        data={
            "id": "u1",
            "email": "alice@example.com",
            "name": "Alice",
            "score": 10,
            "embedding": [1.0, 0.0, 0.0],
        }
    )
    db.user.create(
        data={
            "id": "u2",
            "email": "bob@example.com",
            "name": "Bob",
            "score": 20,
            "embedding": "[0.0, 1.0, 0.0]",
        }
    )

    alice = db.user.find_unique(where={"id": "u1"})
    assert isinstance(alice["embedding"], list), f"a VECTOR(n) column reads back as a list, got {type(alice['embedding'])}"
    _close(alice["embedding"], [1.0, 0.0, 0.0], "create -> find_unique")

    con = sqlite3.connect(path)
    kind, size, raw = con.execute(
        "SELECT typeof(embedding), length(embedding), embedding FROM users WHERE id = ?",
        ("u1",),
    ).fetchone()
    con.close()
    assert kind == "blob" and size == 12, f"VECTOR(3) is stored as a float32 BLOB, got {kind} of {size} bytes"
    assert struct.unpack("<3f", raw) == (1.0, 0.0, 0.0), f"the BLOB holds three little-endian floats, got {raw!r}"

    # Legacy JSON text keeps decoding: it was the only encoding before VECTOR(n).
    bob = db.user.find_unique(where={"id": "u2"})
    _close(bob["embedding"], [0.0, 1.0, 0.0], "legacy JSON text -> find_unique")

    ranked = db.user.vector_search([1.0, 0.0, 0.0], take=2, vector_field="embedding")
    assert len(ranked) == 2, f"both users carry an embedding, got {len(ranked)} rows"
    assert ranked[0]["id"] == "u1", f"the vector matching the query ranks first, got {ranked[0]['id']}"
    assert isinstance(ranked[0].get("distance"), (int, float)), f"a scored row carries a numeric distance, got {ranked[0].get('distance')!r}"
    assert not math.isnan(ranked[0]["distance"]), "the distance must be a number, not NaN"
    print(f"vector search ranked {[(row['id'], round(row['distance'], 4)) for row in ranked]}")

    db.user.update(where={"id": "u2"}, data={"embedding": [0.0, 0.0, 1.0]})
    bob = db.user.find_unique(where={"id": "u2"})
    _close(bob["embedding"], [0.0, 0.0, 1.0], "update -> find_unique")

    db.user.delete_many()
    db.order.delete_many()
    print("an5example SQLite CRUD + vector check passed")


def server_example(conn):
    """CRUD smoke against a reachable server named by AN5_DATABASE_URL."""
    db = an5_client.An5Client(conn)

    db.user.create(data={"email": "py@example.com", "name": "Py", "score": 1})
    u = db.user.find_first(where={"email": "py@example.com"})
    assert u and u["email"] == "py@example.com", "create/find via Python client"
    db.user.delete_many(where={"email": "py@example.com"})
    print("an5example Python CRUD smoke passed")


def main():
    # Import check: the generated client has to load before anything runs.
    assert hasattr(an5_client, "An5Client"), "the generated client exports An5Client"
    print("an5example Python client import check passed")

    sqlite_example()

    conn = os.getenv("AN5_DATABASE_URL")
    if conn:
        server_example(conn)


if __name__ == "__main__":
    main()
