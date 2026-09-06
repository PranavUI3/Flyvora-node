const { query } = require('../config/database');

async function seedDatabase(force = false) {
  try {
    const existingRoutes = await query('SELECT COUNT(*) FROM routes');
    if (!force && parseInt(existingRoutes.rows[0].count, 10) > 0) {
      console.log('[Seed] Database already populated. Skipping auto-seed.');
      return;
    }

    console.log('[Seed] Seeding Flyvora database with initial routes, carriers, and observations...');

    // 1. Seed Routes
    const routes = [
      { code: 'DEL-BOM', origin: 'DEL', destination: 'BOM', origin_city: 'Delhi', dest_city: 'Mumbai', name: 'DEL-BOM', weight: 0.30, distance_km: 1148 },
      { code: 'DEL-BLR', origin: 'DEL', destination: 'BLR', origin_city: 'Delhi', dest_city: 'Bengaluru', name: 'DEL-BLR', weight: 0.20, distance_km: 1740 },
      { code: 'BOM-BLR', origin: 'BOM', destination: 'BLR', origin_city: 'Mumbai', dest_city: 'Bengaluru', name: 'BOM-BLR', weight: 0.15, distance_km: 842 },
      { code: 'DEL-CCU', origin: 'DEL', destination: 'CCU', origin_city: 'Delhi', dest_city: 'Kolkata', name: 'DEL-CCU', weight: 0.12, distance_km: 1305 },
      { code: 'BLR-HYD', origin: 'BLR', destination: 'HYD', origin_city: 'Bengaluru', dest_city: 'Hyderabad', name: 'BLR-HYD', weight: 0.08, distance_km: 500 },
      { code: 'DEL-MAA', origin: 'DEL', destination: 'MAA', origin_city: 'Delhi', dest_city: 'Chennai', name: 'DEL-MAA', weight: 0.07, distance_km: 1760 },
      { code: 'BOM-GOI', origin: 'BOM', destination: 'GOI', origin_city: 'Mumbai', dest_city: 'Goa', name: 'BOM-GOI', weight: 0.05, distance_km: 435 },
      { code: 'DEL-HYD', origin: 'DEL', destination: 'HYD', origin_city: 'Delhi', dest_city: 'Hyderabad', name: 'DEL-HYD', weight: 0.03, distance_km: 1253 }
    ];

    for (const r of routes) {
      await query(`
        INSERT INTO routes (code, origin, destination, origin_city, dest_city, name, weight, distance_km)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code) DO UPDATE SET
          name = EXCLUDED.name,
          weight = EXCLUDED.weight,
          distance_km = EXCLUDED.distance_km;
      `, [r.code, r.origin, r.destination, r.origin_city, r.dest_city, r.name, r.weight, r.distance_km]);
    }

    // 2. Seed Airlines
    const airlines = [
      { code: '6E', name: 'IndiGo', market_share: 60.5 },
      { code: 'AI', name: 'Air India', market_share: 26.2 },
      { code: 'SG', name: 'SpiceJet', market_share: 5.8 },
      { code: 'QP', name: 'Akasa Air', market_share: 4.5 },
      { code: 'AIX', name: 'Air India Express', market_share: 3.0 }
    ];

    for (const a of airlines) {
      await query(`
        INSERT INTO airlines (code, name, market_share)
        VALUES ($1, $2, $3)
        ON CONFLICT (code) DO UPDATE SET market_share = EXCLUDED.market_share;
      `, [a.code, a.name, a.market_share]);
    }

    // 3. Seed Data Sources
    const sources = [
      { name: 'Google Flights / SerpApi Engine', status: 'Active', detail: 'Live API polling & price extraction' },
      { name: 'DGCA Official Reports', status: 'Active', detail: 'Monthly capacity & baseline load data' },
      { name: 'Amadeus GDS Feed', status: 'Standby', detail: 'Secondary validation reference' }
    ];

    for (const s of sources) {
      await query(`
        INSERT INTO data_sources (name, status, detail)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET status = EXCLUDED.status, detail = EXCLUDED.detail;
      `, [s.name, s.status, s.detail]);
    }

    // 4. Seed Fare Observations across the past 45 days
    const today = new Date();
    const airlineMultipliers = {
      'IndiGo': 1.0,
      'Air India': 1.08,
      'SpiceJet': 0.95,
      'Akasa Air': 0.98
    };

    const routeBaseFares = {
      'DEL-BOM': 3800,
      'DEL-BLR': 4200,
      'BOM-BLR': 3100,
      'DEL-CCU': 3900,
      'BLR-HYD': 2600,
      'DEL-MAA': 4100,
      'BOM-GOI': 2900,
      'DEL-HYD': 3500
    };

    // Lead times: 45d, 30d, 21d, 14d, 7d, 3d, 1d
    const leadTimeMultipliers = {
      45: 1.0,
      30: 1.08,
      21: 1.18,
      14: 1.30,
      7: 1.48,
      3: 1.80,
      1: 2.15
    };

    const leadDays = [45, 30, 21, 14, 7, 3, 1];
    const carrierList = ['IndiGo', 'Air India', 'SpiceJet', 'Akasa Air'];

    console.log('[Seed] Generating calibrated historical observations...');
    const fareInserts = [];

    // Past 45 days history of search observations
    for (let dayOffset = 45; dayOffset >= 0; dayOffset -= 2) {
      const searchDate = new Date(today);
      searchDate.setDate(today.getDate() - dayOffset);
      const searchDateStr = searchDate.toISOString().split('T')[0];

      // Slight upward inflation drift over the 45-day window (+4.2%)
      const inflationDrift = 1.0 + (0.042 * (45 - dayOffset) / 45);

      for (const [routeCode, base] of Object.entries(routeBaseFares)) {
        for (const daysBefore of leadDays) {
          const departureDate = new Date(searchDate);
          departureDate.setDate(searchDate.getDate() + daysBefore);
          const depDateStr = departureDate.toISOString().split('T')[0];

          for (const carrier of carrierList) {
            const mult = airlineMultipliers[carrier] || 1.0;
            const leadMult = leadTimeMultipliers[daysBefore] || 1.0;

            // Small daily volatility noise (+/- 4%)
            const noise = 0.96 + Math.random() * 0.08;
            const totalFare = Math.round(base * mult * leadMult * inflationDrift * noise);
            const flightNumber = `${carrier.substring(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 899)}`;

            fareInserts.push(`('${routeCode}', '${carrier}', '${flightNumber}', '${depDateStr}', '${searchDateStr}', ${daysBefore}, 'Economy', ${totalFare}, 'INR', 'Baseline Historical Seed', '${searchDateStr} 10:00:00+00')`);
          }
        }
      }
    }

    // Insert observations in batches of 500
    const chunkSize = 500;
    for (let i = 0; i < fareInserts.length; i += chunkSize) {
      const chunk = fareInserts.slice(i, i + chunkSize);
      const insertSql = `
        INSERT INTO fare_observations (
          route_code, airline, flight_number, departure_date, booking_date, days_before_departure, fare_class, total_fare, currency, source, fetched_at
        ) VALUES ${chunk.join(', ')};
      `;
      await query(insertSql);
    }
    console.log(`[Seed] Inserted ${fareInserts.length} fare observations.`);

    // 5. Seed Daily Index Series
    const indexInserts = [];
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const calcDate = new Date(today);
      calcDate.setDate(today.getDate() - dayOffset);
      const dateStr = calcDate.toISOString().split('T')[0];

      const progress = (30 - dayOffset) / 30;
      const natIdx = Number((108.5 + progress * 9.9 + (Math.sin(progress * 10) * 0.4)).toFixed(2));
      const southIdx = Number((105.1 + progress * 8.4 + (Math.cos(progress * 8) * 0.3)).toFixed(2));
      const northIdx = Number((109.0 + progress * 11.2 + (Math.sin(progress * 6) * 0.5)).toFixed(2));
      const inflation = Number((3.8 + progress * 0.4).toFixed(2));

      indexInserts.push(`('${dateStr}', ${natIdx}, ${southIdx}, ${northIdx}, ${inflation}, 8)`);
    }

    await query(`
      INSERT INTO index_series (calculation_date, national_index, south_index, north_index, inflation_rate, tracked_routes)
      VALUES ${indexInserts.join(', ')}
      ON CONFLICT (calculation_date) DO UPDATE SET
        national_index = EXCLUDED.national_index,
        south_index = EXCLUDED.south_index,
        north_index = EXCLUDED.north_index,
        inflation_rate = EXCLUDED.inflation_rate;
    `);

    // 6. Seed Anomalies
    const anomalies = [
      { route_code: 'DEL-BOM', detail: 'Sudden 42% fare surge detected on evening peak slots', severity: 'High', fare: 9850, baseline_fare: 6900, pct_change: 42.8 },
      { route_code: 'BOM-GOI', detail: 'Weekend holiday demand spike 28% above 30-day baseline', severity: 'Medium', fare: 6200, baseline_fare: 4840, pct_change: 28.1 },
      { route_code: 'DEL-BLR', detail: 'Early morning slot price suppression (-18% below carrier average)', severity: 'Low', fare: 3450, baseline_fare: 4200, pct_change: -17.9 }
    ];

    for (const a of anomalies) {
      await query(`
        INSERT INTO anomalies (route_code, detail, severity, fare, baseline_fare, pct_change)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [a.route_code, a.detail, a.severity, a.fare, a.baseline_fare, a.pct_change]);
    }

    // 7. Seed Data Quality Runs
    const runTimes = [
      { offsetHours: 2, status: 'Success', records: 1840, duration: 42.5 },
      { offsetHours: 8, status: 'Success', records: 1815, duration: 39.8 },
      { offsetHours: 14, status: 'Success', records: 1850, duration: 44.1 },
      { offsetHours: 20, status: 'Success', records: 1790, duration: 38.4 },
      { offsetHours: 26, status: 'Success', records: 1820, duration: 41.2 },
      { offsetHours: 32, status: 'Warning', records: 1650, duration: 52.0 },
      { offsetHours: 38, status: 'Success', records: 1835, duration: 40.0 }
    ];

    for (const r of runTimes) {
      const runDate = new Date(today.getTime() - r.offsetHours * 3600000);
      await query(`
        INSERT INTO data_quality_runs (run_time, status, records_ingested, duration_seconds)
        VALUES ($1, $2, $3, $4);
      `, [runDate.toISOString(), r.status, r.records, r.duration]);
    }

    console.log('[Seed] Database initialization and seeding completed successfully.');
  } catch (err) {
    console.error(`[Seed] Error seeding database: ${err.message}`);
  }
}

if (require.main === module) {
  const { initDatabase } = require('../config/database');
  (async () => {
    await initDatabase();
    await seedDatabase(true);
    process.exit(0);
  })();
}

module.exports = { seedDatabase };
