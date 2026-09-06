/**
 * Airline Model Definition
 * Represents an airline carrier operating domestic routes
 */
class Airline {
  constructor({ id, code, name, market_share, created_at }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.marketShare = Number(market_share);
    this.createdAt = created_at;
  }
}

module.exports = Airline;
