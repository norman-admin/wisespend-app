/**
 * REPORTES-HTML.JS - Generador de HTML para Reportes
 * Control de Gastos Familiares - Sistema Modular v2.1.0
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Generar HTML dinámico para reportes
 * ✅ Crear tarjetas de resumen interactivas
 * ✅ Generar tablas de desglose
 * ✅ Renderizar navegación lateral
 * ✅ Crear insights y análisis visuales
 */

class ReportesHTML {
    constructor() {
        this.templates = {};
        this.currentData = null;
        
        console.log('📄 ReportesHTML v2.1.0 inicializando...');
        this.init();
    }

    /**
     * 🚀 INICIALIZACIÓN DEL SISTEMA
     */
    init() {
        this.loadTemplates();
        console.log('✅ ReportesHTML inicializado correctamente');
    }

    /**
     * 📋 CARGAR PLANTILLAS HTML
     */
    loadTemplates() {
        this.templates = {
            summaryCard: this.getSummaryCardTemplate(),
            breakdownTable: this.getBreakdownTableTemplate(),
            navigationPanel: this.getNavigationPanelTemplate(),
            insightsSection: this.getInsightsSectionTemplate(),
            categoryCard: this.getCategoryCardTemplate()
        };
    }

    /**
     * 📊 RENDERIZAR REPORTE COMPLETO
     */
    renderFullReport(container) {
        if (!container) {
            console.error('❌ Contenedor no proporcionado para renderizar reporte');
            return;
        }

        try {
            // Generar datos del reporte
            if (window.reportesGenerator) {
                this.currentData = {
                    monthly: window.reportesGenerator.generateMonthlyReport(),
                    categories: window.reportesGenerator.generateCategoriesReport(),
                    balance: window.reportesGenerator.generateBalanceReport()
                };
            } else {
                console.warn('⚠️ ReportesGenerator no disponible, usando datos simulados');
                this.currentData = this.generateMockData();
            }

            // Crear layout principal
            const html = this.generateMainLayout();
            container.innerHTML = html;

            // Configurar eventos después de renderizar
            setTimeout(() => {
                this.bindEvents();
            }, 100);

            console.log('📊 Reporte completo renderizado');
        } catch (error) {
            console.error('❌ Error renderizando reporte completo:', error);
            container.innerHTML = '<div class="error-state">Error cargando el reporte</div>';
        }
    }

