/**
 * PERIOD-NAVIGATOR-FIXED.JS - Navegación Temporal Corregida para Dashboard Real
 * WiseSpend - Control de Gastos Familiares
 * Versión: 1.1.0 - CORRECCIÓN PARA ESTRUCTURA REAL
 * 
 * 🔧 CORRECCIONES:
 * ✅ Detecta automáticamente el header correcto
 * ✅ Se adapta a cualquier estructura de DOM
 * ✅ Más selectores de fallback
 * ✅ Debug mejorado para diagnosticar problemas
 */

class PeriodNavigator {
    constructor() {
        this.temporalManager = null;
        this.isInitialized = false;
        this.selectorElement = null;
        
        // Elementos de UI
        this.dropdownElement = null;
        this.currentPeriodDisplay = null;
        this.periodsListContainer = null;
        
        // Estado de UI
        this.isDropdownOpen = false;
        this.currentActivePeriod = null;
        
        // Configuración de UI CORREGIDA - Múltiples selectores de fallback
        this.config = {
            insertAfterElement: [
                '.dashboard-title',          // Selector original
                'h1',                       // Cualquier h1
                '.header-left h1',          // H1 en header izquierdo
                '.dashboard-header h1',     // H1 en header del dashboard
                '.mock-title',              // Para testing
                'header h1',               // H1 en cualquier header
                '.header-content h1'       // H1 en contenido de header
            ],
            maxVisiblePeriods: 8,
            enableKeyboardNavigation: true,
            showCreateButton: true,
            debug: true // Habilitar debug para diagnóstico
        };
        
        this.initializeNavigator();
    }

    /**
     * INICIALIZACIÓN DEL NAVEGADOR
     */
    
    /**
     * Inicializar navegador de períodos
     */
    async initializeNavigator() {
        console.log('🧭 Inicializando PeriodNavigator v1.1.0...');
        
        try {
            // 1. Inicializar TemporalManager
            await this.initializeTemporalManager();
            
            // 2. Diagnosticar estructura del DOM
            this.diagnoseDOMStructure();
            
            // 3. Crear interfaz de navegación
            await this.createNavigationInterface();
            
            // 4. Configurar event listeners
            this.setupEventListeners();
            
            // 5. Cargar datos iniciales
            this.loadInitialData();
            
            this.isInitialized = true;
            console.log('✅ PeriodNavigator inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando PeriodNavigator:', error);
            this.handleInitializationError(error);
        }
    }
    
