import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const runInit = async () => {
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('Connected to database to initialize schema...');

    const schemaPath = path.resolve('database', 'schema.sql');
    const seedPath = path.resolve('database', 'seed.sql');

    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('Schema initialized successfully.');

    console.log('Reading seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    await client.query(seedSql);
    console.log('Seed data inserted successfully.');

  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    await client.end();
  }
};

runInit();
