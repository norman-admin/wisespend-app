/**
 * CONTEXTUAL-MENU-ACTIONS.JS - Acciones del Menú Contextual
 * Presupuesto Familiar - Versión 2.1.0 - SYNC FIX
 * 
 * 🎯 RESPONSABILIDADES:
 * ✅ Modal de edición con navegación Enter
 * ✅ Actualización sin refresco de pantalla
 * ✅ Duplicar elementos (Sincronizado con Supabase)
 * ✅ Mover elementos arriba/abajo (Local, ordenamiento pendiente en nube)
 * ✅ Eliminar con modal elegante (Sincronizado con Supabase)
 * ✅ Consistencia total con sistema de ingresos
 */

class ContextualMenuActions {
    constructor(contextualManager) {
        this.contextualManager = contextualManager;
        this.storage = contextualManager.storage;
        this.currency = contextualManager.currency;

        console.log('🎬 ContextualMenuActions v2.1.0 inicializado - SYNC FIX');
    }

    /**
     * 🆕 ACTUALIZAR TOTALES VISUALES DE CUALQUIER SECCIÓN
     */
    updateSectionTotalsVisual(type) {
        const tipoGasto = type.replace('gastos-', '');

        if (tipoGasto === 'fijos' || tipoGasto === 'variables') {
            // Obtener datos actualizados del storage
            let datosActualizados;
            if (tipoGasto === 'fijos') {
                datosActualizados = this.storage.getGastosFijos();
            } else if (tipoGasto === 'variables') {
                datosActualizados = this.storage.getGastosVariables();
            }

            // Recalcular total por si acaso
            const totalReal = datosActualizados.items
                .filter(item => item.activo !== false)
                .reduce((sum, item) => sum + (item.monto || 0), 0);

            console.log(`📊 Total ${tipoGasto} calculado:`, totalReal);

            // Buscar el elemento del total según el tipo
            let totalElement = null;

            // Primero buscar en vista combinada (dos columnas)
            if (tipoGasto === 'fijos') {
                totalElement = document.querySelector('.expenses-column:first-child .expenses-total .total-amount');
            } else if (tipoGasto === 'variables') {
                // IMPORTANTE: Para variables es la SEGUNDA columna
                const columnas = document.querySelectorAll('.expenses-column');
                if (columnas.length >= 2) {
                    totalElement = columnas[1].querySelector('.expenses-total .total-amount');
                }
            }

            // Si no está en vista combinada, buscar en vista individual
            if (!totalElement) {
                // Buscar el elemento específico de Total Variables
                const allTotals = document.querySelectorAll('.gastos-total-section strong, .expenses-total');
                allTotals.forEach(el => {
                    const text = el.textContent || '';
                    if (tipoGasto === 'variables' && text.includes('Total Variables')) {
                        totalElement = el;
                    } else if (tipoGasto === 'fijos' && text.includes('Total Fijos')) {
                        totalElement = el;
                    }
                });
            }

            // Actualizar el total visual
            if (totalElement) {
                if (totalElement.tagName === 'STRONG') {
                    totalElement.textContent = `Total ${tipoGasto === 'fijos' ? 'Fijos' : 'Variables'}: ${this.contextualManager.formatCurrency(totalReal)}`;
                } else {
                    totalElement.textContent = this.contextualManager.formatCurrency(totalReal);
                }

                // Efecto visual
                totalElement.style.transition = 'all 0.3s ease';
                totalElement.style.color = '#10b981';
                setTimeout(() => {
                    totalElement.style.color = '';
                }, 1000);

                console.log(`✅ Total ${tipoGasto} actualizado visualmente a:`, totalReal);
            } else {
                console.warn(`⚠️ No se encontró elemento de total para ${tipoGasto}`);
            }

            // Actualizar total general si existe
            const totalGeneralElement = document.querySelector('.gastos-total span');
            if (totalGeneralElement) {
                const gastosFijos = this.storage.getGastosFijos();
                const gastosVariables = this.storage.getGastosVariables();
                const totalGeneral = gastosFijos.total + gastosVariables.total;
                totalGeneralElement.textContent = `Total: ${this.contextualManager.formatCurrency(totalGeneral)}`;
            }
        }
    }

