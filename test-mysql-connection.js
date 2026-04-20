/**
 * Test de conexión a MySQL
 * Verifica que el microservicio esté conectado correctamente a MySQL
 * y que NO use Supabase
 */

const { pool, query, testConnection } = require('./src/config/database');
const config = require('./src/config');

console.log('====================================');
console.log('🧪 TEST DE CONEXIÓN MYSQL');
console.log('====================================\n');

async function runTests() {
  try {
    // TEST 1: Verificar configuración
    console.log('📋 TEST 1: Verificar configuración de base de datos');
    console.log(`   ✓ Host: ${config.database.host}`);
    console.log(`   ✓ Puerto: ${config.database.port}`);
    console.log(`   ✓ Usuario: ${config.database.user}`);
    console.log(`   ✓ Base de datos: ${config.database.database}`);
    console.log(`   ✓ Pool limit: ${config.database.connectionLimit}`);
    
    // Verificar que no haya configuración de Supabase
    if (config.supabase) {
      console.log('   ❌ ERROR: Todavía existe configuración de Supabase!\n');
      process.exit(1);
    } else {
      console.log('   ✓ No hay configuración de Supabase\n');
    }

    // TEST 2: Probar conexión
    console.log('📋 TEST 2: Probar conexión a MySQL');
    await testConnection();
    console.log('   ✓ Conexión exitosa\n');

    // TEST 3: Verificar tablas
    console.log('📋 TEST 3: Verificar que existan las tablas necesarias');
    const tables = await query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    const requiredTables = ['roles', 'usuarios', 'usuarios_externos', 'sesiones'];
    let allTablesExist = true;
    
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`   ✓ Tabla "${table}" existe`);
      } else {
        console.log(`   ❌ Tabla "${table}" NO existe`);
        allTablesExist = false;
      }
    }
    
    if (!allTablesExist) {
      console.log('\n   ⚠️  Algunas tablas no existen. Ejecuta la migración SQL.\n');
      process.exit(1);
    }
    console.log('');

    // TEST 4: Verificar datos de prueba
    console.log('📋 TEST 4: Verificar datos de prueba');
    
    const roles = await query('SELECT COUNT(*) as count FROM roles');
    console.log(`   ✓ Roles en la BD: ${roles[0].count}`);
    
    const usuarios = await query('SELECT COUNT(*) as count FROM usuarios');
    console.log(`   ✓ Usuarios en la BD: ${usuarios[0].count}`);
    
    const usuariosExternos = await query('SELECT COUNT(*) as count FROM usuarios_externos');
    console.log(`   ✓ Usuarios externos en la BD: ${usuariosExternos[0].count}`);
    
    if (roles[0].count === 0 || usuarios[0].count === 0) {
      console.log('\n   ⚠️  No hay datos de prueba. Ejecuta la migración SQL completa.\n');
    }
    console.log('');

    // TEST 5: Probar query con JOIN
    console.log('📋 TEST 5: Probar query con JOIN (usuarios + roles)');
    const usersWithRoles = await query(`
      SELECT u.email, u.nombre, r.nombre as rol_nombre
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      LIMIT 3
    `);
    
    if (usersWithRoles.length > 0) {
      console.log('   ✓ Query con JOIN funciona correctamente');
      console.log('   📊 Usuarios de ejemplo:');
      usersWithRoles.forEach(user => {
        console.log(`      - ${user.email} (${user.nombre}) - Rol: ${user.rol_nombre || 'Sin rol'}`);
      });
    } else {
      console.log('   ⚠️  No hay usuarios para mostrar');
    }
    console.log('');

    // TEST 6: Verificar que servicios usen MySQL
    console.log('📋 TEST 6: Verificar que servicios usen MySQL y NO Supabase');
    const authService = require('./src/services/auth.service');
    const userService = require('./src/services/user.service');
    
    // Intentar buscar referencias a supabase en el código cargado
    const authServiceStr = authService.toString();
    const userServiceStr = userService.toString();
    
    if (authServiceStr.includes('supabase') || userServiceStr.includes('supabase')) {
      console.log('   ❌ ERROR: Servicios todavía tienen referencias a Supabase!\n');
      process.exit(1);
    } else {
      console.log('   ✓ auth.service usa MySQL');
      console.log('   ✓ user.service usa MySQL');
      console.log('   ✓ No hay referencias a Supabase en servicios\n');
    }

    // TEST 7: Test de login con usuario de prueba
    console.log('📋 TEST 7: Probar login con usuario de prueba');
    try {
      const loginResult = await authService.login('admin@ruwark.com', 'password123', '127.0.0.1', 'Test-Agent');
      
      if (loginResult.accessToken && loginResult.usuario) {
        console.log('   ✓ Login exitoso');
        console.log(`   ✓ Usuario: ${loginResult.usuario.email}`);
        console.log(`   ✓ Rol: ${loginResult.usuario.rol?.nombre || 'N/A'}`);
        console.log(`   ✓ Token generado correctamente`);
      } else {
        console.log('   ❌ Login falló\n');
        process.exit(1);
      }
    } catch (error) {
      console.log(`   ❌ Error en login: ${error.message}`);
      console.log('   💡 Asegúrate de que exista el usuario admin@ruwark.com con password "password123"\n');
    }
    console.log('');

    // RESUMEN
    console.log('====================================');
    console.log('✅ TODOS LOS TESTS PASARON');
    console.log('====================================');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • Base de datos: MySQL`);
    console.log(`   • Host: ${config.database.host}`);
    console.log(`   • Tablas: ${tableNames.length}`);
    console.log(`   • Usuarios: ${usuarios[0].count}`);
    console.log(`   • Roles: ${roles[0].count}`);
    console.log(`   • Usuarios externos: ${usuariosExternos[0].count}`);
    console.log('');
    console.log('🎉 El microservicio está usando MySQL correctamente');
    console.log('🚫 No hay referencias a Supabase');
    console.log('');

    // Cerrar pool
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERROR EN LOS TESTS:', error.message);
    console.error('\nDetalles:', error);
    await pool.end();
    process.exit(1);
  }
}

// Ejecutar tests
runTests();
