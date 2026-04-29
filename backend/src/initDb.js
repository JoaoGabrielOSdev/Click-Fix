const fs = require('fs');
const path = require('path');
const db = require('./database');

async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Executar o schema
    await db.query(schema);
    
    console.log('✓ Banco de dados inicializado com sucesso!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Erro ao inicializar banco de dados:', err.message);
    process.exit(1);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
