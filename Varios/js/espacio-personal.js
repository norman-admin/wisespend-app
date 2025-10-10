
   /**
 * ESPACIO-PERSONAL.JS - Sistema de Bloc de Notas Personal
 * WiseSpend - Control de Gastos Familiares
 * Versión: 1.0.0
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Bloc de notas simple y personal
 * ✅ Auto-guardado cada 5 minutos
 * ✅ Guardado manual
 * ✅ Contador de caracteres en tiempo real
 * ✅ Limpieza de notas con confirmación
 * ✅ Persistencia en localStorage
 */

class EspacioPersonalManager {
    constructor() {
        this.storageKey = 'espacioPersonal_notas';
        this.autoSaveInterval = null;
        this.autoSaveTime = 5 * 60 * 1000; // 5 minutos en milisegundos
        
        this.elements = {
            notasTextarea: null,
            charCounter: null,
            saveBtn: null,
            clearBtn: null,
            lastSavedInfo: null,
            optionsBtn: null,
            optionsMenu: null,
            downloadBackupBtn: null,
            uploadBackupBtn: null,
            backupFileInput: null
        };
        
        this.init();
        console.log('📝 EspacioPersonalManager v1.0.0 inicializado');
    }

    /**
     * 🚀 INICIALIZACIÓN
     */
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    /**
     * ⚙️ CONFIGURACIÓN INICIAL
     */
    setup() {
        // Intentar cachear elementos (puede que no existan aún)
        this.cacheElements();
        
        // Si los elementos existen, configurar
        if (this.elements.notasTextarea) {
            this.loadNotas();
            this.setupEventListeners();
            this.startAutoSave();
            this.updateCharCounter();
            console.log('✅ Espacio Personal configurado correctamente');
        } else {
            console.log('⏳ Esperando elementos del Espacio Personal...');
            // Reintentar en 1 segundo
            setTimeout(() => this.setup(), 1000);
        }
    }

    /**
     * 🎯 CACHEAR ELEMENTOS DEL DOM
     */
    cacheElements() {
        this.elements.notasTextarea = document.getElementById('notasPersonales');
        this.elements.charCounter = document.getElementById('charCounter');
        this.elements.saveBtn = document.getElementById('saveNotasBtn');
        this.elements.clearBtn = document.getElementById('clearNotasBtn');
        this.elements.lastSavedInfo = document.getElementById('lastSavedInfo');
        this.elements.optionsBtn = document.getElementById('optionsNotasBtn');
        this.elements.optionsMenu = document.getElementById('optionsMenu');
        this.elements.downloadBackupBtn = document.getElementById('downloadBackupBtn');
        this.elements.uploadBackupBtn = document.getElementById('uploadBackupBtn');
        this.elements.backupFileInput = document.getElementById('backupFileInput');
        
        return !!this.elements.notasTextarea;
    }

    /**
     * 🎧 CONFIGURAR EVENT LISTENERS
     */
/**
 * 🎧 CONFIGURAR EVENT LISTENERS
 */
setupEventListeners() {
    // Actualizar contador mientras escribe
    if (this.elements.notasTextarea) {
        this.elements.notasTextarea.addEventListener('input', () => {
            this.updateCharCounter();
        });
    }

    // Botón guardar
    if (this.elements.saveBtn) {
        this.elements.saveBtn.addEventListener('click', () => {
            this.saveNotas(true); // true = guardado manual
        });
    }

    // Botón limpiar
    if (this.elements.clearBtn) {
        this.elements.clearBtn.addEventListener('click', () => {
            this.clearNotas();
        });
    }

    console.log('🎧 Event listeners configurados');

    // 🆕 Configurar eventos del menú de opciones
    this.setupOptionsMenu();
    
    // 🔥 Aplicar fix agresivo de foco al textarea
    this.setupFormFocusFix();
}

