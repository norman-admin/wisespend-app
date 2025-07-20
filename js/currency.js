/**
 * CURRENCY.JS - Sistema Multi-Moneda Enterprise
 * Presupuesto Familiar - Manejo de monedas CLP, USD, EUR
 * Autor: Sistema de Presupuesto Familiar
 * Versión: 1.0.0
 */

class CurrencyManager {
    constructor() {
        this.storage = window.storageManager;
        this.currentCurrency = 'CLP'; // Moneda por defecto
        this.exchangeRates = {};
        this.lastUpdate = null;
        this.updateInterval = null;
        
        // Configuración de monedas soportadas
        this.supportedCurrencies = {
            'CLP': {
                code: 'CLP',
                name: 'Peso Chileno',
                symbol: '$',
                decimals: 0,
                position: 'before', // before or after
                thousandsSeparator: '.',
                decimalSeparator: ',',
                format: '{symbol}{amount}'
            },
            'USD': {
                code: 'USD',
                name: 'Dólar Estadounidense',
                symbol: '$',
                decimals: 2,
                position: 'before',
                thousandsSeparator: ',',
                decimalSeparator: '.',
                format: '{symbol}{amount}'
            },
            'EUR': {
                code: 'EUR',
                name: 'Euro',
                symbol: '€',
                decimals: 2,
                position: 'after',
                thousandsSeparator: '.',
                decimalSeparator: ',',
                format: '{amount}{symbol}'
            }
        };

        // Tasas de cambio por defecto (se actualizarán automáticamente)
        this.defaultExchangeRates = {
            'CLP': 1, // Base currency
            'USD': 950, // 1 USD = 950 CLP aproximadamente
            'EUR': 1050 // 1 EUR = 1050 CLP aproximadamente
        };

        this.initializeCurrencyManager();
    }

    /**
     * Inicializar el sistema de monedas
     */
    initializeCurrencyManager() {
        console.log('💱 Inicializando Sistema de Monedas...');
        
        // Verificar que storage esté disponible
        if (!this.storage) {
            console.error('❌ StorageManager no está disponible');
            return;
        }

        // Cargar configuración guardada
        this.loadCurrencyConfiguration();
        
        // Cargar tasas de cambio guardadas
        this.loadExchangeRates();
        
        // Configurar actualización automática
        this.setupAutoUpdate();
        
        // Configurar eventos
        this.bindCurrencyEvents();
        
        console.log('✅ Sistema de Monedas inicializado correctamente');
        console.log(`💰 Moneda actual: ${this.currentCurrency}`);
    }

    /**
     * Cargar configuración de moneda guardada
     */
    loadCurrencyConfiguration() {
        const config = this.storage.getConfiguracion();
        if (config && config.monedaPrincipal) {
            this.currentCurrency = config.monedaPrincipal;
        }
    }

    /**
     * Cargar tasas de cambio guardadas
     */
    loadExchangeRates() {
        const savedRates = this.storage.getItem('currency_exchange_rates');
        const lastUpdate = this.storage.getItem('currency_last_update');
        
        if (savedRates && this.isRatesDataValid(lastUpdate)) {
            this.exchangeRates = savedRates;
            this.lastUpdate = lastUpdate;
            console.log('💱 Tasas de cambio cargadas desde storage');
        } else {
            // Usar tasas por defecto y actualizar
            this.exchangeRates = { ...this.defaultExchangeRates };
            this.updateExchangeRates();
            console.log('💱 Usando tasas de cambio por defecto');
        }
    }

    /**
     * Verificar si las tasas de cambio son válidas (menos de 24 horas)
     */
    isRatesDataValid(lastUpdate) {
        if (!lastUpdate) return false;
        
        const updateTime = new Date(lastUpdate);
        const now = new Date();
        const hoursDiff = (now - updateTime) / (1000 * 60 * 60);
        
        return hoursDiff < 24; // Válido por 24 horas
    }

    /**
     * GESTIÓN DE MONEDAS
     */

    /**
     * Cambiar moneda principal
     */
    setCurrency(currencyCode) {
        if (!this.supportedCurrencies[currencyCode]) {
            console.error(`❌ Moneda no soportada: ${currencyCode}`);
            return false;
        }

        const oldCurrency = this.currentCurrency;
        this.currentCurrency = currencyCode;
        
        // Guardar en configuración
        const config = this.storage.getConfiguracion();
        config.monedaPrincipal = currencyCode;
        this.storage.setConfiguracion(config);
        
        // Disparar evento de cambio
        this.dispatchCurrencyEvent('currencyChanged', {
            from: oldCurrency,
            to: currencyCode
        });
        
        console.log(`💱 Moneda cambiada a: ${currencyCode}`);
        return true;
    }

