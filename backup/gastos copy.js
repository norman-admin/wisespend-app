/**
 * GASTOS.JS - Sistema de Gestión de Gastos COMPLETO
 * Presupuesto Familiar - Versión limpia y funcional
 * Versión: 1.3.0 - CON MENÚ CONTEXTUAL INTEGRADO
 * 
 * 🔧 CAMBIOS REALIZADOS:
 * ✅ Botón "Agregar Ingresos" del menú lateral → SOLO navegación (sin modal)
 * ✅ Modal de agregar ingresos → SOLO en botón azul del contenido
 * ✅ Sin funcionalidad duplicada
 * 🆕 AGREGADO: Menú contextual y edición inline
 * 🆕 AGREGADO: data-id en todos los elementos
 * 🆕 AGREGADO: Integración con contextualManager
 */

class GastosManager {
    constructor() {
        this.storage = window.storageManager;
        this.currentView = 'income'; // Por defecto income
        this.editingItem = null;
        
        if (!this.storage) {
            console.error('❌ StorageManager no está disponible');
            return;
        }

        this.initializeGastosManager();
        this.bindEvents();
        
        // 🆕 Asegurar IDs en elementos existentes
        this.ensureItemIds();
    }

    /**
     * Inicializa el sistema de gastos
     */
    initializeGastosManager() {
        console.log('💰 Inicializando Gestor de Gastos...');
        this.setupNavigation();
        console.log('✅ Gestor de Gastos inicializado correctamente');
    }

    /**
     * Configurar navegación - SIMPLIFICADO
     */
    setupNavigation() {
        // Configurar navegación básica
        setTimeout(() => {
            this.setupDashboardButtons();
        }, 500);
    }

    /**
     * Configurar botones del dashboard
     */
    setupDashboardButtons() {
        // Buscar botones del menú lateral por texto
        const menuButtons = document.querySelectorAll('.nav-item');
        menuButtons.forEach(btn => {
            const text = btn.textContent.trim().toLowerCase();
            
            // 🎯 CAMBIO CLAVE: Solo navegación, sin modal
            if (text.includes('agregar ingresos')) {
                btn.removeAttribute('onclick'); // Limpiar onclick del HTML
                btn.onclick = null; // Limpiar onclick programático también
                btn.onclick = () => this.switchView('income'); // SOLO navegación
                
            } else if (text.includes('agregar gastos')) {
                btn.onclick = () => this.switchView('expenses');
            } else if (text.includes('fijos') && text.includes('variables')) {
                btn.onclick = () => this.showFijosVariablesView();
            } else if (text.includes('gastos extras')) {
                btn.onclick = () => this.switchView('extras');
            }
        });
    }

    /**
     * Cambiar vista - SIMPLIFICADO
     */
    switchView(newView) {
        this.currentView = newView;
        this.loadGastosView();
        this.updateNavigationState();
    }

