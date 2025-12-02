/**
 * 🔄 HYBRID STORAGE MANAGER
 * Gestor inteligente que sincroniza LocalStorage con Supabase
 * Actúa como proxy: Si hay usuario, usa Nube. Si no, usa Local.
 */

class HybridStorageManager {
    constructor() {
        this.local = new StorageManager(); // Instancia del storage original
        this.cloud = window.supabaseManager; // Instancia del cliente Supabase
        this.isOnline = navigator.onLine;
        this.useCloud = false;

        this.init();
    }

    async init() {
        console.log('🔄 Inicializando HybridStorageManager...');
        
        // Escuchar cambios de conexión
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));

        // Verificar sesión inicial
        await this.checkCloudStatus();
    }

    async checkCloudStatus() {
        if (this.cloud && await this.cloud.checkSession()) {
            this.useCloud = true;
            console.log('☁️ Modo NUBE activado');
            // Intentar sincronizar datos locales pendientes si es necesario
            // this.syncLocalToCloud(); 
        } else {
            this.useCloud = false;
            console.log('💻 Modo LOCAL activado');
        }
    }

    handleConnectionChange(isOnline) {
        this.isOnline = isOnline;
        console.log(`📡 Conexión: ${isOnline ? 'ONLINE' : 'OFFLINE'}`);
        if (isOnline) this.checkCloudStatus();
    }

    // ==========================================
    // 🛡️ PROXY METHODS (Interfaz unificada)
    // ==========================================

    // --- INGRESOS ---
    async getIngresos() {
        if (this.useCloud && this.isOnline) {
            const response = await this.cloud.getIngresos();
            if (response.success) return { 
                total: response.data.reduce((acc, item) => acc + parseFloat(item.monto), 0),
                desglose: response.data 
            };
        }
        return this.local.getIngresos();
    }

    async setIngresos(ingresos) {
        // Esta función suele recibir el array completo en el modelo local
        // Para Supabase, preferimos operaciones atómicas (add/update/delete)
        // Por compatibilidad, si recibimos un array completo y estamos en nube,
        // podríamos necesitar una lógica compleja de diff, o simplemente guardar en local
        // y disparar sync.
        
        // Por ahora, mantenemos local como "source of truth" inmediato para la UI
        // y replicamos a la nube si es posible.
        const localResult = this.local.setIngresos(ingresos);
        
        if (this.useCloud && this.isOnline) {
            // TODO: Implementar sincronización masiva o inteligente
            console.warn('⚠️ setIngresos masivo no optimizado para nube aún');
        }
        return localResult;
    }

    // --- GASTOS FIJOS ---
    async getGastosFijos() {
        if (this.useCloud && this.isOnline) {
            const response = await this.cloud.getGastosFijos();
            if (response.success) return {
                total: response.data.reduce((acc, item) => acc + parseFloat(item.monto), 0),
                items: response.data
            };
        }
        return this.local.getGastosFijos();
    }

    // --- GASTOS VARIABLES ---
    async getGastosVariables() {
        if (this.useCloud && this.isOnline) {
            const response = await this.cloud.getGastosVariables();
            if (response.success) return {
                total: response.data.reduce((acc, item) => acc + parseFloat(item.monto), 0),
                items: response.data
            };
        }
        return this.local.getGastosVariables();
    }

    // --- GASTOS EXTRAS ---
    async getGastosExtras() {
        if (this.useCloud && this.isOnline) {
            const response = await this.cloud.getGastosExtras();
            if (response.success) return {
                total: response.data.reduce((acc, item) => acc + parseFloat(item.monto), 0),
                items: response.data
            };
        }
        return this.local.getGastosExtras();
    }

    // --- CONFIGURACIÓN ---
    getConfiguracion() {
        // La configuración se lee síncronamente en muchas partes de la app
        // Mantenemos local por velocidad, sync en background
        return this.local.getConfiguracion();
    }

    // --- DASHBOARD DATA (Core) ---
    async getDashboardData() {
        if (this.useCloud && this.isOnline) {
            console.log('☁️ Obteniendo datos del Dashboard desde Supabase...');
            const response = await this.cloud.getDashboardData();
            if (response.success) {
                // Adaptar formato de Supabase al formato que espera la UI (similar a LocalStorage)
                return {
                    ingresos: {
                        total: response.data.totales.ingresos,
                        desglose: response.data.ingresos
                    },
                    gastosFijos: {
                        total: response.data.totales.gastosFijos,
                        items: response.data.gastosFijos
                    },
                    gastosVariables: {
                        total: response.data.totales.gastosVariables,
                        items: response.data.gastosVariables
                    },
                    gastosExtras: {
                        total: response.data.totales.gastosExtras,
                        items: response.data.gastosExtras
                    },
                    configuracion: this.local.getConfiguracion(), // Config local por ahora
                    userData: this.local.getUserData(),
                    balance: response.data.totales.balance
                };
            }
        }
        console.log('💻 Obteniendo datos del Dashboard desde LocalStorage...');
        return this.local.getDashboardData();
    }

    // ==========================================
    // 🔄 SYNC METHODS
    // ==========================================

    /**
     * Sube todos los datos locales a Supabase
     * Útil para la primera migración
     */
    async syncLocalToCloud() {
        if (!this.useCloud) return { success: false, message: 'No hay sesión activa' };

        console.log('🚀 Iniciando migración Local -> Nube...');
        const data = this.local.getDashboardData();
        let stats = { ingresos: 0, fijos: 0, variables: 0, extras: 0 };

        try {
            // 1. Migrar Ingresos
            if (data.ingresos.desglose) {
                for (const item of data.ingresos.desglose) {
                    await this.cloud.addIngreso(item.fuente, item.monto, item.porcentaje || 0);
                    stats.ingresos++;
                }
            }

            // 2. Migrar Gastos Fijos
            if (data.gastosFijos.items) {
                for (const item of data.gastosFijos.items) {
                    await this.cloud.addGastoFijo(item.categoria, item.monto);
                    stats.fijos++;
                }
            }

            // 3. Migrar Gastos Variables
            if (data.gastosVariables.items) {
                for (const item of data.gastosVariables.items) {
                    await this.cloud.addGastoVariable(item.categoria, item.monto);
                    stats.variables++;
                }
            }

            // 4. Migrar Gastos Extras
            if (data.gastosExtras.items) {
                for (const item of data.gastosExtras.items) {
                    await this.cloud.addGastoExtra(item.categoria, item.monto);
                    stats.extras++;
                }
            }

            console.log('✅ Migración completada:', stats);
            return { success: true, stats };

        } catch (error) {
            console.error('❌ Error en migración:', error);
            return { success: false, error };
        }
    }
}

// Inicializar y reemplazar globalmente
// Esperamos un poco para asegurar que supabaseManager esté listo
setTimeout(() => {
    window.hybridStorage = new HybridStorageManager();
    // Opcional: Reemplazar window.storageManager si queremos interceptar todo automáticamente
    // window.storageManager = window.hybridStorage; 
    console.log('🚀 HybridStorage listo para usar como window.hybridStorage');
}, 1500);
