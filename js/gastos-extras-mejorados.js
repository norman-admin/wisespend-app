/**
 * GASTOS-EXTRAS-MEJORADOS.JS - VERSIÓN COMPLETA CORREGIDA
 * Control de Gastos Familiares - Sección Gastos Extras Rediseñada
 * Versión: 2.3.0 - LAYOUT + MENÚ CONTEXTUAL + EDICIÓN INLINE + ACTUALIZACIÓN FIJA
 * 
 * 🎯 FUNCIONALIDADES:
 * - Gestión de presupuesto de gastos extras
 * - Layout rediseñado (lista izquierda + 2 cajas derecha)
 * - Menú contextual integrado con diseño elegante
 * - Scroll vertical en lista
 * - Integración con tarjetas dinámicas
 * - Auto-sincronización con sistema existente
 * 🆕 EDICIÓN INLINE: Doble click en monto y porcentaje
 * 🔧 ACTUALIZACIÓN CORREGIDA: Actualiza valores sin recargar página
 */

class GastosExtrasMejorados {
    constructor() {
        this.storage = window.storageManager;
        this.ingresosTotales = 0;
        this.presupuestoActual = 0;
        this.porcentajeActual = 10;
        
        // 🆕 CONTROL DE EDICIÓN INLINE
        this.isEditing = {
            amount: false,
            percentage: false
        };
        this.editingElement = null;
        this.originalValue = null;
        
        if (!this.storage) {
            console.error('❌ StorageManager no está disponible para gastos extras');
            return;
        }
        
        this.initializeGastosExtras();
        console.log('✅ Gastos Extras Mejorados v2.3.0 inicializado con actualización corregida');
    }

    /**
     * 🔄 ACTUALIZAR VISTA COMPLETA - VERSIÓN CORREGIDA
     * Actualiza solo los valores sin recargar toda la sección
     */
    actualizarVistaCompleta() {
        console.log('🔄 Actualizando valores de gastos extras...');
        
        // 1. Recargar datos frescos del storage
        const gastosExtras = this.storage.getGastosExtras();
        const gastoRealizado = this.calculateGastoRealizado(gastosExtras.items);
        const disponible = this.presupuestoActual - gastoRealizado;
        
        // 2. Actualizar el total en la lista
        const totalElement = document.getElementById('extras-total-amount');
        if (totalElement) {
            totalElement.textContent = `$${this.formatNumber(gastoRealizado)}`;
        }
        
        // 3. Actualizar gastos realizados
        const realizadoElement = document.getElementById('extras-gasto-realizado');
        if (realizadoElement) {
            realizadoElement.textContent = `$${this.formatNumber(gastoRealizado)}`;
        }
        
        // 4. Actualizar disponible
        const disponibleElement = document.getElementById('extras-disponible');
        if (disponibleElement) {
            disponibleElement.textContent = `$${this.formatNumber(disponible)}`;
        }
        
        // 5. Actualizar la lista de gastos
        const listElement = document.getElementById('extras-expenses-list');
        if (listElement) {
            listElement.innerHTML = this.renderGastosExtrasList(gastosExtras.items);
            
            // Re-vincular eventos del menú contextual a los nuevos elementos
            this.setupContainerEvents(listElement);
        }
        
        // 6. Notificar a las tarjetas dinámicas del dashboard
        this.notifyDynamicCards();
        
        // 7. Actualizar totales del dashboard si existe
        if (window.dashboardOrchestrator) {
            window.dashboardOrchestrator.refreshData();
        }
        
        console.log('✅ Valores actualizados:', {
            total: gastoRealizado,
            disponible: disponible,
            items: gastosExtras.items.length
        });
    }
    
    /**
     * Inicializar sistema de gastos extras
     */
    initializeGastosExtras() {
        // Obtener ingresos totales del sistema
        this.updateIngresosTotales();
        
        // Cargar datos de gastos extras
        this.loadGastosExtrasData();
        
        // Bind events una vez inicializado
        setTimeout(() => {
            this.bindEvents();
        }, 100);
    }

    /**
     * Obtener ingresos totales del sistema
     */
    updateIngresosTotales() {
        const ingresos = this.storage.getIngresos();
        this.ingresosTotales = ingresos.total || 0;
        console.log('💰 Ingresos totales actualizados:', this.ingresosTotales);
    }

