/**
 * 📊 TABLE-FILTER.JS - Sistema de Filtros Tipo Excel
 * Control de Gastos Familiares - Versión 1.0.0
 * 
 * 🎯 CARACTERÍSTICAS:
 * ✅ Filtros dropdown por columna
 * ✅ Búsqueda por texto
 * ✅ Filtro de rangos numéricos
 * ✅ Ordenamiento avanzado
 * ✅ Filtros combinados
 * ✅ Reset y clear filters
 */

class TableFilter {
    constructor(tableId, options = {}) {
        this.tableId = tableId;
        this.table = null;
        this.originalData = [];
        this.filteredData = [];
        this.currentFilters = {};
        this.sortState = { column: null, direction: 'asc' };
        
        // Configuración
        this.options = {
            enableSearch: true,
            enableSort: true,
            enableDropdowns: true,
            enableRangeFilters: true,
            searchPlaceholder: 'Buscar...',
            ...options
        };
        
        console.log('🔍 TableFilter inicializado para:', tableId);
    }

    /**
     * 🚀 INICIALIZACIÓN
     */
    init() {
        this.table = document.getElementById(this.tableId);
        if (!this.table) {
            console.error('❌ Tabla no encontrada:', this.tableId);
            return;
        }

        this.extractOriginalData();
        this.injectFilterControls();
        this.setupEventListeners();
        
        
        // ✅ AGREGAR AL FINAL de la función init():
    console.log('✅ TableFilter inicializado correctamente');
    console.log('🔍 Verificando estructura:');
    console.log('📊 Tabla encontrada:', this.table);
    console.log('📋 Headers encontrados:', this.table.querySelectorAll('.sortable-header'));
    console.log('🎯 Event listeners configurados');
    }

    /**
     * 📊 EXTRAER DATOS ORIGINALES
     */
    extractOriginalData() {
        const tbody = this.table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        
        this.originalData = Array.from(rows).map((row, index) => {
            const cells = row.querySelectorAll('td');
            return {
                index,
                element: row,
                data: {
                    categoria: cells[0]?.textContent.trim() || '',
                    tipo: cells[1]?.textContent.trim() || '',
                    monto: this.parseAmount(cells[2]?.textContent.trim() || '0'),
                    porcentaje: this.parsePercentage(cells[3]?.textContent.trim() || '0%'),
                    estado: cells[4]?.textContent.trim() || ''
                }
            };
        });
        
        this.filteredData = [...this.originalData];
        console.log('📊 Datos extraídos:', this.originalData.length, 'filas');
    }

    /**
     * 💉 INYECTAR CONTROLES DE FILTRO
     */
    injectFilterControls() {
        const thead = this.table.querySelector('thead');
        const headerRow = thead.querySelector('tr');
        
        // Crear fila de filtros
        const filterRow = document.createElement('tr');
        filterRow.className = 'filter-row';
        
        // Headers y sus tipos de filtro
        const columns = [
            { key: 'categoria', type: 'text', placeholder: 'Buscar categoría...' },
            { key: 'tipo', type: 'dropdown', options: ['Fijos', 'Variables', 'Extras'] },
            { key: 'monto', type: 'range', placeholder: 'Min - Max' },
            { key: 'porcentaje', type: 'range', placeholder: '% Min - Max' },
            { key: 'estado', type: 'dropdown', options: ['Pagado', 'Pendiente'] }
        ];

        columns.forEach((column, index) => {
            const filterCell = document.createElement('th');
            filterCell.className = 'filter-cell';
            
            if (column.type === 'text') {
                filterCell.innerHTML = this.createTextFilter(column.key, column.placeholder);
            } else if (column.type === 'dropdown') {
                filterCell.innerHTML = this.createDropdownFilter(column.key, column.options);
            } else if (column.type === 'range') {
                filterCell.innerHTML = this.createRangeFilter(column.key, column.placeholder);
            }
            
            filterRow.appendChild(filterCell);
        });
        
        // Insertar después del header principal
        headerRow.insertAdjacentElement('afterend', filterRow);
        
        // Añadir iconos de ordenamiento al header principal
        this.addSortIcons(headerRow);
    }

