/**
 * Airline Validation Schemas
 */
function validateAirline(data) {
  const errors = [];
  if (!data.code || typeof data.code !== 'string') errors.push('Airline code is required');
  if (!data.name || typeof data.name !== 'string') errors.push('Airline name is required');
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateAirline };
