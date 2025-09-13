/**
 * 📋 VARIOS-MANAGER.JS - Controlador Principal de Pestañas (ACTUALIZADO)
 * Control de Gastos Familiares - WiseSpend
 * Versión: 1.1.0 - Integración Sistema de Documentos Fase 1
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Sistema de pestañas dinámico
 * ✅ Carga modular de contenido
 * ✅ Gestión de estado de pestañas
 * ✅ Integración con dashboard principal
 * 🆕 Sistema de documentos integrado
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
        
        console.log('📋 VariosManager v1.1.0: Inicializando...');
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
                console.error('❌ Error cargando varios-main.css');
                reject(new Error('No se pudo cargar varios-main.css'));
            };
            document.head.appendChild(link);
        });
    }

    /**
     * 🖼️ Renderizar interfaz principal
     */
    renderMainInterface() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="varios-main-container" id="variosMainContainer">
                <!-- Navegación de Pestañas -->
                <div class="varios-tabs-nav" id="variosTabsNav">
                    ${this.tabs.map(tab => `
                        <button class="varios-tab-btn ${tab.id === this.currentTab ? 'active' : ''}" 
                                data-tab="${tab.id}"
                                onclick="variosManager.switchTab('${tab.id}')">
                            <span class="tab-icon">${tab.icon}</span>
                            <span class="tab-name">${tab.name}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- Contenido de Pestañas -->
                <div class="varios-tabs-content" id="variosTabsContent">
                    <div id="varios-content">
                        <!-- Contenido dinámico se carga aquí -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 🔄 Cambiar de pestaña
     */
    async switchTab(tabId) {
        if (tabId === this.currentTab) return;

        try {
            this.currentTab = tabId;
            this.updateActiveTab();
            await this.loadTab(tabId);
            
            console.log(`✅ Pestaña cambiada a: ${tabId}`);
            
        } catch (error) {
            console.error(`❌ Error cambiando a pestaña ${tabId}:`, error);
        }
    }

    /**
     * 🎯 Actualizar botón activo
     */
    updateActiveTab() {
        const buttons = document.querySelectorAll('.varios-tab-btn');
        buttons.forEach(button => {
            const tabId = button.getAttribute('data-tab');
            if (tabId === this.currentTab) {
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
     * 📄 Cargar módulo de Documentos (ACTUALIZADO)
     */
    async loadDocumentosModule(container) {
        try {
            console.log('📄 Cargando módulo completo de documentos...');
            
            // Verificar si documentos.js ya está cargado
            if (!window.documentosManager) {
                console.log('📄 Cargando documentos.js...');
                await this.loadDocumentosScript();
            }
            
            // Verificar que documentosManager esté disponible
            if (!window.documentosManager) {
                throw new Error('DocumentosManager no se cargó correctamente');
            }
            
            // Inicializar el sistema de documentos
            await window.documentosManager.init('varios-content');
            
            console.log('✅ Módulo Documentos cargado completamente');
            
        } catch (error) {
            console.error('❌ Error cargando módulo de documentos:', error);
            container.innerHTML = `
                <div class="varios-tab-content" data-tab="documentos">
                    <div class="varios-error">
                        <p>❌ Error al cargar el sistema de documentos</p>
                        <button onclick="variosManager.loadDocumentosModule(document.getElementById('varios-content'))">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 🆕 CARGAR SCRIPT DE DOCUMENTOS.JS
     */
    async loadDocumentosScript() {
        return new Promise((resolve, reject) => {
            // Verificar si el script ya existe
            const existingScript = document.querySelector('script[src*="documentos.js"]');
            if (existingScript) {
                console.log('📄 Script documentos.js ya existe');
                resolve();
                return;
            }
            
            // Cargar el script dinámicamente
            const script = document.createElement('script');
            script.src = 'varios/js/documentos.js';
            script.onload = () => {
                console.log('✅ documentos.js cargado exitosamente');
                setTimeout(resolve, 100);
            };
            script.onerror = () => {
                console.error('❌ Error cargando documentos.js');
                reject(new Error('No se pudo cargar documentos.js'));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * 🧮 Cargar módulo de Herramientas
     */
    async loadHerramientasModule(container) {
        container.innerHTML = `
            <div class="varios-tab-content" data-tab="herramientas">
                <div class="tab-content-header">
                    <h3>🧮 Herramientas Financieras</h3>
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
        console.log('🧮 Módulo Herramientas cargado (básico)');
    }

    /**
     * ❌ Mostrar error
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="varios-main-container">
                    <div class="varios-error">
                        <p>❌ ${message}</p>
                        <button onclick="variosManager.init()">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }
}

// Instancia global
window.variosManager = new VariosManager();

console.log('📋 VariosManager v1.1.0: Módulo cargado con soporte para Documentos');