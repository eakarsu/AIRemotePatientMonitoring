import pool from './database.js';
import schema from './schema.js';
import seedData from './seed.js';

try {
  await pool.query('BEGIN');
  await pool.query(schema);
  await pool.query(seedData);
  await pool.query('COMMIT');
  console.log('Database schema and demo data initialized');
} catch (error) {
  await pool.query('ROLLBACK');
  console.error('Database initialization failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
