/**
 * REPORTES-GENERATOR.JS - Generación de Datos y Análisis
 * Presupuesto Familiar - Versión 2.0.0 MODULAR
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Cálculos financieros
 * ✅ Análisis de categorías
 * ✅ Generación de tendencias
 * ✅ Recomendaciones automáticas
 * ✅ Procesamiento de datos
 */

class ReportesGenerator {
    constructor(parentManager) {
        this.parent = parentManager;
        this.storage = parentManager.storage;
        this.currency = parentManager.currency;
        
        console.log('🔢 ReportesGenerator inicializado');
    }

    /**
     * GENERACIÓN PRINCIPAL DE REPORTES
     */
    generateReport(data) {
        const fechaActual = new Date();
        
        return {
            periodo: {
                mes: fechaActual.getMonth() + 1,
                año: fechaActual.getFullYear(),
                fechaGeneracion: fechaActual.toISOString()
            },
            resumen: this.calculateSummary(data),
            categorias: this.analyzeCategories(data),
            tendencias: this.calculateTrends(data),
            recomendaciones: this.generateRecommendations(data)
        };
    }

    /**
     * CÁLCULO DE RESUMEN FINANCIERO
     */
    calculateSummary(data) {
        const ingresos = data.ingresos.total || 0;
        const gastosFijos = data.gastosFijos.total || 0;
        const gastosVariables = data.gastosVariables.total || 0;
        const gastosExtras = data.gastosExtras.total || 0;
        
        const totalGastos = gastosFijos + gastosVariables + gastosExtras;
        const balance = ingresos - totalGastos;
        const porcentajeAhorro = ingresos > 0 ? 
            ((balance / ingresos) * 100).toFixed(1) : '0.0';
        
        // Calcular eficiencia financiera
        let eficiencia = 'Baja';
        if (balance >= 0) {
            if (balance / ingresos >= 0.2) eficiencia = 'Excelente';
            else if (balance / ingresos >= 0.1) eficiencia = 'Buena';
            else eficiencia = 'Regular';
        }

        return {
            ingresos,
            gastos: {
                total: totalGastos,
                fijos: gastosFijos,
                variables: gastosVariables,
                extras: gastosExtras
            },
            balance,
            porcentajeAhorro: parseFloat(porcentajeAhorro),
            eficienciaFinanciera: eficiencia
        };
    }

    /**
     * ANÁLISIS DE CATEGORÍAS
     */
    analyzeCategories(data) {
        const categorias = [];
        const totalGastos = (data.gastosFijos.total || 0) + 
                           (data.gastosVariables.total || 0) + 
                           (data.gastosExtras.total || 0);

        // Procesar gastos fijos
        if (data.gastosFijos.items) {
            data.gastosFijos.items.forEach(item => {
                if (item.activo !== false) {
                    categorias.push({
                        nombre: item.categoria,
                        tipo: 'fijos',
                        monto: item.monto,
                        porcentaje: totalGastos > 0 ? (item.monto / totalGastos) * 100 : 0,
                        pagado: item.pagado === true
                    });
                }
            });
        }

        // Procesar gastos variables
        if (data.gastosVariables.items) {
            data.gastosVariables.items.forEach(item => {
                if (item.activo !== false) {
                    categorias.push({
                        nombre: item.categoria,
                        tipo: 'variables',
                        monto: item.monto,
                        porcentaje: totalGastos > 0 ? (item.monto / totalGastos) * 100 : 0,
                        pagado: item.pagado === true
                    });
                }
            });
        }

        // Procesar gastos extras
        if (data.gastosExtras.items) {
            data.gastosExtras.items.forEach(item => {
                if (item.activo !== false) {
                    categorias.push({
                        nombre: item.categoria,
                        tipo: 'extras',
                        monto: item.monto,
                        porcentaje: totalGastos > 0 ? (item.monto / totalGastos) * 100 : 0,
                        pagado: item.pagado === true
                    });
                }
            });
        }

        // Ordenar por monto descendente
        return categorias.sort((a, b) => b.monto - a.monto);
    }

    /**
     * CÁLCULO DE TENDENCIAS
     */
    calculateTrends(data) {
        // Por ahora, tendencias básicas
        // TODO: Implementar comparación con meses anteriores
        const resumen = this.calculateSummary(data);
        
        return {
            gastosPorTipo: {
                fijos: {
                    porcentaje: resumen.gastos.total > 0 ? 
                        (resumen.gastos.fijos / resumen.gastos.total) * 100 : 0,
                    tendencia: 'estable' // TODO: calcular tendencia real
                },
                variables: {
                    porcentaje: resumen.gastos.total > 0 ? 
                        (resumen.gastos.variables / resumen.gastos.total) * 100 : 0,
                    tendencia: 'estable'
                },
                extras: {
                    porcentaje: resumen.gastos.total > 0 ? 
                        (resumen.gastos.extras / resumen.gastos.total) * 100 : 0,
                    tendencia: 'estable'
                }
            },
            balanceTendencia: resumen.balance >= 0 ? 'positiva' : 'negativa',
            alertas: this.generateAlerts(resumen)
        };
    }

