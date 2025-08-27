// Toolbar Component
export class Toolbar {
    constructor() {
        this.toolbar = document.getElementById('toolbar');
        this.editor = document.getElementById('editor');
        this.fontColorPicker = document.getElementById('fontColorPicker');
        this.colorSwatch = document.getElementById('colorSwatch');
        
        // Font size constants
        this.MIN_FONT_PX = 12;
        this.MAX_FONT_PX = 48;
        this.FONT_STEP_PX = 2;
        this.DEFAULT_FONT_PX = 16;
        
        this.savedSelectionRange = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEditorFontSize();
        this.setupColorPicker();
        this.setupFontSizeWheel();
    }

    setupEventListeners() {
        // Color picker events
        if (this.fontColorPicker) {
            this.fontColorPicker.addEventListener('mousedown', () => this.saveCurrentSelectionRange());
            this.fontColorPicker.addEventListener('focus', () => this.saveCurrentSelectionRange());
            this.fontColorPicker.addEventListener('change', () => {
                if (this.colorSwatch) this.colorSwatch.style.backgroundColor = this.fontColorPicker.value;
                if (this.editor) this.editor.focus();
            });
        }

        // Selection change tracking
        document.addEventListener('selectionchange', () => {
            const active = document.activeElement;
            if (active === this.editor) {
                this.saveCurrentSelectionRange();
            }
        });
    }

    setupColorPicker() {
        const savedColor = localStorage.getItem('editorFontColor');
        if (this.fontColorPicker && savedColor) {
            this.fontColorPicker.value = savedColor;
            if (this.colorSwatch) this.colorSwatch.style.backgroundColor = savedColor;
        }
    }

    setupFontSizeWheel() {
        if (!this.editor) return;
        
        this.editor.addEventListener('wheel', (event) => {
            if (event.shiftKey) {
                event.preventDefault();
                if (event.deltaY < 0) {
                    this.increaseFontSize();
                } else if (event.deltaY > 0) {
                    this.decreaseFontSize();
                }
            }
        }, { passive: false });
    }

    // Font size methods
    applyEditorFontSize(px) {
        if (!this.editor) return;
        
        const clamped = Math.max(this.MIN_FONT_PX, Math.min(this.MAX_FONT_PX, px));
        this.editor.style.fontSize = clamped + 'px';
    }

    loadEditorFontSize() {
        const stored = localStorage.getItem('editorFontSizePx');
        const size = stored ? parseInt(stored, 10) : this.DEFAULT_FONT_PX;
        this.applyEditorFontSize(isNaN(size) ? this.DEFAULT_FONT_PX : size);
    }

    saveEditorFontSize(px) {
        localStorage.setItem('editorFontSizePx', String(px));
    }

    increaseFontSize() {
        if (!this.editor) return;
        
        const current = parseInt(window.getComputedStyle(this.editor).fontSize, 10) || this.DEFAULT_FONT_PX;
        const next = Math.min(current + this.FONT_STEP_PX, this.MAX_FONT_PX);
        this.applyEditorFontSize(next);
        this.saveEditorFontSize(next);
    }

    decreaseFontSize() {
        if (!this.editor) return;
        
        const current = parseInt(window.getComputedStyle(this.editor).fontSize, 10) || this.DEFAULT_FONT_PX;
        const next = Math.max(current - this.FONT_STEP_PX, this.MIN_FONT_PX);
        this.applyEditorFontSize(next);
        this.saveEditorFontSize(next);
    }

    // Text formatting methods
    formatText(command, value = null) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        
        switch (command) {
            case 'bold':
                this.toggleBold(range);
                break;
            case 'italic':
                this.toggleItalic(range);
                break;
            case 'underline':
                this.toggleUnderline(range);
                break;
            case 'strikeThrough':
                this.toggleStrikeThrough(range);
                break;
            case 'formatBlock':
                this.formatBlock(range, value);
                break;
            case 'insertOrderedList':
                this.insertList(range, 'ol');
                break;
            case 'insertUnorderedList':
                this.insertList(range, 'ul');
                break;
        }
        