    /**
     * Actualizar navegación activa
     */
    updateNavigationState() {
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activar el botón correspondiente
        const menuButtons = document.querySelectorAll('.nav-item');
        menuButtons.forEach(btn => {
            const text = btn.textContent.trim().toLowerCase();
            if ((this.currentView === 'income' && text.includes('agregar ingresos')) ||
                (this.currentView === 'expenses' && text.includes('agregar gastos')) ||
                (this.currentView === 'extras' && text.includes('gastos extras'))) {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Cargar vista según el tipo - CON activación de menú contextual
     */
    loadGastosView() {
        const container = this.getMainContainer();
        if (!container) return;

        switch (this.currentView) {
            case 'income':
                this.renderIncomeSection(container);
                break;
            case 'expenses':
                this.renderExpensesSection(container);
                break;
            case 'fijos':
                this.renderGastosFijos(container);
                break;
            case 'variables':
                this.renderGastosVariables(container);
                break;
            case 'extras':
                this.renderGastosExtras(container);
                break;
            case 'reports':
                if (window.reportesManager) {
                    window.reportesManager.showReportView(container.id || 'dynamic-content');
                } else {
                    container.innerHTML = '<p>Sistema de reportes cargando...</p>';
                }
                break;
            default:
                this.renderIncomeSection(container);
        }

        this.updateHeaderTotals();
        
        // 🆕 ACTIVAR MENÚ CONTEXTUAL después de cada cambio de vista
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.refresh();
            }
        }, 150);
    }

    /**
     * Obtener contenedor principal
     */
    getMainContainer() {
        return document.querySelector('#dynamic-content') ||
               document.querySelector('.content-area') ||
               document.body;
    }

    /**
     * 🎯 RENDERIZAR SECCIÓN DE INGRESOS - CON data-id para menú contextual
     */
    renderIncomeSection(container) {
        const ingresos = this.storage.getIngresos();
        
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>Desglose de Ingresos</h2>
                    <div class="section-actions">
                        <button class="btn btn-primary" onclick="gastosManager.showAddIncomeModal()">
                            Agregar Ingresos
                        </button>
                    </div>
                </div>

                <div class="income-breakdown">
                    ${ingresos.desglose.map(item => {
                        // 🆕 Asegurar que el item tenga ID
                        if (!item.id) {
                            item.id = 'income_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                        }
                        
                        return `
                            <div class="breakdown-item" data-id="${item.id}">
                                <span class="breakdown-name">${item.fuente}</span>
                                <span class="breakdown-amount">${this.formatNumber(item.monto)}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="total-section">
                    <div class="total-line">
                        <span class="total-label">Total Ingresos:</span>
                        <span class="total-amount">${this.formatNumber(ingresos.total)}</span>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        
        // 🆕 ACTIVAR MENÚ CONTEXTUAL después de renderizar
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.refresh();
            }
        }, 100);
    }

    /**
     * 🆕 NUEVO: Modal para agregar ingresos (solo del botón azul)
     */
    showAddIncomeModal() {
        const modal = this.createIncomeModal();
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    /**
     * 🆕 NUEVO: Crear modal para ingresos
     */
    createIncomeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Agregar Nuevo Ingreso</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="incomeForm">
                        <div class="form-group">
                            <label for="fuente">Fuente de Ingreso:</label>
                            <input type="text" id="fuente" name="fuente" 
                                   placeholder="Ej: Sueldo, Freelance, etc." required>
                        </div>
                        <div class="form-group">
                            <label for="monto">Monto:</label>
                            <input type="number" id="monto" name="monto" 
                                   placeholder="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="activo" name="activo" checked>
                                Ingreso activo
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" 
                            onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" 
                            onclick="gastosManager.saveIncome()">
                        Agregar Ingreso
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * 🆕 NUEVO: Guardar nuevo ingreso
     */
    saveIncome() {
        const form = document.getElementById('incomeForm');
        const formData = new FormData(form);
        
        const incomeData = {
            fuente: formData.get('fuente'),
            monto: parseFloat(formData.get('monto')),
            activo: formData.get('activo') === 'on',
            id: 'income_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5) // 🆕 Agregar ID
        };

        if (!incomeData.fuente || !incomeData.monto) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        // Agregar al storage
        const ingresos = this.storage.getIngresos();
        ingresos.desglose.push(incomeData);
        ingresos.total = ingresos.desglose
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
        
        this.storage.setIngresos(ingresos);

        // Cerrar modal y recargar vista
        document.querySelector('.modal-overlay').remove();
        this.renderIncomeSection(this.getMainContainer());
        this.updateHeaderTotals();
        
        console.log('✅ Nuevo ingreso agregado:', incomeData);
    }

    /**
     * Renderizar sección de gastos (botones para elegir tipo)
     */
    renderExpensesSection(container) {
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>Agregar Gasto</h2>
                </div>

                <div class="add-expense-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Categoría</label>
                            <div class="category-info">
                                <span class="category-text">Seleccionar tipo de gasto</span>
                                <div class="add-expense-btn-container">
                                    <button class="btn btn-primary" onclick="gastosManager.showAddGastoModal('fijos')">
                                        Gasto Fijo
                                    </button>
                                    <button class="btn btn-primary" onclick="gastosManager.showAddGastoModal('variables')">
                                        Gasto Variable
                                    </button>
                                    <button class="btn btn-primary" onclick="gastosManager.showAddGastoModal('extras')">
                                        Gasto Extra
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
    }

    /**
     * Renderizar gastos fijos
     */
    renderGastosFijos(container) {
        const gastosFijos = this.storage.getGastosFijos();
        
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>Gastos Fijos</h2>
                </div>
                
                <div class="gastos-content">
                    <div class="gastos-list">
                        <div class="gastos-items">
                            ${gastosFijos.items.map(item => this.renderGastoItem(item, 'fijos')).join('')}
                        </div>
                        <div class="gastos-total-section">
                            <strong>Total Fijos: ${this.formatNumber(gastosFijos.total)}</strong>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        
        // 🆕 ACTIVAR MENÚ CONTEXTUAL después de renderizar
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.refresh();
            }
        }, 100);
    }

    /**
     * Renderizar gastos variables
     */
    renderGastosVariables(container) {
        const gastosVariables = this.storage.getGastosVariables();
        
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>Gastos Variables</h2>
                </div>
                
                <div class="gastos-content">
                    <div class="gastos-list">
                        <div class="gastos-items">
                            ${gastosVariables.items.map(item => this.renderGastoItem(item, 'variables')).join('')}
                        </div>
                        <div class="gastos-total-section">
                            <strong>Total Variables: ${this.formatNumber(gastosVariables.total)}</strong>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        
        // 🆕 ACTIVAR MENÚ CONTEXTUAL después de renderizar
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.refresh();
            }
        }, 100);
    }

    /**
     * Renderizar gastos extras
     */
    renderGastosExtras(container) {
        const gastosExtras = this.storage.getGastosExtras();
        const presupuesto = gastosExtras.presupuesto || 0;
        const porcentaje = gastosExtras.porcentaje || 10;
        
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>Gastos Extras</h2>
                </div>
                
                <div class="presupuesto-section">
                    <h3>Presupuesto Gasto Extra</h3>
                    <div class="presupuesto-input">
                        <label>${porcentaje}%</label>
                        <input type="number" value="${presupuesto}" id="presupuesto-extra" />
                    </div>
                </div>
                
                <div class="gastos-content">
                    <div class="gastos-list">
                        <h4>Gastos Extras</h4>
                        <div class="gastos-items">
                            ${gastosExtras.items.map(item => this.renderGastoItem(item, 'extras')).join('')}
                        </div>
                        <div class="gastos-total-section">
                            <strong>Total Extras: ${this.formatNumber(gastosExtras.total)}</strong>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        this.bindPresupuestoEvents();
        
        // 🆕 ACTIVAR MENÚ CONTEXTUAL después de renderizar
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.refresh();
            }
        }, 100);
    }

    /**
     * Vista combinada fijos y variables
     */
    showFijosVariablesView() {
        const container = this.getMainContainer();
        const gastosFijos = this.storage.getGastosFijos();
        const gastosVariables = this.storage.getGastosVariables();
        
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>Gastos Fijos y Variables</h2>
                    <div class="gastos-total">
                        <span>Total: ${this.formatNumber(gastosFijos.total + gastosVariables.total)}</span>
                    </div>
                </div>
                
                <div class="expenses-grid">
                    <div class="expenses-column">
                        <div class="expenses-header">
                            <h3>Gastos Fijos</h3>
                        </div>
                        <div class="expenses-list">
                            ${gastosFijos.items.map(item => this.renderGastoItem(item, 'fijos')).join('')}
                        </div>
                        <div class="expenses-total">
                            <span class="total-label">Total Fijos:</span>
                            <span class="total-amount">${this.formatNumber(gastosFijos.total)}</span>
                        </div>
                    </div>
                    
                    <div class="expenses-column">
                        <div class="expenses-header">
                            <h3>Gastos Variables</h3>
                        </div>
                        <div class="expenses-list">
                            ${gastosVariables.items.map(item => this.renderGastoItem(item, 'variables')).join('')}
                        </div>
                        <div class="expenses-total">
                            <span class="total-label">Total Variables:</span>
                            <span class="total-amount">${this.formatNumber(gastosVariables.total)}</span>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        
        // 🆕 ACTIVAR MENÚ CONTEXTUAL después de renderizar
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.refresh();
            }
        }, 100);
    }

    /**
     * Renderizar item de gasto con checkbox Y data-id para menú contextual
     */
    renderGastoItem(item, tipo) {
        const isActive = item.activo !== false;
        const isPaid = item.pagado === true;
        const activeClass = isActive ? 'active' : 'inactive';
        const paidClass = isPaid ? 'paid' : '';
        
        // 🆕 Asegurar que el item tenga ID
        if (!item.id) {
            item.id = this.generateId();
        }
        
        return `
            <div class="expense-item ${activeClass} ${paidClass}" data-id="${item.id}" data-tipo="${tipo}">
                <div class="expense-checkbox">
                    <input type="checkbox" ${isPaid ? 'checked' : ''} 
                           onchange="gastosManager.toggleGastoPagado('${item.id}', '${tipo}', this.checked)">
                </div>
                <div class="expense-details">
                    <span class="expense-name ${isPaid ? 'paid-text' : ''}">${item.categoria}</span>
                    <span class="expense-amount ${isPaid ? 'paid-text' : ''}">${this.formatNumber(item.monto)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Mostrar modal para agregar gasto
     */
    showAddGastoModal(tipo = 'fijos') {
        const modal = this.createGastoModal({
            title: `Agregar Gasto ${this.getTipoDisplayName(tipo)}`,
            tipo: tipo,
            isEdit: false
        });
        
        document.body.appendChild(modal);
        modal.style.display = 'flex';
    }

    /**
     * Crear modal para gasto
     */
    createGastoModal({ title, tipo, isEdit, data = {} }) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    <form id="gastoForm">
                        <div class="form-group">
                            <label for="categoria">Categoría:</label>
                            <input type="text" id="categoria" name="categoria" 
                                   value="${data.categoria || ''}" required>
                        </div>
                        <div class="form-group">
                            <label for="monto">Monto:</label>
                            <input type="number" id="monto" name="monto" 
                                   value="${data.monto || ''}" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="activo" name="activo" 
                                       ${data.activo !== false ? 'checked' : ''}>
                                Gasto activo
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" 
                            onclick="this.closest('.modal-overlay').remove()">
                        Cancelar
                    </button>
                    <button type="button" class="btn btn-primary" 
                            onclick="gastosManager.saveGasto('${tipo}', ${isEdit})">
                        ${isEdit ? 'Actualizar' : 'Agregar'}
                    </button>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Guardar gasto
     */
    saveGasto(tipo, isEdit) {
        const form = document.getElementById('gastoForm');
        const formData = new FormData(form);
        
        const gastoData = {
            categoria: formData.get('categoria'),
            monto: parseFloat(formData.get('monto')),
            activo: formData.get('activo') === 'on',
            id: isEdit ? this.editingItem.id : this.generateId()
        };

        if (!gastoData.categoria || !gastoData.monto) {
            alert('Por favor complete todos los campos requeridos');
            return;
        }

        this.addGasto(gastoData, tipo);
        document.querySelector('.modal-overlay').remove();
        this.loadGastosView();
    }

    /**
     * Agregar nuevo gasto
     */
    addGasto(gastoData, tipo) {
        let gastos;
        
        switch (tipo) {
            case 'fijos':
                gastos = this.storage.getGastosFijos();
                gastos.items.push(gastoData);
                gastos.total = this.calculateTotal(gastos.items);
                this.storage.setGastosFijos(gastos);
                break;
            case 'variables':
                gastos = this.storage.getGastosVariables();
                gastos.items.push(gastoData);
                gastos.total = this.calculateTotal(gastos.items);
                this.storage.setGastosVariables(gastos);
                break;
            case 'extras':
                gastos = this.storage.getGastosExtras();
                gastos.items.push(gastoData);
                gastos.total = this.calculateTotal(gastos.items);
                this.storage.setGastosExtras(gastos);
                break;
        }
    }

    /**
     * Toggle estado pagado/pendiente
     */
    toggleGastoPagado(id, tipo, isPagado) {
        const gasto = this.findGastoById(id, tipo);
        if (!gasto) return;

        gasto.pagado = isPagado;
        
        // Actualizar en storage
        let gastos;
        switch (tipo) {
            case 'fijos':
                gastos = this.storage.getGastosFijos();
                const indexFijos = gastos.items.findIndex(item => item.id === id);
                if (indexFijos !== -1) {
                    gastos.items[indexFijos].pagado = isPagado;
                }
                this.storage.setGastosFijos(gastos);
                break;
            case 'variables':
                gastos = this.storage.getGastosVariables();
                const indexVariables = gastos.items.findIndex(item => item.id === id);
                if (indexVariables !== -1) {
                    gastos.items[indexVariables].pagado = isPagado;
                }
                this.storage.setGastosVariables(gastos);
                break;
            case 'extras':
                gastos = this.storage.getGastosExtras();
                const indexExtras = gastos.items.findIndex(item => item.id === id);
                if (indexExtras !== -1) {
                    gastos.items[indexExtras].pagado = isPagado;
                }
                this.storage.setGastosExtras(gastos);
                break;
        }

        // Actualizar UI
        const itemElement = document.querySelector(`[data-id="${id}"]`);
        if (itemElement) {
            itemElement.classList.toggle('paid', isPagado);
            const nameElement = itemElement.querySelector('.expense-name');
            const amountElement = itemElement.querySelector('.expense-amount');
            if (nameElement) nameElement.classList.toggle('paid-text', isPagado);
            if (amountElement) amountElement.classList.toggle('paid-text', isPagado);
        }

        this.updateHeaderTotals();
    }

    /**
     * 🆕 NUEVO: Asegurar que todos los items tengan ID único
     */
    ensureItemIds() {
        let updated = false;
        
        // Verificar ingresos
        const ingresos = this.storage.getIngresos();
        ingresos.desglose.forEach(item => {
            if (!item.id) {
                item.id = 'income_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                updated = true;
            }
        });
        if (updated) this.storage.setIngresos(ingresos);
        
        // Verificar gastos fijos
        const gastosFijos = this.storage.getGastosFijos();
        gastosFijos.items.forEach(item => {
            if (!item.id) {
                item.id = 'gasto_fijo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                updated = true;
            }
        });
        if (updated) this.storage.setGastosFijos(gastosFijos);
        
        // Verificar gastos variables
        const gastosVariables = this.storage.getGastosVariables();
        gastosVariables.items.forEach(item => {
            if (!item.id) {
                item.id = 'gasto_variable_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                updated = true;
            }
        });
        if (updated) this.storage.setGastosVariables(gastosVariables);
        
        // Verificar gastos extras
        const gastosExtras = this.storage.getGastosExtras();
        gastosExtras.items.forEach(item => {
            if (!item.id) {
                item.id = 'gasto_extra_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
                updated = true;
            }
        });
        if (updated) this.storage.setGastosExtras(gastosExtras);
        
        if (updated) {
            console.log('✅ IDs agregados a elementos existentes');
        }
    }

    /**
     * Actualizar totales en header
     */
    updateHeaderTotals() {
        const gastosFijos = this.storage.getGastosFijos();
        const gastosVariables = this.storage.getGastosVariables();
        const gastosExtras = this.storage.getGastosExtras();
        const ingresos = this.storage.getIngresos();

        const totalesFijos = this.calculateTotals(gastosFijos.items);
        const totalesVariables = this.calculateTotals(gastosVariables.items);
        const totalesExtras = this.calculateTotals(gastosExtras.items);

        const totalGastos = totalesFijos.total + totalesVariables.total + totalesExtras.total;
        const totalPagados = totalesFijos.pagados + totalesVariables.pagados + totalesExtras.pagados;
        const totalPendientes = totalesFijos.pendientes + totalesVariables.pendientes + totalesExtras.pendientes;
        const balance = ingresos.total - totalGastos;

        // Actualizar elementos del header si existen
        const elements = {
            ingresosTotales: document.querySelector('[data-total="ingresos"]'),
            gastosTotales: document.querySelector('[data-total="gastos"]'),
            balance: document.querySelector('[data-total="balance"]'),
            pagados: document.querySelector('[data-total="pagados"]'),
            porPagar: document.querySelector('[data-total="porpagar"]')
        };

        if (elements.ingresosTotales) {
            elements.ingresosTotales.textContent = this.formatNumber(ingresos.total);
        }
        if (elements.gastosTotales) {
            elements.gastosTotales.textContent = this.formatNumber(totalGastos);
        }
        if (elements.balance) {
            elements.balance.textContent = this.formatNumber(balance);
            const balanceCard = elements.balance.closest('.balance-card');
            if (balanceCard) {
                balanceCard.classList.toggle('positive', balance >= 0);
                balanceCard.classList.toggle('negative', balance < 0);
            }
        }
        if (elements.pagados) {
            elements.pagados.textContent = this.formatNumber(totalPagados);
        }
        if (elements.porPagar) {
            elements.porPagar.textContent = this.formatNumber(totalPendientes);
        }
    }

    /**
     * Vincular eventos del presupuesto
     */
    bindPresupuestoEvents() {
        const presupuestoInput = document.getElementById('presupuesto-extra');
        if (presupuestoInput) {
            presupuestoInput.addEventListener('change', (e) => {
                const nuevoPresupuesto = parseFloat(e.target.value) || 0;
                const gastosExtras = this.storage.getGastosExtras();
                gastosExtras.presupuesto = nuevoPresupuesto;
                this.storage.setGastosExtras(gastosExtras);
            });
        }
    }

    /**
     * Vincular eventos globales
     */
    bindEvents() {
        window.addEventListener('storageSaved', () => {
            this.updateHeaderTotals();
        });
    }

    /**
     * UTILIDADES ESENCIALES
     */

    /**
     * Calcular total de gastos activos
     */
    calculateTotal(items) {
        return items
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
    }

    /**
     * Calcular totales con pagados/pendientes
     */
    calculateTotals(items) {
        const activeItems = items.filter(item => item.activo !== false);
        const pagadosItems = activeItems.filter(item => item.pagado === true);
        const pendientesItems = activeItems.filter(item => item.pagado !== true);
        
        return {
            total: activeItems.reduce((sum, item) => sum + (item.monto || 0), 0),
            pagados: pagadosItems.reduce((sum, item) => sum + (item.monto || 0), 0),
            pendientes: pendientesItems.reduce((sum, item) => sum + (item.monto || 0), 0)
        };
    }

    /**
     * Encontrar gasto por ID
     */
    findGastoById(id, tipo) {
        let gastos;
        switch (tipo) {
            case 'fijos':
                gastos = this.storage.getGastosFijos();
                break;
            case 'variables':
                gastos = this.storage.getGastosVariables();
                break;
            case 'extras':
                gastos = this.storage.getGastosExtras();
                break;
            default:
                return null;
        }
        return gastos.items.find(item => item.id === id);
    }

    /**
     * Generar ID único
     */
    generateId() {
        return 'gasto_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtener nombre display del tipo
     */
    getTipoDisplayName(tipo) {
        const names = { 'fijos': 'Fijo', 'variables': 'Variable', 'extras': 'Extra' };
        return names[tipo] || tipo;
    }

    /**
     * Formatear número
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    /**
     * Mostrar detalles (funciones para panel lateral)
     */
    showGraficoDetalle() {
        alert('Funcionalidad de gráficos será implementada próximamente');
    }

    showBalanceDetalle() {
        alert('Detalles de balance - En desarrollo');
    }

    showIngresoDetalle() {
        alert('Detalles de ingreso - En desarrollo');
    }

    /**
     * Disparar evento personalizado
     */
    dispatchGastoEvent(type, detail) {
        const event = new CustomEvent(`gastos_${type}`, {
            detail: detail,
            bubbles: true
        });
        window.dispatchEvent(event);
    }
}

// Crear instancia global
window.gastosManager = new GastosManager();

// Exportar para usar como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GastosManager;
}