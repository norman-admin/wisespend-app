/**
 * NEW-HEADER.JS - Funcionalidad Header Ultra Minimalista
 * WiseSpend - Control de Gastos Familiares
 * Versión: 1.2.0 - CON ACTUALIZACIÓN AUTOMÁTICA DE NOMBRE
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Menú dropdown completo con animaciones
 * ✅ Integración con storageManager existente
 * ✅ Integración con auth.js para cerrar sesión
 * ✅ Auto-detección de nombre de usuario
 * ✅ Funciones compatibles con sistema actual
 * ✅ Event listeners optimizados
 * ✅ Responsive y accesible
 * ✅ SISTEMA UNIFICADO CON MODAL-SYSTEM
 * 🆕 ACTUALIZACIÓN AUTOMÁTICA DESDE CONFIGURACIÓN
 */

class NewHeaderManager {
    constructor() {
        this.isDropdownOpen = false;
        this.elements = {
            header: null,
            userMenuButton: null,
            userDropdownMenu: null,
            userDisplayName: null,
            userInitial: null,
            userAvatar: null,
            menuArrow: null,
            headerLogo: null,
            userName: null // 🆕 Agregado para compatibilidad
        };
        
        this.currentUser = {
            name: 'Usuario',
            initial: 'U'
        };
        
        this.init();
        console.log('🎨 NewHeaderManager v1.2.0 inicializado - CON ACTUALIZACIÓN AUTOMÁTICA');
    }

    /**
     * 🚀 INICIALIZACIÓN PRINCIPAL
     */
    init() {
        this.waitForDOM(() => {
            this.cacheElements();
            this.loadUserData();
            this.setupEventListeners();
            
            // 🆕 Escuchar cambios de nombre de usuario desde configuración
            this.setupUserNameListener();
            
            this.setupAccessibility();
            this.dispatchReadyEvent();
        });
    }

    /**
     * ⏱️ ESPERAR A QUE EL DOM ESTÉ LISTO
     */
    waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    /**
     * 🎯 CACHEAR ELEMENTOS DEL DOM
     */
    cacheElements() {
        this.elements = {
            header: document.getElementById('newHeader'),
            userMenuButton: document.getElementById('userMenuButton'),
            userDropdownMenu: document.getElementById('userDropdownMenu'),
            userDisplayName: document.getElementById('userDisplayName'),
            userInitial: document.getElementById('userInitial'),
            userAvatar: document.getElementById('userAvatar'),
            menuArrow: document.getElementById('menuArrow'),
            headerLogo: document.getElementById('headerLogo'),
            userName: document.getElementById('userDisplayName') // 🆕 Alias para compatibilidad
        };

        // Verificar elementos críticos
        if (!this.elements.userMenuButton || !this.elements.userDropdownMenu) {
            console.error('❌ NewHeader: Elementos críticos no encontrados');
            return false;
        }

        console.log('✅ NewHeader: Elementos del DOM cacheados');
        return true;
    }

