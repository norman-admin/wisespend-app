/**
 * CONVERSOR-MONEDAS.JS - Lógica para Conversor de Monedas Chile
 * Control de Gastos Familiares - v1.1.0 CORREGIDO
 * 
 * 🔧 CORRECCIONES APLICADAS:
 * ✅ Formato de moneda chilena (CLP) corregido
 * ✅ Función getMontoNumerico() arreglada para formato chileno
 * ✅ Cálculos de conversión optimizados
 * ✅ Auto-conversión mejorada
 * ✅ Formato de números con puntos como separadores de miles
 * ✅ Encoding de caracteres corregido
 */

class ConversorMonedas {
    constructor() {
        // Tipos de cambio base (actualizables)
        this.exchangeRates = {
            USD: 965,      // CLP por USD
            UF: 39475,     // CLP por UF  
            UTM: 69265     // CLP por UTM
        };
        
        this.init();
    }

    init() {
    this.bindEvents();
    this.updateRatesDisplay();
    this.updateQuickConversions();
    // Convertir automáticamente con valores por defecto
    setTimeout(() => this.convertir(), 100);
    
    // NUEVO: Foco automático en el primer campo
    setTimeout(() => {
        const primerCampo = document.getElementById('montoOrigen');
        if (primerCampo) {
            primerCampo.focus();
            primerCampo.select(); // Selecciona el texto para reemplazarlo fácilmente
        }
    }, 200);
}

