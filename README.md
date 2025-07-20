# 💰 Sistema de Presupuesto Familiar

> **Aplicación web moderna para la gestión inteligente de finanzas familiares**

[![Versión](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/usuario/presupuesto-familiar)
[![Licencia](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Estado](https://img.shields.io/badge/estado-estable-brightgreen.svg)](https://github.com/usuario/presupuesto-familiar)

---

## 📋 **Tabla de Contenidos**

- [🎯 Descripción](#-descripción)
- [✨ Características](#-características)
- [🚀 Instalación](#-instalación)
- [📖 Uso](#-uso)
- [🏗️ Arquitectura](#️-arquitectura)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🔧 Configuración](#-configuración)
- [📊 API y Módulos](#-api-y-módulos)
- [🎨 Personalización](#-personalización)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 🎯 **Descripción**

**Sistema de Presupuesto Familiar** es una aplicación web moderna y completa diseñada para ayudar a las familias a gestionar sus finanzas de manera inteligente y segura. Ofrece herramientas avanzadas para el control de ingresos, gastos, reportes y análisis financiero.

### **🎪 Demo en Vivo**
🔗 [Ver Demo](https://tu-usuario.github.io/presupuesto-familiar)

### **📸 Capturas de Pantalla**

| Dashboard Principal | Gestión de Gastos | Reportes |
|:-------------------:|:-----------------:|:--------:|
| ![Dashboard](docs/images/dashboard.png) | ![Gastos](docs/images/gastos.png) | ![Reportes](docs/images/reportes.png) |

---

## ✨ **Características**

### **🔐 Seguridad Enterprise**
- 🛡️ **Autenticación robusta** con PBKDF2 y salt único
- 🔒 **Gestión de sesiones** segura con expiración automática
- 📝 **Logging detallado** para auditoría
- 🚫 **Protección contra ataques** de fuerza bruta

### **💰 Gestión Financiera Completa**
- 📊 **Dashboard interactivo** con métricas en tiempo real
- 💳 **Categorización inteligente** de gastos (fijos, variables, extras)
- 💵 **Gestión de ingresos** con múltiples fuentes
- 📈 **Reportes automáticos** con gráficos y análisis
- 🎯 **Recomendaciones personalizadas** basadas en patrones

### **🌍 Multi-moneda Avanzado**
- 💱 **Soporte para CLP, USD, EUR** con conversión automática
- 📊 **Tasas de cambio en tiempo real** desde APIs externas
- 🎨 **Formateo cultural** automático según la moneda
- 🔄 **Actualización automática** cada 6 horas

### **📱 Experiencia de Usuario Moderna**
- 📱 **Diseño responsive** optimizado para móviles
- 🎨 **Interfaz moderna** con animaciones suaves
- 🌙 **Modo oscuro** automático
- ⚡ **Carga instantánea** con sistema de componentes
- 🖱️ **Drag & drop** para reorganizar gastos

### **💾 Persistencia Inteligente**
- 🔄 **Auto-guardado** cada 5 minutos
- 📦 **Backup automático** de seguridad
- 📤 **Exportación/Importación** de datos en JSON
- 🗄️ **localStorage** optimizado con compresión

---

## 🚀 **Instalación**

### **⚡ Instalación Rápida**

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/presupuesto-familiar.git
cd presupuesto-familiar

# 2. Abrir en servidor local
# Opción A: Con Python
python -m http.server 8000

# Opción B: Con Node.js
npx serve .

# Opción C: Con VS Code Live Server
# Instalar extensión "Live Server" y hacer clic derecho > "Open with Live Server"

# 3. Abrir en navegador
open http://localhost:8000
```

### **📋 Requisitos del Sistema**

#### **Navegadores Compatibles**
- ✅ **Chrome/Edge** 90+
- ✅ **Firefox** 88+
- ✅ **Safari** 14+
- ✅ **Chrome Mobile** 90+
- ✅ **Safari Mobile** 14+

#### **Tecnologías Utilizadas**
- 🌐 **HTML5** + **CSS3** + **JavaScript ES6+**
- 📊 **Chart.js** para gráficos
- 🎨 **CSS Grid** + **Flexbox** para layout
- 📱 **Web APIs** modernas (localStorage, fetch, crypto)

### **🔧 Configuración de Desarrollo**

```bash
# Configurar git hooks (opcional)
cp scripts/pre-commit .git/hooks/
chmod +x .git/hooks/pre-commit

# Instalar herramientas de desarrollo (opcional)
npm install -g live-server eslint prettier
```

---

## 📖 **Uso**

### **🎬 Primeros Pasos**

1. **Acceder a la aplicación**
   - Abrir `index.html` en un servidor local
   - La primera vez mostrará la pantalla de configuración inicial

2. **Crear primera cuenta**
   ```
   Usuario: admin
   Contraseña: Admin123!
   ```

3. **Explorar el dashboard**
   - Ver resumen financiero en tiempo real
   - Navegar entre las diferentes secciones

### **💰 Gestión de Ingresos**

```javascript
// Agregar nuevo ingreso
1. Ir a "Agregar Ingresos" en el menú lateral
2. Hacer clic en "Agregar Ingresos" (botón azul)
3. Completar formulario:
   - Fuente: "Sueldo principal"
   - Monto: 1500000
   - Activo: ✓
4. Guardar
```

**Funciones avanzadas:**
- 🖱️ **Doble clic** en nombre/monto para edición inline
- 🖱️ **Click derecho** para menú contextual (editar/eliminar)
- 📱 **Long press** en móvil para menú contextual

### **💳 Gestión de Gastos**

#### **Categorías de Gastos**

| Tipo | Descripción | Ejemplos |
|------|-------------|----------|
| **🏠 Fijos** | Gastos regulares mensuales | Arriendo, servicios, seguros |
| **🛒 Variables** | Gastos que cambian mes a mes | Alimentación, transporte, ropa |
| **⚡ Extras** | Gastos ocasionales | Viajes, regalos, emergencias |

#### **Flujo de Trabajo**

```javascript
// Agregar gasto fijo
1. Menú lateral > "Fijos / Variables"
2. Seleccionar "Gasto Fijo"
3. Completar:
   - Categoría: "Arriendo"
   - Monto: 450000
   - Activo: ✓
4. Guardar

// Marcar como pagado
1. Buscar el gasto en la lista
2. Hacer clic en checkbox ✓
3. Se actualiza automáticamente el balance
```

### **📊 Reportes y Análisis**

```javascript
// Generar reporte mensual
1. Ir a "Reportes e informes" en el menú
2. Ver automáticamente:
   - Resumen financiero
   - Gráficos de distribución
   - Análisis por categorías
   - Recomendaciones personalizadas
3. Exportar a PDF (próximamente)
```

### **💱 Cambio de Moneda**

```javascript
// Cambiar moneda del sistema
1. En el header, usar el selector de moneda
2. Seleccionar: CLP 🇨🇱 / USD 🇺🇸 / EUR 🇪🇺
3. Todos los valores se actualizan automáticamente
4. Las tasas de cambio se actualizan cada 6 horas
```

---

## 🏗️ **Arquitectura**

### **📐 Patrón de Diseño**

La aplicación sigue un **patrón modular** con **separación de responsabilidades**:

```
┌─────────────────────────────────────────────────────────┐
│                    DASHBOARD HTML                       │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────┐
│              DASHBOARD ORCHESTRATOR                     │
│           (Coordinación central)                        │
└─┬─────────┬─────────┬─────────┬─────────┬─────────┬─────┘
  │         │         │         │         │         │
┌─▼──┐ ┌───▼──┐ ┌────▼───┐ ┌───▼───┐ ┌───▼───┐ ┌─▼────┐
│AUTH│ │STORAGE│ │CURRENCY│ │GASTOS │ │INGRESOS│ │REPORTES│
└────┘ └──────┘ └────────┘ └───────┘ └───────┘ └──────┘
```

### **🔄 Flujo de Datos**

```javascript
User Input → Component → Manager → Storage → Database
     ↑                                           │
     └─────────── UI Update ←─── Event ←────────┘
```

### **📦 Módulos Principales**

#### **🎯 DashboardOrchestrator** (`dashboard-main.js`)
- **Responsabilidad:** Coordinación central de todos los módulos
- **Funciones:** Inicialización, gestión de estado, eventos globales

#### **🔐 AuthenticationSystem** (`auth.js`)
- **Responsabilidad:** Seguridad y autenticación
- **Funciones:** Login, registro, sesiones, validaciones

#### **💾 StorageManager** (`storage.js`)
- **Responsabilidad:** Persistencia de datos
- **Funciones:** Auto-guardado, backup, exportación

#### **💱 CurrencyManager** (`currency.js`)
- **Responsabilidad:** Gestión multi-moneda
- **Funciones:** Conversiones, formateo, tasas de cambio

#### **💳 GastosManager** (`gastos.js`)
- **Responsabilidad:** Gestión de gastos
- **Funciones:** CRUD gastos, categorización, cálculos

#### **💰 IngresosManager** (`ingresos.js`)
- **Responsabilidad:** Gestión de ingresos
- **Funciones:** CRUD ingresos, validaciones, formateo

#### **📊 ReportesManager** (`reportes.js`)
- **Responsabilidad:** Reportes y análisis
- **Funciones:** Gráficos, métricas, recomendaciones

---

## 📁 **Estructura del Proyecto**

```
presupuesto-familiar/
├── 📄 index.html                 # Página de login
├── 📄 dashboard.html             # Dashboard principal
├── 📄 README.md                  # Documentación
│
├── 🎨 css/
│   ├── styles.css                # Estilos base y utilidades
│   ├── dashboard.css             # Estilos del dashboard
│   ├── login.css                 # Estilos del login
│   └── responsive.css            # Media queries
│
├── ⚡ js/
│   ├── dashboard-main.js         # 🆕 Orchestrator principal
│   ├── auth.js                   # Sistema de autenticación
│   ├── storage.js                # Gestión de datos
│   ├── currency.js               # Sistema multi-moneda
│   ├── gastos.js                 # Gestión de gastos
│   ├── ingresos.js               # Gestión de ingresos
│   ├── reportes.js               # 🆕 Sistema de reportes
│   ├── component-loader.js       # Carga de componentes
│   ├── gastos_contextual_drag.js # Drag & drop
│   └── utils.js                  # Utilidades compartidas
│
├── 🧩 components/
│   ├── header-section.html       # Header del dashboard
│   ├── sidebar-menu.html         # Menú lateral
│   ├── stats-cards.html          # Tarjetas de resumen
│   └── details-panel.html        # Panel de detalles
│
├── 📊 assets/
│   ├── 🖼️ images/               # Imágenes y capturas
│   ├── 🎨 icons/                # Iconografía
│   └── 📄 fonts/                # Fuentes personalizadas
│
├── 📝 docs/
│   ├── api.md                    # Documentación de API
│   ├── deployment.md             # Guía de despliegue
│   └── contributing.md           # Guía de contribución
│
└── 🔧 scripts/
    ├── build.js                  # Script de construcción
    ├── deploy.sh                 # Script de despliegue
    └── pre-commit                # Git hook
```

---

## 🔧 **Configuración**

### **⚙️ Configuración Principal**

La configuración se gestiona automáticamente, pero puede personalizarse:

```javascript
// Configuración por defecto en storage.js
const defaultConfig = {
    monedaPrincipal: 'CLP',         // Moneda principal
    autoGuardado: true,             // Auto-guardado activado
    intervalGuardado: 300000,       // 5 minutos
    mostrarNotificaciones: true,    // Notificaciones activadas
    tema: 'claro',                  // Tema de la aplicación
    formatoFecha: 'DD/MM/YYYY',     // Formato de fecha
    mostrarDetalles: true           // Panel de detalles visible
};
```

### **🎨 Personalización de Temas**

```css
/* Variables CSS en styles.css */
:root {
    --primary-600: #2563eb;        /* Color principal */
    --success-600: #059669;        /* Color de éxito */
    --error-600: #dc2626;          /* Color de error */
    --warning-500: #f59e0b;        /* Color de advertencia */
    
    /* Espaciado */
    --spacing-sm: 0.5rem;
    --spacing-md: 0.75rem;
    --spacing-lg: 1rem;
    
    /* Tipografía */
    --font-family-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### **💱 Configuración de Monedas**

```javascript
// En currency.js - agregar nueva moneda
const newCurrency = {
    'ARS': {
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: ',
        decimals: 2,
        position: 'before',
        thousandsSeparator: '.',
        decimalSeparator: ',',
        format: '{symbol}{amount}'
    }
};

// Registrar en supportedCurrencies
supportedCurrencies['ARS'] = newCurrency['ARS'];
```

---

## 📊 **API y Módulos**

### **🔐 AuthenticationSystem**

```javascript
// Métodos principales
await authSystem.loginUser(username, password);
await authSystem.registerUser(username, password, confirmPassword);
authSystem.logout();
authSystem.checkSession();

// Eventos
window.addEventListener('auth_loginSuccess', (e) => {
    console.log('Login exitoso:', e.detail);
});
```

### **💾 StorageManager**

```javascript
// Gestión de datos
const data = storageManager.getDashboardData();
storageManager.setIngresos(ingresosData);
storageManager.setGastosFijos(gastosData);

// Backup y exportación
storageManager.createBackup();
const exportData = storageManager.exportData();
storageManager.importData(jsonData);

// Eventos
window.addEventListener('storageSaved', () => {
    console.log('Datos guardados automáticamente');
});
```

### **💱 CurrencyManager**

```javascript
// Conversión de monedas
const converted = currencyManager.convert(1000, 'CLP', 'USD');
const formatted = currencyManager.format(1500000, 'CLP');

// Cambio de moneda
currencyManager.setCurrency('USD');
const current = currencyManager.getCurrentCurrency();

// Eventos
window.addEventListener('currency_currencyChanged', (e) => {
    console.log('Moneda cambiada:', e.detail);
});
```

### **💳 GastosManager**

```javascript
// Gestión de gastos
gastosManager.showAddGastoModal('fijos');
gastosManager.toggleGastoPagado(gastoId, 'fijos', true);
gastosManager.switchView('expenses');

// Eventos
window.addEventListener('gastos_gastoAdded', (e) => {
    console.log('Nuevo gasto:', e.detail);
});
```

### **💰 IngresosManager**

```javascript
// Gestión de ingresos
ingresosManager.showAddIncomeModal();
ingresosManager.showEditIncomeModal(incomeId);
ingresosManager.showDeleteModal(incomeId);

// Eventos
window.addEventListener('income_incomeAdded', (e) => {
    console.log('Nuevo ingreso:', e.detail);
});
```

### **📊 ReportesManager**

```javascript
// Generación de reportes
reportesManager.generateCurrentReport();
reportesManager.showReportView();
reportesManager.exportToPDF();

// Datos del reporte
const reportData = reportesManager.reportData;
console.log('Resumen:', reportData.resumen);
console.log('Recomendaciones:', reportData.recomendaciones);
```

---

## 🎨 **Personalización**

### **🎨 Cambiar Colores del Tema**

```css
/* Personalizar colores principales */
:root {
    --primary-600: #7c3aed;      /* Violeta */
    --success-600: #059669;      /* Verde */
    --error-600: #dc2626;        /* Rojo */
}

/* Tema oscuro personalizado */
@media (prefers-color-scheme: dark) {
    :root {
        --primary-600: #a78bfa;
        --bg-color: #1f2937;
        --text-color: #f9fafb;
    }
}
```

### **📱 Personalizar Responsive Breakpoints**

```css
/* En responsive.css */
@media (max-width: 1200px) { /* Tablet grande */ }
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 480px)  { /* Mobile pequeño */ }
```

### **🔧 Agregar Nueva Sección al Menú**

```javascript
// 1. En sidebar-menu.html
<button class="nav-item" data-section="mi-seccion">
    <span class="nav-icon">🆕</span>
    Mi Nueva Sección
</button>

// 2. En component-loader.js
case 'mi-seccion':
    this.loadMiSeccionView(container);
    break;

// 3. Implementar función
loadMiSeccionView(container) {
    container.innerHTML = `
        <section class="content-section active">
            <h2>Mi Nueva Sección</h2>
            <p>Contenido personalizado aquí</p>
        </section>
    `;
}
```

---

## 🧪 **Testing**

### **🧪 Testing Manual**

```bash
# Lista de verificación
✅ Login funciona correctamente
✅ Registro crea nuevos usuarios
✅ Dashboard carga sin errores
✅ Ingresos se agregan y editan
✅ Gastos se categorizan correctamente
✅ Reportes se generan automáticamente
✅ Cambio de moneda actualiza valores
✅ Auto-guardado funciona
✅ Exportación descarga archivo
✅ Responsive funciona en móvil
```

### **🔧 Testing de Performance**

```javascript
// Medir tiempo de carga
console.time('Dashboard Load');
// ... código de inicialización
console.timeEnd('Dashboard Load'); // ~200ms esperado

// Verificar memoria
console.log('Memoria usada:', 
    (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB'
);
```

### **🐛 Debugging**

```javascript
// Herramientas de debug disponibles
window.authDebug.showLogs();          // Logs de autenticación
window.dashboardDebug.getState();     // Estado del dashboard
window.debugIngresos.verificarBotones(); // Verificar botones

// Logs detallados
localStorage.setItem('debug', 'true'); // Activar logs detallados
```

---

## 🚢 **Deployment**

### **🌐 GitHub Pages**

```bash
# 1. Preparar repositorio
git add .
git commit -m "Preparar para deployment"
git push origin main

# 2. Activar GitHub Pages
# Settings > Pages > Source: Deploy from a branch > main

# 3. Acceder a la URL
# https://tu-usuario.github.io/presupuesto-familiar
```

### **☁️ Netlify**

```bash
# 1. Crear cuenta en Netlify
# 2. Conectar repositorio GitHub
# 3. Configurar build:
#    Build command: (vacío)
#    Publish directory: .
# 4. Deploy automático en cada push
```

### **🐳 Docker**

```dockerfile
# Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Build y run
docker build -t presupuesto-familiar .
docker run -p 8080:80 presupuesto-familiar
```

### **⚙️ Configuración de Producción**

```javascript
// Optimizaciones para producción
// 1. Minificar CSS/JS
// 2. Optimizar imágenes
// 3. Configurar cache headers
// 4. Habilitar compression
// 5. Configurar HTTPS
```

---

## 🤝 **Contribución**

### **🚀 Empezar a Contribuir**

```bash
# 1. Fork del proyecto
git clone https://github.com/tu-usuario/presupuesto-familiar.git

# 2. Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# 3. Hacer cambios y commit
git add .
git commit -m "feat: agregar nueva funcionalidad"

# 4. Push y Pull Request
git push origin feature/nueva-funcionalidad
```

### **📝 Convenciones de Código**

```javascript
// Naming conventions
const miVariable = 'camelCase';          // Variables
const MI_CONSTANTE = 'UPPER_CASE';      // Constantes
class MiClase { }                       // Clases
function miFuncion() { }                // Funciones

// Commits semánticos
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato/estilo
refactor: refactorización
test: pruebas
chore: tareas de mantenimiento
```

### **🎯 Áreas que Necesitan Ayuda**

- 📊 **Gráficos avanzados** con más tipos de visualización
- 📱 **PWA** para funcionalidad offline
- 🔐 **Autenticación social** (Google, Facebook)
- 📈 **Machine Learning** para predicciones financieras
- 🌍 **Internacionalización** (más idiomas)
- 🎨 **Temas personalizados** adicionales

### **🏆 Contributors**

<table>
<tr>
<td align="center">
<a href="https://github.com/contributor1">
<img src="https://github.com/contributor1.png" width="100px;" alt=""/><br />
<sub><b>Contributor 1</b></sub>
</a><br />
💻📖🎨
</td>
<td align="center">
<a href="https://github.com/contributor2">
<img src="https://github.com/contributor2.png" width="100px;" alt=""/><br />
<sub><b>Contributor 2</b></sub>
</a><br />
🐛📖⚡
</td>
</tr>
</table>

---

## 📞 **Soporte y Contacto**

### **🆘 Obtener Ayuda**

- 📚 **Documentación:** [Wiki del proyecto](https://github.com/usuario/presupuesto-familiar/wiki)
- 🐛 **Reportar bugs:** [Issues](https://github.com/usuario/presupuesto-familiar/issues)
- 💬 **Discusiones:** [Discussions](https://github.com/usuario/presupuesto-familiar/discussions)
- 📧 **Email:** presupuesto-familiar@ejemplo.com

### **❓ FAQ**

<details>
<summary><strong>¿Los datos están seguros?</strong></summary>

Sí, todos los datos se almacenan localmente en tu navegador usando localStorage con encriptación PBKDF2. No se envían datos a servidores externos.
</details>

<details>
<summary><strong>¿Puedo usar la app sin internet?</strong></summary>

Sí, la aplicación funciona completamente offline. Solo necesita internet para actualizar tasas de cambio.
</details>

<details>
<summary><strong>¿Cómo hago backup de mis datos?</strong></summary>

Ve al header del dashboard y haz clic en "Exportar Datos". Se descargará un archivo JSON con toda tu información.
</details>

---

## 📄 **Licencia**

Este proyecto está licenciado bajo la **Licencia MIT** - ver el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License

Copyright (c) 2025 Sistema de Presupuesto Familiar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🎉 **Agradecimientos**

- 🎨 **Inter Font** por la tipografía moderna
- 📊 **Chart.js** por los gráficos interactivos
- 🔐 **Web Crypto API** por las funciones de seguridad
- 💰 **ExchangeRate-API** por las tasas de cambio
- 🎭 **Feather Icons** por la iconografía

---

<div align="center">

**⭐ Si este proyecto te ha sido útil, ¡considera darle una estrella! ⭐**

[⬆ Volver arriba](#-sistema-de-presupuesto-familiar)

</div>