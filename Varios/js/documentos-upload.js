/**
 * 📤 DOCUMENTOS UPLOAD SYSTEM - Sistema de Subida Real
 * WiseSpend - Control de Gastos Familiares
 * Versión: 1.0.0 - LocalStorage con preparación para BD
 * 
 * 🎯 FUNCIONALIDADES:
 * ✅ Modal coherente con diseño existente
 * ✅ Subida real de archivos con FileReader API
 * ✅ Almacenamiento en localStorage (base64)
 * ✅ Validación de tipos y tamaños
 * ✅ Preparado para migrar a base de datos
 * ✅ Soporte para todos los formatos comunes
 */

class DocumentUploadSystem {
    constructor(documentosManager) {
        this.documentosManager = documentosManager;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB máximo
        this.allowedTypes = {
            // Documentos
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'rtf': 'application/rtf',
            
            // Imágenes
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            
            // Archivos comprimidos
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            
            // Otros
            'csv': 'text/csv',
            'json': 'application/json',
            'xml': 'application/xml'
        };
        
        this.currentModal = null;
        console.log('📤 DocumentUploadSystem inicializado');
    }

    /**
     * 🚀 Mostrar modal de subida
     */
    showUploadModal(folderId = null) {
        const targetFolder = folderId || (this.documentosManager.currentFolder ? this.documentosManager.currentFolder.id : null);
        
        if (!targetFolder) {
            this.showAlert('❌ Error', 'Por favor selecciona una carpeta primero');
            return;
        }

        const folder = this.documentosManager.folders.find(f => f.id === targetFolder);
        if (!folder) {
            this.showAlert('❌ Error', 'Carpeta no encontrada');
            return;
        }

        this.createUploadModal(folder);
    }

    /**
     * 🎨 Crear modal de subida coherente
     */
    createUploadModal(folder) {
        // Remover modal anterior si existe
        this.removeCurrentModal();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal-content-upload">
                <div class="modal-header-upload">
                    <h3>📤 Subir Documento</h3>
                    <span class="folder-target">${folder.icon} ${folder.name}</span>
                    <button class="close-btn-upload" onclick="documentUploadSystem.closeModal()">✕</button>
                </div>
                
                <div class="modal-body-upload">
                    <!-- Zona de arrastre -->
                    <div class="drop-zone" id="dropZone">
                        <div class="drop-zone-content">
                            <div class="upload-icon">📁</div>
                            <div class="upload-text">
                                <strong>Arrastra archivos aquí</strong><br>
                                o haz clic para seleccionar
                            </div>
                            <input type="file" id="fileInput" multiple accept="${this.getAcceptString()}" style="display: none;">
                        </div>
                    </div>
                    
                    <!-- Información de tipos permitidos -->
                    <div class="file-info">
                        <div class="info-row">
                            <span class="info-label">📋 Formatos:</span>
                            <span class="info-value">PDF, DOC, XLS, PPT, Imágenes, TXT, ZIP y más</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">📦 Tamaño máx:</span>
                            <span class="info-value">10 MB por archivo</span>
                        </div>
                    </div>
                    
                    <!-- Lista de archivos seleccionados -->
                    <div class="files-list" id="filesList" style="display: none;">
                        <h4>Archivos seleccionados:</h4>
                        <div class="files-container" id="filesContainer">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer-upload">
                    <button class="btn-upload-cancel" onclick="documentUploadSystem.closeModal()">
                        Cancelar
                    </button>
                    <button class="btn-upload-confirm" id="uploadBtn" disabled onclick="documentUploadSystem.processUpload('${folder.id}')">
                        📤 Subir Documentos
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);
        this.currentModal = modalOverlay;

        // Configurar eventos
        this.setupModalEvents(folder.id);

