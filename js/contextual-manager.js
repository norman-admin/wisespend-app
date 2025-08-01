/**
 * CONTEXTUAL-MANAGER.JS - Sistema Universal de Menú Contextual
 * Presupuesto Familiar - Versión 1.3.0 - SIN PESTAÑEO OPTIMIZADO
 * 
 * 🔧 OPTIMIZACIONES v1.3:
 * ✅ Eliminado pestañeo en eliminaciones
 * ✅ Usa renderizado directo de tabla sin recargas
 * ✅ Código duplicado eliminado
 * ✅ Refresco inteligente por tipo de acción
 * ✅ Performance mejorado
 */

class ContextualManager {
    constructor() {
        this.storage = window.storageManager;
        this.currency = window.currencyManager;
        this.activeMenu = null;
        this.editingElement = null;
        this.isProcessing = false;
        this.currentViewContext = null;
        this.registeredHandlers = new Map();
        
        if (!this.storage) {
            console.error('❌ StorageManager no disponible');
            return;
        }
        
        this.initializeContextual();
        console.log('🎯 ContextualManager v1.3 inicializado - SIN PESTAÑEO');
        
        // Inicializar módulo de acciones
        setTimeout(() => {
            if (typeof ContextualMenuActions !== 'undefined') {
                window.contextualMenuActions = new ContextualMenuActions(this);
                console.log('🎬 ContextualMenuActions inicializado');
            } else {
                console.error('❌ ContextualMenuActions no encontrado');
            }
        }, 500);
    }

    /**
     * 🆕 REGISTRO DE HANDLERS EXTERNOS
     */
    registerHandler(type, handlers) {
        this.registeredHandlers.set(type, handlers);
        console.log(`🎯 Handlers registrados para tipo: ${type}`);
    }

    /**
     * 🆕 OBTENER HANDLER REGISTRADO
     */
    getHandler(type, action) {
        const handlers = this.registeredHandlers.get(type);
        return handlers ? handlers[action] : null;
    }

    /**
     * INICIALIZACIÓN
     */
    initializeContextual() {
        this.setupGlobalEvents();
        this.bindExistingElements();
    }