    /**
     * Cargar datos de gastos extras
     */
    loadGastosExtrasData() {
        const gastosExtras = this.storage.getGastosExtras();
        
        // Si no hay datos, inicializar
        if (!gastosExtras.presupuesto) {
            this.porcentajeActual = 10;
            this.presupuestoActual = Math.round((this.ingresosTotales * this.porcentajeActual) / 100);
            this.saveGastosExtrasConfig();
        } else {
            this.presupuestoActual = gastosExtras.presupuesto;
            this.porcentajeActual = gastosExtras.porcentaje || 10;
        }
    }

    /**
     * Calcular total de gastos (suma de todos los montos)
     */
    calculateTotalGastos(items) {
        if (!items || items.length === 0) return 0;
        
        return items
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
    }

    /**
     * Renderizar la sección de gastos extras mejorada - NUEVO LAYOUT
     */
    renderGastosExtrasMejorados(container) {
        this.updateIngresosTotales();
        this.loadGastosExtrasData();
        
        const gastosExtras = this.storage.getGastosExtras();
        const gastoRealizado = this.calculateGastoRealizado(gastosExtras.items);
        const disponible = this.presupuestoActual - gastoRealizado;
        
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>⚡ Gastos Extras</h2>
                </div>
                
                <!-- NUEVO LAYOUT: GRID CON ÁREAS ESPECÍFICAS -->
                <div class="gastos-extras-layout">
                    
                    <!-- LISTA DE GASTOS (IZQUIERDA) -->
                    <div class="extras-column-card extras-expenses-box">
                        <div class="extras-expenses-title">
                            <span>Lista de gastos</span>
                            <button class="extras-add-button" onclick="gastosExtrasMejorados.showAddGastoModal()">+</button>
                        </div>
                        
                        <!-- Lista de gastos con scroll -->
                        <div class="extras-expenses-list" id="extras-expenses-list">
                            ${this.renderGastosExtrasList(gastosExtras.items)}
                        </div>
                        
                        <!-- Total -->
                        <div class="extras-total-box">
                            <div class="extras-total-label">Total gastos extras:</div>
                            <div class="extras-total-amount" id="extras-total-amount">$${this.formatNumber(gastoRealizado)}</div>
                        </div>
                    </div>

                    <!-- PRESUPUESTO ASIGNADO (ARRIBA DERECHA) -->
                    <div class="extras-column-card extras-budget-box">
                        <div class="extras-column-title">Presupuesto asignado</div>
                        
                        <!-- Monto principal -->
                        <div class="extras-budget-amount-box">
                            <div class="extras-budget-amount" id="extras-budget-amount">$${this.formatNumber(this.presupuestoActual)}</div>
                            <div class="extras-budget-subtitle">Presupuesto mensual</div>
                        </div>
                        
                        <!-- Grid de resumen -->
                        <div class="extras-summary-grid">
                            <div class="extras-summary-card gastos">
                                <div class="extras-summary-label">Gastos realizados</div>
                                <div class="extras-summary-amount" id="extras-gasto-realizado">$${this.formatNumber(gastoRealizado)}</div>
                            </div>
                            <div class="extras-summary-card disponible">
                                <div class="extras-summary-label">Disponible</div>
                                <div class="extras-summary-amount" id="extras-disponible">$${this.formatNumber(disponible)}</div>
                            </div>
                        </div>
                    </div>

                    <!-- CONFIGURACIÓN (ABAJO DERECHA) -->
                    <div class="extras-column-card extras-config-box">
                        <div class="extras-column-title">Configuración del presupuesto</div>
                        
                        <!-- Configuración principal -->
                        <div class="extras-config-main">
                            <!-- 🆕 MONTO EDITABLE CON DOBLE CLICK -->
                            <div class="extras-config-amount editable-field" 
                                 id="extras-config-amount" 
                                 data-field="amount"
                                 title="Doble click para editar">$${this.formatNumber(this.presupuestoActual)}</div>
                            
                            <!-- Control de porcentaje -->
                            <div class="extras-percentage-control">
                                <!-- 🆕 PORCENTAJE EDITABLE CON DOBLE CLICK -->
                                <div class="extras-percentage-display editable-field" 
                                     id="extras-percentage-display" 
                                     data-field="percentage"
                                     title="Doble click para editar">${this.porcentajeActual}%</div>
                                <input type="range" 
                                       id="extras-percentage-slider" 
                                       class="extras-percentage-slider"
                                       min="1" 
                                       max="50" 
                                       value="${this.porcentajeActual}" 
                                       step="0.1">
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        
        // Bind events después de renderizar
        setTimeout(() => {
            this.bindEvents();
            this.setupInlineEditing(); // 🆕 CONFIGURAR EDICIÓN INLINE
            this.setupContextMenu(); // Agregar menú contextual
            // Notificar actualización a tarjetas dinámicas
            this.notifyDynamicCards();
           }, 100);
    }

