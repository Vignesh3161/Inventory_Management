import { sendError } from '../utils/response.js';

export const notFound = (req, res, next) => {
  return sendError(res, 'API endpoint not found', null, 404);
};
