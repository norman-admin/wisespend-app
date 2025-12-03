/**
 * 🧹 CLEANUP DUPLICATES SCRIPT
 * Elimina registros duplicados en Supabase manteniendo solo el más reciente
 */

async function cleanupDuplicates() {
    console.log('🧹 Iniciando limpieza de duplicados...');
    const tables = ['income_sources', 'fixed_expenses', 'variable_expenses', 'extra_expenses'];

    for (const table of tables) {
        await cleanupTable(table);
    }

    console.log('✨ Limpieza completada en todas las tablas');
    alert('Limpieza completada. Por favor recarga la página.');
}

async function cleanupTable(tableName) {
    console.log(`🔍 Analizando tabla: ${tableName}...`);

    try {
        // 1. Obtener todos los registros
        const { data: allRecords, error } = await window.supabase
            .from(tableName)
            .select('*')
            .order('created_at', { ascending: false }); // Los más recientes primero

        if (error) throw error;

        if (!allRecords || allRecords.length === 0) {
            console.log(`✅ Tabla ${tableName} vacía o sin datos.`);
            return;
        }

        console.log(`📊 Total registros en ${tableName}: ${allRecords.length}`);

        // 2. Identificar duplicados
        // Usamos un Map para guardar el primer registro encontrado (el más reciente)
        // Clave única: categoria/fuente + monto + mes + anio
        const uniqueMap = new Map();
        const duplicates = [];

        for (const record of allRecords) {
            // Determinar clave única según la tabla
            let key;
            if (tableName === 'income_sources') {
                key = `${record.fuente}-${record.monto}-${record.periodo_mes}-${record.periodo_anio}`;
            } else {
                key = `${record.categoria}-${record.monto}-${record.periodo_mes}-${record.periodo_anio}`;
            }

            if (uniqueMap.has(key)) {
                // Ya existe uno más reciente, este es duplicado
                duplicates.push(record.id);
            } else {
                // Es el primero (más reciente), lo guardamos
                uniqueMap.set(key, record.id);
            }
        }

        console.log(`⚠️ Encontrados ${duplicates.length} duplicados en ${tableName}`);

        // 3. Eliminar duplicados en lotes
        if (duplicates.length > 0) {
            // Supabase permite borrar con 'in'
            const { error: deleteError } = await window.supabase
                .from(tableName)
                .delete()
                .in('id', duplicates);

            if (deleteError) throw deleteError;

            console.log(`🗑️ Eliminados ${duplicates.length} registros duplicados de ${tableName}`);
        } else {
            console.log(`✅ No hay duplicados en ${tableName}`);
        }

    } catch (error) {
        console.error(`❌ Error limpiando ${tableName}:`, error);
    }
}

// Exponer globalmente para ejecutar desde consola
window.cleanupDuplicates = cleanupDuplicates;

// Ejecutar automáticamente si se carga este script
cleanupDuplicates();
