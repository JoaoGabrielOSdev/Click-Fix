const pool = require('./database');

async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Conexão bem-sucedida!');
    console.log('Hora do banco de dados:', result.rows[0].now);
    
    // Testa se as tabelas estão criadas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\nTabelas encontradas:');
    if (tables.rows.length === 0) {
      console.log('Nenhuma tabela encontrada. Execute o schema.sql para criar as tabelas.');
    } else {
      tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('✗ Erro ao conectar:', err.message);
    process.exit(1);
  }
}

testConnection();
