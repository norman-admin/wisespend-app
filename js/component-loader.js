/**
 * 🧩 COMPONENT LOADER - Sistema de Carga de Componentes
 * Control de Gastos Familiares - component-loader.js
 * Versión: 1.5.0 - INTEGRACIÓN AUTOMÁTICA DE CONFIG-UI
 * * 🔧 CAMBIOS v1.5.0:
 * ✅ Integración automática y robusta de ConfigUI en loadConfigSection
 * ✅ Se eliminó la necesidad de inyección manual
 * ✅ Añadido un sistema de reintentos para esperar a que los módulos estén listos
 * ✅ Mantiene delegación completa de ingresos a gastosManager
 * ✅ Callback system para dashboard-main.js
 */

class ComponentLoader {
    constructor() {
        this.loadedComponents = new Map();
        this.loadingQueue = [];
        this.isLoading = false;
        this.sectionCallbacks = new Map(); // Para callbacks de dashboard-main
        
        console.log('🧩 ComponentLoader inicializado (con navegación)');
    }

    /**
     * Cargar un componente individual
     */
    async loadComponent(componentPath, containerId) {
        try {
            console.log(`🔄 Cargando componente: ${componentPath}`);
            
            // Verificar que el contenedor existe
            const container = document.getElementById(containerId);
            if (!container) {
                throw new Error(`Contenedor ${containerId} no encontrado`);
            }

            // Cargar el HTML del componente
            const response = await fetch(componentPath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const html = await response.text();
            
            // Insertar en el contenedor
            container.innerHTML = html;
            
            // Guardar en cache
            this.loadedComponents.set(componentPath, {
                html: html,
                containerId: containerId,
                loadedAt: new Date()
            });
            
            console.log(`✅ Componente cargado: ${componentPath} → #${containerId}`);
            
            // 🆕 CONFIGURAR EVENTOS ESPECÍFICOS SEGÚN EL COMPONENTE
            this.setupComponentEvents(componentPath, containerId);
            
            // Disparar evento personalizado
            this.dispatchComponentEvent('componentLoaded', {
                path: componentPath,
                containerId: containerId
            });
            
            return true;
            
        } catch (error) {
            console.error(`❌ Error cargando ${componentPath}:`, error);
            
            // Mostrar mensaje de error en el contenedor
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="component-error">
                        <p>❌ Error cargando componente</p>
                        <small>${error.message}</small>
                    </div>
                `;
            }
            
            return false;
        }
    }

    /**
     * 🆕 CONFIGURAR EVENTOS ESPECÍFICOS PARA CADA COMPONENTE
     */
    setupComponentEvents(componentPath, containerId) {
        console.log(`🎧 Configurando eventos para: ${componentPath}`);
        
        if (componentPath.includes('sidebar-menu.html')) {
            this.setupSidebarNavigation();
        }
        
        if (componentPath.includes('new-header.html')) {
            this.setupHeaderEvents();
            this.loadHeaderScript();
        }    
    }

    /**
 * 🆕 CARGAR SCRIPT DEL HEADER DESPUÉS DEL HTML
 */
async loadHeaderScript() {
    try {
        console.log('🎨 Cargando script del header...');
        
        // Crear script element
        const script = document.createElement('script');
        script.src = 'header-redesigned/js/new-header.js';
        script.onload = () => {
            console.log('✅ Script del header cargado correctamente');
        };
        script.onerror = () => {
            console.error('❌ Error cargando script del header');
        };
        
        // Agregar al DOM
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ Error en loadHeaderScript:', error);
    }
}

    /**
     * 🆕 CONFIGURAR NAVEGACIÓN DEL SIDEBAR
     */
    setupSidebarNavigation() {
        console.log('🧭 Configurando navegación del sidebar...');
        
        // Obtener todos los botones de navegación
        const navItems = document.querySelectorAll('.nav-item[data-section]');
        
        navItems.forEach(button => {
            const section = button.dataset.section;
            
            console.log(`📌 Configurando botón: ${section}`);
            
            // Remover event listeners anteriores para evitar duplicados
            button.replaceWith(button.cloneNode(true));
            
            // Obtener la referencia actualizada
            const newButton = document.querySelector(`.nav-item[data-section="${section}"]`);
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🔄 Navegando a sección: ${section}`);
                
                // Actualizar estado visual
                this.updateActiveNavItem(section);
                
                // Cargar contenido de la sección
                this.loadSectionContent(section);
            });
        });
        
        console.log(`✅ ${navItems.length} botones de navegación configurados`);
    }

    /**
     * 🆕 ACTUALIZAR BOTÓN ACTIVO EN NAVEGACIÓN
     */
    updateActiveNavItem(activeSection) {
        // Remover clase active de todos los botones
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Agregar clase active al botón seleccionado
        const activeButton = document.querySelector(`.nav-item[data-section="${activeSection}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            console.log(`✅ Botón ${activeSection} marcado como activo`);
        }
    }

    /**
     * 🆕 CARGAR CONTENIDO DE LA SECCIÓN
     */
    loadSectionContent(section) {
        const contentArea = document.getElementById('dynamic-content');
        if (!contentArea) {
            console.error('❌ Área de contenido no encontrada');
            return;
        }

        console.log(`📄 Cargando contenido para: ${section}`);

        switch (section) {
            case 'income':
                this.loadIncomeSection(contentArea);
                break;
            case 'expenses':
                this.loadExpensesSection(contentArea);
                break;
            case 'fixed-variable':
                this.loadFixedVariableSection(contentArea);
                break;
            case 'extra-expenses':
                this.loadExtraExpensesSection(contentArea);
                break;
            case 'misc':
                this.loadMiscSection(contentArea);
                break;
            case 'reports':
                this.loadReportsSection(contentArea);
                break;
            case 'personal':
                this.loadPersonalSection(contentArea);
                break;
            case 'config':
                this.loadConfigSection(contentArea);
                break;
            default:
                this.loadDefaultSection(contentArea);
        }
    }

    /**
     * 🆕 CARGAR SECCIÓN DE INGRESOS - DELEGACIÓN COMPLETA
     */
    loadIncomeSection(container) {
        console.log('💰 Delegando sección de ingresos a gastosManager...');
        
        // 🆕 DELEGAR AL SISTEMA PRINCIPAL en lugar de generar HTML propio
        if (window.gastosManager) {
            window.gastosManager.currentView = 'income';
            window.gastosManager.loadGastosView();
            console.log('✅ Sección de ingresos delegada correctamente');
        } else {
            console.error('❌ gastosManager no disponible');
            container.innerHTML = '<p>Sistema de ingresos cargando...</p>';
        }
        
        // Notificar que está listo
        this.notifySectionReady('income');
    }

    /**
     * ⚙️ CARGAR SECCIÓN DE CONFIGURACIÓN - INTEGRACIÓN AUTOMÁTICA (Opción A Recomendada)
     */
    loadConfigSection(container) {
        console.log('⚙️ Cargando sección de configuración...');
        
        // 1. Mostrar un estado de carga inmediato para mejorar la UX
        container.innerHTML = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>⚙️ Configuración de la Aplicación</h2>
                    <p>Cargando sistema de configuración...</p>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <p>Inicializando interfaz...</p>
                </div>
            </section>
        `;
        
        // 2. Intentar inyectar la UI de configuración. Reintentar si el módulo no está listo.
        let attempts = 0;
        const maxAttempts = 10; // Intentar por 2 segundos
        
        const tryInject = () => {
            if (window.configUI && typeof window.configUI.forceInject === 'function') {
                console.log('✅ Inyectando ConfigUI automáticamente...');
                window.configUI.forceInject();
                this.notifySectionReady('config');
            } else if (attempts < maxAttempts) {
                attempts++;
                console.warn(`⏳ configUI no está listo. Reintentando... (${attempts}/${maxAttempts})`);
                setTimeout(tryInject, 200);
            } else {
                console.error('❌ No se pudo inyectar ConfigUI después de varios intentos.');
                container.innerHTML = `
                    <section class="content-section active">
                        <div class="section-header">
                            <h2>⚙️ Error de Carga</h2>
                        </div>
                        <div class="error-state" style="padding: 20px; text-align: center; color: #dc2626;">
                            <p>No se pudo cargar el módulo de configuración. Por favor, recarga la página.</p>
                        </div>
                    </section>
                `;
                this.notifySectionReady('config');
            }
        };
        
        // Iniciar el primer intento
        tryInject();
    }


    /**
     * 🔥 NOTIFICAR AL DASHBOARD QUE LA SECCIÓN ESTÁ LISTA - MANTENIDO
     */
    notifySectionReady(sectionName) {
        console.log(`📢 Notificando que sección ${sectionName} está lista`);
        
        // Disparar evento específico para dashboard-main.js
        const event = new CustomEvent('component_sectionReady', {
            detail: {
                section: sectionName,
                timestamp: new Date().toISOString(),
                ready: true
            },
            bubbles: true
        });
        
        window.dispatchEvent(event);

        // 🔥 RECONECTAR CONTEXTUAL-MANAGER PARA LA SECCIÓN
        if (window.contextualManager) {
            window.contextualManager.refreshSection(sectionName);
        }
        
        // Ejecutar callback si existe
        const callback = this.sectionCallbacks.get(sectionName);
        if (callback) {
            callback();
        }
    }

    /**
     * 🔥 REGISTRAR CALLBACK PARA SECCIÓN - MANTENIDO
     */
    registerSectionCallback(sectionName, callback) {
        console.log(`📝 Registrando callback para sección: ${sectionName}`);
        this.sectionCallbacks.set(sectionName, callback);
    }

    /**
     * 🆕 CARGAR SECCIÓN DE GASTOS - DELEGADO A GASTOS.JS
     */
    loadExpensesSection(container) {
        console.log('💳 Delegando sección de gastos a gastosManager...');
        
        // 🎯 DELEGAR al método correcto de gastos.js
        if (window.gastosManager && window.gastosManager.renderExpensesSection) {
            window.gastosManager.renderExpensesSection(container);
        } else {
            // Fallback temporal mientras carga gastosManager
            container.innerHTML = `
                <section class="content-section active">
                    <div class="section-header">
                        <h2>💳 Cargando gastos...</h2>
                    </div>
                    <div style="text-align: center; padding: 40px;">
                        <p>Cargando sistema de gastos...</p>
                    </div>
                </section>
            `;
            
            // Reintentar después de un momento
            setTimeout(() => {
                if (window.gastosManager && window.gastosManager.renderExpensesSection) {
                    window.gastosManager.renderExpensesSection(container);
                }
            }, 500);
        }
        
        this.notifySectionReady('expenses');
    }

    /**
     * 🆕 CONFIGURAR BOTONES DE GASTOS - MANTENIDO
     */
    setupExpenseButtons() {
        const expenseButtons = document.querySelectorAll('.add-expense-btn-container .btn[data-tipo]');
        
        expenseButtons.forEach(button => {
            const tipo = button.getAttribute('data-tipo');
            
            button.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`💳 Abriendo modal para: ${tipo}`);
                
                if (window.gastosManager && window.gastosManager.showAddGastoModal) {
                    window.gastosManager.showAddGastoModal(tipo);
                } else {
                    alert(`Sistema de gastos no disponible`);
                }
            });
        });
        
        console.log(`✅ ${expenseButtons.length} botones de gastos configurados`);
    }

    /**
     * 🆕 CARGAR SECCIÓN FIJOS/VARIABLES
     */
    loadFixedVariableSection(container) {
        console.log('📊 Cargando sección fijos/variables...');
        
        if (window.gastosManager) {
            window.gastosManager.currentView = 'fijos';
            window.gastosManager.showFijosVariablesView();
        } else {
            container.innerHTML = `
                <div class="loading-dashboard">
                    <p>Cargando gestión de gastos...</p>
                </div>
            `;
        }
        
        this.notifySectionReady('fixed-variable');
    }

    /**
     * 🆕 CARGAR OTRAS SECCIONES
     */
    loadExtraExpensesSection(container) {
        console.log('⚡ Cargando gastos extras...');
        if (window.gastosManager) {
            window.gastosManager.currentView = 'extras';
            window.gastosManager.loadGastosView();
        }
        this.notifySectionReady('extra-expenses');
    }

    loadMiscSection(container) {
    console.log('📋 Cargando sección varios con sistema de pestañas...');
    
    // Verificar si varios-manager.js está cargado
    if (!window.variosManager) {
        console.log('📋 Cargando varios-manager.js...');
        this.loadVariosScript(container);
        return;
    }
    
    // Si ya está cargado, inicializar directamente
    this.initializeVariosSection(container);
}

