/**
 * 🔗 SUPABASE CLIENT - WiseSpend
 * Sistema de Conexión con Base de Datos
 * Versión: 1.0.0
 * 
 * Este archivo maneja toda la conexión y operaciones con Supabase
 */

// ============================================
// CONFIGURACIÓN DE SUPABASE
// ============================================

const SUPABASE_URL = 'https://ikudmgmtrerssffihtgl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrdWRtZ210cmVyc3NmZmlodGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MDQ5MDMsImV4cCI6MjA3NjE4MDkwM30.2Er8z4TZwtI9yvTqve0P_NHzfcxb_MkWKL6f4DHoe7Y';

// Esperar a que window.supabase esté disponible (se inicializa en dashboard.html)
if (!window.supabase) {
    console.error('❌ window.supabase no está disponible. Asegúrate de que dashboard.html lo inicialice primero.');
    throw new Error('Supabase no inicializado');
}

// Usar el cliente ya inicializado desde dashboard.html
const supabase = window.supabase;

console.log('✅ Supabase Client conectado correctamente');

// ============================================
// CLASE PRINCIPAL: SupabaseManager
// ============================================

class SupabaseManager {
    constructor() {
        this.currentUser = null;
        this.currentPeriod = {
            mes: new Date().getMonth() + 1, // Mes actual (1-12)
            anio: new Date().getFullYear()
        };
        this.init();
    }

    /**
     * 🚀 INICIALIZACIÓN
     */
    async init() {
        console.log('🔧 Inicializando SupabaseManager...');
        await this.checkSession();
    }

