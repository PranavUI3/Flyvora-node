const { initDatabase } = require('../src/config/database');
const { runCollection } = require('../src/services/serpApiCollector.service');

async function main() {
  console.log('[IngestCLI] Initializing database...');
  await initDatabase();
  console.log('[IngestCLI] Running live flight data collection...');
  const result = await runCollection();
  console.log('[IngestCLI] Ingest completed with result:', result);
  process.exit(result.success ? 0 : 1);
}

main().catch(err => {
  console.error('[IngestCLI] Fatal error during ingest:', err);
  process.exit(1);
});