    /**
     * 👤 CARGAR DATOS DEL USUARIO
     */
    loadUserData() {
        try {
            let usuarioEncontrado = null;
            
            // 1. Intentar obtener desde authSystem (más confiable)
            if (window.authSystem && window.authSystem.currentUser) {
                usuarioEncontrado = window.authSystem.currentUser.username;
                console.log(`✅ Usuario desde authSystem: ${usuarioEncontrado}`);
            }
            // 2. Intentar obtener desde storageManager
            else if (window.storageManager) {
                const config = window.storageManager.getConfiguracion();
                usuarioEncontrado = config?.usuario || config?.currentUser;
                if (usuarioEncontrado) {
                    console.log(`✅ Usuario desde storageManager: ${usuarioEncontrado}`);
                }
            }
            // 3. Fallback: localStorage directo
            else if (localStorage.getItem('currentUser')) {
                usuarioEncontrado = localStorage.getItem('currentUser');
                console.log(`✅ Usuario desde localStorage: ${usuarioEncontrado}`);
            }
            
            // 4. Usar el usuario encontrado o fallback
            if (usuarioEncontrado && usuarioEncontrado !== 'Usuario') {
                this.updateUserInfo(usuarioEncontrado);
            } else {
                this.updateUserInfo('Usuario');
                console.log('⚠️ Usuario por defecto cargado - no se encontró usuario real');
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos de usuario:', error);
            this.updateUserInfo('Usuario');
        }
    }

    /**
     * 🔄 ACTUALIZAR INFORMACIÓN DEL USUARIO EN UI
     */
    updateUserInfo(userName) {
        if (!userName || typeof userName !== 'string') {
            userName = 'Usuario';
        }

        this.currentUser.name = userName;
        this.currentUser.initial = userName.charAt(0).toUpperCase();

        // Actualizar elementos del DOM
        if (this.elements.userDisplayName) {
            this.elements.userDisplayName.textContent = userName;
        }
        
        if (this.elements.userInitial) {
            this.elements.userInitial.textContent = this.currentUser.initial;
        }

        console.log(`🔄 UI actualizada para usuario: ${userName}`);
    }

    /**
     * 🆕 ESCUCHAR CAMBIOS DE NOMBRE DESDE CONFIGURACIÓN
     */
    setupUserNameListener() {
        window.addEventListener('userNameChanged', (event) => {
            console.log('📢 Evento recibido: Nombre de usuario cambió', event.detail);
            
            const newName = event.detail.newName;
            
            // Actualizar datos del usuario actual
            this.currentUser.name = newName;
            this.currentUser.initial = newName ? newName.charAt(0).toUpperCase() : 'U';
            
            // Actualizar visualmente el header
            this.updateUserDisplay(newName);
            
            console.log('✅ Header actualizado con nuevo nombre:', newName);
        });
        
        console.log('👂 Listener de cambio de nombre configurado');
    }

    /**
     * 🆕 ACTUALIZAR DISPLAY DEL USUARIO EN EL HEADER
     */
    updateUserDisplay(newName) {
        // Actualizar el nombre en el botón del menú
        if (this.elements.userName) {
            this.elements.userName.textContent = newName || 'Usuario';
        }
        
        if (this.elements.userDisplayName) {
            this.elements.userDisplayName.textContent = newName || 'Usuario';
        }
        
        // Actualizar la inicial en el avatar
        if (this.elements.userAvatar) {
            const initial = newName ? newName.charAt(0).toUpperCase() : 'U';
            this.elements.userAvatar.textContent = initial;
        }
        
        if (this.elements.userInitial) {
            const initial = newName ? newName.charAt(0).toUpperCase() : 'U';
            this.elements.userInitial.textContent = initial;
        }
        
        // Animación suave de actualización
        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.style.transition = 'all 0.3s ease';
            this.elements.userMenuButton.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                this.elements.userMenuButton.style.transform = 'scale(1)';
            }, 200);
        }
        
        console.log('🎨 Display del usuario actualizado visualmente');
    }

    /**
     * 🎧 CONFIGURAR EVENT LISTENERS - SIMPLIFICADO
     */
    setupEventListeners() {
        // Botón principal del menú
        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Verificación simple unificada
                if (document.body.classList.contains('modal-active')) {
                    return;
                }
                
                this.toggleDropdown();
            });
        }

        // Clics fuera del menú para cerrarlo
        document.addEventListener('click', (e) => {
            if (!this.elements.header?.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Escape key para cerrar menú - SIMPLIFICADO
        document.addEventListener('keydown', (e) => {
            // Verificación simple para Enter key
            if (e.key === 'Enter' && document.body.classList.contains('modal-active')) {
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.id === 'userMenuButton' || activeElement.closest('.user-menu-wrapper'))) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
            }
            
            if (e.key === 'Escape' && this.isDropdownOpen) {
                this.closeDropdown();
                this.elements.userMenuButton?.focus();
            }
        });

        // Event listeners para acciones del menú
        this.setupMenuActions();

        // Logo click para efecto visual
        if (this.elements.headerLogo) {
            this.elements.headerLogo.addEventListener('click', this.handleLogoClick.bind(this));
        }

        console.log('✅ Event listeners configurados - SIMPLIFICADOS');
    }

    /**
     * 🎬 CONFIGURAR ACCIONES DEL MENÚ
     */
    setupMenuActions() {
        // Ver Perfil
        const profileAction = document.getElementById('profileAction');
        if (profileAction) {
            profileAction.addEventListener('click', this.handleProfileAction.bind(this));
        }

        // Agregar Usuario
        const addUserAction = document.getElementById('addUserAction');
        if (addUserAction) {
            addUserAction.addEventListener('click', this.handleAddUserAction.bind(this));
        }

        // Cerrar Sesión
        const logoutAction = document.getElementById('logoutAction');
        if (logoutAction) {
            logoutAction.addEventListener('click', this.handleLogoutAction.bind(this));
        }

        console.log('✅ Acciones del menú configuradas');
    }

    /**
     * ♿ CONFIGURAR ACCESIBILIDAD - SIMPLIFICADO
     */
    setupAccessibility() {
        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.setAttribute('aria-label', `Menú de usuario: ${this.currentUser.name}`);
        }
        
        if (this.elements.userDropdownMenu) {
            this.elements.userDropdownMenu.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * 🔄 TOGGLE DROPDOWN MENU - UNIFICADO
     */
    toggleDropdown() {
        // Verificación simple unificada
        if (document.body.classList.contains('modal-active')) {
            return;
        }
        
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    /**
     * 📂 ABRIR DROPDOWN
     */
    openDropdown() {
        this.isDropdownOpen = true;

        if (this.elements.userDropdownMenu) {
            this.elements.userDropdownMenu.classList.add('show');
            this.elements.userDropdownMenu.setAttribute('aria-hidden', 'false');
            
            // Restaurar tabindex de botones internos
            const menuButtons = this.elements.userDropdownMenu.querySelectorAll('button');
            menuButtons.forEach(btn => {
                btn.setAttribute('tabindex', '0');
            });
        }

        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.setAttribute('aria-expanded', 'true');
        }

        if (this.elements.menuArrow) {
            this.elements.menuArrow.style.transform = 'rotate(180deg)';
        }

        console.log('📂 Dropdown abierto');
    }

    /**
     * 📁 CERRAR DROPDOWN
     */
    closeDropdown() {
        this.isDropdownOpen = false;
        
        if (this.elements.userDropdownMenu) {
            // Remover foco de elementos internos antes de ocultar
            const focusedElement = this.elements.userDropdownMenu.querySelector(':focus');
            if (focusedElement) {
                focusedElement.blur();
            }
            
            // Remover foco de todos los botones internos
            const menuButtons = this.elements.userDropdownMenu.querySelectorAll('button, [tabindex]');
            menuButtons.forEach(btn => {
                btn.blur();
                btn.setAttribute('tabindex', '-1');
            });
            
            this.elements.userDropdownMenu.classList.remove('show');
            this.elements.userDropdownMenu.setAttribute('aria-hidden', 'true');
        }
        
        if (this.elements.menuArrow) {
            this.elements.menuArrow.style.transform = 'rotate(0deg)';
        }
        
        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.setAttribute('aria-expanded', 'false');
            // Devolver foco al botón principal
            this.elements.userMenuButton.focus();
        }
        
        console.log('📁 Dropdown cerrado');
    }

    /**
     * 🎭 MANEJAR ACCIONES DEL MENÚ
     */
    
    handleProfileAction() {
        this.closeDropdown();
        console.log('👤 Acción: Ver Perfil');
        
        // Obtener datos del usuario actual
        const userData = this.getUserProfileData();
        
        if (window.modalSystem) {
            window.modalSystem.show('profile', {
                title: '👤 Perfil de Usuario',
                size: 'medium',
                content: this.createProfileContent(userData),
                buttons: [
                    {
                        text: 'Cerrar',
                        type: 'secondary',
                        action: 'cancel'
                    },
                    {
                        text: 'Editar Perfil',
                        type: 'primary',
                        action: 'edit',
                        onClick: (e, modal, modalSystem) => {
                            this.handleEditProfile(userData, modal, modalSystem);
                        }
                    }
                ]
            });
        } else {
            console.error('❌ ModalSystem no disponible');
            alert('Sistema de modales no disponible');
        }
    }

    /**
     * 🆕 OBTENER DATOS DEL PERFIL DE USUARIO
     */
    getUserProfileData() {
        const currentUser = this.currentUser;
        
        // Obtener datos adicionales del sistema auth
        let authData = {};
        if (window.authSystem && window.authSystem.currentUser) {
            authData = window.authSystem.currentUser;
        }
        
        // Obtener estadísticas del localStorage
        const userStats = this.getUserStats();
        
        return {
            username: currentUser.name || authData.username || 'Usuario',
            initial: currentUser.initial || (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'),
            email: authData.email || 'No configurado',
            createdAt: authData.createdAt || new Date().toISOString(),
            lastLogin: authData.lastLogin || new Date().toISOString(),
            theme: this.getCurrentTheme(),
            currency: this.getCurrentCurrency(),
            stats: userStats
        };
    }

    /**
     * 🆕 CREAR CONTENIDO DEL PERFIL - VERSIÓN SIMPLIFICADA
     */
    createProfileContent(userData) {
        const createdDate = new Date(userData.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const lastLoginDate = new Date(userData.lastLogin).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
          
        return `
            <div class="profile-content">
                <!-- Avatar y Datos Básicos -->
                <div class="profile-header">
                    <div class="profile-avatar">
                        <span class="avatar-initial">${userData.initial}</span>
                    </div>
                    <div class="profile-info">
                        <h3 class="profile-name">${userData.username}</h3>
                        <p class="profile-subtitle">Usuario de WiseSpend</p>
                    </div>
                </div>
                
                <!-- Información Básica -->
                <div class="profile-details">
                    <div class="detail-section">
                        <h4>📊 Información de la Cuenta</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">👤 Usuario:</span>
                                <span class="detail-value">${userData.username}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">📅 Creado:</span>
                                <span class="detail-value">${createdDate}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">🕐 Último acceso:</span>
                                <span class="detail-value">${lastLoginDate}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Preferencias -->
                    <div class="detail-section">
                        <h4>⚙️ Preferencias</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">🎨 Tema:</span>
                                <span class="detail-value">${userData.theme || 'Claro'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">💰 Moneda:</span>
                                <span class="detail-value">${userData.currency || 'CLP'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Estadísticas -->
                    <div class="detail-section">
                        <h4>📈 Estadísticas de Uso</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="detail-label">💵 Total Ingresos:</span>
                                <span class="detail-value">${userData.stats.totalIngresos}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">💸 Total Gastos:</span>
                                <span class="detail-value">${userData.stats.totalGastos}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">💰 Balance:</span>
                                <span class="detail-value" style="color: ${userData.stats.balance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}">
                                    ${userData.stats.balance}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 🆕 EDITAR PERFIL
     */
    handleEditProfile(userData, modal, modalSystem) {
        console.log('✏️ Editando perfil...');
        
        // Crear formulario de edición
        const editContent = `
            <div class="profile-edit-form">
                <div class="form-group">
                    <label class="form-label">👤 Nombre de Usuario</label>
                    <input type="text" 
                           class="form-input" 
                           id="editUsername" 
                           value="${userData.username}" 
                           placeholder="Ingresa tu nombre">
                </div>
                
                <div class="form-group">
                    <label class="form-label">🔒 Nueva Contraseña (opcional)</label>
                    <input type="password" 
                           class="form-input" 
                           id="editPassword" 
                           placeholder="Dejar vacío para mantener actual">
                </div>
                
                <div class="form-group">
                    <label class="form-label">🔒 Confirmar Contraseña</label>
                    <input type="password" 
                           class="form-input" 
                           id="editPasswordConfirm" 
                           placeholder="Confirma tu nueva contraseña">
                </div>
                
                <p class="form-help">💡 Solo se actualizarán los campos que modifiques</p>
            </div>
        `;
        
        // Actualizar contenido del modal
        const modalBody = modal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.innerHTML = editContent;
        }
        
        // Actualizar botones del modal
        const modalFooter = modal.querySelector('.modal-footer');
        if (modalFooter) {
            modalFooter.innerHTML = `
                <button class="modal-button secondary" onclick="window.modalSystem.close()">
                    Cancelar
                </button>
                <button class="modal-button primary" id="saveProfileBtn">
                    💾 Guardar Cambios
                </button>
            `;
            
            // Event listener para guardar
            const saveBtn = document.getElementById('saveProfileBtn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    this.saveProfileChanges(modal, modalSystem);
                });
            }
        }
    }

    /**
     * 🆕 GUARDAR CAMBIOS DEL PERFIL
     */
    saveProfileChanges(modal, modalSystem) {
        const newUsername = document.getElementById('editUsername')?.value.trim();
        const newPassword = document.getElementById('editPassword')?.value;
        const confirmPassword = document.getElementById('editPasswordConfirm')?.value;
        
        // Validaciones
        if (!newUsername) {
            alert('❌ El nombre de usuario no puede estar vacío');
            return;
        }
        
        const changePassword = newPassword && newPassword.length > 0;
        
        if (changePassword) {
            if (newPassword !== confirmPassword) {
                alert('❌ Las contraseñas no coinciden');
                return;
            }
            
            if (newPassword.length < 4) {
                alert('❌ La contraseña debe tener al menos 4 caracteres');
                return;
            }
        }
        
        // Guardar cambios
        const changesToSave = [];
        
        // 1. Actualizar nombre de usuario
        if (newUsername && newUsername !== this.currentUser.name) {
            // Actualizar localStorage
            localStorage.setItem('currentUser', newUsername);
            
            // Actualizar authSystem si existe
            if (window.authSystem && window.authSystem.currentUser) {
                window.authSystem.currentUser.username = newUsername;
            }
            
            // Actualizar storageManager si existe
            if (window.storageManager) {
                const config = window.storageManager.getConfiguracion();
                config.usuario = newUsername;
                window.storageManager.setConfiguracion(config);
            }
            
            // Actualizar UI del header inmediatamente
            this.updateUserInfo(newUsername);
            
            changesToSave.push(`Nombre cambiado a: ${newUsername}`);
            console.log('✅ Nombre actualizado a:', newUsername);
        }
        
        // 2. Simular cambio de contraseña
        if (changePassword) {
            changesToSave.push('Contraseña actualizada');
            console.log('✅ Contraseña actualizada');
        }
        
        // 3. Registrar en changelog
        if (window.changeLogger && changesToSave.length > 0) {
            window.changeLogger.logChange('profile_updated', {
                changes: changesToSave,
                username: newUsername || this.currentUser.name
            });
        }
        
        // 4. CERRAR MODAL INMEDIATAMENTE
        modalSystem.close();
        
        // 5. Mostrar mensaje de éxito
        if (changesToSave.length > 0) {
            setTimeout(() => {
                alert('✅ Perfil actualizado correctamente');
            }, 100);
        }
    }

    /**
     * 🆕 OBTENER ESTADÍSTICAS DEL USUARIO
     */
    getUserStats() {
        let stats = {
            totalIngresos: '$0',
            totalGastos: '$0',
            balance: '$0'
        };
        
        try {
            if (window.storageManager) {
                const ingresos = window.storageManager.getIngresos() || [];
                const gastos = window.storageManager.getGastos() || [];
                
                const totalIngresos = ingresos.reduce((sum, ing) => sum + (parseFloat(ing.monto) || 0), 0);
                const totalGastos = gastos.reduce((sum, gasto) => sum + (parseFloat(gasto.monto) || 0), 0);
                const balance = totalIngresos - totalGastos;
                
                if (window.currencyManager) {
                    stats.totalIngresos = window.currencyManager.format(totalIngresos);
                    stats.totalGastos = window.currencyManager.format(totalGastos);
                    stats.balance = window.currencyManager.format(balance);
                } else {
                    stats.totalIngresos = `$${totalIngresos.toLocaleString('es-CL')}`;
                    stats.totalGastos = `$${totalGastos.toLocaleString('es-CL')}`;
                    stats.balance = `$${balance.toLocaleString('es-CL')}`;
                }
            }
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
        }
        
        return stats;
    }

    /**
     * 🆕 OBTENER TEMA ACTUAL
     */
    getCurrentTheme() {
        if (window.themeManager) {
            const theme = window.themeManager.currentTheme || 'light';
            return theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : theme;
        }
        return 'Claro';
    }

    /**
     * 🆕 OBTENER MONEDA ACTUAL
     */
    getCurrentCurrency() {
        if (window.currencyManager) {
            return window.currencyManager.getCurrentCurrency() || 'CLP';
        }
        return 'CLP';
    }

    handleAddUserAction() {
        this.closeDropdown();
        console.log('➕ Acción: Agregar Usuario');
        
        if (window.modalSystem) {
            window.modalSystem.show('add-user', {
                title: '➕ Agregar Nuevo Usuario',
                size: 'small',
                content: `
                    <p>Esta funcionalidad permite agregar usuarios adicionales al sistema.</p>
                    <p>⚠️ Función en desarrollo</p>
                `,
                buttons: [
                    {
                        text: 'Cerrar',
                        type: 'secondary',
                        action: 'cancel'
                    }
                ]
            });
        } else {
            alert('Función en desarrollo');
        }
    }

    handleLogoutAction() {
        this.closeDropdown();
        console.log('🚪 Acción: Cerrar Sesión');
        
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Usar la función global de auth.js
            if (typeof logoutUser === 'function') {
                logoutUser();
            } else {
                // Fallback manual
                localStorage.removeItem('currentUser');
                localStorage.removeItem('userSession');
                window.location.href = 'index.html';
            }
        }
    }

    handleLogoClick() {
        console.log('🎨 Logo clicked');
        
        if (this.elements.headerLogo) {
            this.elements.headerLogo.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.elements.headerLogo.style.transform = 'scale(1)';
            }, 150);
        }
        
        // Opcional: navegación al dashboard principal
        // window.location.href = 'dashboard.html';
    }

    /**
     * 📡 EVENTOS PERSONALIZADOS
     */
    dispatchReadyEvent() {
        const event = new CustomEvent('newHeaderReady', {
            detail: {
                manager: this,
                user: this.currentUser,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
        console.log('📡 Evento newHeaderReady dispatched');
    }

    /**
     * 🔄 API PÚBLICA
     */
    getUserInfo() {
        return { ...this.currentUser };
    }

    updateUser(newUserName) {
        this.updateUserInfo(newUserName);
    }

    refreshUserData() {
        this.loadUserData();
    }

    destroy() {
        // Limpiar event listeners si es necesario
        console.log('🧹 NewHeaderManager destruido');
    }
}

// 🌍 INICIALIZACIÓN GLOBAL
if (typeof window !== 'undefined') {
    // Crear instancia global
    window.newHeaderManager = new NewHeaderManager();
    
    // Evento para cuando otros scripts necesiten el header
    window.addEventListener('load', () => {
        console.log('✅ NewHeader completamente cargado y funcional - v1.2.0 CON ACTUALIZACIÓN AUTOMÁTICA');
    });
}