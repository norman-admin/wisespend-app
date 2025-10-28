/**
 * 🔐 Sistema de Autenticación - SOLO SUPABASE AUTH
 * Control de Gastos Familiares - auth.js v2.0
 * 
 * CHANGELOG v2.0:
 * - ✅ Eliminado PBKDF2 local
 * - ✅ Solo Supabase Auth
 * - ✅ Validación simplificada (mínimo 6 caracteres)
 * - ✅ Email automático basado en username (@wisespend.app)
 * - ✅ Código limpio sin duplicados
 */

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.passwordRequirements = {
            minLength: 6,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false
        };
        
        this.isIntegrated = false;
        this.integrationLog = [];
        
        this.init();
    }

    /**
     * 📊 MÉTODO DE LOGGING CENTRALIZADO
     */
    log(message, type = 'info', data = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            message,
            data,
            user: this.currentUser ? this.currentUser.username : 'anonymous'
        };
        
        this.integrationLog.push(logEntry);
        
        if (this.integrationLog.length > 100) {
            this.integrationLog.shift();
        }
        
        const styles = {
            info: 'color: #2196F3; font-weight: bold',
            success: 'color: #4CAF50; font-weight: bold',
            warning: 'color: #FF9800; font-weight: bold',
            error: 'color: #F44336; font-weight: bold',
            integration: 'color: #9C27B0; font-weight: bold'
        };
        
        console.log(
            `%c[AUTH-${type.toUpperCase()}] ${message}`,
            styles[type] || styles.info,
            data || ''
        );
        
        try {
            localStorage.setItem('auth_integration_logs', JSON.stringify(this.integrationLog));
        } catch (e) {
            console.warn('No se pudieron guardar los logs:', e);
        }
    }

    /**
     * ⚙️ INICIALIZACIÓN DEL SISTEMA
     */
    init() {
        this.log('🚀 Inicializando sistema de autenticación', 'info');
        
        this.checkSession();
        this.setupPasswordValidation();
        this.setupEventListeners();
        this.initializeIntegration();
    }

    /**
     * 🔗 INICIALIZAR INTEGRACIÓN CON MÓDULOS
     */
    initializeIntegration() {
        this.log('🔗 Iniciando integración con módulos...', 'integration');
        
        if (window.location.pathname.includes('dashboard.html')) {
            this.log('📊 Detectado dashboard, verificando sesión...', 'integration');
            this.verifyDashboardAccess();
        }
        
        this.waitForModules();
    }

    /**
     * ⏳ ESPERAR A QUE LOS MÓDULOS ESTÉN DISPONIBLES
     */
    waitForModules() {
        if (window.location.pathname.includes('index.html') || 
            !window.location.pathname.includes('dashboard.html')) {
            this.log('📄 Página de login detectada - saltando espera de módulos', 'info');
            this.isIntegrated = true;
            return;
        }
        
        const checkModules = () => {
            const modulesAvailable = {
                storage: !!window.storageManager,
                gastos: !!window.gastosManager,
                currency: !!window.currencyManager
            };
            
            this.log('🔍 Verificando módulos disponibles', 'integration', modulesAvailable);
            
            if (Object.values(modulesAvailable).every(Boolean)) {
                this.log('✅ Todos los módulos están disponibles', 'success');
                this.completeIntegration();
            } else {
                const elapsed = Date.now() - this.moduleCheckStart;
                if (elapsed > 5000) {
                    this.log('⚠️ Timeout esperando módulos - continuando sin integración completa', 'warning');
                    this.isIntegrated = true;
                    return;
                }
                this.log('⏳ Esperando módulos...', 'integration');
                setTimeout(checkModules, 100);
            }
        };
        
        this.moduleCheckStart = Date.now();
        setTimeout(checkModules, 50);
    }

    /**
     * ✅ COMPLETAR INTEGRACIÓN
     */
    completeIntegration() {
        try {
            if (window.storageManager) {
                this.integrateWithStorage();
            }
            
            this.setupModuleEvents();
            this.isIntegrated = true;
            this.log('🎉 Integración completada exitosamente', 'success');
            
        } catch (error) {
            this.log('❌ Error en integración', 'error', error.message);
        }
    }

    /**
     * 💾 INTEGRAR CON STORAGE MANAGER
     */
    integrateWithStorage() {
        try {
            if (this.currentUser && window.storageManager) {
                const userData = window.storageManager.getUserData();
                
                if (!userData.username) {
                    const userInfo = {
                        username: this.currentUser.username,
                        lastLogin: this.currentUser.lastLogin,
                        settings: this.currentUser.settings || {}
                    };
                    
                    window.storageManager.setUserData(userInfo);
                    this.log('👤 Datos de usuario sincronizados con storage', 'integration', userInfo);
                }
            }
        } catch (error) {
            this.log('⚠️ Error integrando con storage', 'warning', error.message);
        }
    }

    /**
     * 🔔 CONFIGURAR EVENTOS ENTRE MÓDULOS
     */
    setupModuleEvents() {
        window.addEventListener('beforeunload', () => {
            this.log('👋 Cerrando aplicación', 'info');
        });
        
        window.addEventListener('storage', (e) => {
            if (e.key === 'app_session') {
                this.log('🔄 Cambio detectado en sesión', 'integration');
                this.checkSession();
            }
        });
    }

    /**
     * 🔒 VERIFICAR ACCESO AL DASHBOARD
     */
    verifyDashboardAccess() {
        const hasValidSession = this.checkSession();
        
        if (!hasValidSession) {
            this.log('🚫 Sesión inválida, redirigiendo al login', 'warning');
            this.redirectToLogin();
            return false;
        }
        
        this.log('✅ Sesión válida, acceso al dashboard permitido', 'success');
        return true;
    }

    /**
     * 🔄 REDIRECCIÓN AL LOGIN
     */
    redirectToLogin() {
        this.log('🔄 Redirigiendo al login...', 'info');
        window.location.href = 'index.html';
    }

    /**
     * 🚀 REDIRECCIÓN AL DASHBOARD
     */
    redirectToDashboard() {
        this.log('🔄 Redirigiendo al dashboard...', 'success');
        window.location.href = 'dashboard.html';
    }

    /**
     * ✅ VALIDACIÓN DE CONTRASEÑAS (SIMPLIFICADA)
     */
    validatePassword(password) {
        const requirements = this.passwordRequirements;
        const errors = [];
        const checks = {
            length: false,
            uppercase: true,
            lowercase: true,
            numbers: true,
            specialChars: true
        };

        if (password.length >= requirements.minLength) {
            checks.length = true;
        } else {
            errors.push(`Mínimo ${requirements.minLength} caracteres`);
        }

        const strength = Object.values(checks).filter(Boolean).length;
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            checks: checks,
            strength: strength,
            strengthLabel: this.getStrengthLabel(strength)
        };
    }

    /**
     * 💪 ETIQUETA DE FORTALEZA DE CONTRASEÑA
     */
    getStrengthLabel(strength) {
        const labels = {
            0: { text: 'Muy débil', class: 'very-weak', color: '#ff4444' },
            1: { text: 'Débil', class: 'weak', color: '#ff8800' },
            2: { text: 'Regular', class: 'fair', color: '#ffbb33' },
            3: { text: 'Buena', class: 'good', color: '#88cc00' },
            4: { text: 'Fuerte', class: 'strong', color: '#00aa00' },
            5: { text: 'Muy fuerte', class: 'very-strong', color: '#00cc44' }
        };
        return labels[strength] || labels[0];
    }

    /**
     * 👤 REGISTRO DE NUEVO USUARIO (SUPABASE)
     */
    async registerUser(username, password, confirmPassword) {
        try {
            this.log(`👤 Iniciando registro de usuario: ${username}`, 'info');
            this.showLoadingState('Creando usuario...');

            if (!username || !password || !confirmPassword) {
                throw new Error('Todos los campos son obligatorios');
            }

            if (password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.isValid) {
                throw new Error('Contraseña no cumple los requisitos: ' + passwordValidation.errors.join(', '));
            }

            this.log('🔷 Registrando con Supabase Auth...', 'info');
            
            if (!window.supabaseStorageManager) {
                throw new Error('Sistema de base de datos no disponible');
            }

            const result = await window.supabaseStorageManager.signUp(
                `${username}@wisespend.app`,
                password,
                username
            );

            if (!result.success) {
                throw new Error(result.error || 'Error al crear usuario');
            }

            this.log('✅ Usuario creado exitosamente en Supabase', 'success', { username });

            this.hideLoadingState();
            this.showSuccess('Usuario creado exitosamente');

            setTimeout(() => {
                this.log('🔄 Redirigiendo al formulario de login...', 'success');
                this.switchToLoginAfterRegister();
            }, 800);

            return { success: true, user: result.user };

        } catch (error) {
            this.log('❌ Error en registro de usuario', 'error', error.message);
            this.hideLoadingState();
            this.showError(error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🔄 CAMBIAR AL FORMULARIO DE LOGIN DESPUÉS DEL REGISTRO
     */
    switchToLoginAfterRegister() {
        try {
            const loginForm = document.getElementById('login-form');
            const registerForm = document.getElementById('register-form');
            
            if (loginForm && registerForm) {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                
                const modeQuestion = document.getElementById('mode-question');
                const modeAction = document.getElementById('mode-action');
                
                if (modeQuestion && modeAction) {
                    modeQuestion.textContent = '¿No tienes cuenta?';
                    modeAction.textContent = 'Crear cuenta';
                }
                
                registerForm.reset();
                this.clearAllMessages();
                this.hideLoadingState();
                                       
                this.log('✅ Cambiado al formulario de login después del registro', 'success');
                
            } else {
                this.log('⚠️ No se encontraron los formularios para cambiar', 'warning');
            }
            
        } catch (error) {
            this.log('❌ Error cambiando al login', 'error', error.message);
        }
    }

    /**
     * 🧹 LIMPIAR TODOS LOS MENSAJES VISUALES
     */
    clearAllMessages() {
        try {
            const messages = document.querySelectorAll('.auth-message, .success-message, .error-message');
            messages.forEach(msg => {
                if (msg && msg.parentNode) {
                    msg.parentNode.removeChild(msg);
                }
            });
            
            const successElements = document.querySelectorAll('[class*="success"], [class*="alert"]');
            successElements.forEach(el => {
                if (el.textContent && el.textContent.includes('exitosamente')) {
                    el.style.display = 'none';
                }
            });
            
            this.log('🧹 Mensajes limpiados', 'info');
            
        } catch (error) {
            this.log('⚠️ Error limpiando mensajes', 'warning', error.message);
        }
    }

    /**
     * 🔓 INICIO DE SESIÓN (SUPABASE)
     */
    async loginUser(username, password) {
        try {
            this.log(`🔓 Iniciando login para usuario: ${username}`, 'info');
            this.showLoadingState('Verificando credenciales...');

            if (!username || !password) {
                throw new Error('Usuario y contraseña son obligatorios');
            }

            this.log('🔷 Autenticando con Supabase Auth...', 'info');
            
            if (!window.supabaseStorageManager) {
                throw new Error('Sistema de base de datos no disponible');
            }

            const result = await window.supabaseStorageManager.signIn(
                `${username}@wisespend.app`,
                password
            );

            if (!result.success) {
                this.log('❌ Login fallido', 'warning', { username });
                throw new Error(result.error || 'Usuario o contraseña incorrectos');
            }

            this.log('✅ Login exitoso con Supabase', 'success', { 
                username,
                userId: result.user.id
            });

            this.createSessionFromSupabase(result.user, username);

            this.hideLoadingState();
            this.showSuccess('¡Bienvenido de vuelta!');

            setTimeout(() => {
                this.log('🚀 Redirigiendo al dashboard...', 'success');
                this.redirectToDashboard();
            }, 1500);

            return { success: true, user: result.user };

        } catch (error) {
            this.log('❌ Error en login', 'error', error.message);
            this.hideLoadingState();
            this.showError(error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎫 CREAR SESIÓN DESDE USUARIO DE SUPABASE
     */
    createSessionFromSupabase(supabaseUser, username) {
        const session = {
            username: username,
            userId: supabaseUser.id,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString(),
            provider: 'supabase'
        };

        localStorage.setItem('app_session', JSON.stringify(session));
        this.currentUser = {
            username: username,
            id: supabaseUser.id,
            email: supabaseUser.email
        };
        
        this.log('🎫 Sesión creada desde Supabase', 'success', {
            username: username,
            userId: supabaseUser.id,
            expiresAt: session.expiresAt
        });
        
        this.scheduleSessionRefresh();
    }

    /**
     * 🔄 PROGRAMAR RENOVACIÓN DE SESIÓN
     */
    scheduleSessionRefresh() {
        setInterval(() => {
            if (this.currentUser) {
                const session = JSON.parse(localStorage.getItem('app_session') || '{}');
                if (session.username) {
                    session.expiresAt = new Date(Date.now() + this.sessionTimeout).toISOString();
                    localStorage.setItem('app_session', JSON.stringify(session));
                    this.log('🔄 Sesión renovada', 'info');
                }
            }
        }, 5 * 60 * 1000);
    }

    /**
     * ✅ VERIFICAR SESIÓN ACTIVA
     */
    checkSession() {
        const session = JSON.parse(localStorage.getItem('app_session') || '{}');
        
        if (!session.username || !session.expiresAt) {
            this.log('❌ No hay sesión activa', 'info');
            return false;
        }

        if (new Date() > new Date(session.expiresAt)) {
            this.log('⏰ Sesión expirada', 'warning');
            this.logout();
            return false;
        }

        this.currentUser = {
            username: session.username,
            id: session.userId
        };
        
        if (this.currentUser) {
            this.log('✅ Sesión válida', 'success', { 
                username: this.currentUser.username,
                expiresAt: session.expiresAt
            });
            return true;
        }
        
        this.log('❌ Usuario de sesión no encontrado', 'error');
        return false;
    }

    /**
     * 🚪 CERRAR SESIÓN
     */
    async logout() {
        const username = this.currentUser ? this.currentUser.username : 'unknown';
        
        this.log('🚪 Cerrando sesión', 'info', { username });
        
        if (window.supabaseStorageManager) {
            try {
                await window.supabaseStorageManager.signOut();
                this.log('✅ Sesión cerrada en Supabase', 'success');
            } catch (error) {
                this.log('⚠️ Error cerrando sesión en Supabase', 'warning', error.message);
            }
        }
        
        localStorage.removeItem('app_session');
        this.currentUser = null;
        
        if (!window.location.pathname.includes('index.html')) {
            this.redirectToLogin();
        }
    }

    /**
     * 🎨 CONFIGURAR VALIDACIÓN VISUAL EN TIEMPO REAL
     */
    setupPasswordValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.type === 'password' && e.target.id === 'reg-password') {
                const validation = this.validatePassword(e.target.value);
                this.updatePasswordFeedback(validation);
            }
        });
    }

    /**
     * 📊 ACTUALIZAR FEEDBACK VISUAL DE CONTRASEÑA
     */
    updatePasswordFeedback(validation) {
        const feedbackContainer = document.getElementById('register-password-feedback');
        if (!feedbackContainer) return;

        const strength = validation.strengthLabel;
        
        feedbackContainer.innerHTML = `
            <div class="password-strength">
                <div class="strength-bar">
                    <div class="strength-fill ${strength.class}" 
                         style="width: ${(validation.strength / 5) * 100}%; background-color: ${strength.color}">
                    </div>
                </div>
                <span class="strength-text" style="color: ${strength.color}">
                    ${strength.text}
                </span>
            </div>
        `;
    }

    /**
     * ⚡ CONFIGURAR EVENT LISTENERS
     */
    setupEventListeners() {
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.lastActivity = Date.now();
                }
            }, { passive: true });
        });
        
        // Ejecutar después de un delay para asegurar que el DOM esté listo
        setTimeout(() => {
            this.setupFormHandlers();
        }, 200);
    }

    /**
     * 📝 CONFIGURAR MANEJADORES DE FORMULARIO
     */
    setupFormHandlers() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const toggleModeBtn = document.getElementById('toggle-mode');

        if (toggleModeBtn) {
            toggleModeBtn.addEventListener('click', () => {
                const isLoginMode = loginForm.style.display !== 'none';
                
                if (isLoginMode) {
                    loginForm.style.display = 'none';
                    registerForm.style.display = 'block';
                    document.getElementById('mode-question').textContent = '¿Ya tienes cuenta?';
                    document.getElementById('mode-action').textContent = 'Iniciar sesión';
                } else {
                    loginForm.style.display = 'block';
                    registerForm.style.display = 'none';
                    document.getElementById('mode-question').textContent = '¿No tienes cuenta?';
                    document.getElementById('mode-action').textContent = 'Crear cuenta';
                }
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                const username = formData.get('username');
                const password = formData.get('password');
                
                await this.loginUser(username, password);
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                const username = formData.get('username');
                const password = formData.get('password');
                const confirmPassword = formData.get('confirmPassword');
                
                await this.registerUser(username, password, confirmPassword);
            });
        }
    }

    /**
     * ⏳ MOSTRAR ESTADO DE CARGA
     */
    showLoadingState(message) {
        this.log(`⏳ Mostrando estado de carga: ${message}`, 'info');
        
        const loadingEl = document.getElementById('loading-state');
        if (loadingEl) {
            loadingEl.textContent = message;
            loadingEl.style.display = 'block';
        }

        const form = document.querySelector('form');
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = true);
        }
    }

    /**
     * ✅ OCULTAR ESTADO DE CARGA
     */
    hideLoadingState() {
        this.log('✅ Ocultando estado de carga', 'info');
        
        const loadingEl = document.getElementById('loading-state');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }

        const form = document.querySelector('form');
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = false);
        }
    }

    /**
     * ❌ MOSTRAR ERROR
     */
    showError(message) {
        this.log(`❌ Mostrando error: ${message}`, 'error');
        this.showMessage(message, 'error');
    }

    /**
     * ✅ MOSTRAR ÉXITO
     */
    showSuccess(message) {
        this.log(`✅ Mostrando éxito: ${message}`, 'success');
        this.showMessage(message, 'success');
    }

    /**
     * 💬 MOSTRAR MENSAJE
     */
    showMessage(message, type) {
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `auth-message ${type}`;
        messageEl.textContent = message;

        const container = document.querySelector('.login-container') || document.body;
        container.appendChild(messageEl);

        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    /**
     * 📊 OBTENER LOGS DE INTEGRACIÓN
     */
    getIntegrationLogs() {
        return this.integrationLog;
    }
    
    /**
     * 🧹 LIMPIAR LOGS
     */
    clearLogs() {
        this.integrationLog = [];
        localStorage.removeItem('auth_integration_logs');
        this.log('🧹 Logs limpiados', 'info');
    }
    
    /**
     * 📈 OBTENER ESTADO DEL SISTEMA
     */
    getSystemStatus() {
        return {
            isIntegrated: this.isIntegrated,
            currentUser: this.currentUser ? this.currentUser.username : null,
            sessionValid: this.checkSession(),
            modulesAvailable: {
                storage: !!window.storageManager,
                gastos: !!window.gastosManager,
                currency: !!window.currencyManager
            },
            logsCount: this.integrationLog.length
        };
    }
}

