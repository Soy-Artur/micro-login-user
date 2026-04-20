const mysql = require('mysql2/promise');

async function eliminarColumnaUsername() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'dblogin'
    });

    try {
        console.log('🗑️ Eliminando columna username de tabla clientes...');

        // Verificar datos actuales
        console.log('\n📊 Verificando datos antes de eliminar columna...');
        
        const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM clientes');
        const [nombresRows] = await connection.execute('SELECT COUNT(*) as total FROM clientes WHERE nombres IS NOT NULL AND nombres != ""');
        const [apellidosRows] = await connection.execute('SELECT COUNT(*) as total FROM clientes WHERE apellidos IS NOT NULL AND apellidos != ""');
        
        console.log(`   Total clientes: ${totalRows[0].total}`);
        console.log(`   Con nombres: ${nombresRows[0].total}`);
        console.log(`   Con apellidos: ${apellidosRows[0].total}`);

        // Eliminar columna username
        console.log('\n🚮 Eliminando columna username...');
        await connection.execute('ALTER TABLE clientes DROP COLUMN username');
        
        console.log('✅ Columna username eliminada exitosamente');

        // Verificar estructura final
        console.log('\n📋 Estructura final de la tabla:');
        const [columns] = await connection.execute('DESCRIBE clientes');
        console.table(columns.map(col => ({
            Field: col.Field,
            Type: col.Type,
            Null: col.Null,
            Key: col.Key,
            Default: col.Default
        })));

    } catch (error) {
        console.error('❌ Error eliminando columna username:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

// Ejecutar
if (require.main === module) {
    eliminarColumnaUsername();
}

module.exports = { eliminarColumnaUsername };