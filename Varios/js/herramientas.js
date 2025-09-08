/**
 * HERRAMIENTAS.JS - Lógica para Herramientas Financieras
 * Control de Gastos Familiares - v1.0.0
 */

class CalculadoraCreditos {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        // Calcular automáticamente con valores por defecto
        setTimeout(() => this.calcularCredito(), 100);
    }

    bindEvents() {
        // Event listeners para cálculo automático
        const inputs = ['montoCredito', 'tasaInteres', 'plazoMeses', 'sistemaAmortizacion'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const eventType = element.tagName === 'SELECT' ? 'change' : 'input';
                element.addEventListener(eventType, () => this.calcularCredito());
            }
        });

        // Botón calcular
        const btnCalcular = document.querySelector('.calculate-btn');
        if (btnCalcular) {
            btnCalcular.addEventListener('click', () => this.calcularCredito());
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    calcularCredito() {
        // Obtener valores del formulario
        const monto = parseFloat(document.getElementById('montoCredito')?.value) || 0;
        const tasaAnual = parseFloat(document.getElementById('tasaInteres')?.value) || 0;
        const plazo = parseInt(document.getElementById('plazoMeses')?.value) || 0;
        const sistema = document.getElementById('sistemaAmortizacion')?.value || 'frances';

        if (monto <= 0 || tasaAnual <= 0 || plazo <= 0) {
            this.mostrarError('Por favor ingresa valores válidos');
            return;
        }

        // Calcular tasa mensual
        const tasaMensual = tasaAnual / 100 / 12;

        let cuotaMensual, totalPagar, totalIntereses;
        let tablaAmortizacion = [];

        if (sistema === 'frances') {
            const resultado = this.calcularSistemaFrances(monto, tasaMensual, plazo);
            cuotaMensual = resultado.cuotaMensual;
            totalPagar = resultado.totalPagar;
            totalIntereses = resultado.totalIntereses;
            tablaAmortizacion = resultado.tablaAmortizacion;
        } else {
            const resultado = this.calcularSistemaAleman(monto, tasaMensual, plazo);
            cuotaMensual = resultado.cuotaMensual;
            totalPagar = resultado.totalPagar;
            totalIntereses = resultado.totalIntereses;
            tablaAmortizacion = resultado.tablaAmortizacion;
        }

        this.mostrarResultados(cuotaMensual, totalPagar, totalIntereses, tasaAnual, monto, tablaAmortizacion);
    }

    calcularSistemaFrances(monto, tasaMensual, plazo) {
        // Sistema Francés (cuotas fijas)
        const cuotaMensual = monto * (tasaMensual * Math.pow(1 + tasaMensual, plazo)) / (Math.pow(1 + tasaMensual, plazo) - 1);
        const totalPagar = cuotaMensual * plazo;
        const totalIntereses = totalPagar - monto;

        // Generar tabla de amortización (primeras 6 cuotas)
        const tablaAmortizacion = [];
        let saldo = monto;
        
        for (let i = 1; i <= Math.min(6, plazo); i++) {
            const interes = saldo * tasaMensual;
            const capital = cuotaMensual - interes;
            saldo = Math.max(0, saldo - capital);

            tablaAmortizacion.push({
                cuota: i,
                capital: capital,
                interes: interes,
                cuotaTotal: cuotaMensual,
                saldo: saldo
            });
        }

        return { cuotaMensual, totalPagar, totalIntereses, tablaAmortizacion };
    }

    calcularSistemaAleman(monto, tasaMensual, plazo) {
        // Sistema Alemán (capital fijo)
        const capitalFijo = monto / plazo;
        const tablaAmortizacion = [];
        let saldo = monto;
        let totalPagar = 0;

        // Generar tabla para las primeras 6 cuotas
        for (let i = 1; i <= Math.min(6, plazo); i++) {
            const interes = saldo * tasaMensual;
            const cuotaTotal = capitalFijo + interes;
            saldo = Math.max(0, saldo - capitalFijo);

            tablaAmortizacion.push({
                cuota: i,
                capital: capitalFijo,
                interes: interes,
                cuotaTotal: cuotaTotal,
                saldo: saldo
            });
        }

        // Calcular total real para todo el plazo
        saldo = monto;
        for (let i = 1; i <= plazo; i++) {
            const interes = saldo * tasaMensual;
            totalPagar += capitalFijo + interes;
            saldo -= capitalFijo;
        }

        const cuotaMensual = tablaAmortizacion[0]?.cuotaTotal || 0;
        const totalIntereses = totalPagar - monto;

        return { cuotaMensual, totalPagar, totalIntereses, tablaAmortizacion };
    }

    mostrarResultados(cuotaMensual, totalPagar, totalIntereses, tasaAnual, monto, tablaAmortizacion) {
        // Actualizar elementos de resultados
        this.updateElement('cuotaMensual', this.formatCurrency(cuotaMensual));
        this.updateElement('totalPagar', this.formatCurrency(totalPagar));
        this.updateElement('totalIntereses', this.formatCurrency(totalIntereses));
        this.updateElement('porcentajeIntereses', ((totalIntereses / monto) * 100).toFixed(1) + '%');
        this.updateElement('caeAproximado', (tasaAnual + 2).toFixed(1) + '%');

        // Generar tabla de amortización
        this.generarTablaAmortizacion(tablaAmortizacion);

        // Mostrar sección de resultados
        this.toggleVisibility('placeholder', false);
        this.toggleVisibility('resultados', true);
    }

    generarTablaAmortizacion(tablaAmortizacion) {
        const tbody = document.getElementById('tablaAmortizacion');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        tablaAmortizacion.forEach(fila => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${fila.cuota}</td>
                <td>${this.formatCurrency(fila.capital)}</td>
                <td>${this.formatCurrency(fila.interes)}</td>
                <td><strong>${this.formatCurrency(fila.cuotaTotal)}</strong></td>
                <td>${this.formatCurrency(fila.saldo)}</td>
            `;
            tbody.appendChild(tr);
        });
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

// Función global para inicializar la calculadora
function initCalculadoraCreditos() {
    if (typeof CalculadoraCreditos !== 'undefined') {
        window.calculadoraCreditos = new CalculadoraCreditos();
        console.log('✅ Calculadora de Créditos inicializada');
    }
}

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculadoraCreditos);
} else {
    initCalculadoraCreditos();
}

console.log('📊 herramientas.js v1.0.0 cargado');