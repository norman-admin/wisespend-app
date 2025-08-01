/**
 * CONTEXTUAL-MENU-ACTIONS.JS - Acciones del Menú Contextual
 * Presupuesto Familiar - Versión 2.0.0 FINAL CORREGIDO DEFINITIVO
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Modal de edición con navegación Enter
 * ✅ Actualización sin refresco de pantalla
 * ✅ Duplicar elementos
 * ✅ Mover elementos arriba/abajo
 * ✅ Eliminar con modal elegante correcto
 * ✅ Consistencia total con sistema de ingresos
 */

class ContextualMenuActions {
    constructor(contextualManager) {
        this.contextualManager = contextualManager;
        this.storage = contextualManager.storage;
        this.currency = contextualManager.currency;
        
        console.log('🎬 ContextualMenuActions v2.0.0 inicializado - FINAL CORREGIDO DEFINITIVO');
    }

/**
 * 🎯 MODAL DE EDICIÓN - CON NAVEGACIÓN ENTER Y SIN PESTAÑEO
 */
showEditModal(type, itemId, itemData) {
    const fieldLabel = itemData.categoria !== undefined ? 'Categoría' : 'Fuente';
    const fieldValue = itemData.categoria || itemData.fuente || '';
    
    // 🎯 CREAR MODAL HTML TRADICIONAL con soporte Enter
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Editar elemento</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <form id="editForm" onsubmit="return false;">
                    <div class="form-group">
                        <label>${fieldLabel}:</label>
                        <input type="text" id="editName" value="${fieldValue}" required>
                    </div>
                    <div class="form-group">
                        <label>Monto:</label>
                        <input type="number" id="editAmount" value="${itemData.monto || ''}" required>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
                <button type="button" class="btn btn-primary" id="saveBtn">Actualizar</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    
    // 🎯 CONFIGURAR NAVEGACIÓN ENTER Y EVENTOS MEJORADOS
const nameInput = modal.querySelector('#editName');
const amountInput = modal.querySelector('#editAmount');
const saveBtn = modal.querySelector('#saveBtn');

// Función para cerrar modal
const closeModal = () => {
    modal.remove();
};

// Navegación Enter: Nombre → Monto → Guardar
nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        amountInput.focus();
        amountInput.select(); // Seleccionar todo el texto
    } else if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
    }
});

amountInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveBtn.click();
    } else if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
    }
});

// Escape global para cerrar modal
modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
    }
});