    /**
     * 📊 ACTUALIZAR CONTADOR DE CARACTERES
     */
    updateCharCounter() {
        if (!this.elements.notasTextarea || !this.elements.charCounter) {
            return;
        }

        const length = this.elements.notasTextarea.value.length;
        this.elements.charCounter.textContent = `${length.toLocaleString('es-CL')} caracteres`;
    }

    /**
     * 💾 CARGAR NOTAS DESDE LOCALSTORAGE
     */
    loadNotas() {
        try {
            const savedNotas = localStorage.getItem(this.storageKey);
            
            if (savedNotas && this.elements.notasTextarea) {
                this.elements.notasTextarea.value = savedNotas;
                this.updateCharCounter();
                console.log('📖 Notas cargadas desde localStorage');
            }
            
            // Actualizar información de último guardado
            this.updateLastSavedInfo();
            
        } catch (error) {
            console.error('❌ Error cargando notas:', error);
        }
    }

    /**
     * 💾 GUARDAR NOTAS EN LOCALSTORAGE
     */
    saveNotas(isManual = false) {
        try {
            if (!this.elements.notasTextarea) {
                console.warn('⚠️ Textarea no disponible para guardar');
                return;
            }

            const notasContent = this.elements.notasTextarea.value;
            localStorage.setItem(this.storageKey, notasContent);
            
            // Guardar timestamp
            localStorage.setItem(this.storageKey + '_timestamp', new Date().toISOString());
            
            // Actualizar info de último guardado
            this.updateLastSavedInfo();
            
            // Mostrar mensaje solo si es guardado manual
            if (isManual) {
                this.showSaveMessage('✅ Notas guardadas correctamente');
            }
            
            console.log(`💾 Notas guardadas ${isManual ? '(manual)' : '(auto)'}`);
            
        } catch (error) {
            console.error('❌ Error guardando notas:', error);
            if (isManual) {
                this.showSaveMessage('❌ Error al guardar notas', true);
            }
        }
    }

/**
 * 🗑️ LIMPIAR NOTAS CON CONFIRMACIÓN (usando modalSystem)
 */
clearNotas() {
    if (!this.elements.notasTextarea) {
        return;
    }

    // Verificar si hay contenido
    if (this.elements.notasTextarea.value.trim() === '') {
        // Usar modalSystem para el mensaje de información
        if (window.modalSystem) {
            window.modalSystem.show('info-notas-vacias', {
                title: '📝 No hay notas',
                size: 'small',
                content: '<p>No hay notas para limpiar. El área de texto está vacía.</p>',
                buttons: [
                    {
                        text: 'Aceptar',
                        type: 'primary',
                        action: 'cancel'
                    }
                ]
            });
        } else {
            // Fallback si modalSystem no está disponible
            alert('📝 No hay notas para limpiar');
        }
        return;
    }

    // Confirmación usando modalSystem
    if (window.modalSystem) {
        window.modalSystem.show('confirm-clear-notas', {
            title: '⚠️ Confirmar eliminación',
            size: 'small',
            content: `
                <div style="padding: 20px 0;">
                    <p style="margin-bottom: 16px; color: var(--text-primary, #1f2937); font-size: 15px;">
                        ¿Estás seguro de que quieres <strong>borrar todas las notas</strong>?
                    </p>
                    <p style="margin: 0; color: var(--text-secondary, #6b7280); font-size: 14px;">
                        Esta acción no se puede deshacer.
                    </p>
                </div>
            `,
            buttons: [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    action: 'cancel'
                },
                {
                    text: '🗑️ Eliminar Notas',
                    type: 'danger',
                    action: 'confirm',
                    onClick: (e, modal, modalSystem) => {
                        // Ejecutar la eliminación
                        this.executeNotasClear();
                        
                        // Cerrar el modal
                        if (modalSystem && typeof modalSystem.close === 'function') {
                            modalSystem.close();
                        }
                    }
                }
            ]
        });
    } else {
        // Fallback si modalSystem no está disponible
        const confirmar = confirm('⚠️ ¿Estás seguro de que quieres borrar todas las notas?\n\nEsta acción no se puede deshacer.');
        
        if (confirmar) {
            this.executeNotasClear();
        }
    }
}