// ===== PASO 3: AGREGAR ESTOS NUEVOS MÉTODOS AL FINAL DE LA CLASE =====

/**
 * 🆕 CARGAR SCRIPT DE VARIOS-MANAGER
 */
async loadVariosScript(container) {
    try {
                
        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src*="varios-manager.js"]');
        if (existingScript) {
            console.log('📋 Script varios-manager.js ya existe');
            await this.waitForVariosManager();
            this.initializeVariosSection(container);
            return;
        }
        
        // Cargar el script dinámicamente
        const script = document.createElement('script');
        script.src = 'varios/js/varios-manager.js';
        script.onload = () => {
            console.log('✅ varios-manager.js cargado exitosamente');
            this.initializeVariosSection(container);
        };
        script.onerror = () => {
            console.error('❌ Error cargando varios-manager.js');
            container.innerHTML = `
                <section class="content-section active">
                    <div class="section-header">
                        <h2>📋 Varios</h2>
                    </div>
                    <div class="varios-error">
                        <p>❌ Error al cargar el sistema de varios</p>
                        <button onclick="componentLoader.loadMiscSection(document.getElementById('dynamic-content'))">🔄 Reintentar</button>
                    </div>
                </section>
            `;
        };
        
        document.head.appendChild(script);
        
    } catch (error) {
        console.error('❌ Error en loadVariosScript:', error);
        this.showVariosError(container, 'Error al cargar el sistema');
    }
}

