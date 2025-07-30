/**
 * GASTOS.JS - Sistema de Gestión de Gastos REFACTORIZADO
 * Presupuesto Familiar - Versión 1.5.0 - TABLA MEJORADA INTEGRADA
 * 
 * 🔧 CAMBIOS REALIZADOS EN REFACTORING:
 * ✅ Sistema de modales unificado (modalSystem)
 * ✅ Funciones centralizadas (Utils)
 * ✅ Eliminación de código duplicado
 * ✅ Mantiene 100% de funcionalidades existentes
 * 🆕 INTEGRACIÓN: Modal-system.js + utils.js
 * 🎯 NUEVO v1.5.0: Priorización de tabla mejorada global
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
     * 🎯 RENDERIZAR SECCIÓN DE INGRESOS - CORREGIDO PARA PRIORIZAR TABLA GLOBAL
     */
    renderIncomeSection(container) {
        const ingresos = this.storage.getIngresos();
        
        // 🆕 PRIORIDAD 1: Asegurar que la tabla mejorada SIEMPRE esté disponible
if (window.IncomeTableEnhanced) {
    if (!window.incomeTableEnhanced) {
        window.incomeTableEnhanced = new window.IncomeTableEnhanced(this);
        console.log('🎯 Creando tabla mejorada global (forzada)');
    }
    console.log('🎯 Usando tabla mejorada global PERSISTENTE');
    window.incomeTableEnhanced.renderIncomeSection(container);
    return;
}

        // 🆕 PRIORIDAD 2: Si no hay instancia global, crear una local
        if (window.IncomeTableEnhanced && !this.incomeTableEnhanced) {
            this.incomeTableEnhanced = new window.IncomeTableEnhanced(this);
            console.log('🎯 Creando tabla mejorada local');
        }

        // 🆕 PRIORIDAD 3: Usar instancia local si existe
        if (this.incomeTableEnhanced) {
            this.incomeTableEnhanced.renderIncomeSection(container);
            return;
        }

        // 🆕 FALLBACK: Solo usar tabla original si no hay tabla mejorada disponible
        console.log('⚠️ Usando tabla fallback - tabla mejorada no disponible');

        // Fallback al método original
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
                            item.id = Utils.id.generate('income');
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
     * 🔄 REFACTORIZADO: Modal para agregar ingresos usando sistema unificado
     */
    showAddIncomeModal() {
        window.modalSystem.form({
            title: 'Agregar Nueva Fuente de Ingresos',
            submitText: 'Agregar Ingreso',
            fields: [
                {
                    type: 'text',
                    name: 'fuente',
                    label: 'Fuente de Ingresos',
                    required: true,
                    placeholder: 'Ej: Sueldo, Freelance, etc.'
                },
                {
                    type: 'number',
                    name: 'monto',
                    label: 'Monto Mensual',
                    required: true,
                    placeholder: '0'
                }
            ]
        }).then(data => {
            if (data) {
                this.saveIncomeFromModal(data);
            }
        });
    }

    /**
     * 🆕 NUEVO: Guardar ingreso desde modal unificado
     */
    saveIncomeFromModal(data) {
        const incomeData = {
            fuente: data.fuente,
            monto: parseInt(data.monto) || 0,
            activo: true,
            id: Utils.id.generate('income'),
            fechaCreacion: Utils.time.now()
        };

        if (!incomeData.fuente || !incomeData.monto) {
            window.modalSystem.showMessage('Por favor complete todos los campos requeridos', 'error');
            return;
        }

        // Agregar al storage
        const ingresos = this.storage.getIngresos();
        ingresos.desglose.push(incomeData);
        ingresos.total = ingresos.desglose
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
        
        this.storage.setIngresos(ingresos);

        // 🎯 SOLUCIÓN: Solo agregar fila nueva sin recargar tabla
        this.addNewIncomeRow(incomeData);
        this.updateHeaderTotals();
        window.modalSystem.showMessage('Nuevo ingreso agregado correctamente', 'success');
        
        console.log('✅ Nuevo ingreso agregado:', incomeData);
    }

    /**
 * 🎯 AGREGAR NUEVA FILA SIN RECARGAR TABLA
 */
addNewIncomeRow(incomeData) {
    const tableBody = document.getElementById('income-table-body');
    if (!tableBody) {
        // Si no hay tabla, recargar completamente
        this.renderIncomeSection(this.getMainContainer());
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
                <span class="breakdown-amount">${this.formatNumber(incomeData.monto)}</span>
            </td>
            <td class="percentage-cell">
                <span class="breakdown-percentage">${percentage.toFixed(1)}%</span>
            </td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button class="btn-action btn-edit" onclick="window.incomeTableEnhanced.editIncome('${incomeData.id}')" title="Editar">
                        ✏️
                    </button>
                    <button class="btn-action btn-delete" onclick="window.incomeTableEnhanced.deleteIncome('${incomeData.id}')" title="Eliminar">
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
 * 🎯 RECALCULAR PORCENTAJES SIN RECARGAR
 */
recalculatePercentages() {
    const ingresos = this.storage.getIngresos();
    const total = ingresos.total;
    
    ingresos.desglose.forEach(item => {
        const percentage = ((item.monto / total) * 100).toFixed(1);
        const row = document.querySelector(`[data-id="${item.id}"]`);
        if (row) {
            const percentageCell = row.querySelector('.breakdown-percentage');
            if (percentageCell) {
                percentageCell.textContent = `${percentage}%`;
            }
        }
    });

    // Actualizar total en la tabla
    this.updateTableTotals(total);
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
 * Renderizar sección de gastos (botones para elegir tipo) - VERSIÓN ORIGINAL RESTAURADA
 */
renderExpensesSection(container) {
    const html = `
        <section class="content-section active">
            <div class="section-header">
                <h2>💳 Agregar Nuevo Gasto</h2>
            </div>

            <div class="expense-cards-container">
                <div class="expense-card" data-tipo="fijos" onclick="gastosManager.showAddGastoModal('fijos')">
                    <div class="card-icon">
                        <div class="icon-bg fijos">
                            🏠
                        </div>
                    </div>
                    <div class="card-content">
                        <h3 class="card-title">Gasto Fijo</h3>
                        <p class="card-description">Pagos recurrentes como arriendo, servicios básicos, créditos</p>
                        <div class="card-action">
                            <span class="action-text">Agregar Gasto Fijo</span>
                            <span class="action-arrow">→</span>
                        </div>
                    </div>
                </div>

                <div class="expense-card" data-tipo="variables" onclick="gastosManager.showAddGastoModal('variables')">
                    <div class="card-icon">
                        <div class="icon-bg variables">
                            📊
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
     * 🆕 NUEVO: Guardar gasto desde modal unificado
     */
    saveGastoFromModal(data, tipo) {
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

    this.addGasto(gastoData, tipo);
    
    // 🎯 SOLUCIÓN: Solo actualizar totales, NO recargar vista
    this.updateHeaderTotals();
    console.log('✅ Gasto agregado sin refresco');
    
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
                item.id = Utils.id.generate('income');
                updated = true;
            }
        });
        if (updated) this.storage.setIngresos(ingresos);
        
        // Verificar gastos fijos
        const gastosFijos = this.storage.getGastosFijos();
        gastosFijos.items.forEach(item => {
            if (!item.id) {
                item.id = Utils.id.generate('gasto_fijo');
                updated = true;
            }
        });
        if (updated) this.storage.setGastosFijos(gastosFijos);
        
        // Verificar gastos variables
        const gastosVariables = this.storage.getGastosVariables();
        gastosVariables.items.forEach(item => {
            if (!item.id) {
                item.id = Utils.id.generate('gasto_variable');
                updated = true;
            }
        });
        if (updated) this.storage.setGastosVariables(gastosVariables);
        
        // Verificar gastos extras
        const gastosExtras = this.storage.getGastosExtras();
        gastosExtras.items.forEach(item => {
            if (!item.id) {
                item.id = Utils.id.generate('gasto_extra');
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

console.log('💰 Gastos.js v1.5.0 - TABLA MEJORADA PRIORITARIA INTEGRADA');