// Click fuera del modal para cerrar
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Enfocar primer campo y seleccionar texto
nameInput.focus();
nameInput.select();
    
    // 🎯 GUARDAR CON ACTUALIZACIÓN SIN PESTAÑEO
    saveBtn.addEventListener('click', () => {
        const newName = nameInput.value.trim();
        const newAmount = parseFloat(amountInput.value) || 0;
        
        if (!newName) {
            nameInput.focus();
            return;
        }
        
        // Preparar datos actualizados
        const updatedData = { ...itemData };
        if (itemData.categoria !== undefined) {
            updatedData.categoria = newName;
        } else {
            updatedData.fuente = newName;
        }
        updatedData.monto = newAmount;
        
        // Guardar en storage
        if (this.updateGastoItem(itemId, updatedData, type)) {


            // ✅ ACTUALIZACIÓN VISUAL AUTOMÁTICA SIN PESTAÑEO
if (window.gastosManager) {
    window.gastosManager.updateHeaderTotals();  // Actualizar totales
}

// 🎯 ACTUALIZAR ELEMENTO VISUAL EN LA TABLA
const itemElement = document.querySelector(`[data-id="${itemId}"]`);
if (itemElement) {
    // Buscar y actualizar nombre/categoría
    const nameElement = itemElement.querySelector('.gasto-name, .expense-name, [class*="name"], .breakdown-name');
    if (nameElement) {
        nameElement.textContent = newName;
    }
    
    // Buscar y actualizar monto
    const amountElement = itemElement.querySelector('.gasto-amount, .expense-amount, [class*="amount"], .breakdown-amount');
    if (amountElement) {
        amountElement.textContent = this.contextualManager.formatCurrency(newAmount);
    }
    
    // Efecto visual de actualización
    itemElement.style.transition = 'background-color 0.3s ease';
    itemElement.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
    setTimeout(() => {
        itemElement.style.backgroundColor = '';
    }, 1000);
}

// Cerrar modal
modal.remove();
            
            // Mostrar mensaje de éxito
            this.contextualManager.showMessage('Elemento actualizado correctamente', 'success');
            
            console.log('✅ Elemento editado sin pestañeo');
        } else {
            this.contextualManager.showMessage('Error al actualizar elemento', 'error');
        }
    });
}

    /**
     * 💾 GUARDAR ELEMENTO EDITADO - CORREGIDO SIN REFRESCO
     */
    saveEditedItem(type, itemId, data) {
        console.log('💾 Guardando elemento editado:', type, itemId, data);
        
        // Preparar datos según el tipo
        const updatedData = {
            monto: parseFloat(data.monto) || 0
        };
        
        // Determinar el campo correcto según el tipo
        if (type === 'ingresos') {
            updatedData.fuente = data.nombre.trim();
        } else {
            updatedData.categoria = data.nombre.trim();
        }
        
        // Actualizar según el tipo
        let updateSuccess = false;
        if (type === 'ingresos') {
            updateSuccess = this.updateIncomeItem(itemId, updatedData);
        } else if (type.includes('gastos')) {
            updateSuccess = this.updateGastoItem(itemId, updatedData, type);
        }
        
        if (updateSuccess) {
            // Mostrar mensaje de éxito
            if (window.modalSystem) {
                window.modalSystem.showMessage('Elemento actualizado correctamente', 'success');
            }
            
            // 🎯 ACTUALIZACIÓN VISUAL INMEDIATA
            if (window.gastosManager) {
                // Actualizar totales del header
                window.gastosManager.updateHeaderTotals();
                
                // ✅ SOLO ACTUALIZAR TOTALES SIN PESTAÑEO
            if (window.gastosManager) {
                window.gastosManager.updateHeaderTotals();
            }
                
                // Reactivar menú contextual
                setTimeout(() => {
                    if (window.contextualManager) {
                        window.contextualManager.bindExistingElements();
                    }
                }, 200);
            }
            
            console.log('✅ Elemento editado sin refresco de pantalla');
        } else {
            if (window.modalSystem) {
                window.modalSystem.showMessage('Error al actualizar elemento', 'error');
            } else {
                alert('Error al actualizar elemento');
            }
        }
    }

    /**
     * 📝 ACTUALIZAR ELEMENTO DE INGRESOS
     */
    updateIncomeItem(itemId, updatedData) {
        try {
            if (window.ingresosManager) {
                const income = window.ingresosManager.findIncomeById(itemId);
                if (income) {
                    Object.assign(income, updatedData);
                    window.ingresosManager.updateIncomeInStorage(income);
                    return true;
                }
            }
            
            // Fallback: acceso directo al storage
            const ingresos = this.storage.getIngresos();
            const incomeIndex = ingresos.desglose.findIndex(item => item.id === itemId);
            if (incomeIndex !== -1) {
                Object.assign(ingresos.desglose[incomeIndex], updatedData);
                ingresos.total = ingresos.desglose.reduce((total, item) => total + (item.monto || 0), 0);
                this.storage.setIngresos(ingresos);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error actualizando ingreso:', error);
            return false;
        }
    }

    /**
     * 💰 ACTUALIZAR ELEMENTO DE GASTOS
     */
    updateGastoItem(itemId, updatedData, type) {
        try {
            if (!window.gastosManager) return false;
            
            let gastos;
            const tipoGasto = type.replace('gastos-', '');
            
            // Obtener gastos según el tipo
            switch (tipoGasto) {
                case 'fijos':
                    gastos = this.storage.getGastosFijos();
                    break;
                case 'variables':
                    gastos = this.storage.getGastosVariables();
                    break;
                case 'extras':
                    gastos = this.storage.getGastosExtras();
                    break;
                default:
                    console.error('Tipo de gasto no reconocido:', tipoGasto);
                    return false;
            }
            
            // Encontrar y actualizar el elemento
            const itemIndex = gastos.items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
                Object.assign(gastos.items[itemIndex], updatedData);
                gastos.total = window.gastosManager.calculateTotal(gastos.items);
                
                // Guardar en storage
                switch (tipoGasto) {
                    case 'fijos':
                        this.storage.setGastosFijos(gastos);
                        break;
                    case 'variables':
                        this.storage.setGastosVariables(gastos);
                        break;
                    case 'extras':
                        this.storage.setGastosExtras(gastos);
                        break;
                }
                
                console.log('✅ Gasto actualizado:', tipoGasto, itemId);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error actualizando gasto:', error);
            return false;
        }
    }

    /**
     * 📄 DUPLICAR ELEMENTO
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
    // Solo actualizar totales del header
    if (window.gastosManager) {
        window.gastosManager.updateHeaderTotals();
    }
    
    // 🎯 AGREGAR NUEVO ELEMENTO VISUAL AL DOM
    const originalElement = document.querySelector(`[data-id="${itemId}"]`);
    if (originalElement) {
        // Clonar elemento original
        const newElement = originalElement.cloneNode(true);
        newElement.setAttribute('data-id', newItem.id);
        
        // Actualizar contenido del duplicado
        const nameElement = newElement.querySelector('.gasto-name, .expense-name, [class*="name"], .breakdown-name');
        const amountElement = newElement.querySelector('.gasto-amount, .expense-amount, [class*="amount"], .breakdown-amount');
        
        if (nameElement) {
            nameElement.textContent = newItem.categoria || newItem.fuente;
        }
        if (amountElement) {
            amountElement.textContent = this.contextualManager.formatCurrency(newItem.monto);
        }
        
        // Insertar después del original
        originalElement.parentNode.insertBefore(newElement, originalElement.nextSibling);
        
        // Efecto visual de creación
        newElement.style.transition = 'all 0.3s ease';
        newElement.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
        newElement.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            newElement.style.backgroundColor = '';
            newElement.style.transform = 'scale(1)';
        }, 500);
        
        // Reactivar menú contextual para el nuevo elemento
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.bindExistingElements();
            }
        }, 100);
    }
    
    this.contextualManager.showMessage('Elemento duplicado correctamente', 'success');
} else {
    this.contextualManager.showMessage('Error al duplicar elemento', 'error');
}
    }

    /**
     * ⬆️⬇️ MOVER ELEMENTO
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
    // Solo actualizar totales del header
    if (window.gastosManager) {
        window.gastosManager.updateHeaderTotals();
    }
    
    // 🎯 MOVER ELEMENTO VISUALMENTE EN EL DOM
    const currentElement = document.querySelector(`[data-id="${itemId}"]`);
    if (currentElement) {
        const container = currentElement.parentNode;
        const allElements = Array.from(container.children);
        const currentIndex = allElements.indexOf(currentElement);
        
        if (direction === 'up' && currentIndex > 0) {
            const targetElement = allElements[currentIndex - 1];
            container.insertBefore(currentElement, targetElement);
        } else if (direction === 'down' && currentIndex < allElements.length - 1) {
            const targetElement = allElements[currentIndex + 1];
            container.insertBefore(currentElement, targetElement.nextSibling);
        }
        
        // Efecto visual de movimiento
        currentElement.style.transition = 'all 0.3s ease';
        currentElement.style.backgroundColor = 'rgba(139, 69, 19, 0.1)';
        currentElement.style.transform = 'scale(1.02)';
        
        setTimeout(() => {
            currentElement.style.backgroundColor = '';
            currentElement.style.transform = 'scale(1)';
        }, 500);
        
        // Reactivar menú contextual
        setTimeout(() => {
            if (window.contextualManager) {
                window.contextualManager.bindExistingElements();
            }
        }, 100);
    }
    
    this.contextualManager.showMessage(`Elemento movido ${direction === 'up' ? 'arriba' : 'abajo'}`, 'success');
} else {
    this.contextualManager.showMessage('Error al mover elemento', 'error');
}
    }

    /**
     * 🗑️ ELIMINAR ELEMENTO - ACTUALIZACIÓN INTELIGENTE SIN RECARGAR
     */
    async deleteItem(type, itemId, itemData) {
        const itemName = itemData.categoria || itemData.fuente || 'elemento';
        const itemAmount = this.currency?.format(itemData.monto) || `$${itemData.monto}`;
        
        // 🎯 USAR EL MODAL REALMENTE ELEGANTE QUE FUNCIONA EN INGRESOS
        let confirmed;
        try {
            if (window.modalSystem) {
                confirmed = await window.modalSystem.confirm(
                    `¿Estás seguro de que quieres eliminar "${itemName}"?`,
                    'Esta acción no se puede deshacer.'
                );
            } else {
                confirmed = confirm(`¿Estás seguro de eliminar "${itemName}" (${itemAmount})?`);
            }
        } catch (error) {
            console.error('Error en modal:', error);
            confirmed = confirm(`¿Estás seguro de eliminar "${itemName}" (${itemAmount})?`);
        }
        
        if (!confirmed) return;
        
        const data = this.contextualManager.getStorageData(type);
        const items = this.contextualManager.getItemsArray(data);
        
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            items.splice(itemIndex, 1);
            
            // Recalcular total
            data.total = items
                .filter(item => item.activo !== false)
                .reduce((total, item) => total + (item.monto || 0), 0);
            
            if (this.contextualManager.saveStorageData(type, data)) {
                // 🎯 ACTUALIZACIÓN INTELIGENTE SIN RECARGAR - IGUAL QUE INGRESOS
                if (window.gastosManager) {
                    window.gastosManager.updateHeaderTotals();
                }
                
                // Forzar eliminación visual del elemento
                const elementToRemove = document.querySelector(`[data-id="${itemId}"]`);
                if (elementToRemove) {
                    elementToRemove.style.transition = 'opacity 0.3s ease';
                    elementToRemove.style.opacity = '0';
                    setTimeout(() => {
                        elementToRemove.remove();
                    }, 300);
                }
                
                // Reactivar menú contextual SIN recargar vista
                setTimeout(() => {
                    if (window.contextualManager) {
                        window.contextualManager.bindExistingElements();
                    }
                }, 400);
                
                this.contextualManager.showMessage('Elemento eliminado correctamente', 'success');
            } else {
                this.contextualManager.showMessage('Error al eliminar elemento', 'error');
            }
        }
    }
}

// 🎯 AUTO-INICIALIZACIÓN CORREGIDA
setTimeout(() => {
    if (window.contextualManager) {
        window.contextualMenuActions = new ContextualMenuActions(window.contextualManager);
        console.log('🎬 ContextualMenuActions v2.0.0 auto-inicializado - FINAL CORREGIDO DEFINITIVO');
    }
}, 1000);

console.log('🎬 contextual-menu-actions.js v2.0.0 cargado - CON NAVEGACIÓN ENTER Y SIN REFRESCOS');