/**
 * STORAGE.JS - Sistema de Almacenamiento Enterprise
 * Presupuesto Familiar - Manejo de datos con auto-guardado
 * Autor: Sistema de Presupuesto Familiar
 * Versión: 1.0.0
 */

class StorageManager {
    constructor() {
        this.autoSaveInterval = null;
        this.autoSaveDelay = 300000; // 5 Minutos
        this.storageKeys = {
            USER_DATA: 'presupuesto_user_data',
            GASTOS_FIJOS: 'presupuesto_gastos_fijos',
            GASTOS_VARIABLES: 'presupuesto_gastos_variables',
            GASTOS_EXTRAS: 'presupuesto_gastos_extras',
            INGRESOS: 'presupuesto_ingresos',
            CONFIGURACION: 'presupuesto_configuracion',
            REPORTES: 'presupuesto_reportes',
            BACKUP_DATA: 'presupuesto_backup',
            LAST_SAVE: 'presupuesto_last_save'
        };
        this.saveEventTimeout = null; // Para el debounce ← ESTA LÍNEA ES NUEVA
        this.defaultData = this.getDefaultData();
        this.initializeStorage();
        this.startAutoSave();
    }

    /**
     * Datos por defecto del sistema
     */
    getDefaultData() {
        return {
            userData: {
                nombre: '',
                email: '',
                fechaCreacion: new Date().toISOString(),
                ultimoAcceso: new Date().toISOString()
            },
            ingresos: {
                total: 2417000,
                desglose: [
                    { fuente: 'Claudia', monto: 1186480, activo: true },
                    { fuente: 'Norman', monto: 1218520, activo: true },
                    { fuente: 'Edith', monto: 12000, activo: true }
                ]
            },
            gastosFijos: {
                total: 514623,
                items: [
                    { categoria: 'Crédito 43/48', monto: 277495, activo: true, id: 'gf001' },
                    { categoria: 'Internet Movistar casa', monto: 16418, activo: true, id: 'gf002' },
                    { categoria: 'Remedios Claudia', monto: 18154, activo: true, id: 'gf003' },
                    { categoria: 'Agua', monto: 40650, activo: true, id: 'gf004' },
                    { categoria: 'Luz', monto: 50800, activo: true, id: 'gf005' },
                    { categoria: 'Teléfono Norman', monto: 9792, activo: true, id: 'gf006' },
                    { categoria: 'Teléfono Edith (Mom)', monto: 11990, activo: true, id: 'gf007' },
                    { categoria: 'Teléfono Claudia Ernst', monto: 38334, activo: true, id: 'gf008' },
                    { categoria: 'Internet Trejodun', monto: 14990, activo: true, id: 'gf009' },
                    { categoria: 'Ballet', monto: 7000, activo: true, id: 'gf010' }
                ]
            },
            gastosVariables: {
                total: 1680881,
                items: [
                    { categoria: 'Ripley', monto: 748555, activo: true, id: 'gv001' },
                    { categoria: 'Consulta oftorno', monto: 121401, activo: true, id: 'gv002' },
                    { categoria: 'Fallabella', monto: 156804, activo: true, id: 'gv003' },
                    { categoria: 'Visa BCI', monto: 324334, activo: true, id: 'gv004' },
                    { categoria: 'Pensionistas', monto: 138500, activo: true, id: 'gv005' },
                    { categoria: 'Leña 3/4', monto: 97500, activo: true, id: 'gv006' },
                    { categoria: 'Cuotas', monto: 14000, activo: true, id: 'gv007' },
                    { categoria: 'Oftalmólogo', monto: 120000, activo: true, id: 'gv008' },
                    { categoria: 'Psicólogo', monto: 135000, activo: true, id: 'gv009' },
                    { categoria: 'Reumatólogo', monto: 155627, activo: true, id: 'gv010' },
                    { categoria: 'Bancaria Sta Fe', monto: 190000, activo: true, id: 'gv011' },
                    { categoria: 'Bancaria R. Clio', monto: 150000, activo: true, id: 'gv012' },
                    { categoria: 'Gas GASCO', monto: 138670, activo: true, id: 'gv013' }
                ]
            },
            gastosExtras: {
                total: 350900,
                presupuesto: 213162,
                porcentaje: 10,
                items: [
                    { categoria: 'Viaje a Tío', monto: 115000, activo: true, id: 'ge001' },
                    { categoria: 'Consulta dermatólogo', monto: 140000, activo: true, id: 'ge002' },
                    { categoria: 'Inscripción Camilo', monto: 67000, activo: true, id: 'ge003' },
                    { categoria: 'Semana Casa', monto: 120000, activo: true, id: 'ge004' },
                    { categoria: 'Baño casa', monto: 160000, activo: true, id: 'ge005' },
                    { categoria: 'Remoción Norman', monto: 115000, activo: true, id: 'ge006' },
                    { categoria: 'Badminton Camilo', monto: 140000, activo: true, id: 'ge007' },
                    { categoria: 'Badminton Violeta', monto: 120000, activo: true, id: 'ge008' },
                    { categoria: 'Leche', monto: 133800, activo: true, id: 'ge009' }
                ]
            },
            configuracion: {
                monedaPrincipal: 'CLP',
                autoGuardado: true,
                intervalGuardado: 10000,
                mostrarNotificaciones: true,
                tema: 'claro',
                formatoFecha: 'DD/MM/YYYY',
                mostrarDetalles: true
            },
            reportes: {
                ultimoReporte: null,
                configuracionReporte: {
                    incluirGraficos: true,
                    formatoExportacion: 'pdf',
                    periodicidad: 'mensual'
                }
            },
            balance: {
                actual: -129404,
                fechaCalculo: new Date().toISOString()
            }
        };
    }

