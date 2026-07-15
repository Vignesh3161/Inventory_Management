export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) - User: ${req.user ? req.user.userId : 'Anonymous'}`;
    console.log(logMessage);
  });
  next();
};
