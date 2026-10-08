//! AN5 example: generated Rust client against SQLite (sqlx, bundled driver).
//!
//! Everything below goes through the generated typed handles — `db.user()` /
//! `db.order()` — with no hand-written SQL for DML. The only raw SQL is the
//! `CREATE TABLE` bootstrap, because tables come from the schema, not the client.
//!
//! Run (first run downloads crates):
//!   cargo run --manifest-path examples/rust/Cargo.toml
//!   npm run test:rust

use an5_client::{
    An5Client, BoolFilter, IntFilter, OrderCreateInput, OrderWhereInput, SortOrder, StringFilter,
    UserCreateInput, UserFindManyArgs, UserFindUniqueArgs, UserOrderByInput, UserUpdateArgs,
    UserUpdateInput, UserVectorSearchArgs, UserWhereInput,
};
use serde_json::json;

async fn create_tables(db: &An5Client) {
    // Schema bootstrap: an5 pushes this from `schema/*.an5` via `npm run db:push`.
    // SQLite has no schema-qualified names, so point the models at bare tables.
    db.adapter()
        .add_table_override("User", "users");
    db.adapter()
        .add_table_override("Order", "orders");
    db.adapter()
        .execute_raw(
            r#"CREATE TABLE IF NOT EXISTS users (
                 id         TEXT PRIMARY KEY,
                 email      TEXT NOT NULL UNIQUE,
                 name       TEXT NULL,
                 is_active  INTEGER NOT NULL DEFAULT 1,
                 score      INTEGER NOT NULL DEFAULT 0,
                 embedding  BLOB NULL,
                 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
               )"#,
            &[],
        )
        .await
        .expect("create users table");

    db.adapter()
        .execute_raw(
            r#"CREATE TABLE IF NOT EXISTS orders (
                 id         TEXT PRIMARY KEY,
                 user_id    TEXT NOT NULL,
                 total      INTEGER NOT NULL DEFAULT 0,
                 status     TEXT NULL,
                 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
                 FOREIGN KEY (user_id) REFERENCES users(id)
               )"#,
            &[],
        )
        .await
        .expect("create orders table");
}

