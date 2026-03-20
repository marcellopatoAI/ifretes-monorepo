const mysql = require('mysql2/promise');

async function listTables() {
  const conn = await mysql.createConnection({
    host: 'host.docker.internal',
    port: 3309,
    user: 'root',
    password: 'password',
    database: 'halaidb',
  });

  const [rows] = await conn.query('SHOW TABLES');
  console.log('Tables in halaidb:', JSON.stringify(rows, null, 2));
  await conn.end();
}

listTables().catch(console.error);
