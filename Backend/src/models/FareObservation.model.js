/**
 * FareObservation Model Definition
 * Represents an individual flight price observation on a specific route
 */
class FareObservation {
  constructor({ id, route_code, airline, flight_number, departure_date, booking_date, days_before_departure, fare_class, total_fare, currency, source, fetched_at }) {
    this.id = id;
    this.routeCode = route_code;
    this.airline = airline;
    this.flightNumber = flight_number;
    this.departureDate = departure_date;
    this.bookingDate = booking_date;
    this.daysBeforeDeparture = parseInt(days_before_departure, 10);
    this.fareClass = fare_class;
    this.totalFare = Number(total_fare);
    this.currency = currency;
    this.source = source;
    this.fetchedAt = fetched_at;
  }
}

module.exports = FareObservation;
