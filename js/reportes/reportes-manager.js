/**
 * REPORTES-MANAGER.JS - Gestor Principal del Sistema de Reportes
 * Control de Gastos Familiares - Sistema Modular v2.1.0
 * 
 * RESPONSABILIDADES:
 * ✅ Inicialización del sistema de reportes
 * ✅ Gestión de navegación entre secciones
 * ✅ Coordinación de datos y vista
 * ✅ Integración con otros módulos
 * ✅ Control de estados y eventos
 */

class ReportesManager {
    constructor() {
        this.storage = window.storageManager;
        this.currentReport = 'resumen';
        this.currentPeriod = 'monthly';
        this.searchFilters = {
            month: '',
            year: '',
            period: 'monthly'
        };

        if (!this.storage) {
            console.error('❌ StorageManager no disponible para reportes');
            return;
        }

        console.log('📊 ReportesManager v2.1.0 inicializado');
        this.init();
    }

    /**
     * 🚀 INICIALIZACIÓN DEL SISTEMA
     */
    init() {
        this.setupEventListeners();
        this.loadDefaultReport();
        console.log('✅ Sistema de reportes inicializado correctamente');
    }

    /**
     * 🎧 CONFIGURAR EVENT LISTENERS
     */
    setupEventListeners() {
        // Botones principales
        const searchBtn = document.getElementById('search-month-btn');
        const reportsBtn = document.getElementById('generate-reports-btn');
        const exportBtn = document.getElementById('export-data-btn');

        if (searchBtn) searchBtn.addEventListener('click', () => this.toggleSection('search'));
        if (reportsBtn) reportsBtn.addEventListener('click', () => this.toggleSection('reports'));
        if (exportBtn) exportBtn.addEventListener('click', () => this.toggleSection('export'));

        // Botón de búsqueda
        const executeSearchBtn = document.getElementById('execute-search');
        if (executeSearchBtn) {
            executeSearchBtn.addEventListener('click', () => this.executeSearch());
        }

        // Selectores de período
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.changePeriod(e.target.dataset.period));
        });

        // Botones de exportación
        const exportPdfBtn = document.getElementById('export-pdf');
        const exportExcelBtn = document.getElementById('export-excel');
        const exportJsonBtn = document.getElementById('export-json');

        if (exportPdfBtn) exportPdfBtn.addEventListener('click', () => this.exportData('pdf'));
        if (exportExcelBtn) exportExcelBtn.addEventListener('click', () => this.exportData('excel'));
        if (exportJsonBtn) exportJsonBtn.addEventListener('click', () => this.exportData('json'));

        console.log('🎧 Event listeners de reportes configurados');
    }

    /**
     * 📱 ALTERNAR SECCIONES
     */
    toggleSection(section) {
        // Ocultar todas las secciones
        const sections = ['search-section', 'reports-section', 'export-section'];
        sections.forEach(sectionId => {
            const element = document.getElementById(sectionId);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.style.display = 'block';

            // Cargar contenido específico
            switch (section) {
                case 'search':
                    this.loadSearchSection();
                    break;
                case 'reports':
                    this.loadReportsSection();
                    break;
                case 'export':
                    this.loadExportSection();
                    break;
            }
        }

        // Actualizar botones activos
        this.updateActiveButton(section);
        console.log(`📱 Sección ${section} mostrada`);
    }

    /**
     * 🎯 ACTUALIZAR BOTÓN ACTIVO
     */
    updateActiveButton(activeSection) {
        const buttons = document.querySelectorAll('.btn-reports');
        buttons.forEach(btn => btn.classList.remove('active'));

        const activeBtn = document.getElementById(`${activeSection}-${activeSection === 'export' ? 'data' : activeSection === 'reports' ? 'reports' : 'month'}-btn`);
        if (activeBtn) activeBtn.classList.add('active');
    }

    /**
     * 🔍 CARGAR SECCIÓN DE BÚSQUEDA
     */
    loadSearchSection() {
        // Configurar años disponibles dinámicamente
        const yearSelect = document.getElementById('search-year');
        if (yearSelect && yearSelect.children.length <= 5) { // Solo si no se han agregado años dinámicamente
            const currentYear = new Date().getFullYear();
            for (let year = currentYear - 2; year <= currentYear + 2; year++) {
                if (!Array.from(yearSelect.options).some(option => option.value == year)) {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;
                    yearSelect.appendChild(option);
                }
            }
        }

        console.log('🔍 Sección de búsqueda cargada');
    }

    /**
     * 📊 CARGAR SECCIÓN DE REPORTES
     */
    loadReportsSection() {
        if (window.reportesGenerator) {
            this.generateMonthlyReport();
            this.generatePeriodReport();
        }

        if (window.reportesCharts) {
            window.reportesCharts.generateCharts();
        }

        console.log('📊 Sección de reportes cargada');
    }

    /**
     * 📤 CARGAR SECCIÓN DE EXPORTACIÓN
     */
    loadExportSection() {
        // Actualizar opciones según el estado actual
        const includeChartsCheckbox = document.getElementById('include-charts');
        const includeSummaryCheckbox = document.getElementById('include-summary');
        const includeDetailsCheckbox = document.getElementById('include-details');

        if (includeChartsCheckbox) includeChartsCheckbox.checked = true;
        if (includeSummaryCheckbox) includeSummaryCheckbox.checked = true;
        if (includeDetailsCheckbox) includeDetailsCheckbox.checked = true;

        console.log('📤 Sección de exportación cargada');
    }

    /**
     * 🔍 EJECUTAR BÚSQUEDA
     */
    executeSearch() {
        const monthSelect = document.getElementById('search-month');
        const yearSelect = document.getElementById('search-year');

        const selectedMonth = monthSelect ? monthSelect.value : '';
        const selectedYear = yearSelect ? yearSelect.value : '';

        if (!selectedMonth || !selectedYear) {
            this.showMessage('Por favor selecciona mes y año', 'warning');
            return;
        }

        this.searchFilters.month = selectedMonth;
        this.searchFilters.year = selectedYear;

        // Mostrar mensaje de procesamiento
        this.showMessage('Cambiando período de la aplicación...', 'info');

        // Simular cambio de período en toda la aplicación
        setTimeout(() => {
            this.applyPeriodFilter(selectedMonth, selectedYear);
            this.showMessage(`Período cambiado a ${this.getMonthName(selectedMonth)} ${selectedYear}`, 'success');
        }, 1000);

        console.log(`🔍 Búsqueda ejecutada: ${selectedMonth}/${selectedYear}`);
    }

    /**
     * 📅 APLICAR FILTRO DE PERÍODO
     */
    applyPeriodFilter(month, year) {
        // Aquí se integraría con el sistema principal para cambiar el período
        // Por ahora, solo actualizamos los reportes
        if (window.reportesGenerator) {
            window.reportesGenerator.setCurrentPeriod(month, year);
        }

        // Actualizar header si existe
        if (window.gastosManager && window.gastosManager.updateHeaderTotals) {
            window.gastosManager.updateHeaderTotals();
        }

        console.log(`📅 Filtro aplicado: ${month}/${year}`);
    }

    /**
     * 🔄 CAMBIAR PERÍODO DE REPORTE
     */
    changePeriod(period) {
        this.currentPeriod = period;

        // Actualizar botones activos
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.period === period) {
                btn.classList.add('active');
            }
        });

        // Regenerar reporte del período
        this.generatePeriodReport();

        console.log(`🔄 Período cambiado a: ${period}`);
    }

    /**
     * 📊 GENERAR REPORTE MENSUAL
     */
    generateMonthlyReport() {
        if (!window.reportesGenerator) return;

        const reportContent = document.getElementById('monthly-report');
        if (reportContent) {
            const reportData = window.reportesGenerator.generateMonthlyReport();
            reportContent.innerHTML = this.formatMonthlyReport(reportData);
        }
    }

    /**
     * 📊 GENERAR REPORTE POR PERÍODO
     */
    generatePeriodReport() {
        if (!window.reportesGenerator) return;

        const reportContent = document.getElementById('period-report');
        if (reportContent) {
            const reportData = window.reportesGenerator.generatePeriodReport(this.currentPeriod);
            reportContent.innerHTML = this.formatPeriodReport(reportData);
        }
    }

    /**
     * 📄 FORMATEAR REPORTE MENSUAL
     */
    formatMonthlyReport(data) {
        if (!data) return '<p>No hay datos disponibles</p>';

        return `
            <div class="monthly-report-content">
                <div class="report-summary">
                    <div class="summary-item">
                        <strong>Total Ingresos:</strong> ${this.formatCurrency(data.totalIngresos)}
                    </div>
                    <div class="summary-item">
                        <strong>Total Gastos:</strong> ${this.formatCurrency(data.totalGastos)}
                    </div>
                    <div class="summary-item ${data.balance >= 0 ? 'positive' : 'negative'}">
                        <strong>Balance:</strong> ${this.formatCurrency(data.balance)}
                    </div>
                </div>
                
                <div class="report-highlights">
                    <h4>Destacados del mes:</h4>
                    <ul>
                        <li><strong>Mayor ingreso:</strong> ${data.mayorIngreso?.fuente || 'N/A'} - ${this.formatCurrency(data.mayorIngreso?.monto || 0)}</li>
                        <li><strong>Mayor gasto:</strong> ${data.mayorGasto?.categoria || 'N/A'} - ${this.formatCurrency(data.mayorGasto?.monto || 0)}</li>
                        <li><strong>Categoría más costosa:</strong> ${data.categoriaMasCostosa || 'N/A'}</li>
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * 📄 FORMATEAR REPORTE POR PERÍODO
     */
    formatPeriodReport(data) {
        if (!data) return '<p>No hay datos disponibles</p>';

        const periodName = this.getPeriodName(this.currentPeriod);

        return `
            <div class="period-report-content">
                <h4>Análisis ${periodName}</h4>
                <div class="period-stats">
                    <div class="stat-item">
                        <span class="stat-label">Promedio Ingresos:</span>
                        <span class="stat-value">${this.formatCurrency(data.promedioIngresos)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Promedio Gastos:</span>
                        <span class="stat-value">${this.formatCurrency(data.promedioGastos)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tendencia:</span>
                        <span class="stat-value ${data.tendencia === 'positiva' ? 'positive' : 'negative'}">${data.tendencia}</span>
                    </div>
                </div>
                
                <div class="period-analysis">
                    <p>${data.analisis || 'Análisis no disponible'}</p>
                </div>
            </div>
        `;
    }

    /**
     * 📤 EXPORTAR DATOS
     */
    exportData(format) {
        if (!window.reportesExport) {
            this.showMessage('Sistema de exportación no disponible', 'error');
            return;
        }

        const options = {
            includeCharts: document.getElementById('include-charts')?.checked || false,
            includeSummary: document.getElementById('include-summary')?.checked || false,
            includeDetails: document.getElementById('include-details')?.checked || false
        };

        this.showMessage(`Exportando en formato ${format.toUpperCase()}...`, 'info');

        try {
            window.reportesExport.exportData(format, options);
            this.showMessage(`Exportación ${format.toUpperCase()} completada`, 'success');
        } catch (error) {
            console.error('❌ Error en exportación:', error);
            this.showMessage(`Error al exportar en ${format.toUpperCase()}`, 'error');
        }
    }

    /**
     * 🗓️ CARGAR REPORTE POR DEFECTO
     */
    loadDefaultReport() {
        // Mostrar sección de reportes por defecto
        setTimeout(() => {
            this.toggleSection('reports');
        }, 100);
    }

    /**
     * 💬 MOSTRAR MENSAJE
     */
    showMessage(message, type = 'info') {
        const statusElement = document.getElementById('reports-status');
        if (!statusElement) return;

        statusElement.innerHTML = `<p class="${type}">${message}</p>`;
        statusElement.style.display = 'block';

        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);

        console.log(`💬 Mensaje: ${message} (${type})`);
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
        if (window.reportesGenerator) {
            window.reportesGenerator.refreshData();
        }

        this.generateMonthlyReport();
        this.generatePeriodReport();

        if (window.reportesCharts) {
            window.reportesCharts.updateCharts();
        }

        console.log('🔄 Datos de reportes actualizados');
        this.generatePeriodReport();

        console.log(`🔄 Período cambiado a: ${period}`);
    }

    /**
     * 📊 GENERAR REPORTE MENSUAL
     */
    generateMonthlyReport() {
        if (!window.reportesGenerator) return;

        const reportContent = document.getElementById('monthly-report');
        if (reportContent) {
            const reportData = window.reportesGenerator.generateMonthlyReport();
            reportContent.innerHTML = this.formatMonthlyReport(reportData);
        }
    }

    /**
     * 📊 GENERAR REPORTE POR PERÍODO
     */
    generatePeriodReport() {
        if (!window.reportesGenerator) return;

        const reportContent = document.getElementById('period-report');
        if (reportContent) {
            const reportData = window.reportesGenerator.generatePeriodReport(this.currentPeriod);
            reportContent.innerHTML = this.formatPeriodReport(reportData);
        }
    }

    /**
     * 📄 FORMATEAR REPORTE MENSUAL
     */
    formatMonthlyReport(data) {
        if (!data) return '<p>No hay datos disponibles</p>';

        return `
            <div class="monthly-report-content">
                <div class="report-summary">
                    <div class="summary-item">
                        <strong>Total Ingresos:</strong> ${this.formatCurrency(data.totalIngresos)}
                    </div>
                    <div class="summary-item">
                        <strong>Total Gastos:</strong> ${this.formatCurrency(data.totalGastos)}
                    </div>
                    <div class="summary-item ${data.balance >= 0 ? 'positive' : 'negative'}">
                        <strong>Balance:</strong> ${this.formatCurrency(data.balance)}
                    </div>
                </div>
                
                <div class="report-highlights">
                    <h4>Destacados del mes:</h4>
                    <ul>
                        <li><strong>Mayor ingreso:</strong> ${data.mayorIngreso?.fuente || 'N/A'} - ${this.formatCurrency(data.mayorIngreso?.monto || 0)}</li>
                        <li><strong>Mayor gasto:</strong> ${data.mayorGasto?.categoria || 'N/A'} - ${this.formatCurrency(data.mayorGasto?.monto || 0)}</li>
                        <li><strong>Categoría más costosa:</strong> ${data.categoriaMasCostosa || 'N/A'}</li>
                    </ul>
                </div>
            </div>
        `;
    }

    /**
     * 📄 FORMATEAR REPORTE POR PERÍODO
     */
    formatPeriodReport(data) {
        if (!data) return '<p>No hay datos disponibles</p>';

        const periodName = this.getPeriodName(this.currentPeriod);

        return `
            <div class="period-report-content">
                <h4>Análisis ${periodName}</h4>
                <div class="period-stats">
                    <div class="stat-item">
                        <span class="stat-label">Promedio Ingresos:</span>
                        <span class="stat-value">${this.formatCurrency(data.promedioIngresos)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Promedio Gastos:</span>
                        <span class="stat-value">${this.formatCurrency(data.promedioGastos)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Tendencia:</span>
                        <span class="stat-value ${data.tendencia === 'positiva' ? 'positive' : 'negative'}">${data.tendencia}</span>
                    </div>
                </div>
                
                <div class="period-analysis">
                    <p>${data.analisis || 'Análisis no disponible'}</p>
                </div>
            </div>
        `;
    }

    /**
     * 📤 EXPORTAR DATOS
     */
    exportData(format) {
        if (!window.reportesExport) {
            this.showMessage('Sistema de exportación no disponible', 'error');
            return;
        }

        const options = {
            includeCharts: document.getElementById('include-charts')?.checked || false,
            includeSummary: document.getElementById('include-summary')?.checked || false,
            includeDetails: document.getElementById('include-details')?.checked || false
        };

        this.showMessage(`Exportando en formato ${format.toUpperCase()}...`, 'info');

        try {
            window.reportesExport.exportData(format, options);
            this.showMessage(`Exportación ${format.toUpperCase()} completada`, 'success');
        } catch (error) {
            console.error('❌ Error en exportación:', error);
            this.showMessage(`Error al exportar en ${format.toUpperCase()}`, 'error');
        }
    }

    /**
     * 🗓️ CARGAR REPORTE POR DEFECTO
     */
    loadDefaultReport() {
        // Mostrar sección de reportes por defecto
        setTimeout(() => {
            this.toggleSection('reports');
        }, 100);
    }

    /**
     * 💬 MOSTRAR MENSAJE
     */
    showMessage(message, type = 'info') {
        const statusElement = document.getElementById('reports-status');
        if (!statusElement) return;

        statusElement.innerHTML = `<p class="${type}">${message}</p>`;
        statusElement.style.display = 'block';

        // Auto-ocultar después de 3 segundos
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 3000);

        console.log(`💬 Mensaje: ${message} (${type})`);
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
        if (window.reportesGenerator) {
            window.reportesGenerator.refreshData();
        }

        this.generateMonthlyReport();
        this.generatePeriodReport();

        if (window.reportesCharts) {
            window.reportesCharts.updateCharts();
        }

        console.log('🔄 Datos de reportes actualizados');
    }

    /**
     * 📊 OBTENER ESTADO ACTUAL
     */
    getCurrentState() {
        return {
            currentReport: this.currentReport,
            currentPeriod: this.currentPeriod,
            searchFilters: { ...this.searchFilters }
        };
    }
}

// Inicialización global
window.reportesManager = null;

// Función de inicialización
function initializeReportesManager() {
    if (window.storageManager) {
        window.reportesManager = new ReportesManager();
        console.log('✅ ReportesManager v2.1.0 inicializado globalmente');
    } else {
        console.warn('⚠️ Esperando StorageManager para inicializar ReportesManager');
        // Intentar de nuevo en 500ms
        setTimeout(initializeReportesManager, 500);

        // También escuchar el evento por si acaso
        window.addEventListener('storageManagerReady', () => {
            if (!window.reportesManager) {
                initializeReportesManager();
            }
        }, { once: true });
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReportesManager);
} else {
    initializeReportesManager();
}

console.log('📊 reportes-manager.js v2.1.0 cargado - Sistema modular completo');