// Header Component
export class Header {
    constructor() {
        this.tabsContainer = document.getElementById('tabs');
        this.hamburger = document.querySelector('.hamburger');
        this.sidePanel = document.getElementById('sidePanel');
        this.newNoteBtn = document.getElementById('newNoteBtn');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDarkMode();
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

        // Auth buttons in side panel
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

        // Action buttons in side panel
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

        // New note button in side panel
        if (this.newNoteBtn) {
            this.newNoteBtn.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.editor) {
                    window.editor.newNote();
                } else if (window.newNote) {
                    window.newNote();
                }
            });
        }

        // Close panel on outside click
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    setupDarkMode() {
        const darkToggle = document.getElementById('darkTogglePanel');
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark');
            if (darkToggle) darkToggle.textContent = '🌙 Dark Mode';
        } else {
            if (darkToggle) darkToggle.textContent = '☀️ Dark Mode';
        }
    }

    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        const darkToggle = document.getElementById('darkTogglePanel');
        if (darkToggle) {
            darkToggle.textContent = isDark ? '🌙 Dark Mode' : '☀️ Dark Mode';
        }
    }

    toggleMenu() {
        if (!this.sidePanel) return;
        this.sidePanel.classList.toggle('open');
        if (this.sidePanel.classList.contains('open')) {
            this.populateMobileDocList();
        }
    }

    populateMobileDocList() {
        const docList = document.getElementById('mobileDocList');
        if (!docList) return;

        if (!window.notes || Object.keys(window.notes).length === 0) {
            // Leave the empty state in place
            return;
        }

        docList.innerHTML = '';
        Object.keys(window.notes).forEach((name) => {
            const li = document.createElement('li');
            li.textContent = name;
            li.classList.add('doc-item');
            li.addEventListener('click', () => {
                this.closeSidePanel();
                if (window.openNote) window.openNote(name);
            });
            docList.appendChild(li);
        });
    }

    closeSidePanel() {
        if (this.sidePanel) {
            this.sidePanel.classList.remove('open');
        }
    }

    handleOutsideClick(e) {
        if (!this.sidePanel || !this.sidePanel.classList.contains('open')) return;
        if (!this.sidePanel.contains(e.target) &&
            !(this.hamburger && this.hamburger.contains(e.target))) {
            this.closeSidePanel();
        }
    }

    updateAuthUI(user) {
        const loggedOut = document.getElementById('sidePanelLoggedOut');
        const loggedIn = document.getElementById('sidePanelLoggedIn');
        const emailEl = document.getElementById('sidePanelEmail');

        if (user) {
            if (loggedOut) loggedOut.style.display = 'none';
            if (loggedIn) loggedIn.style.display = 'block';
            if (emailEl) emailEl.textContent = user.email;
        } else {
            if (loggedOut) loggedOut.style.display = 'block';
            if (loggedIn) loggedIn.style.display = 'none';
            if (emailEl) emailEl.textContent = '';
        }
    }

    // Backward-compat alias — Auth.js may call updateAuthState
    updateAuthState(user) {
        this.updateAuthUI(user);
    }

    openGame() {
        if (window.game && window.game.openGame) {
            window.game.openGame();
        }
    }

    renderTabs(notes, currentNote, onSwitchNote, onCloseNote) {
        if (!this.tabsContainer) return;

        this.tabsContainer.innerHTML = '';

        Object.keys(notes).forEach(name => {
            const tab = document.createElement('div');
            tab.className = 'tab' + (name === currentNote ? ' active' : '');

            const nameSpan = document.createElement('span');
            nameSpan.textContent = name;
            nameSpan.onclick = () => onSwitchNote(name);
            tab.appendChild(nameSpan);

            const closeSpan = document.createElement('span');
            closeSpan.className = 'close-btn cursor-pointer subscript';
            closeSpan.textContent = 'X';
            closeSpan.onclick = (e) => {
                e.stopPropagation();
                onCloseNote(name);
            };
            tab.appendChild(closeSpan);

            this.tabsContainer.appendChild(tab);
        });

        const addBtn = document.createElement('button');
        addBtn.className = 'tab add-btn';
        addBtn.textContent = '+';
        addBtn.onclick = () => {
            if (window.editor) {
                window.editor.newNote();
            } else if (window.newNote) {
                window.newNote();
            }
        };
        this.tabsContainer.appendChild(addBtn);
    }

    exposeToGlobal() {
        window.header = this;
    }
}