    /**
     * 🏗️ GENERAR LAYOUT PRINCIPAL
     */
    generateMainLayout() {
        return `
            <div class="reports-3col-layout">
                ${this.generateNavigationPanel()}
                <div class="reports-details-area">
                    <div id="report-content">
                        ${this.generateSummarySection()}
                        ${this.generateBreakdownSection()}
                        ${this.generateInsightsSection()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 🧭 GENERAR PANEL DE NAVEGACIÓN
     */
    generateNavigationPanel() {
        const navigationItems = [
            {
                id: 'resumen',
                icon: '📊',
                title: 'Resumen General',
                subtitle: 'Vista global de finanzas'
            },
            {
                id: 'ingresos',
                icon: '💰',
                title: 'Análisis de Ingresos',
                subtitle: 'Fuentes y distribución'
            },
            {
                id: 'gastos',
                icon: '💸',
                title: 'Desglose de Gastos',
                subtitle: 'Por categorías y tipos'
            },
            {
                id: 'balance',
                icon: '⚖️',
                title: 'Balance y Proyecciones',
                subtitle: 'Análisis financiero'
            },
            {
                id: 'tendencias',
                icon: '📈',
                title: 'Tendencias',
                subtitle: 'Evolución temporal'
            },
            {
                id: 'categorias',
                icon: '🏷️',
                title: 'Por Categorías',
                subtitle: 'Análisis detallado'
            }
        ];

        const navigationHTML = navigationItems.map(item => `
            <button class="nav-report-item ${item.id === 'resumen' ? 'active' : ''}" data-report="${item.id}">
                <span class="nav-icon">${item.icon}</span>
                <div class="nav-content">
                    <span class="nav-title">${item.title}</span>
                    <span class="nav-subtitle">${item.subtitle}</span>
                </div>
            </button>
        `).join('');

        return `
            <div class="reports-navigation-panel">
                <div class="navigation-header">
                    <h3>Reportes Disponibles</h3>
                </div>
                <div class="navigation-menu">
                    ${navigationHTML}
                </div>
            </div>
        `;
    }

    /**
     * 📊 GENERAR SECCIÓN DE RESUMEN
     */
    generateSummarySection() {
        if (!this.currentData?.monthly) return '';

        const data = this.currentData.monthly;
        const summaryCards = [
            {
                label: 'Ingresos Totales',
                value: data.totalIngresos,
                type: 'positive',
                icon: '💰'
            },
            {
                label: 'Gastos Totales',
                value: data.totalGastos,
                type: 'negative',
                icon: '💸'
            },
            {
                label: 'Balance',
                value: data.balance,
                type: data.balance >= 0 ? 'positive' : 'negative',
                icon: '⚖️'
            },
            {
                label: '% Ahorro',
                value: `${data.porcentajeAhorro.toFixed(1)}%`,
                type: data.porcentajeAhorro > 10 ? 'positive' : data.porcentajeAhorro > 0 ? 'neutral' : 'negative',
                icon: '📈',
                isPercentage: true
            },
            {
                label: 'Presupuesto Extra',
                value: data.totalGastosExtras,
                type: 'presupuesto-extra',
                icon: '⚡'
            }
        ];

        const cardsHTML = summaryCards.map(card => this.generateSummaryCard(card)).join('');

        return `
            <div class="summary-section" id="resumen-section">
                <h2>Resumen Financiero - ${data.periodo}</h2>
                <div class="summary-grid">
                    ${cardsHTML}
                </div>
            </div>
        `;
    }

    /**
     * 🃏 GENERAR TARJETA DE RESUMEN
     */
    generateSummaryCard(card) {
        const formattedValue = card.isPercentage ? card.value : this.formatCurrency(card.value);
        
        return `
            <div class="summary-card ${card.type}">
                <div class="summary-label">${card.icon} ${card.label}</div>
                <div class="summary-value ${card.type}">${formattedValue}</div>
            </div>
        `;
    }

    /**
     * 📋 GENERAR SECCIÓN DE DESGLOSE
     */
    generateBreakdownSection() {
        if (!this.currentData?.monthly) return '';

        const data = this.currentData.monthly;
        
        const breakdownData = [
            { concepto: 'Gastos Fijos', monto: data.totalGastosFijos, tipo: 'normal' },
            { concepto: 'Gastos Variables', monto: data.totalGastosVariables, tipo: 'normal' },
            { concepto: 'Gastos Extras', monto: data.totalGastosExtras, tipo: 'presupuesto-extra' },
            { concepto: 'TOTAL GASTOS', monto: data.totalGastos, tipo: 'total' }
        ];

        const tableRows = breakdownData.map(item => {
            const rowClass = item.tipo === 'total' ? 'row-total' : 
                           item.tipo === 'presupuesto-extra' ? 'row-presupuesto-extra' : '';
            
            return `
                <tr class="${rowClass}">
                    <td class="breakdown-concepto">${item.concepto}</td>
                    <td class="breakdown-monto">${this.formatCurrency(item.monto)}</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="summary-breakdown">
                <h3>💸 Desglose de Gastos</h3>
                <div class="breakdown-grid">
                    <table class="breakdown-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th style="text-align: right;">Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * 💡 GENERAR SECCIÓN DE INSIGHTS
     */
    generateInsightsSection() {
        if (!this.currentData?.monthly) return '';

        const data = this.currentData.monthly;
        const insights = this.generateInsights(data);

        const insightsHTML = insights.map(insight => `
            <div class="insight-item ${insight.type}">
                <strong>${insight.title}</strong>
                <span>${insight.value}</span>
            </div>
        `).join('');

        return `
            <div class="quick-insights">
                <h3>💡 Insights Rápidos</h3>
                <div class="insights-grid">
                    ${insightsHTML}
                </div>
            </div>
        `;
    }

    /**
     * 🔍 GENERAR INSIGHTS AUTOMÁTICOS
     */
    generateInsights(data) {
        const insights = [];

        // Mayor ingreso
        if (data.mayorIngreso) {
            insights.push({
                title: 'Mayor Fuente de Ingresos:',
                value: `${data.mayorIngreso.fuente} (${this.formatCurrency(data.mayorIngreso.monto)})`,
                type: 'positive'
            });
        }

        // Mayor gasto
        if (data.mayorGasto) {
            insights.push({
                title: 'Mayor Gasto:',
                value: `${data.mayorGasto.categoria} (${this.formatCurrency(data.mayorGasto.monto)})`,
                type: 'negative'
            });
        }

        // Eficiencia financiera
        const eficiencia = data.totalIngresos > 0 ? (data.balance / data.totalIngresos) * 100 : 0;
        insights.push({
            title: 'Eficiencia Financiera:',
            value: `${eficiencia.toFixed(1)}%`,
            type: eficiencia > 20 ? 'positive' : eficiencia > 0 ? 'neutral' : 'negative'
        });

        // Gasto por categoría más costosa
        if (data.categoriaMasCostosa) {
            insights.push({
                title: 'Categoría Más Costosa:',
                value: data.categoriaMasCostosa,
                type: 'neutral'
            });
        }

        return insights;
    }

    /**
     * 📊 RENDERIZAR REPORTE ESPECÍFICO
     */
    renderSpecificReport(reportType, container) {
        if (!container) return;

        let html = '';
        
        switch (reportType) {
            case 'resumen':
                html = this.generateSummarySection() + this.generateBreakdownSection() + this.generateInsightsSection();
                break;
            case 'ingresos':
                html = this.generateIncomeAnalysis();
                break;
            case 'gastos':
                html = this.generateExpenseAnalysis();
                break;
            case 'balance':
                html = this.generateBalanceAnalysis();
                break;
            case 'tendencias':
                html = this.generateTrendsAnalysis();
                break;
            case 'categorias':
                html = this.generateCategoriesAnalysis();
                break;
            default:
                html = '<div class="empty-state">Reporte no disponible</div>';
        }

        container.innerHTML = html;
        console.log(`📊 Reporte ${reportType} renderizado`);
    }

    /**
     * 💰 GENERAR ANÁLISIS DE INGRESOS
     */
    generateIncomeAnalysis() {
        if (!window.storageManager) return '<div class="error-state">Datos no disponibles</div>';

        const ingresos = window.storageManager.getIngresos();
        if (!ingresos.desglose || ingresos.desglose.length === 0) {
            return '<div class="empty-state">No hay ingresos registrados</div>';
        }

        const tableRows = ingresos.desglose.map(ingreso => `
            <tr>
                <td>${ingreso.fuente}</td>
                <td style="text-align: right; font-weight: 600;">${this.formatCurrency(ingreso.monto)}</td>
                <td style="text-align: center;">
                    <span class="status-badge ${ingreso.activo !== false ? 'pagado' : 'pendiente'}">
                        ${ingreso.activo !== false ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
            </tr>
        `).join('');

        return `
            <div class="income-analysis">
                <h2>💰 Análisis Detallado de Ingresos</h2>
                <div class="analysis-summary">
                    <div class="summary-card positive">
                        <div class="summary-label">Total de Ingresos</div>
                        <div class="summary-value positive">${this.formatCurrency(ingresos.total)}</div>
                    </div>
                    <div class="summary-card neutral">
                        <div class="summary-label">Fuentes Activas</div>
                        <div class="summary-value neutral">${ingresos.desglose.filter(i => i.activo !== false).length}</div>
                    </div>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Fuente de Ingreso</th>
                            <th style="text-align: right;">Monto</th>
                            <th style="text-align: center;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * 💸 GENERAR ANÁLISIS DE GASTOS
     */
    generateExpenseAnalysis() {
        if (!this.currentData?.categories) return '<div class="error-state">Datos no disponibles</div>';

        const categories = this.currentData.categories;
        
        const tableRows = categories.categorias.slice(0, 15).map(cat => `
            <tr>
                <td>${cat.nombre}</td>
                <td style="text-align: center;">
                    <span class="tipo-badge ${cat.tipo.toLowerCase()}">${cat.tipo}</span>
                </td>
                <td style="text-align: right; font-weight: 600;">${this.formatCurrency(cat.monto)}</td>
                <td style="text-align: center;">
                    <span class="status-badge ${cat.pagado ? 'pagado' : 'pendiente'}">
                        ${cat.pagado ? 'Pagado' : 'Pendiente'}
                    </span>
                </td>
            </tr>
        `).join('');

        return `
            <div class="expense-analysis">
                <h2>💸 Análisis Detallado de Gastos</h2>
                <div class="analysis-summary">
                    <div class="summary-card negative">
                        <div class="summary-label">Total Categorías</div>
                        <div class="summary-value neutral">${categories.totalCategorias}</div>
                    </div>
                    <div class="summary-card neutral">
                        <div class="summary-label">Gastos Pagados</div>
                        <div class="summary-value positive">${categories.estadisticas.pagadas || 0}</div>
                    </div>
                    <div class="summary-card neutral">
                        <div class="summary-label">Gastos Pendientes</div>
                        <div class="summary-value negative">${categories.estadisticas.pendientes || 0}</div>
                    </div>
                </div>
                <h3>Top 15 Gastos por Monto</h3>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Categoría</th>
                            <th style="text-align: center;">Tipo</th>
                            <th style="text-align: right;">Monto</th>
                            <th style="text-align: center;">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * ⚖️ GENERAR ANÁLISIS DE BALANCE
     */
    generateBalanceAnalysis() {
        if (!this.currentData?.balance) return '<div class="error-state">Datos no disponibles</div>';

        const balance = this.currentData.balance;
        
        return `
            <div class="balance-analysis">
                <h2>⚖️ Análisis de Balance Financiero</h2>
                <div class="analysis-summary">
                    <div class="summary-card ${balance.balance >= 0 ? 'positive' : 'negative'}">
                        <div class="summary-label">Balance Actual</div>
                        <div class="summary-value ${balance.balance >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(balance.balance)}</div>
                    </div>
                    <div class="summary-card neutral">
                        <div class="summary-label">% de Ahorro</div>
                        <div class="summary-value neutral">${balance.porcentajeAhorro.toFixed(1)}%</div>
                    </div>
                </div>
                
                <div class="balance-recommendations">
                    <h3>💡 Recomendaciones</h3>
                    <div class="recommendations-grid">
                        ${balance.recomendaciones?.map(rec => `
                            <div class="recommendation-item">
                                <span>• ${rec}</span>
                            </div>
                        `).join('') || '<div class="recommendation-item">No hay recomendaciones disponibles</div>'}
                    </div>
                </div>

                <div class="projections-section">
                    <h3>🔮 Proyecciones</h3>
                    ${balance.proyecciones ? `
                        <div class="projections-grid">
                            <div class="projection-card">
                                <h4>Próximo Mes</h4>
                                <p>Ingresos: ${this.formatCurrency(balance.proyecciones.proximoMes.ingresos)}</p>
                                <p>Gastos: ${this.formatCurrency(balance.proyecciones.proximoMes.gastos)}</p>
                                <p>Balance: ${this.formatCurrency(balance.proyecciones.proximoMes.balance)}</p>
                            </div>
                            <div class="projection-card">
                                <h4>Proyección Anual</h4>
                                <p>Ingresos: ${this.formatCurrency(balance.proyecciones.anual.ingresos)}</p>
                                <p>Gastos: ${this.formatCurrency(balance.proyecciones.anual.gastos)}</p>
                                <p>Ahorro: ${this.formatCurrency(balance.proyecciones.anual.ahorro)}</p>
                            </div>
                        </div>
                    ` : '<p>Proyecciones no disponibles</p>'}
                </div>
            </div>
        `;
    }

    /**
     * 📈 GENERAR ANÁLISIS DE TENDENCIAS
     */
/**
 * 📈 GENERAR ANÁLISIS DE TENDENCIAS
 */
generateTrendsAnalysis() {
    return `
        <div class="trends-analysis">
            <h2>📈 Análisis de Tendencias</h2>
            <div class="charts-section">
                <div class="charts-grid" style="grid-template-columns: 1fr; gap: 30px;">
                    <div class="chart-card">
                        <div class="chart-title">📈 Tendencia de Ingresos vs Gastos</div>
                        <div class="chart-container" style="height: 350px;">
                            <canvas id="trend-chart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="charts-grid" style="margin-top: 30px;">
                    <div class="chart-card">
                        <div class="chart-title">📊 Distribución de Gastos</div>
                        <div class="chart-container">
                            <canvas id="expenses-chart"></canvas>
                        </div>
                    </div>
                    <div class="chart-card">
                        <div class="chart-title">💰 Fuentes de Ingresos</div>
                        <div class="chart-container">
                            <canvas id="income-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="trends-insights">
                <h3>🔍 Análisis de Tendencias</h3>
                <p>Los gráficos muestran la evolución de tus finanzas a lo largo del tiempo, así como la distribución actual de tus gastos e ingresos. Esta visualización te ayuda a identificar patrones y oportunidades de optimización.</p>
            </div>
        </div>
    `;
}
    /**
     * 🏷️ GENERAR ANÁLISIS POR CATEGORÍAS
     */
    generateCategoriesAnalysis() {
        if (!this.currentData?.categories) return '<div class="error-state">Datos no disponibles</div>';

        const categories = this.currentData.categories;
        const resumenPorTipo = categories.resumenPorTipo;

        const tipoCards = Object.keys(resumenPorTipo).map(tipo => `
            <div class="summary-card neutral">
                <div class="summary-label">${tipo}</div>
                <div class="summary-value neutral">
                    ${resumenPorTipo[tipo].count} items<br>
                    <small>${this.formatCurrency(resumenPorTipo[tipo].total)}</small>
                </div>
            </div>
        `).join('');

        return `
            <div class="categories-analysis">
                <h2>🏷️ Análisis por Categorías</h2>
                <div class="analysis-summary">
                    ${tipoCards}
                </div>
                
                <div class="top-categories">
                    <h3>🔝 Top 5 Categorías Más Costosas</h3>
                    <div class="top-categories-grid">
                        ${categories.categoriasMasCostosas.slice(0, 5).map((cat, index) => `
                            <div class="category-rank-item">
                                <div class="rank-number">#${index + 1}</div>
                                <div class="category-info">
                                    <strong>${cat.nombre}</strong>
                                    <span class="tipo-badge ${cat.tipo.toLowerCase()}">${cat.tipo}</span>
                                    <div class="category-amount">${this.formatCurrency(cat.monto)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // ===============================
    // EVENTOS Y INTERACCIONES
    // ===============================

    /**
     * 🎧 VINCULAR EVENTOS
     */
    bindEvents() {
        // Navegación entre reportes
        const navButtons = document.querySelectorAll('.nav-report-item');
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const reportType = button.dataset.report;
                this.switchToReport(reportType, button);
            });
        });

        console.log('🎧 Eventos de reportes HTML vinculados');
    }

