/**
 * PERIOD-SELECTOR.JS - Navegador de Períodos para Header
 * WiseSpend - Opción A
 * Versión: 1.0.0
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
        console.log('📅 Inicializando Period Selector...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        // Cachear elementos
        this.cacheElements();
        
        if (!this.elements.selector) {
            console.warn('⚠️ Elementos del selector de período no encontrados');
            return;
        }
        
        // Obtener período actual
        this.loadCurrentPeriod();
        
        // Cargar períodos disponibles
        this.loadAvailablePeriods();
        
        // Configurar eventos
        this.setupEvents();
        
        console.log('✅ Period Selector inicializado');
    }
    
    cacheElements() {
        this.elements.selector = document.getElementById('periodSelector');
        this.elements.periodText = document.getElementById('periodText');
        this.elements.dropdown = document.getElementById('periodDropdown');
        this.elements.periodsList = document.getElementById('periodsList');
        this.elements.prevBtn = document.getElementById('prevMonthBtn');
        this.elements.nextBtn = document.getElementById('nextMonthBtn');
        this.elements.dropdownToggle = document.getElementById('dropdownToggle');
    }
    
    loadCurrentPeriod() {
        // Obtener período actual (formato: 2025-10)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        this.currentPeriod = `${year}-${month}`;
        
        // Actualizar display
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
            this.elements.periodText.textContent = this.formatPeriodLabel(this.currentPeriod);
        }
    }
    
    renderPeriodsList() {
        if (!this.elements.periodsList) return;
        
        const html = this.availablePeriods.map(period => `
            <div class="period-item ${period.isCurrent ? 'active' : ''}" data-period="${period.value}">
                <span>${period.label}</span>
                ${period.isCurrent ? '<span class="period-item-badge">Actual</span>' : ''}
            </div>
        `).join('');
        
        this.elements.periodsList.innerHTML = html;
    }
    
    setupEvents() {
        // Toggle dropdown
        if (this.elements.selector) {
            this.elements.selector.addEventListener('click', (e) => {
                if (!e.target.closest('.arrow-btn')) {
                    this.toggleDropdown();
                }
            });
        }
        
        // Botones de navegación
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changePeriod(-1);
            });
        }
        
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.changePeriod(1);
            });
        }
        
        // Click en items del dropdown
        if (this.elements.periodsList) {
            this.elements.periodsList.addEventListener('click', (e) => {
                const item = e.target.closest('.period-item');
                if (item) {
                    const period = item.dataset.period;
                    this.selectPeriod(period);
                }
            });
        }
        
        // Cerrar dropdown al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.period-navigator')) {
                this.closeDropdown();
            }
        });
    }
    
    toggleDropdown() {
        const isOpen = this.elements.dropdown.classList.contains('show');
        
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        this.elements.dropdown.classList.add('show');
        this.elements.selector.classList.add('open');
    }
    
    closeDropdown() {
        this.elements.dropdown.classList.remove('show');
        this.elements.selector.classList.remove('open');
    }
    
    changePeriod(delta) {
        const [year, month] = this.currentPeriod.split('-').map(Number);
        const date = new Date(year, month - 1 + delta, 1);
        
        const newYear = date.getFullYear();
        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newPeriod = `${newYear}-${newMonth}`;
        
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
        
        // TODO: Aquí filtrarás los datos por período
        console.log(`📅 Período cambiado a: ${period}`);
    }
    
    dispatchPeriodChangeEvent() {
        const event = new CustomEvent('periodChanged', {
            detail: {
                period: this.currentPeriod,
                formatted: this.formatPeriodLabel(this.currentPeriod)
            }
        });
        window.dispatchEvent(event);
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
    window.periodSelector = new PeriodSelector();
}

console.log('📅 period-selector.js v1.0.0 cargado');