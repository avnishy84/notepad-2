// Main App - Component Orchestrator
import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { Toolbar } from '../components/Toolbar.js';
import { Editor } from '../components/Editor.js';
import { Auth } from '../components/Auth.js';
import { About } from '../components/About.js';
import { Settings } from '../components/Settings.js';

class App {
    constructor() {
        this.components = {};
        this.init();
    }

    async init() {
        // Initialize components based on current page
        await this.initializeComponents();
        this.setupComponentCommunication();
        this.exposeToGlobal();
    }

    async initializeComponents() {
        // Always initialize these components
        this.components.auth = new Auth();
        await this.components.auth.init(); // Wait for auth to initialize
        
        this.components.header = new Header();
        this.components.footer = new Footer();
        this.components.toolbar = new Toolbar();

        // Initialize page-specific components
        if (this.isEditorPage()) {
            this.components.editor = new Editor();
        }

        if (this.isAboutPage()) {
            this.components.about = new About();
        }

        if (this.isSettingsPage()) {
            this.components.settings = new Settings();
        }

        // Expose components to global scope for cross-component communication
        window.auth = this.components.auth;
        window.header = this.components.header;
        window.footer = this.components.footer;
        window.toolbar = this.components.toolbar;
        window.editor = this.components.editor;
        window.about = this.components.about;
        window.settings = this.components.settings;
    }

    setupComponentCommunication() {
        // Set up keyboard shortcuts if toolbar exists
        if (this.components.toolbar) {
            this.components.toolbar.setupKeyboardShortcuts();
        }

        // Ensure confirm dialog exists if editor exists
        if (this.components.editor) {
            this.components.editor.ensureConfirmDialog();
        }
    }

    exposeToGlobal() {
        // Expose component methods to global scope
        Object.values(this.components).forEach(component => {
            if (component && typeof component.exposeToGlobal === 'function') {
                component.exposeToGlobal();
            }
        });

        // Expose fallback formatting functions for inline toolbar buttons
        window.formatText = window.formatText || function (command, value) {
            if (window.toolbar) {
                window.toolbar.formatText(command, value);
            }
        };
        
        window.clearFormatting = window.clearFormatting || function () {
            if (window.toolbar) {
                window.toolbar.clearFormatting();
            }
        };
    }

    isEditorPage() {
        return window.location.pathname === '/' || 
               window.location.pathname === '/index.html' ||
               window.location.pathname.endsWith('index.html');
    }

    isAboutPage() {
        return window.location.pathname === '/about.html' ||
               window.location.pathname.endsWith('about.html');
    }

    isSettingsPage() {
        return window.location.pathname === '/settings.html' ||
               window.location.pathname.endsWith('settings.html');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    new App();
});
