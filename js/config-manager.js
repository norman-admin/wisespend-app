/**
 * CONFIG-MANAGER.JS - Orquestador de Sistema de Configuración
 * Control de Gastos Familiares - v2.0.1 CORREGIDO
 * 
 * CORRECCIÓN: Eliminado loop infinito y simplificada arquitectura modular
 * ✅ Sin dependencias de módulos inexistentes
 * ✅ Integración directa con managers existentes
 * ✅ Compatibilidad total mantenida
 */

class ConfigManager {
    constructor() {
        this.version = '2.0.1';
        this.isInitialized = false;
        this.modules = {
            storage: null,
            currency: null,
            ui: null
        };
        
        console.log('⚙️ ConfigManager v2.0.1: Inicializando...');
        this.init();
    }

    /**
     * Inicializar el sistema de configuración
     */
    async init() {
        try {
            console.log('🚀 ConfigManager: Iniciando inicialización...');
            
            // Esperar a que los módulos básicos estén disponibles
            await this.waitForEssentialModules();
            
            // Registrar módulos disponibles
            this.registerAvailableModules();
            
            // Marcar como inicializado
            this.isInitialized = true;
            
            console.log('✅ ConfigManager: Sistema inicializado correctamente');
            
        } catch (error) {
            console.error('❌ ConfigManager: Error en inicialización:', error);
            // Continuar con funcionalidad básica
            this.isInitialized = true;
        }
    }

    /**
     * Esperar módulos esenciales (sin loop infinito)
     */
    async waitForEssentialModules() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 10; // Máximo 2 segundos
            
            const checkModules = () => {
                attempts++;
                
                const storageReady = !!window.storageManager;
                const currencyReady = !!window.currencyManager;
                
                if (storageReady && currencyReady) {
                    console.log('📦 ConfigManager: Módulos esenciales disponibles');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.log('⚠️ ConfigManager: Timeout esperando módulos, continuando...');
                    resolve(); // Continuar de todas formas
                } else {
                    setTimeout(checkModules, 200);
                }
            };
            
