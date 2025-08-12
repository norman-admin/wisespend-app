/**
 * GASTOS-EXTRAS-MEJORADOS.JS - VERSIÓN COMPLETA CORREGIDA
 * Control de Gastos Familiares - Sección Gastos Extras Rediseñada
 * Versión: 2.2.1 - LAYOUT + MENÚ CONTEXTUAl.
 * 
 * 🎯 FUNCIONALIDADES:
 * - Gestión de presupuesto de gastos extras
 * - Layout rediseñado (lista izquierda + 2 cajas derecha)
 * - Menú contextual integrado con diseño elegante
 * - Scroll vertical en lista
 * - Integración con tarjetas dinámicas
 * - Auto-sincronización con sistema existente
 * 
 * 🔧 CORRECCIONES v2.2.1:
 * - Conecta correctamente con contextual-manager.js
 * - Evita loops infinitos de inicialización
 * - Mantiene diseño elegante del menú contextual
 * - Agrega funcionalidad de mover elementos
 * - ✅ CORREGIDO: Eliminados errores de JavaScript en addNewItemToDOM
 * - ✅ CORREGIDO: Referencias undefined newItemHTML
 */

class GastosExtrasMejorados {
    constructor() {
        this.storage = window.storageManager;
        this.ingresosTotales = 0;
        this.presupuestoActual = 0;
        this.porcentajeActual = 10;
        
        if (!this.storage) {
            console.error('❌ StorageManager no está disponible para gastos extras');
            return;
        }
        
        this.initializeGastosExtras();
        console.log('✅ Gastos Extras Mejorados v2.3.0 inicializado');
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
    this.setupContextMenu(); // Agregar menú contextual
    // Notificar actualización a tarjetas dinámicas
    this.notifyDynamicCards();
}, 100);
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
        
        // Actualizar vista
        this.updateDisplays();
        this.notifyDynamicCards();
               
        // Refrescar lista visual
        const container = document.querySelector('.content-section.active') || 
                         document.querySelector('#dynamic-content');
        if (container) {
            this.renderGastosExtrasMejorados(container);
        }
        
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
        if (window.gastosManager && window.gastosManager.showAddGastoModal) {
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
        
        // Refrescar vista
        const container = document.querySelector('.content-section.active') || 
                         document.querySelector('#dynamic-content');
        if (container) {
            this.renderGastosExtrasMejorados(container);
        }

        console.log('📋 Gasto extra duplicado:', newItem.categoria);
    }

    deleteGastoExtra(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (!item) return;

        if (confirm(`¿Eliminar "${item.categoria}"?`)) {
            gastosExtras.items = gastosExtras.items.filter(item => item.id !== itemId);
            this.storage.setGastosExtras(gastosExtras);
            
            // Refrescar vista
            const container = document.querySelector('.content-section.active') || 
                             document.querySelector('#dynamic-content');
            if (container) {
                this.renderGastosExtrasMejorados(container);

                // 🆕 ACTUALIZAR TOTALES DESPUÉS DE ELIMINAR
        this.updateDisplays();
        
        // 🔧 ACTUALIZACIÓN DIRECTA DEL TOTAL
        const totalRealizado = this.calculateGastoRealizado(gastosExtras.items);
        const totalElement = document.querySelector('#extras-total-amount');
        if (totalElement) {
            totalElement.textContent = `$${this.formatNumber(totalRealizado)}`;
        }
        
        // Forzar actualización de tarjetas dinámicas
        this.notifyDynamicCards();
        
        console.log('💰 Total actualizado después de eliminar:', totalRealizado);
        // 🔧 FORZAR ACTUALIZACIÓN VISUAL DE TODAS LAS CAJAS
        setTimeout(() => {
            // Actualizar caja "Gastos realizados"
            const gastosRealizadosElement = document.querySelector('.extras-summary-card.gastos .extras-summary-amount');
            if (gastosRealizadosElement) {
                gastosRealizadosElement.textContent = `$${this.formatNumber(totalRealizado)}`;
            }
            
            // Actualizar caja "Disponible"
            const disponible = this.presupuestoActual - totalRealizado;
            const disponibleElement = document.querySelector('.extras-summary-card.disponible .extras-summary-amount');
            if (disponibleElement) {
                disponibleElement.textContent = `$${this.formatNumber(disponible)}`;
            }
            
            console.log('✅ Cajas de resumen actualizadas forzadamente');
        }, 100);
        
        // 🔥 ELIMINAR ELEMENTO VISUAL DEL DOM
        const elementToRemove = document.querySelector(`[data-id="${itemId}"]`);
        if (elementToRemove) {
            elementToRemove.style.transition = 'opacity 0.3s ease';
            elementToRemove.style.opacity = '0';
            setTimeout(() => {
                elementToRemove.remove();
                console.log('🔥 Elemento visual eliminado del DOM');
            }, 300);
        }

            }

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
            
            // Actualizar solo la visualización interna
            this.updateDisplays();
            
            console.log('✅ Estado pagado actualizado:', {
                item: item.categoria,
                pagado: item.pagado
            });
        }
    }

    /**
     * Mostrar modal para agregar gasto - CORREGIDO SIN ERRORES
     */
    showAddGastoModal() {
        // Conectar con el sistema de modales existente
        if (window.gastosManager && window.gastosManager.showAddGastoModal) {
            // Guardar referencia al método original
            const originalMethod = window.gastosManager.saveGastoFromModal;
            
            // Interceptar el guardado SOLO UNA VEZ
            window.gastosManager.saveGastoFromModal = (data, tipo) => {
                // Llamar al método original
                originalMethod.call(window.gastosManager, data, tipo);
                
                // ✅ ACTUALIZACIÓN SIN PESTAÑEO CON PROTECCIÓN
                if (tipo === 'extras') {
                    const self = this;  
                    setTimeout(() => {
                        // Solo actualizar totales del header
                        if (window.gastosManager) {
                            window.gastosManager.updateHeaderTotals();
                        }
                        
                        // Agregar nuevo elemento visual al DOM sin recargar
                        const gastosExtras = self.storage.getGastosExtras();
                        const newItem = gastosExtras.items[gastosExtras.items.length - 1]; // Último agregado
                        
                        if (newItem && !document.querySelector(`[data-id="${newItem.id}"]`)) {
                            // Solo agregar si NO existe ya en el DOM
                            self.addNewItemToDOM(newItem);
                            self.updateDisplays(); // Solo actualizar números de resumen
                        }
                        
                        console.log('✅ Gasto extra agregado sin pestañeo');
                        
                    }, 100);
                }
                
                // Restaurar método original INMEDIATAMENTE después de usar
                window.gastosManager.saveGastoFromModal = originalMethod;
            };

            // Mostrar modal
            window.gastosManager.showAddGastoModal('extras');
        } else {
            console.log('🚀 Modal agregar gasto - Se conectará con sistema existente');
            alert('Función conectar con modal existente');
        }
    }