/**
 * 🗑️ EJECUTAR LIMPIEZA DE NOTAS (método auxiliar)
 */
executeNotasClear() {
    if (!this.elements.notasTextarea) {
        return;
    }
    
    this.elements.notasTextarea.value = '';
    this.updateCharCounter();
    this.saveNotas(true);
    this.showSaveMessage('🗑️ Notas eliminadas');
    console.log('🗑️ Notas limpiadas por el usuario');
}

    /**
     * ⏰ INICIAR AUTO-GUARDADO
     */
    startAutoSave() {
        // Limpiar intervalo anterior si existe
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        // Crear nuevo intervalo de auto-guardado
        this.autoSaveInterval = setInterval(() => {
            this.saveNotas(false); // false = auto-guardado
        }, this.autoSaveTime);

        console.log('⏰ Auto-guardado iniciado (cada 5 minutos)');
    }

    /**
     * 🛑 DETENER AUTO-GUARDADO
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('🛑 Auto-guardado detenido');
        }
    }

    /**
     * 📅 ACTUALIZAR INFORMACIÓN DE ÚLTIMO GUARDADO
     */
    updateLastSavedInfo() {
        if (!this.elements.lastSavedInfo) {
            return;
        }

        try {
            const timestamp = localStorage.getItem(this.storageKey + '_timestamp');
            
            if (timestamp) {
                const date = new Date(timestamp);
                const timeString = date.toLocaleTimeString('es-CL', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                const dateString = date.toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                
                this.elements.lastSavedInfo.textContent = `Último guardado: ${dateString} a las ${timeString}`;
            } else {
                this.elements.lastSavedInfo.textContent = 'Sin guardados previos';
            }
            
        } catch (error) {
            console.error('❌ Error actualizando info de guardado:', error);
        }
    }

  /**
 * 💬 MOSTRAR MENSAJE DE GUARDADO
 */
showSaveMessage(message, isError = false) {
    // Notificaciones desactivadas
}

    /**
     * 🔄 RECARGAR INTERFAZ (útil si se cambia de sección)
     */
    reload() {
        this.stopAutoSave();
        this.setup();
    }

    /**
 * 🔥 FIX AGRESIVO DE FOCO - Proteger textarea de pérdida de foco
 */
setupFormFocusFix() {
    const element = this.elements.notasTextarea;
    if (!element) {
        console.warn('⚠️ Textarea no disponible para fix de foco');
        return;
    }
    
    console.log('🛡️ Aplicando fix agresivo de foco al textarea...');
    
    // ESTRATEGIA 1: Interceptar temprano con capture: true
    element.addEventListener('mousedown', (e) => {
        console.log('🎯 Interceptado mousedown en textarea');
        e.stopImmediatePropagation();
        e.stopPropagation();
        
        // Cuádruple foco forzado
        setTimeout(() => {
            element.focus();
            console.log('✅ Foco forzado (0ms)');
        }, 0);
        setTimeout(() => {
            element.focus();
            console.log('✅ Foco forzado (10ms)');
        }, 10);
        setTimeout(() => {
            element.focus();
            console.log('✅ Foco forzado (50ms)');
        }, 50);
        setTimeout(() => {
            element.focus();
            console.log('✅ Foco forzado (100ms)');
        }, 100);
        
        return false;
    }, { capture: true, passive: false });
    
    // ESTRATEGIA 2: Interceptar click también
    element.addEventListener('click', (e) => {
        console.log('🖱️ Interceptado click en textarea');
        e.stopImmediatePropagation();
        e.stopPropagation();
        
        setTimeout(() => element.focus(), 0);
        setTimeout(() => element.focus(), 10);
        
    }, { capture: true, passive: false });
    
    // ESTRATEGIA 3: Defender el foco activamente
    element.addEventListener('focus', (e) => {
        console.log('✅ Textarea obtuvo foco - defensa activa iniciada');
        
        const defendFocus = () => {
            if (document.activeElement !== element) {
                element.focus();
                console.log('🛡️ Foco defendido - recuperado');
            }
        };
        
        setTimeout(defendFocus, 10);
        setTimeout(defendFocus, 50);
        setTimeout(defendFocus, 100);
        setTimeout(defendFocus, 200);
        
    }, { capture: true });
    
    // ESTRATEGIA 4: Recuperar foco perdido automáticamente
    element.addEventListener('blur', (e) => {
        console.log('⚠️ Textarea perdiendo foco...');
        
        setTimeout(() => {
            const activeElement = document.activeElement;
            const isRelatedToPersonalSpace = activeElement && 
                (activeElement.closest('.espacio-personal-container') ||
                 activeElement.id === 'saveNotasBtn' ||
                 activeElement.id === 'clearNotasBtn' ||
                 activeElement.id === 'optionsNotasBtn' ||
                 activeElement.closest('.options-menu'));
            
            // Solo recuperar si el foco fue robado por algo externo
            if (!isRelatedToPersonalSpace) {
                element.focus();
                console.log('🔄 Foco robado detectado - recuperando...');
            }
        }, 5);
    });
    
    // ESTRATEGIA 5: Proteger teclas
    element.addEventListener('keydown', (e) => {
        e.stopPropagation();
    }, { capture: true });
    
    // ESTRATEGIA 6: Protección global
    const protectTextarea = (e) => {
        if (e.target === element) {
            console.log('🛡️ Protección global activada');
            e.stopImmediatePropagation();
            e.stopPropagation();
            element.focus();
            return false;
        }
    };
    
    document.addEventListener('mousedown', protectTextarea, { capture: true });
    document.addEventListener('click', protectTextarea, { capture: true });
    
    console.log('✅ Fix agresivo de foco implementado con 6 estrategias');
}

    /**
     * 🧹 LIMPIAR Y DESTRUIR
     */
    destroy() {
        this.stopAutoSave();
        console.log('🧹 EspacioPersonalManager destruido');
    }

/**
 * ⚙️ CONFIGURAR MENÚ DE OPCIONES
 */
setupOptionsMenu() {
    // Toggle del menú (con protección agresiva)
    if (this.elements.optionsBtn) {
        this.elements.optionsBtn.addEventListener('click', (e) => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            
            this.toggleOptionsMenu();
            
            return false;
        }, { capture: true, passive: false });
    }

    // Cerrar menú al hacer clic fuera (con protección)
    document.addEventListener('click', (e) => {
        // Dar tiempo para que el click del botón se procese primero
        setTimeout(() => {
            if (this.elements.optionsMenu && 
                !this.elements.optionsMenu.contains(e.target) &&
                e.target !== this.elements.optionsBtn &&
                !this.elements.optionsBtn.contains(e.target)) {
                this.closeOptionsMenu();
            }
        }, 10);
    }, true);

// Descargar respaldo (con protección contra doble click)
if (this.elements.downloadBackupBtn) {
    this.elements.downloadBackupBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        
        this.downloadBackup();
        this.closeOptionsMenu();
        
        return false;
    });
}

