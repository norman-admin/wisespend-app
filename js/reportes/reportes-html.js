/**
 * REPORTES-HTML.JS - Templates y Renderizado HTML
 * Presupuesto Familiar - Versión 2.1.0 MODULAR
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Templates HTML para reportes
 * ✅ Renderizado de vistas
 * ✅ Estilos CSS embebidos
 * ✅ Layouts responsive
 * ✅ Generación de tablas
 * 🆕 Sistema de navegación funcional
 * 🆕 Layout 3+2 para tarjetas
 * 🆕 Tabla simple para desglose
 */

class ReportesHTML {
    constructor(parentManager) {
        this.parent = parentManager;
        this.storage = parentManager.storage;
        this.currency = parentManager.currency;
        
        console.log('📄 ReportesHTML inicializado');
    }

    /**
     * RENDERIZADO PRINCIPAL
     */
    showReportView(containerId = 'dynamic-content', reportData = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Contenedor de reportes no encontrado');
            return;
        }

        if (!reportData) {
            reportData = this.parent.getReportData();
        }

        if (!reportData) {
            container.innerHTML = this.generateNoDataHTML();
            return;
        }

        const html = this.generateReportHTML(reportData);
        container.innerHTML = html;
        
        console.log('📊 Vista de reportes renderizada');
        
