/**
 * 🔗 SUPABASE INGRESOS ADAPTER
 * Adaptador para conectar IngresosManager con Supabase
 * Mantiene compatibilidad 100% con código existente
 * Versión: 1.0.1 - CORREGIDO
 */

class SupabaseIngresosAdapter {
    constructor() {
        // ✅ NO guardamos referencias, usaremos window directamente
        console.log('✅ SupabaseIngresosAdapter inicializado');
    }

    /**
     * 📊 OBTENER INGRESOS (Compatible con estructura antigua)
     * Convierte datos de Supabase al formato esperado por tu aplicación
     */
    async getIngresos() {
        try {
            // Obtener período actual
            const periodo = window.supabaseManager.getPeriodo();
            
            // Obtener datos de Supabase
            const result = await window.supabaseManager.getIngresos(periodo.mes, periodo.anio);
            
            if (!result.success) {
                console.error('Error obteniendo ingresos de Supabase:', result.error);
                // Fallback a localStorage si falla
                return window.storageManager.getIngresos();
            }

            // Convertir al formato esperado
            const desglose = result.data.map(item => ({
                id: item.id,
                fuente: item.fuente,
                monto: parseFloat(item.monto),
                porcentaje: parseFloat(item.porcentaje || 0),
                activo: item.activo,
                fechaCreacion: item.created_at,
                fechaModificacion: item.updated_at
            }));

            const total = desglose.reduce((sum, item) => sum + item.monto, 0);

            const ingresosData = {
                total,
                desglose
            };

            console.log(`✅ ${desglose.length} ingresos cargados desde Supabase`);
            
            return ingresosData;

        } catch (error) {
            console.error('❌ Error en getIngresos:', error);
            // Fallback a localStorage
            return window.storageManager.getIngresos();
        }
    }

    /**
     * 💾 GUARDAR INGRESOS
     * Guarda tanto en Supabase como en localStorage (para compatibilidad)
     */
    async setIngresos(ingresosData) {
        try {
            // Guardar en localStorage primero (compatibilidad)
            window.storageManager.setIngresos(ingresosData);

            // Si hay desglose, sincronizar con Supabase
            if (ingresosData.desglose && ingresosData.desglose.length > 0) {
                const periodo = window.supabaseManager.getPeriodo();

                // Obtener ingresos actuales de Supabase
                const currentResult = await window.supabaseManager.getIngresos(periodo.mes, periodo.anio);
                const currentIds = currentResult.data?.map(i => i.id) || [];

                // Procesar cada ingreso del desglose
                for (const ingreso of ingresosData.desglose) {
                    // Calcular porcentaje
                    const porcentaje = ingresosData.total > 0 
                        ? (ingreso.monto / ingresosData.total * 100).toFixed(2)
                        : 0;

                    // Si el ingreso ya existe en Supabase, actualizar
                    if (currentIds.includes(ingreso.id)) {
                        await window.supabaseManager.updateIngreso(ingreso.id, {
                            fuente: ingreso.fuente,
                            monto: ingreso.monto,
                            porcentaje: porcentaje,
                            activo: ingreso.activo
                        });
                    } else {
                        // Si es nuevo, agregar (pero usar el ID existente si lo tiene)
                        await this.addIngreso(ingreso);
                    }
                }

                console.log('✅ Ingresos sincronizados con Supabase');
            }

            return true;

        } catch (error) {
            console.error('❌ Error guardando ingresos:', error);
            // Al menos se guardó en localStorage
            return false;
        }
    }

    /**
     * ➕ AGREGAR NUEVO INGRESO
     */
    async addIngreso(ingresoData) {
        try {
            // Primero agregar a Supabase
            const result = await window.supabaseManager.addIngreso(
                ingresoData.fuente,
                ingresoData.monto,
                0 // Porcentaje se calculará después
            );

            if (result.success) {
                console.log('✅ Ingreso agregado a Supabase:', result.data);
                
                // Actualizar localStorage con los datos de Supabase (usando su ID)
                const ingresos = window.storageManager.getIngresos();
                const nuevoIngreso = {
                    id: result.data.id, // ✅ Usar ID de Supabase
                    fuente: result.data.fuente,
                    monto: parseFloat(result.data.monto),
                    porcentaje: parseFloat(result.data.porcentaje || 0),
                    activo: result.data.activo,
                    fechaCreacion: result.data.created_at,
                    fechaModificacion: result.data.updated_at
                };
                
                ingresos.desglose.push(nuevoIngreso);
                ingresos.total = ingresos.desglose.reduce((sum, i) => sum + i.monto, 0);
                
                // Recalcular porcentajes
                ingresos.desglose.forEach(ing => {
                    ing.porcentaje = ingresos.total > 0 ? (ing.monto / ingresos.total * 100) : 0;
                });
                
                window.storageManager.setIngresos(ingresos);

                return nuevoIngreso;
            } else {
                console.error('Error agregando ingreso:', result.error);
                return null;
            }

        } catch (error) {
            console.error('❌ Error en addIngreso:', error);
            return null;
        }
    }

