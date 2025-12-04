/**
 * SupabaseStorageManager - Gestor de almacenamiento con Supabase
 * Reemplaza localStorage con base de datos PostgreSQL
 */

class SupabaseStorageManager {
    constructor() {
        // Verificar que Supabase esté disponible
        if (!window.supabase) {
            console.error('❌ window.supabase no está disponible');
            throw new Error('Supabase no está inicializado. Verifica que el SDK esté cargado.');
        }

        console.log('✅ window.supabase detectado:', typeof window.supabase);

        // Usar el cliente ya inicializado desde el HTML
        this.supabase = window.supabase;

        this.currentUser = null;
        this.cache = {
            ingresos: null,
            gastosFijos: null,
            gastosVariables: null,
            gastosExtras: null,
            configuracion: null,
            notas: null
        };
    }

    // ============================================
    // AUTENTICACIÓN
    // ============================================

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await this.supabase.auth.getUser();
            if (error) throw error;
            this.currentUser = user;
            return user;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    }

    async signUp(email, password, username) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });
            if (error) throw error;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            if (error) throw error;
            this.currentUser = data.user;
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            this.currentUser = null;
            this.clearCache();
            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // INGRESOS
    // ============================================

    async getIngresos() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await this.supabase
                .from('ingresos')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.cache.ingresos = data || [];
            return this.cache.ingresos;
        } catch (error) {
            console.error('Error obteniendo ingresos:', error);
            return this.cache.ingresos || [];
        }
    }

    async setIngresos(ingresos) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            // Eliminar ingresos existentes del usuario
            await this.supabase
                .from('ingresos')
                .delete()
                .eq('user_id', user.id);

            // Insertar nuevos ingresos
            if (ingresos && ingresos.length > 0) {
                const ingresosConUserId = ingresos.map(ingreso => ({
                    ...ingreso,
                    user_id: user.id,
                    id: ingreso.id || undefined
                }));

                const { data, error } = await this.supabase
                    .from('ingresos')
                    .insert(ingresosConUserId)
                    .select();

                if (error) throw error;
                this.cache.ingresos = data;
                return data;
            }

            this.cache.ingresos = [];
            return [];
        } catch (error) {
            console.error('Error guardando ingresos:', error);
            throw error;
        }
    }

    // ============================================
    // GASTOS FIJOS
    // ============================================

    async getGastosFijos() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await this.supabase
                .from('fixed_expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.cache.gastosFijos = data || [];
            return this.cache.gastosFijos;
        } catch (error) {
            console.error('Error obteniendo gastos fijos:', error);
            return this.cache.gastosFijos || [];
        }
    }

    setGastosFijos(gastos) {
        // ... (existing implementation kept for bulk operations)
        return this._setGastos(gastos, 'fijo');
    }

    // Helper interno para setGastos masivo
    async _setGastos(gastos, tipo) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const tableName = this.getTableName(tipo);

            await this.supabase
                .from(tableName)
                .delete()
                .eq('user_id', user.id);

            if (gastos && gastos.length > 0) {
                const gastosConUserId = gastos.map(gasto => {
                    const { tipo: _, ...gastoSinTipo } = gasto; // Eliminar tipo si existe
                    return {
                        ...gastoSinTipo,
                        user_id: user.id,
                        id: gasto.id || undefined
                    };
                });

                const { data, error } = await this.supabase
                    .from(tableName)
                    .insert(gastosConUserId)
                    .select();

                if (error) throw error;
                this.updateCache(tipo, data);
                return data;
            }

            this.updateCache(tipo, []);
            return [];
        } catch (error) {
            console.error(`Error guardando gastos ${tipo}:`, error);
            throw error;
        }
    }

    async addGastoFijo(gasto) {
        return this.addGasto(gasto, 'fijo');
    }

    async updateGastoFijo(id, updates) {
        return this.updateGasto(id, updates, 'fijo');
    }

    async deleteGastoFijo(id) {
        return this.deleteGasto(id, 'fijo');
    }

    // ============================================
    // GASTOS VARIABLES
    // ============================================

    async getGastosVariables() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await this.supabase
                .from('variable_expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.cache.gastosVariables = data || [];
            return this.cache.gastosVariables;
        } catch (error) {
            console.error('Error obteniendo gastos variables:', error);
            return this.cache.gastosVariables || [];
        }
    }

    setGastosVariables(gastos) {
        return this._setGastos(gastos, 'variable');
    }

    async addGastoVariable(gasto) {
        return this.addGasto(gasto, 'variable');
    }

    async updateGastoVariable(id, updates) {
        return this.updateGasto(id, updates, 'variable');
    }

    async deleteGastoVariable(id) {
        return this.deleteGasto(id, 'variable');
    }

    // ============================================
    // GASTOS EXTRAS
    // ============================================

    async getGastosExtras() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await this.supabase
                .from('extra_expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.cache.gastosExtras = data || [];
            return this.cache.gastosExtras;
        } catch (error) {
            console.error('Error obteniendo gastos extras:', error);
            return this.cache.gastosExtras || [];
        }
    }

    setGastosExtras(gastos) {
        return this._setGastos(gastos, 'extra');
    }

    async addGastoExtra(gasto) {
        return this.addGasto(gasto, 'extra');
    }

    async updateGastoExtra(id, updates) {
        return this.updateGasto(id, updates, 'extra');
    }

    async deleteGastoExtra(id) {
        return this.deleteGasto(id, 'extra');
    }

    // ============================================
    // MÉTODOS GENÉRICOS DE GASTOS (CRUD)
    // ============================================

    getTableName(tipo) {
        const map = {
            'fijo': 'fixed_expenses',
            'variable': 'variable_expenses',
            'extra': 'extra_expenses'
        };
        return map[tipo] || 'gastos';
    }

    async addGasto(gasto, tipo) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const tableName = this.getTableName(tipo);
            const { tipo: _, ...gastoSinTipo } = gasto; // Eliminar tipo del objeto a guardar

            const gastoData = {
                user_id: user.id,
                id: gasto.id || undefined,
                categoria: gasto.categoria,
                monto: gasto.monto,
                activo: gasto.activo !== undefined ? gasto.activo : true,
                pagado: gasto.pagado !== undefined ? gasto.pagado : false,
                created_at: gasto.fechaCreacion || new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from(tableName)
                .insert(gastoData)
                .select()
                .single();

            if (error) throw error;

            // Actualizar caché
            this.addToCache(tipo, data);
            return data;
        } catch (error) {
            console.error(`Error agregando gasto ${tipo}:`, error);
            throw error;
        }
    }

    async updateGasto(id, updates, tipo) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const tableName = this.getTableName(tipo);
            const { tipo: _, ...updatesSinTipo } = updates;

            const { data, error } = await this.supabase
                .from(tableName)
                .update(updatesSinTipo)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) throw error;

            // Actualizar caché
            this.updateInCache(tipo, id, updates);
            return data;
        } catch (error) {
            console.error(`Error actualizando gasto ${tipo}:`, error);
            throw error;
        }
    }

    async deleteGasto(id, tipo) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const tableName = this.getTableName(tipo);

            const { error } = await this.supabase
                .from(tableName)
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);

            if (error) throw error;

            // Actualizar caché
            this.removeFromCache(tipo, id);
            return true;
        } catch (error) {
            console.error(`Error eliminando gasto ${tipo}:`, error);
            throw error;
        }
    }

    // ============================================
    // GESTIÓN DE CACHÉ
    // ============================================

    updateCache(tipo, data) {
        const key = this.getCacheKey(tipo);
        if (key) this.cache[key] = data;
    }

    addToCache(tipo, item) {
        const key = this.getCacheKey(tipo);
        if (key && this.cache[key]) {
            this.cache[key].unshift(item);
        }
    }

    updateInCache(tipo, id, updates) {
        const key = this.getCacheKey(tipo);
        if (key && this.cache[key]) {
            const index = this.cache[key].findIndex(i => i.id === id);
            if (index !== -1) {
                this.cache[key][index] = { ...this.cache[key][index], ...updates };
            }
        }
    }

    removeFromCache(tipo, id) {
        const key = this.getCacheKey(tipo);
        if (key && this.cache[key]) {
            this.cache[key] = this.cache[key].filter(i => i.id !== id);
        }
    }

    getCacheKey(tipo) {
        const map = {
            'fijo': 'gastosFijos',
            'variable': 'gastosVariables',
            'extra': 'gastosExtras'
        };
        return map[tipo];
    }

    // ============================================
    // CONFIGURACIÓN
    // ============================================

    async getConfiguracion() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await this.supabase
                .from('configuracion')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            this.cache.configuracion = data || this.getDefaultConfig();
            return this.cache.configuracion;
        } catch (error) {
            console.error('Error obteniendo configuración:', error);
            return this.getDefaultConfig();
        }
    }

    async setConfiguracion(config) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const configConUserId = {
                ...config,
                user_id: user.id
            };

            const { data: existing } = await this.supabase
                .from('configuracion')
                .select('id')
                .eq('user_id', user.id)
                .single();

            let result;
            if (existing) {
                result = await this.supabase
                    .from('configuracion')
                    .update(configConUserId)
                    .eq('user_id', user.id)
                    .select()
                    .single();
            } else {
                result = await this.supabase
                    .from('configuracion')
                    .insert(configConUserId)
                    .select()
                    .single();
            }

            if (result.error) throw result.error;
            this.cache.configuracion = result.data;
            return result.data;
        } catch (error) {
            console.error('Error guardando configuración:', error);
            throw error;
        }
    }

    getDefaultConfig() {
        return {
            moneda: 'CLP',
            tema: 'light',
            auto_guardado: true,
            preferencias: {}
        };
    }

    // ============================================
    // NOTAS
    // ============================================

    async getNotas() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            const { data, error } = await this.supabase
                .from('notas')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.cache.notas = data || [];
            return this.cache.notas;
        } catch (error) {
            console.error('Error obteniendo notas:', error);
            return this.cache.notas || [];
        }
    }

    async setNotas(notas) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('Usuario no autenticado');

            await this.supabase
                .from('notas')
                .delete()
                .eq('user_id', user.id);

            if (notas && notas.length > 0) {
                const notasConUserId = notas.map(nota => ({
                    ...nota,
                    user_id: user.id,
                    id: nota.id || undefined
                }));

                const { data, error } = await this.supabase
                    .from('notas')
                    .insert(notasConUserId)
                    .select();

                if (error) throw error;
                this.cache.notas = data;
                return data;
            }

            this.cache.notas = [];
            return [];
        } catch (error) {
            console.error('Error guardando notas:', error);
            throw error;
        }
    }

    // ============================================
    // UTILIDADES
    // ============================================

    clearCache() {
        this.cache = {
            ingresos: null,
            gastosFijos: null,
            gastosVariables: null,
            gastosExtras: null,
            configuracion: null,
            notas: null
        };
    }

    async syncAll() {
        try {
            await Promise.all([
                this.getIngresos(),
                this.getGastosFijos(),
                this.getGastosVariables(),
                this.getGastosExtras(),
                this.getConfiguracion(),
                this.getNotas()
            ]);
            console.log('✅ Sincronización completa exitosa');
            return true;
        } catch (error) {
            console.error('Error en sincronización:', error);
            return false;
        }
    }
}

// ============================================
// INICIALIZACIÓN SEGURA
// ============================================

// Esperar a que window.supabase esté disponible antes de inicializar
if (window.supabase) {
    try {
        window.supabaseStorageManager = new SupabaseStorageManager();
        console.log('✅ SupabaseStorageManager inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando SupabaseStorageManager:', error);
    }
} else {
    console.error('❌ No se puede inicializar SupabaseStorageManager: window.supabase no disponible');
    console.log('⏳ Esperando a que Supabase esté disponible...');

    // Intentar inicializar después de un delay
    setTimeout(() => {
        if (window.supabase) {
            try {
                window.supabaseStorageManager = new SupabaseStorageManager();
                console.log('✅ SupabaseStorageManager inicializado correctamente (retry)');
            } catch (error) {
                console.error('❌ Error inicializando SupabaseStorageManager (retry):', error);
            }
        } else {
            console.error('❌ window.supabase sigue no disponible después del retry');
        }
    }, 500);
}
