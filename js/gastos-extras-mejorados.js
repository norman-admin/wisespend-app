/**
 * GASTOS-EXTRAS-MEJORADOS.JS - VERSIÓN COMPLETA CORREGIDA
 * Control de Gastos Familiares - Sección Gastos Extras Rediseñada
 * Versión: 2.3.0 - LAYOUT + MENÚ CONTEXTUAL FUNCIONANDO
 * 
 * 🎯 FUNCIONALIDADES:
 * - Gestión de presupuesto de gastos extras
 * - Layout rediseñado (lista izquierda + 2 cajas derecha)
 * - Menú contextual integrado con diseño elegante
 * - Scroll vertical en lista
 * - Integración con tarjetas dinámicas
 * - Auto-sincronización con sistema existente
 * 
 * 🔧 CORRECCIONES v2.3.0:
 * - ✅ TODAS las funciones faltantes agregadas correctamente
 * - ✅ Actualización automática en acciones del menú contextual
 * - ✅ Sin duplicación de código
 * - ✅ Estructura limpia y profesional
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
        
        // 🆕 AGREGAR LISTENER PARA RESIZE
        window.addEventListener('resize', () => this.handleResize());
        
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
        const totalGastos = this.calculateTotalGastos(gastosExtras.items);  // Total de TODOS los gastos
        const gastoRealizado = this.calculateGastoRealizado(gastosExtras.items);  // Solo gastos PAGADOS
        const disponible = this.presupuestoActual - gastoRealizado;  // Disponible basado en gastos PAGADOS
        
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
                            <div class="extras-total-amount" id="extras-total-amount">$${this.formatNumber(totalGastos)}</div>
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
                            <!-- 💰 MONTO DEL PRESUPUESTO -->
                            <div class="extras-config-amount"
                            id="extras-config-amount"
                            title="Monto del presupuesto">${this.formatNumber(this.presupuestoActual)}</div>
                            
                            <!-- Control de porcentaje -->
                            <div class="extras-percentage-control">
                                <!-- 📊 PORCENTAJE DEL PRESUPUESTO -->
                                <div class="extras-percentage-display"
                                id="extras-percentage-display"
                                title="Porcentaje del presupuesto">${this.porcentajeActual}%</div>
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
     * 🎧 BIND EVENTS - Configurar todos los event listeners
     */
    bindEvents() {
        console.log('🎧 Configurando eventos para gastos extras...');
        
        // Event listener para slider de porcentaje
        const percentageSlider = document.getElementById('extras-percentage-slider');
        if (percentageSlider) {
            percentageSlider.addEventListener('input', (e) => {
                const percentage = parseFloat(e.target.value);
                this.updateBudgetFromPercentage(percentage);
            });
            
            percentageSlider.addEventListener('change', (e) => {
                const percentage = parseFloat(e.target.value);
                this.updateBudgetFromPercentage(percentage);
            });
        }
        
        // Event listener para configuración de monto
        const configAmount = document.getElementById('extras-config-amount');
        if (configAmount) {
            configAmount.addEventListener('dblclick', () => {
                this.editBudgetAmount();
            });
        }

        // Event listener para configuración de PORCENTAJE
        const percentageDisplay = document.getElementById('extras-percentage-display');
        if (percentageDisplay) {
            percentageDisplay.addEventListener('dblclick', () => {
                this.editBudgetPercentage();
            });
        }
        
        // Event listeners para elementos dinámicos (checkboxes)
        this.bindDynamicEvents();
        
        console.log('✅ Eventos configurados para gastos extras');
    }

    /**
     * 🔄 BIND DYNAMIC EVENTS - Para elementos que se crean dinámicamente
     */
    bindDynamicEvents() {
        const expensesList = document.getElementById('extras-expenses-list');
        if (!expensesList) return;
        
        // Event delegation para checkboxes
        expensesList.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox' && e.target.id.startsWith('extras-checkbox-')) {
                const itemId = e.target.id.replace('extras-checkbox-', '');
                this.toggleGastoPagado(itemId);
            }
        });
        
        // Event delegation para hover effects
        expensesList.addEventListener('mouseover', (e) => {
            const expenseItem = e.target.closest('.extras-expense-item');
            if (expenseItem) {
                expenseItem.classList.add('hovered');
            }
        });
        
        expensesList.addEventListener('mouseout', (e) => {
            const expenseItem = e.target.closest('.extras-expense-item');
            if (expenseItem) {
                expenseItem.classList.remove('hovered');
            }
        });
    }

    /**
     * 📊 UPDATE DISPLAYS - Actualizar todas las visualizaciones - VERSIÓN AGRESIVA
     */
    updateDisplays() {
        console.log('📊 Actualizando displays de gastos extras - VERSIÓN AGRESIVA...');
        
        try {
            // Obtener datos actuales
            const gastosExtras = this.storage.getGastosExtras();
            const totalGastos = this.calculateTotalGastos(gastosExtras.items);  // Para "Total gastos extras"
            const gastoRealizado = this.calculateGastoRealizado(gastosExtras.items);  // Para "Gastos realizados" (solo pagados)
            const disponible = this.presupuestoActual - gastoRealizado;
            
            console.log('💰 Datos calculados:', {
                presupuesto: this.presupuestoActual,
                gastoRealizado: gastoRealizado,
                disponible: disponible,
                porcentaje: this.porcentajeActual
            });
            
            // ✅ ACTUALIZAR TODOS LOS ELEMENTOS POSIBLES
            
            // 1. Monto del presupuesto (múltiples selectores)
            const budgetSelectors = [
                '#extras-budget-amount',
                '.extras-budget-amount',
                '#extras-config-amount',
                '.extras-config-amount'
            ];
            
            budgetSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = `$${this.formatNumber(this.presupuestoActual)}`;
                    console.log(`✅ Actualizado ${selector}`);
                }
            });
            
            // 2. Porcentaje (múltiples selectores)
            const percentageSelectors = [
                '#extras-percentage-display',
                '.extras-percentage-display'
            ];
            
            percentageSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = `${this.porcentajeActual}%`;
                    console.log(`✅ Actualizado ${selector}`);
                }
            });
            
            // 3. Slider de porcentaje
            const percentageSlider = document.getElementById('extras-percentage-slider');
            if (percentageSlider) {
                percentageSlider.value = this.porcentajeActual;
                console.log('✅ Slider actualizado');
            }
            
            // 4. Total de gastos extras (múltiples selectores)
