/**
     * Establecer valor de formulario
     *//**
 * CONFIG-UI.JS - Interfaz con Menú Lateral (Layout 2 Columnas)
 * Control de Gastos Familiares - Versión 2.2.0 CON APARIENCIA INTEGRADA
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Layout de 2 columnas (menú lateral + contenido)
 * ✅ 5 secciones específicas de configuración (CON TEMAS)
 * ✅ Navegación tipo menú con contenido dinámico
 * ✅ Inyección de secciones de configuración
 * ✅ Event listeners de formularios
 * ✅ UI responsiva y accesible
 * ✅ TEMAS INTEGRADOS - Sistema unificado
 */

class ConfigUI {
    constructor() {
        this.configCore = null;
        this.configCurrency = null;
        this.isInjected = false;
        this.container = null;
        this.checkInterval = null;
        this.activeSection = 'appearance'; // ✅ CAMBIADO a 'appearance' como sección inicial
        
        // Elementos del formulario
        this.formElements = new Map();
        
        // ✅ DEFINICIÓN DE SECCIONES CON TEMAS INCLUIDOS
        this.menuSections = [
            { id: 'appearance', icon: '🎨', title: 'Apariencia', description: 'Temas y personalización visual' },
            { id: 'user', icon: '👤', title: 'Usuario', description: 'Información personal y formato' },
            { id: 'currency', icon: '💱', title: 'Moneda y Formato', description: 'Configuración de moneda y números' },
            { id: 'notifications', icon: '🔔', title: 'Notificaciones', description: 'Recordatorios y alertas' },
            { id: 'language', icon: '🌍', title: 'Idioma y Localización', description: 'Idioma de la interfaz' }
        ];
        
        this.init();
    }

    /**
     * 🚀 Inicialización
     */
    init() {
        console.log('🎨 ConfigUI v2.2: Inicializando interfaz con temas integrados...');
        
        // Esperar dependencias
        this.waitForDependencies().then(() => {
            this.setupDetection();
            console.log('✅ ConfigUI v2.2: Interfaz inicializada (con temas integrados)');
        });
    }

    /**
     * Esperar dependencias
     */
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                this.configCore = window.configCore;
                this.configCurrency = window.configCurrency;
                
                if (this.configCore && this.configCurrency) {
                    console.log('📦 ConfigUI: Dependencias encontradas');
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    /**
     * Configurar detección de sección de configuración
     */
    setupDetection() {
        // Escuchar clicks en menú - DETECCIÓN INMEDIATA
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            if (target && (
                target.textContent?.includes('Configuración') ||
                target.closest('.nav-item')?.textContent?.includes('Configuración')
            )) {
                console.log('🎯 ConfigUI: Click detectado en Configuración');
                
                // 🚨 FIX: Detección inmediata sin delay
                this.tryInjectUI();
                
                // Backup: intentar de nuevo rápidamente si no funciona la primera vez
                setTimeout(() => {
                    this.tryInjectUI();
                }, 50);
            }
        });