#[tokio::main]
async fn main() {
    // The app chooses its driver; the generated client stays dialect-agnostic.
    sqlx::any::install_drivers(&[sqlx::sqlite::any::DRIVER]).expect("install sqlite driver");

    let db_path = std::env::temp_dir().join("an5-rust-example.sqlite");
    let _ = std::fs::remove_file(&db_path);
    let url = format!("sqlite:{}?mode=rwc", db_path.display());

    let db = An5Client::connect(&url).await.expect("connect");
    create_tables(&db).await;

    let users = db.user();
    let orders = db.order();

    // ── Create ───────────────────────────────────────────────────────────────
    let alice = users
        .create(&UserCreateInput {
            email: "alice@example.com".to_string(),
            name: Some("Alice".to_string()),
            is_active: Some(true),
            score: Some(123),
            embedding: Some(vec![1.0, 0.0, 0.0]),
            created_at: None,
        })
        .await
        .expect("create alice");
    println!("created user {:?}", alice.id);

    let bob = users
        .create(&UserCreateInput {
            email: "bob@example.com".to_string(),
            name: Some("Bob".to_string()),
            is_active: Some(true),
            score: Some(7),
            embedding: Some(vec![0.0, 1.0, 0.0]),
            created_at: None,
        })
        .await
        .expect("create bob");

    orders
        .create(&OrderCreateInput {
            user_id: alice.id.clone().unwrap_or_default(),
            total: Some(250),
            status: Some("open".to_string()),
            created_at: None,
        })
        .await
        .expect("create order 1");
    orders
        .create(&OrderCreateInput {
            user_id: alice.id.clone().unwrap_or_default(),
            total: Some(75),
            status: Some("paid".to_string()),
            created_at: None,
        })
        .await
        .expect("create order 2");

    // ── Read: typed string filter + orderBy + take ───────────────────────────
    let found = users
        .find_many(&UserFindManyArgs {
            where_: Some(UserWhereInput {
                email: Some(StringFilter {
                    contains: Some("alice".to_string()),
                    ..Default::default()
                }),
                ..Default::default()
            }),
            order_by: Some(UserOrderByInput {
                score: Some(SortOrder::Desc),
                ..Default::default()
            }),
            take: Some(10),
            ..Default::default()
        })
        .await
        .expect("find_many users");
    println!("users matching 'alice': {}", found.len());
    assert_eq!(found.len(), 1);
    assert_eq!(found[0].email, "alice@example.com");

    // ── Read: typed int filter ───────────────────────────────────────────────
    let high_score = users
        .find_many(&UserFindManyArgs {
            where_: Some(UserWhereInput {
                score: Some(IntFilter {
                    gte: Some(100),
                    ..Default::default()
                }),
                ..Default::default()
            }),
            ..Default::default()
        })
        .await
        .expect("find_many by score");
    println!("users with score >= 100: {}", high_score.len());
    assert_eq!(high_score.len(), 1);

    // ── Read: bool filter + nested AND/OR ────────────────────────────────────
    let active = users
        .find_many(&UserFindManyArgs {
            where_: Some(UserWhereInput {
                and: Some(vec![
                    UserWhereInput {
                        is_active: Some(BoolFilter {
                            equals: Some(true),
                        }),
                        ..Default::default()
                    },
                    UserWhereInput {
                        or: Some(vec![
                            UserWhereInput {
                                name: Some(StringFilter {
                                    equals: Some("Alice".to_string()),
                                    ..Default::default()
                                }),
                                ..Default::default()
                            },
                            UserWhereInput {
                                name: Some(StringFilter {
                                    equals: Some("Bob".to_string()),
                                    ..Default::default()
                                }),
                                ..Default::default()
                            },
                        ]),
                        ..Default::default()
                    },
                ]),
                ..Default::default()
            }),
            ..Default::default()
        })
        .await
        .expect("find_many compound");
    println!("active users (Alice OR Bob): {}", active.len());
    assert_eq!(active.len(), 2);

    // ── Read: relation filter on the child side ──────────────────────────────
    let alice_orders = orders
        .find_many(&an5_client::OrderFindManyArgs {
            where_: Some(OrderWhereInput {
                user_id: Some(StringFilter {
                    equals: alice.id.clone(),
                    ..Default::default()
                }),
                ..Default::default()
            }),
            order_by: Some(an5_client::OrderOrderByInput {
                total: Some(SortOrder::Desc),
                ..Default::default()
            }),
            ..Default::default()
        })
        .await
        .expect("find_many orders");
    println!("alice orders: {}", alice_orders.len());
    assert_eq!(alice_orders.len(), 2);

    // ── Count ────────────────────────────────────────────────────────────────
    let total_users = users
        .count(&UserFindUniqueArgs::default())
        .await
        .expect("count users");
    println!("users before cleanup: {total_users}");
    assert_eq!(total_users, 2);

    // ── Update ───────────────────────────────────────────────────────────────
    let updated = users
        .update(&UserUpdateArgs {
            where_: Some(UserWhereInput {
                id: Some(StringFilter {
                    equals: bob.id.clone(),
                    ..Default::default()
                }),
                ..Default::default()
            }),
            data: UserUpdateInput {
                name: Some("Bobby".to_string()),
                score: Some(50),
                ..Default::default()
            },
        })
        .await
        .expect("update bob");
    println!("rows updated: {updated}");
    assert_eq!(updated, 1);

    let bob_after = users
        .find_first(&an5_client::UserFindFirstArgs {
            where_: Some(UserWhereInput {
                email: Some(StringFilter {
                    equals: Some("bob@example.com".to_string()),
                    ..Default::default()
                }),
                ..Default::default()
            }),
            ..Default::default()
        })
        .await
        .expect("find_first bob")
        .expect("bob exists");
    assert_eq!(bob_after.name.as_deref(), Some("Bobby"));
    assert_eq!(bob_after.score, Some(50));

    // ── Vector search ────────────────────────────────────────────────────────
    // The generated client returns `(User, f64)` tuples, so the distance is typed
    // rather than hidden in a `JSONObject`.
    let ranked = users
        .vector_search(&UserVectorSearchArgs {
            vector: vec![1.0, 0.0, 0.0],
            take: Some(2),
            where_: None,
            vector_field: "embedding".to_string(),
            distance_metric: "cosine".to_string(),
        })
        .await
        .expect("vector search");
    assert_eq!(ranked.len(), 2, "both users carry an embedding");
    assert_eq!(
        ranked[0].0.id, alice.id,
        "the user whose embedding matches the query ranks first"
    );
    assert!(ranked[0].1 < 1e-6, "an identical vector has distance 0");
    println!("vector search: {:?} at distance {}", ranked[0].0.name, ranked[0].1);

    // ── Delete ───────────────────────────────────────────────────────────────
    let deleted_orders = orders
        .delete(&an5_client::OrderFindUniqueArgs::default())
        .await
        .expect("delete orders");
    let deleted_users = users
        .delete(&UserFindUniqueArgs {
            where_: Some(UserWhereInput {
                email: Some(StringFilter {
                    contains: Some("example.com".to_string()),
                    ..Default::default()
                }),
                ..Default::default()
            }),
        })
        .await
        .expect("delete users");
    println!("deleted: {deleted_users} users");
    assert_eq!(deleted_users, 2);

    let remaining = users
        .count(&UserFindUniqueArgs::default())
        .await
        .expect("count users after cleanup");
    println!("users after cleanup: {remaining}");
    assert_eq!(remaining, 0);
    let _ = deleted_orders;

    // Vector helpers ship with the client and are handy for embeddings.
    let similarity = an5_client::cosine_similarity(&[1.0, 0.0, 0.0], &[1.0, 0.0, 0.0]);
    println!("cosine similarity of identical vectors: {similarity:.1}");
    assert!((similarity - 1.0).abs() < 1e-9);

    // Escape hatch: raw SQL through the same adapter.
    let rows = db
        .adapter()
        .query_raw("SELECT 1 AS one", &[json!(1)])
        .await
        .expect("raw query");
    assert_eq!(rows.len(), 1);

    db.adapter().disconnect().await.expect("disconnect");
    let _ = std::fs::remove_file(&db_path);
    println!("an5example Rust CRUD example passed");
}
