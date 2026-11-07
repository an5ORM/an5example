/**
 * AN5 TypeScript Example: NBase Neural Vector Database Provider
 *
 * Provider: NBase (vector database)
 * Protocol: nbase://
 *
 * Highlights:
 * - Dedicated vector storage and similarity search (KNN / HNSW).
 * - Operates standalone (pure vector store) or in hybrid mode (relational DB + NBase).
 * - indexVectorsInNBase syncs embeddings from relational tables to NBase.
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/nbase/crud.js
 *   NBASE_URL="nbase://localhost:1307" node dist/examples/typescript/nbase/crud.js
 */
import { createAn5Adapter, setAdapterMetadata } from '@an5/adapters';
import { modelToTable, modelFields, relationMap } from '../../../generated/typescript/an5Metadata';
import type { UserTableClient } from '../../../generated/typescript/User';
import type { OrderTableClient } from '../../../generated/typescript/Order';

export interface ExampleModels {
  user: UserTableClient;
  users: UserTableClient;
  order: OrderTableClient;
  orders: OrderTableClient;
}

export function configureNbaseMetadata(): void {
  const tables: Record<string, string> = {};
  for (const [model, table] of Object.entries(modelToTable)) {
    tables[model] = String(table).replace(/^\[dbo\]\./, '').replace(/^\[|\]$/g, '');
  }
  setAdapterMetadata({
    modelToTable: tables,
    modelFields,
    relationMap,
  });
}

export async function runNbaseExample(): Promise<void> {
  const nbaseUri = process.env.NBASE_URL || 'nbase://localhost:1307';
  console.log('--- [TypeScript / NBase Vector DB Provider] Starting example ---');
  configureNbaseMetadata();

  // 1. Standalone NBase Vector Adapter
  console.log(`[TypeScript/NBase] Configuring adapter with connectionString: "${nbaseUri}"`);
  const standaloneDb = createAn5Adapter({ connectionString: nbaseUri });
  const nbaseInfo = standaloneDb.nbaseClient();

  if (!nbaseInfo) {
    console.log('[TypeScript/NBase] Failed to initialize NBase client.');
    return;
  }

  const { client } = nbaseInfo;

  // 2. Probe NBase instance
  try {
    const health = await client.health();
    console.log('[TypeScript/NBase] Successfully connected to NBase instance:', health);

    // Add sample vectors
    const addResult = await client.addVectors([
      { id: 'v1', vector: [1.0, 0.0, 0.0], metadata: { label: 'red' } },
      { id: 'v2', vector: [0.0, 1.0, 0.0], metadata: { label: 'green' } },
      { id: 'v3', vector: [0.0, 0.0, 1.0], metadata: { label: 'blue' } },
    ]);
    console.log(`[TypeScript/NBase] Ingested ${addResult.count} vectors.`);

    // Vector similarity search (cosine)
    const searchResults = await client.search([0.9, 0.1, 0.0], {
      k: 2,
      distanceMetric: 'cosine',
    });
    console.log('[TypeScript/NBase] Search results (top 2 nearest):');
    for (const res of searchResults) {
      console.log(`  id=${res.id}, dist=${res.dist.toFixed(4)}, metadata=${JSON.stringify(res.metadata)}`);
    }

    // Cleanup
    await client.delete('v1');
    await client.delete('v2');
    await client.delete('v3');
    console.log('[TypeScript/NBase] Vector cleanup complete.');
  } catch (err: any) {
    console.log(
      `[TypeScript/NBase] SKIPPED: NBase server is not reachable at "${nbaseUri}".\n` +
      `  Reason: ${err?.message || err}\n` +
      '  To run live: start NBase daemon (default port 1307) and set NBASE_URL=nbase://localhost:1307'
    );
  }

  // 3. Hybrid Relational + NBase demonstration
  console.log('\n[TypeScript/NBase] Hybrid Configuration:');
  console.log('  createAn5Adapter({');
  console.log('    connectionString: "sqlite://:memory:",');
  console.log('    nbase: "nbase://localhost:1307",');
  console.log('  });');
  console.log('  // Enables db.user.indexVectorsInNBase() and db.user.vectorSearch()');
  console.log('--- [TypeScript / NBase Vector DB Provider] Completed ---\n');
}

if (require.main === module) {
  runNbaseExample().catch((err) => {
    console.error('[TypeScript/NBase] Error:', err);
    process.exit(1);
  });
}
