// Script para limpieza automática de sesiones
// Ejecutar este script periódicamente para mantener la base de datos limpia

const { query } = require('../config/database');
const logger = require('../config/logger');

class SessionCleanupService {
  // 🧹 LIMPIEZA AUTOMÁTICA DE SESIONES
  static async runAutomaticCleanup() {
    try {
      logger.info('🕒 Iniciando limpieza automática de sesiones...');
      
      // Contar sesiones antes de la limpieza
      const sessionsBefore = await query('SELECT COUNT(*) as total FROM sesiones');
      const totalBefore = sessionsBefore[0].total;
      
      // 1. Eliminar sesiones expiradas
      const deletedExpired = await query(
        'DELETE FROM sesiones WHERE expira_en < NOW()'
      );
      
      // 2. Eliminar sesiones inactivas
      const deletedInactive = await query(
        'DELETE FROM sesiones WHERE activo = FALSE'
      );
      
      // 3. Eliminar sesiones muy antiguas (más de 7 días)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const deletedOld = await query(
        'DELETE FROM sesiones WHERE created_at < ?',
        [sevenDaysAgo]
      );
      
      // 4. Mantener solo 1 sesión por usuario (la más reciente)
      await query(`
        DELETE s1 FROM sesiones s1
        INNER JOIN sesiones s2
        WHERE s1.usuario_id = s2.usuario_id
          AND s1.created_at < s2.created_at
      `);
      
      // Contar sesiones después de la limpieza
      const sessionsAfter = await query('SELECT COUNT(*) as total FROM sesiones');
      const totalAfter = sessionsAfter[0].total;
      
      const totalCleaned = totalBefore - totalAfter;
      
      logger.info(`✅ Limpieza automática completada:`);
      logger.info(`   📊 Sesiones antes: ${totalBefore}`);
      logger.info(`   📊 Sesiones después: ${totalAfter}`);
      logger.info(`   🗑️ Expiradas eliminadas: ${deletedExpired.affectedRows}`);
      logger.info(`   🗑️ Inactivas eliminadas: ${deletedInactive.affectedRows}`);
      logger.info(`   🗑️ Antiguas eliminadas: ${deletedOld.affectedRows}`);
      logger.info(`   🗑️ Total eliminadas: ${totalCleaned}`);
      
      return {
        before: totalBefore,
        after: totalAfter,
        cleaned: totalCleaned,
        expired: deletedExpired.affectedRows,
        inactive: deletedInactive.affectedRows,
        old: deletedOld.affectedRows
      };
      
    } catch (error) {
      logger.error('❌ Error en limpieza automática de sesiones:', error);
      throw error;
    }
  }

  // 🕒 PROGRAMAR LIMPIEZA AUTOMÁTICA
  static scheduleAutomaticCleanup() {
    // Ejecutar limpieza cada 6 horas
    const SIX_HOURS = 6 * 60 * 60 * 1000;
    
    setInterval(async () => {
      try {
        await this.runAutomaticCleanup();
      } catch (error) {
        logger.error('❌ Error en limpieza programada:', error);
      }
    }, SIX_HOURS);
    
    logger.info('⏰ Limpieza automática de sesiones programada cada 6 horas');
  }

  // 🗑️ LIMPIEZA DE EMERGENCIA (eliminar TODAS las sesiones)
  static async emergencyCleanup() {
    try {
      logger.warn('🚨 EJECUTANDO LIMPIEZA DE EMERGENCIA - ELIMINANDO TODAS LAS SESIONES');
      
      const result = await query('DELETE FROM sesiones');
      
      logger.warn(`🚨 Limpieza de emergencia completada. Eliminadas ${result.affectedRows} sesiones`);
      
      return result.affectedRows;
    } catch (error) {
      logger.error('❌ Error en limpieza de emergencia:', error);
      throw error;
    }
  }
}

module.exports = SessionCleanupService;