/**
 * 🆕 ESPERAR A QUE VARIOS-MANAGER ESTÉ DISPONIBLE
 */
async waitForVariosManager(maxAttempts = 50) {
    let attempts = 0;
    
    while (!window.variosManager && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.variosManager) {
        throw new Error('variosManager no se cargó en el tiempo esperado');
    }
    
    console.log('✅ variosManager disponible');
}

/**
 * 🆕 INICIALIZAR SECCIÓN DE VARIOS
 */
async initializeVariosSection(container) {
    try {
        console.log('📋 Inicializando sección varios...');
        
        // Verificar que variosManager existe
        if (!window.variosManager) {
            throw new Error('variosManager no está disponible');
        }
        
        // Inicializar el sistema de pestañas
        await window.variosManager.init('dynamic-content');
        
        // Notificar que está listo
        this.notifySectionReady('misc');
        
        console.log('✅ Sección varios inicializada correctamente');
        
    } catch (error) {
        console.error('❌ Error inicializando sección varios:', error);
        this.showVariosError(container, 'Error al inicializar las pestañas');
    }
}

/**
 * 🆕 MOSTRAR ERROR DE VARIOS
 */
showVariosError(container, message) {
    container.innerHTML = `
        <section class="content-section active">
            <div class="section-header">
                <h2>📋 Varios</h2>
            </div>
            <div class="varios-error">
                <p>❌ ${message}</p>
                <button onclick="componentLoader.loadMiscSection(document.getElementById('dynamic-content'))">🔄 Reintentar</button>
            </div>
        </section>
    `;
}

    loadReportsSection() {
    console.log('📊 Cargando reportes con sistema modular...');
    
    if (window.reportesHTML) {
        const container = document.getElementById('dynamic-content');
        window.reportesHTML.renderFullReport(container);
        console.log('✅ Reportes modulares cargados');
    } else {
        console.log('❌ ReportesHTML no disponible');
        document.getElementById('dynamic-content').innerHTML = `
            <div class="error-state">
                <h2>Sistema de reportes en carga...</h2>
                <p>El sistema modular se está inicializando...</p>
            </div>
        `;
    }
}
  