    /**
     * 🆕 CONFIGURAR EDICIÓN INLINE
     */
    setupInlineEditing() {
        const editableFields = document.querySelectorAll('.editable-field');
        
        editableFields.forEach(field => {
            // Doble click para editar
            field.addEventListener('dblclick', (e) => {
                this.startInlineEdit(e.target);
            });
            
            // Agregar cursor pointer
            field.style.cursor = 'pointer';
        });
        
        console.log('✅ Edición inline configurada para', editableFields.length, 'campos');
    }

    /**
     * 🆕 INICIAR EDICIÓN INLINE
     */
    startInlineEdit(element) {
        const fieldType = element.dataset.field;
        
        // Evitar edición múltiple
        if (this.isEditing.amount || this.isEditing.percentage) {
            return;
        }
        
        this.isEditing[fieldType === 'amount' ? 'amount' : 'percentage'] = true;
        this.editingElement = element;
        
        // Obtener valor actual sin formato
        let currentValue;
        if (fieldType === 'amount') {
            currentValue = this.presupuestoActual;
        } else {
            currentValue = this.porcentajeActual;
        }
        
        this.originalValue = currentValue;
        
        // Crear input
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'inline-edit-input';
        input.value = currentValue;
        
        // Configurar input según tipo
        if (fieldType === 'amount') {
            input.min = Math.round((this.ingresosTotales * 1) / 100); // 1%
            input.max = Math.round((this.ingresosTotales * 50) / 100); // 50%
            input.step = 1000;
            input.placeholder = 'Monto en pesos';
        } else {
            input.min = 1;
            input.max = 50;
            input.step = 0.1;
            input.placeholder = 'Porcentaje';
        }
        
        // Estilos del input
        input.style.cssText = `
            width: 100%;
            padding: 4px 8px;
            border: 2px solid #3b82f6;
            border-radius: 4px;
            font-size: inherit;
            font-weight: inherit;
            text-align: center;
            background: #fff;
            color: #374151;
        `;
        
        // Eventos del input
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.finishInlineEdit(true);
            } else if (e.key === 'Escape') {
                this.finishInlineEdit(false);
            }
        });
        
        input.addEventListener('blur', () => {
            setTimeout(() => this.finishInlineEdit(true), 100);
        });
        
        // Reemplazar elemento con input
        element.style.display = 'none';
        element.parentNode.insertBefore(input, element.nextSibling);
        
        // Focus y seleccionar
        input.focus();
        input.select();
        
        console.log(`📝 Iniciando edición inline para ${fieldType}:`, currentValue);
    }

    /**
     * 🆕 FINALIZAR EDICIÓN INLINE
     */
    finishInlineEdit(save) {
        if (!this.editingElement) return;
        
        const fieldType = this.editingElement.dataset.field;
        const input = this.editingElement.nextSibling;
        
        if (save && input && input.classList.contains('inline-edit-input')) {
            const newValue = parseFloat(input.value) || 0;
            
            // Validar rango
            if (fieldType === 'amount') {
                const minAmount = Math.round((this.ingresosTotales * 1) / 100);
                const maxAmount = Math.round((this.ingresosTotales * 50) / 100);
                
                if (newValue < minAmount || newValue > maxAmount) {
                    alert(`El monto debe estar entre $${this.formatNumber(minAmount)} (1%) y $${this.formatNumber(maxAmount)} (50%)`);
                    this.resetInlineEdit();
                    return;
                }
                
                // Actualizar desde monto
                this.updateBudgetFromAmount(newValue);
                
            } else if (fieldType === 'percentage') {
                if (newValue < 1 || newValue > 50) {
                    alert('El porcentaje debe estar entre 1% y 50%');
                    this.resetInlineEdit();
                    return;
                }
                
                // Actualizar desde porcentaje
                this.updateBudgetFromPercentage(newValue);
            }
            
            console.log(`💾 Guardando edición inline ${fieldType}:`, newValue);
        }
        
        // Limpiar edición
        this.resetInlineEdit();
    }

    /**
     * 🆕 RESETEAR EDICIÓN INLINE
     */
    resetInlineEdit() {
        if (this.editingElement) {
            const input = this.editingElement.nextSibling;
            if (input && input.classList.contains('inline-edit-input')) {
                input.remove();
            }
            
            this.editingElement.style.display = '';
            this.editingElement = null;
        }
        
        this.isEditing.amount = false;
        this.isEditing.percentage = false;
        this.originalValue = null;
        
        // Actualizar displays para reflejar valores actuales
        this.updateDisplays();
    }

    /**
     * Renderizar lista de gastos extras
     */
    renderGastosExtrasList(items) {
        if (!items || items.length === 0) {
            return '<div style="text-align: center; color: #6b7280; font-style: italic; padding: 20px;">No hay gastos extras registrados</div>';
        }

        return items.map(item => {
            if (item.activo === false) return '';
            
            const isChecked = item.pagado ? 'checked' : '';
            const itemClass = item.pagado ? 'extras-expense-item paid' : 'extras-expense-item';
            
            return `
                <div class="${itemClass}" data-id="${item.id}">
                    <div class="extras-expense-checkbox">
                        <input type="checkbox" 
                               id="extras-checkbox-${item.id}" 
                               ${isChecked}
                               onchange="gastosExtrasMejorados.toggleGastoPagado('${item.id}')">
                    </div>
                    <div class="extras-expense-details">
                        <span class="extras-expense-name">${item.categoria}</span>
                        <span class="extras-expense-amount">$${this.formatNumber(item.monto)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * 🔧 CONFIGURAR MENÚ CONTEXTUAL - VERSIÓN CORREGIDA
     */
    setupContextMenu() {
        const expensesList = document.getElementById('extras-expenses-list');
        if (!expensesList) return;

        // Esperar a que contextualManager esté disponible (sin loop infinito)
        const waitForContextualManager = () => {
            if (!window.contextualManager) {
                console.log('⏳ Esperando contextualManager...');
                setTimeout(waitForContextualManager, 500);
                return;
            }

            // Registrar handlers para gastos extras
            this.registerGastosExtrasHandlers();

            // Configurar eventos del contenedor
            this.setupContainerEvents(expensesList);

            console.log('✅ Menú contextual configurado para gastos extras');
        };

        waitForContextualManager();
    }

    /**
     * 🔧 REGISTRAR HANDLERS - VERSIÓN CORREGIDA
     */
    registerGastosExtrasHandlers() {
        if (!window.contextualManager) return;

        // Forzar inicialización de handlers si no existe
        if (!window.contextualManager.handlers) {
            window.contextualManager.handlers = {};
        }

        // Registrar handlers directamente
        window.contextualManager.handlers['gastos-extras'] = {
            edit: (id) => this.editGastoExtra(id),
            duplicate: (id) => this.duplicateGastoExtra(id),
            'toggle-paid': (id) => this.toggleGastoPagado(id),
            delete: (id) => this.deleteGastoExtra(id),
            'move-up': (id) => this.moveGastoExtra(id, 'up'),
            'move-down': (id) => this.moveGastoExtra(id, 'down')
        };

        console.log('🎯 Handlers registrados para gastos extras');
    }

    /**
     * Configurar eventos del contenedor
     */
    setupContainerEvents(container) {
        // Evitar múltiples listeners
        if (container.dataset.contextualBound) return;
        container.dataset.contextualBound = 'true';

        // Menú contextual (click derecho)
        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const expenseItem = e.target.closest('.extras-expense-item');
            if (!expenseItem) return;
            
            const itemId = expenseItem.dataset.id;
            if (!itemId) return;

            // Obtener datos del item
            const itemData = this.getItemData(itemId);
            if (!itemData) return;

            // Usar el sistema contextual manager original
            window.contextualManager.showContextMenu(e, 'gastos-extras', itemId, expenseItem);
            
            console.log('🖱️ Menú contextual mostrado para:', itemId);
        });

        console.log('🎧 Eventos configurados para contenedor gastos extras');
    }

    /**
     * Obtener datos del item
     */
    getItemData(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        if (!gastosExtras.items) return null;
        
        return gastosExtras.items.find(item => item.id === itemId);
    }

    /**
     * Mover elemento (nueva funcionalidad)
     */
    moveGastoExtra(itemId, direction) {
        console.log(`🔄 Moviendo gasto extra ${itemId} hacia ${direction}`);
        
        const gastosExtras = this.storage.getGastosExtras();
        if (!gastosExtras.items) return;
        
        const items = gastosExtras.items;
        const index = items.findIndex(item => item.id === itemId);
        
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (newIndex < 0 || newIndex >= items.length) return;
        
        // Intercambiar elementos
        [items[index], items[newIndex]] = [items[newIndex], items[index]];
        
        // Guardar cambios
        this.storage.setGastosExtras(gastosExtras);
        
        // ACTUALIZACIÓN COMPLETA
        this.actualizarVistaCompleta();
        
        console.log('✅ Gasto extra movido correctamente');
    }

    /**
     * Acciones del menú contextual
     */
    editGastoExtra(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (!item) {
            console.error('Gasto extra no encontrado:', itemId);
            return;
        }

        // Usar el modal del sistema existente
        if (window.gastosManager && window.gastosManager.showEditGastoModal) {
            const self = this;
            
            // Interceptar el guardado
            const originalSave = window.gastosManager.saveGastoFromModal;
            window.gastosManager.saveGastoFromModal = function(data, tipo) {
                if (originalSave) originalSave.call(window.gastosManager, data, tipo);
                
                setTimeout(() => {
                    self.actualizarVistaCompleta();
                    window.gastosManager.saveGastoFromModal = originalSave;
                }, 100);
            };
            
            window.gastosManager.showEditGastoModal(itemId, 'extras');
        } else {
            console.log('🔧 Editar gasto extra:', item.categoria);
            alert(`Editar: ${item.categoria} - $${this.formatNumber(item.monto)}`);
        }
    }

    duplicateGastoExtra(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (!item) return;

        const newItem = {
            ...item,
            id: `gasto_extra_${Date.now()}`,
            categoria: `${item.categoria} (Copia)`,
            pagado: false
        };

        gastosExtras.items.push(newItem);
        this.storage.setGastosExtras(gastosExtras);
        
        // ACTUALIZACIÓN COMPLETA
        this.actualizarVistaCompleta();
        
        console.log('📋 Gasto extra duplicado:', newItem.categoria);
    }

    deleteGastoExtra(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (!item) return;

        if (confirm(`¿Eliminar "${item.categoria}"?`)) {
            // Eliminar del array
            gastosExtras.items = gastosExtras.items.filter(item => item.id !== itemId);
            
            // Guardar en storage
            this.storage.setGastosExtras(gastosExtras);
            
            // ACTUALIZACIÓN COMPLETA
            this.actualizarVistaCompleta();
            
            console.log('🗑️ Gasto extra eliminado:', item.categoria);
        }
    }

    /**
     * Calcular gasto realizado total
     */
    calculateGastoRealizado(items) {
        if (!items || items.length === 0) return 0;
        
        return items
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
    }

    /**
     * Vincular eventos - MEJORADO CON SOPORTE INLINE
     */
    bindEvents() {
        const percentageSlider = document.getElementById('extras-percentage-slider');
        
        if (percentageSlider) {
            percentageSlider.addEventListener('input', (e) => {
                // Solo actualizar si no estamos editando
                if (!this.isEditing.percentage) {
                    this.updateBudgetFromPercentage(parseFloat(e.target.value));
                }
            });
        }
        
        // 🆕 EVENT LISTENER GLOBAL PARA ESCAPAR DE EDICIÓN
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && (this.isEditing.amount || this.isEditing.percentage)) {
                this.finishInlineEdit(false);
            }
        });
    }

    /**
     * Actualizar presupuesto desde porcentaje - MEJORADO
     */
    updateBudgetFromPercentage(percentage) {
        // Validar rango
        percentage = Math.max(1, Math.min(50, percentage));
        
        this.porcentajeActual = percentage;
        this.presupuestoActual = Math.round((this.ingresosTotales * percentage) / 100);
        
        this.updateDisplays();
        this.saveGastosExtrasConfig();

        // 🆕 FORZAR ACTUALIZACIÓN DEL TOTAL
        const gastosExtras = this.storage.getGastosExtras();
        gastosExtras.total = this.presupuestoActual;
        gastosExtras.presupuestoParaTarjetas = this.presupuestoActual;
        this.storage.setGastosExtras(gastosExtras);
        this.notifyDynamicCards();
        
        console.log(`📊 Actualizado desde porcentaje: ${percentage}% = $${this.formatNumber(this.presupuestoActual)}`);
    }

    /**
     * Actualizar presupuesto desde monto - MEJORADO
     */
    updateBudgetFromAmount(monto) {
        // Validar rango
        const minAmount = Math.round((this.ingresosTotales * 1) / 100);
        const maxAmount = Math.round((this.ingresosTotales * 50) / 100);
        monto = Math.max(minAmount, Math.min(maxAmount, monto));
        
        this.presupuestoActual = monto;
        
        // Calcular porcentaje con precisión
        this.porcentajeActual = Math.round(((monto / this.ingresosTotales) * 100) * 10) / 10;
        
        this.updateDisplays();
        this.saveGastosExtrasConfig();
        
        // 🆕 FORZAR ACTUALIZACIÓN DEL TOTAL
        const gastosExtras = this.storage.getGastosExtras();
        gastosExtras.total = this.presupuestoActual;
        this.storage.setGastosExtras(gastosExtras);
        this.notifyDynamicCards();
        
        console.log(`💰 Actualizado desde monto: $${this.formatNumber(monto)} = ${this.porcentajeActual}%`);
    }

    /**
     * Actualizar displays - MEJORADO CON SOPORTE INLINE
     */
    updateDisplays() {
        const gastosExtras = this.storage.getGastosExtras();
        const gastoRealizado = this.calculateGastoRealizado(gastosExtras.items);
        const disponible = this.presupuestoActual - gastoRealizado;
        
        // Solo actualizar si no estamos editando ese campo
        const percentageDisplay = document.getElementById('extras-percentage-display');
        const percentageSlider = document.getElementById('extras-percentage-slider');
        const budgetAmount = document.getElementById('extras-budget-amount');
        const configAmount = document.getElementById('extras-config-amount');
        const gastoRealizadoAmount = document.getElementById('extras-gasto-realizado');
        const disponibleAmount = document.getElementById('extras-disponible');
        
        if (percentageDisplay && !this.isEditing.percentage) {
            percentageDisplay.textContent = `${this.porcentajeActual}%`;
        }
        if (percentageSlider && !this.isEditing.percentage) {
            percentageSlider.value = this.porcentajeActual;
        }
        if (budgetAmount) {
            budgetAmount.textContent = `$${this.formatNumber(this.presupuestoActual)}`;
        }
        if (configAmount && !this.isEditing.amount) {
            configAmount.textContent = `$${this.formatNumber(this.presupuestoActual)}`;
        }
        if (gastoRealizadoAmount) {
            gastoRealizadoAmount.textContent = `$${this.formatNumber(gastoRealizado)}`;
        }
        if (disponibleAmount) {
            disponibleAmount.textContent = `$${this.formatNumber(disponible)}`;
        }
    }

    /**
     * Guardar configuración de gastos extras
     */
    saveGastosExtrasConfig() {
        const gastosExtras = this.storage.getGastosExtras();
        gastosExtras.presupuesto = this.presupuestoActual;
        gastosExtras.porcentaje = this.porcentajeActual;
        this.storage.setGastosExtras(gastosExtras);
        
        // 🆕 ACTUALIZAR EL TOTAL CON EL PRESUPUESTO para tarjetas dinámicas
        gastosExtras.total = this.presupuestoActual;
        this.storage.setGastosExtras(gastosExtras);
        
        console.log('💾 Configuración gastos extras guardada:', {
            presupuesto: this.presupuestoActual,
            porcentaje: this.porcentajeActual
        });
    }

    /**
     * Toggle estado pagado de un gasto
     */
    toggleGastoPagado(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (item) {
            item.pagado = !item.pagado;
            this.storage.setGastosExtras(gastosExtras);
            
            // ACTUALIZACIÓN COMPLETA
            this.actualizarVistaCompleta();
            
            console.log('✅ Estado pagado actualizado:', {
                item: item.categoria,
                pagado: item.pagado
            });
        }
    }

    /**
     * Mostrar modal para agregar gasto
     */
    showAddGastoModal() {
        // Conectar con el sistema de modales existente
        if (window.gastosManager && window.gastosManager.showAddGastoModal) {
            const self = this;
            
            // Interceptar el método de guardado ANTES de abrir el modal
            const originalSave = window.gastosManager.saveGastoFromModal;
            
            // Reemplazar temporalmente el método de guardado
            window.gastosManager.saveGastoFromModal = function(data, tipo) {
                // Llamar al método original
                if (originalSave) {
                    originalSave.call(window.gastosManager, data, tipo);
                }
                
                // Si es un gasto extra, actualizar la vista
                if (tipo === 'extras') {
                    setTimeout(() => {
                        console.log('✅ Actualizando vista de gastos extras...');
                        
                        // Usar la actualización simplificada
                        self.actualizarVistaCompleta();
                        
                        // Restaurar el método original
                        window.gastosManager.saveGastoFromModal = originalSave;
                    }, 100);
                }
            };
            
            // Ahora sí abrir el modal
            window.gastosManager.showAddGastoModal('extras');
            
        } else {
            console.log('🚀 Modal agregar gasto - Se conectará con sistema existente');
            alert('Función conectar con modal existente');
        }
    }

    /**
     * Notificar a tarjetas dinámicas
     * IMPORTANTE: Solo suma el PRESUPUESTO, no los gastos reales
     */
    notifyDynamicCards() {
        // Disparar evento para que las tarjetas dinámicas se actualicen
        const event = new CustomEvent('gastosExtrasUpdated', {
            detail: {
                presupuestoExtras: this.presupuestoActual,
                message: 'Presupuesto de gastos extras actualizado'
            }
        });
        
        window.dispatchEvent(event);
        
        // 🆕 FORZAR ACTUALIZACIÓN AGRESIVA Y PERSISTENTE
        if (window.dashboardOrchestrator) {
            setTimeout(() => {
                window.dashboardOrchestrator.refreshData();
            }, 50);
            
            setTimeout(() => {
                window.dashboardOrchestrator.refreshData();
            }, 200);
            
            setTimeout(() => {
                window.dashboardOrchestrator.refreshData();
            }, 500);
        }
        
        console.log('🔄 Notificación MÚLTIPLE enviada a tarjetas dinámicas:', {
            presupuestoExtras: this.presupuestoActual
        });
    }

    /**
     * Obtener presupuesto para tarjetas dinámicas
     */
    getPresupuestoForDynamicCards() {
        return this.presupuestoActual;
    }

    /**
     * Refrescar datos cuando se actualicen externamente
     */
    refresh() {
    this.updateIngresosTotales();
    this.loadGastosExtrasData();
    this.actualizarVistaCompleta(); // 🆕 AGREGAR ESTA LÍNEA
    this.notifyDynamicCards();

    // 🆕 AGREGAR AQUÍ:
    if (window.dynamicCardsManager) {
        window.dynamicCardsManager.notifyUpdate('extra-expenses');
    }
}

    /**
     * Formatear números
     */
    formatNumber(number) {
        return number.toLocaleString('es-CL');
    }
}

// Inicializar globalmente
window.gastosExtrasMejorados = null;

// Función de inicialización
function initializeGastosExtrasMejorados() {
    if (window.storageManager) {
        window.gastosExtrasMejorados = new GastosExtrasMejorados();
        console.log('✅ GastosExtrasMejorados v2.3.0 inicializado globalmente');
    } else {
        console.warn('⚠️ Esperando StorageManager para inicializar GastosExtrasMejorados');
        setTimeout(initializeGastosExtrasMejorados, 500);
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGastosExtrasMejorados);
} else {
    initializeGastosExtrasMejorados();
}

console.log('📦 gastos-extras-mejorados.js v2.3.0 cargado - ACTUALIZACIÓN CORREGIDA');