/**
 * 🎭 MODAL-SYSTEM.JS - Sistema Universal de Modales
 * Control de Gastos Familiares - Versión 1.0.0
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ API unificada para todos los modales
 * ✅ Validaciones automáticas
 * ✅ Animaciones suaves
 * ✅ Soporte móvil completo
 * ✅ Gestión de estados avanzada
 * ✅ Compatible con todos los módulos
 */

class ModalSystem {
    constructor() {
        this.currentModal = null;
        this.modalStack = [];
        this.config = {
            closeOnEscape: true,
            closeOnBackdropClick: true,
            showCloseButton: true,
            animation: true
        };
        
        this.initializeSystem();
        console.log('🎭 ModalSystem inicializado');
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
     * API PRINCIPAL - MOSTRAR MODAL
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
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        this.modalStack.push(modal);
        
        this.setupModalEvents(modal, modalConfig);
        this.showModal(modal);
        
        return modal;
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
            <button type="button" 
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
     * CONFIGURAR EVENTOS
     */
    setupModalEvents(modal, config) {
        // Cerrar modal
        modal.querySelectorAll('[data-action="close"], [data-action="cancel"]').forEach(btn => {
            btn.addEventListener('click', () => {
                if (config.onCancel) config.onCancel();
                this.close();
            });
        });

        // Backdrop click
        if (this.config.closeOnBackdropClick) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close();
            });
        }

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

    removeModal(modal) {
        if (modal && modal.parentNode) {
            modal.remove();
        }
        
        this.modalStack = this.modalStack.filter(m => m !== modal);
        this.currentModal = this.modalStack[this.modalStack.length - 1] || null;
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
     * Modal de formulario genérico
     */
    form(config) {
        const formId = 'modal-form-' + Date.now();
        
        const formHTML = `
            <form id="${formId}" class="modal-form">
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
                    ${type === 'number' ? '<span class="input-icon">💰</span>' : ''}
                    ${inputHTML}
                </div>
            </div>
        `;
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.style.borderColor = '#ef4444';
                isValid = false;
            } else {
                field.style.borderColor = '';
            }
        });
        
        return isValid;
    }

    /**
     * GESTIÓN DE ESTADOS
     */
    toggleButtonLoading(button, loading) {
        if (!button) return;
        
        const text = button.querySelector('.button-text');
        const spinner = button.querySelector('.button-spinner');
        
        button.disabled = loading;
        if (text) text.style.display = loading ? 'none' : 'inline';
        if (spinner) spinner.style.display = loading ? 'flex' : 'none';
    }

    /**
     * SISTEMA DE MENSAJES
     */
    showMessage(message, type = 'info', duration = 4000) {
        // Remover mensaje anterior
        document.querySelector('.modal-message')?.remove();
        
        const messageEl = document.createElement('div');
        messageEl.className = `modal-message modal-message-${type}`;
        messageEl.textContent = message;
        
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
            zIndex: '10001',
            backgroundColor: colors[type] || colors.info,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        document.body.appendChild(messageEl);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            messageEl.style.transform = 'translateX(0)';
        });
        
        // Auto-remover
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.style.transform = 'translateX(100%)';
                setTimeout(() => messageEl.remove(), 300);
            }
        }, duration);
    }

    /**
     * INYECTAR ESTILOS CRÍTICOS
     */
    injectStyles() {
        if (document.getElementById('modal-system-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'modal-system-styles';
        styles.textContent = `
            .modal-form .form-group-modern:not(:last-child) {
                margin-bottom: 20px;
            }
            
            .modal-form .required {
                color: #ef4444;
                font-weight: bold;
            }
            
            .button-spinner {
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            
            .spinner {
                width: 16px;
                height: 16px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        
        document.head.appendChild(styles);
    }

    /**
     * API PÚBLICA PARA OTROS MÓDULOS
     */
    isOpen() {
        return !!this.currentModal;
    }

    getConfig() {
        return { ...this.config };
    }

    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
}

// Crear instancia global
window.modalSystem = new ModalSystem();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModalSystem;
}

console.log('🎭 Modal-System.js cargado - Sistema universal de modales activo');

