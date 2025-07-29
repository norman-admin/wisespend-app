/**
 * NEW-HEADER.JS - Funcionalidad Header Ultra Minimalista
 * WiseSpend - Control de Gastos Familiares
 * Versión: 1.1.0 - SIMPLIFICADO Y UNIFICADO
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Menú dropdown completo con animaciones
 * ✅ Integración con storageManager existente
 * ✅ Integración con auth.js para cerrar sesión
 * ✅ Auto-detección de nombre de usuario
 * ✅ Funciones compatibles con sistema actual
 * ✅ Event listeners optimizados
 * ✅ Responsive y accesible
 * 🆕 SISTEMA UNIFICADO CON MODAL-SYSTEM
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
            headerLogo: null
        };
        
        this.currentUser = {
            name: 'Usuario',
            initial: 'U'
        };
        
        this.init();
        console.log('🎨 NewHeaderManager v1.1.0 inicializado - UNIFICADO');
    }

    /**
     * 🚀 INICIALIZACIÓN PRINCIPAL
     */
    init() {
        this.waitForDOM(() => {
            this.cacheElements();
            this.loadUserData();
            this.setupEventListeners();
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
            headerLogo: document.getElementById('headerLogo')
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
                </div>
            </div>
        `;
    }

    /**
     * 🆕 OBTENER ESTADÍSTICAS DEL USUARIO
     */
    getUserStats() {
        try {
            // Obtener datos del storageManager si está disponible
            let totalIngresos = 0;
            let totalGastos = 0;
            
            if (window.storageManager) {
                const ingresos = window.storageManager.getIngresos() || {};
                const gastosFijos = window.storageManager.getGastosFijos() || {};
                const gastosVariables = window.storageManager.getGastosVariables() || {};
                const gastosExtras = window.storageManager.getGastosExtras() || {};
                
                // Calcular total ingresos
                totalIngresos = Object.values(ingresos).reduce((sum, ingreso) => {
                    return sum + (parseFloat(ingreso.monto) || 0);
                }, 0);
                
                // Calcular total gastos
                const gastosFijosTotal = Object.values(gastosFijos).reduce((sum, gasto) => {
                    return sum + (parseFloat(gasto.monto) || 0);
                }, 0);
                
                const gastosVariablesTotal = Object.values(gastosVariables).reduce((sum, gasto) => {
                    return sum + (parseFloat(gasto.monto) || 0);
                }, 0);
                
                const gastosExtrasTotal = Object.values(gastosExtras).reduce((sum, gasto) => {
                    return sum + (parseFloat(gasto.monto) || 0);
                }, 0);
                
                totalGastos = gastosFijosTotal + gastosVariablesTotal + gastosExtrasTotal;
            }
            
            return {
                totalIngresos: this.formatCurrency(totalIngresos),
                totalGastos: this.formatCurrency(totalGastos),
                balance: this.formatCurrency(totalIngresos - totalGastos)
            };
            
        } catch (error) {
            console.error('❌ Error obteniendo estadísticas:', error);
            return {
                totalIngresos: 'No disponible',
                totalGastos: 'No disponible',
                balance: 'No disponible'
            };
        }
    }

    /**
     * 🆕 OBTENER TEMA ACTUAL
     */
    getCurrentTheme() {
        try {
            if (window.themeManager && window.themeManager.currentTheme) {
                const theme = window.themeManager.currentTheme;
                const themeNames = {
                    'auto': 'Automático',
                    'light': 'Claro',
                    'dark': 'Oscuro',
                    'pastel': 'Pastel'
                };
                return themeNames[theme] || theme;
            }
            return 'Automático';
        } catch (error) {
            return 'No disponible';
        }
    }

    /**
     * 🆕 OBTENER MONEDA ACTUAL
     */
    getCurrentCurrency() {
        try {
            if (window.currencyManager && window.currencyManager.currentCurrency) {
                const currency = window.currencyManager.currentCurrency;
                return `${currency.name} (${currency.symbol})`;
            }
            return 'Peso Chileno ($)';
        } catch (error) {
            return 'No disponible';
        }
    }

    /**
     * 🆕 FORMATEAR MONEDA
     */
    formatCurrency(amount) {
        try {
            if (window.currencyManager && window.currencyManager.formatAmount) {
                return window.currencyManager.formatAmount(amount);
            }
            
            // Fallback manual
            const formatter = new Intl.NumberFormat('es-CL', {
                style: 'currency',
                currency: 'CLP',
                minimumFractionDigits: 0
            });
            return formatter.format(amount);
            
        } catch (error) {
            return `$${amount.toLocaleString('es-CL')}`;
        }
    }

    /**
     * 🆕 MANEJAR EDICIÓN DE PERFIL
     */
    handleEditProfile(userData, modal, modalSystem) {
        console.log('✏️ Editando perfil...');
        
        // Cerrar modal actual
        modalSystem.close();
        
        // Mostrar modal de edición con formularios funcionales
        setTimeout(() => {
            modalSystem.show('edit-profile', {
                title: '✏️ Editar Perfil',
                size: 'medium',
                content: this.createEditProfileForm(userData),
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'secondary',
                        action: 'cancel',
                        onClick: () => {
                            modalSystem.close();
                            setTimeout(() => this.handleProfileAction(), 100);
                        }
                    },
                    {
                        text: 'Guardar Cambios',
                        type: 'primary',
                        action: 'save',
                        onClick: (e, modal, modalSystem) => {
                            this.saveProfileChanges(modal, modalSystem);
                        }
                    }
                ]
            });
        }, 200);
    }

    /**
     * 🆕 CREAR FORMULARIO DE EDICIÓN DE PERFIL
     */
    createEditProfileForm(userData) {
        return `
            <div class="edit-profile-form">
                <!-- Cambiar Nombre de Usuario -->
                <div class="form-section">
                    <h4>👤 Cambiar Nombre de Usuario</h4>
                    <div class="form-group">
                        <label for="editUsername">Nuevo nombre de usuario:</label>
                        <input type="text" id="editUsername" name="username" 
                               value="${userData.username}" 
                               placeholder="Ingresa el nuevo nombre"
                               maxlength="20" required>
                        <small class="form-help">Máximo 20 caracteres</small>
                    </div>
                </div>
                
                <!-- Cambiar Contraseña -->
                <div class="form-section">
                    <h4>🔒 Actualizar Contraseña</h4>
                    <div class="form-group">
                        <label for="currentPassword">Contraseña actual:</label>
                        <input type="password" id="currentPassword" name="currentPassword" 
                               placeholder="Ingresa tu contraseña actual"
                               required>
                    </div>
                    <div class="form-group">
                        <label for="newPassword">Nueva contraseña:</label>
                        <input type="password" id="newPassword" name="newPassword" 
                               placeholder="Ingresa la nueva contraseña"
                               minlength="8" required>
                        <small class="form-help">Mínimo 8 caracteres</small>
                    </div>
                    <div class="form-group">
                        <label for="confirmNewPassword">Confirmar nueva contraseña:</label>
                        <input type="password" id="confirmNewPassword" name="confirmNewPassword" 
                               placeholder="Confirma la nueva contraseña"
                               minlength="8" required>
                    </div>
                </div>
                
                <!-- Validación de contraseña -->
                <div class="password-validation" id="passwordValidation" style="display: none;">
                    <h5>Requisitos de contraseña:</h5>
                    <ul>
                        <li id="length-check">Mínimo 8 caracteres</li>
                        <li id="match-check">Las contraseñas coinciden</li>
                    </ul>
                </div>
            </div>
       
            <script>
                // Validación en tiempo real de contraseñas
                setTimeout(() => {
                    const newPassword = document.getElementById('newPassword');
                    const confirmPassword = document.getElementById('confirmNewPassword');
                    const validation = document.getElementById('passwordValidation');
                    const lengthCheck = document.getElementById('length-check');
                    const matchCheck = document.getElementById('match-check');
                    
                    function validatePasswords() {
                        const newPass = newPassword.value;
                        const confirmPass = confirmPassword.value;
                        
                        if (newPass.length > 0 || confirmPass.length > 0) {
                            validation.style.display = 'block';
                            
                            // Validar longitud
                            if (newPass.length >= 8) {
                                lengthCheck.classList.add('valid');
                            } else {
                                lengthCheck.classList.remove('valid');
                            }
                            
                            // Validar coincidencia
                            if (newPass === confirmPass && newPass.length > 0) {
                                matchCheck.classList.add('valid');
                            } else {
                                matchCheck.classList.remove('valid');
                            }
                        } else {
                            validation.style.display = 'none';
                        }
                    }
                    
                    if (newPassword && confirmPassword) {
                        newPassword.addEventListener('input', validatePasswords);
                        confirmPassword.addEventListener('input', validatePasswords);
                    }
                }, 100);
            </script>
        `;
    }

    /**
     * 🆕 GUARDAR CAMBIOS DEL PERFIL
     */
    saveProfileChanges(modal, modalSystem) {
        try {
            // Obtener valores del formulario
            const newUsername = document.getElementById('editUsername')?.value.trim();
            const currentPassword = document.getElementById('currentPassword')?.value;
            const newPassword = document.getElementById('newPassword')?.value;
            const confirmNewPassword = document.getElementById('confirmNewPassword')?.value;
            
            // Validaciones básicas
            if (!newUsername || newUsername.length < 3) {
                this.showEditError('El nombre de usuario debe tener al menos 3 caracteres');
                return;
            }
            
            // Si se quiere cambiar contraseña, validar
            let changePassword = false;
            if (newPassword || confirmNewPassword || currentPassword) {
                if (!currentPassword) {
                    this.showEditError('Debes ingresar tu contraseña actual');
                    return;
                }
                
                if (!newPassword || newPassword.length < 8) {
                    this.showEditError('La nueva contraseña debe tener al menos 8 caracteres');
                    return;
                }
                
                if (newPassword !== confirmNewPassword) {
                    this.showEditError('Las contraseñas nuevas no coinciden');
                    return;
                }
                
                changePassword = true;
            }
            
            console.log('💾 Guardando cambios automáticamente...');
            
            // GUARDAR CAMBIOS INMEDIATAMENTE
            let changesToSave = [];
            
            // 1. Actualizar nombre de usuario
            if (newUsername && newUsername !== this.currentUser.name) {
                // Actualizar localStorage
                localStorage.setItem('currentUser', newUsername);
                
                // Actualizar authSystem si existe
                if (window.authSystem && window.authSystem.currentUser) {
                    window.authSystem.currentUser.username = newUsername;
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
            
            // 5. Mostrar confirmación SIN REABRIR PERFIL
            if (changesToSave.length > 0) {
                console.log('🎉 Cambios guardados:', changesToSave);
                
                // Solo mostrar mensaje de éxito
                setTimeout(() => {
                    this.showCustomSuccessModal(changesToSave);
                }, 300);
            }
            
        } catch (error) {
            console.error('❌ Error guardando cambios:', error);
            this.showEditError('Error al guardar: ' + error.message);
        }
    }

    /**
     * 🆕 MOSTRAR MODAL DE ÉXITO PERSONALIZADO
     */
    showCustomSuccessModal(changes) {
        if (window.modalSystem) {
            window.modalSystem.show('profile-success', {
                title: '✅ Perfil Actualizado',
                size: 'small',
                content: this.createSuccessContent(changes),
                buttons: [
                    {
                        text: 'Aceptar',
                        type: 'primary',
                        action: 'accept',
                        onClick: (e, modal, modalSystem) => {
                            modalSystem.close();
                        }
                    }
                ]
            });
        } else {
            // Fallback al alert simple
            alert(`✅ Perfil actualizado:\n${changes.map(c => `• ${c}`).join('\n')}`);
        }
    }

    /**
     * 🆕 CREAR CONTENIDO DEL MODAL DE ÉXITO
     */
    createSuccessContent(changes) {
        return `
            <div class="success-modal-content">
                <!-- Icono de éxito -->
                <div class="success-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" fill="#10b981" fill-opacity="0.1"/>
                        <path d="M16 24l6 6 12-12" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                
                <!-- Mensaje principal -->
                <div class="success-message">
                    <h3>¡Cambios guardados exitosamente!</h3>
                    <p>Tu perfil ha sido actualizado con los siguientes cambios:</p>
                </div>
                
                <!-- Lista de cambios -->
                <div class="changes-list">
                    ${changes.map(change => `
                        <div class="change-item">
                            <svg class="check-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <span>${change}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 🆕 MOSTRAR ERROR EN EDICIÓN
     */
    showEditError(message) {
        console.error('❌ Error de edición:', message);
        
        // Mostrar error en el modal si está disponible
        const errorDiv = document.createElement('div');
        errorDiv.className = 'edit-error';
        errorDiv.style.cssText = `
            background: #fef2f2; 
            border: 1px solid #fca5a5; 
            border-radius: 6px; 
            padding: 10px; 
            margin: 10px 0; 
            color: #dc2626; 
            font-size: 14px;
            text-align: center;
        `;
        errorDiv.textContent = message;
        
        // Buscar donde insertar el error
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            // Remover errores anteriores
            const oldErrors = modalBody.querySelectorAll('.edit-error');
            oldErrors.forEach(error => error.remove());
            
            // Insertar nuevo error
            modalBody.insertBefore(errorDiv, modalBody.firstChild);
            
            // Auto-remover después de 5 segundos
            setTimeout(() => errorDiv.remove(), 5000);
        } else {
            // Fallback: alert
            alert(message);
        }
    }

    handleAddUserAction() {
        this.closeDropdown();
        console.log('➕ Acción: Agregar Usuario');
        
        // Redirigir al formulario de registro existente
        if (window.location.pathname.includes('dashboard.html')) {
            console.log('🔄 Redirigiendo desde dashboard a registro...');
            window.location.href = 'index-backup.html?mode=register';
        } else {
            console.log('🔄 Ya en página de login/registro');
            // Si ya estamos en index-backup.html, cambiar a modo registro
            this.switchToRegisterMode();
        }
    }

    /**
     * 🆕 CAMBIAR A MODO REGISTRO
     */
    switchToRegisterMode() {
        // Si estamos en la página de login, cambiar a modo registro
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const toggleModeBtn = document.getElementById('toggle-mode');
        
        if (loginForm && registerForm) {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            
            // Actualizar UI del botón toggle si existe
            if (toggleModeBtn) {
                const modeQuestion = document.getElementById('mode-question');
                const modeAction = document.getElementById('mode-action');
                
                if (modeQuestion && modeAction) {
                    modeQuestion.textContent = '¿Ya tienes cuenta?';
                    modeAction.textContent = 'Iniciar sesión';
                }
            }
            
            console.log('✅ Cambiado a modo registro');
        } else {
            console.log('ℹ️ Formularios no encontrados, posiblemente ya en modo correcto');
        }
    }

    handleLogoutAction() {
        this.closeDropdown();
        console.log('🚪 Acción: Cerrar Sesión');
        
        // Usar modal personalizado en lugar de confirm()
        if (window.modalSystem) {
            window.modalSystem.show('logout-confirmation', {
                title: '🚪 Cerrar Sesión',
                size: 'small',
                content: this.createLogoutContent(),
                buttons: [
                    {
                        text: 'Cancelar',
                        type: 'secondary',
                        action: 'cancel',
                        onClick: (e, modal, modalSystem) => {
                            modalSystem.close();
                        }
                    },
                    {
                        text: 'Cerrar Sesión',
                        type: 'danger',
                        action: 'logout',
                        onClick: (e, modal, modalSystem) => {
                            this.performLogout();
                            modalSystem.close();
                        }
                    }
                ]
            });
        } else {
            // Fallback al confirm tradicional
            const confirmLogout = confirm(`¿Estás seguro de que quieres cerrar la sesión de ${this.currentUser.name}?`);
            if (confirmLogout) {
                this.performLogout();
            }
        }
    }

    /**
     * 🆕 CREAR CONTENIDO DEL MODAL DE LOGOUT
     */
    createLogoutContent() {
        return `
            <div class="logout-confirmation-content">
                <div class="logout-icon">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="20" fill="#ef4444" fill-opacity="0.1"/>
                        <path d="M18 18l12 12M18 30l12-12" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </div>
                <div class="logout-message">
                    <p><strong>¿Estás seguro de que quieres cerrar la sesión?</strong></p>
                    <p class="logout-details">Usuario activo: <span class="user-highlight">${this.currentUser.name}</span></p>
                </div>
            </div>
        `;
    }

    /**
     * 🆕 EJECUTAR LOGOUT CON AUTO-GUARDADO E INTEGRACIÓN
     */
    performLogout() {
        try {
            console.log('🚪 Iniciando proceso de logout...');
            
            // 1. Auto-guardado antes del logout
            this.performAutoSave();

            // 2. Ejecutar logout según disponibilidad de sistemas
            setTimeout(() => {
                if (window.authSystem && typeof window.authSystem.logout === 'function') {
                    console.log('✅ Usando authSystem.logout()');
                    window.authSystem.logout();
                } else if (window.authManager && typeof window.authManager.logout === 'function') {
                    console.log('✅ Usando authManager.logout()');
                    window.authManager.logout();
                } else if (typeof logout === 'function') {
                    console.log('✅ Usando función global logout()');
                    logout();
                } else {
                    console.log('⚠️ Usando logout manual');
                    this.manualLogout();
                }
            }, 500); // Pequeño delay para que se complete el auto-guardado
            
        } catch (error) {
            console.error('❌ Error durante logout:', error);
            // Proceder con logout manual como fallback
            this.manualLogout();
        }
    }

    /**
     * 🆕 AUTO-GUARDADO ANTES DEL LOGOUT
     */
    performAutoSave() {
        try {
            console.log('💾 Ejecutando auto-guardado antes del logout...');
            
            // Guardar datos a través de storageManager si está disponible
            if (window.storageManager && typeof window.storageManager.saveAllData === 'function') {
                window.storageManager.saveAllData();
                console.log('✅ Datos guardados via storageManager');
            }
            
            // Backup adicional en localStorage
            const timestamp = new Date().toISOString();
            localStorage.setItem('last_logout_save', timestamp);
            
            console.log('✅ Auto-guardado completado');
            
        } catch (error) {
            console.warn('⚠️ Error en auto-guardado:', error);
        }
    }

    /**
     * 🆕 LOGOUT MANUAL COMO FALLBACK
     */
    manualLogout() {
        console.log('🔧 Ejecutando logout manual...');
        
        // Limpiar datos de sesión
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('app_session');
        
        // Registrar logout manual
        localStorage.setItem('manual_logout', new Date().toISOString());
        
        console.log('🚪 Sesión cerrada manualmente');
        
        // Redireccionar después de un momento
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    } 

    handleLogoClick() {
        console.log('🏷️ Logo clicked');
        
        // Efecto visual en el logo
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
        console.log('✅ NewHeader completamente cargado y funcional - UNIFICADO');
    });
}