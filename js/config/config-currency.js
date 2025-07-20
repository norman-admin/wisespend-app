/**
 * CONFIG-CURRENCY.JS - Integración Real con CurrencyManager
 * Control de Gastos Familiares - Versión 1.0.0
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Integración con window.currencyManager existente
 * ✅ Sincronización bidireccional de configuración
 * ✅ Vista previa de formato en tiempo real
 * ✅ Validación de monedas soportadas
 * ✅ Aplicación automática de cambios
 * ✅ Eventos de sincronización
 */

class ConfigCurrency {
    constructor() {
        this.currencyManager = null;
        this.configCore = null;
        this.previewElement = null;
        this.isInitialized = false;
        this.syncInProgress = false;
        
        // Mapeo de configuración interna a CurrencyManager
        this.configMapping = {
            'code': 'currency',
            'symbol': 'symbol', 
            'position': 'position',
            'thousands': 'thousandsSeparator',
            'decimals': 'decimalSeparator',
            'showCents': 'showDecimals'
        };
        
        this.init();
    }

    /**
     * 🚀 Inicialización
     */
    init() {
        console.log('💱 ConfigCurrency: Inicializando integración...');
        
        // Esperar a que los módulos estén disponibles
        this.waitForDependencies().then(() => {
            this.setupIntegration();
            this.isInitialized = true;
            console.log('✅ ConfigCurrency: Integración inicializada');
        });
    }

    /**
     * Esperar dependencias
     */
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                this.currencyManager = window.currencyManager;
                this.configCore = window.configCore;
                
