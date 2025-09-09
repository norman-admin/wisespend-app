/**
 * 📋 VARIOS-MANAGER.JS - Controlador Principal de Pestañas
 * Control de Gastos Familiares - WiseSpend
 * Versión: 1.0.0
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Sistema de pestañas dinámico
 * ✅ Carga modular de contenido
 * ✅ Gestión de estado de pestañas
 * ✅ Integración con dashboard principal
 */

class VariosManager {
    constructor() {
        this.currentTab = 'notas'; // Pestaña por defecto
        this.tabs = [
            {
                id: 'notas',
                name: 'Notas y recordatorios',
                icon: '📝',
                module: null
            },
            {
                id: 'herramientas', 
                name: 'Herramientas',
                icon: '🧮',
                module: null
            },
            {
                id: 'documentos',
                name: 'Documentos', 
                icon: '📄',
                module: null
            }
        ];
        
        this.container = null;
        this.initialized = false;
        
        console.log('📋 VariosManager v1.0.0: Inicializando...');
    }

    /**
     * 🚀 Inicializar el sistema de pestañas
     */
    async init(containerId = 'dynamic-content') {
        try {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                throw new Error(`Container ${containerId} no encontrado`);
            }

            // Cargar CSS principal si no está cargado
            await this.loadMainCSS();
            
            // Renderizar interfaz principal
            this.renderMainInterface();
            
            // Cargar pestaña por defecto
            await this.loadTab(this.currentTab);
            
            this.initialized = true;
            console.log('✅ VariosManager: Sistema inicializado correctamente');
            
        } catch (error) {
            console.error('❌ VariosManager: Error en inicialización:', error);
            this.showError('Error al cargar el sistema de varios');
        }
    }

    /**
     * 🎨 Cargar CSS principal si no está presente
     */
    async loadMainCSS() {
        const existingLink = document.querySelector('link[href*="varios-main.css"]');
        if (existingLink) {
            console.log('📄 CSS varios-main.css ya está cargado');
            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'varios/css/varios-main.css';
            link.onload = () => {
                console.log('✅ CSS varios-main.css cargado');
                resolve();
            };
            link.onerror = () => {
                console.warn('⚠️ No se pudo cargar varios-main.css');
                resolve(); // Continuar sin CSS
            };
            document.head.appendChild(link);
        });
    }

    /**
     * 🖼️ Renderizar interfaz principal de pestañas
     */
    renderMainInterface() {
        const html = `
            <section class="content-section active">
                <div class="section-header">
                    <h2>📋 Varios</h2>
                </div>
                
                <!-- Sistema de pestañas -->
                <div class="varios-container">
                    <!-- Navegación de pestañas -->
                    <div class="varios-tabs-nav">
                        ${this.renderTabsNavigation()}
                    </div>
                    
                    <!-- Contenido de pestañas -->
                        <div class="varios-tabs-content" id="varios-content"></div>
                    </div>
                </div>
            </section>
        `;
        
        this.container.innerHTML = html;
        this.bindTabEvents();
    }

    /**
     * 🧭 Renderizar navegación de pestañas
     */
    renderTabsNavigation() {
        return this.tabs.map(tab => `
            <button class="varios-tab-btn ${tab.id === this.currentTab ? 'active' : ''}" 
                    data-tab="${tab.id}">
                <span class="tab-icon">${tab.icon}</span>
                <span class="tab-name">${tab.name}</span>
            </button>
        `).join('');
    }

    /**
     * 🔗 Vincular eventos de pestañas
     */
    bindTabEvents() {
        const tabButtons = this.container.querySelectorAll('.varios-tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const tabId = button.dataset.tab;
                
                if (tabId !== this.currentTab) {
                    await this.switchTab(tabId);
                }
            });
        });
        
        console.log(`✅ ${tabButtons.length} pestañas configuradas`);
    }

    /**
     * 🔄 Cambiar de pestaña
     */
    async switchTab(tabId) {
        try {
            // Actualizar estado visual
            this.updateTabsVisualState(tabId);
            
            // Cargar contenido de la nueva pestaña
            await this.loadTab(tabId);
            
            // Actualizar pestaña actual
            this.currentTab = tabId;
            
            console.log(`✅ Cambiado a pestaña: ${tabId}`);
            
        } catch (error) {
            console.error(`❌ Error al cambiar a pestaña ${tabId}:`, error);
            this.showError(`Error al cargar ${tabId}`);
        }
    }

    /**
     * 🎨 Actualizar estado visual de pestañas
     */
    updateTabsVisualState(activeTabId) {
        const tabButtons = this.container.querySelectorAll('.varios-tab-btn');
        
        tabButtons.forEach(button => {
            if (button.dataset.tab === activeTabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * 📥 Cargar contenido de una pestaña específica
     */
    async loadTab(tabId) {
        const contentContainer = this.container.querySelector('#varios-content');
        if (!contentContainer) return;

        try {
            switch (tabId) {
                case 'notas':
                    await this.loadNotasModule(contentContainer);
                    break;
                case 'herramientas':
                    await this.loadHerramientasModule(contentContainer);
                    break;
                case 'documentos':
                    await this.loadDocumentosModule(contentContainer);
                    break;
                default:
                    throw new Error(`Pestaña ${tabId} no implementada`);
            }
        } catch (error) {
            console.error(`❌ Error cargando ${tabId}:`, error);
            contentContainer.innerHTML = `
                <div class="varios-error">
                    <p>❌ Error al cargar ${tabId}</p>
                    <button onclick="variosManager.loadTab('${tabId}')">🔄 Reintentar</button>
                </div>
            `;
        }
    }

    /**
     * 📝 Cargar módulo de Notas
     */
    async loadNotasModule(container) {
    try {
        console.log('📝 Cargando módulo completo de notas...');
        
        // Verificar si notas.js ya está cargado
        if (!window.notasManager) {
            console.log('📝 Cargando notas.js...');
            await this.loadNotasScript();
        }
        
        // Verificar que notasManager esté disponible
        if (!window.notasManager) {
            throw new Error('NotasManager no se cargó correctamente');
        }
        
        // Inicializar el sistema de notas
        await window.notasManager.init('varios-content');
        
        console.log('✅ Módulo Notas cargado completamente');
        
    } catch (error) {
        console.error('❌ Error cargando módulo de notas:', error);
        container.innerHTML = `
            <div class="varios-tab-content" data-tab="notas">
                <div class="varios-error">
                    <p>❌ Error al cargar el sistema de notas</p>
                    <button onclick="variosManager.loadNotasModule(document.getElementById('varios-content'))">🔄 Reintentar</button>
                </div>
            </div>
        `;
    }
}

    /**
 * 🆕 CARGAR SCRIPT DE NOTAS.JS
 */
async loadNotasScript() {
    return new Promise((resolve, reject) => {
        // Verificar si el script ya existe
        const existingScript = document.querySelector('script[src*="notas.js"]');
        if (existingScript) {
            console.log('📝 Script notas.js ya existe');
            resolve();
            return;
        }
        
        // Cargar el script dinámicamente
        const script = document.createElement('script');
        script.src = 'varios/js/notas.js';
        script.onload = () => {
            console.log('✅ notas.js cargado exitosamente');
            setTimeout(resolve, 100);
        };
        script.onerror = () => {
            console.error('❌ Error cargando notas.js');
            reject(new Error('No se pudo cargar notas.js'));
        };
        
        document.head.appendChild(script);
    });
}

    /**
     * 📄 Cargar módulo de Documentos
     */
    async loadDocumentosModule(container) {
        container.innerHTML = `
            <div class="varios-tab-content" data-tab="documentos">
                <div class="tab-content-header">
                    <h3>📄 Gestión de Documentos</h3>
                    <button class="btn-primary">📎 Subir Documento</button>
                </div>
                <div class="documentos-content">
                    <p>Gestión de documentos será implementada aquí...</p>
                </div>
            </div>
        `;
        console.log('📄 Módulo Documentos cargado (básico)');
    }

    /**
     * 🧮 Cargar módulo de Herramientas
     */
async loadHerramientasModule(container) {
    container.innerHTML = `
        <div class="varios-tab-content" data-tab="herramientas">
            <div class="tab-content-header">
                <h3>🧮 Herramientas Financieras</h3>
                <button class="btn-primary">🔧 Nueva Herramienta</button>
            </div>
            <div class="herramientas-content">
                <div style="text-align: center; padding: 40px;">
                    <h3>Herramientas Financieras Disponibles</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-top: 20px;">
                        <a href="Varios/herramientas.html" 
                           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; min-width: 200px; text-align: center;">
                            🧮 Calculadora de Créditos
                        </a>
                        <a href="Varios/simulador-ahorro.html" 
                           style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; min-width: 200px; text-align: center;">
                            💰 Simulador de Ahorro
                        </a>
                        <a href="Varios/conversor-monedas.html" 
                           style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; min-width: 200px; text-align: center;">
                            💱 Conversor de Monedas
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    console.log('🧮 Módulo Herramientas cargado con 3 herramientas');
}
    /**
     * ❌ Mostrar error
     */
    showError(message) {
        const contentContainer = this.container?.querySelector('#varios-content');
        if (contentContainer) {
            contentContainer.innerHTML = `
                <div class="varios-error">
                    <p>❌ ${message}</p>
                    <button onclick="variosManager.init()">🔄 Reiniciar</button>
                </div>
            `;
        }
    }

    /**
     * 🔧 Métodos públicos para integración
     */
    getCurrentTab() {
        return this.currentTab;
    }

    isInitialized() {
        return this.initialized;
    }

    /**
     * 🧹 Destruir instancia
     */
    destroy() {
        this.initialized = false;
        this.container = null;
        this.currentTab = 'notas';
        console.log('🧹 VariosManager destruido');
    }
}

// Crear instancia global
window.variosManager = new VariosManager();

// Exponer para debugging
window.variosDebug = {
    getManager: () => window.variosManager,
    getCurrentTab: () => window.variosManager.getCurrentTab(),
    switchTab: (tab) => window.variosManager.switchTab(tab),
    reload: () => window.variosManager.init(),
    
    // Funciones específicas de notas
    getNotasState: () => window.variosManager.getNotasState(),
    reloadNotas: async () => {
        if (window.notasManager) {
            await window.notasManager.init();
        }
    },
    
};

console.log('📋 Varios-manager.js v1.0.0 cargado - Sistema de pestañas listo');