    /**
     * Inicializa el sistema de almacenamiento
     */
    initializeStorage() {
        try {
            // Verificar si localStorage está disponible
            if (!this.isStorageAvailable()) {
                throw new Error('localStorage no está disponible');
            }

            // Inicializar datos si no existen
            Object.keys(this.storageKeys).forEach(key => {
                const storageKey = this.storageKeys[key];
                if (!localStorage.getItem(storageKey)) {
                    this.initializeKey(key);
                }
            });

            // Actualizar último acceso
            this.updateLastAccess();

            console.log('✅ Sistema de almacenamiento inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando storage:', error);
            this.handleStorageError(error);
        }
    }

    /**
     * Inicializa una clave específica con datos por defecto
     */
    initializeKey(key) {
        const storageKey = this.storageKeys[key];
        let defaultValue = {};

        switch (key) {
            case 'USER_DATA':
                defaultValue = this.defaultData.userData;
                break;
            case 'INGRESOS':
                defaultValue = this.defaultData.ingresos;
                break;
            case 'GASTOS_FIJOS':
                defaultValue = this.defaultData.gastosFijos;
                break;
            case 'GASTOS_VARIABLES':
                defaultValue = this.defaultData.gastosVariables;
                break;
            case 'GASTOS_EXTRAS':
                defaultValue = this.defaultData.gastosExtras;
                break;
            case 'CONFIGURACION':
                defaultValue = this.defaultData.configuracion;
                break;
            case 'REPORTES':
                defaultValue = this.defaultData.reportes;
                break;
            case 'LAST_SAVE':
                defaultValue = { timestamp: new Date().toISOString() };
                break;
            default:
                defaultValue = {};
        }

        this.setItem(storageKey, defaultValue);
    }

    /**
     * Verifica si localStorage está disponible
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Guarda un elemento en localStorage con manejo de errores
     */
    setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            localStorage.setItem(key, serializedValue);
            this.updateLastSave();

            // 🔧 TEMPORALMENTE DESHABILITADO PARA EVITAR REFRESCO EN EDICIÓN INLINE
            // this.dispatchSaveEvent();

