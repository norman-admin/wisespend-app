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