const env = require('../config/env');
const { query } = require('../config/database');
const { insertBatch } = require('../repositories/fareObservation.repository');
const { recalculateDailyIndex } = require('./indexEngine.service');
const { detectAnomalies } = require('./anomalyDetection.service');

let lastRunStats = null;
let lastError = null;

function getProviderHealth() {
  const isConfigured = Boolean(env.serpApiKey && env.serpApiKey.trim() !== '' && !env.serpApiKey.includes('your_'));
  return {
    configured: isConfigured,
    provider: 'SerpApi',
    last_error: lastError
  };
}

async function getCollectionStatus() {
  const lastRunRes = await query(`
    SELECT run_time, status, records_ingested, duration_seconds, error_detail
    FROM data_quality_runs
    ORDER BY run_time DESC
    LIMIT 1;
  `);

  const lastRun = lastRunRes.rows[0];
  const lastRunObj = lastRun ? {
    status: lastRun.status,
    observations_saved: lastRun.records_ingested,
    routes_successful: lastRunStats?.routesSuccessful || 6,
    routes_attempted: lastRunStats?.routesAttempted || 6,
    timestamp: lastRun.run_time
  } : null;

  const nextScheduled = new Date(Date.now() + env.collectionIntervalHours * 3600000);

  return {
    last_run: lastRunObj,
    next_scheduled_run: nextScheduled.toISOString()
  };
}

async function getRoutePriority() {
  const res = await query(`
    SELECT code as route_code, weight, 
           ROW_NUMBER() OVER(ORDER BY weight DESC) as priority
    FROM routes
    ORDER BY weight DESC
    LIMIT 5;
  `);
  return res.rows.map(r => ({
    route_code: r.route_code,
    priority: parseInt(r.priority, 10),
    weight: Number(r.weight)
  }));
}

async function fetchRouteFlightsFromSerpApi(origin, destination, travelDateStr) {
  const apiKey = env.serpApiKey;
  const url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${origin}&arrival_id=${destination}&outbound_date=${travelDateStr}&currency=INR&hl=en&type=2&api_key=${apiKey}`;

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`SerpApi request failed with status ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  if (json.error) {
    throw new Error(`SerpApi error: ${json.error}`);
  }

  const allFlights = [
    ...(json.best_flights || []),
    ...(json.other_flights || [])
  ];

  const observations = [];
  const today = new Date();
  const travelDate = new Date(travelDateStr);
  const daysBefore = Math.max(0, Math.round((travelDate - today) / (1000 * 60 * 60 * 24)));
  const routeCode = `${origin}-${destination}`;

  allFlights.forEach(item => {
    const flightLeg = item.flights && item.flights[0] ? item.flights[0] : {};
    const airline = flightLeg.airline || item.airline || 'Domestic Carrier';
    const flightNumber = flightLeg.flight_number || null;
    const price = item.price || (item.price_details ? item.price_details.amount : null);

    if (price && Number(price) > 0) {
      observations.push({
        route_code: routeCode,
        airline: airline,
        flight_number: flightNumber,
        departure_date: travelDateStr,
        booking_date: today.toISOString().split('T')[0],
        days_before_departure: daysBefore,
        fare_class: 'Economy',
        total_fare: Number(price),
        currency: 'INR',
        source: 'SerpApi Google Flights'
      });
    }
  });

  return observations;
}

async function runCollection() {
  const startTime = Date.now();
  console.log('[Collector] Starting live data collection job...');

  const isConfigured = Boolean(env.serpApiKey && env.serpApiKey.trim() !== '' && !env.serpApiKey.includes('your_'));
  if (!isConfigured) {
    const msg = 'SerpApi key is not configured in environment.env. Set SERPAPI_KEY=... to enable live flight crawling.';
    console.warn(`[Collector] ${msg}`);
    lastError = msg;
    return {
      success: false,
      message: msg,
      recordsSaved: 0
    };
  }

  const routesToCollect = [
    { origin: 'DEL', destination: 'BOM' },
    { origin: 'BOM', destination: 'BLR' },
    { origin: 'DEL', destination: 'BLR' }
  ];

  // Pick departure date 7 days from now
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 7);
  const targetDateStr = targetDate.toISOString().split('T')[0];

  let totalSaved = 0;
  let successfulRoutes = 0;
  const errors = [];

  for (const r of routesToCollect) {
    try {
      console.log(`[Collector] Fetching live Google Flights for ${r.origin}->${r.destination} on ${targetDateStr}...`);
      const observations = await fetchRouteFlightsFromSerpApi(r.origin, r.destination, targetDateStr);
      if (observations.length > 0) {
        const saved = await insertBatch(observations);
        totalSaved += saved;
        successfulRoutes++;
        console.log(`[Collector] Saved ${saved} live observations for ${r.origin}-${r.destination}.`);
      }
    } catch (err) {
      console.error(`[Collector] Failed to fetch route ${r.origin}-${r.destination}: ${err.message}`);
      errors.push(`${r.origin}-${r.destination}: ${err.message}`);
    }
  }

  const durationSeconds = Number(((Date.now() - startTime) / 1000).toFixed(2));
  const status = errors.length === 0 ? 'Success' : totalSaved > 0 ? 'Warning' : 'Failed';
  lastError = errors.length > 0 ? errors.join('; ') : null;

  lastRunStats = {
    routesSuccessful: successfulRoutes,
    routesAttempted: routesToCollect.length
  };

  // Record pipeline run in database
  await query(`
    INSERT INTO data_quality_runs (run_time, status, records_ingested, duration_seconds, error_detail)
    VALUES (NOW(), $1, $2, $3, $4);
  `, [status, totalSaved, durationSeconds, lastError]);

  // Recalculate index & detect anomalies if new data arrived
  if (totalSaved > 0) {
    await recalculateDailyIndex();
    await detectAnomalies();
  }

  return {
    success: status !== 'Failed',
    status,
    recordsSaved: totalSaved,
    durationSeconds,
    errors
  };
}

module.exports = {
  getProviderHealth,
  getCollectionStatus,
  getRoutePriority,
  runCollection
};
