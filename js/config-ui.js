/**
 * CONFIG-UI.JS - Módulo de Interfaz de Configuración
 * Control de Gastos Familiares - v2.1.3 - SOLUCIÓN DEFINITIVA
 * * 🔧 FUNCIONALIDADES:
 * ✅ Menú lateral con 5 secciones
 * ✅ Configuración de monedas
 * ✅ Selector de temas
 * ✅ Configuración general
 * ✅ Importar/exportar
 * ✅ Información de la aplicación
 * ✅ 🎯 FIX v3: Solucionado problema de pérdida de foco (Forzado con setTimeout)
 * ✅ 🐛 FIX: Corregido crash con el sistema de modales
 */

class ConfigUI {
    constructor() {
        this.storage = window.storageManager;
        this.currencyManager = window.currencyManager;
        this.themeManager = window.themeManager;
        this.currentSection = 'general';
        this.isInjected = false;
        
        this.init();
    }

    /**
     * Inicializar sistema de configuración
     */
    init() {
        console.log('⚙️ ConfigUI v2.1.3: Inicializando...');
        
        if (!this.storage) {
            console.error('❌ StorageManager no está disponible');
            return;
        }

        // Esperar a que el componente loader esté listo
        setTimeout(() => {
            this.tryInjectUI();
        }, 1000);
    }

    /**
     * Intentar inyectar la interfaz de configuración
     */
    tryInjectUI() {
        const contentArea = document.getElementById('dynamic-content');
        if (!contentArea || this.isInjected) {
            return;
        }

        const currentContent = contentArea.textContent || '';
        if (currentContent.includes('Configuración de la app')) {
            this.injectConfigurationUI(contentArea);
            return;
        }

        if (contentArea.querySelector('.section-header h2')?.textContent?.includes('Configuración')) {
            this.injectConfigurationUI(contentArea);
        }
    }

    /**
     * Inyectar interfaz completa de configuración
     */
    injectConfigurationUI(container) {
        const configHTML = this.generateConfigHTML();
        container.innerHTML = configHTML;
        this.isInjected = true;

        setTimeout(() => {
            this.setupConfigEvents();
            this.loadSection(this.currentSection);
        }, 100);

        console.log('✅ ConfigUI: Interfaz inyectada correctamente');
    }

