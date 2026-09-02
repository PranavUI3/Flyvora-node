# Frontend Product Requirements Document (PRD)

## Product

**Airfare Price Index System (SIH26056)** is a dashboard for monitoring Indian domestic airfare movement. It turns collected fare observations into clear, decision-ready views of the national price index, routes, booking lead times, airlines, and data-pipeline health.

This dashboard supports inflation analysis; it is not a consumer flight-booking or fare-prediction product.

## Problem and goal

Air fares fluctuate rapidly and are predominantly purchased online, making manual price collection incomplete and slow. Analysts need one trustworthy interface to understand price movements, compare segments, and identify collection or quality issues.

The frontend must enable a user to:

- understand the national airfare index and its recent movement at a glance;
- identify volatile routes and fare anomalies;
- analyse how prices change from 45 days before departure to one day before departure;
- compare carriers on fares, volume, and trends; and
- verify the health and coverage of the underlying data pipeline.

## Users

| User | Need |
|---|---|
| MoSPI/NSO analyst | Monitor inflation-related airfare indicators and investigate changes. |
| Aviation or policy researcher | Compare routes, carriers, regions, and booking windows. |
| Data operations team | Check ingestion, validation, sources, and recent pipeline runs. |

## Scope

### Included MVP

- India domestic airfare analytics for the configured routes and carriers.
- Five linked dashboard pages, responsive for desktop and smaller screens.
- Live backend integration for dashboard data, chart exploration, route comparison, and refresh actions.
- Clear display of index, fares, dates, weights, counts, source status, and anomalies.

### Excluded

- Flight search, ticket purchase, or fare prediction.
- Public user registration, payments, or booking management.
- Editing source records from the dashboard.
- CAPTCHA bypassing or collection that conflicts with a source's policies.

## Information architecture

Persistent navigation links the five views below. The active page must be visibly highlighted.

| Page | Purpose | Primary content |
|---|---|---|
| Overview | Executive snapshot | National index, change, data freshness, route count, index trend, volatility ranking, lead-time curve, airline comparison, anomaly alerts. |
| Route Explorer | Investigate a selected city pair | Route and date-range selectors, average fare, 30-day movement, index weight, observation count, route-vs-national trend, heatmap, airline breakdown. |
| Lead-Time Analysis | Quantify booking-window effect | Route/class/airline/window filters, key metrics, T+45 to T+1 curve, checkpoint fare breakdown, cross-route elasticity comparison. |
| Airline Comparison | Compare carrier performance | Date/region/class/airline filters, cheapest/priciest/volume KPIs, average-fare chart, airline ranking, route grouping, 30-day carrier trends. |
| Data Quality | Provide pipeline transparency | Date/source filters, pipeline uptime, ingested records, validation failures, last successful run, ingestion and pass-rate trends, source status, run history. |

## Functional requirements

### Shared requirements

1. The header shall identify the product as **Airfare Index System (SIH26056)** and provide navigation to every page.
2. Implemented date and route filters shall update all visuals and KPIs that the backend supports within their page using the same query context. Remaining filters require backend query support before they can be enabled.
3. Refresh shall fetch the latest available data and show a pending state. API failures are logged to the browser console; visible inline error states remain required work.
4. Charts shall provide legends, labelled axes, tooltips, accessible text alternatives, and a no-data state.
5. Currency shall use INR (`₹`) and percentage changes shall indicate direction with colour and text, rather than colour alone.
6. Dates, data timestamp, methodology/version, and applicable filter context shall be displayed wherever values can be interpreted incorrectly without them.

### Overview

1. Display the national airfare index, period-on-period change, data freshness, and number of tracked routes.
2. Plot national and regional index movement over time.
3. Rank routes by weighted volatility/change and visually flag high-risk values.
4. Show a median-fare-by-lead-time curve.
5. Provide tabs for airline comparison and live anomaly alerts.

### Route Explorer

1. Allow selection of a route and time range.
2. Show average fare, 30-day change, index weight, and observation count for the selection.
3. Compare the selected route's trend against the national average.
4. Show a sortable route heatmap/ranking and an airline-level breakdown for the selected route.

### Lead-Time Analysis

1. Filter results by route, travel class, airline, and booking window.
2. Plot price versus days to departure across T+45, T+30, T+15, T+7, and T+1.
3. Provide checkpoint prices and compare elasticity across key routes.

### Airline Comparison

1. Filter results by period, region/sector, class, and airline.
2. Identify the cheapest and priciest carrier by average fare and the market leader by observed volume.
3. Show an average-fare chart, ranked carrier table, fare-by-route view, and 30-day index trend by carrier.

