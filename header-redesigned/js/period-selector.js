/**
 * PERIOD-SELECTOR.JS - Navegador de Períodos para Header
 * WiseSpend - Opción A
 * Versión: 1.0.1 - FIX para dropdown y mes actual
 */

class PeriodSelector {
    constructor() {
        this.currentPeriod = null;
        this.availablePeriods = [];
        
        this.elements = {
            selector: null,
            periodText: null,
            dropdown: null,
            periodsList: null,
            prevBtn: null,
            nextBtn: null,
            dropdownToggle: null
        };
        
        this.init();
    }
    
    async init() {
        console.log('📅 Inicializando Period Selector v1.0.1...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            // Pequeño delay para asegurar que el HTML esté renderizado
            setTimeout(() => this.setup(), 100);
        }
    }
    
    setup() {
        console.log('🔧 Setup iniciando...');
        
        // Cachear elementos
        this.cacheElements();
        
        if (!this.elements.selector) {
            console.warn('⚠️ Elementos del selector de período no encontrados, reintentando en 500ms...');
            setTimeout(() => this.setup(), 500);
            return;
        }
        
        // Obtener período actual
        this.loadCurrentPeriod();
        
        // Cargar períodos disponibles
        this.loadAvailablePeriods();
        
        // Configurar eventos
        this.setupEvents();
        
        console.log('✅ Period Selector inicializado correctamente');
        console.log('📅 Mes actual:', this.formatPeriodLabel(this.currentPeriod));
    }
    
    cacheElements() {
        this.elements.selector = document.getElementById('periodSelector');
        this.elements.periodText = document.getElementById('periodText');
        this.elements.dropdown = document.getElementById('periodDropdown');
        this.elements.periodsList = document.getElementById('periodsList');
        this.elements.prevBtn = document.getElementById('prevMonthBtn');
        this.elements.nextBtn = document.getElementById('nextMonthBtn');
        this.elements.dropdownToggle = document.getElementById('dropdownToggle');
        
        console.log('📦 Elementos cacheados:', {
            selector: !!this.elements.selector,
            periodText: !!this.elements.periodText,
            dropdown: !!this.elements.dropdown,
            periodsList: !!this.elements.periodsList
        });
    }
    
    loadCurrentPeriod() {
        // Obtener período actual (formato: 2025-10)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        this.currentPeriod = `${year}-${month}`;
        
        console.log('📅 Período actual establecido:', this.currentPeriod);
        
        // Actualizar display inmediatamente
        this.updateDisplay();
    }
    
    loadAvailablePeriods() {
        // Generar últimos 12 meses y próximos 6 meses
        const periods = [];
        const now = new Date();
        
        for (let i = -12; i <= 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const period = `${year}-${month}`;
            
            periods.push({
                value: period,
                label: this.formatPeriodLabel(period),
                isCurrent: period === this.currentPeriod
            });
        }
        
        this.availablePeriods = periods;
        console.log(`📋 ${periods.length} períodos cargados`);
        
        // Renderizar lista
        this.renderPeriodsList();
    }
    
    formatPeriodLabel(period) {
        const [year, month] = period.split('-');
        const months = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return `${months[parseInt(month) - 1]} ${year}`;
    }
    
    updateDisplay() {
        if (this.elements.periodText) {
            const formattedPeriod = this.formatPeriodLabel(this.currentPeriod);
            this.elements.periodText.textContent = formattedPeriod;
            console.log('✅ Display actualizado:', formattedPeriod);
        } else {
            console.warn('⚠️ periodText element no disponible');
        }
    }
    
    renderPeriodsList() {
        if (!this.elements.periodsList) {
            console.warn('⚠️ periodsList element no disponible');
            return;
        }
        
        const html = this.availablePeriods.map(period => `
            <div class="period-item ${period.isCurrent ? 'active' : ''}" data-period="${period.value}">
                <span>${period.label}</span>
                ${period.isCurrent ? '<span class="period-item-badge">Actual</span>' : ''}
            </div>
        `).join('');
        
        this.elements.periodsList.innerHTML = html;
        console.log('✅ Lista de períodos renderizada');
    }
    