const totalSelectors = [
    '#extras-total-amount',
    '.extras-total-amount'
];

totalSelectors.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = `$${this.formatNumber(totalGastos)}`;  // Usar totalGastos aquí
        console.log(`✅ Total actualizado ${selector}`);
    }
});
            
            // 5. Gasto realizado en resumen (múltiples selectores)
            const gastoRealizadoSelectors = [
                '#extras-gasto-realizado',
                '.extras-summary-card.gastos .extras-summary-amount',
                '.extras-summary-card[class*="gastos"] .extras-summary-amount'
            ];
            
            gastoRealizadoSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = `$${this.formatNumber(gastoRealizado)}`;
                    console.log(`✅ Gasto realizado actualizado ${selector}`);
                }
            });
            
            // 6. Disponible en resumen (múltiples selectores)
            const disponibleSelectors = [
                '#extras-disponible',
                '.extras-summary-card.disponible .extras-summary-amount',
                '.extras-summary-card[class*="disponible"] .extras-summary-amount'
            ];
            
            disponibleSelectors.forEach(selector => {
                const element = document.querySelector(selector);
                if (element) {
                    element.textContent = `$${this.formatNumber(disponible)}`;
                    
                    // Cambiar color según disponibilidad
                    const card = element.closest('.extras-summary-card');
                    if (card) {
                        card.classList.toggle('warning', disponible < 0);
                        card.classList.toggle('success', disponible >= 0);
                    }
                    console.log(`✅ Disponible actualizado ${selector}`);
                }
            });
            
            // 7. Actualizar estados visuales de elementos pagados
            this.updatePaidStates();
            
            // 8. FORZAR ACTUALIZACIÓN DEL STORAGE CON TOTALES
            gastosExtras.totalGastos = totalGastos;  // Total de TODOS los gastos
            gastosExtras.gastosRealizados = gastoRealizado;  // Solo gastos PAGADOS
            gastosExtras.presupuesto = this.presupuestoActual;
            gastosExtras.porcentaje = this.porcentajeActual;
            gastosExtras.disponible = disponible;
            this.storage.setGastosExtras(gastosExtras);
            
            console.log('✅ Displays actualizados correctamente - AGRESIVO', {
                presupuesto: this.presupuestoActual,
                gastoRealizado: gastoRealizado,
                disponible: disponible,
                porcentaje: this.porcentajeActual
            });
            
        } catch (error) {
            console.error('❌ Error actualizando displays:', error);
        }
    }

    /**
     * ✅ UPDATE PAID STATES - Actualizar estados visuales de elementos pagados
     */
    updatePaidStates() {
        const gastosExtras = this.storage.getGastosExtras();
        if (!gastosExtras.items) return;
        
        gastosExtras.items.forEach(item => {
            const element = document.querySelector(`[data-id="${item.id}"]`);
            const checkbox = document.getElementById(`extras-checkbox-${item.id}`);
            
            if (element && checkbox) {
                // Actualizar checkbox
                checkbox.checked = item.pagado || false;
                
                // Actualizar clase visual
                element.classList.toggle('paid', item.pagado || false);
            }
        });
    }

    /**
     * 💰 EDIT BUDGET AMOUNT - Editar monto del presupuesto directamente
     */
    editBudgetAmount() {
        // Usar el sistema de modales profesional
        if (!window.modalSystem) {
            console.error('❌ ModalSystem no disponible');
            return;
        }

        const minAmount = Math.round((this.ingresosTotales * 1) / 100);
        const maxAmount = Math.round((this.ingresosTotales * 50) / 100);

        window.modalSystem.form({
            title: 'Configurar Presupuesto de Gastos Extras',
            subtitle: `El presupuesto debe estar entre el 1% y 50% de los ingresos totales ($${this.formatNumber(minAmount)} - $${this.formatNumber(maxAmount)})`,
            submitText: 'Actualizar Presupuesto',
            fields: [
                {
                    type: 'number',
                    name: 'presupuesto',
                    label: 'Monto del Presupuesto',
                    required: true,
                    value: this.presupuestoActual,
                    placeholder: '0',
                    min: minAmount,
                    max: maxAmount
                }
            ]
        }).then(data => {
            if (data && data.presupuesto) {
                const amount = parseInt(data.presupuesto) || 0;
                if (amount >= minAmount && amount <= maxAmount) {
                    this.updateBudgetFromAmount(amount);
                    
                    if (window.modalSystem) {
                        window.modalSystem.showMessage('Presupuesto actualizado correctamente', 'success');
                    }
                } else {
                    if (window.modalSystem) {
                        window.modalSystem.showMessage(
                            `El monto debe estar entre $${this.formatNumber(minAmount)} y $${this.formatNumber(maxAmount)}`, 
                            'error'
                        );
                    }
                }
            }
        }).catch(error => {
            console.error('❌ Error en modal de presupuesto:', error);
        });
    }

    /**
     * 📊 EDIT BUDGET PERCENTAGE - Editar porcentaje del presupuesto directamente
     */
    editBudgetPercentage() {
        // Usar el sistema de modales profesional
        if (!window.modalSystem) {
            console.error('❌ ModalSystem no disponible');
            return;
        }

        window.modalSystem.form({
            title: 'Configurar Porcentaje de Gastos Extras',
            subtitle: `El porcentaje debe estar entre 1% y 50% de los ingresos totales`,
            submitText: 'Actualizar Porcentaje',
            fields: [
                {
                    type: 'number',
                    name: 'porcentaje',
                    label: 'Porcentaje del Presupuesto',
                    required: true,
                    value: this.porcentajeActual,
                    placeholder: '0',
                    min: 1,
                    max: 50,
                    step: 0.1
                }
            ]
        }).then(data => {
            if (data && data.porcentaje) {
                const percentage = parseFloat(data.porcentaje) || 0;
                if (percentage >= 1 && percentage <= 50) {
                    this.updateBudgetFromPercentage(percentage);
                    
                    if (window.modalSystem) {
                        window.modalSystem.showMessage('Porcentaje actualizado correctamente', 'success');
                    }
                } else {
                    if (window.modalSystem) {
                        window.modalSystem.showMessage(
                            'El porcentaje debe estar entre 1% y 50%', 
                            'error'
                        );
                    }
                }
            }
        }).catch(error => {
            console.error('❌ Error en modal de porcentaje:', error);
        });
    }

    /**
     * 🔄 REFRESH VISUAL LIST - Refrescar solo la lista visual sin recargar toda la sección
     */
    refreshVisualList() {
        const expensesList = document.getElementById('extras-expenses-list');
        if (!expensesList) return;
        
        const gastosExtras = this.storage.getGastosExtras();
        expensesList.innerHTML = this.renderGastosExtrasList(gastosExtras.items);
        
        // Re-bind eventos para nuevos elementos
        this.bindDynamicEvents();
        
        console.log('🔄 Lista visual refrescada');
    }

    /**
     * 🎨 UPDATE THEME COLORS - Actualizar colores según tema
     */
    updateThemeColors() {
        // Esta función puede ser expandida para soporte de temas
        const isDarkTheme = document.body.classList.contains('dark-theme');
        const elements = document.querySelectorAll('.extras-column-card');
        
        elements.forEach(element => {
            if (isDarkTheme) {
                element.classList.add('dark');
            } else {
                element.classList.remove('dark');
            }
        });
    }

    /**
     * 📱 HANDLE RESIZE - Manejar cambios de tamaño de ventana
     */
    handleResize() {
        // Ajustar layout para móviles si es necesario
        const isMobile = window.innerWidth < 768;
        const layout = document.querySelector('.gastos-extras-layout');
        
        if (layout) {
            layout.classList.toggle('mobile-layout', isMobile);
        }
    }

    /**
     * 🔄 SYNC WITH STORAGE - Sincronizar con cambios externos del storage
     */
    syncWithStorage() {
        this.updateIngresosTotales();
        this.loadGastosExtrasData();
        this.updateDisplays();
        this.refreshVisualList();
        
        console.log('🔄 Sincronizado con storage externo');
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
        
        // ✅ ACTUALIZAR INMEDIATAMENTE
        this.updateDisplays();
        this.notifyDynamicCards();
        this.refreshVisualList();
        
        console.log('✅ Gasto extra movido correctamente');
    }

    /**
     * Acciones del menú contextual - VERSIÓN CORREGIDA CON ACTUALIZACIÓN
     */
    editGastoExtra(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (!item) {
            console.error('Gasto extra no encontrado:', itemId);
            return;
        }

        // Usar el modal del sistema existente
        if (window.modalSystem) {
            window.modalSystem.form({
                title: 'Editar Gasto Extra',
                submitText: 'Actualizar',
                fields: [
                    {
                        type: 'text',
                        name: 'categoria',
                        label: 'Categoría',
                        required: true,
                        value: item.categoria,
                        placeholder: 'Ej: Supermercado, Combustible...'
                    },
                    {
                        type: 'number',
                        name: 'monto',
                        label: 'Monto',
                        required: true,
                        value: item.monto,
                        placeholder: '0'
                    }
                ]
            }).then(data => {
                if (data) {
                    // Actualizar el item
                    item.categoria = data.categoria;
                    item.monto = parseInt(data.monto) || 0;
                    
                    // Guardar en storage
                    this.storage.setGastosExtras(gastosExtras);
                    
                    // ✅ ACTUALIZAR ELEMENTO EN DOM
                    const elementInDOM = document.querySelector(`[data-id="${itemId}"]`);
                    if (elementInDOM) {
                        const nameElement = elementInDOM.querySelector('.extras-expense-name');
                        const amountElement = elementInDOM.querySelector('.extras-expense-amount');
                        
                        if (nameElement) nameElement.textContent = item.categoria;
                        if (amountElement) amountElement.textContent = `${this.formatNumber(item.monto)}`;
                        
                        // Efecto visual
                        elementInDOM.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                        setTimeout(() => {
                            elementInDOM.style.backgroundColor = '';
                        }, 500);
                    }
                    
                    // ✅ ACTUALIZAR TODOS LOS DISPLAYS INMEDIATAMENTE
                    this.updateDisplays();
                    this.notifyDynamicCards();
                    
                    if (window.modalSystem) {
                        window.modalSystem.showMessage('Gasto actualizado correctamente', 'success');
                    }
                }
            });
        } else {
            console.log('🔧 Editar gasto extra:', item.categoria);
            alert(`Editar: ${item.categoria} - ${this.formatNumber(item.monto)}`);
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

        // Agregar al storage
        gastosExtras.items.push(newItem);
        this.storage.setGastosExtras(gastosExtras);
        
        // ✅ AGREGAR AL DOM SIN PESTAÑEO
        this.addNewItemToDOM(newItem);
        
        // ✅ ACTUALIZAR TODOS LOS DISPLAYS INMEDIATAMENTE
        this.updateDisplays();
        this.notifyDynamicCards();

        console.log('📋 Gasto extra duplicado:', newItem.categoria);
    }

    deleteGastoExtra(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (!item) return;

        if (confirm(`¿Eliminar "${item.categoria}"?`)) {
            // Eliminar del storage
            gastosExtras.items = gastosExtras.items.filter(item => item.id !== itemId);
            this.storage.setGastosExtras(gastosExtras);
            
            // 🔥 ELIMINAR ELEMENTO VISUAL DEL DOM
            const elementToRemove = document.querySelector(`[data-id="${itemId}"]`);
            if (elementToRemove) {
                elementToRemove.style.transition = 'opacity 0.3s ease';
                elementToRemove.style.opacity = '0';
                setTimeout(() => {
                    elementToRemove.remove();
                }, 300);
            }
            
            // ✅ ACTUALIZAR TODOS LOS DISPLAYS INMEDIATAMENTE
            this.updateDisplays();
            this.notifyDynamicCards();
            
            console.log('🗑️ Gasto extra eliminado:', item.categoria);
        }
    }

    /**
 * Calcular gasto realizado (solo gastos marcados como pagados)
 */
calculateGastoRealizado(items) {
    if (!items || items.length === 0) return 0;
    
    // Sumar SOLO gastos con pagado = true
    return items
        .filter(item => item.activo !== false && item.pagado === true)
        .reduce((total, item) => total + (item.monto || 0), 0);
}

    /**
 * Calcular total de todos los gastos (para mostrar en "Total gastos extras")
 */
calculateTotalGastos(items) {
    if (!items || items.length === 0) return 0;
    
    // Sumar TODOS los gastos activos (pagados o no)
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
        
        console.log(`📊 Actualizado desde porcentaje: ${percentage}% = ${this.formatNumber(this.presupuestoActual)}`);
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
        
        console.log(`💰 Actualizado desde monto: ${this.formatNumber(monto)} = ${this.porcentajeActual}%`);
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
     * Toggle estado pagado de un gasto - VERSIÓN CORREGIDA
     */
    toggleGastoPagado(itemId) {
        const gastosExtras = this.storage.getGastosExtras();
        const item = gastosExtras.items.find(item => item.id === itemId);
        
        if (item) {
            item.pagado = !item.pagado;
            this.storage.setGastosExtras(gastosExtras);
            
            // ✅ ACTUALIZAR TODOS LOS DISPLAYS INMEDIATAMENTE
            this.updateDisplays();
            this.notifyDynamicCards();
            
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
                amountElement.textContent = `${this.formatNumber(newItem.monto)}`;
            }

            // Insertar el elemento clonado
            expensesList.appendChild(clonedElement);
            
        } else {
            // ✅ CASO 2: LISTA VACÍA - CREAR DESDE CERO
            console.log('🔍 Lista vacía, creando elemento desde cero...');
            
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
                        <span class="extras-expense-amount">${this.formatNumber(newItem.monto)}</span>
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
        
        // Eliminar mensaje de lista vacía - BÚSQUEDA AMPLIADA
        const emptyMessage = expensesList.querySelector('.empty-message, .no-expenses-message') ||
                            expensesList.querySelector('p, div, span') ||
                            document.querySelector('.extras-expenses-list p');
        
        if (emptyMessage && emptyMessage.textContent.includes('No hay gastos')) {
            emptyMessage.remove();
            console.log('🗑️ Mensaje de lista vacía eliminado');
        }
        
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

console.log('⚡ Gastos-extras-mejorados.js v2.3.0 COMPLETAMENTE ARREGLADO');
console.log('✅ Todas las funciones implementadas correctamente');
console.log('✅ Actualización automática en menú contextual funcionando');