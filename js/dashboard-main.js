/**
 * DASHBOARD-MAIN.JS - Orchestrator Principal del Dashboard
 * Presupuesto Familiar - Versión 1.2.0 - TABLA MEJORADA INTEGRADA
 * 
 * ✅ FUNCIONALIDADES:
 * 🎯 Orchestración central de módulos
 * 🔄 Gestión de estados globales
 * 🎧 Event handling centralizado
 * 📊 Actualización de datos automática
 * 🚀 Inicialización secuencial
 * 📊 Tabla mejorada de ingresos integrada
 * 
 * 🔧 CAMBIOS v1.2.0:
 * ✅ Inicialización de tabla mejorada movida al lugar correcto
 * ✅ Mantiene TODAS las funcionalidades existentes
 * ✅ Sin duplicación de código
 * ✅ Mejor timing de inicialización
 */

class DashboardOrchestrator {
    constructor() {
        this.modules = new Map();
        this.configuredElements = new Set(); // Guard para elementos configurados
        this.state = {
            currentSection: 'income',
            currentCurrency: 'CLP',
            dashboardData: null,
            isInitialized: false,
            lastDataUpdate: null,
            buttonsConfigured: false // Guard para botones
        };

        this.initializeOrchestrator();
    }

    /**
     * INICIALIZACIÓN PRINCIPAL
     */
    async initializeOrchestrator() {
        console.log('🎯 Iniciando DashboardOrchestrator...');

        try {
            // TEMPORALMENTE DESHABILITADO PARA TESTING
            // // 1. Verificar autenticación
            // if (!this.verifyAuthentication()) {
            //     this.redirectToLogin();
            //     return;
            // }

            // 2. Esperar a que los módulos estén disponibles
            await this.waitForModules();

            // 3. Registrar módulos disponibles
            this.registerModules();

            // 4. Cargar datos iniciales
            await this.loadInitialData();

            // 5. Configurar event listeners
            this.setupEventListeners();

            // 6. Inicializar interfaz
            this.initializeInterface();

            // 7. Cargar sección inicial
            this.loadInitialSection();

            this.state.isInitialized = true;
            console.log('✅ DashboardOrchestrator inicializado correctamente');

        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * VERIFICACIÓN Y VALIDACIÓN
     */

    /**
     * Verificar autenticación del usuario
     */
    verifyAuthentication() {
        if (!window.authSystem) {
            console.error('❌ Sistema de autenticación no disponible');
            return false;
        }

        const isAuthenticated = window.authSystem.checkSession();
        if (!isAuthenticated) {
            console.log('❌ No hay sesión válida');
            return false;
        }

        console.log('✅ Sesión válida verificada');
        return true;
    }

    /**
     * Esperar a que todos los módulos estén disponibles
     */
    async waitForModules() {
        const requiredModules = [
            'storageManager',
            'gastosManager',
            'currencyManager',
            'authSystem',
            'ingresosManager',
            'componentLoader',
            'reportesManager'
        ];

        return new Promise((resolve) => {
            const checkModules = () => {
                const moduleStatus = {};
                let allAvailable = true;

                requiredModules.forEach(moduleName => {
                    const isAvailable = !!window[moduleName];
                    moduleStatus[moduleName] = isAvailable;
                    if (!isAvailable) allAvailable = false;
                });

                // console.log('🔍 Estado de módulos:', moduleStatus); // TEMPORALMENTE COMENTADO

                if (allAvailable) {
                    console.log('✅ Todos los módulos disponibles');
                    resolve();
                } else {
                    setTimeout(checkModules, 100);
                }
            };

            checkModules();
        });
    }

    /**
     * Registrar módulos disponibles
     */
    registerModules() {
        const moduleList = [
            { name: 'storage', instance: window.hybridStorage || window.storageManager },
            { name: 'gastos', instance: window.gastosManager },
            { name: 'currency', instance: window.currencyManager },
            { name: 'auth', instance: window.authSystem },
            { name: 'ingresos', instance: window.ingresosManager },
            { name: 'components', instance: window.componentLoader },
            { name: 'reportes', instance: window.reportesManager }
        ];

        moduleList.forEach(({ name, instance }) => {
            if (instance) {
                this.modules.set(name, instance);
                console.log(`📦 Módulo ${name} registrado`);
            }
        });

        console.log(`✅ ${this.modules.size} módulos registrados`);
    }

    /**
     * GESTIÓN DE DATOS
     */

    /**
     * Cargar datos iniciales
     */
    async loadInitialData() {
        console.log('📊 Cargando datos iniciales...');

        try {
            const storage = this.modules.get('storage');
            if (!storage) {
                throw new Error('StorageManager no disponible');
            }

            this.state.dashboardData = storage.getDashboardData();
            this.state.lastDataUpdate = new Date().toISOString();

            // Configurar moneda desde configuración
            const config = this.state.dashboardData.configuracion;
            if (config && config.monedaPrincipal) {
                this.state.currentCurrency = config.monedaPrincipal;

                const currency = this.modules.get('currency');
                if (currency) {
                    currency.setCurrency(config.monedaPrincipal);
                }
            }

            console.log('📈 Datos cargados:', this.state.dashboardData);

        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            throw error;
        }
    }

    /**
     * Actualizar datos del dashboard
     */
    refreshData() {
        console.log('🔄 Actualizando datos del dashboard...');

        const storage = this.modules.get('storage');
        if (storage) {
            this.state.dashboardData = storage.getDashboardData();
            this.state.lastDataUpdate = new Date().toISOString();

            this.updateStatCards();
            this.dispatchDataUpdateEvent();
        }
    }

    /**
     * INTERFAZ DE USUARIO
     */

    /**
     * Inicializar interfaz
     */
    initializeInterface() {
        console.log('🎨 Inicializando interfaz...');

        // Actualizar tarjetas de estadísticas
        this.updateStatCards();

        // Configurar selector de moneda
        this.setupCurrencySelector();

        // Configurar botones del header
        this.setupHeaderButtons();

        // 🆕 INICIALIZAR TABLA MEJORADA DE INGRESOS - POSICIÓN CORREGIDA
        if (window.IncomeTableEnhanced && window.gastosManager) {
            window.incomeTableEnhanced = new window.IncomeTableEnhanced(window.gastosManager);
            console.log('📊 Tabla mejorada de ingresos inicializada');
        } else {
            console.log('⚠️ IncomeTableEnhanced o gastosManager no disponibles aún');
        }

        console.log('✅ Interfaz inicializada');
    }

    /**
     * Actualizar tarjetas de estadísticas
     */
    updateStatCards() {
        if (!this.state.dashboardData) return;

        const data = this.state.dashboardData;
        const currency = this.modules.get('currency');

        const formatAmount = (amount) => {
            return currency ?
                currency.format(amount, this.state.currentCurrency) :
                `${amount.toLocaleString('es-CL')}`;
        };

        // Calcular valores - CAMBIO: usar presupuesto en lugar de total
        const totalGastosExtras = data.gastosExtras.presupuesto || 0;
        const totalGastos = data.gastosFijos.total + data.gastosVariables.total;
        const balance = data.ingresos.total - totalGastos;

        // Calcular pagados y pendientes
        const todosLosGastos = [
            ...(data.gastosFijos.items || []),
            ...(data.gastosVariables.items || [])

        ];

        const pagados = todosLosGastos
            .filter(item => item.pagado === true && item.activo !== false)
            .reduce((sum, item) => sum + (item.monto || 0), 0);

        const pendientes = todosLosGastos
            .filter(item => item.pagado !== true && item.activo !== false)
            .reduce((sum, item) => sum + (item.monto || 0), 0);

        // Actualizar elementos DOM
        this.updateDOMElement('.income-value', formatAmount(data.ingresos.total));
        this.updateDOMElement('.expenses-value', formatAmount(totalGastos));
        this.updateDOMElement('.balance-value', formatAmount(balance));
        this.updateDOMElement('.paid-value', formatAmount(pagados));
        this.updateDOMElement('.pending-value', formatAmount(pendientes));

        // Actualizar clase del balance
        const balanceElement = document.querySelector('.balance-value');
        if (balanceElement) {
            const balanceCard = balanceElement.closest('.balance-card');
            if (balanceCard) {
                balanceCard.classList.toggle('positive', balance >= 0);
                balanceCard.classList.toggle('negative', balance < 0);
            }
        }

        console.log('📊 Tarjetas de estadísticas actualizadas');
    }

    /**
     * Actualizar elemento DOM
     */
    updateDOMElement(selector, value) {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Configurar selector de moneda
     */
    setupCurrencySelector() {
        const currencySelect = document.getElementById('currency-select');
        if (!currencySelect) {
            setTimeout(() => this.setupCurrencySelector(), 200);
            return;
        }

        // Establecer valor actual
        currencySelect.value = this.state.currentCurrency;

        // Event listener
        currencySelect.addEventListener('change', (e) => {
            const newCurrency = e.target.value;
            this.changeCurrency(newCurrency);
        });

        console.log('💱 Selector de moneda configurado');
    }

    /**
     * Cambiar moneda
     */
    changeCurrency(newCurrency) {
        console.log(`💱 Cambiando moneda a: ${newCurrency}`);

        this.state.currentCurrency = newCurrency;

        const currency = this.modules.get('currency');
        if (currency) {
            currency.setCurrency(newCurrency);
        }

        // Actualizar configuración en storage
        const storage = this.modules.get('storage');
        if (storage) {
            const config = storage.getConfiguracion();
            config.monedaPrincipal = newCurrency;
            storage.setConfiguracion(config);
        }

        // Actualizar interfaz
        this.updateStatCards();

        // Recargar vista actual si es necesario
        const gastos = this.modules.get('gastos');
        if (gastos && gastos.currentView) {
            gastos.loadGastosView();
        }

        this.dispatchCurrencyChangeEvent(newCurrency);
    }

    /**
     * Configurar botones del header
     */
    setupHeaderButtons() {
        setTimeout(() => {
            this.setupCloseSessionButton();
            this.setupExportDataButton();
            this.setupAddUserButton();
        }, 500);
    }

    /**
     * Configurar botón de cerrar sesión
     */
    setupCloseSessionButton() {
        const closeSessionBtn = document.getElementById('close-session-btn');
        if (closeSessionBtn) {
            closeSessionBtn.addEventListener('click', () => {
                this.handleLogout();
            });
            console.log('🚪 Botón cerrar sesión configurado');
        }
    }

    /**
     * Configurar botón de exportar datos
     */
    setupExportDataButton() {
        const exportDataBtn = document.getElementById('export-data-btn');
        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.handleExportData();
            });
            console.log('📤 Botón exportar datos configurado');
        }
    }

