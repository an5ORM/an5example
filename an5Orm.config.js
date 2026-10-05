/**
 * AN5 example ORM configuration.
 *
 * Schema lives in ./schema. Generated clients are written under ./generated so
 * the example repo is self-contained and can run against SQLite without a SQL
 * Server instance.
 *
 * The connection string is what makes that true of the generated code too: the
 * provider is read from it, so the field types and table names in the generated
 * clients are SQLite's. Without it the generator assumes SQL Server and emits
 * `[dbo].[users]`, which SQLite rejects — the tests used to strip that prefix by
 * hand before handing the metadata to the adapter.
 */
module.exports = {
  schemaDir: 'schema',

  connectionString: 'sqlite://./crud-example.sqlite',

  outputs: {
    typescript: {
      outputDir: 'generated/typescript',
      metadataFile: 'generated/typescript/an5Metadata.ts',
    },
    python: {
      metadataFile: 'generated/python/an5_metadata.py',
    },
    dotnet: {
      outputDir: 'generated/dotnet',
    },
    golang: {
      outputDir: 'generated/golang',
    },
    rust: {
      outputDir: 'generated/rust',
    },
    /**
     * Java output configuration
     */
    java: {
      outputDir: 'generated/java',
    },
    /**
     * Kotlin output configuration
     */
    kotlin: {
      outputDir: 'generated/kotlin',
    },
    /**
     * Swift output configuration
     */
    swift: {
      outputDir: 'generated/swift',
    },
  },

  generation: {
    // `generateComments` was an older name for the header the metadata generator
    // always writes; an unknown key is now an error, and it stopped this repo
    // generating at all.
    generateMetadata: true,
  },
};