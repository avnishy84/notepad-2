// Readonly Component
export class Readonly {
    constructor() {
        this.documentList = document.getElementById('documentList');
        this.documentViewer = document.getElementById('documentViewer');
        this.documentContent = document.getElementById('documentContent');
        this.noDocuments = document.getElementById('noDocuments');
        this.downloadBtn = document.getElementById('downloadDocument');
        this.printBtn = document.getElementById('printDocument');

        this.documents = {};
        this.selectedDocument = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDocuments();
    }

    setupEventListeners() {
        // Download button
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadDocument());
        }

        // Print button
        if (this.printBtn) {
            this.printBtn.addEventListener('click', () => this.printDocument());
        }
    }

    async loadDocuments() {
        if (!window.auth || !window.auth.currentUser || !window.db) {
            this.showNoDocuments();
            return;
        }

        try {
            const docRef = window.doc(window.db, "users", window.auth.currentUser.uid);
            const docSnap = await window.getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.notes && Object.keys(data.notes).length > 0) {
                    // Filter out metadata fields and sort notes
                    const noteNames = Object.keys(data.notes).filter(key => !key.endsWith('_updateTime'));
                    const sortedNoteNames = noteNames.sort();

                    this.documents = {};
                    sortedNoteNames.forEach(name => {
                        this.documents[name] = data.notes[name];
                    });

                    this.renderDocumentList();
                } else {
                    this.showNoDocuments();
                }
            } else {
                this.showNoDocuments();
            }
        } catch (err) {
            console.error("Error loading documents:", err);
            this.showNoDocuments();
        }
    }

    renderDocumentList() {
        if (!this.documentList) return;

        const documentKeys = Object.keys(this.documents);
        
        if (documentKeys.length === 0) {
            this.showNoDocuments();
            return;
        }

        this.documentList.innerHTML = '';
        this.noDocuments.style.display = 'none';

        documentKeys.forEach(docName => {
            const docItem = this.createDocumentItem(docName, this.documents[docName]);
            this.documentList.appendChild(docItem);
        });
    }

    createDocumentItem(name, content) {
        const item = document.createElement('div');
        item.className = 'document-item';
        item.dataset.documentName = name;

        // Create preview text
        const preview = this.createPreview(content);
        
        // Get last modified date (if available)
        const lastModified = this.getLastModified(name);

        item.innerHTML = `
            <div class="document-name">${this.escapeHtml(name)}</div>
            <div class="document-preview">${preview}</div>
            <div class="document-meta">
                <span>${lastModified}</span>
                <span>${this.getWordCount(content)} words</span>
            </div>
        `;

        item.addEventListener('click', () => this.selectDocument(name));
        
        return item;
    }

    createPreview(content) {
        if (!content || content.trim() === '') {
            return '<em>Empty document</em>';
        }

        // Create a temporary div to parse HTML content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        
        // Get plain text content
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        // Truncate to 150 characters
        const truncated = plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
        
        return this.escapeHtml(truncated);
    }

    getLastModified(name) {
        // Try to get update time from metadata
        if (window.auth && window.auth.currentUser && window.db) {
            // This would need to be implemented in the data structure
            // For now, return a placeholder
            return 'Recently modified';
        }
        return 'Unknown date';
    }

    getWordCount(content) {
        if (!content || content.trim() === '') {
            return 0;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    selectDocument(name) {
        // Update selected state
        const items = this.documentList.querySelectorAll('.document-item');
        items.forEach(item => item.classList.remove('selected'));
        
        const selectedItem = this.documentList.querySelector(`[data-document-name="${name}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        this.selectedDocument = name;
        this.displayDocument(name);
    }

    displayDocument(name) {
        if (!this.documentContent || !this.documents[name]) return;

        const content = this.documents[name];
        
        if (!content || content.trim() === '') {
            this.documentContent.innerHTML = `
                <div class="empty">
                    <i class="fas fa-file-alt"></i>
                    <p>This document is empty</p>
                </div>
            `;
            return;
        }

        // Display the HTML content
        this.documentContent.innerHTML = content;
        
        // Update viewer actions state
        this.updateViewerActions(true);
    }

    updateViewerActions(hasContent) {
        if (this.downloadBtn) {
            this.downloadBtn.disabled = !hasContent || !this.selectedDocument;
        }
        if (this.printBtn) {
            this.printBtn.disabled = !hasContent || !this.selectedDocument;
        }
    }

    downloadDocument() {
        if (!this.selectedDocument || !this.documents[this.selectedDocument]) {
            return;
        }

        const content = this.documents[this.selectedDocument];
        const blob = new Blob([content], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${this.selectedDocument}.html`;
        link.click();
    }

    printDocument() {
        if (!this.selectedDocument || !this.documents[this.selectedDocument]) {
            return;
        }

        const content = this.documents[this.selectedDocument];
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${this.selectedDocument}</title>
                <style>
                    body {
                        font-family: Inter, Arial, sans-serif;
                        line-height: 1.6;
                        max-width: 800px;
                        margin: 0 auto;
                        padding: 20px;
                        color: #333;
                    }
                    h1, h2, h3 {
                        color: #333;
                        margin-top: 24px;
                        margin-bottom: 16px;
                    }
                    h1 {
                        font-size: 28px;
                        border-bottom: 2px solid #ddd;
                        padding-bottom: 8px;
                    }
                    h2 {
                        font-size: 24px;
                    }
                    h3 {
                        font-size: 20px;
                    }
                    p {
                        margin-bottom: 16px;
                    }
                    ul, ol {
                        margin-bottom: 16px;
                        padding-left: 24px;
                    }
                    blockquote {
                        border-left: 4px solid #007bff;
                        padding-left: 16px;
                        margin: 16px 0;
                        color: #666;
                        font-style: italic;
                    }
                    pre {
                        background: #f8f9fa;
                        padding: 16px;
                        border-radius: 8px;
                        overflow-x: auto;
                        margin: 16px 0;
                        border: 1px solid #ddd;
                    }
                    code {
                        background: #f8f9fa;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-family: 'Courier New', monospace;
                        font-size: 14px;
                    }
                    pre code {
                        background: none;
                        padding: 0;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 20px;
                        }
                    }
                </style>
            </head>
            <body>
                <h1>${this.escapeHtml(this.selectedDocument)}</h1>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    showNoDocuments() {
        if (this.documentList) {
            this.documentList.innerHTML = '';
        }
        if (this.noDocuments) {
            this.noDocuments.style.display = 'block';
        }
        if (this.documentContent) {
            this.documentContent.innerHTML = `
                <div class="empty">
                    <i class="fas fa-eye"></i>
                    <p>Select a document from the list above to view it here</p>
                </div>
            `;
        }
        this.updateViewerActions(false);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Method to refresh documents (called when user logs in)
    refreshDocuments() {
        this.loadDocuments();
    }

    // Method to clear documents (called when user logs out)
    clearDocuments() {
        this.documents = {};
        this.selectedDocument = null;
        this.showNoDocuments();
    }

    // Expose methods to global scope
    exposeToGlobal() {
        window.refreshReadonlyDocuments = () => this.refreshDocuments();
        window.clearReadonlyDocuments = () => this.clearDocuments();
    }
}
