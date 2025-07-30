/**
 * 🎭 SIMPLE-MODAL-SYSTEM.JS - Sistema de Modales Simple y Efectivo
 * Control de Gastos Familiares - WiseSpend
 * Versión: 1.0.0 - Basado en el patrón exitoso de notas.js
 * 
 * 🎯 CARACTERÍSTICAS:
 * ✅ Sin animaciones molestas de "contraerse"
 * ✅ Cierre instantáneo y directo
 * ✅ Patrón exitoso extraído de tareas
 * ✅ CSS simple y efectivo
 * ✅ Compatible con todos los módulos
 * ✅ Mismo estilo visual que modalSystem
 */

class SimpleModalSystem {
    constructor() {
        this.currentModal = null;
        this.injectStyles();
        console.log('🎭 SimpleModalSystem v1.0.0 inicializado - Patrón exitoso de tareas');
    }

    /**
     * 🎨 INYECTAR ESTILOS CSS
     */
    injectStyles() {
        if (document.querySelector('#simple-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'simple-modal-styles';
        styles.textContent = `
            /* ===== SIMPLE MODAL OVERLAY ===== */
            .simple-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.2s ease;
                backdrop-filter: blur(2px);
            }
            
            .simple-modal-overlay.active {
                opacity: 1;
            }
            
            /* ===== MODAL CONTENT ===== */
            .simple-modal {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
                max-width: 500px;
                width: 90%;
                max-height: 90vh;
                overflow: hidden;
                transform: scale(0.95);
                transition: transform 0.2s ease;
            }
            
            .simple-modal-overlay.active .simple-modal {
                transform: scale(1);
            }
            
            /* ===== HEADER ===== */
            .simple-modal-header {
                padding: 24px 24px 20px;
                border-bottom: 1px solid #f1f5f9;
            }
            
            .simple-modal-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* ===== BODY ===== */
            .simple-modal-body {
                padding: 20px 24px;
            }
            
            .simple-modal-message {
                margin: 0;
                font-size: 14px;
                color: #64748b;
                line-height: 1.5;
            }
            
            .simple-modal-details {
                margin-top: 12px;
                padding: 12px;
                background: #f8fafc;
                border-radius: 6px;
                border-left: 4px solid #3b82f6;
            }
            
            .simple-modal-details strong {
                display: block;
                color: #1e293b;
                margin-bottom: 4px;
            }
            
            .simple-modal-amount {
                color: #059669;
                font-weight: 600;
            }
            
            .simple-modal-warning {
                margin-top: 12px;
                padding: 8px 12px;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
                color: #dc2626;
                font-size: 13px;
            }
            
            /* ===== ACTIONS ===== */
            .simple-modal-actions {
                padding: 16px 24px 24px;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                border-top: 1px solid #f1f5f9;
            }
            
            /* ===== BUTTONS ===== */
            .simple-btn {
                padding: 10px 20px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                border: 1px solid transparent;
                transition: all 0.15s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
                min-height: 40px;
                text-decoration: none;
            }
            
            .simple-btn:focus {
                outline: 2px solid #3b82f6;
                outline-offset: 2px;
            }
            
            /* Secondary Button */
            .simple-btn-cancel {
                background: #f8fafc;
                color: #64748b;
                border-color: #e2e8f0;
            }
            
            .simple-btn-cancel:hover {
                background: #f1f5f9;
                color: #475569;
                border-color: #cbd5e1;
            }
            
            /* Danger Button */
            .simple-btn-danger {
                background: #dc2626;
                color: white;
                border-color: #dc2626;
            }
            
            .simple-btn-danger:hover {
                background: #b91c1c;
                border-color: #b91c1c;
            }
            
            /* Primary Button */
            .simple-btn-primary {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .simple-btn-primary:hover {
                background: #2563eb;
                border-color: #2563eb;
            }
            
            /* Success Button */
            .simple-btn-success {
                background: #059669;
                color: white;
                border-color: #059669;
            }
            
            .simple-btn-success:hover {
                background: #047857;
                border-color: #047857;
            }
            
            /* ===== RESPONSIVE ===== */
            @media (max-width: 640px) {
                .simple-modal {
                    width: 95%;
                    margin: 10px;
                }
                
                .simple-modal-header,
                .simple-modal-body,
                .simple-modal-actions {
                    padding-left: 20px;
                    padding-right: 20px;
                }
                
                .simple-modal-actions {
                    flex-direction: column;
                }
                
                .simple-btn {
                    width: 100%;
                    justify-content: center;
                }
            }
            
            /* ===== DARK MODE SUPPORT ===== */
            @media (prefers-color-scheme: dark) {
                .simple-modal {
                    background: #1e293b;
                    color: #f1f5f9;
                }
                
                .simple-modal-header {
                    border-bottom-color: #334155;
                }
                
                .simple-modal-title {
                    color: #f1f5f9;
                }
                
                .simple-modal-message {
                    color: #cbd5e1;
                }
                
                .simple-modal-details {
                    background: #334155;
                    border-left-color: #3b82f6;
                }
                
                .simple-modal-warning {
                    background: #451a1a;
                    border-color: #991b1b;
                    color: #fca5a5;
                }
                
                .simple-modal-actions {
                    border-top-color: #334155;
                }
                
                .simple-btn-cancel {
                    background: #334155;
                    color: #cbd5e1;
                    border-color: #475569;
                }
                
                .simple-btn-cancel:hover {
                    background: #475569;
                    color: #f1f5f9;
                    border-color: #64748b;
                }
            }
        `;
        
        document.head.appendChild(styles);
        console.log('✅ Estilos SimpleModalSystem inyectados');
    }

    /**
     * 🎯 MÉTODO PRINCIPAL - MOSTRAR MODAL DE CONFIRMACIÓN
     */
    confirm({
        title = '¿Confirmar acción?',
        message = '',
        details = null,
        warning = null,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'danger' // danger, primary, success
    }) {
        return new Promise((resolve) => {
            this.closeCurrentModal();
            
            // Crear modal
            const modal = document.createElement('div');
            modal.className = 'simple-modal-overlay';
            modal.innerHTML = this.createModalHTML({
                title,
                message,
                details,
                warning,
                confirmText,
                cancelText,
                type
            });
            
            // Event listeners
            this.setupEventListeners(modal, resolve);
            
            // Mostrar modal
            document.body.appendChild(modal);
            this.currentModal = modal;
            
            // Activar con animación
            setTimeout(() => modal.classList.add('active'), 10);
            
            // Focus en botón cancelar
            setTimeout(() => {
                const cancelBtn = modal.querySelector('[data-action="cancel"]');
                if (cancelBtn) cancelBtn.focus();
            }, 100);
        });
    }

    /**
     * 🏗️ CREAR HTML DEL MODAL
     */
    createModalHTML({title, message, details, warning, confirmText, cancelText, type}) {
        const typeIcon = {
            danger: '⚠️',
            primary: 'ℹ️',
            success: '✅'
        }[type] || '❓';
        
        const detailsHTML = details ? `
            <div class="simple-modal-details">
                <strong>${details.name}</strong>
                <span class="simple-modal-amount">${details.amount}</span>
            </div>
        ` : '';
        
        const warningHTML = warning ? `
            <div class="simple-modal-warning">${warning}</div>
        ` : '';
        
        return `
            <div class="simple-modal">
                <div class="simple-modal-header">
                    <h3 class="simple-modal-title">
                        ${typeIcon} ${title}
                    </h3>
                </div>
                
                <div class="simple-modal-body">
                    <p class="simple-modal-message">${message}</p>
                    ${detailsHTML}
                    ${warningHTML}
                </div>
                
                <div class="simple-modal-actions">
                    <button class="simple-btn simple-btn-cancel" data-action="cancel">
                        ${cancelText}
                    </button>
                    <button class="simple-btn simple-btn-${type}" data-action="confirm">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 🎛️ CONFIGURAR EVENT LISTENERS
     */
    setupEventListeners(modal, resolve) {
        const handleClick = (e) => {
            const action = e.target.dataset.action;
            if (action) {
                // ✅ PATRÓN EXITOSO: Eliminar clase primero
                modal.classList.remove('active');
                
                // ✅ PATRÓN EXITOSO: Eliminar del DOM después de animación
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                    this.currentModal = null;
                }, 200);
                
                // ✅ PATRÓN EXITOSO: Resolver inmediatamente
                resolve(action === 'confirm');
            }
        };

        // Click en backdrop para cerrar
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleClick({ target: { dataset: { action: 'cancel' } } });
            }
        });

        // Click en botones
        modal.addEventListener('click', handleClick);

        // Teclas
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                handleClick({ target: { dataset: { action: 'cancel' } } });
            } else if (e.key === 'Enter') {
                handleClick({ target: { dataset: { action: 'confirm' } } });
            }
        });
    }

    /**
     * 🎯 MÉTODO CONVENIENTE PARA ELIMINAR ITEMS
     */
    confirmDelete({
        itemName,
        itemAmount = null,
        customMessage = null
    }) {
        const message = customMessage || `¿Estás seguro de que quieres eliminar "${itemName}"?`;
        
        const details = itemAmount ? {
            name: itemName,
            amount: itemAmount
        } : null;
        
        return this.confirm({
            title: 'Confirmar Eliminación',
            message: message,
            details: details,
            warning: 'Esta acción no se puede deshacer.',
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            type: 'danger'
        });
    }

    /**
     * 🎯 MÉTODO CONVENIENTE PARA ACCIONES PRIMARIAS
     */
    confirmAction({
        title,
        message,
        confirmText = 'Confirmar',
        cancelText = 'Cancelar'
    }) {
        return this.confirm({
            title: title,
            message: message,
            confirmText: confirmText,
            cancelText: cancelText,
            type: 'primary'
        });
    }

    /**
     * 🧹 CERRAR MODAL ACTUAL
     */
    closeCurrentModal() {
        if (this.currentModal && this.currentModal.parentNode) {
            this.currentModal.classList.remove('active');
            setTimeout(() => {
                if (this.currentModal && this.currentModal.parentNode) {
                    this.currentModal.parentNode.removeChild(this.currentModal);
                }
                this.currentModal = null;
            }, 200);
        }
    }

    /**
     * 🔧 MÉTODOS DE UTILIDAD
     */
    isModalOpen() {
        return this.currentModal !== null;
    }

    destroy() {
        this.closeCurrentModal();
        const styles = document.querySelector('#simple-modal-styles');
        if (styles) styles.remove();
        console.log('🧹 SimpleModalSystem destruido');
    }
}

// ===== INICIALIZACIÓN GLOBAL =====

// Crear instancia global
window.simpleModal = new SimpleModalSystem();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleModalSystem;
}

// ===== INICIALIZACIÓN GLOBAL =====

// Crear instancia global
window.simpleModal = new SimpleModalSystem();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleModalSystem;
}

console.log('🎭 SimpleModalSystem v1.0.0 cargado - Patrón exitoso de tareas aplicado globalmente');

// ===== EJEMPLOS DE USO =====

/*
// Ejemplo 1: Modal básico de eliminación
const confirmed = await window.simpleModal.confirmDelete({
    itemName: 'Ingreso Principal',
    itemAmount: '$2,500.000'
});

if (confirmed) {
    // Ejecutar eliminación
    this.deleteIncome(incomeId);
}

// Ejemplo 2: Modal de confirmación personalizada
const confirmed = await window.simpleModal.confirm({
    title: 'Guardar Cambios',
    message: '¿Deseas guardar los cambios realizados?',
    confirmText: 'Guardar',
    cancelText: 'Descartar',
    type: 'primary'
});

// Ejemplo 3: Modal de acción rápida
const confirmed = await window.simpleModal.confirmAction({
    title: 'Marcar como Pagado',
    message: '¿Marcar este recordatorio como pagado?',
    confirmText: 'Marcar Pagado'
});
*/