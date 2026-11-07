// AN5 .NET Example: SQL Server (MSSQL) Provider
using System;
using Microsoft.Data.SqlClient;
using An5Orm;
using An5Orm.Entities;

namespace An5Example.Providers;

public static class MssqlExample
{
    public static void Run()
    {
        var cs = Environment.GetEnvironmentVariable("MSSQL_URL")
                 ?? Environment.GetEnvironmentVariable("AN5_DATABASE_URL")
                 ?? Environment.GetEnvironmentVariable("DATABASE_URL")
                 ?? "Server=localhost;Database=master;Trusted_Connection=True;TrustServerCertificate=True;Connect Timeout=2;";

        if (cs.StartsWith("postgres://") || cs.StartsWith("sqlite:"))
        {
            return;
        }

        Console.WriteLine("--- [.NET / SQL Server (MSSQL) Provider] Starting example ---");

        // 1. Probe server
        try
        {
            using var probe = new SqlConnection(cs);
            probe.Open();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[.NET/MSSQL] SKIPPED: SQL Server not reachable at {cs}.\n" +
                              $"  Reason: {ex.Message.Split('\n')[0]}\n" +
                              "  To run live: set MSSQL_URL=\"Server=localhost;Database=master;User Id=sa;Password=Pass!;TrustServerCertificate=True;\"");
            Console.WriteLine("--- [.NET / SQL Server (MSSQL) Provider] Completed (offline safe) ---\n");
            return;
        }

        try
        {
            // 2. Setup schema
            using (var conn = new SqlConnection(cs))
            {
                conn.Open();
                using var cmd = conn.CreateCommand();
                cmd.CommandText = @"
                    IF OBJECT_ID('dbo.orders', 'U') IS NOT NULL DROP TABLE dbo.orders;
                    IF OBJECT_ID('dbo.users', 'U') IS NOT NULL DROP TABLE dbo.users;
                    CREATE TABLE dbo.users (
                        id        NVARCHAR(100) PRIMARY KEY,
                        email     NVARCHAR(255) NOT NULL UNIQUE,
                        name      NVARCHAR(255) NULL,
                        isActive  BIT NOT NULL DEFAULT 1,
                        score     INT NOT NULL DEFAULT 0,
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

            var db = new An5DbContext(cs);

            // 3. Create records
            var charlie = new User
            {
                Id = "u_mssql_1",
                Email = "charlie.mssql@example.com",
                Name = "Charlie .NET MSSQL",
                Score = 300,
                Embedding = new float[] { 0.2f, 0.4f, 0.6f },
                CreatedAt = DateTime.UtcNow,
                Orders = null,
            };
            db.User.Create(charlie);
            Console.WriteLine($"[.NET/MSSQL] Created user: id={charlie.Id}, email={charlie.Email}");

            var order = new Order
            {
                Id = "o_mssql_1",
                UserId = charlie.Id,
                Total = 800,
                Status = "open",
                CreatedAt = DateTime.UtcNow
            };
            db.Order.Create(order);
            Console.WriteLine($"[.NET/MSSQL] Created order: id={order.Id}");

            // 4. Query
            var users = db.User.FindMany("email LIKE '%mssql%'");
            Console.WriteLine($"[.NET/MSSQL] Found {users.Count} user(s).");

            // 5. Cleanup
            db.Order.DeleteMany("userId = @userId", new System.Collections.Generic.Dictionary<string, object> { { "@userId", charlie.Id } });
            db.User.DeleteMany("id = @id", new System.Collections.Generic.Dictionary<string, object> { { "@id", charlie.Id } });
            Console.WriteLine("[.NET/MSSQL] Cleanup completed.");
            Console.WriteLine("--- [.NET / SQL Server (MSSQL) Provider] Finished successfully ---\n");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[.NET/MSSQL] Error: {ex.Message}");
        }
    }
}
