"""
AN5 ORM: Complete Python Query API Showcase

This example demonstrates the full breadth of the AN5 ORM query API in Python:
1. Data Insertion (Single, Nested Relational Writes, create_many)
2. Advanced Filtering & Comparators (contains, starts_with, ends_with, gte, lte, in)
3. Logical Combinators (AND, OR, NOT)
4. Field Projections (select)
5. Sorting & Pagination (order_by, skip, take)
6. Relational Joins & Filters (include, relation filters some/none/every)
7. Mutations (update, atomic field math increment, update_many, upsert, delete)
8. Aggregations & Group By (count, sum, avg, min, max, group_by)
9. ACID Transactions (commit & atomic rollback on exception)
10. Semantic Vector Search (vector_search nearest neighbor)
11. Raw SQL Escape Hatch (query_raw, execute_raw)

Run:
    python3 examples/python/queries.py
"""

from datetime import datetime, timedelta, timezone
import json
import os
import sqlite3
import sys
import tempfile

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "generated", "python"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "an5Adapters", "python"))

import an5_client


def _ts(offset_minutes: int = 0) -> str:
    dt = datetime.now(timezone.utc) + timedelta(minutes=offset_minutes)
    return dt.strftime("%Y-%m-%dT%H:%M:%S.%fZ")


def _create_schema(path: str) -> None:
    conn = sqlite3.connect(path)
    conn.executescript(
        """
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS users (
            id        TEXT PRIMARY KEY,
            email     TEXT NOT NULL UNIQUE,
            name      TEXT NULL,
            isActive  INTEGER NOT NULL DEFAULT 1,
            score     INTEGER NOT NULL DEFAULT 0,
            embedding BLOB NULL,
            createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
        );

        CREATE TABLE IF NOT EXISTS orders (
            id        TEXT PRIMARY KEY,
            userId    TEXT NOT NULL,
            total     INTEGER NOT NULL DEFAULT 0,
            status    TEXT NULL,
            createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
            FOREIGN KEY (userId) REFERENCES users(id)
        );
        """
    )
    conn.commit()
    conn.close()