    /**
     * Configurar botón de agregar usuario
     */
    setupAddUserButton() {
        const addUserBtn = document.getElementById('add-user-btn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.handleAddUser();
            });
            console.log('👤 Botón agregar usuario configurado');
        }
    }

    /**
     * NAVEGACIÓN Y SECCIONES
     */

    /**
     * Cargar sección inicial
     */
    loadInitialSection() {
        console.log('🏠 Cargando sección inicial...');
        this.loadSection('income');
    }

    /**
     * Cargar sección específica
     */
    loadSection(sectionName) {
        console.log(`📄 Cargando sección: ${sectionName}`);

        this.state.currentSection = sectionName;

        const gastos = this.modules.get('gastos');
        if (gastos) {
            gastos.switchView(sectionName);
        }

        // Configuración especial para sección de ingresos
        if (sectionName === 'income') {
            this.configureIncomeSection();
        }

        // Configuración especial para sección de reportes
        if (sectionName === 'reports') {
            this.configureReportsSection();
        }

        this.dispatchSectionChangeEvent(sectionName);
    }

    /**
     * Configurar sección de ingresos - CORREGIDO
     */
    configureIncomeSection() {
        // Solo configurar una vez
        if (this.state.buttonsConfigured) {
            console.log('💰 Botones de ingresos ya configurados, omitiendo...');
            return;
        }

        console.log('💰 Configurando sección de ingresos...');

        // Usar observer para detectar cuando el DOM esté listo
        this.waitForIncomeSection().then(() => {
            this.configureIncomeButtons();
            this.state.buttonsConfigured = true;
        });
    }

    /**
     * Esperar a que la sección de ingresos esté lista - NUEVO
     */
    waitForIncomeSection() {
        return new Promise((resolve) => {
            const checkSection = () => {
                const incomeSection = document.querySelector('.content-area');
                const hasIncomeContent = incomeSection &&
                    incomeSection.innerHTML.includes('Agregar Ingresos');

                if (hasIncomeContent) {
                    console.log('✅ Sección de ingresos detectada en DOM');
                    resolve();
                } else {
                    setTimeout(checkSection, 200);
                }
            };

            checkSection();
        });
    }

    /**
     * Configurar botones de ingresos - COMPLETAMENTE REESCRITO
     */
    configureIncomeButtons() {
        console.log('🔍 Configurando botones de ingresos...');

        // Selectores específicos y contextualizados
        const specificSelectors = [
            // Texto específico
            'button:contains("Agregar Ingresos")',
            // ID específico
            '#add-income-btn',
            // Clase específica
            '.btn-add-income',
            // Atributo específico
            '[data-action="add-income"]',
            // Contexto específico: botón primario en sección de ingresos
            '.content-area .btn.btn-primary'
        ];

        let buttonFound = false;

        // Implementar contains selector manualmente
        const buttons = document.querySelectorAll('button, .btn');

        buttons.forEach(btn => {
            // Verificar si ya está configurado
            if (this.configuredElements.has(btn)) {
                return;
            }

            const text = btn.textContent.trim().toLowerCase();
            const isIncomeButton = text.includes('agregar') &&
                (text.includes('ingreso') || text.includes('ingresos'));

            // Verificar contexto: debe estar en la sección de ingresos
            const isInIncomeSection = btn.closest('.content-area');

            if (isIncomeButton && isInIncomeSection) {
                console.log('🎯 Botón de ingresos encontrado:', btn.textContent.trim());

                // Limpiar eventos previos
                this.cleanButtonEvents(btn);

                // Configurar evento específico
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('💰 Click en botón agregar ingreso detectado');
                    this.handleAddIncome();
                });

                // Marcar como configurado
                this.configuredElements.add(btn);
                btn.setAttribute('data-income-configured', 'true');

                buttonFound = true;
                console.log('✅ Botón de ingresos configurado correctamente');
            }
        });

        if (!buttonFound) {
            console.log('⚠️ No se encontró botón de ingresos, reintentando...');
            setTimeout(() => this.configureIncomeButtons(), 500);
        }
    }

    /**
     * Configurar sección de reportes
     */
    configureReportsSection() {
        setTimeout(() => {
            const reportes = this.modules.get('reportes');
            if (reportes) {
                reportes.showReportView();
            }
        }, 300);
    }

    /**
     * MANEJO DE EVENTOS
     */

    /**
     * Configurar event listeners globales
     */
    setupEventListeners() {
        console.log('🎧 Configurando event listeners...');

        // Eventos de datos
        // 🔧 TEMPORALMENTE DESHABILITADO PARA EVITAR REFRESCO EN EDICIÓN INLINE
        /*
        window.addEventListener('storageSaved', () => {
        if (!this.isUpdatingDashboard) {
            this.isUpdatingDashboard = true;
            setTimeout(() => {
                this.handleDataChange();
                this.isUpdatingDashboard = false;
            }, 50);
        }
        });
        */
        window.addEventListener('gastos_gastoAdded', () => this.handleDataChange());
        window.addEventListener('gastos_gastoUpdated', () => this.handleDataChange());
        window.addEventListener('income_incomeAdded', () => this.handleDataChange());
        window.addEventListener('income_incomeUpdated', () => this.handleDataChange());
        window.addEventListener('income_incomeDeleted', () => this.handleDataChange());

        // Eventos de componentes
        window.addEventListener('component_allComponentsLoaded', () => this.handleComponentsLoaded());

        // Eventos de moneda
        window.addEventListener('currency_currencyChanged', (e) => this.handleCurrencyChanged(e));

        // Evento de cambio de sección - NUEVO
        window.addEventListener('dashboard_sectionChanged', (e) => {
            if (e.detail.section === 'income') {
                // Reset flag cuando cambiamos de sección
                this.state.buttonsConfigured = false;
            }
        });

        console.log('✅ Event listeners configurados');
    }

    /**
     * Manejar cambios en datos
     */
    handleDataChange() {
        // NUEVO: Si estamos en gastos extras, dejar que se maneje solo
        const currentSection = document.querySelector('.gastos-extras-layout');
        if (currentSection) {
            console.log('📊 Gastos extras activo, delegando actualización...');
            return;
        }

        if (this.isUpdatingDashboard) {
            return; // Evitar bucle si ya estamos actualizando
        }

        this.isUpdatingDashboard = true;
        console.log('🔄 Datos cambiados, actualizando...');
        setTimeout(() => {
            this.refreshData();
            this.isUpdatingDashboard = false; // Resetear flag
        }, 300);
    }

    /**
     * Manejar componentes cargados
     */
    handleComponentsLoaded() {
        console.log('🧩 Componentes cargados completamente');
        if (this.state.isInitialized) {
            this.initializeInterface();
        }

        // 🆕 BACKUP: Si la tabla no se inicializó antes, intentar aquí
        if (!window.incomeTableEnhanced && window.IncomeTableEnhanced && window.gastosManager) {
            window.incomeTableEnhanced = new window.IncomeTableEnhanced(window.gastosManager);
            console.log('📊 Tabla mejorada de ingresos inicializada (backup)');
        }
    }

    /**
     * Manejar cambio de moneda
     */
    handleCurrencyChanged(event) {
        console.log('💱 Moneda cambiada:', event.detail);
        this.updateStatCards();
    }

    /**
     * ACCIONES DE USUARIO
     */

    /**
     * Manejar agregar ingreso - MEJORADO
     */
    handleAddIncome() {
        console.log('💰 Procesando solicitud de agregar ingreso...');

        const ingresos = this.modules.get('ingresos');
        if (!ingresos) {
            console.error('❌ IngresosManager no disponible');
            alert('Error: Sistema de ingresos no disponible');
            return;
        }

        try {
            console.log('🚀 Abriendo modal de agregar ingreso...');
            ingresos.showAddIncomeModal();
            console.log('✅ Modal de ingresos abierto correctamente');
        } catch (error) {
            console.error('❌ Error abriendo modal de ingresos:', error);
            alert('Error al abrir el formulario de ingresos');
        }
    }

    /**
     * Manejar logout
     */
    handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            console.log('🚪 Cerrando sesión...');

            const auth = this.modules.get('auth');
            if (auth) {
                auth.logout();
            }
        }
    }

    /**
     * Manejar exportar datos
     */
    handleExportData() {
        console.log('📤 Exportando datos...');

        const storage = this.modules.get('storage');
        if (storage) {
            const exportResult = storage.exportData();
            if (exportResult) {
                this.downloadFile(exportResult.blob, exportResult.filename);
                alert('Datos exportados exitosamente');
            }
        }
    }

    /**
     * Manejar agregar usuario
     */
    handleAddUser() {
        alert('Función de agregar usuario en desarrollo');
    }

    /**
     * UTILIDADES
     */

    /**
     * Limpiar eventos de botón - MEJORADO
     */
    cleanButtonEvents(button) {
        // Remover atributos de configuración previa
        button.removeAttribute('data-income-configured');

        // Clonar elemento para eliminar todos los event listeners
        const newButton = button.cloneNode(true);
        if (button.parentNode) {
            button.parentNode.replaceChild(newButton, button);
        }

        return newButton;
    }

    /**
     * Resetear configuración de botones
     */
    resetButtonConfiguration() {
        console.log('🔄 Reseteando configuración de botones...');
        this.configuredElements.clear();
        this.state.buttonsConfigured = false;

        // Limpiar atributos de configuración
        document.querySelectorAll('[data-income-configured]').forEach(btn => {
            btn.removeAttribute('data-income-configured');
        });
    }

    /**
     * Descargar archivo
     */
    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Redirigir al login
     */
    redirectToLogin() {
        console.log('🔄 Redirigiendo al login...');
        window.location.href = 'index.html';
    }

    /**
     * Manejar error de inicialización
     */
    handleInitializationError(error) {
        console.error('💥 Error crítico en inicialización:', error);

        // Mostrar mensaje de error al usuario
        const errorMessage = document.createElement('div');
        errorMessage.className = 'initialization-error';
        errorMessage.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 32px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                text-align: center;
                z-index: 10000;
                max-width: 400px;
            ">
                <h3 style="color: #dc2626; margin: 0 0 16px 0;">Error de Inicialización</h3>
                <p style="margin: 0 0 20px 0; color: #4b5563;">
                    Hubo un problema al cargar el dashboard. Por favor, recarga la página.
                </p>
                <button onclick="window.location.reload()" 
                        style="
                            background: #3b82f6;
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 500;
                        ">
                    Recargar Página
                </button>
            </div>
        `;

        document.body.appendChild(errorMessage);
    }

    /**
     * EVENTOS PERSONALIZADOS
     */

    /**
     * Disparar evento de cambio de sección
     */
    dispatchSectionChangeEvent(sectionName) {
        const event = new CustomEvent('dashboard_sectionChanged', {
            detail: {
                section: sectionName,
                timestamp: new Date().toISOString(),
                state: this.state
            },
            bubbles: true
        });
        window.dispatchEvent(event);
    }

    /**
     * Disparar evento de actualización de datos
     */
    dispatchDataUpdateEvent() {
        const event = new CustomEvent('dashboard_dataUpdated', {
            detail: {
                data: this.state.dashboardData,
                timestamp: this.state.lastDataUpdate
            },
            bubbles: true
        });
        window.dispatchEvent(event);
    }

    /**
     * Disparar evento de cambio de moneda
     */
    dispatchCurrencyChangeEvent(newCurrency) {
        const event = new CustomEvent('dashboard_currencyChanged', {
            detail: {
                currency: newCurrency,
                previousCurrency: this.state.currentCurrency,
                timestamp: new Date().toISOString()
            },
            bubbles: true
        });
        window.dispatchEvent(event);
    }

    /**
     * FUNCIONES PÚBLICAS PARA DEBUGGING
     */

    /**
     * Obtener estado actual
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Obtener módulos registrados
     */
    getModules() {
        const moduleStatus = {};
        this.modules.forEach((instance, name) => {
            moduleStatus[name] = {
                available: !!instance,
                type: instance.constructor.name
            };
        });
        return moduleStatus;
    }

    /**
     * Forzar actualización completa
     */
    forceRefresh() {
        console.log('🔄 Forzando actualización completa...');
        this.resetButtonConfiguration();
        this.loadInitialData().then(() => {
            this.initializeInterface();
            this.loadSection(this.state.currentSection);
        });
    }

    /**
     * Destructor
     */
    destroy() {
        console.log('🧹 Destruyendo DashboardOrchestrator...');

        // Limpiar referencias
        this.modules.clear();
        this.configuredElements.clear();
        this.state = null;

        console.log('✅ DashboardOrchestrator destruido');
    }
}

// Crear instancia global
window.dashboardOrchestrator = new DashboardOrchestrator();

// Funciones globales para compatibilidad
window.showChart = function () {
    const reportes = window.dashboardOrchestrator.modules.get('reportes');
    if (reportes) {
        window.dashboardOrchestrator.loadSection('reports');
    } else {
        alert('Función de gráficos será implementada próximamente');
    }
};

window.showBalanceDetail = function () {
    const gastos = window.dashboardOrchestrator.modules.get('gastos');
    if (gastos) {
        gastos.showBalanceDetalle();
    }
};

window.showIncomeDetail = function () {
    const gastos = window.dashboardOrchestrator.modules.get('gastos');
    if (gastos) {
        gastos.showIngresoDetalle();
    }
};

// Debug utilities - AMPLIADO
window.dashboardDebug = {
    getState: () => window.dashboardOrchestrator.getState(),
    getModules: () => window.dashboardOrchestrator.getModules(),
    forceRefresh: () => window.dashboardOrchestrator.forceRefresh(),
    loadSection: (section) => window.dashboardOrchestrator.loadSection(section),
    refreshData: () => window.dashboardOrchestrator.refreshData(),
    resetButtons: () => window.dashboardOrchestrator.resetButtonConfiguration(),
    testIncomeModal: () => window.dashboardOrchestrator.handleAddIncome(),
    getConfiguredElements: () => window.dashboardOrchestrator.configuredElements.size,
    checkIncomeTable: () => !!window.incomeTableEnhanced
};

console.log('🎯 Dashboard-main.js v1.2.0 - TABLA MEJORADA INTEGRADA');
console.log('🛠️ Debug disponible en: window.dashboardDebug');
console.log('📊 Tabla mejorada de ingresos: Inicialización optimizada');