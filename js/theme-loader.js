/**
 * 🎨 THEME-LOADER.JS - CARGADOR DINÁMICO DE TEMAS v2.0
 * Control de Gastos Familiares - Arquitectura Modular
 * 
 * 🎯 CARACTERÍSTICAS:
 * ✅ Carga dinámica de archivos CSS de temas
 * ✅ Gestión inteligente de caché
 * ✅ Optimización de performance
 * ✅ Fallbacks y manejo de errores
 * ✅ Preloading de temas populares
 * ✅ Integración con theme-manager refactorizado
 */

class ThemeLoader {
    constructor() {
        this.loadedThemes = new Set();
        this.loadingPromises = new Map();
        this.themeCache = new Map();
        this.basePath = './themes/';
        this.retryAttempts = 3;
        this.retryDelay = 1000;
        
        // Configuración de temas disponibles
        this.availableThemes = {
            'base': {
                file: 'base.css',
                required: true,
                priority: 1
            },
            'light': {
                file: 'light.css',
                required: false,
                priority: 2
            },
            'dark': {
                file: 'dark.css',
                required: false,
                priority: 3
            },
            'pastel': {
                file: 'pastel.css',
                required: false,
                priority: 4
            },
            'soft-dark': {
                file: 'soft-dark.css',
                required: false,
                priority: 5
            }
        };
        
        this.init();
    }

    /**
     * 🚀 Inicialización del cargador
     */
    async init() {
        console.log('🎨 ThemeLoader v2.0: Inicializando sistema modular...');
        
        try {
            // Cargar base.css inmediatamente (requerido)
            await this.loadTheme('base');
            
            // Precargar temas populares en segundo plano
            this.preloadPopularThemes();
            
            // Configurar observador de cambios de tema
            this.setupThemeObserver();
            
            console.log('✅ ThemeLoader: Sistema inicializado correctamente');
        } catch (error) {
            console.error('❌ ThemeLoader: Error en inicialización:', error);
            this.handleInitError(error);
        }
    }

    /**
     * 📥 Cargar un tema específico
     * @param {string} themeName - Nombre del tema a cargar
     * @returns {Promise<boolean>} - Success status
     */
    async loadTheme(themeName) {
        // Validar tema
        if (!this.availableThemes[themeName]) {
            console.warn(`🎨 ThemeLoader: Tema "${themeName}" no encontrado`);
            return false;
        }

        // Si ya está cargado, retornar inmediatamente
        if (this.loadedThemes.has(themeName)) {
            console.log(`🎨 ThemeLoader: Tema "${themeName}" ya está cargado`);
            return true;
        }

        // Si ya está cargándose, esperar a que termine
        if (this.loadingPromises.has(themeName)) {
            console.log(`🎨 ThemeLoader: Esperando carga de tema "${themeName}"`);
            return await this.loadingPromises.get(themeName);
        }

        // Crear promesa de carga
        const loadingPromise = this.performThemeLoad(themeName);
        this.loadingPromises.set(themeName, loadingPromise);

        try {
            const result = await loadingPromise;
            this.loadingPromises.delete(themeName);
            return result;
        } catch (error) {
            this.loadingPromises.delete(themeName);
            throw error;
        }
    }

