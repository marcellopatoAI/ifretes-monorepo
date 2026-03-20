import { createPool } from 'mysql2/promise';

async function listTables() {
  const pool = createPool({
    host: 'host.docker.internal',
    port: 3309,
    user: 'root',
    password: 'password',
    database: 'halaidb',
  });

  const [rows] = await pool.query('SHOW TABLES');
  console.log('Tables in halaidb:', JSON.stringify(rows, null, 2));
  await pool.end();
}

listTables().catch(console.error);
