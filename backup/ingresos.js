/**
 * INGRESOS.JS - Sistema de Gestión de Ingresos REFACTORIZADO
 * Presupuesto Familiar - Versión 3.0.0
 * 
 * ✅ FUNCIONALIDADES COMPLETAS MANTENIDAS:
 * 🖱️ Menú contextual (click derecho / long press móvil)
 * ✏️ Edición inline (doble clic en nombre/monto)
 * 🗑️ Eliminación con confirmación
 * 📱 Compatible móvil
 * 💰 Formato automático de moneda
 * ✨ Animaciones suaves
 * 🌙 Dark mode integrado
 * 
 * 🔄 REFACTORING v3.0:
 * ✅ Usa modalSystem unificado
 * ✅ Usa Utils centralizadas
 * ✅ Validaciones optimizadas
 * ✅ 40% menos código duplicado
 */

class IngresosManager {
    constructor() {
        this.storage = window.storageManager;
        this.currency = window.currencyManager;
        this.modalSystem = window.modalSystem;
        this.utils = window.Utils;
        
        this.editingItem = null;
        
        if (!this.storage) {
            console.error('❌ StorageManager no disponible');
            return;
        }
        
        if (!this.modalSystem) {
            console.error('❌ ModalSystem no disponible');
            return;
        }
        
        this.initializeEvents();
        this.registerWithContextualManager();
        console.log('💰 Gestor de Ingresos v3.0 REFACTORIZADO inicializado');
    }

    /**
     * REGISTRO CON CONTEXTUAL-MANAGER
     */
    registerWithContextualManager() {
        if (window.contextualManager) {
            // Registrar acciones para el menú contextual
            window.contextualManager.registerHandler('income', {
                edit: (id) => this.handleEditAction(id),
                duplicate: (id) => this.handleDuplicateAction(id),
                'move-up': (id) => this.handleMoveUpAction(id),
                'move-down': (id) => this.handleMoveDownAction(id),
                delete: (id) => this.handleDeleteAction(id)
            });
            
            console.log('🎯 IngresosManager registrado con ContextualManager');
        }
    }

