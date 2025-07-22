/**
 * 📝 NOTAS.JS - Sistema Completo de Notas y Recordatorios con Dictado por Voz + WebSocket
 * Control de Gastos Familiares - WiseSpend
 * Versión: 2.1.0 - INTERFAZ ORIGINAL + WebSocket Python Flask
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Sistema CRUD completo de tareas
 * ✅ Dictado por voz con Web Speech API
 * ✅ Comandos inteligentes de voz
 * ✅ Recordatorios de pagos
 * ✅ Storage local persistente
 * ✅ Filtros y ordenamiento
 * ✅ Integración con WiseSpend
 * 🆕 CONEXIÓN WEBSOCKET CON PYTHON FLASK
 * 🆕 PROCESAMIENTO SERVIDOR DE COMANDOS DE VOZ
 * 🆕 FALLBACK A SIMULACIÓN LOCAL
 * 🎨 INTERFAZ ORIGINAL DE 2 COLUMNAS RESTAURADA
 */

class NotasManager {
    constructor() {
        this.tasks = [];
        this.reminders = [];
        this.currentFilter = 'all';
        this.currentSort = 'mi-orden';
        this.showCompleted = true;
        // Variables para recordatorios
        this.showPaid = true;
        this.currentReminderSort = 'fecha';
                
        // Configuración
        this.storageKey = 'wisespend_notas';
        this.remindersKey = 'wisespend_recordatorios';
        
        // Estados
        this.initialized = false;
        this.container = null;

        console.log('📝 NotasManager v2.1.0: Sistema simplificado...');
    }