            checkModules();
        });
    }

    /**
     * Registrar módulos disponibles
     */
    registerAvailableModules() {
        this.modules.storage = window.storageManager || null;
        this.modules.currency = window.currencyManager || null;
        this.modules.ui = window.configUI || null;
        
        const available = Object.entries(this.modules)
            .filter(([key, module]) => module !== null)
            .map(([key]) => key);
            
        console.log('📋 ConfigManager: Módulos disponibles:', available.join(', '));
    }

    /**
     * API PÚBLICA - Obtener configuración completa
     */
    getConfig() {
        this.ensureInitialized();
        
        if (this.modules.storage) {
            return this.modules.storage.getConfiguracion();
        }
        
        console.warn('⚠️ ConfigManager: StorageManager no disponible');
        return {};
    }

    /**
     * API PÚBLICA - Obtener sección específica
     */
    getSection(sectionName) {
        const config = this.getConfig();
        return config[sectionName] || null;
    }

    /**
     * API PÚBLICA - Actualizar sección
     */
    updateSection(sectionName, updates) {
        this.ensureInitialized();
        
        if (!this.modules.storage) {
            console.warn('⚠️ ConfigManager: No se puede actualizar, StorageManager no disponible');
            return false;
        }

        try {
            const currentConfig = this.modules.storage.getConfiguracion();
            currentConfig[sectionName] = { ...currentConfig[sectionName], ...updates };
            this.modules.storage.setConfiguracion(currentConfig);
            
            // Disparar evento
            this.dispatchEvent('sectionUpdated', {
                section: sectionName,
                updates: updates
            });
            
            return true;
        } catch (error) {
            console.error('❌ ConfigManager: Error actualizando sección:', error);
            return false;
        }
    }

    /**
     * API PÚBLICA - Actualizar valor específico
     */
    updateValue(sectionName, key, value) {
        return this.updateSection(sectionName, { [key]: value });
    }

    /**
     * API PÚBLICA - Restablecer a defaults
     */
    resetToDefaults() {
        this.ensureInitialized();
        
        if (!this.modules.storage) {
            console.warn('⚠️ ConfigManager: No se puede resetear, StorageManager no disponible');
            return false;
        }

        try {
            // Configuración por defecto
            const defaultConfig = {
                usuario: '',
                monedaPrincipal: 'CLP',
                tema: 'light',
                autoSave: 5,
                showWelcome: true,
                fechaCreacion: new Date().toISOString()
            };
            
            this.modules.storage.setConfiguracion(defaultConfig);
            
            // Resetear currency manager si está disponible
            if (this.modules.currency) {
                this.modules.currency.resetToDefault();
            }
            
            this.dispatchEvent('configReset', { config: defaultConfig });
            
            console.log('🔄 ConfigManager: Configuración restablecida');
            return true;
            
        } catch (error) {
            console.error('❌ ConfigManager: Error restableciendo configuración:', error);
            return false;
        }
    }

    /**
     * API PÚBLICA - Exportar configuración
     */
    exportConfig() {
        this.ensureInitialized();
        
        try {
            const allData = {};
            
            // Recopilar todos los datos del localStorage
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
                version: this.version,
                data: allData
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const filename = `wisespend-config-${new Date().toISOString().split('T')[0]}.json`;
            
            return { blob, filename };
            
        } catch (error) {
            console.error('❌ ConfigManager: Error exportando configuración:', error);
            return null;
        }
    }

    /**
     * API PÚBLICA - Importar configuración
     */
    async importConfig(file) {
        this.ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    if (!importData.data) {
                        throw new Error('Formato de archivo inválido');
                    }

                    // Importar datos
                    for (let key in importData.data) {
                        localStorage.setItem(key, JSON.stringify(importData.data[key]));
                    }

                    this.dispatchEvent('configImported', { data: importData });
                    
                    console.log('✅ ConfigManager: Configuración importada correctamente');
                    resolve(true);
                    
                } catch (error) {
                    console.error('❌ ConfigManager: Error importando configuración:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error leyendo archivo'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * API DE MONEDA - Delegar a currencyManager
     */
    getSupportedCurrencies() {
        if (this.modules.currency) {
            return this.modules.currency.getSupportedCurrencies();
        }
        
        // Fallback básico
        return [
            { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
            { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
            { code: 'EUR', name: 'Euro', symbol: '€' }
        ];
    }

    /**
     * API DE MONEDA - Cambiar moneda
     */
    setCurrency(currencyCode) {
        if (this.modules.currency) {
            return this.modules.currency.setCurrency(currencyCode);
        }
        
        console.warn('⚠️ ConfigManager: CurrencyManager no disponible');
        return false;
    }

    /**
     * API DE MONEDA - Forzar sincronización
     */
    syncCurrency() {
        if (this.modules.currency) {
            this.modules.currency.forceUpdateRates();
        }
    }

    /**
     * GESTIÓN DE EVENTOS
     */
    dispatchEvent(type, detail = {}) {
        const event = new CustomEvent(`configManager_${type}`, {
            detail: {
                timestamp: new Date().toISOString(),
                version: this.version,
                source: 'config_manager',
                ...detail
            },
            bubbles: true
        });
        
        window.dispatchEvent(event);
    }

    /**
     * UTILIDADES
     */
    ensureInitialized() {
        if (!this.isInitialized) {
            console.warn('⚠️ ConfigManager: Sistema no completamente inicializado, usando fallback');
            this.registerAvailableModules();
        }
    }

    /**
     * Obtener información del sistema
     */
    getSystemInfo() {
        return {
            version: this.version,
            isInitialized: this.isInitialized,
            modules: {
                storage: !!this.modules.storage,
                currency: !!this.modules.currency,
                ui: !!this.modules.ui
            },
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Destructor
     */
    destroy() {
        console.log('🧹 ConfigManager: Destruyendo...');
        
        this.modules = { storage: null, currency: null, ui: null };
        this.isInitialized = false;
        
        console.log('✅ ConfigManager: Destruido correctamente');
    }
}

// ===== FUNCIONES GLOBALES DE COMPATIBILIDAD =====

/**
 * API Global - Obtener configuración
 */
window.getConfig = function(section = null) {
    if (window.configManager) {
        return section ? 
            window.configManager.getSection(section) : 
            window.configManager.getConfig();
    }
    
    // Fallback directo a storageManager
    if (window.storageManager) {
        const config = window.storageManager.getConfiguracion();
        return section ? config[section] : config;
    }
    
    console.warn('⚠️ getConfig: Sistema de configuración no disponible');
    return null;
};

/**
 * API Global - Actualizar configuración
 */
window.updateConfig = function(section, updates) {
    if (window.configManager) {
        return window.configManager.updateSection(section, updates);
    }
    
    // Fallback directo a storageManager
    if (window.storageManager) {
        const config = window.storageManager.getConfiguracion();
        config[section] = { ...config[section], ...updates };
        window.storageManager.setConfiguracion(config);
        return true;
    }
    
    console.warn('⚠️ updateConfig: Sistema de configuración no disponible');
    return false;
};

/**
 * API Global - Resetear configuración
 */
window.resetConfig = function() {
    if (window.configManager) {
        return window.configManager.resetToDefaults();
    }
    
    console.warn('⚠️ resetConfig: ConfigManager no disponible');
    return false;
};

/**
 * API Global - Exportar configuración
 */
window.exportConfig = function() {
    if (window.configManager) {
        return window.configManager.exportConfig();
    }
    
    console.warn('⚠️ exportConfig: ConfigManager no disponible');
    return false;
};

// ===== INICIALIZACIÓN =====

/**
 * Inicialización automática cuando el DOM esté listo
 */
function initConfigManager() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.configManager = new ConfigManager();
        });
    } else {
        window.configManager = new ConfigManager();
    }
}

// Inicializar
initConfigManager();

// ===== DEBUGGING =====

window.configDebug = {
    getSystemInfo: () => window.configManager?.getSystemInfo() || 'ConfigManager no disponible',
    testConfig: () => {
        console.log('🧪 Testing configuración...');
        console.log('getConfig():', window.getConfig());
        console.log('getConfig("currency"):', window.getConfig('currency'));
        console.log('Sistema:', window.configDebug.getSystemInfo());
    },
    forceInit: () => {
        if (window.configManager) {
            window.configManager.registerAvailableModules();
        }
    }
};

// ===== EXPORT PARA MÓDULOS =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigManager;
}

console.log('⚙️ ConfigManager v2.0.1 CORREGIDO - Sin loops, arquitectura simplificada');
console.log('🛠️ Debug disponible en: window.configDebug');