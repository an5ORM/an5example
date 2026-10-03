# Changelog

## [Unreleased]

### Fixed
- **The .NET example could not run from a checkout** — `UseAppHost=false`, so it runs as
  `dotnet <dll>` without needing a native apphost, and the `Microsoft.Data.Sqlite` and
  `Npgsql` packages the regenerated client needs are referenced explicitly. The compile
  check was passing without the dependency the generated source actually requires.
- The generated Go client recognises the bare `"sqlite"` connection string and strips the
  SQL Server `dbo.` prefix under SQLite, matching the ORM.

## [0.1.1] - 2026-08-19

- chore: update build

