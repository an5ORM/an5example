# Changelog

## [Unreleased]

### Added
- **Java, Kotlin and Swift examples, each with its own gate** — `examples/java` is a Maven
  project that compiles the generated Java client with the JDBC adapter source and runs the
  CRUD example against SQLite; `examples/kotlin` compiles the Kotlin client and adapter with
  `kotlinc` and runs the same example; `examples/swift/An5Example` is a SwiftPM package that
  builds the generated Swift client over the runtime's own SQLite driver. They run as
  `test:java`, `test:kotlin` and `test:swift`, which `npm test` includes, and every gate
  skips with the reason when its toolchain is absent.
- Generated Java, Kotlin and Swift clients under `generated/`, from the generators an5Orm
  1.2.0 added.

### Fixed
- **The .NET example could not run from a checkout** — `UseAppHost=false`, so it runs as
  `dotnet <dll>` without needing a native apphost, and the `Microsoft.Data.Sqlite` and
  `Npgsql` packages the regenerated client needs are referenced explicitly. The compile
  check was passing without the dependency the generated source actually requires.
- The generated Go client recognises the bare `"sqlite"` connection string and strips the
  SQL Server `dbo.` prefix under SQLite, matching the ORM.

## [0.1.1] - 2026-08-19

- chore: update build

