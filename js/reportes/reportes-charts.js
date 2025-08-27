/**
 * REPORTES-CHARTS.JS - Sistema de Gráficos para Reportes
 * Control de Gastos Familiares - Sistema Modular v2.1.0
 * 
 * RESPONSABILIDADES:
 * ✅ Generar gráficos interactivos con Chart.js
 * ✅ Gráfico de gastos por categoría
 * ✅ Gráfico de ingresos por fuente
 * ✅ Gráficos de tendencias temporales
 * ✅ Actualización dinámica de gráficos
 */

class ReportesCharts {
    constructor() {
        this.charts = {};
        this.chartInstances = {};
        this.isChartJSLoaded = false;
        
        console.log('📊 ReportesCharts v2.1.0 inicializando...');
        this.loadChartJS().then(() => {
            this.init();
        });
    }

    /**
     * 📦 CARGAR CHART.JS DINÁMICAMENTE
     */
    async loadChartJS() {
        return new Promise((resolve, reject) => {
            // Verificar si Chart.js ya está cargado
            if (typeof Chart !== 'undefined') {
                this.isChartJSLoaded = true;
                console.log('📊 Chart.js ya está disponible');
                resolve();
                return;
            }

            // Cargar Chart.js desde CDN
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.min.js';
            script.async = true;
            
            script.onload = () => {
                this.isChartJSLoaded = true;
                console.log('📊 Chart.js cargado exitosamente desde CDN');
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Error cargando Chart.js desde CDN');
                // Fallback: intentar cargar desde jsDelivr
                const fallbackScript = document.createElement('script');
                fallbackScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
                fallbackScript.onload = () => {
                    this.isChartJSLoaded = true;
                    console.log('📊 Chart.js cargado desde fallback CDN');
                    resolve();
                };
                fallbackScript.onerror = () => {
                    console.error('❌ Error cargando Chart.js - gráficos no disponibles');
                    reject();
                };
                document.head.appendChild(fallbackScript);
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * 🚀 INICIALIZACIÓN DEL SISTEMA
     */
    init() {
        if (!this.isChartJSLoaded) {
            console.error('❌ Chart.js no disponible - gráficos deshabilitados');
            return;
        }
        
        console.log('✅ ReportesCharts inicializado correctamente');
    }

    /**
     * 📊 GENERAR TODOS LOS GRÁFICOS
     */
    generateCharts() {
        if (!this.isChartJSLoaded || !window.reportesGenerator) {
            console.warn('⚠️ Chart.js o ReportesGenerator no disponible');
            return;
        }

        try {
            const chartData = window.reportesGenerator.generateChartData();
            if (!chartData) {
                console.warn('⚠️ No hay datos para generar gráficos');
                return;
            }

            this.createExpensesChart(chartData.expenses);
            this.createIncomeChart(chartData.income);
            this.createTrendChart(chartData.trend);

            console.log('📊 Gráficos generados correctamente');
        } catch (error) {
            console.error('❌ Error generando gráficos:', error);
        }
    }

    /**
     * 💸 CREAR GRÁFICO DE GASTOS POR CATEGORÍA
     */
    createExpensesChart(data) {
        const canvas = document.getElementById('expenses-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas expenses-chart no encontrado');
            return;
        }

        // Destruir gráfico anterior si existe
        if (this.chartInstances.expenses) {
            this.chartInstances.expenses.destroy();
        }

        const ctx = canvas.getContext('2d');
        
        this.chartInstances.expenses = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.data,
                    backgroundColor: data.backgroundColor,
                    borderWidth: 2,
                    borderColor: '#ffffff',
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribución de Gastos',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1000
                }
            }
        });