    /**
     * 🔄 CAMBIAR A REPORTE ESPECÍFICO
     */
    switchToReport(reportType, clickedButton) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-report-item').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedButton.classList.add('active');

        // Renderizar reporte específico
        const container = document.getElementById('report-content');
        if (container) {
            this.renderSpecificReport(reportType, container);
            
            // Si es el reporte de tendencias, generar gráficos
            if (reportType === 'tendencias' && window.reportesCharts) {
                setTimeout(() => {
        console.log('📊 Intentando generar gráficos...');
        console.log('🔄 Generando gráficos para tendencias...');
        window.reportesCharts.generateCharts();
                }, 500);
            }
        }

        console.log(`🔄 Cambiado a reporte: ${reportType}`);
    }

    // ===============================
    // TEMPLATES Y UTILIDADES
    // ===============================

    /**
     * 📋 GENERAR DATOS SIMULADOS
     */
    generateMockData() {
        return {
            monthly: {
                periodo: 'Agosto 2025',
                totalIngresos: 1500000,
                totalGastos: 1200000,
                balance: 300000,
                totalGastosFijos: 600000,
                totalGastosVariables: 400000,
                totalGastosExtras: 200000,
                porcentajeAhorro: 20,
                mayorIngreso: { fuente: 'Sueldo Principal', monto: 1200000 },
                mayorGasto: { categoria: 'Arriendo', monto: 400000 },
                categoriaMasCostosa: 'Vivienda'
            },
            categories: {
                totalCategorias: 15,
                categorias: [
                    { nombre: 'Arriendo', tipo: 'Fijos', monto: 400000, pagado: true },
                    { nombre: 'Supermercado', tipo: 'Variables', monto: 200000, pagado: false }
                ],
                categoriasMasCostosas: [
                    { nombre: 'Arriendo', tipo: 'Fijos', monto: 400000 },
                    { nombre: 'Supermercado', tipo: 'Variables', monto: 200000 }
                ],
                resumenPorTipo: {
                    Fijos: { count: 5, total: 600000 },
                    Variables: { count: 7, total: 400000 },
                    Extras: { count: 3, total: 200000 }
                },
                estadisticas: { pagadas: 10, pendientes: 5 }
            },
            balance: {
                balance: 300000,
                porcentajeAhorro: 20,
                recomendaciones: ['Mantén el buen nivel de ahorro'],
                proyecciones: {
                    proximoMes: { ingresos: 1500000, gastos: 1200000, balance: 300000 },
                    anual: { ingresos: 18000000, gastos: 14400000, ahorro: 3600000 }
                }
            }
        };
    }

    /**
     * 💰 FORMATEAR MONEDA
     */
    formatCurrency(amount) {
        if (typeof amount === 'string' && amount.includes('%')) {
            return amount;
        }
        
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }

    // Métodos de plantillas (sin implementación completa para mantener el archivo manejable)
    getSummaryCardTemplate() { return ''; }
    getBreakdownTableTemplate() { return ''; }
    getNavigationPanelTemplate() { return ''; }
    getInsightsSectionTemplate() { return ''; }
    getCategoryCardTemplate() { return ''; }
}

// Inicialización global
window.reportesHTML = null;

// Función de inicialización
function initializeReportesHTML() {
    window.reportesHTML = new ReportesHTML();
    console.log('✅ ReportesHTML v2.1.0 inicializado globalmente');
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReportesHTML);
} else {
    initializeReportesHTML();
}

console.log('📄 reportes-html.js v2.1.0 cargado - Generación de HTML dinámico');