    /**
     * 📝 CREAR FILTRO DE TEXTO
     */
    createTextFilter(key, placeholder) {
        return `
            <div class="filter-container">
                <input 
                    type="text" 
                    class="filter-input text-filter" 
                    data-column="${key}"
                    placeholder="${placeholder}"
                    autocomplete="off"
                >
                <span class="filter-icon">🔍</span>
            </div>
        `;
    }

    /**
     * 📋 CREAR FILTRO DROPDOWN
     */
    createDropdownFilter(key, options) {
        const optionsHTML = options.map(option => 
            `<option value="${option.toLowerCase()}">${option}</option>`
        ).join('');
        
        return `
            <div class="filter-container">
                <select class="filter-select dropdown-filter" data-column="${key}">
                    <option value="">Todos</option>
                    ${optionsHTML}
                </select>
                <span class="filter-icon">▼</span>
            </div>
        `;
    }

    /**
     * 📊 CREAR FILTRO DE RANGO
     */
    createRangeFilter(key, placeholder) {
        return `
            <div class="filter-container range-container">
                <input 
                    type="number" 
                    class="filter-input range-filter range-min" 
                    data-column="${key}"
                    data-range="min"
                    placeholder="Mín"
                    step="0.01"
                >
                <span class="range-separator">-</span>
                <input 
                    type="number" 
                    class="filter-input range-filter range-max" 
                    data-column="${key}"
                    data-range="max"
                    placeholder="Máx"
                    step="0.01"
                >
                <span class="filter-icon">📊</span>
            </div>
        `;
    }

    /**
     * 🔄 AÑADIR ICONOS DE ORDENAMIENTO
     */
    addSortIcons(headerRow) {
    // Iconos de ordenamiento deshabilitados
    // Solo mantenemos los filtros de abajo que funcionan perfectamente
    console.log('🎯 Headers sin iconos de ordenamiento - Filtros activos');
}

    /**
     * 🎮 CONFIGURAR EVENT LISTENERS
     */
    setupEventListeners() {
        console.log('🎮 Configurando event listeners...');
        // Filtros de texto
        this.table.addEventListener('input', (e) => {
            if (e.target.classList.contains('text-filter') || e.target.classList.contains('range-filter')) {
                this.handleFilterChange(e.target);
            }
        });

        // Filtros dropdown
        this.table.addEventListener('change', (e) => {
            if (e.target.classList.contains('dropdown-filter')) {
                this.handleFilterChange(e.target);
            }
        });

        // Ordenamiento
        this.table.addEventListener('click', (e) => {
            if (e.target.closest('.sortable-header') || e.target.classList.contains('sort-icon')) {
                this.handleSort(e.target.closest('.sortable-header'));
            }
        });

        // Debounce para filtros de texto
        this.debounceTimer = null;
    }

    /**
     * 🔄 MANEJAR CAMBIOS DE FILTRO
     */
    handleFilterChange(input) {
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(() => {
            const column = input.dataset.column;
            const value = input.value.toLowerCase().trim();
            
            if (input.classList.contains('range-filter')) {
                this.updateRangeFilter(column, input);
            } else {
                this.currentFilters[column] = value;
            }
            
            this.applyFilters();
        }, 300); // Debounce de 300ms
    }

    /**
     * 📊 ACTUALIZAR FILTRO DE RANGO
     */
    updateRangeFilter(column, input) {
        const rangeType = input.dataset.range;
        const value = parseFloat(input.value) || (rangeType === 'min' ? 0 : Infinity);
        
        if (!this.currentFilters[column]) {
            this.currentFilters[column] = { min: 0, max: Infinity };
        }
        
        this.currentFilters[column][rangeType] = value;
    }

    /**
     * 🔄 MANEJAR ORDENAMIENTO
     */
    handleSort(header) {
        const column = header.dataset.column;
        
        // Cambiar dirección
        if (this.sortState.column === column) {
            this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortState.column = column;
            this.sortState.direction = 'asc';
        }
        
        this.updateSortIcons(header);
        this.applySorting();
    }

    /**
     * 🎯 ACTUALIZAR ICONOS DE ORDENAMIENTO
     */
    updateSortIcons(activeHeader) {
        // Limpiar todos los iconos
        this.table.querySelectorAll('.sort-icon').forEach(icon => {
            icon.textContent = '⚪';
        });
        
        // Actualizar icono activo
        const sortIcon = activeHeader.querySelector('.sort-icon');
        sortIcon.textContent = this.sortState.direction === 'asc' ? '🔼' : '🔽';
    }