        // Polling más agresivo para casos edge
        this.checkInterval = setInterval(() => {
            if (!this.isInjected) {
                this.tryInjectUI();
            }
        }, 1000); // Reducido de 3000ms a 1000ms
    }

    /**
     * Intentar inyectar interfaz
     */
    tryInjectUI() {
        // 🚨 FIX: Verificar si el container aún existe en el DOM
        if (this.isInjected && this.container && this.container.isConnected) {
            return;
        }

        // 🔄 RESET: Si está marcado como inyectado pero no está en DOM, resetear
        if (this.isInjected && (!this.container || !this.container.isConnected)) {
            console.log('🔄 ConfigUI: Reseteando estado - container perdido');
            this.resetInjectionState();
        }

        const configSection = this.findConfigSection();
        if (configSection) {
            this.injectUI(configSection);
        }
    }

    /**
     * Buscar sección de configuración
     */
    findConfigSection() {
        // Buscar por contenido activo
        const activeSections = document.querySelectorAll('.content-section.active');
        for (const section of activeSections) {
            const header = section.querySelector('h2');
            if (header && header.textContent && header.textContent.includes('Configuración')) {
                return section;
            }
        }

        // Buscar en contenido dinámico
        const dynamicContent = document.getElementById('dynamic-content');
        if (dynamicContent) {
            const header = dynamicContent.querySelector('h2');
            if (header && header.textContent && header.textContent.includes('Configuración')) {
                return dynamicContent;
            }
        }

        return null;
    }

    /**
     * Inyectar interfaz completa (SIN DESTRUIR CONTENIDO EXISTENTE)
     */
    injectUI(configSection) {
        // Verificar si ya existe
        if (configSection.querySelector('#config-ui-container')) {
            this.isInjected = true;
            return;
        }

        console.log('🎨 Inyectando interfaz coexistiendo con theme-manager...');

        // ✅ PRESERVAR contenido existente (especialmente theme-config-section)
        // NO hacer innerHTML = '' para mantener la sección de temas

        // Crear contenedor principal
        this.container = document.createElement('div');
        this.container.id = 'config-ui-container';
        this.container.className = 'config-ui-container';
        
        // Crear interfaz con layout 2 columnas
        this.container.innerHTML = this.createLayoutInterface();

        // ✅ INSERTAR RESPETANDO contenido existente
        this.insertIntoSection(configSection);

        // Configurar eventos
        this.setupEventListeners();

        // Cargar datos iniciales
        this.loadInitialData();

        // Mostrar sección inicial (apariencia)
        this.showSection('appearance');

        // Marcar como inyectado
        this.isInjected = true;

        console.log('✅ ConfigUI: Interfaz coexistente inyectada exitosamente');
    }

    /**
     * ✅ INSERTAR RESPETANDO CONTENIDO EXISTENTE
     */
    insertIntoSection(configSection) {
        // Buscar después de theme-config-section si existe
        const themeSection = configSection.querySelector('#theme-config-section');
        const configContent = configSection.querySelector('.config-content') || configSection;
        
        if (themeSection) {
            // Insertar DESPUÉS de la sección de temas
            themeSection.insertAdjacentElement('afterend', this.container);
            console.log('🎨 ConfigUI: Insertado después de theme-config-section');
        } else {
            // Si no hay sección de temas, insertar normalmente
            const sectionHeader = configSection.querySelector('.section-header, h2');
            if (sectionHeader) {
                sectionHeader.insertAdjacentElement('afterend', this.container);
                console.log('🎨 ConfigUI: Insertado después del header');
            } else {
                configContent.appendChild(this.container);
                console.log('🎨 ConfigUI: Insertado al final de la sección');
            }
        }
    }

    /**
     * Crear interfaz principal con layout 2 columnas
     */
    createLayoutInterface() {
        return `
            <div class="config-layout">
                <!-- Menú lateral izquierdo (SIN HEADER DUPLICADO) -->
                <div class="config-sidebar">
                    <nav class="config-menu">
                        ${this.createMenuItems()}
                    </nav>
                </div>
                
                <!-- Área de contenido derecho -->
                <div class="config-content-area">
                    <div class="config-content-header">
                        <h3 id="content-title">🎨 Apariencia</h3>
                        <p id="content-description">Temas y personalización visual</p>
                    </div>
                    
                    <div class="config-content-body" id="config-content-body">
                        <!-- El contenido se carga dinámicamente aquí -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crear items del menú lateral
     */
    createMenuItems() {
        return this.menuSections.map(section => `
            <div class="config-menu-item ${section.id === 'appearance' ? 'active' : ''}" 
                 data-section="${section.id}">
                <div class="menu-item-icon">${section.icon}</div>
                <div class="menu-item-content">
                    <div class="menu-item-title">${section.title}</div>
                    <div class="menu-item-subtitle">${section.description}</div>
                </div>
                <div class="menu-item-arrow">›</div>
            </div>
        `).join('');
    }

    /**
     * 📱 SECCIONES DE CONTENIDO (CON APARIENCIA INCLUIDA)
     */

    /**
     * Crear sección de Apariencia
     */
    createAppearanceSection() {
        return `
            <div class="config-section-content">
                <div class="form-group">
                    <label for="theme-selector" class="form-label">Tema de la aplicación:</label>
                    <select id="config-theme-selector" class="form-select">
                        <option value="auto">🔄 Automático (sigue preferencias del sistema)</option>
                        <option value="light">☀️ Claro</option>
                        <option value="pastel">🌸 Pasteles</option>
                        <option value="soft-dark">🌅 Soft Dark</option>
                        <option value="dark">🌙 Oscuro</option>
                    </select>
                    <small class="form-help">El tema automático cambia según las preferencias de tu sistema operativo</small>
                </div>
                
                <div class="theme-info">
                    <div class="info-icon">💡</div>
                    <div class="info-content">
                        <strong>Información del tema actual</strong>
                        <p id="theme-current-info">
                            Tema activo: <span id="current-theme-name">Automático</span>
                            <span id="auto-theme-detail" style="display: none;"> · Sistema usa: <span id="system-preference">Claro</span></span>
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Crear sección de Usuario
     */
    createUserSection() {
        return `
            <div class="config-section-content">
                <div class="form-group">
                    <label for="user-name" class="form-label">Nombre del usuario/familia:</label>
                    <input type="text" id="user-name" class="form-input" placeholder="Ej: Familia García">
                    <small class="form-help">Este nombre aparecerá en reportes y documentos</small>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="date-format" class="form-label">Formato de fecha:</label>
                        <select id="date-format" class="form-select">
                            <option value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="week-start" class="form-label">Primer día de la semana:</label>
                        <select id="week-start" class="form-select">
                            <option value="monday">Lunes</option>
                            <option value="sunday">Domingo</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="timezone" class="form-label">Zona horaria:</label>
                    <select id="timezone" class="form-select">
                        <option value="America/Santiago">América/Santiago (UTC-3)</option>
                        <option value="America/New_York">América/Nueva_York (UTC-5)</option>
                        <option value="Europe/Madrid">Europa/Madrid (UTC+1)</option>
                        <option value="America/Mexico_City">América/Ciudad_de_México (UTC-6)</option>
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * Crear sección de Moneda y Formato
     */
    createCurrencySection() {
        return `
            <div class="config-section-content">
                <div class="form-row">
                    <div class="form-group">
                        <label for="currency-code" class="form-label">Moneda principal:</label>
                        <select id="currency-code" class="form-select">
                            <option value="CLP">🇨🇱 Peso Chileno (CLP)</option>
                            <option value="USD">🇺🇸 Dólar Estadounidense (USD)</option>
                            <option value="EUR">🇪🇺 Euro (EUR)</option>
                            <option value="MXN">🇲🇽 Peso Mexicano (MXN)</option>
                            <option value="ARS">🇦🇷 Peso Argentino (ARS)</option>
                            <option value="BRL">🇧🇷 Real Brasileño (BRL)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="currency-symbol" class="form-label">Símbolo:</label>
                        <input type="text" id="currency-symbol" class="form-input" placeholder="$" maxlength="3">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="thousands-separator" class="form-label">Separador de miles:</label>
                        <select id="thousands-separator" class="form-select">
                            <option value=".">Punto (1.000.000)</option>
                            <option value=",">Coma (1,000,000)</option>
                            <option value=" ">Espacio (1 000 000)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="decimal-separator" class="form-label">Separador decimal:</label>
                        <select id="decimal-separator" class="form-select">
                            <option value=",">Coma (1.000,50)</option>
                            <option value=".">Punto (1,000.50)</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="currency-position" class="form-label">Posición del símbolo:</label>
                        <select id="currency-position" class="form-select">
                            <option value="before">Antes del número ($1.000)</option>
                            <option value="after">Después del número (1.000$)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="show-cents" class="form-checkbox">
                            <span class="checkbox-text">Mostrar centavos/decimales</span>
                        </label>
                    </div>
                </div>
                
                <div class="preview-section">
                    <label class="form-label">Vista previa:</label>
                    <div class="currency-preview" id="currency-preview">$1.234.567</div>
                </div>
            </div>
        `;
    }

    /**
     * Crear sección de Notificaciones
     */
    createNotificationsSection() {
        return `
            <div class="config-section-content">
                <div class="checkbox-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="pending-reminders" class="form-checkbox">
                        <span class="checkbox-text">
                            <strong>Recordatorios de gastos pendientes</strong>
                            <small>Te notifica cuando tienes gastos sin marcar como pagados</small>
                        </span>
                    </label>
                    
                    <label class="checkbox-label">
                        <input type="checkbox" id="budget-alerts" class="form-checkbox">
                        <span class="checkbox-text">
                            <strong>Alertas de presupuesto</strong>
                            <small>Te avisa cuando superas el presupuesto establecido</small>
                        </span>
                    </label>
                    
                    <label class="checkbox-label">
                        <input type="checkbox" id="autosave-notification" class="form-checkbox">
                        <span class="checkbox-text">
                            <strong>Notificación de auto-guardado</strong>
                            <small>Muestra mensaje cuando se guardan cambios automáticamente</small>
                        </span>
                    </label>
                    
                    <label class="checkbox-label">
                        <input type="checkbox" id="interface-sounds" class="form-checkbox">
                        <span class="checkbox-text">
                            <strong>Sonidos de la interfaz</strong>
                            <small>Reproduce sonidos al hacer click y otras interacciones</small>
                        </span>
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Crear sección de Idioma
     */
    createLanguageSection() {
        return `
            <div class="config-section-content">
                <div class="form-group">
                    <label for="language-select" class="form-label">Idioma de la interfaz:</label>
                    <select id="language-select" class="form-select">
                        <option value="es-CL">🇨🇱 Español (Chile)</option>
                        <option value="es-ES">🇪🇸 Español (España)</option>
                        <option value="es-MX">🇲🇽 Español (México)</option>
                        <option value="en-US">🇺🇸 English (United States)</option>
                        <option value="pt-BR">🇧🇷 Português (Brasil)</option>
                    </select>
                </div>
                
                <div class="language-info">
                    <div class="info-icon">ℹ️</div>
                    <div class="info-content">
                        <strong>Nota:</strong> Cambiar el idioma afectará todos los textos de la interfaz. 
                        Algunos cambios pueden requerir recargar la página para aplicarse completamente.
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 🎧 GESTIÓN DE EVENTOS
     */

    /**
     * Configurar todos los event listeners
     */
    setupEventListeners() {
        this.setupMenuEvents();
        this.setupConfigEvents();
    }

    /**
     * Configurar eventos del menú
     */
    setupMenuEvents() {
        const menuItems = this.container.querySelectorAll('.config-menu-item');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.section;
                this.showSection(sectionId);
            });
        });
    }

    /**
     * Configurar eventos de configuración
     */
    setupConfigEvents() {
        // Escuchar cambios en configuración
        window.addEventListener('config_sectionUpdated', (e) => {
            this.handleConfigUpdate(e.detail);
        });

        window.addEventListener('config_configSaved', () => {
            this.showSaveIndicator();
        });
    }

    /**
     * 🔄 NAVEGACIÓN DE SECCIONES
     */

    /**
     * Mostrar sección específica
     */
    showSection(sectionId) {
        console.log(`🎨 ConfigUI: Mostrando sección ${sectionId}`);
        
        this.activeSection = sectionId;
        
        // Actualizar menú activo
        this.updateActiveMenu(sectionId);
        
        // Actualizar header
        this.updateContentHeader(sectionId);
        
        // Cargar contenido
        this.loadSectionContent(sectionId);
        
        // Configurar eventos específicos de la sección
        setTimeout(() => {
            this.setupSectionEvents(sectionId);
        }, 100);
    }

    /**
     * Actualizar item activo del menú
     */
    updateActiveMenu(sectionId) {
        const menuItems = this.container.querySelectorAll('.config-menu-item');
        menuItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });
    }

    /**
     * Actualizar header del contenido
     */
    updateContentHeader(sectionId) {
        const section = this.menuSections.find(s => s.id === sectionId);
        if (section) {
            const titleElement = this.container.querySelector('#content-title');
            const descElement = this.container.querySelector('#content-description');
            
            if (titleElement) titleElement.textContent = `${section.icon} ${section.title}`;
            if (descElement) descElement.textContent = section.description;
        }
    }

    /**
     * Cargar contenido de la sección (SIN APPEARANCE)
     */
    loadSectionContent(sectionId) {
        const contentBody = this.container.querySelector('#config-content-body');
        if (!contentBody) return;
        
        let content = '';
        
        switch (sectionId) {
            case 'appearance':
                content = this.createAppearanceSection();
                break;
            case 'user':
                content = this.createUserSection();
                break;
            case 'currency':
                content = this.createCurrencySection();
                break;
            case 'notifications':
                content = this.createNotificationsSection();
                break;
            case 'language':
                content = this.createLanguageSection();
                break;
            default:
                content = '<p>Sección no implementada</p>';
        }
        
        contentBody.innerHTML = content;
        
        // Aplicar animación
        contentBody.classList.add('section-loading');
        setTimeout(() => {
            contentBody.classList.remove('section-loading');
        }, 300);
    }

    /**
     * Configurar eventos específicos de cada sección (SIN APPEARANCE)
     */
    setupSectionEvents(sectionId) {
        this.formElements.clear();
        
        switch (sectionId) {
            case 'appearance':
                this.setupAppearanceEvents();
                break;
            case 'user':
                this.setupUserEvents();
                break;
            case 'currency':
                this.setupCurrencyEvents();
                break;
            case 'notifications':
                this.setupNotificationEvents();
                break;
            case 'language':
                this.setupLanguageEvents();
                break;
        }
        
        // Cargar datos para la sección actual
        this.loadSectionData(sectionId);
    }

    /**
     * 📝 EVENTOS DE FORMULARIOS (CON TEMAS)
     */

    /**
     * Configurar eventos de apariencia (temas)
     */
    setupAppearanceEvents() {
        const themeSelector = this.container.querySelector('#config-theme-selector');

        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                const selectedTheme = e.target.value;
                
                // Usar ThemeManager si está disponible
                if (window.themeManager) {
                    window.themeManager.setTheme(selectedTheme);
                } else {
                    console.warn('ThemeManager no disponible');
                }
                
                // Actualizar info del tema
                setTimeout(() => {
                    this.updateThemeInfo();
                }, 100);
            });
            this.formElements.set('theme-selector', themeSelector);
        }
    }

    /**
     * Configurar eventos de usuario
     */
    setupUserEvents() {
        const userName = this.container.querySelector('#user-name');
        const dateFormat = this.container.querySelector('#date-format');
        const weekStart = this.container.querySelector('#week-start');
        const timezone = this.container.querySelector('#timezone');

        if (userName) {
            userName.addEventListener('input', (e) => {
                this.configCore.updateValue('user', 'name', e.target.value);
            });
            this.formElements.set('user-name', userName);
        }

        if (dateFormat) {
            dateFormat.addEventListener('change', (e) => {
                this.configCore.updateValue('user', 'dateFormat', e.target.value);
            });
            this.formElements.set('date-format', dateFormat);
        }

        if (weekStart) {
            weekStart.addEventListener('change', (e) => {
                this.configCore.updateValue('user', 'weekStart', e.target.value);
            });
            this.formElements.set('week-start', weekStart);
        }

        if (timezone) {
            timezone.addEventListener('change', (e) => {
                this.configCore.updateValue('user', 'timezone', e.target.value);
            });
            this.formElements.set('timezone', timezone);
        }
    }

    /**
     * Configurar eventos de moneda
     */
    setupCurrencyEvents() {
        const currencyCode = this.container.querySelector('#currency-code');
        const currencySymbol = this.container.querySelector('#currency-symbol');
        const currencyPosition = this.container.querySelector('#currency-position');
        const thousandsSeparator = this.container.querySelector('#thousands-separator');
        const decimalSeparator = this.container.querySelector('#decimal-separator');
        const showCents = this.container.querySelector('#show-cents');

        if (currencyCode) {
            currencyCode.addEventListener('change', (e) => {
                this.configCurrency.setCurrency(e.target.value);
            });
            this.formElements.set('currency-code', currencyCode);
        }

        if (currencySymbol) {
            currencySymbol.addEventListener('input', (e) => {
                this.configCore.updateValue('currency', 'symbol', e.target.value);
                this.updateCurrencyPreview();
            });
            this.formElements.set('currency-symbol', currencySymbol);
        }

        if (currencyPosition) {
            currencyPosition.addEventListener('change', (e) => {
                this.configCore.updateValue('currency', 'position', e.target.value);
                this.updateCurrencyPreview();
            });
            this.formElements.set('currency-position', currencyPosition);
        }

        const separators = [
            { element: thousandsSeparator, key: 'thousands', id: 'thousands-separator' },
            { element: decimalSeparator, key: 'decimals', id: 'decimal-separator' }
        ];

        separators.forEach(({ element, key, id }) => {
            if (element) {
                element.addEventListener('change', (e) => {
                    this.configCore.updateValue('currency', key, e.target.value);
                    this.updateCurrencyPreview();
                });
                this.formElements.set(id, element);
            }
        });

        if (showCents) {
            showCents.addEventListener('change', (e) => {
                this.configCore.updateValue('currency', 'showCents', e.target.checked);
                this.updateCurrencyPreview();
            });
            this.formElements.set('show-cents', showCents);
        }

        // Configurar vista previa
        this.configCurrency.setupPreview('currency-preview');
    }

    /**
     * Configurar eventos de notificaciones
     */
    setupNotificationEvents() {
        const checkboxes = [
            { id: 'pending-reminders', key: 'pendingReminders' },
            { id: 'budget-alerts', key: 'budgetAlerts' },
            { id: 'autosave-notification', key: 'autoSaveNotification' },
            { id: 'interface-sounds', key: 'sounds' }
        ];

        checkboxes.forEach(({ id, key }) => {
            const checkbox = this.container.querySelector(`#${id}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.configCore.updateValue('notifications', key, e.target.checked);
                });
                this.formElements.set(id, checkbox);
            }
        });
    }

    /**
     * Configurar eventos de idioma
     */
    setupLanguageEvents() {
        const languageSelect = this.container.querySelector('#language-select');

        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                const code = e.target.value;
                const names = {
                    'es-CL': 'Español (Chile)',
                    'es-ES': 'Español (España)',
                    'es-MX': 'Español (México)',
                    'en-US': 'English (United States)',
                    'pt-BR': 'Português (Brasil)'
                };
                
                this.configCore.updateSection('language', {
                    code: code,
                    name: names[code]
                });
            });
            this.formElements.set('language-select', languageSelect);
        }
    }

    /**
     * 🔄 GESTIÓN DE DATOS (SIN TEMAS)
     */

    /**
     * Cargar datos iniciales
     */
    loadInitialData() {
        console.log('📄 ConfigUI: Cargando datos iniciales...');
        // Los datos se cargarán cuando se seleccione cada sección
    }

    /**
     * Cargar datos para sección específica (SIN APPEARANCE)
     */
    loadSectionData(sectionId) {
        const config = this.configCore.getConfig();
        if (!config) return;

        switch (sectionId) {
            case 'appearance':
                this.loadThemeData();
                break;
            case 'user':
                this.setFormValue('user-name', config.user?.name);
                this.setFormValue('date-format', config.user?.dateFormat);
                this.setFormValue('week-start', config.user?.weekStart);
                this.setFormValue('timezone', config.user?.timezone);
                break;
                
            case 'currency':
                this.setFormValue('currency-code', config.currency?.code);
                this.setFormValue('currency-symbol', config.currency?.symbol);
                this.setFormValue('currency-position', config.currency?.position);
                this.setFormValue('thousands-separator', config.currency?.thousands);
                this.setFormValue('decimal-separator', config.currency?.decimals);
                this.setFormValue('show-cents', config.currency?.showCents, 'checkbox');
                setTimeout(() => this.updateCurrencyPreview(), 100);
                break;
                
            case 'notifications':
                this.setFormValue('pending-reminders', config.notifications?.pendingReminders, 'checkbox');
                this.setFormValue('budget-alerts', config.notifications?.budgetAlerts, 'checkbox');
                this.setFormValue('autosave-notification', config.notifications?.autoSaveNotification, 'checkbox');
                this.setFormValue('interface-sounds', config.notifications?.sounds, 'checkbox');
                break;
                
            case 'language':
                this.setFormValue('language-select', config.language?.code);
                break;
        }
    }

    /**
     * Cargar datos de tema
     */
    loadThemeData() {
        if (window.themeManager) {
            const currentTheme = window.themeManager.getCurrentTheme();
            this.setFormValue('theme-selector', currentTheme);
            this.updateThemeInfo();
        }
    }

    /**
     * Actualizar información del tema
     */
    updateThemeInfo() {
        if (!window.themeManager) return;
        
        const currentThemeName = this.container.querySelector('#current-theme-name');
        const autoThemeDetail = this.container.querySelector('#auto-theme-detail');
        const systemPreference = this.container.querySelector('#system-preference');

        if (!currentThemeName) return;

        const currentTheme = window.themeManager.getCurrentTheme();
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const themeNames = {
            auto: 'Automático',
            light: 'Claro',
            dark: 'Oscuro',
            pastel: 'Pasteles',
            'soft-dark': 'Soft Dark'
        };

        currentThemeName.textContent = themeNames[currentTheme] || currentTheme;

        if (currentTheme === 'auto' && autoThemeDetail && systemPreference) {
            autoThemeDetail.style.display = 'inline';
            systemPreference.textContent = mediaQuery.matches ? 'Oscuro' : 'Claro';
        } else if (autoThemeDetail) {
            autoThemeDetail.style.display = 'none';
        }
    }
    setFormValue(elementId, value, type = 'input') {
        const element = this.formElements.get(elementId);
        if (!element || value === undefined) return;

        if (type === 'checkbox') {
            element.checked = !!value;
        } else {
            element.value = value;
        }
    }

    /**
     * Manejar actualización de configuración
     */
    handleConfigUpdate(detail) {
        if (detail.section && this.isInjected) {
            // Recargar datos para la sección activa si corresponde
            if (detail.section === this.activeSection) {
                setTimeout(() => {
                    this.loadSectionData(this.activeSection);
                }, 100);
            }
        }
    }

    /**
     * 🎨 GESTIÓN DE UI
     */

    /**
     * Actualizar vista previa de moneda
     */
    updateCurrencyPreview() {
        if (this.configCurrency) {
            this.configCurrency.updatePreview();
        }
    }

    /**
     * Mostrar indicador de guardado
     */
    showSaveIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.textContent = '✅ Guardado';
        indicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--success-600);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(indicator);

        setTimeout(() => {
            indicator.remove();
        }, 2000);
    }

    /**
     * 🧹 LIMPIEZA
     */

    /**
     * Resetear estado de inyección
     */
    resetInjectionState() {
        this.isInjected = false;
        this.container = null;
        this.formElements.clear();
        this.activeSection = 'appearance'; // ✅ CAMBIADO a 'appearance'
    }

    /**
     * Destruir instancia
     */
    destroy() {
        console.log('🧹 Destruyendo ConfigUI...');

        // Limpiar interval
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        // Limpiar container
        if (this.container) {
            this.container.remove();
        }

        // Limpiar referencias
        this.resetInjectionState();
        this.configCore = null;
        this.configCurrency = null;

        console.log('✅ ConfigUI v2.1 destruido (coexistente con theme-manager)');
    }

    /**
     * 🛠️ UTILIDADES
     */

    /**
     * Obtener estado de debugging
     */
    getDebugInfo() {
        return {
            version: '2.1.0',
            isInjected: this.isInjected,
            activeSection: this.activeSection,
            hasContainer: !!this.container,
            formElementsCount: this.formElements.size,
            hasConfigCore: !!this.configCore,
            hasConfigCurrency: !!this.configCurrency,
            menuSections: this.menuSections.map(s => s.id),
            themesRemoved: false, // ✅ Indicador de que los temas están INCLUIDOS
            themesIntegrated: true // ✅ Temas integrados en config-ui
        };
    }
}

// Crear instancia global
window.configUI = new ConfigUI();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigUI;
}

console.log('🎨 ConfigUI v2.2.0 cargado - Interfaz CON TEMAS INTEGRADOS (sistema unificado)');