/**
 * TEMPORAL-STORAGE.JS - Sistema de Almacenamiento Temporal
 * WiseSpend - Control de Gastos Familiares con Navegación por Períodos
 * Versión: 1.0.0
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Storage por períodos (YYYY_MM)
 * ✅ Migración automática desde sistema actual
 * ✅ Compatibilidad 100% con StorageManager existente
 * ✅ Sistema de backup y recuperación
 * ✅ Clonación completa entre períodos
 * ✅ Estados de período (activo, archivado, preparando)
 */

class TemporalStorage {
    constructor() {
        this.currentPeriod = this.getCurrentPeriod();
        this.storageVersion = '1.0.0';

        // Prefijo para el nuevo sistema temporal
        this.temporalPrefix = 'wisespend';

        // Prefijo del sistema actual (para migración)
        this.legacyPrefix = 'presupuesto';

        // Tipos de datos que manejamos
        this.dataTypes = [
            'ingresos',
            'gastos_fijos',
            'gastos_variables',
            'gastos_extras',
            'configuracion',
            'user_data',
            'reportes'
        ];

        // Estados de período
        this.periodStates = {
            ACTIVE: 'active',
            ARCHIVED: 'archived',
            UNLOCKED: 'unlocked',
            PREPARING: 'preparing'
        };

        this.autoSaveInterval = null;
        this.autoSaveDelay = 30000; // 30 segundos para períodos desbloqueados

        this.initializeTemporalSystem();
    }

    /**
     * INICIALIZACIÓN DEL SISTEMA TEMPORAL
     */

    /**
     * Inicializar sistema temporal
     */
    initializeTemporalSystem() {
        console.log('🕐 Inicializando Sistema Temporal WiseSpend...');

        try {
            // 1. Verificar si hay migración pendiente
            this.checkMigrationNeeded();

            // 2. Configurar período actual
            this.setupCurrentPeriod();

            // 3. Verificar integridad de datos
            this.validatePeriodData();

            console.log('✅ Sistema Temporal inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando sistema temporal:', error);
            this.handleTemporalError(error);
        }
    }