    /**
     * 👤 VERIFICAR SESIÓN ACTUAL
     */
    async checkSession() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) throw error;

            if (session) {
                this.currentUser = session.user;
                console.log('✅ Usuario autenticado:', this.currentUser.email);
                return true;
            } else {
                console.log('⚠️ No hay sesión activa');
                return false;
            }
        } catch (error) {
            console.error('❌ Error verificando sesión:', error);
            return false;
        }
    }

    /**
     * 📅 ESTABLECER PERÍODO ACTUAL
     */
    setPeriodo(mes, anio) {
        this.currentPeriod = { mes, anio };
        console.log(`📅 Período actualizado: ${mes}/${anio}`);
    }

    /**
     * 📅 OBTENER PERÍODO ACTUAL
     */
    getPeriodo() {
        return this.currentPeriod;
    }

    // ============================================
    // 💰 FUNCIONES DE INGRESOS
    // ============================================

    /**
     * 📊 OBTENER INGRESOS POR PERÍODO
     */
    async getIngresos(mes = null, anio = null) {
        try {
            const periodo = mes && anio ? { mes, anio } : this.currentPeriod;

            const { data, error } = await supabase
                .from('income_sources')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('periodo_mes', periodo.mes)
                .eq('periodo_anio', periodo.anio)
                .eq('activo', true)
                .order('monto', { ascending: false });

            if (error) throw error;

            console.log(`✅ Ingresos obtenidos (${periodo.mes}/${periodo.anio}):`, data.length);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo ingresos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ➕ AGREGAR NUEVO INGRESO
     */
    async addIngreso(fuente, monto, porcentaje = 0, activo = true) {
        try {
            const { data, error } = await supabase
                .from('income_sources')
                .insert([{
                    user_id: this.currentUser.id,
                    fuente,
                    monto,
                    porcentaje,
                    activo,
                    periodo_mes: this.currentPeriod.mes,
                    periodo_anio: this.currentPeriod.anio
                }])
                .select();

            if (error) throw error;

            console.log('✅ Ingreso agregado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error agregando ingreso:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✏️ ACTUALIZAR INGRESO
     */
    async updateIngreso(id, updates) {
        try {
            const { data, error } = await supabase
                .from('income_sources')
                .update(updates)
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select();

            if (error) throw error;

            console.log('✅ Ingreso actualizado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error actualizando ingreso:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗑️ ELIMINAR INGRESO
     */
    async deleteIngreso(id) {
        try {
            const { error } = await supabase
                .from('income_sources')
                .delete()
                .eq('id', id)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            console.log('✅ Ingreso eliminado');
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando ingreso:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 🏠 FUNCIONES DE GASTOS FIJOS
    // ============================================

    /**
     * 📊 OBTENER GASTOS FIJOS POR PERÍODO
     */
    async getGastosFijos(mes = null, anio = null) {
        try {
            const periodo = mes && anio ? { mes, anio } : this.currentPeriod;

            const { data, error } = await supabase
                .from('fixed_expenses')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('periodo_mes', periodo.mes)
                .eq('periodo_anio', periodo.anio)
                .eq('activo', true)
                .order('monto', { ascending: false });

            if (error) throw error;

            console.log(`✅ Gastos fijos obtenidos (${periodo.mes}/${periodo.anio}):`, data.length);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo gastos fijos:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ➕ AGREGAR GASTO FIJO
     */
    async addGastoFijo(categoria, monto) {
        try {
            const { data, error } = await supabase
                .from('fixed_expenses')
                .insert([{
                    user_id: this.currentUser.id,
                    categoria,
                    monto,
                    activo: true,
                    pagado: false,
                    periodo_mes: this.currentPeriod.mes,
                    periodo_anio: this.currentPeriod.anio
                }])
                .select();

            if (error) throw error;

            console.log('✅ Gasto fijo agregado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error agregando gasto fijo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✅ MARCAR GASTO FIJO COMO PAGADO
     */
    async marcarGastoFijoPagado(id, pagado = true) {
        try {
            const { data, error } = await supabase
                .from('fixed_expenses')
                .update({
                    pagado,
                    fecha_pago: pagado ? new Date().toISOString() : null
                })
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select();

            if (error) throw error;

            console.log('✅ Gasto fijo actualizado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error actualizando gasto fijo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✏️ ACTUALIZAR GASTO FIJO
     */
    async updateGastoFijo(id, updates) {
        try {
            const { data, error } = await supabase
                .from('fixed_expenses')
                .update(updates)
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select();

            if (error) throw error;

            console.log('✅ Gasto fijo actualizado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error actualizando gasto fijo:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗑️ ELIMINAR GASTO FIJO
     */
    async deleteGastoFijo(id) {
        try {
            const { error } = await supabase
                .from('fixed_expenses')
                .delete()
                .eq('id', id)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            console.log('✅ Gasto fijo eliminado');
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando gasto fijo:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 📊 FUNCIONES DE GASTOS VARIABLES
    // ============================================

    /**
     * 📊 OBTENER GASTOS VARIABLES POR PERÍODO
     */
    async getGastosVariables(mes = null, anio = null) {
        try {
            const periodo = mes && anio ? { mes, anio } : this.currentPeriod;

            const { data, error } = await supabase
                .from('variable_expenses')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('periodo_mes', periodo.mes)
                .eq('periodo_anio', periodo.anio)
                .eq('activo', true)
                .order('monto', { ascending: false });

            if (error) throw error;

            console.log(`✅ Gastos variables obtenidos (${periodo.mes}/${periodo.anio}):`, data.length);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo gastos variables:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ➕ AGREGAR GASTO VARIABLE
     */
    async addGastoVariable(categoria, monto) {
        try {
            const { data, error } = await supabase
                .from('variable_expenses')
                .insert([{
                    user_id: this.currentUser.id,
                    categoria,
                    monto,
                    activo: true,
                    pagado: false,
                    periodo_mes: this.currentPeriod.mes,
                    periodo_anio: this.currentPeriod.anio
                }])
                .select();

            if (error) throw error;

            console.log('✅ Gasto variable agregado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error agregando gasto variable:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✅ MARCAR GASTO VARIABLE COMO PAGADO
     */
    async marcarGastoVariablePagado(id, pagado = true) {
        try {
            const { data, error } = await supabase
                .from('variable_expenses')
                .update({
                    pagado,
                    fecha_pago: pagado ? new Date().toISOString() : null
                })
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select();

            if (error) throw error;

            console.log('✅ Gasto variable actualizado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error actualizando gasto variable:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ✏️ ACTUALIZAR GASTO VARIABLE
     */
    async updateGastoVariable(id, updates) {
        try {
            const { data, error } = await supabase
                .from('variable_expenses')
                .update(updates)
                .eq('id', id)
                .eq('user_id', this.currentUser.id)
                .select();

            if (error) throw error;

            console.log('✅ Gasto variable actualizado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error actualizando gasto variable:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗑️ ELIMINAR GASTO VARIABLE
     */
    async deleteGastoVariable(id) {
        try {
            const { error } = await supabase
                .from('variable_expenses')
                .delete()
                .eq('id', id)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            console.log('✅ Gasto variable eliminado');
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando gasto variable:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // ⚡ FUNCIONES DE GASTOS EXTRAS
    // ============================================

    /**
     * 📊 OBTENER GASTOS EXTRAS POR PERÍODO
     */
    async getGastosExtras(mes = null, anio = null) {
        try {
            const periodo = mes && anio ? { mes, anio } : this.currentPeriod;

            const { data, error } = await supabase
                .from('extra_expenses')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .eq('periodo_mes', periodo.mes)
                .eq('periodo_anio', periodo.anio)
                .eq('activo', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`✅ Gastos extras obtenidos (${periodo.mes}/${periodo.anio}):`, data.length);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Error obteniendo gastos extras:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * ➕ AGREGAR GASTO EXTRA
     */
    async addGastoExtra(categoria, monto) {
        try {
            const { data, error } = await supabase
                .from('extra_expenses')
                .insert([{
                    user_id: this.currentUser.id,
                    categoria,
                    monto,
                    activo: true,
                    pagado: false,
                    periodo_mes: this.currentPeriod.mes,
                    periodo_anio: this.currentPeriod.anio
                }])
                .select();

            if (error) throw error;

            console.log('✅ Gasto extra agregado:', data[0]);
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('❌ Error agregando gasto extra:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🗑️ ELIMINAR GASTO EXTRA
     */
    async deleteGastoExtra(id) {
        try {
            const { error } = await supabase
                .from('extra_expenses')
                .delete()
                .eq('id', id)
                .eq('user_id', this.currentUser.id);

            if (error) throw error;

            console.log('✅ Gasto extra eliminado');
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando gasto extra:', error);
            return { success: false, error: error.message };
        }
    }

    // ============================================
    // 📊 FUNCIONES DE RESUMEN Y TOTALES
    // ============================================

    /**
     * 📊 OBTENER TOTALES DEL PERÍODO ACTUAL
     */
    async getTotales(mes = null, anio = null) {
        try {
            const periodo = mes && anio ? { mes, anio } : this.currentPeriod;

            // Obtener todos los datos en paralelo
            const [ingresos, gastosFijos, gastosVariables, gastosExtras] = await Promise.all([
                this.getIngresos(periodo.mes, periodo.anio),
                this.getGastosFijos(periodo.mes, periodo.anio),
                this.getGastosVariables(periodo.mes, periodo.anio),
                this.getGastosExtras(periodo.mes, periodo.anio)
            ]);

            // Calcular totales
            const totalIngresos = ingresos.data?.reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const totalGastosFijos = gastosFijos.data?.reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const totalGastosVariables = gastosVariables.data?.reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const totalGastosExtras = gastosExtras.data?.reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;

            const totalGastos = totalGastosFijos + totalGastosVariables + totalGastosExtras;
            const balance = totalIngresos - totalGastos;

            // Calcular pagados
            const gastosFijosPagados = gastosFijos.data?.filter(g => g.pagado).reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const gastosVariablesPagados = gastosVariables.data?.filter(g => g.pagado).reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const gastosExtrasPagados = gastosExtras.data?.filter(g => g.pagado).reduce((sum, item) => sum + parseFloat(item.monto), 0) || 0;
            const totalPagados = gastosFijosPagados + gastosVariablesPagados + gastosExtrasPagados;

            const porPagar = totalGastos - totalPagados;

            const totales = {
                ingresos: totalIngresos,
                gastosFijos: totalGastosFijos,
                gastosVariables: totalGastosVariables,
                gastosExtras: totalGastosExtras,
                totalGastos: totalGastos,
                balance: balance,
                pagados: totalPagados,
                porPagar: porPagar,
                periodo: periodo
            };

            console.log('📊 Totales calculados:', totales);
            return { success: true, data: totales };
        } catch (error) {
            console.error('❌ Error calculando totales:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 📊 OBTENER DASHBOARD COMPLETO
     */
    async getDashboardData(mes = null, anio = null) {
        try {
            const periodo = mes && anio ? { mes, anio } : this.currentPeriod;

            const [ingresos, gastosFijos, gastosVariables, gastosExtras, totales] = await Promise.all([
                this.getIngresos(periodo.mes, periodo.anio),
                this.getGastosFijos(periodo.mes, periodo.anio),
                this.getGastosVariables(periodo.mes, periodo.anio),
                this.getGastosExtras(periodo.mes, periodo.anio),
                this.getTotales(periodo.mes, periodo.anio)
            ]);

            return {
                success: true,
                data: {
                    ingresos: ingresos.data || [],
                    gastosFijos: gastosFijos.data || [],
                    gastosVariables: gastosVariables.data || [],
                    gastosExtras: gastosExtras.data || [],
                    totales: totales.data || {},
                    periodo: periodo
                }
            };
        } catch (error) {
            console.error('❌ Error obteniendo datos del dashboard:', error);
            return { success: false, error: error.message };
        }
    }
}

// ============================================
// EXPORTAR E INICIALIZAR
// ============================================

// Crear instancia global
window.supabaseManager = new SupabaseManager();

// Exportar para usar como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SupabaseManager;
}

console.log('🎉 Supabase Manager cargado correctamente');
console.log('💡 Usa window.supabaseManager para acceder a las funciones');