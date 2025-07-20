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
        this.recognition = null;
        this.isListening = false;
        this.finalTranscript = '';
        
        // Configuración
        this.storageKey = 'wisespend_notas';
        this.remindersKey = 'wisespend_recordatorios';
        
        // Estados
        this.initialized = false;
        this.container = null;
        
        // 🆕 WEBSOCKET PROPERTIES
        this.socket = null;
        this.isConnected = false;
        this.serverUrl = 'http://127.0.0.1:5000';
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 3;
        this.useWebSocket = true;
        
        console.log('📝 NotasManager v2.1.0: Interfaz Original + WebSocket...');
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
            this.initWebSocketOptimized().catch(e => console.warn('WebSocket:', e)),
            this.initSpeechRecognitionOptimized().catch(e => console.warn('Speech:', e))
        ]).then(() => {
            console.log('✅ Background processes completed');
            this.updateConnectionStatus();
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
     * 🆕 INICIALIZAR CONEXIÓN WEBSOCKET
     */
    async initWebSocket() {
        try {
            console.log('🔌 Inicializando conexión WebSocket...');
            
            // Verificar si Socket.IO está disponible
            if (typeof io === 'undefined') {
                console.log('📦 Cargando Socket.IO...');
                await this.loadSocketIO();
            }
            
            // Crear conexión
            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 5000,
                reconnection: true,
                reconnectionAttempts: 3,
                reconnectionDelay: 2000
            });
            
            // Configurar eventos
            this.setupSocketEvents();
            
            // Esperar conexión
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    console.warn('⏰ Timeout de conexión WebSocket - usando modo local');
                    this.useWebSocket = false;
                    resolve();
                }, 5000);
                
                this.socket.on('connect', () => {
                    clearTimeout(timeout);
                    this.isConnected = true;
                    this.connectionAttempts = 0;
                    console.log('✅ WebSocket conectado al servidor Python');
                    resolve();
                });
                
                this.socket.on('connect_error', (error) => {
                    clearTimeout(timeout);
                    console.warn('⚠️ Error de conexión WebSocket:', error.message);
                    this.useWebSocket = false;
                    resolve();
                });
            });
            
        } catch (error) {
            console.warn('⚠️ WebSocket no disponible, usando modo local:', error);
            this.useWebSocket = false;
        }
    }

    /**
     * 🆕 CARGAR SOCKET.IO DINÁMICAMENTE
     */
    async loadSocketIO() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.2/socket.io.js';
            script.onload = () => {
                console.log('✅ Socket.IO cargado');
                resolve();
            };
            script.onerror = () => {
                console.warn('⚠️ No se pudo cargar Socket.IO');
                reject(new Error('Socket.IO no disponible'));
            };
            document.head.appendChild(script);
        });
    }

    /**
     * 🆕 CONFIGURAR EVENTOS DE WEBSOCKET
     */
    setupSocketEvents() {
        if (!this.socket) return;
        
        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('🔗 Conectado al servidor de voz');
        });
        
        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('🔌 Desconectado del servidor de voz');
        });
        
        this.socket.on('connection_status', (data) => {
            console.log('📊 Estado de conexión:', data);
        });
        
        this.socket.on('voice_response', (data) => {
            this.handleVoiceResponse(data);
        });
        
        this.socket.on('test_response', (data) => {
            console.log('🧪 Respuesta de prueba:', data);
        });
    }

    /**
     * 🆕 MANEJAR RESPUESTA DEL SERVIDOR
     */
    handleVoiceResponse(data) {
        console.log('📥 Respuesta del servidor:', data);
        
        if (data.status === 'success' && data.result) {
            const result = data.result;
            
            // Procesar según el tipo de acción
            switch (result.action) {
                case 'add_expense':
                    this.handleExpenseFromVoice(result);
                    break;
                case 'add_task':
                    this.handleTaskFromVoice(result);
                    break;
                case 'add_reminder':
                    this.handleReminderFromVoice(result);
                    break;
                default:
                    this.updateVoiceStatus('🤖 Servidor procesó', `Comando: ${result.action}`);
            }
            
            // Actualizar UI con el texto reconocido
            const textarea = document.getElementById('taskTextarea');
            if (textarea) {
                textarea.value = result.recognized_text || '';
            }
            
        } else if (data.status === 'error') {
            console.error('❌ Error del servidor:', data.error);
            this.updateVoiceStatus('❌ Error del servidor', data.error);
        }
    }

    /**
     * 🆕 PROCESAR TAREA DESDE SERVIDOR
     */
    handleTaskFromVoice(result) {
        if (result.details) {
            const details = result.details;
            
            // Llenar campos del formulario
            if (details.title) {
                const textarea = document.getElementById('taskTextarea');
                if (textarea) textarea.value = details.title;
            }
            
            if (details.priority) {
                const prioritySelect = document.getElementById('prioritySelect');
                if (prioritySelect) prioritySelect.value = details.priority;
            }
            
            if (details.type && details.type !== 'tarea') {
                const categorySelect = document.getElementById('categorySelect');
                if (categorySelect) {
                    const categoryMap = {
                        'trabajo': 'work',
                        'familia': 'family',
                        'personal': 'personal',
                        'financiera': 'financial'
                    };
                    categorySelect.value = categoryMap[details.type] || 'personal';
                }
            }
            
            this.updateVoiceStatus('🎯 Tarea procesada por servidor', 'Revisa los campos y guarda');
        }
    }

    /**
     * 🆕 PROCESAR GASTO DESDE SERVIDOR
     */
    handleExpenseFromVoice(result) {
        if (result.details) {
            const details = result.details;
            this.updateVoiceStatus('💰 Gasto detectado', `Monto: ${details.amount}, Categoría: ${details.category}`);
            
            const confirmMsg = `¿Crear tarea para recordar este gasto?\nMonto: $${details.amount}\nCategoría: ${details.category}`;
            if (confirm(confirmMsg)) {
                const taskText = `Revisar gasto de $${details.amount} en ${details.category}`;
                const textarea = document.getElementById('taskTextarea');
                if (textarea) textarea.value = taskText;
                
                const categorySelect = document.getElementById('categorySelect');
                if (categorySelect) categorySelect.value = 'financial';
            }
        }
    }

    /**
     * 🆕 PROCESAR RECORDATORIO DESDE SERVIDOR
     */
    handleReminderFromVoice(result) {
        if (result.details) {
            const details = result.details;
            
            const newReminder = {
                id: this.generateId(),
                title: details.title || 'Recordatorio por voz',
                amount: details.amount || 0,
                dueDate: details.due_date || new Date().toISOString().split('T')[0],
                status: this.calculateReminderStatus(details.due_date || new Date().toISOString().split('T')[0]),
                createdAt: new Date().toISOString()
            };
            
            this.reminders.unshift(newReminder);
            this.saveData();
            this.refreshRemindersList();
            
            this.showNotification('📅 Recordatorio creado', details.title, 'success');
            this.updateVoiceStatus('📅 Recordatorio guardado', details.title);
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
                            <button class="btn-notas primary" onclick="window.notasManager.openVoiceModal()">
                                🎤 Nueva Tarea
                            </button>
                            <div class="options-menu-notas">
                                <button class="options-trigger-notas">⋮</button>
                                <div class="dropdown-menu-notas">
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

            <!-- Modal de dictado de voz -->
            ${this.renderVoiceModal()}

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

    // Menú de opciones
    const optionsMenu = document.querySelector('.options-menu-notas');
    if (optionsMenu) {
        const trigger = optionsMenu.querySelector('.options-trigger-notas');
        const dropdown = optionsMenu.querySelector('.dropdown-menu-notas');
        
        trigger.onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('active');
        };

        document.onclick = () => {
            dropdown.classList.remove('active');
        };
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

        // Ordenar por estado y fecha
        const sortedReminders = [...this.reminders].sort((a, b) => {
            const statusOrder = { urgent: 0, warning: 1, ok: 2 };
            return statusOrder[a.status] - statusOrder[b.status];
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
        
        return `
            <div class="reminder-item-original ${statusClass}" data-id="${reminder.id}">
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
                    <button class="btn-icon-small" onclick="window.notasManager.markAsPaid('${reminder.id}')" title="Marcar como pagado">✅</button>
                    <button class="btn-icon-small" onclick="window.notasManager.editReminder('${reminder.id}')" title="Editar">✏️</button>
                    <button class="btn-icon-small" onclick="window.notasManager.deleteReminder('${reminder.id}')" title="Eliminar">🗑️</button>
                </div>
            </div>
        `;
    }

    /**
     * 🎤 Renderizar modal de dictado de voz (minimalista)
     */
    renderVoiceModal() {
        return `
            <div class="modal-overlay" id="voiceModal" style="display: none;">
                <div class="modal-content-voice">
                    <div class="modal-header-voice">
                        <h3>🎤 Nueva Tarea por Voz</h3>
                        <button class="close-btn-voice" onclick="window.notasManager.closeVoiceModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body-voice">

                        <!-- Texto reconocido -->
                        <div class="voice-transcript">
                            <label for="taskTextarea">📝 Texto reconocido:</label>
                            <textarea id="taskTextarea" 
                            placeholder="Dí algo como: 'Dicta tu nota de voz o bien escribe tu nota normalmente'"></textarea>
                        </div>

                        <!-- Controles de formulario -->
                        <div class="form-controls-voice">
                            <div class="form-row-voice">
                                <div class="form-group-voice">
                                    <label for="categorySelect">📁 Categoría:</label>
                                    <select id="categorySelect">
                                        <option value="personal">👤 Personal</option>
                                        <option value="work">💼 Trabajo</option>
                                        <option value="family">👨‍👩‍👧‍👦 Familia</option>
                                        <option value="financial">💰 Financiera</option>
                                    </select>
                                </div>
                                
                                <div class="form-group-voice">
                                    <label for="prioritySelect">🎯 Prioridad:</label>
                                    <select id="prioritySelect">
                                        <option value="low">🟢 Baja</option>
                                        <option value="medium">🟡 Media</option>
                                        <option value="high">🔴 Alta</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="form-row-voice">
                                <div class="form-group-voice">
                                    <label for="dueDateInput">📅 Fecha límite:</label>
                                    <input type="date" id="dueDateInput" value="${new Date().toISOString().split('T')[0]}">
                                </div>
                            </div>
                        </div>

                        <!-- Botones de acción -->
                            <div class="voice-actions">
                                <button class="btn-voice primary" onclick="window.notasManager.startLocalRecognition()">🎙️ Dictado por Voz</button>
                            </div>

                        <!-- Estado del reconocimiento -->
                        <div class="voice-status" id="voiceStatus">
                            <div class="status-text">
                                <span class="status-title">🎯 Listo para usar</span>
                                <span class="status-detail">Selecciona una opción para comenzar</span>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer-voice">
                        <button class="btn-voice primary" onclick="window.notasManager.saveTask()">💾 Guardar Tarea</button>
                        <button class="btn-voice secondary" onclick="window.notasManager.closeVoiceModal()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
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
                        <button class="btn-reminder success" onclick="window.notasManager.saveReminder()">💾 Guardar</button>
                        <button class="btn-reminder cancel" onclick="window.notasManager.closeReminderModal()">Cancelar</button>
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
        const date = new Date(dateString);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Mañana';
        } else {
            return date.toLocaleDateString('es-CL', { 
                day: 'numeric', 
                month: 'short' 
            });
        }
    }

    // =================================================================
    // 🆕 MÉTODOS WebSocket Y VOZ (MANTENIDOS INTACTOS)
    // =================================================================

    /**
     * 🆕 ENVIAR COMANDO AL SERVIDOR
     */
    async sendVoiceCommand(text, type = 'text') {
        if (!this.useWebSocket || !this.socket || !this.isConnected) {
            console.log('🎭 Usando procesamiento local');
            return this.processVoiceCommandsLocal(text);
        }
        
        try {
            const commandData = {
                type: type,
                text: text,
                timestamp: new Date().toISOString(),
                client_info: {
                    user_agent: navigator.userAgent,
                    language: 'es-CL'
                }
            };
            
            console.log('📤 Enviando comando al servidor:', commandData);
            this.socket.emit('voice_command', commandData);
            
            this.updateVoiceStatus('🌐 Enviando al servidor...', 'Procesando comando con IA');
            
        } catch (error) {
            console.error('❌ Error enviando comando:', error);
            this.updateVoiceStatus('⚠️ Error de conexión', 'Usando procesamiento local');
            return this.processVoiceCommandsLocal(text);
        }
    }

    /**
     * 🆕 PROCESAR COMANDOS LOCALMENTE (FALLBACK)
     */
    processVoiceCommandsLocal(text) {
        console.log('🎭 Procesando localmente:', text);
        this.processVoiceCommands(text);
        this.updateVoiceStatus('🎭 Procesado localmente', 'Comandos aplicados sin servidor');
    }

    /**
     * 🆕 PROBAR CONEXIÓN CON SERVIDOR
     */
    testServerConnection() {
        if (this.socket && this.isConnected) {
            console.log('🧪 Probando conexión con servidor...');
            this.socket.emit('test_connection');
            this.updateVoiceStatus('🧪 Probando servidor...', 'Verificando conexión');
        } else {
            this.updateVoiceStatus('⚠️ Sin conexión', 'Servidor no disponible');
        }
    }

    /**
     * 🎭 Simular entrada de voz (para pruebas)
     */
    simulateVoiceInput() {
        const examples = [
            "Crear tarea revisar facturas pendientes para mañana alta prioridad",
            "Recordar llamar al banco el viernes",
            "Tarea personal comprar regalo cumpleaños mamá",
            "Agregar recordatorio pagar internet 25 mil pesos",
            "Crear tarea trabajo preparar presentación para el lunes",
            "Recordar cita médico jueves 3 de la tarde",
            "Tarea familia organizar fin de semana",
            "Agregar gastos supermercado 45 mil pesos ayer"
        ];

        const randomExample = examples[Math.floor(Math.random() * examples.length)];
        const textarea = document.getElementById('taskTextarea');
        
        if (textarea) {
            textarea.value = randomExample;
            
            // 🆕 Decidir entre servidor y local
            if (this.isConnected) {
                this.sendVoiceCommand(randomExample, 'simulation');
            } else {
                this.processVoiceCommands(randomExample);
            }
            
            this.updateVoiceStatus('🎭 Ejemplo simulado', 'Texto generado automáticamente');
        }
    }

    /**
     * 🆕 INICIAR RECONOCIMIENTO CON SERVIDOR
     */
    startServerRecognition() {
        if (!this.isConnected) {
            this.updateVoiceStatus('⚠️ Sin conexión', 'Servidor no disponible');
            return;
        }
              
        // Usar Web Speech API pero enviar al servidor
        if (this.recognition) {
            this.isListening = true;
            this.finalTranscript = '';
            
            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    
                    if (event.results[i].isFinal) {
                        this.finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                // Actualizar textarea en tiempo real
                const textarea = document.getElementById('taskTextarea');
                if (textarea) {
                    textarea.value = this.finalTranscript + interimTranscript;
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                if (this.finalTranscript.trim()) {
                    // Enviar al servidor para procesamiento con IA
                    this.sendVoiceCommand(this.finalTranscript.trim(), 'voice');
                } else {
                    this.updateVoiceStatus('🔇 Sin reconocimiento', 'No se detectó voz');
                }
            };
            
            this.recognition.start();
        } else {
            this.updateVoiceStatus('❌ Micrófono no disponible', 'Web Speech API no soportada');
        }
    }

    /**
     * 🎙️ Iniciar reconocimiento local
     */
    startLocalRecognition() {
        if (!this.recognition) {
            this.updateVoiceStatus('❌ No disponible', 'Web Speech API no soportada en este navegador');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            return;
        }

        this.updateVoiceStatus('🎙️ Escuchando...', 'Habla ahora...');
        this.isListening = true;
        this.finalTranscript = '';

        this.recognition.onresult = (event) => {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            const textarea = document.getElementById('taskTextarea');
            if (textarea) {
                textarea.value = this.finalTranscript + interimTranscript;
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.finalTranscript.trim()) {
                this.processVoiceCommands(this.finalTranscript.trim());
                this.updateVoiceStatus('✅ Procesado', 'Comando aplicado localmente');
            } else {
                this.updateVoiceStatus('🔇 Sin voz detectada', 'Intenta de nuevo');
            }
        };

        try {
            this.recognition.start();
        } catch (error) {
            console.error('❌ Error iniciando reconocimiento:', error);
            this.updateVoiceStatus('❌ Error', 'No se pudo iniciar el micrófono');
            this.isListening = false;
        }
    }

    /**
     * 🆕 ACTUALIZAR ESTADO DE VOZ EN UI
     */
    updateVoiceStatus(title, detail) {
        const statusElement = document.getElementById('voiceStatus');
        if (statusElement) {
            statusElement.innerHTML = `
                <div class="status-text">
                    <span class="status-title">${title}</span>
                    <span class="status-detail">${detail}</span>
                </div>
            `;
        }
    }

    /**
     * 🎤 Abrir modal de voz
     */
    openVoiceModal() {
        const modal = document.getElementById('voiceModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Limpiar campos
            const textarea = document.getElementById('taskTextarea');
            if (textarea) textarea.value = '';
            
            // Resetear selects
            const categorySelect = document.getElementById('categorySelect');
            const prioritySelect = document.getElementById('prioritySelect');
            if (categorySelect) categorySelect.value = 'personal';
            if (prioritySelect) prioritySelect.value = 'medium';
            
            this.updateVoiceStatus('🎯 Listo para usar', 'Selecciona una opción para comenzar');
        }
    }

    /**
     * 🔒 Cerrar modal de voz
     */
    closeVoiceModal() {
        const modal = document.getElementById('voiceModal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        // Detener reconocimiento si está activo
        if (this.isListening && this.recognition) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    /**
     * 📅 Abrir modal de recordatorio
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
        }
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
        
        const newTask = {
            id: this.generateId(),
            title: textarea.value.trim(),
            category: categorySelect ? categorySelect.value : 'personal',
            priority: prioritySelect ? prioritySelect.value : 'medium',
            completed: false,
            dueDate: dueDateInput ? dueDateInput.value : new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(newTask);
        this.saveData();
        this.refreshTasksList();
        this.closeVoiceModal();
        
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

    /**
     * 📝 Parsear comando de tarea
     */
    parseTaskCommand(text) {
        const textarea = document.getElementById('taskTextarea');
        if (!textarea) return;
        
        // Extraer información básica
        let title = text;
        let priority = 'medium';
        let category = 'personal';
        
        // Detectar prioridad
        if (text.toLowerCase().includes('alta prioridad') || text.toLowerCase().includes('urgente')) {
            priority = 'high';
            title = title.replace(/alta prioridad|urgente/gi, '').trim();
        } else if (text.toLowerCase().includes('baja prioridad')) {
            priority = 'low';
            title = title.replace(/baja prioridad/gi, '').trim();
        }
        
        // Detectar categoría
        if (text.toLowerCase().includes('trabajo')) {
            category = 'work';
        } else if (text.toLowerCase().includes('familia')) {
            category = 'family';
        } else if (text.toLowerCase().includes('financiera') || text.toLowerCase().includes('dinero')) {
            category = 'financial';
        }
        
        // Limpiar texto
        title = title.replace(/crear|tarea|agregar/gi, '').trim();
        
        // Actualizar campos
        textarea.value = title;
        
        const categorySelect = document.getElementById('categorySelect');
        const prioritySelect = document.getElementById('prioritySelect');
        
        if (categorySelect) categorySelect.value = category;
        if (prioritySelect) prioritySelect.value = priority;
    }

    /**
     * 📅 Parsear comando de recordatorio
     */
    parseReminderCommand(text) {
        // Extraer información del recordatorio
        const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mil|miles|pesos?)?/i);
        const amount = amountMatch ? parseFloat(amountMatch[1]) * (text.includes('mil') ? 1000 : 1) : 0;
        
        let title = text.replace(/recordar|recordatorio/gi, '').trim();
        if (amountMatch) {
            title = title.replace(amountMatch[0], '').trim();
        }
        
        // Crear recordatorio
        const newReminder = {
            id: this.generateId(),
            title: title || 'Recordatorio por voz',
            amount: amount,
            dueDate: new Date().toISOString().split('T')[0],
            status: 'warning',
            createdAt: new Date().toISOString()
        };
        
        this.reminders.unshift(newReminder);
        this.saveData();
        this.refreshRemindersList();
        
        this.showNotification('📅 Recordatorio creado', title, 'success');
    }

    /**
     * 💰 Parsear comando de gasto
     */
    parseExpenseCommand(text) {
        const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:mil|miles|pesos?)?/i);
        const amount = amountMatch ? parseFloat(amountMatch[1]) * (text.includes('mil') ? 1000 : 1) : 0;
        
        let category = 'varios';
        if (text.toLowerCase().includes('supermercado') || text.toLowerCase().includes('comida')) {
            category = 'alimentación';
        } else if (text.toLowerCase().includes('transporte') || text.toLowerCase().includes('taxi')) {
            category = 'transporte';
        }
        
        // Crear tarea para revisar el gasto
        const taskText = `Revisar gasto de ${amount.toLocaleString()} en ${category}`;
        const textarea = document.getElementById('taskTextarea');
        if (textarea) {
            textarea.value = taskText;
        }
        
        const categorySelect = document.getElementById('categorySelect');
        if (categorySelect) {
            categorySelect.value = 'financial';
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
     * 🎙️ Inicializar Web Speech API
     */
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            console.warn('⚠️ Web Speech API no soportada en este navegador');
            return;
        }

        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'es-CL';

        this.recognition.onerror = (event) => {
        console.error('❌ Error en reconocimiento de voz:', event.error);
        this.isListening = false;
        this.updateVoiceStatus('📝 Escribe tu tarea', 'El dictado no está disponible, usa el campo de texto');
    };
}

    /**
     * 🎛️ Configurar eventos globales
     */
    bindEvents() {
        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeVoiceModal();
                this.closeReminderModal();
            }
        });

     // Guardar con Enter en textarea
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.id === 'taskTextarea') {
                e.preventDefault();
                this.saveTask();
            }
        });
    
        // Cerrar modales clickeando fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeVoiceModal();
                this.closeReminderModal();
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
        'Eliminar Todos los Datos',
        '¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.',
        'Eliminar Todo',
        'Cancelar',
        'danger'
    );
    
    if (confirmed) {
        this.tasks = [];
        this.reminders = [];
        this.saveData();
        this.refreshTasksList();
        this.refreshRemindersList();
        this.showNotification('🗑️ Datos eliminados', 'Todos los datos han sido borrados', 'info');
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
        <div class="sort-option ${this.currentSort === 'fecha' ? 'active' : ''}" onclick="window.notasManager.setSortOrder('fecha')">
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
    
    // Cerrar al hacer click fuera
    setTimeout(() => {
        document.addEventListener('click', function closeSortMenu(e) {
            if (!sortMenu.contains(e.target)) {
                sortMenu.remove();
                document.removeEventListener('click', closeSortMenu);
            }
        });
    }, 100);

    
}

/**
 * 🔄 ESTABLECER ORDEN DE CLASIFICACIÓN
 */
setSortOrder(sortType) {
    this.currentSort = sortType;
    this.sortTasks();
    this.refreshTasksList();
    this.saveData();
    
    // Cerrar menú
    const sortMenu = document.querySelector('.sort-submenu');
    if (sortMenu) sortMenu.remove();
    
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
            this.tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        case 'recientes':
            this.tasks.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
            break;
        case 'titulo':
            this.tasks.sort((a, b) => a.text.localeCompare(b.text));
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