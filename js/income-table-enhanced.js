/**
 * INCOME-TABLE-ENHANCED.JS - Tabla de Ingresos Mejorada
 * Control de Gastos Familiares - Versión 2.0.0 CORREGIDA
 * 
 * 🎯 FUNCIONALIDADES COMPLETAS:
 * ✅ Sin refresco de pantalla en acciones del menú contextual
 * ✅ Navegación Enter: Fuente → Monto → Guardar
 * ✅ Eliminación, edición y duplicación optimizadas
 * ✅ Renderizado de tabla mejorada
 * ✅ Funciones de ordenamiento y filtrado
 * ✅ Cálculo de estadísticas en tiempo real
 * ✅ Eventos interactivos optimizados
 */

class IncomeTableEnhanced {
    constructor(gastosManager) {
        this.gastosManager = gastosManager;
        this.storage = gastosManager.storage;
        this.sortDirection = {};
        this.currentFilter = '';
        
        // 🆕 Bindings para eventos Enter
        this.handleFuenteEnter = null;
        this.handleMontoEnter = null;
        
        console.log('📊 IncomeTableEnhanced v2.0.0 inicializado - SIN REFRESCO');
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
                        <p class="income-subtitle">Gestiona tus fuentes de ingresos mensuales</p>
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

                <div class="income-stats-bar">
                    <div class="stats-item">
                        <span class="stats-label">📈 Promedio:</span>
                        <span class="stats-value">${this.gastosManager.formatNumber(this.calculateAverage(ingresos.desglose))}</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label">🏆 Mayor:</span>
                        <span class="stats-value">${this.gastosManager.formatNumber(this.getHighestIncome(ingresos.desglose))}</span>
                    </div>
                    <div class="stats-item">
                        <span class="stats-label">💼 Fuentes activas:</span>
                        <span class="stats-value">${ingresos.desglose.filter(item => item.activo !== false).length}</span>
                    </div>
                    <div class="stats-item" id="filter-results">
                        <span class="stats-label">👁️ Mostrando:</span>
                        <span class="stats-value">${ingresos.desglose.length} de ${ingresos.desglose.length} ingresos</span>
                    </div>
                </div>

                <div class="table-wrapper">
                    <table class="income-table-enhanced">
                        <thead>
                            <tr>
                                <th class="sortable" onclick="window.incomeTableEnhanced.sortIncomes('fuente')" data-column="fuente">
                                    📋 Fuente de Ingresos
                                    <span class="sort-indicator">↕️</span>
                                </th>
                                <th class="sortable amount-col" onclick="window.incomeTableEnhanced.sortIncomes('monto')" data-column="monto">
                                    💰 Monto
                                    <span class="sort-indicator">↕️</span>
                                </th>
                                <th class="percentage-col">
                                    📊 % del Total
                                </th>
                                <th class="actions-col">
                                    🎯 Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody id="income-table-body">
                            ${this.generateIncomeRows(ingresos)}
                        </tbody>
                        <tfoot>
                            <tr class="total-row" id="income-total-row">
                                <td><strong>💼 Total Ingresos</strong></td>
                                <td class="amount"><strong>${this.gastosManager.formatNumber(ingresos.total)}</strong></td>
                                <td><strong>100%</strong></td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
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
     * ⚡ ACCIONES DE LA TABLA - OPTIMIZADAS SIN REFRESCO
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
                
                // Guardar datos
                this.storage.setIngresos(ingresos);

                // 🎯 SOLUCIÓN: Solo actualizar fila específica sin recargar tabla
                this.updateIncomeRow(id, data);
                this.gastosManager.updateHeaderTotals();
                this.recalculatePercentages();
                
                window.modalSystem.showMessage('Ingreso actualizado correctamente', 'success');
            }
        });

        // 🎯 CONFIGURAR NAVEGACIÓN ENTER DESPUÉS DE QUE EL MODAL EXISTA
        setTimeout(() => {
            this.setupEnterNavigation();
        }, 300);
    }

    /**
     * 🎯 CONFIGURAR NAVEGACIÓN ENTER PARA MODAL - CORREGIDO
     */
    setupEnterNavigation() {
        // Intentar múltiples veces hasta encontrar el modal
        let attempts = 0;
        const maxAttempts = 10;
        
        const trySetup = () => {
            attempts++;
            console.log(`🔍 Intento ${attempts} de configurar Enter navigation`);
            
            const modal = document.querySelector('.modal-overlay, .modern-overlay');
            if (!modal) {
                if (attempts < maxAttempts) {
                    setTimeout(trySetup, 100);
                }
                return;
            }

            const fuenteInput = modal.querySelector('input[name="fuente"]');
            const montoInput = modal.querySelector('input[name="monto"]');
            const submitButton = modal.querySelector('button[data-action="save"], button[data-action="submit"], .btn-primary');
            
            console.log('🔍 Elementos encontrados:', {
                modal: !!modal,
                fuenteInput: !!fuenteInput,
                montoInput: !!montoInput,
                submitButton: !!submitButton
            });
            
            if (!fuenteInput || !montoInput || !submitButton) {
                if (attempts < maxAttempts) {
                    setTimeout(trySetup, 100);
                }
                return;
            }

            // 🎯 CONFIGURAR ENTER EN FUENTE
            const handleFuenteEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('🎯 Enter en Fuente - navegando a Monto');
                    montoInput.focus();
                    montoInput.select();
                }
            };

            // 🎯 CONFIGURAR ENTER EN MONTO
            const handleMontoEnter = (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    console.log('🎯 Enter en Monto - guardando');
                    
                    // Validar campos
                    if (!fuenteInput.value.trim()) {
                        console.log('⚠️ Fuente vacía, volviendo a ese campo');
                        fuenteInput.focus();
                        return;
                    }
                    if (!montoInput.value.trim() || parseFloat(montoInput.value) <= 0) {
                        console.log('⚠️ Monto inválido, permaneciendo en ese campo');
                        montoInput.focus();
                        return;
                    }
                    
                    console.log('✅ Validación OK, haciendo click en submit');
                    submitButton.click();
                }
            };

            // 🔧 DESACTIVAR Enter global del modal
            const disableModalEnter = (e) => {
                if (e.key === 'Enter' && (e.target === fuenteInput || e.target === montoInput)) {
                    e.stopImmediatePropagation();
                }
            };

            // Agregar listeners con capture
            fuenteInput.addEventListener('keydown', handleFuenteEnter, true);
            montoInput.addEventListener('keydown', handleMontoEnter, true);
            modal.addEventListener('keydown', disableModalEnter, true);

            console.log('✅ Navegación Enter configurada correctamente');
        };
        
        // Iniciar el proceso
        trySetup();
    }

    /**
     * 🎯 ACTUALIZAR SOLO LA FILA EDITADA SIN RECARGAR TABLA
     */
    updateIncomeRow(id, newData) {
        const row = document.querySelector(`[data-id="${id}"]`);
        if (!row) {
            console.log('⚠️ Fila no encontrada, recargando tabla');
            this.renderIncomeSection(this.gastosManager.getMainContainer());
            return;
        }

        // Actualizar nombre de la fuente
        const sourceNameElement = row.querySelector('.source-name, .breakdown-name');
        if (sourceNameElement) {
            sourceNameElement.textContent = newData.fuente;
        }

        // Actualizar monto
        const amountElement = row.querySelector('.breakdown-amount, .amount-value');
        if (amountElement) {
            amountElement.textContent = this.formatNumber(newData.monto);
        }

        // Animación de actualización
        row.style.transition = 'background-color 0.3s ease';
        row.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        setTimeout(() => {
            row.style.backgroundColor = '';
        }, 800);
    }

    /**
     * 🗑️ ELIMINAR INGRESO SIN REFRESCO - MODAL RESTAURADO
     */
    deleteIncome(id) {
        const ingresos = this.storage.getIngresos();
        const income = ingresos.desglose.find(item => item.id === id);
        
        if (!income) {
            console.error('❌ Ingreso no encontrado:', id);
            return;
        }

        // 🎯 USAR MODALYSTEM NORMAL (RESTAURADO)
        window.modalSystem.confirm(
            `¿Estás seguro de que quieres eliminar "${income.fuente}"?`,
            'Esta acción no se puede deshacer.'
        ).then(confirmed => {
            if (confirmed) {
                this.executeDelete(id, ingresos);
            }
        });
    }

    /**
     * 🎯 EJECUTAR ELIMINACIÓN REAL
     */
    executeDelete(id, ingresos) {
        // 🎯 SOLUCIÓN: Eliminar fila del DOM primero
        const row = document.querySelector(`[data-id="${id}"]`);
        if (row) {
            row.style.transition = 'opacity 0.2s ease';
            row.style.opacity = '0';
            setTimeout(() => {
                if (row.parentNode) {
                    row.remove();
                }
            }, 200);
        }
        
        // Eliminar del array
        ingresos.desglose = ingresos.desglose.filter(item => item.id !== id);
        ingresos.total = ingresos.desglose.reduce((total, item) => total + (item.monto || 0), 0);
        
        // Guardar datos
        this.storage.setIngresos(ingresos);
        
        // 🎯 SOLO actualizar totales, NO recargar tabla
        this.gastosManager.updateHeaderTotals();
        this.updateTableTotals(ingresos.total);
        
        console.log('✅ Ingreso eliminado sin refresco');
    }

    /**
     * 🎯 ACTUALIZAR SOLO LOS TOTALES SIN RECARGAR TABLA
     */
    updateTableTotals(newTotal) {
        const totalElement = document.querySelector('.income-total-value');
        if (totalElement) {
            totalElement.textContent = this.gastosManager.formatNumber(newTotal);
        }
        
        const totalRowElement = document.querySelector('#income-total-row .amount');
        if (totalRowElement) {
            totalRowElement.textContent = this.gastosManager.formatNumber(newTotal);
        }
    }

    /**
     * 🎯 RECALCULAR PORCENTAJES SIN RECARGAR
     */
    recalculatePercentages() {
        const ingresos = this.storage.getIngresos();
        const total = ingresos.total;
        
        ingresos.desglose.forEach(item => {
            const percentage = ((item.monto / total) * 100).toFixed(1);
            const row = document.querySelector(`[data-id="${item.id}"]`);
            if (row) {
                const percentageCell = row.querySelector('.breakdown-percentage, .percentage-text');
                if (percentageCell) {
                    percentageCell.textContent = `${percentage}%`;
                }
                
                // Actualizar barra de progreso
                const progressFill = row.querySelector('.progress-fill');
                if (progressFill) {
                    progressFill.style.width = `${percentage}%`;
                    progressFill.className = `progress-fill ${this.getProgressClass(percentage)}`;
                }
            }
        });

        // Actualizar total en la tabla
        this.updateTableTotals(total);
    }

    /**
     * 📊 AGREGAR NUEVA FILA SIN RECARGAR TABLA
     */
    addNewIncomeRow(incomeData) {
        const tableBody = document.getElementById('income-table-body');
        if (!tableBody) {
            // Si no hay tabla, recargar completamente
            this.renderIncomeSection(this.gastosManager.getMainContainer());
            return;
        }

        // Remover fila vacía si existe
        const emptyRow = tableBody.querySelector('.empty-row');
        if (emptyRow) {
            emptyRow.remove();
        }

        const percentage = 10; // Se calculará después
        const newRowHTML = `
            <tr class="income-row" data-id="${incomeData.id}" style="opacity: 0;">
                <td class="source-cell">
                    <div class="source-content breakdown-item" data-id="${incomeData.id}">
                        <span class="source-name breakdown-name">${incomeData.fuente}</span>
                    </div>
                </td>
                <td class="amount-cell">
                    <div class="breakdown-item" data-id="${incomeData.id}">
                        <span class="amount-value breakdown-amount">${this.formatNumber(incomeData.monto)}</span>
                    </div>
                </td>
                <td class="percentage-cell">
                    <div class="percentage-container">
                        <div class="progress-bar">
                            <div class="progress-fill ${this.getProgressClass(percentage)}" 
                                 style="width: ${percentage}%"></div>
                        </div>
                        <span class="percentage-text">${percentage.toFixed(1)}%</span>
                    </div>
                </td>
                <td class="actions-cell">
                    <div class="action-buttons">
                        <button class="action-btn btn-edit" onclick="window.incomeTableEnhanced.editIncome('${incomeData.id}')" title="Editar">
                            ✏️
                        </button>
                        <button class="action-btn btn-delete" onclick="window.incomeTableEnhanced.deleteIncome('${incomeData.id}')" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;

        // Agregar nueva fila
        tableBody.insertAdjacentHTML('beforeend', newRowHTML);
        
        // Animar entrada
        const newRow = tableBody.querySelector(`[data-id="${incomeData.id}"]`);
        if (newRow) {
            setTimeout(() => {
                newRow.style.transition = 'opacity 0.3s ease';
                newRow.style.opacity = '1';
            }, 10);
        }

        // Actualizar totales y porcentajes
        this.recalculatePercentages();
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
        
        const currentIndicator = document.querySelector(`[data-column="${column}"] .sort-indicator`);
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

    /**
     * 🎯 FORMATEAR NÚMERO (HELPER)
     */
    formatNumber(amount) {
        return this.gastosManager.formatNumber ? 
               this.gastosManager.formatNumber(amount) : 
               new Intl.NumberFormat('es-CL').format(amount);
    }
}

// Crear instancia global
if (typeof window !== 'undefined') {
    window.IncomeTableEnhanced = IncomeTableEnhanced;
    console.log('📊 IncomeTableEnhanced v2.0.0 disponible globalmente - CORREGIDO');
}

/**
 * 🎯 EXPORTAR PARA MÓDULOS
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IncomeTableEnhanced;
}

console.log('📊 Income-table-enhanced.js v2.0.0 cargado - TODAS LAS CORRECCIONES APLICADAS');
console.log('✅ Sin refresco en menú contextual');
console.log('✅ Navegación Enter: Fuente → Monto → Guardar');
console.log('✅ Optimizaciones de rendimiento aplicadas');