/**
 * TEMPORAL-MANAGER.JS - Gestor de Períodos y Navegación Temporal
 * WiseSpend - Control de Gastos Familiares 
 * Versión: 1.0.0
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Gestión completa de períodos mensuales
 * ✅ Navegación entre períodos con estados
 * ✅ Clonación automática y manual
 * ✅ Sistema de desbloqueo temporal libre
 * ✅ Auto-archivo de períodos anteriores
 * ✅ Integración perfecta con sistema actual
 */

class TemporalManager {
    constructor() {
        this.temporalStorage = null;
        this.isInitialized = false;
        this.currentActivePeriod = null;
        this.navigationCallbacks = new Map();
        
        // Estados de período
        this.states = {
            ACTIVE: 'active',
            ARCHIVED: 'archived',
            UNLOCKED: 'unlocked', 
            PREPARING: 'preparing'
        };
        
        // Configuración
        this.config = {
            maxFuturePeriods: 12, // Máximo 12 meses futuros
            maxUnlockedPeriods: 1, // Solo 1 período desbloqueado simultáneamente
            autoArchiveEnabled: true,
            cloneOnCreate: true
        };
        
        this.initializeManager();
    }

    /**
     * INICIALIZACIÓN DEL MANAGER
     */
    
    /**
     * Inicializar el gestor temporal
     */
    async initializeManager() {
        console.log('🎯 Inicializando TemporalManager...');
        
        try {
            // 1. Inicializar storage temporal
            await this.initializeTemporalStorage();
            
            // 2. Configurar período actual
            this.setupCurrentPeriod();
            
            // 3. Configurar listeners de eventos
            this.setupEventListeners();
            
            // 4. Verificar y limpiar períodos antiguos
            this.cleanupOldPeriods();
            
            this.isInitialized = true;
            console.log('✅ TemporalManager inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando TemporalManager:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * Inicializar storage temporal
     */
    async initializeTemporalStorage() {
        // Verificar dependencias
        if (!window.TemporalStorage) {
            throw new Error('TemporalStorage no está disponible');
        }
        
        this.temporalStorage = new window.TemporalStorage();
        await this.waitForStorageReady();
        
        console.log('💾 TemporalStorage inicializado');
    }
    
    /**
     * Esperar a que el storage esté listo
     */
    waitForStorageReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.temporalStorage && this.temporalStorage.currentPeriod) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
    
    /**
     * Configurar período actual
     */
    setupCurrentPeriod() {
        this.currentActivePeriod = this.temporalStorage.currentPeriod;
        
        // Asegurar que el período actual esté activo
        const currentState = this.temporalStorage.getPeriodState(this.currentActivePeriod);
        if (currentState !== this.states.ACTIVE) {
            this.temporalStorage.setPeriodState(this.currentActivePeriod, this.states.ACTIVE);
        }
        
        console.log(`📅 Período actual configurado: ${this.currentActivePeriod}`);
    }
    
    /**
     * Configurar listeners de eventos
     */
    setupEventListeners() {
        // Eventos de storage temporal
        window.addEventListener('temporalStorageSaved', (e) => this.handleStorageSaved(e));
        window.addEventListener('periodCloned', (e) => this.handlePeriodCloned(e));
        window.addEventListener('periodUnlocked', (e) => this.handlePeriodUnlocked(e));
        window.addEventListener('periodLocked', (e) => this.handlePeriodLocked(e));
        
        // Evento de cambio de mes (detección automática)
        this.setupMonthChangeDetection();
    }
    
    /**
     * Limpiar períodos antiguos (opcional)
     */
    cleanupOldPeriods() {
        const index = this.temporalStorage.getPeriodsIndex();
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1); // 1 año atrás
        
        const cutoffPeriod = this.formatPeriod(cutoffDate);
        
        index.periods.forEach(period => {
            if (period < cutoffPeriod) {
                console.log(`🗑️ Considerando limpieza de período antiguo: ${period}`);
                // Aquí podríamos implementar limpieza automática si se desea
            }
        });
    }

    /**
     * NAVEGACIÓN ENTRE PERÍODOS
     */
    
    /**
     * Cambiar a un período específico
     */
    async switchToPeriod(targetPeriod) {
        console.log(`🔄 Cambiando a período: ${targetPeriod}`);
        
        try {
            // 1. Validar que el período existe
            if (!this.periodExists(targetPeriod)) {
                throw new Error(`Período ${targetPeriod} no existe`);
            }
            
            // 2. Verificar estado del período
            const periodState = this.temporalStorage.getPeriodState(targetPeriod);
            if (!this.temporalStorage.isPeriodEditable(targetPeriod) && periodState === this.states.ARCHIVED) {
                throw new Error(`Período ${targetPeriod} está archivado. Debe desbloquearlo primero.`);
            }
            
            // 3. Re-bloquear período anterior si estaba desbloqueado
            await this.handlePeriodSwitch();
            
            // 4. Actualizar período activo en memoria
            this.currentActivePeriod = targetPeriod;
            
            // 5. Actualizar storage temporal
            this.temporalStorage.currentPeriod = targetPeriod;
            
            // 6. Notificar cambio
            this.dispatchPeriodChangeEvent(targetPeriod);
            
            // 7. Ejecutar callbacks de navegación
            await this.executeNavigationCallbacks(targetPeriod);
            
            console.log(`✅ Cambio a período ${targetPeriod} completado`);
            return true;
            
        } catch (error) {
            console.error('❌ Error cambiando período:', error);
            this.handleNavigationError(error, targetPeriod);
            return false;
        }
    }
    
    /**
     * Manejar cambio entre períodos
     */
    async handlePeriodSwitch() {
        const index = this.temporalStorage.getPeriodsIndex();
        
        // Re-bloquear cualquier período desbloqueado que no sea el actual
        index.periods.forEach(period => {
            const state = this.temporalStorage.getPeriodState(period);
            if (state === this.states.UNLOCKED && period !== this.currentActivePeriod) {
                this.temporalStorage.lockPeriod(period);
                console.log(`🔒 Período ${period} re-bloqueado automáticamente`);
            }
        });
    }
    
    /**
     * Verificar si un período existe
     */
    periodExists(period) {
        const index = this.temporalStorage.getPeriodsIndex();
        return index.periods.includes(period);
    }
    
    /**
     * Obtener información completa de períodos
     */
    getPeriodsInfo() {
        const index = this.temporalStorage.getPeriodsIndex();
        const periodsData = [];
        
        index.periods.forEach(period => {
            const state = this.temporalStorage.getPeriodState(period);
            const isEditable = this.temporalStorage.isPeriodEditable(period);
            const isCurrent = period === this.currentActivePeriod;
            
            periodsData.push({
                period,
                state,
                isEditable,
                isCurrent,
                displayName: this.formatPeriodDisplay(period),
                canActivate: state === this.states.PREPARING,
                canUnlock: state === this.states.ARCHIVED,
                canSwitch: isEditable || state === this.states.ARCHIVED
            });
        });
        
        // Ordenar por período (más recientes primero)
        periodsData.sort((a, b) => b.period.localeCompare(a.period));
        
        return periodsData;
    }

    /**
     * CREACIÓN Y CLONACIÓN DE PERÍODOS
     */
    
    /**
     * Crear nuevo período con clonación
     */
    async createNewPeriod(targetPeriod, sourcePeriod = null) {
        console.log(`🆕 Creando nuevo período: ${targetPeriod}`);
        
        try {
            // 1. Validar que el período no existe
            if (this.periodExists(targetPeriod)) {
                throw new Error(`Período ${targetPeriod} ya existe`);
            }
            
            // 2. Validar límites de períodos futuros
            if (!this.validateFuturePeriodLimit(targetPeriod)) {
                throw new Error('Se ha alcanzado el límite de períodos futuros');
            }
            
            // 3. Determinar período fuente para clonación
            const cloneSource = sourcePeriod || this.getDefaultCloneSource();
            
            if (!cloneSource) {
                throw new Error('No hay período fuente disponible para clonación');
            }
            
            // 4. Ejecutar clonación
            const cloneSuccess = this.temporalStorage.clonePeriod(cloneSource, targetPeriod);
            if (!cloneSuccess) {
                throw new Error('Error en la clonación del período');
            }
            
            // 5. Configurar como período en preparación
            this.temporalStorage.setPeriodState(targetPeriod, this.states.PREPARING);
            
            // 6. Notificar creación
            this.dispatchPeriodCreatedEvent(targetPeriod, cloneSource);
            
            console.log(`✅ Período ${targetPeriod} creado exitosamente (clonado desde ${cloneSource})`);
            return true;
            
        } catch (error) {
            console.error('❌ Error creando período:', error);
            this.handleCreationError(error, targetPeriod);
            return false;
        }
    }
    
    /**
     * Obtener período fuente por defecto para clonación
     */
    getDefaultCloneSource() {
        const index = this.temporalStorage.getPeriodsIndex();
        
        // Buscar el período más reciente con datos completos
        const sortedPeriods = [...index.periods].sort().reverse();
        
        for (const period of sortedPeriods) {
            const validation = this.temporalStorage.validatePeriodData(period);
            if (validation.isValid) {
                return period;
            }
        }
        
        return this.currentActivePeriod; // Fallback al período actual
    }
    
    /**
     * Validar límite de períodos futuros
     */
    validateFuturePeriodLimit(targetPeriod) {
        const currentPeriod = this.temporalStorage.getCurrentPeriod();
        const [currentYear, currentMonth] = currentPeriod.split('_').map(Number);
        const [targetYear, targetMonth] = targetPeriod.split('_').map(Number);
        
        const currentDate = new Date(currentYear, currentMonth - 1);
        const targetDate = new Date(targetYear, targetMonth - 1);
        
        const monthsDiff = (targetDate.getFullYear() - currentDate.getFullYear()) * 12 + 
                          (targetDate.getMonth() - currentDate.getMonth());
        
        return monthsDiff <= this.config.maxFuturePeriods;
    }

    /**
     * SISTEMA DE DESBLOQUEO
     */
    
    /**
     * Desbloquear período archivado para edición libre
     */
    async unlockPeriod(period) {
        console.log(`🔓 Desbloqueando período: ${period}`);
        
        try {
            // 1. Validar que el período está archivado
            const currentState = this.temporalStorage.getPeriodState(period);
            if (currentState !== this.states.ARCHIVED) {
                throw new Error(`Período ${period} no está archivado (estado: ${currentState})`);
            }
            
            // 2. Verificar límite de períodos desbloqueados
            if (!this.validateUnlockLimit()) {
                throw new Error('Ya hay un período desbloqueado. Re-bloquéelo primero.');
            }
            
            // 3. Crear backup del período
            this.temporalStorage.createPeriodBackup(period);
            
            // 4. Desbloquear período
            const unlockSuccess = this.temporalStorage.unlockPeriod(period);
            if (!unlockSuccess) {
                throw new Error('Error desbloqueando período');
            }
            
            // 5. Notificar desbloqueo
            this.dispatchPeriodUnlockedEvent(period);
            
            console.log(`✅ Período ${period} desbloqueado para edición libre`);
            return true;
            
        } catch (error) {
            console.error('❌ Error desbloqueando período:', error);
            this.handleUnlockError(error, period);
            return false;
        }
    }
    
    /**
     * Re-bloquear período (archivar)
     */
    async lockPeriod(period) {
        console.log(`🔒 Re-bloqueando período: ${period}`);
        
        try {
            // 1. Validar que el período está desbloqueado
            const currentState = this.temporalStorage.getPeriodState(period);
            if (currentState !== this.states.UNLOCKED) {
                throw new Error(`Período ${period} no está desbloqueado (estado: ${currentState})`);
            }
            
            // 2. Re-bloquear período
            const lockSuccess = this.temporalStorage.lockPeriod(period);
            if (!lockSuccess) {
                throw new Error('Error re-bloqueando período');
            }
            
            // 3. Notificar re-bloqueo
            this.dispatchPeriodLockedEvent(period);
            
            console.log(`✅ Período ${period} re-bloqueado exitosamente`);
            return true;
            
        } catch (error) {
            console.error('❌ Error re-bloqueando período:', error);
            return false;
        }
    }
    
    /**
     * Validar límite de períodos desbloqueados
     */
    validateUnlockLimit() {
        const index = this.temporalStorage.getPeriodsIndex();
        const unlockedCount = index.periods.filter(period => 
            this.temporalStorage.getPeriodState(period) === this.states.UNLOCKED
        ).length;
        
        return unlockedCount < this.config.maxUnlockedPeriods;
    }

    /**
     * ACTIVACIÓN DE PERÍODOS
     */
    
    /**
     * Activar período en preparación
     */
    async activatePeriod(period) {
        console.log(`✅ Activando período: ${period}`);
        
        try {
            // 1. Validar que el período está en preparación
            const currentState = this.temporalStorage.getPeriodState(period);
            if (currentState !== this.states.PREPARING) {
                throw new Error(`Período ${period} no está en preparación (estado: ${currentState})`);
            }
            
            // 2. Archivar período activo actual
            if (this.currentActivePeriod && this.currentActivePeriod !== period) {
                this.temporalStorage.setPeriodState(this.currentActivePeriod, this.states.ARCHIVED);
                console.log(`📁 Período anterior ${this.currentActivePeriod} archivado`);
            }
            
            // 3. Activar nuevo período
            this.temporalStorage.setPeriodState(period, this.states.ACTIVE);
            
            // 4. Actualizar período activo
            this.currentActivePeriod = period;
            this.temporalStorage.currentPeriod = period;
            
            // 5. Cambiar a período activo
            await this.switchToPeriod(period);
            
            // 6. Notificar activación
            this.dispatchPeriodActivatedEvent(period);
            
            console.log(`✅ Período ${period} activado exitosamente`);
            return true;
            
        } catch (error) {
            console.error('❌ Error activando período:', error);
            this.handleActivationError(error, period);
            return false;
        }
    }

    /**
     * DETECCIÓN DE CAMBIO DE MES
     */
    
    /**
     * Configurar detección de cambio de mes
     */
    setupMonthChangeDetection() {
        // Verificar cambio de mes cada hora
        setInterval(() => {
            this.checkMonthChange();
        }, 3600000); // 1 hora
    }
    
    /**
     * Verificar cambio de mes
     */
    checkMonthChange() {
        const actualCurrentPeriod = this.temporalStorage.getCurrentPeriod();
        
        if (actualCurrentPeriod !== this.currentActivePeriod) {
            console.log(`📅 Cambio de mes detectado: ${this.currentActivePeriod} → ${actualCurrentPeriod}`);
            this.handleMonthChange(actualCurrentPeriod);
        }
    }
    
    /**
     * Manejar cambio de mes automático
     */
    async handleMonthChange(newPeriod) {
        try {
            // 1. Archivar período anterior automáticamente
            if (this.currentActivePeriod) {
                this.temporalStorage.setPeriodState(this.currentActivePeriod, this.states.ARCHIVED);
                console.log(`📁 Período ${this.currentActivePeriod} auto-archivado`);
            }
            
            // 2. Verificar si el nuevo período existe
            if (!this.periodExists(newPeriod)) {
                console.log(`🆕 Período ${newPeriod} no existe, requiere creación manual`);
                this.dispatchMonthChangeDetectedEvent(newPeriod);
                return;
            }
            
            // 3. Activar nuevo período si está en preparación
            const newPeriodState = this.temporalStorage.getPeriodState(newPeriod);
            if (newPeriodState === this.states.PREPARING) {
                await this.activatePeriod(newPeriod);
            } else {
                // Solo cambiar período activo
                this.currentActivePeriod = newPeriod;
                this.temporalStorage.currentPeriod = newPeriod;
                this.temporalStorage.setPeriodState(newPeriod, this.states.ACTIVE);
            }
            
            this.dispatchMonthChangedEvent(newPeriod);
            
        } catch (error) {
            console.error('❌ Error manejando cambio de mes:', error);
        }
    }

    /**
     * UTILIDADES Y FORMATEADORES
     */
    
    /**
     * Formatear período para mostrar
     */
    formatPeriodDisplay(period) {
        const [year, month] = period.split('_');
        const monthNames = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        
        const monthIndex = parseInt(month) - 1;
        const monthName = monthNames[monthIndex] || `Mes ${month}`;
        
        return `${monthName} ${year}`;
    }
    
    /**
     * Formatear fecha a período
     */
    formatPeriod(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}_${month}`;
    }
    
    /**
     * Generar período siguiente
     */
    getNextPeriod(period) {
        const [year, month] = period.split('_').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() + 1);
        return this.formatPeriod(date);
    }
    
    /**
     * Generar período anterior
     */
    getPreviousPeriod(period) {
        const [year, month] = period.split('_').map(Number);
        const date = new Date(year, month - 1);
        date.setMonth(date.getMonth() - 1);
        return this.formatPeriod(date);
    }
    
    /**
     * Obtener estado del sistema temporal
     */
    getSystemState() {
        const index = this.temporalStorage.getPeriodsIndex();
        const periodsInfo = this.getPeriodsInfo();
        
        return {
            isInitialized: this.isInitialized,
            currentActivePeriod: this.currentActivePeriod,
            totalPeriods: index.periods.length,
            periodsInfo,
            config: this.config,
            temporalInfo: this.temporalStorage.getTemporalInfo()
        };
    }

    /**
     * CALLBACKS DE NAVEGACIÓN
     */
    
    /**
     * Registrar callback de navegación
     */
    registerNavigationCallback(name, callback) {
        this.navigationCallbacks.set(name, callback);
        console.log(`📋 Callback de navegación registrado: ${name}`);
    }
    
    /**
     * Remover callback de navegación
     */
    removeNavigationCallback(name) {
        this.navigationCallbacks.delete(name);
        console.log(`🗑️ Callback de navegación removido: ${name}`);
    }
    
    /**
     * Ejecutar callbacks de navegación
     */
    async executeNavigationCallbacks(targetPeriod) {
        const promises = [];
        
        this.navigationCallbacks.forEach((callback, name) => {
            try {
                const result = callback(targetPeriod);
                if (result instanceof Promise) {
                    promises.push(result);
                }
                console.log(`✅ Callback ${name} ejecutado`);
            } catch (error) {
                console.error(`❌ Error en callback ${name}:`, error);
            }
        });
        
        await Promise.all(promises);
    }

    /**
     * MANEJO DE ERRORES
     */
    
    handleInitializationError(error) {
        console.error('🚨 Error crítico en inicialización de TemporalManager:', error);
        // Aquí podrían implementarse estrategias de recuperación
    }
    
    handleNavigationError(error, targetPeriod) {
        console.error(`🚨 Error navegando a período ${targetPeriod}:`, error);
        // Notificar error al usuario
        this.dispatchNavigationErrorEvent(error, targetPeriod);
    }
    
    handleCreationError(error, targetPeriod) {
        console.error(`🚨 Error creando período ${targetPeriod}:`, error);
        this.dispatchCreationErrorEvent(error, targetPeriod);
    }
    
    handleUnlockError(error, period) {
        console.error(`🚨 Error desbloqueando período ${period}:`, error);
        this.dispatchUnlockErrorEvent(error, period);
    }
    
    handleActivationError(error, period) {
        console.error(`🚨 Error activando período ${period}:`, error);
        this.dispatchActivationErrorEvent(error, period);
    }

    /**
     * EVENTOS PERSONALIZADOS
     */
    
    dispatchPeriodChangeEvent(period) {
        const event = new CustomEvent('temporalPeriodChanged', {
            detail: { period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchPeriodCreatedEvent(targetPeriod, sourcePeriod) {
        const event = new CustomEvent('temporalPeriodCreated', {
            detail: { targetPeriod, sourcePeriod, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchPeriodActivatedEvent(period) {
        const event = new CustomEvent('temporalPeriodActivated', {
            detail: { period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchPeriodUnlockedEvent(period) {
        const event = new CustomEvent('temporalPeriodUnlocked', {
            detail: { period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchPeriodLockedEvent(period) {
        const event = new CustomEvent('temporalPeriodLocked', {
            detail: { period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchMonthChangeDetectedEvent(newPeriod) {
        const event = new CustomEvent('temporalMonthChangeDetected', {
            detail: { newPeriod, requiresManualCreation: true, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchMonthChangedEvent(newPeriod) {
        const event = new CustomEvent('temporalMonthChanged', {
            detail: { newPeriod, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchNavigationErrorEvent(error, targetPeriod) {
        const event = new CustomEvent('temporalNavigationError', {
            detail: { error: error.message, targetPeriod, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchCreationErrorEvent(error, targetPeriod) {
        const event = new CustomEvent('temporalCreationError', {
            detail: { error: error.message, targetPeriod, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchUnlockErrorEvent(error, period) {
        const event = new CustomEvent('temporalUnlockError', {
            detail: { error: error.message, period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
    
    dispatchActivationErrorEvent(error, period) {
        const event = new CustomEvent('temporalActivationError', {
            detail: { error: error.message, period, timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }

    /**
     * MANEJADORES DE EVENTOS DE STORAGE
     */
    
    handleStorageSaved(e) {
        // console.log('💾 Storage temporal guardado:', e.detail);
        // Aquí podrían implementarse notificaciones o actualizaciones de UI
    }
    
    handlePeriodCloned(e) {
        console.log('🔄 Período clonado:', e.detail);
        // Actualizar UI o notificar otros componentes
    }
    
    handlePeriodUnlocked(e) {
        console.log('🔓 Período desbloqueado:', e.detail);
        // Actualizar UI o iniciar auto-guardado
    }
    
    handlePeriodLocked(e) {
        console.log('🔒 Período bloqueado:', e.detail);
        // Actualizar UI o detener auto-guardado
    }

    /**
     * DESTRUCTOR
     */
    
    destroy() {
        if (this.temporalStorage) {
            this.temporalStorage.destroy();
        }
        
        this.navigationCallbacks.clear();
        this.isInitialized = false;
        
        console.log('🔧 TemporalManager destruido');
    }
}

// Asignar a window para acceso global
window.TemporalManager = TemporalManager;

console.log('🎯 temporal-manager.js v1.0.0 cargado - Gestor temporal listo');