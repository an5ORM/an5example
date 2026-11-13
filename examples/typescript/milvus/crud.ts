/**
 * AN5 TypeScript Example: Milvus / Zilliz Vector Database Provider
 *
 * Provider: Milvus / Zilliz
 * Protocol: milvus://
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/milvus/crud.js
 *   MILVUS_URL="milvus://localhost:19530?collection=an5_example" node dist/examples/typescript/milvus/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { createMilvusClient } from '@an5/adapters/milvus';
import { modelToTable, modelFields, relationMap } from '../../../generated/typescript/an5Metadata';

export function configureMilvusMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({ modelToTable: tables, modelFields, relationMap });
}

export async function runMilvusExample(): Promise<void> {
  const milvusUri = process.env.MILVUS_URL || 'milvus://localhost:19530?collection=an5_example';
  console.log('--- [TypeScript / Milvus Vector DB Provider] Starting example ---');
  configureMilvusMetadata();

  const client = createMilvusClient(milvusUri);
  try {
    const health = await client.health();
    console.log('[TypeScript/Milvus] Connected:', health);

    await client.upsert([
      { id: 'User:1', vector: [1.0, 0.0, 0.0], metadata: { an5Id: '1', an5Model: 'User', label: 'red' } },
      { id: 'User:2', vector: [0.0, 1.0, 0.0], metadata: { an5Id: '2', an5Model: 'User', label: 'green' } },
    ]);
    const hits = await client.search([0.9, 0.1, 0.0], { k: 2, distanceMetric: 'cosine' });
    console.log('[TypeScript/Milvus] Top hits:', hits);
    await client.delete(['User:1', 'User:2']);
  } catch (err: any) {
    console.log(
      `[TypeScript/Milvus] SKIPPED: Milvus is not reachable at "${milvusUri}".\n` +
      `  Reason: ${err?.message || err}\n` +
      '  To run live: start Milvus (port 19530) and set MILVUS_URL=milvus://localhost:19530?collection=an5_example'
    );
  }

  const _sidecarHint = () =>
    createAn5Adapter({
      connectionString: 'sqlite::memory:',
      vectorStore: milvusUri,
    });
  void _sidecarHint;
  console.log('[TypeScript/Milvus] Sidecar usage: createAn5Adapter({ connectionString: "sqlite::memory:", vectorStore: "' + milvusUri + '" })');
  console.log('--- [TypeScript / Milvus Vector DB Provider] Completed ---\n');
}

if (require.main === module) {
  runMilvusExample().catch((err) => {
    console.error('[TypeScript/Milvus] Error:', err);
    process.exit(1);
  });
}
