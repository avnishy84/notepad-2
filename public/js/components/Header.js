// Header Component
export class Header {
    constructor() {
        this.hamburger = document.getElementById('hamburgerBtn') || document.querySelector('.hamburger');
        this.sidePanel = document.getElementById('sidePanel');
        this.overlay = document.getElementById('sidePanelOverlay');
        this.newNoteBtn = document.getElementById('newNoteBtn');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.syncDarkModeIcon();
        this.updateAuthUI(null);
    }

    setupEventListeners() {
        // Hamburger toggle
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Close panel button
        const closePanelBtn = document.getElementById('closePanelBtn');
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => this.closeSidePanel());
        }

        // Overlay click closes panel
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.closeSidePanel());
        }

        // Side panel auth buttons
        const loginBtn = document.getElementById('sidePanelLoginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.auth) window.auth.openModal('loginPopup');
            });
        }

        const signupBtn = document.getElementById('sidePanelSignupBtn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.auth) window.auth.openModal('signupPopup');
            });
        }

        const logoutBtn = document.getElementById('sidePanelLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.auth) window.auth.logout();
            });
        }

        // Side panel action buttons
        const gameBtn = document.getElementById('gameBtnPanel');
        if (gameBtn) {
            gameBtn.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.game) window.game.openGame();
            });
        }

        const downloadBtn = document.getElementById('downloadBtnPanel');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.editor) window.editor.downloadNote();
            });
        }

        const darkToggle = document.getElementById('darkTogglePanel');
        if (darkToggle) {
            darkToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // New note button
        if (this.newNoteBtn) {
            this.newNoteBtn.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.editor) window.editor.newNote();
                else if (window.newNote) window.newNote();
            });
        }
    }

    syncDarkModeIcon() {
        const isDark = document.body.classList.contains('dark') ||
                       localStorage.getItem('darkMode') === 'true';
        if (isDark && !document.body.classList.contains('dark')) {
            document.body.classList.add('dark');
        }
        const panelBtn = document.getElementById('darkTogglePanel');
        if (panelBtn) panelBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        const panelBtn = document.getElementById('darkTogglePanel');
        if (panelBtn) panelBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    toggleMenu() {
        if (!this.sidePanel) return;
        const isOpen = this.sidePanel.classList.contains('open');
        if (isOpen) {
            this.closeSidePanel();
        } else {
            this.openSidePanel();
        }
    }

    openSidePanel() {
        if (!this.sidePanel) return;
        this.sidePanel.classList.add('open');
        if (this.overlay) this.overlay.classList.add('active');
        this.populateMobileDocList();
    }

    closeSidePanel() {
        if (this.sidePanel) this.sidePanel.classList.remove('open');
        if (this.overlay) this.overlay.classList.remove('active');
    }

    populateMobileDocList() {
        const docList = document.getElementById('mobileDocList');
        if (!docList) return;

        const notes = window.notes;
        const currentNote = window.editor ? window.editor.currentNote : null;

        if (!notes || Object.keys(notes).length === 0) {
            docList.innerHTML = '<li class="doc-empty-state">No documents yet</li>';
            return;
        }

        docList.innerHTML = '';
        Object.keys(notes).forEach((name) => {
            const li = document.createElement('li');
            li.classList.add('doc-item');
            if (name === currentNote) li.classList.add('doc-item-active');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            nameSpan.style.flex = '1';
            nameSpan.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.openNote) window.openNote(name);
            });

            const closeBtn = document.createElement('button');
            closeBtn.textContent = '✕';
            closeBtn.className = 'doc-item-close';
            closeBtn.title = 'Delete note';
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.editor) window.editor.closeNote(name);
                this.populateMobileDocList();
            });

            li.appendChild(nameSpan);
            li.appendChild(closeBtn);
            docList.appendChild(li);
        });
    }

    updateAuthUI(user) {
        const loggedOut = document.getElementById('sidePanelLoggedOut');
        const loggedIn = document.getElementById('sidePanelLoggedIn');
        const emailEl = document.getElementById('sidePanelEmail');

        if (user) {
            if (loggedOut) loggedOut.style.display = 'none';
            if (loggedIn) loggedIn.style.display = 'flex';
            if (emailEl) emailEl.textContent = user.email;
        } else {
            if (loggedOut) loggedOut.style.display = 'flex';
            if (loggedIn) loggedIn.style.display = 'none';
            if (emailEl) emailEl.textContent = '';
        }
    }

    // Backward-compat alias
    updateAuthState(user) {
        this.updateAuthUI(user);
    }

    openGame() {
        if (window.game && window.game.openGame) {
            window.game.openGame();
        }
    }

    // Notes are shown in the side panel doc list — no tab bar needed
    renderTabs() {
        // Refresh the side panel doc list whenever notes change
        this.populateMobileDocList();
    }

    exposeToGlobal() {
        window.header = this;
        // Expose toggleMenu for any legacy callers
        window.toggleMenu = () => this.toggleMenu();
    }
}
