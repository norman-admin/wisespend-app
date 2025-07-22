# 💰 WiseSpend v2.1.0
### Control de Gastos Familiares con WebSocket y Dictado por Voz

![WiseSpend Logo](https://img.shields.io/badge/WiseSpend-v2.1.0-blue.svg)
![Status](https://img.shields.io/badge/Status-Activo-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**WiseSpend** es una aplicación web completa para el control y gestión de gastos familiares, desarrollada con tecnologías modernas y funcionalidades avanzadas de inteligencia artificial.

## 🚀 Características Principales

### 💻 **Core de la Aplicación**
- ✅ **Sistema de Autenticación** con PBKDF2 y sesiones seguras
- ✅ **Dashboard Responsivo** con arquitectura modular limpia
- ✅ **Multi-moneda** (CLP, USD, EUR) con tasas de cambio actualizadas
- ✅ **Storage Inteligente** con auto-guardado cada 5 minutos
- ✅ **Temas Dinámicos** (claro, oscuro, pastel, automático)

### 💰 **Gestión Financiera**
- ✅ **Ingresos**: Tabla mejorada con edición inline y menú contextual
- ✅ **Gastos Fijos**: Administración de gastos recurrentes
- ✅ **Gastos Variables**: Control de gastos ocasionales  
- ✅ **Gastos Extras**: Sistema mejorado v2.2.0 con edición inline
- ✅ **Reportes Avanzados**: Gráficos, análisis y exportación

### 🎤 **Funcionalidades Avanzadas**
- ✅ **Sistema de Notas y Tareas**: Interfaz original de 2 columnas
- 🆕 **Recordatorios Automáticos**: Sistema de pagos y tareas
- 🆕 **Integración Completa**: WebSocket + Web Speech API

### 🎯 **Sistema de Notas v2.1.0**
- **Interfaz Original**: Layout de 2 columnas (Tareas | Recordatorios)
- **Dictado por Voz**: Web Speech API con fallback local
- **Comandos Inteligentes**: Procesamiento automático de texto a tareas
- **Storage Persistente**: Datos guardados localmente
- **Filtros y Categorías**: Organización por tipo y prioridad

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **HTML5/CSS3**: Interfaz moderna y responsiva
- **JavaScript ES6+**: Lógica de aplicación modular
- **Web Speech API**: Reconocimiento de voz nativo
- **Chart.js**: Gráficos y visualizaciones
- **Socket.IO Client**: Comunicación en tiempo real

- **PBKDF2**: Encriptación de contraseñas

### **Arquitectura**
- **Modular**: Componentes independientes y reutilizables
- **RESTful**: APIs bien estructuradas
- **Real-time**: Comunicación bidireccional
- **Progressive**: Funcionamiento offline/online

## 📦 Instalación

### **Prerrequisitos**
- Python 3.8 o superior
- Navegador moderno (Chrome, Firefox, Edge)
- Conexión a internet (para tasas de cambio)

### **Ejecución de la Aplicación**
```bash
# Opción 1: Servidor HTTP simple
python -m http.server 5500

# Opción 2: Live Server (VS Code)
# Instalar extensión Live Server y ejecutar

# Opción 3: Abrir directamente
# Abrir index.html en el navegador
```

## 🚦 Uso Rápido

### **1. Primer Inicio**
1. Abrir `index.html` en el navegador
2. Crear cuenta de usuario
3. Configurar moneda principal
4. ¡Comenzar a registrar gastos!

### **2. Funcionalidades Principales**
- **Dashboard**: Vista general de finanzas
- **Ingresos**: Registrar fuentes de dinero
- **Gastos**: Administrar todos los tipos de gastos
- **Notas**: Sistema de tareas con dictado por voz
- **Reportes**: Análisis y exportación de datos


## 🔧 Configuración


# Base de datos (futuro)
DATABASE_URL=sqlite:///wisespend.db
```

### **Configuración de Navegador**
- **Permisos de Micrófono**: Requerido para dictado por voz
- **JavaScript Habilitado**: Esencial para funcionamiento
- **Storage Local**: Para persistencia de datos

## 📁 Estructura del Proyecto

```
wisespend-app/
├── 📄 index.html              # Página de login
├── 📄 dashboard.html          # Dashboard principal
├── 📁 css/                    # Estilos de la aplicación
├── 📁 js/                     # Lógica JavaScript
├── 📁 components/             # Componentes HTML reutilizables
├── 📁 Varios/                 # Módulo de notas y herramientas
│   ├── 📁 js/
│   │   ├── notas.js          # Sistema de notas v2.1.0
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
2. Configurar servidor de voz
3. Ejecutar aplicación web
4. Desarrollo y testing
5. Commit y push

### **Funcionalidades en Desarrollo**
- 🔄 **Sincronización en la nube**
- 🔄 **API externa para tasas de cambio**
- 🔄 **Notificaciones push**
- 🔄 **Modo offline avanzado**
- 🔄 **Exportación a PDF/Excel**

## 🐛 Resolución de Problemas

### **Datos no se Guardan**
- ✅ Verificar storage local del navegador
- ✅ Permisos de JavaScript habilitados
- ✅ Auto-guardado cada 5 minutos activo

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
- **Python**: PEP 8
- **Commits**: Conventional Commits

## 📊 Roadmap

### **v2.2.0** (Próximo)
- [ ] Integración con APIs bancarias
- [ ] Notificaciones inteligentes
- [ ] Dashboard predictivo con IA

### **v3.0.0** (Futuro)
- [ ] Aplicación móvil nativa
- [ ] Sincronización multi-dispositivo
- [ ] Análisis financiero avanzado

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para detalles.

## 👨‍💻 Autor

**Norman Osses** - *Desarrollador Principal*
- GitHub: [@norman-admin](https://github.com/norman-admin)
- Proyecto: [WiseSpend](https://github.com/norman-admin/wisespend-app)

## 🙏 Agradecimientos

- Comunidad de desarrolladores JavaScript
- Documentación de Web Speech API
- Flask y Socket.IO communities
- Usuarios beta testers

---

### 💡 ¿Necesitas Ayuda?

Si encuentras algún problema o tienes sugerencias:

1. **Issues**: [Crear nuevo issue](https://github.com/norman-admin/wisespend-app/issues)
2. **Documentación**: Revisar este README
3. **Debug**: Usar `window.debugDashboard` en consola

**¡Gracias por usar WiseSpend! 💰✨**