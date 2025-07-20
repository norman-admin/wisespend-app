/**
 * CONFIG-CORE.JS - Lógica Pura de Configuración
 * Control de Gastos Familiares - Versión 1.0.0
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Gestión de localStorage
 * ✅ Configuración por defecto
 * ✅ API de lectura/escritura
 * ✅ Validación de datos
 * ✅ Eventos de configuración
 * ✅ Sin dependencias de UI
 */

class ConfigCore {
    constructor() {
        this.storageKey = 'gastos-familiares-config';
        this.configCache = null;
        this.lastModified = null;
        this.eventListeners = new Set();
        
        // Configuración por defecto
        this.defaultConfig = {
            user: {
                name: '',
                dateFormat: 'DD/MM/YYYY',
                weekStart: 'monday',
                timezone: 'America/Santiago'
            },
            currency: {
                code: 'CLP',
                symbol: '$',
                position: 'before', // before, after
                thousands: '.',
                decimals: ',',
                showCents: false
            },
            notifications: {
                pendingReminders: true,
                budgetAlerts: true,
                autoSaveNotification: false,
                sounds: true
            },
            language: {
                code: 'es-CL',
                name: 'Español (Chile)'
            }
        };
        
        this.init();
    }

    /**
     * 🚀 Inicialización del core
     */
    init() {
        console.log('⚙️ ConfigCore: Inicializando sistema de configuración...');
        
        // Cargar configuración inicial
        this.loadConfiguration();
        
        // Configurar listeners de storage
        this.setupStorageSync();
        
        console.log('✅ ConfigCore: Sistema inicializado');
    }

    /**
     * 💾 GESTIÓN DE LOCALSTORAGE
     */

    /**
     * Cargar configuración desde localStorage
     */
    loadConfiguration() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            
            if (stored) {
                const parsedConfig = JSON.parse(stored);
                
                // Validar estructura
                if (this.isValidConfig(parsedConfig)) {
                    this.configCache = this.mergeWithDefaults(parsedConfig);
                    this.lastModified = new Date().toISOString();
                    console.log('📄 Configuración cargada desde localStorage');
                } else {
                    console.warn('⚠️ Configuración inválida, usando defaults');
                    this.configCache = this.getDeepCopy(this.defaultConfig);
                }
            } else {
                console.log('📄 No hay configuración guardada, usando defaults');
                this.configCache = this.getDeepCopy(this.defaultConfig);
            }
            