// Cargar respaldo (con protección contra doble click)
if (this.elements.uploadBackupBtn) {
    this.elements.uploadBackupBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        
        this.uploadBackup();
        this.closeOptionsMenu();
        
        return false;
    });
}

    // Input de archivo
    if (this.elements.backupFileInput) {
        this.elements.backupFileInput.addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    }

    console.log('⚙️ Menú de opciones configurado con protección de foco');
}

    /**
     * 🔄 TOGGLE MENÚ DE OPCIONES
     */
    toggleOptionsMenu() {
        if (!this.elements.optionsMenu || !this.elements.optionsBtn) return;

        const isOpen = this.elements.optionsMenu.classList.contains('show');
        
        if (isOpen) {
            this.closeOptionsMenu();
        } else {
            this.openOptionsMenu();
        }
    }

    /**
     * 📂 ABRIR MENÚ DE OPCIONES
     */
    openOptionsMenu() {
        if (!this.elements.optionsMenu || !this.elements.optionsBtn) return;

        this.elements.optionsMenu.classList.add('show');
        this.elements.optionsBtn.classList.add('active');
        console.log('📂 Menú de opciones abierto');
    }

    /**
     * 📁 CERRAR MENÚ DE OPCIONES
     */
    closeOptionsMenu() {
        if (!this.elements.optionsMenu || !this.elements.optionsBtn) return;

        this.elements.optionsMenu.classList.remove('show');
        this.elements.optionsBtn.classList.remove('active');
        console.log('📁 Menú de opciones cerrado');
    }

    /**
     * 💾 DESCARGAR RESPALDO
     */
    downloadBackup() {
        try {
            const notasContent = localStorage.getItem(this.storageKey) || '';
            
            if (!notasContent || notasContent.trim() === '') {
                if (window.modalSystem) {
                    window.modalSystem.show('no-notas-backup', {
                        title: '📝 Sin notas para respaldar',
                        size: 'small',
                        content: '<p>No hay notas guardadas para crear un respaldo.</p>',
                        buttons: [
                            {
                                text: 'Aceptar',
                                type: 'primary',
                                action: 'cancel'
                            }
                        ]
                    });
                } else {
                    alert('📝 No hay notas para respaldar');
                }
                return;
            }

            // Crear nombre de archivo con fecha
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
            const filename = `mis-notas-personal-${dateStr}_${timeStr}.txt`;

            // Crear blob y descargar
            const blob = new Blob([notasContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('✅ Respaldo descargado:', filename);
            this.showSaveMessage('💾 Respaldo descargado correctamente');

        } catch (error) {
            console.error('❌ Error descargando respaldo:', error);
            this.showSaveMessage('❌ Error al descargar respaldo', true);
        }
    }

    /**
     * 📂 CARGAR RESPALDO (abrir selector de archivos)
     */
    uploadBackup() {
        if (!this.elements.backupFileInput) {
            console.error('❌ Input de archivo no disponible');
            return;
        }

        // Resetear input
        this.elements.backupFileInput.value = '';
        
        // Abrir selector de archivos
        this.elements.backupFileInput.click();
        
        console.log('📂 Selector de archivos abierto');
    }

    /**
     * 📄 MANEJAR SELECCIÓN DE ARCHIVO
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (!file) {
            console.log('⚠️ No se seleccionó ningún archivo');
            return;
        }

        // Validar que sea .txt
        if (!file.name.endsWith('.txt')) {
            if (window.modalSystem) {
                window.modalSystem.show('error-formato', {
                    title: '❌ Formato inválido',
                    size: 'small',
                    content: '<p>Solo se permiten archivos .txt</p>',
                    buttons: [
                        {
                            text: 'Aceptar',
                            type: 'primary',
                            action: 'cancel'
                        }
                    ]
                });
            } else {
                alert('❌ Solo se permiten archivos .txt');
            }
            return;
        }

        // Leer archivo
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            this.showRestoreConfirmation(content, file.name);
        };
        
        reader.onerror = () => {
            console.error('❌ Error leyendo archivo');
            this.showSaveMessage('❌ Error al leer el archivo', true);
        };
        
        reader.readAsText(file);
        
        console.log('📖 Leyendo archivo:', file.name);
    }

    /**
     * 🔄 MOSTRAR CONFIRMACIÓN DE RESTAURACIÓN
     */
    showRestoreConfirmation(newContent, filename) {
        const currentContent = this.elements.notasTextarea?.value || '';
        const hasCurrentNotes = currentContent.trim() !== '';

        // Previsualización limitada (primeros 200 caracteres)
        const preview = newContent.length > 200 
            ? newContent.substring(0, 200) + '...' 
            : newContent;

        let modalContent = `
            <div style="padding: 16px 0;">
                <p style="margin-bottom: 16px; color: var(--text-primary, #1f2937); font-size: 15px;">
                    <strong>Archivo:</strong> ${filename}
                </p>
                
                <div style="margin-bottom: 16px;">
                    <p style="margin-bottom: 8px; color: var(--text-secondary, #6b7280); font-size: 14px; font-weight: 600;">
                        Vista Previa:
                    </p>
                    <div style="background: var(--bg-secondary, #f9fafb); padding: 12px; border-radius: 6px; border: 1px solid var(--border-light, #e5e7eb); max-height: 150px; overflow-y: auto; font-size: 13px; line-height: 1.5; color: var(--text-primary, #1f2937); white-space: pre-wrap; word-wrap: break-word;">
${preview}
                    </div>
                </div>
        `;

        if (hasCurrentNotes) {
            modalContent += `
                <p style="margin: 16px 0 0 0; color: var(--text-secondary, #6b7280); font-size: 14px;">
                    <strong>⚠️ Advertencia:</strong> Tienes notas actuales. ¿Qué deseas hacer?
                </p>
            `;
        }

        modalContent += `</div>`;

        const buttons = hasCurrentNotes ? [
            {
                text: 'Cancelar',
                type: 'secondary',
                action: 'cancel'
            },
            {
                text: '➕ Agregar al Final',
                type: 'primary',
                action: 'append',
                onClick: (e, modal, modalSystem) => {
                    this.restoreBackup(newContent, 'append');
                    modalSystem.close();
                }
            },
            {
                text: '🔄 Reemplazar Todo',
                type: 'danger',
                action: 'replace',
                onClick: (e, modal, modalSystem) => {
                    this.restoreBackup(newContent, 'replace');
                    modalSystem.close();
                }
            }
        ] : [
            {
                text: 'Cancelar',
                type: 'secondary',
                action: 'cancel'
            },
            {
                text: '📂 Cargar Notas',
                type: 'primary',
                action: 'load',
                onClick: (e, modal, modalSystem) => {
                    this.restoreBackup(newContent, 'replace');
                    modalSystem.close();
                }
            }
        ];

        if (window.modalSystem) {
            window.modalSystem.show('confirm-restore', {
                title: '📂 Cargar Respaldo de Notas',
                size: 'medium',
                content: modalContent,
                buttons: buttons
            });
        }
    }

    /**
     * 🔄 RESTAURAR RESPALDO
     */
    restoreBackup(newContent, mode) {
        if (!this.elements.notasTextarea) {
            return;
        }

        try {
            let finalContent = '';

            if (mode === 'append') {
                // Agregar al final
                const currentContent = this.elements.notasTextarea.value;
                finalContent = currentContent + '\n\n' + newContent;
            } else {
                // Reemplazar todo
                finalContent = newContent;
            }

            // Actualizar textarea
            this.elements.notasTextarea.value = finalContent;
            
            // Actualizar contador
            this.updateCharCounter();
            
            // Guardar automáticamente
            this.saveNotas(true);
            
            // Mensaje de éxito
            const message = mode === 'append' 
                ? '✅ Notas agregadas al final' 
                : '✅ Notas restauradas correctamente';
            this.showSaveMessage(message);
            
            console.log(`✅ Respaldo restaurado (modo: ${mode})`);

        } catch (error) {
            console.error('❌ Error restaurando respaldo:', error);
            this.showSaveMessage('❌ Error al restaurar respaldo', true);
        }
    }
}

// 🌍 INICIALIZACIÓN GLOBAL
if (typeof window !== 'undefined') {
    window.espacioPersonalManager = new EspacioPersonalManager();
}

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EspacioPersonalManager;
}

console.log('📝 espacio-personal.js v1.0.0 cargado correctamente');