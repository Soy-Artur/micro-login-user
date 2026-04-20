#!/usr/bin/env node

// Script de limpieza inmediata de sesiones acumuladas
// Ejecutar: node scripts/cleanup-sessions-now.js

const { query } = require('../src/config/database');
const logger = require('../src/config/logger');

async function cleanupAllSessions() {
  try {
    console.log('🧹 ========================================');
    console.log('🧹 LIMPIEZA INMEDIATA DE SESIONES BASURA');
    console.log('🧹 ========================================\n');
    
    // Conectar a la base de datos
    console.log('📊 Analizando estado actual...');
    
    // Contar sesiones totales
    const totalSessions = await query('SELECT COUNT(*) as total FROM sesiones');
    const total = totalSessions[0].total;
    console.log(`📊 Sesiones totales encontradas: ${total}`);
    
    if (total === 0) {
      console.log('✅ No hay sesiones para limpiar.');
      process.exit(0);
    }
    
    // Contar sesiones por usuario
    const sessionsByUser = await query(`
      SELECT usuario_id, COUNT(*) as count 
      FROM sesiones 
      GROUP BY usuario_id 
      HAVING count > 1
      ORDER BY count DESC
    `);
    
    console.log(`👥 Usuarios con múltiples sesiones: ${sessionsByUser.length}`);
    
    if (sessionsByUser.length > 0) {
      console.log('📋 Top usuarios con más sesiones:');
      sessionsByUser.slice(0, 5).forEach(user => {
        console.log(`   • Usuario ${user.usuario_id}: ${user.count} sesiones`);
      });
    }
    
    // Contar sesiones expiradas
    const expiredSessions = await query('SELECT COUNT(*) as total FROM sesiones WHERE expira_en < NOW()');
    const expired = expiredSessions[0].total;
    console.log(`⏰ Sesiones expiradas: ${expired}`);
    
    console.log('\n🧹 Iniciando limpieza...\n');
    
    // 1. Eliminar sesiones expiradas
    console.log('🗑️ Paso 1: Eliminando sesiones expiradas...');
    const deletedExpired = await query('DELETE FROM sesiones WHERE expira_en < NOW()');
    console.log(`   ✅ Eliminadas ${deletedExpired.affectedRows} sesiones expiradas`);
    
    // 2. Eliminar sesiones inactivas
    console.log('🗑️ Paso 2: Eliminando sesiones inactivas...');
    const deletedInactive = await query('DELETE FROM sesiones WHERE activo = FALSE');
    console.log(`   ✅ Eliminadas ${deletedInactive.affectedRows} sesiones inactivas`);
    
    // 3. Eliminar sesiones antiguAS (más de 7 días)
    console.log('🗑️ Paso 3: Eliminando sesiones muy antiguas...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const deletedOld = await query('DELETE FROM sesiones WHERE created_at < ?', [sevenDaysAgo]);
    console.log(`   ✅ Eliminadas ${deletedOld.affectedRows} sesiones muy antiguas (>7 días)`);
    
    // 4. Mantener solo la sesión más reciente por usuario
    console.log('🗑️ Paso 4: Manteniendo solo 1 sesión por usuario...');
    const deletedDuplicates = await query(`
      DELETE s1 FROM sesiones s1
      INNER JOIN sesiones s2
      WHERE s1.usuario_id = s2.usuario_id
        AND s1.created_at < s2.created_at
    `);
    console.log(`   ✅ Eliminadas ${deletedDuplicates.affectedRows} sesiones duplicadas`);
    
    // Estado final
    console.log('\n📊 Estado después de la limpieza...');
    const finalSessions = await query('SELECT COUNT(*) as total FROM sesiones');
    const finalTotal = finalSessions[0].total;
    const totalCleaned = total - finalTotal;
    
    console.log(`📊 Sesiones restantes: ${finalTotal}`);
    console.log(`🗑️ Total eliminadas: ${totalCleaned}`);
    
    // Mostrar sesiones por usuario después de limpieza
    const finalByUser = await query(`
      SELECT usuario_id, COUNT(*) as count 
      FROM sesiones 
      GROUP BY usuario_id 
      ORDER BY count DESC
    `);
    
    console.log(`👥 Usuarios con sesiones activas: ${finalByUser.length}`);
    
    console.log('\n✅ =======================================');
    console.log('✅ LIMPIEZA COMPLETADA EXITOSAMENTE');
    console.log('✅ =======================================');
    console.log(`✅ Sesiones eliminadas: ${totalCleaned}`);
    console.log(`✅ Sesiones restantes: ${finalTotal}`);
    console.log('✅ Base de datos optimizada');
    console.log('\n🚀 El sistema ahora mantendrá automáticamente');
    console.log('🚀 las sesiones limpias en futuros logins.\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    console.error('❌ Verifica que:');
    console.error('❌ 1. El microservicio esté configurado correctamente');
    console.error('❌ 2. La base de datos esté accesible');
    console.error('❌ 3. La tabla "sesiones" exista');
    process.exit(1);
  }
}

// Mostrar advertencia y pedir confirmación
console.log('⚠️  ADVERTENCIA: Este script eliminará sesiones de la base de datos');
console.log('⚠️  Esto desconectará a usuarios actualmente conectados');
console.log('⚠️  ¿Estás seguro? (Ctrl+C para cancelar)\n');

// Esperar 3 segundos antes de proceder
setTimeout(() => {
  console.log('🚀 Procediendo con la limpieza...\n');
  cleanupAllSessions();
}, 3000);