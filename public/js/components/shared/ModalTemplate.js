// Shared Modal Template
export class ModalTemplate {
    static renderLoginModal() {
        return `
            <div id="loginPopup" class="modal">
                <div class="modal-content auth-box">
                    <span class="popup-close-btn" onclick="closeModal('loginPopup')">&times;</span>
                    <h2 class="auth-title">Welcome Back 👋</h2>

                    <input type="email" id="loginEmail" placeholder="Email" class="auth-input" />
                    <input type="password" id="loginPassword" placeholder="Password" class="auth-input" />

                    <button class="auth-btn" onclick="login()">Login</button>

                    <div class="auth-divider"><span>or</span></div>

                    <button class="google-btn" onclick="googleLogin()">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                        Continue with Google
                    </button>
                </div>
            </div>
        `;
    }

    static renderSignupModal() {
        return `
            <div id="signupPopup" class="modal">
                <div class="modal-content auth-box">
                    <span class="popup-close-btn" onclick="closeModal('signupPopup')">&times;</span>
                    <h2 class="auth-title">Create an Account</h2>
                    <input id="signupEmail" type="email" placeholder="Email" class="auth-input" />
                    <input id="signupPassword" type="password" placeholder="Password" class="auth-input" />
                    <button class="auth-btn" onclick="signup()">Signup</button>
                </div>
            </div>
        `;
    }

    static renderAllModals() {
        return this.renderLoginModal() + this.renderSignupModal();
    }
}
