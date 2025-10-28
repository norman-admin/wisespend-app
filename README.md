# 💰 WiseSpend v2.2.0
### Control de Gastos Familiares

![WiseSpend Logo](https://img.shields.io/badge/WiseSpend-v2.2.0-blue.svg)
![Status](https://img.shields.io/badge/Status-Activo-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**WiseSpend** es una aplicación web completa para el control y gestión de gastos familiares, desarrollada con tecnologías modernas y enfocada en ofrecer una experiencia de usuario intuitiva y eficiente.

## 🚀 Características Principales

### 💻 **Core de la Aplicación**
- ✅ **Sistema de Autenticación** con Supabase Auth y sesiones seguras
- ✅ **Dashboard Responsivo** con arquitectura modular limpia
- ✅ **Multi-moneda** (CLP, USD, EUR) con tasas de cambio actualizadas
- ✅ **Storage Inteligente** con auto-guardado cada 5 minutos
- ✅ **Temas Dinámicos** (claro, oscuro, pastel, automático)

### 💰 **Gestión Financiera**
- ✅ **Ingresos**: Tabla mejorada y menú contextual
- ✅ **Gastos Fijos**: Administración de gastos recurrentes
- ✅ **Gastos Variables**: Control de gastos ocasionales  
- ✅ **Gastos Extras**: Sistema mejorado v2.2.0 con edición inline
- ✅ **Reportes Avanzados**: Gráficos, análisis y exportación

### 🎯 **Funcionalidades Avanzadas**
- ✅ **Sistema de Notas y Tareas**: Interfaz original de 2 columnas
- ✅ **Recordatorios Automáticos**: Sistema de pagos y tareas
- ✅ **Menú Contextual**: Acciones rápidas con click derecho
- ✅ **Calculadora Integrada**: Herramientas financieras

### 📝 **Sistema de Notas v2.2.0**
- **Interfaz Original**: Layout de 2 columnas (Tareas | Recordatorios)
- **CRUD Completo**: Crear, editar, eliminar tareas y recordatorios
- **Storage Persistente**: Datos guardados localmente
- **Filtros y Categorías**: Organización por tipo y prioridad
- **Ordenamiento Flexible**: Múltiples opciones de ordenamiento

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **HTML5/CSS3**: Interfaz moderna y responsiva
- **JavaScript ES6+**: Lógica de aplicación modular
- **Chart.js**: Gráficos y visualizaciones
- **Supabase**: Base de datos PostgreSQL y autenticación

### **Arquitectura**
- **Modular**: Componentes independientes y reutilizables
- **RESTful**: APIs bien estructuradas
- **Progressive**: Funcionamiento offline/online
- **Responsive**: Adaptable a todos los dispositivos

## 📦 Instalación

### **Prerrequisitos**
- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para tasas de cambio y Supabase)

### **Ejecución de la Aplicación**
```bash
# Opción 1: Servidor HTTP simple con Python
python -m http.server 5500

# Opción 2: Live Server (VS Code)
# Instalar extensión Live Server y ejecutar

# Opción 3: Node.js http-server
npx http-server -p 5500

# Opción 4: Abrir directamente
# Abrir index-backup.html en el navegador
```

## 🚦 Uso Rápido

### **1. Primer Inicio**
1. Abrir `index-backup.html` en el navegador
2. Crear cuenta de usuario
3. Configurar moneda principal
4. ¡Comenzar a registrar gastos!

### **2. Funcionalidades Principales**
- **Dashboard**: Vista general de finanzas
- **Ingresos**: Registrar fuentes de dinero
- **Gastos**: Administrar todos los tipos de gastos
- **Notas**: Sistema de tareas y recordatorios
- **Reportes**: Análisis y exportación de datos
- **Herramientas**: Calculadora y gestión de documentos

## 🔧 Configuración

### **Configuración de Supabase**
La aplicación usa Supabase para autenticación y almacenamiento. Configura tus credenciales en el archivo correspondiente:

```javascript
const SUPABASE_URL = 'tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key';
```

### **Configuración de Navegador**
- **JavaScript Habilitado**: Esencial para funcionamiento
- **Storage Local**: Para persistencia de datos
- **Cookies**: Para gestión de sesiones

## 📁 Estructura del Proyecto

```
wisespend-app/
├── 📄 index-backup.html       # Página de login con Supabase
├── 📄 dashboard.html          # Dashboard principal
├── 📁 css/                    # Estilos de la aplicación
│   ├── styles.css
│   ├── login.css
│   ├── dashboard.css
│   ├── themes.css
│   └── reportes.css
├── 📁 js/                     # Lógica JavaScript
│   ├── auth.js               # Sistema de autenticación v2.0
│   ├── supabase-storage.js   # Gestor Supabase
│   ├── storage.js            # Storage local
│   ├── gastos.js             # Gestión de gastos
│   ├── currency.js           # Multi-moneda
│   ├── theme-manager.js      # Temas
│   └── dashboard-main.js     # Orquestador
├── 📁 components/             # Componentes HTML reutilizables
├── 📁 Varios/                 # Módulo de notas y herramientas
│   ├── 📁 js/
│   │   ├── notas.js          # Sistema de notas v2.2.0
│   │   └── varios-manager.js  # Gestor de pestañas
│   └── 📁 css/
│       └── notas.css         # Estilos del sistema de notas
├── 📁 assets/                 # Recursos estáticos
├── 📁 themes/                 # Temas de la aplicación
└── 📄 README.md              # Este archivo
```

## 🔄 Flujo de Trabajo

### **Desarrollo Local**
1. Clonar repositorio
2. Configurar credenciales de Supabase
3. Ejecutar servidor local
4. Desarrollo y testing
5. Commit y push

### **Funcionalidades en Desarrollo**
- 🔄 **Sincronización en la nube** mejorada
- 🔄 **API externa para tasas de cambio**
- 🔄 **Notificaciones push**
- 🔄 **Modo offline avanzado**
- 🔄 **Exportación a PDF/Excel**

## 🐛 Resolución de Problemas

### **Datos no se Guardan**
- ✅ Verificar storage local del navegador
- ✅ Permisos de JavaScript habilitados
- ✅ Auto-guardado cada 5 minutos activo
- ✅ Verificar conexión con Supabase

### **Problemas de Autenticación**
- ✅ Verificar credenciales de Supabase
- ✅ Revisar consola del navegador para errores
- ✅ Limpiar caché y cookies del navegador
- ✅ Verificar que email confirmation esté desactivado en Supabase

### **Temas no Cambian**
- ✅ Verificar que theme-manager.js esté cargado
- ✅ Limpiar localStorage del navegador
- ✅ Recargar la página completamente

## 🤝 Contribución

### **Cómo Contribuir**
1. Fork del repositorio
2. Crear rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### **Estándares de Código**
- **JavaScript**: ES6+ con módulos
- **CSS**: Metodología BEM
- **HTML**: Semántico y accesible
- **Commits**: Conventional Commits

## 📊 Roadmap

### **v2.3.0** (Próximo)
- [ ] Mejoras en reportes con más gráficos
- [ ] Sistema de categorías personalizadas
- [ ] Export/Import de datos completo
- [ ] PWA - Aplicación Web Progresiva

### **v2.4.0** (Futuro cercano)
- [ ] Integración con APIs bancarias
- [ ] Notificaciones inteligentes
- [ ] Dashboard predictivo con IA

### **v3.0.0** (Futuro)
- [ ] Aplicación móvil nativa
- [ ] Sincronización multi-dispositivo en tiempo real
- [ ] Análisis financiero avanzado
- [ ] Sistema de presupuestos inteligentes

## 🔐 Seguridad

- **Autenticación**: Supabase Auth con tokens JWT
- **Almacenamiento**: Datos encriptados en Supabase
- **Sesiones**: Timeout automático de 30 minutos
- **Validación**: Input sanitization en todos los formularios

## 📊 Estadísticas del Proyecto

- **Líneas de código**: ~15,000+
- **Archivos JavaScript**: 25+
- **Componentes CSS**: 30+
- **Módulos**: 8 principales
- **Tiempo de desarrollo**: 6+ meses

## 🎨 Temas Disponibles

1. **Light Theme**: Tema claro moderno y limpio
2. **Dark Theme**: Tema oscuro para reducir fatiga visual
3. **Soft Dark**: Tema pastel suave con colores relajantes
4. **Auto Theme**: Se adapta automáticamente según la hora del día

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para detalles.

---

## 👨‍💻 Autor

**Norman Osses** - *Desarrollador Principal*
- Ubicación: Puerto Montt, Los Lagos Region, Chile
- GitHub: [@norman-admin](https://github.com/norman-admin)
- Proyecto: [WiseSpend](https://github.com/norman-admin/wisespend-app)

---

## 🙏 Agradecimientos

- Comunidad de desarrolladores JavaScript
- Equipo de Supabase por su excelente plataforma
- Chart.js por sus herramientas de visualización
- Usuarios beta testers que ayudaron a mejorar la app
- Comunidad open source en general

---

## 💡 ¿Necesitas Ayuda?

Si encuentras algún problema o tienes sugerencias:

1. **Issues**: [Crear nuevo issue](https://github.com/norman-admin/wisespend-app/issues)
2. **Documentación**: Revisar este README
3. **Debug**: Usar `window.dashboardDebug` en consola
4. **Logs**: Revisar la consola del navegador para mensajes de error

### **Comandos de Debug Disponibles**

```javascript
// Auth System
window.authDebug.getLogs()        // Ver logs de autenticación
window.authDebug.getStatus()      // Estado del sistema
window.authDebug.showLogs()       // Mostrar logs en tabla

// Dashboard
window.dashboardDebug.getSystemStatus()  // Estado general
window.dashboardDebug.getCurrentTheme()  // Tema actual

// Notas
window.notasDebug.info()          // Info del sistema de notas
window.notasDebug.export()        // Exportar datos
```

---

## 🌟 Características Destacadas

### **Interfaz Intuitiva**
Diseño moderno y limpio que facilita la navegación y el uso diario.

### **Gestión Completa**
Control total sobre ingresos, gastos fijos, variables y extras con menús contextuales.

### **Reportes Visuales**
Gráficos interactivos que te ayudan a entender tus finanzas de un vistazo.

### **Multi-dispositivo**
Funciona perfectamente en desktop, tablet y móvil.

### **Datos Seguros**
Toda tu información protegida con Supabase y almacenamiento local encriptado.

---

**¡Gracias por usar WiseSpend! 💰✨**

*Desarrollado con ❤️ en Puerto Montt, Chile*