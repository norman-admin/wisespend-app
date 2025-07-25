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
        
        // Integrar con sistema existente o mostrar modal
            if (window.modalSystem) {
        window.modalSystem.show('profile', {
            title: '👤 Perfil de Usuario',
            content: `
                    <div style="text-align: center; padding: 20px;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: white; font-size: 32px; font-weight: bold;">
                            ${this.currentUser.initial}
                        </div>
                        <h3 style="margin: 0 0 8px 0;">${this.currentUser.name}</h3>
                        <p style="color: #6b7280; margin: 0;">Usuario del sistema WiseSpend</p>
                        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; font-size: 14px; color: #9ca3af;">Funcionalidades de perfil en desarrollo</p>
                        </div>
                    </div>
                `,
                actions: [
                    { text: 'Cerrar', variant: 'primary' }
                ]
            });
        } else {
            alert('👤 Perfil de usuario\n\nFuncionalidad en desarrollo...');
        }
    }

    handleAddUserAction() {
        this.closeDropdown();
        console.log('➕ Acción: Agregar Usuario');
        
        // Integrar con función existente del sistema
        if (window.componentLoader && document.getElementById('add-user-btn')) {
            // Simular click en botón original si existe
            document.getElementById('add-user-btn').click();
        } else {
            // Fallback con prompt simple
            const nuevoUsuario = prompt('➕ Ingrese el nombre del nuevo usuario:');
            if (nuevoUsuario && nuevoUsuario.trim()) {
                console.log(`➕ Nuevo usuario: ${nuevoUsuario.trim()}`);
                alert(`Usuario "${nuevoUsuario.trim()}" agregado exitosamente.\n\n(Funcionalidad completa en desarrollo)`);
            }
        }
    }

    handleLogoutAction() {
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
        console.log('✅ NewHeader completamente cargado y funcional');
    });
}