// Shared Header Template
export class HeaderTemplate {
    static render() {
        return `
            <header>
                <div id="authContainer">
                    <!-- Auth buttons -->
                    <div id="authButtons">
                        <button onclick="openModal('loginPopup')">Login</button>
                        <button onclick="openModal('signupPopup')">Signup</button>
                    </div>

                    <!-- Logout (hidden until logged in) -->
                    <div id="logoutSection" style="display:none;">
                        <button onclick="logout()">Logout</button>
                    </div>
                </div>

                <div id="tabs"></div>

                <div class="actions">
                    <a href="about.html" class="link" title="About">
                        <i class="fa fa-info" aria-hidden="true"></i>
                    </a>
                    <button id="darkToggle">🌙</button>
                    <button id="downloadBtn">⬇️ Download</button>
                </div>

                <button class="hamburger" onclick="toggleMenu()">☰</button>
                
                <!-- Side Panel (Mobile Drawer) -->
                <div id="sidePanel" class="side-panel">
                    <div class="side-panel-content">
                        <button id="closePanelBtn" class="close-panel">✖</button>
                        <button id="newNoteBtn" class="tab-new">+ New Note</button>
                        <h3 class="panel-title">Your Documents</h3>
                        <ul id="mobileDocList" class="doc-list"></ul>

                        <!-- Move/copy existing buttons here dynamically -->
                        <div id="sidePanelButtons"></div>
                    </div>

                    <!-- Bottom actions section -->
                    <div class="side-panel-bottom-actions">
                        <div class="bottom-actions-container">
                            <button id="darkToggleMobile">🌙</button>
                            <button id="downloadBtnMobile">⬇️ Download</button>
                            <button id="logoutBtnMobile">Logout</button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    static renderAboutPage() {
        return `
            <header class="header-about">
                <div id="authContainer">
                    <!-- Auth buttons -->
                    <div id="authButtons">
                        <button onclick="openModal('loginPopup')">Login</button>
                        <button onclick="openModal('signupPopup')">Signup</button>
                    </div>

                    <!-- Logout (hidden until logged in) -->
                    <div id="logoutSection" style="display:none;">
                        <button onclick="logout()">Logout</button>
                    </div>
                </div>

                <div id="tabs"></div>

                <div class="actions">
                    <a href="index.html" class="link" title="Editor">
                        <i class="fa fa-pencil" aria-hidden="true"></i>
                    </a>
                    <button id="darkToggle">🌙</button>
                    <button id="downloadBtn">⬇️ Download</button>
                </div>

                <button class="hamburger" onclick="toggleMenu()">☰</button>
                
                <!-- Side Panel (Mobile Drawer) -->
                <div id="sidePanel" class="side-panel">
                    <div class="side-panel-content">
                        <button id="closePanelBtn" class="close-panel">✖</button>
                        <button id="newNoteBtn" class="tab-new">+ New Note</button>
                        <h3 class="panel-title">Your Documents</h3>
                        <ul id="mobileDocList" class="doc-list"></ul>

                        <!-- Move/copy existing buttons here dynamically -->
                        <div id="sidePanelButtons"></div>
                    </div>

                    <!-- Bottom actions section -->
                    <div class="side-panel-bottom-actions">
                        <div class="bottom-actions-container">
                            <button id="darkToggleMobile">🌙</button>
                            <button id="downloadBtnMobile">⬇️ Download</button>
                            <button id="logoutBtnMobile">Logout</button>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }
}
