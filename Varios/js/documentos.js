/**
 * 📄 DOCUMENTOS.JS - Sistema de Gestión de Documentos COMPLETO
 * WiseSpend - Control de Gastos Familiares
 * Versión: 1.0.0 - Sistema Funcional con Subida Real
 * 
 * 🎯 FUNCIONALIDADES COMPLETAS:
 * ✅ Sistema de carpetas organizacionales
 * ✅ Navegación entre carpetas
 * ✅ Contadores de documentos
 * ✅ Breadcrumb de navegación
 * ✅ Estados vacíos y con contenido
 * ✅ Subida real de archivos
 * ✅ Ver, descargar y eliminar documentos
 * ✅ Modal para vista de imágenes
 * ✅ Datos de prueba incluidos
 */

class DocumentosManager {
    constructor() {
        this.version = '1.0.0';
        this.currentFolder = null;
        this.currentView = 'folders';
        this.container = null;
        this.initialized = false;
        this.uploadSystem = null;
        
        this.folders = [
            {
                id: 'facturas',
                name: 'Facturas',
                icon: '📋',
                description: 'Luz, Agua, Gas, Internet',
                color: '#3b82f6'
            },
            {
                id: 'hogar',
                name: 'Hogar',
                icon: '🏠',
                description: 'Arriendo, Seguros, Mantención',
                color: '#10b981'
            },
            {
                id: 'medicos',
                name: 'Médicos',
                icon: '🏥',
                description: 'Exámenes, Recetas, Seguros Salud',
                color: '#ef4444'
            },
            {
                id: 'vehiculos',
                name: 'Vehículos',
                icon: '🚗',
                description: 'Revisiones, Seguros, Patente',
                color: '#f59e0b'
            },
            {
                id: 'trabajo',
                name: 'Trabajo',
                icon: '💼',
                description: 'Contratos, Certificados',
                color: '#8b5cf6'
            },
            {
                id: 'educacion',
                name: 'Educación',
                icon: '🎓',
                description: 'Notas, Certificados',
                color: '#06b6d4'
            },
            {
                id: 'legal',
                name: 'Legal',
                icon: '📑',
                description: 'Contratos, Testamentos',
                color: '#84cc16'
            },
            {
                id: 'financiero',
                name: 'Financiero',
                icon: '💰',
                description: 'Estados, Inversiones',
                color: '#f97316'
            }
        ];
        
        console.log(`📄 DocumentosManager v${this.version}: Inicializando...`);
    }