    /**
     * Generar HTML completo de configuración
     */
    generateConfigHTML() {
        return `
            <section class="content-section active">
                <div class="section-header">
                    <h2>⚙️ Configuración de la Aplicación</h2>
                    <p>Personaliza tu experiencia y ajusta las preferencias del sistema</p>
                </div>

                <div class="config-ui-container">
                    <div class="config-layout">
                        <!-- Menú Lateral -->
                        <div class="config-sidebar">
                            <div class="config-sidebar-header">
                                <h3>⚙️ Configuración</h3>
                            </div>
                            <div class="config-menu">
                                <button class="config-menu-item active" data-section="general">
                                    <span class="menu-item-icon">🔧</span>
                                    <div class="menu-item-content">
                                        <div class="menu-item-title">General</div>
                                        <div class="menu-item-subtitle">Configuración básica</div>
                                    </div>
                                    <span class="menu-item-arrow">→</span>
                                </button>
                                
                                <button class="config-menu-item" data-section="currency">
                                    <span class="menu-item-icon">💱</span>
                                    <div class="menu-item-content">
                                        <div class="menu-item-title">Monedas</div>
                                        <div class="menu-item-subtitle">Formato y conversión</div>
                                    </div>
                                    <span class="menu-item-arrow">→</span>
                                </button>
                                
                                <button class="config-menu-item" data-section="theme">
                                    <span class="menu-item-icon">🎨</span>
                                    <div class="menu-item-content">
                                        <div class="menu-item-title">Temas</div>
                                        <div class="menu-item-subtitle">Apariencia visual</div>
                                    </div>
                                    <span class="menu-item-arrow">→</span>
                                </button>
                                
                                <button class="config-menu-item" data-section="data">
                                    <span class="menu-item-icon">📁</span>
                                    <div class="menu-item-content">
                                        <div class="menu-item-title">Datos</div>
                                        <div class="menu-item-subtitle">Importar/Exportar</div>
                                    </div>
                                    <span class="menu-item-arrow">→</span>
                                </button>
                                
                                <button class="config-menu-item" data-section="about">
                                    <span class="menu-item-icon">ℹ️</span>
                                    <div class="menu-item-content">
                                        <div class="menu-item-title">Acerca de</div>
                                        <div class="menu-item-subtitle">Información de la app</div>
                                    </div>
                                    <span class="menu-item-arrow">→</span>
                                </button>
                            </div>
                        </div>

                        <!-- Área de Contenido -->
                        <div class="config-content-area">
                            <div class="config-content-header">
                                <h3 id="section-title">🔧 Configuración General</h3>
                                <p id="section-description">Ajusta las preferencias básicas de la aplicación</p>
                            </div>
                            <div class="config-content-body" id="config-content-body">
                                <!-- El contenido se carga dinámicamente -->
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * Configurar eventos de la interfaz
     */
    setupConfigEvents() {
        const menuItems = document.querySelectorAll('.config-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const section = item.dataset.section;
                this.switchSection(section);
            });
        });
        console.log('🎧 ConfigUI: Eventos configurados');
    }

    /**
     * Cambiar de sección
     */
    switchSection(section) {
        document.querySelectorAll('.config-menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        this.currentSection = section;
        this.loadSection(section);
    }

    /**
     * Cargar contenido de una sección (Refactorizado)
     */
    loadSection(section) {
        const titleElement = document.getElementById('section-title');
        const descriptionElement = document.getElementById('section-description');
        const contentElement = document.getElementById('config-content-body');
        let htmlContent = '';

        switch (section) {
            case 'general':
                titleElement.textContent = '🔧 Configuración General';
                descriptionElement.textContent = 'Ajusta las preferencias básicas de la aplicación';
                htmlContent = this.generateGeneralSection();
                break;
            case 'currency':
                titleElement.textContent = '💱 Configuración de Monedas';
                descriptionElement.textContent = 'Gestiona la moneda principal y formato de números';
                htmlContent = this.generateCurrencySection();
                break;
            case 'theme':
                titleElement.textContent = '🎨 Temas y Apariencia';
                descriptionElement.textContent = 'Personaliza la apariencia visual de la aplicación';
                htmlContent = this.generateThemeSection();
                break;
            case 'data':
                titleElement.textContent = '📁 Gestión de Datos';
                descriptionElement.textContent = 'Importa y exporta tu información';
                htmlContent = this.generateDataSection();
                break;
            case 'about':
                titleElement.textContent = 'ℹ️ Acerca de la Aplicación';
                descriptionElement.textContent = 'Información del sistema y versión';
                htmlContent = this.generateAboutSection();
                break;
        }

        contentElement.innerHTML = htmlContent;
        this.setupFormFocusFix();

        if (section === 'currency') this.setupCurrencyEvents();
        if (section === 'theme') this.setupThemeEvents();
        if (section === 'data') this.setupDataEvents();
    }

/**
 * 🎯 FIX AGRESIVO v4: Configuración para GANAR la batalla contra notas.js
 * Este método es MÁS agresivo que el sistema de notas.js
 */
setupFormFocusFix() {
    console.log('🚨 ACTIVANDO FIX AGRESIVO v4 - Modo Competencia contra notas.js');
    
    const formElements = document.querySelectorAll('#config-content-body .form-input, #config-content-body .form-select, #config-content-body .form-checkbox');
    
    if (formElements.length === 0) {
        console.log('⚠️ No se encontraron elementos de formulario en config-content-body');
        return;
    }

    formElements.forEach((element, index) => {
        // ESTRATEGIA 1: Interceptar ANTES que notas.js con capture: true
        element.addEventListener('mousedown', (e) => {
            console.log(`🎯 ConfigUI interceptando mousedown en elemento ${index}`);
            
            // DETENER INMEDIATAMENTE cualquier propagación
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            
            // FORZAR FOCO MÚLTIPLE - más agresivo que notas.js
            setTimeout(() => {
                element.focus();
                console.log(`✅ Foco forzado en elemento ${index}`);
            }, 0);
            
            setTimeout(() => {
                element.focus();
                console.log(`🔄 Segundo intento de foco en elemento ${index}`);
            }, 10);
            
            setTimeout(() => {
                element.focus();
                console.log(`🔄 Tercer intento de foco en elemento ${index}`);
            }, 50);
            
            return false; // Máxima prevención
            
        }, { capture: true, passive: false }); // capture: true = interceptar ANTES que notas.js

        // ESTRATEGIA 2: También interceptar click
        element.addEventListener('click', (e) => {
            console.log(`🖱️ ConfigUI interceptando click en elemento ${index}`);
            
            e.stopImmediatePropagation();
            e.stopPropagation();
            
            // Triple foco para asegurar
            element.focus();
            setTimeout(() => element.focus(), 0);
            setTimeout(() => element.focus(), 25);
            
        }, { capture: true, passive: false });

        // ESTRATEGIA 3: Defender el foco una vez obtenido
        element.addEventListener('focus', (e) => {
            console.log(`🎯 Elemento ${index} recibió foco - DEFENDIENDO`);
            
            // Programar re-foco defensivo
            const defendFocus = () => {
                if (document.activeElement !== element) {
                    console.log(`🛡️ Defendiendo foco del elemento ${index}`);
                    element.focus();
                }
            };
            
            setTimeout(defendFocus, 10);
            setTimeout(defendFocus, 50);
            setTimeout(defendFocus, 100);
            
        }, { capture: true });

        // ESTRATEGIA 4: Prevenir que pierda el foco
        element.addEventListener('blur', (e) => {
            console.log(`⚠️ Elemento ${index} perdiendo foco - RECUPERANDO`);
            
            // Recuperar foco inmediatamente si no fue intencional
            setTimeout(() => {
                // Solo recuperar si no hay otro elemento de configuración activo
                const activeElement = document.activeElement;
                const isConfigElement = activeElement && activeElement.closest('#config-content-body');
                
                if (!isConfigElement) {
                    console.log(`🔄 Recuperando foco para elemento ${index}`);
                    element.focus();
                }
            }, 5);
        });

        // ESTRATEGIA 5: Event listener global para proteger este elemento específico
        const protectElement = (e) => {
            // Si el evento target es nuestro elemento protegido
            if (e.target === element) {
                console.log(`🛡️ Protegiendo elemento ${index} de interferencia externa`);
                e.stopImmediatePropagation();
                e.stopPropagation();
                element.focus();
                return false;
            }
        };

        // Agregar protección global
        document.addEventListener('mousedown', protectElement, { capture: true });
        document.addEventListener('click', protectElement, { capture: true });

        console.log(`🔧 Elemento ${index} (${element.tagName}.${element.className}) PROTEGIDO con FIX AGRESIVO v4`);
    });

    // ESTRATEGIA 6: Observer para detectar cambios en activeElement
    let lastActiveElement = null;
    const focusObserver = setInterval(() => {
        const currentActive = document.activeElement;
        
        if (currentActive !== lastActiveElement) {
            lastActiveElement = currentActive;
            
            // Si el elemento activo NO es de configuración, verificar si deberíamos intervenir
            const isConfigElement = currentActive && currentActive.closest('#config-content-body');
            const configContainer = document.getElementById('config-content-body');
            
            if (!isConfigElement && configContainer && configContainer.offsetParent !== null) {
                console.log('🔍 Foco perdido de área de configuración - elemento activo:', currentActive?.tagName, currentActive?.className);
                
                // Si hay un elemento de configuración que debería tener foco, dárselo
                const firstInput = configContainer.querySelector('.form-input, .form-select, .form-checkbox');
                if (firstInput && !currentActive?.closest('.modal-overlay, .modal-system')) {
                    console.log('🔄 Redirigiendo foco a primer elemento de configuración');
                    setTimeout(() => firstInput.focus(), 10);
                }
            }
        }
    }, 100); // Verificar cada 100ms

    // Limpiar observer cuando se destruya ConfigUI
    this.focusObserver = focusObserver;

    console.log(`🚨 FIX AGRESIVO v4 aplicado a ${formElements.length} elementos`);
    console.log('📋 Estrategias implementadas:');
    console.log('  1. ✅ Interceptación con capture: true');
    console.log('  2. ✅ Triple foco forzado');
    console.log('  3. ✅ Defensa activa del foco');
    console.log('  4. ✅ Recuperación automática');
    console.log('  5. ✅ Protección global');
    console.log('  6. ✅ Observer de cambios de foco');
}

    /**
     * Generar sección general
     */
    generateGeneralSection() {
        const config = this.storage.getConfiguracion();
        return `
            <div class="config-section-content">
                <div class="form-group">
                    <label class="form-label" for="userName">Nombre de Usuario</label>
                    <input type="text" class="form-input" id="userName" value="${config.usuario || ''}" placeholder="Tu nombre">
                    <span class="form-help">Aparece en el encabezado de la aplicación</span>
                </div>
                
                <div class="form-group">
                    <label class="form-label" for="autoSave">Auto-guardado</label>
                    <select class="form-select" id="autoSave">
                        <option value="5" ${config.autoSave === 5 ? 'selected' : ''}>Cada 5 minutos</option>
                        <option value="10" ${config.autoSave === 10 ? 'selected' : ''}>Cada 10 minutos</option>
                        <option value="15" ${config.autoSave === 15 ? 'selected' : ''}>Cada 15 minutos</option>
                        <option value="0" ${config.autoSave === 0 ? 'selected' : ''}>Desactivado</option>
                    </select>
                    <span class="form-help">Frecuencia de guardado automático</span>
                </div>

                <div class="form-group">
                    <div class="checkbox-label">
                        <input type="checkbox" class="form-checkbox" id="showWelcome" ${config.showWelcome !== false ? 'checked' : ''}>
                        <span class="checkbox-text">Mostrar mensaje de bienvenida</span>
                    </div>
                </div>

                <div class="form-group">
                    <button class="btn-primary" onclick="window.configUI.saveGeneralConfig()">
                        💾 Guardar Configuración
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generar sección de monedas
     */
    generateCurrencySection() {
        const currentCurrency = this.currencyManager.getCurrentCurrency();
        const supportedCurrencies = this.currencyManager.getSupportedCurrencies();
        
        return `
            <div class="config-section-content">
                <div class="form-group">
                    <label class="form-label" for="mainCurrency">Moneda Principal</label>
                    <select class="form-select" id="mainCurrency">
                        ${supportedCurrencies.map(currency => `
                            <option value="${currency.code}" ${currency.code === currentCurrency ? 'selected' : ''}>
                                ${currency.symbol} ${currency.name} (${currency.code})
                            </option>
                        `).join('')}
                    </select>
                    <span class="form-help">Moneda predeterminada para mostrar importes</span>
                </div>

                <div class="preview-section">
                    <label class="form-label">Vista Previa</label>
                    <div class="currency-preview" id="currencyPreview">
                        ${this.currencyManager.format(1234567)}
                    </div>
                </div>

                <div class="form-group">
                    <button class="btn-primary" onclick="window.configUI.saveCurrencyConfig()">
                        💱 Aplicar Cambios
                    </button>
                    <button class="btn-secondary" onclick="window.configUI.updateExchangeRates()" style="margin-left: 12px;">
                        🔄 Actualizar Tasas
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generar sección de temas
     */
    generateThemeSection() {
        const currentTheme = this.themeManager?.getCurrentTheme() || 'light';
        
        return `
            <div class="config-section-content">
                <div class="form-group">
                    <label class="form-label" for="themeSelect">Tema Visual</label>
                    <select class="form-select" id="themeSelect">
                        <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>☀️ Claro</option>
                        <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>🌙 Oscuro</option>
                        <option value="soft-dark" ${currentTheme === 'soft-dark' ? 'selected' : ''}>🌫️ Oscuro Suave</option>
                        <option value="auto" ${currentTheme === 'auto' ? 'selected' : ''}>🔄 Automático</option>
                    </select>
                    <span class="form-help">El tema automático cambia según la hora del día</span>
                </div>

                <div class="theme-reference">
                    <p class="theme-pointer">Los cambios se aplican inmediatamente</p>
                </div>

                <div class="form-group">
                    <button class="btn-primary" onclick="window.configUI.saveThemeConfig()">
                        🎨 Aplicar Tema
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Generar sección de datos
     */
    generateDataSection() {
        const lastBackup = this.storage.getItem('lastBackup') || 'Nunca';
        
        return `
            <div class="config-section-content">
                <div class="config-info-box">
                    <span class="info-icon">💾</span>
                    <div class="info-text">
                        <strong>Copia de Seguridad</strong>
                        <p>Último respaldo: ${lastBackup}</p>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Exportar Datos</label>
                    <button class="btn-primary" onclick="window.configUI.exportData()">
                        📤 Descargar Respaldo
                    </button>
                    <span class="form-help">Descarga todos tus datos en formato JSON</span>
                </div>

                <div class="form-group">
                    <label class="form-label">Importar Datos</label>
                    <input type="file" class="form-input" id="importFile" accept=".json" onchange="window.configUI.importData(this)">
                    <span class="form-help">Selecciona un archivo de respaldo JSON</span>
                </div>

                <div class="form-group">
                    <button class="btn-warning" onclick="window.configUI.resetAllData()">
                        🗑️ Restablecer Todo
                    </button>
                    <span class="form-help">⚠️ Esta acción eliminará todos los datos</span>
                </div>
            </div>
        `;
    }

    /**
     * Generar sección de información
     */
    generateAboutSection() {
        return `
            <div class="config-section-content">
                <div class="config-info-box">
                    <span class="info-icon">💰</span>
                    <div class="info-text">
                        <strong>WiseSpend</strong>
                        <p>Sistema de Control de Gastos Familiares v2.1.3</p>
                    </div>
                </div>

                <div class="language-info">
                    <span class="info-icon">🛠️</span>
                    <div class="info-content">
                        <strong>Características:</strong><br>
                        • Multi-moneda (CLP, USD, EUR)<br>
                        • Gestión de gastos fijos, variables y extras<br>
                        • Sistema de notas con dictado por voz<br>
                        • Reportes y gráficos avanzados<br>
                        • Herramientas financieras integradas
                    </div>
                </div>

                <div class="language-info">
                    <span class="info-icon">⚡</span>
                    <div class="info-content">
                        <strong>Rendimiento:</strong><br>
                        Datos almacenados: ${Object.keys(localStorage).length} elementos<br>
                        Memoria utilizada: ~${Math.round(JSON.stringify(localStorage).length / 1024)} KB<br>
                        Última sincronización: ${new Date().toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Configurar eventos de monedas
     */
    setupCurrencyEvents() {
        const currencySelect = document.getElementById('mainCurrency');
        if (currencySelect) {
            currencySelect.addEventListener('change', () => {
                this.updateCurrencyPreview();
            });
        }
    }

    /**
     * Configurar eventos de temas
     */
    setupThemeEvents() {
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', () => {
                this.previewTheme(themeSelect.value);
            });
        }
    }

    /**
     * Configurar eventos de datos
     */
    setupDataEvents() {
        // Los eventos están configurados inline en el HTML
    }

    /**
     * Actualizar vista previa de moneda
     */
    updateCurrencyPreview() {
        const currencySelect = document.getElementById('mainCurrency');
        const preview = document.getElementById('currencyPreview');
        
        if (currencySelect && preview) {
            const tempCurrency = currencySelect.value;
            preview.textContent = this.currencyManager.format(1234567, tempCurrency);
        }
    }

    /**
     * Previsualizar tema
     */
    previewTheme(theme) {
        if (this.themeManager) {
            this.themeManager.setTheme(theme);
        }
    }

    /**
     * MÉTODOS DE GUARDADO
     */

    saveGeneralConfig() {
        const userName = document.getElementById('userName')?.value || '';
        const autoSave = parseInt(document.getElementById('autoSave')?.value) || 5;
        const showWelcome = document.getElementById('showWelcome')?.checked || false;

        const config = this.storage.getConfiguracion();
        config.usuario = userName;
        config.autoSave = autoSave;
        config.showWelcome = showWelcome;

        this.storage.setConfiguracion(config);
        this.showSuccessMessage('Configuración general guardada');
    }

    saveCurrencyConfig() {
        const newCurrency = document.getElementById('mainCurrency')?.value;
        
        if (newCurrency && this.currencyManager) {
            this.currencyManager.setCurrency(newCurrency);
            this.updateCurrencyPreview();
            this.showSuccessMessage('Moneda actualizada correctamente');
            
            setTimeout(() => {
                if (window.dashboardMain) {
                    window.dashboardMain.updateStatCards();
                }
            }, 500);
        }
    }

    saveThemeConfig() {
        const newTheme = document.getElementById('themeSelect')?.value;
        
        if (newTheme && this.themeManager) {
            this.themeManager.setTheme(newTheme);
            this.showSuccessMessage('Tema aplicado correctamente');
        }
    }

    updateExchangeRates() {
        if (this.currencyManager) {
            this.currencyManager.forceUpdateRates();
            this.showSuccessMessage('Tasas de cambio actualizadas');
        }
    }

    exportData() {
        try {
            const allData = {};
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    try {
                        allData[key] = JSON.parse(localStorage[key]);
                    } catch (e) {
                        allData[key] = localStorage[key];
                    }
                }
            }

            const exportData = {
                exportDate: new Date().toISOString(),
                version: '2.1.3',
                data: allData
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `wisespend-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.storage.setItem('lastBackup', new Date().toLocaleString());
            this.showSuccessMessage('Datos exportados correctamente');
        } catch (error) {
            console.error('Error exportando datos:', error);
            this.showErrorMessage('Error al exportar datos');
        }
    }

    importData(input) {
        const file = input.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                if (!importData.data) {
                    throw new Error('Formato de archivo inválido');
                }

                if (confirm('¿Estás seguro de que quieres importar estos datos? Esto sobrescribirá la configuración actual.')) {
                    for (let key in importData.data) {
                        localStorage.setItem(key, JSON.stringify(importData.data[key]));
                    }
                    this.showSuccessMessage('Datos importados correctamente. Recargando...');
                    
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                }
            } catch (error) {
                console.error('Error importando datos:', error);
                this.showErrorMessage('Error al importar datos: Formato inválido');
            }
        };
        