/**
 * 🆕 AGREGAR NUEVO ELEMENTO AL DOM SIN PESTAÑEO - CORREGIDO
 */
addNewItemToDOM(newItem) {
    console.log('🔍 DEBUG: addNewItemToDOM llamado con:', newItem);
    
    // 🛡️ GUARD ANTI-DUPLICACIÓN
    const existingElement = document.querySelector(`[data-id="${newItem.id}"]`);
    if (existingElement) {
        console.log('🚫 DUPLICACIÓN EVITADA: Elemento ya existe en DOM:', newItem.id);
        return;
    }
    
    const expensesList = document.querySelector('.extras-expenses-list') || 
                        document.querySelector('.expenses-list') ||
                        document.querySelector('[class*="expenses"]');
    
    console.log('🔍 DEBUG: Contenedor encontrado:', expensesList);
    
    if (!expensesList) {
        console.error('❌ No se encontró contenedor para la lista');
        return;
    }
    
    // Buscar un elemento existente para copiar su estructura EXACTA
    const existingItem = expensesList.querySelector('.extras-expense-item');

    if (existingItem) {
        // ✅ CASO 1: HAY ELEMENTOS EXISTENTES - CLONAR
        console.log('✅ Elemento existente encontrado, clonando estructura...');

        const clonedElement = existingItem.cloneNode(true);
        clonedElement.setAttribute('data-id', newItem.id);

        // Actualizar contenido manteniendo la estructura exacta
        const checkbox = clonedElement.querySelector('input[type="checkbox"]');
        const nameElement = clonedElement.querySelector('.extras-expense-name');
        const amountElement = clonedElement.querySelector('.extras-expense-amount');

        if (checkbox) {
            checkbox.checked = newItem.pagado || false;
            checkbox.setAttribute('onchange', `gastosExtrasMejorados.toggleGastoPagado('${newItem.id}')`);
            checkbox.id = `extras-checkbox-${newItem.id}`;
        }
        if (nameElement) {
            nameElement.textContent = newItem.categoria;
        }
        if (amountElement) {
            amountElement.textContent = `$${this.formatNumber(newItem.monto)}`;
        }

        // Insertar el elemento clonado
        expensesList.appendChild(clonedElement);
        
    } else {
        // ✅ CASO 2: LISTA VACÍA - CREAR DESDE CERO
        console.log('📝 Lista vacía, creando elemento desde cero...');
        
        const newElementHTML = `
            <div class="extras-expense-item" data-id="${newItem.id}">
                <div class="extras-expense-checkbox">
                    <input type="checkbox" 
                           id="extras-checkbox-${newItem.id}" 
                           ${newItem.pagado ? 'checked' : ''}
                           onchange="gastosExtrasMejorados.toggleGastoPagado('${newItem.id}')">
                </div>
                <div class="extras-expense-details">
                    <span class="extras-expense-name">${newItem.categoria}</span>
                    <span class="extras-expense-amount">$${this.formatNumber(newItem.monto)}</span>
                </div>
            </div>
        `;
        
        expensesList.insertAdjacentHTML('beforeend', newElementHTML);
    }

    // Encontrar el nuevo elemento para efectos visuales
    const newElement = expensesList.querySelector(`[data-id="${newItem.id}"]`);
    if (newElement) {
        newElement.style.transition = 'all 0.3s ease';
        newElement.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
        newElement.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            newElement.style.backgroundColor = '';
            newElement.style.transform = 'scale(1)';
        }, 500);
    }
    
   // 🆕 ACTUALIZAR TOTALES Y ELIMINAR MENSAJE VACÍO
    this.updateDisplays();
    
    // 🔧 ACTUALIZACIÓN DIRECTA DEL TOTAL
    const gastosExtras = this.storage.getGastosExtras();
    const totalRealizado = this.calculateGastoRealizado(gastosExtras.items);
    const totalElement = document.querySelector('#extras-total-amount');
    if (totalElement) {
        totalElement.textContent = `$${this.formatNumber(totalRealizado)}`;
        console.log('💰 Total actualizado directamente:', totalRealizado);
    }
    
   // Eliminar mensaje de lista vacía - BÚSQUEDA AMPLIADA
    const emptyMessage = expensesList.querySelector('.empty-message, .no-expenses-message') ||
                        expensesList.querySelector('p, div, span') ||
                        document.querySelector('.extras-expenses-list p');
    
    if (emptyMessage && emptyMessage.textContent.includes('No hay gastos')) {
        emptyMessage.remove();
        console.log('🗑️ Mensaje de lista vacía eliminado');
    }
    
    // Forzar actualización de tarjetas dinámicas
    this.notifyDynamicCards();
    
    console.log('✅ Elemento agregado exitosamente al DOM sin errores');
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
        this.updateDisplays();
        this.notifyDynamicCards();
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
        console.log('✅ GastosExtrasMejorados v2.2.1 inicializado globalmente');
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
