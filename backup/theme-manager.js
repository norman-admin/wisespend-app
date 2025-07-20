/**
 * 🌙 THEME-MANAGER.JS - SIMPLIFICADO v7.0
 * Control de Gastos Familiares - Sistema Simple
 * 
 * 🎯 CARACTERÍSTICAS v7.0:
 * ✅ Sistema simple sin theme-loader
 * ✅ Funciona igual que index.html
 * ✅ Cambio de temas con clases CSS
 * ✅ Sin dependencias complejas
 * ✅ Sin timeouts ni errores
 * ✅ 100% confiable
 */

class ThemeManager {
    constructor() {
        // Configuración base
        this.storageKey = 'gastos-familiares-theme';
        this.themes = {
            AUTO: 'auto',
            LIGHT: 'light', 
            DARK: 'dark',
            PASTEL: 'pastel'
        };
        
        // Estado
        this.currentTheme = this.getStoredTheme();
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        this.isInjected = false;
        
        this.init();
    }

    /**
     * 🚀 Inicialización simple
     */
    init() {
        console.log('🌙 ThemeManager v7.0: Inicializando sistema simplificado...');
        
        // Aplicar tema inicial inmediatamente
        this.applyTheme(this.currentTheme);
        
        // Configurar listeners
        this.setupEventListeners();
        
        console.log(`🎨 ThemeManager: Inicializado con tema: ${this.currentTheme}`);
        console.log('✅ Sistema de temas simplificado funcional');
    }