        reader.readAsText(file);
    }

    resetAllData() {
        if (confirm('⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
            if (confirm('🚨 Confirmación final: Se eliminarán todos los gastos, ingresos y configuraciones. ¿Continuar?')) {
                localStorage.clear();
                this.showSuccessMessage('Datos eliminados. Redirigiendo al login...');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }
        }
    }

    /**
     * UTILIDADES
     */

    /**
     * 🐛 FIX: Usar un método compatible con el sistema de modales actual.
     */
    showSuccessMessage(message) {
        if (window.modalSystem && typeof window.modalSystem.show === 'function') {
            window.modalSystem.show('Éxito', message, 'success');
        } else {
            alert('✅ ' + message);
        }
    }

    /**
     * 🐛 FIX: Usar un método compatible con el sistema de modales actual.
     */
    showErrorMessage(message) {
        if (window.modalSystem && typeof window.modalSystem.show === 'function') {
            window.modalSystem.show('Error', message, 'error');
        } else {
            alert('❌ ' + message);
        }
    }

    resetInjectionState() {
        this.isInjected = false;
    }

    destroy() {
    // Limpiar focus observer
    if (this.focusObserver) {
        clearInterval(this.focusObserver);
        this.focusObserver = null;
    }
    
    this.isInjected = false;
    console.log('🧹 ConfigUI destruido');
}

    forceInject() {
        const contentArea = document.getElementById('dynamic-content');
        if (contentArea) {
            this.isInjected = false;
            this.injectConfigurationUI(contentArea);
        }
    }
}

// Crear instancia global
window.configUI = new ConfigUI();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigUI;
}

console.log('⚙️ ConfigUI v2.1.3 cargado - Sistema de configuración completo activo (Solución Definitiva)');