# Airfare Price Index (APIx)

APIx is a Smart India Hackathon 2026 prototype for exploring changes in Indian domestic airfares. It presents airfare-index insights through a dashboard designed for inflation analysis and route-level monitoring.

This repository currently contains the front-end dashboard prototype. The views use demonstration data in the browser; a backend, data-ingestion pipeline, and production API are not yet included.

## Problem statement

Most domestic flight tickets are now booked online, while airfare data for inflation measurement has historically been collected from a limited number of offline sources. APIx is intended to help measure fares across routes and booking windows, then surface the resulting price movements in a clear dashboard.

This is an airfare measurement and analytics concept, not a flight-price prediction application.

## Implemented dashboard views

| View | Location | Highlights |
| --- | --- | --- |
| Overview | `Frontend/Overview/index.html` | Headline airfare index, sector volatility, route ranking, lead-time trends, airline comparison, and anomaly alerts. |
| Route Explorer | `Frontend/Route Heatmap+Trends/index.html` | Route price trend and route heatmap. |
| Lead-Time Analysis | `Frontend/Lead-Time/index.html` | Fare elasticity by days to departure, checkpoint prices, and cross-route comparison. |
| Airline Comparison | `Frontend/Aireline/airline-comparison.html` | Airline ranking, fares by route, and 30-day carrier index trends. |
| Data Quality | `Frontend/Data-quality/data-quality.html` | Ingestion volumes, validation pass rate, source status, and recent pipeline runs. |

## Technology

- HTML, CSS, and vanilla JavaScript
- Tailwind CSS v4 for locally generated stylesheets
- Chart.js, loaded from a CDN, for dashboard charts
- Separate npm/Tailwind setup for each dashboard view

## Project structure

```text
Flyvora/
├── Frontend/
│   ├── Overview/                 # Main dashboard
│   ├── Route Heatmap+Trends/     # Route Explorer dashboard
│   ├── Lead-Time/                # Lead-time analysis dashboard
│   ├── Aireline/                 # Airline comparison dashboard
│   └── Data-quality/             # Data-quality dashboard
├── Backend/                      # Reserved for future backend work
└── Readme.md
```

Each dashboard directory contains its page markup and scripts, plus `src/input.css` and the generated `src/output.css` stylesheet.

## Run locally

### Prerequisites

- Node.js 18 or later (only required when regenerating Tailwind CSS)
- A modern web browser

### View a dashboard

Open the relevant HTML file in a browser. For the most reliable local asset loading, serve the repository from its root with a simple static server, for example:

```bash
npx serve .
```

Then open one of the page paths listed above at the local URL printed by the server.

### Rebuild dashboard styles

Each page has its own package setup. Run the following in the directory of the page you are working on:

```bash
npm install
npm run build
```

For continuous Tailwind compilation, use `npm run watch` where that script is available.

## Current status and next steps

The front end is a visual prototype with client-side sample data. The following are planned but not yet implemented in this repository:

- Authorised data collection and scheduled ingestion
- Cleaning, normalisation, and persistent storage
- Statistical index calculation and validation
- Backend API integration and live dashboard data
- Consolidating the separate dashboard folders into a routed application

## Ethical data collection

Any future data collection should respect source terms, `robots.txt`, rate limits, and applicable law. Sources that do not permit automation