    bindEvents() {
        // Event listeners para conversión automática
        const inputs = ['montoOrigen', 'monedaOrigen', 'monedaDestino'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const eventType = element.tagName === 'SELECT' ? 'change' : 'input';
                element.addEventListener(eventType, () => this.convertir());
            }
        });

        // Botón convertir
        const btnConvertir = document.querySelector('.convert-btn');
        if (btnConvertir) {
            btnConvertir.addEventListener('click', () => this.convertir());
        }
    }

    /**
     * 🔧 FUNCIÓN CORREGIDA: Formatear moneda según tipo
     */
    formatCurrency(amount, currency = 'CLP') {
        if (currency === 'CLP') {
            return new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        } else if (currency === 'USD') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(amount);
        } else if (currency === 'UF') {
            return `${parseFloat(amount).toFixed(4)} UF`;
        } else if (currency === 'UTM') {
            return `${parseFloat(amount).toFixed(4)} UTM`;
        }
        
        return amount.toString();
    }

    /**
     * 🔧 FUNCIÓN CORREGIDA: Formatear números con separadores chilenos
     */
    formatNumber(amount) {
        return new Intl.NumberFormat('es-CL', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * 🔧 FUNCIÓN CORREGIDA: Obtener valor numérico desde input con formato chileno
     */
    getMontoNumerico(inputId) {
        const input = document.getElementById(inputId);
        if (input && input.value) {
            // Eliminar todos los caracteres que no sean números, comas o puntos
            let cleanValue = input.value.replace(/[^\d.,]/g, '');
            
            // Si hay puntos y comas, manejar formato chileno (puntos = miles, coma = decimales)
            if (cleanValue.includes('.') && cleanValue.includes(',')) {
                // Formato: 1.000.000,50 -> 1000000.50
                cleanValue = cleanValue.replace(/\./g, '').replace(',', '.');
            } else if (cleanValue.includes('.') && !cleanValue.includes(',')) {
                // Si solo hay puntos, podrían ser miles o decimales
                const parts = cleanValue.split('.');
                if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
                    // Es formato de miles: 1.000.000 -> 1000000
                    cleanValue = cleanValue.replace(/\./g, '');
                }
                // Si es 1000.50 se mantiene como decimal
            } else if (cleanValue.includes(',')) {
                // Solo coma = decimal: 1000,50 -> 1000.50
                cleanValue = cleanValue.replace(',', '.');
            }
            
            return parseFloat(cleanValue) || 0;
        }
        return 0;
    }

    /**
     * 🔧 FUNCIÓN PRINCIPAL CORREGIDA: Realizar conversión
     */
    convertir() {
        const monto = this.getMontoNumerico('montoOrigen');
        const monedaOrigen = document.getElementById('monedaOrigen')?.value || 'CLP';
        const monedaDestino = document.getElementById('monedaDestino')?.value || 'USD';

        console.log(`Convirtiendo: ${monto} ${monedaOrigen} -> ${monedaDestino}`);

        if (monto <= 0) {
            this.updateElement('montoDestino', '0');
            return;
        }

        // Si las monedas son iguales, no hay conversión
        if (monedaOrigen === monedaDestino) {
            const resultadoFormateado = this.formatearResultado(monto, monedaDestino);
            this.updateElement('montoDestino', resultadoFormateado);
            return;
        }

        // Convertir a CLP primero si no es CLP
        let montoEnCLP = monto;
        if (monedaOrigen !== 'CLP') {
            montoEnCLP = monto * this.exchangeRates[monedaOrigen];
        }

        // Convertir de CLP a moneda destino
        let resultado = montoEnCLP;
        if (monedaDestino !== 'CLP') {
            resultado = montoEnCLP / this.exchangeRates[monedaDestino];
        }

        // Formatear resultado según la moneda
        const resultadoFormateado = this.formatearResultado(resultado, monedaDestino);
        this.updateElement('montoDestino', resultadoFormateado);

        console.log(`Resultado: ${resultadoFormateado}`);
    }

    /**
     * 🔧 FUNCIÓN CORREGIDA: Formatear resultado según moneda
     */
formatearResultado(amount, currency) {
    if (currency === 'CLP') {
        return '$' + this.formatNumber(Math.round(amount));
    } else if (currency === 'USD') {
        return '$' + parseFloat(amount).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else if (currency === 'UF') {
        return '🏛️ ' + parseFloat(amount).toFixed(4);
    } else if (currency === 'UTM') {
        return '📋 ' + parseFloat(amount).toFixed(4);
    }
    return amount.toString();
}
    /**
     * 🔧 FUNCIÓN CORREGIDA: Intercambiar monedas
     */
    intercambiarMonedas() {
        const monedaOrigen = document.getElementById('monedaOrigen');
        const monedaDestino = document.getElementById('monedaDestino');
        const montoOrigen = document.getElementById('montoOrigen');
        const montoDestino = document.getElementById('montoDestino');

        if (monedaOrigen && monedaDestino && montoOrigen && montoDestino) {
            // Intercambiar monedas
            const tempMoneda = monedaOrigen.value;
            monedaOrigen.value = monedaDestino.value;
            monedaDestino.value = tempMoneda;

            // Intercambiar montos
            const tempMonto = montoOrigen.value;
            montoOrigen.value = montoDestino.value;
            montoDestino.value = tempMonto;

            // Reconvertir
            this.convertir();
        }
    }

    /**
     * 🔧 FUNCIÓN CORREGIDA: Actualizar display de tipos de cambio
     */
    updateRatesDisplay() {
        // Actualizar display de tipos de cambio con formato CLP
        this.updateElement('rate-USD', `$${this.formatNumber(this.exchangeRates.USD)}`);
        this.updateElement('rate-UF', `$${this.formatNumber(this.exchangeRates.UF)}`);
        this.updateElement('rate-UTM', `$${this.formatNumber(this.exchangeRates.UTM)}`);
    }

    /**
     * 🔧 FUNCIÓN CORREGIDA: Actualizar conversiones rápidas
     */
    updateQuickConversions() {
        // Conversiones rápidas con cálculos precisos
        const conversions = {
            'quick-100k-usd': Math.round(100000 / this.exchangeRates.USD),
            'quick-1m-usd': Math.round(1000000 / this.exchangeRates.USD),
            'quick-1uf-clp': this.exchangeRates.UF,
            'quick-1utm-clp': this.exchangeRates.UTM
        };

        Object.entries(conversions).forEach(([id, value]) => {
            if (id.includes('usd')) {
                this.updateElement(id, `≈ $${value.toLocaleString('en-US')} USD`);
            } else {
                this.updateElement(id, `≈ $${this.formatNumber(value)} CLP`);
            }
        });
    }

    /**
     * Actualizar elemento del DOM
     */
     updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        // Si es un input, usar .value, si no, usar .textContent
        if (element.tagName === 'INPUT') {
            element.value = value;
        } else {
            element.textContent = value;
        }
    }
}

    /**
     * 🔧 MÉTODO MEJORADO: Actualizar tipos de cambio
     */
    async actualizarTiposCambio() {
        try {
            // Aquí se podría integrar una API real
            // Por ahora usamos valores fijos actualizables
            console.log('Tipos de cambio actualizados (valores fijos)');
            this.updateRatesDisplay();
            this.updateQuickConversions();
            this.convertir();
        } catch (error) {
            console.error('Error actualizando tipos de cambio:', error);
        }
    }

    /**
     * Método para cambiar tipos de cambio manualmente
     */
    setExchangeRate(currency, rate) {
        if (this.exchangeRates.hasOwnProperty(currency)) {
            this.exchangeRates[currency] = rate;
            this.updateRatesDisplay();
            this.updateQuickConversions();
            this.convertir();
            console.log(`Tipo de cambio ${currency} actualizado a: ${rate}`);
        }
    }
}

