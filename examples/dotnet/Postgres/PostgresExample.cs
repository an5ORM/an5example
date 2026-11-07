// AN5 .NET Example: PostgreSQL Provider
using System;
using Npgsql;
using An5Orm;
using An5Orm.Entities;

namespace An5Example.Providers;

public static class PostgresExample
{
    public static void Run()
    {
        var cs = Environment.GetEnvironmentVariable("POSTGRES_URL")
                 ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                 ?? "Host=localhost;Database=an5_example;Username=postgres;Password=postgres;Timeout=3;";

        Console.WriteLine("--- [.NET / PostgreSQL Provider] Starting example ---");

        // 1. Probe server
        try
        {
            using var probe = new NpgsqlConnection(cs);
            probe.Open();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[.NET/Postgres] SKIPPED: Server not reachable at {cs}.\n" +
                              $"  Reason: {ex.Message.Split('\n')[0]}\n" +
                              "  To run live: set POSTGRES_URL=Host=localhost;Database=mydb;Username=u;Password=p;");
            Console.WriteLine("--- [.NET / PostgreSQL Provider] Completed (offline safe) ---\n");
            return;
        }

        try
        {
            // 2. Setup schema
            using (var conn = new NpgsqlConnection(cs))
            {
                conn.Open();
                using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
                    DROP TABLE IF EXISTS orders;
                    DROP TABLE IF EXISTS users;
                    CREATE TABLE users (
                        id        TEXT PRIMARY KEY,
                        email     TEXT NOT NULL UNIQUE,
                        name      TEXT NULL,
                        ""isActive"" BOOLEAN NOT NULL DEFAULT TRUE,
                        score     INTEGER NOT NULL DEFAULT 0,
                        ""createdAt"" TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    );
                    CREATE TABLE orders (
                        id        TEXT PRIMARY KEY,
                        ""userId""  TEXT NOT NULL,
                        total     INTEGER NOT NULL DEFAULT 0,
                        status    TEXT NULL,
                        ""createdAt"" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        CONSTRAINT fk_orders_user FOREIGN KEY (""userId"") REFERENCES users(id)
                    );
                ";
                cmd.ExecuteNonQuery();
            }

            var db = new An5DbContext(cs);

            // 3. Create records
            var bob = new User
            {
                Id = "u_pg_1",
                Email = "bob.pg@example.com",
                Name = "Bob .NET Postgres",
                Score = 200,
                CreatedAt = DateTime.UtcNow,
                Orders = null,
            };
            db.User.Create(bob);
            Console.WriteLine($"[.NET/Postgres] Created user: id={bob.Id}, email={bob.Email}");

            var order = new Order
            {
                Id = "o_pg_1",
                UserId = bob.Id,
                Total = 300,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };
            db.Order.Create(order);
            Console.WriteLine($"[.NET/Postgres] Created order: id={order.Id}");

            // 4. Query
            var users = db.User.FindMany("email LIKE '%pg%'");
            Console.WriteLine($"[.NET/Postgres] Found {users.Count} user(s).");

            // 5. Cleanup
            db.Order.DeleteMany("userId = @userId", new System.Collections.Generic.Dictionary<string, object> { { "@userId", bob.Id } });
            db.User.DeleteMany("id = @id", new System.Collections.Generic.Dictionary<string, object> { { "@id", bob.Id } });
            Console.WriteLine("[.NET/Postgres] Cleanup completed.");
            Console.WriteLine("--- [.NET / PostgreSQL Provider] Finished successfully ---\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[.NET/Postgres] Error: {ex.Message}");
        }
    }
}
