/**
 * REPORTES-GENERATOR.JS - Generador de Datos para Reportes
 * Control de Gastos Familiares - Sistema Modular v2.1.0
 * 
 * RESPONSABILIDADES:
 * ✅ Generar datos de reportes mensuales
 * ✅ Calcular estadísticas por períodos
 * ✅ Análisis de tendencias y patrones
 * ✅ Procesamiento de datos para gráficos
 * ✅ Cálculos de balance y proyecciones
 */

class ReportesGenerator {
    constructor() {
        this.storage = window.storageManager;
        this.currentMonth = null;
        this.currentYear = null;
        
        if (!this.storage) {
            console.error('❌ StorageManager no disponible para generador de reportes');
            return;
        }
        
        // Configurar período actual
        const now = new Date();
        this.currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        this.currentYear = String(now.getFullYear());
        
        console.log('📊 ReportesGenerator v2.1.0 inicializado');
    }

    /**
     * 📅 ESTABLECER PERÍODO ACTUAL
     */
    setCurrentPeriod(month, year) {
        this.currentMonth = month;
        this.currentYear = year;
        console.log(`📅 Período establecido: ${month}/${year}`);
    }

    /**
     * 📊 GENERAR REPORTE MENSUAL
     */
    generateMonthlyReport() {
        try {
            const ingresos = this.storage.getIngresos();
            const gastosFijos = this.storage.getGastosFijos();
            const gastosVariables = this.storage.getGastosVariables();
            const gastosExtras = this.storage.getGastosExtras();

            // Calcular totales
            const totalIngresos = ingresos.total || 0;
            const totalGastosFijos = gastosFijos.total || 0;
            const totalGastosVariables = gastosVariables.total || 0;
            const totalGastosExtras = this.calculateGastosExtrasRealizados(gastosExtras);
            
            const totalGastos = totalGastosFijos + totalGastosVariables + totalGastosExtras;
            const balance = totalIngresos - totalGastos;

            // Encontrar mayor ingreso
            const mayorIngreso = this.findMaxItem(ingresos.desglose || [], 'monto', 'fuente');
            
            // Encontrar mayor gasto
            const allGastos = [
                ...(gastosFijos.items || []),
                ...(gastosVariables.items || []),
                ...(gastosExtras.items || [])
            ].filter(item => item.activo !== false);
            
            const mayorGasto = this.findMaxItem(allGastos, 'monto', 'categoria');

            // Categoría más costosa
            const categoriaMasCostosa = this.findMostExpensiveCategory();

            const reportData = {
                periodo: `${this.getMonthName(this.currentMonth)} ${this.currentYear}`,
                totalIngresos,
                totalGastos,
                balance,
                totalGastosFijos,
                totalGastosVariables,
                totalGastosExtras,
                mayorIngreso,
                mayorGasto,
                categoriaMasCostosa,
                porcentajeAhorro: totalIngresos > 0 ? (balance / totalIngresos) * 100 : 0,
                analisis: this.generateMonthlyAnalysis(balance, totalIngresos, totalGastos)
            };

            console.log('📊 Reporte mensual generado:', reportData);
            return reportData;

        } catch (error) {
            console.error('❌ Error generando reporte mensual:', error);
            return null;
        }
    }

    /**
     * 📈 GENERAR REPORTE POR PERÍODO
     */
    generatePeriodReport(period) {
        try {
            // Obtener datos históricos simulados (en una implementación real, estos vendrían del storage histórico)
            const periodData = this.generatePeriodData(period);
            
            const reportData = {
                periodo: period,
                promedioIngresos: this.calculateAverage(periodData.ingresos),
                promedioGastos: this.calculateAverage(periodData.gastos),
                tendencia: this.calculateTrend(periodData.balances),
                analisis: this.generatePeriodAnalysis(period, periodData),
                datosGraficos: this.prepareChartData(periodData),
                comparativas: this.generateComparatives(period, periodData)
            };

            console.log(`📈 Reporte ${period} generado:`, reportData);
            return reportData;

        } catch (error) {
            console.error(`❌ Error generando reporte ${period}:`, error);
            return null;
        }
    }