                if (this.currencyManager && this.configCore) {
                    console.log('📦 ConfigCurrency: Dependencias encontradas');
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    /**
     * Configurar integración
     */
    setupIntegration() {
        // Sincronizar configuración inicial
        this.syncFromConfigCore();
        
        // Configurar eventos
        this.setupEventListeners();
        
        console.log('🔗 ConfigCurrency: Integración configurada');
    }

    /**
     * 🔄 SINCRONIZACIÓN BIDIRECCIONAL
     */

    /**
     * Sincronizar desde ConfigCore hacia CurrencyManager
     */
    syncFromConfigCore() {
        if (this.syncInProgress) return;
        
        try {
            this.syncInProgress = true;
            
            const currencyConfig = this.configCore.getSection('currency');
            if (!currencyConfig) {
                console.warn('⚠️ No se encontró configuración de moneda');
                return;
            }
            
            console.log('🔄 Sincronizando configuración hacia CurrencyManager:', currencyConfig);
            
            // Aplicar configuración al CurrencyManager
            this.applyCurrencyConfig(currencyConfig);
            
        } catch (error) {
            console.error('❌ Error sincronizando desde ConfigCore:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * Sincronizar desde CurrencyManager hacia ConfigCore
     */
    syncFromCurrencyManager() {
        if (this.syncInProgress) return;
        
        try {
            this.syncInProgress = true;
            
            const currentCurrency = this.currencyManager.getCurrentCurrency();
            const currencyInfo = this.currencyManager.getCurrencyInfo(currentCurrency);
            
            if (!currencyInfo) {
                console.warn('⚠️ No se pudo obtener información de moneda actual');
                return;
            }
            
            console.log('🔄 Sincronizando configuración desde CurrencyManager:', currencyInfo);
            
            // Mapear configuración del CurrencyManager al formato de ConfigCore
            const configUpdate = {
                code: currentCurrency,
                symbol: currencyInfo.symbol,
                position: currencyInfo.position,
                thousands: currencyInfo.thousandsSeparator,
                decimals: currencyInfo.decimalSeparator,
                showCents: currencyInfo.decimals > 0
            };
            
            // Actualizar ConfigCore
            this.configCore.updateSection('currency', configUpdate);
            
        } catch (error) {
            console.error('❌ Error sincronizando desde CurrencyManager:', error);
        } finally {
            this.syncInProgress = false;
        }
    }

    /**
     * 💱 APLICACIÓN DE CONFIGURACIÓN
     */

    /**
     * Aplicar configuración de moneda al CurrencyManager
     */
    applyCurrencyConfig(currencyConfig) {
        try {
            // Cambiar moneda principal
            if (currencyConfig.code) {
                const currentCurrency = this.currencyManager.getCurrentCurrency();
                if (currentCurrency !== currencyConfig.code) {
                    const success = this.currencyManager.setCurrency(currencyConfig.code);
                    if (!success) {
                        console.error(`❌ No se pudo cambiar a moneda: ${currencyConfig.code}`);
                        return false;
                    }
                }
            }
            
            // Actualizar configuración de formato
            this.updateCurrencyFormat(currencyConfig);
            
            console.log('✅ Configuración aplicada al CurrencyManager');
            return true;
            
        } catch (error) {
            console.error('❌ Error aplicando configuración de moneda:', error);
            return false;
        }
    }

    /**
     * Actualizar formato de moneda
     */
    updateCurrencyFormat(currencyConfig) {
        const currentCurrency = this.currencyManager.getCurrentCurrency();
        const currencyInfo = this.currencyManager.getCurrencyInfo(currentCurrency);
        
        if (!currencyInfo) return;
        
        // Actualizar propiedades de formato en el objeto de configuración interna
        if (currencyConfig.symbol) {
            currencyInfo.symbol = currencyConfig.symbol;
        }
        
        if (currencyConfig.position) {
            currencyInfo.position = currencyConfig.position;
        }
        
        if (currencyConfig.thousands) {
            currencyInfo.thousandsSeparator = currencyConfig.thousands;
        }
        
        if (currencyConfig.decimals) {
            currencyInfo.decimalSeparator = currencyConfig.decimals;
        }
        
        if (typeof currencyConfig.showCents === 'boolean') {
            currencyInfo.decimals = currencyConfig.showCents ? 2 : 0;
        }
        
        console.log('🔧 Formato de moneda actualizado:', currencyInfo);
    }

    /**
     * 🎧 GESTIÓN DE EVENTOS
     */

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Escuchar cambios en ConfigCore
        window.addEventListener('config_sectionUpdated', (e) => {
            if (e.detail.section === 'currency') {
                console.log('📡 ConfigCurrency: Cambio detectado en configuración');
                setTimeout(() => this.syncFromConfigCore(), 50);
            }
        });
        
        // Escuchar cambios en CurrencyManager
        window.addEventListener('currency_currencyChanged', (e) => {
            console.log('📡 ConfigCurrency: Cambio detectado en CurrencyManager');
            setTimeout(() => this.syncFromCurrencyManager(), 50);
        });
        
        // Escuchar eventos de actualización de DOM para refrescar vista previa
        window.addEventListener('currency_domUpdated', () => {
            this.updatePreview();
        });
    }

    /**
     * 👁️ VISTA PREVIA
     */

    /**
     * Configurar elemento de vista previa
     */
    setupPreview(elementId) {
        this.previewElement = document.getElementById(elementId);
        if (this.previewElement) {
            this.updatePreview();
            console.log('👁️ Vista previa de moneda configurada');
        }
    }

    /**
     * Actualizar vista previa
     */
    updatePreview() {
        if (!this.previewElement) {
            // Buscar elemento de vista previa
            this.previewElement = document.getElementById('currency-preview');
        }
        
        if (!this.previewElement) return;
        
        try {
            const currencyConfig = this.configCore.getSection('currency');
            if (!currencyConfig) return;
            
            // Número de ejemplo
            const exampleAmount = 1234567.89;
            
            // Usar CurrencyManager para formatear
            let formattedAmount;
            if (this.currencyManager) {
                formattedAmount = this.currencyManager.format(exampleAmount, currencyConfig.code, {
                    showSymbol: true,
                    showCode: false
                });
            } else {
                // Fallback: formateo manual
                formattedAmount = this.formatAmountFallback(exampleAmount, currencyConfig);
            }
            
            this.previewElement.textContent = formattedAmount;
            
            // Agregar clase para animación
            this.previewElement.classList.add('updated');
            setTimeout(() => {
                this.previewElement.classList.remove('updated');
            }, 300);
            
        } catch (error) {
            console.error('❌ Error actualizando vista previa:', error);
            this.previewElement.textContent = 'Error en vista previa';
        }
    }

    /**
     * Formateo manual de fallback
     */
    formatAmountFallback(amount, config) {
        let number = amount.toFixed(config.showCents ? 2 : 0);
        
        // Separar parte entera y decimal
        const parts = number.split('.');
        let integerPart = parts[0];
        const decimalPart = parts[1];
        
        // Agregar separadores de miles
        if (config.thousands) {
            integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousands);
        }
        
        // Construir número formateado
        let formattedNumber = integerPart;
        if (config.showCents && decimalPart) {
            formattedNumber += config.decimals + decimalPart;
        }
        
        // Agregar símbolo
        if (config.position === 'before') {
            return config.symbol + formattedNumber;
        } else {
            return formattedNumber + config.symbol;
        }
    }

    /**
     * 📊 API PÚBLICA
     */

    /**
     * Obtener monedas soportadas
     */
    getSupportedCurrencies() {
        if (this.currencyManager) {
            return this.currencyManager.getSupportedCurrencies();
        }
        
        // Fallback: lista básica
        return [
            { code: 'CLP', name: 'Peso Chileno', symbol: '$' },
            { code: 'USD', name: 'Dólar Estadounidense', symbol: '$' },
            { code: 'EUR', name: 'Euro', symbol: '€' },
            { code: 'MXN', name: 'Peso Mexicano', symbol: '$' },
            { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
            { code: 'BRL', name: 'Real Brasileño', symbol: 'R$' }
        ];
    }

    /**
     * Cambiar moneda y sincronizar
     */
    setCurrency(currencyCode) {
        console.log(`💱 Cambiando moneda a: ${currencyCode}`);
        
        // Actualizar ConfigCore
        const success = this.configCore.updateValue('currency', 'code', currencyCode);
        
        if (success) {
            // Obtener configuración por defecto para la nueva moneda
            this.updateCurrencyDefaults(currencyCode);
            
            // Actualizar vista previa
            setTimeout(() => this.updatePreview(), 100);
            
            return true;
        }
        
        return false;
    }

    /**
     * Actualizar configuración por defecto para moneda
     */
    updateCurrencyDefaults(currencyCode) {
        const supportedCurrencies = this.getSupportedCurrencies();
        const currencyInfo = supportedCurrencies.find(c => c.code === currencyCode);
        
        if (currencyInfo) {
            // Configuración por defecto según la moneda
            const defaults = this.getCurrencyDefaults(currencyCode);
            
            // Actualizar ConfigCore con valores por defecto
            this.configCore.updateSection('currency', {
                ...defaults,
                code: currencyCode
            });
        }
    }

    /**
     * Obtener configuración por defecto para moneda
     */
    getCurrencyDefaults(currencyCode) {
        const defaults = {
            'CLP': {
                symbol: '$',
                position: 'before',
                thousands: '.',
                decimals: ',',
                showCents: false
            },
            'USD': {
                symbol: '$',
                position: 'before',
                thousands: ',',
                decimals: '.',
                showCents: true
            },
            'EUR': {
                symbol: '€',
                position: 'after',
                thousands: '.',
                decimals: ',',
                showCents: true
            },
            'MXN': {
                symbol: '$',
                position: 'before',
                thousands: ',',
                decimals: '.',
                showCents: true
            },
            'ARS': {
                symbol: '$',
                position: 'before',
                thousands: '.',
                decimals: ',',
                showCents: true
            },
            'BRL': {
                symbol: 'R$',
                position: 'before',
                thousands: '.',
                decimals: ',',
                showCents: true
            }
        };
        
        return defaults[currencyCode] || defaults['CLP'];
    }

    /**
     * Forzar sincronización completa
     */
    forceSync() {
        console.log('🔄 Forzando sincronización completa...');
        
        this.syncFromConfigCore();
        setTimeout(() => {
            this.updatePreview();
        }, 200);
    }

    /**
     * Validar configuración de moneda
     */
    validateCurrencyConfig(config) {
        const supportedCurrencies = this.getSupportedCurrencies();
        const validCodes = supportedCurrencies.map(c => c.code);
        
        return {
            isValid: validCodes.includes(config.code),
            supportedCodes: validCodes,
            errors: validCodes.includes(config.code) ? [] : [`Moneda no soportada: ${config.code}`]
        };
    }

    /**
     * 🧹 LIMPIEZA
     */

    /**
     * Destruir instancia
     */
    destroy() {
        console.log('🧹 Destruyendo ConfigCurrency...');
        
        // Limpiar referencias
        this.currencyManager = null;
        this.configCore = null;
        this.previewElement = null;
        this.isInitialized = false;
        
        console.log('✅ ConfigCurrency destruido');
    }

    /**
     * 🛠️ UTILIDADES DE DEBUGGING
     */

    /**
     * Obtener estado actual
     */
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            syncInProgress: this.syncInProgress,
            hasCurrencyManager: !!this.currencyManager,
            hasConfigCore: !!this.configCore,
            hasPreviewElement: !!this.previewElement,
            currentCurrency: this.currencyManager ? this.currencyManager.getCurrentCurrency() : null,
            configCurrency: this.configCore ? this.configCore.getValue('currency', 'code') : null
        };
    }

    /**
     * Probar sincronización
     */
    testSync() {
        console.log('🧪 Probando sincronización...');
        console.log('Estado actual:', this.getDebugInfo());
        
        this.forceSync();
        
        setTimeout(() => {
            console.log('Estado después de sync:', this.getDebugInfo());
        }, 500);
    }
}

// Crear instancia global
window.configCurrency = new ConfigCurrency();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigCurrency;
}

console.log('💱 ConfigCurrency v1.0.0 cargado - Integración con CurrencyManager activa');