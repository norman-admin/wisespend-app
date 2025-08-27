/**
 * REPORTES-EXPORT.JS - Sistema de Exportación de Reportes
 * Control de Gastos Familiares - Sistema Modular v2.1.0
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Exportar reportes en formato PDF
 * ✅ Exportar datos en formato Excel
 * ✅ Exportar datos en formato JSON
 * ✅ Incluir gráficos en exportaciones
 * ✅ Personalizar opciones de exportación
 */

class ReportesExport {
    constructor() {
        this.libraries = {
            jsPDF: null,
            html2canvas: null,
            XLSX: null
        };
        
        console.log('📤 ReportesExport v2.1.0 inicializando...');
        this.init();
    }

    /**
     * 🚀 INICIALIZACIÓN DEL SISTEMA
     */
    async init() {
        // Las librerías se cargan dinámicamente cuando se necesitan
        console.log('✅ ReportesExport inicializado correctamente');
    }

    /**
     * 📤 EXPORTAR DATOS (MÉTODO PRINCIPAL)
     */
    async exportData(format, options = {}) {
        const defaultOptions = {
            includeCharts: true,
            includeSummary: true,
            includeDetails: true,
            filename: `reporte-${new Date().toISOString().split('T')[0]}`
        };

        const exportOptions = { ...defaultOptions, ...options };

        try {
            switch (format.toLowerCase()) {
                case 'pdf':
                    return await this.exportToPDF(exportOptions);
                case 'excel':
                    return await this.exportToExcel(exportOptions);
                case 'json':
                    return this.exportToJSON(exportOptions);
                default:
                    throw new Error(`Formato ${format} no soportado`);
            }
        } catch (error) {
            console.error(`❌ Error exportando a ${format}:`, error);
            throw error;
        }
    }

    /**
     * 📄 EXPORTAR A PDF
     */
    async exportToPDF(options) {
        try {
            // Cargar jsPDF si no está disponible
            if (!this.libraries.jsPDF) {
                await this.loadJsPDF();
            }

            if (!this.libraries.jsPDF) {
                throw new Error('jsPDF no disponible');
            }

            const { jsPDF } = this.libraries.jsPDF;
            const doc = new jsPDF();

            // Configuración del documento
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 20;
            let currentY = margin;

            // Encabezado del documento
            doc.setFontSize(20);
            doc.setTextColor(60, 60, 60);
            doc.text('Reporte Financiero', pageWidth / 2, currentY, { align: 'center' });
            currentY += 15;

            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            const currentDate = new Date().toLocaleDateString('es-CL');
            doc.text(`Generado el: ${currentDate}`, pageWidth / 2, currentY, { align: 'center' });
            currentY += 20;

            // Incluir resumen si está habilitado
            if (options.includeSummary) {
                currentY = await this.addSummaryToPDF(doc, currentY, margin, pageWidth);
            }

            // Incluir detalles si está habilitado
            if (options.includeDetails) {
                currentY = await this.addDetailsToPDF(doc, currentY, margin, pageWidth, pageHeight);
            }

            // Incluir gráficos si está habilitado
            if (options.includeCharts) {
                currentY = await this.addChartsToPDF(doc, currentY, margin, pageWidth, pageHeight);
            }

            // Pie de página
            this.addFooterToPDF(doc, pageWidth, pageHeight);

            // Descargar el PDF
            doc.save(`${options.filename}.pdf`);
            console.log('📄 PDF exportado exitosamente');
            
            return true;
        } catch (error) {
            console.error('❌ Error exportando PDF:', error);
            throw error;
        }
    }

