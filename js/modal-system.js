/**
 * 🎭 MODAL-SYSTEM.JS - Sistema Universal de Modales CON SOPORTE ENTER KEY
 * Control de Gastos Familiares - Versión 1.2.0 UNIFICADO
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ API unificada para todos los modales
 * ✅ Validaciones automáticas
 * ✅ Animaciones suaves
 * ✅ Soporte móvil completo
 * ✅ Gestión de estados avanzada
 * ✅ Compatible con todos los módulos
 * 🆕 SOPORTE ENTER KEY UNIVERSAL
 * 🆕 Formularios HTML reales con submit
 * 🆕 Doble funcionalidad: Enter + Clic en botón
 * 🔧 INTEGRACIÓN UNIFICADA CON HEADER
 */

class ModalSystem {
    constructor() {
        this.currentModal = null;
        this.modalStack = [];
        this.config = {
            closeOnEscape: true,
            closeOnBackdropClick: true,
            showCloseButton: true,
            animation: true,
            submitOnEnter: true // 🆕 Nuevo: Activar submit con Enter
        };
        
        this.initializeSystem();
        console.log('🎭 ModalSystem v1.2.0 inicializado - UNIFICADO CON HEADER');
    }

    /**
     * INICIALIZACIÓN
     */
    initializeSystem() {
        this.setupGlobalEvents();
        this.injectStyles();
    }

    setupGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.config.closeOnEscape) {
                this.close();
            }
        });
    }

    /**
     * API PRINCIPAL - MOSTRAR MODAL - UNIFICADO
     */
    show(type, config = {}) {
        const modalConfig = {
            title: '',
            content: '',
            size: 'medium', // small, medium, large, fullscreen
            buttons: [],
            onSave: null,
            onCancel: null,
            beforeClose: null,
            ...config
        };

        this.removeExistingModal();
        const modal = this.createModal(modalConfig);
        
        // 🆕 Guardar config en el modal para acceso posterior
        modal._config = modalConfig;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        this.modalStack.push(modal);
        
        this.setupModalEvents(modal, modalConfig);
        this.showModal(modal);
        
        // 🆕 CONFIGURAR SOPORTE DE ENTER KEY
        this.setupFormSubmitHandlers(modal, modalConfig);
        
        // 🔧 CONTROL UNIFICADO DE HEADER Y MODALES
        document.body.classList.add('modal-active');

        // Gestión de focus simplificada
        setTimeout(() => {
            // Blur del header
            const headerButton = document.getElementById('userMenuButton');
            if (headerButton) {
                headerButton.blur();
            }
            
            // Focus al modal
            const firstInput = modal.querySelector('input[type="text"], input[type="password"], textarea');
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }, 150);
        
        return modal;
    }

    /**
     * 🆕 NUEVO: CONFIGURAR SUBMIT CON ENTER KEY
     */
    setupFormSubmitHandlers(modal, config) {
        if (!this.config.submitOnEnter) return;

        const form = modal.querySelector('form');
        const inputs = modal.querySelectorAll('input, textarea, select');
        const primaryButton = modal.querySelector('.btn-primary[data-action="save"], .btn-primary[data-action="submit"]');

        // Configurar form submit si existe un formulario real
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (primaryButton && !primaryButton.disabled) {
                    this.triggerPrimaryAction(primaryButton, modal, config);
                }
            });
        }

        // Configurar Enter key en inputs individuales
        inputs.forEach(input => {
            // Solo en campos de texto, no en textarea (permite salto de línea)
            if (input.tagName.toLowerCase() !== 'textarea') {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        
                        // Validar el formulario antes de enviar
                        if (this.validateCurrentForm(modal)) {
                            if (primaryButton && !primaryButton.disabled) {
                                this.triggerPrimaryAction(primaryButton, modal, config);
                            }
                        }
                    }
                });
            }
        });

        console.log('✅ Enter key configurado para modal');
    }

    /**
     * 🆕 NUEVO: ACTIVAR ACCIÓN PRIMARIA
     */
    triggerPrimaryAction(button, modal, config) {
        console.log('⚡ Activando acción primaria del modal...');
        
        // Verificar si el botón tiene un onClick personalizado
        const buttonConfig = config.buttons?.find(btn => 
            btn.action === button.getAttribute('data-action')
        );

        if (buttonConfig && buttonConfig.onClick) {
            buttonConfig.onClick(new Event('click'), modal, this);
        } else {
            // Trigger click event nativo del botón
            button.click();
        }
    }

    /**
     * 🆕 NUEVO: VALIDAR FORMULARIO ACTUAL
     */
    validateCurrentForm(modal) {
        const form = modal.querySelector('form');
        if (!form) return true;

        return this.validateForm(form);
    }

    /**
     * CREAR ESTRUCTURA DEL MODAL
     */
    createModal(config) {
        const modal = document.createElement('div');
        modal.className = `modal-overlay modern-overlay ${config.size}`;
        
        modal.innerHTML = `
            <div class="modal-content modern-modal">
                ${this.createHeader(config)}
                ${this.createBody(config)}
                ${this.createFooter(config)}
            </div>
        `;

        return modal;
    }

    createHeader(config) {
        if (!config.title && !this.config.showCloseButton) return '';
        
        return `
            <div class="modal-header modal-header-modern">
                ${config.title ? `<h2>${config.title}</h2>` : ''}
                ${config.subtitle ? `<p class="modal-subtitle">${config.subtitle}</p>` : ''}
                ${this.config.showCloseButton ? `
                    <button class="modal-close modal-close-modern" type="button" data-action="close">
                        ×
                    </button>
                ` : ''}
            </div>
        `;
    }

    createBody(config) {
        return `
            <div class="modal-body modal-body-modern">
                ${config.content || ''}
            </div>
        `;
    }

    createFooter(config) {
        if (!config.buttons || config.buttons.length === 0) return '';
        
        const buttonsHTML = config.buttons.map(btn => `
            <button type="${btn.action === 'save' || btn.action === 'submit' ? 'submit' : 'button'}" 
                    class="btn btn-${btn.type || 'secondary'} ${btn.className || ''}" 
                    data-action="${btn.action}"
                    ${btn.disabled ? 'disabled' : ''}>
                <span class="button-text">${btn.text}</span>
                ${btn.loading ? '<div class="button-spinner" style="display: none;"><div class="spinner"></div></div>' : ''}
            </button>
        `).join('');

        return `
            <div class="modal-footer modal-footer-modern">
                ${buttonsHTML}
            </div>
        `;
    }

    /**
     * CONFIGURAR EVENTOS - CORREGIDO PARA CLICS INTERNOS
     */
    setupModalEvents(modal, config) {
        // Cerrar modal
        modal.querySelectorAll('[data-action="close"], [data-action="cancel"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (config.onCancel) config.onCancel();
                this.close();
            });
        });

        // Backdrop click - MEJORADO para permitir clics internos
        if (this.config.closeOnBackdropClick) {
            modal.addEventListener('click', (e) => {
                // Solo cerrar si el clic es exactamente en el overlay, no en contenido interno
                if (e.target === modal) {
                    this.close();
                }
            });
        }

        // 🆕 PREVENIR PROPAGACIÓN EN CONTENIDO INTERNO
        const modalContent = modal.querySelector('.modal-content, .modern-modal');
        if (modalContent) {
            modalContent.addEventListener('click', (e) => {
                // Permitir que todos los clics internos funcionen normalmente
                e.stopPropagation();
            });
        }

        // 🆕 ASEGURAR QUE LOS INPUTS SIEMPRE RESPONDAN A CLICS
        const inputs = modal.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('click', (e) => {
                // Asegurar que el input reciba el focus al hacer clic
                e.stopPropagation();
                input.focus();
            });
            
            // También manejar mousedown para casos edge
            input.addEventListener('mousedown', (e) => {
                e.stopPropagation();
            });
        });

        // Botones personalizados
        config.buttons?.forEach(btnConfig => {
            const btn = modal.querySelector(`[data-action="${btnConfig.action}"]`);
            if (btn && btnConfig.onClick) {
                btn.addEventListener('click', (e) => {
                    btnConfig.onClick(e, modal, this);
                });
            }
        });

        // Auto-focus
        const firstInput = modal.querySelector('input, button, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * MOSTRAR/OCULTAR MODALES
     */
    showModal(modal) {
        if (this.config.animation) {
            modal.style.opacity = '0';
            modal.style.transform = 'scale(0.9)';
            
            requestAnimationFrame(() => {
                modal.style.transition = 'all 0.3s ease';
                modal.style.opacity = '1';
                modal.style.transform = 'scale(1)';
            });
        }
    }

    /**
     * CERRAR MODAL - UNIFICADO
     */
    close(modal = null) {
        const targetModal = modal || this.currentModal;
        if (!targetModal) return;

        // Ejecutar beforeClose si existe
        const modalConfig = targetModal._config;
        if (modalConfig?.beforeClose && !modalConfig.beforeClose()) {
            return; // Cancelar cierre
        }

        if (this.config.animation) {
            targetModal.style.transition = 'all 0.3s ease';
            targetModal.style.opacity = '0';
            targetModal.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                this.removeModal(targetModal);
            }, 300);
        } else {
            this.removeModal(targetModal);
        }
    }

    /**
     * REMOVER MODAL - UNIFICADO CON HEADER
     */
    removeModal(modal) {
        if (modal && modal.parentNode) {
            modal.remove();
        }
        
        this.modalStack = this.modalStack.filter(m => m !== modal);
        this.currentModal = this.modalStack[this.modalStack.length - 1] || null;
        
        // 🔧 LIMPIAR ESTADO MODAL SI NO HAY MÁS MODALES
        if (this.modalStack.length === 0) {
            document.body.classList.remove('modal-active');
            
            // Reactivar header completamente
            const headerButton = document.getElementById('userMenuButton');
            if (headerButton) {
                headerButton.removeAttribute('tabindex');
                headerButton.style.pointerEvents = '';
            }
        }
    }

    removeExistingModal() {
        if (this.currentModal) {
            this.removeModal(this.currentModal);
        }
    }

    /**
     * MÉTODOS DE CONVENIENCIA
     */
    
    /**
     * Modal de confirmación
     */
    confirm(message, title = '¿Confirmar acción?') {
        return new Promise((resolve) => {
            this.show('confirm', {
                title: title,
                content: `<p>${message}</p>`,
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'secondary',
                        action: 'cancel',
                        onClick: () => {
                            resolve(false);
                            this.close();
                        }
                    },
                    {
                        text: 'Confirmar',
                        type: 'primary',
                        action: 'confirm',
                        onClick: () => {
                            resolve(true);
                            this.close();
                        }
                    }
                ]
            });
        });
    }

    /**
     * Modal de alerta
     */
    alert(message, title = 'Información') {
        return new Promise((resolve) => {
            this.show('alert', {
                title: title,
                content: `<p>${message}</p>`,
                buttons: [
                    {
                        text: 'Entendido',
                        type: 'primary',
                        action: 'ok',
                        onClick: () => {
                            resolve(true);
                            this.close();
                        }
                    }
                ]
            });
        });
    }

    /**
     * Modal de formulario genérico - 🆕 MEJORADO CON FORM REAL
     */
    form(config) {
        const formId = 'modal-form-' + Date.now();
        
        // 🆕 Crear formulario HTML real para soporte de Enter
        const formHTML = `
            <form id="${formId}" class="modal-form" novalidate>
                ${config.fields.map(field => this.createFormField(field)).join('')}
            </form>
        `;

        return new Promise((resolve, reject) => {
            this.show('form', {
                title: config.title || 'Formulario',
                content: formHTML,
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'secondary',
                        action: 'cancel',
                        onClick: () => {
                            resolve(null);
                            this.close();
                        }
                    },
                    {
                        text: config.submitText || 'Guardar',
                        type: 'primary',
                        action: 'submit',
                        onClick: () => {
                            const form = document.getElementById(formId);
                            if (this.validateForm(form)) {
                                const formData = new FormData(form);
                                const data = Object.fromEntries(formData.entries());
                                resolve(data);
                                this.close();
                            }
                        }
                    }
                ]
            });
        });
    }

    /**
     * UTILIDADES DE FORMULARIO
     */
    createFormField(field) {
        const { type, name, label, required, placeholder, value = '', options = [] } = field;
        
        let inputHTML = '';
        
        switch (type) {
            case 'text':
            case 'number':
            case 'email':
                inputHTML = `
                    <input type="${type}" 
                           name="${name}" 
                           class="input-modern" 
                           placeholder="${placeholder || ''}"
                           value="${value}"
                           ${required ? 'required' : ''}>
                `;
                break;
                
            case 'textarea':
                inputHTML = `
                    <textarea name="${name}" 
                              class="input-modern" 
                              placeholder="${placeholder || ''}"
                              rows="3"
                              ${required ? 'required' : ''}>${value}</textarea>
                `;
                break;
                
            case 'select':
                inputHTML = `
                    <select name="${name}" class="input-modern" ${required ? 'required' : ''}>
                        ${options.map(opt => `
                            <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;
                
            case 'checkbox':
                inputHTML = `
                    <input type="checkbox" 
                           name="${name}" 
                           ${value ? 'checked' : ''}>
                `;
                break;
        }

        return `
            <div class="form-group-modern">
                <label class="form-label-modern">
                    ${label}${required ? ' <span class="required">*</span>' : ''}
                </label>
                <div class="input-wrapper-modern">
                    ${inputHTML}
                </div>
                <div class="field-error" id="${name}-error"></div>
            </div>
        `;
    }

    /**
     * VALIDACIÓN DE FORMULARIOS - 🆕 MEJORADO
     */
    validateForm(form) {
        if (!form) return true;
        
        let isValid = true;
        const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        // Limpiar errores previos
        form.querySelectorAll('.field-error').forEach(error => {
            error.textContent = '';
            error.style.display = 'none';
        });
        
        form.querySelectorAll('.input-error').forEach(input => {
            input.classList.remove('input-error');
        });

        fields.forEach(field => {
            const value = field.value.trim();
            const fieldName = field.name;
            const errorElement = form.querySelector(`#${fieldName}-error`);
            
            if (!value) {
                this.showFieldError(field, errorElement, 'Este campo es requerido');
                isValid = false;
            } else if (field.type === 'email' && !this.isValidEmail(value)) {
                this.showFieldError(field, errorElement, 'Email inválido');
                isValid = false;
            } else if (field.type === 'number' && isNaN(parseFloat(value))) {
                this.showFieldError(field, errorElement, 'Debe ser un número válido');
                isValid = false;
            }
        });

        // Scroll al primer error
        if (!isValid) {
            const firstError = form.querySelector('.input-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
        }

        return isValid;
    }

    /**
     * 🆕 NUEVO: MOSTRAR ERROR EN CAMPO
     */
    showFieldError(field, errorElement, message) {
        field.classList.add('input-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * 🆕 NUEVO: VALIDAR EMAIL
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Mostrar mensaje de éxito/error
     */
    showMessage(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * UTILIDADES PÚBLICAS
     */
    isModalOpen() {
        return this.currentModal !== null;
    }

    getConfig() {
        return { ...this.config };
    }

    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * INYECTAR ESTILOS CSS - MEJORADO
     */
    injectStyles() {
        if (document.querySelector('#modal-system-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modal-system-styles';
        styles.textContent = `
            /* Modal Overlay */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 99999;
                padding: 20px;
            }
            
            .modern-modal {
                background: white;
                border-radius: 12px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
                max-width: 90vw;
                max-height: 90vh;
                overflow: hidden;
                width: 100%;
            }
            
            .modal-overlay.small .modern-modal { max-width: 400px; }
            .modal-overlay.medium .modern-modal { max-width: 600px; }
            .modal-overlay.large .modern-modal { max-width: 800px; }
            .modal-overlay.fullscreen .modern-modal { max-width: 95vw; max-height: 95vh; }
            
            /* Modal Header */
            .modal-header-modern {
                padding: 24px 24px 20px;
                border-bottom: 1px solid #e5e7eb;
                position: relative;
            }
            
            .modal-header-modern h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
                color: #111827;
            }
            
            .modal-subtitle {
                margin: 4px 0 0 0;
                color: #6b7280;
                font-size: 14px;
            }
            
            .modal-close-modern {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                line-height: 1;
            }
            
            .modal-close-modern:hover {
                color: #374151;
            }
            
            /* Modal Body */
            .modal-body-modern {
                padding: 24px;
                max-height: 60vh;
                overflow-y: auto;
            }
            
            /* Modal Footer */
            .modal-footer-modern {
                padding: 20px 24px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                background: #f9fafb;
            }
            
            /* Form Styles */
            .modal-form {
                width: 100%;
            }
            
            .form-group-modern {
                margin-bottom: 20px;
            }
            
            .form-label-modern {
                display: block;
                margin-bottom: 6px;
                font-weight: 500;
                color: #374151;
                font-size: 14px;
            }
            
            .required {
                color: #ef4444;
            }
            
            .input-wrapper-modern {
                position: relative;
            }
            
            .currency-symbol {
                position: absolute;
                left: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
                font-weight: 500;
                z-index: 1;
            }
            
            .input-modern {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid #d1d5db;
                border-radius: 8px;
                font-size: 14px;
                transition: all 0.2s ease;
                background: white;
            }
            
            .currency-symbol + .input-modern {
                padding-left: 36px;
            }
            
            .input-modern:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .input-error {
                border-color: #ef4444 !important;
                box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
            }
            
            .field-error {
                margin-top: 4px;
                color: #ef4444;
                font-size: 12px;
                display: none;
            }
            
            /* Button Styles */
            .btn {
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
                display: inline-flex;
                align-items: center;
                gap: 8px;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-secondary {
                background: #f3f4f6;
                color: #374151;
                border-color: #d1d5db;
            }
            
            .btn-secondary:hover {
                background: #e5e7eb;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
            }
            
            .btn-danger:hover {
                background: #dc2626;
            }
            
            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
            
            /* Toast Notifications */
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                z-index: 10000;
            }
            
            .toast.show {
                transform: translateX(0);
            }
            
            .toast-success {
                background: #10b981;
            }
            
            .toast-error {
                background: #ef4444;
            }
            
            .toast-info {
                background: #3b82f6;
            }
            
            /* Loading Spinner */
            .button-spinner {
                display: inline-flex;
                align-items: center;
            }
            
            .spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            
            /* UNIFICACIÓN CON HEADER - MODAL ACTIVE STATE */
            body.modal-active .user-menu-wrapper,
            body.modal-active #userMenuButton {
                pointer-events: none !important;
                opacity: 0.7 !important;
                transition: opacity 0.2s ease !important;
            }

            body.modal-active .user-dropdown-menu {
                display: none !important;
            }

            /* Asegurar que los inputs del modal funcionen */
            .modal-overlay input,
            .modal-overlay textarea,
            .modal-overlay select,
            .modal-overlay button {
                pointer-events: auto !important;
                opacity: 1 !important;
            }
            
            /* Responsive */
            @media (max-width: 640px) {
                .modal-overlay {
                    padding: 10px;
                }
                
                .modal-header-modern {
                    padding: 20px 20px 16px;
                }
                
                .modal-body-modern {
                    padding: 20px;
                }
                
                .modal-footer-modern {
                    padding: 16px 20px 20px;
                    flex-direction: column;
                }
                
                .btn {
                    width: 100%;
                    justify-content: center;
                }
            }
        `;
        
        document.head.appendChild(styles);
        console.log('✅ Estilos del modal inyectados - UNIFICADOS CON HEADER');
    }
}

// Inicialización global
window.modalSystem = new ModalSystem();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalSystem;
}

console.log('🎭 Modal-system.js v1.2.0 cargado - SISTEMA UNIFICADO CON HEADER');