        console.log('💸 Gráfico de gastos creado');
    }

    /**
     * 💰 CREAR GRÁFICO DE INGRESOS POR FUENTE
     */
    createIncomeChart(data) {
        const canvas = document.getElementById('income-chart');
        if (!canvas) {
            console.warn('⚠️ Canvas income-chart no encontrado');
            return;
        }

        // Destruir gráfico anterior si existe
        if (this.chartInstances.income) {
            this.chartInstances.income.destroy();
        }

        // Si hay pocos datos, mostrar gráfico de barras; si hay muchos, mostrar pie chart
        const chartType = data.labels.length <= 5 ? 'bar' : 'pie';
        const ctx = canvas.getContext('2d');

        const chartConfig = {
            type: chartType,
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Monto',
                    data: data.data,
                    backgroundColor: data.backgroundColor,
                    borderWidth: 1,
                    borderColor: chartType === 'bar' ? data.backgroundColor.map(color => this.darkenColor(color)) : '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ingresos por Fuente',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        position: chartType === 'pie' ? 'bottom' : 'top',
                        display: chartType === 'pie',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const actualValue = chartType === 'pie' ? value : (chartType === 'bar' ? value.y : value);
                                return new Intl.NumberFormat('es-CL', { 
                                    style: 'currency', 
                                    currency: 'CLP', 
                                    minimumFractionDigits: 0 
                                }).format(actualValue);
                            }
                        }
                    }
                },
                scales: chartType === 'bar' ? {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-CL', { 
                                    style: 'currency', 
                                    currency: 'CLP', 
                                    minimumFractionDigits: 0,
                                    notation: 'compact' 
                                }).format(value);
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 0
                        }
                    }
                } : {},
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        };

        this.chartInstances.income = new Chart(ctx, chartConfig);
        console.log('💰 Gráfico de ingresos creado');
    }

    /**
     * 📈 CREAR GRÁFICO DE TENDENCIAS
     */
    createTrendChart(data) {
        // Buscar un contenedor alternativo si no existe el canvas específico
        let canvas = document.getElementById('trend-chart');
        if (!canvas) {
            // Intentar crear dinámicamente si no existe
            const container = document.querySelector('.charts-grid');
            if (container) {
                const chartContainer = document.createElement('div');
                chartContainer.className = 'chart-container';
                chartContainer.innerHTML = '<canvas id="trend-chart"></canvas>';
                container.appendChild(chartContainer);
                canvas = document.getElementById('trend-chart');
            }
        }

        if (!canvas) {
            console.warn('⚠️ Canvas trend-chart no encontrado y no se pudo crear');
            return;
        }

        // Destruir gráfico anterior si existe
        if (this.chartInstances.trend) {
            this.chartInstances.trend.destroy();
        }

        const ctx = canvas.getContext('2d');

        this.chartInstances.trend = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tendencia de Ingresos vs Gastos',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    },
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                const label = context.dataset.label;
                                const value = context.parsed.y;
                                return `${label}: ${new Intl.NumberFormat('es-CL', { 
                                    style: 'currency', 
                                    currency: 'CLP', 
                                    minimumFractionDigits: 0 
                                }).format(value)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Período'
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Monto (CLP)'
                        },
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-CL', { 
                                    style: 'currency', 
                                    currency: 'CLP', 
                                    minimumFractionDigits: 0,
                                    notation: 'compact' 
                                }).format(value);
                            }
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                },
                elements: {
                    point: {
                        radius: 5,
                        hoverRadius: 7
                    },
                    line: {
                        tension: 0.4
                    }
                },
                animation: {
                    duration: 1500,
                    easing: 'easeInOutQuart'
                }
            }
        });

        console.log('📈 Gráfico de tendencias creado');
    }

    /**
     * 🔄 ACTUALIZAR GRÁFICOS
     */
    updateCharts() {
        if (!this.isChartJSLoaded || !window.reportesGenerator) {
            console.warn('⚠️ No se pueden actualizar gráficos - dependencias faltantes');
            return;
        }

        try {
            const chartData = window.reportesGenerator.generateChartData();
            if (!chartData) {
                console.warn('⚠️ No hay datos para actualizar gráficos');
                return;
            }

            // Actualizar datos de gráficos existentes
            if (this.chartInstances.expenses && chartData.expenses) {
                this.chartInstances.expenses.data.labels = chartData.expenses.labels;
                this.chartInstances.expenses.data.datasets[0].data = chartData.expenses.data;
                this.chartInstances.expenses.update('active');
            }

            if (this.chartInstances.income && chartData.income) {
                this.chartInstances.income.data.labels = chartData.income.labels;
                this.chartInstances.income.data.datasets[0].data = chartData.income.data;
                this.chartInstances.income.update('active');
            }

            if (this.chartInstances.trend && chartData.trend) {
                this.chartInstances.trend.data = chartData.trend;
                this.chartInstances.trend.update('active');
            }

            console.log('🔄 Gráficos actualizados');
        } catch (error) {
            console.error('❌ Error actualizando gráficos:', error);
        }
    }

    /**
     * 🎨 OSCURECER COLOR (para bordes)
     */
    darkenColor(color, factor = 0.2) {
        // Convertir hex a RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        // Oscurecer
        const newR = Math.round(r * (1 - factor));
        const newG = Math.round(g * (1 - factor));
        const newB = Math.round(b * (1 - factor));

        // Convertir de vuelta a hex
        return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    }

    /**
     * 🖼️ EXPORTAR GRÁFICO COMO IMAGEN
     */
    exportChartAsImage(chartName, format = 'png') {
        if (!this.chartInstances[chartName]) {
            console.error(`❌ Gráfico ${chartName} no encontrado`);
            return null;
        }

        try {
            const canvas = this.chartInstances[chartName].canvas;
            const url = canvas.toDataURL(`image/${format}`);
            
            // Crear enlace de descarga
            const link = document.createElement('a');
            link.download = `grafico-${chartName}.${format}`;
            link.href = url;
            link.click();
            
            console.log(`🖼️ Gráfico ${chartName} exportado como ${format}`);
            return url;
        } catch (error) {
            console.error(`❌ Error exportando gráfico ${chartName}:`, error);
            return null;
        }
    }

    /**
     * 🧹 LIMPIAR TODOS LOS GRÁFICOS
     */
    destroyAllCharts() {
        Object.keys(this.chartInstances).forEach(key => {
            if (this.chartInstances[key]) {
                this.chartInstances[key].destroy();
                delete this.chartInstances[key];
            }
        });
        
        console.log('🧹 Todos los gráficos han sido destruidos');
    }

    /**
     * 📊 OBTENER INSTANCIA DE GRÁFICO
     */
    getChartInstance(chartName) {
        return this.chartInstances[chartName] || null;
    }

    /**
     * 📋 OBTENER INFORMACIÓN DE TODOS LOS GRÁFICOS
     */
    getChartsInfo() {
        const info = {};
        Object.keys(this.chartInstances).forEach(key => {
            const chart = this.chartInstances[key];
            info[key] = {
                type: chart.config.type,
                datasetCount: chart.data.datasets.length,
                labelsCount: chart.data.labels.length,
                isVisible: chart.canvas.style.display !== 'none'
            };
        });
        return info;
    }

    /**
     * ⚙️ CONFIGURAR OPCIONES GLOBALES DE CHART.JS
     */
    setupGlobalOptions() {
        if (!this.isChartJSLoaded) return;

        Chart.defaults.font.family = "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#374151';
        Chart.defaults.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        Chart.defaults.borderColor = 'rgba(59, 130, 246, 0.2)';
        Chart.defaults.plugins.legend.labels.usePointStyle = true;
        
        console.log('⚙️ Opciones globales de Chart.js configuradas');
    }
}

// Inicialización global
window.reportesCharts = null;

// Función de inicialización
function initializeReportesCharts() {
    window.reportesCharts = new ReportesCharts();
    console.log('✅ ReportesCharts v2.1.0 inicializado globalmente');
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReportesCharts);
} else {
    initializeReportesCharts();
}

console.log('📊 reportes-charts.js v2.1.0 cargado - Sistema de gráficos con Chart.js');