    /**
     * ✏️ ACTUALIZAR INGRESO
     */
    async updateIngreso(ingresoId, updates) {
        try {
            const result = await window.supabaseManager.updateIngreso(ingresoId, updates);

            if (result.success) {
                console.log('✅ Ingreso actualizado en Supabase');
                
                // Actualizar localStorage
                const ingresos = window.storageManager.getIngresos();
                const index = ingresos.desglose.findIndex(i => i.id === ingresoId);
                if (index !== -1) {
                    Object.assign(ingresos.desglose[index], updates);
                    ingresos.total = ingresos.desglose.reduce((sum, i) => sum + i.monto, 0);
                    window.storageManager.setIngresos(ingresos);
                }

                return result.data;
            } else {
                console.error('Error actualizando ingreso:', result.error);
                return null;
            }

        } catch (error) {
            console.error('❌ Error en updateIngreso:', error);
            return null;
        }
    }

    /**
     * 🗑️ ELIMINAR INGRESO
     */
    async deleteIngreso(ingresoId) {
        try {
            const result = await window.supabaseManager.deleteIngreso(ingresoId);

            if (result.success) {
                console.log('✅ Ingreso eliminado de Supabase');
                
                // Actualizar localStorage
                const ingresos = window.storageManager.getIngresos();
                ingresos.desglose = ingresos.desglose.filter(i => i.id !== ingresoId);
                ingresos.total = ingresos.desglose.reduce((sum, i) => sum + i.monto, 0);
                window.storageManager.setIngresos(ingresos);

                return true;
            } else {
                console.error('Error eliminando ingreso:', result.error);
                return false;
            }

        } catch (error) {
            console.error('❌ Error en deleteIngreso:', error);
            return false;
        }
    }

    /**
     * 🔄 SINCRONIZAR DATOS AL CARGAR
     * Esta función debe llamarse al iniciar la aplicación
     */
    async sincronizarDatos() {
        try {
            console.log('🔄 Sincronizando datos con Supabase...');
            
            // ✅ CORREGIDO: Usar getIngresos() en lugar de obtenerIngresos()
            const ingresosSupabase = await this.getIngresos();
            
            // ✅ CORRECCIÓN: Usar window.storageManager directamente
            window.storageManager.setIngresos(ingresosSupabase);
            
            const ingresosLocal = window.storageManager.getIngresos();
            
            console.log('✅ Datos sincronizados correctamente');
            console.log('📊 Ingresos en Supabase:', ingresosSupabase);
            console.log('📦 Ingresos en localStorage:', ingresosLocal);
            
        } catch (error) {
            console.error('❌ Error sincronizando datos:', error);
            throw error; // ✅ Re-lanzar el error para manejarlo arriba
        }
    }
}

// ============================================
// INICIALIZAR Y EXPORTAR
// ============================================

// Crear instancia global
window.supabaseIngresosAdapter = new SupabaseIngresosAdapter();

// 🔄 SINCRONIZAR AUTOMÁTICAMENTE AL CARGAR (con delay para esperar módulos)
window.addEventListener('DOMContentLoaded', () => {
    // Esperar a que storageManager esté disponible
    const esperarStorageManager = () => {
        if (window.storageManager) {
            console.log('📦 StorageManager detectado, iniciando sincronización...');
            window.supabaseIngresosAdapter.sincronizarDatos();
        } else {
            console.log('⏳ Esperando storageManager...');
            setTimeout(esperarStorageManager, 100);
        }
    };
    
    // Esperar 1 segundo antes de iniciar la verificación
    setTimeout(esperarStorageManager, 1000);
});

console.log('🔗 SupabaseIngresosAdapter v1.0.1 CORREGIDO cargado correctamente');
console.log('💡 Usa window.supabaseIngresosAdapter para operaciones de ingresos');