            return this.configCache;
            
        } catch (error) {
            console.error('❌ Error cargando configuración:', error);
            this.configCache = this.getDeepCopy(this.defaultConfig);
            return this.configCache;
        }
    }

    /**
     * Guardar configuración en localStorage
     */
    saveConfiguration(config = null) {
        try {
            const configToSave = config || this.configCache;
            
            if (!configToSave) {
                console.warn('⚠️ No hay configuración para guardar');
                return false;
            }

            // Validar antes de guardar
            if (!this.isValidConfig(configToSave)) {
                console.error('❌ Configuración inválida, no se guardará');
                return false;
            }

            // Guardar en localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(configToSave));
            
            // Actualizar cache y timestamp
            this.configCache = this.getDeepCopy(configToSave);
            this.lastModified = new Date().toISOString();
            
            console.log('💾 Configuración guardada exitosamente');
            
            // Disparar evento
            this.dispatchConfigEvent('configSaved', {
                config: this.configCache,
                timestamp: this.lastModified
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Error guardando configuración:', error);
            return false;
        }
    }

    /**
     * 🔄 API DE LECTURA/ESCRITURA
     */

    /**
     * Obtener configuración completa
     */
    getConfig() {
        if (!this.configCache) {
            this.loadConfiguration();
        }
        return this.getDeepCopy(this.configCache);
    }

    /**
     * Obtener sección específica
     */
    getSection(sectionName) {
        if (!this.configCache) {
            this.loadConfiguration();
        }

        if (!this.configCache[sectionName]) {
            console.warn(`⚠️ Sección '${sectionName}' no existe`);
            return null;
        }

        return this.getDeepCopy(this.configCache[sectionName]);
    }

    /**
     * Obtener valor específico
     */
    getValue(sectionName, key) {
        const section = this.getSection(sectionName);
        return section ? section[key] : undefined;
    }

    /**
     * Actualizar sección completa
     */
    updateSection(sectionName, updates) {
        if (!this.configCache) {
            this.loadConfiguration();
        }

        if (!this.configCache[sectionName]) {
            console.warn(`⚠️ Sección '${sectionName}' no existe`);
            return false;
        }

        // Mergear actualizaciones
        const currentSection = this.configCache[sectionName];
        const updatedSection = { ...currentSection, ...updates };
        
        // Validar sección actualizada
        if (!this.isValidSection(sectionName, updatedSection)) {
            console.error(`❌ Datos inválidos para sección '${sectionName}'`);
            return false;
        }

        // Actualizar cache
        this.configCache[sectionName] = updatedSection;
        
        // Guardar
        const saved = this.saveConfiguration();
        
        if (saved) {
            this.dispatchConfigEvent('sectionUpdated', {
                section: sectionName,
                data: updatedSection,
                timestamp: this.lastModified
            });
        }
        
        return saved;
    }

    /**
     * Actualizar valor específico
     */
    updateValue(sectionName, key, value) {
        const updates = { [key]: value };
        return this.updateSection(sectionName, updates);
    }

    /**
     * Actualizar múltiples valores
     */
    updateMultiple(updates) {
        if (!this.configCache) {
            this.loadConfiguration();
        }

        let hasChanges = false;
        const oldConfig = this.getDeepCopy(this.configCache);

        // Aplicar todas las actualizaciones
        for (const [sectionName, sectionUpdates] of Object.entries(updates)) {
            if (this.configCache[sectionName]) {
                this.configCache[sectionName] = {
                    ...this.configCache[sectionName],
                    ...sectionUpdates
                };
                hasChanges = true;
            }
        }

        if (!hasChanges) {
            console.log('📄 No hay cambios para aplicar');
            return false;
        }

        // Validar configuración completa
        if (!this.isValidConfig(this.configCache)) {
            console.error('❌ Configuración resultante inválida, revirtiendo');
            this.configCache = oldConfig;
            return false;
        }

        // Guardar
        const saved = this.saveConfiguration();
        
        if (saved) {
            this.dispatchConfigEvent('multipleUpdated', {
                updates,
                config: this.configCache,
                timestamp: this.lastModified
            });
        }
        
        return saved;
    }

    /**
     * 🔍 VALIDACIÓN DE DATOS
     */

    /**
     * Validar configuración completa
     */
    isValidConfig(config) {
        if (!config || typeof config !== 'object') {
            return false;
        }

        // Verificar que existan todas las secciones requeridas
        const requiredSections = Object.keys(this.defaultConfig);
        for (const section of requiredSections) {
            if (!config[section] || typeof config[section] !== 'object') {
                console.warn(`⚠️ Sección faltante o inválida: ${section}`);
                return false;
            }
        }

        // Validar cada sección individualmente
        for (const [sectionName, sectionData] of Object.entries(config)) {
            if (!this.isValidSection(sectionName, sectionData)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validar sección específica
     */
    isValidSection(sectionName, sectionData) {
        if (!this.defaultConfig[sectionName]) {
            console.warn(`⚠️ Sección desconocida: ${sectionName}`);
            return false;
        }

        const defaultSection = this.defaultConfig[sectionName];
        
        // Validaciones específicas por sección
        switch (sectionName) {
            case 'user':
                return this.validateUserSection(sectionData, defaultSection);
            case 'currency':
                return this.validateCurrencySection(sectionData, defaultSection);
            case 'notifications':
                return this.validateNotificationsSection(sectionData, defaultSection);
            case 'language':
                return this.validateLanguageSection(sectionData, defaultSection);
            default:
                return this.validateGenericSection(sectionData, defaultSection);
        }
    }

    /**
     * Validar sección de usuario
     */
    validateUserSection(data, defaults) {
        const validDateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
        const validWeekStarts = ['monday', 'sunday'];
        
        return (
            typeof data.name === 'string' &&
            validDateFormats.includes(data.dateFormat) &&
            validWeekStarts.includes(data.weekStart) &&
            typeof data.timezone === 'string' && data.timezone.length > 0
        );
    }

    /**
     * Validar sección de moneda
     */
    validateCurrencySection(data, defaults) {
        const validCurrencies = ['CLP', 'USD', 'EUR', 'MXN', 'ARS', 'BRL'];
        const validPositions = ['before', 'after'];
        
        return (
            validCurrencies.includes(data.code) &&
            typeof data.symbol === 'string' && data.symbol.length > 0 &&
            validPositions.includes(data.position) &&
            typeof data.thousands === 'string' &&
            typeof data.decimals === 'string' &&
            typeof data.showCents === 'boolean'
        );
    }

    /**
     * Validar sección de notificaciones
     */
    validateNotificationsSection(data, defaults) {
        return (
            typeof data.pendingReminders === 'boolean' &&
            typeof data.budgetAlerts === 'boolean' &&
            typeof data.autoSaveNotification === 'boolean' &&
            typeof data.sounds === 'boolean'
        );
    }

    /**
     * Validar sección de idioma
     */
    validateLanguageSection(data, defaults) {
        const validLanguages = ['es-CL', 'es-ES', 'es-MX', 'en-US', 'pt-BR'];
        
        return (
            validLanguages.includes(data.code) &&
            typeof data.name === 'string' && data.name.length > 0
        );
    }

    /**
     * Validar sección genérica
     */
    validateGenericSection(data, defaults) {
        // Verificar que todos los campos requeridos estén presentes
        for (const key of Object.keys(defaults)) {
            if (!(key in data)) {
                console.warn(`⚠️ Campo faltante: ${key}`);
                return false;
            }
        }
        return true;
    }

    /**
     * 🔄 UTILIDADES
     */

    /**
     * Mergear con configuración por defecto
     */
    mergeWithDefaults(userConfig) {
        const merged = {};
        
        for (const [sectionName, defaultSection] of Object.entries(this.defaultConfig)) {
            merged[sectionName] = {
                ...defaultSection,
                ...(userConfig[sectionName] || {})
            };
        }
        
        return merged;
    }

    /**
     * Crear copia profunda
     */
    getDeepCopy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Restablecer a configuración por defecto
     */
    resetToDefaults() {
        console.log('🔄 Restableciendo configuración por defecto...');
        
        this.configCache = this.getDeepCopy(this.defaultConfig);
        const saved = this.saveConfiguration();
        
        if (saved) {
            this.dispatchConfigEvent('configReset', {
                config: this.configCache,
                timestamp: this.lastModified
            });
        }
        
        return saved;
    }

    /**
     * Obtener información del sistema
     */
    getSystemInfo() {
        return {
            storageKey: this.storageKey,
            lastModified: this.lastModified,
            configSize: this.configCache ? JSON.stringify(this.configCache).length : 0,
            isLoaded: !!this.configCache,
            hasLocalStorage: this.hasLocalStorageSupport(),
            version: '1.0.0'
        };
    }

    /**
     * Verificar soporte de localStorage
     */
    hasLocalStorageSupport() {
        try {
            const test = '__config_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 🎧 GESTIÓN DE EVENTOS
     */

    /**
     * Configurar sincronización entre pestañas
     */
    setupStorageSync() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                console.log('🔄 Configuración sincronizada desde otra pestaña');
                this.loadConfiguration();
                this.dispatchConfigEvent('configSynced', {
                    config: this.configCache,
                    source: 'external_tab'
                });
            }
        });
    }

    /**
     * Disparar evento de configuración
     */
    dispatchConfigEvent(type, detail = {}) {
        const event = new CustomEvent(`config_${type}`, {
            detail: {
                timestamp: new Date().toISOString(),
                source: 'config_core',
                ...detail
            },
            bubbles: true
        });
        
        window.dispatchEvent(event);
        console.log(`📡 Evento disparado: config_${type}`);
    }

    /**
     * Agregar listener personalizado
     */
    addEventListener(type, callback) {
        const eventType = `config_${type}`;
        window.addEventListener(eventType, callback);
        this.eventListeners.add({ type: eventType, callback });
    }

    /**
     * Remover listener personalizado
     */
    removeEventListener(type, callback) {
        const eventType = `config_${type}`;
        window.removeEventListener(eventType, callback);
        this.eventListeners.delete({ type: eventType, callback });
    }

    /**
     * 📊 EXPORTACIÓN/IMPORTACIÓN
     */

    /**
     * Exportar configuración
     */
    exportConfig() {
        try {
            const exportData = {
                config: this.getConfig(),
                metadata: {
                    exportDate: new Date().toISOString(),
                    version: '1.0.0',
                    source: 'config_core'
                }
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const filename = `gastos-config-${new Date().toISOString().split('T')[0]}.json`;
            
            return {
                blob,
                filename,
                data: exportData
            };
            
        } catch (error) {
            console.error('❌ Error exportando configuración:', error);
            return null;
        }
    }

    /**
     * Importar configuración
     */
    async importConfig(file) {
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            // Validar estructura de importación
            if (!importData.config) {
                throw new Error('Archivo de configuración inválido');
            }
            
            // Validar configuración
            if (!this.isValidConfig(importData.config)) {
                throw new Error('Configuración importada inválida');
            }
            
            // Hacer backup de configuración actual
            const backup = this.getConfig();
            
            // Aplicar configuración importada
            this.configCache = this.mergeWithDefaults(importData.config);
            const saved = this.saveConfiguration();
            
            if (saved) {
                this.dispatchConfigEvent('configImported', {
                    config: this.configCache,
                    metadata: importData.metadata,
                    backup
                });
                
                return {
                    success: true,
                    config: this.configCache,
                    backup
                };
            } else {
                throw new Error('Error guardando configuración importada');
            }
            
        } catch (error) {
            console.error('❌ Error importando configuración:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 🧹 LIMPIEZA
     */

    /**
     * Limpiar cache
     */
    clearCache() {
        this.configCache = null;
        this.lastModified = null;
        console.log('🧹 Cache de configuración limpiado');
    }

    /**
     * Remover configuración del localStorage
     */
    removeStoredConfig() {
        try {
            localStorage.removeItem(this.storageKey);
            this.clearCache();
            console.log('🗑️ Configuración removida del localStorage');
            
            this.dispatchConfigEvent('configRemoved', {});
            return true;
        } catch (error) {
            console.error('❌ Error removiendo configuración:', error);
            return false;
        }
    }

    /**
     * Destruir instancia
     */
    destroy() {
        console.log('🧹 Destruyendo ConfigCore...');
        
        // Limpiar event listeners
        this.eventListeners.forEach(({ type, callback }) => {
            window.removeEventListener(type, callback);
        });
        this.eventListeners.clear();
        
        // Limpiar referencias
        this.configCache = null;
        this.lastModified = null;
        
        console.log('✅ ConfigCore destruido');
    }
}

// Crear instancia global
window.configCore = new ConfigCore();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigCore;
}

console.log('⚙️ ConfigCore v1.0.0 cargado - Lógica pura de configuración activa');