/**
 * 🔧 FUNCIÓN CORREGIDA: Manejar navegación del formulario
 */
function handleFormNavigation(event, nextFieldId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        if (nextFieldId === 'btnConvertir') {
            // Si es el último campo, convertir y volver al inicio
            document.getElementById('btnConvertir').click();
            setTimeout(() => {
                const primerCampo = document.getElementById('montoOrigen');
                if (primerCampo) {
                    primerCampo.focus();
                    primerCampo.select();
                }
            }, 100);
        } else {
            // Navegar al siguiente campo
            const nextField = document.getElementById(nextFieldId);
            if (nextField) {
                nextField.focus();
            }
        }
    }
}

/**
 * 🔧 FUNCIÓN CORREGIDA: Formatear input numérico con formato chileno
 */
function formatNumberInput(input) {
    // Obtener solo números y puntos/comas
    let value = input.value.replace(/[^\d.,]/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    // Separar parte entera y decimal
    let parts = value.split(',');
    let integerPart = parts[0];
    let decimalPart = parts[1];
    
    // Remover puntos de la parte entera (por si acaso)
    integerPart = integerPart.replace(/\./g, '');
    
    // Formatear parte entera con puntos como separadores de miles
    if (integerPart.length > 3) {
        integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    // Reconstruir el valor
    if (decimalPart !== undefined) {
        // Limitar decimales a 2 dígitos
        decimalPart = decimalPart.substring(0, 2);
        input.value = integerPart + ',' + decimalPart;
    } else {
        input.value = integerPart;
    }
}

/**
 * 🔧 FUNCIÓN MEJORADA: Inicializar el conversor
 */
function initConversorMonedas() {
    if (typeof ConversorMonedas !== 'undefined') {
        window.conversorMonedas = new ConversorMonedas();
        console.log('✅ Conversor de Monedas v1.1.0 inicializado correctamente');
        
        // Exponer métodos para debugging y actualizaciones manuales
        window.conversorDebug = {
            setUSD: (rate) => window.conversorMonedas.setExchangeRate('USD', rate),
            setUF: (rate) => window.conversorMonedas.setExchangeRate('UF', rate),
            setUTM: (rate) => window.conversorMonedas.setExchangeRate('UTM', rate),
            getCurrentRates: () => window.conversorMonedas.exchangeRates,
            updateRates: () => window.conversorMonedas.actualizarTiposCambio(),
            testConversion: (amount, from, to) => {
                document.getElementById('montoOrigen').value = amount;
                document.getElementById('monedaOrigen').value = from;
                document.getElementById('monedaDestino').value = to;
                window.conversorMonedas.convertir();
            }
        };
        
        console.log('🔧 Debug disponible: window.conversorDebug');
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConversorMonedas);
} else {
    initConversorMonedas();
}

console.log('💱 conversor-monedas.js v1.1.0 CORREGIDO cargado');