    /**
     * 🎯 MODAL DE EDICIÓN - USANDO SISTEMA UNIFICADO
     */
    showEditModal(type, itemId, itemData) {
        const fieldLabel = itemData.categoria !== undefined ? 'Categoría' : 'Fuente';
        const fieldValue = itemData.categoria || itemData.fuente || '';
        const title = type === 'ingresos' ? 'Editar Ingreso' : 'Editar Gasto';

        // Usar el sistema de modales unificado
        if (window.modalSystem) {
            window.modalSystem.form({
                title: title,
                submitText: 'Actualizar',
                fields: [
                    {
                        type: 'text',
                        name: 'nombre',
                        label: fieldLabel,
                        required: true,
                        value: fieldValue,
                        placeholder: `Nombre del ${type === 'ingresos' ? 'ingreso' : 'gasto'}`
                    },
                    {
                        type: 'number',
                        name: 'monto',
                        label: 'Monto',
                        required: true,
                        value: itemData.monto || '',
                        placeholder: '0'
                    }
                ]
            }).then(data => {
                if (data) {
                    this.saveEditedItem(type, itemId, data);
                }
            });
        } else {
            console.error('❌ ModalSystem no disponible');
            alert('Error: Sistema de modales no disponible');
        }
    }

    /**
     * 💾 GUARDAR ELEMENTO EDITADO - CORREGIDO SIN REFRESCO
     */
    async saveEditedItem(type, itemId, data) {
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

        // Actualizar usando StorageManager (Hybrid)
        let updateSuccess = false;
        try {
            if (type === 'ingresos') {
                updateSuccess = await this.storage.updateIngreso(itemId, updatedData);
            } else if (type === 'gastos-fijos') {
                updateSuccess = await this.storage.updateGastoFijo(itemId, updatedData);
            } else if (type === 'gastos-variables') {
                updateSuccess = await this.storage.updateGastoVariable(itemId, updatedData);
            } else if (type === 'gastos-extras') {
                updateSuccess = await this.storage.updateGastoExtra(itemId, updatedData);
            }
        } catch (error) {
            console.error('Error updating item:', error);
            updateSuccess = false;
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

                // Reactivar menú contextual
                setTimeout(() => {
                    if (window.contextualManager) {
                        window.contextualManager.bindExistingElements();
                    }
                }, 200);
            }

            // 🆕 ACTUALIZAR TOTALES DE LA SECCIÓN ESPECÍFICA
            this.updateSectionTotalsVisual(type);

            // 🎯 ACTUALIZAR ELEMENTO VISUAL EN LA TABLA
            const itemElement = document.querySelector(`[data-id="${itemId}"]`);
            if (itemElement) {
                // Buscar y actualizar nombre/categoría
                const nameElement = itemElement.querySelector('.gasto-name, .expense-name, [class*="name"], .breakdown-name');
                if (nameElement) {
                    nameElement.textContent = data.nombre.trim();
                }

                // Buscar y actualizar monto
                const amountElement = itemElement.querySelector('.gasto-amount, .expense-amount, [class*="amount"], .breakdown-amount');
                if (amountElement) {
                    amountElement.textContent = this.contextualManager.formatCurrency(data.monto);
                }

                // Efecto visual de actualización
                itemElement.style.transition = 'background-color 0.3s ease';
                itemElement.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
                setTimeout(() => {
                    itemElement.style.backgroundColor = '';
                }, 1000);
            }

            // 🆕 AGREGAR: Actualizar la sección de gastos extras
            if (window.gastosExtrasMejorados) {
                window.gastosExtrasMejorados.refresh();
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
     * 📄 DUPLICAR ELEMENTO
     */
    async duplicateItem(type, itemId, itemData) {
        // Generar nuevo ID (UUID si es posible, o fallback)
        // Usamos Utils.id.generate si está disponible
        const newId = window.Utils && window.Utils.id ? window.Utils.id.generate() : this.contextualManager.generateId(type);

        const newItem = {
            ...itemData,
            id: newId,
            categoria: itemData.categoria ? `${itemData.categoria} (copia)` : undefined,
            fuente: itemData.fuente ? `${itemData.fuente} (copia)` : undefined,
            fechaCreacion: new Date().toISOString(),
            monto: parseFloat(itemData.monto) || 0,
            activo: true,
            pagado: false
        };

        // Guardar usando StorageManager (Hybrid)
        let saveSuccess = false;
        try {
            if (type === 'ingresos') {
                saveSuccess = await this.storage.addIngreso(newItem);
            } else if (type === 'gastos-fijos') {
                saveSuccess = await this.storage.addGastoFijo(newItem);
            } else if (type === 'gastos-variables') {
                saveSuccess = await this.storage.addGastoVariable(newItem);
            } else if (type === 'gastos-extras') {
                saveSuccess = await this.storage.addGastoExtra(newItem);
            }
        } catch (error) {
            console.error('Error duplicating item:', error);
            saveSuccess = false;
        }

        if (saveSuccess) {
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
            // Actualizar totales
            this.updateSectionTotalsVisual(type);

            // 🆕 AGREGAR: Actualizar la sección de gastos extras
            if (window.gastosExtrasMejorados) {
                window.gastosExtrasMejorados.refresh();
            }
        } else {
            this.contextualManager.showMessage('Error al duplicar elemento', 'error');
        }
    }

    /**
     * ⬆️⬇️ MOVER ELEMENTO
     */
    moveItem(type, itemId, direction) {
        // Mover elementos es una operación puramente visual/local por ahora
        // ya que Supabase no tiene un campo de "orden" explícito en este esquema simple.
        // Se mantiene la lógica original de manipulación de array local.

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

        // 🆕 AGREGAR: Actualizar la sección de gastos extras
        if (window.gastosExtrasMejorados) {
            window.gastosExtrasMejorados.refresh();
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

        // Usar StorageManager (Hybrid) para eliminar
        let deleteSuccess = false;
        try {
            if (type === 'ingresos') {
                deleteSuccess = await this.storage.deleteIngreso(itemId);
            } else if (type === 'gastos-fijos') {
                deleteSuccess = await this.storage.deleteGastoFijo(itemId);
            } else if (type === 'gastos-variables') {
                deleteSuccess = await this.storage.deleteGastoVariable(itemId);
            } else if (type === 'gastos-extras') {
                deleteSuccess = await this.storage.deleteGastoExtra(itemId);
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            deleteSuccess = false;
        }

        if (deleteSuccess) {
            // 🎯 ACTUALIZACIÓN INTELIGENTE SIN RECARGAR - IGUAL QUE INGRESOS
            if (window.gastosManager) {
                window.gastosManager.updateHeaderTotals();
            }

            // 🆕 AGREGAR: Actualizar la sección de gastos extras
            if (window.gastosExtrasMejorados) {
                window.gastosExtrasMejorados.refresh();
            }

            // 🆕 ACTUALIZAR TOTALES ESPECÍFICOS POR SECCIÓN
            this.updateSectionTotalsVisual(type);

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

    /**
      * 🆕 ACTUALIZAR TOTALES ESPECÍFICOS POR SECCIÓN
      */
    updateSectionTotals(type, data) {
        // ... (Se mantiene igual, pero data.total puede necesitar recalcularse si data no se pasa)
        // En la implementación anterior, data se pasaba desde saveStorageData.
        // Ahora, como usamos this.storage.delete..., no tenemos 'data' actualizado aquí directamente.
        // Pero updateSectionTotalsVisual ya maneja la obtención de datos frescos.
        // Así que esta función podría ser redundante o necesitar adaptación.
        // Sin embargo, updateSectionTotalsVisual es la que llamamos en deleteItem.
        // Esta función 'updateSectionTotals' parece ser un remanente o usada internamente.
        // La mantendré por compatibilidad pero updateSectionTotalsVisual es la clave.

        if (type === 'gastos-extras' && window.gastosExtrasMejorados) {
            // Actualizar gastos extras
            const gastosExtras = this.storage.getGastosExtras();
            const totalRealizado = gastosExtras.items.reduce((total, item) => total + (item.monto || 0), 0);

            // Actualizar total de gastos extras
            const totalElement = document.querySelector('#extras-total-amount');
            if (totalElement) {
                totalElement.textContent = `$${window.gastosExtrasMejorados.formatNumber(totalRealizado)}`;
            }

            // Actualizar cajas de resumen
            const gastosRealizadosElement = document.querySelector('.extras-summary-card.gastos .extras-summary-amount');
            if (gastosRealizadosElement) {
                gastosRealizadosElement.textContent = `$${window.gastosExtrasMejorados.formatNumber(totalRealizado)}`;
            }

            const disponible = window.gastosExtrasMejorados.presupuestoActual - totalRealizado;
            const disponibleElement = document.querySelector('.extras-summary-card.disponible .extras-summary-amount');
            if (disponibleElement) {
                disponibleElement.textContent = `$${window.gastosExtrasMejorados.formatNumber(disponible)}`;
            }

        } else if (type === 'gastos-fijos' || type === 'gastos-variables') {
            // Actualizar totales de gastos fijos/variables SIN RECARGAR
            const tipoGasto = type.replace('gastos-', '');

            // Obtener datos frescos
            let data;
            if (tipoGasto === 'fijos') data = this.storage.getGastosFijos();
            else data = this.storage.getGastosVariables();

            // Buscar el elemento del total según la vista actual
            let totalElement = null;

            // Primero buscar en vista combinada (dos columnas)
            if (tipoGasto === 'fijos') {
                totalElement = document.querySelector('.expenses-column:first-child .expenses-total .total-amount');
            } else if (tipoGasto === 'variables') {
                totalElement = document.querySelector('.expenses-column:last-child .expenses-total .total-amount');
            }

            // Si no está en vista combinada, buscar en vista individual
            if (!totalElement) {
                const totalSection = document.querySelector('.gastos-total-section strong');
                if (totalSection && totalSection.textContent.includes(tipoGasto === 'fijos' ? 'Total Fijos' : 'Total Variables')) {
                    totalElement = totalSection;
                }
            }

            // Actualizar el total si encontramos el elemento
            if (totalElement) {
                const newTotal = data.total || 0;
                if (totalElement.tagName === 'STRONG') {
                    // Vista individual - actualizar todo el texto
                    totalElement.textContent = `Total ${tipoGasto === 'fijos' ? 'Fijos' : 'Variables'}: ${this.formatNumber(newTotal)}`;
                } else {
                    // Vista combinada - solo actualizar el monto
                    totalElement.textContent = `${this.formatNumber(newTotal)}`;
                }

                // Efecto visual de actualización
                totalElement.style.transition = 'all 0.3s ease';
                totalElement.style.color = '#10b981';
                setTimeout(() => {
                    totalElement.style.color = '';
                }, 1000);
            }

            console.log('✅ Total actualizado sin recargar:', type, data.total);
        }

        console.log('✅ Totales de sección actualizados:', type);
    }

    formatNumber(number) {
        return new Intl.NumberFormat('es-CL').format(number);
    }
}

// 🎯 AUTO-INICIALIZACIÓN CORREGIDA
setTimeout(() => {
    if (window.contextualManager) {
        window.contextualMenuActions = new ContextualMenuActions(window.contextualManager);
        console.log('🎬 ContextualMenuActions v2.1.0 auto-inicializado - SYNC FIX');
    }
}, 1000);

console.log('🎬 contextual-menu-actions.js v2.1.0 cargado - SYNC FIX');