    /**
     * 🚀 Inicializar el sistema de notas
     */
    async init(containerId = 'varios-content') {
    try {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container ${containerId} no encontrado`);
        }

        console.log('🚀 NotasManager: Inicialización RÁPIDA iniciada...');

        // 1. CARGAR DATOS INMEDIATAMENTE
        this.loadStoredData();
        
        // 2. RENDERIZAR INTERFAZ INMEDIATAMENTE
        this.renderOriginalInterface();
        
        // 3. CONFIGURAR EVENTOS INMEDIATAMENTE
        this.bindEvents();
        
        // 4. MARCAR COMO INICIALIZADO INMEDIATAMENTE
        this.initialized = true;
        console.log('✅ NotasManager: Interfaz cargada INSTANTÁNEAMENTE');
        
        // 5. PROCESOS EN PARALELO (no bloquean)
        Promise.allSettled([
            this.loadNotasCSS().catch(e => console.warn('CSS:', e)),
        ]).then(() => {
            console.log('✅ Background processes completed');
        });
        
            console.log('🎯 NotasManager: Inicialización COMPLETA < 100ms');
            
            this.initialized = true;
            console.log('✅ NotasManager: Sistema inicializado con interfaz original');
            
        } catch (error) {
            console.error('❌ NotasManager: Error en inicialización:', error);
            this.showError('Error al cargar el sistema de notas');
        }
    }
  
    /**
     * 🎨 RENDERIZAR INTERFAZ ORIGINAL DE 2 COLUMNAS
     */
    renderOriginalInterface() {
        if (!this.container) {
            console.error('❌ Container no disponible para renderizar');
            return;
        }

        this.container.innerHTML = `
            <div class="notas-main-container">
                <!-- Columna Izquierda: Tareas y Notas -->
                <div class="notas-section">
                    <div class="section-header-notas">
                        <div class="section-title-notas">
                            ✅ Tareas y Notas
                        </div>
                        <div class="section-actions-notas">
                           <button class="btn-notas primary" onclick="window.notasManager.openTaskModal()">
                            ➕ Nueva Tarea
                        </button>
                            <div class="options-menu-notas">
                            <button class="options-trigger-notas">⋮</button>
                            <div class="dropdown-menu-notas">
                                    <div class="sort-menu-header">⚙️ OPCIONES</div>
                                    <div class="menu-item-notas" onclick="window.notasManager.showSortMenu()">
                                        📋 Ordenar por
                                    </div>
                                    <div class="menu-item-notas" onclick="window.notasManager.toggleCompletedVisibility()">
                                        👁️ Mostrar/Ocultar completadas
                                    </div>
                                    <div class="menu-item-notas" onclick="window.notasManager.clearCompleted()">
                                        🗑️ Limpiar completadas
                                    </div>
                                    <div class="menu-item-notas danger" onclick="window.notasManager.clearAllData()">
                                        🗑️ Limpiar todas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Filtros de Tareas -->
                    <div class="filters-container">
                        <div class="filter-buttons">
                            <button class="filter-btn active" data-filter="all">Todas</button>
                            <button class="filter-btn" data-filter="personal">Personal</button>
                            <button class="filter-btn" data-filter="work">Trabajo</button>
                            <button class="filter-btn" data-filter="family">Familia</button>
                            <button class="filter-btn" data-filter="financial">Financiera</button>
                        </div>
                    </div>

                    <!-- Lista de Tareas -->
                    <div class="tasks-list-original" id="tasksList">
                        <!-- Se carga dinámicamente -->
                    </div>
                </div>

                <!-- Divisor -->
                <div class="notas-divider"></div>

                <!-- Columna Derecha: Recordatorios de Pagos -->
                <div class="recordatorios-section">
                    <div class="section-header-notas">
                        <div class="section-title-notas">
                            🗓️ Recordatorios de Pagos
                        </div>
                        <div class="section-actions-notas">
                            <button class="btn-notas mint" onclick="window.notasManager.openReminderModal()">
                                ➕ Recordatorio
                            </button>
                            <div class="options-menu-notas" id="remindersOptionsMenu">
                            <button class="options-trigger-notas">⋮</button>
                            <div class="dropdown-menu-notas">
                            <div class="sort-menu-header">⚙️ OPCIONES</div>
                            <div class="menu-item-notas" onclick="window.notasManager.showRemindersSortMenu()">
                                        📋 Ordenar por
                                    </div>
                                    <div class="menu-item-notas" onclick="window.notasManager.togglePaidVisibility()">
                                        👁️ Mostrar/Ocultar pagados
                                    </div>
                                    <div class="menu-item-notas" onclick="window.notasManager.clearPaidReminders()">
                                        🧹 Limpiar pagados
                                    </div>
                                    <div class="menu-item-notas danger" onclick="window.notasManager.clearAllReminders()">
                                        🗑️ Limpiar todas
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Fecha actual -->
                    <div class="current-date">
                        <div class="month-year">Julio 2025</div>
                        <div class="today">Hoy: ${this.formatTodayDate()}</div>
                    </div>

                    <!-- Lista de Recordatorios -->
                    <div class="reminders-list-original" id="remindersList">
                        <!-- Se carga dinámicamente -->
                    </div>
                </div>
            </div>

            <!-- Modal de tarea -->
            ${this.renderTaskModal()}

            <!-- Modal de recordatorio -->
            ${this.renderReminderModal()}
        `;

        // Configurar eventos después de renderizar
        this.setupOriginalEvents();
        this.refreshTasksList();
        this.refreshRemindersList();
    }

    /**
     * 📅 Formatear fecha de hoy
     */
    formatTodayDate() {
        const today = new Date();
        const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const dayName = days[today.getDay()];
        const dayNumber = today.getDate();
        return `${dayName} ${dayNumber}`;
    }

    /**
     * 🎛️ Configurar eventos de la interfaz original
     */
    setupOriginalEvents() {
    // Filtros de tareas
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            this.currentFilter = btn.dataset.filter;
            this.refreshTasksList();
        };
    });

    // Cerrar menús al hacer click fuera
    document.addEventListener('click', (e) => {
        // Solo procesar si el click no es en un menú o botón de opciones
        if (!e.target.closest('.options-menu-notas') && !e.target.closest('.sort-submenu')) {
            // Cerrar todos los menús principales
            document.querySelectorAll('.dropdown-menu-notas.active').forEach(menu => {
                menu.classList.remove('active');
            });
            
            // Cerrar todos los submenús de ordenamiento
            document.querySelectorAll('.sort-submenu').forEach(submenu => {
                submenu.remove();
            });
        }
    });
    
    // Menú de opciones de tareas
    const tasksOptionsMenu = document.querySelector('.notas-section .options-menu-notas');
    if (tasksOptionsMenu) {
        const trigger = tasksOptionsMenu.querySelector('.options-trigger-notas');
        const dropdown = tasksOptionsMenu.querySelector('.dropdown-menu-notas');
        
        console.log('🔍 Debug tareas:', { tasksOptionsMenu, trigger, dropdown });
        
        if (trigger && dropdown) {
            console.log('✅ Configurando eventos para tareas...');
            trigger.onclick = (e) => {
                console.log('🎯 Click en menú tareas');
                e.stopPropagation();
                dropdown.classList.toggle('active');
            };
            console.log('✅ Evento click asignado');
        } else {
            console.error('❌ No se encontraron elementos:', { trigger, dropdown });
        }
    }

// Menú de opciones de recordatorios
const remindersOptionsMenu = document.getElementById('remindersOptionsMenu');
if (remindersOptionsMenu) {
    const trigger = remindersOptionsMenu.querySelector('.options-trigger-notas');
    const dropdown = remindersOptionsMenu.querySelector('.dropdown-menu-notas');
    
    console.log('🔍 Debug recordatorios:', { remindersOptionsMenu, trigger, dropdown });
    
    if (trigger && dropdown) {
        console.log('✅ Configurando eventos para recordatorios...');
        trigger.onclick = (e) => {
            console.log('🎯 Click en menú recordatorios');
            e.stopPropagation();
            dropdown.classList.toggle('active');
        };
        console.log('✅ Evento click asignado para recordatorios');
    }
}
    
    // 🎨 INICIALIZAR EDICIÓN INLINE
    this.initInlineEditing();
    
    console.log('✅ Edición inline activada');
}

    /**
     * 🔄 Refrescar lista de tareas (formato original)
     */
    refreshTasksList() {
    const container = document.getElementById('tasksList');
    if (!container) return;

    let filteredTasks = this.getFilteredTasksOriginal();
    
    // 👁️ FILTRAR COMPLETADAS SI showCompleted ES FALSE
    if (!this.showCompleted) {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    }

    if (filteredTasks.length === 0) {
        const message = !this.showCompleted && this.tasks.some(t => t.completed) 
            ? "No hay tareas pendientes" 
            : "No hay tareas para mostrar";
        
        container.innerHTML = `
            <div class="empty-state-original">
                <p>${message}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredTasks.map(task => this.renderOriginalTaskItem(task)).join('');
}

    /**
     * 📋 Renderizar item de tarea (formato original)
     */
    renderOriginalTaskItem(task) {
        const priorityClass = task.priority === 'high' ? 'high-priority' : 
                            task.priority === 'medium' ? 'medium-priority' : 'low-priority';
        const completedClass = task.completed ? 'completed-task' : '';
        
        return `
            <div class="task-item-original ${priorityClass} ${completedClass}" data-id="${task.id}">
                <div class="task-checkbox-original">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} 
                           onchange="window.notasManager.toggleTask('${task.id}')">
                </div>
                <div class="task-content-original">
                    <div class="task-title-original inline-editable" data-original-text="${task.title}">${task.title}</div>
                    <div class="task-meta-original">
                        <span class="category-tag ${task.category}">${this.getCategoryName(task.category)}</span>
                        <span class="date-tag">${this.formatOriginalDate(task.dueDate)}</span>
                    </div>
                </div>
                <div class="task-actions-original">
                    <button class="btn-icon-small" onclick="window.notasManager.editTask('${task.id}')" title="Editar">✏️</button>
                    <button class="btn-icon-small" onclick="window.notasManager.deleteTask('${task.id}')" title="Eliminar">🗑️</button>
                </div>
            </div>
        `;
    }

    /**
     * 🔄 Refrescar lista de recordatorios (formato original)
     */
    refreshRemindersList() {
        const container = document.getElementById('remindersList');
        if (!container) return;

        if (this.reminders.length === 0) {
            container.innerHTML = `
                <div class="empty-state-original">
                    <p>No hay recordatorios configurados</p>
                </div>
            `;
            return;
        }

        // Filtrar recordatorios según preferencia de mostrar pagados
    let filteredReminders = this.showPaid ? 
        this.reminders : 
        this.reminders.filter(reminder => !reminder.paid);

        // Ordenar según preferencia del usuario
        const sortedReminders = [...filteredReminders].sort((a, b) => {
    switch(this.currentReminderSort) {
        case 'fecha':
            return new Date(a.dueDate) - new Date(b.dueDate);
        case 'estado':
            const statusOrder = { urgent: 0, warning: 1, ok: 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        case 'monto':
            return (b.amount || 0) - (a.amount || 0);
        case 'titulo':
            return a.title.localeCompare(b.title);
        default:
            return new Date(a.dueDate) - new Date(b.dueDate);
    }
});

        container.innerHTML = sortedReminders.map(reminder => this.renderOriginalReminderItem(reminder)).join('');
    }

    /**
     * 📅 Renderizar item de recordatorio (formato original)
     */
    renderOriginalReminderItem(reminder) {
    const statusClass = reminder.status;
    const statusLabel = reminder.status === 'urgent' ? 'URGENTE' : 
                      reminder.status === 'warning' ? 'PRÓXIMO' : 'OK';
    const isPaid = reminder.paid || false;
    
    return `
        <div class="reminder-item-original ${statusClass} ${isPaid ? 'paid-reminder' : ''}" data-id="${reminder.id}">
            <div class="reminder-checkbox-original">
                <input type="checkbox" ${isPaid ? 'checked' : ''} 
                onchange="window.notasManager.toggleReminder('${reminder.id}')">
            </div>
            <div class="reminder-content-original">
                <div class="reminder-header-original">
                    <div class="reminder-title-original inline-editable" data-original-text="${reminder.title}">
                        ${reminder.title}
                    </div>
                    <div class="reminder-amount-original inline-editable" data-original-text="${this.formatCurrency(reminder.amount)}">
                        ${this.formatCurrency(reminder.amount)}
                    </div>
                </div>
                <div class="reminder-footer-original">
                    <div class="reminder-date-original">Vence: ${this.formatOriginalDate(reminder.dueDate)}</div>
                    <div class="reminder-status-original ${statusClass}">${statusLabel}</div>
                </div>
            </div>
            <div class="reminder-actions-original">
                <button class="btn-icon-small" onclick="window.notasManager.editReminder('${reminder.id}')" title="Editar">✏️</button>
                <button class="btn-icon-small" onclick="window.notasManager.deleteReminder('${reminder.id}')" title="Eliminar">🗑️</button>
            </div>
        </div>
    `;
}

    /**
 * ✅ Toggle estado pagado del recordatorio
 */
toggleReminderPaid(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder) {
        reminder.paid = !reminder.paid;
        reminder.updatedAt = new Date().toISOString();
        
        this.saveData();
        this.refreshRemindersList();
        
        const status = reminder.paid ? 'pagado' : 'pendiente';
        this.showNotification('💳 Recordatorio actualizado', `Marcado como ${status}`, 'success');
    }
}

   /**
     * 📅 Renderizar modal de recordatorio
     */
    renderReminderModal() {
        return `
            <div class="modal-overlay" id="reminderModal" style="display: none;">
                <div class="modal-content-reminder">
                    <div class="modal-header-reminder">
                        <h3>📅 Nuevo Recordatorio</h3>
                        <button class="close-btn-reminder" onclick="window.notasManager.closeReminderModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body-reminder">
                        <div class="form-group-reminder">
                            <label for="reminderTitle">📝 Título:</label>
                            <input type="text" id="reminderTitle" placeholder="Ej: Tarjeta de crédito, Arriendo...">
                        </div>
                        
                        <div class="form-group-reminder">
                            <label for="reminderAmount">💰 Monto:</label>
                            <input type="number" id="reminderAmount" placeholder="0">
                        </div>
                        
                        <div class="form-group-reminder">
                            <label for="reminderDate">📅 Fecha de vencimiento:</label>
                            <input type="date" id="reminderDate" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>

                   <div class="modal-footer-reminder">
                        <button class="btn-reminder primary" onclick="window.notasManager.saveReminder()">📅 Guardar Recordatorio</button>
                        <button class="btn-reminder secondary" onclick="window.notasManager.closeReminderModal()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 🔍 Obtener tareas filtradas (formato original)
     */
    getFilteredTasksOriginal() {
        if (this.currentFilter === 'all') {
            return this.tasks;
        }
        return this.tasks.filter(task => task.category === this.currentFilter);
    }

    /**
     * 📅 Formatear fecha (formato original)
     */
    formatOriginalDate(dateString) {
    if (!dateString) return 'Sin fecha';
    
    const date = new Date(dateString + 'T00:00:00'); // Forzar timezone local
    const today = new Date();
    
    // Normalizar fechas solo con día/mes/año
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    console.log('🔍 Formato fecha:', { 
        original: dateString, 
        parsed: targetDate, 
        today: todayDate,
        isToday: targetDate.getTime() === todayDate.getTime(),
        isTomorrow: targetDate.getTime() === tomorrowDate.getTime()
    });
    
    if (targetDate.getTime() === todayDate.getTime()) {
        return 'Hoy';
    } else if (targetDate.getTime() === tomorrowDate.getTime()) {
        return 'Mañana';
    } else {
        return date.toLocaleDateString('es-CL', { 
            day: 'numeric', 
            month: 'short'
        });
    }
}

    /**
     * 📅 Abrir modal de recordatorio CON NAVEGACIÓN ENTER
     */
    openReminderModal() {
        const modal = document.getElementById('reminderModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Limpiar campos
            const titleInput = document.getElementById('reminderTitle');
            const amountInput = document.getElementById('reminderAmount');
            const dateInput = document.getElementById('reminderDate');
            
            if (titleInput) titleInput.value = '';
            if (amountInput) amountInput.value = '';
            if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
            
            // 🆕 CONFIGURAR NAVEGACIÓN CON ENTER
            this.setupReminderEnterNavigation();
            
            // Focus en el primer campo
            setTimeout(() => {
                if (titleInput) {
                    titleInput.focus();
                }
            }, 100);
        }
    }

    /**
 * 🆕 CONFIGURAR NAVEGACIÓN CON ENTER EN MODAL RECORDATORIOS
 */
setupReminderEnterNavigation() {
    const titleInput = document.getElementById('reminderTitle');
    const amountInput = document.getElementById('reminderAmount');
    
    // Limpiar event listeners anteriores para evitar duplicados
    if (titleInput) {
        titleInput.replaceWith(titleInput.cloneNode(true));
    }
    if (amountInput) {
        amountInput.replaceWith(amountInput.cloneNode(true));
    }
    
    // Obtener referencias actualizadas
    const newTitleInput = document.getElementById('reminderTitle');
    const newAmountInput = document.getElementById('reminderAmount');
    
    if (!newTitleInput || !newAmountInput) {
        console.warn('⚠️ No se encontraron campos del modal de recordatorios');
        return;
    }
    
    // 🎯 EVENTO ENTER EN TÍTULO
    newTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // Validar que el título no esté vacío
            const titleValue = newTitleInput.value.trim();
            if (!titleValue) {
                // Mantener focus en título si está vacío
                newTitleInput.focus();
                this.showNotification('⚠️ Campo requerido', 'El título es obligatorio', 'warning');
                return;
            }
            
            // Cambiar foco al campo de monto
            newAmountInput.focus();
            newAmountInput.select(); // Seleccionar contenido actual si lo hay
        }
    });
    
    // 🎯 EVENTO ENTER EN MONTO
    newAmountInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            
            // Guardar automáticamente
            this.saveReminderFromEnter();
        }
    });
    
    console.log('✅ Navegación Enter configurada para modal recordatorios');
}

    /**
 * 🆕 GUARDAR RECORDATORIO DESDE NAVEGACIÓN ENTER
 */
saveReminderFromEnter() {
    const titleInput = document.getElementById('reminderTitle');
    const amountInput = document.getElementById('reminderAmount');
    const dateInput = document.getElementById('reminderDate');
    
    // Validar campos requeridos
    if (!titleInput || !titleInput.value.trim()) {
        this.showNotification('⚠️ Campo requerido', 'El título es obligatorio', 'warning');
        if (titleInput) titleInput.focus();
        return;
    }
    
    // Crear recordatorio
    const newReminder = {
        id: this.generateId(),
        title: titleInput.value.trim(),
        amount: amountInput ? parseFloat(amountInput.value) || 0 : 0,
        dueDate: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
        status: this.calculateReminderStatus(dateInput ? dateInput.value : new Date().toISOString().split('T')[0]),
        createdAt: new Date().toISOString()
    };
    
    // Guardar y actualizar
    this.reminders.unshift(newReminder);
    this.saveData();
    this.refreshRemindersList();
    this.closeReminderModal();
    
    // Mostrar confirmación
    this.showNotification('✅ Recordatorio creado', `"${newReminder.title}" agregado exitosamente`, 'success');
    
    console.log('✅ Recordatorio guardado desde navegación Enter:', newReminder);
}

    /**
     * 🔒 Cerrar modal de recordatorio
     */
    closeReminderModal() {
        const modal = document.getElementById('reminderModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
     * 💾 Guardar tarea desde modal
     */
    saveTask() {
        const textarea = document.getElementById('taskTextarea');
        const categorySelect = document.getElementById('categorySelect');
        const prioritySelect = document.getElementById('prioritySelect');
        const dueDateInput = document.getElementById('dueDateInput');
        
        if (!textarea || !textarea.value.trim()) {
            this.showNotification('⚠️ Campo requerido', 'Debes escribir o dictar una tarea', 'warning');
            return;
        }


    // 🔍 DEBUG: Ver qué fecha se está capturando
    console.log('🔍 Fecha capturada:', dueDateInput ? dueDateInput.value : 'NO ENCONTRADO');

    const newTask = {
        id: this.generateId(),
        title: textarea.value.trim(),
        category: categorySelect ? categorySelect.value : 'personal',
        priority: prioritySelect ? prioritySelect.value : 'medium',
        completed: false,
        dueDate: dueDateInput ? dueDateInput.value : new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    
    // 🔍 DEBUG: Ver el objeto completo
    console.log('🔍 Tarea creada:', newTask);
    
    this.tasks.unshift(newTask);
    this.saveData();
    this.refreshTasksList();
    this.closeTaskModal();    // ✅ Ahora cierra el modal correcto
    this.showNotification('✅ Tarea creada', newTask.title, 'success');   
        
}

    /**
     * 💾 Guardar recordatorio desde modal
     */
    saveReminder() {
        const titleInput = document.getElementById('reminderTitle');
        const amountInput = document.getElementById('reminderAmount');
        const dateInput = document.getElementById('reminderDate');
        
        if (!titleInput || !titleInput.value.trim()) {
            this.showNotification('⚠️ Campo requerido', 'Debes escribir un título', 'warning');
            return;
        }
        
        const newReminder = {
            id: this.generateId(),
            title: titleInput.value.trim(),
            amount: amountInput ? parseFloat(amountInput.value) || 0 : 0,
            dueDate: dateInput ? dateInput.value : new Date().toISOString().split('T')[0],
            status: this.calculateReminderStatus(dateInput ? dateInput.value : new Date().toISOString().split('T')[0]),
            createdAt: new Date().toISOString()
        };
        
        this.reminders.unshift(newReminder);
        this.saveData();
        this.refreshRemindersList();
        this.closeReminderModal();
        
        this.showNotification('📅 Recordatorio creado', newReminder.title, 'success');
    }

        /**
     * ➕ ABRIR MODAL COMPLETO DE TAREA (sin voz)
     */
    openTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Limpiar campos
            const textarea = document.getElementById('taskTextarea');
            const categorySelect = document.getElementById('categorySelect');
            const prioritySelect = document.getElementById('prioritySelect');
            const dueDateInput = document.getElementById('dueDateInput');
            
            if (textarea) textarea.value = '';
            if (categorySelect) categorySelect.value = 'personal';
            if (prioritySelect) prioritySelect.value = 'medium';
            if (dueDateInput) dueDateInput.value = new Date().toISOString().split('T')[0];
            
            // Focus en el primer campo
            setTimeout(() => {
                if (textarea) {
                    textarea.focus();
                }
            }, 100);
        }
    }

        /**
     * 🔒 CERRAR MODAL DE TAREA
     */
    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    /**
 * 📝 RENDERIZAR MODAL DE TAREA (sin voz)
 */
renderTaskModal() {
    return `
        <div class="modal-overlay" id="taskModal" style="display: none;">
            <div class="modal-content-task">
                <div class="modal-header-task">
                    <h3>📝 Nueva Tarea</h3>
                    <button class="close-btn-task" onclick="window.notasManager.closeTaskModal()">&times;</button>
                </div>
                
                <div class="modal-body-task">
                    <!-- Texto de la tarea -->
                    <div class="task-input-section">
                        <label for="taskTextarea">📝 Descripción de la tarea:</label>
                        <textarea id="taskTextarea" 
                                placeholder="Escribe aquí la descripción de tu tarea..."></textarea>
                    </div>

                    <!-- Controles del formulario -->
                    <div class="form-controls-task">
                        <div class="form-row-task">
                            <div class="form-group-task">
                                <label for="categorySelect">📁 Categoría:</label>
                                <select id="categorySelect">
                                    <option value="personal">👤 Personal</option>
                                    <option value="work">💼 Trabajo</option>
                                    <option value="family">👨‍👩‍👧‍👦 Familia</option>
                                    <option value="financial">💰 Financiera</option>
                                </select>
                            </div>
                            
                            <div class="form-group-task">
                                <label for="prioritySelect">🎯 Prioridad:</label>
                                <select id="prioritySelect">
                                    <option value="low">🟢 Baja</option>
                                    <option value="medium">🟡 Media</option>
                                    <option value="high">🔴 Alta</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row-task">
                            <div class="form-group-task">
                                <label for="dueDateInput">📅 Fecha límite:</label>
                                <input type="date" id="dueDateInput" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer-task">
                    <button class="btn-task primary" onclick="window.notasManager.saveTask()">💾 Guardar Tarea</button>
                    <button class="btn-task secondary" onclick="window.notasManager.closeTaskModal()">Cancelar</button>
                </div>
            </div>
        </div>
    `;
}

    /**
     * ✅ Alternar completado de tarea
     */
    toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? new Date().toISOString() : null;
        task.updatedAt = new Date().toISOString();
        
        if (this.currentSort === 'mi-orden') {
            if (task.completed) {
                // ✅ COMPLETAR: Mover al final
                this.moveCompletedToBottom();
            } else {
                // ⚪ DESMARCAR: Mover al inicio
                this.moveTaskToTop(taskId);
            }
        } else {
            this.saveData();
            this.refreshTasksList();
        }
        
        const status = task.completed ? 'completada' : 'pendiente';
        this.showNotification('✅ Tarea actualizada', `Tarea marcada como ${status}`, 'success');
    }
}

    /**
 * ✅ Alternar estado de recordatorio (pagado/pendiente)
 */
toggleReminder(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder) {
        reminder.paid = !reminder.paid;
        reminder.paidAt = reminder.paid ? new Date().toISOString() : null;
        reminder.updatedAt = new Date().toISOString();
        
        if (reminder.paid) {
            // ✅ MARCAR COMO PAGADO: Mover al final
            this.movePaidToBottom();
        } else {
            // ⚪ DESMARCAR: Mover al inicio
            this.moveReminderToTop(reminderId);
        }
        
        const status = reminder.paid ? 'pagado' : 'pendiente';
        this.showNotification('✅ Recordatorio actualizado', `Recordatorio marcado como ${status}`, 'success');
    }
}

/**
 * ⬇️ MOVER RECORDATORIOS PAGADOS AL FINAL
 */
movePaidToBottom() {
    const unpaidReminders = this.reminders.filter(reminder => !reminder.paid);
    const paidReminders = this.reminders.filter(reminder => reminder.paid);
    this.reminders = [...unpaidReminders, ...paidReminders];
    this.saveData();
    this.refreshRemindersList();
}

/**
 * ⬆️ MOVER RECORDATORIO AL INICIO
 */
moveReminderToTop(reminderId) {
    const reminderIndex = this.reminders.findIndex(reminder => reminder.id === reminderId);
    if (reminderIndex === -1) return;
    
    // Extraer el recordatorio
    const [reminder] = this.reminders.splice(reminderIndex, 1);
    
    // Agregar al inicio
    this.reminders.unshift(reminder);
    
    this.saveData();
    this.refreshRemindersList();
}

    /**
     * ✏️ Editar tarea
     */
    async editTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const newTitle = await this.showEditModal('Editar Tarea', task.title, 'Ingresa el nuevo título');
    if (newTitle && newTitle.trim() !== task.title) {
        task.title = newTitle.trim();
        task.modifiedAt = new Date().toISOString();
        this.saveData();
        this.refreshTasksList();
        this.showNotification('✏️ Tarea actualizada', task.title, 'success');
    }
}

    /**
     * 🗑️ Eliminar tarea
     */
    async deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const confirmed = await this.showConfirmModal(
        'Eliminar Tarea',
        `¿Estás seguro de que quieres eliminar la tarea "${task.title}"?`,
        'Eliminar',
        'Cancelar',
        'danger'
    );
    
    if (confirmed) {
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        this.saveData();
        this.refreshTasksList();
        this.showNotification('🗑️ Tarea eliminada', task.title, 'info');
    }
}

    /**
     * ✅ Marcar recordatorio como pagado
     */
    async markAsPaid(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) return;
    
    const confirmed = await this.showConfirmModal(
        'Marcar como Pagado',
        `¿Marcar "${reminder.title}" como pagado?`,
        'Marcar Pagado',
        'Cancelar',
        'primary'
    );
    
    if (confirmed) {
        this.reminders = this.reminders.filter(r => r.id !== reminderId);
        this.saveData();
        this.refreshRemindersList();
        this.showNotification('✅ Pagado', reminder.title, 'success');
    }
}

    /**
     * ✏️ Editar recordatorio
     */
    async editReminder(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) return;
    
    const newTitle = await this.showEditModal('Editar Recordatorio', reminder.title, 'Ingresa el nuevo título');
    if (newTitle && newTitle.trim() !== reminder.title) {
        reminder.title = newTitle.trim();
        reminder.modifiedAt = new Date().toISOString();
        this.saveData();
        this.refreshRemindersList();
        this.showNotification('✏️ Recordatorio actualizado', reminder.title, 'success');
    }
}

    /**
     * 🗑️ Eliminar recordatorio
     */
    async deleteReminder(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) return;
    
    const confirmed = await this.showConfirmModal(
        'Eliminar Recordatorio',
        `¿Estás seguro de que quieres eliminar el recordatorio "${reminder.title}"?`,
        'Eliminar',
        'Cancelar',
        'danger'
    );
    
    if (confirmed) {
        this.reminders = this.reminders.filter(r => r.id !== reminderId);
        this.saveData();
        this.refreshRemindersList();
        this.showNotification('🗑️ Recordatorio eliminado', reminder.title, 'info');
    }
}

    // =================================================================
    // 🧩 MÉTODOS DE UTILIDAD Y PROCESAMIENTO
    // =================================================================

    /**
     * 🎯 Procesar comandos de voz (local)
     */
    processVoiceCommands(text) {
        const lowerText = text.toLowerCase();
        
        // Detectar tipo de comando
        if (lowerText.includes('tarea') || lowerText.includes('crear') || lowerText.includes('agregar')) {
            this.parseTaskCommand(text);
        } else if (lowerText.includes('recordar') || lowerText.includes('recordatorio')) {
            this.parseReminderCommand(text);
        } else if (lowerText.includes('gasto') || lowerText.includes('pagar')) {
            this.parseExpenseCommand(text);
        } else {
            // Comando genérico - crear tarea
            this.parseTaskCommand(text);
        }
    }

    // =================================================================
    // 🛠️ MÉTODOS DE SOPORTE Y CONFIGURACIÓN
    // =================================================================

    /**
     * 🎨 Cargar CSS específico de notas
     */
    async loadNotasCSS() {
        const existingLink = document.querySelector('link[href*="notas.css"]');
        if (existingLink) {
            console.log('📄 CSS notas.css ya está cargado');
            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'varios/css/notas.css';
            link.onload = () => {
                console.log('✅ CSS notas.css cargado');
                resolve();
            };
            link.onerror = () => {
                console.warn('⚠️ No se pudo cargar notas.css');
                resolve();
            };
            document.head.appendChild(link);
        });
    }

    /**
     * 💾 Cargar datos almacenados
     */
    loadStoredData() {
        try {
            const storedTasks = localStorage.getItem(this.storageKey);
            const storedReminders = localStorage.getItem(this.remindersKey);
            
            this.tasks = storedTasks ? JSON.parse(storedTasks) : this.getDefaultTasks();
            this.reminders = storedReminders ? JSON.parse(storedReminders) : this.getDefaultReminders();

            // Cargar preferencia de mostrar completadas
            const showCompletedPref = localStorage.getItem('wisespend_show_completed');
            this.showCompleted = showCompletedPref !== null ? showCompletedPref === 'true' : true;
            // Cargar preferencia de mostrar pagados
            const showPaidPref = localStorage.getItem('wisespend_show_paid');
            this.showPaid = showPaidPref !== null ? JSON.parse(showPaidPref) : true;
            
            console.log(`📚 Datos cargados: ${this.tasks.length} tareas, ${this.reminders.length} recordatorios`);
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            this.tasks = this.getDefaultTasks();
            this.reminders = this.getDefaultReminders();
        }
    }

    /**
     * 📝 Datos por defecto de tareas
     */
    getDefaultTasks() {
        return [
            {
                id: this.generateId(),
                title: 'Revisar presupuesto mensual',
                category: 'financial',
                priority: 'high',
                completed: false,
                dueDate: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: 'Llamar al dentista para Norman Jr.',
                category: 'family',
                priority: 'medium',
                completed: false,
                dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: 'Actualizar CV y LinkedIn',
                category: 'work',
                priority: 'medium',
                completed: false,
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: 'Planificar vacaciones familiares',
                category: 'family',
                priority: 'low',
                completed: false,
                dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * 📅 Datos por defecto de recordatorios
     */
    getDefaultReminders() {
        const today = new Date();
        return [
            {
                id: this.generateId(),
                title: '💳 Tarjeta de Crédito',
                amount: 89500,
                dueDate: new Date(today.getTime() + 86400000).toISOString().split('T')[0],
                status: 'urgent',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: '🏠 Arriendo',
                amount: 450000,
                dueDate: new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0],
                status: 'warning',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: '⚡ Electricidad',
                amount: 28750,
                dueDate: new Date(today.getTime() + 15 * 86400000).toISOString().split('T')[0],
                status: 'ok',
                createdAt: new Date().toISOString()
            },
            {
                id: this.generateId(),
                title: '📱 Plan Móvil',
                amount: 15990,
                dueDate: new Date(today.getTime() + 18 * 86400000).toISOString().split('T')[0],
                status: 'ok',
                createdAt: new Date().toISOString()
            }
        ];
    }

    /**
     * 🧩 Funciones de utilidad
     */
    generateId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    getCategoryName(category) {
        const names = {
            personal: 'Personal',
            work: 'Trabajo',
            family: 'Familia',
            financial: 'Financiera'
        };
        return names[category] || 'General';
    }

    calculateReminderStatus(dueDate) {
        const date = new Date(dueDate);
        const today = new Date();
        const diffTime = date - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 1) {
            return 'urgent';
        } else if (diffDays <= 7) {
            return 'warning';
        } else {
            return 'ok';
        }
    }

    /**
     * 💾 Guardar datos en localStorage
     */
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
            localStorage.setItem(this.remindersKey, JSON.stringify(this.reminders));
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    }

        /**
     * 🎛️ Configurar eventos globales
     */
    bindEvents() {
        // Cerrar modales con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                this.closeReminderModal();
            }
        });

        // Cerrar modales clickeando fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeTaskModal();
                this.closeReminderModal();
            }
        });

        // 🆕 AGREGAR ESTA SECCIÓN:
        // Guardar tarea con Enter en textarea
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'taskTextarea') {
                e.preventDefault(); // Evitar salto de línea
                this.saveTask(); // Guardar automáticamente
            }
        });
    }

    /**
     * 📢 Mostrar notificación
     */
    showNotification(title, message, type = 'info') {
        // Usar sistema de notificaciones global si existe
        if (window.modalSystem && window.modalSystem.showMessage) {
            window.modalSystem.showMessage(message, type);
            return;
        }

        // Crear notificación básica
        const notification = document.createElement('div');
        notification.className = `notification-basic ${type}`;
        notification.innerHTML = `
            <div class="notification-content-basic">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 12px 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    /**
     * ❌ Mostrar error
     */
    showError(message) {
        this.showNotification('❌ Error', message, 'error');
    }

    /**
     * 🗑️ Limpiar todos los datos
     */
    async clearAllData() {
    const confirmed = await this.showConfirmModal(
        'Eliminar Todas las Tareas',
        '¿Estás seguro de eliminar todas las tareas? Esta acción no se puede deshacer.',
        'Eliminar',
        'Cancelar',
        'danger'
    );
    
    if (confirmed) {
        this.tasks = [];                    // ✅ Solo borrar tareas
        // NO tocar this.reminders           // ✅ Mantener recordatorios intactos
        this.saveData();
        this.refreshTasksList();            // ✅ Solo refrescar tareas
        // NO llamar this.refreshRemindersList() 
        this.showNotification('🗑️ Tareas eliminadas', 'Todas las tareas han sido borradas.', 'info');
    }
}

    /**
     * 📤 Exportar datos
     */
    exportData() {
        const data = {
            tasks: this.tasks,
            reminders: this.reminders,
            exportDate: new Date().toISOString(),
            version: '2.1.0'
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `wisespend-notas-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        this.showNotification('📤 Exportado', 'Datos exportados correctamente', 'success');
    }

    /**
     * 🧪 Funciones de desarrollo y debug
     */
    getDebugInfo() {
        return {
            version: '2.1.0',
            initialized: this.initialized,
            tasksCount: this.tasks.length,
            remindersCount: this.reminders.length,
            isConnected: this.isConnected,
            useWebSocket: this.useWebSocket,
            hasRecognition: !!this.recognition,
            currentFilter: this.currentFilter,
            currentSort: this.currentSort,
            isListening: this.isListening
        };
    }

    /**
 * 📋 MOSTRAR MENÚ DE ORDENAMIENTO
 */
showSortMenu() {
    const existingMenu = document.querySelector('.sort-submenu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const optionsMenu = document.querySelector('.options-menu-notas');
    if (!optionsMenu) return;

    const sortMenu = document.createElement('div');
    sortMenu.className = 'sort-submenu';
    sortMenu.innerHTML = `
        <div class="sort-menu-header">📋 Ordenar por</div>
        <div class="sort-option ${this.currentSort === 'mi-orden' ? 'active' : ''}" onclick="window.notasManager.setSortOrder('mi-orden')">
            ✓ Mi orden
        </div>
        <div class="sort-option" onclick="console.log('🎯 Click detectado en Fecha'); window.notasManager.setSortOrder('fecha')">
            📅 Fecha
        </div>
        <div class="sort-option ${this.currentSort === 'recientes' ? 'active' : ''}" onclick="window.notasManager.setSortOrder('recientes')">
            🔄 Destacadas recientemente
        </div>
        <div class="sort-option ${this.currentSort === 'titulo' ? 'active' : ''}" onclick="window.notasManager.setSortOrder('titulo')">
            🔤 Título
        </div>
        <hr class="sort-divider">
        <div class="sort-option" onclick="window.notasManager.moveCompletedToBottom()">
            ⬇️ Mover completadas al final
        </div>
    `;
   
        optionsMenu.appendChild(sortMenu); 
        setTimeout(() => {
            sortMenu.classList.add('active');
        }, 10);
    
    // Cerrar al hacer click fuera
    setTimeout(() => {
        document.addEventListener('click', function closeSortMenu(e) {
            if (!sortMenu.contains(e.target)) {
                sortMenu.classList.remove('active');
    setTimeout(() => {
        if (sortMenu.parentNode) {
            sortMenu.remove();
        }
    }, 300);
                document.removeEventListener('click', closeSortMenu);
            }
        });
    }, 100);    
}

/**
 * 📋 MOSTRAR MENÚ DE ORDENAMIENTO DE RECORDATORIOS
 */
showRemindersSortMenu() {
    const existingMenu = document.querySelector('.sort-submenu-reminders');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }

    const optionsMenu = document.querySelector('#remindersOptionsMenu .dropdown-menu-notas');
    if (!optionsMenu) return;

    const sortMenu = document.createElement('div');
    sortMenu.className = 'sort-submenu sort-submenu-reminders';
    sortMenu.innerHTML = `
        <div class="sort-menu-header">📋 Ordenar recordatorios por</div>
        <div class="sort-option ${this.currentReminderSort === 'fecha' ? 'active' : ''}" onclick="window.notasManager.setReminderSortOrder('fecha')">
            📅 Fecha de vencimiento
        </div>
        <div class="sort-option ${this.currentReminderSort === 'estado' ? 'active' : ''}" onclick="window.notasManager.setReminderSortOrder('estado')">
            🚨 Estado (urgente primero)
        </div>
        <div class="sort-option ${this.currentReminderSort === 'monto' ? 'active' : ''}" onclick="window.notasManager.setReminderSortOrder('monto')">
            💰 Monto (mayor primero)
        </div>
        <div class="sort-option ${this.currentReminderSort === 'titulo' ? 'active' : ''}" onclick="window.notasManager.setReminderSortOrder('titulo')">
            🔤 Título (A-Z)
        </div>
    `;

        optionsMenu.appendChild(sortMenu);
        setTimeout(() => {
            sortMenu.classList.add('active');
        }, 10);
    
    // Cerrar al hacer click fuera
    setTimeout(() => {
        document.addEventListener('click', function closeSortMenu(e) {
            if (!sortMenu.contains(e.target)) {
                sortMenu.classList.remove('active');
    setTimeout(() => {
        if (sortMenu.parentNode) {
            sortMenu.remove();
        }
    }, 300);
                document.removeEventListener('click', closeSortMenu);
            }
        });
    }, 10);
}

/**
 * 🔄 ESTABLECER ORDEN DE RECORDATORIOS
 */
setReminderSortOrder(sortType) {
    this.currentReminderSort = sortType;
    this.refreshRemindersList();
    
    // Guardar preferencia
    localStorage.setItem('wisespend_reminder_sort', sortType);
    
     // Cerrar menús
        const sortMenu = document.querySelector('.sort-submenu-reminders');
        const optionsMenu = document.querySelector('#remindersOptionsMenu .dropdown-menu-notas');
    if (sortMenu) {
        sortMenu.classList.remove('active');
        setTimeout(() => {
            if (sortMenu.parentNode) {
                sortMenu.remove();
            }
        }, 300);
    }
    if (optionsMenu) optionsMenu.classList.remove('active');
    
    const sortNames = {
        'fecha': 'Fecha de vencimiento',
        'estado': 'Estado',
        'monto': 'Monto',
        'titulo': 'Título'
    };
    
    this.showNotification('📋 Orden cambiado', `Recordatorios ordenados por: ${sortNames[sortType]}`, 'info');
}

/**
 * 🔄 ESTABLECER ORDEN DE CLASIFICACIÓN
 */
setSortOrder(sortType) {
    console.log('🔄 Ordenando por:', sortType); 
    this.currentSort = sortType;
    this.sortTasks();
    this.refreshTasksList();
    this.saveData();
    
    // Cerrar menú
    const sortMenu = document.querySelector('.sort-submenu');
    if (sortMenu) {
    sortMenu.classList.remove('active');
    setTimeout(() => {
        if (sortMenu.parentNode) {
            sortMenu.remove();
        }
    }, 300);
}
    
    this.showNotification('📋 Ordenamiento aplicado', `Ordenado por: ${this.getSortDisplayName(sortType)}`, 'info');
}

/**
 * 📝 OBTENER NOMBRE DE VISUALIZACIÓN DEL ORDENAMIENTO
 */
getSortDisplayName(sortType) {
    const names = {
        'mi-orden': 'Mi orden',
        'fecha': 'Fecha',
        'recientes': 'Destacadas recientemente',
        'titulo': 'Título'
    };
    return names[sortType] || sortType;
}

/**
 * 🔄 ORDENAR TAREAS
 */
sortTasks() {
    switch (this.currentSort) {
        case 'fecha':
            this.tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // ✅ Orden cronológico correcto
            break;
        case 'recientes':
            this.tasks.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
            break;
        case 'titulo':
            this.tasks.sort((a, b) => a.title.localeCompare(b.title));  // ✅ CORRECTO
            break;
        case 'mi-orden':
        default:
            // Mantener orden original, pero completadas al final
            this.moveCompletedToBottom();
            return;
    }
    
    // Siempre mover completadas al final
    this.moveCompletedToBottom();
}

/**
 * ⬇️ MOVER TAREAS COMPLETADAS AL FINAL
 */
moveCompletedToBottom() {
    const incompleteTasks = this.tasks.filter(task => !task.completed);
    const completedTasks = this.tasks.filter(task => task.completed);
    this.tasks = [...incompleteTasks, ...completedTasks];
    this.saveData();
    this.refreshTasksList();
}

/**
 * ⬆️ MOVER TAREA AL INICIO
 */
moveTaskToTop(taskId) {
    const taskIndex = this.tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;
    
    // Extraer la tarea
    const [task] = this.tasks.splice(taskIndex, 1);
    
    // Agregar al inicio
    this.tasks.unshift(task);
    
    this.saveData();
    this.refreshTasksList();
}

/**
 * 👁️ TOGGLE VISIBILIDAD DE COMPLETADAS
 */
toggleCompletedVisibility() {
    this.showCompleted = !this.showCompleted;
    this.refreshTasksList();
    
    // 💾 Guardar preferencia
    localStorage.setItem('wisespend_show_completed', this.showCompleted.toString());
    
    const message = this.showCompleted ? 'Mostrando tareas completadas' : 'Ocultando tareas completadas';
    this.showNotification('👁️ Visibilidad cambiada', message, 'info');
}

/**
 * 🗑️ LIMPIAR TAREAS COMPLETADAS
 */
async clearCompleted() {
    const completedCount = this.tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
        this.showNotification('ℹ️ Sin tareas completadas', 'No hay tareas completadas para eliminar', 'info');
        return;
    }
    
    const confirmed = await this.showConfirmModal(
        'Limpiar Completadas',
        `¿Eliminar ${completedCount} tarea${completedCount > 1 ? 's' : ''} completada${completedCount > 1 ? 's' : ''}?`,
        'Eliminar',
        'Cancelar',
        'danger'
    );
    
    if (confirmed) {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveData();
        this.refreshTasksList();
        this.showNotification('🗑️ Completadas eliminadas', `${completedCount} tareas eliminadas`, 'success');
    }
}

/**
 * 👁️ TOGGLE VISIBILIDAD DE RECORDATORIOS PAGADOS
 */
togglePaidVisibility() {
    this.showPaid = !this.showPaid;
    this.refreshRemindersList();
    
    // Guardar preferencia
    localStorage.setItem('wisespend_show_paid', this.showPaid.toString());
    
    const message = this.showPaid ? 'Mostrando recordatorios pagados' : 'Ocultando recordatorios pagados';
    this.showNotification('👁️ Visibilidad cambiada', message, 'info');
    
    // Cerrar menú
    const menu = document.getElementById('remindersOptionsMenu');
    if (menu) menu.classList.remove('active');
}

/**
 * 🧹 LIMPIAR RECORDATORIOS PAGADOS
 */
async clearPaidReminders() {
    const paidCount = this.reminders.filter(reminder => reminder.paid).length;
    
    if (paidCount === 0) {
        this.showNotification('ℹ️ Sin recordatorios pagados', 'No hay recordatorios pagados para eliminar', 'info');
        return;
    }
    
    const confirmed = await this.showConfirmModal(
        'Limpiar Pagados',
        `¿Eliminar ${paidCount} recordatorio${paidCount > 1 ? 's' : ''} pagado${paidCount > 1 ? 's' : ''}?`,
        'Eliminar',
        'Cancelar',
        'danger'
    );
    
    if (confirmed) {
        this.reminders = this.reminders.filter(reminder => !reminder.paid);
        this.saveData();
        this.refreshRemindersList();
        this.showNotification('🧹 Pagados eliminados', `${paidCount} recordatorios eliminados`, 'success');
    }
    
    // Cerrar menú
    const menu = document.getElementById('remindersOptionsMenu');
    if (menu) menu.classList.remove('active');
}

/**
 * 🗑️ LIMPIAR TODOS LOS RECORDATORIOS
 */
async clearAllReminders() {
    const totalCount = this.reminders.length;
    
    if (totalCount === 0) {
        this.showNotification('ℹ️ Sin recordatorios', 'No hay recordatorios para eliminar', 'info');
        return;
    }
    
    const confirmed = await this.showConfirmModal(
        'Eliminar Todos los Recordatorios',
        `¿Estás seguro de eliminar TODOS los ${totalCount} recordatorios? Esta acción no se puede deshacer.`,
        'Eliminar Todo',
        'Cancelar',
        'danger'
    );
    
    if (confirmed) {
        this.reminders = [];
        this.saveData();
        this.refreshRemindersList();
        this.showNotification('🗑️ Recordatorios eliminados', 'Todos los recordatorios han sido borrados', 'info');
    }
    
    // Cerrar menú
    const menu = document.getElementById('remindersOptionsMenu');
    if (menu) menu.classList.remove('active');
}  

/**
 * ✅ TOGGLE COMPLETAR TAREA
 */
toggleTaskCompletion(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.completed = !task.completed;
    task.updatedAt = new Date().toISOString();
    
    // Mover automáticamente al final si se completa
    if (task.completed && this.currentSort === 'mi-orden') {
        this.moveCompletedToBottom();
    } else {
        this.saveData();
        this.refreshTasksList();
    }
    
    const status = task.completed ? 'completada' : 'pendiente';
    this.showNotification('✅ Tarea actualizada', `Tarea marcada como ${status}`, 'success');
}

/**
 * ✏️ MOSTRAR MODAL DE EDICIÓN PERSONALIZADO
 */
showEditModal(title, currentValue, placeholder = '') {
    return new Promise((resolve) => {
        // Crear modal si no existe
        let modal = document.getElementById('edit-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'edit-modal';
            modal.className = 'confirm-modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="confirm-modal">
                <div class="confirm-modal-header">
                    <h3 class="confirm-modal-title">
                        ✏️ ${title}
                    </h3>
                </div>
                <div class="confirm-modal-body">
                    <p class="confirm-modal-message">Ingresa el nuevo texto:</p>
                    <input type="text" id="editInput" value="${currentValue}" 
                           placeholder="${placeholder}" 
                           style="width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 14px; margin-top: 12px; box-sizing: border-box;">
                </div>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn confirm-btn-cancel" data-action="cancel">
                        Cancelar
                    </button>
                    <button class="confirm-btn confirm-btn-primary" data-action="confirm">
                        Guardar
                    </button>
                </div>
            </div>
        `;

        // Mostrar modal
        setTimeout(() => modal.classList.add('active'), 10);
        
        // Focus y seleccionar texto
        setTimeout(() => {
            const input = modal.querySelector('#editInput');
            if (input) {
                input.focus();
                input.select();
            }
        }, 100);

        // Event listeners
        const handleClick = (e) => {
            const action = e.target.dataset.action;
            if (action) {
                let result = null;
                if (action === 'confirm') {
                    const input = modal.querySelector('#editInput');
                    result = input ? input.value.trim() : null;
                }
                
                modal.classList.remove('active');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
                resolve(result);
            }
        };

        // Enter para guardar, Escape para cancelar
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const input = modal.querySelector('#editInput');
                const result = input ? input.value.trim() : null;
                modal.classList.remove('active');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
                resolve(result);
            } else if (e.key === 'Escape') {
                handleClick({ target: { dataset: { action: 'cancel' } } });
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleClick({ target: { dataset: { action: 'cancel' } } });
            }
        });

        modal.addEventListener('click', handleClick);
    });
}