    /**
     * Diagnosticar estructura del DOM
     */
    diagnoseDOMStructure() {
        if (!this.config.debug) return;
        
        console.log('🔍 Diagnosticando estructura del DOM...');
        
        // Buscar todos los posibles elementos donde insertar
        this.config.insertAfterElement.forEach((selector, index) => {
            const element = document.querySelector(selector);
            console.log(`  ${index + 1}. ${selector}: ${element ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
            if (element) {
                console.log(`     Texto: "${element.textContent.trim().substring(0, 50)}..."`);
                console.log(`     Padre: ${element.parentNode?.tagName}.${element.parentNode?.className}`);
            }
        });
        
        // Buscar headers en general
        const allHeaders = document.querySelectorAll('h1, h2, .header, .dashboard-header, [class*="header"]');
        console.log(`🔍 Total elementos tipo header encontrados: ${allHeaders.length}`);
        allHeaders.forEach((header, index) => {
            console.log(`  Header ${index + 1}: ${header.tagName}.${header.className} - "${header.textContent.trim().substring(0, 30)}..."`);
        });
    }
    
    /**
     * Inicializar TemporalManager
     */
    async initializeTemporalManager() {
        // Verificar dependencias
        if (!window.TemporalManager) {
            throw new Error('TemporalManager no está disponible');
        }
        
        this.temporalManager = new window.TemporalManager();
        await this.waitForManagerReady();
        
        console.log('🎯 TemporalManager inicializado en Navigator');
    }
    
    /**
     * Esperar a que el manager esté listo
     */
    waitForManagerReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.temporalManager && this.temporalManager.isInitialized) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }
    
    /**
     * Crear interfaz de navegación en el header
     */
    async createNavigationInterface() {
        console.log('🎨 Creando interfaz de navegación...');
        
        // 1. Crear elemento contenedor
        this.createSelectorContainer();
        
        // 2. Insertar en el header
        await this.insertIntoHeader();
        
        // 3. Crear elementos internos
        this.createDropdownElements();
        
        // 4. Aplicar estilos
        this.applyNavigationStyles();
        
        console.log('✅ Interfaz de navegación creada');
    }
    
    /**
     * Crear contenedor del selector
     */
    createSelectorContainer() {
        this.selectorElement = document.createElement('div');
        this.selectorElement.className = 'period-navigator';
        this.selectorElement.innerHTML = `
            <div class="period-selector" id="period-selector">
                <div class="period-display" id="period-display">
                    <span class="period-icon">📅</span>
                    <span class="period-text" id="period-text">Cargando...</span>
                    <span class="dropdown-arrow">▼</span>
                </div>
                <div class="period-dropdown" id="period-dropdown">
                    <div class="periods-list" id="periods-list">
                        <!-- Los períodos se cargan dinámicamente -->
                    </div>
                    <div class="periods-actions">
                        <button class="btn-create-period" id="btn-create-period">
                            🆕 Crear Período...
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Referencias a elementos
        this.dropdownElement = this.selectorElement.querySelector('#period-dropdown');
        this.currentPeriodDisplay = this.selectorElement.querySelector('#period-text');
        this.periodsListContainer = this.selectorElement.querySelector('#periods-list');
    }
    
    /**
     * Insertar en el header - VERSIÓN MEJORADA CON MÚLTIPLES FALLBACKS
     */
    async insertIntoHeader() {
        return new Promise((resolve) => {
            const insertAfter = () => {
                let titleElement = null;
                let usedSelector = '';
                
                // Buscar elemento usando múltiples selectores
                for (const selector of this.config.insertAfterElement) {
                    titleElement = document.querySelector(selector);
                    if (titleElement) {
                        usedSelector = selector;
                        break;
                    }
                }
                
                if (titleElement) {
                    // Verificar si el elemento padre puede contener el selector
                    const parentNode = titleElement.parentNode;
                    
                    if (parentNode) {
                        // Insertar después del elemento encontrado
                        parentNode.insertBefore(this.selectorElement, titleElement.nextSibling);
                        console.log(`📍 Selector insertado después de: ${usedSelector}`);
                        console.log(`   Texto del elemento: "${titleElement.textContent.trim().substring(0, 40)}..."`);
                        resolve();
                    } else {
                        console.warn('⚠️ Elemento encontrado pero sin padre, buscando alternativa...');
                        this.insertAsFloating();
                        resolve();
                    }
                } else {
                    console.warn('⚠️ No se encontró ningún elemento header, intentando inserción flotante...');
                    // Fallback: insertar como elemento flotante
                    this.insertAsFloating();
                    resolve();
                }
            };
            
            // Intentar inserción inmediata, y si falla, reintentar
            insertAfter();
        });
    }
    
    /**
     * Insertar como elemento flotante (fallback)
     */
    insertAsFloating() {
        console.log('🔄 Insertando selector como elemento flotante...');
        
        // Buscar el body o cualquier contenedor principal
        const container = document.querySelector('body') || document.documentElement;
        
        // Crear contenedor flotante
        const floatingContainer = document.createElement('div');
        floatingContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        floatingContainer.appendChild(this.selectorElement);
        container.appendChild(floatingContainer);
        
        console.log('📍 Selector insertado como elemento flotante');
    }
    
    /**
     * Crear elementos del dropdown
     */
    createDropdownElements() {
        const selector = this.selectorElement.querySelector('#period-selector');
        const display = this.selectorElement.querySelector('#period-display');
        
        // Event listener para mostrar/ocultar dropdown
        display.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Event listener para crear período
        const createBtn = this.selectorElement.querySelector('#btn-create-period');
        createBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCreatePeriodModal();
        });
        
        // Cerrar dropdown al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!this.selectorElement.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }
    
    /**
     * Aplicar estilos de navegación
     */
    applyNavigationStyles() {
        // Verificar si ya existen estilos
        if (document.querySelector('#period-navigator-styles')) {
            return;
        }
        
        // Crear e insertar estilos CSS
        const styleSheet = document.createElement('style');
        styleSheet.id = 'period-navigator-styles';
        styleSheet.textContent = this.getNavigationCSS();
        document.head.appendChild(styleSheet);
        
        console.log('🎨 Estilos de navegación aplicados');
    }
    
    /**
     * Obtener CSS para navegación - VERSIÓN MEJORADA
     */
    getNavigationCSS() {
        return `
            .period-navigator {
                margin-left: 24px;
                position: relative;
                z-index: 1000;
                display: inline-block;
            }
            
            .period-selector {
                position: relative;
                display: inline-block;
            }
            
            .period-display {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                color: #1f2937;
                min-width: 180px;
                font-family: inherit;
                font-size: 14px;
                font-weight: 500;
            }
            
            .period-display:hover {
                background: rgba(59, 130, 246, 0.15);
                border-color: rgba(59, 130, 246, 0.5);
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
            }
            
            .period-icon {
                font-size: 16px;
            }
            
            .period-text {
                font-weight: 500;
                flex: 1;
                text-align: left;
                color: #1f2937;
            }
            
            .dropdown-arrow {
                font-size: 12px;
                transition: transform 0.2s ease;
                color: #6b7280;
            }
            
            .period-selector.open .dropdown-arrow {
                transform: rotate(180deg);
            }
            
            .period-dropdown {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-10px);
                transition: all 0.2s ease;
                margin-top: 4px;
                z-index: 1001;
                max-height: 400px;
                overflow-y: auto;
                min-width: 250px;
            }
            
            .period-dropdown.open {
                opacity: 1;
                visibility: visible;
                transform: translateY(0);
            }
            
            .periods-list {
                padding: 8px 0;
            }
            
            .period-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                cursor: pointer;
                transition: background-color 0.15s ease;
                border-bottom: 1px solid #f3f4f6;
            }
            
            .period-item:last-child {
                border-bottom: none;
            }
            
            .period-item:hover {
                background-color: #f9fafb;
            }
            
            .period-item.current {
                background-color: #e0f2fe;
                border-left: 4px solid #0ea5e9;
            }
            
            .period-info {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .period-status {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 14px;
                font-weight: 500;
            }
            
            .period-name {
                color: #374151;
                font-weight: 500;
            }
            
            .period-state {
                font-size: 12px;
                padding: 2px 8px;
                border-radius: 12px;
                font-weight: 500;
                text-transform: uppercase;
            }
            
            .period-state.active {
                background: #d1fae5;
                color: #065f46;
            }
            
            .period-state.archived {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .period-state.unlocked {
                background: #fef3c7;
                color: #92400e;
            }
            
            .period-state.preparing {
                background: #e0f2fe;
                color: #0c4a6e;
            }
            
            .period-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .period-action-btn {
                padding: 4px 8px;
                font-size: 11px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                transition: all 0.15s ease;
            }
            
            .period-action-btn.primary {
                background: #3b82f6;
                color: white;
            }
            
            .period-action-btn.primary:hover {
                background: #2563eb;
            }
            
            .period-action-btn.secondary {
                background: #f3f4f6;
                color: #6b7280;
            }
            
            .period-action-btn.secondary:hover {
                background: #e5e7eb;
                color: #374151;
            }
            
            .period-action-btn.success {
                background: #10b981;
                color: white;
            }
            
            .period-action-btn.success:hover {
                background: #059669;
            }
            
            .period-action-btn.warning {
                background: #f59e0b;
                color: white;
            }
            
            .period-action-btn.warning:hover {
                background: #d97706;
            }
            
            .periods-actions {
                padding: 12px 16px;
                border-top: 1px solid #f3f4f6;
                background: #fafbfc;
            }
            
            .btn-create-period {
                width: 100%;
                padding: 8px 12px;
                background: #10b981;
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.15s ease;
                font-size: 14px;
            }
            
            .btn-create-period:hover {
                background: #059669;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .period-navigator {
                    margin-left: 12px;
                }
                
                .period-display {
                    min-width: 140px;
                    padding: 6px 12px;
                }
                
                .period-text {
                    font-size: 13px;
                }
                
                .period-dropdown {
                    max-height: 300px;
                    min-width: 200px;
                }
            }
        `;
    }

    /**
     * RESTO DE MÉTODOS - Mantenemos los mismos del archivo original
     * (loadInitialData, updateCurrentPeriodDisplay, etc.)
     */
    
    /**
     * Cargar datos iniciales
     */
    loadInitialData() {
        this.currentActivePeriod = this.temporalManager.currentActivePeriod;
        this.updateCurrentPeriodDisplay();
        this.loadPeriodsIntoDropdown();
    }
    
    /**
     * Actualizar display del período actual
     */
    updateCurrentPeriodDisplay() {
        if (this.currentPeriodDisplay && this.currentActivePeriod) {
            const displayName = this.temporalManager.formatPeriodDisplay(this.currentActivePeriod);
            this.currentPeriodDisplay.textContent = displayName;
        }
    }
    
    /**
     * Cargar períodos en el dropdown
     */
    loadPeriodsIntoDropdown() {
        if (!this.periodsListContainer || !this.temporalManager) return;
        
        const periodsInfo = this.temporalManager.getPeriodsInfo();
        const periodsHTML = periodsInfo.map(period => this.createPeriodItemHTML(period)).join('');
        
        this.periodsListContainer.innerHTML = periodsHTML;
        this.attachPeriodItemListeners();
    }
    
    /**
     * Crear HTML para item de período
     */
    createPeriodItemHTML(periodData) {
        const { period, state, displayName, isCurrent, canActivate, canUnlock, canSwitch } = periodData;
        
        // Icono por estado
        const stateIcons = {
            active: '🟢',
            archived: '🔒',
            unlocked: '🔓',
            preparing: '🟡'
        };
        
        // Acciones disponibles
        let actionsHTML = '';
        
        if (canActivate) {
            actionsHTML += `<button class="period-action-btn success" data-action="activate" data-period="${period}">✅ Activar</button>`;
        }
        
        if (canUnlock) {
            actionsHTML += `<button class="period-action-btn warning" data-action="unlock" data-period="${period}">🔓 Desbloquear</button>`;
        }
        
        if (canSwitch && !isCurrent) {
            actionsHTML += `<button class="period-action-btn primary" data-action="switch" data-period="${period}">📂 Abrir</button>`;
        }
        
        if (state === 'unlocked') {
            actionsHTML += `<button class="period-action-btn secondary" data-action="lock" data-period="${period}">🔒 Re-bloquear</button>`;
        }
        
        return `
            <div class="period-item ${isCurrent ? 'current' : ''}" data-period="${period}">
                <div class="period-info">
                    <div class="period-status">
                        <span class="period-icon">${stateIcons[state] || '📅'}</span>
                        <span class="period-name">${displayName}</span>
                    </div>
                    <span class="period-state ${state}">${this.getStateLabel(state)}</span>
                </div>
                <div class="period-actions">
                    ${actionsHTML}
                </div>
            </div>
        `;
    }
    
    /**
     * Obtener etiqueta de estado
     */
    getStateLabel(state) {
        const labels = {
            active: 'Activo',
            archived: 'Archivado',
            unlocked: 'Desbloqueado',
            preparing: 'Preparando'
        };
        return labels[state] || state;
    }
    
    /**
     * Adjuntar listeners a items de período
     */
    attachPeriodItemListeners() {
        const actionButtons = this.periodsListContainer.querySelectorAll('.period-action-btn');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = button.dataset.action;
                const period = button.dataset.period;
                this.handlePeriodAction(action, period);
            });
        });
        
        // Listener para cambio rápido al hacer clic en el item
        const periodItems = this.periodsListContainer.querySelectorAll('.period-item');
        periodItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.classList.contains('period-action-btn')) return;
                
                const period = item.dataset.period;
                if (period !== this.currentActivePeriod) {
                    this.handlePeriodAction('switch', period);
                }
            });
        });
    }

    /**
     * MANEJO DE ACCIONES - Versión simplificada para evitar errores
     */
    
    async handlePeriodAction(action, period) {
        console.log(`🎬 Acción: ${action} en período: ${period}`);
        
        this.closeDropdown();
        
        try {
            switch (action) {
                case 'switch':
                    await this.switchToPeriod(period);
                    break;
                case 'activate':
                    await this.activatePeriod(period);
                    break;
                case 'unlock':
                    await this.unlockPeriod(period);
                    break;
                case 'lock':
                    await this.lockPeriod(period);
                    break;
                default:
                    console.warn(`Acción desconocida: ${action}`);
            }
        } catch (error) {
            console.error(`Error ejecutando acción ${action}:`, error);
            this.showError(`Error: ${error.message}`);
        }
    }
    
    /**
     * Cambiar a período
     */
    async switchToPeriod(period) {
        try {
            this.showLoading(`Cambiando a ${this.temporalManager.formatPeriodDisplay(period)}...`);
            
            const success = await this.temporalManager.switchToPeriod(period);
            
            if (success) {
                this.currentActivePeriod = period;
                this.updateCurrentPeriodDisplay();
                this.loadPeriodsIntoDropdown();
                this.showSuccess(`Período cambiado exitosamente`);
            } else {
                this.showError('Error cambiando período');
            }
            
        } catch (error) {
            console.error('Error en switchToPeriod:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * Activar período
     */
    async activatePeriod(period) {
        if (!confirm(`¿Activar el período ${this.temporalManager.formatPeriodDisplay(period)}? El período actual será archivado.`)) {
            return;
        }
        
        try {
            this.showLoading('Activando período...');
            
            const success = await this.temporalManager.activatePeriod(period);
            
            if (success) {
                this.currentActivePeriod = period;
                this.updateCurrentPeriodDisplay();
                this.loadPeriodsIntoDropdown();
                this.showSuccess('Período activado exitosamente');
            } else {
                this.showError('Error activando período');
            }
            
        } catch (error) {
            console.error('Error en activatePeriod:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * Desbloquear período
     */
    async unlockPeriod(period) {
        if (!confirm(`¿Desbloquear el período ${this.temporalManager.formatPeriodDisplay(period)} para edición libre?`)) {
            return;
        }
        
        try {
            this.showLoading('Desbloqueando período...');
            
            const success = await this.temporalManager.unlockPeriod(period);
            
            if (success) {
                this.loadPeriodsIntoDropdown();
                this.showSuccess('Período desbloqueado. Puedes editarlo libremente.');
            } else {
                this.showError('Error desbloqueando período');
            }
            
        } catch (error) {
            console.error('Error en unlockPeriod:', error);
            this.showError(error.message);
        }
    }
    
    /**
     * Re-bloquear período
     */
    async lockPeriod(period) {
        if (!confirm(`¿Re-bloquear el período ${this.temporalManager.formatPeriodDisplay(period)}?`)) {
            return;
        }
        
        try {
            this.showLoading('Re-bloqueando período...');
            
            const success = await this.temporalManager.lockPeriod(period);
            
            if (success) {
                this.loadPeriodsIntoDropdown();
                this.showSuccess('Período re-bloqueado exitosamente');
            } else {
                this.showError('Error re-bloqueando período');
            }
            
        } catch (error) {
            console.error('Error en lockPeriod:', error);
            this.showError(error.message);
        }
    }

    /**
     * DROPDOWN MANAGEMENT
     */
    
    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        if (!this.dropdownElement) return;
        
        this.loadPeriodsIntoDropdown();
        
        this.dropdownElement.classList.add('open');
        this.selectorElement.querySelector('#period-selector').classList.add('open');
        this.isDropdownOpen = true;
    }
    
    closeDropdown() {
        if (!this.dropdownElement) return;
        
        this.dropdownElement.classList.remove('open');
        this.selectorElement.querySelector('#period-selector').classList.remove('open');
        this.isDropdownOpen = false;
    }

    /**
     * MODAL DE CREACIÓN - Versión simplificada
     */
    
    showCreatePeriodModal() {
        this.closeDropdown();
        
        const modal = this.createCreatePeriodModal();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            const input = modal.querySelector('#new-period-input');
            if (input) input.focus();
        }, 100);
    }
    
    createCreatePeriodModal() {
        const modal = document.createElement('div');
        modal.className = 'period-create-modal';
        modal.innerHTML = `
            <div class="modal-overlay" id="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🆕 Crear Nuevo Período</h3>
                    <button class="modal-close" id="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="new-period-input">Período (YYYY-MM):</label>
                        <input type="text" id="new-period-input" placeholder="2025-08" pattern="\\d{4}-\\d{2}">
                        <small>Formato: Año-Mes (ej: 2025-08 para Agosto 2025)</small>
                    </div>
                    <div class="form-group">
                        <label for="clone-source-select">Clonar desde:</label>
                        <select id="clone-source-select">
                            ${this.getCloneSourceOptions()}
                        </select>
                        <small>Los datos se copiarán desde el período seleccionado</small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="btn-cancel">Cancelar</button>
                    <button class="btn btn-primary" id="btn-create">🆕 Crear Período</button>
                </div>
            </div>
        `;
        
        // Agregar estilos del modal
        modal.innerHTML += `<style>${this.getModalCSS()}</style>`;
        
        // Event listeners
        modal.querySelector('#modal-close').addEventListener('click', () => this.closeCreateModal(modal));
        modal.querySelector('#modal-overlay').addEventListener('click', () => this.closeCreateModal(modal));
        modal.querySelector('#btn-cancel').addEventListener('click', () => this.closeCreateModal(modal));
        modal.querySelector('#btn-create').addEventListener('click', () => this.handleCreatePeriod(modal));
        
        // Enter para crear
        modal.querySelector('#new-period-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleCreatePeriod(modal);
            }
        });
        
        return modal;
    }
    
    getCloneSourceOptions() {
        if (!this.temporalManager) return '<option value="">No disponible</option>';
        
        try {
            const periodsInfo = this.temporalManager.getPeriodsInfo();
            const validPeriods = periodsInfo.filter(p => p.state !== 'preparing');
            
            return validPeriods.map(period => {
                const selected = period.isCurrent ? 'selected' : '';
                return `<option value="${period.period}" ${selected}>${period.displayName}</option>`;
            }).join('');
        } catch (error) {
            console.error('Error obteniendo opciones de clonación:', error);
            return '<option value="">Error cargando opciones</option>';
        }
    }
    
    async handleCreatePeriod(modal) {
        const periodInput = modal.querySelector('#new-period-input').value.trim();
        const sourceSelect = modal.querySelector('#clone-source-select').value;
        
        if (!periodInput) {
            this.showError('Por favor ingresa un período válido');
            return;
        }
        
        const periodFormatted = periodInput.replace('-', '_');
        
        if (!/^\d{4}_\d{2}$/.test(periodFormatted)) {
            this.showError('Formato inválido. Use YYYY-MM (ej: 2025-08)');
            return;
        }
        
        try {
            this.closeCreateModal(modal);
            this.showLoading('Creando período...');
            
            const success = await this.temporalManager.createNewPeriod(periodFormatted, sourceSelect);
            
            if (success) {
                this.loadPeriodsIntoDropdown();
                this.showSuccess(`Período ${this.temporalManager.formatPeriodDisplay(periodFormatted)} creado exitosamente`);
            } else {
                this.showError('Error creando período');
            }
            
        } catch (error) {
            console.error('Error en handleCreatePeriod:', error);
            this.showError(error.message);
        }
    }
    
    closeCreateModal(modal) {
        modal.remove();
    }
    
    getModalCSS() {
        return `
            .period-create-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }
            
            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid #e5e7eb;
            }
            
            .modal-header h3 {
                margin: 0;
                color: #1f2937;
                font-size: 18px;
                font-weight: 600;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 0;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: background-color 0.15s ease;
            }
            
            .modal-close:hover {
                background: #f3f4f6;
                color: #374151;
            }
            
            .modal-body {
                padding: 24px;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 6px;
                color: #374151;
                font-weight: 500;
                font-size: 14px;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 10px 12px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                transition: border-color 0.15s ease, box-shadow 0.15s ease;
                box-sizing: border-box;
            }
            
            .form-group input:focus,
            .form-group select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .form-group small {
                display: block;
                margin-top: 4px;
                color: #6b7280;
                font-size: 12px;
            }
            
            .modal-footer {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding: 20px 24px;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
                border-radius: 0 0 12px 12px;
            }
            
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 6px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.15s ease;
                font-size: 14px;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
        `;
    }

    /**
     * NOTIFICACIONES
     */
    
    showLoading(message) {
        this.removeExistingToasts();
        
        const toast = document.createElement('div');
        toast.className = 'period-toast loading';
        toast.innerHTML = `
            <div class="toast-content">
                <div class="spinner"></div>
                <span>${message}</span>
            </div>
            <style>${this.getToastCSS()}</style>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
    }
    
    showSuccess(message) {
        this.removeExistingToasts();
        
        const toast = document.createElement('div');
        toast.className = 'period-toast success';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">✅</span>
                <span>${message}</span>
            </div>
            <style>${this.getToastCSS()}</style>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.remove(), 3000);
    }
    
    showError(message) {
        this.removeExistingToasts();
        
        const toast = document.createElement('div');
        toast.className = 'period-toast error';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">❌</span>
                <span>${message}</span>
            </div>
            <style>${this.getToastCSS()}</style>
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => toast.remove(), 5000);
    }
    
    removeExistingToasts() {
        const existingToasts = document.querySelectorAll('.period-toast');
        existingToasts.forEach(toast => toast.remove());
    }
    
    getToastCSS() {
        return `
            .period-toast {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-20px);
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                z-index: 10001;
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: none;
                min-width: 300px;
                max-width: 500px;
            }
            
            .period-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
            
            .period-toast.success {
                border-left: 4px solid #10b981;
            }
            
            .period-toast.error {
                border-left: 4px solid #ef4444;
            }
            
            .period-toast.loading {
                border-left: 4px solid #3b82f6;
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                font-size: 14px;
                color: #1f2937;
            }
            
            .toast-icon {
                font-size: 16px;
            }
            
            .spinner {
                width: 16px;
                height: 16px;
                border: 2px solid #e5e7eb;
                border-top: 2px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
    }

    /**
     * EVENT LISTENERS
     */
    
    setupEventListeners() {
        // Eventos del TemporalManager
        window.addEventListener('temporalPeriodChanged', (e) => this.handlePeriodChanged(e));
        window.addEventListener('temporalPeriodCreated', (e) => this.handlePeriodCreated(e));
        window.addEventListener('temporalPeriodActivated', (e) => this.handlePeriodActivated(e));
        
        // Registrar callback de navegación en TemporalManager
        if (this.temporalManager) {
            this.temporalManager.registerNavigationCallback('periodNavigator', (targetPeriod) => {
                return this.handleNavigationCallback(targetPeriod);
            });
        }
    }
    
    handlePeriodChanged(e) {
        console.log('📅 Período cambiado:', e.detail);
        this.currentActivePeriod = e.detail.period;
        this.updateCurrentPeriodDisplay();
        this.loadPeriodsIntoDropdown();
    }
    
    handlePeriodCreated(e) {
        console.log('🆕 Período creado:', e.detail);
        this.loadPeriodsIntoDropdown();
    }
    
    handlePeriodActivated(e) {
        console.log('✅ Período activado:', e.detail);
        this.currentActivePeriod = e.detail.period;
        this.updateCurrentPeriodDisplay();
        this.loadPeriodsIntoDropdown();
    }
    
    handleNavigationCallback(targetPeriod) {
        console.log('🧭 Callback de navegación ejecutado:', targetPeriod);
        return Promise.resolve();
    }

    /**
     * UTILIDADES PÚBLICAS
     */
    
    getNavigatorState() {
        return {
            isInitialized: this.isInitialized,
            currentActivePeriod: this.currentActivePeriod,
            isDropdownOpen: this.isDropdownOpen,
            temporalManagerState: this.temporalManager ? this.temporalManager.getSystemState() : null
        };
    }
    
    refresh() {
        if (this.isInitialized) {
            this.loadInitialData();
            console.log('🔄 PeriodNavigator refrescado');
        }
    }
    
    forceUpdateCurrentPeriod() {
        if (this.temporalManager) {
            this.currentActivePeriod = this.temporalManager.currentActivePeriod;
            this.updateCurrentPeriodDisplay();
            this.loadPeriodsIntoDropdown();
        }
    }

    /**
     * MANEJO DE ERRORES
     */
    
    handleInitializationError(error) {
        console.error('🚨 Error crítico en inicialización de PeriodNavigator:', error);
        
        // Mostrar mensaje de error en el DOM
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            max-width: 300px;
        `;
        errorDiv.innerHTML = `
            <strong>⚠️ Error en Navegación Temporal</strong><br>
            <small>${error.message}</small>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 10000);
    }

    /**
     * DESTRUCTOR
     */
    
    destroy() {
        if (this.selectorElement && this.selectorElement.parentNode) {
            this.selectorElement.parentNode.removeChild(this.selectorElement);
        }
        
        if (this.temporalManager) {
            this.temporalManager.removeNavigationCallback('periodNavigator');
            this.temporalManager.destroy();
        }
        
        // Remover estilos
        const styles = document.querySelector('#period-navigator-styles');
        if (styles) styles.remove();
        
        this.temporalManager = null;
        this.selectorElement = null;
        this.isInitialized = false;
        
        console.log('🔧 PeriodNavigator destruido');
    }
}

