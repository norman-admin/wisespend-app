/**
 * REPORTES-EXPORT.JS - Sistema de Exportación de Reportes
 * Presupuesto Familiar - Versión 2.0.0 MODULAR
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Exportación a PDF con jsPDF
 * ✅ Exportación a Excel con SheetJS
 * ✅ Descarga de archivos
 * ✅ Formateo para exportación
 * ✅ Compresión de datos
 */

class ReportesExport {
    constructor(parentManager) {
        this.parent = parentManager;
        this.storage = parentManager.storage;
        this.currency = parentManager.currency;
        this.isJsPDFLoaded = false;
        this.isSheetJSLoaded = false;
        
        this.initializeLibraries();
        console.log('📤 ReportesExport inicializado');
    }

    /**
     * INICIALIZACIÓN DE LIBRERÍAS
     */
    async initializeLibraries() {
        // Cargar librerías bajo demanda (lazy loading)
        console.log('📚 Librerías de exportación se cargarán bajo demanda');
    }

    /**
     * CARGAR JSPDF DINÁMICAMENTE
     */
    async loadJsPDF() {
        if (this.isJsPDFLoaded || window.jsPDF) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            
            script.onload = () => {
                console.log('📄 jsPDF cargado correctamente');
                this.isJsPDFLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Error cargando jsPDF');
                reject(new Error('jsPDF no se pudo cargar'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * CARGAR SHEETJS DINÁMICAMENTE
     */
    async loadSheetJS() {
        if (this.isSheetJSLoaded || window.XLSX) {
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            
            script.onload = () => {
                console.log('📊 SheetJS cargado correctamente');
                this.isSheetJSLoaded = true;
                resolve();
            };
            
            script.onerror = () => {
                console.error('❌ Error cargando SheetJS');
                reject(new Error('SheetJS no se pudo cargar'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * EXPORTACIÓN A PDF
     */
    async exportToPDF(reportData = null) {
        try {
            // Mostrar indicador de carga
            this.showExportLoading('PDF');
            
            // Cargar jsPDF si no está disponible
            await this.loadJsPDF();
            
            if (!window.jsPDF) {
                throw new Error('jsPDF no está disponible');
            }

            // Obtener datos si no se proporcionan
            if (!reportData) {
                reportData = this.parent.getReportData();
            }

            if (!reportData) {
                throw new Error('No hay datos para exportar');
            }

            // Crear documento PDF
            const { jsPDF } = window.jsPDF;
            const doc = new jsPDF();
            
            // Configurar fuente
            doc.setFont('helvetica');
            
            // Generar contenido del PDF
            this.generatePDFContent(doc, reportData);
            
            // Generar nombre de archivo
            const fileName = this.generateFileName('reporte-financiero', 'pdf');
            
            // Descargar archivo
            doc.save(fileName);
            
            this.hideExportLoading();
            this.showExportSuccess('PDF', fileName);
            
            console.log(`📄 Reporte PDF exportado: ${fileName}`);
            
        } catch (error) {
            this.hideExportLoading();
            this.showExportError('PDF', error.message);
            console.error('❌ Error exportando PDF:', error);
        }
    }

    /**
     * GENERAR CONTENIDO DEL PDF
     */
    generatePDFContent(doc, data) {
        let yPosition = 20;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        
        // TÍTULO PRINCIPAL
        doc.setFontSize(20);
        doc.setTextColor(60, 60, 60);
        doc.text('📊 REPORTE FINANCIERO', margin, yPosition);
        yPosition += 15;
        
        // FECHA
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        const fecha = new Date().toLocaleDateString('es-CL');
        doc.text(`Generado: ${fecha}`, margin, yPosition);
        yPosition += 20;
        
        // RESUMEN FINANCIERO
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('💰 RESUMEN FINANCIERO', margin, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        
        const resumen = data.resumen;
        const resumenLines = [
            `Ingresos Totales: ${this.formatCurrency(resumen.ingresos)}`,
            `Gastos Totales: ${this.formatCurrency(resumen.gastos.total)}`,
            `Balance: ${this.formatCurrency(resumen.balance)}`,
            `Porcentaje de Ahorro: ${resumen.porcentajeAhorro}%`,
            `Eficiencia Financiera: ${resumen.eficienciaFinanciera}`
        ];
        
        resumenLines.forEach(line => {
            doc.text(line, margin + 5, yPosition);
            yPosition += 8;
        });
        
        yPosition += 15;
        
        // DESGLOSE DE GASTOS
        doc.setFontSize(16);
        doc.setTextColor(40, 40, 40);
        doc.text('💸 DESGLOSE DE GASTOS', margin, yPosition);
        yPosition += 15;
        
        doc.setFontSize(12);
        const gastos = resumen.gastos;
        const gastosLines = [
            `Gastos Fijos: ${this.formatCurrency(gastos.fijos)}`,
            `Gastos Variables: ${this.formatCurrency(gastos.variables)}`,
            `Gastos Extras: ${this.formatCurrency(gastos.extras)}`
        ];
        
        gastosLines.forEach(line => {
            doc.text(line, margin + 5, yPosition);
            yPosition += 8;
        });
        
        yPosition += 20;
        
        // CATEGORÍAS PRINCIPALES
        if (data.categorias && data.categorias.length > 0) {
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text('🏷️ PRINCIPALES CATEGORÍAS', margin, yPosition);
            yPosition += 15;
            
            doc.setFontSize(10);
            
            // Headers de tabla
            doc.setTextColor(80, 80, 80);
            doc.text('Categoría', margin, yPosition);
            doc.text('Tipo', margin + 80, yPosition);
            doc.text('Monto', margin + 120, yPosition);
            doc.text('%', margin + 160, yPosition);
            yPosition += 10;
            
            // Línea separadora
            doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
            yPosition += 5;
            
            // Datos de categorías (top 10)
            doc.setTextColor(60, 60, 60);
            data.categorias.slice(0, 10).forEach(cat => {
                if (yPosition > 270) { // Nueva página si es necesario
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.text(cat.nombre.substring(0, 25), margin, yPosition);
                doc.text(cat.tipo, margin + 80, yPosition);
                doc.text(this.formatCurrency(cat.monto), margin + 120, yPosition);
                doc.text(`${cat.porcentaje.toFixed(1)}%`, margin + 160, yPosition);
                yPosition += 8;
            });
        }
        
        yPosition += 20;
        
        // RECOMENDACIONES
        if (data.recomendaciones && data.recomendaciones.length > 0) {
            if (yPosition > 200) { // Nueva página si es necesario
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text('💡 RECOMENDACIONES', margin, yPosition);
            yPosition += 15;
            
            doc.setFontSize(12);
            data.recomendaciones.forEach(rec => {
                if (yPosition > 260) { // Nueva página si es necesario
                    doc.addPage();
                    yPosition = 20;
                }
                
                doc.setTextColor(80, 80, 80);
                doc.text(`• ${rec.titulo}`, margin + 5, yPosition);
                yPosition += 8;
                
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                const descripcion = doc.splitTextToSize(rec.descripcion, pageWidth - margin * 2 - 10);
                doc.text(descripcion, margin + 10, yPosition);
                yPosition += descripcion.length * 6;
                
                doc.setFontSize(12);
                yPosition += 5;
            });
        }
        
        // PIE DE PÁGINA
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, doc.internal.pageSize.height - 10);
            doc.text('Generado por Sistema de Gastos Familiares', margin, doc.internal.pageSize.height - 10);
        }
    }

    /**
     * EXPORTACIÓN A EXCEL
     */
    async exportToExcel(reportData = null) {
        try {
            // Mostrar indicador de carga
            this.showExportLoading('Excel');
            
            // Cargar SheetJS si no está disponible
            await this.loadSheetJS();
            
            if (!window.XLSX) {
                throw new Error('SheetJS no está disponible');
            }

            // Obtener datos si no se proporcionan
            if (!reportData) {
                reportData = this.parent.getReportData();
            }

            if (!reportData) {
                throw new Error('No hay datos para exportar');
            }

            // Crear libro de Excel
            const workbook = window.XLSX.utils.book_new();
            
            // Generar hojas
            this.addResumenSheet(workbook, reportData);
            this.addCategoriasSheet(workbook, reportData);
            this.addRecomendacionesSheet(workbook, reportData);
            
            // Generar nombre de archivo
            const fileName = this.generateFileName('reporte-financiero', 'xlsx');
            
            // Descargar archivo
            window.XLSX.writeFile(workbook, fileName);
            
            this.hideExportLoading();
            this.showExportSuccess('Excel', fileName);
            
            console.log(`📊 Reporte Excel exportado: ${fileName}`);
            
        } catch (error) {
            this.hideExportLoading();
            this.showExportError('Excel', error.message);
            console.error('❌ Error exportando Excel:', error);
        }
    }

    /**
     * AGREGAR HOJA DE RESUMEN
     */
    addResumenSheet(workbook, data) {
        const resumen = data.resumen;
        
        const resumenData = [
            ['REPORTE FINANCIERO'],
            ['Fecha:', new Date().toLocaleDateString('es-CL')],
            [''],
            ['RESUMEN GENERAL'],
            ['Concepto', 'Monto'],
            ['Ingresos Totales', resumen.ingresos],
            ['Gastos Totales', resumen.gastos.total],
            ['Balance', resumen.balance],
            ['% Ahorro', `${resumen.porcentajeAhorro}%`],
            ['Eficiencia', resumen.eficienciaFinanciera],
            [''],
            ['DESGLOSE DE GASTOS'],
            ['Tipo', 'Monto'],
            ['Gastos Fijos', resumen.gastos.fijos],
            ['Gastos Variables', resumen.gastos.variables],
            ['Gastos Extras', resumen.gastos.extras]
        ];
        
        const worksheet = window.XLSX.utils.aoa_to_sheet(resumenData);
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Resumen');
    }

    /**
     * AGREGAR HOJA DE CATEGORÍAS
     */
    addCategoriasSheet(workbook, data) {
        if (!data.categorias || data.categorias.length === 0) return;
        
        const categoriasData = [
            ['ANÁLISIS POR CATEGORÍAS'],
            [''],
            ['Categoría', 'Tipo', 'Monto', '% del Total', 'Estado']
        ];
        
        data.categorias.forEach(cat => {
            categoriasData.push([
                cat.nombre,
                cat.tipo,
                cat.monto,
                `${cat.porcentaje.toFixed(1)}%`,
                cat.pagado ? 'Pagado' : 'Pendiente'
            ]);
        });
        
        const worksheet = window.XLSX.utils.aoa_to_sheet(categoriasData);
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Categorías');
    }

    /**
     * AGREGAR HOJA DE RECOMENDACIONES
     */
    addRecomendacionesSheet(workbook, data) {
        if (!data.recomendaciones || data.recomendaciones.length === 0) return;
        
        const recomendacionesData = [
            ['RECOMENDACIONES'],
            [''],
            ['Tipo', 'Título', 'Descripción', 'Acción Sugerida']
        ];
        
        data.recomendaciones.forEach(rec => {
            recomendacionesData.push([
                rec.tipo,
                rec.titulo,
                rec.descripcion,
                rec.accion
            ]);
        });
        
        const worksheet = window.XLSX.utils.aoa_to_sheet(recomendacionesData);
        window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Recomendaciones');
    }

    /**
     * UTILIDADES
     */
    generateFileName(baseName, extension) {
        const fecha = new Date().toISOString().slice(0, 10);
        return `${baseName}-${fecha}.${extension}`;
    }

    formatCurrency(amount) {
        return this.currency ? 
            this.currency.format(amount) :
            `$${amount.toLocaleString('es-CL')}`;
    }

    /**
     * INDICADORES DE PROGRESO
     */
    showExportLoading(type) {
        // TODO: Implementar indicador de carga visual
        console.log(`⏳ Exportando a ${type}...`);
    }

    hideExportLoading() {
        // TODO: Ocultar indicador de carga
        console.log('✅ Exportación completada');
    }

    showExportSuccess(type, fileName) {
        // TODO: Mostrar notificación de éxito
        console.log(`🎉 ${type} exportado exitosamente: ${fileName}`);
        
        // Por ahora, alert simple
        alert(`✅ Archivo ${type} descargado: ${fileName}`);
    }

    showExportError(type, error) {
        // TODO: Mostrar notificación de error
        console.error(`❌ Error exportando ${type}: ${error}`);
        
        // Por ahora, alert simple
        alert(`❌ Error exportando ${type}: ${error}`);
    }

    /**
     * EXPORTACIONES FUTURAS
     */
    exportToCSV(reportData) {
        // TODO: Implementar exportación a CSV
        console.log('📄 Exportación CSV será implementada en v2.1');
    }

    exportToJSON(reportData) {
        // TODO: Implementar exportación a JSON
        console.log('🔧 Exportación JSON será implementada en v2.1');
    }

    /**
     * DESTRUCTOR
     */
    destroy() {
        console.log('🧹 ReportesExport destruido');
    }
}

// Exponer globalmente
window.ReportesExport = ReportesExport;

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReportesExport;
}

console.log('📤 Reportes-export.js cargado - Sistema de exportación listo');