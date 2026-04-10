// Auth Component
export class Auth {
    constructor() {
        this.auth = null;
        this.db = null;
        this.provider = null;
    }

    async init() {
        await this.setupAuth();
        this.setupEventListeners();
    }

    async setupAuth() {
        try {
            // Import Firebase modules
            const { auth, db } = await import("../firebase/firebase.js");
            const {
                createUserWithEmailAndPassword,
                signInWithEmailAndPassword,
                signOut,
                onAuthStateChanged,
                GoogleAuthProvider,
                signInWithPopup
            } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js");
            const {
                doc,
                getDoc,
                setDoc,
                serverTimestamp,
                deleteField
            } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js");

            this.auth = auth;
            this.db = db;
            this.provider = new GoogleAuthProvider();

            // Store auth functions on instance for use in methods
            this._createUser = createUserWithEmailAndPassword;
            this._signIn = signInWithEmailAndPassword;
            this._signOut = signOut;
            this._onAuthStateChanged = onAuthStateChanged;
            this._signInWithPopup = signInWithPopup;

            // Expose Firebase internals to global scope (NOT the Auth class instance)
            window.firebaseAuth = auth;
            window.db = db;
            window.doc = doc;
            window.getDoc = getDoc;
            window.setDoc = setDoc;
            window.serverTimestamp = serverTimestamp;
            window.deleteField = deleteField;
            window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
            window.signInWithEmailAndPassword = signInWithEmailAndPassword;
            window.signOut = signOut;
            window.onAuthStateChanged = onAuthStateChanged;
            window.GoogleAuthProvider = GoogleAuthProvider;
            window.signInWithPopup = signInWithPopup;

            // Set up auth state listener
            this.setupAuthStateListener();
        } catch (error) {
            console.error('Failed to setup auth:', error);
        }
    }

    setupAuthStateListener() {
        if (!this.auth || !this._onAuthStateChanged) return;

        this._onAuthStateChanged(this.auth, (user) => {
            if (user) {
                if (window.header) window.header.updateAuthState(user);
                console.log("User logged in:", user.email);

                // Store user on editor immediately so saveNotes() works
                if (window.editor) {
                    window.editor.currentUser = user;
                    window.editor.loadNotes(user.uid);
                }
            } else {
                if (window.header) window.header.updateAuthState(null);
                console.log("No user logged in");

                if (window.editor) {
                    window.editor.currentUser = null;
                    window.editor.resetNotes();
                }
            }
        });
    }

    setupEventListeners() {
        // Modal event listeners
        document.addEventListener('click', (event) => {
            const loginModal = document.getElementById("loginPopup");
            const signupModal = document.getElementById("signupPopup");
            if (event.target === loginModal) this.closeModal("loginPopup");
            if (event.target === signupModal) this.closeModal("signupPopup");
        });
    }

    // Modal management
    openModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "flex";
    }

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.style.display = "none";
    }

    // Authentication methods
    async signup() {
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;
        
        try {
            await this._createUser(this.auth, email, password);
            console.log("Signed up:", email);
            this.closeModal("signupPopup");
        } catch (err) {
            alert(err.message);
        }
    }

    async login() {
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        
        try {
            await this._signIn(this.auth, email, password);
            console.log("Logged in:", email);
            this.closeModal("loginPopup");
        } catch (err) {
            alert(err.message);
        }
    }

    async logout() {
        try {
            await this._signOut(this.auth);
        } catch (err) {
            console.error("Logout error:", err);
        }
    }

    async googleLogin() {
        try {
            const result = await this._signInWithPopup(this.auth, this.provider);
            const user = result.user;
            console.log("Google login success:", user.email);
            this.closeModal("loginPopup");
        } catch (err) {
            alert("Google login failed: " + err.message);
            console.error(err);
        }
    }

    // Expose methods to global scope
    exposeToGlobal() {
        window.openModal = (id) => this.openModal(id);
        window.closeModal = (id) => this.closeModal(id);
        window.signup = () => this.signup();
        window.login = () => this.login();
        window.logout = () => this.logout();
        window.googleLogin = () => this.googleLogin();
    }
}
