// Header Component
export class Header {
    constructor() {
        this.authContainer = document.getElementById('authContainer');
        this.authButtons = document.getElementById('authButtons');
        this.logoutSection = document.getElementById('logoutSection');
        this.tabsContainer = document.getElementById('tabs');
        this.actions = document.querySelector('.actions');
        this.hamburger = document.querySelector('.hamburger');
        this.sidePanel = document.getElementById('sidePanel');
        this.darkToggle = document.getElementById('darkToggle');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.gameBtn = document.getElementById('gameBtn');
        this.newNoteBtn = document.getElementById('newNoteBtn');

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDarkMode();
        this.setupMobileMenu();
    }

    setupEventListeners() {
        // Dark mode toggle
        if (this.darkToggle) {
            this.darkToggle.addEventListener('click', () => this.toggleDarkMode());
        }

        // Game button
        if (this.gameBtn) {
            this.gameBtn.addEventListener('click', () => this.openGame());
        }

        // Mobile menu
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMenu());
        }

        // Close panel button
        const closePanelBtn = document.getElementById('closePanelBtn');
        if (closePanelBtn) {
            closePanelBtn.addEventListener('click', () => this.closeSidePanel());
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    setupDarkMode() {
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark');
            if (this.darkToggle) this.darkToggle.textContent = '🌙';
        } else {
            if (this.darkToggle) this.darkToggle.textContent = '☀️';
        }
    }

    toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        if (this.darkToggle) {
            this.darkToggle.textContent = isDark ? '🌙' : '☀️';
        }
    }

    setupMobileMenu() {
        // Link mobile buttons
        this.linkMobileButtons();
    }

    linkMobileButtons() {
        // Link new note button
        const newNoteBtnMobile = document.getElementById('newNoteBtnMobile');
        if (newNoteBtnMobile && this.newNoteBtn) {
            newNoteBtnMobile.addEventListener('click', () => {
                this.newNoteBtn.click();
                this.toggleMenu();
            });
        }

        // Link dark mode toggle
        const darkToggleMobile = document.getElementById('darkToggleMobile');
        if (darkToggleMobile && this.darkToggle) {
            darkToggleMobile.addEventListener('click', () => {
                this.darkToggle.click();
            });
        }

        // Link download button
        const downloadBtnMobile = document.getElementById('downloadBtnMobile');
        if (downloadBtnMobile && this.downloadBtn) {
            downloadBtnMobile.addEventListener('click', () => {
                this.downloadBtn.click();
                this.toggleMenu();
            });
        }

        // Link game button
        const gameBtnMobile = document.getElementById('gameBtnMobile');
        if (gameBtnMobile && this.gameBtn) {
            gameBtnMobile.addEventListener('click', () => {
                this.openGame();
                this.toggleMenu();
            });
        }



        // Link logout button
        const logoutBtnMobile = document.getElementById('logoutBtnMobile');
        if (logoutBtnMobile) {
            logoutBtnMobile.addEventListener('click', () => {
                if (window.logout) window.logout();
                this.toggleMenu();
            });
        }
    }

    toggleMenu() {
        if (!this.sidePanel) return;

        this.sidePanel.classList.toggle('open');

        const panelButtons = document.getElementById('sidePanelButtons');
        if (panelButtons) panelButtons.innerHTML = '';

        // Populate mobile document list
        this.populateMobileDocList();

        // Link mobile buttons to their functionality
        this.linkMobileButtons();
    }

    populateMobileDocList() {
        const docList = document.getElementById('mobileDocList');
        if (docList && window.notes) {
            docList.innerHTML = '';
            Object.keys(window.notes).forEach((name) => {
                const li = document.createElement('li');
                li.textContent = name;
                li.classList.add('doc-item');
                li.onclick = () => {
                    if (window.openNote) window.openNote(name);
                    this.closeSidePanel();
                };
                docList.appendChild(li);
            });
        }
    }

    closeSidePanel() {
        if (this.sidePanel) {
            this.sidePanel.classList.remove('open');
        }
    }

    handleOutsideClick(e) {
        const menu = document.getElementById('menu');
        const hamburger = document.querySelector('.hamburger');

        if ((menu && !menu.contains(e.target)) &&
            (hamburger && !hamburger.contains(e.target))) {
            if (menu) menu.style.display = 'none';
        }
    }

    updateAuthState(user) {
        if (user) {
            if (this.authButtons) this.authButtons.style.display = 'none';
            if (this.logoutSection) this.logoutSection.style.display = 'block';
        } else {
            if (this.authButtons) this.authButtons.style.display = 'block';
            if (this.logoutSection) this.logoutSection.style.display = 'none';
        }
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
            if (this.newNoteBtn) this.newNoteBtn.click();
        };
        this.tabsContainer.appendChild(addBtn);
    }
}