/**
 * 🗂️ MOSTRAR MODAL DE CONFIRMACIÓN PERSONALIZADO
 */
showConfirmModal(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'danger') {
    return new Promise((resolve) => {
        // Crear modal si no existe
        let modal = document.getElementById('confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirm-modal';
            modal.className = 'confirm-modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="confirm-modal">
                <div class="confirm-modal-header">
                    <h3 class="confirm-modal-title">
                        ${type === 'danger' ? '⚠️' : type === 'info' ? 'ℹ️' : '❓'} ${title}
                    </h3>
                </div>
                <div class="confirm-modal-body">
                    <p class="confirm-modal-message">${message}</p>
                </div>
                <div class="confirm-modal-actions">
                    <button class="confirm-btn confirm-btn-cancel" data-action="cancel">
                        ${cancelText}
                    </button>
                    <button class="confirm-btn confirm-btn-${type}" data-action="confirm">
                        ${confirmText}
                    </button>
                </div>
            </div>
        `;

        // Mostrar modal
        setTimeout(() => modal.classList.add('active'), 10);

        // Event listeners
        const handleClick = (e) => {
            const action = e.target.dataset.action;
            if (action) {
                modal.classList.remove('active');
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.parentNode.removeChild(modal);
                    }
                }, 300);
                resolve(action === 'confirm');
            }
        };

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleClick({ target: { dataset: { action: 'cancel' } } });
            }
        });

        modal.addEventListener('click', handleClick);
    });
}

    /**
 * 🎨 INICIALIZAR EDICIÓN INLINE
 */
initInlineEditing() {
    // Configurar eventos de doble clic para elementos editables
    document.addEventListener('dblclick', (e) => {
        if (e.target.classList.contains('inline-editable')) {
            this.startInlineEdit(e.target);
        }
    });
    
    // Manejar clicks fuera para guardar
    document.addEventListener('click', (e) => {
        const editingElement = document.querySelector('.inline-editable.editing input');
        if (editingElement && !editingElement.contains(e.target) && e.target !== editingElement) {
            this.saveInlineEdit(editingElement);
        }
    });
}

/**
 * ✏️ INICIAR EDICIÓN INLINE
 */
startInlineEdit(element) {
    // Evitar múltiples ediciones
    if (element.classList.contains('editing')) return;
    
    const originalText = element.textContent.trim();
    const elementType = this.getElementType(element);
    
    // Crear input
    const input = document.createElement('input');
    input.type = elementType === 'amount' ? 'number' : 'text';
    input.value = elementType === 'amount' ? this.extractNumber(originalText) : originalText;
    input.className = 'inline-edit-input';
    
    // Configurar input
    if (elementType === 'amount') {
        input.step = '0.01';
        input.min = '0';
    }
    
    // Eventos del input
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            this.saveInlineEdit(input);
        } else if (e.key === 'Escape') {
            this.cancelInlineEdit(input, originalText);
        }
    });
    
    input.addEventListener('blur', () => {
        this.saveInlineEdit(input);
    });
    
    // Aplicar cambios visuales
    element.classList.add('editing');
    element.innerHTML = '';
    element.appendChild(input);
    
    // Enfocar y seleccionar
    setTimeout(() => {
        input.focus();
        input.select();
    }, 10);
}

/**
 * 💾 GUARDAR EDICIÓN INLINE
 */
saveInlineEdit(input) {
    const element = input.parentElement;
    const newValue = input.value.trim();
    const elementType = this.getElementType(element);
    
    if (!newValue && elementType !== 'amount') {
        this.cancelInlineEdit(input, element.dataset.originalText || '');
        return;
    }
    
    // Obtener IDs del elemento
    const { itemId, itemType } = this.getElementIds(element);
    
    if (!itemId || !itemType) {
        this.cancelInlineEdit(input, element.dataset.originalText || '');
        return;
    }
    
    // Actualizar datos
    const success = this.updateItemData(itemId, itemType, elementType, newValue);
    
    if (success) {
        // Restaurar elemento con nuevo valor
        const displayValue = elementType === 'amount' ? this.formatCurrency(parseFloat(newValue) || 0) : newValue;
        element.classList.remove('editing');
        element.innerHTML = displayValue;
        
        // Guardar y refrescar
        this.saveData();
        if (itemType === 'task') {
            this.refreshTasksList();
        } else {
            this.refreshRemindersList();
        }
        
        this.showNotification('✏️ Actualizado', 'Cambios guardados correctamente', 'success');
    } else {
        this.cancelInlineEdit(input, element.dataset.originalText || '');
    }
}

/**
 * ❌ CANCELAR EDICIÓN INLINE
 */
cancelInlineEdit(input, originalText) {
    const element = input.parentElement;
    element.classList.remove('editing');
    element.innerHTML = originalText;
}

/**
 * 🔍 OBTENER TIPO DE ELEMENTO
 */
getElementType(element) {
    if (element.classList.contains('reminder-amount-original')) return 'amount';
    if (element.classList.contains('task-title-original')) return 'title';
    if (element.classList.contains('reminder-title-original')) return 'title';
    return 'text';
}

/**
 * 🆔 OBTENER IDs DEL ELEMENTO
 */
getElementIds(element) {
    const taskItem = element.closest('.task-item-original');
    const reminderItem = element.closest('.reminder-item-original');
    
    if (taskItem) {
        return {
            itemId: taskItem.dataset.id,
            itemType: 'task'
        };
    } else if (reminderItem) {
        return {
            itemId: reminderItem.dataset.id,
            itemType: 'reminder'
        };
    }
    
    return { itemId: null, itemType: null };
}

/**
 * 🔢 EXTRAER NÚMERO DE TEXTO
 */
extractNumber(text) {
    const match = text.replace(/[^\d.,]/g, '').replace(',', '.');
    return parseFloat(match) || 0;
}

/**
 * 📝 ACTUALIZAR DATOS DEL ITEM
 */
updateItemData(itemId, itemType, fieldType, newValue) {
    try {
        if (itemType === 'task') {
            const task = this.tasks.find(t => t.id === itemId);
            if (!task) return false;
            
            if (fieldType === 'title') {
                task.title = newValue;
                task.modifiedAt = new Date().toISOString();
            }
        } else if (itemType === 'reminder') {
            const reminder = this.reminders.find(r => r.id === itemId);
            if (!reminder) return false;
            
            if (fieldType === 'title') {
                reminder.title = newValue;
                reminder.modifiedAt = new Date().toISOString();
            } else if (fieldType === 'amount') {
                reminder.amount = parseFloat(newValue) || 0;
                reminder.modifiedAt = new Date().toISOString();
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error actualizando item:', error);
        return false;
    }
}

    /**
     * 🔧 Reiniciar sistema
     */
    restart() {
        console.log('🔄 Reiniciando NotasManager...');
        this.initialized = false;
        this.isListening = false;
        
        if (this.socket) {
            this.socket.disconnect();
        }
        
        this.init();
    }
}

// ===== INICIALIZACIÓN GLOBAL =====

/**
 * 🚀 Crear instancia global del manager
 */
window.notasManager = new NotasManager();

/**
 * 🎯 Auto-inicializar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
    // Esperar un poco para que otros scripts se carguen
    setTimeout(() => {
        if (window.notasManager && !window.notasManager.initialized) {
            console.log('🚀 Auto-inicializando NotasManager...');
            // No inicializar automáticamente - esperar a que se navegue a "varios"
        }
    }, 1000);
});

/**
 * 🔍 Función para verificar si estamos en la sección varios
 */
function checkAndInitNotas() {
    const variosContent = document.getElementById('varios-content');
    if (variosContent && window.notasManager && !window.notasManager.initialized) {
        console.log('📝 Inicializando sistema de notas...');
        window.notasManager.init('varios-content');
    }
}

/**
 * 🔧 Debug global disponible
 */
window.notasDebug = {
    info: () => window.notasManager?.getDebugInfo(),
    restart: () => window.notasManager?.restart(),
    clear: () => window.notasManager?.clearAllData(),
    export: () => window.notasManager?.exportData(),
    testServer: () => window.notasManager?.testServerConnection()
};

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotasManager;
}

console.log('📝 NotasManager v2.1.0 completamente cargado - Interfaz Original + WebSocket');
console.log('🧪 Debug disponible en: window.notasDebug');
console.log('🎯 Manager disponible en: window.notasManager');