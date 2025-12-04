/**
 * 🔄 HYBRID STORAGE MANAGER
 * Gestor inteligente que sincroniza LocalStorage con Supabase
 * Actúa como proxy: Si hay usuario, usa Nube. Si no, usa Local.
 */

class HybridStorageManager {
    constructor() {

        // Usar TemporalStorage si está disponible (para soporte de períodos)
        if (window.TemporalStorage) {
            this.local = new window.TemporalStorage();
            console.log('🔄 HybridStorage usando TemporalStorage');
        } else {
            this.local = new StorageManager(); // Instancia del storage original
            console.log('⚠️ HybridStorage usando StorageManager (Legacy)');
        }
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
            this.syncLocalToCloud();
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
    getIngresos() {
        return this.local.getIngresos();
    }

    setIngresos(ingresos) {
        const result = this.local.setIngresos(ingresos);
        if (this.useCloud && this.isOnline) {
            console.warn('⚠️ setIngresos masivo no optimizado para nube. Usa addIngreso/updateIngreso.');
        }
        return result;
    }

    async addIngreso(ingreso) {
        const result = this.local.addIngreso(ingreso);
        if (this.useCloud && this.isOnline) {
            // CORRECCIÓN: Pasar los parámetros correctamente (fuente, monto)
            await window.supabaseManager.addIngreso(ingreso.fuente, ingreso.monto).catch(console.error);
        }
        return result;
    }

    async updateIngreso(id, updates) {
        const result = this.local.updateIngreso(id, updates);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.updateIngreso(id, updates).catch(console.error);
        }
        return result;
    }