    setupEvents() {
        console.log('🎧 Configurando eventos...');
        
        // Toggle dropdown - Click en el selector completo
        if (this.elements.selector) {
            this.elements.selector.addEventListener('click', (e) => {
                // No toggle si se clickeó un botón de flecha
                if (!e.target.closest('.arrow-btn')) {
                    console.log('🖱️ Click en selector, toggling dropdown');
                    this.toggleDropdown();
                }
            });
            console.log('✅ Evento selector configurado');
        }
        
        // Botones de navegación
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('◀ Mes anterior');
                this.changePeriod(-1);
            });
            console.log('✅ Botón prev configurado');
        }
        
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log('▶ Mes siguiente');
                this.changePeriod(1);
            });
            console.log('✅ Botón next configurado');
        }
        
        // Click en items del dropdown
        if (this.elements.periodsList) {
            this.elements.periodsList.addEventListener('click', (e) => {
                const item = e.target.closest('.period-item');
                if (item) {
                    const period = item.dataset.period;
                    console.log('📅 Período seleccionado:', period);
                    this.selectPeriod(period);
                }
            });
            console.log('✅ Eventos de items de dropdown configurados');
        }
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.period-navigator')) {
                this.closeDropdown();
            }
        });
        console.log('✅ Evento click outside configurado');
        
        console.log('🎧 Todos los eventos configurados correctamente');
    }
    
    toggleDropdown() {
        const isOpen = this.elements.dropdown.classList.contains('show');
        
        console.log('🔄 Toggle dropdown, estaba:', isOpen ? 'abierto' : 'cerrado');
        
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        if (!this.elements.dropdown || !this.elements.selector) {
            console.warn('⚠️ No se pueden abrir dropdown, elementos faltantes');
            return;
        }
        
        console.log('📂 Abriendo dropdown...');
        this.elements.dropdown.classList.add('show');
        this.elements.selector.classList.add('open');
        console.log('✅ Dropdown abierto');
    }
    
    closeDropdown() {
        if (!this.elements.dropdown || !this.elements.selector) {
            return;
        }
        
        console.log('📁 Cerrando dropdown...');
        this.elements.dropdown.classList.remove('show');
        this.elements.selector.classList.remove('open');
    }
    
    changePeriod(delta) {
        const [year, month] = this.currentPeriod.split('-').map(Number);
        const date = new Date(year, month - 1 + delta, 1);
        
        const newYear = date.getFullYear();
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newPeriod = `${newYear}-${newMonth}`;
        
        console.log(`📅 Cambiando período de ${this.currentPeriod} a ${newPeriod}`);
        this.selectPeriod(newPeriod);
    }
    
    selectPeriod(period) {
        this.currentPeriod = period;
        this.updateDisplay();
        this.closeDropdown();
        
        // Actualizar "active" en la lista
        this.availablePeriods.forEach(p => p.isCurrent = p.value === period);
        this.renderPeriodsList();
        
        // Disparar evento personalizado
        this.dispatchPeriodChangeEvent();
        
        console.log(`✅ Período cambiado a: ${this.formatPeriodLabel(period)}`);
    }
    
    dispatchPeriodChangeEvent() {
        const event = new CustomEvent('periodChanged', {
            detail: {
                period: this.currentPeriod,
                formatted: this.formatPeriodLabel(this.currentPeriod)
            }
        });
        window.dispatchEvent(event);
        console.log('📡 Evento periodChanged dispatched');
    }
    
    // API Pública
    getCurrentPeriod() {
        return this.currentPeriod;
    }
    
    setPeriod(period) {
        this.selectPeriod(period);
    }
}

// Inicialización global
if (typeof window !== 'undefined') {
    // Esperar un momento antes de inicializar para asegurar que el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.periodSelector = new PeriodSelector();
        });
    } else {
        // Si el DOM ya está listo, inicializar con un pequeño delay
        setTimeout(() => {
            window.periodSelector = new PeriodSelector();
        }, 100);
    }
}

console.log('📅 period-selector.js v1.0.1 (FIXED) cargado');