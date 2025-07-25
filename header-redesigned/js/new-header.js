/**
 * NEW-HEADER.JS - Funcionalidad Header Ultra Minimalista
 * WiseSpend - Control de Gastos Familiares
 * Versión: 1.0.0 - Integrado con Sistema Existente
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Menú dropdown completo con animaciones
 * ✅ Integración con storageManager existente
 * ✅ Integración con auth.js para cerrar sesión
 * ✅ Auto-detección de nombre de usuario
 * ✅ Funciones compatibles con sistema actual
 * ✅ Event listeners optimizados
 * ✅ Responsive y accesible
 * ✅ Sistema de logging de cambios reales
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
        console.log('🎨 NewHeaderManager v1.0.0 inicializado');
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
            // Intentar obtener datos del storageManager
            if (window.storageManager) {
                const config = window.storageManager.getConfiguracion();
                const usuario = config?.usuario || config?.currentUser || 'Usuario';
                this.updateUserInfo(usuario);
                console.log(`✅ Usuario cargado desde storage: ${usuario}`);
            } 
            // Fallback: intentar localStorage directo
            else if (localStorage.getItem('currentUser')) {
                const usuario = localStorage.getItem('currentUser');
                this.updateUserInfo(usuario);
                console.log(`✅ Usuario cargado desde localStorage: ${usuario}`);
            }
            // Fallback final
            else {
                this.updateUserInfo('Usuario');
                console.log('⚠️ Usuario por defecto cargado');
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
     * 🎧 CONFIGURAR EVENT LISTENERS
     */
    setupEventListeners() {
        // Botón principal del menú
        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });
        }

        // Clics fuera del menú para cerrarlo
        document.addEventListener('click', (e) => {
            if (!this.elements.header?.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Escape key para cerrar menú
        document.addEventListener('keydown', (e) => {
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

        console.log('✅ Event listeners configurados');
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
     * ♿ CONFIGURAR ACCESIBILIDAD
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
     * 🔄 TOGGLE DROPDOWN MENU
     */
    toggleDropdown() {
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
        }
        
        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.classList.add('open');
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
            this.elements.userDropdownMenu.classList.remove('show');
            this.elements.userDropdownMenu.setAttribute('aria-hidden', 'true');
        }
        
        if (this.elements.userMenuButton) {
            this.elements.userMenuButton.classList.remove('open');
            this.elements.userMenuButton.setAttribute('aria-expanded', 'false');
        }
        
        if (this.elements.menuArrow) {
            this.elements.menuArrow.style.transform = 'rotate(0deg)';
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
        
        const recentChanges = this.getRecentChanges();
        
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
                    
                    <!-- Últimos Cambios -->
                    <div class="detail-section">
                        <h4>📝 Últimos Cambios</h4>
                        <div class="recent-changes">
                            ${recentChanges.map(change => `
                                <div class="change-item">
                                    <span class="change-action">${change.action}</span>
                                    <span class="change-date">${change.date}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
            
            <style>
                .profile-content { padding: 10px 0; }
                .profile-header { 
                    display: flex; 
                    align-items: center; 
                    gap: 16px; 
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #e5e7eb;
                }
                .profile-avatar { 
                    width: 60px; 
                    height: 60px; 
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                }
                .avatar-initial { 
                    color: white; 
                    font-size: 24px; 
                    font-weight: 600; 
                }
                .profile-name { 
                    margin: 0 0 4px 0; 
                    font-size: 20px; 
                    font-weight: 600; 
                    color: #1f2937; 
                }
                .profile-subtitle { 
                    margin: 0; 
                    color: #6b7280; 
                    font-size: 14px; 
                }
                .detail-section { 
                    margin-bottom: 20px; 
                }
                .detail-section h4 { 
                    margin: 0 0 12px 0; 
                    font-size: 16px; 
                    font-weight: 600; 
                    color: #374151; 
                    padding-bottom: 8px;
                    border-bottom: 2px solid #f3f4f6;
                }
                .detail-grid { 
                    display: grid; 
                    gap: 8px; 
                }
                .detail-item { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    padding: 8px 12px;
                    background: #f9fafb;
                    border-radius: 6px;
                    border-left: 3px solid #e5e7eb;
                }
                .detail-label { 
                    font-weight: 500; 
                    color: #374151; 
                    font-size: 14px;
                }
                .detail-value { 
                    color: #6b7280; 
                    font-size: 14px;
                    font-weight: 500;
                }
                .recent-changes {
                    display: grid;
                    gap: 8px;
                }
                .change-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: #f0f9ff;
                    border-radius: 6px;
                    border-left: 3px solid #0ea5e9;
                }
                .change-action {
                    font-weight: 500;
                    color: #0369a1;
                    font-size: 14px;
                }
                .change-date {
                    color: #6b7280;
                    font-size: 12px;
                }
            </style>
        `;
    }

    /**
     * 🆕 SISTEMA DE LOGGING CENTRALIZADO PARA CAMBIOS REALES
     */
}

class ChangeLogger {
    constructor() {
        this.storageKey = 'wisespend_real_changelog';
        this.maxEntries = 50;
    }

    logChange(action, details = {}) {
        try {
            const changeEntry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                action: action,
                details: details,
                user: this.getCurrentUser(),
                section: this.getCurrentSection()
            };

            const changelog = this.getChangeLog();
            changelog.unshift(changeEntry);

            if (changelog.length > this.maxEntries) {
                changelog.splice(this.maxEntries);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(changelog));
            console.log('Cambio registrado:', changeEntry);

        } catch (error) {
            console.error('Error registrando cambio:', error);
        }
    }

    getChangeLog() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
        } catch (error) {
            console.error('Error leyendo changelog:', error);
            return [];
        }
    }

    getRecentChanges(count = 2) {
        return this.getChangeLog().slice(0, count);
    }

    getCurrentUser() {
        if (window.authSystem && window.authSystem.currentUser) {
            return window.authSystem.currentUser.username;
        }
        return 'Usuario';
    }

    getCurrentSection() {
        const activeButton = document.querySelector('.nav-item.active');
        if (activeButton) {
            return activeButton.dataset.section || 'dashboard';
        }
        return 'dashboard';
    }

    clearLog() {
        localStorage.removeItem(this.storageKey);
        console.log('Historial de cambios limpio');
    }
}

// Crear instancia global del logger
window.changeLogger = new ChangeLogger();

// Continuar con NewHeaderManager
NewHeaderManager.prototype.getRecentChanges = function() {
    try {
        if (window.changeLogger) {
            const recentChanges = window.changeLogger.getRecentChanges(2);
            
            if (recentChanges.length > 0) {
                return recentChanges.map(change => ({
                    action: this.formatRealChangeAction(change),
                    date: new Date(change.timestamp).toLocaleDateString('es-ES', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }));
            }
        }

        return [
            {
                action: 'Sesión iniciada',
                date: new Date().toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            },
            {
                action: 'Sistema cargado',
                date: new Date().toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
        ];

    } catch (error) {
        console.error('Error obteniendo cambios reales:', error);
        return [
            {
                action: 'Error al cargar cambios',
                date: 'Ahora'
            }
        ];
    }
};

NewHeaderManager.prototype.formatRealChangeAction = function(change) {
    const actionMap = {
        'ingreso_added': `Ingreso agregado: ${change.details.nombre || 'Sin nombre'}`,
        'ingreso_updated': `Ingreso modificado: ${change.details.nombre || 'Sin nombre'}`,
        'ingreso_deleted': `Ingreso eliminado: ${change.details.nombre || 'Sin nombre'}`,
        'gasto_fijo_added': `Gasto fijo agregado: ${change.details.nombre || 'Sin nombre'}`,
        'gasto_variable_added': `Gasto variable agregado: ${change.details.nombre || 'Sin nombre'}`,
        'gasto_extra_added': `Gasto extra agregado: ${change.details.nombre || 'Sin nombre'}`,
        'gasto_updated': `Gasto modificado: ${change.details.nombre || 'Sin nombre'}`,
        'gasto_deleted': `Gasto eliminado: ${change.details.nombre || 'Sin nombre'}`,
        'user_login': 'Sesión iniciada',
        'config_changed': 'Configuración cambiada',
        'theme_changed': `Tema cambiado a: ${change.details.theme || 'Desconocido'}`,
        'currency_changed': `Moneda cambiada a: ${change.details.currency || 'Desconocida'}`,
        'section_changed': `Navegó a: ${change.details.section || 'Sección desconocida'}`
    };

    return actionMap[change.action] || `${change.action}`;
};

NewHeaderManager.prototype.getUserStats = function() {
    try {
        // Obtener datos del storageManager si está disponible
        let totalIngresos = 0;
        let totalGastos = 0;
        
        if (window.storageManager) {
            const ingresos = window.storageManager.getData('ingresos') || {};
            const gastosFijos = window.storageManager.getData('gastosFijos') || {};
            const gastosVariables = window.storageManager.getData('gastosVariables') || {};
            const gastosExtras = window.storageManager.getData('gastosExtras') || {};
            
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
};

NewHeaderManager.prototype.getCurrentTheme = function() {
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
};

NewHeaderManager.prototype.getCurrentCurrency = function() {
    try {
        if (window.currencyManager && window.currencyManager.currentCurrency) {
            const currency = window.currencyManager.currentCurrency;
            return `${currency.name} (${currency.symbol})`;
        }
        return 'Peso Chileno ($)';
    } catch (error) {
        return 'No disponible';
    }
};

NewHeaderManager.prototype.formatCurrency = function(amount) {
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
};

NewHeaderManager.prototype.handleEditProfile = function(userData, modal, modalSystem) {
    console.log('✏️ Editando perfil...');
    
    // Cerrar modal actual
    modalSystem.close();
    
    // Mostrar modal de edición
    setTimeout(() => {
        modalSystem.show('edit-profile', {
            title: '✏️ Editar Perfil',
            size: 'medium',
            content: `
                <div style="padding: 10px 0;">
                    <p style="text-align: center; color: #6b7280; margin: 20px 0;">
                        🚧 Funcionalidad de edición en desarrollo
                    </p>
                    <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin: 20px 0;">
                        <h4 style="margin: 0 0 8px 0; color: #0369a1;">💡 Próximamente:</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #0369a1;">
                            <li>Cambiar nombre de usuario</li>
                            <li>Actualizar contraseña</li>
                            <li>Configurar tema preferido</li>
                            <li>Cambiar moneda predeterminada</li>
                        </ul>
                    </div>
                </div>
            `,
            buttons: [
                {
                    text: 'Volver al Perfil',
                    type: 'primary',
                    action: 'back',
                    onClick: () => {
                        modalSystem.close();
                        setTimeout(() => this.handleProfileAction(), 100);
                    }
                }
            ]
        });
    }, 200);
};

NewHeaderManager.prototype.handleAddUserAction = function() {
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
};

NewHeaderManager.prototype.switchToRegisterMode = function() {
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
};

NewHeaderManager.prototype.handleLogoutAction = function() {
    this.closeDropdown();
    console.log('🚪 Acción: Cerrar Sesión');
    
    // Confirmación de cierre de sesión
    const confirmLogout = confirm(`¿Estás seguro de que quieres cerrar la sesión de ${this.currentUser.name}?`);
    
    if (confirmLogout) {
        // Integrar con auth.js existente
        if (window.authManager && typeof window.authManager.logout === 'function') {
            window.authManager.logout();
        } else if (typeof logout === 'function') {
            logout();
        } else {
            // Fallback manual
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            console.log('🚪 Sesión cerrada manualmente');
            window.location.href = 'index.html';
        }
    }
};

NewHeaderManager.prototype.handleLogoClick = function() {
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
};

/**
 * 📡 EVENTOS PERSONALIZADOS
 */
NewHeaderManager.prototype.dispatchReadyEvent = function() {
    const event = new CustomEvent('newHeaderReady', {
        detail: {
            manager: this,
            user: this.currentUser,
            timestamp: new Date().toISOString()
        }
    });
    window.dispatchEvent(event);
    console.log('📡 Evento newHeaderReady dispatched');
};

/**
 * 🔄 API PÚBLICA
 */
NewHeaderManager.prototype.getUserInfo = function() {
    return { ...this.currentUser };
};

NewHeaderManager.prototype.updateUser = function(newUserName) {
    this.updateUserInfo(newUserName);
};

NewHeaderManager.prototype.refreshUserData = function() {
    this.loadUserData();
};

NewHeaderManager.prototype.destroy = function() {
    // Limpiar event listeners si es necesario
    console.log('🧹 NewHeaderManager destruido');
};

// 🌍 INICIALIZACIÓN GLOBAL
if (typeof window !== 'undefined') {
    // Crear instancia global
    window.newHeaderManager = new NewHeaderManager();
    
    // Evento para cuando otros scripts necesiten el header
    window.addEventListener('load', () => {
        console.log('✅ NewHeader completamente cargado y funcional');
    });
}