### Data Quality

1. Filter quality metrics by date range and source.
2. Show uptime, ingestion volume, validation failures, and the last successful collection run.
3. Plot 30-day ingestion volume and validation pass rate.
4. List source availability/status and recent pipeline runs, including failures where applicable.

## Data and integration requirements

The UI consumes the Flyvora FastAPI backend through the shared `Frontend/api.js` client. By default it uses `http://localhost:8000/api`; deployments may override this before the page scripts load by setting `window.FLYVORA_API_BASE`.

| Page | Backend endpoints |
|---|---|
| Overview | `/dashboard/overview/summary`, `/analytics/index-trend`, `/routes/ranking`, `/analytics/lead-time`, `/airlines/comparison`, `/analytics/anomalies` |
| Route Explorer | `/routes`, `/routes/{route_code}/summary`, `/routes/ranking` |
| Lead-Time Analysis | `/routes`, `/analytics/lead-time`, `/analytics/lead-time/checkpoints`, `/analytics/lead-time/compare` |
| Airline Comparison | `/airlines/comparison`, `/airlines/route-matrix`, `/airlines/index-trend` |
| Data Quality | `/data-quality/summary`, `/data-quality/ingestion-volume`, `/data-quality/validation-rate`, `/data-quality/sources`, `/data-quality/runs` |

The Overview, Route Explorer, and Data Quality date-range controls pass a `days` query parameter to endpoints that support it. Route Explorer also passes the selected route code. Other visible filters remain UI-only until the backend exposes matching query parameters.

For local development, run the API at port `8000` and serve the frontend from an origin allowed by `Backend/.env` (`3000`, `5173`, or `5500` by default). The backend requires PostgreSQL and Python 3.12 or 3.13 for the pinned dependencies.

Minimum observation fields: `origin`, `destination`, `airline`, `travel_date`, `search_date`, `advance_days`, `fare_class`, `base_fare`, `tax`, `fees`, `total_fare`, `availability`, and `timestamp`.

The backend exposes aggregated data for index trends, route weights/rankings, lead-time series, airline summaries, anomaly alerts, source status, and pipeline runs. Future response versions should include `generated_at`, applied filters, and an index/methodology version.

## UX and visual requirements

- Use the existing dark, data-dense dashboard style: slate surfaces with blue emphasis and semantic green, amber, and red states.
- Layout must remain usable at mobile widths: controls wrap or stack, charts retain legible labels, and data tables scroll horizontally when necessary.
- Use consistent loading skeletons/spinners, empty states, and retry actions.
- Charts must remain understandable without hover-only content.
- Meet WCAG 2.1 AA contrast expectations, provide keyboard-accessible controls, visible focus states, semantic headings, and labelled form inputs.

## Non-functional requirements

- Initial dashboard data should render within 3 seconds on a typical broadband connection; filter changes should complete within 2 seconds where cached aggregates are available.
- The page must not fail completely when a single chart endpoint fails; show an isolated error state instead.
- Do not expose collection credentials or raw personally identifiable information in the browser.
- Use HTTPS in deployed environments and validate API response shapes before rendering.
- Support current Chromium, Firefox, Safari, and Edge releases.

## Success measures

- Analysts can identify the national index, its period change, and source freshness in under 30 seconds.
- A route, lead-time window, or airline comparison can be reached and filtered in three interactions or fewer from the relevant page.
- At least 95% of successful dashboard data requests render without client-side errors.
- Data-quality issues and high-severity anomalies are visible without requiring chart inspection.

## Delivery and acceptance criteria

The frontend is accepted when:

1. All five pages navigate correctly and maintain an active-navigation state.
2. Each selector affects the relevant KPIs, tables, and charts using live API data.
3. Loading, empty, and visible API-error states are implemented for every data region.
4. Route ranks, airline ranks, trends, and quality figures reconcile with the backend response for an identical filter set.
5. The responsive layout and keyboard navigation work on desktop and mobile viewport tests.
6. Demo values are clearly removed or labelled as demo data before production release.

## Current implementation notes

The `Frontend` folder contains standalone HTML pages with page-specific JavaScript, a shared `api.js` client, and Tailwind-generated CSS. Charts are rendered with Chart.js. The five dashboards now render their KPIs, tables, and charts from FastAPI responses; the existing demo datasets remain only as initial chart placeholders while live requests are in flight. Interactive behaviour includes API-backed refresh, route selection, supported date-range filtering, tab switching, and route heatmap sorting.

Current follow-up work: add backend support for all visible filters, visible loading/empty/error states, response metadata, and end-to-end browser tests against a seeded PostgreSQL database.
