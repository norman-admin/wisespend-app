/**
 * GASTOS.JS - Sistema de Gestión de Gastos REFACTORIZADO
 * Presupuesto Familiar - Versión 1.6.0 - TABLA MEJORADA + SINCRONIZACIÓN SUPABASE
 * 
 * 🔧 CAMBIOS v1.6.0:
 * ✅ Sincronización automática con Supabase
 * ✅ Vista de gastos variables actualizada dinámicamente
 * ✅ Sistema de modales unificado (modalSystem)
 * ✅ Funciones centralizadas (Utils)
 * ✅ Eliminación de código duplicado
 * ✅ Mantiene 100% de funcionalidades existentes
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
     * 🔄 SINCRONIZAR DATOS DESDE SUPABASE
     */
    async syncDataFromSupabase() {
        if (window.supabaseManager && window.hybridStorage?.useCloud) {
            try {
                console.log('🔄 Sincronizando datos desde Supabase...');
                
                // Obtener período actual
                const periodo = window.supabaseManager.getPeriodo();
                
                // Obtener datos de Supabase
                const [gastosFijosResult, gastosVariablesResult] = await Promise.all([
                    window.supabaseManager.getGastosFijos(periodo.mes, periodo.anio),
                    window.supabaseManager.getGastosVariables(periodo.mes, periodo.anio)
                ]);
                
                // Actualizar localStorage con datos de Supabase
                if (gastosFijosResult.success && gastosFijosResult.data) {
                    const gastosFijos = {
                        total: gastosFijosResult.data.reduce((sum, item) => sum + item.monto, 0),
                        items: gastosFijosResult.data.map(item => ({
                            ...item,
                            activo: item.activo ?? true
                        }))
                    };
                    this.storage.setGastosFijos(gastosFijos);
                    console.log('✅ Gastos fijos sincronizados:', gastosFijos.items.length);
                }
                
                if (gastosVariablesResult.success && gastosVariablesResult.data) {
                    const gastosVariables = {
                        total: gastosVariablesResult.data.reduce((sum, item) => sum + item.monto, 0),
                        items: gastosVariablesResult.data.map(item => ({
                            ...item,
                            activo: item.activo ?? true
                        }))
                    };
                    this.storage.setGastosVariables(gastosVariables);
                    console.log('✅ Gastos variables sincronizados:', gastosVariables.items.length);
                }
                
            } catch (error) {
                console.error('❌ Error sincronizando desde Supabase:', error);
            }
        }
    }

    /**
     * 🔄 Detectar vista actual
     */
    detectCurrentView() {
        const container = this.getMainContainer();
        if (!container) return 'unknown';
        
        const sectionTitle = container.querySelector('.section-header h2')?.textContent || '';
        
        if (sectionTitle.includes('Fijos y Variables')) return 'fixed-variable';
        if (sectionTitle.includes('Gastos Fijos')) return 'fijos';
        if (sectionTitle.includes('Gastos Variables')) return 'variables';
        if (sectionTitle.includes('Ingresos')) return 'income';
        if (sectionTitle.includes('Gastos Extras')) return 'extras';
        
        return 'unknown';
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
                }
                break;
            default:
                this.renderExpensesSection(container);
                break;
        }
    }

    /**
     * Obtener contenedor principal
     */
    getMainContainer() {
        return document.getElementById('dynamic-content') || 
               document.getElementById('main-content') ||
               document.querySelector('.main-content');
    }

    /**
     * RENDERIZAR SECCIÓN DE INGRESOS - DELEGADA A TABLA MEJORADA
     */
    renderIncomeSection(container) {
        console.log('💰 Configurando sección de ingresos...');

        // 🎯 CAMBIO v1.5.0: PRIORIZAR tabla mejorada global
        if (window.incomeTableEnhanced) {
            console.log('🎯 Usando tabla mejorada global PERSISTENTE');
            window.incomeTableEnhanced.renderIncomeSection(container);
        }
        // 🆕 Crear tabla mejorada global si no existe
        else if (window.IncomeTableEnhanced && window.gastosManager) {
            console.log('🎯 Creando tabla mejorada global (forzada)');
            window.incomeTableEnhanced = new window.IncomeTableEnhanced(window.gastosManager);
            window.incomeTableEnhanced.renderIncomeSection(container);
        }
        // Fallback tradicional
        else if (window.ingresosManager) {
            window.ingresosManager.renderIncomeSection();
        } else {
            console.error('❌ Ningún sistema de ingresos disponible');
            container.innerHTML = '<p>Sistema de ingresos no disponible</p>';
        }

        this.updateNavigationState();
    }

    /**
     * RENDERIZAR SECCIÓN DE GASTOS - CON TARJETAS Y GESTIÓN UNIFICADA
     */
    renderExpensesSection(container) {
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>💳 Agregar Gastos</h2>
                    <p>Selecciona el tipo de gasto que deseas registrar</p>
                </div>

                <!-- TARJETAS DE GASTOS -->
                <div class="expense-cards-grid">
                    <div class="expense-card" data-tipo="fijos" onclick="gastosManager.showAddGastoModal('fijos')">
                        <div class="card-icon">
                            <div class="icon-bg fijos">
                                🏠
                            </div>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title">Gasto Fijo</h3>
                            <p class="card-description">Pagos regulares como arriendo, servicios, créditos</p>
                            <div class="card-action">
                                <span class="action-text">Agregar Gasto Fijo</span>
                                <span class="action-arrow">→</span>
                            </div>
                        </div>
                    </div>

                    <div class="expense-card" data-tipo="variables" onclick="gastosManager.showAddGastoModal('variables')">
                        <div class="card-icon">
                            <div class="icon-bg variables">
                                🛒
                            </div>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title">Gasto Variable</h3>
                            <p class="card-description">Gastos que cambian mes a mes como comida, transporte, entretenimiento</p>
                            <div class="card-action">
                                <span class="action-text">Agregar Gasto Variable</span>
                                <span class="action-arrow">→</span>
                            </div>
                        </div>
                    </div>

                    <div class="expense-card" data-tipo="extras" onclick="gastosManager.showAddGastoModal('extras')">
                        <div class="card-icon">
                            <div class="icon-bg extras">
                                ⚡
                            </div>
                        </div>
                        <div class="card-content">
                            <h3 class="card-title">Gasto Extra</h3>
                            <p class="card-description">Gastos imprevistos, compras especiales o emergencias</p>
                            <div class="card-action">
                                <span class="action-text">Agregar Gasto Extra</span>
                                <span class="action-arrow">→</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN INFORMATIVA SIMPLIFICADA -->
                <div class="expense-categories-info">
                    <div class="info-card-simple">
                        <div class="info-content-horizontal">
                            <span class="info-item">
                                <span class="info-icon-small">🏠</span>
                                <span class="info-text-compact"><strong>Fijos:</strong> Pagos regulares</span>
                            </span>
                            <span class="info-separator">|</span>
                            <span class="info-item">
                                <span class="info-icon-small">📊</span>
                                <span class="info-text-compact"><strong>Variables:</strong> Según decisiones</span>
                            </span>
                            <span class="info-separator">|</span>
                            <span class="info-item">
                                <span class="info-icon-small">⚡</span>
                                <span class="info-text-compact"><strong>Extras:</strong> No planificados</span>
                            </span>
                        </div>
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
        console.log('💳 Sección de gastos renderizada con tarjetas');
    }

    /**
     * 🔄 REFACTORIZADO: Mostrar modal para agregar gasto usando sistema unificado
     */
    showAddGastoModal(tipo = 'fijos') {
        window.modalSystem.form({
            title: `Agregar Gasto ${this.getTipoDisplayName(tipo)}`,
            submitText: 'Agregar Gasto',
            fields: [
                {
                    type: 'text',
                    name: 'categoria',
                    label: 'Categoría',
                    required: true,
                    placeholder: 'Ej: Luz, Agua, Supermercado...'
                },
                {
                    type: 'number',
                    name: 'monto',
                    label: 'Monto',
                    required: true,
                    placeholder: '0'
                }
            ]
        }).then(data => {
            if (data) {
                this.saveGastoFromModal(data, tipo);
            }
        });
    }

    /**
     * 🆕 NUEVO: Guardar gasto desde modal unificado - CON SINCRONIZACIÓN
     */
    async saveGastoFromModal(data, tipo) {
        const gastoData = {
            categoria: data.categoria,
            monto: parseInt(data.monto) || 0,
            activo: true,
            id: Utils.id.generate(`gasto_${tipo}`),
            fechaCreacion: Utils.time.now()
        };

        if (!gastoData.categoria || !gastoData.monto) {
            window.modalSystem.showMessage('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        await this.addGasto(gastoData, tipo);

        // 🎯 SOLUCIÓN MEJORADA: Esperar un momento y sincronizar
        setTimeout(async () => {
            await this.syncDataFromSupabase();
            
            // Si estamos en vista de fijos/variables, actualizar
            const currentView = this.detectCurrentView();
            if (currentView === 'fixed-variable') {
                await this.showFijosVariablesView();
            }
            
            this.updateHeaderTotals();
            console.log('✅ Gasto agregado y sincronizado');
        }, 500);

        window.modalSystem.showMessage(`Gasto ${this.getTipoDisplayName(tipo).toLowerCase()} agregado correctamente`, 'success');
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
     * Renderizar gastos extras - VERSIÓN MEJORADA
     */
    renderGastosExtras(container) {
        // Usar el nuevo sistema de gastos extras mejorados
        if (window.gastosExtrasMejorados) {
            window.gastosExtrasMejorados.renderGastosExtrasMejorados(container);
        } else {
            // Fallback si no está cargado
            console.warn('⚠️ GastosExtrasMejorados no disponible, usando versión anterior');
            this.renderGastosExtrasOriginal(container);
        }
    }

    /**
     * Renderizar gastos extras - VERSIÓN ORIGINAL (RESPALDO)
     */
    renderGastosExtrasOriginal(container) {
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
    }

    /**
     * Vista combinada fijos y variables - CON SINCRONIZACIÓN
     */
    async showFijosVariablesView() {
        // Sincronizar datos antes de renderizar
        await this.syncDataFromSupabase();
        
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
            item.id = Utils.id.generate(`gasto_${tipo}`);
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
     * Agregar nuevo gasto
     */
    async addGasto(gastoData, tipo) {
        switch (tipo) {
            case 'fijos':
                await this.storage.addGastoFijo(gastoData);
                break;
            case 'variables':
                await this.storage.addGastoVariable(gastoData);
                break;
            case 'extras':
                await this.storage.addGastoExtra(gastoData);
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
            if (nameElement) {
                nameElement.classList.toggle('paid-text', isPagado);
            }
            if (amountElement) {
                amountElement.classList.toggle('paid-text', isPagado);
            }
        }

        // Actualizar totales del header
        this.updateHeaderTotals();
    }

    /**
     * Actualizar totales del header 
     */
    updateHeaderTotals() {
        const gastosFijos = this.storage.getGastosFijos();
        const gastosVariables = this.storage.getGastosVariables();
        const gastosExtras = this.storage.getGastosExtras();
        const ingresos = this.storage.getIngresos();

        const totalesFijos = this.calculateTotals(gastosFijos.items);
        const totalesVariables = this.calculateTotals(gastosVariables.items);

        // 🆕 Para gastos extras, usar presupuesto en lugar de items
        const totalesExtras = {
            total: gastosExtras.presupuesto || 0,
            pagados: 0,  // Los gastos extras NO cuentan como pagados
            pendientes: 0  // Los gastos extras NO cuentan como pendientes
        };

        const totalGastos = totalesFijos.total + totalesVariables.total + totalesExtras.total;
        const totalPagados = totalesFijos.pagados + totalesVariables.pagados;  // SIN extras
        const totalPendientes = totalesFijos.pendientes + totalesVariables.pendientes;  // SIN extras
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
     * 🔄 REFACTORIZADO: Mostrar modal para agregar ingreso usando sistema unificado
     */
    showAddIncomeModal(isEdit = false, editData = null) {
        const title = isEdit ? 'Editar Ingreso' : 'Agregar Ingreso';
        const submitText = isEdit ? 'Actualizar' : 'Agregar';

        window.modalSystem.form({
            title,
            submitText,
            fields: [
                {
                    type: 'text',
                    name: 'fuente',
                    label: 'Fuente de Ingresos',
                    required: true,
                    value: isEdit ? editData.fuente : '',
                    placeholder: 'Ej: Sueldo, Freelance, etc.'
                },
                {
                    type: 'number',
                    name: 'monto',
                    label: 'Monto',
                    required: true,
                    value: isEdit ? editData.monto : '',
                    placeholder: '0'
                }
            ]
        }).then(data => {
            if (data) {
                this.saveIncomeFromModal(data, isEdit, editData);
            }
        });
    }

    /**
     * 🆕 NUEVO: Guardar ingreso desde modal unificado
     */
    saveIncomeFromModal(data, isEdit = false, originalData = null) {
        const incomeData = {
            fuente: data.fuente,
            monto: parseInt(data.monto) || 0,
            id: isEdit ? originalData.id : Utils.id.generate('income'),
            fechaCreacion: isEdit ? originalData.fechaCreacion : Utils.time.now(),
            fechaModificacion: Utils.time.now()
        };

        if (!incomeData.fuente || !incomeData.monto) {
            window.modalSystem.showMessage('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        const ingresos = this.storage.getIngresos();

        if (isEdit) {
            // Actualizar ingreso existente
            const index = ingresos.desglose.findIndex(ing => ing.id === incomeData.id);
            if (index !== -1) {
                ingresos.desglose[index] = incomeData;
            }
        } else {
            // Agregar nuevo ingreso
            ingresos.desglose.push(incomeData);
        }

        // Recalcular totales y porcentajes
        ingresos.total = ingresos.desglose.reduce((sum, ing) => sum + (ing.monto || 0), 0);
        
        if (ingresos.total > 0) {
            ingresos.desglose.forEach(ing => {
                ing.porcentaje = ((ing.monto || 0) / ingresos.total) * 100;
            });
        }

        // Guardar en storage
        this.storage.setIngresos(ingresos);

        // 🎯 SOLUCIÓN: Solo actualizar totales, NO recargar vista
        this.updateHeaderTotals();
        console.log('✅ Ingreso agregado sin refresco');

        // 🆕 Actualizar gastos extras cuando cambien los ingresos
        if (window.gastosExtrasMejorados) {
            window.gastosExtrasMejorados.updateIngresosTotales();
            window.gastosExtrasMejorados.updateDisplays();
        }

        window.modalSystem.showMessage(
            `Ingreso ${isEdit ? 'actualizado' : 'agregado'} correctamente`,
            'success'
        );
    }

    /**
     * 🆕 Asegurar IDs en elementos existentes
     */
    ensureItemIds() {
        // Gastos Fijos
        const gastosFijos = this.storage.getGastosFijos();
        let fixChanged = false;
        gastosFijos.items.forEach(item => {
            if (!item.id) {
                item.id = Utils.id.generate('gasto_fijos');
                fixChanged = true;
            }
        });
        if (fixChanged) this.storage.setGastosFijos(gastosFijos);

        // Gastos Variables
        const gastosVariables = this.storage.getGastosVariables();
        let varChanged = false;
        gastosVariables.items.forEach(item => {
            if (!item.id) {
                item.id = Utils.id.generate('gasto_variables');
                varChanged = true;
            }
        });
        if (varChanged) this.storage.setGastosVariables(gastosVariables);

        // Gastos Extras
        const gastosExtras = this.storage.getGastosExtras();
        let extraChanged = false;
        gastosExtras.items.forEach(item => {
            if (!item.id) {
                item.id = Utils.id.generate('gasto_extras');
                extraChanged = true;
            }
        });
        if (extraChanged) this.storage.setGastosExtras(gastosExtras);
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
     * Obtener nombre display del tipo
     */
    getTipoDisplayName(tipo) {
        const names = { 'fijos': 'Fijo', 'variables': 'Variable', 'extras': 'Extra' };
        return names[tipo] || tipo;
    }

    /**
     * 🔄 REFACTORIZADO: Formatear número usando Utils
     */
    formatNumber(num) {
        return Utils.currency.format(num);
    }

    /**
     * Mostrar detalles (funciones para panel lateral)
     */
    showGraficoDetalle() {
        window.modalSystem.alert('Funcionalidad de gráficos será implementada próximamente');
    }

    showBalanceDetalle() {
        window.modalSystem.alert('Detalles de balance - En desarrollo');
    }

    showIngresoDetalle() {
        window.modalSystem.alert('Detalles de ingreso - En desarrollo');
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

    /**
     * 🗑️ FUNCIONES OBSOLETAS - MANTENIDAS PARA COMPATIBILIDAD
     * Estas funciones han sido reemplazadas por el sistema unificado
     */

    /**
     * @deprecated - Usar showAddGastoModal() con sistema unificado
     */
    createGastoModal() {
        console.warn('⚠️ createGastoModal() obsoleta - usar showAddGastoModal()');
        // Fallback para compatibilidad
        this.showAddGastoModal();
    }

    /**
     * @deprecated - Usar showAddIncomeModal() con sistema unificado
     */
    createIncomeModal() {
        console.warn('⚠️ createIncomeModal() obsoleta - usar showAddIncomeModal()');
        // Fallback para compatibilidad
        this.showAddIncomeModal();
    }

    /**
     * @deprecated - Usar saveGastoFromModal()
     */
    saveGasto(tipo, isEdit) {
        console.warn('⚠️ saveGasto() obsoleta - usar saveGastoFromModal()');
        // Mantenida solo para compatibilidad con código legacy
    }

    /**
     * @deprecated - Usar saveIncomeFromModal()
     */
    saveIncome() {
        console.warn('⚠️ saveIncome() obsoleta - usar saveIncomeFromModal()');
        // Mantenida solo para compatibilidad con código legacy
    }
}

// Crear instancia global
window.gastosManager = new GastosManager();

// Exportar para usar como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GastosManager;
}

console.log('💰 Gastos.js v1.6.0 - TABLA MEJORADA + SINCRONIZACIÓN SUPABASE');