        // Mostrar con animación
        setTimeout(() => modalOverlay.classList.add('active'), 10);
    }

    /**
     * 🎯 Configurar eventos del modal
     */
    setupModalEvents(folderId) {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        // Eventos de drag & drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files, folderId);
        });

        // Click para abrir selector
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // Cambio en input file
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files, folderId);
        });

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });

        // Cerrar clickeando fuera
        this.currentModal.addEventListener('click', (e) => {
            if (e.target === this.currentModal) {
                this.closeModal();
            }
        });
    }

    /**
     * 📂 Manejar archivos seleccionados
     */
    async handleFiles(files, folderId) {
        const validFiles = [];
        const errors = [];

        for (let file of files) {
            const validation = this.validateFile(file);
            if (validation.valid) {
                validFiles.push(file);
            } else {
                errors.push(`${file.name}: ${validation.error}`);
            }
        }

        if (errors.length > 0) {
            this.showAlert('⚠️ Algunos archivos no son válidos', errors.join('\n'));
        }

        if (validFiles.length > 0) {
            await this.displaySelectedFiles(validFiles, folderId);
        }
    }

    /**
     * ✅ Validar archivo
     */
    validateFile(file) {
        // Validar tamaño
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `Archivo muy grande (máx. ${this.maxFileSize / 1024 / 1024}MB)`
            };
        }

        // Validar tipo
        const extension = file.name.split('.').pop().toLowerCase();
        const mimeType = this.allowedTypes[extension];
        
        if (!mimeType || (file.type && file.type !== mimeType)) {
            return {
                valid: false,
                error: 'Tipo de archivo no permitido'
            };
        }

        return { valid: true };
    }

    /**
     * 📋 Mostrar archivos seleccionados
     */
    async displaySelectedFiles(files, folderId) {
        const filesList = document.getElementById('filesList');
        const filesContainer = document.getElementById('filesContainer');
        const uploadBtn = document.getElementById('uploadBtn');

        filesContainer.innerHTML = '';
        
        for (let file of files) {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info-item">
                    <span class="file-icon">${this.getFileIcon(file.name)}</span>
                    <div class="file-details">
                        <div class="file-name">${file.name}</div>
                        <div class="file-size">${this.formatFileSize(file.size)}</div>
                    </div>
                    <button class="file-remove" onclick="documentUploadSystem.removeFile('${file.name}')">✕</button>
                </div>
            `;
            filesContainer.appendChild(fileItem);
        }

        filesList.style.display = 'block';
        uploadBtn.disabled = false;
        
        // Guardar archivos temporalmente
        this.selectedFiles = files;
    }

    /**
     * 📤 Procesar subida de archivos
     */
    async processUpload(folderId) {
        if (!this.selectedFiles || this.selectedFiles.length === 0) {
            this.showAlert('❌ Error', 'No hay archivos seleccionados');
            return;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '⏳ Subiendo...';

        try {
            const uploadedDocuments = [];
            
            for (let file of this.selectedFiles) {
                const document = await this.uploadFile(file, folderId);
                uploadedDocuments.push(document);
            }

            // Guardar en localStorage
            await this.saveDocumentsToStorage(uploadedDocuments, folderId);

            // Mostrar éxito y cerrar modal
            this.showAlert('✅ Éxito', `${uploadedDocuments.length} documento(s) subido(s) correctamente`);
            this.closeModal();

            // Recargar vista actual
            if (this.documentosManager.currentFolder && this.documentosManager.currentFolder.id === folderId) {
                await this.documentosManager.showFolderDocuments(this.documentosManager.currentFolder);
            } else {
                this.documentosManager.showFoldersView();
            }

        } catch (error) {
            console.error('❌ Error subiendo archivos:', error);
            this.showAlert('❌ Error', 'Error al subir los archivos. Inténtalo de nuevo.');
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '📤 Subir Documentos';
        }
    }

    /**
     * 📄 Subir archivo individual
     */
    async uploadFile(file, folderId) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const document = {
                    id: this.generateDocumentId(),
                    name: file.name,
                    type: file.name.split('.').pop().toLowerCase(),
                    size: file.size,
                    mimeType: file.type,
                    dateAdded: new Date().toISOString(),
                    folderId: folderId,
                    content: e.target.result, // Base64 content
                    // Metadatos para futura migración a BD
                    metadata: {
                        originalName: file.name,
                        lastModified: file.lastModified,
                        uploadedBy: 'current_user', // Aquí irá el usuario actual
                        tags: [],
                        description: ''
                    }
                };
                
                resolve(document);
            };
            
            reader.onerror = () => {
                reject(new Error(`Error leyendo archivo: ${file.name}`));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * 💾 Guardar documentos en localStorage
     */
    async saveDocumentsToStorage(documents, folderId) {
        const data = this.documentosManager.getStorageData();
        
        if (!data.folders[folderId]) {
            data.folders[folderId] = {
                documents: [],
                lastUpdated: null
            };
        }

        // Agregar nuevos documentos
        data.folders[folderId].documents = data.folders[folderId].documents || [];
        data.folders[folderId].documents.push(...documents);
        data.folders[folderId].lastUpdated = new Date().toISOString();

        // Guardar
        this.documentosManager.saveStorageData(data);
        
        console.log(`✅ ${documents.length} documentos guardados en carpeta ${folderId}`);
    }

    /**
     * 🆔 Generar ID único para documento
     */
    generateDocumentId() {
        return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 🎭 Obtener string de tipos aceptados para input
     */
    getAcceptString() {
        return Object.values(this.allowedTypes).join(',');
    }

    /**
     * 🎯 Obtener ícono de archivo
     */
    getFileIcon(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const icons = {
            // Documentos
            pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
            ppt: '📽️', pptx: '📽️', txt: '📄', rtf: '📝',
            
            // Imágenes
            jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️',
            bmp: '🖼️', webp: '🖼️', svg: '🖼️',
            
            // Archivos comprimidos
            zip: '📦', rar: '📦', '7z': '📦',
            
            // Otros
            csv: '📊', json: '📄', xml: '📄'
        };
        return icons[extension] || '📎';
    }

    /**
     * 📏 Formatear tamaño de archivo
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * ❌ Cerrar modal
     */
    closeModal() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            setTimeout(() => {
                this.removeCurrentModal();
            }, 200);
        }
    }

    /**
     * 🗑️ Remover modal del DOM
     */
    removeCurrentModal() {
        if (this.currentModal) {
            document.body.removeChild(this.currentModal);
            this.currentModal = null;
            this.selectedFiles = null;
        }
    }

    /**
     * 🚨 Mostrar alerta
     */
    showAlert(title, message) {
        // Usando el sistema de alertas nativo por simplicidad
        // En producción se puede usar el modal system existente
        alert(`${title}\n\n${message}`);
    }

    /**
     * 🗑️ Remover archivo de la selección
     */
    removeFile(fileName) {
        if (this.selectedFiles) {
            this.selectedFiles = Array.from(this.selectedFiles).filter(file => file.name !== fileName);
            
            if (this.selectedFiles.length === 0) {
                document.getElementById('filesList').style.display = 'none';
                document.getElementById('uploadBtn').disabled = true;
            } else {
                // Re-mostrar archivos actualizados
                this.displaySelectedFiles(this.selectedFiles, this.documentosManager.currentFolder?.id);
            }
        }
    }
}

// CSS para el modal (se inyecta dinámicamente)
const uploadModalStyles = `
    <style id="upload-modal-styles">
        /* ===== MODAL DE SUBIDA - COHERENTE CON DISEÑO EXISTENTE ===== */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 2000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        
        .modal-overlay.active {
            opacity: 1;
        }
        
        .modal-content-upload {
            background: white;
            border-radius: 12px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            transform: scale(0.95);
            transition: transform 0.2s ease;
        }
        
        .modal-overlay.active .modal-content-upload {
            transform: scale(1);
        }
        
        /* ===== HEADER ===== */
        .modal-header-upload {
            background: #3b82f6;
            padding: 20px 24px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-header-upload h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        
        .folder-target {
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 14px;
        }
        
        .close-btn-upload {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
        }
        
        /* ===== BODY ===== */
        .modal-body-upload {
            padding: 24px;
        }
        
        .drop-zone {
            border: 2px dashed #d1d5db;
            border-radius: 12px;
            padding: 48px 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f9fafb;
        }
        
        .drop-zone:hover, .drop-zone.dragover {
            border-color: #3b82f6;
            background: #eff6ff;
        }
        
        .upload-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        
        .upload-text {
            color: #6b7280;
            line-height: 1.5;
        }
        
        .file-info {
            margin-top: 20px;
            padding: 16px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .info-row:last-child {
            margin-bottom: 0;
        }
        
        .info-label {
            font-weight: 500;
            color: #374151;
        }
        
        .info-value {
            color: #6b7280;
        }
        
        /* ===== LISTA DE ARCHIVOS ===== */
        .files-list {
            margin-top: 20px;
        }
        
        .files-list h4 {
            margin: 0 0 12px 0;
            font-size: 16px;
            color: #374151;
        }
        
        .files-container {
            max-height: 200px;
            overflow-y: auto;
        }
        
        .file-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 8px;
        }
        
        .file-info-item {
            display: flex;
            align-items: center;
            padding: 12px 16px;
            gap: 12px;
        }
        
        .file-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .file-details {
            flex: 1;
        }
        
        .file-name {
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
        }
        
        .file-size {
            font-size: 12px;
            color: #6b7280;
        }
        
        .file-remove {
            background: #fee2e2;
            color: #dc2626;
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 14px;
        }
        
        /* ===== FOOTER ===== */
        .modal-footer-upload {
            padding: 20px 24px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
        }
        
        .btn-upload-cancel {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
        }
        
        .btn-upload-confirm {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        }
        
        .btn-upload-confirm:disabled {
            background: #9ca3af;
            cursor: not-allowed;
        }
    </style>
`;

// Inyectar estilos
if (!document.querySelector('#upload-modal-styles')) {
    document.head.insertAdjacentHTML('beforeend', uploadModalStyles);
}

// Exponer globalmente
window.DocumentUploadSystem = DocumentUploadSystem;