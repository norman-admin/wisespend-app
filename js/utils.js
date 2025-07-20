/**
 * 🛠️ UTILS.JS - Funciones Centralizadas y Utilidades
 * Control de Gastos Familiares - Versión 1.0.0
 * 
 * 🎯 FUNCIONALIDADES CENTRALIZADAS:
 * ✅ Validaciones comunes
 * ✅ Formateo de moneda
 * ✅ Generación de IDs
 * ✅ Manipulación DOM
 * ✅ Helpers de formularios
 * ✅ Utilidades de fecha/tiempo
 */

window.Utils = {
    
    /**
     * 💰 UTILIDADES DE MONEDA
     */
    currency: {
        /**
         * Formatear moneda para mostrar
         */
        format(amount, currency = 'CLP') {
            if (window.currencyManager) {
                return window.currencyManager.format(amount);
            }
            return `$${amount.toLocaleString('es-CL')}`;
        },

        /**
         * Formatear input mientras se escribe
         */
        formatAsYouType(input) {
            const value = input.value.replace(/[^\d]/g, '');
            if (value) {
                input.value = parseInt(value).toLocaleString('es-CL');
            }
        },

        /**
         * Formatear input para edición
         */
        formatForInput(amount) {
            return !amount || amount === 0 ? '' : amount.toLocaleString('es-CL');
        },

        /**
         * Parsear input de moneda a número
         */
        parseInput(value) {
            if (!value) return 0;
            return parseInt(value.replace(/[^\d]/g, '')) || 0;
        },

        /**
         * Validar monto
         */
        validateAmount(amount, min = 1, max = 99999999) {
            const num = typeof amount === 'string' ? this.parseInput(amount) : amount;
            return {
                valid: num >= min && num <= max,
                value: num,
                message: num < min ? `Mínimo ${this.format(min)}` : 
                        num > max ? `Máximo ${this.format(max)}` : ''
            };
        }
    },

    /**
     * 🆔 GENERACIÓN DE IDs ÚNICOS
     */
    id: {
        /**
         * Generar ID único
         */
        generate(prefix = 'item') {
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            return `${prefix}_${timestamp}_${random}`;
        },

        /**
         * Generar ID corto
         */
        generateShort(length = 8) {
            return Math.random().toString(36).substr(2, length);
        },

        /**
         * Validar formato de ID
         */
        isValid(id) {
            return typeof id === 'string' && id.length > 5 && id.includes('_');
        }
    },

    /**
     * ✅ SISTEMA DE VALIDACIONES
     */
    validation: {
        /**
         * Validar texto requerido
         */
        requiredText(value, minLength = 2, maxLength = 50) {
            const trimmed = (value || '').trim();
            
            if (!trimmed) {
                return { valid: false, message: 'Este campo es obligatorio' };
            }
            if (trimmed.length < minLength) {
                return { valid: false, message: `Mínimo ${minLength} caracteres` };
            }
            if (trimmed.length > maxLength) {
                return { valid: false, message: `Máximo ${maxLength} caracteres` };
            }
            
            return { valid: true, value: trimmed };
        },

        /**
         * Validar email
         */
        email(value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const trimmed = (value || '').trim();
            
            if (!trimmed) {
                return { valid: false, message: 'Email es obligatorio' };
            }
            if (!emailRegex.test(trimmed)) {
                return { valid: false, message: 'Email no válido' };
            }
            
            return { valid: true, value: trimmed };
        },

        /**
         * Validar que no exista duplicado
         */
        unique(value, existingValues, fieldName = 'valor') {
            const trimmed = (value || '').trim().toLowerCase();
            const exists = existingValues.some(existing => 
                (existing || '').trim().toLowerCase() === trimmed
            );
            
            return {
                valid: !exists,
                message: exists ? `Ya existe un ${fieldName} con ese nombre` : '',
                value: trimmed
            };
        },

        /**
         * Validar formulario completo
         */
        form(formElement, rules = {}) {
            const results = { valid: true, errors: {}, data: {} };
            const formData = new FormData(formElement);
            
            for (const [fieldName, value] of formData.entries()) {
                const rule = rules[fieldName];
                if (!rule) continue;
                
                let result = { valid: true, value };
                
                // Aplicar validaciones según el tipo
                if (rule.required) {
                    result = this.requiredText(value, rule.minLength, rule.maxLength);
                }
                
                if (result.valid && rule.type === 'email') {
                    result = this.email(value);
                }
                
                if (result.valid && rule.type === 'currency') {
                    result = Utils.currency.validateAmount(value, rule.min, rule.max);
                }
                
                if (result.valid && rule.unique) {
                    result = this.unique(value, rule.unique, rule.fieldName || fieldName);
                }
                
                // Validación personalizada
                if (result.valid && rule.custom) {
                    result = rule.custom(value);
                }
                
                if (!result.valid) {
                    results.valid = false;
                    results.errors[fieldName] = result.message;
                } else {
                    results.data[fieldName] = result.value;
                }
            }
            
            return results;
        }
    },

    /**
     * 🎨 UTILIDADES DE DOM
     */
    dom: {
        /**
         * Crear elemento con atributos
         */
        create(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'innerHTML') {
                    element.innerHTML = value;
                } else if (key === 'textContent') {
                    element.textContent = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            if (content) {
                element.innerHTML = content;
            }
            
            return element;
        },

        /**
         * Encontrar elemento padre con selector
         */
        findParent(element, selector) {
            let parent = element.parentElement;
            while (parent && !parent.matches(selector)) {
                parent = parent.parentElement;
            }
            return parent;
        },

        /**
         * Agregar clase con transición
         */
        addClassWithTransition(element, className, duration = 300) {
            element.style.transition = `all ${duration}ms ease`;
            element.classList.add(className);
            
            setTimeout(() => {
                element.style.transition = '';
            }, duration);
        },

        /**
         * Toggle clase con callback
         */
        toggleClass(element, className, callback) {
            const hasClass = element.classList.contains(className);
            element.classList.toggle(className);
            
            if (callback) {
                callback(!hasClass);
            }
        },

        /**
         * Limpiar contenido con animación
         */
        clearContent(element, fadeOut = true) {
            if (!fadeOut) {
                element.innerHTML = '';
                return Promise.resolve();
            }
            
            return new Promise(resolve => {
                element.style.opacity = '0';
                element.style.transition = 'opacity 200ms ease';
                
                setTimeout(() => {
                    element.innerHTML = '';
                    element.style.opacity = '1';
                    element.style.transition = '';
                    resolve();
                }, 200);
            });
        }
    },

    /**
     * 📝 UTILIDADES DE FORMULARIOS
     */
    forms: {
        /**
         * Mostrar error en campo
         */
        showFieldError(fieldElement, message) {
            const errorElement = fieldElement.parentNode.querySelector('.field-error') ||
                               fieldElement.nextElementSibling;
            
            if (errorElement && errorElement.classList.contains('field-error')) {
                errorElement.textContent = message;
                errorElement.style.display = 'block';
            }
            
            fieldElement.style.borderColor = '#ef4444';
            fieldElement.setAttribute('aria-invalid', 'true');
        },

        /**
         * Limpiar error en campo
         */
        clearFieldError(fieldElement) {
            const errorElement = fieldElement.parentNode.querySelector('.field-error') ||
                               fieldElement.nextElementSibling;
            
            if (errorElement && errorElement.classList.contains('field-error')) {
                errorElement.textContent = '';
                errorElement.style.display = 'none';
            }
            
            fieldElement.style.borderColor = '';
            fieldElement.removeAttribute('aria-invalid');
        },

        /**
         * Configurar validación en tiempo real
         */
        setupRealTimeValidation(form, rules) {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            inputs.forEach(input => {
                const rule = rules[input.name];
                if (!rule) return;
                
                const validateField = () => {
                    const result = Utils.validation.form(form, { [input.name]: rule });
                    
                    if (result.errors[input.name]) {
                        this.showFieldError(input, result.errors[input.name]);
                    } else {
                        this.clearFieldError(input);
                    }
                    
                    return result.valid;
                };
                
                // Validar en blur y input (con debounce)
                let timeout;
                input.addEventListener('input', () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(validateField, 300);
                });
                
                input.addEventListener('blur', validateField);
            });
        },

        /**
         * Serializar formulario a objeto
         */
        serialize(form) {
            const formData = new FormData(form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                // Manejar checkboxes múltiples
                if (data[key]) {
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }
            
            return data;
        }
    },

    /**
     * ⏰ UTILIDADES DE FECHA Y TIEMPO
     */
    time: {
        /**
         * Formatear fecha para mostrar
         */
        formatDate(date, options = {}) {
            const defaultOptions = {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                ...options
            };
            
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj.toLocaleDateString('es-CL', defaultOptions);
        },

        /**
         * Formatear fecha relativa (hace X tiempo)
         */
        formatRelative(date) {
            const now = new Date();
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            const diff = now - dateObj;
            
            const minutes = Math.floor(diff / 60000);
            const hours = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            
            if (minutes < 1) return 'Ahora mismo';
            if (minutes < 60) return `Hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
            if (hours < 24) return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
            if (days < 30) return `Hace ${days} día${days !== 1 ? 's' : ''}`;
            
            return this.formatDate(dateObj);
        },

        /**
         * Obtener timestamp actual
         */
        now() {
            return new Date().toISOString();
        },

        /**
         * Validar si es fecha válida
         */
        isValid(date) {
            const dateObj = typeof date === 'string' ? new Date(date) : date;
            return dateObj instanceof Date && !isNaN(dateObj);
        }
    },

    /**
     * 🔢 UTILIDADES MATEMÁTICAS
     */
    math: {
        /**
         * Calcular porcentaje
         */
        percentage(value, total) {
            if (total === 0) return 0;
            return Math.round((value / total) * 100);
        },

        /**
         * Redondear a decimales específicos
         */
        round(number, decimals = 2) {
            return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
        },

        /**
         * Clamp número entre min y max
         */
        clamp(number, min, max) {
            return Math.min(Math.max(number, min), max);
        },

        /**
         * Sumar array de números
         */
        sum(numbers) {
            return numbers.reduce((total, num) => total + (num || 0), 0);
        },

        /**
         * Calcular promedio
         */
        average(numbers) {
            if (numbers.length === 0) return 0;
            return this.sum(numbers) / numbers.length;
        }
    },

    /**
     * 🎨 UTILIDADES DE UI
     */
    ui: {
        /**
         * Mostrar loading en botón
         */
        showButtonLoading(button, loading = true) {
            const text = button.querySelector('.button-text');
            const spinner = button.querySelector('.button-spinner');
            
            button.disabled = loading;
            
            if (text) text.style.display = loading ? 'none' : 'inline';
            if (spinner) spinner.style.display = loading ? 'flex' : 'none';
        },

        /**
         * Scroll suave a elemento
         */
        scrollTo(element, options = {}) {
            const defaultOptions = {
                behavior: 'smooth',
                block: 'center',
                ...options
            };
            
            element.scrollIntoView(defaultOptions);
        },

        /**
         * Copiar texto al portapapeles
         */
        async copyToClipboard(text) {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch (error) {
                console.error('Error copiando al portapapeles:', error);
                return false;
            }
        },

        /**
         * Detectar dispositivo móvil
         */
        isMobile() {
            return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        /**
         * Debounce función
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Throttle función
         */
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    },

    /**
     * 📊 UTILIDADES DE DATOS
     */
    data: {
        /**
         * Clonar objeto profundo
         */
        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            
            const cloned = {};
            Object.keys(obj).forEach(key => {
                cloned[key] = this.deepClone(obj[key]);
            });
            
            return cloned;
        },

        /**
         * Agrupar array por campo
         */
        groupBy(array, key) {
            return array.reduce((grouped, item) => {
                const group = item[key];
                if (!grouped[group]) grouped[group] = [];
                grouped[group].push(item);
                return grouped;
            }, {});
        },

        /**
         * Ordenar array de objetos
         */
        sortBy(array, key, order = 'asc') {
            return [...array].sort((a, b) => {
                const aVal = a[key];
                const bVal = b[key];
                
                if (aVal < bVal) return order === 'asc' ? -1 : 1;
                if (aVal > bVal) return order === 'asc' ? 1 : -1;
                return 0;
            });
        },

        /**
         * Filtrar array por múltiples criterios
         */
        filter(array, filters) {
            return array.filter(item => {
                return Object.entries(filters).every(([key, value]) => {
                    if (typeof value === 'function') {
                        return value(item[key]);
                    }
                    return item[key] === value;
                });
            });
        },

        /**
         * Obtener valores únicos de array
         */
        unique(array, key) {
            if (key) {
                return array.filter((item, index, self) => 
                    index === self.findIndex(t => t[key] === item[key])
                );
            }
            return [...new Set(array)];
        }
    },

    /**
     * 🔍 UTILIDADES DE BÚSQUEDA
     */
    search: {
        /**
         * Búsqueda simple en texto
         */
        simple(items, query, fields = []) {
            if (!query.trim()) return items;
            
            const searchTerm = query.toLowerCase().trim();
            
            return items.filter(item => {
                if (fields.length === 0) {
                    // Buscar en todas las propiedades string del objeto
                    return Object.values(item).some(value => 
                        typeof value === 'string' && 
                        value.toLowerCase().includes(searchTerm)
                    );
                } else {
                    // Buscar solo en campos específicos
                    return fields.some(field => {
                        const value = item[field];
                        return typeof value === 'string' && 
                               value.toLowerCase().includes(searchTerm);
                    });
                }
            });
        },

        /**
         * Búsqueda avanzada con scoring
         */
        advanced(items, query, options = {}) {
            const { fields = [], threshold = 0.3 } = options;
            
            if (!query.trim()) return items;
            
            const searchTerms = query.toLowerCase().trim().split(' ');
            
            const scored = items.map(item => {
                let score = 0;
                const searchFields = fields.length > 0 ? fields : Object.keys(item);
                
                searchFields.forEach(field => {
                    const value = (item[field] || '').toString().toLowerCase();
                    
                    searchTerms.forEach(term => {
                        if (value.includes(term)) {
                            // Bonus para coincidencias exactas
                            if (value === term) score += 1;
                            // Bonus para coincidencias al inicio
                            else if (value.startsWith(term)) score += 0.8;
                            // Puntuación normal para coincidencias en el medio
                            else score += 0.5;
                        }
                    });
                });
                
                return { item, score };
            });
            
            return scored
                .filter(({ score }) => score >= threshold)
                .sort((a, b) => b.score - a.score)
                .map(({ item }) => item);
        }
    },

    /**
     * 💾 UTILIDADES DE STORAGE
     */
    storage: {
        /**
         * Guardar en localStorage con compresión
         */
        set(key, data) {
            try {
                const serialized = JSON.stringify(data);
                localStorage.setItem(key, serialized);
                return true;
            } catch (error) {
                console.error('Error guardando en localStorage:', error);
                return false;
            }
        },

        /**
         * Obtener de localStorage
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.error('Error leyendo de localStorage:', error);
                return defaultValue;
            }
        },

        /**
         * Remover de localStorage
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.error('Error removiendo de localStorage:', error);
                return false;
            }
        },

        /**
         * Limpiar localStorage
         */
        clear() {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.error('Error limpiando localStorage:', error);
                return false;
            }
        },

        /**
         * Obtener tamaño usado de localStorage
         */
        getSize() {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return total;
        }
    },

    /**
     * 🎯 UTILIDADES DE DESARROLLO
     */
    dev: {
        /**
         * Log con timestamp y categoría
         */
        log(message, category = 'INFO', data = null) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${category}]`;
            
            if (data) {
                console.log(`${prefix} ${message}`, data);
            } else {
                console.log(`${prefix} ${message}`);
            }
        },

        /**
         * Medir tiempo de ejecución
         */
        time(label) {
            const start = performance.now();
            
            return {
                end: () => {
                    const duration = performance.now() - start;
                    console.log(`${label}: ${duration.toFixed(2)}ms`);
                    return duration;
                }
            };
        },

        /**
         * Generar datos de prueba
         */
        generateTestData(type, count = 10) {
            const generators = {
                income: () => ({
                    id: Utils.id.generate('income'),
                    fuente: `Fuente ${Math.floor(Math.random() * 1000)}`,
                    monto: Math.floor(Math.random() * 1000000) + 50000,
                    activo: Math.random() > 0.2,
                    fechaCreacion: Utils.time.now()
                }),
                expense: () => ({
                    id: Utils.id.generate('expense'),
                    categoria: `Gasto ${Math.floor(Math.random() * 1000)}`,
                    monto: Math.floor(Math.random() * 500000) + 10000,
                    activo: Math.random() > 0.1,
                    pagado: Math.random() > 0.5,
                    fechaCreacion: Utils.time.now()
                })
            };
            
            const generator = generators[type];
            if (!generator) return [];
            
            return Array.from({ length: count }, generator);
        }
    }
};

// Crear alias globales para funciones más usadas
window.formatCurrency = Utils.currency.format;
window.generateId = Utils.id.generate;
window.showMessage = (msg, type) => window.modalSystem?.showMessage(msg, type);

console.log('🛠️ Utils.js cargado - Funciones centralizadas disponibles');

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}