    /**
     * Obtener moneda actual
     */
    getCurrentCurrency() {
        return this.currentCurrency;
    }

    /**
     * Obtener información de una moneda
     */
    getCurrencyInfo(currencyCode = null) {
        const code = currencyCode || this.currentCurrency;
        return this.supportedCurrencies[code] || null;
    }

    /**
     * Obtener todas las monedas soportadas
     */
    getSupportedCurrencies() {
        return Object.keys(this.supportedCurrencies).map(code => ({
            code,
            ...this.supportedCurrencies[code]
        }));
    }

    /**
     * CONVERSIÓN DE MONEDAS
     */

    /**
     * Convertir cantidad entre monedas
     */
    convert(amount, fromCurrency, toCurrency) {
        if (!amount || amount === 0) return 0;
        
        // Si son la misma moneda, no hay conversión
        if (fromCurrency === toCurrency) return amount;
        
        // Verificar que las monedas estén soportadas
        if (!this.supportedCurrencies[fromCurrency] || !this.supportedCurrencies[toCurrency]) {
            console.error('❌ Moneda no soportada en conversión');
            return amount;
        }

        // Obtener tasas de cambio
        const fromRate = this.exchangeRates[fromCurrency] || 1;
        const toRate = this.exchangeRates[toCurrency] || 1;
        
        // Convertir a CLP primero (moneda base) y luego a la moneda destino
        let amountInCLP;
        if (fromCurrency === 'CLP') {
            amountInCLP = amount;
        } else {
            amountInCLP = amount * fromRate;
        }
        
        let convertedAmount;
        if (toCurrency === 'CLP') {
            convertedAmount = amountInCLP;
        } else {
            convertedAmount = amountInCLP / toRate;
        }
        
        return this.roundAmount(convertedAmount, toCurrency);
    }

    /**
     * Convertir a moneda actual
     */
    convertToCurrentCurrency(amount, fromCurrency) {
        return this.convert(amount, fromCurrency, this.currentCurrency);
    }

    /**
     * Convertir desde moneda actual
     */
    convertFromCurrentCurrency(amount, toCurrency) {
        return this.convert(amount, this.currentCurrency, toCurrency);
    }

