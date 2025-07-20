/**
 * 👁️ PASSWORD TOGGLE FUNCTIONALITY
 * Funcionalidad para mostrar/ocultar contraseña en el login
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Configurando toggle de contraseña...');
    
    // Configurar todos los botones de toggle password
    setupPasswordToggle();
});

/**
 * 🔧 CONFIGURAR TOGGLE DE CONTRASEÑA
 */
function setupPasswordToggle() {
    // Buscar todos los botones de toggle password
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        // Agregar event listener a cada botón
        button.addEventListener('click', function() {
            togglePasswordVisibility(this);
        });
        
        console.log('👁️ Toggle password configurado');
    });
}

/**
 * 👁️ ALTERNAR VISIBILIDAD DE CONTRASEÑA
 */
function togglePasswordVisibility(toggleButton) {
    // Encontrar el input de contraseña relacionado
    const passwordInput = toggleButton.closest('.input-wrapper').querySelector('input[type="password"], input[type="text"]');
    
    if (!passwordInput) {
        console.error('❌ No se encontró el input de contraseña');
        return;
    }
    
    // Encontrar los iconos dentro del botón
    const eyeIcon = toggleButton.querySelector('.eye-icon');
    const eyeOffIcon = toggleButton.querySelector('.eye-off-icon');
    
    if (!eyeIcon || !eyeOffIcon) {
        console.error('❌ No se encontraron los iconos de toggle');
        return;
    }
    
    // Alternar tipo de input y iconos
    if (passwordInput.type === 'password') {
        // Mostrar contraseña
        passwordInput.type = 'text';
        eyeIcon.style.display = 'none';
        eyeOffIcon.style.display = 'block';
        
        console.log('👁️ Contraseña visible');
    } else {
        // Ocultar contraseña
        passwordInput.type = 'password';
        eyeIcon.style.display = 'block';
        eyeOffIcon.style.display = 'none';
        
        console.log('🙈 Contraseña oculta');
    }
}

/**
 * 🔧 CONFIGURACIÓN AUTOMÁTICA PARA FORMULARIOS DINÁMICOS
 */
function reinitializePasswordToggle() {
    // Reconfigurar si se cargan nuevos formularios dinámicamente
    setupPasswordToggle();
}

// Exponer función globalmente para uso en otros scripts
window.setupPasswordToggle = setupPasswordToggle;
window.reinitializePasswordToggle = reinitializePasswordToggle;

console.log('👁️ Password toggle functionality cargada correctamente');