    /**
     * 📊 EXPORTAR A EXCEL
     */
    async exportToExcel(options) {
        try {
            // Cargar SheetJS si no está disponible
            if (!this.libraries.XLSX) {
                await this.loadXLSX();
            }

            if (!this.libraries.XLSX) {
                throw new Error('XLSX no disponible');
            }

            const XLSX = this.libraries.XLSX;
            const workbook = XLSX.utils.book_new();

            // Generar datos para Excel
            const reportData = this.generateReportData();

            // Hoja de resumen
            if (options.includeSummary) {
                const summarySheet = this.createSummarySheet(reportData);
                XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
            }

            // Hoja de ingresos
            if (options.includeDetails && reportData.ingresos.length > 0) {
                const ingresosSheet = XLSX.utils.json_to_sheet(reportData.ingresos);
                XLSX.utils.book_append_sheet(workbook, ingresosSheet, 'Ingresos');
            }

            // Hoja de gastos fijos
            if (options.includeDetails && reportData.gastosFijos.length > 0) {
                const fijosSheet = XLSX.utils.json_to_sheet(reportData.gastosFijos);
                XLSX.utils.book_append_sheet(workbook, fijosSheet, 'Gastos Fijos');
            }

            // Hoja de gastos variables
            if (options.includeDetails && reportData.gastosVariables.length > 0) {
                const variablesSheet = XLSX.utils.json_to_sheet(reportData.gastosVariables);
                XLSX.utils.book_append_sheet(workbook, variablesSheet, 'Gastos Variables');
            }

            // Hoja de gastos extras
            if (options.includeDetails && reportData.gastosExtras.length > 0) {
                const extrasSheet = XLSX.utils.json_to_sheet(reportData.gastosExtras);
                XLSX.utils.book_append_sheet(workbook, extrasSheet, 'Gastos Extras');
            }

            // Descargar el archivo Excel
            XLSX.writeFile(workbook, `${options.filename}.xlsx`);
            console.log('📊 Excel exportado exitosamente');
            
            return true;
        } catch (error) {
            console.error('❌ Error exportando Excel:', error);
            throw error;
        }
    }

