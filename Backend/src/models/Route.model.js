/**
 * Route Model Definition
 * Represents a tracked domestic Indian air corridor
 */
class Route {
  constructor({ id, code, origin, destination, origin_city, dest_city, name, weight, distance_km, created_at }) {
    this.id = id;
    this.code = code;
    this.origin = origin;
    this.destination = destination;
    this.originCity = origin_city;
    this.destCity = dest_city;
    this.name = name;
    this.weight = Number(weight);
    this.distanceKm = distance_km;
    this.createdAt = created_at;
  }
}

module.exports = Route;
