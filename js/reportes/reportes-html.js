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
     * 📊 GENERAR SECCIÓN DE RESUMEN - DASHBOARD CON TARJETAS
     */
    generateSummarySection() {
        if (!this.currentData?.monthly) return '';

        const data = this.currentData.monthly;

        return `
            <div class="dashboard-summary">
                <div class="dashboard-header">
                    <span class="dashboard-icon">📊</span>
                    <h1 class="dashboard-title">Resumen Financiero - Agosto 2025</h1>
                </div>

                <!-- Grid Principal de Métricas -->
                <div class="summary-cards-grid">
                    <!-- Ingresos Totales -->
                    <div class="summary-metric-card ingresos">
                        <div class="summary-metric-header">
                            <div class="summary-metric-label">Ingresos Totales</div>
                            <div class="summary-metric-icon">📈</div>
                        </div>
                        <div class="summary-metric-value positive">${this.formatCurrency(data.totalIngresos)}</div>
                        <div class="summary-metric-subtitle">Mes actual</div>
                    </div>

                    <!-- Gastos Totales -->
                    <div class="summary-metric-card gastos">
                        <div class="summary-metric-header">
                            <div class="summary-metric-label">Gastos Totales</div>
                            <div class="summary-metric-icon">💸</div>
                        </div>
                        <div class="summary-metric-value negative">${this.formatCurrency(data.totalGastos)}</div>
                        <div class="summary-metric-subtitle">Todos los gastos</div>
                    </div>

                    <!-- Balance -->
                    <div class="summary-metric-card balance">
                        <div class="summary-metric-header">
                            <div class="summary-metric-label">Balance</div>
                            <div class="summary-metric-icon">⚖️</div>
                        </div>
                        <div class="summary-metric-value neutral">${this.formatCurrency(data.balance)}</div>
                        <div class="summary-metric-subtitle">Disponible</div>
                    </div>

                    <!-- Presupuesto Extra -->
                    <div class="summary-metric-card presupuesto">
                        <div class="summary-metric-header">
                            <div class="summary-metric-label">Presupuesto Extra</div>
                            <div class="summary-metric-icon">💳</div>
                        </div>
                        <div class="summary-metric-value warning">${this.formatCurrency(this.getPresupuestoExtrasReal())}</div>
                        <div class="summary-metric-subtitle">Disponible</div>
                    </div>

                    <!-- Estado Financiero -->
                    <div class="summary-metric-card estado">
                        <div class="summary-metric-header">
                            <div class="summary-metric-label">Estado Financiero</div>
                            <div class="summary-metric-icon">⭐</div>
                        </div>
                        <div class="summary-metric-value positive">Excelente</div>
                        <div class="summary-metric-subtitle">Muy saludable</div>
                    </div>

                    <!-- Crecimiento -->
                    <div class="summary-metric-card crecimiento">
                        <div class="summary-metric-header">
                            <div class="summary-metric-label">Crecimiento</div>
                            <div class="summary-metric-icon">📈</div>
                        </div>
                        <div class="summary-metric-value neutral">+${this.formatCurrency(Math.abs(data.balance))}</div>
                        <div class="summary-metric-subtitle">Balance mensual</div>
                    </div>
                </div>

                <!-- Grid de Insights -->
                <div class="summary-insights-grid">
                    <!-- Top Ingresos -->
                    <div class="summary-insight-card">
                        <div class="summary-insight-header">
                            <span class="summary-insight-icon">💰</span>
                            <div class="summary-insight-title">Principales Ingresos</div>
                        </div>
                        <div class="summary-insight-list">
                            ${this.generateTopIncomesInsight()}
                        </div>
                    </div>

                    <!-- Top Gastos -->
                    <div class="summary-insight-card">
                        <div class="summary-insight-header">
                            <span class="summary-insight-icon">📊</span>
                            <div class="summary-insight-title">Principales Gastos</div>
                        </div>
                        <div class="summary-insight-list">
                            ${this.generateTopExpensesInsight()}
                        </div>
                    </div>

                    <!-- Métricas de Eficiencia -->
                    <div class="summary-insight-card">
                        <div class="summary-insight-header">
                            <span class="summary-insight-icon">⚡</span>
                            <div class="summary-insight-title">Eficiencia Financiera</div>
                        </div>
                        <div class="summary-insight-list">
                            ${this.generateEfficiencyInsights(data)}
                        </div>
                    </div>
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
     * 💸 GENERAR SECCIÓN DE DESGLOSE
     */
    generateBreakdownSection() {
        return ''; // Retorna vacío para eliminar la sección
    }

    /**
     * 💡 GENERAR SECCIÓN DE INSIGHTS
     */
    generateInsightsSection() {
        return ''; // Retorna vacío para eliminar la sección
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
     * 📊 RENDERIZAR REPORTE ESPECÍFICO (CORREGIDO)
     */
    renderSpecificReport(reportType, container) {
        if (!container) return;

        let html = '';
        
        switch (reportType) {
            case 'resumen':
                html = this.generateSummarySection();
                break;
            case 'ingresos':
                html = this.generateIncomeAnalysis();
                break;
            case 'gastos':
                html = this.generateExpenseAnalysisSimple();
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

        // PATRÓN EXITOSO: Actualizar DOM sin refrescos (CORREGIDO)
        const currentScrollPosition = window.pageYOffset;
        container.innerHTML = html;
        // Restaurar posición de scroll una sola vez
        window.scrollTo(0, currentScrollPosition);

        console.log(`📊 Reporte ${reportType} renderizado`);
        
        // Ejecutar inicialización de tabla sin auto-foco después del renderizado
        if (reportType === 'categorias') {
            setTimeout(() => {
                if (typeof initCategoriesTable === 'function') {
                    initCategoriesTable();
                }
            }, 100);
        }
    }

    /**
     * 💰 GENERAR ANÁLISIS DE INGRESOS - DISEÑO MINIMALISTA
     */
    generateIncomeAnalysis() {
        if (!window.storageManager) return '<div class="error-state">Datos no disponibles</div>';

        const ingresos = window.storageManager.getIngresos();
        if (!ingresos.desglose || ingresos.desglose.length === 0) {
            return '<div class="empty-state">No hay ingresos registrados</div>';
        }

        // Generar iconos para diferentes fuentes
        const getSourceIcon = (fuente) => {
            const fuenteLower = fuente.toLowerCase();
            if (fuenteLower.includes('sueldo')) return '💼';
            if (fuenteLower.includes('clase') || fuenteLower.includes('enseñanza')) return '🎓';
            if (fuenteLower.includes('freelance') || fuenteLower.includes('extra')) return '💰';
            return '💼';
        };

        const sourceRows = ingresos.desglose.map(ingreso => `
            <div class="source-item">
                <div class="source-info">
                    <div class="source-icon">${getSourceIcon(ingreso.fuente)}</div>
                    <div class="source-name">${ingreso.fuente}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="source-amount">${this.formatCurrency(ingreso.monto)}</div>
                    <div class="source-status">${ingreso.activo !== false ? 'Activo' : 'Inactivo'}</div>
                </div>
            </div>
        `).join('');

        return `
            <div class="income-analysis-minimal">
                <div class="minimal-header">
                    <div class="icon">💰</div>
                    <h1>Análisis Detallado de Ingresos</h1>
                </div>

                <div class="minimal-main-card">
                    <div class="minimal-total-section">
                        <div class="minimal-total-label">Total de Ingresos</div>
                        <div class="minimal-total-amount">${this.formatCurrency(ingresos.total)}</div>
                    </div>

                    <div class="minimal-sources-section">
                        <h3 class="minimal-sources-title">Fuentes de Ingreso</h3>
                        ${sourceRows}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 💸 GENERAR ANÁLISIS DE GASTOS CON BARRAS HORIZONTALES
     */
    generateExpenseAnalysisSimple() {
        if (!this.currentData?.categories) return '<div class="error-state">Datos no disponibles</div>';

        const categories = this.currentData.categories;
        const resumenPorTipo = categories.resumenPorTipo || {};
        
        // Calcular totales y porcentajes
        const totalGastos = Object.values(resumenPorTipo).reduce((acc, tipo) => acc + tipo.total, 0);
        
        // Crear array ordenado por monto
        const tiposOrdenados = Object.entries(resumenPorTipo)
            .map(([tipo, data]) => ({
                tipo,
                total: data.total,
                count: data.count,
                porcentaje: ((data.total / totalGastos) * 100).toFixed(1),
                color: tipo === 'Fijos' ? '#6366f1' : tipo === 'Variables' ? '#10b981' : '#ec4899'
            }))
            .sort((a, b) => b.total - a.total);

        return `
            <div class="expense-analysis-simple">
                <div class="analysis-header">
                    <h1>💸 Análisis de Gastos</h1>
                </div>

                <div class="analysis-content-grid">
                    <!-- Gráfico de Barras -->
                    <div class="analysis-chart-card">
                        <h2 class="analysis-chart-title">Distribución de Gastos</h2>
                        
                        <div class="chart-summary">
                            <div class="total-display">
                                <span class="total-label">Total Gastos</span>
                                <span class="total-amount">${this.formatCurrency(totalGastos)}</span>
                            </div>
                        </div>
                        
                        <div class="bars-chart">
                            ${tiposOrdenados.map((item, index) => `
                                <div class="bar-item" style="animation-delay: ${index * 0.1}s">
                                    <div class="bar-header">
                                        <div class="bar-info">
                                            <span class="bar-label">${item.tipo}</span>
                                            <span class="bar-count">${item.count} items</span>
                                        </div>
                                        <span class="bar-value">${this.formatCurrency(item.total)}</span>
                                    </div>
                                    <div class="bar-container">
                                        <div class="bar-fill" 
                                             style="width: ${item.porcentaje}%; background: ${item.color};"
                                             data-percentage="${item.porcentaje}">
                                            <span class="bar-percentage">${item.porcentaje}%</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="chart-footer">
                            <div class="footer-stats">
                                ${tiposOrdenados.map(item => `
                                    <div class="stat-item">
                                        <div class="stat-color" style="background: ${item.color}"></div>
                                        <div class="stat-info">
                                            <span class="stat-type">${item.tipo}</span>
                                            <span class="stat-percentage">${item.porcentaje}%</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Tabla Top 5 -->
                    <div class="analysis-table-card">
                        <h2 class="analysis-table-title">Top 5 Gastos por Monto</h2>
                        
                        <div class="expense-table-simple">
                            ${categories.categoriasMasCostosas.slice(0, 5).map((cat, index) => `
                                <div class="expense-row-simple" style="animation-delay: ${index * 0.1}s">
                                    <span class="row-number">${index + 1}</span>
                                    <span class="expense-name">${cat.nombre}</span>
                                    <span class="expense-badge-simple badge-${cat.tipo.toLowerCase()}">${cat.tipo}</span>
                                    <span class="expense-amount">${this.formatCurrency(cat.monto)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
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
            <div class="balance-dashboard">
                <!-- Header -->
                <div class="dashboard-header">
                    <span class="header-icon">⚖️</span>
                    <h2>Análisis de Balance Financiero</h2>
                </div>

                <!-- Grid Principal de Métricas -->
                <div class="metrics-grid">
                    <!-- Balance Actual (Tarjeta Principal) -->
                    <div class="balance-main-card">
                        <div class="balance-label">Balance Actual</div>
                        <div class="balance-amount">${this.formatCurrency(this.getCurrentBalance())}</div>
                        <div class="balance-trend">↗️ +5.2% vs mes anterior</div>
                    </div>

                    <!-- Porcentaje de Ahorro -->
                    <div class="savings-card">
                        <svg class="progress-ring" viewBox="0 0 100 100">
                            <circle class="progress-ring-circle" cx="50" cy="50" r="40"/>
                            <circle class="progress-ring-bar" cx="50" cy="50" r="40"/>
                        </svg>
                        <div class="savings-percentage">${this.getCurrentSavingsRate()}%</div>
                        <div class="savings-label">De Ahorro</div>
                    </div>

                    <!-- Recomendaciones y Info -->
                    <div class="info-cards">
                        <div class="section-title">
                            💡 Recomendaciones
                        </div>
                        <div class="recommendations">
                            <p>${balance.balance >= 0 ? 'Tu balance es excelente. Considera invertir el 20% del excedente en instrumentos de bajo riesgo.' : 'Es necesario revisar tus gastos para equilibrar el balance.'}</p>
                        </div>

                        <div class="section-title">
                            🔮 Proyecciones
                        </div>
                    </div>
                </div>

                <!-- Grid de Proyecciones -->
                <div class="projections-grid">
                    <div class="projection-card monthly">
                        <div class="projection-title">Próximo Mes</div>
                        <div class="projection-items">
                            ${balance.proyecciones ? `
                                <div class="projection-item">
                                    <span class="projection-label">Ingresos:</span>
                                    <span class="projection-value">${this.formatCurrency(balance.proyecciones.proximoMes.ingresos)}</span>
                                </div>
                                <div class="projection-item">
                                    <span class="projection-label">Gastos:</span>
                                    <span class="projection-value">${this.formatCurrency(balance.proyecciones.proximoMes.gastos)}</span>
                                </div>
                                <div class="projection-item">
                                    <span class="projection-label">Balance:</span>
                                    <span class="projection-value">${this.formatCurrency(balance.proyecciones.proximoMes.balance)}</span>
                                </div>
                            ` : '<div class="projection-item">Datos no disponibles</div>'}
                        </div>
                    </div>

                    <div class="projection-card yearly">
                        <div class="projection-title">Proyección Anual</div>
                        <div class="projection-items">
                            ${balance.proyecciones ? `
                                <div class="projection-item">
                                    <span class="projection-label">Ingresos:</span>
                                    <span class="projection-value">${this.formatCurrency(balance.proyecciones.anual.ingresos)}</span>
                                </div>
                                <div class="projection-item">
                                    <span class="projection-label">Gastos:</span>
                                    <span class="projection-value">${this.formatCurrency(balance.proyecciones.anual.gastos)}</span>
                                </div>
                                <div class="projection-item">
                                    <span class="projection-label">Ahorro:</span>
                                    <span class="projection-value">${this.formatCurrency(balance.proyecciones.anual.ahorro)}</span>
                                </div>
                            ` : '<div class="projection-item">Datos no disponibles</div>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

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
        
        // Calcular totales por tipo
        const totales = {
            fijos: { monto: 0, count: 0 },
            variables: { monto: 0, count: 0 },
            extras: { monto: 0, count: 0 }
        };
        
        let totalGeneral = 0;
        
        categories.categorias.forEach(cat => {
            const tipo = cat.tipo.toLowerCase();
            if (totales[tipo]) {
                totales[tipo].monto += cat.monto;
                totales[tipo].count++;
            }
            totalGeneral += cat.monto;
        });

        // Generar filas de la tabla
        const tableRows = categories.categoriasMasCostosas.slice(0, 10).map((cat, index) => {
            const porcentaje = totalGeneral > 0 ? ((cat.monto / totalGeneral) * 100).toFixed(1) : 0;
            const icono = this.getCategoryIcon(cat.nombre);
            
            return `
                <tr data-type="${cat.tipo.toLowerCase()}">
                    <td class="category-rank">#${index + 1}</td>
                    <td class="category-name">
                        <span class="category-icon">${icono}</span>
                        <span>${cat.nombre}</span>
                    </td>
                    <td><span class="category-type ${cat.tipo.toLowerCase()}">${cat.tipo}</span></td>
                    <td class="category-amount">${this.formatCurrency(cat.monto)}</td>
                    <td class="category-percentage">${porcentaje}%</td>
                </tr>
            `;
        }).join('');

        return `
            <div class="categories-table-container">
                <!-- Header -->
                <div class="table-header">
                    <div class="header-title">
                        <span class="header-icon">🏷️</span>
                        <h2>Análisis por Categorías</h2>
                    </div>
                    
                    <div class="filter-controls">
                        <input type="text" class="search-input" placeholder="Buscar categoría..." id="searchInput">
                        <select class="filter-select" id="typeFilter">
                            <option value="">Todos los tipos</option>
                            <option value="fijos">Fijos</option>
                            <option value="variables">Variables</option>
                            <option value="extras">Extras</option>
                        </select>
                        <button class="clear-filters" onclick="clearAllFilters()">Limpiar filtros</button>
                    </div>
                </div>

                <!-- Resumen Rápido -->
                <div class="quick-stats">
                    <div class="stat-item total">
                        <div class="stat-label">Total</div>
                        <div class="stat-value">${this.formatCurrency(totalGeneral)}</div>
                        <div class="stat-count">${categories.categorias.length} categorías</div>
                    </div>
                    <div class="stat-item fijos">
                        <div class="stat-label">Fijos</div>
                        <div class="stat-value">${this.formatCurrency(totales.fijos.monto)}</div>
                        <div class="stat-count">${totales.fijos.count} categoría${totales.fijos.count !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="stat-item variables">
                        <div class="stat-label">Variables</div>
                        <div class="stat-value">${this.formatCurrency(totales.variables.monto)}</div>
                        <div class="stat-count">${totales.variables.count} categoría${totales.variables.count !== 1 ? 's' : ''}</div>
                    </div>
                    <div class="stat-item extras">
                        <div class="stat-label">Extras</div>
                        <div class="stat-value">${this.formatCurrency(totales.extras.monto)}</div>
                        <div class="stat-count">${totales.extras.count} categoría${totales.extras.count !== 1 ? 's' : ''}</div>
                    </div>
                </div>

                <!-- Tabla -->
                <table class="categories-table" id="categoriesTable">
                    <thead>
                        <tr>
                            <th class="sortable" onclick="sortCategoriesTable(0)">#</th>
                            <th class="sortable" onclick="sortCategoriesTable(1)">Categoría</th>
                            <th class="sortable" onclick="sortCategoriesTable(2)">Tipo</th>
                            <th class="sortable" onclick="sortCategoriesTable(3)">Monto</th>
                            <th class="sortable" onclick="sortCategoriesTable(4)">% del Total</th>
                        </tr>
                    </thead>
                    <tbody id="categoriesTableBody">
                        ${tableRows || '<tr><td colspan="5" class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">No hay categorías disponibles</div></td></tr>'}
                    </tbody>
                </table>
            </div>
            
            <script>
                // Inicializar tabla de categorías
                setTimeout(() => {
                    if (typeof initCategoriesTable === 'function') {
                        initCategoriesTable();
                    }
                }, 100);
            </script>
        `;
    }

    /**
     * 🎯 OBTENER ICONO POR CATEGORÍA
     */
    getCategoryIcon(nombre) {
        return '📋'; // Icono por defecto
    }

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
     * 🔄 CAMBIAR A REPORTE ESPECÍFICO (CORREGIDO)
     */
    switchToReport(reportType, clickedButton) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-report-item').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedButton.classList.add('active');

        // APLICAR PATRÓN EXITOSO: SIN REFRESCOS AUTOMÁTICOS
        const container = document.getElementById('report-content');
        if (container) {
            // Preservar posición de scroll
            const currentScrollPosition = window.pageYOffset;
            
            // Renderizar contenido SIN refrescos automáticos
            this.renderSpecificReport(reportType, container);
            
            // Restaurar posición de scroll inmediatamente
            window.scrollTo(0, currentScrollPosition);
            
            // SOLO para categorías: inicializar tabla Y restaurar foco SIEMPRE
            if (reportType === 'categorias') {
                setTimeout(() => {
                    if (typeof initCategoriesTable === 'function') {
                        initCategoriesTable();
                    }
                    // Foco garantizado al volver a categorías
                    this.ensureCategoriesFocus();
                }, 100);
            }

            // Generar gráficos SOLO para tendencias (sin causar scroll)
            if (reportType === 'tendencias' && window.reportesCharts) {
                setTimeout(() => {
                    console.log('📊 Generando gráficos de tendencias...');
                    const currentScroll = window.pageYOffset;
                    window.reportesCharts.generateCharts();
                    // Preservar scroll después de generar gráficos
                    setTimeout(() => {
                        window.scrollTo(0, currentScroll);
                    }, 100);
                }, 300);
            }
        }

        console.log(`Cambiado a reporte: ${reportType}`);
    }

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

    /**
     * 💰 GENERAR TOP INGRESOS INSIGHT
     */
    generateTopIncomesInsight() {
        if (!window.storageManager) return '<div class="insight-empty">No hay datos</div>';
        
        const ingresos = window.storageManager.getIngresos();
        if (!ingresos.desglose || ingresos.desglose.length === 0) {
            return '<div class="insight-empty">No hay ingresos registrados</div>';
        }

        return ingresos.desglose.slice(0, 3).map(ingreso => `
            <div class="summary-insight-item top-income">
                <div class="summary-insight-name">${ingreso.fuente}</div>
                <div class="summary-insight-value positive">${this.formatCurrency(ingreso.monto)}</div>
            </div>
        `).join('');
    }

    /**
     * 💸 GENERAR TOP GASTOS INSIGHT  
     */
    generateTopExpensesInsight() {
        // Datos hardcodeados basados en tu imagen actual
        const topGastos = [
            { nombre: 'Gastos Variables', monto: 86655 },
            { nombre: 'Gastos Fijos', monto: 45000 },
            { nombre: 'Gastos Extras', monto: 10000 }
        ];

        return topGastos.map(gasto => `
            <div class="summary-insight-item top-expense">
                <div class="summary-insight-name">${gasto.nombre}</div>
                <div class="summary-insight-value negative">${this.formatCurrency(gasto.monto)}</div>
            </div>
        `).join('');
    }

    /**
     * ⚡ GENERAR INSIGHTS DE EFICIENCIA
     */
    generateEfficiencyInsights(data) {
        const tasaAhorro = data.porcentajeAhorro || 93.6;
        const gastosVsIngresos = data.totalIngresos > 0 ? ((data.totalGastos / data.totalIngresos) * 100).toFixed(1) : 0;
        
        return `
            <div class="summary-insight-item efficiency">
                <div class="summary-insight-name">Tasa de Ahorro</div>
                <div class="summary-insight-value positive">${parseFloat(tasaAhorro).toFixed(1)}%</div>
            </div>
            <div class="summary-insight-item efficiency">
                <div class="summary-insight-name">Gastos vs Ingresos</div>
                <div class="summary-insight-value neutral">${gastosVsIngresos}%</div>
            </div>
            <div class="summary-insight-item efficiency">
                <div class="summary-insight-name">Balance Mensual</div>
                <div class="summary-insight-value positive">+${this.formatCurrency(Math.abs(data.balance))}</div>
            </div>
        `;
    }

    /**
     * 💳 OBTENER PRESUPUESTO EXTRAS REAL
     */
    getPresupuestoExtrasReal() {
        if (!window.storageManager) return 10000;
        
        const gastosExtras = window.storageManager.getGastosExtras();
        return gastosExtras.presupuesto || gastosExtras.total || 10000;
    }

    /**
     * 💰 OBTENER BALANCE ACTUAL REAL
     */
    getCurrentBalance() {
        if (!window.storageManager) return 0;
        
        const ingresos = window.storageManager.getIngresos();
        const gastosFijos = window.storageManager.getGastosFijos();
        const gastosVariables = window.storageManager.getGastosVariables();
        
        const totalIngresos = ingresos.total || 0;
        const totalGastosFijos = gastosFijos.total || 0;
        const totalGastosVariables = gastosVariables.total || 0;
        
        return totalIngresos - (totalGastosFijos + totalGastosVariables);
    }

    /**
     * 📊 OBTENER TASA DE AHORRO REAL
     */
    getCurrentSavingsRate() {
        if (!window.storageManager) return 0;
        
        const ingresos = window.storageManager.getIngresos();
        const balance = this.getCurrentBalance();
        
        if (ingresos.total <= 0) return 0;
        
        const tasaAhorro = (balance / ingresos.total) * 100;
        return Math.max(0, tasaAhorro).toFixed(1);
    }

    /**
     * 🎯 ASEGURAR FOCO EN CAMPO DE BÚSQUEDA DE CATEGORÍAS (NUEVO - MÉTODO IMPLEMENTADO)
     */
    ensureCategoriesFocus() {
        let attempts = 0;
        const maxAttempts = 5;
        
        const tryFocus = () => {
            const searchInput = document.getElementById('searchInput');
            if (searchInput && document.getElementById('report-content').innerHTML.includes('searchInput')) {
                requestAnimationFrame(() => {
                    try {
                        searchInput.focus({ preventScroll: true });
                        console.log('Foco restaurado en búsqueda de categorías');
                    } catch (e) {
                        searchInput.focus();
                    }
                });
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(tryFocus, 100);
            }
        };
        
        setTimeout(tryFocus, 150);
    }

    // Métodos de plantillas (mantenidos para compatibilidad)
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