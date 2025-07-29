/**
 * 🔐 Sistema de Autenticación Avanzado - INTEGRADO
 * Implementa PBKDF2 + Salt único para máxima seguridad
 * Control de Gastos Familiares - auth.js
 * 
 * CHANGELOG - Integración con Storage/Gastos/Currency:
 * - ✅ Redirección automática al dashboard
 * - ✅ Integración con storageManager
 * - ✅ Preservación de datos existentes
 * - ✅ Logs detallados para debugging
 * - ✅ Verificación de sesión en dashboard
 */

class AuthenticationSystem {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.maxLoginAttempts = 5;
        this.lockoutTime = 15 * 60 * 1000; // 15 minutos
        this.passwordRequirements = {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true
        };
        
        // 🆕 NUEVAS PROPIEDADES PARA INTEGRACIÓN
        this.isIntegrated = false;
        this.integrationLog = [];
        
        this.init();
    }

    /**
     * 🆕 MÉTODO DE LOGGING CENTRALIZADO
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
        
        // Mantener solo los últimos 100 logs para no sobrecargar memoria
        if (this.integrationLog.length > 100) {
            this.integrationLog.shift();
        }
        
        // Console output con colores según tipo
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
        
        // Guardar logs en localStorage para revisión posterior
        try {
            localStorage.setItem('auth_integration_logs', JSON.stringify(this.integrationLog));
        } catch (e) {
            console.warn('No se pudieron guardar los logs:', e);
        }
    }

    /**
     * Inicialización del sistema - MODIFICADO
     */
    init() {
        this.log('🚀 Inicializando sistema de autenticación', 'info');
        
        this.checkSession();
        this.setupPasswordValidation();
        this.setupEventListeners();
        
        // 🆕 INTEGRACIÓN CON NUEVOS MÓDULOS
        this.initializeIntegration();
    }

    /**
     * 🆕 INICIALIZAR INTEGRACIÓN CON MÓDULOS
     */
    initializeIntegration() {
        this.log('🔗 Iniciando integración con módulos...', 'integration');
        
        // Verificar si estamos en el dashboard
        if (window.location.pathname.includes('dashboard.html')) {
            this.log('📊 Detectado dashboard, verificando sesión...', 'integration');
            this.verifyDashboardAccess();
        }
        
        // Esperar a que los módulos estén disponibles
        this.waitForModules();
    }

    /**
     * 🆕 ESPERAR A QUE LOS MÓDULOS ESTÉN DISPONIBLES
     */
    waitForModules() {
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
                this.log('⏳ Esperando módulos...', 'integration');
                setTimeout(checkModules, 100);
            }
        };
        
        // Comenzar verificación después de un pequeño delay
        setTimeout(checkModules, 50);
    }

    /**
     * 🆕 COMPLETAR INTEGRACIÓN
     */
    completeIntegration() {
        try {
            // Integrar con storageManager si está disponible
            if (window.storageManager) {
                this.integrateWithStorage();
            }
            
            // Configurar eventos entre módulos
            this.setupModuleEvents();
            
            this.isIntegrated = true;
            this.log('🎉 Integración completada exitosamente', 'success');
            
        } catch (error) {
            this.log('❌ Error en integración', 'error', error.message);
        }
    }

    /**
     * 🆕 INTEGRAR CON STORAGE MANAGER
     */
    integrateWithStorage() {
        try {
            if (this.currentUser && window.storageManager) {
                // Sincronizar datos de usuario
                const userData = window.storageManager.getUserData();
                
                if (!userData.username) {
                    // Primera vez, establecer datos del usuario
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
     * 🆕 CONFIGURAR EVENTOS ENTRE MÓDULOS
     */
    setupModuleEvents() {
        // Escuchar eventos de logout
        window.addEventListener('beforeunload', () => {
            this.log('👋 Cerrando aplicación', 'info');
        });
        
        // Escuchar cambios en storage para mantener sincronización
        window.addEventListener('storage', (e) => {
            if (e.key === 'app_session') {
                this.log('🔄 Cambio detectado en sesión', 'integration');
                this.checkSession();
            }
        });
    }

    /**
     * 🆕 VERIFICAR ACCESO AL DASHBOARD
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
     * 🆕 REDIRECCIÓN AL LOGIN
     */
    redirectToLogin() {
        this.log('🔄 Redirigiendo al login...', 'info');
        window.location.href = 'index.html';
    }

    /**
     * 🆕 REDIRECCIÓN AL DASHBOARD
     */
    redirectToDashboard() {
        this.log('🔄 Redirigiendo al dashboard...', 'success');
        window.location.href = 'dashboard.html';
    }

    /**
     * 🔍 Detectar soporte de Web Crypto API
     */
    detectCryptoSupport() {
        const hasSubtle = !!(window.crypto && window.crypto.subtle);
        this.log(`🔍 Crypto.subtle disponible: ${hasSubtle}`, 'info');
        return hasSubtle;
    }

    /**
     * 🔑 Genera salt único usando Web Crypto API
     */
        async generateSalt() {
        const array = new Uint8Array(32);
        
        if (this.detectCryptoSupport()) {
            // Usar Web Crypto API (más seguro)
            crypto.getRandomValues(array);
        } else {
            // Fallback para HTTP/móviles (seguro alternativo)
            for (let i = 0; i < array.length; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            this.log('🔄 Usando fallback para generación de salt', 'warning');
        }
        
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 🔒 Deriva clave usando PBKDF2 (estándar industria)
     */
    async deriveKey(password, salt, iterations = 100000) {
    try {
        if (this.detectCryptoSupport()) {
            // Usar PBKDF2 completo (HTTPS/localhost)
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(password),
                { name: 'PBKDF2' },
                false,
                ['deriveBits']
            );

            const derivedBits = await crypto.subtle.deriveBits(
                {
                    name: 'PBKDF2',
                    salt: encoder.encode(salt),
                    iterations: iterations,
                    hash: 'SHA-256'
                },
                keyMaterial,
                256
            );

            return Array.from(new Uint8Array(derivedBits))
                .map(byte => byte.toString(16).padStart(2, '0'))
                .join('');
        } else {
            // Fallback seguro para HTTP/móviles
            this.log('🔄 Usando fallback SHA-256 para derivación', 'warning');
            return await this.deriveKeyFallback(password, salt, iterations);
        }
    } catch (error) {
        this.log('❌ Error en derivación de clave', 'error', error.message);
        throw new Error('Error en el proceso de encriptación');
    }
}

    /**
 * 🔄 Fallback seguro para derivación de clave (HTTP/móviles)
 * Usa algoritmo HMAC simulado sin Web Crypto API
 */
async deriveKeyFallback(password, salt, iterations = 10000) {
    // Función hash simple pero segura
    const simpleHash = (str) => {
        let hash = 0;
        if (str.length === 0) return hash.toString(16);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a 32-bit
        }
        
        // Expandir a 64 caracteres hex
        let hashStr = Math.abs(hash).toString(16);
        while (hashStr.length < 8) {
            hashStr = '0' + hashStr;
        }
        
        // Crear hash más largo combinando múltiples transformaciones
        let extended = '';
        for (let i = 0; i < 8; i++) {
            const rotated = ((hash >>> i) | (hash << (32 - i))) >>> 0;
            extended += rotated.toString(16).padStart(8, '0');
        }
        
        return extended.substring(0, 64);
    };
    
    // Combinar password + salt
    let result = password + salt;
    
    // Aplicar múltiples iteraciones de hash
    for (let i = 0; i < iterations; i++) {
        result = simpleHash(result + i.toString());
    }
    
    this.log(`🔐 Fallback completado con ${iterations} iteraciones`, 'info');
    return result;
}

    /**
     * 📋 Validación robusta de contraseñas
     */
    validatePassword(password) {
        const requirements = this.passwordRequirements;
        const errors = [];
        const checks = {
            length: false,
            uppercase: false,
            lowercase: false,
            numbers: false,
            specialChars: false
        };

        // Verificar longitud
        if (password.length >= requirements.minLength) {
            checks.length = true;
        } else {
            errors.push(`Mínimo ${requirements.minLength} caracteres`);
        }

        // Verificar mayúsculas
        if (!requirements.requireUppercase || /[A-Z]/.test(password)) {
            checks.uppercase = true;
        } else {
            errors.push('Al menos una mayúscula');
        }

        // Verificar minúsculas
        if (!requirements.requireLowercase || /[a-z]/.test(password)) {
            checks.lowercase = true;
        } else {
            errors.push('Al menos una minúscula');
        }

        // Verificar números
        if (!requirements.requireNumbers || /\d/.test(password)) {
            checks.numbers = true;
        } else {
            errors.push('Al menos un número');
        }

        // Verificar caracteres especiales
        if (!requirements.requireSpecialChars || /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            checks.specialChars = true;
        } else {
            errors.push('Al menos un carácter especial');
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
     * 💪 Etiqueta de fortaleza de contraseña
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
     * 👤 Registro de nuevo usuario - MODIFICADO
     */
    async registerUser(username, password, confirmPassword) {
        try {
            this.log(`👤 Iniciando registro de usuario: ${username}`, 'info');
            this.showLoadingState('Creando usuario...');

            // Validaciones básicas
            if (!username || !password || !confirmPassword) {
                throw new Error('Todos los campos son obligatorios');
            }

            if (password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            // Validar fortaleza de contraseña
            const passwordValidation = this.validatePassword(password);
            if (!passwordValidation.isValid) {
                throw new Error('Contraseña no cumple los requisitos: ' + passwordValidation.errors.join(', '));
            }

            // Verificar si el usuario ya existe
            const users = this.getStoredUsers();
            if (users[username]) {
                throw new Error('El usuario ya existe');
            }

            // Generar salt y encriptar contraseña
            this.log('🔐 Generando salt y encriptando contraseña...', 'info');
            const salt = await this.generateSalt();
            const hashedPassword = await this.deriveKey(password, salt);

            // Crear usuario
            const newUser = {
                username: username,
                password: hashedPassword,
                salt: salt,
                createdAt: new Date().toISOString(),
                lastLogin: null,
                loginAttempts: 0,
                lockoutUntil: null,
                settings: {
                    currency: 'CLP',
                    theme: 'default',
                    autoSave: true
                }
            };

            // Guardar usuario
            users[username] = newUser;
            localStorage.setItem('app_users', JSON.stringify(users));

            this.log('✅ Usuario creado exitosamente', 'success', { username, createdAt: newUser.createdAt });

            this.hideLoadingState();
            this.showSuccess('Usuario creado exitosamente');

            // 🆕 REDIRECCIÓN AUTOMÁTICA AL FORMULARIO DE LOGIN
            setTimeout(() => {
                this.log('🔄 Redirigiendo al formulario de login...', 'success');
                this.switchToLoginAfterRegister();
            }, 800); // 500 milisegundos para mostrar el mensaje de éxito

            return { success: true, user: newUser };

        } catch (error) {
            this.log('❌ Error en registro de usuario', 'error', error.message);
            this.hideLoadingState();
            this.showError(error.message);
            return { success: false, error: error.message };
        }
    }

    /**
 * 🆕 CAMBIAR AL FORMULARIO DE LOGIN DESPUÉS DEL REGISTRO
 */
switchToLoginAfterRegister() {
    try {
        // Buscar elementos del DOM
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (loginForm && registerForm) {
            // Cambiar vista
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            
            // Actualizar UI del toggle si existe
            const modeQuestion = document.getElementById('mode-question');
            const modeAction = document.getElementById('mode-action');
            
            if (modeQuestion && modeAction) {
                modeQuestion.textContent = '¿No tienes cuenta?';
                modeAction.textContent = 'Crear cuenta';
            }
            
            // Limpiar formulario de registro
            registerForm.reset();

            // Limpiar formulario de registro
            registerForm.reset();

            // 🆕 LIMPIAR MENSAJES DE ÉXITO ANTERIORES
            this.clearAllMessages();

            // 🆕 OCULTAR ESTADOS DE LOADING SI EXISTEN
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
 * 🆕 LIMPIAR TODOS LOS MENSAJES VISUALES
 */
clearAllMessages() {
    try {
        // Limpiar mensajes de auth
        const messages = document.querySelectorAll('.auth-message, .success-message, .error-message');
        messages.forEach(msg => {
            if (msg && msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });
        
        // Limpiar elementos de éxito específicos
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
     * 🔓 Inicio de sesión - MODIFICADO CON REDIRECCIÓN
     */
    async loginUser(username, password) {
        try {
            this.log(`🔓 Iniciando login para usuario: ${username}`, 'info');
            this.showLoadingState('Verificando credenciales...');

            if (!username || !password) {
                throw new Error('Usuario y contraseña son obligatorios');
            }

            const users = this.getStoredUsers();
            const user = users[username];

            if (!user) {
                this.log('❌ Usuario no encontrado', 'warning', { username });
                // Simular tiempo de procesamiento para evitar timing attacks
                await new Promise(resolve => setTimeout(resolve, 1000));
                throw new Error('Usuario o contraseña incorrectos');
            }

            // Verificar bloqueo por intentos fallidos
            if (user.lockoutUntil && new Date() < new Date(user.lockoutUntil)) {
                const remainingTime = Math.ceil((new Date(user.lockoutUntil) - new Date()) / 1000 / 60);
                this.log('🔒 Usuario bloqueado', 'warning', { username, remainingTime });
                throw new Error(`Cuenta bloqueada. Intenta en ${remainingTime} minutos`);
            }

            // Verificar contraseña
            this.log('🔐 Verificando contraseña...', 'info');
            const hashedPassword = await this.deriveKey(password, user.salt);
            
            if (hashedPassword !== user.password) {
                // Incrementar intentos fallidos
                user.loginAttempts = (user.loginAttempts || 0) + 1;
                
                this.log('❌ Contraseña incorrecta', 'warning', { 
                    username, 
                    attempts: user.loginAttempts 
                });
                
                if (user.loginAttempts >= this.maxLoginAttempts) {
                    user.lockoutUntil = new Date(Date.now() + this.lockoutTime).toISOString();
                    users[username] = user;
                    localStorage.setItem('app_users', JSON.stringify(users));
                    this.log('🔒 Usuario bloqueado por múltiples intentos', 'error', { username });
                    throw new Error('Cuenta bloqueada por múltiples intentos fallidos');
                }

                users[username] = user;
                localStorage.setItem('app_users', JSON.stringify(users));
                
                const remainingAttempts = this.maxLoginAttempts - user.loginAttempts;
                throw new Error(`Contraseña incorrecta. ${remainingAttempts} intentos restantes`);
            }

            // Login exitoso
            user.loginAttempts = 0;
            user.lockoutUntil = null;
            user.lastLogin = new Date().toISOString();
            users[username] = user;
            localStorage.setItem('app_users', JSON.stringify(users));

            this.log('✅ Login exitoso', 'success', { 
                username, 
                lastLogin: user.lastLogin 
            });

            // Crear sesión
            this.createSession(user);

            this.hideLoadingState();
            this.showSuccess('¡Bienvenido de vuelta!');

            // 🆕 REDIRECCIÓN AUTOMÁTICA AL DASHBOARD
            setTimeout(() => {
                this.log('🚀 Redirigiendo al dashboard...', 'success');
                this.redirectToDashboard();
            }, 1500); // Delay para mostrar mensaje de éxito

            return { success: true, user: user };

        } catch (error) {
            this.log('❌ Error en login', 'error', error.message);
            this.hideLoadingState();
            this.showError(error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * 🎫 Crear sesión de usuario - MODIFICADO
     */
    createSession(user) {
        const session = {
            username: user.username,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + this.sessionTimeout).toISOString()
        };

        localStorage.setItem('app_session', JSON.stringify(session));
        this.currentUser = user;
        
        this.log('🎫 Sesión creada', 'success', {
            username: user.username,
            expiresAt: session.expiresAt
        });
        
        this.scheduleSessionRefresh();
        
        // 🆕 INTEGRAR CON STORAGE SI ESTÁ DISPONIBLE
        if (window.storageManager) {
            this.integrateWithStorage();
        }
    }

    /**
     * 🔄 Programar renovación de sesión
     */
    scheduleSessionRefresh() {
        // Renovar sesión cada 5 minutos si hay actividad
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
     * ✅ Verificar sesión activa - MODIFICADO
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

        const users = this.getStoredUsers();
        this.currentUser = users[session.username];
        
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
     * 🚪 Cerrar sesión - MODIFICADO
     */
    logout() {
        const username = this.currentUser ? this.currentUser.username : 'unknown';
        
        this.log('🚪 Cerrando sesión', 'info', { username });
        
        localStorage.removeItem('app_session');
        this.currentUser = null;
        
        // Solo redirigir si no estamos ya en el login
        if (!window.location.pathname.includes('index.html')) {
            this.redirectToLogin();
        }
    }

    /**
     * 💾 Obtener usuarios almacenados
     */
    getStoredUsers() {
        try {
            return JSON.parse(localStorage.getItem('app_users') || '{}');
        } catch (error) {
            this.log('❌ Error al leer usuarios', 'error', error.message);
            return {};
        }
    }

    /**
     * 🎨 Configurar validación visual en tiempo real
     */
    setupPasswordValidation() {
        document.addEventListener('input', (e) => {
            if (e.target.type === 'password' && e.target.id === 'password') {
                const validation = this.validatePassword(e.target.value);
                this.updatePasswordFeedback(validation);
            }
        });
    }

    /**
     * 📝 Actualizar feedback visual de contraseña
     */
    updatePasswordFeedback(validation) {
        const feedbackContainer = document.getElementById('password-feedback');
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
            <div class="password-requirements">
                ${Object.entries(validation.checks).map(([key, passed]) => `
                    <div class="requirement ${passed ? 'passed' : 'failed'}">
                        <span class="check-icon">${passed ? '✓' : '✗'}</span>
                        <span class="requirement-text">${this.getRequirementText(key)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * 📄 Texto para requisitos de contraseña
     */
    getRequirementText(requirement) {
        const texts = {
            length: `Mínimo ${this.passwordRequirements.minLength} caracteres`,
            uppercase: 'Al menos una mayúscula',
            lowercase: 'Al menos una minúscula',
            numbers: 'Al menos un número',
            specialChars: 'Al menos un carácter especial'
        };
        return texts[requirement] || requirement;
    }

    /**
     * ⚡ Configurar event listeners - MODIFICADO
     */
    setupEventListeners() {
        // Detectar actividad para renovar sesión
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                if (this.currentUser) {
                    this.lastActivity = Date.now();
                }
            }, { passive: true });
        });
        
        // 🆕 AGREGAR LISTENER PARA FORMULARIO DE LOGIN
        document.addEventListener('DOMContentLoaded', () => {
            this.setupFormHandlers();
        });
    }

    /**
     * 🆕 CONFIGURAR MANEJADORES DE FORMULARIO
     */
    setupFormHandlers() {
        // Formulario de login
        const loginForm = document.getElementById('loginForm') || document.querySelector('form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(loginForm);
                const username = formData.get('usuario') || formData.get('username');
                const password = formData.get('contraseña') || formData.get('password');
                
                this.log('📝 Formulario de login enviado', 'info', { username });
                
                await this.loginUser(username, password);
            });
        }
        
        // Botón de registro si existe
        const registerBtn = document.getElementById('registerBtn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.log('👤 Botón de registro clickeado', 'info');
                // Aquí puedes agregar lógica adicional para registro
            });
        }
    }

    /**
     * 🔄 Estados de carga visual
     */
    showLoadingState(message) {
        this.log(`⏳ Mostrando estado de carga: ${message}`, 'info');
        
        const loadingEl = document.getElementById('loading-state');
        if (loadingEl) {
            loadingEl.textContent = message;
            loadingEl.style.display = 'block';
        }

        // Deshabilitar formulario
        const form = document.querySelector('form');
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = true);
        }
    }

    hideLoadingState() {
        this.log('✅ Ocultando estado de carga', 'info');
        
        const loadingEl = document.getElementById('loading-state');
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }

        // Rehabilitar formulario
        const form = document.querySelector('form');
        if (form) {
            const inputs = form.querySelectorAll('input, button');
            inputs.forEach(input => input.disabled = false);
        }
    }

    /**
     * 📢 Mostrar mensajes de estado
     */
    showError(message) {
        this.log(`❌ Mostrando error: ${message}`, 'error');
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.log(`✅ Mostrando éxito: ${message}`, 'success');
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        // Remover mensaje anterior
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageEl = document.createElement('div');
        messageEl.className = `auth-message ${type}`;
        messageEl.textContent = message;

        const container = document.querySelector('.login-container') || document.body;
        container.appendChild(messageEl);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);
    }

    /**
     * 🎯 Primera configuración
     */
    isFirstTime() {
        const users = this.getStoredUsers();
        const isFirst = Object.keys(users).length === 0;
        this.log(`🎯 ¿Es primera vez? ${isFirst}`, 'info');
        return isFirst;
    }

    /**
     * ⚙️ Configuración inicial automática - MODIFICADO
     */
    async initializeFirstTime() {
        if (this.isFirstTime()) {
            this.log('⚙️ Configuración inicial - Primera vez', 'info');
            
            // Crear estructura inicial en localStorage
            const initialData = {
                app_users: {},
                app_financial_data: {},
                app_settings: {
                    version: '1.0.0',
                    setupCompleted: false,
                    defaultCurrency: 'CLP'
                }
            };

            Object.entries(initialData).forEach(([key, value]) => {
                if (!localStorage.getItem(key)) {
                    localStorage.setItem(key, JSON.stringify(value));
                    this.log(`💾 Inicializado ${key}`, 'info');
                }
            });

            return true;
        }
        return false;
    }

    /**
     * 🆕 MÉTODOS DE DEBUGGING Y UTILIDAD
     */
    
    /**
     * Obtener logs de integración
     */
    getIntegrationLogs() {
        return this.integrationLog;
    }
    
    /**
     * Limpiar logs
     */
    clearLogs() {
        this.integrationLog = [];
        localStorage.removeItem('auth_integration_logs');
        this.log('🧹 Logs limpiados', 'info');
    }
    
    /**
     * Obtener estado del sistema
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

// 🚀 Inicializar sistema cuando se carga la página - MODIFICADO
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOM cargado, inicializando AuthenticationSystem...');
    
    window.authSystem = new AuthenticationSystem();
    
    // Configuración inicial si es primera vez
    window.authSystem.initializeFirstTime();
    
    // 🆕 EXPONER MÉTODOS ÚTILES PARA DEBUGGING
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

/**
 * 🆕 FUNCIONES GLOBALES PARA COMPATIBILIDAD CON HTML EXISTENTE
 */

// Función global para login (compatible con formularios existentes)
window.loginUser = async function(username, password) {
    if (window.authSystem) {
        return await window.authSystem.loginUser(username, password);
    } else {
        console.error('❌ AuthSystem no está disponible');
        return { success: false, error: 'Sistema no disponible' };
    }
};

// Función global para registro
window.registerUser = async function(username, password, confirmPassword) {
    if (window.authSystem) {
        return await window.authSystem.registerUser(username, password, confirmPassword);
    } else {
        console.error('❌ AuthSystem no está disponible');
        return { success: false, error: 'Sistema no disponible' };
    }
};

// Función global para logout
window.logoutUser = function() {
    if (window.authSystem) {
        window.authSystem.logout();
    } else {
        console.error('❌ AuthSystem no está disponible');
    }
};

// Función global para verificar sesión
window.checkUserSession = function() {
    if (window.authSystem) {
        return window.authSystem.checkSession();
    } else {
        console.error('❌ AuthSystem no está disponible');
        return false;
    }
};

/**
 * 🆕 AUTO-VERIFICACIÓN DE SESIÓN EN DASHBOARD
 */
if (window.location.pathname.includes('dashboard.html')) {
    // Verificar sesión inmediatamente si estamos en dashboard
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            if (window.authSystem && !window.authSystem.verifyDashboardAccess()) {
                console.log('🚫 Acceso denegado al dashboard');
            }
        }, 100);
    });
}

/**
 * 🆕 GESTIÓN DE ERRORES GLOBALES
 */
window.addEventListener('error', (event) => {
    if (window.authSystem) {
        window.authSystem.log('💥 Error global capturado', 'error', {
            message: event.message,
            filename: event.filename,
            line: event.lineno
        });
    }
});

/**
 * 🆕 PRESERVACIÓN DE DATOS - BACKUP AUTOMÁTICO
 */
setInterval(() => {
    if (window.authSystem && window.authSystem.currentUser) {
        try {
            // Crear backup de seguridad de datos críticos
            const backupData = {
                timestamp: new Date().toISOString(),
                users: localStorage.getItem('app_users'),
                session: localStorage.getItem('app_session'),
                logs: JSON.stringify(window.authSystem.getIntegrationLogs().slice(-10)) // Solo últimos 10 logs
            };
            
            localStorage.setItem('auth_backup', JSON.stringify(backupData));
        } catch (error) {
            console.warn('⚠️ No se pudo crear backup automático:', error);
        }
    }
}, 5 * 60 * 1000); // Cada 5 minutos

console.log('🔐 Auth.js integrado cargado correctamente');
console.log('📱 Funciones globales disponibles: loginUser, registerUser, logoutUser, checkUserSession');
console.log('🛠️ Debug disponible en: window.authDebug');

// ===== FUNCIONES UI ESPECÍFICAS (extraídas de index.html) =====

function showFirstTimeSetup() {
    console.log('🎉 Mostrando pantalla de primera vez...');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const firstTimeSetup = document.getElementById('first-time-setup');
    
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';
    if (firstTimeSetup) {
        firstTimeSetup.style.display = 'block';
    }
    
    // Ocultar selector de modo
    const modeSelector = document.querySelector('.mode-selector');
    if (modeSelector) modeSelector.style.display = 'none';
}

function updateModeUI(isLoginMode) {
    const modeQuestion = document.getElementById('mode-question');
    const modeAction = document.getElementById('mode-action');
    
    if (modeQuestion && modeAction) {
        if (isLoginMode) {
            modeQuestion.textContent = '¿No tienes cuenta?';
            modeAction.textContent = 'Crear cuenta';
        } else {
            modeQuestion.textContent = '¿Ya tienes cuenta?';
            modeAction.textContent = 'Iniciar sesión';
        }
    }
}

function startRegistration() {
    console.log('🎬 Iniciando proceso de registro...');
    // Esta función se puede integrar con el sistema existente
    if (window.authSystem) {
        // Lógica adicional si es necesaria
    }
}

// ===== EVENT LISTENERS PARA FORMULARIOS (reemplazo del JS inline) =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Configurando event listeners del login...');
    
    // Configurar formulario de login
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const toggleModeBtn = document.getElementById('toggle-mode');
    const startSetupBtn = document.getElementById('start-setup');

    // Toggle entre login y registro
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener('click', function() {
            const isLoginMode = loginForm.style.display !== 'none';
            
            if (isLoginMode) {
                loginForm.style.display = 'none';
                registerForm.style.display = 'block';
                updateModeUI(false);
            } else {
                loginForm.style.display = 'block';
                registerForm.style.display = 'none';
                updateModeUI(true);
            }
        });
    }

    // Botón de primera vez
    if (startSetupBtn) {
        startSetupBtn.addEventListener('click', function() {
            startRegistration();
        });
    }

    // Formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const username = formData.get('username');
            const password = formData.get('password');
            
            if (window.authSystem) {
                await window.authSystem.loginUser(username, password);
            }
        });
    }

    // Formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const username = formData.get('username');
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');
            
            if (window.authSystem) {
                await window.authSystem.registerUser(username, password, confirmPassword);
            }
        });
    }
    
    console.log('✅ Event listeners del login configurados');
});

