/**
 * AN5 example ORM configuration.
 *
 * Schema lives in ./schema. Generated clients are written under ./generated so
 * the example repo is self-contained and can run against SQLite without a SQL
 * Server instance.
 */
module.exports = {
  schemaDir: 'schema',

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
  },

  generation: {
    generateComments: true,
    generateMetadata: true,
  },
};