/**
 * REPORTES-CHARTS.JS - Sistema de Gráficos Interactivos
 * Presupuesto Familiar - Versión 2.0.0 MODULAR
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Carga y configuración de Chart.js
 * ✅ Renderizado de gráficos
 * ✅ Gestión de instancias de charts
 * ✅ Configuraciones personalizadas
 * ✅ Responsive charts
 */

class ReportesCharts {
    constructor(parentManager) {
        this.parent = parentManager;
        this.storage = parentManager.storage;
        this.currency = parentManager.currency;
        this.chartInstances = new Map();
        this.isChartJSLoaded = false;
        
        this.initializeCharts();
        console.log('📈 ReportesCharts inicializado');
    }

    /**
     * INICIALIZACIÓN
     */
    initializeCharts() {
        this.loadChartLibrary();
    }

    /**
     * CARGA DE CHART.JS
     */
    loadChartLibrary() {
        if (window.Chart) {
            console.log('📈 Chart.js ya está disponible');
            this.isChartJSLoaded = true;
            this.configureChartDefaults();
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js';
            
            script.onload = () => {
                console.log('📈 Chart.js cargado correctamente');
                this.isChartJSLoaded = true;
    
    // Esperar un poco para que Chart esté completamente disponible
    setTimeout(() => {
        this.configureChartDefaults();
        resolve();
    }, 100);
};
            
            script.onerror = () => {
                console.warn('⚠️ No se pudo cargar Chart.js');
                this.isChartJSLoaded = false;
                reject(new Error('Chart.js no se pudo cargar'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * CONFIGURACIÓN GLOBAL DE CHART.JS
     */
    configureChartDefaults() {
        if (!window.Chart) return;

        // Configuración global
        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#6b7280';
        Chart.defaults.borderColor = 'rgba(229, 231, 235, 0.8)';
        Chart.defaults.backgroundColor = 'rgba(59, 130, 246, 0.1)';

        // Configuración responsive
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        console.log('⚙️ Chart.js configurado globalmente');
    }

    /**
     * RENDERIZADO PRINCIPAL
     */
    renderAllCharts(reportData) {
        if (!this.isChartJSLoaded) {
            console.warn('⚠️ Chart.js no disponible, omitiendo gráficos');
            return;
        }

        if (!reportData) {
            console.warn('⚠️ No hay datos para renderizar gráficos');
            return;
        }

        // Renderizar todos los gráficos
        this.renderDistribucionGastos(reportData);
        this.renderBalanceChart(reportData);
        this.renderTendenciasChart(reportData);
        
        console.log('📊 Todos los gráficos renderizados');
    }

    /**
     * GRÁFICO 1: DISTRIBUCIÓN DE GASTOS (Doughnut)
     */
    renderDistribucionGastos(reportData) {
        const canvas = document.getElementById('gastos-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas gastos-chart no encontrado');
            return;
        }

        const data = reportData.resumen.gastos;
        
        // Destruir gráfico existente
        if (this.chartInstances.has('gastos')) {
            this.chartInstances.get('gastos').destroy();
        }

        const chart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Gastos Fijos', 'Gastos Variables', 'Gastos Extras'],
                datasets: [{
                    data: [data.fijos, data.variables, data.extras],
                    backgroundColor: [
                        '#3b82f6',  // Azul para fijos
                        '#f59e0b',  // Amarillo para variables
                        '#ec4899'   // Rosa para extras
                    ],
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    hoverBorderWidth: 4,
                    hoverBorderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 14,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const value = this.formatCurrency(context.parsed);
                                const percentage = this.calculatePercentage(context.parsed, data.total);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        this.chartInstances.set('gastos', chart);
        console.log('📊 Gráfico de distribución de gastos renderizado');
    }

    /**
     * GRÁFICO 2: BALANCE MENSUAL (Bar)
     */
    renderBalanceChart(reportData) {
        const canvas = document.getElementById('balance-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas balance-chart no encontrado');
            return;
        }

        const data = reportData.resumen;
        
        // Destruir gráfico existente
        if (this.chartInstances.has('balance')) {
            this.chartInstances.get('balance').destroy();
        }

        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos', 'Balance'],
                datasets: [{
                    label: 'Monto',
                    data: [data.ingresos, data.gastos.total, Math.abs(data.balance)],
                    backgroundColor: [
                        '#10b981',  // Verde para ingresos
                        '#f87171',  // Rojo para gastos
                        data.balance >= 0 ? '#10b981' : '#f87171'  // Verde/Rojo según balance
                    ],
                    borderRadius: 8,
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: (context) => {
                                let value = context.parsed.y;
                                if (context.label === 'Balance' && data.balance < 0) {
                                    value = -value;
                                }
                                return `${context.label}: ${this.formatCurrency(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(229, 231, 235, 0.3)'
                        },
                        ticks: {
                            callback: (value) => {
                                return this.formatCurrencyCompact(value);
                            },
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                }
            }
        });

        this.chartInstances.set('balance', chart);
        console.log('📊 Gráfico de balance renderizado');
    }

    /**
     * GRÁFICO 3: TENDENCIAS (Line) - NUEVO
     */
    renderTendenciasChart(reportData) {
        const canvas = document.getElementById('tendencias-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas tendencias-chart no encontrado');
            return;
        }

        // Por ahora, datos simulados para demostración
        // TODO: Implementar datos históricos reales
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const ingresosTendencia = [2400000, 2350000, 2417000, 2380000, 2420000, 2417000];
        const gastosTendencia = [2300000, 2400000, 2546404, 2450000, 2500000, 2546404];

        // Destruir gráfico existente
        if (this.chartInstances.has('tendencias')) {
            this.chartInstances.get('tendencias').destroy();
        }

        const chart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [
                    {
                        label: 'Ingresos',
                        data: ingresosTendencia,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Gastos',
                        data: gastosTendencia,
                        borderColor: '#f87171',
                        backgroundColor: 'rgba(248, 113, 113, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            font: {
                                size: 14,
                                weight: '500'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        callbacks: {
                            label: (context) => {
                                return `${context.dataset.label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(229, 231, 235, 0.3)'
                        },
                        ticks: {
                            callback: (value) => this.formatCurrencyCompact(value)
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        this.chartInstances.set('tendencias', chart);
        console.log('📊 Gráfico de tendencias renderizado');
    }

    /**
     * UTILIDADES DE FORMATEO
     */
    formatCurrency(amount) {
        return this.currency ? 
            this.currency.format(amount) :
            `$${amount.toLocaleString('es-CL')}`;
    }

    formatCurrencyCompact(amount) {
        if (amount >= 1000000) {
            return `$${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `$${(amount / 1000).toFixed(0)}K`;
        }
        return `$${amount.toLocaleString('es-CL')}`;
    }

    calculatePercentage(value, total) {
        return total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    }

    /**
     * GESTIÓN DE INSTANCIAS
     */
    destroyChart(chartId) {
        if (this.chartInstances.has(chartId)) {
            this.chartInstances.get(chartId).destroy();
            this.chartInstances.delete(chartId);
            console.log(`🗑️ Gráfico ${chartId} destruido`);
        }
    }

    destroyAllCharts() {
        this.chartInstances.forEach((chart, id) => {
            chart.destroy();
            console.log(`🗑️ Gráfico ${id} destruido`);
        });
        this.chartInstances.clear();
    }

    getChart(chartId) {
        return this.chartInstances.get(chartId);
    }

    /**
     * CONFIGURACIONES AVANZADAS (Futuro)
     */
    updateChartTheme(theme) {
        // TODO: Implementar cambio de tema dinámico
        console.log('🎨 Cambio de tema será implementado en v2.1');
    }

    exportChartAsImage(chartId) {
        // TODO: Implementar exportación de gráficos como imagen
        console.log('📸 Exportación de gráficos será implementada en v2.1');
    }

    /**
     * DESTRUCTOR
     */
    destroy() {
        this.destroyAllCharts();
        console.log('🧹 ReportesCharts destruido');
    }
}

// Exponer globalmente
window.ReportesCharts = ReportesCharts;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesCharts;
}

console.log('📈 Reportes-charts.js cargado - Sistema de gráficos listo');