            return true;
        } catch (error) {
            console.error(`❌ Error guardando ${key}:`, error);
            this.handleStorageError(error);
            return false;
        }
    }

    /**
     * Obtiene un elemento de localStorage con manejo de errores
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

    /**
     * Elimina un elemento de localStorage
     */
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`❌ Error eliminando ${key}:`, error);
            return false;
        }
    }

    /**
     * MÉTODOS ESPECÍFICOS PARA DATOS DE LA APLICACIÓN
     */
    // Ingresos
    getIngresos() {
        return this.getItem(this.storageKeys.INGRESOS) || this.defaultData.ingresos;
    }

    setIngresos(ingresos) {
        return this.setItem(this.storageKeys.INGRESOS, ingresos);
    }

    // Gastos Fijos
    getGastosFijos() {
        return this.getItem(this.storageKeys.GASTOS_FIJOS) || this.defaultData.gastosFijos;
    }

    setGastosFijos(gastosFijos) {
        return this.setItem(this.storageKeys.GASTOS_FIJOS, gastosFijos);
    }

    addGastoFijo(gasto) {
        const gastos = this.getGastosFijos();
        if (!gastos.items) gastos.items = [];
        gastos.items.push(gasto);
        gastos.total = this.calculateTotal(gastos.items);
        return this.setGastosFijos(gastos);
    }

    updateGastoFijo(id, updates) {
        const gastos = this.getGastosFijos();
        const index = gastos.items.findIndex(item => item.id === id);
        if (index !== -1) {
            gastos.items[index] = { ...gastos.items[index], ...updates };
            gastos.total = this.calculateTotal(gastos.items);
            return this.setGastosFijos(gastos);
        }
        return false;
    }

    deleteGastoFijo(id) {
        const gastos = this.getGastosFijos();
        const initialLength = gastos.items.length;
        gastos.items = gastos.items.filter(item => item.id !== id);
        if (gastos.items.length !== initialLength) {
            gastos.total = this.calculateTotal(gastos.items);
            return this.setGastosFijos(gastos);
        }
        return false;
    }

    // Gastos Variables
    getGastosVariables() {
        return this.getItem(this.storageKeys.GASTOS_VARIABLES) || this.defaultData.gastosVariables;
    }

    setGastosVariables(gastosVariables) {
        return this.setItem(this.storageKeys.GASTOS_VARIABLES, gastosVariables);
    }

    addGastoVariable(gasto) {
        const gastos = this.getGastosVariables();
        if (!gastos.items) gastos.items = [];
        gastos.items.push(gasto);
        gastos.total = this.calculateTotal(gastos.items);
        return this.setGastosVariables(gastos);
    }

    updateGastoVariable(id, updates) {
        const gastos = this.getGastosVariables();
        const index = gastos.items.findIndex(item => item.id === id);
        if (index !== -1) {
            gastos.items[index] = { ...gastos.items[index], ...updates };
            gastos.total = this.calculateTotal(gastos.items);
            return this.setGastosVariables(gastos);
        }
        return false;
    }

    deleteGastoVariable(id) {
        const gastos = this.getGastosVariables();
        const initialLength = gastos.items.length;
        gastos.items = gastos.items.filter(item => item.id !== id);
        if (gastos.items.length !== initialLength) {
            gastos.total = this.calculateTotal(gastos.items);
            return this.setGastosVariables(gastos);
        }
        return false;
    }

    // Gastos Extras
    getGastosExtras() {
        return this.getItem(this.storageKeys.GASTOS_EXTRAS) || this.defaultData.gastosExtras;
    }

    setGastosExtras(gastosExtras) {
        return this.setItem(this.storageKeys.GASTOS_EXTRAS, gastosExtras);
    }

    addGastoExtra(gasto) {
        const gastos = this.getGastosExtras();
        if (!gastos.items) gastos.items = [];
        gastos.items.push(gasto);
        gastos.total = this.calculateTotal(gastos.items);
        return this.setGastosExtras(gastos);
    }

    updateGastoExtra(id, updates) {
        const gastos = this.getGastosExtras();
        const index = gastos.items.findIndex(item => item.id === id);
        if (index !== -1) {
            gastos.items[index] = { ...gastos.items[index], ...updates };
            gastos.total = this.calculateTotal(gastos.items);
            return this.setGastosExtras(gastos);
        }
        return false;
    }

    deleteGastoExtra(id) {
        const gastos = this.getGastosExtras();
        const initialLength = gastos.items.length;
        gastos.items = gastos.items.filter(item => item.id !== id);
        if (gastos.items.length !== initialLength) {
            gastos.total = this.calculateTotal(gastos.items);
            return this.setGastosExtras(gastos);
        }
        return false;
    }

    // Configuración
    getConfiguracion() {
        return this.getItem(this.storageKeys.CONFIGURACION) || this.defaultData.configuracion;
    }

    setConfiguracion(configuracion) {
        return this.setItem(this.storageKeys.CONFIGURACION, configuracion);
    }

    // Datos de usuario
    getUserData() {
        return this.getItem(this.storageKeys.USER_DATA) || this.defaultData.userData;
    }

    setUserData(userData) {
        return this.setItem(this.storageKeys.USER_DATA, userData);
    }

    /**
     * Calcular total de items activos
     */
    calculateTotal(items) {
        if (!items || !Array.isArray(items)) return 0;
        return items
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
    }

    calcularBalance() {
        const ingresos = this.getIngresos();
        const gastosFijos = this.getGastosFijos();
        const gastosVariables = this.getGastosVariables();
        const gastosExtras = this.getGastosExtras();

        const totalIngresos = ingresos.total || 0;
        const totalGastosFijos = gastosFijos.total || 0;
        const totalGastosVariables = gastosVariables.total || 0;
        const totalGastosExtras = gastosExtras.total || 0;

        const balance = totalIngresos - (totalGastosFijos + totalGastosVariables + totalGastosExtras);

        // Guardar balance calculado
        const balanceData = {
            actual: balance,
            fechaCalculo: new Date().toISOString(),
            ingresos: totalIngresos,
            gastosFijos: totalGastosFijos,
            gastosVariables: totalGastosVariables,
            gastosExtras: totalGastosExtras
        };

        this.setItem('presupuesto_balance', balanceData);
        return balance;
    }

    /**
     * Obtiene todos los datos para el dashboard
     */
    getDashboardData() {
        const data = {
            ingresos: this.getIngresos(),
            gastosFijos: this.getGastosFijos(),
            gastosVariables: this.getGastosVariables(),
            gastosExtras: this.getGastosExtras(),
            configuracion: this.getConfiguracion(),
            userData: this.getUserData(),
            balance: this.calcularBalance()
        };

        return data;
    }

    /**
     * SISTEMA DE AUTO-GUARDADO
     */

    /**
     * Inicia el auto-guardado cada 10 segundos
     */
    startAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(() => {
            this.autoSave();
        }, this.autoSaveDelay);

        console.log('🔄 Auto-guardado iniciado (cada 10 segundos)');
    }

    /**
     * Detiene el auto-guardado
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏹️ Auto-guardado detenido');
        }
    }

    /**
     * Ejecuta el auto-guardado
     */
    autoSave() {
        try {
            // Crear backup de seguridad
            this.createBackup();

            // Actualizar timestamp del último guardado
            this.updateLastSave();

            // Disparar evento personalizado para notificar otros módulos
            this.dispatchSaveEvent();

            console.log('💾 Auto-guardado completado:', new Date().toLocaleTimeString());
        } catch (error) {
            console.error('❌ Error en auto-guardado:', error);
        }
    }

    /**
     * Actualiza el timestamp del último guardado
     */
    updateLastSave() {
        const lastSave = {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        };
        localStorage.setItem(this.storageKeys.LAST_SAVE, JSON.stringify(lastSave));
    }

    /**
     * Actualiza el último acceso del usuario
     */
    updateLastAccess() {
        const userData = this.getUserData();
        userData.ultimoAcceso = new Date().toISOString();
        this.setUserData(userData);
    }

    /**
     * SISTEMA DE BACKUP Y RECUPERACIÓN
     */

    /**
     * Crea un backup completo de todos los datos
     */
    createBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                data: {
                    ingresos: this.getIngresos(),
                    gastosFijos: this.getGastosFijos(),
                    gastosVariables: this.getGastosVariables(),
                    gastosExtras: this.getGastosExtras(),
                    configuracion: this.getConfiguracion(),
                    userData: this.getUserData()
                }
            };

            this.setItem(this.storageKeys.BACKUP_DATA, backupData);
            return true;
        } catch (error) {
            console.error('❌ Error creando backup:', error);
            return false;
        }
    }

    /**
     * Restaura desde backup
     */
    restoreFromBackup() {
        try {
            const backupData = this.getItem(this.storageKeys.BACKUP_DATA);

            if (!backupData || !backupData.data) {
                throw new Error('No hay datos de backup disponibles');
            }

            // Restaurar cada tipo de dato
            this.setIngresos(backupData.data.ingresos);
            this.setGastosFijos(backupData.data.gastosFijos);
            this.setGastosVariables(backupData.data.gastosVariables);
            this.setGastosExtras(backupData.data.gastosExtras);
            this.setConfiguracion(backupData.data.configuracion);
            this.setUserData(backupData.data.userData);

            console.log('✅ Datos restaurados desde backup');
            return true;
        } catch (error) {
            console.error('❌ Error restaurando backup:', error);
            return false;
        }
    }

    /**
     * EXPORTACIÓN E IMPORTACIÓN
     */

    /**
     * Exporta todos los datos a JSON
     */
    exportData() {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                application: 'Presupuesto Familiar',
                data: this.getDashboardData()
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            return {
                blob: dataBlob,
                filename: `presupuesto-familiar-${new Date().toISOString().split('T')[0]}.json`
            };
        } catch (error) {
            console.error('❌ Error exportando datos:', error);
            return null;
        }
    }

    /**
     * Importa datos desde JSON
     */
    importData(jsonData) {
        try {
            const importedData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (!importedData.data) {
                throw new Error('Formato de datos inválido');
            }

            // Validar y restaurar datos
            const data = importedData.data;

            if (data.ingresos) this.setIngresos(data.ingresos);
            if (data.gastosFijos) this.setGastosFijos(data.gastosFijos);
            if (data.gastosVariables) this.setGastosVariables(data.gastosVariables);
            if (data.gastosExtras) this.setGastosExtras(data.gastosExtras);
            if (data.configuracion) this.setConfiguracion(data.configuracion);

            console.log('✅ Datos importados correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            return false;
        }
    }

    /**
     * MANEJO DE ERRORES Y EVENTOS
     */

    /**
     * Maneja errores del sistema de storage
     */
    handleStorageError(error) {
        const errorInfo = {
            message: error.message,
            timestamp: new Date().toISOString(),
            type: 'storage_error'
        };

        // Intentar guardar el error en sessionStorage si localStorage falla
        try {
            sessionStorage.setItem('storage_error', JSON.stringify(errorInfo));
        } catch (e) {
            console.error('❌ No se puede guardar el error:', e);
        }

        // Disparar evento de error
        this.dispatchErrorEvent(error);
    }

    /**
    * Dispara evento personalizado de guardado CON DEBOUNCE
    */
    dispatchSaveEvent() {
        // Limpiar timeout anterior si existe
        if (this.saveEventTimeout) {
            clearTimeout(this.saveEventTimeout);
        }

        // Programar nuevo evento con debounce de 300ms
        this.saveEventTimeout = setTimeout(() => {
            const event = new CustomEvent('storageSaved', {
                detail: {
                    timestamp: new Date().toISOString(),
                    type: 'debounced_save'
                }
            });
            window.dispatchEvent(event);

            // Limpiar timeout
            this.saveEventTimeout = null;
        }, 300);
    }

    /**
     * Dispara evento personalizado de error
     */
    dispatchErrorEvent(error) {
        const event = new CustomEvent('storageError', {
            detail: {
                error: error.message,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * MÉTODOS DE UTILIDAD
     */

    /**
     * Limpia todos los datos (reset completo)
     */
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });

            // Reinicializar con datos por defecto
            this.initializeStorage();

            console.log('🗑️ Todos los datos han sido eliminados');
            return true;
        } catch (error) {
            console.error('❌ Error limpiando datos:', error);
            return false;
        }
    }

    /**
     * Obtiene información del estado del storage
     */
    getStorageInfo() {
        const info = {
            isAvailable: this.isStorageAvailable(),
            lastSave: this.getItem(this.storageKeys.LAST_SAVE),
            autoSaveActive: this.autoSaveInterval !== null,
            storageUsed: this.calculateStorageUsage(),
            totalKeys: Object.keys(this.storageKeys).length
        };

        return info;
    }

    /**
     * Calcula el uso de almacenamiento
     */
    calculateStorageUsage() {
        let totalSize = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }

        return {
            bytes: totalSize,
            kb: (totalSize / 1024).toFixed(2),
            mb: (totalSize / (1024 * 1024)).toFixed(2)
        };
    }

    /**
     * Destructor - limpia recursos
     */
    destroy() {
        this.stopAutoSave();
        console.log('🔧 StorageManager destruido');
    }
}

// Crear instancia global del storage manager
window.storageManager = new StorageManager();

// Exportar para usar como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}

console.log('📦 Storage.js cargado correctamente - Sistema de almacenamiento enterprise activo');