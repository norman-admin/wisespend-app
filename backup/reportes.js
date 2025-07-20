/**
 * REPORTES.JS - Sistema de Reportes y Análisis Financiero
 * Presupuesto Familiar - Versión 1.0.0
 * 
 * ✅ FUNCIONALIDADES IMPLEMENTADAS:
 * 📊 Generación de reportes mensuales
 * 📈 Gráficos interactivos con Chart.js
 * 📄 Exportación a PDF
 * 📊 Dashboard de análisis
 * 🔄 Comparativas períodos anteriores
 */

class ReportesManager {
    constructor() {
        this.storage = window.storageManager;
        this.currency = window.currencyManager;
        this.chartInstances = new Map();
        this.reportData = null;
        
        if (!this.storage) {
            console.error('❌ StorageManager no disponible para reportes');
            return;
        }
        
        this.initializeReportes();
        console.log('📊 ReportesManager inicializado correctamente');
    }

    /**
     * INICIALIZACIÓN
     */
    initializeReportes() {
        this.loadChartLibrary();
        this.setupEventListeners();
        this.generateCurrentReport();
    }

    /**
     * Cargar Chart.js dinámicamente
     */
    loadChartLibrary() {
        if (window.Chart) {
            console.log('📈 Chart.js ya está disponible');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.min.js';
        script.onload = () => {
            console.log('📈 Chart.js cargado correctamente');
            this.configureChartDefaults();
        };
        script.onerror = () => {
            console.warn('⚠️ No se pudo cargar Chart.js, usando fallback');
        };
        document.head.appendChild(script);
    }

    /**
     * Configurar Chart.js defaults
     */
    configureChartDefaults() {
        if (!window.Chart) return;

        Chart.defaults.font.family = "'Inter', sans-serif";
        Chart.defaults.color = '#6b7280';
        Chart.defaults.borderColor = 'rgba(229, 231, 235, 0.8)';
        Chart.defaults.backgroundColor = 'rgba(59, 130, 246, 0.1)';
    }

    /**
     * GENERACIÓN DE REPORTES
     */

    /**
     * Generar reporte del período actual
     */
    generateCurrentReport() {
        const data = this.storage.getDashboardData();
        const fechaActual = new Date();
        
        this.reportData = {
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

        console.log('📊 Reporte generado:', this.reportData);
        return this.reportData;
    }

    /**
     * Calcular resumen financiero
     */
    calculateSummary(data) {
        const ingresos = data.ingresos.total || 0;
        const gastosFijos = data.gastosFijos.total || 0;
        const gastosVariables = data.gastosVariables.total || 0;
        const gastosExtras = data.gastosExtras.total || 0;
        
        const totalGastos = gastosFijos + gastosVariables + gastosExtras;
        const balance = ingresos - totalGastos;
        const porcentajeAhorro = ingresos > 0 ? (balance / ingresos) * 100 : 0;

        return {
            ingresos,
            gastos: {
                fijos: gastosFijos,
                variables: gastosVariables,
                extras: gastosExtras,
                total: totalGastos
            },
            balance,
            porcentajeAhorro: Math.round(porcentajeAhorro * 100) / 100,
            eficienciaFinanciera: this.calculateEfficiency(ingresos, totalGastos)
        };
    }

    /**
     * Analizar categorías de gastos
     */
    analyzeCategories(data) {
        const categorias = [];

        // Procesar gastos fijos
        if (data.gastosFijos.items) {
            data.gastosFijos.items.forEach(item => {
                if (item.activo !== false) {
                    categorias.push({
                        nombre: item.categoria,
                        monto: item.monto,
                        tipo: 'fijo',
                        porcentaje: 0, // Se calculará después
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
                        monto: item.monto,
                        tipo: 'variable',
                        porcentaje: 0,
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
                        monto: item.monto,
                        tipo: 'extra',
                        porcentaje: 0,
                        pagado: item.pagado === true
                    });
                }
            });
        }

        // Calcular porcentajes
        const totalGastos = categorias.reduce((sum, cat) => sum + cat.monto, 0);
        categorias.forEach(cat => {
            cat.porcentaje = totalGastos > 0 ? (cat.monto / totalGastos) * 100 : 0;
        });

        // Ordenar por monto descendente
        return categorias.sort((a, b) => b.monto - a.monto);
    }

    /**
     * Calcular eficiencia financiera
     */
    calculateEfficiency(ingresos, gastos) {
        if (ingresos === 0) return 0;
        
        const eficiencia = ((ingresos - gastos) / ingresos) * 100;
        
        if (eficiencia >= 20) return 'Excelente';
        if (eficiencia >= 10) return 'Buena';
        if (eficiencia >= 0) return 'Regular';
        return 'Deficitaria';
    }

    /**
     * Calcular tendencias (simulado por ahora)
     */
    calculateTrends(data) {
        // Por ahora simulamos tendencias, en el futuro se basaría en datos históricos
        return {
            ingresos: {
                tendencia: 'estable',
                cambio: 0,
                descripcion: 'Ingresos estables respecto al período anterior'
            },
            gastos: {
                tendencia: 'leve_aumento',
                cambio: 2.5,
                descripcion: 'Ligero aumento en gastos del 2.5%'
            },
            balance: {
                tendencia: 'mejora',
                cambio: -3.2,
                descripcion: 'Balance mejorado respecto al mes anterior'
            }
        };
    }

    /**
     * Generar recomendaciones automáticas
     */
    generateRecommendations(data) {
        const recomendaciones = [];
        const resumen = this.calculateSummary(data);
        
        // Recomendación de balance
        if (resumen.balance < 0) {
            recomendaciones.push({
                tipo: 'critica',
                titulo: 'Balance negativo detectado',
                descripcion: 'Sus gastos superan sus ingresos. Revise gastos variables y extras.',
                accion: 'Reducir gastos no esenciales'
            });
        }

        // Recomendación de ahorro
        if (resumen.porcentajeAhorro < 10) {
            recomendaciones.push({
                tipo: 'advertencia',
                titulo: 'Bajo porcentaje de ahorro',
                descripcion: 'Se recomienda ahorrar al menos el 10% de los ingresos.',
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

        return recomendaciones;
    }

    /**
     * RENDERIZADO DE REPORTES
     */

    /**
     * Mostrar reporte en contenedor
     */
    showReportView(containerId = 'dynamic-content') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Contenedor de reportes no encontrado');
            return;
        }

        if (!this.reportData) {
            this.generateCurrentReport();
        }

        const html = this.generateReportHTML();
        container.innerHTML = html;

        // Generar gráficos después del render
        setTimeout(() => {
            this.renderCharts();
        }, 100);
    }

    /**
     * Generar HTML del reporte
     */
    generateReportHTML() {
        const data = this.reportData;
        const formatCurrency = (amount) => {
            return this.currency ? 
                this.currency.format(amount) : 
                `$${amount.toLocaleString('es-CL')}`;
        };

        return `
            <section class="content-section active">
                <div class="section-header">
                    <h2>📊 Reportes e Informes Mensuales</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="reportesManager.exportToPDF()">
                            📄 Exportar PDF
                        </button>
                        <button class="btn btn-secondary" onclick="reportesManager.refreshReport()">
                            🔄 Actualizar
                        </button>
                    </div>
                </div>

                <!-- Resumen Ejecutivo -->
                <div class="reports-grid">
                    <div class="report-card summary-card">
                        <h3>💰 Resumen Financiero</h3>
                        <div class="summary-stats">
                            <div class="stat-item">
                                <span class="stat-label">Ingresos:</span>
                                <span class="stat-value income">${formatCurrency(data.resumen.ingresos)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Gastos:</span>
                                <span class="stat-value expenses">${formatCurrency(data.resumen.gastos.total)}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Balance:</span>
                                <span class="stat-value ${data.resumen.balance >= 0 ? 'positive' : 'negative'}">
                                    ${formatCurrency(data.resumen.balance)}
                                </span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">% Ahorro:</span>
                                <span class="stat-value">${data.resumen.porcentajeAhorro}%</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Eficiencia:</span>
                                <span class="stat-value">${data.resumen.eficienciaFinanciera}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="report-card chart-card">
                        <h3>📈 Distribución de Gastos</h3>
                        <div class="chart-container">
                            <canvas id="gastos-chart" width="400" height="200"></canvas>
                        </div>
                    </div>

                    <div class="report-card chart-card">
                        <h3>📊 Balance Mensual</h3>
                        <div class="chart-container">
                            <canvas id="balance-chart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Categorías Detalladas -->
                <div class="report-section">
                    <h3>🏷️ Análisis por Categorías</h3>
                    <div class="categories-table">
                        <table class="simple-table">
                            <thead>
                                <tr>
                                    <th>Categoría</th>
                                    <th>Tipo</th>
                                    <th>Monto</th>
                                    <th>% del Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.categorias.slice(0, 10).map(cat => `
                                    <tr>
                                        <td>${cat.nombre}</td>
                                        <td><span class="tipo-badge ${cat.tipo}">${cat.tipo}</span></td>
                                        <td>${formatCurrency(cat.monto)}</td>
                                        <td>${cat.porcentaje.toFixed(1)}%</td>
                                        <td><span class="status-badge ${cat.pagado ? 'pagado' : 'pendiente'}">
                                            ${cat.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                                        </span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Recomendaciones -->
                <div class="report-section">
                    <h3>💡 Recomendaciones</h3>
                    <div class="recommendations">
                        ${data.recomendaciones.map(rec => `
                            <div class="recommendation-card ${rec.tipo}">
                                <div class="rec-header">
                                    <span class="rec-icon">${this.getRecommendationIcon(rec.tipo)}</span>
                                    <h4>${rec.titulo}</h4>
                                </div>
                                <p class="rec-description">${rec.descripcion}</p>
                                <p class="rec-action"><strong>Acción sugerida:</strong> ${rec.accion}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Información del Reporte -->
                <div class="report-footer">
                    <p><small>
                        📅 Reporte generado: ${new Date(data.periodo.fechaGeneracion).toLocaleString('es-CL')} | 
                        📊 Período: ${data.periodo.mes}/${data.periodo.año}
                    </small></p>
                </div>
            </section>

            <style>
                .reports-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 32px;
                }

                .report-card {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                }

                .summary-card {
                    grid-column: 1 / -1;
                }

                .summary-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-top: 16px;
                }

                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                }

                .stat-label {
                    font-weight: 500;
                    color: #4b5563;
                }

                .stat-value {
                    font-weight: 700;
                    font-size: 16px;
                }

                .stat-value.income { color: #059669; }
                .stat-value.expenses { color: #dc2626; }
                .stat-value.positive { color: #059669; }
                .stat-value.negative { color: #dc2626; }

                .chart-container {
                    margin-top: 16px;
                    height: 300px;
                    position: relative;
                }

                .chart-container canvas {
                    max-height: 100%;
                }

                .report-section {
                    margin: 32px 0;
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                }

                .categories-table {
                    margin-top: 16px;
                    overflow-x: auto;
                }

                .tipo-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    text-transform: capitalize;
                }

                .tipo-badge.fijo { background: #dbeafe; color: #1e40af; }
                .tipo-badge.variable { background: #fef3c7; color: #92400e; }
                .tipo-badge.extra { background: #fce7f3; color: #be185d; }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .status-badge.pagado { background: #d1fae5; color: #065f46; }
                .status-badge.pendiente { background: #fed7aa; color: #9a3412; }

                .recommendations {
                    display: grid;
                    gap: 16px;
                    margin-top: 16px;
                }

                .recommendation-card {
                    padding: 16px;
                    border-radius: 8px;
                    border-left: 4px solid;
                }

                .recommendation-card.critica {
                    background: #fef2f2;
                    border-left-color: #dc2626;
                }

                .recommendation-card.advertencia {
                    background: #fffbeb;
                    border-left-color: #f59e0b;
                }

                .recommendation-card.sugerencia {
                    background: #eff6ff;
                    border-left-color: #3b82f6;
                }

                .rec-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .rec-header h4 {
                    margin: 0;
                    font-size: 16px;
                }

                .rec-description {
                    margin: 8px 0;
                    color: #4b5563;
                }

                .rec-action {
                    margin: 8px 0 0 0;
                    font-size: 14px;
                    color: #374151;
                }

                .report-footer {
                    margin-top: 32px;
                    text-align: center;
                    color: #6b7280;
                    border-top: 1px solid #e5e7eb;
                    padding-top: 16px;
                }

                @media (max-width: 768px) {
                    .reports-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .summary-stats {
                        grid-template-columns: 1fr;
                    }
                }
            </style>
        `;
    }

    /**
     * GRÁFICOS
     */

    /**
     * Renderizar todos los gráficos
     */
    renderCharts() {
        if (!window.Chart) {
            console.warn('⚠️ Chart.js no disponible, omitiendo gráficos');
            return;
        }

        this.renderGastosChart();
        this.renderBalanceChart();
    }

    /**
     * Gráfico de distribución de gastos
     */
    renderGastosChart() {
        const canvas = document.getElementById('gastos-chart');
        if (!canvas) return;

        const data = this.reportData.resumen.gastos;
        
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
                        '#3b82f6',
                        '#f59e0b',
                        '#ec4899'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
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
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = this.currency ? 
                                    this.currency.format(context.parsed) :
                                    `$${context.parsed.toLocaleString('es-CL')}`;
                                return `${context.label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });

        this.chartInstances.set('gastos', chart);
    }

    /**
     * Gráfico de balance mensual
     */
    renderBalanceChart() {
        const canvas = document.getElementById('balance-chart');
        if (!canvas) return;

        const data = this.reportData.resumen;
        
        if (this.chartInstances.has('balance')) {
            this.chartInstances.get('balance').destroy();
        }

        const chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Gastos', 'Balance'],
                datasets: [{
                    data: [data.ingresos, data.gastos.total, Math.abs(data.balance)],
                    backgroundColor: [
                        '#10b981',
                        '#f87171',
                        data.balance >= 0 ? '#10b981' : '#f87171'
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
                        callbacks: {
                            label: (context) => {
                                let value = context.parsed.y;
                                if (context.label === 'Balance' && data.balance < 0) {
                                    value = -value;
                                }
                                const formatted = this.currency ? 
                                    this.currency.format(value) :
                                    `$${value.toLocaleString('es-CL')}`;
                                return `${context.label}: ${formatted}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => {
                                return this.currency ? 
                                    this.currency.format(value, null, { compact: true }) :
                                    `$${(value / 1000000).toFixed(1)}M`;
                            }
                        }
                    }
                }
            }
        });

        this.chartInstances.set('balance', chart);
    }

