const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function ejecutarMigracion() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'dblogin',
        multipleStatements: true
    });

    try {
        console.log('🚀 Iniciando migración de clientes: username → nombres + apellidos');

        // Leer archivo de migración
        const migrationSQL = await fs.readFile(
            path.join(__dirname, '../migrations/update_clientes_nombres_apellidos.sql'),
            'utf8'
        );

        // Ejecutar migración por pasos
        const queries = migrationSQL.split(';').filter(q => q.trim() && !q.trim().startsWith('--'));

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i].trim();
            if (query) {
                console.log(`📋 Ejecutando paso ${i + 1}/${queries.length}`);
                console.log(`   ${query.substring(0, 50)}...`);
                
                await connection.execute(query);
                console.log(`✅ Paso ${i + 1} completado`);
            }
        }

        // Verificar resultados
        console.log('\n📊 Verificando migración...');
        const [rows] = await connection.execute(`
            SELECT id, email, nombres, apellidos, username 
            FROM clientes 
            LIMIT 5
        `);
        
        console.table(rows);

        console.log('\n✅ Migración completada exitosamente');
        
    } catch (error) {
        console.error('❌ Error en migración:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

// Ejecutar migración
if (require.main === module) {
    ejecutarMigracion();
}

module.exports = { ejecutarMigracion };