    /**
     * ✨ APLICAR FILTROS
     */
    applyFilters() {
        this.filteredData = this.originalData.filter(row => {
            const data = row.data;
            
            // Filtro de categoría (texto)
            if (this.currentFilters.categoria && 
                !data.categoria.toLowerCase().includes(this.currentFilters.categoria)) {
                return false;
            }
            
            // Filtro de tipo (dropdown)
            if (this.currentFilters.tipo && 
                data.tipo.toLowerCase() !== this.currentFilters.tipo) {
                return false;
            }
            
            // Filtro de estado (dropdown)
            if (this.currentFilters.estado) {
                const estadoFilter = this.currentFilters.estado;
                const estadoValue = data.estado.toLowerCase().includes('pagado') ? 'pagado' : 'pendiente';
                if (estadoValue !== estadoFilter) {
                    return false;
                }
            }
            
            // Filtro de monto (rango)
            if (this.currentFilters.monto) {
                const { min, max } = this.currentFilters.monto;
                if (data.monto < min || data.monto > max) {
                    return false;
                }
            }
            
            // Filtro de porcentaje (rango)
            if (this.currentFilters.porcentaje) {
                const { min, max } = this.currentFilters.porcentaje;
                if (data.porcentaje < min || data.porcentaje > max) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.applySorting();
        this.renderFilteredData();
        this.updateFilterStats();
    }

    /**
     * 🔄 APLICAR ORDENAMIENTO
     */
    applySorting() {
        if (!this.sortState.column) return;
        
        this.filteredData.sort((a, b) => {
            const columnA = a.data[this.sortState.column];
            const columnB = b.data[this.sortState.column];
            
            let comparison = 0;
            
            if (typeof columnA === 'number' && typeof columnB === 'number') {
                comparison = columnA - columnB;
            } else {
                comparison = columnA.toString().localeCompare(columnB.toString());
            }
            
            return this.sortState.direction === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * 🎨 RENDERIZAR DATOS FILTRADOS
     */
    renderFilteredData() {
        const tbody = this.table.querySelector('tbody');
        
        // Limpiar tabla
        tbody.innerHTML = '';
        
        // Agregar filas filtradas
        this.filteredData.forEach(row => {
            tbody.appendChild(row.element.cloneNode(true));
        });
        
        // Mostrar mensaje si no hay resultados
        if (this.filteredData.length === 0) {
            tbody.innerHTML = `
                <tr class="no-results">
                    <td colspan="5" class="no-results-cell">
                        <div class="no-results-content">
                            <span class="no-results-icon">🔍</span>
                            <span class="no-results-text">No se encontraron resultados</span>
                            <button class="clear-filters-btn" onclick="tableFilter.clearAllFilters()">
                                Limpiar filtros
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    /**
     * 📊 ACTUALIZAR ESTADÍSTICAS DE FILTROS
     */
    updateFilterStats() {
        const totalRows = this.originalData.length;
        const filteredRows = this.filteredData.length;
        
        // Buscar o crear área de estadísticas
        let statsArea = document.querySelector('.filter-stats');
        if (!statsArea) {
            statsArea = document.createElement('div');
            statsArea.className = 'filter-stats';
            this.table.parentNode.insertBefore(statsArea, this.table.nextSibling);
        }
        
        statsArea.innerHTML = `
            <div class="stats-content">
                <span class="stats-text">
                    Mostrando ${filteredRows} de ${totalRows} categorías
                </span>
                ${filteredRows !== totalRows ? `
                    <button class="clear-filters-btn" onclick="tableFilter.clearAllFilters()">
                        🔄 Limpiar filtros
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * 🧹 LIMPIAR TODOS LOS FILTROS
     */
    clearAllFilters() {
        // Limpiar filtros internos
        this.currentFilters = {};
        this.sortState = { column: null, direction: 'asc' };
        
        // Limpiar inputs
        this.table.querySelectorAll('.filter-input').forEach(input => {
            input.value = '';
        });
        
        this.table.querySelectorAll('.filter-select').forEach(select => {
            select.value = '';
        });
        
        // Limpiar iconos de ordenamiento
        this.table.querySelectorAll('.sort-icon').forEach(icon => {
            icon.textContent = '⚪';
        });
        
        // Restaurar datos originales
        this.filteredData = [...this.originalData];
        this.renderFilteredData();
        this.updateFilterStats();
        
        console.log('🧹 Filtros limpiados');
    }

    /**
     * 🔧 UTILIDADES
     */
    parseAmount(amountStr) {
        // Convertir $1.234.567 a número
        return parseFloat(amountStr.replace(/[$,.\s]/g, '')) || 0;
    }

    parsePercentage(percentStr) {
        // Convertir 15.3% a número
        return parseFloat(percentStr.replace('%', '')) || 0;
    }

    /**
     * 📊 OBTENER DATOS FILTRADOS (para exportar)
     */
    getFilteredData() {
        return this.filteredData.map(row => row.data);
    }

    /**
     * 🔄 ACTUALIZAR DATOS (cuando cambie la tabla)
     */
    refreshData() {
        this.extractOriginalData();
        this.applyFilters();
        console.log('🔄 Datos del filtro actualizados');
    }
}

// ===== FUNCIONES GLOBALES =====

/**
 * 🚀 Inicializar filtro para tabla de categorías
 */
function initCategoriesTableFilter() {
    const tableId = 'categories-table';
    
    // Verificar que la tabla existe
    const table = document.getElementById(tableId);
    if (!table) {
        console.warn('⚠️ Tabla de categorías no encontrada');
        return null;
    }
    
    // Crear instancia del filtro
    window.tableFilter = new TableFilter(tableId, {
        enableSearch: true,
        enableSort: true,
        enableDropdowns: true,
        enableRangeFilters: true
    });
    
    // Inicializar
    window.tableFilter.init();
    
    console.log('✅ Filtro de tabla de categorías inicializado');
    return window.tableFilter;
}

/**
 * 📊 Exportar solo datos filtrados
 */
function exportFilteredData(format = 'csv') {
    if (!window.tableFilter) {
        console.error('❌ Filtro no inicializado');
        return;
    }
    
    const filteredData = window.tableFilter.getFilteredData();
    
    if (format === 'csv') {
        const csv = convertToCSV(filteredData);
        downloadFile(csv, 'categorias-filtradas.csv', 'text/csv');
    } else if (format === 'json') {
        const json = JSON.stringify(filteredData, null, 2);
        downloadFile(json, 'categorias-filtradas.json', 'application/json');
    }
}

/**
 * 🔧 UTILIDADES DE EXPORTACIÓN
 */
function convertToCSV(data) {
    const headers = ['Categoría', 'Tipo', 'Monto', '% del Total', 'Estado'];
    const csvContent = [
        headers.join(','),
        ...data.map(row => [
            `"${row.categoria}"`,
            `"${row.tipo}"`,
            row.monto,
            row.porcentaje,
            `"${row.estado}"`
        ].join(','))
    ].join('\n');
    
    return csvContent;
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
}

// ===== AUTO-INICIALIZACIÓN =====

// Inicializar cuando el DOM esté listo y la tabla exista
document.addEventListener('DOMContentLoaded', () => {
    // Intentar inicializar con un pequeño delay
    setTimeout(() => {
        if (document.getElementById('categories-table')) {
            initCategoriesTableFilter();
        }
    }, 500);
});

// También escuchar cambios dinámicos del contenido
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            const addedNodes = Array.from(mutation.addedNodes);
            const hasTable = addedNodes.some(node => 
                node.nodeType === 1 && 
                (node.id === 'categories-table' || node.querySelector('#categories-table'))
            );
            
            if (hasTable) {
                setTimeout(() => {
                    initCategoriesTableFilter();
                }, 100);
            }
        }
    });
});

// Observar cambios en el contenedor principal
if (document.getElementById('dynamic-content')) {
    observer.observe(document.getElementById('dynamic-content'), {
        childList: true,
        subtree: true
    });
}

/**
 * 📚 API PÚBLICA
 * 
 * Funciones disponibles globalmente:
 * - initCategoriesTableFilter() - Inicializar filtro
 * - exportFilteredData('csv') - Exportar datos filtrados
 * - tableFilter.clearAllFilters() - Limpiar filtros
 * - tableFilter.getFilteredData() - Obtener datos filtrados
 * - tableFilter.refreshData() - Actualizar datos
 */