    /**
     * 📊 GENERAR DATOS PARA GRÁFICOS
     */
    generateChartData() {
        try {
            const ingresos = this.storage.getIngresos();
            const gastosFijos = this.storage.getGastosFijos();
            const gastosVariables = this.storage.getGastosVariables();
            const gastosExtras = this.storage.getGastosExtras();

            // Datos para gráfico de gastos por categoría
            const expensesData = {
                labels: ['Gastos Fijos', 'Gastos Variables', 'Gastos Extras'],
                data: [
                    gastosFijos.total || 0,
                    gastosVariables.total || 0,
                    this.calculateGastosExtrasRealizados(gastosExtras)
                ],
                backgroundColor: [
                    '#3b82f6', // Azul para fijos
                    '#f59e0b', // Amarillo para variables  
                    '#ec4899'  // Rosa para extras
                ]
            };

            // Datos para gráfico de ingresos por fuente
            const incomeData = {
                labels: (ingresos.desglose || []).map(item => item.fuente),
                data: (ingresos.desglose || []).map(item => item.monto || 0),
                backgroundColor: this.generateColors((ingresos.desglose || []).length)
            };

            // Datos para gráfico de tendencias (simulado)
            const trendData = this.generateTrendData();

            const chartData = {
                expenses: expensesData,
                income: incomeData,
                trend: trendData,
                balance: this.generateBalanceData()
            };

            console.log('📊 Datos de gráficos generados:', chartData);
            return chartData;

        } catch (error) {
            console.error('❌ Error generando datos de gráficos:', error);
            return null;
        }
    }

    /**
     * 🏷️ GENERAR REPORTE POR CATEGORÍAS
     */
    generateCategoriesReport() {
        try {
            const gastosFijos = this.storage.getGastosFijos();
            const gastosVariables = this.storage.getGastosVariables();
            const gastosExtras = this.storage.getGastosExtras();

            // Procesar categorías
            const categorias = [];

            // Gastos fijos
            (gastosFijos.items || []).forEach(item => {
                if (item.activo !== false) {
                    categorias.push({
                        nombre: item.categoria,
                        tipo: 'Fijos',
                        monto: item.monto || 0,
                        pagado: item.pagado || false
                    });
                }
            });

            // Gastos variables
            (gastosVariables.items || []).forEach(item => {
                if (item.activo !== false) {
                    categorias.push({
                        nombre: item.categoria,
                        tipo: 'Variables', 
                        monto: item.monto || 0,
                        pagado: item.pagado || false
                    });
                }
            });

            // Gastos extras
            (gastosExtras.items || []).forEach(item => {
                if (item.activo !== false) {
                    categorias.push({
                        nombre: item.categoria,
                        tipo: 'Extras',
                        monto: item.monto || 0,
                        pagado: item.pagado || false
                    });
                }
            });

            // Ordenar por monto descendente
            categorias.sort((a, b) => (b.monto || 0) - (a.monto || 0));

            const reportData = {
                categorias,
                totalCategorias: categorias.length,
                categoriasMasCostosas: categorias.slice(0, 5),
                resumenPorTipo: this.summarizeByType(categorias),
                estadisticas: this.calculateCategoryStatistics(categorias)
            };

            console.log('🏷️ Reporte por categorías generado:', reportData);
            return reportData;

        } catch (error) {
            console.error('❌ Error generando reporte de categorías:', error);
            return null;
        }
    }

    /**
     * 📊 GENERAR REPORTE DE BALANCE
     */
    generateBalanceReport() {
        try {
            const monthlyReport = this.generateMonthlyReport();
            if (!monthlyReport) return null;

            const balanceData = {
                ingresosTotales: monthlyReport.totalIngresos,
                gastosTotales: monthlyReport.totalGastos,
                balance: monthlyReport.balance,
                porcentajeAhorro: monthlyReport.porcentajeAhorro,
                desglose: {
                    gastosFijos: monthlyReport.totalGastosFijos,
                    gastosVariables: monthlyReport.totalGastosVariables,
                    gastosExtras: monthlyReport.totalGastosExtras
                },
                proyecciones: this.generateProjections(monthlyReport),
                recomendaciones: this.generateRecommendations(monthlyReport)
            };

            console.log('📊 Reporte de balance generado:', balanceData);
            return balanceData;

        } catch (error) {
            console.error('❌ Error generando reporte de balance:', error);
            return null;
        }
    }

    // ===============================
    // MÉTODOS AUXILIARES
    // ===============================

    /**
     * 💰 CALCULAR GASTOS EXTRAS REALIZADOS
     */
    calculateGastosExtrasRealizados(gastosExtras) {
        if (!gastosExtras || !gastosExtras.items) return 0;
        
        return gastosExtras.items
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
    }

    /**
     * 🔍 ENCONTRAR ELEMENTO CON VALOR MÁXIMO
     */
    findMaxItem(items, valueField, nameField) {
        if (!items || items.length === 0) return null;
        
        return items.reduce((max, item) => {
            return (item[valueField] || 0) > (max[valueField] || 0) ? item : max;
        });
    }

    /**
     * 🏷️ ENCONTRAR CATEGORÍA MÁS COSTOSA
     */
    findMostExpensiveCategory() {
        const categoriesReport = this.generateCategoriesReport();
        if (!categoriesReport || !categoriesReport.categorias.length) return 'N/A';
        
        return categoriesReport.categorias[0].nombre;
    }