    /**
     * GENERAR ALERTAS
     */
    generateAlerts(resumen) {
        const alertas = [];

        // Alerta de déficit
        if (resumen.balance < 0) {
            alertas.push({
                tipo: 'critica',
                mensaje: `Déficit de ${this.formatCurrency(Math.abs(resumen.balance))}`
            });
        }

        // Alerta de gastos variables altos
        const porcentajeVariables = (resumen.gastos.variables / resumen.ingresos) * 100;
        if (porcentajeVariables > 50) {
            alertas.push({
                tipo: 'advertencia',
                mensaje: 'Gastos variables superan el 50% de ingresos'
            });
        }

        // Alerta de gastos extras altos
        const porcentajeExtras = (resumen.gastos.extras / resumen.ingresos) * 100;
        if (porcentajeExtras > 15) {
            alertas.push({
                tipo: 'sugerencia',
                mensaje: 'Gastos extras superan el 15% recomendado'
            });
        }

        return alertas;
    }

    /**
     * GENERACIÓN DE RECOMENDACIONES
     */
    generateRecommendations(data) {
        const recomendaciones = [];
        const resumen = this.calculateSummary(data);

        // Recomendación de balance negativo
        if (resumen.balance < 0) {
            recomendaciones.push({
                tipo: 'critica',
                titulo: 'Balance negativo detectado',
                descripcion: `Sus gastos superan sus ingresos por ${this.formatCurrency(Math.abs(resumen.balance))}.`,
                accion: 'Revisar y reducir gastos no esenciales'
            });
        }

        // Recomendación de ahorro bajo
        if (resumen.balance >= 0 && resumen.porcentajeAhorro < 10) {
            recomendaciones.push({
                tipo: 'advertencia',
                titulo: 'Capacidad de ahorro baja',
                descripcion: `Su porcentaje de ahorro es del ${resumen.porcentajeAhorro}%. Se recomienda al menos 10%.`,
                accion: 'Optimizar gastos variables'
            });
        }

        // Recomendación de gastos extras
        const porcentajeExtras = (resumen.gastos.extras / resumen.ingresos) * 100;
        if (porcentajeExtras > 15) {
            recomendaciones.push({
                tipo: 'sugerencia',
                titulo: 'Gastos extras elevados',
                descripcion: 'Los gastos extras representan más del 15% de sus ingresos.',
                accion: 'Revisar presupuesto de gastos extras'
            });
        }

        // Recomendación positiva
        if (resumen.balance > 0 && resumen.porcentajeAhorro >= 20) {
            recomendaciones.push({
                tipo: 'exito',
                titulo: '¡Excelente gestión financiera!',
                descripcion: `Está ahorrando ${resumen.porcentajeAhorro}% de sus ingresos.`,
                accion: 'Considerar inversiones a largo plazo'
            });
        }

        return recomendaciones;
    }

    /**
     * UTILIDADES
     */
    formatCurrency(amount) {
        return this.currency ? 
            this.currency.format(amount) :
            `$${amount.toLocaleString('es-CL')}`;
    }

    /**
     * MÉTODOS PARA DATOS HISTÓRICOS (Futuro)
     */
    getHistoricalData(months = 12) {
        // TODO: Implementar cuando tengamos datos históricos
        console.log('📊 Datos históricos será implementado en v2.1');
        return null;
    }

    compareWithPreviousMonth(currentData) {
        // TODO: Implementar comparación mensual
        console.log('📈 Comparación mensual será implementada en v2.1');
        return null;
    }

    /**
     * ANÁLISIS AVANZADOS (Futuro)
     */
    generatePredictions(data) {
        // TODO: Implementar predicciones basadas en tendencias
        console.log('🔮 Predicciones será implementado en v2.2');
        return null;
    }

    analyzeSpendingPatterns(data) {
        // TODO: Análisis de patrones de gasto
        console.log('🎯 Análisis de patrones será implementado en v2.2');
        return null;
    }
}

// Exponer globalmente
window.ReportesGenerator = ReportesGenerator;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesGenerator;
}

console.log('🔢 Reportes-generator.js cargado - Sistema de análisis listo');