    /**
     * 🔄 Realizar la carga real del tema
     * @param {string} themeName - Nombre del tema
     * @returns {Promise<boolean>}
     */
    async performThemeLoad(themeName) {
        const themeConfig = this.availableThemes[themeName];
        const themeUrl = `${this.basePath}${themeConfig.file}`;
        
        console.log(`🎨 ThemeLoader: Cargando tema "${themeName}" desde ${themeUrl}`);

        // Intentar cargar con reintentos
        for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
            try {
                await this.loadCSS(themeUrl, themeName);
                this.loadedThemes.add(themeName);
                console.log(`✅ ThemeLoader: Tema "${themeName}" cargado exitosamente`);
                
                // Disparar evento de tema cargado
                this.dispatchThemeLoadedEvent(themeName);
                return true;
                
            } catch (error) {
                console.warn(`⚠️ ThemeLoader: Intento ${attempt}/${this.retryAttempts} falló para "${themeName}":`, error);
                
                if (attempt < this.retryAttempts) {
                    await this.delay(this.retryDelay * attempt);
                } else {
                    console.error(`❌ ThemeLoader: Falló carga de tema "${themeName}" después de ${this.retryAttempts} intentos`);
                    
                    // Si es un tema requerido, usar fallback
                    if (themeConfig.required) {
                        await this.handleRequiredThemeFailure(themeName);
                    }
                    
                    return false;
                }
            }
        }
    }

    /**
     * 📦 Cargar archivo CSS
     * @param {string} url - URL del archivo CSS
     * @param {string} id - ID único para el elemento link
     * @returns {Promise<void>}
     */
    loadCSS(url, id) {
        return new Promise((resolve, reject) => {
            // Verificar si ya existe un elemento con este ID
            const existingLink = document.getElementById(`theme-${id}`);
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            link.id = `theme-${id}`;
            
            // Configurar timeout
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout loading theme: ${id}`));
            }, 10000);

            link.onload = () => {
                clearTimeout(timeout);
                console.log(`🎨 CSS cargado: ${url}`);
                resolve();
            };

            link.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`Failed to load CSS: ${url}`));
            };

            // Insertar en el head
            document.head.appendChild(link);
        });
    }

    /**
     * 🗑️ Descargar un tema
     * @param {string} themeName - Nombre del tema a descargar
     */
    unloadTheme(themeName) {
        const linkElement = document.getElementById(`theme-${themeName}`);
        if (linkElement) {
            linkElement.remove();
            this.loadedThemes.delete(themeName);
            console.log(`🗑️ ThemeLoader: Tema "${themeName}" descargado`);
        }
    }

    /**
     * 🔄 Cambiar tema activo
     * @param {string} newTheme - Nuevo tema a activar
     * @param {string} oldTheme - Tema anterior (opcional)
     */
    async switchTheme(newTheme, oldTheme = null) {
        console.log(`🔄 ThemeLoader: Cambiando tema: ${oldTheme || 'current'} → ${newTheme}`);
        
        try {
            // Agregar clase de transición temporal
            document.documentElement.classList.add('theme-transitioning');
            
            // Cargar nuevo tema si no está cargado
            if (newTheme !== 'auto' && !this.loadedThemes.has(newTheme)) {
                await this.loadTheme(newTheme);
            }
            
            // Esperar un frame para que se aplique
            await this.nextFrame();
            
            // Remover clase de transición
            document.documentElement.classList.remove('theme-transitioning');
            
            console.log(`✅ ThemeLoader: Cambio de tema completado: ${newTheme}`);
            
        } catch (error) {
            console.error(`❌ ThemeLoader: Error cambiando tema:`, error);
            document.documentElement.classList.remove('theme-transitioning');
            throw error;
        }
    }

    /**
     * 📋 Precargar temas populares
     */
    async preloadPopularThemes() {
        const popularThemes = ['light', 'dark'];
        
        console.log('🚀 ThemeLoader: Precargando temas populares...');
        
        for (const theme of popularThemes) {
            try {
                await this.loadTheme(theme);
            } catch (error) {
                console.warn(`⚠️ ThemeLoader: Error precargando tema "${theme}":`, error);
            }
        }
    }

    /**
     * 👀 Configurar observador de cambios de tema
     */
    setupThemeObserver() {
        // Escuchar eventos de cambio de tema del theme-manager
        window.addEventListener('themeChanged', (event) => {
            const { theme } = event.detail;
            if (theme && theme !== 'auto') {
                this.switchTheme(theme).catch(error => {
                    console.error('Error switching theme:', error);
                });
            }
        });

        // Escuchar cambios en prefers-color-scheme
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', () => {
            if (window.themeManager?.getCurrentTheme() === 'auto') {
                console.log('🌙 ThemeLoader: Cambio detectado en prefers-color-scheme');
            }
        });
    }

    /**
     * 🎯 Obtener temas cargados
     * @returns {Array<string>}
     */
    getLoadedThemes() {
        return Array.from(this.loadedThemes);
    }

    /**
     * ❓ Verificar si un tema está cargado
     * @param {string} themeName
     * @returns {boolean}
     */
    isThemeLoaded(themeName) {
        return this.loadedThemes.has(themeName);
    }

    /**
     * 📊 Obtener estadísticas de carga
     * @returns {Object}
     */
    getLoadStats() {
        return {
            loadedThemes: this.getLoadedThemes(),
            availableThemes: Object.keys(this.availableThemes),
            loadingInProgress: Array.from(this.loadingPromises.keys()),
            cacheSize: this.themeCache.size
        };
    }

    /**
     * 🧹 Limpiar caché y reiniciar
     */
    clearCache() {
        this.themeCache.clear();
        this.loadingPromises.clear();
        console.log('🧹 ThemeLoader: Caché limpiado');
    }

    /**
     * 💾 Gestión de errores para temas requeridos
     * @param {string} themeName
     */
    async handleRequiredThemeFailure(themeName) {
        console.error(`💾 ThemeLoader: Tema requerido "${themeName}" falló. Aplicando fallback...`);
        
        // Para base.css, crear estilos mínimos de emergencia
        if (themeName === 'base') {
            this.injectEmergencyStyles();
        }
    }

    /**
     * 🚨 Inyectar estilos de emergencia
     */
    injectEmergencyStyles() {
        const emergencyCSS = `
            :root {
                --bg-primary: #ffffff;
                --bg-secondary: #f8fafc;
                --text-primary: #111827;
                --text-secondary: #374151;
                --border-normal: #e5e7eb;
                --primary-600: #2563eb;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'emergency-theme-styles';
        style.textContent = emergencyCSS;
        document.head.appendChild(style);
        
        console.log('🚨 ThemeLoader: Estilos de emergencia inyectados');
    }

    /**
     * 🎉 Disparar evento de tema cargado
     * @param {string} themeName
     */
    dispatchThemeLoadedEvent(themeName) {
        const event = new CustomEvent('themeLoaded', {
            detail: { 
                theme: themeName,
                timestamp: Date.now(),
                loadedThemes: this.getLoadedThemes()
            }
        });
        window.dispatchEvent(event);
    }

    /**
     * ⏱️ Utilidad para esperar al siguiente frame
     * @returns {Promise<void>}
     */
    nextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    /**
     * ⏰ Utilidad para delay
     * @param {number} ms - Milisegundos a esperar
     * @returns {Promise<void>}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🛠️ Manejar error de inicialización
     * @param {Error} error
     */
    handleInitError(error) {
        console.error('🛠️ ThemeLoader: Error crítico en inicialización');
        
        // Inyectar estilos de emergencia
        this.injectEmergencyStyles();
        
        // Notificar al theme-manager si está disponible
        if (window.themeManager) {
            window.themeManager.handleLoaderError?.(error);
        }
    }

    /**
     * 🔧 Método de diagnóstico
     * @returns {Object}
     */
    diagnose() {
        const diagnosis = {
            status: 'healthy',
            issues: [],
            recommendations: []
        };

        // Verificar si base.css está cargado
        if (!this.isThemeLoaded('base')) {
            diagnosis.status = 'critical';
            diagnosis.issues.push('base.css no está cargado');
            diagnosis.recommendations.push('Recargar la página o verificar la ruta de temas');
        }

        // Verificar si hay elementos link rotos
        const themeLinks = document.querySelectorAll('link[id^="theme-"]');
        themeLinks.forEach(link => {
            if (!link.sheet) {
                diagnosis.issues.push(`CSS no cargado: ${link.href}`);
                diagnosis.recommendations.push(`Verificar disponibilidad de ${link.href}`);
            }
        });

        // Verificar disponibilidad de archivos
        const missingThemes = Object.keys(this.availableThemes).filter(
            theme => !this.isThemeLoaded(theme) && this.availableThemes[theme].required
        );

        if (missingThemes.length > 0) {
            diagnosis.status = 'warning';
            diagnosis.issues.push(`Temas requeridos faltantes: ${missingThemes.join(', ')}`);
        }

        return diagnosis;
    }

    /**
     * 🔄 Reload de un tema específico
     * @param {string} themeName
     * @returns {Promise<boolean>}
     */
    async reloadTheme(themeName) {
        console.log(`🔄 ThemeLoader: Recargando tema "${themeName}"`);
        
        // Descargar tema actual
        this.unloadTheme(themeName);
        
        // Limpiar del caché
        this.themeCache.delete(themeName);
        
        // Cargar nuevamente
        return await this.loadTheme(themeName);
    }

    /**
     * 📱 Optimización para móviles
     */
    optimizeForMobile() {
        if (window.innerWidth <= 768) {
            console.log('📱 ThemeLoader: Aplicando optimizaciones móviles');
            
            // Reducir preloading en móviles
            this.availableThemes = Object.fromEntries(
                Object.entries(this.availableThemes).map(([key, config]) => [
                    key, 
                    { ...config, preload: false }
                ])
            );
        }
    }

    /**
     * 🌐 Verificar soporte del navegador
     * @returns {Object}
     */
    checkBrowserSupport() {
        const support = {
            css: true,
            cssVariables: CSS?.supports?.('color', 'var(--test)') ?? false,
            mediaQueries: window.matchMedia !== undefined,
            customProperties: true
        };

        // Verificar CSS.supports
        if (!CSS || !CSS.supports) {
            support.css = false;
        }

        // Verificar CSS custom properties básico
        try {
            const testElement = document.createElement('div');
            testElement.style.setProperty('--test-prop', 'test');
            support.customProperties = testElement.style.getPropertyValue('--test-prop') === 'test';
        } catch (e) {
            support.customProperties = false;
        }

        return support;
    }

    /**
     * 🧪 Modo de desarrollo
     */
    enableDevMode() {
        this.devMode = true;
        console.log('🧪 ThemeLoader: Modo desarrollo activado');
        
        // Agregar logs adicionales
        const originalLoadTheme = this.loadTheme.bind(this);
        this.loadTheme = async (themeName) => {
            const startTime = performance.now();
            const result = await originalLoadTheme(themeName);
            const endTime = performance.now();
            console.log(`⏱️ Tema "${themeName}" cargado en ${(endTime - startTime).toFixed(2)}ms`);
            return result;
        };

        // Agregar métodos de debug al window
        window.themeLoaderDebug = {
            getStats: () => this.getLoadStats(),
            diagnose: () => this.diagnose(),
            clearCache: () => this.clearCache(),
            reloadTheme: (theme) => this.reloadTheme(theme),
            checkSupport: () => this.checkBrowserSupport()
        };
    }

    /**
     * 💾 Persistir preferencias de carga
     * @param {Object} preferences
     */
    saveLoadPreferences(preferences) {
        try {
            localStorage.setItem('themeLoader-preferences', JSON.stringify(preferences));
        } catch (error) {
            console.warn('⚠️ No se pudieron guardar las preferencias:', error);
        }
    }

    /**
     * 📖 Cargar preferencias guardadas
     * @returns {Object}
     */
    loadPreferences() {
        try {
            const saved = localStorage.getItem('themeLoader-preferences');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('⚠️ Error cargando preferencias:', error);
            return {};
        }
    }

    /**
     * 🔧 Destruir instancia y limpiar
     */
    destroy() {
        // Limpiar todos los temas cargados
        this.getLoadedThemes().forEach(theme => {
            this.unloadTheme(theme);
        });

        // Limpiar caché
        this.clearCache();

        // Remover event listeners
        window.removeEventListener('themeChanged', this.switchTheme);

        // Limpiar referencias
        this.loadedThemes.clear();
        this.availableThemes = {};

        console.log('🔧 ThemeLoader: Instancia destruida');
    }
}

// ===== FUNCIONES GLOBALES DE UTILIDAD =====

/**
 * 🎨 Función global para cargar tema
 * @param {string} themeName
 * @returns {Promise<boolean>}
 */
window.loadTheme = async function(themeName) {
    if (window.themeLoader) {
        return await window.themeLoader.loadTheme(themeName);
    } else {
        console.warn('🎨 ThemeLoader no está inicializado');
        return false;
    }
};

/**
 * 🗑️ Función global para descargar tema
 * @param {string} themeName
 */
window.unloadTheme = function(themeName) {
    if (window.themeLoader) {
        window.themeLoader.unloadTheme(themeName);
    } else {
        console.warn('🎨 ThemeLoader no está inicializado');
    }
};

/**
 * 📊 Función global para obtener estadísticas
 * @returns {Object}
 */
window.getThemeStats = function() {
    if (window.themeLoader) {
        return window.themeLoader.getLoadStats();
    }
    return { error: 'ThemeLoader no disponible' };
};

/**
 * 🔄 Función global para recargar tema
 * @param {string} themeName
 * @returns {Promise<boolean>}
 */
window.reloadTheme = async function(themeName) {
    if (window.themeLoader) {
        return await window.themeLoader.reloadTheme(themeName);
    }
    return false;
};

// ===== INICIALIZACIÓN AUTOMÁTICA =====

/**
 * 🚀 Auto-inicialización del ThemeLoader
 */
function initThemeLoader() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.themeLoader = new ThemeLoader();
        });
    } else {
        window.themeLoader = new ThemeLoader();
    }
}

