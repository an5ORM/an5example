/**
 * AN5 TypeScript Example: Google Sheets Provider
 *
 * Provider: Google Sheets (serverless tabular storage)
 * Protocol: googlesheets://
 *
 * Highlights:
 * - Uses Google Spreadsheet tabs as structured database tables.
 * - Dynamic column header mapping (sheetMapping=users:Users,orders:Orders).
 * - Authentication options: Service Account Key, OAuth 2.0 (access token / refresh token), or API Key.
 *
 * Run:
 *   npx tsc -p tsconfig.json && node dist/examples/typescript/googlesheets/crud.js
 *   SHEETS_URL="googlesheets://yourSpreadsheetId;apiKey=AIzaSy..." node dist/examples/typescript/googlesheets/crud.js
 */
import {
  createAn5Adapter,
  parseSheetsConnectionString,
  setAdapterMetadata,
} from '@an5/adapters';
import { modelFields, relationMap } from '../../../generated/typescript/an5Metadata';
import type { UserTableClient } from '../../../generated/typescript/User';
import type { OrderTableClient } from '../../../generated/typescript/Order';

export interface ExampleModels {
  user: UserTableClient;
  users: UserTableClient;
  order: OrderTableClient;
  orders: OrderTableClient;
}

export function configureSheetsMetadata(): void {
  const tables: Record<string, string> = {
    user: 'Users',
    users: 'Users',
    order: 'Orders',
    orders: 'Orders',
  };
  setAdapterMetadata({
    modelToTable: tables,
    modelFields,
    relationMap,
  });
}

export async function runGoogleSheetsExample(): Promise<void> {
  console.log('--- [TypeScript / Google Sheets Provider] Starting example ---');
  configureSheetsMetadata();

  const rawUrl =
    process.env.SHEETS_URL ||
    process.env.GOOGLE_SHEETS_URL ||
    'googlesheets://1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms;apiKey=AIzaSyDEMO_KEY;sheetMapping=users:Users,orders:Orders';

  // 1. Demonstrate parsing a googlesheets:// connection string
  const parsed = parseSheetsConnectionString(rawUrl);
  console.log('[TypeScript/Google Sheets] Parsed connection configuration:');
  console.log(`  Spreadsheet ID: ${parsed.spreadsheetId}`);
  console.log(`  Auth method:    ${parsed.apiKey ? 'API Key' : parsed.clientEmail ? 'Service Account' : 'OAuth'}`);
  console.log(`  Sheet mappings: ${JSON.stringify(parsed.sheetMapping || {})}`);

  // 2. Check if a live configured connection string is provided
  const isConfigured =
    Boolean(process.env.SHEETS_URL || process.env.GOOGLE_SHEETS_URL) &&
    !rawUrl.includes('DEMO_KEY');

  if (!isConfigured) {
    console.log('\n[TypeScript/Google Sheets] SKIPPED live API call (running in offline demonstration mode).');
    console.log(
      'To run live CRUD queries against Google Sheets:\n' +
      '  1. Create a Google Spreadsheet and add tabs "Users" and "Orders".\n' +
      '  2. Set row 1 headers in "Users": id, email, name, isActive, score, createdAt\n' +
      '  3. Share the sheet with your service account email (Editor role).\n' +
      '  4. Run with:\n' +
      '     SHEETS_URL="googlesheets://<spreadsheetId>;clientEmail=<email>;privateKey=<key>;sheetMapping=users:Users,orders:Orders" \\\n' +
      '     node dist/examples/typescript/googlesheets/crud.js\n'
    );
    console.log('--- [TypeScript / Google Sheets Provider] Completed (offline safe) ---\n');
    return;
  }

  // 3. Live run against configured Google Sheet
  const db = createAn5Adapter<ExampleModels>({ connectionString: rawUrl });
  try {
    console.log('[TypeScript/Google Sheets] Connected to spreadsheet. Querying Users sheet...');
    const users = await db.user.findMany({ take: 5 });
    console.log(`[TypeScript/Google Sheets] Found ${users.length} user rows in spreadsheet.`);

    // Create an entry
    const newEntry = await db.user.create({
      data: {
        email: `sheet.user.${Date.now()}@example.com`,
        name: 'Sheet Tester',
        score: 42,
      },
    });
    console.log(`[TypeScript/Google Sheets] Created record: id=${newEntry.id}`);

    // Cleanup
    await db.user.delete({ where: { id: newEntry.id } });
    console.log('[TypeScript/Google Sheets] Cleaned up created row.');
    console.log('--- [TypeScript / Google Sheets Provider] Finished successfully ---\n');
  } catch (err: any) {
    console.error('[TypeScript/Google Sheets] Live execution error:', err?.message || err);
    throw err;
  }
}

if (require.main === module) {
  runGoogleSheetsExample().catch((err) => {
    console.error('[TypeScript/Google Sheets] Error:', err);
    process.exit(1);
  });
}
