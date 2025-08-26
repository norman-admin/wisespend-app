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
    console.log('🚨 DEBUGGING: renderIncomeSection() llamado');
    console.trace('🔍 STACK TRACE: renderIncomeSection origen');
    
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
       
// Activar menú contextual
setTimeout(() => {
    if (window.contextualManager) {
        window.contextualManager.refresh();
    }
    
    // 🆕 CONECTAR EVENTOS DE MENÚ CONTEXTUAL
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
        }, 500);
    }

    /**
     * 🎯 CONFIGURAR NAVEGACIÓN ENTER PARA MODAL - CORREGIDO
     */
   setupEnterNavigation() {
    console.log('🎯 Iniciando configuración de navegación Enter');
    
    // Esperar más tiempo para que el modal se renderice completamente
    let attempts = 0;
    const maxAttempts = 15; // Aumentado de 10 a 15
    
    const trySetup = () => {
        attempts++;
        console.log(`🔍 Intento ${attempts} de configurar Enter navigation`);
        
        // Buscar modal con selectores más específicos
        const modal = document.querySelector('.modal-overlay .modal-content, .modern-overlay');
        
        if (!modal) {
            if (attempts < maxAttempts) {
                setTimeout(trySetup, 150); // Aumentado de 100 a 150ms
            } else {
                console.warn('⚠️ No se pudo encontrar el modal después de', maxAttempts, 'intentos');
            }
            return;
        }

        // Buscar inputs con selectores más específicos
        const fuenteInput = modal.querySelector('input[name="fuente"], #fuente, input[placeholder*="fuente" i]');
        const montoInput = modal.querySelector('input[name="monto"], #monto, input[type="number"]');
        const submitButton = modal.querySelector('button[data-action="save"], button[data-action="submit"], .btn-primary, button[type="submit"]');
        
        console.log('🔍 Elementos encontrados:', {
            modal: !!modal,
            fuenteInput: !!fuenteInput,
            montoInput: !!montoInput,
            submitButton: !!submitButton
        });
        
        if (!fuenteInput || !montoInput || !submitButton) {
            if (attempts < maxAttempts) {
                setTimeout(trySetup, 150);
            } else {
                console.warn('⚠️ No se encontraron todos los elementos necesarios');
            }
            return;
        }

        // Limpiar eventos anteriores
        fuenteInput.removeEventListener('keydown', this.handleFuenteEnter);
        montoInput.removeEventListener('keydown', this.handleMontoEnter);

        // 🎯 CONFIGURAR ENTER EN FUENTE
        this.handleFuenteEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🎯 Enter en Fuente - navegando a Monto');
                
                // Validar que el campo no esté vacío
                if (!fuenteInput.value.trim()) {
                    console.log('⚠️ Fuente vacía, permaneciendo en el campo');
                    return;
                }
                
                montoInput.focus();
                montoInput.select();
            }
        };

        // 🎯 CONFIGURAR ENTER EN MONTO
        this.handleMontoEnter = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🎯 Enter en Monto - guardando');
                
                // Validar campos antes de guardar
                if (!fuenteInput.value.trim()) {
                    console.log('⚠️ Fuente vacía, volviendo a ese campo');
                    fuenteInput.focus();
                    return;
                }
                
                const montoValue = parseFloat(montoInput.value);
                if (!montoInput.value.trim() || isNaN(montoValue) || montoValue <= 0) {
                    console.log('⚠️ Monto inválido, permaneciendo en ese campo');
                    montoInput.focus();
                    montoInput.select();
                    return;
                }
                
                console.log('✅ Validación OK, guardando...');
                submitButton.click();
            }
        };

        // Agregar event listeners
        fuenteInput.addEventListener('keydown', this.handleFuenteEnter, true);
        montoInput.addEventListener('keydown', this.handleMontoEnter, true);

        // Focus inicial en fuente y seleccionar texto
        setTimeout(() => {
            fuenteInput.focus();
            fuenteInput.select();
        }, 50);

        console.log('✅ Navegación Enter configurada correctamente');
    };
    
    // Iniciar el proceso con un delay inicial
    setTimeout(trySetup, 200); // Delay inicial de 200ms
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

    // 🆕 NOTIFICAR A GASTOS EXTRAS SOBRE CAMBIO EN INGRESOS
    if (window.gastosExtrasMejorados) {
        window.gastosExtrasMejorados.updateIngresosTotales();
        window.gastosExtrasMejorados.updateDisplays();
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

        // 🎯 CALCULAR PORCENTAJE REAL
        const ingresos = this.storage.getIngresos();
        const percentage = ((incomeData.monto / ingresos.total) * 100);
        const newRowHTML = `
            <tr class="income-row" data-id="${incomeData.id}" style="opacity: 0;">
                <td class="source-cell">
                    <div class="source-content breakdown-item" data-id="${incomeData.id}">
                        <span class="source-name breakdown-name">${incomeData.fuente}</span>
                    </div>
                </td>
                <td class="amount-cell">
                    <div class="breakdown-item" data-id="${incomeData.id}">
                        <span class="amount-value breakdown-amount">${this.gastosManager.formatNumber(incomeData.monto)}</span>
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
        // Actualizar totales y porcentajes con debug
console.log('🔄 Recalculando porcentajes después de agregar fila');
setTimeout(() => {
    this.recalculatePercentages();
    console.log('✅ Porcentajes recalculados');
}, 100);

console.log('🚨 DEBUGGING: saveIncomeFromModal ejecutándose');
console.log('🔍 isEdit:', isEdit);
console.log('🔍 window.incomeTableEnhanced existe:', !!window.incomeTableEnhanced);
console.log('🔍 incomeData:', incomeData);
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

    // 🚨 PREVENIR TODOS LOS EVENTOS PROBLEMÁTICOS
    const preventiveEvents = ['click', 'dblclick', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'focus', 'focusin'];
    
    preventiveEvents.forEach(eventType => {
        tableBody.addEventListener(eventType, (e) => {
            // Solo permitir eventos en botones de acción
            if (!e.target.closest('.action-btn, .action-buttons, .actions-cell')) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            }
        }, true); // true = capture phase
    });

    // Menú contextual (click derecho) - SOLO para botones
    tableBody.addEventListener('contextmenu', (e) => {
        if (e.target.closest('.action-btn, .action-buttons')) {
            return; // Permitir menú contextual en botones
        }
        e.preventDefault();
        const row = e.target.closest('.income-row');
        if (!row) return;
        
        const itemId = row.dataset.id;
        if (itemId && window.contextualManager) {
            window.contextualManager.showContextMenu(e, 'income', itemId, row);
        }
    });

    this.debugFocusEvents();

    console.log('🚨 Eventos preventivos AGRESIVOS configurados - Solo botones habilitados');
}

/**
 * 🔧 DEBUGGING TEMPORAL: Rastrear eventos de foco
 */
debugFocusEvents() {
    // Solo para debugging - remover después
    document.addEventListener('focusin', (e) => {
        if (e.target.closest('.income-table-enhanced')) {
            console.log('🔍 FOCUS detectado en tabla:', e.target);
            console.log('🔍 Elemento que recibe foco:', e.target.tagName, e.target.className);
        }
    });
    
    document.addEventListener('click', (e) => {
        if (e.target.closest('.income-table-enhanced')) {
            console.log('🖱️ CLICK detectado en tabla:', e.target);
            setTimeout(() => {
                console.log('🎯 Elemento activo después del click:', document.activeElement);
            }, 10);
        }
    });
}

    /**
     * 🎯 FORMATEAR NÚMERO (HELPER)
     */
    formatNumber(amount) {
        return this.gastosManager.formatNumber ? 
               this.gastosManager.formatNumber(amount) : 
               new Intl.NumberFormat('es-CL').format(amount);
    }
    /**
     * 🎯 REORDENAR FILAS SIN RECARGAR TABLA COMPLETA
     */
    reorderIncomeRows(movedItemId, direction) {
        console.log(`🔄 Reordenando fila: ${movedItemId} hacia ${direction}`);
        
        const tableBody = document.querySelector('.income-table-enhanced tbody');
        if (!tableBody) {
            console.warn('⚠️ Tabla no encontrada, recargando...');
            this.renderIncomeSection(this.gastosManager.getMainContainer());
            return;
        }
        
        const currentRow = tableBody.querySelector(`[data-id="${movedItemId}"]`);
        if (!currentRow) {
            console.warn('⚠️ Fila no encontrada, recargando...');
            this.renderIncomeSection(this.gastosManager.getMainContainer());
            return;
        }
        
        let targetRow;
        if (direction === 'up') {
            targetRow = currentRow.previousElementSibling;
            if (targetRow) {
                tableBody.insertBefore(currentRow, targetRow);
            }
        } else if (direction === 'down') {
            targetRow = currentRow.nextElementSibling;
            if (targetRow) {
                tableBody.insertBefore(currentRow, targetRow.nextElementSibling);
            }
        }
        
        // Efecto visual para mostrar el movimiento
        currentRow.style.transition = 'background-color 0.3s ease';
        currentRow.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        
        setTimeout(() => {
            currentRow.style.backgroundColor = '';
            setTimeout(() => {
                currentRow.style.transition = '';
            }, 300);
        }, 600);
        
        // Recalcular porcentajes con los nuevos datos
        this.recalculatePercentages();
        
        console.log('✅ Fila reordenada sin refresco');
    }
    /**
     * 🎯 ACTUALIZAR SOLO LA FILA EDITADA 
     */
    updateIncomeRowInline(incomeId, field, newValue) {
    console.log('🎯 DEBUGGING: updateIncomeRowInline() llamado con:', {incomeId, field, newValue});
    console.log(`🔄 Actualizando campo ${field} de fila ${incomeId} inline`);
    
    const row = document.querySelector(`[data-id="${incomeId}"]`);
        if (!row) {
            console.warn('⚠️ Fila no encontrada para actualización inline');
            return;
        }
        
        // Actualizar el campo específico
        if (field === 'fuente') {
            const fuenteCell = row.querySelector('.breakdown-name, .income-source');
            if (fuenteCell) {
                fuenteCell.textContent = newValue;
            }
        } else if (field === 'monto') {
            const montoCell = row.querySelector('.breakdown-amount, .income-amount');
            if (montoCell) {
                montoCell.textContent = this.gastosManager ? 
                    this.gastosManager.formatNumber(newValue) : 
                    new Intl.NumberFormat('es-CL').format(newValue);
            }
        }
        
        // Efecto visual para mostrar la actualización
        row.style.transition = 'background-color 0.3s ease';
        row.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        
        setTimeout(() => {
            row.style.backgroundColor = '';
            setTimeout(() => {
                row.style.transition = '';
            }, 300);
        }, 600);
        
        console.log('✅ Fila actualizada inline sin refresco');
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