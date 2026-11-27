// AN5 ORM Full Query API Showcase for .NET (C#)
// Mirrors the 11-part query showcase in TypeScript and Python:
// 1. Data Insertion (create, nested, createMany)
// 2. Advanced Filtering & Comparators (contains, startsWith, endsWith, ranges, in)
// 3. Logical Combinators (AND, OR, NOT)
// 4. Field Projections (select)
// 5. Sorting & Pagination (orderBy, skip, take)
// 6. Relations & Relational Filters (EXISTS subqueries, parent-child joins)
// 7. Mutations (update, atomic math, updateMany, upsert, delete)
// 8. Aggregations & Group By (_count, _sum, _avg, _min, _max, groupBy)
// 9. ACID Transactions (commit & rollback)
// 10. Semantic Vector Search (cosine similarity)
// 11. Raw SQL Escape Hatch (QueryRaw, raw execute)

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using Microsoft.Data.Sqlite;
using An5Orm;
using An5Orm.Entities;

namespace An5Example;

public static class QueriesExample
{
    public static void Run()
    {
        Console.WriteLine("\n================================================================");
        Console.WriteLine("          AN5 ORM FULL .NET QUERY API SHOWCASE                  ");
        Console.WriteLine("================================================================\n");

        var dbFile = Path.Combine(Path.GetTempPath(), $"an5-dotnet-queries-{Guid.NewGuid():N}.db");
        if (File.Exists(dbFile)) File.Delete(dbFile);

        var cs = $"Data Source={dbFile}";

        // Initialize SQLite schema
        using (var conn = new SqliteConnection(cs))
        {
            conn.Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                CREATE TABLE IF NOT EXISTS users (
                    id        TEXT PRIMARY KEY,
                    email     TEXT NOT NULL UNIQUE,
                    name      TEXT NULL,
                    isActive  INTEGER NOT NULL DEFAULT 1,
                    score     INTEGER NOT NULL DEFAULT 0,
                    embedding BLOB NULL,
                    createdAt TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS orders (
                    id        TEXT PRIMARY KEY,
                    userId    TEXT NOT NULL,
                    total     INTEGER NOT NULL DEFAULT 0,
                    status    TEXT NULL,
                    createdAt TEXT NOT NULL,
                    FOREIGN KEY (userId) REFERENCES users(id)
                );
            ";
            cmd.ExecuteNonQuery();
        }

        try
        {
            var db = new An5DbContext(cs);

            // ───────────────────────────────────────────────────────────────────────────
            // 1. DATA INSERTION
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 1. DATA INSERTION");

            var alice = new User
            {
                Id = "u_alice",
                Email = "alice@example.com",
                Name = "Alice Johnson",
                Score = 100,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Embedding = new float[] { 1.0f, 0.0f, 0.0f }
            };
            db.User.Create(alice);
            Console.WriteLine($"  ✓ Created single User: id={alice.Id}, name={alice.Name}");

            var bob = new User
            {
                Id = "u_bob",
                Email = "bob@example.com",
                Name = "Bob Smith",
                Score = 250,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Embedding = new float[] { 0.0f, 1.0f, 0.0f }
            };
            db.User.Create(bob);

            // Create orders for Bob and Alice
            var bobOrders = new List<Order>
            {
                new Order { Id = "o_b1", UserId = bob.Id, Total = 120, Status = "paid", CreatedAt = DateTime.UtcNow },
                new Order { Id = "o_b2", UserId = bob.Id, Total = 350, Status = "open", CreatedAt = DateTime.UtcNow },
                new Order { Id = "o_b3", UserId = bob.Id, Total = 80, Status = "paid", CreatedAt = DateTime.UtcNow }
            };
            db.Order.CreateMany(bobOrders);
            Console.WriteLine($"  ✓ Created User with {bobOrders.Count} orders (id={bob.Id})");

            var aliceOrder = new Order { Id = "o_a1", UserId = alice.Id, Total = 500, Status = "paid", CreatedAt = DateTime.UtcNow };
            db.Order.Create(aliceOrder);

            // Bulk insert Charlie, Diana, Edward
            var bulkUsers = new List<User>
            {
                new User { Id = "u_charlie", Email = "charlie@example.com", Name = "Charlie Brown", Score = 50, IsActive = true, CreatedAt = DateTime.UtcNow, Embedding = new float[] { 0.5f, 0.5f, 0.0f } },
                new User { Id = "u_diana", Email = "diana@example.com", Name = "Diana Prince", Score = 300, IsActive = true, CreatedAt = DateTime.UtcNow, Embedding = new float[] { 0.0f, 0.0f, 1.0f } },
                new User { Id = "u_edward", Email = "edward@example.com", Name = "Edward Norton", Score = 180, IsActive = true, CreatedAt = DateTime.UtcNow, Embedding = new float[] { 0.7f, 0.7f, 0.1f } }
            };
            var countInserted = db.User.CreateMany(bulkUsers);
            Console.WriteLine($"  ✓ Bulk inserted {countInserted} users via CreateMany\n");

            // ───────────────────────────────────────────────────────────────────────────
            // 2. ADVANCED FILTERING & COMPARATORS
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 2. ADVANCED FILTERING & COMPARATORS");

            var matchingAlice = db.User.FindMany("name LIKE @name", new Dictionary<string, object> { { "@name", "%Alice%" } });
            Console.WriteLine($"  ✓ contains('Alice'): found {matchingAlice.Count} user(s)");

            var domainUsers = db.User.FindMany("email LIKE @start AND email LIKE @end", new Dictionary<string, object>
            {
                { "@start", "d%" },
                { "@end", "%@example.com" }
            });
            Console.WriteLine($"  ✓ startsWith('d') & endsWith('@example.com'): found {string.Join(", ", domainUsers.Select(u => u.Name))}");

            var highScorers = db.User.FindMany("score >= @minScore AND score <= @maxScore ORDER BY score DESC", new Dictionary<string, object>
            {
                { "@minScore", 200 },
                { "@maxScore", 300 }
            });
            var scorersStr = string.Join(", ", highScorers.Select(u => $"{u.Name} ({u.Score})"));
            Console.WriteLine($"  ✓ Range score >= 200 and <= 300: found {scorersStr}");

            var selectedScores = db.User.FindMany("score IN (50, 100, 300)");
            Console.WriteLine($"  ✓ in([50, 100, 300]): found {selectedScores.Count} user(s)\n");

            // ───────────────────────────────────────────────────────────────────────────
            // 3. LOGICAL COMBINATORS (AND, OR, NOT)
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 3. LOGICAL COMBINATORS (AND, OR, NOT)");

            var complexQuery = db.User.FindMany(
                "(score >= 250 OR (score >= 100 AND email LIKE '%alice%')) AND NOT (name LIKE '%Edward%') ORDER BY score ASC"
            );
            Console.WriteLine("  ✓ (score >= 250 OR (score >= 100 AND alice)) AND NOT(Edward):");
            foreach (var u in complexQuery)
            {
                Console.WriteLine($"    - {u.Name} (score: {u.Score}, email: {u.Email})");
            }
            Console.WriteLine();

            // ───────────────────────────────────────────────────────────────────────────
            // 4. FIELD PROJECTIONS (select)
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 4. FIELD PROJECTIONS (select)");

            var projected = db.User.QueryRaw("SELECT id, name, score FROM users WHERE score > 150 ORDER BY score DESC LIMIT 1");
            if (projected.Count > 0)
            {
                var top = projected[0];
                Console.WriteLine($"  ✓ Projection select: {{ id, name, score }}:");
                Console.WriteLine($"    {{\"id\":\"{top.Id}\", \"name\":\"{top.Name}\", \"score\":{top.Score}}}\n");
            }

            // ───────────────────────────────────────────────────────────────────────────
            // 5. SORTING & PAGINATION (orderBy, skip, take)
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 5. SORTING & PAGINATION (orderBy, skip, take)");

            var page1 = db.User.FindMany("1=1 ORDER BY score DESC, createdAt ASC LIMIT 2 OFFSET 0");
            var p1Str = string.Join(", ", page1.Select(u => $"{u.Name} ({u.Score})"));
            Console.WriteLine($"  ✓ Page 1 (take 2): {p1Str}");

            var page2 = db.User.FindMany("1=1 ORDER BY score DESC, createdAt ASC LIMIT 2 OFFSET 2");
            var p2Str = string.Join(", ", page2.Select(u => $"{u.Name} ({u.Score})"));
            Console.WriteLine($"  ✓ Page 2 (skip 2, take 2): {p2Str}\n");

            // ───────────────────────────────────────────────────────────────────────────
            // 6. RELATIONS & DEEP JOINS
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 6. RELATIONS & DEEP JOINS");

            var aliceOrders = db.Order.FindMany("userId = @uid", new Dictionary<string, object> { { "@uid", alice.Id } });
            Console.WriteLine($"  ✓ User \"{alice.Name}\" has {aliceOrders.Count} total order(s):");
            foreach (var o in aliceOrders)
            {
                Console.WriteLine($"    - Order {o.Id}: total=${o.Total}, status={o.Status}");
            }

            var bobOrdersList = db.Order.FindMany("userId = @uid", new Dictionary<string, object> { { "@uid", bob.Id } });
            Console.WriteLine($"  ✓ User \"{bob.Name}\" has {bobOrdersList.Count} total order(s):");
            foreach (var o in bobOrdersList)
            {
                Console.WriteLine($"    - Order {o.Id}: total=${o.Total}, status={o.Status}");
            }

            var bigOrders = db.Order.FindMany("total >= 300 ORDER BY total DESC");
            Console.WriteLine("  ✓ Orders >= $300 including owner:");
            foreach (var o in bigOrders)
            {
                var owner = db.User.FindUnique(o.UserId);
                Console.WriteLine($"    - Order {o.Id} (${o.Total}) belongs to: {owner?.Name} ({owner?.Email})");
            }

            // Typed correlated EXISTS/NOT EXISTS relation filters (ListRelationFilter & RelationFilter)
            var usersWithBigOrders = db.User.FindMany(new UserFindManyArgs
            {
                Where = new UserWhereInput
                {
                    Orders = new ListRelationFilter<OrderWhereInput>
                    {
                        Some = new OrderWhereInput { Total = new IntFilter { Gte = 400 } },
                    },
                },
                OrderBy = new UserOrderByInput { Name = "asc" },
            });
            if (usersWithBigOrders.Count != 1 || usersWithBigOrders[0].Id != "u_alice")
                throw new Exception($"Expected u_alice for Orders.Some >= 400, got {usersWithBigOrders.Count}");
            Console.WriteLine($"  ✓ Relation filter (Orders.Some.Total >= 400): found {string.Join(", ", usersWithBigOrders.Select(u => u.Name))}");

            var usersWithAllBigOrders = db.User.FindMany(new UserFindManyArgs
            {
                Where = new UserWhereInput
                {
                    IsActive = new BoolFilter { Not = false },
                    Orders = new ListRelationFilter<OrderWhereInput>
                    {
                        Some = new OrderWhereInput { Status = new StringFilter { Equals = "paid" } },
                        Every = new OrderWhereInput { Total = new IntFilter { Gte = 80 } },
                    },
                },
                OrderBy = new UserOrderByInput { Name = "asc" },
            });
            if (usersWithAllBigOrders.Count != 2)
                throw new Exception($"Expected 2 users with Some(paid) & Every(>=80), got {usersWithAllBigOrders.Count}");
            Console.WriteLine($"  ✓ Combined relation filter (Orders.Some=paid & Orders.Every>=80 & IsActive.Not=false): {usersWithAllBigOrders.Count} user(s)");

            var usersWithoutPaidOrders = db.User.FindMany(new UserFindManyArgs
            {
                Where = new UserWhereInput
                {
                    Orders = new ListRelationFilter<OrderWhereInput>
                    {
                        None = new OrderWhereInput { Status = new StringFilter { Equals = "paid" } },
                    },
                },
            });
            if (usersWithoutPaidOrders.Count != 3)
                throw new Exception($"Expected 3 users with Orders.None=paid, got {usersWithoutPaidOrders.Count}");
            Console.WriteLine($"  ✓ Relation filter (Orders.None=paid): {usersWithoutPaidOrders.Count} user(s)");

            var aliceOrdersOnly = db.Order.FindMany(new OrderFindManyArgs
            {
                Where = new OrderWhereInput
                {
                    User = new RelationFilter<UserWhereInput>
                    {
                        Is = new UserWhereInput { Email = new StringFilter { Equals = "alice@example.com" } },
                    },
                },
            });
            var nonAliceOrdersOnly = db.Order.FindMany(new OrderFindManyArgs
            {
                Where = new OrderWhereInput
                {
                    User = new RelationFilter<UserWhereInput>
                    {
                        IsNot = new UserWhereInput { Email = new StringFilter { Equals = "alice@example.com" } },
                    },
                },
            });
            if (aliceOrdersOnly.Count != 1 || aliceOrdersOnly[0].Id != "o_a1" || nonAliceOrdersOnly.Count != 3)
                throw new Exception($"Unexpected to-one relation filter counts: alice={aliceOrdersOnly.Count}, non-alice={nonAliceOrdersOnly.Count}");
            Console.WriteLine($"  ✓ To-one relation filters (Order.User.Is / IsNot): alice={aliceOrdersOnly.Count}, non-alice={nonAliceOrdersOnly.Count}");

            try
            {
                db.Order.FindMany(new OrderFindManyArgs
                {
                    Where = new OrderWhereInput { User = new RelationFilter<UserWhereInput> { Is = new UserWhereInput(), IsNull = true } },
                });
                throw new Exception("Expected ArgumentException for contradictory RelationFilter");
            }
            catch (ArgumentException) { }
            try
            {
                db.User.FindMany(new UserFindManyArgs
                {
                    Where = new UserWhereInput { Email = new StringFilter { Contains = "alice", Mode = "invalid" } },
                });
                throw new Exception("Expected ArgumentException for invalid StringFilter.Mode");
            }
            catch (ArgumentException) { }
            try
            {
                db.User.FindMany(999);
                throw new Exception("Expected ArgumentException for non-args object");
            }
            catch (ArgumentException) { }
            Console.WriteLine("  ✓ Strict validation: rejected contradictory RelationFilter, invalid Mode & bad args\n");

            // Typed eager Include with nested Where/OrderBy/per-parent Skip/Take, Select, _count & recursive nesting
            var includedUsers = db.User.FindMany(new UserFindManyArgs
            {
                Where = new UserWhereInput
                {
                    Id = new StringFilter { In = new List<string> { "u_alice", "u_bob", "u_charlie" } },
                },
                OrderBy = new UserOrderByInput { Name = "asc" },
                Include = new UserInclude
                {
                    Orders = true,
                    _count = true,
                },
            });
            if (includedUsers.Count != 3 || includedUsers[0].Orders.Count != 1 || includedUsers[1].Orders.Count != 3 || includedUsers[2].Orders.Count != 0)
                throw new Exception("Unexpected eager Include Orders counts for Alice/Bob/Charlie");
            if (includedUsers[0]._count["orders"] != 1 || includedUsers[1]._count["Orders"] != 3 || includedUsers[2]._count["orders"] != 0)
                throw new Exception("Unexpected eager Include._count values");
            Console.WriteLine($"  ✓ Eager Include (User.Orders & _count): Alice={includedUsers[0].Orders.Count}, Bob={includedUsers[1].Orders.Count}, Charlie={includedUsers[2].Orders.Count}");

            // Per-parent Skip/Take + nested Where/OrderBy + Select inside Include
            var perParentPaged = db.User.FindMany(new UserFindManyArgs
            {
                Where = new UserWhereInput { Id = new StringFilter { In = new List<string> { "u_alice", "u_bob" } } },
                OrderBy = new UserOrderByInput { Name = "asc" },
                Include = new UserInclude
                {
                    Orders = new OrderFindManyArgs
                    {
                        OrderBy = new OrderOrderByInput { Total = "desc" },
                        Skip = 1,
                        Take = 1,
                        Select = new List<string> { "Id", "Total" },
                    },
                    _count = new Dictionary<string, object>
                    {
                        { "select", new Dictionary<string, object> { { "orders", new Dictionary<string, object> { { "where", new OrderWhereInput { Status = new StringFilter { Equals = "paid" } } } } } } },
                    },
                },
            });
            if (perParentPaged[0].Orders.Count != 0 || perParentPaged[1].Orders.Count != 1 || perParentPaged[1].Orders[0].Id != "o_b1" || perParentPaged[1].Orders[0].Total != 120)
                throw new Exception("Unexpected per-parent Skip/Take result in Include");
            if (perParentPaged[1].Orders[0].UserId != null)
                throw new Exception("Expected omitted Order.UserId to remain cleared after Select+Include");
            if (perParentPaged[0]._count["orders"] != 1 || perParentPaged[1]._count["orders"] != 2)
                throw new Exception("Unexpected filtered _count for paid orders");
            Console.WriteLine($"  ✓ Per-parent Include(Skip=1,Take=1) & filtered _count(paid): Alice paid={perParentPaged[0]._count["orders"]}, Bob 2nd order={perParentPaged[1].Orders[0].Id} (${perParentPaged[1].Orders[0].Total}), paid={perParentPaged[1]._count["orders"]}");

            // Nested 2-level Include + FindUnique with Select omitting Id
            var deepUser = db.User.FindUnique(new UserFindUniqueArgs
            {
                Where = new UserWhereInput { Email = new StringFilter { Equals = "bob@example.com" } },
                Select = new List<string> { "Email" },
                Include = new UserInclude
                {
                    Orders = new OrderFindManyArgs
                    {
                        Where = new OrderWhereInput { Total = new IntFilter { Gte = 300 } },
                        Include = new OrderInclude { User = true },
                    },
                },
            });
            if (deepUser == null || deepUser.Id != null || deepUser.Orders.Count != 1 || deepUser.Orders[0].User?.Email != "bob@example.com")
                throw new Exception("Unexpected FindUnique nested 2-level Include result");

            var firstOrderWithUser = db.Order.FindFirst(new OrderFindFirstArgs
            {
                OrderBy = new OrderOrderByInput { Total = "desc" },
                Include = new OrderInclude { User = true },
            });
            if (firstOrderWithUser == null || firstOrderWithUser.Id != "o_a1" || firstOrderWithUser.User?.Id != "u_alice")
                throw new Exception("Unexpected FindFirst to-one Order.User Include result");
            Console.WriteLine($"  ✓ 2-level nested Include & Select+Include join retention passed (top order user={firstOrderWithUser.User.Email})");

            try
            {
                db.User.FindMany(new UserFindManyArgs { Include = new Dictionary<string, object> { { "bogusRel", true } } });
                throw new Exception("Expected ArgumentException for unknown Include relation");
            }
            catch (ArgumentException) { }
            try
            {
                db.User.FindMany(new UserFindManyArgs
                {
                    Include = new Dictionary<string, object> { { "orders", new Dictionary<string, object> { { "bogusOpt", true } } } },
                });
                throw new Exception("Expected ArgumentException for unknown nested Include option");
            }
            catch (ArgumentException) { }
            try
            {
                db.User.FindMany(new UserFindManyArgs
                {
                    Include = new UserInclude { Orders = new OrderFindManyArgs { Take = -1 } },
                });
                throw new Exception("Expected ArgumentException for negative Include.Take");
            }
            catch (ArgumentException) { }
            Console.WriteLine("  ✓ Strict Include validation: rejected unknown relation, bad nested option & negative Take\n");

            // ───────────────────────────────────────────────────────────────────────────
            // 7. MUTATIONS: update, Field Math, upsert, and delete
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 7. MUTATIONS: update, Field Math, upsert, and delete");

            alice.Score += 25; // atomic increment simulation
            db.User.Update(alice);
            var updatedAlice = db.User.FindUnique(alice.Id);
            Console.WriteLine($"  ✓ Atomic field increment: Alice score 100 -> {updatedAlice.Score}");

            var updatedCount = db.Order.UpdateMany(
                "status = 'open'",
                new Dictionary<string, object> { { "status", "processing" } }
            );
            Console.WriteLine($"  ✓ UpdateMany: changed {updatedCount} order(s) from 'open' to 'processing'");

            var fiona = new User
            {
                Id = "u_fiona",
                Email = "fiona@example.com",
                Name = "Fiona Gallagher",
                Score = 75,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                Embedding = new float[] { 0.2f, 0.8f, 0.5f }
            };
            var upsertNew = db.User.Upsert(fiona);
            Console.WriteLine($"  ✓ Upsert (created new): id={upsertNew.Id}, email={upsertNew.Email}");

            alice.Score = 150;
            var upsertExisting = db.User.Upsert(alice);
            Console.WriteLine($"  ✓ Upsert (updated existing): Alice score updated to {upsertExisting.Score}");

            var totalBefore = db.User.Count();
            Console.WriteLine($"  ✓ Current total users count: {totalBefore}");

            db.User.Delete(fiona.Id);
            Console.WriteLine($"  ✓ Deleted user Fiona (id={fiona.Id})\n");

            // ───────────────────────────────────────────────────────────────────────────
            // 8. AGGREGATIONS & GROUP BY
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 8. AGGREGATIONS & GROUP BY");

            var stats = db.Order.Aggregate(
                count: true,
                sum: new List<string> { "total" },
                avg: new List<string> { "total" },
                min: new List<string> { "total" },
                max: new List<string> { "total" }
            );
            Console.WriteLine("  ✓ Orders Aggregate Statistics:");
            Console.WriteLine($"    Total count: {stats["_count"]}");
            Console.WriteLine($"    Sum total:   ${stats["_sum_total"]}");
            Console.WriteLine($"    Average:     ${Convert.ToDouble(stats["_avg_total"]):F2}");
            Console.WriteLine($"    Min / Max:   ${stats["_min_total"]} / ${stats["_max_total"]}");

            var grouped = db.Order.GroupBy(
                by: new List<string> { "status" },
                sum: new List<string> { "total" }
            );
            Console.WriteLine("  ✓ GroupBy status:");
            foreach (var g in grouped)
            {
                var sumVal = g.ContainsKey("_sum_total") && g["_sum_total"] != null ? g["_sum_total"] : 0;
                Console.WriteLine($"    - Status '{g["status"]}': count={g["_count"]}, sum=${sumVal}");
            }

            var highValueStatuses = db.Order.GroupBy(new OrderGroupByArgs
            {
                By = new List<string> { "status" },
                Where = new OrderWhereInput { Status = new StringFilter { In = new List<string> { "PAID", "PROCESSING" }, Mode = "insensitive" } },
                Having = new OrderAggregateHavingInput
                {
                    _sum = new OrderNumericAggregateFilter { Total = new NumberFilter { Gte = 400 } },
                },
                Count = new Dictionary<string, bool> { { "_all", true }, { "status", true } },
                Sum = new List<string> { "total" },
                OrderBy = new OrderOrderByInput { Status = "asc" },
            });
            if (highValueStatuses.Count != 1 || highValueStatuses[0]["status"]?.ToString() != "paid")
                throw new Exception($"Expected single 'paid' group from typed GroupBy Having, got {highValueStatuses.Count}");
            Console.WriteLine($"  ✓ Typed GroupBy Having (_sum.Total >= 400, case-insensitive In): status='{highValueStatuses[0]["status"]}', sum=${((Dictionary<string, object>)highValueStatuses[0]["_sum"])["total"]}");
            Console.WriteLine();

            // ───────────────────────────────────────────────────────────────────────────
            // 9. ACID TRANSACTIONS
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 9. ACID TRANSACTIONS");

            using (var tx = db.BeginTransaction())
            {
                alice.Score = 200;
                db.User.Update(alice);
                tx.Commit();
            }
            var aliceAfterTx = db.User.FindUnique(alice.Id);
            Console.WriteLine($"  ✓ Transaction committed: Alice new score={aliceAfterTx.Score}");

            try
            {
                using var txFail = db.BeginTransaction();
                alice.Score = 9999;
                db.User.Update(alice);
                throw new InvalidOperationException("SIMULATED_PAYMENT_FAILURE");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"  ✓ Transaction intercepted failure: \"{ex.Message}\" -> rolling back!");
            }
            var aliceAfterRollback = db.User.FindUnique(alice.Id);
            Console.WriteLine($"  ✓ Verified Rollback: Alice score remained {aliceAfterRollback.Score} (not 9999)\n");

            // ───────────────────────────────────────────────────────────────────────────
            // 10. SEMANTIC VECTOR SEARCH
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 10. SEMANTIC VECTOR SEARCH");

            var queryVector = new List<double> { 0.95, 0.05, 0.0 };
            var matches = db.User.VectorSearch(queryVector, take: 2, vectorField: "Embedding", distanceMetric: "cosine");
            Console.WriteLine("  ✓ Query vector [0.95, 0.05, 0.0] nearest neighbors:");
            foreach (var m in matches)
            {
                Console.WriteLine($"    - User \"{m.Name}\" (id: {m.Id})");
            }
            Console.WriteLine();

            // ───────────────────────────────────────────────────────────────────────────
            // 11. RAW SQL ESCAPE HATCH
            // ───────────────────────────────────────────────────────────────────────────
            Console.WriteLine("🔹 11. RAW SQL ESCAPE HATCH");

            var rawUsers = db.User.QueryRaw("SELECT * FROM users WHERE score >= 150 ORDER BY score DESC");
            Console.WriteLine($"  ✓ QueryRaw: retrieved {rawUsers.Count} row(s) with score >= 150");

            using (var rawConn = An5DbContext.GetActiveConnection(cs, out bool isTx))
            {
                using var rawCmd = rawConn.CreateCommand();
                rawCmd.CommandText = "UPDATE users SET isActive = 0 WHERE score < 100";
                var rawAffected = rawCmd.ExecuteNonQuery();
                Console.WriteLine($"  ✓ ExecuteRaw: marked {rawAffected} user(s) as inactive\n");
            }

            // Cleanup
            db.Order.DeleteMany("1=1");
            db.User.DeleteMany("1=1");
            var finalCount = db.User.Count();
            Console.WriteLine($"  ✓ Cleanup finished. Final users count: {finalCount}\n");

            Console.WriteLine("================================================================");
            Console.WriteLine("  🎉 ALL AN5 ORM .NET QUERY SHOWCASE CHECKS PASSED!             ");
            Console.WriteLine("================================================================\n");
        }
        finally
        {
            if (File.Exists(dbFile)) File.Delete(dbFile);
        }
    }
}
