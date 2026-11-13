/**
 * AN5 TypeScript Example: Weaviate Vector Database Provider
 *
 * Provider: Weaviate
 * Protocol: weaviate://
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/weaviate/crud.js
 *   WEAVIATE_URL="weaviate://localhost:8080?className=An5Example" node dist/examples/typescript/weaviate/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { createWeaviateClient } from '@an5/adapters/weaviate';
import { modelToTable, modelFields, relationMap } from '../../../generated/typescript/an5Metadata';

export function configureWeaviateMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({ modelToTable: tables, modelFields, relationMap });
}

export async function runWeaviateExample(): Promise<void> {
  const weaviateUri = process.env.WEAVIATE_URL || 'weaviate://localhost:8080?className=An5Example';
  console.log('--- [TypeScript / Weaviate Vector DB Provider] Starting example ---');
  configureWeaviateMetadata();

  const client = createWeaviateClient(weaviateUri);
  try {
    const health = await client.health();
    console.log('[TypeScript/Weaviate] Connected:', health);

    await client.upsert([
      { id: 'User:1', vector: [1.0, 0.0, 0.0], metadata: { an5Id: '1', an5Model: 'User', label: 'red' } },
      { id: 'User:2', vector: [0.0, 1.0, 0.0], metadata: { an5Id: '2', an5Model: 'User', label: 'green' } },
    ]);
    const hits = await client.search([0.9, 0.1, 0.0], { k: 2, distanceMetric: 'cosine' });
    console.log('[TypeScript/Weaviate] Top hits:', hits);
    await client.delete(['User:1', 'User:2']);
  } catch (err: any) {
    console.log(
      `[TypeScript/Weaviate] SKIPPED: Weaviate is not reachable at "${weaviateUri}".\n` +
      `  Reason: ${err?.message || err}\n` +
      '  To run live: start Weaviate (port 8080) and set WEAVIATE_URL=weaviate://localhost:8080?className=An5Example'
    );
  }

  const _sidecarHint = () =>
    createAn5Adapter({
      connectionString: 'sqlite::memory:',
      vectorStore: weaviateUri,
    });
  void _sidecarHint;
  console.log('[TypeScript/Weaviate] Sidecar usage: createAn5Adapter({ connectionString: "sqlite::memory:", vectorStore: "' + weaviateUri + '" })');
  console.log('--- [TypeScript / Weaviate Vector DB Provider] Completed ---\n');
}

if (require.main === module) {
  runWeaviateExample().catch((err) => {
    console.error('[TypeScript/Weaviate] Error:', err);
    process.exit(1);
  });
}