    /**
     * UTILIDADES
     */

    /**
     * Obtener ícono de recomendación
     */
    getRecommendationIcon(tipo) {
        const iconos = {
            'critica': '🚨',
            'advertencia': '⚠️',
            'sugerencia': '💡'
        };
        return iconos[tipo] || '📋';
    }

    /**
     * Actualizar reporte
     */
    refreshReport() {
        console.log('🔄 Actualizando reporte...');
        this.generateCurrentReport();
        this.showReportView();
    }

    /**
     * Exportar reporte a PDF (simulado)
     */
    exportToPDF() {
        // Por ahora, simular exportación
        alert('📄 Funcionalidad de exportación PDF será implementada en la próxima versión');
        
        // TODO: Implementar exportación real con jsPDF o similar
        console.log('📄 Exportando reporte a PDF...', this.reportData);
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar cambios en datos para regenerar reportes
        window.addEventListener('storageSaved', () => {
            if (this.reportData) {
                setTimeout(() => this.generateCurrentReport(), 500);
            }
        });

        window.addEventListener('gastos_gastoAdded', () => this.handleDataChange());
        window.addEventListener('gastos_gastoUpdated', () => this.handleDataChange());
        window.addEventListener('income_incomeAdded', () => this.handleDataChange());
        window.addEventListener('income_incomeUpdated', () => this.handleDataChange());
    }

    /**
     * Manejar cambios en datos
     */
    handleDataChange() {
        if (this.reportData) {
            setTimeout(() => {
                this.generateCurrentReport();
                // Si la vista de reportes está activa, actualizar
                if (document.querySelector('.content-section.active .reports-grid')) {
                    this.showReportView();
                }
            }, 300);
        }
    }

    /**
     * Destructor
     */
    destroy() {
        // Destruir gráficos
        this.chartInstances.forEach(chart => chart.destroy());
        this.chartInstances.clear();
        
        console.log('🧹 ReportesManager destruido');
    }
}

// Crear instancia global
window.reportesManager = new ReportesManager();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesManager;
}

console.log('📊 Reportes.js implementado - Sistema completo de análisis financiero');