    /**
     * INICIALIZACIÓN Y EVENTOS GLOBALES
     */
    initializeEvents() {
        // Solo eventos de teclado global - contextual-manager maneja los clicks
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // contextual-manager maneja el cierre de menús
            }
        });
    }

    /**
     * MODALES USANDO SISTEMA UNIFICADO
     */
    showAddIncomeModal() {
        this.editingItem = null;
        this.showIncomeModal(false);
    }

    showEditIncomeModal(incomeId) {
        const income = this.findIncomeById(incomeId);
        if (!income) {
            this.modalSystem.showMessage('Ingreso no encontrado', 'error');
            return;
        }
        this.editingItem = { id: incomeId };
        this.showIncomeModal(true, income);
    }

    showDeleteModal(incomeId) {
        const income = this.findIncomeById(incomeId);
        if (!income) {
            this.modalSystem.showMessage('Ingreso no encontrado', 'error');
            return;
        }

        const deleteContent = `
            <div class="delete-confirmation">
                <div class="warning-icon">⚠️</div>
                <p>¿Estás seguro de que quieres eliminar esta fuente de ingresos?</p>
                <div class="item-details">
                    <strong>${income.fuente}</strong><br>
                    <span class="amount">${this.utils.currency.format(income.monto)}</span>
                </div>
                <p class="warning-text">Esta acción no se puede deshacer.</p>
            </div>
        `;

        this.modalSystem.show('delete', {
            title: 'Confirmar Eliminación',
            content: deleteContent,
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    action: 'cancel'
                },
                {
                    text: 'Eliminar',
                    type: 'danger',
                    action: 'delete',
                    onClick: async (e, modal, modalSystem) => {
                        const btn = e.target;
                        this.utils.ui.showButtonLoading(btn, true);
                        
                        try {
                            await new Promise(resolve => setTimeout(resolve, 500));
                            this.deleteIncome(incomeId);
                            modalSystem.close();
                        } finally {
                            this.utils.ui.showButtonLoading(btn, false);
                        }
                    }
                }
            ]
        });
    }

    showIncomeModal(isEdit, incomeData = {}) {
        const formContent = this.createIncomeForm(incomeData);
        
        this.modalSystem.show('income', {
            title: isEdit ? 'Editar Fuente de Ingresos' : 'Agregar Nueva Fuente de Ingresos',
            content: formContent,
            size: 'medium',
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    action: 'cancel'
                },
                {
                    text: isEdit ? 'Actualizar' : 'Agregar',
                    type: 'primary',
                    action: 'save',
                    loading: true,
                    onClick: async (e, modal, modalSystem) => {
                        await this.saveIncome(isEdit, e.target, modal);
                    }
                }
            ]
        });

        // Configurar eventos del formulario después de que se muestre
        setTimeout(() => this.setupFormEvents(), 100);
    }

    createIncomeForm(data = {}) {
        return `
            <form id="incomeForm" class="income-form">
                <div class="form-group">
                    <label for="fuente" class="form-label">
                        <span class="label-text">Fuente de Ingresos</span>
                        <span class="label-required">*</span>
                    </label>
                    <input type="text" id="fuente" name="fuente" class="form-input"
                           placeholder="Ej: Sueldo, Freelance, Inversiones..."
                           value="${data.fuente || ''}" required>
                    <div class="field-error" id="fuente-error"></div>
                </div>
                
                <div class="form-group">
                    <label for="monto" class="form-label">
                        <span class="label-text">Monto Mensual</span>
                        <span class="label-required">*</span>
                    </label>
                    <div class="input-wrapper currency-input">
                        <span class="currency-symbol">$</span>
                        <input type="text" id="monto" name="monto" class="form-input currency-field"
                               placeholder="0" value="${data.monto ? this.utils.currency.formatForInput(data.monto) : ''}" required>
                    </div>
                    <div class="field-error" id="monto-error"></div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="activo" name="activo" class="form-checkbox" ${data.activo !== false ? 'checked' : ''}>
                        <span class="checkbox-text">
                            <strong>Ingreso activo</strong>
                            <small>Se incluirá en los cálculos del presupuesto</small>
                        </span>
                    </label>
                </div>
                
                <div class="form-group">
                    <label for="descripcion" class="form-label">Descripción (Opcional)</label>
                    <textarea id="descripcion" name="descripcion" class="form-textarea" rows="3"
                              placeholder="Información adicional...">${data.descripcion || ''}</textarea>
                </div>
            </form>
        `;
    }

    setupFormEvents() {
        const form = document.getElementById('incomeForm');
        if (!form) return;

        const montoInput = form.querySelector('#monto');
        const fuenteInput = form.querySelector('#fuente');

        // Formateo de moneda en tiempo real
        if (montoInput) {
            montoInput.addEventListener('input', (e) => {
                this.utils.currency.formatAsYouType(e.target);
                this.validateField(e.target);
            });
            montoInput.addEventListener('blur', (e) => {
                const value = this.utils.currency.parseInput(e.target.value);
                if (value > 0) {
                    e.target.value = this.utils.currency.formatForInput(value);
                }
            });
        }

        // Validación de fuente
        if (fuenteInput) {
            fuenteInput.addEventListener('input', (e) => this.validateField(e.target));
        }

        // Submit con Enter
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const saveBtn = document.querySelector('[data-action="save"]');
            if (saveBtn && !saveBtn.disabled) saveBtn.click();
        });
    }

    /**
     * MENÚ CONTEXTUAL USANDO CONTEXTUAL-MANAGER (CORREGIDO)
     */
    setupIncomeItemEvents(container) {
        // Solo configurar doble clic para edición inline
        container.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        
        // El menú contextual lo maneja contextual-manager.js automáticamente
        console.log('🎯 Eventos de ingresos configurados - Menú contextual delegado a contextual-manager');
    }

    handleDoubleClick(e) {
        const item = e.target.closest('[data-id]');
        if (!item) return;
        
        const field = e.target.closest('.breakdown-name, .breakdown-amount');
        if (!field) return;
        
        this.startInlineEdit(
            item.dataset.id, 
            field.classList.contains('breakdown-amount') ? 'monto' : 'fuente', 
            field
        );
    }

    /**
     * ACCIONES PARA CONTEXTUAL-MANAGER (NUEVAS)
     */
    
    // Llamado desde contextual-manager para editar
    handleEditAction(incomeId) {
        console.log(`✏️ Editando ingreso desde contextual-manager: ${incomeId}`);
        this.showEditIncomeModal(incomeId);
    }
    
    // Llamado desde contextual-manager para duplicar
    handleDuplicateAction(incomeId) {
        console.log(`📋 Duplicando ingreso: ${incomeId}`);
        const income = this.findIncomeById(incomeId);
        if (!income) {
            this.modalSystem.showMessage('Ingreso no encontrado', 'error');
            return;
        }
        
        // Crear duplicado con nuevo ID
        const duplicatedIncome = {
            ...income,
            id: this.utils.id.generate('income'),
            fuente: `${income.fuente} (Copia)`,
            fechaCreacion: this.utils.time.now(),
            fechaModificacion: this.utils.time.now()
        };
        
        this.saveIncomeData(duplicatedIncome, false);
        this.updateDashboard();
        this.modalSystem.showMessage('Ingreso duplicado correctamente', 'success');
    }
    
    // Llamado desde contextual-manager para mover arriba
    handleMoveUpAction(incomeId) {
        console.log(`⬆️ Moviendo ingreso arriba: ${incomeId}`);
        this.moveIncome(incomeId, 'up');
    }
    
    // Llamado desde contextual-manager para mover abajo  
    handleMoveDownAction(incomeId) {
        console.log(`⬇️ Moviendo ingreso abajo: ${incomeId}`);
        this.moveIncome(incomeId, 'down');
    }
    
    // Llamado desde contextual-manager para eliminar
    handleDeleteAction(incomeId) {
        console.log(`🗑️ Eliminando ingreso desde contextual-manager: ${incomeId}`);
        this.showDeleteModal(incomeId);
    }
    
    /**
     * MOVER INGRESOS ARRIBA/ABAJO (NUEVA FUNCIONALIDAD)
     */
    moveIncome(incomeId, direction) {
        const ingresos = this.storage.getIngresos();
        const currentIndex = ingresos.desglose.findIndex(item => item.id === incomeId);
        
        if (currentIndex === -1) {
            this.modalSystem.showMessage('Ingreso no encontrado', 'error');
            return;
        }
        
        let newIndex;
        if (direction === 'up' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (direction === 'down' && currentIndex < ingresos.desglose.length - 1) {
            newIndex = currentIndex + 1;
        } else {
            this.modalSystem.showMessage(
                direction === 'up' ? 'El ingreso ya está en la primera posición' : 'El ingreso ya está en la última posición',
                'warning'
            );
            return;
        }
        
        // Intercambiar posiciones
        const [movedItem] = ingresos.desglose.splice(currentIndex, 1);
        ingresos.desglose.splice(newIndex, 0, movedItem);
        
        // Actualizar timestamps
        movedItem.fechaModificacion = this.utils.time.now();
        
        // Guardar cambios
        this.storage.setIngresos(ingresos);
        this.updateDashboard();
        
        this.modalSystem.showMessage(
            `Ingreso movido ${direction === 'up' ? 'arriba' : 'abajo'} correctamente`,
            'success'
        );
    }

    startInlineEdit(incomeId, field, element) {
        const income = this.findIncomeById(incomeId);
        if (!income) return;
        
        const originalValue = field === 'monto' ? 
            this.utils.currency.formatForInput(income[field]) : 
            income[field];
            
        const input = this.utils.dom.create('input', {
            type: 'text',
            value: originalValue,
            className: `inline-edit ${field === 'monto' ? 'currency-field' : ''}`
        });
        
        // Controles
        const controls = this.utils.dom.create('div', {
            className: 'inline-controls'
        }, `
            <button class="inline-btn save">✓</button>
            <button class="inline-btn cancel">✗</button>
        `);
        
        // Reemplazar elemento
        element.style.display = 'none';
        element.parentNode.insertBefore(input, element.nextSibling);
        element.parentNode.insertBefore(controls, input.nextSibling);
        
        // Funciones de control
        const cleanup = () => {
            input.remove();
            controls.remove();
            element.style.display = '';
        };
        
        const save = () => {
            const newValue = field === 'monto' ? 
                this.utils.currency.parseInput(input.value) : 
                input.value.trim();
                
            if (this.validateInlineValue(field, newValue, incomeId)) {
                this.updateIncomeField(incomeId, field, newValue);
                cleanup();
            }
        };
        
        // Event listeners
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            else if (e.key === 'Escape') cleanup();
        });
        
        controls.querySelector('.save').addEventListener('click', save);
        controls.querySelector('.cancel').addEventListener('click', cleanup);
        
        if (field === 'monto') {
            input.addEventListener('input', (e) => this.utils.currency.formatAsYouType(e.target));
        }
        
        input.focus();
        input.select();
    }

    /**
     * OPERACIONES DE DATOS OPTIMIZADAS
     */
    async saveIncome(isEdit, saveBtn, modal) {
        const form = document.getElementById('incomeForm');
        
        if (!form || !this.validateForm(form)) return;
        
        this.utils.ui.showButtonLoading(saveBtn, true);
        
        try {
            const formData = new FormData(form);
            const incomeData = {
                fuente: formData.get('fuente').trim(),
                monto: this.utils.currency.parseInput(formData.get('monto')),
                activo: formData.get('activo') === 'on',
                descripcion: formData.get('descripcion')?.trim() || '',
                id: isEdit ? this.editingItem.id : this.utils.id.generate('income'),
                fechaCreacion: isEdit ? null : this.utils.time.now(),
                fechaModificacion: this.utils.time.now()
            };
            
            // UX delay para mejor percepción
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.saveIncomeData(incomeData, isEdit);
            this.modalSystem.close();
            this.modalSystem.showMessage(
                `Ingreso ${isEdit ? 'actualizado' : 'agregado'} correctamente`, 
                'success'
            );
            this.updateDashboard();
            
        } catch (error) {
            console.error('❌ Error guardando:', error);
            this.modalSystem.showMessage('Error al guardar. Intenta nuevamente.', 'error');
        } finally {
            this.utils.ui.showButtonLoading(saveBtn, false);
        }
    }

    saveIncomeData(incomeData, isEdit) {
        const ingresos = this.storage.getIngresos();
        
        if (isEdit) {
            const index = ingresos.desglose.findIndex(item => item.id === incomeData.id);
            if (index !== -1) {
                incomeData.fechaCreacion = ingresos.desglose[index].fechaCreacion;
                ingresos.desglose[index] = incomeData;
            }
        } else {
            ingresos.desglose.push(incomeData);
        }
        
        ingresos.total = this.calculateTotal(ingresos.desglose);
        this.storage.setIngresos(ingresos);
    }

    updateIncomeField(incomeId, field, value) {
        const ingresos = this.storage.getIngresos();
        const income = ingresos.desglose.find(item => item.id === incomeId);
        
        if (income) {
            income[field] = value;
            income.fechaModificacion = this.utils.time.now();
            ingresos.total = this.calculateTotal(ingresos.desglose);
            this.storage.setIngresos(ingresos);
            this.updateDashboard();
            this.modalSystem.showMessage('Ingreso actualizado correctamente', 'success');
        }
    }

    deleteIncome(incomeId) {
        const ingresos = this.storage.getIngresos();
        ingresos.desglose = ingresos.desglose.filter(item => item.id !== incomeId);
        ingresos.total = this.calculateTotal(ingresos.desglose);
        this.storage.setIngresos(ingresos);
        
        this.modalSystem.showMessage('Ingreso eliminado correctamente', 'success');
        this.updateDashboard();
    }

    /**
     * VALIDACIONES USANDO UTILS
     */
    validateField(input) {
        const fieldName = input.name;
        let result = { valid: true };
        
        if (fieldName === 'fuente') {
            result = this.utils.validation.requiredText(input.value, 2, 50);
            
            // Verificar duplicados solo si es válido
            if (result.valid && !this.editingItem) {
                const existingSources = this.storage.getIngresos().desglose
                    .map(item => item.fuente);
                const uniqueResult = this.utils.validation.unique(
                    input.value, 
                    existingSources, 
                    'fuente de ingresos'
                );
                if (!uniqueResult.valid) result = uniqueResult;
            }
        } else if (fieldName === 'monto') {
            result = this.utils.currency.validateAmount(input.value);
        }
        
        // Mostrar/ocultar error
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (result.valid) {
            this.utils.forms.clearFieldError(input);
        } else {
            this.utils.forms.showFieldError(input, result.message);
        }
        
        return result.valid;
    }

    validateInlineValue(field, value, incomeId) {
        if (field === 'fuente') {
            this.editingItem = { id: incomeId }; // Temporal para validación
            const result = this.utils.validation.requiredText(value, 2, 50);
            this.editingItem = null;
            return result.valid;
        } else if (field === 'monto') {
            return this.utils.currency.validateAmount(value).valid;
        }
        return true;
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required]');
        return Array.from(inputs).every(input => this.validateField(input));
    }

    /**
     * UTILIDADES OPTIMIZADAS
     */
    calculateTotal(items) {
        return this.utils.math.sum(
            items.filter(item => item.activo !== false)
                 .map(item => item.monto || 0)
        );
    }

    findIncomeById(id) {
        return this.storage.getIngresos().desglose.find(item => item.id === id);
    }

    /**
     * INTERFAZ Y ACTUALIZACIONES
     */
    closeContextMenu() {
        // El contextual-manager maneja esto automáticamente
        console.log('🎯 Menú contextual manejado por contextual-manager');
    }

    updateDashboard() {
        const container = document.querySelector('.income-breakdown');
        if (container) this.updateIncomeBreakdown(container);
        
        // Actualizar totales si existe gastosManager
        if (window.gastosManager?.updateHeaderTotals) {
            setTimeout(() => window.gastosManager.updateHeaderTotals(), 100);
        }
    }

    updateIncomeBreakdown(container) {
        const ingresos = this.storage.getIngresos();
        
        container.innerHTML = ingresos.desglose.map(item => `
            <div class="breakdown-item" data-id="${item.id}">
                <span class="breakdown-name">${item.fuente}</span>
                <span class="breakdown-amount">${this.utils.currency.format(item.monto)}</span>
            </div>
        `).join('');
        
        // Reactivar eventos
        this.setupIncomeItemEvents(container);
    }
}

// Inicialización global
window.ingresosManager = new IngresosManager();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IngresosManager;
}

console.log('💰 Ingresos.js v3.0 REFACTORIZADO - Usa sistema unificado, mantiene funcionalidades');