// Auth Component
export class Auth {
    constructor() {
        this.auth = null;
        this.db = null;
        this.provider = null;
        
        this.init();
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
                onAuthStateChanged
            } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js");
            const {
                doc,
                getDoc,
                setDoc,
                serverTimestamp,
                deleteField
            } = await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js");
            const { GoogleAuthProvider, signInWithPopup } = 
                await import("https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js");

            this.auth = auth;
            this.db = db;
            this.provider = new GoogleAuthProvider();

            // Expose to global scope for other components
            window.auth = auth;
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
        if (!this.auth) return;

        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                // User is logged in
                if (window.header) {
                    window.header.updateAuthState(user);
                }
                console.log("User logged in:", user.email);

                // Load notes for the user
                if (window.editor) {
                    window.editor.loadNotes(user.uid);
                }
            } else {
                // User is logged out
                if (window.header) {
                    window.header.updateAuthState(null);
                }
                console.log("No user logged in");

                // Reset local notes when logged out
                if (window.editor) {
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
            await createUserWithEmailAndPassword(this.auth, email, password);
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
            await signInWithEmailAndPassword(this.auth, email, password);
            console.log("Logged in:", email);
            this.closeModal("loginPopup");
        } catch (err) {
            alert(err.message);
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
        } catch (err) {
            console.error("Logout error:", err);
        }
    }

    async googleLogin() {
        try {
            const result = await signInWithPopup(this.auth, this.provider);
            const user = result.user;
            console.log("Google login success:", user.email);
            this.closeModal("loginPopup"); // auto close popup
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
