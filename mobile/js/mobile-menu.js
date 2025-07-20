/**
 * 📱 MOBILE-MENU.JS - Control de Menú Móvil
 * Control de Gastos Familiares - Sistema Móvil
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Botón hamburger flotante
 * ✅ Sidebar deslizante
 * ✅ Overlay para cerrar
 * ✅ Solo funciona en móvil
 */

class MobileMenuManager {
    constructor() {
        this.isMobile = window.innerWidth <= 768;
        this.menuBtn = null;
        this.sidebar = null;
        this.overlay = null;
        this.isMenuOpen = false;
        
        // Solo inicializar en móvil
        if (this.isMobile) {
            this.init();
        }
        
        // Escuchar cambios de tamaño de ventana
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    /**
     * 🚀 Inicializar sistema móvil
     */
    init() {
        console.log('📱 Inicializando sistema de menú móvil...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupMobileMenu();
            });
        } else {
            this.setupMobileMenu();
        }
    }
    
    /**
     * 🏗️ Configurar elementos del menú móvil
     */
    setupMobileMenu() {
        try {
            // Crear botón hamburger
            this.createMobileButton();
            
            // Configurar sidebar existente
            this.setupSidebar();
            
            // Crear overlay
            this.createOverlay();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            console.log('✅ Sistema de menú móvil configurado');
            
        } catch (error) {
            console.error('❌ Error configurando menú móvil:', error);
        }
    }
    
    /**
     * 🔘 Crear botón hamburger flotante
     */
    createMobileButton() {
        // Verificar si ya existe
        if (document.querySelector('.mobile-menu-btn')) {
            return;
        }
        
        this.menuBtn = document.createElement('button');
        this.menuBtn.className = 'mobile-menu-btn';
        this.menuBtn.innerHTML = '☰';
        this.menuBtn.setAttribute('aria-label', 'Abrir menú');
        this.menuBtn.setAttribute('type', 'button');
        
        // Agregar al body
        document.body.appendChild(this.menuBtn);
        
        console.log('✅ Botón hamburger creado');
    }
    
    /**
     * 📋 Configurar sidebar existente
     */
    setupSidebar() {
        // Buscar sidebar existente
        this.sidebar = document.querySelector('.sidebar') || 
                      document.querySelector('#sidebar-container .sidebar');
        
        if (!this.sidebar) {
            // Si no existe, buscar en el contenedor
            const sidebarContainer = document.querySelector('#sidebar-container');
            if (sidebarContainer) {
                // Esperar a que se cargue dinámicamente
                setTimeout(() => {
                    this.sidebar = sidebarContainer.querySelector('.sidebar');
                    if (this.sidebar) {
                        console.log('✅ Sidebar encontrado después de carga dinámica');
                    }
                }, 500);
            }
        }
        
        if (this.sidebar) {
            console.log('✅ Sidebar configurado para móvil');
        } else {
            console.log('⏳ Sidebar no encontrado, se configurará cuando esté disponible');
        }
    }
    
    /**
     * 🔳 Crear overlay
     */
    createOverlay() {
        // Verificar si ya existe
        if (document.querySelector('.mobile-overlay')) {
            return;
        }
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'mobile-overlay';
        
        // Agregar al body
        document.body.appendChild(this.overlay);
        
        console.log('✅ Overlay creado');
    }
    
    /**
     * 🎧 Configurar event listeners
     */
    setupEventListeners() {
        // Click en botón hamburger
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleMenu();
            });
        }
        
        // Click en overlay para cerrar
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeMenu();
            });
        }
        
        // Tecla ESC para cerrar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMenu();
            }
        });
        
        // Click en opciones del menú para cerrar automáticamente
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item') && this.isMenuOpen) {
                // Pequeño delay para que se vea la selección
                setTimeout(() => {
                    this.closeMenu();
                }, 150);
            }
        });
        
        console.log('✅ Event listeners configurados');
    }
    
    /**
     * 🔄 Toggle menú
     */
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    /**
     * 📖 Abrir menú
     */
    openMenu() {
        try {
            // Refrescar referencia al sidebar si no existe
            if (!this.sidebar) {
                this.sidebar = document.querySelector('.sidebar') || 
                              document.querySelector('#sidebar-container .sidebar');
            }
            
            if (this.sidebar) {
                this.sidebar.classList.add('mobile-open');
            }
            
            if (this.overlay) {
                this.overlay.classList.add('active');
            }
            
            if (this.menuBtn) {
                this.menuBtn.innerHTML = '✕';
                this.menuBtn.setAttribute('aria-label', 'Cerrar menú');
            }
            
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
            
            this.isMenuOpen = true;
            
            console.log('📖 Menú abierto');
            
        } catch (error) {
            console.error('❌ Error abriendo menú:', error);
        }
    }
    
    /**
     * 📕 Cerrar menú
     */
    closeMenu() {
        try {
            if (this.sidebar) {
                this.sidebar.classList.remove('mobile-open');
            }
            
            if (this.overlay) {
                this.overlay.classList.remove('active');
            }
            
            if (this.menuBtn) {
                this.menuBtn.innerHTML = '☰';
                this.menuBtn.setAttribute('aria-label', 'Abrir menú');
            }
            
            // Restaurar scroll del body
            document.body.style.overflow = '';
            
            this.isMenuOpen = false;
            
            console.log('📕 Menú cerrado');
            
        } catch (error) {
            console.error('❌ Error cerrando menú:', error);
        }
    }
    
    /**
     * 📏 Manejar cambio de tamaño de ventana
     */
    handleResize() {
        const newIsMobile = window.innerWidth <= 768;
        
        // Si cambiamos de móvil a desktop
        if (this.isMobile && !newIsMobile) {
            this.destroyMobileMenu();
            this.isMobile = false;
        }
        // Si cambiamos de desktop a móvil
        else if (!this.isMobile && newIsMobile) {
            this.isMobile = true;
            this.setupMobileMenu();
        }
    }
    
    /**
     * 🗑️ Destruir elementos móviles (al cambiar a desktop)
     */
    destroyMobileMenu() {
        try {
            // Cerrar menú si está abierto
            this.closeMenu();
            
            // Remover botón hamburger
            if (this.menuBtn) {
                this.menuBtn.remove();
                this.menuBtn = null;
            }
            
            // Remover overlay
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
            
            // Limpiar clases del sidebar
            if (this.sidebar) {
                this.sidebar.classList.remove('mobile-open');
            }
            
            console.log('🗑️ Elementos móviles destruidos');
            
        } catch (error) {
            console.error('❌ Error destruyendo menú móvil:', error);
        }
    }
    
    /**
     * 📊 Obtener estado del menú
     */
    getMenuState() {
        return {
            isMobile: this.isMobile,
            isMenuOpen: this.isMenuOpen,
            hasMenuBtn: !!this.menuBtn,
            hasSidebar: !!this.sidebar,
            hasOverlay: !!this.overlay
        };
    }
}

// 🚀 Inicializar automáticamente
let mobileMenuManager;

// Función de inicialización
function initMobileMenu() {
    if (!mobileMenuManager) {
        mobileMenuManager = new MobileMenuManager();
        
        // Exponer globalmente para debugging
        window.mobileMenuManager = mobileMenuManager;
        
        console.log('📱 Mobile Menu Manager inicializado');
        console.log('🛠️ Debug disponible en: window.mobileMenuManager.getMenuState()');
    }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

// Función global para debug
window.toggleMobileMenu = function() {
    if (mobileMenuManager) {
        mobileMenuManager.toggleMenu();
    }
};

console.log('📱 Mobile Menu JS cargado - Sistema de menú móvil activo');