// ========================================
// INICIALIZACIÓN DEL SISTEMA
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM cargado, inicializando AuthenticationSystem...');
    
    window.authSystem = new AuthenticationSystem();
    
    window.authDebug = {
        getLogs: () => window.authSystem.getIntegrationLogs(),
        clearLogs: () => window.authSystem.clearLogs(),
        getStatus: () => window.authSystem.getSystemStatus(),
        forceLogout: () => window.authSystem.logout(),
        showLogs: () => {
            console.table(window.authSystem.getIntegrationLogs());
        }
    };
    
    console.log('🔧 AuthSystem inicializado. Usa window.authDebug para debugging.');
    console.log('📊 Comandos disponibles:');
    console.log('   - window.authDebug.getLogs() - Ver todos los logs');
    console.log('   - window.authDebug.showLogs() - Mostrar logs en tabla');
    console.log('   - window.authDebug.getStatus() - Estado del sistema');
    console.log('   - window.authDebug.clearLogs() - Limpiar logs');
    console.log('   - window.authDebug.forceLogout() - Forzar logout');
});

// ========================================
// FUNCIONES GLOBALES DE COMPATIBILIDAD
// ========================================

window.loginUser = async function(username, password) {
    if (window.authSystem) {
        return await window.authSystem.loginUser(username, password);
    } else {
        console.error('❌ AuthSystem no está disponible');
        return { success: false, error: 'Sistema no disponible' };
    }
};

