const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const env = require('./src/config/env');
const { initDatabase } = require('./src/config/database');
const { seedDatabase } = require('./src/database/seed');
const apiRouter = require('./src/api');
const { runCollection } = require('./src/services/serpApiCollector.service');

const app = express();

// Enable CORS for all origins (supports Live Server, Vite, and standalone browser openings)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api') || req.path === '/health') {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Serve Frontend static assets directly from backend server
const frontendPath = path.resolve(__dirname, '../Frontend');
app.use(express.static(frontendPath));

// Redirect root to Overview dashboard
app.get('/', (req, res) => {
  res.redirect('/Overview/index.html');
});

// Mount API routes
app.use('/api', apiRouter);

// Root health check
app.get('/health', (req, res) => {
  res.redirect('/api/health');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack || err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Start Server & Initialize Database
async function start() {
  console.log('====================================================');
  console.log(' Flyvora Airfare Price Index - Backend Server');
  console.log('====================================================');
  console.log(`[Config] Running in ${env.nodeEnv} mode on port ${env.port}`);
  console.log(`[Config] Database: ${env.db.user}@${env.db.host}:${env.db.port}/${env.db.database}`);
  console.log(`[Config] SerpApi Key: ${env.serpApiKey ? 'Configured (Live Ingestion Enabled)' : 'Not Configured (Set in environment.env)'}`);

  // 1. Initialize PostgreSQL and auto-migrate
  await initDatabase();

  // 2. Auto-seed calibrated historical baseline if database is empty
  await seedDatabase(false);

  // 3. Schedule periodic background flight data collection
  const cronExpr = `0 */${Math.max(1, env.collectionIntervalHours)} * * *`;
  cron.schedule(cronExpr, async () => {
    console.log('[Scheduler] Running scheduled live flight data collection...');
    try {
      await runCollection();
    } catch (err) {
      console.error('[Scheduler] Scheduled collection failed:', err.message);
    }
  });
  console.log(`[Scheduler] Live collection cron scheduled: "${cronExpr}"`);

  // 4. Run collection on startup if enabled in environment.env
  if (env.autoCollect) {
    console.log('[Startup] AUTO_COLLECT_ON_STARTUP is true. Triggering collection...');
    runCollection().catch(err => console.error('[Startup] Initial collection error:', err.message));
  }

  // 5. Start listening
  app.listen(env.port, () => {
    console.log('----------------------------------------------------');
    console.log(`🚀 Server successfully listening at: http://localhost:${env.port}`);
    console.log(`📊 Overview Dashboard:  http://localhost:${env.port}/Overview/index.html`);
    console.log(`🗺️  Route Explorer:      http://localhost:${env.port}/Route_Heatmap+Trends/routeheatmap.html`);
    console.log(`⏱️  Lead-Time Analysis:  http://localhost:${env.port}/Lead-Time/lead-time.html`);
    console.log(`✈️  Airline Comparison: http://localhost:${env.port}/Airline/airline-comparison.html`);
    console.log(`🛡️  Data Quality:        http://localhost:${env.port}/Data-quality/data-quality.html`);
    console.log(`🩺 Health API:          http://localhost:${env.port}/api/health`);
    console.log('====================================================');
  });
}

start().catch(err => {
  console.error('[Fatal] Server failed to start:', err);
});