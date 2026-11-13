/**
 * AN5 TypeScript Example: Chroma / ChromaDB Vector Database Provider
 *
 * Provider: Chroma
 * Protocol: chroma://
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/chroma/crud.js
 *   CHROMA_URL="chroma://localhost:8000?collection=an5_example" node dist/examples/typescript/chroma/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { createChromaClient } from '@an5/adapters/chroma';
import { modelToTable, modelFields, relationMap } from '../../../generated/typescript/an5Metadata';

export function configureChromaMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({ modelToTable: tables, modelFields, relationMap });
}

export async function runChromaExample(): Promise<void> {
  const chromaUri = process.env.CHROMA_URL || 'chroma://localhost:8000?collection=an5_example';
  console.log('--- [TypeScript / Chroma Vector DB Provider] Starting example ---');
  configureChromaMetadata();

  const client = createChromaClient(chromaUri);
  try {
    const health = await client.health();
    console.log('[TypeScript/Chroma] Connected:', health);

    await client.upsert([
      { id: 'User:1', vector: [1.0, 0.0, 0.0], metadata: { an5Id: '1', an5Model: 'User', label: 'red' } },
      { id: 'User:2', vector: [0.0, 1.0, 0.0], metadata: { an5Id: '2', an5Model: 'User', label: 'green' } },
    ]);
    const hits = await client.search([0.9, 0.1, 0.0], { k: 2, distanceMetric: 'cosine' });
    console.log('[TypeScript/Chroma] Top hits:', hits);
    await client.delete(['User:1', 'User:2']);
  } catch (err: any) {
    console.log(
      `[TypeScript/Chroma] SKIPPED: Chroma is not reachable at "${chromaUri}".\n` +
      `  Reason: ${err?.message || err}\n` +
      '  To run live: start Chroma (port 8000) and set CHROMA_URL=chroma://localhost:8000?collection=an5_example'
    );
  }

  const _sidecarHint = () =>
    createAn5Adapter({
      connectionString: 'sqlite::memory:',
      vectorStore: chromaUri,
    });
  void _sidecarHint;
  console.log('[TypeScript/Chroma] Sidecar usage: createAn5Adapter({ connectionString: "sqlite::memory:", vectorStore: "' + chromaUri + '" })');
  console.log('--- [TypeScript / Chroma Vector DB Provider] Completed ---\n');
}

if (require.main === module) {
  runChromaExample().catch((err) => {
    console.error('[TypeScript/Chroma] Error:', err);
    process.exit(1);
  });
}
