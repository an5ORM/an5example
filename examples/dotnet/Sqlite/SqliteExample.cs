// AN5 .NET Example: SQLite Provider
using System;
using System.IO;
using Microsoft.Data.Sqlite;
using An5Orm;
using An5Orm.Entities;

namespace An5Example.Providers;

public static class SqliteExample
{
    public static void Run()
    {
        Console.WriteLine("--- [.NET / SQLite Provider] Starting example ---");
        var dbFile = Path.Combine(Path.GetTempPath(), "an5-dotnet-sqlite.db");
        if (File.Exists(dbFile)) File.Delete(dbFile);

        var cs = $"Data Source={dbFile}";

        // 1. Setup schema
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

            // 2. Create User
            var alice = new User
            {
                Id = "u_sqlite_1",
                Email = "alice.dotnet@example.com",
                Name = "Alice .NET SQLite",
                Score = 150,
                Embedding = new float[] { 1.0f, 0.0f, 0.0f },
                CreatedAt = DateTime.UtcNow,
                Orders = null,
            };
            db.User.Create(alice);
            Console.WriteLine($"[.NET/SQLite] Created user: id={alice.Id}, email={alice.Email}");

            // 3. Create Orders
            var order = new Order
            {
                Id = "o_sqlite_1",
                UserId = alice.Id,
                Total = 400,
                Status = "completed",
                CreatedAt = DateTime.UtcNow
            };
            db.Order.Create(order);
            Console.WriteLine($"[.NET/SQLite] Created order: id={order.Id}, total={order.Total}");

            // 4. Query
            var users = db.User.FindMany("email LIKE '%dotnet%'");
            Console.WriteLine($"[.NET/SQLite] Found {users.Count} user(s).");

            // 5. Cleanup
            db.Order.DeleteMany("userId = @userId", new System.Collections.Generic.Dictionary<string, object> { { "@userId", alice.Id } });
            db.User.DeleteMany("id = @id", new System.Collections.Generic.Dictionary<string, object> { { "@id", alice.Id } });
            Console.WriteLine("[.NET/SQLite] Cleanup completed.");
            Console.WriteLine("--- [.NET / SQLite Provider] Finished successfully ---\n");
        }
        finally
        {
            if (File.Exists(dbFile)) File.Delete(dbFile);
        }
    }
}