        // 🆕 Configurar navegación de reportes
        setTimeout(() => {
            this.setupReportNavigation();
        }, 100);
    }

    /**
     * TEMPLATE PRINCIPAL DEL REPORTE
     */
    generateReportHTML(data) {
    return `
        ${this.generateReportStyles()}
        
        <!-- LAYOUT 3 COLUMNAS: Panel Navegación + Detalles -->
        <div class="reports-3col-layout">
            
            <!-- COLUMNA 2: Panel de Navegación de Reportes -->
            <div class="reports-navigation-panel">
                ${this.generateNavigationPanel()}
            </div>
            
            <!-- COLUMNA 3: Área de Detalles Dinámicos -->
            <div class="reports-details-area" id="reports-details">
                ${this.generateDefaultDetailsView(data)}
            </div>
            
        </div>
        
        <!-- Datos ocultos para JavaScript -->
        <script>
            window.currentReportData = ${JSON.stringify(data)};
        </script>
    `;
}

    /**
     * HEADER DEL REPORTE
     */
    generateReportHeader(data) {
        const fecha = new Date(data.periodo.fechaGeneracion);
        const fechaFormateada = fecha.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long'
        });

        return `
            <div class="report-header">
                <h1 class="report-title">📊 Reporte Financiero</h1>
                <p class="report-subtitle">${fechaFormateada} • Generado: ${fecha.toLocaleString('es-CL')}</p>
            </div>
        `;
    }

    /**
     * SECCIÓN DE RESUMEN - VERSIÓN CON LAYOUT 3+2 Y TABLA SIMPLE
     */
    generateSummarySection(data) {
        const resumen = data.resumen;
        
        // 🆕 OBTENER PRESUPUESTO DE GASTOS EXTRAS
        let presupuestoExtras = 0;
        if (window.gastosExtrasMejorados && window.gastosExtrasMejorados.getPresupuestoForDynamicCards) {
            presupuestoExtras = window.gastosExtrasMejorados.getPresupuestoForDynamicCards();
        } else if (data.gastosExtras && data.gastosExtras.presupuesto) {
            presupuestoExtras = data.gastosExtras.presupuesto;
        }
        
        return `
            <div class="summary-grid">
                <div class="summary-card neutral">
                    <div class="summary-label">💰 Ingresos Totales</div>
                    <div class="summary-value neutral">${this.formatCurrency(resumen.ingresos)}</div>
                </div>
                
                <div class="summary-card negative">
                    <div class="summary-label">💸 Gastos Totales</div>
                    <div class="summary-value negative">${this.formatCurrency(resumen.gastos.total)}</div>
                </div>
                
                <div class="summary-card ${resumen.balance >= 0 ? 'positive' : 'negative'}">
                    <div class="summary-label">⚖️ Balance</div>
                    <div class="summary-value ${resumen.balance >= 0 ? 'positive' : 'negative'}">
                        ${this.formatCurrency(resumen.balance)}
                    </div>
                </div>
                
                <div class="summary-card ${resumen.porcentajeAhorro >= 10 ? 'positive' : 'negative'}">
                    <div class="summary-label">📈 % Ahorro</div>
                    <div class="summary-value ${resumen.porcentajeAhorro >= 10 ? 'positive' : 'negative'}">
                        ${resumen.porcentajeAhorro}%
                    </div>
                </div>
                
                <!-- 🆕 NUEVA TARJETA PRESUPUESTO GASTO EXTRA (ROSADA) -->
                <div class="summary-card presupuesto-extra">
                    <div class="summary-label">🎯 Presupuesto gasto extra</div>
                    <div class="summary-value presupuesto-extra">${this.formatCurrency(presupuestoExtras)}</div>
                </div>
            </div>
            
            <!-- 🆕 TABLA SIMPLE PARA DESGLOSE -->
            <div class="summary-breakdown">
                <h3>💸 Desglose de Gastos</h3>
                <table class="breakdown-table">
                    <thead>
                        <tr>
                            <th>Concepto</th>
                            <th>Monto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="breakdown-concepto">🔧 Gastos Fijos</td>
                            <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.fijos)}</td>
                        </tr>
                        <tr>
                            <td class="breakdown-concepto">📊 Gastos Variables</td>
                            <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.variables)}</td>
                        </tr>
                        <tr>
                            <td class="breakdown-concepto">🎯 Gastos Extras</td>
                            <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.extras)}</td>
                        </tr>
                        <tr class="row-presupuesto-extra">
                            <td class="breakdown-concepto">🎯 Presupuesto gasto Extra</td>
                            <td class="breakdown-monto">${this.formatCurrency(presupuestoExtras)}</td>
                        </tr>
                        <tr class="row-total">
                            <td class="breakdown-concepto">💰 Total gastos</td>
                            <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.total)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * SECCIÓN RESUMEN - VERSIÓN MEJORADA PARA NAVEGACIÓN (ELIMINA DUPLICACIÓN)
     */
    generateResumenSection(data) {
        const resumen = data.resumen;
        
        // 🆕 OBTENER PRESUPUESTO DE GASTOS EXTRAS
        let presupuestoExtras = 0;
        if (window.gastosExtrasMejorados && window.gastosExtrasMejorados.getPresupuestoForDynamicCards) {
            presupuestoExtras = window.gastosExtrasMejorados.getPresupuestoForDynamicCards();
        } else if (data.gastosExtras && data.gastosExtras.presupuesto) {
            presupuestoExtras = data.gastosExtras.presupuesto;
        }
        
        return `
            <div class="details-section active">
                <div class="section-header">
                    <h2 class="section-title">📊 Resumen Financiero</h2>
                </div>
                
                <div class="summary-grid">
                    <div class="summary-card neutral">
                        <div class="summary-label">💰 Ingresos Totales</div>
                        <div class="summary-value neutral">${this.formatCurrency(resumen.ingresos)}</div>
                    </div>
                    
                    <div class="summary-card negative">
                        <div class="summary-label">💸 Gastos Totales</div>
                        <div class="summary-value negative">${this.formatCurrency(resumen.gastos.total)}</div>
                    </div>
                    
                    <div class="summary-card ${resumen.balance >= 0 ? 'positive' : 'negative'}">
                        <div class="summary-label">⚖️ Balance</div>
                        <div class="summary-value ${resumen.balance >= 0 ? 'positive' : 'negative'}">
                            ${this.formatCurrency(resumen.balance)}
                        </div>
                    </div>
                    
                    <div class="summary-card ${resumen.porcentajeAhorro >= 10 ? 'positive' : 'negative'}">
                        <div class="summary-label">📈 % Ahorro</div>
                        <div class="summary-value ${resumen.porcentajeAhorro >= 10 ? 'positive' : 'negative'}">
                            ${resumen.porcentajeAhorro}%
                        </div>
                    </div>
                    
                    <!-- 🆕 NUEVA TARJETA PRESUPUESTO GASTO EXTRA (ROSADA) -->
                    <div class="summary-card presupuesto-extra">
                        <div class="summary-label">🎯 Presupuesto gasto extra</div>
                        <div class="summary-value presupuesto-extra">${this.formatCurrency(presupuestoExtras)}</div>
                    </div>
                </div>
                
                <!-- 🆕 TABLA SIMPLE PARA DESGLOSE -->
                <div class="summary-breakdown">
                    <h3>💸 Desglose de Gastos</h3>
                    <table class="breakdown-table">
                        <thead>
                            <tr>
                                <th>Concepto</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="breakdown-concepto">🔧 Gastos Fijos</td>
                                <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.fijos)}</td>
                            </tr>
                            <tr>
                                <td class="breakdown-concepto">📊 Gastos Variables</td>
                                <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.variables)}</td>
                            </tr>
                            <tr>
                                <td class="breakdown-concepto">🎯 Gastos Extras</td>
                                <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.extras)}</td>
                            </tr>
                            <tr class="row-presupuesto-extra">
                                <td class="breakdown-concepto">🎯 Presupuesto gasto Extra</td>
                                <td class="breakdown-monto">${this.formatCurrency(presupuestoExtras)}</td>
                            </tr>
                            <tr class="row-total">
                                <td class="breakdown-concepto">💰 Total gastos</td>
                                <td class="breakdown-monto">${this.formatCurrency(resumen.gastos.total)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * SECCIÓN DE GRÁFICOS
     */
    generateChartsSection(data) {
        return `
            <div class="charts-grid">
                <div class="chart-card">
                    <h3 class="chart-title">📈 Distribución de Gastos</h3>
                    <div class="chart-container">
                        <canvas id="gastos-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3 class="chart-title">📊 Balance Financiero</h3>
                    <div class="chart-container">
                        <canvas id="balance-chart"></canvas>
                    </div>
                </div>
                
                <div class="chart-card">
                    <h3 class="chart-title">📉 Tendencias Mensuales</h3>
                    <div class="chart-container">
                        <canvas id="tendencias-chart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * SECCIÓN DE CATEGORÍAS
     */
    generateCategoriesSection(data) {
        const categorias = data.categorias.slice(0, 15); // Top 15 categorías
        
        return `
            <div class="categories-section">
                <h2 class="section-title">🏷️ Análisis por Categorías</h2>
                <div class="categories-table">
                    <table class="table" id="categories-table">
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
                            ${categorias.map(cat => `
                                <tr>
                                    <td>${cat.nombre}</td>
                                    <td><span class="tipo-badge ${cat.tipo}">${cat.tipo}</span></td>
                                    <td>${this.formatCurrency(cat.monto)}</td>
                                    <td>${cat.porcentaje.toFixed(1)}%</td>
                                    <td>
                                        <span class="status-badge ${cat.pagado ? 'pagado' : 'pendiente'}">
                                            ${cat.pagado ? '✅ Pagado' : '⏳ Pendiente'}
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    /**
     * SECCIÓN DE RECOMENDACIONES
     */
    generateRecommendationsSection(data) {
        if (!data.recomendaciones || data.recomendaciones.length === 0) {
            return `
                <div class="categories-section">
                    <h2 class="section-title">💡 Recomendaciones</h2>
                    <p style="text-align: center; color: #6b7280; padding: 20px;">
                        ¡Excelente! No hay recomendaciones críticas en este momento.
                    </p>
                </div>
            `;
        }

        return `
            <div class="categories-section">
                <h2 class="section-title">💡 Recomendaciones</h2>
                <div class="recommendations-grid">
                    ${data.recomendaciones.map(rec => `
                        <div class="recommendation-card ${rec.tipo}">
                            <div class="recommendation-icon">${this.getRecommendationIcon(rec.tipo)}</div>
                            <div class="recommendation-content">
                                <h4>${rec.titulo}</h4>
                                <p>${rec.descripcion}</p>
                                <div class="recommendation-action">💡 ${rec.accion}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * SECCIÓN DE ACCIONES
     */
    generateActionsSection() {
        return `
            <div class="actions-section">
                <h2 class="section-title">⚡ Acciones Disponibles</h2>
                <div class="actions-grid">
                    <button class="action-button primary" onclick="reportesManager.refreshReport()">
                        🔄 Actualizar Reporte
                    </button>
                    <button class="action-button secondary" onclick="reportesManager.exportToPDF()">
                        📄 Exportar PDF
                    </button>
                    <button class="action-button secondary" onclick="reportesManager.exportToExcel()">
                        📊 Exportar Excel
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * TEMPLATE PARA SIN DATOS
     */
    generateNoDataHTML() {
        return `
            <div class="no-data">
                <div class="no-data-icon">📊</div>
                <h3>No hay datos disponibles</h3>
                <p>Configure sus ingresos y gastos para ver los reportes.</p>
            </div>
        `;
    }

    /**
     * UTILIDADES
     */
    formatCurrency(amount) {
        return this.currency ? 
            this.currency.format(amount) :
            `$${amount.toLocaleString('es-CL')}`;
    }

    getRecommendationIcon(tipo) {
        const iconos = {
            'critica': '🚨',
            'advertencia': '⚠️',
            'sugerencia': '💡',
            'exito': '🎉'
        };
        return iconos[tipo] || '📋';
    }

    /**
     * TEMPLATES ADICIONALES (Futuro)
     */
    generateCompactReport(data) {
        // TODO: Versión compacta del reporte
        console.log('📋 Reporte compacto será implementado en v2.1');
    }

    generatePrintableReport(data) {
        // TODO: Versión optimizada para impresión
        console.log('🖨️ Reporte imprimible será implementado en v2.1');
    }

    /**
     * PANEL DE NAVEGACIÓN (COLUMNA 2) - VERSIÓN COMPLETA
     */
    generateNavigationPanel() {
        return `
            <div class="navigation-header">
                <h3>📊 Secciones del Reporte</h3>
            </div>
            
            <div class="navigation-menu">
                <button class="nav-report-item active" data-section="resumen">
                    <div class="nav-icon">📊</div>
                    <div class="nav-content">
                        <span class="nav-title">Resumen Financiero</span>
                        <span class="nav-subtitle">Ingresos, gastos y balance</span>
                    </div>
                </button>
                
                <button class="nav-report-item" data-section="graficos">
                    <div class="nav-icon">📈</div>
                    <div class="nav-content">
                        <span class="nav-title">Gráficos</span>
                        <span class="nav-subtitle">Distribución y tendencias</span>
                    </div>
                </button>
                
                <button class="nav-report-item" data-section="categorias">
                    <div class="nav-icon">🏷️</div>
                    <div class="nav-content">
                        <span class="nav-title">Categorías</span>
                        <span class="nav-subtitle">Análisis detallado por tipo</span>
                    </div>
                </button>
                
                <button class="nav-report-item" data-section="recomendaciones">
                    <div class="nav-icon">💡</div>
                    <div class="nav-content">
                        <span class="nav-title">Recomendaciones</span>
                        <span class="nav-subtitle">Sugerencias de optimización</span>
                    </div>
                </button>
                
                <button class="nav-report-item" data-section="exportar">
                    <div class="nav-icon">⚡</div>
                    <div class="nav-content">
                        <span class="nav-title">Exportar</span>
                        <span class="nav-subtitle">PDF, Excel y más opciones</span>
                    </div>
                </button>
            </div>
        `;
    }

    /**
     * VISTA INICIAL POR DEFECTO (COLUMNA 3)
     */
    generateDefaultDetailsView(data) {
        return this.generateResumenSection(data);
    }

    /**
     * 🆕 SISTEMA DE NAVEGACIÓN DE REPORTES
     */

    /**
     * Configurar navegación del panel de reportes
     */
    setupReportNavigation() {
        // Configurar event listeners para botones de navegación
        const navButtons = document.querySelectorAll('.nav-report-item');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const section = button.dataset.section;
                console.log(`🔄 Navegando a sección de reporte: ${section}`);
                
                // Actualizar estado visual
                this.updateActiveReportNav(section);
                
                // Cambiar contenido dinámico
                this.loadReportSection(section);
            });
        });
        
        console.log(`✅ ${navButtons.length} botones de navegación de reportes configurados`);
    }

    /**
     * Actualizar botón activo en navegación de reportes
     */
    updateActiveReportNav(activeSection) {
        // Remover clase active de todos los botones
        document.querySelectorAll('.nav-report-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Agregar clase active al botón seleccionado
        const activeButton = document.querySelector(`.nav-report-item[data-section="${activeSection}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    /**
     * Cargar contenido de sección específica
     */
    loadReportSection(section) {
        const detailsArea = document.getElementById('reports-details');
        if (!detailsArea) {
            console.error('❌ Área de detalles de reportes no encontrada');
            return;
        }
        
        const reportData = window.currentReportData || this.parent.getReportData();
        if (!reportData) {
            detailsArea.innerHTML = this.generateNoDataHTML();
            return;
        }
        
        let content = '';
        
        switch(section) {
            case 'resumen':
                content = this.generateResumenSection(reportData);
                break;
            case 'graficos':
                content = this.generateGraficosSection(reportData);
                break;
            case 'categorias':
                content = this.generateCategoriesSection(reportData);
                break;
            case 'recomendaciones':
                content = this.generateRecommendationsSection(reportData);
                break;
            case 'exportar':
                content = this.generateActionsSection();
                break;
            default:
                content = this.generateResumenSection(reportData);
        }
        
        detailsArea.innerHTML = content;
        
        // Si es sección de gráficos, inicializar charts después del render
        if (section === 'graficos') {
            setTimeout(() => {
                if (this.parent.chartManager && this.parent.chartManager.renderAllCharts) {
                    this.parent.chartManager.renderAllCharts(reportData);
                }
            }, 100);
        }
        
        console.log(`✅ Contenido de sección "${section}" cargado`);
    }

    /**
     * 🆕 SECCIÓN DE GRÁFICOS MEJORADA
     */
    generateGraficosSection(data) {
        return `
            <div class="details-section active">
                <div class="section-header">
                    <h2 class="section-title">📈 Gráficos y Visualizaciones</h2>
                </div>
                
                <div class="charts-grid">
                    <div class="chart-card">
                        <h3 class="chart-title">📈 Distribución de Gastos</h3>
                        <div class="chart-container">
                            <canvas id="gastos-chart" width="400" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <h3 class="chart-title">📊 Balance Financiero</h3>
                        <div class="chart-container">
                            <canvas id="balance-chart" width="400" height="300"></canvas>
                        </div>
                    </div>
                    
                    <div class="chart-card full-width">
                        <h3 class="chart-title">📉 Tendencias Mensuales</h3>
                        <div class="chart-container">
                            <canvas id="tendencias-chart" width="800" height="400"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * ESTILOS CSS MÍNIMOS (ya que el CSS principal está en reportes.css)
     */
    generateReportStyles() {
        return `
            <style>
                /* CSS mínimo - el resto está en reportes.css */
                .reports-container {
                    padding: 0;
                    max-width: 100%;
                }
            </style>
        `;
    }
}

// Exponer globalmente
window.ReportesHTML = ReportesHTML;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesHTML;
}

console.log('📄 Reportes-html.js v2.1.0 cargado - Layout 3+2 + Tabla simple implementados');