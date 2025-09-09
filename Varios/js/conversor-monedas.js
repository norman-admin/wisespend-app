/**
 * CONVERSOR-MONEDAS.JS - Lógica para Conversor de Monedas Chile
 * Control de Gastos Familiares - v1.0.0
 */

class ConversorMonedas {
    constructor() {
        // Tipos de cambio base (actualizables)
        this.exchangeRates = {
            USD: 850,      // CLP por USD
            UF: 37500,     // CLP por UF  
            UTM: 65000     // CLP por UTM
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateRatesDisplay();
        this.updateQuickConversions();
        // Convertir automáticamente con valores por defecto
        setTimeout(() => this.convertir(), 100);
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

    formatNumber(amount) {
        return new Intl.NumberFormat('es-CL').format(amount);
    }

    getMontoNumerico(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            return parseFloat(input.value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
        }
        return 0;
    }

    convertir() {
        const monto = this.getMontoNumerico('montoOrigen');
        const monedaOrigen = document.getElementById('monedaOrigen')?.value || 'CLP';
        const monedaDestino = document.getElementById('monedaDestino')?.value || 'USD';

        if (monto <= 0) {
            this.updateElement('montoDestino', '0');
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
    }

    formatearResultado(amount, currency) {
        if (currency === 'CLP') {
            return this.formatNumber(Math.round(amount));
        } else if (currency === 'USD') {
            return parseFloat(amount).toFixed(2);
        } else if (currency === 'UF' || currency === 'UTM') {
            return parseFloat(amount).toFixed(4);
        }
        return amount.toString();
    }

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

    updateRatesDisplay() {
        // Actualizar display de tipos de cambio
        this.updateElement('rate-USD', this.formatCurrency(this.exchangeRates.USD));
        this.updateElement('rate-UF', this.formatCurrency(this.exchangeRates.UF));
        this.updateElement('rate-UTM', this.formatCurrency(this.exchangeRates.UTM));
    }

    updateQuickConversions() {
        // Conversiones rápidas
        const conversions = {
            'quick-100k-usd': (100000 / this.exchangeRates.USD).toFixed(0),
            'quick-1m-usd': (1000000 / this.exchangeRates.USD).toFixed(0),
            'quick-1uf-clp': this.formatNumber(this.exchangeRates.UF),
            'quick-1utm-clp': this.formatNumber(this.exchangeRates.UTM)
        };

        Object.entries(conversions).forEach(([id, value]) => {
            if (id.includes('usd')) {
                this.updateElement(id, `≈ $${value} USD`);
            } else {
                this.updateElement(id, `≈ $${value} CLP`);
            }
        });
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    // Método para actualizar tipos de cambio (futuro: API)
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

    // Método para cambiar tipos de cambio manualmente
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

// Función para manejar navegación del formulario
function handleFormNavigation(event, nextFieldId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        // Si es el último campo, convertir
        if (nextFieldId === 'btnConvertir') {
            document.getElementById('btnConvertir').click();
        } else {
            // Navegar al siguiente campo
            const nextField = document.getElementById(nextFieldId);
            if (nextField) {
                nextField.focus();
            }
        }
    }
}

// Función para formatear input numérico
function formatNumberInput(input) {
    // Obtener solo números y puntos decimales
    let value = input.value.replace(/[^\d.,]/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    // Reemplazar coma por punto para decimales
    value = value.replace(',', '.');
    
    // Formatear con separadores de miles
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    if (parts[1] !== undefined) {
        input.value = parts[0] + ',' + parts[1];
    } else {
        input.value = parts[0];
    }
}

// Función global para inicializar el conversor
function initConversorMonedas() {
    if (typeof ConversorMonedas !== 'undefined') {
        window.conversorMonedas = new ConversorMonedas();
        console.log('✅ Conversor de Monedas inicializado');
        
        // Exponer métodos para debugging y actualizaciones manuales
        window.conversorDebug = {
            setUSD: (rate) => window.conversorMonedas.setExchangeRate('USD', rate),
            setUF: (rate) => window.conversorMonedas.setExchangeRate('UF', rate),
            setUTM: (rate) => window.conversorMonedas.setExchangeRate('UTM', rate),
            getCurrentRates: () => window.conversorMonedas.exchangeRates,
            updateRates: () => window.conversorMonedas.actualizarTiposCambio()
        };
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConversorMonedas);
} else {
    initConversorMonedas();
}

console.log('💱 conversor-monedas.js v1.0.0 cargado');