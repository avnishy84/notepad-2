// Editor Component
export class Editor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.newNoteBtn = document.getElementById('newNoteBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        this.notes = { "Note 1": "" };
        this.deletedNotes = {};
        this.currentNote = Object.keys(this.notes)[0];

        this.observer = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupMutationObserver();
        this.loadInitialContent();
    }

    setupEventListeners() {
        // Editor input events
        if (this.editor) {
            this.editor.addEventListener("input", () => this.handleEditorInput());
        }

        // New note button
        if (this.newNoteBtn) {
            this.newNoteBtn.addEventListener('click', () => this.createNewNote());
        }

        // Download button
        if (this.downloadBtn) {
            this.downloadBtn.addEventListener('click', () => this.downloadNote());
        }
    }

    setupMutationObserver() {
        if (!this.editor) return;

        this.observer = new MutationObserver(() => this.updateStatus());
        this.observer.observe(this.editor, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    loadInitialContent() {
        if (this.editor) {
            this.editor.innerHTML = this.notes[this.currentNote];
            this.updateStatus();
        }
    }

    handleEditorInput() {
        if (this.editor) {
            this.notes[this.currentNote] = this.editor.innerHTML;
            this.saveNotes();
            this.updateStatus();
        }
    }

    updateStatus() {
        // This will be called by the Footer component
        if (window.footer && this.editor) {
            window.footer.updateStatus(this.editor);
        }
    }

    createNewNote() {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, '0');
        const name = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        if (!this.notes[name]) {
            this.notes[name] = '';
            this.switchNote(name);
        } else {
            alert('Duplicate note name. Try again.');
        }
    }

    switchNote(name) {
        if (this.editor) {
            this.notes[this.currentNote] = this.editor.innerHTML;
        }
        this.currentNote = name;
        if (this.editor) {
            this.editor.innerHTML = this.notes[name];
        }
        this.updateStatus();
        this.saveNotes();

        // Update tabs if header component exists
        if (window.header) {
            window.header.renderTabs(this.notes, this.currentNote,
                (name) => this.switchNote(name),
                (name) => this.closeNote(name)
            );
        }
    }

    closeNote(name) {
        if (Object.keys(this.notes).length === 1) {
            alert("You can't close the last note!");
            return;
        }

        // Confirm if note contains content
        const html = this.notes[name] || "";
        const tmpDiv = document.createElement('div');
        tmpDiv.innerHTML = html;
        const plain = (tmpDiv.textContent || tmpDiv.innerText || "").trim();

        if (plain.length > 0) {
            this.showConfirmDialog({
                title: 'Delete note?',
                message: 'This note contains content. Do you really want to delete it?',
                okText: 'Delete',
                cancelText: 'Cancel'
            }).then((confirmed) => {
                if (confirmed) {
                    this.actuallyCloseNote(name);
                }
            });
            return;
        }
        this.actuallyCloseNote(name);
    }

    actuallyCloseNote(name) {
        // Mark as deleted locally
        const deletionInfo = { deleted: true, deletedAt: new Date().toISOString() };
        this.deletedNotes[name] = deletionInfo;

        // Optimistically update UI
        delete this.notes[name];
        if (this.currentNote === name) {
            this.currentNote = Object.keys(this.notes)[0];
            if (this.editor) {
                this.editor.innerHTML = this.notes[this.currentNote];
            }
        }
        this.updateStatus();
        this.saveNotes();

        // Update tabs
        if (window.header) {
            window.header.renderTabs(this.notes, this.currentNote,
                (name) => this.switchNote(name),
                (name) => this.closeNote(name)
            );
        }

        // Persist deletion to Firestore
        this.persistDeletion(name);
    }

    async persistDeletion(name) {
        if (window.auth && window.auth.currentUser && window.db) {
            try {
                const userDocRef = window.doc(window.db, "users", window.auth.currentUser.uid);
                await window.setDoc(userDocRef, {
                    notes: { [name]: window.deleteField() },
                    deletedNotes: { [name]: { deleted: true, deletedAt: new Date().toISOString() } }
                }, { merge: true });
            } catch (err) {
                console.error("Failed to persist deletion:", err);
            }
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

    openNote(noteName) {
        // Save current note content before switching
        if (this.editor) {
            this.notes[this.currentNote] = this.editor.innerHTML;
        }

        // Switch to the selected note
        this.currentNote = noteName;
        if (this.editor) {
            this.editor.innerHTML = this.notes[noteName] || "";
        }

        // Update UI
        this.updateStatus();
        this.saveNotes();

        // Update tabs
        if (window.header) {
            window.header.renderTabs(this.notes, this.currentNote,
                (name) => this.switchNote(name),
                (name) => this.closeNote(name)
            );
        }

        console.log("Opened note:", noteName);
    }

    // Confirm dialog methods
    ensureConfirmDialog() {
        if (document.getElementById('confirmDialogModal')) return;

        const modal = document.createElement('div');
        modal.id = 'confirmDialogModal';
        modal.className = 'modal';
        modal.style.display = 'none';

        modal.innerHTML = `
            <div class="popup-content">
                <div style="font-size: x-large;font-weight: 600;" id="confirmDialogTitle">Confirm</div>
                <p style="margin:0; padding:0;" id="confirmDialogMessage">Are you sure?</p>
                <div class="modal-actions" style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px;">
                    <button id="confirmDialogCancel">Cancel</button>
                    <button id="confirmDialogOk" class="danger">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('#confirmDialogCancel');
        const okBtn = modal.querySelector('#confirmDialogOk');

        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            const resolver = modal.__resolver;
            if (resolver) resolver(false);
            modal.__resolver = null;
        });

        okBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            const resolver = modal.__resolver;
            if (resolver) resolver(true);
            modal.__resolver = null;
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

        return new Promise((resolve) => {
            modal.__resolver = resolve;
        });
    }

    // Save/Load methods
    async saveNotes() {
        if (!window.auth || !window.auth.currentUser || !window.db) return;

        try {
            await window.setDoc(window.doc(window.db, "users", window.auth.currentUser.uid), {
                notes: this.notes
            }, { merge: true });
            console.log("Notes saved for", window.auth.currentUser.email);
        } catch (err) {
            console.error("Error saving notes:", err);
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
                    // Sort notes by key (alphabetically)
                    const noteNames = Object.keys(data.notes).filter(key => !key.endsWith('_updateTime'));
                    const sortedNoteNames = noteNames.sort();

                    const sortedNotes = {};
                    sortedNoteNames.forEach(name => {
                        sortedNotes[name] = data.notes[name];
                        if (data.notes[name + '_updateTime']) {
                            sortedNotes[name + '_updateTime'] = data.notes[name + '_updateTime'];
                        }
                    });

                    this.notes = sortedNotes;
                    this.deletedNotes = data.deletedNotes || {};
                    this.currentNote = sortedNoteNames[sortedNoteNames.length - 1] || "Note 1"; // Select last alphabetically
                    if (this.editor) {
                        this.editor.innerHTML = this.notes[this.currentNote];
                    }
                    console.log("Notes loaded for", uid);
                } else {
                    // No notes stored → create default
                    this.notes = { "Note 1": "" };
                    this.currentNote = "Note 1";
                    await this.saveNotes();
                    console.log("New user – default note created");
                }
            } else {
                // First time user doc → create with default note
                this.notes = { "Note 1": "" };
                this.currentNote = "Note 1";
                await this.saveNotes();
                console.log("New user – doc created");
            }

            // Update UI
            if (window.header) {
                window.header.renderTabs(this.notes, this.currentNote,
                    (name) => this.switchNote(name),
                    (name) => this.closeNote(name)
                );
            }
            this.updateStatus();
        } catch (err) {
            console.error("Error loading notes:", err);
        }
    }

    // Reset notes when logged out
    resetNotes() {
        this.notes = { "Note 1": "" };
        this.currentNote = "Note 1";
        if (this.editor) {
            this.editor.innerHTML = this.notes[this.currentNote];
        }

        if (window.header) {
            window.header.renderTabs(this.notes, this.currentNote,
                (name) => this.switchNote(name),
                (name) => this.closeNote(name)
            );
        }
        this.updateStatus();
    }

    // Expose methods to global scope
    exposeToGlobal() {
        window.openNote = (noteName) => this.openNote(noteName);
        window.switchNote = (name) => this.switchNote(name);
        window.closeNote = (name) => this.closeNote(name);
        window.actuallyCloseNote = (name) => this.actuallyCloseNote(name);
        window.ensureConfirmDialog = () => this.ensureConfirmDialog();
        window.showConfirmDialog = (options) => this.showConfirmDialog(options);
        window.saveNotes = () => this.saveNotes();
        window.loadNotes = (uid) => this.loadNotes(uid);
        window.updateStatus = () => this.updateStatus();
    }
}
