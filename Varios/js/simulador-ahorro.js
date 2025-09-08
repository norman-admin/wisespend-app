/**
 * SIMULADOR-AHORRO.JS - Lógica para Simulador de Ahorro
 * Control de Gastos Familiares - v1.0.0
 */

class SimuladorAhorro {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        // Simular automáticamente con valores por defecto
        setTimeout(() => this.simularAhorro(), 100);
    }

    bindEvents() {
        // Event listeners para cálculo automático
        const inputs = ['metaAhorro', 'ahorroMensual', 'tasaInteres', 'ahorroInicial'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const eventType = element.type === 'number' ? 'input' : 'input';
                element.addEventListener(eventType, () => this.simularAhorro());
            }
        });

        // Botón simular
        const btnSimular = document.querySelector('.simulate-btn');
        if (btnSimular) {
            btnSimular.addEventListener('click', () => this.simularAhorro());
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    simularAhorro() {
        // Obtener valores del formulario
        const meta = this.getMontoNumerico('metaAhorro');
        const ahorroMensual = this.getMontoNumerico('ahorroMensual');
        const tasaAnual = parseFloat(document.getElementById('tasaInteres')?.value) || 0;
        const ahorroInicial = this.getMontoNumerico('ahorroInicial');

        if (meta <= 0 || ahorroMensual <= 0) {
            this.mostrarError('Por favor ingresa valores válidos para la meta y ahorro mensual');
            return;
        }

        if (ahorroInicial >= meta) {
            this.mostrarError('El ahorro inicial no puede ser mayor o igual a la meta');
            return;
        }

        // Calcular tasa mensual
        const tasaMensual = tasaAnual / 100 / 12;

        // Calcular tiempo para alcanzar la meta y proyección
        const resultado = this.calcularProyeccion(meta, ahorroMensual, tasaMensual, ahorroInicial);

        this.mostrarResultados(resultado);
    }

    calcularProyeccion(meta, ahorroMensual, tasaMensual, ahorroInicial) {
        let saldoActual = ahorroInicial;
        let mes = 0;
        let totalIntereses = 0;
        const proyeccion = [];
        const maxMeses = 600; // Máximo 50 años

        // Calcular mes a mes hasta alcanzar la meta
        while (saldoActual < meta && mes < maxMeses) {
            mes++;
            
            // Calcular intereses del mes
            const interesesMes = saldoActual * tasaMensual;
            
            // Agregar ahorro mensual
            saldoActual += ahorroMensual;
            
            // Agregar intereses
            saldoActual += interesesMes;
            totalIntereses += interesesMes;

            // Guardar proyección para los primeros 12 meses
            if (mes <= 12) {
                proyeccion.push({
                    mes: mes,
                    ahorroMensual: ahorroMensual,
                    intereses: interesesMes,
                    saldoAcumulado: saldoActual
                });
            }
        }

        // Calcular estadísticas finales
        const capitalPropio = ahorroInicial + (ahorroMensual * mes);
        const porcentajeRendimiento = capitalPropio > 0 ? ((totalIntereses / capitalPropio) * 100) : 0;

        return {
            tiempoMeses: mes,
            totalAhorrado: saldoActual,
            totalIntereses: totalIntereses,
            capitalPropio: capitalPropio,
            porcentajeRendimiento: porcentajeRendimiento,
            proyeccion: proyeccion,
            metaAlcanzada: saldoActual >= meta
        };
    }

    mostrarResultados(resultado) {
        // Formatear tiempo
        const años = Math.floor(resultado.tiempoMeses / 12);
        const meses = resultado.tiempoMeses % 12;
        let tiempoTexto = '';
        
        if (años > 0) {
            tiempoTexto += `${años} año${años !== 1 ? 's' : ''}`;
            if (meses > 0) {
                tiempoTexto += ` y ${meses} mes${meses !== 1 ? 'es' : ''}`;
            }
        } else {
            tiempoTexto = `${meses} mes${meses !== 1 ? 'es' : ''}`;
        }

        // Actualizar elementos de resultados
        this.updateElement('tiempoMeta', tiempoTexto);
        this.updateElement('totalAhorrado', this.formatCurrency(resultado.totalAhorrado));
        this.updateElement('totalIntereses', this.formatCurrency(resultado.totalIntereses));
        this.updateElement('capitalPropio', this.formatCurrency(resultado.capitalPropio));
        this.updateElement('porcentajeRendimiento', resultado.porcentajeRendimiento.toFixed(1) + '%');

        // Generar tabla de proyección
        this.generarTablaProyeccion(resultado.proyeccion);

        // Mostrar sección de resultados
        this.toggleVisibility('placeholder', false);
        this.toggleVisibility('resultados', true);
    }

    generarTablaProyeccion(proyeccion) {
        const tbody = document.getElementById('tablaProyeccion');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        proyeccion.forEach(fila => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>Mes ${fila.mes}</strong></td>
                <td>${this.formatCurrency(fila.ahorroMensual)}</td>
                <td>${this.formatCurrency(fila.intereses)}</td>
                <td><strong>${this.formatCurrency(fila.saldoAcumulado)}</strong></td>
            `;
            tbody.appendChild(tr);
        });
    }

    getMontoNumerico(inputId) {
        const input = document.getElementById(inputId);
        if (input) {
            return parseInt(input.value.replace(/[^\d]/g, '')) || 0;
        }
        return 0;
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    toggleVisibility(id, show) {
        const element = document.getElementById(id);
        if (element) element.style.display = show ? 'block' : 'none';
    }

    mostrarError(mensaje) {
        // Ocultar resultados y mostrar error
        this.toggleVisibility('resultados', false);
        this.toggleVisibility('placeholder', true);
        
        const placeholder = document.getElementById('placeholder');
        if (placeholder) {
            placeholder.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #ef4444;">
                    <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                    <div style="font-size: 16px;">${mensaje}</div>
                </div>
            `;
        }
    }
}

// Función para manejar navegación del formulario
function handleFormNavigation(event, nextFieldId) {
    if (event.key === 'Enter') {
        event.preventDefault();
        
        // Si es el último campo, simular
        if (nextFieldId === 'btnSimular') {
            document.getElementById('btnSimular').click();
        } else {
            // Navegar al siguiente campo
            const nextField = document.getElementById(nextFieldId);
            if (nextField) {
                nextField.focus();
            }
        }
    }
}

// Función para formatear input de moneda
function formatCurrencyInput(input) {
    // Obtener solo números
    let value = input.value.replace(/[^\d]/g, '');
    
    if (value === '') {
        input.value = '';
        return;
    }
    
    // Convertir a número y formatear
    const number = parseInt(value);
    const formatted = new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
    
    input.value = formatted;
}

// Función global para inicializar el simulador
function initSimuladorAhorro() {
    if (typeof SimuladorAhorro !== 'undefined') {
        window.simuladorAhorro = new SimuladorAhorro();
        console.log('✅ Simulador de Ahorro inicializado');
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimuladorAhorro);
} else {
    initSimuladorAhorro();
}

console.log('💰 simulador-ahorro.js v1.0.0 cargado');