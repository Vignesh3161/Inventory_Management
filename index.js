import app from './src/app.js';
import env from './src/config/env.js';
import pool from './src/config/db.js';

const PORT = env.port;

const startServer = async () => {
  try {
    // Verify connection to the PostgreSQL database
    await pool.query('SELECT NOW()');
    console.log('Database connectivity verified successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
