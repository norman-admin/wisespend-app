/**
 * INCOME-TABLE-ENHANCED.JS - Tabla de Ingresos Mejorada
 * Control de Gastos Familiares - Versión 1.0.0
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Renderizado de tabla mejorada de ingresos
 * ✅ Funciones de ordenamiento y filtrado
 * ✅ Gestión de acciones (editar, ver, eliminar)
 * ✅ Cálculo de estadísticas
 * ✅ Eventos interactivos
 */

class IncomeTableEnhanced {
    constructor(gastosManager) {
        this.gastosManager = gastosManager;
        this.storage = gastosManager.storage;
        this.sortDirection = {};
        this.currentFilter = '';
        
        console.log('📊 IncomeTableEnhanced inicializado');
    }

    /**
     * 🎨 RENDERIZAR SECCIÓN DE INGRESOS MEJORADA
     */
    renderIncomeSection(container) {
        const ingresos = this.storage.getIngresos();
        
        const html = `
            <section class="content-section active">
                <div class="income-header-enhanced">
                    <div class="header-content">
                        <h2 class="income-title">💰 Desglose de Ingresos</h2>
                        </div>
                    <div class="header-controls">
                        <div class="search-container">
                            <input type="text" 
                                   id="income-search" 
                                   class="search-input" 
                                   placeholder="🔍 Buscar fuente..."
                                   onkeyup="window.incomeTableEnhanced.filterIncomes(this.value)">
                        </div>
                        <button class="btn-add-income" onclick="gastosManager.showAddIncomeModal()">
                            ➕ Agregar Ingreso
                        </button>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="income-table-enhanced">
                        <thead>
                            <tr>
                                <th class="sortable" onclick="window.incomeTableEnhanced.sortIncomes('fuente')">
                                    📝 Fuente de Ingresos 
                                    <span class="sort-indicator" data-column="fuente">↕️</span>
                                </th>
                                <th class="sortable amount-col" onclick="window.incomeTableEnhanced.sortIncomes('monto')">
                                    💰 Monto 
                                    <span class="sort-indicator" data-column="monto">↕️</span>
                                </th>
                                <th class="percentage-col">
                                    📊 % del Total
                                </th>
                                <th class="actions-col">⚡ Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="income-table-body">
                            ${this.generateIncomeRows(ingresos)}
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td><strong>📊 Total Ingresos</strong></td>
                                <td class="total-amount"><strong>${this.gastosManager.formatNumber(ingresos.total)}</strong></td>
                                <td><strong>100%</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="income-stats-bar">
                    <div class="stats-item">
                        <span class="stats-icon">📈</span>
                        <span class="stats-label">Promedio:</span>
                        <span class="stats-value">${this.gastosManager.formatNumber(this.calculateAverage(ingresos.desglose))}</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-icon">🏆</span>
                        <span class="stats-label">Mayor:</span>
                        <span class="stats-value">${this.gastosManager.formatNumber(this.getHighestIncome(ingresos.desglose))}</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-icon">🎯</span>
                        <span class="stats-label">Fuentes activas:</span>
                        <span class="stats-value">${ingresos.desglose.length}</span>
                    </div>
                    <div class="stats-item" id="filter-results">
                        <span class="stats-icon">🔍</span>
                        <span class="stats-label">Mostrando:</span>
                        <span class="stats-value">${ingresos.desglose.length} de ${ingresos.desglose.length} ingresos</span>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
       
        // Activar menú contextual y edición inline
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.refresh();
            }
            
            // 🆕 CONECTAR EVENTOS DE MENÚ CONTEXTUAL Y EDICIÓN INLINE
            this.setupTableEvents();
        }, 100);
    }

    /**
     * 📋 GENERAR FILAS DE LA TABLA
     */
    generateIncomeRows(ingresos) {
        if (!ingresos.desglose || ingresos.desglose.length === 0) {
            return `
                <tr class="empty-row">
                    <td colspan="4" class="empty-message">
                        <div class="empty-content">
                            <span class="empty-icon">📊</span>
                            <span class="empty-text">No hay ingresos registrados</span>
                            <button class="btn-add-first" onclick="gastosManager.showAddIncomeModal()">
                                Agregar primer ingreso
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        return ingresos.desglose.map(item => {
            // Asegurar que el item tenga ID
            if (!item.id) {
                item.id = Utils.id.generate('income');
            }
            
            const percentage = ((item.monto / ingresos.total) * 100).toFixed(1);
            const isActive = item.activo !== false;
            
            return `
                <tr class="income-row ${!isActive ? 'inactive' : ''}" data-id="${item.id}">
                    <td class="source-cell">
                        <div class="source-content breakdown-item" data-id="${item.id}">
                            <span class="source-name breakdown-name">${item.fuente}</span>
                            ${!isActive ? '<span class="status-badge inactive">Inactivo</span>' : ''}
                        </div>
                    </td>
                    <td class="amount-cell">
                        <div class="breakdown-item" data-id="${item.id}">
                            <span class="amount-value breakdown-amount">${this.gastosManager.formatNumber(item.monto)}</span>
                        </div>
                    </td>
                    <td class="percentage-cell">
                        <div class="percentage-container">
                            <div class="progress-bar">
                                <div class="progress-fill ${this.getProgressClass(percentage)}" 
                                     style="width: ${percentage}%"></div>
                            </div>
                            <span class="percentage-text">${percentage}%</span>
                        </div>
                    </td>
                    <td class="actions-cell">
                        <div class="action-buttons">
                            <button class="action-btn btn-edit" 
                                    onclick="window.incomeTableEnhanced.editIncome('${item.id}')" 
                                    title="Editar">
                                ✏️
                            </button>
                            <button class="action-btn btn-delete" 
                                    onclick="window.incomeTableEnhanced.deleteIncome('${item.id}')" 
                                    title="Eliminar">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * 📊 FUNCIONES DE CÁLCULO
     */
    getProgressClass(percentage) {
        if (percentage >= 30) return 'progress-high';
        if (percentage >= 10) return 'progress-medium';
        return 'progress-low';
    }

    calculateAverage(ingresos) {
        if (!ingresos || ingresos.length === 0) return 0;
        const total = ingresos.reduce((sum, item) => sum + (item.monto || 0), 0);
        return total / ingresos.length;
    }

    getHighestIncome(ingresos) {
        if (!ingresos || ingresos.length === 0) return 0;
        return Math.max(...ingresos.map(item => item.monto || 0));
    }

    /**
     * 🔍 FILTRAR INGRESOS EN TIEMPO REAL
     */
    filterIncomes(searchTerm) {
        this.currentFilter = searchTerm.toLowerCase();
        const rows = document.querySelectorAll('.income-row');
        let visibleCount = 0;
        
        rows.forEach(row => {
            const sourceName = row.querySelector('.source-name').textContent.toLowerCase();
            const isVisible = sourceName.includes(this.currentFilter);
            
            row.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });
        
        // Actualizar contador de resultados
        const filterResults = document.getElementById('filter-results');
        if (filterResults) {
            const totalRows = rows.length;
            filterResults.querySelector('.stats-value').textContent = 
                `${visibleCount} de ${totalRows} ingresos`;
        }
    }

    /**
     * 🔄 ORDENAR INGRESOS POR COLUMNA
     */
    sortIncomes(column) {
        // Alternar dirección de ordenamiento
        this.sortDirection[column] = this.sortDirection[column] === 'asc' ? 'desc' : 'asc';
        const direction = this.sortDirection[column];
        
        // Actualizar indicador visual
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '↕️';
        });
        
        const currentIndicator = document.querySelector(`[data-column="${column}"]`);
        if (currentIndicator) {
            currentIndicator.textContent = direction === 'asc' ? '⬆️' : '⬇️';
        }
        
        // Obtener y ordenar datos
        const ingresos = this.storage.getIngresos();
        
        ingresos.desglose.sort((a, b) => {
            let valueA, valueB;
            
            if (column === 'monto') {
                valueA = a.monto || 0;
                valueB = b.monto || 0;
            } else if (column === 'fuente') {
                valueA = (a.fuente || '').toLowerCase();
                valueB = (b.fuente || '').toLowerCase();
            }
            
            if (direction === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
        
        // Re-renderizar tabla
        this.storage.setIngresos(ingresos);
        this.renderIncomeSection(this.gastosManager.getMainContainer());
        
        // Replicar filtro actual si existe
        if (this.currentFilter) {
            document.getElementById('income-search').value = this.currentFilter;
            this.filterIncomes(this.currentFilter);
        }
    }

    /**
     * ⚡ ACCIONES DE LA TABLA
     */
    editIncome(id) {
        const ingresos = this.storage.getIngresos();
        const income = ingresos.desglose.find(item => item.id === id);
        
        if (!income) {
            window.modalSystem.showMessage('Ingreso no encontrado', 'error');
            return;
        }

        // Modal de edición
        window.modalSystem.form({
            title: 'Editar Ingreso',
            submitText: 'Actualizar',
            fields: [
                {
                    type: 'text',
                    name: 'fuente',
                    label: 'Fuente de Ingresos',
                    required: true,
                    value: income.fuente,
                    placeholder: 'Ej: Sueldo, Freelance, etc.'
                },
                {
                    type: 'number',
                    name: 'monto',
                    label: 'Monto Mensual',
                    required: true,
                    value: income.monto,
                    placeholder: '0'
                }
            ]
        }).then(data => {
            if (data) {
                // Actualizar el ingreso
                income.fuente = data.fuente;
                income.monto = parseInt(data.monto) || 0;
                
                // Recalcular total
                ingresos.total = ingresos.desglose.reduce((total, item) => total + (item.monto || 0), 0);
                
                // Guardar y refrescar
                this.storage.setIngresos(ingresos);
                this.renderIncomeSection(this.gastosManager.getMainContainer());
                this.gastosManager.updateHeaderTotals();
                
                window.modalSystem.showMessage('Ingreso actualizado correctamente', 'success');
            }
        });
    }

    viewIncomeDetails(id) {
        const ingresos = this.storage.getIngresos();
        const income = ingresos.desglose.find(item => item.id === id);
        
        if (!income) {
            window.modalSystem.showMessage('Ingreso no encontrado', 'error');
            return;
        }
        
        const percentage = ((income.monto / ingresos.total) * 100).toFixed(1);
        
        // Modal de detalles
        window.modalSystem.showMessage(
            `<div style="text-align: left;">
                <h3 style="margin-bottom: 12px; color: #059669;">📊 Detalles del Ingreso</h3>
                <p><strong>Fuente:</strong> ${income.fuente}</p>
                <p><strong>Monto:</strong> ${this.gastosManager.formatNumber(income.monto)}</p>
                <p><strong>Porcentaje del total:</strong> ${percentage}%</p>
                <p><strong>Estado:</strong> ${income.activo !== false ? 'Activo' : 'Inactivo'}</p>
                <p><strong>Fecha de creación:</strong> ${income.fechaCreacion || 'No disponible'}</p>
                <p><strong>ID:</strong> ${income.id}</p>
            </div>`,
            'info'
        );
    }

    deleteIncome(id) {
        const ingresos = this.storage.getIngresos();
        const income = ingresos.desglose.find(item => item.id === id);
        
        if (!income) {
            window.modalSystem.showMessage('Ingreso no encontrado', 'error');
            return;
        }

        // Confirmación
        window.modalSystem.confirm(
            `¿Estás seguro de que quieres eliminar "${income.fuente}"?`,
            'Esta acción no se puede deshacer.'
        ).then(confirmed => {
            if (confirmed) {
                // Eliminar del array
                ingresos.desglose = ingresos.desglose.filter(item => item.id !== id);
                ingresos.total = ingresos.desglose.reduce((total, item) => total + (item.monto || 0), 0);
                
                // Guardar y refrescar
                this.storage.setIngresos(ingresos);
                this.renderIncomeSection(this.gastosManager.getMainContainer());
                this.gastosManager.updateHeaderTotals();
                
                window.modalSystem.showMessage('Ingreso eliminado correctamente', 'success');
            }
        });
    }

    /**
     * 🆕 CONFIGURAR EVENTOS DE TABLA (MENÚ CONTEXTUAL + EDICIÓN INLINE)
     */
    setupTableEvents() {
        const tableBody = document.getElementById('income-table-body');
        if (!tableBody) return;

        // Menú contextual (click derecho)
        tableBody.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const row = e.target.closest('.income-row');
            if (!row) return;
            
            const itemId = row.dataset.id;
            if (itemId && window.contextualManager) {
                window.contextualManager.showContextMenu(e, 'income', itemId, row);
            }
        });

        console.log('✅ Eventos de tabla configurados - Menú contextual y edición inline activos');
    }
    }

// Crear instancia global
if (typeof window !== 'undefined') {
    window.IncomeTableEnhanced = IncomeTableEnhanced;
    console.log('📊 IncomeTableEnhanced disponible globalmente');
}
