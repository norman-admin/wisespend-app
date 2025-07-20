/**
 * CONTEXTUAL-MENU-ACTIONS.JS - Acciones del Menú Contextual
 * Presupuesto Familiar - Versión 1.0.0
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Modal de edición
 * ✅ Duplicar elementos
 * ✅ Mover elementos arriba/abajo
 * ✅ Acciones específicas del menú
 */

class ContextualMenuActions {
    constructor(contextualManager) {
        this.contextualManager = contextualManager;
        this.storage = contextualManager.storage;
        this.currency = contextualManager.currency;
        
        console.log('🎬 ContextualMenuActions inicializado');
    }

    /**
     * MODAL DE EDICIÓN
     */
    showEditModal(type, itemId, itemData) {
        const modal = this.createEditModal(type, itemId, itemData);
        document.body.appendChild(modal);
        modal.style.display = 'flex';
        
        // Focus en el primer input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    createEditModal(type, itemId, itemData) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay modern-overlay';
    
    const displayName = itemData.categoria || itemData.fuente || 'Elemento';
    const fieldLabel = itemData.categoria !== undefined ? 'Categoría' : 'Fuente';
    
    modal.innerHTML = `
        <div class="modal-content modern-modal">
            <div class="modal-header-modern">
                <h2>Editar elemento</h2>
                <p class="modal-subtitle">Modifica la información del elemento seleccionado</p>
                <button class="modal-close-modern" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            
            <div class="modal-body-modern">
                <div class="form-group-modern">
                    <label class="form-label-modern">${fieldLabel} <span class="required">*</span></label>
                    <div class="input-wrapper-modern">
                        <span class="input-icon">📝</span>
                        <input type="text" id="editName" value="${displayName}" 
                               placeholder="Ingresa el ${fieldLabel.toLowerCase()}" class="input-modern" required>
                    </div>
                </div>
                
                <div class="form-group-modern">
                    <label class="form-label-modern">Monto <span class="required">*</span></label>
                    <div class="input-wrapper-modern">
                        <span class="input-icon">💰</span>
                        <input type="number" id="editAmount" value="${itemData.monto}" 
                               placeholder="Ingresa el monto" class="input-modern" step="0.01" required>
                    </div>
                </div>
            </div>
            
            <div class="modal-footer-modern">
                <button type="button" class="btn-modern btn-primary-modern" 
                        onclick="window.contextualMenuActions.saveEditModal('${type}', '${itemId}')">
                    Guardar
                </button>
            </div>
        </div>
    `;
    
    return modal;
}

    saveEditModal(type, itemId) {
        const modal = document.querySelector('.modal-overlay');
        const name = document.getElementById('editName').value.trim();
        const amount = parseFloat(document.getElementById('editAmount').value);
        
        if (!name || !amount || amount <= 0) {
            alert('Por favor complete todos los campos correctamente');
            return;
        }
        
        // Usar métodos del contextualManager
        const nameSuccess = this.contextualManager.updateItemField(type, itemId, 'name', name);
        const amountSuccess = this.contextualManager.updateItemField(type, itemId, 'amount', amount);
        
        if (nameSuccess && amountSuccess) {
            modal.remove();
            this.contextualManager.smartRefresh('income', 'move');
            this.contextualManager.showMessage('Elemento actualizado correctamente', 'success');
        } else {
            this.contextualManager.showMessage('Error al guardar cambios', 'error');
        }
    }

    /**
     * DUPLICAR ELEMENTO
     */
    duplicateItem(type, itemId, itemData) {
        const newItem = {
            ...itemData,
            id: this.contextualManager.generateId(type),
            categoria: itemData.categoria ? `${itemData.categoria} (copia)` : undefined,
            fuente: itemData.fuente ? `${itemData.fuente} (copia)` : undefined,
            fechaCreacion: new Date().toISOString()
        };
        
        const data = this.contextualManager.getStorageData(type);
        const items = this.contextualManager.getItemsArray(data);
        
        // Encontrar posición del elemento original
        const originalIndex = items.findIndex(item => item.id === itemId);
        
        // Insertar después del original
        items.splice(originalIndex + 1, 0, newItem);
        
        // Recalcular total
        data.total = items
            .filter(item => item.activo !== false)
            .reduce((total, item) => total + (item.monto || 0), 0);
        
        if (this.contextualManager.saveStorageData(type, data)) {
            this.contextualManager.smartRefresh('income', 'duplicate');
            this.contextualManager.showMessage('Elemento duplicado correctamente', 'success');
        } else {
            this.contextualManager.showMessage('Error al duplicar elemento', 'error');
        }
    }

    /**
     * MOVER ELEMENTO
     */
    moveItem(type, itemId, direction) {
        const data = this.contextualManager.getStorageData(type);
        const items = this.contextualManager.getItemsArray(data);
        
        const currentIndex = items.findIndex(item => item.id === itemId);
        if (currentIndex === -1) return;
        
        let newIndex;
        if (direction === 'up') {
            newIndex = Math.max(0, currentIndex - 1);
        } else {
            newIndex = Math.min(items.length - 1, currentIndex + 1);
        }
        
        // Si no hay cambio, no hacer nada
        if (newIndex === currentIndex) {
            this.contextualManager.showMessage(`No se puede mover más ${direction === 'up' ? 'arriba' : 'abajo'}`, 'info');
            return;
        }
        
        // Intercambiar elementos
        [items[currentIndex], items[newIndex]] = [items[newIndex], items[currentIndex]];
        
        if (this.contextualManager.saveStorageData(type, data)) {
            this.contextualManager.smartRefresh('income', 'edit');
            this.contextualManager.showMessage(`Elemento movido ${direction === 'up' ? 'arriba' : 'abajo'}`, 'success');
        } else {
            this.contextualManager.showMessage('Error al mover elemento', 'error');
        }
    }
}

// Auto-inicializar cuando contextualManager esté listo
setTimeout(() => {
    if (window.contextualManager) {
        window.contextualMenuActions = new ContextualMenuActions(window.contextualManager);
        console.log('🎬 ContextualMenuActions auto-inicializado');
    }
}, 1000);

console.log('🎬 contextual-menu-actions.js cargado');