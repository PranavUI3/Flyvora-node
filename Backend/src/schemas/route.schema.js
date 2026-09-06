/**
 * Route Validation Schemas
 */
function validateRoute(data) {
  const errors = [];
  if (!data.code || typeof data.code !== 'string') errors.push('Route code is required');
  if (!data.origin || typeof data.origin !== 'string') errors.push('Origin airport code is required');
  if (!data.destination || typeof data.destination !== 'string') errors.push('Destination airport code is required');
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateRoute };
