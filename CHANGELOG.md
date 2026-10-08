# Changelog

## [Unreleased]

### Added
- The example schema declares a real `VECTOR(3)` column and every example's DDL carries it.
  The .NET example uses SQL Server's own `VECTOR` type and ranks it with `VECTOR_DISTANCE`.
- **Java, Kotlin and Swift examples, each with its own gate** — `examples/java` is a Maven
  project that compiles the generated Java client with the JDBC adapter source and runs the
  CRUD example against SQLite; `examples/kotlin` compiles the Kotlin client and adapter with
  `kotlinc` and runs the same example; `examples/swift/An5Example` is a SwiftPM package that
  builds the generated Swift client over the runtime's own SQLite driver. They run as
  `test:java`, `test:kotlin` and `test:swift`, which `npm test` includes, and every gate
  skips with the reason when its toolchain is absent.
- Generated Java, Kotlin and Swift clients under `generated/`, from the generators an5Orm
  1.2.0 added.

### Changed
- Regenerate `generated/rust` with `vector_search`, so the example's Rust client matches the
  an5Orm generator. `npm run test:rust` builds the regenerated crate and runs the example
  against SQLite, which is what proves the new method compiles.
- Update `UserSelect`, `UserCreateInput`, `UserUpdateInput`, `UserOrderByInput`, `UserScalarFieldEnum` in `generated/typescript/User.ts`.
- Update `examples/dotnet/Program.cs`.
- Update `examples/golang/main.go`.
- Update `examples/rust/src/main.rs`.
- Update `generated/dotnet/An5DbContext.cs`.
- Update `generated/dotnet/An5OrmTypes.cs`.
- Update `generated/dotnet/User.cs`.
- Update `generated/golang/client.go`.
- Update `generated/golang/User.go`.
- Update `generated/python/an5_metadata.py`.
- Update `generated/python/an5_orm_types.py`.
- Update `generated/python/User.py`.
- Update `generated/rust/src/client.rs`.
- Update `generated/rust/src/metadata.rs`.
- Update `generated/rust/src/models.rs`.
- Update `generated/typescript/an5Metadata.ts`.
- Update `schema/user.an5`.
- Update `examples/java/src/main/java/an5/example/CrudExample.java`.
- Update `examples/kotlin/src/main/kotlin/an5/example/CrudExample.kt`.
- Update `examples/swift/An5Example/Sources/An5Example/main.swift`.
- Update `generated/java/An5Metadata.java`.
- Update `generated/java/An5OrmTypes.java`.
- Update `generated/java/An5Values.java`.
- Update `generated/java/User.java`.
- Update `generated/kotlin/An5Metadata.kt`.
- Update `generated/kotlin/An5OrmTypes.kt`.
- Update `generated/kotlin/User.kt`.
- Update `generated/swift/Sources/An5Client/An5Metadata.swift`.
- Update `generated/swift/Sources/An5Client/An5OrmTypes.swift`.
- Update `generated/swift/Sources/An5Client/User.swift`.
- Update `package.json`.
- Update `scripts/db-setup.cjs`.
- Update `scripts/ddl.cjs`.
- Update `test/crud-suite.js`.
- Update `test/crud.browser.test.js`.
- Update `test/crud.live.test.js`.
- Update `test/crud.sqlite.test.js`.

### Fixed
- `test:example:go` did not run: `npm --prefix … exec` leaves the working directory alone, so
  `go` looked for a module in the repository root and failed. It now uses `go -C`, and is part
  of `npm test`, which CI runs. The Go example was therefore never executed anywhere, which is
  how a vector column that could not be written stayed unnoticed: `test:go` only compiles and
  vets.
- The shared CRUD suite asserted a `VECTOR(n)` round-trip for every dialect, but only the
  SQLite DDL has that column, so the live harness against PostgreSQL, MySQL or SQL Server would
  have failed on a missing column. The strong assertion now runs where the column exists, and
  the shape assertion every dialect can satisfy stays.
- The Java, Kotlin, Swift and Go examples now write a vector, read it back and rank it, so a
  broken read path fails the example instead of only failing to compile.
- **The .NET example could not run from a checkout** — `UseAppHost=false`, so it runs as
  `dotnet <dll>` without needing a native apphost, and the `Microsoft.Data.Sqlite` and
  `Npgsql` packages the regenerated client needs are referenced explicitly. The compile
  check was passing without the dependency the generated source actually requires.
- The generated Go client recognises the bare `"sqlite"` connection string and strips the
  SQL Server `dbo.` prefix under SQLite, matching the ORM.

## [0.1.1] - 2026-08-19

- chore: update build
