// AN5 example: generated .NET client against SQL Server.
//
// Uses the An5DbContext generated client. Reads the connection string from the
// AN5_DATABASE_URL (or DATABASE_URL) environment variable. When no SQL Server is
// reachable the program prints a skip message and exits 0 (offline build check).
//
// Run: dotnet run --project examples/dotnet
using System;
using System.Collections.Generic;
using Microsoft.Data.SqlClient;
using An5Orm;
using An5Orm.Entities;

internal static class Program
{
    private static string GetConnectionString()
    {
        var c = Environment.GetEnvironmentVariable("AN5_DATABASE_URL") ?? Environment.GetEnvironmentVariable("DATABASE_URL");
        // AN5 database URLs are driver-agnostic (postgres://...); the generated
        // .NET client targets SQL Server, so map a URL to a SqlClient string or
        // fall back to the local default.
        if (string.IsNullOrEmpty(c))
        {
            return "Server=localhost;Database=master;Trusted_Connection=True;TrustServerCertificate=True;Connect Timeout=2;";
        }
        if (c.StartsWith("postgres://") || c.StartsWith("mysql://"))
        {
            return null; // unsupported for the SQL Server-only client
        }
        return c;
    }

    private static void CreateSchema(SqlConnection conn)
    {
        using (var cmd = conn.CreateCommand())
        {
            cmd.CommandText = @"
                IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
                IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
                CREATE TABLE dbo.users (
                    id        NVARCHAR(100) PRIMARY KEY,
                    email     NVARCHAR(255) NOT NULL UNIQUE,
                    name      NVARCHAR(255) NULL,
                    isActive  BIT NOT NULL DEFAULT 1,
                    score     INT NOT NULL DEFAULT 0,
                    -- The schema declares VECTOR(3) and the database has that type, so
                    -- this is a real vector column ranked by VECTOR_DISTANCE in the
                    -- database. That type arrived in SQL Server 2025; on 2022 the DDL has
                    -- to say NVARCHAR(MAX) and hold the same JSON, which the adapter
                    -- still ranks natively by casting.
                    embedding VECTOR(3) NULL,
                    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
                );
                CREATE TABLE dbo.orders (
                    id        NVARCHAR(100) PRIMARY KEY,
                    userId    NVARCHAR(100) NOT NULL,
                    total     INT NOT NULL DEFAULT 0,
                    status    NVARCHAR(50) NULL,
                    createdAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
                    CONSTRAINT fk_orders_user FOREIGN KEY (userId) REFERENCES dbo.users(id)
                );
            ";
            cmd.ExecuteNonQuery();
        }
    }

    private static int Main()
    {
        string cs = GetConnectionString();
        if (cs == null)
        {
            Console.WriteLine("an5example .NET example skipped (no SQL Server connection string; also supports postgres:// via the TS adapter only)");
            return 0;
        }

        try
        {
            using (var probe = new SqlConnection(cs))
            {
                probe.Open();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"an5example .NET example skipped (SQL Server not reachable: {ex.Message.Split('\n')[0]})");
            return 0;
        }

        try
        {
            using var conn = new SqlConnection(cs);
            conn.Open();
            CreateSchema(conn);

            var db = new An5DbContext(cs);
            var alice = new User
            {
                Id = "u1",
                Email = "alice@example.com",
                Name = "Alice",
                Score = 123,
                IsActive = true,
                Embedding = new float[] { 1f, 0f, 0f },
                CreatedAt = DateTime.UtcNow,
                Orders = null!,
            };
            db.User.Create(alice);

            var order = new Order
            {
                Id = "o1",
                UserId = alice.Id,
                Total = 250,
                Status = "open",
                CreatedAt = DateTime.UtcNow,
            };
            db.Order.Create(order);

            // ── Vector search ──────────────────────────────────────────────────────
            // The column is a real VECTOR(3). Writing sends a float[] that the engine
            // binds as the JSON array SQL Server expects, and reading brings it back as
            // float[], so a null here means one of those two ends drifted.
            db.User.Create(new User
            {
                Id = "u2",
                Email = "bob@example.com",
                Name = "Bob",
                Score = 7,
                IsActive = true,
                Embedding = new float[] { 0f, 1f, 0f },
                CreatedAt = DateTime.UtcNow,
                Orders = null!,
            });

            var vectorRows = db.User.FindMany("Id = @id", new Dictionary<string, object> { ["id"] = "u1" });
            var readBack = vectorRows[0].Embedding;
            if (readBack == null || readBack.Length != 3 || Math.Abs(readBack[0] - 1f) > 1e-6)
            {
                throw new InvalidOperationException("the stored vector reads back as [1, 0, 0], got "
                    + (readBack == null ? "null" : string.Join(", ", readBack)));
            }
            Console.WriteLine($"vector read back: [{string.Join(", ", readBack)}]");

            var ranked = db.User.VectorSearch(new List<double> { 1.0, 0.0, 0.0 }, 2, null, null, "embedding", "cosine");
            Console.WriteLine($"vector search returned {ranked.Count} rows");
            if (ranked.Count != 2) throw new InvalidOperationException($"both users carry an embedding, got {ranked.Count}");
            if (ranked[0].Id != "u1") throw new InvalidOperationException("the matching user must rank first");

            var found = db.User.FindMany("Email = @email", new Dictionary<string, object> { ["email"] = "alice@example.com" });
            Console.WriteLine($"found {found.Count} user(s) matching alice");

            var orders = db.Order.FindMany();
            Console.WriteLine($"total orders: {orders.Count}");

            db.Order.Delete("o1");
            db.User.Delete("u1");

            Console.WriteLine("an5example .NET CRUD example passed");
            return 0;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"an5example .NET example failed: {ex.Message}");
            return 1;
        }
    }
}