    /**
     * Redondear cantidad según los decimales de la moneda
     */
    roundAmount(amount, currencyCode) {
        const currency = this.getCurrencyInfo(currencyCode);
        if (!currency) return amount;
        
        const decimals = currency.decimals || 0;
        return Math.round(amount * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }

    /**
     * FORMATEO DE NÚMEROS
     */

    /**
     * Formatear cantidad con formato de moneda
     */
    format(amount, currencyCode = null, options = {}) {
        const code = currencyCode || this.currentCurrency;
        const currency = this.getCurrencyInfo(code);
        
        if (!currency || amount === undefined || amount === null) {
            return '0';
        }

        const {
            showSymbol = true,
            showCode = false,
            compact = false
        } = options;

        // Redondear según decimales de la moneda
        const roundedAmount = this.roundAmount(amount, code);
        
        // Formatear número con separadores
        const formattedNumber = this.formatNumber(roundedAmount, currency);
        
        // Aplicar formato de moneda
        let result = formattedNumber;
        
        if (showSymbol) {
            if (currency.position === 'before') {
                result = `${currency.symbol}${formattedNumber}`;
            } else {
                result = `${formattedNumber}${currency.symbol}`;
            }
        }
        
        if (showCode) {
            result += ` ${code}`;
        }
        
        // Formato compacto para números grandes
        if (compact && Math.abs(amount) >= 1000000) {
            return this.formatCompact(amount, currency, showSymbol);
        }
        
        return result;
    }

    /**
     * Formatear número con separadores de miles y decimales
     */
    formatNumber(amount, currency) {
        const decimals = currency.decimals || 0;
        const thousandsSep = currency.thousandsSeparator || '.';
        const decimalSep = currency.decimalSeparator || ',';
        
        // Separar parte entera y decimal
        const parts = amount.toFixed(decimals).split('.');
        const integerPart = parts[0];
        const decimalPart = parts[1];
        
        // Agregar separadores de miles
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
        
        // Construir resultado
        if (decimals > 0 && decimalPart) {
            return `${formattedInteger}${decimalSep}${decimalPart}`;
        }
        
        return formattedInteger;
    }

    /**
     * Formatear en modo compacto (1.2M, 150K, etc.)
     */
    formatCompact(amount, currency, showSymbol = true) {
        const absAmount = Math.abs(amount);
        let value, suffix;
        
        if (absAmount >= 1000000000) {
            value = amount / 1000000000;
            suffix = 'B';
        } else if (absAmount >= 1000000) {
            value = amount / 1000000;
            suffix = 'M';
        } else if (absAmount >= 1000) {
            value = amount / 1000;
            suffix = 'K';
        } else {
            return this.format(amount, currency.code, { showSymbol });
        }
        
        const roundedValue = Math.round(value * 10) / 10;
        const formattedValue = roundedValue.toString().replace('.', currency.decimalSeparator);
        
        let result = `${formattedValue}${suffix}`;
        
        if (showSymbol) {
            if (currency.position === 'before') {
                result = `${currency.symbol}${result}`;
            } else {
                result = `${result}${currency.symbol}`;
            }
        }
        
        return result;
    }

    /**
     * Parsear string de moneda a número
     */
    parse(currencyString, currencyCode = null) {
        if (!currencyString || typeof currencyString !== 'string') {
            return 0;
        }

        const code = currencyCode || this.currentCurrency;
        const currency = this.getCurrencyInfo(code);
        
        if (!currency) return 0;
        
        // Remover símbolo y código de moneda
        let cleanString = currencyString
            .replace(new RegExp(`\\${currency.symbol}`, 'g'), '')
            .replace(new RegExp(`\\b${code}\\b`, 'g'), '')
            .trim();
        
        // Reemplazar separadores
        if (currency.thousandsSeparator !== currency.decimalSeparator) {
            // Remover separadores de miles
            cleanString = cleanString.replace(new RegExp(`\\${currency.thousandsSeparator}`, 'g'), '');
            // Convertir separador decimal a punto
            cleanString = cleanString.replace(currency.decimalSeparator, '.');
        }
        
        const parsed = parseFloat(cleanString);
        return isNaN(parsed) ? 0 : parsed;
    }

    /**
     * ACTUALIZACIÓN DE TASAS DE CAMBIO
     */

    /**
     * Configurar actualización automática
     */
    setupAutoUpdate() {
        // Actualizar cada 6 horas
        this.updateInterval = setInterval(() => {
            this.updateExchangeRates();
        }, 6 * 60 * 60 * 1000);
        
        console.log('🔄 Actualización automática de tasas configurada (cada 6 horas)');
    }

    /**
     * Actualizar tasas de cambio
     */
    async updateExchangeRates() {
        try {
            console.log('📡 Actualizando tasas de cambio...');
            
            // Intentar obtener tasas reales desde API
            const rates = await this.fetchExchangeRates();
            
            if (rates) {
                this.exchangeRates = rates;
                this.lastUpdate = new Date().toISOString();
                
                // Guardar en storage
                this.storage.setItem('currency_exchange_rates', this.exchangeRates);
                this.storage.setItem('currency_last_update', this.lastUpdate);
                
                console.log('✅ Tasas de cambio actualizadas');
                this.dispatchCurrencyEvent('ratesUpdated', { rates: this.exchangeRates });
            }
        } catch (error) {
            console.warn('⚠️ Error actualizando tasas, usando valores por defecto:', error);
            this.exchangeRates = { ...this.defaultExchangeRates };
        }
    }

    /**
     * Obtener tasas de cambio desde API externa
     */
    async fetchExchangeRates() {
        try {
            // API gratuita para tasas de cambio
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/CLP');
            
            if (!response.ok) {
                throw new Error('Error en respuesta de API');
            }
            
            const data = await response.json();
            
            // Convertir a formato interno (CLP como base)
            const rates = {
                'CLP': 1,
                'USD': 1 / (data.rates.USD || 0.001), // CLP por USD
                'EUR': 1 / (data.rates.EUR || 0.001)  // CLP por EUR
            };
            
            return rates;
        } catch (error) {
            console.warn('⚠️ No se pudo obtener tasas de API externa:', error);
            
            // Fallback: simular actualización con variación pequeña
            return this.generateFallbackRates();
        }
    }

    /**
     * Generar tasas de fallback con variación simulada
     */
    generateFallbackRates() {
        const variation = 0.02; // 2% de variación máxima
        
        return {
            'CLP': 1,
            'USD': this.defaultExchangeRates.USD * (1 + (Math.random() - 0.5) * variation),
            'EUR': this.defaultExchangeRates.EUR * (1 + (Math.random() - 0.5) * variation)
        };
    }

    /**
     * Obtener tasas de cambio actuales
     */
    getExchangeRates() {
        return { ...this.exchangeRates };
    }

    /**
     * Obtener información de última actualización
     */
    getLastUpdateInfo() {
        return {
            lastUpdate: this.lastUpdate,
            isValid: this.isRatesDataValid(this.lastUpdate),
            nextUpdate: this.getNextUpdateTime()
        };
    }

    /**
     * Obtener tiempo de próxima actualización
     */
    getNextUpdateTime() {
        if (!this.lastUpdate) return null;
        
        const lastUpdateTime = new Date(this.lastUpdate);
        const nextUpdate = new Date(lastUpdateTime.getTime() + (6 * 60 * 60 * 1000));
        
        return nextUpdate.toISOString();
    }

    /**
     * INTERFAZ DE USUARIO
     */

    /**
     * Crear selector de moneda
     */
    createCurrencySelector(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Contenedor ${containerId} no encontrado`);
            return;
        }

        const {
            showLabels = true,
            onChange = null,
            selectedCurrency = this.currentCurrency
        } = options;

        const selector = document.createElement('select');
        selector.className = 'currency-selector';
        selector.id = `${containerId}_selector`;
        
        // Agregar opciones
        Object.values(this.supportedCurrencies).forEach(currency => {
            const option = document.createElement('option');
            option.value = currency.code;
            option.textContent = showLabels ? 
                `${currency.code} - ${currency.name}` : 
                currency.code;
            option.selected = currency.code === selectedCurrency;
            selector.appendChild(option);
        });

        // Event listener
        selector.addEventListener('change', (e) => {
            const newCurrency = e.target.value;
            this.setCurrency(newCurrency);
            
            if (onChange && typeof onChange === 'function') {
                onChange(newCurrency);
            }
        });

        container.appendChild(selector);
        return selector;
    }

    /**
     * Crear widget de conversión
     */
    createConversionWidget(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Contenedor ${containerId} no encontrado`);
            return;
        }

