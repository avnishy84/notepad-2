# One Notepad - Project Context

## Overview
"One Notepad" (repo: `notepad-2`) is a vanilla JS, Firebase-hosted web-based note-taking app. No build step — static files served directly from `public/`. Live at: https://notepad-2-e34b1.web.app

**Author:** Avnish Yadav  
**Firebase Project:** `notepad-2-e34b1`  
**Git Remote:** https://github.com/avnishy84/notepad-2.git  
**Git Local Config:** user `avnishy84`, email `avnishy84@gmail.com`

---

## Tech Stack
- Frontend: Vanilla JS (ES6 modules), CSS3, HTML5
- Auth: Firebase Authentication (email/password + Google OAuth)
- Database: Firebase Firestore (NoSQL)
- Hosting: Firebase Hosting
- Icons: Font Awesome 6.4.0
- Font: Inter (Google Fonts)
- Firebase SDK: v11.0.0 (loaded via CDN `gstatic.com`)

---

## Project Structure

```
notepad-2/
├── public/                        # All served static files
│   ├── index.html                 # Main editor page
│   ├── about.html                 # About page
│   ├── settings.html              # Settings page
│   ├── assets/
│   │   ├── fav-icon.svg
│   │   └── icon.svg
│   ├── css/
│   │   ├── style.css              # Main stylesheet (all pages)
│   │   ├── game.css               # Snake game styles
│   │   └── about.css              # About page styles
│   └── js/
│       ├── app/
│       │   ├── main.js            # App orchestrator (entry point)
│       │   └── app.js             # Legacy file — fully commented out, kept for reference
│       ├── components/
│       │   ├── Auth.js            # Firebase auth, exposes window.auth, window.db, etc.
│       │   ├── Editor.js          # Note CRUD, Firestore save/load, tab management
│       │   ├── Header.js          # Nav, dark mode, mobile side panel, tab rendering
│       │   ├── Footer.js          # Word/char count, back-to-top
│       │   ├── Toolbar.js         # Rich text formatting, font size, color, shortcuts
│       │   ├── Settings.js        # User settings, account info, export/delete
│       │   ├── About.js           # Contact form, FAQ, social share
│       │   ├── Game.js            # Built-in Snake game (canvas-based, ~984 lines)
│       │   └── shared/
│       │       ├── HeaderTemplate.js   # HTML templates for header (unused in current pages)
│       │       ├── FooterTemplate.js   # HTML templates for footer (unused in current pages)
│       │       └── ModalTemplate.js    # Login/Signup modal HTML templates
│       ├── firebase/
│       │   └── firebase.js        # Firebase init, exports: app, analytics, auth, db
│       └── data/
│           └── sync.js            # Standalone Firestore helpers (saveNote, loadNote, etc.) — not used by main app
├── firebase.json                  # Hosting config: public dir, SPA rewrite to index.html
├── firestore.rules                # Open read/write until 2025-09-22 (needs tightening)
├── firestore.indexes.json         # No custom indexes defined
├── .firebaserc                    # Default project: notepad-2-e34b1
├── package.json                   # Only dependency: firebase ^12.1.0 (npm), no build script
└── scripts/
    └── quarantine_unused.sh       # Shell script to move unused files
```

---

## Component Architecture

### Initialization Flow (`main.js`)
1. `DOMContentLoaded` → `new App()`
2. `Auth` initialized first and awaited (sets up Firebase + `window.auth`, `window.db`, etc.)
3. `Header`, `Footer`, `Toolbar`, `Game` always initialized
4. Page-specific: `Editor` (index), `About` (about), `Settings` (settings)
5. All components exposed to `window.*` for cross-component communication
6. `exposeToGlobal()` called on each component to expose methods for inline HTML handlers

### Page Detection
```js
isEditorPage()   → pathname === '/' or ends with 'index.html'
isAboutPage()    → ends with 'about.html'
isSettingsPage() → ends with 'settings.html'
```

### Cross-Component Communication
Components talk via `window.*` globals:
- `window.auth` → Auth instance (also `window.auth.currentUser`)
- `window.db` → Firestore instance
- `window.header` → Header instance
- `window.editor` → Editor instance
- `window.footer` → Footer instance
- `window.toolbar` → Toolbar instance
- `window.game` → Game instance
- `window.settings` → Settings instance
- `window.notes` → live getter for `editor.notes` (used by Header to populate doc list)
- `window.toggleMenu()` → opens/closes the side panel (called by hamburger inline onclick)
- `window.openNote(name)` → switches to a note (called by side panel doc list items)
- `window.newNote()` → creates a new note (alias for `editor.createNewNote()`)
- Firebase methods: `window.doc`, `window.getDoc`, `window.setDoc`, `window.serverTimestamp`, `window.deleteField`, `window.onAuthStateChanged`

---

## Key Component Details

### Auth.js
- Imports Firebase auth/firestore from CDN inside `setupAuth()`
- Sets up `onAuthStateChanged` listener
- On login: calls `window.editor.loadNotes(uid)`
- On logout: calls `window.editor.resetNotes()`
- Exposes: `openModal`, `closeModal`, `login`, `signup`, `logout`, `googleLogin`

