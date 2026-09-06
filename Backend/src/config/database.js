const { Pool, Client } = require('pg');
const env = require('./env');

let pool = null;
let isConnected = false;
let lastDbError = null;
let reconnectTimer = null;

function getPoolConfig(databaseName) {
  if (env.db.connectionString) {
    return { connectionString: env.db.connectionString };
  }
  return {
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: String(env.db.password || ''),
    database: databaseName || env.db.database,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 4000,
  };
}

async function ensureDatabaseExists() {
  if (env.db.connectionString) return;
  const targetDb = env.db.database;
  const client = new Client(getPoolConfig('postgres'));
  try {
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDb]);
    if (res.rowCount === 0) {
      console.log(`[Database] Database "${targetDb}" does not exist. Creating...`);
      await client.query(`CREATE DATABASE "${targetDb}"`);
      console.log(`[Database] Database "${targetDb}" created successfully.`);
    }
  } catch (err) {
    // Expected if postgres default db requires different creds
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

async function runMigrations(client) {
  const schemaSql = `
    CREATE TABLE IF NOT EXISTS routes (
      id SERIAL PRIMARY KEY,
      code VARCHAR(20) UNIQUE NOT NULL,
      origin VARCHAR(10) NOT NULL,
      destination VARCHAR(10) NOT NULL,
      origin_city VARCHAR(50) NOT NULL,
      dest_city VARCHAR(50) NOT NULL,
      name VARCHAR(100) NOT NULL,
      weight NUMERIC(5, 2) DEFAULT 0.10,
      distance_km INT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS airlines (
      id SERIAL PRIMARY KEY,
      code VARCHAR(10) UNIQUE NOT NULL,
      name VARCHAR(50) NOT NULL,
      market_share NUMERIC(5, 2) DEFAULT 0.0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fare_observations (
      id BIGSERIAL PRIMARY KEY,
      route_code VARCHAR(20) NOT NULL REFERENCES routes(code) ON DELETE CASCADE,
      airline VARCHAR(50) NOT NULL,
      flight_number VARCHAR(20),
      departure_date DATE NOT NULL,
      booking_date DATE NOT NULL,
      days_before_departure INT NOT NULL,
      fare_class VARCHAR(20) DEFAULT 'Economy',
      total_fare NUMERIC(10, 2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      source VARCHAR(100) DEFAULT 'SerpApi Google Flights',
      fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_fares_route_code ON fare_observations(route_code);
    CREATE INDEX IF NOT EXISTS idx_fares_airline ON fare_observations(airline);
    CREATE INDEX IF NOT EXISTS idx_fares_fetched_at ON fare_observations(fetched_at);
    CREATE INDEX IF NOT EXISTS idx_fares_departure_date ON fare_observations(departure_date);
    CREATE INDEX IF NOT EXISTS idx_fares_days_before ON fare_observations(days_before_departure);

    CREATE TABLE IF NOT EXISTS index_series (
      id SERIAL PRIMARY KEY,
      calculation_date DATE UNIQUE NOT NULL,
      national_index NUMERIC(8, 2) NOT NULL,
      south_index NUMERIC(8, 2) NOT NULL,
      north_index NUMERIC(8, 2) NOT NULL,
      inflation_rate NUMERIC(6, 2) NOT NULL,
      tracked_routes INT DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS anomalies (
      id SERIAL PRIMARY KEY,
      route_code VARCHAR(20) NOT NULL REFERENCES routes(code) ON DELETE CASCADE,
      detail TEXT NOT NULL,
      severity VARCHAR(20) NOT NULL DEFAULT 'Low',
      fare NUMERIC(10, 2),
      baseline_fare NUMERIC(10, 2),
      pct_change NUMERIC(6, 2),
      detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS data_quality_runs (
      id SERIAL PRIMARY KEY,
      run_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status VARCHAR(20) NOT NULL,
      records_ingested INT DEFAULT 0,
      duration_seconds NUMERIC(6, 2) DEFAULT 0,
      error_detail TEXT
    );

    CREATE TABLE IF NOT EXISTS data_sources (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'Active',
      detail TEXT,
      last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await client.query(schemaSql);
}

async function initDatabase() {
  env.loadEnv();

  try {
    await ensureDatabaseExists();
    if (pool) {
      try { await pool.end(); } catch (_) {}
    }
    pool = new Pool(getPoolConfig());

    pool.on('error', (err) => {
      console.error('[Database] Unexpected pool error:', err.message);
      lastDbError = err.message;
      isConnected = false;
    });

    const client = await pool.connect();
    try {
      await runMigrations(client);
      isConnected = true;
      lastDbError = null;
      console.log(`[Database] ✅ Connected to PostgreSQL at ${env.db.host}:${env.db.port}/${env.db.database}`);
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    isConnected = false;
    if (lastDbError !== err.message) {
      lastDbError = err.message;
      console.warn(`[Database] ⚠️ Not connected to PostgreSQL (${err.message}).`);
      console.warn('[Database] 👉 Please ensure PostgreSQL is running and set DB_PASSWORD in Backend/environment.env');
    }

    // Auto-retry in background every 15s so server connects as soon as environment.env is updated
    if (!reconnectTimer) {
      reconnectTimer = setInterval(async () => {
        if (!isConnected) {
          await initDatabase();
        }
      }, 15000);
    }
    return false;
  }
}

async function query(text, params) {
  if (!isConnected || !pool) {
    // Attempt one instant reconnect with refreshed env
    const connected = await initDatabase();
    if (!connected) {
      const err = new Error(`Database connection unavailable: ${lastDbError || 'Set DB_PASSWORD in environment.env'}`);
      err.isDbUnavailable = true;
      throw err;
    }
  }
  return await pool.query(text, params);
}

function getStatus() {
  return {
    connected: isConnected,
    host: env.db.host,
    port: env.db.port,
    database: env.db.database,
    user: env.db.user,
    lastError: lastDbError
  };
}

module.exports = {
  initDatabase,
  query,
  getPool: () => pool,
  getStatus,
  isDbConnected: () => isConnected
};
