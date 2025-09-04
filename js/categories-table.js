/**
 * CATEGORIES-TABLE.JS - Funcionalidades de Tabla de Categorías
 * Control de Gastos Familiares - Sistema Modular v2.1.0
 */

// Variables globales para la tabla de categorías
let originalCategoriesRows = [];
let currentCategoriesSort = { column: 0, direction: 'asc' };

/**
 * INICIALIZAR TABLA DE CATEGORÍAS
 */
function initCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    
    // Guardar filas originales
    originalCategoriesRows = Array.from(tbody.querySelectorAll('tr'));
    
    // Event listeners
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterCategoriesTable);
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', filterCategoriesTable);
    }
    
    // Auto-foco SEGURO en campo de búsqueda
    const searchInputFocus = document.getElementById('searchInput');
    if (searchInputFocus) {
        // Usar requestAnimationFrame para evitar conflictos de scroll
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                try {
                    searchInputFocus.focus({ 
                        preventScroll: true,
                        focusVisible: false 
                    });
                } catch (e) {
                    // Fallback silencioso
                    searchInputFocus.focus();
                }
            });
        });
    }
    
    console.log('✅ Tabla de categorías inicializada');
}

/**
 * FILTRAR TABLA DE CATEGORÍAS
 */
function filterCategoriesTable() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const tbody = document.getElementById('categoriesTableBody');
    
    if (!searchInput || !typeFilter || !tbody) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const typeFilterValue = typeFilter.value;
    
    let visibleRows = originalCategoriesRows.filter(row => {
        // Skip si es estado vacío
        if (row.querySelector('.empty-state')) return false;
        
        const categoryNameElement = row.querySelector('.category-name span:last-child');
        const categoryName = categoryNameElement ? categoryNameElement.textContent.toLowerCase() : '';
        const categoryType = row.getAttribute('data-type');
        
        const matchesSearch = !searchTerm || categoryName.includes(searchTerm);
        const matchesType = !typeFilterValue || categoryType === typeFilterValue;
        
        return matchesSearch && matchesType;
    });
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (visibleRows.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <div class="empty-state-text">No se encontraron categorías</div>
                    <div class="empty-state-subtext">Intenta con otros filtros</div>
                </td>
            </tr>
        `;
    } else {
        // Re-numerar filas y agregar
        visibleRows.forEach((row, index) => {
            const clonedRow = row.cloneNode(true);
            const rank = clonedRow.querySelector('.category-rank');
            if (rank) {
                rank.textContent = `#${index + 1}`;
            }
            tbody.appendChild(clonedRow);
        });
    }
    
    console.log(`🔍 Filtros aplicados: ${visibleRows.length} categorías mostradas`);
}

/**
 * ORDENAR TABLA DE CATEGORÍAS
 */
function sortCategoriesTable(columnIndex) {
    const thead = document.querySelector('.categories-table thead');
    if (!thead) return;
    
    const ths = thead.querySelectorAll('th');
    
    // Remover clases de orden anterior
    ths.forEach(th => th.classList.remove('sorted', 'asc'));
    
    // Determinar dirección
    if (currentCategoriesSort.column === columnIndex) {
        currentCategoriesSort.direction = currentCategoriesSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentCategoriesSort.direction = 'asc';
    }
    currentCategoriesSort.column = columnIndex;
    
    // Agregar clase al header actual
    const currentTh = ths[columnIndex];
    if (currentTh) {
        currentTh.classList.add('sorted');
        if (currentCategoriesSort.direction === 'asc') {
            currentTh.classList.add('asc');
        }
    }
    
    // Ordenar filas
    originalCategoriesRows.sort((a, b) => {
        // Skip filas de estado vacío
        if (a.querySelector('.empty-state') || b.querySelector('.empty-state')) return 0;
        
        let aVal, bVal;
        
        try {
            switch (columnIndex) {
                case 0: // Rank
                    const aRank = a.querySelector('.category-rank');
                    const bRank = b.querySelector('.category-rank');
                    aVal = aRank ? parseInt(aRank.textContent.replace('#', '')) : 0;
                    bVal = bRank ? parseInt(bRank.textContent.replace('#', '')) : 0;
                    break;
                    
                case 1: // Nombre
                    const aName = a.querySelector('.category-name span:last-child');
                    const bName = b.querySelector('.category-name span:last-child');
                    aVal = aName ? aName.textContent.toLowerCase() : '';
                    bVal = bName ? bName.textContent.toLowerCase() : '';
                    break;
                    
                case 2: // Tipo
                    aVal = a.getAttribute('data-type') || '';
                    bVal = b.getAttribute('data-type') || '';
                    break;
                    
                case 3: // Monto
                    const aAmount = a.querySelector('.category-amount');
                    const bAmount = b.querySelector('.category-amount');
                    aVal = aAmount ? parseInt(aAmount.textContent.replace(/[$.,]/g, '')) : 0;
                    bVal = bAmount ? parseInt(bAmount.textContent.replace(/[$.,]/g, '')) : 0;
                    break;
                    
                case 4: // Porcentaje
                    const aPerc = a.querySelector('.category-percentage');
                    const bPerc = b.querySelector('.category-percentage');
                    aVal = aPerc ? parseFloat(aPerc.textContent.replace('%', '')) : 0;
                    bVal = bPerc ? parseFloat(bPerc.textContent.replace('%', '')) : 0;
                    break;
                    
                default:
                    return 0;
            }
            
            // Comparar valores
            if (typeof aVal === 'string') {
                return currentCategoriesSort.direction === 'asc' ? 
                    aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return currentCategoriesSort.direction === 'asc' ? 
                    aVal - bVal : bVal - aVal;
            }
            
        } catch (error) {
            console.warn('Error ordenando columna:', columnIndex, error);
            return 0;
        }
    });
    
    // Aplicar filtros después del ordenamiento
    filterCategoriesTable();
    
    console.log(`📊 Tabla ordenada por columna ${columnIndex} (${currentCategoriesSort.direction})`);
}

/**
 * LIMPIAR TODOS LOS FILTROS
 */
function clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    
    if (searchInput) searchInput.value = '';
    if (typeFilter) typeFilter.value = '';
    
    // Resetear ordenamiento
    currentCategoriesSort = { column: 0, direction: 'asc' };
    
    // Remover clases de ordenamiento
    const thead = document.querySelector('.categories-table thead');
    if (thead) {
        const ths = thead.querySelectorAll('th');
        ths.forEach(th => th.classList.remove('sorted', 'asc'));
    }
    
    filterCategoriesTable();
    
    console.log('🔄 Filtros limpiados');
}

// Auto-inicializar cuando se cargue el contenido
document.addEventListener('DOMContentLoaded', function() {
    // Intentar inicializar con delay para asegurar que el DOM esté listo
    // Auto-inicialización deshabilitada para evitar scroll
// setTimeout(initCategoriesTable, 500);
});

// También exportar función para inicialización manual
window.initCategoriesTable = initCategoriesTable;
window.filterCategoriesTable = filterCategoriesTable;
window.sortCategoriesTable = sortCategoriesTable;
window.clearAllFilters = clearAllFilters;

console.log('📄 categories-table.js v1.0.0 cargado');