    async init(containerId = 'varios-content') {
        try {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                throw new Error(`Container ${containerId} no encontrado`);
            }

            await this.loadDocumentosCSS();
            this.renderMainInterface();
            this.setupEventListeners();
            await this.loadDocumentosData();
            
            this.initialized = true;
            console.log('✅ DocumentosManager: Sistema inicializado correctamente');
            
        } catch (error) {
            console.error('❌ DocumentosManager: Error en inicialización:', error);
            this.showError('Error al cargar el sistema de documentos');
        }
    }

    async loadDocumentosCSS() {
        const existingLink = document.querySelector('link[href*="documentos.css"]');
        if (existingLink) {
            console.log('📄 CSS documentos.css ya está cargado');
            return;
        }

        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'varios/css/documentos.css';
            link.onload = () => {
                console.log('✅ CSS documentos.css cargado');
                resolve();
            };
            link.onerror = () => {
                console.error('❌ Error cargando documentos.css');
                reject(new Error('No se pudo cargar documentos.css'));
            };
            document.head.appendChild(link);
        });
    }

    renderMainInterface() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="documentos-container">
                <div class="documentos-header">
                    <div class="documentos-title">
                        📄 Gestión de Documentos
                    </div>
                    <div class="documentos-actions">
                        <button class="btn-documento" id="subirDocumentoBtn">
                            📎 Subir Documento
                        </button>
                        <button class="btn-documento secondary" id="crearCarpetaBtn" style="display: none;">
                            📁 Nueva Carpeta
                        </button>
                    </div>
                </div>

                <div class="documentos-breadcrumb" id="documentosBreadcrumb"></div>

                <div class="documentos-content" id="documentosContent"></div>
            </div>
        `;

        this.showFoldersView();
        this.updateBreadcrumb();
    }

    showFoldersView() {
        const content = document.getElementById('documentosContent');
        if (!content) return;

        this.currentView = 'folders';
        this.currentFolder = null;

        content.innerHTML = `
            <div class="carpetas-grid" id="carpetasGrid">
                ${this.folders.map(folder => this.renderFolderCard(folder)).join('')}
            </div>
        `;

        this.animateCardsEntrance();
    }

    renderFolderCard(folder) {
        const documentCount = this.getDocumentCount(folder.id);
        const hasDocuments = documentCount > 0;
        const isRecentlyUpdated = this.isFolderRecentlyUpdated(folder.id);

        return `
            <div class="carpeta-card ${hasDocuments ? 'has-documents' : 'empty'} ${isRecentlyUpdated ? 'recently-updated' : ''}" 
                 data-folder-id="${folder.id}"
                 onclick="documentosManager.openFolder('${folder.id}')">
                <div class="carpeta-icon">${folder.icon}</div>
                <div class="carpeta-info">
                    <div class="carpeta-name">${folder.name}</div>
                    <div class="carpeta-count">
                        <span class="carpeta-count-number ${documentCount === 0 ? 'empty' : ''}">${documentCount}</span>
                        <span>documentos</span>
                    </div>
                </div>
            </div>
        `;
    }

    async openFolder(folderId) {
        try {
            const folder = this.folders.find(f => f.id === folderId);
            if (!folder) {
                throw new Error(`Carpeta ${folderId} no encontrada`);
            }

            this.currentFolder = folder;
            this.currentView = 'documents';
            
            await this.showFolderDocuments(folder);
            this.updateBreadcrumb();
            
            console.log(`📂 Carpeta abierta: ${folder.name}`);
            
        } catch (error) {
            console.error('❌ Error abriendo carpeta:', error);
            this.showError(`Error al abrir la carpeta ${folderId}`);
        }
    }

    async showFolderDocuments(folder) {
        const content = document.getElementById('documentosContent');
        if (!content) return;

        const documents = await this.getFolderDocuments(folder.id);
        
        if (documents.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${folder.icon}</div>
                    <div class="empty-state-title">Carpeta "${folder.name}" vacía</div>
                    <div class="empty-state-message">
                        Aún no hay documentos en esta carpeta.<br>
                        Comienza subiendo tu primer documento.
                    </div>
                    <button class="btn-documento" onclick="documentosManager.uploadDocument('${folder.id}')">
                        📎 Subir Primer Documento
                    </button>
                </div>
            `;
        } else {
            content.innerHTML = `
                <div class="documentos-list">
                    <div class="documentos-list-header">
                        <span>Documentos en ${folder.name}</span>
                        <span>${documents.length} archivos</span>
                    </div>
                    ${documents.map(doc => this.renderDocumentItem(doc)).join('')}
                </div>
            `;
        }
    }

    renderDocumentItem(document) {
        const fileIcon = this.getFileIcon(document.type);
        const formattedDate = new Date(document.dateAdded).toLocaleDateString('es-CL');
        const fileSize = this.formatFileSize(document.size);

        return `
            <div class="documento-item" data-document-id="${document.id}" onclick="documentosManager.viewDocument('${document.id}')">
                <div class="documento-icon">${fileIcon}</div>
                <div class="documento-info">
                    <div class="documento-name">${document.name}</div>
                    <div class="documento-meta">
                        <span>📅 ${formattedDate}</span>
                        <span>📦 ${fileSize}</span>
                        <span>🏷️ ${document.type.toUpperCase()}</span>
                    </div>
                </div>
                <div class="documento-actions">
                    <button class="doc-action-btn" onclick="event.stopPropagation(); documentosManager.downloadDocument('${document.id}')" title="Descargar">
                        ⬇️
                    </button>
                    <button class="doc-action-btn delete" onclick="event.stopPropagation(); documentosManager.deleteDocument('${document.id}')" title="Eliminar">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }

    viewDocument(documentId) {
        const document = this.findDocumentById(documentId);
        if (!document) {
            alert('Documento no encontrado');
            return;
        }

        if (document.type.match(/(jpg|jpeg|png|gif|bmp|webp)/i)) {
            this.showImageModal(document);
        } else {
            try {
                const newWindow = window.open();
                newWindow.document.write(`
                    <html>
                        <head><title>${document.name}</title></head>
                        <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f5f5;">
                            <iframe src="${document.content}" style="width:100%; height:100vh; border:none;"></iframe>
                        </body>
                    </html>
                `);
            } catch (error) {
                console.error('Error abriendo documento:', error);
                this.downloadDocument(documentId);
            }
        }
    }

    showImageModal(document) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content-image">
                <div class="modal-header-image">
                    <h3>${document.name}</h3>
                    <button class="close-btn-image" onclick="this.closest('.modal-overlay').remove()">✕</button>
                </div>
                <div class="modal-body-image">
                    <img src="${document.content}" alt="${document.name}" style="max-width:100%; max-height:70vh; object-fit:contain;">
                </div>
                <div class="modal-footer-image">
                    <button onclick="documentosManager.downloadDocument('${document.id}')">⬇️ Descargar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        setTimeout(() => modalOverlay.classList.add('active'), 10);

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }

    downloadDocument(documentId) {
        const document = this.findDocumentById(documentId);
        if (!document) {
            alert('Documento no encontrado');
            return;
        }

        try {
            const link = document.createElement('a');
            link.href = document.content;
            link.download = document.name;
            link.click();
            
            console.log(`⬇️ Descargando: ${document.name}`);
        } catch (error) {
            console.error('Error descargando documento:', error);
            alert('Error al descargar el documento');
        }
    }

    deleteDocument(documentId) {
        const document = this.findDocumentById(documentId);
        if (!document) {
            alert('Documento no encontrado');
            return;
        }

        if (!confirm(`¿Estás seguro de eliminar "${document.name}"?`)) {
            return;
        }

        try {
            const data = this.getStorageData();
            
            Object.keys(data.folders).forEach(folderId => {
                if (data.folders[folderId].documents) {
                    data.folders[folderId].documents = data.folders[folderId].documents.filter(
                        doc => doc.id !== documentId
                    );
                    data.folders[folderId].lastUpdated = new Date().toISOString();
                }
            });

            this.saveStorageData(data);
            
            if (this.currentFolder) {
                this.showFolderDocuments(this.currentFolder);
            } else {
                this.showFoldersView();
            }
            
            console.log(`🗑️ Documento eliminado: ${document.name}`);
            
        } catch (error) {
            console.error('Error eliminando documento:', error);
            alert('Error al eliminar el documento');
        }
    }

    findDocumentById(documentId) {
        const data = this.getStorageData();
        
        for (const folderId of Object.keys(data.folders)) {
            const folder = data.folders[folderId];
            if (folder.documents) {
                const document = folder.documents.find(doc => doc.id === documentId);
                if (document) {
                    return document;
                }
            }
        }
        
        return null;
    }

    updateBreadcrumb() {
        const breadcrumb = document.getElementById('documentosBreadcrumb');
        if (!breadcrumb) return;

        let breadcrumbHTML = `
            <div class="breadcrumb-item ${!this.currentFolder ? 'active' : ''}" 
                 onclick="documentosManager.showFoldersView()">
                <span>📁 Todas las carpetas</span>
            </div>
        `;

        if (this.currentFolder) {
            breadcrumbHTML += `
                <span class="breadcrumb-separator">›</span>
                <div class="breadcrumb-item active">
                    <span>${this.currentFolder.icon} ${this.currentFolder.name}</span>
                </div>
            `;
        }

        breadcrumb.innerHTML = breadcrumbHTML;
    }

    getDocumentCount(folderId) {
        const data = this.getStorageData();
        if (!data.folders || !data.folders[folderId]) {
            return 0;
        }
        return data.folders[folderId].documents ? data.folders[folderId].documents.length : 0;
    }

    isFolderRecentlyUpdated(folderId) {
        const data = this.getStorageData();
        if (!data.folders || !data.folders[folderId] || !data.folders[folderId].lastUpdated) {
            return false;
        }
        
        const lastUpdate = new Date(data.folders[folderId].lastUpdated);
        const now = new Date();
        const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
        
        return hoursDiff < 24;
    }

    async getFolderDocuments(folderId) {
        const data = this.getStorageData();
        if (!data.folders || !data.folders[folderId] || !data.folders[folderId].documents) {
            return [];
        }
        return data.folders[folderId].documents;
    }

    getFileIcon(fileType) {
        const icons = {
            pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
            jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
            txt: '📄', zip: '📦', rar: '📦'
        };
        return icons[fileType.toLowerCase()] || '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getStorageData() {
        try {
            const data = localStorage.getItem('wisespend_documentos');
            return data ? JSON.parse(data) : { folders: {} };
        } catch (error) {
            console.error('❌ Error leyendo datos de documentos:', error);
            return { folders: {} };
        }
    }

    saveStorageData(data) {
        try {
            localStorage.setItem('wisespend_documentos', JSON.stringify(data));
            console.log('✅ Datos de documentos guardados');
        } catch (error) {
            console.error('❌ Error guardando datos de documentos:', error);
        }
    }

    async loadDocumentosData() {
        try {
            const data = this.getStorageData();
            console.log(`📊 Datos cargados: ${Object.keys(data.folders).length} carpetas`);
        } catch (error) {
            console.error('❌ Error cargando datos de documentos:', error);
        }
    }

    animateCardsEntrance() {
        const cards = document.querySelectorAll('.carpeta-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupEventListeners() {
        const subirBtn = document.getElementById('subirDocumentoBtn');
        if (subirBtn) {
            subirBtn.addEventListener('click', () => {
                this.uploadDocument();
            });
        }

        const crearBtn = document.getElementById('crearCarpetaBtn');
        if (crearBtn) {
            crearBtn.addEventListener('click', () => {
                this.createCustomFolder();
            });
        }
    }

    uploadDocument(folderId = null) {
        const targetFolder = folderId || (this.currentFolder ? this.currentFolder.id : null);
        
        if (!targetFolder) {
            alert('Por favor, selecciona una carpeta primero');
            return;
        }

        if (!this.uploadSystem) {
            this.uploadSystem = new DocumentUploadSystem(this);
        }

        this.uploadSystem.showUploadModal(targetFolder);
        console.log(`📤 Modal de subida abierto para carpeta: ${targetFolder}`);
    }

    createCustomFolder() {
        alert('🚀 Funcionalidad de carpetas personalizadas será implementada en versiones futuras');
        console.log('📁 Crear carpeta personalizada solicitada');
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div class="documentos-container">
                    <div class="varios-error">
                        <p>❌ ${message}</p>
                        <button onclick="documentosManager.init('varios-content')">🔄 Reintentar</button>
                    </div>
                </div>
            `;
        }
    }

    generateTestData() {
        const testData = {
            folders: {
                facturas: {
                    documents: [
                        {
                            id: 'fact001',
                            name: 'Factura_Luz_Enero_2025.pdf',
                            type: 'pdf',
                            size: 245760,
                            dateAdded: '2025-01-15T10:30:00Z',
                            folderId: 'facturas',
                            content: 'data:application/pdf;base64,JVBERi0xLjQ=',
                            metadata: {
                                originalName: 'Factura_Luz_Enero_2025.pdf',
                                uploadedBy: 'usuario_test',
                                tags: ['factura', 'luz', 'enero'],
                                description: 'Factura de electricidad enero 2025'
                            }
                        },
                        {
                            id: 'fact002',
                            name: 'Recibo_Internet_Enero.pdf',
                            type: 'pdf',
                            size: 189440,
                            dateAdded: '2025-01-10T14:20:00Z',
                            folderId: 'facturas',
                            content: 'data:application/pdf;base64,JVBERi0xLjQ=',
                            metadata: {
                                originalName: 'Recibo_Internet_Enero.pdf',
                                uploadedBy: 'usuario_test',
                                tags: ['recibo', 'internet', 'enero'],
                                description: 'Recibo de internet enero 2025'
                            }
                        }
                    ],
                    lastUpdated: '2025-01-15T10:30:00Z'
                },
                hogar: {
                    documents: [
                        {
                            id: 'hogar001',
                            name: 'Contrato_Arriendo_2025.pdf',
                            type: 'pdf',
                            size: 1048576,
                            dateAdded: '2025-01-05T09:00:00Z',
                            folderId: 'hogar',
                            content: 'data:application/pdf;base64,JVBERi0xLjQ=',
                            metadata: {
                                originalName: 'Contrato_Arriendo_2025.pdf',
                                uploadedBy: 'usuario_test',
                                tags: ['contrato', 'arriendo', '2025'],
                                description: 'Contrato de arriendo vigente 2025'
                            }
                        },
                        {
                            id: 'hogar002',
                            name: 'Foto_Casa_Frente.jpg',
                            type: 'jpg',
                            size: 524288,
                            dateAdded: '2025-01-12T16:45:00Z',
                            folderId: 'hogar',
                            content: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
                            metadata: {
                                originalName: 'Foto_Casa_Frente.jpg',
                                uploadedBy: 'usuario_test',
                                tags: ['foto', 'casa', 'frente'],
                                description: 'Foto del frente de la casa'
                            }
                        }
                    ],
                    lastUpdated: '2025-01-12T16:45:00Z'
                },
                medicos: {
                    documents: [
                        {
                            id: 'med001',
                            name: 'Examen_Sangre_Enero.pdf',
                            type: 'pdf',
                            size: 350000,
                            dateAdded: '2025-01-08T11:30:00Z',
                            folderId: 'medicos',
                            content: 'data:application/pdf;base64,JVBERi0xLjQ=',
                            metadata: {
                                originalName: 'Examen_Sangre_Enero.pdf',
                                uploadedBy: 'usuario_test',
                                tags: ['examen', 'sangre', 'resultados'],
                                description: 'Resultados examen de sangre enero 2025'
                            }
                        }
                    ],
                    lastUpdated: '2025-01-08T11:30:00Z'
                },
                vehiculos: { documents: [], lastUpdated: null },
                trabajo: { documents: [], lastUpdated: null },
                educacion: { documents: [], lastUpdated: null },
                legal: { documents: [], lastUpdated: null },
                financiero: { documents: [], lastUpdated: null }
            }
        };
        
        this.saveStorageData(testData);
        console.log('🧪 Datos de prueba generados con contenido real');
        alert('✅ Datos de prueba generados!\n\nTienes documentos en:\n• Facturas (2 archivos)\n• Hogar (2 archivos)\n• Médicos (1 archivo)\n\nPrueba la funcionalidad de ver, descargar y eliminar.');
        return testData;
    }

    clearTestData() {
        localStorage.removeItem('wisespend_documentos');
        console.log('🧹 Datos de prueba eliminados');
        alert('🧹 Datos de documentos eliminados del localStorage');
    }

    getStats() {
        const data = this.getStorageData();
        const stats = {
            totalFolders: Object.keys(data.folders).length,
            totalDocuments: 0,
            foldersWithDocuments: 0,
            totalSize: 0
        };

        Object.values(data.folders).forEach(folder => {
            if (folder.documents && folder.documents.length > 0) {
                stats.foldersWithDocuments++;
                stats.totalDocuments += folder.documents.length;
                stats.totalSize += folder.documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
            }
        });

        return stats;
    }

    searchDocuments(query) {
        console.log(`🔍 Búsqueda solicitada: "${query}"`);
        return [];
    }
}

window.documentosManager = new DocumentosManager();

if (typeof window !== 'undefined') {
    window.debugDocumentos = {
        generateTestData: () => window.documentosManager.generateTestData(),
        clearTestData: () => window.documentosManager.clearTestData(),
        getStats: () => window.documentosManager.getStats(),
        showFolders: () => window.documentosManager.showFoldersView(),
        reload: () => window.documentosManager.init('varios-content')
    };
}

console.log('📄 DocumentosManager v1.0.0: Módulo cargado exitosamente');