// ===== EXPORT PARA MÓDULOS (OPCIONAL) =====

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeLoader;
}

// ===== DETECCIÓN DE CONDICIONES ESPECIALES =====

// Verificar si estamos en un contexto de desarrollo
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.log('🧪 Modo desarrollo detectado');
    // Se podría activar devMode automáticamente
}

// Optimizar para móviles
if (/Mobi|Android/i.test(navigator.userAgent)) {
    console.log('📱 Dispositivo móvil detectado');
}

// ===== INICIALIZAR =====

initThemeLoader();

/**
 * 📚 GUÍA DE USO DEL THEME LOADER:
 * 
 * // Cargar un tema específico
 * await loadTheme('dark');
 * 
 * // Verificar si un tema está cargado
 * const isDarkLoaded = window.themeLoader.isThemeLoaded('dark');
 * 
 * // Obtener estadísticas
 * const stats = getThemeStats();
 * console.log('Temas cargados:', stats.loadedThemes);
 * 
 * // Recargar un tema
 * await reloadTheme('pastel');
 * 
 * // Eventos disponibles
 * window.addEventListener('themeLoaded', (e) => {
 *     console.log('Tema cargado:', e.detail.theme);
 * });
 * 
 * // Modo desarrollo (solo en desarrollo)
 * window.themeLoader.enableDevMode();
 * 
 * // Debug en consola (modo dev)
 * window.themeLoaderDebug.diagnose();
 * window.themeLoaderDebug.getStats();
 */