        if (this.editor) this.editor.focus();
    }

    toggleBold(range) {
        const span = document.createElement('span');
        span.style.fontWeight = 'bold';
        range.surroundContents(span);
    }

    toggleItalic(range) {
        const span = document.createElement('span');
        span.style.fontStyle = 'italic';
        range.surroundContents(span);
    }

    toggleUnderline(range) {
        const span = document.createElement('span');
        span.style.textDecoration = 'underline';
        range.surroundContents(span);
    }

    toggleStrikeThrough(range) {
        const span = document.createElement('span');
        span.style.textDecoration = 'line-through';
        range.surroundContents(span);
    }

    formatBlock(range, tagName) {
        const block = document.createElement(tagName);
        range.surroundContents(block);
    }

    insertList(range, listType) {
        const list = document.createElement(listType);
        const li = document.createElement('li');
        range.surroundContents(li);
        list.appendChild(li);
        range.insertNode(list);
    }

    clearFormatting() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const fragment = range.extractContents();
        const text = fragment.textContent;
        const textNode = document.createTextNode(text);
        range.insertNode(textNode);
        
        if (this.editor) this.editor.focus();
    }

    // Font color methods
    applyFontColorToSelection(colorHex) {
        if (!this.editor) return;
        
        this.editor.focus();
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = colorHex;
        range.surroundContents(span);
    }

    setFontColor(colorHex) {
        if (!colorHex) return;
        
        localStorage.setItem('editorFontColor', colorHex);
        this.restoreSavedSelectionRange();
        this.applyFontColorToSelection(colorHex);
    }

    // Selection management
    saveCurrentSelectionRange() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        const range = selection.getRangeAt(0);
        // Only save if the selection is within the editor
        if (this.editor && this.editor.contains(range.startContainer) && this.editor.contains(range.endContainer)) {
            this.savedSelectionRange = range.cloneRange();
        }
    }

    restoreSavedSelectionRange() {
        if (!this.savedSelectionRange) return;
        
        const selection = window.getSelection();
        if (!selection) return;
        
        try {
            selection.removeAllRanges();
            selection.addRange(this.savedSelectionRange);
        } catch (_) { /* ignore */ }
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl) {
                switch (e.key.toLowerCase()) {
                    case "b": 
                        e.preventDefault(); 
                        this.formatText("bold"); 
                        break;
                    case "i": 
                        e.preventDefault(); 
                        this.formatText("italic"); 
                        break;
                    case "u": 
                        e.preventDefault(); 
                        this.formatText("underline"); 
                        break;
                    case "s": 
                        if (e.shiftKey) { 
                            e.preventDefault(); 
                            this.formatText("strikeThrough"); 
                        } 
                        break;
                    case "b": 
                        if (e.shiftKey) { 
                            e.preventDefault(); 
                            this.formatText("formatBlock", "blockquote"); 
                        } 
                        break;
                    case "c": 
                        if (e.shiftKey) { 
                            e.preventDefault(); 
                            this.formatText("formatBlock", "pre"); 
                        } 
                        break;
                    case "7": 
                        if (e.shiftKey) { 
                            e.preventDefault(); 
                            this.formatText("insertOrderedList"); 
                        } 
                        break;
                    case "8": 
                        if (e.shiftKey) { 
                            e.preventDefault(); 
                            this.formatText("insertUnorderedList"); 
                        } 
                        break;
                    case "1": 
                        if (e.altKey) { 
                            e.preventDefault(); 
                            this.formatText("formatBlock", "h1"); 
                        } 
                        break;
                    case "2": 
                        if (e.altKey) { 
                            e.preventDefault(); 
                            this.formatText("formatBlock", "h2"); 
                        } 
                        break;
                    case "\\": 
                        e.preventDefault(); 
                        this.clearFormatting(); 
                        break;
                }
            }
        });
    }

    // Expose methods to global scope for inline event handlers
    exposeToGlobal() {
        window.increaseFontSize = () => this.increaseFontSize();
        window.decreaseFontSize = () => this.decreaseFontSize();
        window.formatText = (command, value) => this.formatText(command, value);
        window.clearFormatting = () => this.clearFormatting();
        window.setFontColor = (colorHex) => this.setFontColor(colorHex);
    }
}
