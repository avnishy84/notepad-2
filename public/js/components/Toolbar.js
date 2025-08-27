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
    // Custom shortcuts functionality
    customShortcuts = {};

    init() {
        this.setupEventListeners();
        this.loadEditorFontSize();
        this.setupColorPicker();
        this.setupFontSizeWheel();
        this.loadCustomShortcuts();
        this.setupCustomShortcutListener();
        this.setupKeyboardShortcuts();
        this.exposeToGlobal();
    }

    setupEventListeners() {
        // Color picker events
        if (this.fontColorPicker) {
            this.fontColorPicker.addEventListener('mousedown', () => this.saveCurrentSelectionRange());
            this.fontColorPicker.addEventListener('focus', () => this.saveCurrentSelectionRange());
            this.fontColorPicker.addEventListener('change', () => {
                if (this.colorSwatch) this.colorSwatch.style.backgroundColor = this.fontColorPicker.value;
                if (this.editor) this.editor.focus();
                this.setFontColor(this.fontColorPicker.value);
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

    // ✅ Text formatting (uses execCommand so it toggles properly & preserves selection)
    formatText(command, value = null) {
        if (this.editor) this.editor.focus();
        document.execCommand(command, false, value);
    }

    clearFormatting() {
        if (this.editor) this.editor.focus();
        document.execCommand("removeFormat");
        document.execCommand("formatBlock", false, "p");
    }

    // Font color methods
    setFontColor(colorHex) {
        if (!colorHex) return;
        localStorage.setItem('editorFontColor', colorHex);
        this.restoreSavedSelectionRange();
        if (this.editor) this.editor.focus();
        document.execCommand("foreColor", false, colorHex);
    }

    // Selection management
    saveCurrentSelectionRange() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
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
        } catch (_) { }
    }

    // Keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener("keydown", (e) => {
            const ctrl = e.ctrlKey || e.metaKey;
            if (ctrl) {
                switch (e.key.toLowerCase()) {
                    case "b":
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.formatText("formatBlock", "blockquote");
                        } else {
                            this.formatText("bold");
                        }
                        break;
                    case "i": e.preventDefault(); this.formatText("italic"); break;
                    case "u": e.preventDefault(); this.formatText("underline"); break;
                    case "s":
                        if (e.shiftKey) { e.preventDefault(); this.formatText("strikeThrough"); }
                        break;
                    case "c":
                        if (e.shiftKey) { e.preventDefault(); this.formatText("formatBlock", "pre"); }
                        break;
                    case "z":
                        e.preventDefault();
                        document.execCommand(e.shiftKey ? "redo" : "undo");
                        break;
                    case "7":
                        if (e.shiftKey) { e.preventDefault(); this.formatText("insertOrderedList"); }
                        break;
                    case "8":
                        if (e.shiftKey) { e.preventDefault(); this.formatText("insertUnorderedList"); }
                        break;
                    case "1":
                        if (e.altKey) { e.preventDefault(); this.formatText("formatBlock", "h1"); }
                        break;
                    case "2":
                        if (e.altKey) { e.preventDefault(); this.formatText("formatBlock", "h2"); }
                        break;
                    case "\\":
                        e.preventDefault();
                        this.clearFormatting();
                        break;
                }
            }

            // Check for custom shortcuts
            this.checkCustomShortcuts(e);
        });
    }

    // Custom shortcuts methods
    loadCustomShortcuts() {
        const stored = localStorage.getItem('customShortcuts');
        this.customShortcuts = stored ? JSON.parse(stored) : {};
    }

    saveCustomShortcuts() {
        localStorage.setItem('customShortcuts', JSON.stringify(this.customShortcuts));
    }

    setupCustomShortcutListener() {
        document.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.showCustomShortcutDialog();
            }
        });
    }

    checkCustomShortcuts(e) {
        const keyPressed = e.key;
        if (!keyPressed) return;
        const shortcut = this.customShortcuts[keyPressed];
        if (shortcut && e.ctrlKey && e.altKey) {
            e.preventDefault();
            this.insertCustomText(shortcut);
        }
    }

    showCustomShortcutDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'modal shortcut-modal';
        dialog.style.display = 'flex';
        dialog.innerHTML = `
            <div class="popup-content" style="max-width: 500px;">
                <h3>Create Custom Shortcut</h3>
                <div style="display: flex; flex-direction: column; margin: 10px 0;">
                    <label>Shortcut Key:</label>
                    <input type="text" id="shortcutKey" class="selected-shortcut-key" placeholder="e.g., d for date, t for time" maxlength="1" style="width: 100%; margin: 5px 0;">
                    <small>Use Ctrl+Alt + key to trigger</small>
                </div>
                <div style="margin: 10px 0;">
                    <label>Text Template:</label>
                    <textarea id="textTemplate" class="text-template" placeholder="Enter your text with placeholders like {date}, {time}, {datetime}" style="margin: 5px 0;"></textarea>
                </div>
                <div style="margin: 10px 0;">
                    <label>Date Format:</label>
                    <select id="dateFormat" class="styled-select">
                        <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                        <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    </select>
                </div>
                <div style="margin: 10px 0;">
                    <label>Time Format:</label>
                    <select id="timeFormat" class="styled-select">
                        <option value="HH:MM">HH:MM</option>
                        <option value="HH:MM:SS">HH:MM:SS</option>
                        <option value="HH:MM AM/PM">HH:MM AM/PM</option>
                        <option value="HH:MM:SS AM/PM">HH:MM:SS AM/PM</option>
                    </select>
                </div>
                <div style="margin: 10px 0;">
                    <label>Preview:</label>
                    <div id="previewText" class="preview-text" ></div>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px;">
                    <button onclick="this.closest('.shortcut-modal').remove()">Cancel</button>
                    <button onclick="window.toolbar.saveCustomShortcut()" class="primary">Save Shortcut</button>
                </div>
            </div>
        `;
        document.body.appendChild(dialog);

        const textTemplate = dialog.querySelector('#textTemplate');
        const dateFormat = dialog.querySelector('#dateFormat');
        const timeFormat = dialog.querySelector('#timeFormat');
        const previewText = dialog.querySelector('#previewText');

        const updatePreview = () => {
            const template = textTemplate.value;
            const preview = this.processTemplate(template, dateFormat.value, timeFormat.value);
            previewText.textContent = preview;
        };

        textTemplate.addEventListener('input', updatePreview);
        dateFormat.addEventListener('change', updatePreview);
        timeFormat.addEventListener('change', updatePreview);
    }

    saveCustomShortcut() {
        const dialog = document.querySelector('.shortcut-modal');
        if (!dialog) return;

        const keyInput = dialog.querySelector('#shortcutKey');
        const templateInput = dialog.querySelector('#textTemplate');
        const dateFormatSelect = dialog.querySelector('#dateFormat');
        const timeFormatSelect = dialog.querySelector('#timeFormat');

        if (!keyInput || !templateInput || !dateFormatSelect || !timeFormatSelect) return;

        const key = keyInput.value.trim().toLowerCase();
        const template = templateInput.value;
        const dateFormat = dateFormatSelect.value;
        const timeFormat = timeFormatSelect.value;

        if (!key || !template) {
            alert('Please fill in both shortcut key and text template.');
            return;
        }

        this.customShortcuts[key] = { template, dateFormat, timeFormat };
        this.saveCustomShortcuts();
        dialog.remove();

        alert(`Shortcut Ctrl+Alt+${key.toUpperCase()} saved successfully!`);
    }

    processTemplate(template, dateFormat, timeFormat) {
        const now = new Date();
        const date = this.formatDate(now, dateFormat);
        const time = this.formatTime(now, timeFormat);

        return template
            .replace(/{date}/g, date)
            .replace(/{time}/g, time)
            .replace(/{datetime}/g, `${date} ${time}`)
            .replace(/{year}/g, now.getFullYear())
            .replace(/{month}/g, String(now.getMonth() + 1).padStart(2, '0'))
            .replace(/{day}/g, String(now.getDate()).padStart(2, '0'))
            .replace(/{hour}/g, String(now.getHours()).padStart(2, '0'))
            .replace(/{minute}/g, String(now.getMinutes()).padStart(2, '0'))
            .replace(/{second}/g, String(now.getSeconds()).padStart(2, '0'));
    }

    formatDate(date, format) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        switch (format) {
            case 'MM-DD-YYYY': return `${month}-${day}-${year}`;
            case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
            case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
            case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
            case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
            default: return `${month}-${day}-${year}`;
        }
    }

    formatTime(date, format) {
        const hour24 = date.getHours();
        const hour12 = hour24 % 12 || 12;
        const minute = String(date.getMinutes()).padStart(2, '0');
        const second = String(date.getSeconds()).padStart(2, '0');
        const ampm = hour24 >= 12 ? 'PM' : 'AM';

        switch (format) {
            case 'HH:MM': return `${String(hour24).padStart(2, '0')}:${minute}`;
            case 'HH:MM:SS': return `${String(hour24).padStart(2, '0')}:${minute}:${second}`;
            case 'HH:MM AM/PM': return `${hour12}:${minute} ${ampm}`;
            case 'HH:MM:SS AM/PM': return `${hour12}:${minute}:${second} ${ampm}`;
            default: return `${String(hour24).padStart(2, '0')}:${minute}`;
        }
    }

    insertCustomText(shortcut) {
        if (!this.editor) return;
        const text = this.processTemplate(shortcut.template, shortcut.dateFormat, shortcut.timeFormat);

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        } else {
            this.editor.focus();
            const range = document.createRange();
            range.selectNodeContents(this.editor);
            range.collapse(false);
            range.insertNode(document.createTextNode(text));
        }
        this.editor.focus();
    }

    // Expose methods globally
    exposeToGlobal() {
        window.increaseFontSize = () => this.increaseFontSize();
        window.decreaseFontSize = () => this.decreaseFontSize();
        window.formatText = (command, value) => this.formatText(command, value);
        window.clearFormatting = () => this.clearFormatting();
        window.setFontColor = (colorHex) => this.setFontColor(colorHex);
        window.saveCustomShortcut = () => this.saveCustomShortcut();
    }
}