    /**
     * 💾 Gestión de localStorage
     */
    getStoredTheme() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return Object.values(this.themes).includes(stored) ? stored : this.themes.AUTO;
        } catch (error) {
            console.warn('🌙 Error al leer tema guardado:', error);
            return this.themes.AUTO;
        }
    }

    setStoredTheme(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.warn('🌙 Error al guardar tema:', error);
        }
    }

    /**
     * 🎨 Aplicar tema (simplificado)
     */
    applyTheme(theme) {
        console.log(`🎨 Aplicando tema: ${theme}`);
        
        // Limpiar clases anteriores
        this.clearThemeClasses();
        
        // Aplicar nuevo tema
        if (theme === this.themes.AUTO) {
            this.applyAutoTheme();
        } else {
            this.applySpecificTheme(theme);
        }
        
        // Actualizar interfaz si existe
        this.updateThemeInterface();
        
        // Disparar evento
        this.dispatchThemeEvent(theme);
    }

    /**
     * 🧹 Limpiar clases de tema
     */
    clearThemeClasses() {
        const html = document.documentElement;
        const body = document.body;
        
        Object.values(this.themes).forEach(theme => {
            if (theme !== 'auto') {
                html.classList.remove(`${theme}-theme`);
                body.classList.remove(`${theme}-theme`);
            }
        });
        
        html.removeAttribute('data-theme');
    }

    /**
     * 🔄 Aplicar tema automático
     */
    applyAutoTheme() {
        console.log(`🔄 Modo automático - Sistema prefiere: ${this.mediaQuery.matches ? 'dark' : 'light'}`);
        // En modo auto, themes.css maneja automáticamente con @media queries
    }

    /**
     * 🎯 Aplicar tema específico
     */
    applySpecificTheme(theme) {
        const html = document.documentElement;
        const body = document.body;
        
        // Aplicar clases CSS (themes.css las maneja)
        html.classList.add(`${theme}-theme`);
        body.classList.add(`${theme}-theme`);
        html.setAttribute('data-theme', theme);
        
        console.log(`✅ Tema ${theme} aplicado con clases CSS`);
    }

    /**
     * 🎮 Configurar event listeners
     */
    setupEventListeners() {
        // Cambios en prefers-color-scheme
        this.mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === this.themes.AUTO) {
                console.log('🔄 Cambio automático detectado');
                this.updateThemeInterface();
            }
        });
        
        // Sincronización entre pestañas
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey && e.newValue) {
                this.currentTheme = e.newValue;
                this.applyTheme(this.currentTheme);
            }
        });

        // Keyboard shortcut: Ctrl+Shift+T
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

     }

    /**
     * ✨ Toggle entre temas
     */
    toggleTheme() {
        const themeOrder = [
            this.themes.AUTO,
            this.themes.LIGHT,
            this.themes.PASTEL,
            this.themes.DARK
        ];
        
        const currentIndex = themeOrder.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeOrder.length;
        const nextTheme = themeOrder[nextIndex];
        
        this.setTheme(nextTheme);
        console.log(`🔄 Toggle: ${this.currentTheme} → ${nextTheme}`);
    }

    /**
     * 🎯 Establecer tema específico
     */
    setTheme(theme) {
        if (!Object.values(this.themes).includes(theme)) {
            console.warn(`🌙 Tema inválido: ${theme}`);
            return;
        }
        
        this.currentTheme = theme;
        this.setStoredTheme(theme);
        this.applyTheme(theme);
    }

    /**
     * 📊 Métodos de información
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    isDarkMode() {
        if (this.currentTheme === this.themes.DARK) {
            return true;
        } else if (this.currentTheme === this.themes.LIGHT || this.currentTheme === this.themes.PASTEL) {
            return false;
        } else {
            return this.mediaQuery.matches;
        }
    }

    /**
     * 🎯 Intentar inyectar sección de temas en Configuración
     */
    tryInjectThemeSection() {
        if (this.isInjected) return;

        const configSection = document.querySelector('#dynamic-content');
        if (configSection && configSection.innerHTML.includes('Configuración')) {
            this.injectThemeSection(configSection);
        }
    }

    /**
     * 💉 Inyectar sección de temas
     */
    injectThemeSection(configSection) {
        if (configSection.querySelector('#theme-config-section')) {
            this.isInjected = true;
            return;
        }

        const themeSection = this.createThemeSection();
        configSection.appendChild(themeSection);
        this.setupThemeSelector();
        this.updateThemeInterface();
        this.injectThemeStyles();
        
        this.isInjected = true;
        console.log('⚙️ Sección de temas inyectada exitosamente');
    }

    /**
     * 🏗️ Crear sección HTML de temas
     */
    createThemeSection() {
        const section = document.createElement('div');
        section.id = 'theme-config-section';
        section.className = 'config-section theme-config-section';
        section.innerHTML = `
            <div class="config-section-header">
                <h3>🎨 Apariencia</h3>
                <p class="config-description">Personaliza el tema de la aplicación.</p>
            </div>
            
            <div class="config-section-content">
                <div class="form-group">
                    <label for="theme-selector" class="form-label">Tema de la aplicación:</label>
                    <select id="theme-selector" class="form-select theme-selector">
                        <option value="auto">🔄 Automático</option>
                        <option value="light">☀️ Claro</option>
                        <option value="pastel">🌸 Pasteles</option>
                        <option value="dark">🌙 Oscuro</option>
                    </select>
                </div>
                
                <div class="theme-info">
                    <small class="theme-info-text">
                        Tema actual: <span id="current-theme-name">Automático</span>
                        <span id="auto-theme-detail" style="display: none;"> · Sistema: <span id="system-preference">Claro</span></span>
                    </small>
                </div>
            </div>
        `;

        return section;
    }

    /**
     * 🎮 Configurar selector de temas
     */
    setupThemeSelector() {
        const selector = document.getElementById('theme-selector');
        if (!selector) return;

        selector.addEventListener('change', (e) => {
            const selectedTheme = e.target.value;
            this.setTheme(selectedTheme);
            
            // Feedback visual
            selector.style.transform = 'scale(0.98)';
            setTimeout(() => selector.style.transform = '', 100);
        });
    }

    /**
     * 🔄 Actualizar interfaz
     */
    updateThemeInterface() {
        this.updateThemeSelector();
        this.updateThemeInfo();
    }

    updateThemeSelector() {
        const selector = document.getElementById('theme-selector');
        if (selector) selector.value = this.currentTheme;
    }

    updateThemeInfo() {
        const currentThemeName = document.getElementById('current-theme-name');
        const autoThemeDetail = document.getElementById('auto-theme-detail');
        const systemPreference = document.getElementById('system-preference');

        if (!currentThemeName) return;

        const themeNames = {
            auto: 'Automático',
            light: 'Claro',
            dark: 'Oscuro',
            pastel: 'Pasteles'
        };

        currentThemeName.textContent = themeNames[this.currentTheme] || this.currentTheme;

        if (this.currentTheme === this.themes.AUTO && autoThemeDetail && systemPreference) {
            autoThemeDetail.style.display = 'inline';
            systemPreference.textContent = this.mediaQuery.matches ? 'Oscuro' : 'Claro';
        } else if (autoThemeDetail) {
            autoThemeDetail.style.display = 'none';
        }
    }

    /**
     * 🎉 Disparar evento de cambio de tema
     */
    dispatchThemeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: { 
                theme,
                isDark: this.isDarkMode(),
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * 💄 Inyectar estilos CSS de la sección
     */
    injectThemeStyles() {
        if (document.getElementById('theme-section-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'theme-section-styles';
        styles.textContent = `
            .theme-config-section {
                background: var(--bg-accent, #f9fafb);
                border: 1px solid var(--border-normal, #e5e7eb);
                border-radius: 12px;
                padding: 0;
                margin: 24px 0;
                overflow: hidden;
                transition: all 0.2s ease;
            }
            
            .theme-config-section:hover {
                border-color: var(--primary-600, #3b82f6);
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
            }
            
            .config-section-header {
                background: var(--bg-primary, #ffffff);
                padding: 20px 24px;
                border-bottom: 1px solid var(--border-light, #f1f5f9);
            }
            
            .config-section-header h3 {
                font-size: 18px;
                font-weight: 600;
                color: var(--text-primary, #111827);
                margin: 0 0 8px 0;
            }
            
            .config-description {
                color: var(--text-tertiary, #6b7280);
                font-size: 14px;
                margin: 0;
            }
            
            .config-section-content {
                padding: 24px;
            }
            
            .theme-selector {
                width: 100%;
                max-width: 400px;
                padding: 12px 16px;
                border: 1px solid var(--border-medium, #d1d5db);
                border-radius: 8px;
                font-size: 15px;
                color: var(--text-primary, #111827);
                background: var(--bg-primary, #ffffff);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .theme-selector:hover, .theme-selector:focus {
                border-color: var(--primary-600, #3b82f6);
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                outline: none;
            }
            
            .theme-info {
                margin-top: 12px;
                padding: 12px 16px;
                background: var(--bg-primary, #ffffff);
                border-radius: 8px;
                border: 1px solid var(--border-light, #f1f5f9);
            }
            
            .theme-info-text {
                color: var(--text-muted, #9ca3af);
                font-size: 13px;
            }
            
            #current-theme-name {
                font-weight: 600;
                color: var(--text-secondary, #374151);
            }
        `;

        document.head.appendChild(styles);
    }
}

// ===== FUNCIONES GLOBALES COMPATIBLES =====

window.toggleTheme = function() {
    window.themeManager?.toggleTheme();
};

window.setTheme = function(theme) {
    window.themeManager?.setTheme(theme);
};

window.getCurrentTheme = function() {
    return window.themeManager?.getCurrentTheme() || 'auto';
};

window.isDarkMode = function() {
    return window.themeManager?.isDarkMode() || false;
};

// ===== INICIALIZACIÓN AUTOMÁTICA =====

function initThemeManager() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.themeManager = new ThemeManager();
        });
    } else {
        window.themeManager = new ThemeManager();
    }
}

// Inicializar inmediatamente
initThemeManager();

// ===== EXPORT PARA MÓDULOS =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}

/**
 * 📚 CHANGELOG v7.0:
 * 
 * ✅ SIMPLIFICADO: Eliminada dependencia de theme-loader
 * ✅ SIMPLE: Usa solo clases CSS (como index.html)
 * ✅ RÁPIDO: Sin timeouts ni esperas
 * ✅ CONFIABLE: Sin errores de inicialización
 * ✅ FUNCIONAL: Cambio de temas completo
 * ✅ CONSISTENTE: Igual sistema que index.html
 * ✅ LIMPIO: Código reducido y optimizado
 */