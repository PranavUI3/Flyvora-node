/**
 * IndexSeries Model Definition
 * Represents calculated daily airfare price indices
 */
class IndexSeries {
  constructor({ id, calculation_date, national_index, south_index, north_index, inflation_rate, tracked_routes, created_at }) {
    this.id = id;
    this.calculationDate = calculation_date;
    this.nationalIndex = Number(national_index);
    this.southIndex = Number(south_index);
    this.northIndex = Number(north_index);
    this.inflationRate = Number(inflation_rate);
    this.trackedRoutes = parseInt(tracked_routes, 10);
    this.createdAt = created_at;
  }
}

module.exports = IndexSeries;