// Asignar a window y crear instancia automática
window.PeriodNavigator = PeriodNavigator;

// Crear instancia automáticamente al cargar
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        if (!window.periodNavigator) {
            try {
                window.periodNavigator = new PeriodNavigator();
                console.log('🧭 PeriodNavigator iniciado automáticamente');
            } catch (error) {
                console.error('❌ Error iniciando PeriodNavigator automático:', error);
            }
        }
    }, 1000);
});

// Debug utilities
window.temporalNavigatorDebug = {
    getState: () => window.periodNavigator ? window.periodNavigator.getNavigatorState() : 'No inicializado',
    refresh: () => window.periodNavigator ? window.periodNavigator.refresh() : 'No disponible',
    openDropdown: () => {
        const displayEl = document.querySelector('.period-display');
        if (displayEl) displayEl.click();
    },
    closeDropdown: () => document.body.click(),
    showModal: () => window.periodNavigator ? window.periodNavigator.showCreatePeriodModal() : 'No disponible',
    diagnose: () => window.periodNavigator ? window.periodNavigator.diagnoseDOMStructure() : 'No disponible'
};

console.log('🧭 period-navigator-fixed.js v1.1.0 cargado - Navegación temporal con diagnóstico mejorado');
console.log('🛠️ Debug disponible en: window.temporalNavigatorDebug');