    /**
     * Configurar eventos globales
     */
    setupGlobalEvents() {
        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.contextual-menu')) {
                this.closeContextMenu();
            }
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeContextMenu();
                this.cancelInlineEdit();
            }
        });

        console.log('🎧 Eventos globales configurados');
    }

    /**
     * 🆕 DETECTAR VISTA ACTUAL - MEJORADO
     */
    detectCurrentView() {
        const container = document.querySelector('#dynamic-content') || 
                         document.querySelector('.content-area');
        
        if (!container) return 'unknown';

        // Buscar elementos característicos de cada vista
        if (container.querySelector('.income-breakdown') || 
            container.querySelector('#income-table-body') || 
            container.querySelector('.income-table-enhanced') ||
            document.querySelector('.income-breakdown') ||
            document.querySelector('#income-table-body')) {
            return 'income';
        }
        
        if (container.querySelector('.expenses-grid')) {
            return 'fixed-variable';
        }
        
        if (container.querySelector('.add-expense-form')) {
            return 'expenses';
        }
        
        if (container.querySelector('.presupuesto-section')) {
            return 'extras';
        }
        
        if (container.textContent.includes('Gastos que no afectan el presupuesto')) {
            return 'misc';
        }

        // Fallback: si hay elementos de ingresos en cualquier lugar
        if (document.querySelector('.income-breakdown') || 
            document.querySelector('#income-table-body') ||
            document.querySelector('.breakdown-item')) {
            return 'income';
        }

        return 'unknown';
    }

    /**
     * Vincular elementos existentes
     */
    bindExistingElements() {
        this.currentViewContext = this.detectCurrentView();
        console.log(`🎯 Vista detectada: ${this.currentViewContext}`);
        
        setTimeout(() => {
            this.bindIncomeElements();
            this.bindExpenseElements();
        }, 500);
    }

    /**
     * Vincular elementos de ingresos
     */
    bindIncomeElements() {
        const incomeContainer = document.querySelector('.income-breakdown');
        if (incomeContainer) {
            this.setupContainerEvents(incomeContainer, 'income');
            console.log('💰 Elementos de ingresos vinculados');
        }
        
        const incomeItems = document.querySelectorAll('.breakdown-item');
        incomeItems.forEach(item => {
            if (!item.dataset.contextualBound) {
                this.setupItemEvents(item, 'income');
            }
        });
    }

    /**
     * Configurar eventos en item individual
     */
    setupItemEvents(item, type) {
        item.dataset.contextualBound = 'true';
        
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleContextMenu(e, type);
        });
        
        item.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleDoubleClick(e, type);
        });
    }

    /**
     * Vincular elementos de gastos
     */
    bindExpenseElements() {
        const expensesGrid = document.querySelector('.expenses-grid');
        if (expensesGrid) {
            const fixedColumn = expensesGrid.querySelector('.expenses-column:first-child .expenses-list');
            const variableColumn = expensesGrid.querySelector('.expenses-column:last-child .expenses-list');
            
            if (fixedColumn) {
                this.setupContainerEvents(fixedColumn, 'gastos-fijos');
                console.log('🏠 Gastos fijos vinculados');
            }
            
            if (variableColumn) {
                this.setupContainerEvents(variableColumn, 'gastos-variables');
                console.log('🛒 Gastos variables vinculados');
            }
        }

        const extrasContainer = document.querySelector('.gastos-content .gastos-items');
        if (extrasContainer) {
            this.setupContainerEvents(extrasContainer, 'gastos-extras');
            console.log('⚡ Gastos extras vinculados');
        }

        const singleGastosContainer = document.querySelector('.gastos-content .gastos-items');
        if (singleGastosContainer && !expensesGrid) {
            const titleElement = document.querySelector('.section-header h2');
            if (titleElement) {
                const title = titleElement.textContent.toLowerCase();
                if (title.includes('fijos')) {
                    this.setupContainerEvents(singleGastosContainer, 'gastos-fijos');
                    console.log('🏠 Gastos fijos (vista individual) vinculados');
                } else if (title.includes('variables')) {
                    this.setupContainerEvents(singleGastosContainer, 'gastos-variables');
                    console.log('🛒 Gastos variables (vista individual) vinculados');
                }
            }
        }
    }

    /**
     * Configurar eventos en contenedor
     */
    setupContainerEvents(container, type) {
        if (container.dataset.contextualBound) return;
        container.dataset.contextualBound = 'true';

        container.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.isProcessing) return;
            this.isProcessing = true;
            
            setTimeout(() => {
                this.handleContextMenu(e, type);
                this.isProcessing = false;
            }, 50);
        });

        container.addEventListener('dblclick', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleDoubleClick(e, type);
        });

        // Soporte móvil (long press)
        let longPressTimer;
        container.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                this.handleContextMenu(e, type);
            }, 500);
        });
        
        container.addEventListener('touchend', () => {
            clearTimeout(longPressTimer);
        });
        
        container.addEventListener('touchmove', () => {
            clearTimeout(longPressTimer);
        });
    }

    /**
     * Manejar menú contextual
     */
    handleContextMenu(e, type) {
        const item = this.findItemElement(e.target);
        if (!item) return;

        const itemId = this.getItemId(item, type);
        if (!itemId) {
            console.warn('⚠️ No se pudo obtener ID del elemento');
            return;
        }

        this.showContextMenu(e, type, itemId, item);
    }

    /**
     * Reconectar sección
     */
    refreshSection(sectionName) {
        console.log(`🔄 Reconectando contextual-manager para sección: ${sectionName}`);
        
        if (sectionName === 'config') {
            console.log('⚙️ Sección config ignorada - ConfigUI la maneja');
            return;
        }
        
        if (sectionName === 'income') {
            setTimeout(() => {
                this.bindIncomeElements();
                console.log('✅ Menú contextual de ingresos reconectado');
            }, 100);
        }
    }

    /**
     * Manejar doble clic para edición
     */
    handleDoubleClick(e, type) {
        const item = this.findItemElement(e.target);
        if (!item) return;

        const field = this.getEditableField(e.target);
        if (!field) return;

        const itemId = this.getItemId(item, type);
        if (!itemId) return;

        this.startInlineEdit(type, itemId, field, item);
    }

    /**
     * UTILIDADES DE ELEMENTOS
     */

    findItemElement(target) {
        const selectors = [
            '[data-id]',
            '.breakdown-item',
            '.expense-item',
            '.gasto-item'
        ];

        for (const selector of selectors) {
            const element = target.closest(selector);
            if (element) return element;
        }

        return null;
    }

    getItemId(element, type) {
        let id = element.dataset.id;
        if (id) return id;

        const nameElement = this.getNameElement(element);
        const amountElement = this.getAmountElement(element);
        
        if (nameElement && amountElement) {
            const name = nameElement.textContent.trim();
            const amount = this.parseCurrencyText(amountElement.textContent);
            
            const data = this.getStorageData(type);
            const items = this.getItemsArray(data);
            
            const foundItem = items.find(item => 
                item.categoria === name || 
                item.fuente === name ||
                (item.monto === amount && (item.categoria === name || item.fuente === name))
            );
            
            if (foundItem) {
                id = foundItem.id || this.generateId(type);
                element.dataset.id = id;
                return id;
            }
        }

        id = this.generateId(type);
        element.dataset.id = id;
        return id;
    }

    getEditableField(target) {
        const nameFields = ['.breakdown-name', '.expense-name', '.gasto-nome'];
        const amountFields = ['.breakdown-amount', '.expense-amount', '.gasto-monto'];
        
        for (const selector of nameFields) {
            if (target.closest(selector)) return { type: 'name', element: target.closest(selector) };
        }
        
        for (const selector of amountFields) {
            if (target.closest(selector)) return { type: 'amount', element: target.closest(selector) };
        }
        
        return null;
    }

    /**
     * MENÚ CONTEXTUAL
     */

    showContextMenu(e, type, itemId, itemElement) {
        this.closeContextMenu();

        const itemData = this.getItemData(type, itemId);
        if (!itemData) {
            console.error('❌ No se encontraron datos del elemento');
            return;
        }

        const menu = this.createContextMenu(type, itemId, itemData);
        const { x, y } = this.getMenuPosition(e);
        
        Object.assign(menu.style, {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            zIndex: '99999',
            display: 'block',
            opacity: '1',
            visibility: 'visible',
            transform: 'scale(1)',
            pointerEvents: 'auto'
        });

        document.body.appendChild(menu);
        this.activeMenu = menu;

        requestAnimationFrame(() => {
            menu.classList.add('show');
        });

        console.log(`🎯 Menú contextual mostrado para ${type}:${itemId}`);
    }

    /**
     * 🔧 CREAR MENÚ CONTEXTUAL - OPTIMIZADO SIN PESTAÑEO
     */
    createContextMenu(type, itemId, itemData) {
        const menu = document.createElement('div');
        menu.className = 'contextual-menu';
        
        menu.innerHTML = `
            <div class="contextual-menu-item edit-action" data-action="edit">
                <span class="contextual-icon">✏️</span>
                <span class="contextual-text">Editar</span>
            </div>
            <div class="contextual-menu-item duplicate-action" data-action="duplicate">
                <span class="contextual-icon">📋</span>
                <span class="contextual-text">Duplicar</span>
            </div>
            <div class="contextual-menu-item move-action" data-action="move-up">
                <span class="contextual-icon">⬆️</span>
                <span class="contextual-text">Mover arriba</span>
            </div>
            <div class="contextual-menu-item move-action" data-action="move-down">
                <span class="contextual-icon">⬇️</span>
                <span class="contextual-text">Mover abajo</span>
            </div>
            <div class="contextual-menu-item delete-action" data-action="delete">
                <span class="contextual-icon">🗑️</span>
                <span class="contextual-text">Eliminar</span>
            </div>
        `;

        // 🔧 EVENT LISTENERS OPTIMIZADOS
        menu.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        
            const action = e.target.closest('[data-action]')?.dataset.action;

            // 🆕 INTENTAR USAR HANDLER REGISTRADO PRIMERO
            const registeredHandler = this.getHandler(type, action);
            if (registeredHandler) {
                registeredHandler(itemId);
                this.closeContextMenu();
                return;
            }

            // Fallback al sistema original
            switch (action) {
                case 'edit':
                    window.contextualMenuActions.showEditModal(type, itemId, itemData);
                    break;
                case 'duplicate':
                    window.contextualMenuActions.duplicateItem(type, itemId, itemData);
                    break;
                case 'move-up':
                    window.contextualMenuActions.moveItem(type, itemId, 'up');
                    break;
                case 'move-down':
                    window.contextualMenuActions.moveItem(type, itemId, 'down');
                    break;
                case 'delete':
                    window.contextualMenuActions.deleteItem(type, itemId, itemData);
                break;
            }
            this.closeContextMenu();
        });

        menu.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        return menu;
    }

    getMenuPosition(e) {
        const menuWidth = 200;
        const menuHeight = 120;
        let { clientX: x, clientY: y } = e;

        if (x + menuWidth > window.innerWidth) {
            x = window.innerWidth - menuWidth - 10;
        }
        if (y + menuHeight > window.innerHeight) {
            y = window.innerHeight - menuHeight - 10;
        }

        return { x: Math.max(10, x), y: Math.max(10, y) };
    }

    closeContextMenu() {
        if (this.activeMenu) {
            this.activeMenu.remove();
            this.activeMenu = null;
        }
    }

    /**
     * EDICIÓN INLINE
     */

    startInlineEdit(type, itemId, field, itemElement) {
    if (this.editingElement) {
        this.cancelInlineEdit();
    }

    const itemData = this.getItemData(type, itemId);
    if (!itemData) return;

    const fieldElement = field.element || field;
    const fieldType = field.type || (fieldElement.classList.contains('breakdown-amount') || 
                                    fieldElement.classList.contains('gasto-amount') || 
                                    fieldElement.classList.contains('expense-amount') ? 'amount' : 'name');
    
    const originalValue = fieldType === 'amount' ? 
        (itemData.monto || 0) : 
        (itemData.categoria || itemData.fuente || '');
    
    const currentText = fieldElement.textContent.trim();
    
    // Crear input con clase CSS
    const input = document.createElement('input');
    input.type = fieldType === 'amount' ? 'number' : 'text';
    input.value = fieldType === 'amount' ? originalValue : currentText;
    input.className = 'inline-edit-input';
    
    // Reemplazar contenido
    fieldElement.innerHTML = '';
    fieldElement.appendChild(input);
    input.focus();
    input.select();
    
    this.editingElement = { input, fieldElement, currentText, itemId, type, fieldType, itemData };
    
    // Función para guardar SIN PESTAÑEO
    const saveEdit = () => {
        const newValue = input.value.trim();
        if (!newValue) {
            this.cancelInlineEdit();
            return;
        }
        
        // Actualizar datos
        const updatedData = { ...itemData };
        if (fieldType === 'name') {
            if (itemData.categoria !== undefined) {
                updatedData.categoria = newValue;
            } else {
                updatedData.fuente = newValue;
            }
        } else {
            updatedData.monto = parseFloat(newValue) || 0;
        }
        
        // Guardar usando contextual-menu-actions
        if (window.contextualMenuActions && window.contextualMenuActions.updateGastoItem(itemId, updatedData, type)) {
            // ✅ ACTUALIZACIÓN SIN PESTAÑEO
            fieldElement.textContent = fieldType === 'amount' ? 
                this.formatCurrency(updatedData.monto) : newValue;
            
            // SOLO actualizar totales, NO recargar vista
            if (window.gastosManager) {
                window.gastosManager.updateHeaderTotals();
            }
            
            // Efecto visual de éxito
            itemElement.style.transition = 'background-color 0.3s ease';
            itemElement.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
            setTimeout(() => {
                itemElement.style.backgroundColor = '';
            }, 1000);
            
            console.log('✅ Edición inline completada SIN PESTAÑEO');
            this.editingElement = null;
        } else {
            this.cancelInlineEdit();
        }
    };
    
    // Event listeners
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            this.cancelInlineEdit();
        }
    });
    
    input.addEventListener('blur', saveEdit);
}

