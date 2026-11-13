/**
 * AN5 TypeScript Example: Qdrant Vector Database Provider
 *
 * Provider: Qdrant
 * Protocol: qdrant://
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/qdrant/crud.js
 *   QDRANT_URL="qdrant://localhost:6333?collection=an5_example" node dist/examples/typescript/qdrant/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { createQdrantClient } from '@an5/adapters/qdrant';
import { modelToTable, modelFields, relationMap } from '../../../generated/typescript/an5Metadata';

export function configureQdrantMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({ modelToTable: tables, modelFields, relationMap });
}

export async function runQdrantExample(): Promise<void> {
  const qdrantUri = process.env.QDRANT_URL || 'qdrant://localhost:6333?collection=an5_example';
  console.log('--- [TypeScript / Qdrant Vector DB Provider] Starting example ---');
  configureQdrantMetadata();

  const client = createQdrantClient(qdrantUri);
  try {
    const health = await client.health();
    console.log('[TypeScript/Qdrant] Connected:', health);

    await client.upsert([
      { id: 'User:1', vector: [1.0, 0.0, 0.0], metadata: { an5Id: '1', an5Model: 'User', label: 'red' } },
      { id: 'User:2', vector: [0.0, 1.0, 0.0], metadata: { an5Id: '2', an5Model: 'User', label: 'green' } },
    ]);
    const hits = await client.search([0.9, 0.1, 0.0], { k: 2, distanceMetric: 'cosine' });
    console.log('[TypeScript/Qdrant] Top hits:', hits);
    await client.delete(['User:1', 'User:2']);
  } catch (err: any) {
    console.log(
      `[TypeScript/Qdrant] SKIPPED: Qdrant is not reachable at "${qdrantUri}".\n` +
      `  Reason: ${err?.message || err}\n` +
      '  To run live: start Qdrant (port 6333) and set QDRANT_URL=qdrant://localhost:6333?collection=an5_example'
    );
  }

  // Sidecar mode example:
  const _sidecarHint = () =>
    createAn5Adapter({
      connectionString: 'sqlite::memory:',
      vectorStore: qdrantUri,
    });
  void _sidecarHint;
  console.log('[TypeScript/Qdrant] Sidecar usage: createAn5Adapter({ connectionString: "sqlite::memory:", vectorStore: "' + qdrantUri + '" })');
  console.log('--- [TypeScript / Qdrant Vector DB Provider] Completed ---\n');
}

if (require.main === module) {
  runQdrantExample().catch((err) => {
    console.error('[TypeScript/Qdrant] Error:', err);
    process.exit(1);
  });
}