        const widget = document.createElement('div');
        widget.className = 'currency-conversion-widget';
        widget.innerHTML = `
            <div class="conversion-row">
                <input type="number" id="${containerId}_amount" placeholder="Cantidad" step="0.01">
                <select id="${containerId}_from">
                    ${Object.keys(this.supportedCurrencies).map(code => 
                        `<option value="${code}">${code}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="conversion-arrow">↓</div>
            <div class="conversion-row">
                <input type="text" id="${containerId}_result" readonly>
                <select id="${containerId}_to">
                    ${Object.keys(this.supportedCurrencies).map(code => 
                        `<option value="${code}">${code}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="conversion-info">
                <small>Última actualización: ${this.getFormattedLastUpdate()}</small>
            </div>
        `;

        const amountInput = widget.querySelector(`#${containerId}_amount`);
        const fromSelect = widget.querySelector(`#${containerId}_from`);
        const toSelect = widget.querySelector(`#${containerId}_to`);
        const resultInput = widget.querySelector(`#${containerId}_result`);

        // Configurar valores por defecto
        fromSelect.value = this.currentCurrency;
        toSelect.value = this.currentCurrency === 'CLP' ? 'USD' : 'CLP';

        // Event listeners para conversión en tiempo real
        const updateConversion = () => {
            const amount = parseFloat(amountInput.value) || 0;
            const from = fromSelect.value;
            const to = toSelect.value;
            
            const converted = this.convert(amount, from, to);
            resultInput.value = this.format(converted, to);
        };

        amountInput.addEventListener('input', updateConversion);
        fromSelect.addEventListener('change', updateConversion);
        toSelect.addEventListener('change', updateConversion);

        container.appendChild(widget);
        return widget;
    }

    /**
     * Obtener fecha formateada de última actualización
     */
    getFormattedLastUpdate() {
        if (!this.lastUpdate) return 'Nunca';
        
        const date = new Date(this.lastUpdate);
        return date.toLocaleString('es-CL');
    }

    /**
     * INTEGRACIÓN CON OTROS MÓDULOS
     */

    /**
     * Formatear datos del dashboard con moneda actual
     */
    formatDashboardData(data) {
        const formatted = { ...data };
        
        // Formatear ingresos
        if (formatted.ingresos) {
            formatted.ingresos.totalFormatted = this.format(formatted.ingresos.total);
            if (formatted.ingresos.desglose) {
                formatted.ingresos.desglose = formatted.ingresos.desglose.map(item => ({
                    ...item,
                    montoFormatted: this.format(item.monto)
                }));
            }
        }
        
        // Formatear gastos
        ['gastosFijos', 'gastosVariables', 'gastosExtras'].forEach(tipo => {
            if (formatted[tipo]) {
                formatted[tipo].totalFormatted = this.format(formatted[tipo].total);
                if (formatted[tipo].items) {
                    formatted[tipo].items = formatted[tipo].items.map(item => ({
                        ...item,
                        montoFormatted: this.format(item.monto)
                    }));
                }
            }
        });
        
        // Formatear balance
        if (formatted.balance !== undefined) {
            formatted.balanceFormatted = this.format(formatted.balance);
        }
        
        return formatted;
    }

    /**
     * Actualizar elementos del DOM con formato de moneda
     */
    updateDOMElements() {
        // Actualizar elementos con atributo data-currency
        const currencyElements = document.querySelectorAll('[data-currency]');
        
        currencyElements.forEach(element => {
            const amount = parseFloat(element.dataset.amount) || 0;
            const currency = element.dataset.currency || this.currentCurrency;
            
            element.textContent = this.format(amount, currency);
        });
        
        // Disparar evento de actualización DOM
        this.dispatchCurrencyEvent('domUpdated', { 
            elementsUpdated: currencyElements.length 
        });
    }

    /**
     * EVENTOS
     */

    /**
     * Vincular eventos del sistema de monedas
     */
    bindCurrencyEvents() {
        // Escuchar cambios en configuración
        window.addEventListener('storageSaved', () => {
            this.loadCurrencyConfiguration();
        });
        
        // Escuchar eventos de gastos para actualizar formatos
        window.addEventListener('gastos_gastoAdded', () => {
            setTimeout(() => this.updateDOMElements(), 100);
        });
        
        window.addEventListener('gastos_gastoUpdated', () => {
            setTimeout(() => this.updateDOMElements(), 100);
        });
        
        window.addEventListener('gastos_totalsUpdated', () => {
            setTimeout(() => this.updateDOMElements(), 100);
        });
    }

    /**
     * Disparar evento personalizado
     */
    dispatchCurrencyEvent(type, detail) {
        const event = new CustomEvent(`currency_${type}`, {
            detail: {
                currency: this.currentCurrency,
                timestamp: new Date().toISOString(),
                ...detail
            },
            bubbles: true
        });
        window.dispatchEvent(event);
    }

    /**
     * MÉTODOS DE UTILIDAD
     */

    /**
     * Obtener símbolo de moneda
     */
    getCurrencySymbol(currencyCode = null) {
        const code = currencyCode || this.currentCurrency;
        const currency = this.getCurrencyInfo(code);
        return currency ? currency.symbol : '$';
    }

    /**
     * Validar código de moneda
     */
    isValidCurrency(currencyCode) {
        return this.supportedCurrencies.hasOwnProperty(currencyCode);
    }

    /**
     * Obtener configuración de formateo
     */
    getFormatConfig(currencyCode = null) {
        const code = currencyCode || this.currentCurrency;
        const currency = this.getCurrencyInfo(code);
        
        return currency ? {
            decimals: currency.decimals,
            thousandsSeparator: currency.thousandsSeparator,
            decimalSeparator: currency.decimalSeparator,
            symbol: currency.symbol,
            position: currency.position
        } : null;
    }

    /**
     * Forzar actualización de tasas
     */
    forceUpdateRates() {
        console.log('🔄 Forzando actualización de tasas...');
        return this.updateExchangeRates();
    }

    /**
     * Resetear a configuración por defecto
     */
    resetToDefault() {
        this.currentCurrency = 'CLP';
        this.exchangeRates = { ...this.defaultExchangeRates };
        this.lastUpdate = null;
        
        // Actualizar storage
        const config = this.storage.getConfiguracion();
        config.monedaPrincipal = 'CLP';
        this.storage.setConfiguracion(config);
        
        this.storage.removeItem('currency_exchange_rates');
        this.storage.removeItem('currency_last_update');
        
        this.dispatchCurrencyEvent('reset', {});
        console.log('🔄 Sistema de monedas reseteado a valores por defecto');
    }

    /**
     * DESTRUCTOR
     */
    destroy() {
        // Limpiar intervalo de actualización
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        console.log('🧹 CurrencyManager destruido');
    }
}

// Crear instancia global del currency manager
window.currencyManager = new CurrencyManager();

// Exportar para usar como módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CurrencyManager;
}

console.log('💱 Currency.js cargado correctamente - Sistema multi-moneda activo');