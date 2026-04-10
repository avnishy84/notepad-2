// Editor Component
export class Editor {
    constructor() {
        this.editor = document.getElementById('editor');

        this.notes = { "Note 1": "" };
        this.deletedNotes = {};
        this.currentNote = "Note 1";
        this.currentUser = null;

        this.observer = null;
        this._saveTimer = null;   // debounce timer
        this._saving = false;     // prevent concurrent saves

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMutationObserver();
        this.loadInitialContent();
    }

    setupEventListeners() {
        if (this.editor) {
            this.editor.addEventListener("input", () => this.handleEditorInput());
        }
    }

    setupMutationObserver() {
        if (!this.editor) return;
        this.observer = new MutationObserver(() => this.updateStatus());
        this.observer.observe(this.editor, { childList: true, characterData: true, subtree: true });
    }

    loadInitialContent() {
        if (this.editor) {
            this.editor.innerHTML = this.notes[this.currentNote] || '';
            this.updateStatus();
        }
    }

    handleEditorInput() {
        if (!this.editor) return;
        // Keep in-memory copy up to date immediately
        this.notes[this.currentNote] = this.editor.innerHTML;
        this.updateStatus();
        // Debounce Firestore save — 800ms after last keystroke
        this.scheduleSave();
    }

    scheduleSave() {
        if (this._saveTimer) clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => {
            this._saveTimer = null;
            this.saveNotes();
        }, 800);
    }

    updateStatus() {
        if (window.footer && this.editor) {
            window.footer.updateStatus(this.editor);
        }
    }

    newNote() {
        this.createNewNote();
    }

    createNewNote() {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const name = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        if (!this.notes[name]) {
            this.notes[name] = '';
            this.switchNote(name);
        } else {
            alert('Duplicate note name. Try again.');
        }
    }

    switchNote(name) {
        // Flush pending debounced save for current note
        if (this._saveTimer) {
            clearTimeout(this._saveTimer);
            this._saveTimer = null;
        }
        if (this.editor) {
            this.notes[this.currentNote] = this.editor.innerHTML;
        }
        this.currentNote = name;
        if (this.editor) {
            this.editor.innerHTML = this.notes[name] || '';
            this.editor.focus();
        }
        this.updateStatus();
        this.saveNotes();
        if (window.header) window.header.renderTabs(
            this.notes, this.currentNote,
            (n) => this.switchNote(n),
            (n) => this.closeNote(n)
        );
    }

    closeNote(name) {
        if (Object.keys(this.notes).length === 1) {
            alert("You can't close the last note!");
            return;
        }

        const html = this.notes[name] || "";
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const plain = (tmp.textContent || tmp.innerText || "").trim();

        if (plain.length > 0) {
            this.showConfirmDialog({
                title: 'Delete note?',
                message: 'This note has content. Delete it?',
                okText: 'Delete',
                cancelText: 'Cancel'
            }).then((confirmed) => {
                if (confirmed) this.actuallyCloseNote(name);
            });
            return;
        }
        this.actuallyCloseNote(name);
    }

    actuallyCloseNote(name) {
        this.deletedNotes[name] = { deleted: true, deletedAt: new Date().toISOString() };
        delete this.notes[name];

        if (this.currentNote === name) {
            this.currentNote = Object.keys(this.notes)[0];
            if (this.editor) {
                this.editor.innerHTML = this.notes[this.currentNote] || '';
            }
        }
        this.updateStatus();
        this.saveNotes();
        if (window.header) window.header.renderTabs(
            this.notes, this.currentNote,
            (n) => this.switchNote(n),
            (n) => this.closeNote(n)
        );
        this.persistDeletion(name);
    }

    async persistDeletion(name) {
        if (!this.currentUser || !window.db) return;
        try {
            const ref = window.doc(window.db, "users", this.currentUser.uid);
            await window.setDoc(ref, {
                notes: { [name]: window.deleteField() },
                deletedNotes: { [name]: { deleted: true, deletedAt: new Date().toISOString() } }
            }, { merge: true });
        } catch (err) {
            console.error("Failed to persist deletion:", err);
        }
    }

    downloadNote() {
        if (!this.editor) return;
        const blob = new Blob([this.editor.innerHTML], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = this.currentNote + '.html';
        link.click();
    }

    // openNote is an alias for switchNote
    openNote(noteName) {
        this.switchNote(noteName);
    }

    // Confirm dialog
    ensureConfirmDialog() {
        if (document.getElementById('confirmDialogModal')) return;
        const modal = document.createElement('div');
        modal.id = 'confirmDialogModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="popup-content">
                <div style="font-size:x-large;font-weight:600;" id="confirmDialogTitle">Confirm</div>
                <p style="margin:0;padding:0;" id="confirmDialogMessage">Are you sure?</p>
                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">
                    <button id="confirmDialogCancel">Cancel</button>
                    <button id="confirmDialogOk">OK</button>
                </div>
            </div>`;
        document.body.appendChild(modal);
        modal.querySelector('#confirmDialogCancel').addEventListener('click', () => {
            modal.style.display = 'none';
            if (modal.__resolver) { modal.__resolver(false); modal.__resolver = null; }
        });
        modal.querySelector('#confirmDialogOk').addEventListener('click', () => {
            modal.style.display = 'none';
            if (modal.__resolver) { modal.__resolver(true); modal.__resolver = null; }
        });
    }

    showConfirmDialog(options = {}) {
        this.ensureConfirmDialog();
        const { title = 'Confirm', message = 'Are you sure?', okText = 'OK', cancelText = 'Cancel' } = options;
        const modal = document.getElementById('confirmDialogModal');
        if (!modal) return Promise.resolve(false);
        modal.querySelector('#confirmDialogTitle').textContent = title;
        modal.querySelector('#confirmDialogMessage').textContent = message;
        modal.querySelector('#confirmDialogOk').textContent = okText;
        modal.querySelector('#confirmDialogCancel').textContent = cancelText;
        modal.style.display = 'flex';
        return new Promise((resolve) => { modal.__resolver = resolve; });
    }

    // Serialised save — prevents concurrent Firestore writes
    async saveNotes() {
        if (!this.currentUser || !window.db) return;
        if (this._saving) {
            // Another save is in flight — schedule a follow-up
            this.scheduleSave();
            return;
        }
        this._saving = true;

        const notesToSave = {};
        Object.keys(this.notes).forEach(key => {
            if (!key.endsWith('_updateTime')) notesToSave[key] = this.notes[key];
        });

        try {
            await window.setDoc(
                window.doc(window.db, "users", this.currentUser.uid),
                { notes: notesToSave },
                { merge: true }
            );
        } catch (err) {
            console.error("Error saving notes:", err);
        } finally {
            this._saving = false;
        }
    }

    async loadNotes(uid) {
        if (!window.db) return;
        try {
            const docRef = window.doc(window.db, "users", uid);
            const docSnap = await window.getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.notes && Object.keys(data.notes).length > 0) {
                    const names = Object.keys(data.notes)
                        .filter(k => !k.endsWith('_updateTime'))
                        .sort();

                    this.notes = {};
                    names.forEach(n => { this.notes[n] = data.notes[n]; });
                    this.deletedNotes = data.deletedNotes || {};
                    this.currentNote = names[names.length - 1] || "Note 1";
                } else {
                    this.notes = { "Note 1": "" };
                    this.currentNote = "Note 1";
                    await this.saveNotes();
                }
            } else {
                this.notes = { "Note 1": "" };
                this.currentNote = "Note 1";
                await this.saveNotes();
            }

            if (this.editor) {
                this.editor.innerHTML = this.notes[this.currentNote] || '';
            }
            if (window.header) window.header.renderTabs(
                this.notes, this.currentNote,
                (n) => this.switchNote(n),
                (n) => this.closeNote(n)
            );
            this.updateStatus();
        } catch (err) {
            console.error("Error loading notes:", err);
        }
    }

    resetNotes() {
        if (this._saveTimer) { clearTimeout(this._saveTimer); this._saveTimer = null; }
        this.notes = { "Note 1": "" };
        this.currentNote = "Note 1";
        if (this.editor) this.editor.innerHTML = '';
        if (window.header) window.header.renderTabs(
            this.notes, this.currentNote,
            (n) => this.switchNote(n),
            (n) => this.closeNote(n)
        );
        this.updateStatus();
    }

    exposeToGlobal() {
        Object.defineProperty(window, 'notes', {
            get: () => this.notes,
            configurable: true
        });
        window.openNote = (name) => this.openNote(name);
        window.switchNote = (name) => this.switchNote(name);
        window.closeNote = (name) => this.closeNote(name);
        window.actuallyCloseNote = (name) => this.actuallyCloseNote(name);
        window.ensureConfirmDialog = () => this.ensureConfirmDialog();
        window.showConfirmDialog = (opts) => this.showConfirmDialog(opts);
        window.saveNotes = () => this.saveNotes();
        window.loadNotes = (uid) => this.loadNotes(uid);
        window.updateStatus = () => this.updateStatus();
        window.newNote = () => this.createNewNote();
    }
}