window.registerUser = async function(username, password, confirmPassword) {
    if (window.authSystem) {
        return await window.authSystem.registerUser(username, password, confirmPassword);
    } else {
        console.error('❌ AuthSystem no está disponible');
        return { success: false, error: 'Sistema no disponible' };
    }
};

window.logoutUser = function() {
    if (window.authSystem) {
        window.authSystem.logout();
    } else {
        console.error('❌ AuthSystem no está disponible');
    }
};

window.checkUserSession = function() {
    if (window.authSystem) {
        return window.authSystem.checkSession();
    } else {
        console.error('❌ AuthSystem no está disponible');
        return false;
    }
};

// ========================================
// AUTO-VERIFICACIÓN EN DASHBOARD
// ========================================

if (window.location.pathname.includes('dashboard.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.authSystem && !window.authSystem.verifyDashboardAccess()) {
                console.log('🚫 Acceso denegado al dashboard');
            }
        }, 100);
    });
}

// ========================================
// GESTIÓN DE ERRORES GLOBALES
// ========================================

window.addEventListener('error', (event) => {
    if (window.authSystem) {
        window.authSystem.log('💥 Error global capturado', 'error', {
            message: event.message,
            filename: event.filename,
            line: event.lineno
        });
    }
});

console.log('🔐 Auth.js v2.0 cargado correctamente - SOLO SUPABASE AUTH');
console.log('📱 Funciones globales disponibles: loginUser, registerUser, logoutUser, checkUserSession');
console.log('🛠️ Debug disponible en: window.authDebug');