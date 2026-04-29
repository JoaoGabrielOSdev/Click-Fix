const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'click_fix'
});

pool.on('error', (err) => {
  console.error('Erro inesperado no pool de conexão:', err);
});

pool.on('connect', () => {
  console.log('✓ Conectado ao PostgreSQL com sucesso!');
});

module.exports = pool;
