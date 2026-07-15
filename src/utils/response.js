export const sendSuccess = (res, message, result = null, statusCode = 200) => {
  return res.status(statusCode).json({
    Success: true,
    Message: message,
    Result: result,
    StatusCode: statusCode
  });
};

export const sendError = (res, message, error = null, statusCode = 500) => {
  return res.status(statusCode).json({
    Success: false,
    Message: message,
    Result: error ? (error.message || error) : null,
    StatusCode: statusCode
  });
};