def main():
    print("================================================================")
    print("        AN5 ORM FULL PYTHON QUERY API SHOWCASE                 ")
    print("================================================================\n")

    db_path = os.path.join(tempfile.gettempdir(), "an5-python-queries-showcase.sqlite")
    for suffix in ("", "-wal", "-shm"):
        try:
            os.remove(db_path + suffix)
        except OSError:
            pass

    _create_schema(db_path)
    db = an5_client.An5Client("sqlite:" + db_path)

    # ───────────────────────────────────────────────────────────────────────────
    # 1. DATA INSERTION
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 1. DATA INSERTION")

    # 1.1 Single create
    alice = db.user.create(
        data={
            "id": "u_alice",
            "email": "alice@example.com",
            "name": "Alice Johnson",
            "score": 100,
            "embedding": [1.0, 0.0, 0.0],
            "createdAt": _ts(0),
        }
    )
    print(f"  ✓ Created single User: id={alice['id']}, name={alice['name']}")

    # 1.2 Nested relational write: User with nested orders
    bob = db.user.create(
        data={
            "id": "u_bob",
            "email": "bob@example.com",
            "name": "Bob Smith",
            "score": 250,
            "embedding": [0.0, 1.0, 0.0],
            "createdAt": _ts(1),
            "orders": {
                "create": [
                    {"id": "o_b1", "total": 120, "status": "paid", "createdAt": _ts(1)},
                    {"id": "o_b2", "total": 350, "status": "open", "createdAt": _ts(2)},
                    {"id": "o_b3", "total": 80, "status": "paid", "createdAt": _ts(3)},
                ]
            },
        },
        include={"orders": True, "_count": True},
    )
    print(f"  ✓ Created User with {len(bob.get('orders', []))} nested orders (id={bob['id']})")

    # 1.3 Bulk insert: create_many
    bulk_result = db.user.create_many(
        data=[
            {"id": "u_charlie", "email": "charlie@example.com", "name": "Charlie Brown", "score": 50, "createdAt": _ts(4)},
            {"id": "u_diana", "email": "diana@example.com", "name": "Diana Prince", "score": 300, "createdAt": _ts(5)},
            {"id": "u_edward", "email": "edward@example.com", "name": "Edward Norton", "score": 180, "createdAt": _ts(6)},
        ]
    )
    print(f"  ✓ Bulk inserted {bulk_result['count']} users via create_many\n")

    # ───────────────────────────────────────────────────────────────────────────
    # 2. ADVANCED FILTERING & COMPARATORS
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 2. ADVANCED FILTERING & COMPARATORS")

    # contains
    matching_alice = db.user.find_many(where={"name": {"contains": "Alice"}})
    print(f"  ✓ contains('Alice'): found {len(matching_alice)} user(s)")

    # startsWith & endsWith
    domain_users = db.user.find_many(
        where={"email": {"startsWith": "d", "endsWith": "@example.com"}}
    )
    names_str = ", ".join(u["name"] or "" for u in domain_users)
    print(f"  ✓ startsWith('d') & endsWith('@example.com'): found {names_str}")

    # Range comparators: gte, lte
    high_scorers = db.user.find_many(
        where={"score": {"gte": 200, "lte": 300}},
        order_by={"score": "desc"},
    )
    scores_str = ", ".join(f"{u['name']} ({u['score']})" for u in high_scorers)
    print(f"  ✓ Range score >= 200 and <= 300: found {scores_str}")

    # In / Not In sets
    selected_scores = db.user.find_many(where={"score": {"in": [50, 100, 300]}})
    print(f"  ✓ in([50, 100, 300]): found {len(selected_scores)} user(s)\n")

    # ───────────────────────────────────────────────────────────────────────────
    # 3. LOGICAL COMBINATORS: AND, OR, NOT
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 3. LOGICAL COMBINATORS (AND, OR, NOT)")

    complex_query = db.user.find_many(
        where={
            "OR": [
                {"score": {"gte": 250}},
                {
                    "AND": [
                        {"score": {"gte": 100}},
                        {"email": {"contains": "alice"}},
                    ]
                },
            ],
            "NOT": [
                {"name": {"contains": "Edward"}},
            ],
        }
    )
    print("  ✓ (score >= 250 OR (score >= 100 AND alice)) AND NOT(Edward):")
    for u in complex_query:
        print(f"    - {u['name']} (score: {u['score']}, email: {u['email']})")
    print()

    # ───────────────────────────────────────────────────────────────────────────
    # 4. FIELD PROJECTIONS (select)
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 4. FIELD PROJECTIONS (select)")

    projected = db.user.find_many(
        where={"score": {"gt": 150}},
        select={"id": True, "name": True, "score": True},
        order_by={"score": "desc"},
    )
    print("  ✓ Projection select: { id, name, score }:")
    print(f"    {json.dumps(projected[0])}\n")

    # ───────────────────────────────────────────────────────────────────────────
    # 5. SORTING & PAGINATION (order_by, skip, take)
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 5. SORTING & PAGINATION (order_by, skip, take)")

    page1 = db.user.find_many(
        order_by=[{"score": "desc"}, {"createdAt": "asc"}],
        skip=0,
        take=2,
    )
    p1_str = ", ".join(f"{u['name']} ({u['score']})" for u in page1)
    print(f"  ✓ Page 1 (take 2): {p1_str}")

    page2 = db.user.find_many(
        order_by=[{"score": "desc"}, {"createdAt": "asc"}],
        skip=2,
        take=2,
    )
    p2_str = ", ".join(f"{u['name']} ({u['score']})" for u in page2)
    print(f"  ✓ Page 2 (skip 2, take 2): {p2_str}\n")

    # ───────────────────────────────────────────────────────────────────────────
    # 6. RELATIONS & DEEP JOINS
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 6. RELATIONS & DEEP JOINS")

    # Add an order for Alice
    db.order.create(
        data={"id": "o_a1", "userId": alice["id"], "total": 500, "status": "paid", "createdAt": _ts(7)}
    )

    # Query Users with eager-loaded Orders and relation _count
    users_with_orders = db.user.find_many(
        where={"email": {"in": ["alice@example.com", "bob@example.com"]}},
        include={
            "orders": {
                "where": {"status": "paid"},
                "orderBy": {"total": "desc"},
            },
            "_count": True,
        },
    )

    for u in users_with_orders:
        orders_list = u.get("orders") or []
        count_val = (u.get("_count") or {}).get("orders", len(orders_list))
        print(f"  ✓ User \"{u['name']}\" has {count_val} total order(s):")
        for o in orders_list:
            print(f"    - Order {o['id']}: total=${o['total']}, status={o['status']}")

    # Reverse relation: query Orders including owner User
    orders_with_user = db.order.find_many(
        where={"total": {"gte": 300}},
        include={"user": True},
        order_by={"total": "desc"},
    )
    print("  ✓ Orders >= $300 including owner:")
    for o in orders_with_user:
        owner = o.get("user") or {}
        print(f"    - Order {o['id']} (${o['total']}) belongs to: {owner.get('name')} ({owner.get('email')})")

    # Relation filter: find users who have at least ONE order >= $400
    users_with_big_orders = db.user.find_many(
        where={"orders": {"some": {"total": {"gte": 400}}}},
    )
    big_user_names = ", ".join(u["name"] or "" for u in users_with_big_orders)
    print(f"  ✓ Relation filter (orders.some.total >= 400): found {big_user_names}\n")

    # ───────────────────────────────────────────────────────────────────────────
    # 7. MUTATIONS: update, Field Math, upsert, and delete
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 7. MUTATIONS: update, Field Math, upsert, and delete")

    # 7.1 Field math: atomic increment
    updated_alice = db.user.update(
        where={"id": alice["id"]},
        data={"score": {"increment": 25}},
    )
    assert updated_alice is not None
    print(f"  ✓ Atomic field increment: Alice score 100 -> {updated_alice['score']}")
    assert updated_alice["score"] == 125, f"Expected 125, got {updated_alice['score']}"

    # 7.2 update_many
    updated_orders = db.order.update_many(
        where={"status": "open"},
        data={"status": "processing"},
    )
    print(f"  ✓ update_many: changed {updated_orders['count']} order(s) from 'open' to 'processing'")

    # 7.3 Upsert
    upsert_new = db.user.upsert(
        where={"email": "fiona@example.com"},
        create={"id": "u_fiona", "email": "fiona@example.com", "name": "Fiona Gallagher", "score": 75, "createdAt": _ts(8)},
        update={"score": 999},
    )
    print(f"  ✓ Upsert (created new): id={upsert_new['id']}, email={upsert_new['email']}")

    upsert_existing = db.user.upsert(
        where={"email": "alice@example.com"},
        create={"email": "alice@example.com", "name": "Alice New", "score": 0},
        update={"score": 150},
    )
    print(f"  ✓ Upsert (updated existing): Alice score updated to {upsert_existing['score']}")
    assert upsert_existing["score"] == 150, f"Expected 150, got {upsert_existing['score']}"

    # Count before delete
    total_before = db.user.count()
    print(f"  ✓ Current total users count: {total_before}")

    # Delete single record
    db.user.delete(where={"id": upsert_new["id"]})
    print(f"  ✓ Deleted user Fiona (id={upsert_new['id']})\n")

    # ───────────────────────────────────────────────────────────────────────────
    # 8. AGGREGATIONS & GROUP BY
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 8. AGGREGATIONS & GROUP BY")

    stats = db.order.aggregate(
        _count=True,
        _sum={"total": True},
        _avg={"total": True},
        _min={"total": True},
        _max={"total": True},
    )
    print("  ✓ Orders Aggregate Statistics:")
    print(f"    Total count: {stats['_count']['_all']}")
    print(f"    Sum total:   ${stats['_sum']['total']}")
    print(f"    Average:     ${float(stats['_avg']['total']):.2f}")
    print(f"    Min / Max:   ${stats['_min']['total']} / ${stats['_max']['total']}")

    # GroupBy status
    grouped = db.order.group_by(
        by="status",
        _count=True,
        _sum={"total": True},
    )
    print("  ✓ GroupBy status:")
    for g in grouped:
        print(f"    - Status '{g['status']}': count={g.get('_count', 1)}, sum=${(g.get('_sum') or {}).get('total', 0)}")
    print()

    # ───────────────────────────────────────────────────────────────────────────
    # 9. ACID TRANSACTIONS
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 9. ACID TRANSACTIONS")

    # 9.1 Successful transaction
    def txn_success(tx):
        tx.user.update(where={"id": alice["id"]}, data={"score": 200})
        tx.order.create(data={"id": "o_tx1", "userId": alice["id"], "total": 999, "status": "vip", "createdAt": _ts(9)})

    db.transaction(txn_success)
    alice_after_tx = db.user.find_unique(where={"id": alice["id"]})
    assert alice_after_tx is not None
    print(f"  ✓ Transaction committed: Alice new score={alice_after_tx['score']}")
    assert alice_after_tx["score"] == 200

    # 9.2 Transaction Rollback on Exception
    def txn_fail(tx):
        tx.user.update(where={"id": alice["id"]}, data={"score": 9999})
        raise RuntimeError("SIMULATED_PAYMENT_FAILURE")

    try:
        db.transaction(txn_fail)
    except RuntimeError as ex:
        print(f"  ✓ Transaction intercepted failure: \"{ex}\" -> rolling back!")

    alice_after_rollback = db.user.find_unique(where={"id": alice["id"]})
    assert alice_after_rollback is not None
    print(f"  ✓ Verified Rollback: Alice score remained {alice_after_rollback['score']} (not 9999)")
    assert alice_after_rollback["score"] == 200
    print()

    # ───────────────────────────────────────────────────────────────────────────
    # 10. SEMANTIC VECTOR SEARCH
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 10. SEMANTIC VECTOR SEARCH")

    vector_matches = db.user.vector_search([0.95, 0.05, 0.0], take=2, vector_field="embedding")
    print("  ✓ Query vector [0.95, 0.05, 0.0] nearest neighbors:")
    for m in vector_matches:
        print(f"    - User \"{m['name']}\" (id: {m['id']}) distance: {round(m['distance'], 4)}")
    assert vector_matches[0]["id"] == alice["id"]
    print()

    # ───────────────────────────────────────────────────────────────────────────
    # 11. RAW SQL ESCAPE HATCH
    # ───────────────────────────────────────────────────────────────────────────
    print("🔹 11. RAW SQL ESCAPE HATCH")

    raw_users = db.query_raw("SELECT id, email, score FROM users WHERE score >= ? ORDER BY score DESC", 150)
    print(f"  ✓ query_raw: retrieved {len(raw_users)} row(s) with score >= 150")

    raw_affected = db.execute_raw("UPDATE users SET isActive = ? WHERE score < ?", 0, 100)
    print(f"  ✓ execute_raw: marked {raw_affected} user(s) as inactive\n")

    # ───────────────────────────────────────────────────────────────────────────
    # CLEANUP & SUMMARY
    # ───────────────────────────────────────────────────────────────────────────
    db.order.delete_many()
    db.user.delete_many()
    final_count = db.user.count()
    print(f"  ✓ Cleanup finished. Final users count: {final_count}")

    print("\n================================================================")
    print("  🎉 ALL AN5 ORM PYTHON QUERY SHOWCASE CHECKS PASSED!            ")
    print("================================================================")


if __name__ == "__main__":
    main()
