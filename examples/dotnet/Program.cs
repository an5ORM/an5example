// AN5 .NET Example: Multi-Provider Entry Point
//
// Runs provider examples for SQLite, PostgreSQL, and SQL Server (MSSQL),
// mirroring the an5Adapters/dotnet provider architecture.
//
// Run: dotnet run --project examples/dotnet
using System;
using An5Example.Providers;

internal static class Program
{
    private static int Main()
    {
        Console.WriteLine("================ AN5 .NET Provider Examples ================\n");

        // 1. SQLite Provider (always runnable in-memory/file)
        try
        {
            SqliteExample.Run();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[.NET/SQLite] Exception: {ex.Message}");
        }

        // 2. PostgreSQL Provider (offline safe probe)
        try
        {
            PostgresExample.Run();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[.NET/Postgres] Exception: {ex.Message}");
        }

        // 3. SQL Server (MSSQL) Provider (offline safe probe)
        try
        {
            MssqlExample.Run();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[.NET/MSSQL] Exception: {ex.Message}");
        }

        Console.WriteLine("================ All .NET Provider Examples Completed ================");
        return 0;
    }
}
