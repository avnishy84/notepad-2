// Settings Component
export class Settings {
    constructor() {
        this.defaultFontSize = document.getElementById('defaultFontSize');
        this.autoSave = document.getElementById('autoSave');
        this.spellCheck = document.getElementById('spellCheck');
        this.theme = document.getElementById('theme');
        this.fontFamily = document.getElementById('fontFamily');
        this.userEmail = document.getElementById('userEmail');
        this.exportDataBtn = document.getElementById('exportData');
        this.deleteAccountBtn = document.getElementById('deleteAccount');
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateUserInfo();
        this.setupAuthListener();
    }

    setupEventListeners() {
        // Settings change listeners
        if (this.defaultFontSize) {
            this.defaultFontSize.addEventListener('change', () => this.saveSettings());
        }

        if (this.autoSave) {
            this.autoSave.addEventListener('change', () => this.saveSettings());
        }

        if (this.spellCheck) {
            this.spellCheck.addEventListener('change', () => this.saveSettings());
        }

        if (this.theme) {
            this.theme.addEventListener('change', () => this.applyTheme());
        }

        if (this.fontFamily) {
            this.fontFamily.addEventListener('change', () => this.applyFontFamily());
        }

        // Action buttons
        if (this.exportDataBtn) {
            this.exportDataBtn.addEventListener('click', () => this.exportAllData());
        }

        if (this.deleteAccountBtn) {
            this.deleteAccountBtn.addEventListener('click', () => this.deleteAccount());
        }
    }

    loadSettings() {
        // Load saved settings from localStorage
        const settings = this.getStoredSettings();
        
        if (this.defaultFontSize) {
            this.defaultFontSize.value = settings.defaultFontSize || '16';
        }

        if (this.autoSave) {
            this.autoSave.checked = settings.autoSave !== false; // Default to true
        }

        if (this.spellCheck) {
            this.spellCheck.checked = settings.spellCheck || false;
        }

        if (this.theme) {
            this.theme.value = settings.theme || 'auto';
        }

        if (this.fontFamily) {
            this.fontFamily.value = settings.fontFamily || 'Inter';
        }
    }

    saveSettings() {
        const settings = {
            defaultFontSize: this.defaultFontSize ? this.defaultFontSize.value : '16',
            autoSave: this.autoSave ? this.autoSave.checked : true,
            spellCheck: this.spellCheck ? this.spellCheck.checked : false,
            theme: this.theme ? this.theme.value : 'auto',
            fontFamily: this.fontFamily ? this.fontFamily.value : 'Inter'
        };

        localStorage.setItem('appSettings', JSON.stringify(settings));
        
        // Apply settings immediately
        this.applySettings(settings);
    }

    getStoredSettings() {
        const stored = localStorage.getItem('appSettings');
        return stored ? JSON.parse(stored) : {};
    }

    applySettings(settings) {
        // Apply font size
        if (settings.defaultFontSize && window.toolbar) {
            window.toolbar.applyEditorFontSize(parseInt(settings.defaultFontSize));
        }

        // Apply theme
        this.applyTheme(settings.theme);

        // Apply font family
        this.applyFontFamily(settings.fontFamily);
    }

    applyTheme(themeValue = null) {
        const theme = themeValue || (this.theme ? this.theme.value : 'auto');
        
        if (theme === 'dark') {
            document.body.classList.add('dark');
            if (window.header && window.header.darkToggle) {
                window.header.darkToggle.textContent = '🌙';
            }
        } else if (theme === 'light') {
            document.body.classList.remove('dark');
            if (window.header && window.header.darkToggle) {
                window.header.darkToggle.textContent = '☀️';
            }
        } else if (theme === 'auto') {
            // Auto theme - use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.body.classList.add('dark');
                if (window.header && window.header.darkToggle) {
                    window.header.darkToggle.textContent = '🌙';
                }
            } else {
                document.body.classList.remove('dark');
                if (window.header && window.header.darkToggle) {
                    window.header.darkToggle.textContent = '☀️';
                }
            }
        }
    }

    applyFontFamily(fontValue = null) {
        const fontFamily = fontValue || (this.fontFamily ? this.fontFamily.value : 'Inter');
        
        // Apply to editor if it exists
        const editor = document.getElementById('editor');
        if (editor) {
            editor.style.fontFamily = fontFamily;
        }

        // Apply to body for general app font
        document.body.style.fontFamily = fontFamily;
    }

    updateUserInfo() {
        const currentUser = window.firebaseAuth && window.firebaseAuth.currentUser;
        if (currentUser) {
            if (this.userEmail) {
                this.userEmail.textContent = currentUser.email;
            }
        } else {
            if (this.userEmail) {
                this.userEmail.textContent = 'Not logged in';
            }
        }
    }

    setupAuthListener() {
        // Wait for auth to be available and set up listener
        const checkAuth = () => {
            if (window.onAuthStateChanged && window.firebaseAuth) {
                window.onAuthStateChanged(window.firebaseAuth, (user) => {
                    if (user) {
                        if (this.userEmail) {
                            this.userEmail.textContent = user.email;
                        }
                    } else {
                        if (this.userEmail) {
                            this.userEmail.textContent = 'Not logged in';
                        }
                    }
                });
            } else {
                // Retry after a short delay if auth is not ready yet
                setTimeout(checkAuth, 100);
            }
        };
        checkAuth();
    }

    async exportAllData() {
        const currentUser = window.firebaseAuth && window.firebaseAuth.currentUser;
        if (!currentUser) {
            alert('You must be logged in to export data.');
            return;
        }

        try {
            const userDocRef = window.doc(window.db, "users", currentUser.uid);
            const docSnap = await window.getDoc(userDocRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                const exportData = {
                    user: {
                        email: currentUser.email,
                        uid: currentUser.uid
                    },
                    notes: data.notes || {},
                    settings: this.getStoredSettings(),
                    exportDate: new Date().toISOString()
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                    type: 'application/json' 
                });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `one-editor-export-${new Date().toISOString().split('T')[0]}.json`;
                link.click();

                alert('Data exported successfully!');
            } else {
                alert('No data found to export.');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    }

    async deleteAccount() {
        const currentUser = window.firebaseAuth && window.firebaseAuth.currentUser;
        if (!currentUser) {
            alert('You must be logged in to delete your account.');
            return;
        }

        const confirmed = confirm(
            'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.'
        );

        if (!confirmed) return;

        try {
            const userDocRef = window.doc(window.db, "users", currentUser.uid);
            await window.setDoc(userDocRef, {
                notes: {},
                deletedNotes: {},
                deletedAt: window.serverTimestamp()
            });

            await currentUser.delete();

            alert('Account deleted successfully.');
            window.location.href = '/';
        } catch (error) {
            console.error('Delete account error:', error);
            alert('Failed to delete account. Please try again.');
        }
    }

    // Expose methods to global scope
    exposeToGlobal() {
        window.loadSettings = () => this.loadSettings();
        window.saveSettings = () => this.saveSettings();
        window.exportAllData = () => this.exportAllData();
        window.deleteAccount = () => this.deleteAccount();
    }
}
