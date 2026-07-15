import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  return sendError(res, message, err, status);
};
