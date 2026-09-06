const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPaths = [
  path.resolve(__dirname, '../../environment.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../environment.env'),
  path.resolve(__dirname, '../../../.env')
];

const env = {
  port: 8000,
  nodeEnv: 'development',
  db: {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'flyvora',
    connectionString: undefined
  },
  serpApiKey: '',
  autoCollect: false,
  collectionIntervalHours: 6
};

function loadEnv() {
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const parsed = dotenv.parse(fs.readFileSync(envPath));
      for (const k in parsed) {
        process.env[k] = parsed[k];
      }
      break;
    }
  }

  env.port = parseInt(process.env.PORT || '8000', 10);
  env.nodeEnv = process.env.NODE_ENV || 'development';
  env.db.host = process.env.DB_HOST || 'localhost';
  env.db.port = parseInt(process.env.DB_PORT || '5432', 10);
  env.db.user = process.env.DB_USER || 'postgres';
  env.db.password = process.env.DB_PASSWORD || '';
  env.db.database = process.env.DB_NAME || 'flyvora';
  env.db.connectionString = process.env.DATABASE_URL || undefined;
  env.serpApiKey = process.env.SERPAPI_KEY || process.env.FLYVORA_API_KEY || '';
  env.autoCollect = process.env.AUTO_COLLECT_ON_STARTUP === 'true';
  env.collectionIntervalHours = parseInt(process.env.COLLECTION_INTERVAL_HOURS || '6', 10);

  return env;
}

// Initial load
loadEnv();

module.exports = env;
module.exports.loadEnv = loadEnv;