### Editor.js
- Notes stored as `{ "Note 1": "<html content>" }` in memory
- Firestore path: `users/{uid}` → `{ notes: { [noteName]: htmlContent } }`
- `loadNotes(uid)`: fetches from Firestore, sorts alphabetically, selects last note
- `saveNotes()`: merges to Firestore on every input event
- `resetNotes()`: resets to `{ "Note 1": "" }` on logout
- Deletion: uses `deleteField()` to remove from Firestore, tracks in `deletedNotes`
- `downloadNote()`: saves current note as `.html` file (called by `#downloadBtnPanel` via Header.js)
- `newNote()` / `createNewNote()`: creates a timestamped note; exposed as `window.newNote` and `window.editor.newNote()`
- `window.notes` exposed as a live getter so Header.js can read the notes object
- Confirm dialog: dynamically creates a modal DOM element
- No longer wires `#newNoteBtn` or `#downloadBtn` directly — those are handled by Header.js

### Header.js
- Header-top contains only the hamburger button (☰) — all other actions moved to the side panel
- Side panel (`#sidePanel`) is the single hub for: auth, navigation, actions, and document list
- Side panel sections (in order): close button, auth, nav links, actions, document list
- `updateAuthUI(user)` / `updateAuthState(user)` (alias): shows login/signup or email+logout in `#sidePanelAuth`
- `renderTabs(notes, currentNote, onSwitch, onClose)`: called by Editor to render tab row
- `populateMobileDocList()`: populates `#mobileDocList` from `window.notes` when panel opens
- Dark mode: persisted in `localStorage('darkMode')`, icon synced on `#darkTogglePanel`
- `window.toggleMenu()` exposed globally for the inline `onclick` on the hamburger button
- Outside-click closes the panel; `#closePanelBtn` also closes it

### Toolbar.js
- Rich text via `document.execCommand()`
- Font size: 12–48px, step 2px, persisted in `localStorage('editorFontSizePx')`
- Font color: persisted in `localStorage('editorFontColor')`
- Custom shortcuts: `Ctrl+Shift+S` opens dialog, `Ctrl+Alt+[key]` triggers
- Custom shortcuts persisted in `localStorage('customShortcuts')`
- Format toggle button: shows/hides toolbar, auto-hides after 2s inactivity
- Mobile: floating toolbar + "more" popup

### Settings.js
- Loads/saves settings to `localStorage('appSettings')`
- Settings: `defaultFontSize`, `autoSave`, `spellCheck`, `theme`, `fontFamily`
- Auth display: uses `onAuthStateChanged` listener (polls until `window.onAuthStateChanged` is available)
- Export: downloads Firestore user data as JSON
- Delete account: wipes Firestore doc + deletes Firebase user

### Game.js (~984 lines)
- Full Snake game in a draggable modal
- Canvas-based rendering with particles, power-ups, levels
- Power-ups: speed, slow, double points, ghost (wall wrap), shrink
- Difficulty: easy/normal/hard (affects speed + power-up frequency)
- High score persisted in `localStorage`

---

## Firestore Data Model

```
users/
  {uid}/
    notes: {
      "Note 1": "<p>html content</p>",
      "DD-MM-YYYY HH:MM:SS": "<p>...</p>"
    }
    deletedNotes: {
      "Note 1": { deleted: true, deletedAt: "ISO string" }
    }
    contact: {          // from About page contact form
      name, email, message, timestamp
    }
```

---

## Firebase Config
```js
apiKey: "AIzaSyB25gCbsB330Z3ACjOmKNLDjUzU4ZXvwwY"
authDomain: "notepad-2-e34b1.firebaseapp.com"
projectId: "notepad-2-e34b1"
storageBucket: "notepad-2-e34b1.firebasestorage.app"
messagingSenderId: "454576192778"
appId: "1:454576192778:web:d087965f804ec594914ef3"
measurementId: "G-Y1XR5RDXR1"
```

---

## Local Development
```bash
npm install          # installs firebase ^12.1.0
firebase serve       # serves public/ locally
firebase emulators:start  # with emulators
```

Firebase CLI required globally: `npm install -g firebase-tools`

---

## Known Issues / Notes
- `firestore.rules` allows open read/write until 2025-09-22 — needs proper rules before then
- `sync.js` in `data/` is a standalone utility not used by the main app (uses a different Firestore path `notes/{uid}/userNotes/`)
- `app.js` is fully commented out legacy code — kept for reference only
- `HeaderTemplate.js` / `FooterTemplate.js` / `ModalTemplate.js` exist but HTML pages have their own inline header/footer (templates not actively injected)
- Read-only mode was removed — `Readonly.js` and `readonly.html` deleted
- Firebase SDK version mismatch: `package.json` has `firebase ^12.1.0` but CDN imports use `11.0.0`

---

## Recently Changed (Current Branch: master)
- Removed read-only mode entirely (Readonly.js, readonly.html, all nav links)
- Fixed Settings page auth display — added `onAuthStateChanged` listener so email shows correctly when logged in
- Git local config set to `avnishy84` / `avnishy84@gmail.com`
- **Hamburger side panel consolidation**: header-top stripped to hamburger only; side panel rebuilt as single hub with auth, nav, actions, and doc list sections; Header.js fully rewired to panel buttons; Editor.js cleaned of stale DOM refs