// ACTUALIZACIÓN DEL MÉTODO loadPersonalSection en js/component-loader.js
// Reemplaza el método completo por este:

loadPersonalSection(container) {
    console.log('👤 Cargando espacio personal...');
    
    container.innerHTML = `
        <section class="content-section active">
            <div class="espacio-personal-container">
                <!-- Header del Bloc -->
                <div class="notas-header">
                    <h2 class="notas-title">
                        📝 Mis Notas Personales
                    </h2>
                    <div class="notas-info">
                        <span class="char-counter" id="charCounter">0 caracteres</span>
                        <span class="last-saved-info" id="lastSavedInfo">Sin guardados previos</span>
                    </div>
                </div>

                <!-- Área de Texto -->
                <div class="notas-content">
                    <textarea 
                        class="notas-textarea" 
                        id="notasPersonales"
                        placeholder="Escribe tus notas personales aquí...

Puedes usar este espacio para:
• Recordatorios importantes
• Ideas y objetivos financieros
• Notas rápidas del día
• Lo que necesites recordar

Las notas se guardan automáticamente cada 5 minutos. 💾"
                    ></textarea>
                </div>

                <!-- Botones de Acción -->
                <div class="notas-actions">
                    <button class="btn-clear-notas" id="clearNotasBtn">
                        🗑️ Limpiar Notas
                    </button>
                    <button class="btn-save-notas" id="saveNotasBtn">
                        💾 Guardar
                    </button>
                    
                    <!-- Menú Desplegable de Opciones -->
                    <div class="notas-options-dropdown" id="notasOptionsDropdown">
                        <button class="btn-options-notas" id="optionsNotasBtn">
                            ⚙️ Opciones
                            <span class="dropdown-arrow">▼</span>
                        </button>
                        <div class="options-menu" id="optionsMenu">
                            <button class="option-item" id="downloadBackupBtn">
                                <span class="option-icon">💾</span>
                                <span class="option-text">Guardar notas como</span>
                            </button>
                            <button class="option-item" id="uploadBackupBtn">
                                <span class="option-icon">📂</span>
                                <span class="option-text">Abrir notas guardadas</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Input oculto para subir archivos -->
                <input type="file" id="backupFileInput" accept=".txt" style="display: none;">
            </div>
        </section>
    `;
    
    // Inicializar el gestor de espacio personal después de cargar
    setTimeout(() => {
        if (window.espacioPersonalManager) {
            window.espacioPersonalManager.reload();
            console.log('✅ Espacio Personal inicializado');
        } else {
            console.warn('⚠️ espacioPersonalManager no disponible aún');
        }
    }, 200);
    
    this.notifySectionReady('personal');
}

    /**
     * 🆕 CONFIGURAR EVENTOS DEL HEADER
     */
    setupHeaderEvents() {
        console.log('🎯 Configurando eventos del header...');
        
        setTimeout(() => {
            const closeSessionBtn = document.getElementById('close-session-btn');
            const exportDataBtn = document.getElementById('export-data-btn');
            const addUserBtn = document.getElementById('add-user-btn');
            const currencySelect = document.getElementById('currency-select');

            if (closeSessionBtn) {
                closeSessionBtn.onclick = () => {
                    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                        if (window.authSystem) {
                            window.authSystem.logout();
                        }
                    }
                };
                console.log('✅ Botón cerrar sesión configurado');
            }

            if (exportDataBtn) {
                exportDataBtn.onclick = () => {
                    if (window.storageManager) {
                        const exportResult = window.storageManager.exportData();
                        if (exportResult) {
                            const url = URL.createObjectURL(exportResult.blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = exportResult.filename;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            alert('Datos exportados exitosamente');
                        }
                    }
                };
                console.log('✅ Botón exportar configurado');
            }

            if (addUserBtn) {
                addUserBtn.onclick = () => {
                    alert('Función de agregar usuario en desarrollo');
                };
                console.log('✅ Botón agregar usuario configurado');
            }

            if (currencySelect) {
                currencySelect.onchange = (e) => {
                    const newCurrency = e.target.value;
                    if (window.currencyManager) {
                        window.currencyManager.setCurrency(newCurrency);
                    }
                    console.log(`💱 Moneda cambiada a: ${newCurrency}`);
                };
                console.log('✅ Selector de moneda configurado');
            }
        }, 100);
    }

    /**
     * Cargar todos los componentes del dashboard
     */
    async loadAllComponents() {
        if (this.isLoading) {
            console.log('⏳ Ya hay una carga en progreso...');
            return;
        }

        this.isLoading = true;
        console.log('🚀 Iniciando carga de componentes...');

        // Definir componentes a cargar
        const components = [
            { 
                path: 'components/new-header.html',
                container: 'header-container',
                name: 'Header'
            },
            { 
                path: 'components/stats-cards.html', 
                container: 'stats-container',
                name: 'Stats Cards'
            },
            { 
                path: 'components/sidebar-menu.html', 
                container: 'sidebar-container',
                name: 'Sidebar Menu'
            },
        ];

        let loadedCount = 0;
        let totalComponents = components.length;

        // Cargar componentes en paralelo
        const loadPromises = components.map(async (component) => {
            const success = await this.loadComponent(component.path, component.container);
            if (success) {
                loadedCount++;
            }
            return { component, success };
        });

        // Esperar a que todos terminen
        const results = await Promise.all(loadPromises);

        // Verificar resultados
        const failedComponents = results.filter(result => !result.success);
        
        if (failedComponents.length > 0) {
            console.warn(`⚠️ ${failedComponents.length} componentes fallaron:`, 
                failedComponents.map(f => f.component.name));
        }

        this.isLoading = false;
        
        console.log(`🎉 Carga completada: ${loadedCount}/${totalComponents} componentes`);

        // Disparar evento de carga completa
        this.dispatchComponentEvent('allComponentsLoaded', {
            total: totalComponents,
            loaded: loadedCount,
            failed: failedComponents.length
        });

        // 🆕 CARGAR SECCIÓN INICIAL
        setTimeout(() => {
            this.loadSectionContent('income');
            this.updateActiveNavItem('income');
        }, 100);

        return loadedCount === totalComponents;
    }

    /**
     * Recargar un componente específico
     */
    async reloadComponent(componentPath, containerId) {
        console.log(`🔄 Recargando componente: ${componentPath}`);
        
        // Remover del cache
        this.loadedComponents.delete(componentPath);
        
        // Cargar nuevamente
        return await this.loadComponent(componentPath, containerId);
    }

    /**
     * Obtener información de componentes cargados
     */
    getLoadedComponentsInfo() {
        const info = {
            total: this.loadedComponents.size,
            components: []
        };

        this.loadedComponents.forEach((data, path) => {
            info.components.push({
                path: path,
                containerId: data.containerId,
                loadedAt: data.loadedAt,
                size: data.html.length
            });
        });

        return info;
    }

    /**
     * Disparar eventos personalizados
     */
    dispatchComponentEvent(type, detail) {
        const event = new CustomEvent(`component_${type}`, {
            detail: {
                timestamp: new Date().toISOString(),
                loader: 'ComponentLoader',
                ...detail
            },
            bubbles: true
        });
        
        window.dispatchEvent(event);
    }

    /**
     * Verificar si todos los componentes están cargados
     */
    areAllComponentsLoaded() {
        const requiredComponents = [
            'components/new-header.html',
            'components/stats-cards.html',
            'components/sidebar-menu.html',
            'components/details-panel.html'
        ];

        return requiredComponents.every(component => 
            this.loadedComponents.has(component)
        );
    }

    /**
     * Destructor - limpiar recursos
     */
    destroy() {
        this.loadedComponents.clear();
        this.loadingQueue = [];
        this.sectionCallbacks.clear();
        this.isLoading = false;
        
        console.log('🧹 ComponentLoader destruido');
    }
}

// Crear instancia global
window.componentLoader = new ComponentLoader();

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM listo, iniciando carga de componentes...');
        window.componentLoader.loadAllComponents();
    });
} else {
    // DOM ya está listo
    console.log('📄 DOM ya listo, iniciando carga inmediata de componentes...');
    window.componentLoader.loadAllComponents();
}

console.log('🧩 component-loader.js v1.5.0 - INTEGRACIÓN AUTOMÁTICA DE CONFIG-UI');