    /**
     * Obtener período actual (YYYY_MM)
     */
    getCurrentPeriod() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}_${month}`;
    }

    /**
     * Generar clave de storage temporal
     */
    getTemporalKey(period, dataType) {
        return `${this.temporalPrefix}_${period}_${dataType}`;
    }

    /**
     * Generar clave de configuración de período
     */
    getPeriodConfigKey(period) {
        return `${this.temporalPrefix}_${period}_config`;
    }

    /**
     * Obtener clave de índice de períodos
     */
    getPeriodsIndexKey() {
        return `${this.temporalPrefix}_periods_index`;
    }

    /**
     * MIGRACIÓN DESDE SISTEMA ACTUAL
     */

    /**
     * Verificar si necesita migración desde sistema legacy
     */
    checkMigrationNeeded() {
        const periodsIndex = this.getPeriodsIndex();
        const hasCurrentPeriod = periodsIndex.periods.includes(this.currentPeriod);

        if (!hasCurrentPeriod) {
            console.log('🔄 Migración necesaria desde sistema legacy');
            this.migrateLegacyData();
        }
    }

    /**
     * Migrar datos del sistema actual al temporal
     */
    migrateLegacyData() {
        console.log('🚀 Iniciando migración de datos legacy...');

        try {
            // Crear backup antes de la migración
            this.createLegacyBackup();

            // Mapeo de claves legacy a temporal
            const legacyMapping = {
                'presupuesto_ingresos': 'ingresos',
                'presupuesto_gastos_fijos': 'gastos_fijos',
                'presupuesto_gastos_variables': 'gastos_variables',
                'presupuesto_gastos_extras': 'gastos_extras',
                'presupuesto_configuracion': 'configuracion',
                'presupuesto_user_data': 'user_data',
                'presupuesto_reportes': 'reportes'
            };

            // Migrar cada tipo de dato
            Object.entries(legacyMapping).forEach(([legacyKey, dataType]) => {
                const legacyData = this.getLegacyItem(legacyKey);
                if (legacyData) {
                    this.setPeriodData(this.currentPeriod, dataType, legacyData);
                    console.log(`✅ Migrado: ${legacyKey} → ${dataType}`);
                }
            });

            // Configurar período actual como activo
            this.setPeriodState(this.currentPeriod, this.periodStates.ACTIVE);

            // Actualizar índice de períodos
            this.addPeriodToIndex(this.currentPeriod);

            console.log('✅ Migración completada exitosamente');

        } catch (error) {
            console.error('❌ Error en migración:', error);
            this.restoreLegacyBackup();
            throw error;
        }
    }

    /**
     * Crear backup del sistema legacy
     */
    createLegacyBackup() {
        const backupData = {};

        // Backup de todas las claves legacy
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.legacyPrefix)) {
                backupData[key] = localStorage.getItem(key);
            }
        });

        const backupKey = `${this.temporalPrefix}_legacy_backup`;
        localStorage.setItem(backupKey, JSON.stringify({
            timestamp: new Date().toISOString(),
            data: backupData
        }));

        console.log('💾 Backup legacy creado');
    }

    /**
     * Obtener item del sistema legacy
     */
    getLegacyItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`❌ Error obteniendo legacy item ${key}:`, error);
            return null;
        }
    }

    /**
     * Restaurar backup legacy
     */
    restoreLegacyBackup() {
        try {
            const backupKey = `${this.temporalPrefix}_legacy_backup`;
            const backup = localStorage.getItem(backupKey);

            if (backup) {
                const backupData = JSON.parse(backup);
                Object.entries(backupData.data).forEach(([key, value]) => {
                    localStorage.setItem(key, value);
                });
                console.log('🔄 Backup legacy restaurado');
            }
        } catch (error) {
            console.error('❌ Error restaurando backup legacy:', error);
        }
    }

    /**
     * GESTIÓN DE PERÍODOS
     */

    /**
     * Obtener índice de períodos
     */
    getPeriodsIndex() {
        const indexKey = this.getPeriodsIndexKey();
        const defaultIndex = {
            periods: [],
            currentPeriod: this.currentPeriod,
            lastUpdated: new Date().toISOString()
        };

        try {
            const stored = localStorage.getItem(indexKey);
            return stored ? JSON.parse(stored) : defaultIndex;
        } catch (error) {
            console.error('❌ Error obteniendo índice de períodos:', error);
            return defaultIndex;
        }
    }

    /**
     * Actualizar índice de períodos
     */
    updatePeriodsIndex(index) {
        const indexKey = this.getPeriodsIndexKey();
        index.lastUpdated = new Date().toISOString();

        try {
            localStorage.setItem(indexKey, JSON.stringify(index));
            return true;
        } catch (error) {
            console.error('❌ Error actualizando índice de períodos:', error);
            return false;
        }
    }

    /**
     * Agregar período al índice
     */
    addPeriodToIndex(period) {
        const index = this.getPeriodsIndex();
        if (!index.periods.includes(period)) {
            index.periods.push(period);
            index.periods.sort().reverse(); // Más recientes primero
            this.updatePeriodsIndex(index);
        }
    }

    /**
     * Configurar período actual
     */
    setupCurrentPeriod() {
        const index = this.getPeriodsIndex();

        if (!index.periods.includes(this.currentPeriod)) {
            // Auto-archivo del período anterior si existe
            this.autoArchivePreviousPeriod();

            // Agregar período actual al índice
            this.addPeriodToIndex(this.currentPeriod);

            // Configurar como activo
            this.setPeriodState(this.currentPeriod, this.periodStates.ACTIVE);
        }
    }

    /**
     * Auto-archivar período anterior
     */
    autoArchivePreviousPeriod() {
        const index = this.getPeriodsIndex();
        const currentYear = parseInt(this.currentPeriod.split('_')[0]);
        const currentMonth = parseInt(this.currentPeriod.split('_')[1]);

        index.periods.forEach(period => {
            const [year, month] = period.split('_').map(Number);
            const isEarlier = year < currentYear || (year === currentYear && month < currentMonth);

            if (isEarlier) {
                const state = this.getPeriodState(period);
                if (state === this.periodStates.ACTIVE) {
                    this.setPeriodState(period, this.periodStates.ARCHIVED);
                    console.log(`📁 Período ${period} auto-archivado`);
                }
            }
        });
    }

    /**
     * GESTIÓN DE DATOS POR PERÍODO
     */

    /**
     * Obtener datos de un período específico
     */
    getPeriodData(period, dataType) {
        const key = this.getTemporalKey(period, dataType);

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`❌ Error obteniendo datos ${dataType} para período ${period}:`, error);
            return null;
        }
    }

    /**
     * Establecer datos de un período específico
     */
    setPeriodData(period, dataType, data) {
        const key = this.getTemporalKey(period, dataType);

        try {
            localStorage.setItem(key, JSON.stringify(data));
            this.updateLastSave(period);
            this.dispatchTemporalSaveEvent(period, dataType);
            return true;
        } catch (error) {
            console.error(`❌ Error guardando datos ${dataType} para período ${period}:`, error);
            return false;
        }
    }

    /**
     * Obtener todos los datos de un período
     */
    getAllPeriodData(period) {
        const periodData = {};

        this.dataTypes.forEach(dataType => {
            const data = this.getPeriodData(period, dataType);
            if (data) {
                periodData[dataType] = data;
            }
        });

        return periodData;
    }

    /**
     * Validar integridad de datos del período
     */
    validatePeriodData(period = this.currentPeriod) {
        let isValid = true;
        const issues = [];

        this.dataTypes.forEach(dataType => {
            const data = this.getPeriodData(period, dataType);
            if (!data) {
                issues.push(`Falta ${dataType} en período ${period}`);
                isValid = false;
            }
        });

        if (!isValid) {
            console.warn(`⚠️ Problemas de integridad en período ${period}:`, issues);
        }

        return { isValid, issues };
    }

    /**
     * ESTADOS DE PERÍODO
     */

    /**
     * Obtener estado de un período
     */
    getPeriodState(period) {
        const configKey = this.getPeriodConfigKey(period);
        const config = this.getItem(configKey);
        return config?.state || this.periodStates.ARCHIVED;
    }

    /**
     * Establecer estado de un período
     */
    setPeriodState(period, state) {
        const configKey = this.getPeriodConfigKey(period);
        const config = this.getItem(configKey) || {};

        config.state = state;
        config.lastStateChange = new Date().toISOString();

        // Configuraciones específicas por estado
        switch (state) {
            case this.periodStates.ACTIVE:
                config.isEditable = true;
                config.autoSave = true;
                break;
            case this.periodStates.ARCHIVED:
                config.isEditable = false;
                config.autoSave = false;
                this.stopAutoSave();
                break;
            case this.periodStates.UNLOCKED:
                config.isEditable = true;
                config.autoSave = true;
                config.unlockedAt = new Date().toISOString();
                this.startAutoSave();
                break;
            case this.periodStates.PREPARING:
                config.isEditable = true;
                config.autoSave = false;
                break;
        }

        this.setItem(configKey, config);
        console.log(`🔄 Período ${period} → Estado: ${state}`);
    }

    /**
     * Verificar si período es editable
     */
    isPeriodEditable(period) {
        const state = this.getPeriodState(period);
        return [
            this.periodStates.ACTIVE,
            this.periodStates.UNLOCKED,
            this.periodStates.PREPARING
        ].includes(state);
    }

    /**
     * CLONACIÓN DE PERÍODOS
     */

    /**
     * Clonar período completo
     */
    clonePeriod(sourcePeriod, targetPeriod) {
        console.log(`🔄 Clonando período ${sourcePeriod} → ${targetPeriod}`);

        try {
            // Verificar que el período fuente existe
            const sourceData = this.getAllPeriodData(sourcePeriod);
            if (Object.keys(sourceData).length === 0) {
                throw new Error(`Período fuente ${sourcePeriod} no encontrado`);
            }

            // Crear backup del período target si existe
            this.createPeriodBackup(targetPeriod);

            // Clonar cada tipo de dato
            this.dataTypes.forEach(dataType => {
                const sourceData = this.getPeriodData(sourcePeriod, dataType);
                if (sourceData) {
                    // Clonar profundo para evitar referencias
                    const clonedData = JSON.parse(JSON.stringify(sourceData));

                    // Limpiar datos específicos que no deben clonarse
                    if (dataType === 'gastos_fijos' || dataType === 'gastos_variables') {
                        if (clonedData.items) {
                            clonedData.items.forEach(item => {
                                item.pagado = false; // Resetear estado pagado
                                if (item.fechaPago) delete item.fechaPago;
                            });
                        }
                    }

                    this.setPeriodData(targetPeriod, dataType, clonedData);
                }
            });

            // Configurar período target como preparando
            this.setPeriodState(targetPeriod, this.periodStates.PREPARING);

            // Agregar al índice
            this.addPeriodToIndex(targetPeriod);

            console.log(`✅ Clonación completada: ${sourcePeriod} → ${targetPeriod}`);

            this.dispatchCloneEvent(sourcePeriod, targetPeriod);
            return true;

        } catch (error) {
            console.error('❌ Error en clonación:', error);
            return false;
        }
    }

    /**
     * Crear backup de período antes de clonación
     */
    createPeriodBackup(period) {
        const backupData = this.getAllPeriodData(period);
        if (Object.keys(backupData).length > 0) {
            const backupKey = `${this.temporalPrefix}_backup_${period}_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify({
                period,
                timestamp: new Date().toISOString(),
                data: backupData
            }));
            console.log(`💾 Backup creado para período ${period}`);
        }
    }

    /**
     * DESBLOQUEO TEMPORAL
     */

    /**
     * Desbloquear período archivado
     */
    unlockPeriod(period) {
        console.log(`🔓 Desbloqueando período ${period}`);

        try {
            // Verificar que el período está archivado
            const currentState = this.getPeriodState(period);
            if (currentState !== this.periodStates.ARCHIVED) {
                throw new Error(`Período ${period} no está archivado`);
            }

            // Crear backup antes del desbloqueo
            this.createPeriodBackup(period);

            // Cambiar estado a desbloqueado
            this.setPeriodState(period, this.periodStates.UNLOCKED);

            // Iniciar auto-guardado
            this.startAutoSave();

            console.log(`✅ Período ${period} desbloqueado`);

            this.dispatchUnlockEvent(period);
            return true;

        } catch (error) {
            console.error('❌ Error desbloqueando período:', error);
            return false;
        }
    }

    /**
     * Re-bloquear período (archivar)
     */
    lockPeriod(period) {
        console.log(`🔒 Re-bloqueando período ${period}`);

        try {
            // Cambiar estado a archivado
            this.setPeriodState(period, this.periodStates.ARCHIVED);

            // Detener auto-guardado si no hay otros períodos desbloqueados
            const hasUnlockedPeriods = this.getPeriodsIndex().periods.some(p =>
                this.getPeriodState(p) === this.periodStates.UNLOCKED
            );

            if (!hasUnlockedPeriods) {
                this.stopAutoSave();
            }

            console.log(`✅ Período ${period} re-bloqueado`);

            this.dispatchLockEvent(period);
            return true;

        } catch (error) {
            console.error('❌ Error re-bloqueando período:', error);
            return false;
        }
    }

    /**
     * AUTO-GUARDADO PARA PERÍODOS DESBLOQUEADOS
     */

    /**
     * Iniciar auto-guardado
     */
    startAutoSave() {
        if (this.autoSaveInterval) {
            return; // Ya está activo
        }

        this.autoSaveInterval = setInterval(() => {
            this.performAutoSave();
        }, this.autoSaveDelay);

        console.log('🔄 Auto-guardado temporal iniciado (30s)');
    }

    /**
     * Detener auto-guardado
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏹️ Auto-guardado temporal detenido');
        }
    }

    /**
     * Ejecutar auto-guardado
     */
    performAutoSave() {
        const index = this.getPeriodsIndex();

        index.periods.forEach(period => {
            const state = this.getPeriodState(period);
            if (state === this.periodStates.UNLOCKED || state === this.periodStates.ACTIVE) {
                this.updateLastSave(period);
            }
        });

        console.log('💾 Auto-guardado temporal ejecutado');
    }

    /**
     * Actualizar timestamp de último guardado
     */
    updateLastSave(period) {
        const configKey = this.getPeriodConfigKey(period);
        const config = this.getItem(configKey) || {};
        config.lastSave = new Date().toISOString();
        this.setItem(configKey, config);
    }

    /**
     * COMPATIBILIDAD CON STORAGEMANAGER ACTUAL
     */

    /**
     * Métodos de compatibilidad para mantener la API actual
     */

    // Métodos que redirigen al período actual
    getIngresos() {
        return this.getPeriodData(this.currentPeriod, 'ingresos');
    }

    setIngresos(data) {
        return this.setPeriodData(this.currentPeriod, 'ingresos', data);
    }

    getGastosFijos() {
        return this.getPeriodData(this.currentPeriod, 'gastos_fijos');
    }

    setGastosFijos(data) {
        return this.setPeriodData(this.currentPeriod, 'gastos_fijos', data);
    }

    getGastosVariables() {
        return this.getPeriodData(this.currentPeriod, 'gastos_variables');
    }

    setGastosVariables(data) {
        return this.setPeriodData(this.currentPeriod, 'gastos_variables', data);
    }

    getGastosExtras() {
        return this.getPeriodData(this.currentPeriod, 'gastos_extras');
    }

    setGastosExtras(data) {
        return this.setPeriodData(this.currentPeriod, 'gastos_extras', data);
    }

    getConfiguracion() {
        return this.getPeriodData(this.currentPeriod, 'configuracion');
    }

    setConfiguracion(data) {
        return this.setPeriodData(this.currentPeriod, 'configuracion', data);
    }

    getUserData() {
        return this.getPeriodData(this.currentPeriod, 'user_data');
    }

    setUserData(data) {
        return this.setPeriodData(this.currentPeriod, 'user_data', data);
    }

    getDashboardData() {
        return this.getAllPeriodData(this.currentPeriod);
    }

    /**
     * UTILIDADES Y EVENTOS
     */

    /**
     * Métodos de utilidad compartidos
     */
    getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`❌ Error obteniendo ${key}:`, error);
            return null;
        }
    }

    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`❌ Error guardando ${key}:`, error);
            return false;
        }
    }

    /**
     * Limpiar período específico
     */
    clearPeriod(period) {
        console.log(`🗑️ Limpiando período ${period}`);

        this.dataTypes.forEach(dataType => {
            const key = this.getTemporalKey(period, dataType);
            localStorage.removeItem(key);
        });

        // Remover configuración del período
        const configKey = this.getPeriodConfigKey(period);
        localStorage.removeItem(configKey);

        // Actualizar índice
        const index = this.getPeriodsIndex();
        index.periods = index.periods.filter(p => p !== period);
        this.updatePeriodsIndex(index);
    }

    /**
     * Manejo de errores temporal
     */
    handleTemporalError(error) {
        console.error('🚨 Error en sistema temporal:', error);

        // Intentar recuperación básica
        try {
            this.restoreLegacyBackup();
        } catch (recoveryError) {
            console.error('❌ Error en recuperación:', recoveryError);
        }
    }

    /**
     * EVENTOS PERSONALIZADOS
     */

    dispatchTemporalSaveEvent(period, dataType) {
        const event = new CustomEvent('temporalStorageSaved', {
            detail: { period, dataType, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }

    dispatchCloneEvent(sourcePeriod, targetPeriod) {
        const event = new CustomEvent('periodCloned', {
            detail: { sourcePeriod, targetPeriod, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }

    dispatchUnlockEvent(period) {
        const event = new CustomEvent('periodUnlocked', {
            detail: { period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }

    dispatchLockEvent(period) {
        const event = new CustomEvent('periodLocked', {
            detail: { period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }

    /**
     * DEBUG Y INFORMACIÓN
     */

    getTemporalInfo() {
        const index = this.getPeriodsIndex();
        const periodStates = {};

        index.periods.forEach(period => {
            periodStates[period] = {
                state: this.getPeriodState(period),
                isEditable: this.isPeriodEditable(period),
                dataIntegrity: this.validatePeriodData(period)
            };
        });

        return {
            currentPeriod: this.currentPeriod,
            totalPeriods: index.periods.length,
            periods: index.periods,
            periodStates,
            autoSaveActive: !!this.autoSaveInterval
        };
    }

    /**
     * Destructor
     */
    destroy() {
        this.stopAutoSave();
        console.log('🔧 TemporalStorage destruido');
    }
    /**
     * Establecer período actual
     */
    setCurrentPeriod(period) {
        console.log(`🕐 Cambiando período temporal: ${this.currentPeriod} → ${period}`);
        this.currentPeriod = period;
        this.setupCurrentPeriod();
        return true;
    }

    // Métodos CRUD faltantes para compatibilidad con HybridStorageManager
    addIngreso(ingreso) { return this.addPeriodData('ingresos', ingreso); }
    updateIngreso(id, updates) { return this.updatePeriodData('ingresos', id, updates); }
    deleteIngreso(id) { return this.deletePeriodData('ingresos', id); }

    // Gastos Fijos
    addGastoFijo(gasto) { return this.addPeriodData('gastos_fijos', gasto); }
    updateGastoFijo(id, updates) { return this.updatePeriodData('gastos_fijos', id, updates); }
    deleteGastoFijo(id) { return this.deletePeriodData('gastos_fijos', id); }

    // Gastos Variables
    addGastoVariable(gasto) { return this.addPeriodData('gastos_variables', gasto); }
    updateGastoVariable(id, updates) { return this.updatePeriodData('gastos_variables', id, updates); }
    deleteGastoVariable(id) { return this.deletePeriodData('gastos_variables', id); }

    // Gastos Extras
    addGastoExtra(gasto) { return this.addPeriodData('gastos_extras', gasto); }
    updateGastoExtra(id, updates) { return this.updatePeriodData('gastos_extras', id, updates); }
    deleteGastoExtra(id) { return this.deletePeriodData('gastos_extras', id); }

    // Helpers para CRUD
    addPeriodData(type, item) {
        const data = this.getPeriodData(this.currentPeriod, type) || { total: 0, desglose: [] };
        if (!data.desglose) data.desglose = [];
        data.desglose.push(item);
        data.total = (data.total || 0) + (item.monto || 0);
        return this.setPeriodData(this.currentPeriod, type, data);
    }

    updatePeriodData(type, id, updates) {
        const data = this.getPeriodData(this.currentPeriod, type);
        if (!data || !data.desglose) return false;
        const index = data.desglose.findIndex(i => i.id === id);
        if (index === -1) return false;
        Object.assign(data.desglose[index], updates);
        // Recalcular total si es necesario
        if (updates.monto !== undefined) {
            data.total = data.desglose.reduce((sum, i) => sum + (i.monto || 0), 0);
        }
        return this.setPeriodData(this.currentPeriod, type, data);
    }

    deletePeriodData(type, id) {
        console.log(`🗑️ TemporalStorage: deletePeriodData type=${type} id=${id}`);
        const data = this.getPeriodData(this.currentPeriod, type);
        if (!data || !data.desglose) return false;
        const initialLength = data.desglose.length;
        data.desglose = data.desglose.filter(i => i.id !== id);
        if (data.desglose.length === initialLength) {
            console.warn(`❌ ID ${id} not found in ${type}`);
            return false;
        }
        data.total = data.desglose.reduce((sum, i) => sum + (i.monto || 0), 0);
        return this.setPeriodData(this.currentPeriod, type, data);
    }
}

// Asignar a window para acceso global
window.TemporalStorage = TemporalStorage;

console.log('🕐 temporal-storage.js v1.0.0 cargado - Sistema temporal listo');