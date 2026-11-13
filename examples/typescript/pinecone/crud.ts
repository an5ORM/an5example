/**
 * AN5 TypeScript Example: Pinecone Vector Database Provider
 *
 * Provider: Pinecone
 * Protocol: pinecone://
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/pinecone/crud.js
 *   PINECONE_URL="pinecone://my-index.svc.region.pinecone.io?apiKey=...&namespace=an5_example" node dist/examples/typescript/pinecone/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { createPineconeClient } from '@an5/adapters/pinecone';
import { modelToTable, modelFields, relationMap } from '../../../generated/typescript/an5Metadata';

export function configurePineconeMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({ modelToTable: tables, modelFields, relationMap });
}

export async function runPineconeExample(): Promise<void> {
  const pineconeUri = process.env.PINECONE_URL || 'pinecone://localhost:5080?namespace=an5_example';
  console.log('--- [TypeScript / Pinecone Vector DB Provider] Starting example ---');
  configurePineconeMetadata();

  const client = createPineconeClient(pineconeUri);
  try {
    const health = await client.health();
    console.log('[TypeScript/Pinecone] Connected:', health);

    await client.upsert([
      { id: 'User:1', vector: [1.0, 0.0, 0.0], metadata: { an5Id: '1', an5Model: 'User', label: 'red' } },
      { id: 'User:2', vector: [0.0, 1.0, 0.0], metadata: { an5Id: '2', an5Model: 'User', label: 'green' } },
    ]);
    const hits = await client.search([0.9, 0.1, 0.0], { k: 2, distanceMetric: 'cosine' });
    console.log('[TypeScript/Pinecone] Top hits:', hits);
    await client.delete(['User:1', 'User:2']);
  } catch (err: any) {
    console.log(
      `[TypeScript/Pinecone] SKIPPED: Pinecone endpoint is not reachable at "${pineconeUri}".\n` +
      `  Reason: ${err?.message || err}\n` +
      '  To run live: set PINECONE_URL=pinecone://my-index.svc.region.pinecone.io?apiKey=...'
    );
  }

  const _sidecarHint = () =>
    createAn5Adapter({
      connectionString: 'sqlite::memory:',
      vectorStore: pineconeUri,
    });
  void _sidecarHint;
  console.log('[TypeScript/Pinecone] Sidecar usage: createAn5Adapter({ connectionString: "sqlite::memory:", vectorStore: "' + pineconeUri + '" })');
  console.log('--- [TypeScript / Pinecone Vector DB Provider] Completed ---\n');
}

if (require.main === module) {
  runPineconeExample().catch((err) => {
    console.error('[TypeScript/Pinecone] Error:', err);
    process.exit(1);
  });
}
