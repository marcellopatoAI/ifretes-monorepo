const mysql = require('mysql2/promise');

async function checkRecord() {
  const conn = await mysql.createConnection({
    host: 'host.docker.internal',
    port: 3309,
    user: 'root',
    password: 'password',
    database: 'halaidb',
  });

  const [rows] = await conn.query('SELECT * FROM waitlists ORDER BY id DESC LIMIT 1');
  console.log('Last Waitlist Entry:', JSON.stringify(rows, null, 2));
  await conn.end();
}

checkRecord().catch(console.error);