    /**
     * 📈 CALCULAR PROMEDIO
     */
    calculateAverage(values) {
        if (!values || values.length === 0) return 0;
        const sum = values.reduce((acc, val) => acc + (val || 0), 0);
        return sum / values.length;
    }

    /**
     * 📊 CALCULAR TENDENCIA
     */
    calculateTrend(values) {
        if (!values || values.length < 2) return 'estable';
        
        const first = values[0] || 0;
        const last = values[values.length - 1] || 0;
        
        if (last > first * 1.05) return 'positiva';
        if (last < first * 0.95) return 'negativa';
        return 'estable';
    }

    /**
     * 🎨 GENERAR COLORES PARA GRÁFICOS
     */
    generateColors(count) {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
            '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
        ];
        
        const result = [];
        for (let i = 0; i < count; i++) {
            result.push(colors[i % colors.length]);
        }
        return result;
    }

    /**
     * 📈 GENERAR DATOS DE TENDENCIA
     */
    generateTrendData() {
        // Datos simulados para demo - en implementación real vendrían del histórico
        const months = ['Ene', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const currentMonth = this.storage.getIngresos().total || 0;
        const variation = currentMonth * 0.1;
        
        return {
            labels: months,
            datasets: [{
                label: 'Ingresos',
                data: months.map(() => currentMonth + (Math.random() - 0.5) * variation),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
            }, {
                label: 'Gastos',
                data: months.map(() => currentMonth * 0.8 + (Math.random() - 0.5) * variation),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
            }]
        };
    }

    /**
     * ⚖️ GENERAR DATOS DE BALANCE
     */
    generateBalanceData() {
        const monthlyReport = this.generateMonthlyReport();
        if (!monthlyReport) return null;

        return {
            labels: ['Ingresos', 'Gastos'],
            data: [monthlyReport.totalIngresos, monthlyReport.totalGastos],
            backgroundColor: ['#10b981', '#ef4444']
        };
    }

    /**
     * 📅 GENERAR DATOS POR PERÍODO
     */
    generatePeriodData(period) {
        // Simulación de datos históricos - en implementación real vendría del storage
        const currentData = this.generateMonthlyReport();
        const baseIncome = currentData?.totalIngresos || 1000000;
        const baseExpenses = currentData?.totalGastos || 800000;
        
        let months;
        switch (period) {
            case 'quarterly': months = 3; break;
            case 'semester': months = 6; break;
            case 'yearly': months = 12; break;
            default: months = 1; break;
        }

        return {
            ingresos: Array(months).fill().map(() => baseIncome + (Math.random() - 0.5) * baseIncome * 0.2),
            gastos: Array(months).fill().map(() => baseExpenses + (Math.random() - 0.5) * baseExpenses * 0.2),
            balances: Array(months).fill().map(() => (baseIncome - baseExpenses) + (Math.random() - 0.5) * 100000)
        };
    }

    /**
     * 📝 GENERAR ANÁLISIS MENSUAL
     */
    generateMonthlyAnalysis(balance, totalIngresos, totalGastos) {
        if (balance > 0) {
            const porcentajeAhorro = (balance / totalIngresos) * 100;
            if (porcentajeAhorro > 20) {
                return `Excelente gestión financiera. Estás ahorrando ${porcentajeAhorro.toFixed(1)}% de tus ingresos.`;
            } else if (porcentajeAhorro > 10) {
                return `Buena gestión. Ahorras ${porcentajeAhorro.toFixed(1)}% de tus ingresos. Considera aumentar el ahorro.`;
            } else {
                return `Balance positivo pero bajo. Solo ahorras ${porcentajeAhorro.toFixed(1)}%. Revisa tus gastos.`;
            }
        } else {
            return `Balance negativo de ${this.formatCurrency(Math.abs(balance))}. Es necesario reducir gastos o aumentar ingresos.`;
        }
    }

    /**
     * 📊 GENERAR ANÁLISIS POR PERÍODO
     */
    generatePeriodAnalysis(period, data) {
        const promedioBalance = this.calculateAverage(data.balances);
        const tendencia = this.calculateTrend(data.balances);
        
        let analysis = `Análisis ${this.getPeriodName(period)}: `;
        
        if (promedioBalance > 0) {
            analysis += `Balance promedio positivo de ${this.formatCurrency(promedioBalance)}. `;
        } else {
            analysis += `Balance promedio negativo de ${this.formatCurrency(Math.abs(promedioBalance))}. `;
        }
        
        analysis += `Tendencia ${tendencia}. `;
        
        if (tendencia === 'positiva') {
            analysis += 'Continúa con la gestión actual.';
        } else if (tendencia === 'negativa') {
            analysis += 'Revisa y ajusta tus gastos.';
        } else {
            analysis += 'Mantén el control de tus finanzas.';
        }
        
        return analysis;
    }

    /**
     * 📊 RESUMIR POR TIPO
     */
    summarizeByType(categorias) {
        const summary = {
            Fijos: { count: 0, total: 0 },
            Variables: { count: 0, total: 0 },
            Extras: { count: 0, total: 0 }
        };

        categorias.forEach(cat => {
            if (summary[cat.tipo]) {
                summary[cat.tipo].count++;
                summary[cat.tipo].total += cat.monto || 0;
            }
        });

        return summary;
    }

    /**
     * 📊 CALCULAR ESTADÍSTICAS DE CATEGORÍAS
     */
    calculateCategoryStatistics(categorias) {
        if (!categorias.length) return {};

        const montos = categorias.map(cat => cat.monto || 0);
        return {
            total: montos.reduce((acc, val) => acc + val, 0),
            promedio: this.calculateAverage(montos),
            maximo: Math.max(...montos),
            minimo: Math.min(...montos),
            pagadas: categorias.filter(cat => cat.pagado).length,
            pendientes: categorias.filter(cat => !cat.pagado).length
        };
    }

    /**
     * 🔮 GENERAR PROYECCIONES
     */
    generateProjections(monthlyReport) {
        return {
            proximoMes: {
                ingresos: monthlyReport.totalIngresos * 1.02,
                gastos: monthlyReport.totalGastos * 1.01,
                balance: (monthlyReport.totalIngresos * 1.02) - (monthlyReport.totalGastos * 1.01)
            },
            anual: {
                ingresos: monthlyReport.totalIngresos * 12,
                gastos: monthlyReport.totalGastos * 12,
                ahorro: monthlyReport.balance * 12
            }
        };
    }

    /**
     * 💡 GENERAR RECOMENDACIONES
     */
    generateRecommendations(monthlyReport) {
        const recommendations = [];
        
        if (monthlyReport.balance < 0) {
            recommendations.push('Reduce gastos variables o busca ingresos adicionales');
        }
        
        if (monthlyReport.porcentajeAhorro < 10) {
            recommendations.push('Intenta ahorrar al menos el 10% de tus ingresos');
        }
        
        if (monthlyReport.totalGastosExtras > monthlyReport.totalIngresos * 0.15) {
            recommendations.push('Los gastos extras son muy altos, considera reducirlos');
        }
        
        return recommendations;
    }

    /**
     * 📊 GENERAR COMPARATIVAS
     */
    generateComparatives(period, data) {
        const current = data.balances[data.balances.length - 1];
        const previous = data.balances[data.balances.length - 2];
        
        return {
            variacionBalance: current - previous,
            porcentajeVariacion: previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0,
            mejoraRespectoPeriodoAnterior: current > previous
        };
    }

    /**
     * 📊 PREPARAR DATOS PARA GRÁFICOS
     */
    prepareChartData(data) {
        return {
            labels: ['Período 1', 'Período 2', 'Período 3'],
            datasets: [{
                label: 'Ingresos',
                data: data.ingresos.slice(0, 3),
                backgroundColor: '#10b981'
            }, {
                label: 'Gastos', 
                data: data.gastos.slice(0, 3),
                backgroundColor: '#ef4444'
            }]
        };
    }

    /**
     * 🔧 UTILIDADES
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    getMonthName(monthNumber) {
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return months[parseInt(monthNumber) - 1] || 'Mes desconocido';
    }

    getPeriodName(period) {
        const periods = {
            monthly: 'mensual',
            quarterly: 'trimestral',
            semester: 'semestral', 
            yearly: 'anual'
        };
        return periods[period] || 'desconocido';
    }

    /**
     * 🔄 REFRESCAR DATOS
     */
    refreshData() {
        // Limpiar cache si existe
        this.cache = null;
        console.log('🔄 Datos del generador actualizados');
    }
}

// Inicialización global
window.reportesGenerator = null;

// Función de inicialización
function initializeReportesGenerator() {
    if (window.storageManager) {
        window.reportesGenerator = new ReportesGenerator();
        console.log('✅ ReportesGenerator v2.1.0 inicializado globalmente');
    } else {
        console.warn('⚠️ Esperando StorageManager para inicializar ReportesGenerator');
        setTimeout(initializeReportesGenerator, 500);
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReportesGenerator);
} else {
    initializeReportesGenerator();
}

console.log('📊 reportes-generator.js v2.1.0 cargado - Generación de datos completa');