    async deleteIngreso(id) {
        const result = this.local.deleteIngreso(id);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.deleteIngreso(id).catch(console.error);
        }
        return result;
    }

    // --- GASTOS FIJOS ---
    getGastosFijos() {
        return this.local.getGastosFijos();
    }

    setGastosFijos(gastosFijos) {
        const result = this.local.setGastosFijos(gastosFijos);
        if (this.useCloud && this.isOnline) {
            console.warn('⚠️ setGastosFijos masivo no optimizado para nube. Usa addGastoFijo/updateGastoFijo.');
        }
        return result;
    }

    async addGastoFijo(gasto) {
        const result = this.local.addGastoFijo(gasto);
        if (this.useCloud && this.isOnline) {
            // CORRECCIÓN: Pasar los parámetros correctamente (categoria, monto)
            await window.supabaseManager.addGastoFijo(gasto.categoria, gasto.monto).catch(console.error);
        }
        return result;
    }

    async updateGastoFijo(id, updates) {
        const result = this.local.updateGastoFijo(id, updates);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.updateGastoFijo(id, updates).catch(console.error);
        }
        return result;
    }

    async deleteGastoFijo(id) {
        console.log('🗑️ HybridStorage: deleteGastoFijo', id);
        console.log('📦 this.local constructor:', this.local && this.local.constructor ? this.local.constructor.name : 'Unknown');

        if (!this.local.deleteGastoFijo) {
            console.error('❌ CRITICAL: deleteGastoFijo missing from local storage implementation');
            console.log('Methods available:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.local)));
            return false;
        }

        const result = this.local.deleteGastoFijo(id);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.deleteGastoFijo(id).catch(console.error);
        }
        return result;
    }

    // --- GASTOS VARIABLES ---
    getGastosVariables() {
        return this.local.getGastosVariables();
    }

    setGastosVariables(gastosVariables) {
        const result = this.local.setGastosVariables(gastosVariables);
        if (this.useCloud && this.isOnline) {
            console.warn('⚠️ setGastosVariables masivo no optimizado para nube. Usa addGastoVariable/updateGastoVariable.');
        }
        return result;
    }

    async addGastoVariable(gasto) {
        const result = this.local.addGastoVariable(gasto);
        if (this.useCloud && this.isOnline) {
            // CORRECCIÓN: Pasar los parámetros correctamente (categoria, monto)
            await window.supabaseManager.addGastoVariable(gasto.categoria, gasto.monto).catch(console.error);
        }
        return result;
    }

    async updateGastoVariable(id, updates) {
        const result = this.local.updateGastoVariable(id, updates);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.updateGastoVariable(id, updates).catch(console.error);
        }
        return result;
    }

    async deleteGastoVariable(id) {
        const result = this.local.deleteGastoVariable(id);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.deleteGastoVariable(id).catch(console.error);
        }
        return result;
    }

    // --- GASTOS EXTRAS ---
    getGastosExtras() {
        return this.local.getGastosExtras();
    }

    setGastosExtras(gastosExtras) {
        const result = this.local.setGastosExtras(gastosExtras);
        if (this.useCloud && this.isOnline) {
            console.warn('⚠️ setGastosExtras masivo no optimizado para nube. Usa addGastoExtra/updateGastoExtra.');
        }
        return result;
    }

    async addGastoExtra(gasto) {
        const result = this.local.addGastoExtra(gasto);
        if (this.useCloud && this.isOnline) {
            // CORRECCIÓN: Pasar los parámetros correctamente (categoria, monto)
            await window.supabaseManager.addGastoExtra(gasto.categoria, gasto.monto).catch(console.error);
        }
        return result;
    }

    async updateGastoExtra(id, updates) {
        const result = this.local.updateGastoExtra(id, updates);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.updateGastoExtra(id, updates).catch(console.error);
        }
        return result;
    }

    async deleteGastoExtra(id) {
        const result = this.local.deleteGastoExtra(id);
        if (this.useCloud && this.isOnline) {
            await window.supabaseManager.deleteGastoExtra(id).catch(console.error);
        }
        return result;
    }

    // --- CONFIGURACIÓN ---
    getConfiguracion() {
        return this.local.getConfiguracion();
    }

    setConfiguracion(config) {
        return this.local.setConfiguracion(config);
    }

    // --- MÉTODOS DE USUARIO ---
    getUserData() {
        return this.local.getUserData();
    }

    setUserData(userData) {
        return this.local.setUserData(userData);
    }

    // --- MÉTODOS GENÉRICOS DE STORAGE ---
    getItem(key) {
        return this.local.getItem(key);
    }

    setItem(key, value) {
        return this.local.setItem(key, value);
    }

    removeItem(key) {
        return this.local.removeItem(key);
    }

    // --- DASHBOARD DATA (Core) ---
    getDashboardData() {
        // SIEMPRE retornar datos locales para evitar bloqueos en UI
        // La sincronización se maneja en segundo plano
        if (this.useCloud && this.isOnline) {
            // Opcional: Disparar una actualización en segundo plano si es necesario
            // this.refreshFromCloud(); 
        }
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

        // 🛑 EVITAR BUCLE INFINITO: Verificar si ya se migró
        if (localStorage.getItem('migration_completed_v1') === 'true') {
            console.log('✅ Migración ya realizada previamente. Omitiendo.');
            return { success: true, message: 'Already migrated' };
        }

        // 🛡️ SAFETY CHECK: Si Supabase ya tiene datos, asumimos que la migración ya se hizo (o parcialmente)
        // y evitamos duplicar todo.
        try {
            const currentPeriod = this.cloud.getPeriodo();
            const existingData = await this.cloud.getIngresos(currentPeriod.mes, currentPeriod.anio);

            if (existingData.success && existingData.data.length > 0) {
                console.warn('⚠️ Supabase ya tiene datos. Omitiendo migración masiva para evitar duplicados.');
                localStorage.setItem('migration_completed_v1', 'true');
                return { success: true, message: 'Migration skipped - Data exists' };
            }
        } catch (e) {
            console.warn('⚠️ No se pudo verificar estado de Supabase, procediendo con precaución...', e);
        }

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

            // ✅ MARCAR COMO COMPLETADO
            localStorage.setItem('migration_completed_v1', 'true');
            console.log('✅ Migración completada y marcada:', stats);
            return { success: true, stats };

        } catch (error) {
            console.error('❌ Error en migración:', error);
            return { success: false, error };
        }
    }

    // --- EXPORTACIÓN ---
    async exportData() {
        if (this.useCloud && this.isOnline) {
            console.log('☁️ Exportando datos desde Supabase...');
            // Nota: getDashboardData ahora es síncrono y devuelve local, 
            // pero para exportar queremos lo de la nube si es posible.
            // Aquí hacemos una excepción y llamamos directo a la nube
            const response = await this.cloud.getDashboardData();
            let data;

            if (response.success) {
                data = {
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
                    configuracion: this.local.getConfiguracion(),
                    userData: this.local.getUserData(),
                    balance: response.data.totales.balance
                };
            } else {
                data = this.local.getDashboardData();
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0.0',
                application: 'Presupuesto Familiar (Cloud)',
                data: data
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            return {
                blob: dataBlob,
                filename: `presupuesto-familiar-cloud-${new Date().toISOString().split('T')[0]}.json`
            };
        }
        return this.local.exportData();
    }
}

// Inicializar y reemplazar globalmente
// Esperamos un poco para asegurar que supabaseManager esté listo
window.hybridStorage = new HybridStorageManager();
// Opcional: Reemplazar window.storageManager si queremos interceptar todo automáticamente
window.storageManager = window.hybridStorage;
console.log('🚀 HybridStorage listo para usar como window.hybridStorage');

// Disparar evento para notificar que el storage está listo
window.dispatchEvent(new Event('storageManagerReady'));