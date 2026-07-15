import pg from 'pg';
import env from './env.js';

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL Database...');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PG client', err);
});

export const query = (text, params) => pool.query(text, params);
export default pool;