    /**
     * 📋 EXPORTAR A JSON
     */
    exportToJSON(options) {
        try {
            const reportData = this.generateReportData();
            
            // Filtrar datos según opciones
            const exportData = {};

            if (options.includeSummary) {
                exportData.resumen = reportData.resumen;
            }

            if (options.includeDetails) {
                exportData.ingresos = reportData.ingresos;
                exportData.gastosFijos = reportData.gastosFijos;
                exportData.gastosVariables = reportData.gastosVariables;
                exportData.gastosExtras = reportData.gastosExtras;
            }

            exportData.metadata = {
                fechaExportacion: new Date().toISOString(),
                version: '2.1.0',
                opciones: options
            };

            // Crear archivo JSON y descargar
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `${options.filename}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('📋 JSON exportado exitosamente');
            return true;
        } catch (error) {
            console.error('❌ Error exportando JSON:', error);
            throw error;
        }
    }

    // ===============================
    // MÉTODOS AUXILIARES PARA PDF
    // ===============================

    /**
     * 📊 AGREGAR RESUMEN AL PDF
     */
    async addSummaryToPDF(doc, currentY, margin, pageWidth) {
        const reportData = this.generateReportData();
        
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('Resumen Financiero', margin, currentY);
        currentY += 15;

        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        
        // Tabla de resumen
        const summaryData = [
            ['Concepto', 'Monto'],
            ['Total Ingresos', this.formatCurrency(reportData.resumen.totalIngresos)],
            ['Total Gastos', this.formatCurrency(reportData.resumen.totalGastos)],
            ['Balance', this.formatCurrency(reportData.resumen.balance)],
            ['% Ahorro', `${reportData.resumen.porcentajeAhorro.toFixed(1)}%`]
        ];

        this.addTableToPDF(doc, summaryData, margin, currentY, pageWidth - 2 * margin);
        currentY += (summaryData.length * 8) + 20;

        return currentY;
    }

    /**
     * 📋 AGREGAR DETALLES AL PDF
     */
    async addDetailsToPDF(doc, currentY, margin, pageWidth, pageHeight) {
        const reportData = this.generateReportData();
        
        // Verificar si necesitamos una nueva página
        if (currentY > pageHeight - 60) {
            doc.addPage();
            currentY = margin;
        }

        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Desglose por Categorías', margin, currentY);
        currentY += 15;

        // Top 10 gastos más grandes
        const allGastos = [
            ...reportData.gastosFijos.map(g => ({ ...g, tipo: 'Fijo' })),
            ...reportData.gastosVariables.map(g => ({ ...g, tipo: 'Variable' })),
            ...reportData.gastosExtras.map(g => ({ ...g, tipo: 'Extra' }))
        ].sort((a, b) => b.monto - a.monto).slice(0, 10);

        const gastosTableData = [
            ['Categoría', 'Tipo', 'Monto'],
            ...allGastos.map(gasto => [
                gasto.categoria,
                gasto.tipo,
                this.formatCurrency(gasto.monto)
            ])
        ];

        this.addTableToPDF(doc, gastosTableData, margin, currentY, pageWidth - 2 * margin);
        currentY += (gastosTableData.length * 8) + 20;

        return currentY;
    }

    /**
     * 📊 AGREGAR GRÁFICOS AL PDF
     */
    async addChartsToPDF(doc, currentY, margin, pageWidth, pageHeight) {
        if (!window.reportesCharts || !this.libraries.html2canvas) {
            // Intentar cargar html2canvas
            await this.loadHtml2Canvas();
        }

        if (!this.libraries.html2canvas) {
            console.warn('⚠️ html2canvas no disponible - saltando gráficos');
            return currentY;
        }

        const html2canvas = this.libraries.html2canvas;

        try {
            // Verificar si necesitamos una nueva página
            if (currentY > pageHeight - 200) {
                doc.addPage();
                currentY = margin;
            }

            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('Gráficos', margin, currentY);
            currentY += 15;

            // Capturar gráfico de gastos
            const expensesCanvas = document.getElementById('expenses-chart');
            if (expensesCanvas) {
                const canvas = await html2canvas(expensesCanvas.parentElement, {
                    backgroundColor: '#ffffff',
                    scale: 2
                });
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 2 * margin;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                if (currentY + imgHeight > pageHeight - margin) {
                    doc.addPage();
                    currentY = margin;
                }
                
                doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
                currentY += imgHeight + 15;
            }

        } catch (error) {
            console.error('❌ Error agregando gráficos al PDF:', error);
        }

        return currentY;
    }

    /**
     * 📄 AGREGAR PIE DE PÁGINA AL PDF
     */
    addFooterToPDF(doc, pageWidth, pageHeight) {
        doc.setFontSize(10);
        doc.setTextColor(120, 120, 120);
        doc.text('Sistema de Control de Gastos Familiares', pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    /**
     * 📊 AGREGAR TABLA AL PDF
     */
    addTableToPDF(doc, data, x, y, width) {
        const rowHeight = 8;
        const colWidth = width / data[0].length;

        data.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellX = x + colIndex * colWidth;
                const cellY = y + rowIndex * rowHeight;
                
                // Encabezado con fondo
                if (rowIndex === 0) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(cellX, cellY - 6, colWidth, rowHeight, 'F');
                    doc.setTextColor(40, 40, 40);
                    doc.setFontSize(10);
                } else {
                    doc.setTextColor(60, 60, 60);
                    doc.setFontSize(9);
                }
                
                doc.text(String(cell), cellX + 2, cellY, {
                    maxWidth: colWidth - 4
                });
            });
        });
    }

    // ===============================
    // MÉTODOS AUXILIARES PARA EXCEL
    // ===============================

    /**
     * 📊 CREAR HOJA DE RESUMEN PARA EXCEL
     */
    createSummarySheet(reportData) {
        const summaryData = [
            ['Concepto', 'Valor'],
            ['Total Ingresos', reportData.resumen.totalIngresos],
            ['Total Gastos Fijos', reportData.resumen.totalGastosFijos],
            ['Total Gastos Variables', reportData.resumen.totalGastosVariables],
            ['Total Gastos Extras', reportData.resumen.totalGastosExtras],
            ['Total Gastos', reportData.resumen.totalGastos],
            ['Balance', reportData.resumen.balance],
            ['% Ahorro', reportData.resumen.porcentajeAhorro / 100]
        ];

        const ws = this.libraries.XLSX.utils.aoa_to_sheet(summaryData);
        
        // Aplicar formato a columna de valores
        ws['B8'] = { v: reportData.resumen.porcentajeAhorro / 100, t: 'n', z: '0.0%' };
        
        return ws;
    }

    // ===============================
    // MÉTODOS DE CARGA DE LIBRERÍAS
    // ===============================

    /**
     * 📦 CARGAR JSPDF
     */
    async loadJsPDF() {
        return new Promise((resolve, reject) => {
            if (typeof jsPDF !== 'undefined') {
                this.libraries.jsPDF = { jsPDF };
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => {
                this.libraries.jsPDF = { jsPDF: window.jsPDF };
                console.log('📄 jsPDF cargado exitosamente');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Error cargando jsPDF');
                reject();
            };
            document.head.appendChild(script);
        });
    }

    /**
     * 📦 CARGAR HTML2CANVAS
     */
    async loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (typeof html2canvas !== 'undefined') {
                this.libraries.html2canvas = html2canvas;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = () => {
                this.libraries.html2canvas = window.html2canvas;
                console.log('🖼️ html2canvas cargado exitosamente');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Error cargando html2canvas');
                reject();
            };
            document.head.appendChild(script);
        });
    }

    /**
     * 📦 CARGAR XLSX
     */
    async loadXLSX() {
        return new Promise((resolve, reject) => {
            if (typeof XLSX !== 'undefined') {
                this.libraries.XLSX = XLSX;
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => {
                this.libraries.XLSX = window.XLSX;
                console.log('📊 XLSX cargado exitosamente');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Error cargando XLSX');
                reject();
            };
            document.head.appendChild(script);
        });
    }

    // ===============================
    // GENERACIÓN DE DATOS
    // ===============================

    /**
     * 📊 GENERAR DATOS PARA REPORTES
     */
    generateReportData() {
        if (!window.storageManager) {
            throw new Error('StorageManager no disponible');
        }

        const storage = window.storageManager;
        const ingresos = storage.getIngresos();
        const gastosFijos = storage.getGastosFijos();
        const gastosVariables = storage.getGastosVariables();
        const gastosExtras = storage.getGastosExtras();

        // Calcular totales
        const totalIngresos = ingresos.total || 0;
        const totalGastosFijos = gastosFijos.total || 0;
        const totalGastosVariables = gastosVariables.total || 0;
        const totalGastosExtras = (gastosExtras.items || [])
            .filter(item => item.activo !== false)
            .reduce((sum, item) => sum + (item.monto || 0), 0);
        
        const totalGastos = totalGastosFijos + totalGastosVariables + totalGastosExtras;
        const balance = totalIngresos - totalGastos;
        const porcentajeAhorro = totalIngresos > 0 ? (balance / totalIngresos) * 100 : 0;

        return {
            resumen: {
                totalIngresos,
                totalGastosFijos,
                totalGastosVariables,
                totalGastosExtras,
                totalGastos,
                balance,
                porcentajeAhorro
            },
            ingresos: (ingresos.desglose || []).map(item => ({
                fuente: item.fuente,
                monto: item.monto || 0,
                activo: item.activo !== false
            })),
            gastosFijos: (gastosFijos.items || []).filter(item => item.activo !== false).map(item => ({
                categoria: item.categoria,
                monto: item.monto || 0,
                pagado: item.pagado || false
            })),
            gastosVariables: (gastosVariables.items || []).filter(item => item.activo !== false).map(item => ({
                categoria: item.categoria,
                monto: item.monto || 0,
                pagado: item.pagado || false
            })),
            gastosExtras: (gastosExtras.items || []).filter(item => item.activo !== false).map(item => ({
                categoria: item.categoria,
                monto: item.monto || 0,
                pagado: item.pagado || false
            }))
        };
    }

    /**
     * 💰 FORMATEAR MONEDA
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount || 0);
    }
}

// Inicialización global
window.reportesExport = null;

// Función de inicialización
function initializeReportesExport() {
    window.reportesExport = new ReportesExport();
    console.log('✅ ReportesExport v2.1.0 inicializado globalmente');
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeReportesExport);
} else {
    initializeReportesExport();
}

console.log('📤 reportes-export.js v2.1.0 cargado - Sistema de exportación completo');