# Flyvora Airfare Price Index

Flyvora is a Smart India Hackathon 2026 prototype for exploring changes in Indian domestic airfares. It combines an Express/PostgreSQL backend with dashboards for inflation analysis, route monitoring, airline comparison, lead-time analysis, and data-quality reporting.

The repository includes a working local backend, database seeding, API routes, and an optional SerpApi Google Flights ingestion pipeline. Dashboard data is served through the backend API after the database has been initialized.

## Problem statement

Most domestic flight tickets are now booked online, while airfare data for inflation measurement has historically been collected from a limited number of offline sources. APIx is intended to help measure fares across routes and booking windows, then surface the resulting price movements in a clear dashboard.

This is an airfare measurement and analytics concept, not a flight-price prediction application.

## Implemented dashboard views

| View | Location | Highlights |
| --- | --- | --- |
| Overview | `Frontend/Overview/index.html` | Headline airfare index, sector volatility, route ranking, lead-time trends, airline comparison, and anomaly alerts. |
| Route Explorer | `Frontend/Route_Heatmap+Trends/routeheatmap.html` | Route price trend and route heatmap. |
| Lead-Time Analysis | `Frontend/Lead-Time/index.html` | Fare elasticity by days to departure, checkpoint prices, and cross-route comparison. |
| Airline Comparison | `Frontend/Airline/airline-comparison.html` | Airline ranking, fares by route, and 30-day carrier index trends. |
| Data Quality | `Frontend/Data-quality/data-quality.html` | Ingestion volumes, validation pass rate, source status, and recent pipeline runs. |

## Technology

- Node.js and Express
- PostgreSQL via `pg`
- HTML, CSS, and vanilla JavaScript
- Tailwind CSS v4 for locally generated stylesheets
- Chart.js, loaded from a CDN, for dashboard charts
- Separate npm/Tailwind setup for each dashboard view

## Project structure

```text
Flyvora-nodejs/
├── Frontend/
│   ├── Overview/                 # Main dashboard
│   ├── Route_Heatmap+Trends/     # Route Explorer dashboard
│   ├── Lead-Time/                # Lead-time analysis dashboard
│   ├── Airline/                  # Airline comparison dashboard
│   └── Data-quality/             # Data-quality dashboard
├── Backend/                      # Express API, database, and ingestion
└── README.md
```

Each dashboard directory contains its page markup and scripts, plus `src/input.css` and the generated `src/output.css` stylesheet. Generated CSS and dependency folders are ignored by Git.

## Run locally

### Prerequisites

- Node.js 18 or later
- PostgreSQL 14 or later
- A modern web browser

### Configure the backend

Set the PostgreSQL values in `Backend/environment.env` for your machine. The backend also accepts a root `.env` file. Do not commit credentials or API keys.

Create the `flyvora` database in PostgreSQL, then install and start the backend:

```bash
cd Backend
npm install
npm start
```

The server initializes its tables and seeds the database when it starts. It serves the dashboards and API from `http://localhost:8000`:

- Overview: `http://localhost:8000/Overview/index.html`
- Route Explorer: `http://localhost:8000/Route_Heatmap+Trends/routeheatmap.html`
- Lead-Time Analysis: `http://localhost:8000/Lead-Time/lead-time.html`
- Airline Comparison: `http://localhost:8000/Airline/airline-comparison.html`
- Data Quality: `http://localhost:8000/Data-quality/data-quality.html`
- Health check: `http://localhost:8000/api/health`

For development with automatic server reloads, use `npm run dev` in `Backend`.

### Optional live ingestion

Set `SERPAPI_KEY` in the backend environment file to enable SerpApi collection. `AUTO_COLLECT_ON_STARTUP=false` keeps collection disabled at startup; set it to `true` only when live collection is configured. Scheduled collection runs at the interval set by `COLLECTION_INTERVAL_HOURS`.

You can also trigger a collection manually from `Backend`:

```bash
npm run collect
```

### Rebuild dashboard styles

Each page has its own package setup. Run the following in the directory of the page you are working on:

```bash
npm install
npm run build
```

Some dashboards use `npm run watch` for continuous Tailwind compilation. The backend serves the generated files directly, so restart is not required after a CSS rebuild.

## Current status and next steps

The project is a hackathon prototype. The following areas still need production hardening:

- Authorised data collection and provider reliability controls
- Stronger authentication, authorization, and API validation
- Production database migrations, backups, and deployment configuration
- Automated tests and monitoring for the ingestion pipeline and index calculations
- Consolidating the separate dashboard folders into a routed application

## Ethical data collection

Any data collection should respect source terms, `robots.txt`, rate limits, and applicable law. Use provider APIs where available, protect API credentials, and do not automate sources that prohibit it.
