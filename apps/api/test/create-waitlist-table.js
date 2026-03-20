const mysql = require('mysql2/promise');

async function createTable() {
  const conn = await mysql.createConnection({
    host: 'host.docker.internal',
    port: 3309,
    user: 'root',
    password: 'password',
    database: 'halaidb',
  });

  const sql = `
    CREATE TABLE IF NOT EXISTS waitlists (
      id INT AUTO_INCREMENT PRIMARY KEY,
      onboarding_session_id INT NULL,
      status VARCHAR(64) DEFAULT 'new',
      source VARCHAR(64) DEFAULT 'onboarding',
      responsavel_nome VARCHAR(255) NULL,
      responsavel_email VARCHAR(255) NULL,
      responsavel_telefone VARCHAR(255) NULL,
      razao_social VARCHAR(255) NULL,
      cnpj VARCHAR(32) NULL,
      metadata JSON NULL,
      submitted_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX(cnpj),
      INDEX(responsavel_email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  await conn.query(sql);
  console.log('Table waitlists created or already exists.');
  await conn.end();
}

createTable().catch(console.error);