/**
 * ❌ CANCELAR EDICIÓN INLINE
 */
cancelInlineEdit() {
    if (this.editingElement) {
        this.editingElement.fieldElement.textContent = this.editingElement.currentText;
        this.editingElement = null;
    }
}

    createInlineInput(fieldType, value) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.className = `inline-edit ${fieldType === 'amount' ? 'currency-field' : ''}`;
        
        Object.assign(input.style, {
            font: 'inherit',
            color: 'inherit',
            background: 'white',
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            padding: '4px 8px',
            width: '100%',
            maxWidth: '200px'
        });

        return input;
    }

    createInlineControls() {
        const controls = document.createElement('div');
        controls.className = 'inline-controls';
        controls.innerHTML = `
            <button class="inline-btn save" type="button">✓</button>
            <button class="inline-btn cancel" type="button">✗</button>
        `;

        Object.assign(controls.style, {
            display: 'inline-flex',
            gap: '4px',
            marginLeft: '8px'
        });

        controls.querySelectorAll('.inline-btn').forEach(btn => {
            Object.assign(btn.style, {
                width: '24px',
                height: '24px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold'
            });
        });

        const saveBtn = controls.querySelector('.save');
        const cancelBtn = controls.querySelector('.cancel');

        Object.assign(saveBtn.style, {
            background: '#10b981',
            color: 'white'
        });

        Object.assign(cancelBtn.style, {
            background: '#6b7280',
            color: 'white'
        });

        return controls;
    }

    setupInlineEvents() {
        const { input, controls, fieldType } = this.editingElement;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveInlineEdit();
            } else if (e.key === 'Escape') {
                this.cancelInlineEdit();
            }
        });

        if (fieldType === 'amount') {
            input.addEventListener('input', () => {
                this.formatCurrencyAsYouType(input);
            });
        }

        controls.querySelector('.save').addEventListener('click', () => {
            this.saveInlineEdit();
        });

        controls.querySelector('.cancel').addEventListener('click', () => {
            this.cancelInlineEdit();
        });
    }

    saveInlineEdit() {
        if (!this.editingElement) return;

        const { type, itemId, fieldType, input } = this.editingElement;
        const newValue = fieldType === 'amount' ? 
            this.parseCurrencyInput(input.value) : 
            input.value.trim();

        if (!this.validateInlineValue(fieldType, newValue)) {
            this.showInlineError('Valor inválido');
            return;
        }

        const success = this.updateItemField(type, itemId, fieldType, newValue);
        if (success) {
            this.finishInlineEdit();
            this.smartRefresh(type, 'update');
            this.showMessage('Elemento actualizado correctamente', 'success');
        } else {
            this.showInlineError('Error al guardar');
        }
    }

    cancelInlineEdit() {
        this.finishInlineEdit();
    }

    finishInlineEdit() {
        if (!this.editingElement) return;

        const { fieldElement, input, controls } = this.editingElement;
        
        input.remove();
        controls.remove();
        fieldElement.style.display = '';

        this.editingElement = null;
    }

    /**
     * GESTIÓN DE DATOS
     */

    getStorageData(type) {
        switch (type) {
            case 'income':
                return this.storage.getIngresos();
            case 'gastos-fijos':
                return this.storage.getGastosFijos();
            case 'gastos-variables':
                return this.storage.getGastosVariables();
            case 'gastos-extras':
                return this.storage.getGastosExtras();
            default:
                return null;
        }
    }

    getItemsArray(data) {
        if (!data) return [];
        return data.desglose || data.items || [];
    }

    getItemData(type, itemId) {
        const data = this.getStorageData(type);
        const items = this.getItemsArray(data);
        return items.find(item => item.id === itemId);
    }

    updateItemField(type, itemId, fieldType, newValue) {
        try {
            const data = this.getStorageData(type);
            const items = this.getItemsArray(data);
            const item = items.find(item => item.id === itemId);
            
            if (!item) return false;

            if (fieldType === 'amount') {
                item.monto = newValue;
            } else {
                if (item.categoria !== undefined) {
                    item.categoria = newValue;
                } else if (item.fuente !== undefined) {
                    item.fuente = newValue;
                }
            }

            item.fechaModificacion = new Date().toISOString();

            data.total = items
                .filter(item => item.activo !== false)
                .reduce((total, item) => total + (item.monto || 0), 0);

            return this.saveStorageData(type, data);

        } catch (error) {
            console.error('❌ Error actualizando item:', error);
            return false;
        }
    }

    saveStorageData(type, data) {
        try {
            switch (type) {
                case 'income':
                    return this.storage.setIngresos(data);
                case 'gastos-fijos':
                    return this.storage.setGastosFijos(data);
                case 'gastos-variables':
                    return this.storage.setGastosVariables(data);
                case 'gastos-extras':
                    return this.storage.setGastosExtras(data);
                default:
                    return false;
            }
        } catch (error) {
            console.error('❌ Error guardando en storage:', error);
            return false;
        }
    }

    /**
     * UTILIDADES
     */

    generateId(type) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 5);
        return `${type}_${timestamp}_${random}`;
    }

    formatCurrency(amount) {
        if (this.currency) {
            return this.currency.format(amount);
        }
        return `$${amount.toLocaleString('es-CL')}`;
    }

    formatCurrencyInput(amount) {
        return amount ? amount.toLocaleString('es-CL') : '';
    }

    formatCurrencyAsYouType(input) {
        const value = input.value.replace(/[^\d]/g, '');
        if (value) {
            input.value = parseInt(value).toLocaleString('es-CL');
        }
    }

    parseCurrencyInput(value) {
        return parseInt(value.replace(/[^\d]/g, '')) || 0;
    }

    parseCurrencyText(text) {
        return parseInt(text.replace(/[^\d]/g, '')) || 0;
    }

    validateInlineValue(fieldType, value) {
        if (fieldType === 'amount') {
            return value > 0 && value <= 999999999;
        } else {
            return value.length >= 2 && value.length <= 50;
        }
    }

    getNameElement(itemElement) {
        const selectors = ['.breakdown-name', '.expense-name', '.gasto-nome'];
        for (const selector of selectors) {
            const element = itemElement.querySelector(selector);
            if (element) return element;
        }
        return null;
    }

    getAmountElement(itemElement) {
        const selectors = ['.breakdown-amount', '.expense-amount', '.gasto-monto'];
        for (const selector of selectors) {
            const element = itemElement.querySelector(selector);
            if (element) return element;
        }
        return null;
    }

    showMessage(message, type = 'info') {
        if (window.modalSystem && window.modalSystem.showMessage) {
            window.modalSystem.showMessage(message, type);
            return;
        }

        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '10001',
            backgroundColor: type === 'success' ? '#10b981' : '#ef4444'
        });

        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 3000);
    }

    showInlineError(message) {
        console.error('❌ Error inline:', message);
        this.showMessage(message, 'error');
    }

    /**
     * 🚀 NUEVO: REFRESCO INTELIGENTE SIN PESTAÑEO
     */
    smartRefresh(type, actionType = 'general') {
    console.log(`🧠 Refresco inteligente: ${type} - ${actionType}`);

    if (type === 'income') {
        // 🎯 SOLUCIÓN: Usar actualización optimizada sin recargar tabla
        console.log('✅ Usando actualización optimizada SIN recargar tabla');
        
        // Solo actualizar totales y estadísticas, NO recargar tabla
        if (window.gastosManager) {
            window.gastosManager.updateHeaderTotals();
        }
        
        // Si hay tabla mejorada, solo recalcular porcentajes
        if (window.incomeTableEnhanced) {
            window.incomeTableEnhanced.recalculatePercentages();
        }
        
        console.log('✅ Actualización inteligente completada SIN refresco');
        return;
    } else if (type === 'expenses' || type === 'fixed' || type === 'variable' || type === 'extra') {
        // 🆕 GASTOS: Usar actualización optimizada sin recargar sección
        console.log('✅ Usando actualización optimizada para GASTOS SIN recargar sección');
        
        // Solo actualizar totales y estadísticas
        if (window.gastosManager) {
            window.gastosManager.updateHeaderTotals();
        }
        
        console.log('✅ Actualización de gastos completada SIN refresco');
        return;
    } else {
        // Para otros tipos, usar refresh normal
        this.refreshView();
    }
}

    /**
     * Refrescar vista (método tradicional para compatibilidad)
     */
    refreshView() {
        const currentView = this.detectCurrentView();
        console.log(`🔄 Refrescando vista: ${currentView}`);

        if (window.gastosManager) {
            setTimeout(() => {
                switch (currentView) {
                    case 'fixed-variable':
                        window.gastosManager.showFijosVariablesView();
                        break;
                    case 'income':
                        window.gastosManager.switchView('income');
                        break;
                    case 'expenses':
                        window.gastosManager.switchView('expenses');
                        break;
                    case 'extras':
                        window.gastosManager.switchView('extras');
                        break;
                    default:
                        window.gastosManager.loadGastosView();
                }
                
                window.gastosManager.updateHeaderTotals();
            }, 100);
        }

        setTimeout(() => {
            this.bindExistingElements();
        }, 200);
    }

    showEditModal(type, itemId, itemData) {
        console.log('📝 Abriendo modal de edición:', type, itemId);
        const name = itemData.categoria || itemData.fuente;
        const amount = this.formatCurrency(itemData.monto);
        alert(`Editar "${name}": ${amount}\n\nUsa doble clic para edición inline rápida`);
    }

    /**
     * 🗑️ CONFIRMACIÓN DE ELIMINACIÓN - OPTIMIZADA SIN PESTAÑEO
     */
    showDeleteConfirmation(type, itemId, itemData) {
        const name = itemData.categoria || itemData.fuente;
        const amount = this.formatCurrency(itemData.monto);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay modern-overlay';
        
        modal.innerHTML = `
            <div class="modal-content modern-modal">
                <div class="modal-header-modern">
                    <button class="modal-close-modern" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                
                <div class="modal-body-modern">
                    <h2 class="delete-title">Esta acción no se puede deshacer.</h2>
                    <p class="delete-message">¿Estás seguro de que quieres eliminar "${name}"?</p>
                </div>
                
                <div class="modal-footer-modern">
                    <button class="btn-cancel-modern" onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button class="btn-confirm-modern" onclick="this.confirmDelete()">
                        Confirmar
                    </button>
                </div>
            </div>
        `;
        
        // 🔧 FUNCIÓN OPTIMIZADA SIN PESTAÑEO
        modal.querySelector('.btn-confirm-modern').onclick = () => {
            this.deleteItemOptimized(type, itemId);
            modal.remove();
        };
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);
    }

    /**
     * 🚀 ELIMINAR ITEM OPTIMIZADO - SIN PESTAÑEO
     */
    deleteItemOptimized(type, itemId) {
        try {
            const data = this.getStorageData(type);
            const items = this.getItemsArray(data);
            
            const index = items.findIndex(item => item.id === itemId);
            if (index === -1) {
                this.showMessage('Elemento no encontrado', 'error');
                return false;
            }

            // Eliminar del array
            items.splice(index, 1);
            
            // Recalcular total
            data.total = items
                .filter(item => item.activo !== false)
                .reduce((total, item) => total + (item.monto || 0), 0);

            // Guardar datos
            const success = this.saveStorageData(type, data);
            
            if (success) {
    // 🎯 ACTUALIZACIÓN OPTIMIZADA SIN REFRESCO
    // Detectar si estamos en vista combinada o individual
    const isViewCombinada = document.querySelector('.expenses-grid') !== null;
    if (isViewCombinada) {
        // Mantener vista combinada "Gastos Fijos y Variables"
        window.gastosManager.showFijosVariablesView();
    } else {
        // Vista individual normal
        window.gastosManager.loadGastosView();
    }
    
    // Reactivar menú contextual
    setTimeout(() => {
        if (window.contextualManager) {
            window.contextualManager.bindExistingElements();
        }
    }, 200);
    
    this.showMessage('Elemento eliminado correctamente', 'success');
} else {
    this.showMessage('Error al eliminar elemento', 'error');
}
            
            return success;

        } catch (error) {
            console.error('❌ Error eliminando item:', error);
            this.showMessage('Error al eliminar elemento', 'error');
            return false;
        }
    }

    /**
     * Método público para refrescar desde otros módulos
     */
    refresh() {
        console.log('🔄 Refrescando ContextualManager...');
        this.closeContextMenu();
        this.cancelInlineEdit();
        
        const boundContainers = document.querySelectorAll('[data-contextual-bound]');
        boundContainers.forEach(container => {
            container.removeAttribute('data-contextual-bound');
        });
        
        this.bindExistingElements();
    }
}

// Crear instancia global
window.contextualManager = new ContextualManager();

console.log('🎯 contextual-manager.js v1.3 OPTIMIZADO cargado - SIN PESTAÑEO');