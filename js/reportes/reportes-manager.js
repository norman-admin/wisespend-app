/**
 * REPORTES-MANAGER.JS - Core del Sistema de Reportes
 * Presupuesto Familiar - Versión 2.0.0 MODULAR
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Orchestración principal
 * ✅ Inicialización de módulos
 * ✅ Gestión de dependencias  
 * ✅ Event listeners centrales
 * ✅ API pública del sistema
 */

class ReportesManager {
    constructor() {
        this.storage = window.storageManager;
        this.currency = window.currencyManager;
        this.reportData = null;
        
        // Referencias a módulos especializados
        this.chartManager = null;
        this.dataGenerator = null;
        this.htmlRenderer = null;
        this.exportManager = null;
        
        if (!this.storage) {
            console.error('❌ StorageManager no disponible para reportes');
            return;
        }
        
        this.initializeReportes();
        console.log('📊 ReportesManager v2.0 MODULAR inicializado');
    }

    /**
     * INICIALIZACIÓN PRINCIPAL
     */
    initializeReportes() {
        this.loadModules();
        this.setupEventListeners();
        this.generateCurrentReport();
    }

    /**
     * Cargar módulos especializados
     */
    async loadModules() {
        // Esperar a que los módulos especializados estén disponibles
        await this.waitForModules();
        
        // Inicializar módulos especializados
        if (window.ReportesCharts) {
            this.chartManager = new window.ReportesCharts(this);
        }
        
        if (window.ReportesGenerator) {
            this.dataGenerator = new window.ReportesGenerator(this);
        }
        
        if (window.ReportesHTML) {
            this.htmlRenderer = new window.ReportesHTML(this);
        }
        
        if (window.ReportesExport) {
            this.exportManager = new window.ReportesExport(this);
        console.log('📤 ExportManager creado correctamente');
    } else {
        console.warn('⚠️ ReportesExport no disponible');
    }        
     }

    /**
     * Esperar a que los módulos estén disponibles
     */
    waitForModules() {
        return new Promise((resolve) => {
            const checkModules = () => {
                const modules = [
                    'ReportesCharts',
                    'ReportesGenerator', 
                    'ReportesHTML',
                    'ReportesExport'
                ];
                
                const allLoaded = modules.every(module => window[module]);
                
                if (allLoaded) {
                    resolve();
                } else {
                    setTimeout(checkModules, 100);
                }
            };
            
            checkModules();
        });
    }

    /**
     * GENERACIÓN DE REPORTES (Delegada)
     */
    generateCurrentReport() {
    if (!this.dataGenerator) {
        console.log('🔄 DataGenerator inicializando, esperando...');
        setTimeout(() => {
            if (this.dataGenerator) {
                console.log('🔄 DataGenerator ahora disponible, generando reporte...');
                this.generateCurrentReport();
            }
        }, 500);
        return null;
    }
    
    const data = this.storage.getDashboardData();
    this.reportData = this.dataGenerator.generateReport(data);
    
    return this.reportData;
}

    /**
     * RENDERIZADO (Delegado)
     */
    showReportView(containerId = 'dynamic-content') {
        if (!this.htmlRenderer) {
            console.error('❌ HTMLRenderer no disponible');
            return;
        }
        
        this.htmlRenderer.showReportView(containerId, this.reportData);
    }

    /**
     * EXPORTACIÓN (Delegada)
     */
    exportToPDF() {
        if (!this.exportManager) {
            console.error('❌ ExportManager no disponible');
            return;
        }
        
        this.exportManager.exportToPDF(this.reportData);
    }

    exportToExcel() {
        if (!this.exportManager) {
            console.error('❌ ExportManager no disponible');
            return;
        }
        
        this.exportManager.exportToExcel(this.reportData);
    }

    /**
     * EVENT LISTENERS
     */
    setupEventListeners() {
    // 🔥 SOLUCIÓN UNIFICADA: Un solo listener con debounce global
    let updateTimeout = null;
    
    const triggerUpdate = () => {
        // Limpiar timeout anterior
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        
        // Programar actualización con debounce de 500ms
        updateTimeout = setTimeout(() => {
            this.generateCurrentReport();
            updateTimeout = null;
        }, 500);
    };
    
    // Un solo event listener que maneja TODO
    window.addEventListener('storageSaved', triggerUpdate);
    window.addEventListener('gastos_gastoAdded', triggerUpdate);
    window.addEventListener('gastos_gastoUpdated', triggerUpdate);
    window.addEventListener('income_incomeAdded', triggerUpdate);
    window.addEventListener('income_incomeUpdated', triggerUpdate);
    window.addEventListener('dashboard_statsUpdated', triggerUpdate);
    window.addEventListener('reportes_forceUpdate', triggerUpdate);
}

    /**
 * 🆕 Forzar actualización de reportes si está visible
 */
forceUpdateIfVisible() {
    // Detectar si estamos en la vista de reportes
    const isInReports = document.querySelector('.reports-3col-layout') || 
                      document.querySelector('#reports-details') ||
                      document.querySelector('.summary-breakdown');
    
    if (isInReports) {
        console.log('🔄 Vista de reportes detectada, renderizando...');
        this.showReportView(); // Solo renderizar, NO generar reporte
    }
}

    /**
     * UTILIDADES PÚBLICAS
     */
    refreshReport() {
        console.log('🔄 Actualizando reporte...');
        this.generateCurrentReport();
        this.showReportView();
    }

    getReportData() {
        return this.reportData;
    }

    isReady() {
        return !!(this.chartManager && this.dataGenerator && 
                 this.htmlRenderer && this.exportManager);
    }

    /**
     * DESTRUCTOR
     */
    destroy() {
        // Destruir módulos especializados
        if (this.chartManager?.destroy) {
            this.chartManager.destroy();
        }
        
        // Limpiar referencias
        this.chartManager = null;
        this.dataGenerator = null;
        this.htmlRenderer = null;
        this.exportManager = null;
        this.reportData = null;
        
        console.log('🧹 ReportesManager destruido');
    }
}

// Crear instancia global
window.reportesManager = new ReportesManager();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesManager;
}

console.log('📊 Reportes-manager.js v2.0 MODULAR - Core del sistema cargado');