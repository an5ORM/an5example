"""
AN5 Python Example: SQLite Provider

Provider: SQLite
Protocol: sqlite:, file.db, or in-memory

Run:
    python examples/python/sqlite/crud.py
"""

import math
import os
import sqlite3
import struct
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "generated", "python"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "an5Adapters", "python"))

import an5_client


def create_schema(path):
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


def main():
    print("--- [Python / SQLite Provider] Starting example ---")
    path = os.path.join(tempfile.gettempdir(), "an5-python-sqlite.sqlite")
    for suffix in ("", "-wal", "-shm"):
        try:
            os.remove(path + suffix)
        except OSError:
            pass

    create_schema(path)
    db = an5_client.An5Client("sqlite:" + path)
    assert db.adapter._dialect == "sqlite", "must select SQLite dialect"

    # 1. Create records with VECTOR(n) column
    db.user.create(
        data={
            "id": "u1",
            "email": "alice.sqlite@example.com",
            "name": "Alice SQLite",
            "score": 100,
            "embedding": [1.0, 0.0, 0.0],
        }
    )
    db.user.create(
        data={
            "id": "u2",
            "email": "bob.sqlite@example.com",
            "name": "Bob SQLite",
            "score": 200,
            "embedding": [0.0, 1.0, 0.0],
        }
    )
    print("[Python/SQLite] Created 2 users with embeddings.")

    # 2. Verify vector stored as float32 BLOB
    con = sqlite3.connect(path)
    kind, size, raw = con.execute(
        "SELECT typeof(embedding), length(embedding), embedding FROM users WHERE id = ?",
        ("u1",),
    ).fetchone()
    con.close()
    assert kind == "blob" and size == 12, f"VECTOR(3) is 12 bytes BLOB, got {kind} of {size} bytes"
    assert struct.unpack("<3f", raw) == (1.0, 0.0, 0.0), "little-endian float32"
    print("[Python/SQLite] Verified VECTOR(3) float32 binary format.")

    # 3. Vector similarity search
    ranked = db.user.vector_search([1.0, 0.0, 0.0], take=2, vector_field="embedding")
    assert len(ranked) == 2 and ranked[0]["id"] == "u1"
    print(f"[Python/SQLite] Vector search ranked nearest user: {ranked[0]['id']} (distance: {ranked[0]['distance']:.4f})")

    # 4. Cleanup
    db.user.delete_many()
    db.order.delete_many()
    print("--- [Python / SQLite Provider] Finished successfully ---\n")


if __name__ == "__main__":
    main()
