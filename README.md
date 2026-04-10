# One Notepad — Technical Documentation

> A vanilla JS, Firebase-hosted web-based note-taking app with rich text editing, cloud sync, dark mode, and a built-in Snake game.

**Live:** https://notepad-2-e34b1.web.app  
**Repo:** https://github.com/avnishy84/notepad-2  
**Author:** Avnish Yadav (`avnishy84`)

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Component Reference](#component-reference)
5. [Data Model](#data-model)
6. [Authentication Flow](#authentication-flow)
7. [State Management](#state-management)
8. [Routing & Pages](#routing--pages)
9. [Side Panel System](#side-panel-system)
10. [Dark Mode System](#dark-mode-system)
11. [Editor & Save System](#editor--save-system)
12. [Toolbar System](#toolbar-system)
13. [Snake Game](#snake-game)
14. [Firebase Configuration](#firebase-configuration)
15. [Local Development](#local-development)
16. [Deployment](#deployment)
17. [Known Issues & TODOs](#known-issues--todos)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS (ES6 modules), HTML5, CSS3 |
| Auth | Firebase Authentication (email/password + Google OAuth) |
| Database | Firebase Firestore (NoSQL, real-time) |
| Hosting | Firebase Hosting |
| Icons | Font Awesome 6.4.0 (CDN) |
| Font | Inter (Google Fonts) |
| Firebase SDK | v11.0.0 (loaded via CDN `gstatic.com`) |
| Package manager | npm (only for Firebase CLI tooling) |

No build step, no bundler, no framework. Static files served directly from `public/`.

---

## Project Structure

```
notepad-2/
├── public/                          # All served static files
│   ├── index.html                   # Main editor page
│   ├── about.html                   # About / feature showcase page
│   ├── settings.html                # User settings page
│   ├── assets/
│   │   ├── fav-icon.svg             # Favicon
│   │   └── icon.svg                 # App icon
│   ├── css/
│   │   ├── style.css                # Global stylesheet (all pages)
│   │   ├── about.css                # About page specific styles
│   │   └── game.css                 # Snake game styles
│   └── js/
│       ├── app/
│       │   ├── main.js              # App orchestrator / entry point
│       │   └── app.js               # Legacy file (fully commented out)
│       ├── components/
│       │   ├── Auth.js              # Firebase auth, exposes window.auth
│       │   ├── Editor.js            # Note CRUD, Firestore save/load
│       │   ├── Header.js            # Hamburger, side panel, dark mode
│       │   ├── Footer.js            # Word/char count
│       │   ├── Toolbar.js           # Rich text formatting, shortcuts
│       │   ├── Settings.js          # User settings, export, delete account
│       │   ├── About.js             # FAQ, contact form, share buttons
│       │   ├── Game.js              # Built-in Snake game (~984 lines)
│       │   └── shared/
│       │       ├── HeaderTemplate.js    # Unused HTML templates
│       │       ├── FooterTemplate.js    # Unused HTML templates
│       │       └── ModalTemplate.js     # Login/Signup modal templates
│       ├── firebase/
│       │   └── firebase.js          # Firebase app init, exports auth + db
│       └── data/
│           └── sync.js              # Standalone Firestore helpers (unused)
├── firebase.json                    # Hosting + Firestore config
├── firestore.rules                  # Database security rules
├── firestore.indexes.json           # No custom indexes
├── .firebaserc                      # Default project: notepad-2-e34b1
├── package.json                     # firebase ^12.1.0 (npm dep)
└── scripts/
    └── quarantine_unused.sh         # Move unused files script
```

---

## Architecture Overview

### Initialization Flow (`main.js`)

```
DOMContentLoaded
  └── new App()
        ├── new Auth()  ← awaited first (sets up Firebase + globals)
        ├── new Header()
        ├── new Footer()
        ├── new Toolbar()
        ├── new Game()
        ├── new Editor()     (index.html only)
        ├── new About()      (about.html only)
        └── new Settings()   (settings.html only)
              └── exposeToGlobal() called on each component
```

### Cross-Component Communication

All components communicate via `window.*` globals exposed by `exposeToGlobal()`:

| Global | Type | Set by |
|---|---|---|
| `window.auth` | Auth class instance | main.js |
| `window.firebaseAuth` | Firebase Auth object | Auth.js |
| `window.db` | Firestore instance | Auth.js |
| `window.header` | Header instance | main.js |
| `window.editor` | Editor instance | main.js |
| `window.footer` | Footer instance | main.js |
| `window.toolbar` | Toolbar instance | main.js |
| `window.game` | Game instance | main.js |
| `window.notes` | Live getter → `editor.notes` | Editor.js |
| `window.toggleMenu()` | Opens/closes side panel | Header.js |
| `window.openNote(name)` | Switches active note | Editor.js |
| `window.newNote()` | Creates a new note | Editor.js |
| `window.doc`, `window.getDoc`, etc. | Firestore helpers | Auth.js |

### Page Detection

```js
isEditorPage()   → pathname === '/' or ends with 'index.html'
isAboutPage()    → ends with 'about.html'
isSettingsPage() → ends with 'settings.html'
```

---

## Component Reference

### `Auth.js`
- Imports Firebase auth/firestore from CDN inside `setupAuth()`
- Sets up `onAuthStateChanged` listener
- On login: calls `window.editor.loadNotes(uid)` and `window.header.updateAuthState(user)`
- On logout: calls `window.editor.resetNotes()` and `window.header.updateAuthState(null)`
- Exposes: `openModal(id)`, `closeModal(id)`, `login()`, `signup()`, `logout()`, `googleLogin()`
- **Important:** `window.auth` = Auth class instance. `window.firebaseAuth` = raw Firebase auth object.

### `Editor.js`
- Notes stored in memory as `{ "Note Name": "<html content>" }`
- Firestore path: `users/{uid}` → `{ notes: { [noteName]: htmlContent } }`
- **Debounced save:** 800ms after last keystroke, serialised to prevent concurrent writes
- `loadNotes(uid)`: fetches from Firestore, sorts alphabetically, loads last note
- `saveNotes()`: serialised async write with `_saving` flag guard
- `resetNotes()`: resets to `{ "Note 1": "" }` on logout
- `switchNote(name)`: flushes pending debounce, saves current, loads new
- `closeNote(name)`: confirms if content exists, then calls `actuallyCloseNote`
- `persistDeletion(name)`: uses `deleteField()` to remove from Firestore
- `downloadNote()`: saves current note as `.html` file
- Exposes `window.notes` as a live getter (not a copy)

### `Header.js`
- Manages hamburger button, side panel open/close, overlay backdrop
- `toggleMenu()` / `openSidePanel()` / `closeSidePanel()`
- `populateMobileDocList()`: renders note list in side panel with active highlight and delete buttons
- `renderTabs()`: no-op stub (tabs removed) — calls `populateMobileDocList()` to keep list in sync
- `updateAuthUI(user)`: shows/hides login/logout/email in side panel
- `syncDarkModeIcon()`: reads `localStorage('darkMode')` and applies on load
- `toggleDarkMode()`: toggles `body.dark`, persists to localStorage

### `Footer.js`
- `updateStatus(editorEl)`: counts words and characters, updates `#status` span

### `Toolbar.js`
- Rich text via `document.execCommand()`
- Font size: 12–48px, step 2px, persisted in `localStorage('editorFontSizePx')`
- Font color: persisted in `localStorage('editorFontColor')`
- Custom shortcuts: `Ctrl+Shift+S` opens dialog, `Ctrl+Alt+[key]` triggers
- Custom shortcuts persisted in `localStorage('customShortcuts')`
- Desktop toolbar always visible (no toggle)
- Mobile: floating toolbar + "more" popup

### `Settings.js`
- Loads/saves to `localStorage('appSettings')`
- Settings: `defaultFontSize`, `autoSave`, `spellCheck`, `theme`, `fontFamily`
- Uses `window.firebaseAuth.currentUser` for account operations
- Export: downloads Firestore user data as JSON
- Delete account: wipes Firestore doc + deletes Firebase user

### `Game.js` (~984 lines)
- Full Snake game in a draggable modal
- Canvas-based rendering with particles, power-ups, levels
- Wall wrap-around: snake passes through walls and emerges from opposite side
- Power-ups: speed, slow, double points, ghost, shrink
- Difficulty: easy/normal/hard (affects speed + power-up frequency)
- High score persisted in `localStorage`

### `About.js`
- FAQ accordion toggle
- Contact form → saves to Firestore `users/{uid}/contact`
- Share buttons (Twitter, Facebook, LinkedIn)
- Back-to-top button

---

## Data Model

```
Firestore: users/{uid}
{
  notes: {
    "Note 1": "<p>html content</p>",
    "10-04-2026 10:18:49": "<p>...</p>"
  },
  deletedNotes: {
    "Note 1": {
      deleted: true,
      deletedAt: "2026-04-10T10:18:49.000Z"
    }
  },
  contact: {
    name: "string",
    email: "string",
    message: "string",
    timestamp: ServerTimestamp
  }
}
```

Note names are either `"Note 1"` (default) or `"DD-MM-YYYY HH:MM:SS"` (auto-generated timestamps).

---

## Authentication Flow

```
User clicks Login/Signup in side panel
  → Header.js closes panel
  → window.auth.openModal('loginPopup')
  → User submits form
  → Auth.js calls Firebase signIn/createUser
  → onAuthStateChanged fires
      ├── window.header.updateAuthState(user)   ← updates side panel UI
      ├── window.editor.currentUser = user
      └── window.editor.loadNotes(user.uid)     ← fetches from Firestore
```

Logout flow:
```
User clicks Logout in side panel
  → Auth.js calls Firebase signOut
  → onAuthStateChanged fires with null
      ├── window.header.updateAuthState(null)
      ├── window.editor.currentUser = null
      └── window.editor.resetNotes()            ← clears to default
```

---

## State Management

No state management library. State lives in component instances:

| State | Location |
|---|---|
| Current notes object | `editor.notes` (in-memory) |
| Current active note | `editor.currentNote` |
| Current user | `editor.currentUser` |
| Dark mode | `localStorage('darkMode')` + `body.dark` class |
| Font size | `localStorage('editorFontSizePx')` |
| Font color | `localStorage('editorFontColor')` |
| Custom shortcuts | `localStorage('customShortcuts')` |
| App settings | `localStorage('appSettings')` |
| Snake high score | `localStorage` |

---

## Routing & Pages

Firebase Hosting rewrites all routes to `index.html` (SPA-style), but the app uses separate HTML files per page:

| URL | File | Components loaded |
|---|---|---|
| `/` or `/index.html` | `index.html` | Auth, Header, Footer, Toolbar, Editor, Game |
| `/about.html` | `about.html` | Auth, Header, About, Game |
| `/settings.html` | `settings.html` | Auth, Header, Settings, Game |

---

## Side Panel System

The side panel is a `position: fixed` drawer that slides in from the left using CSS `transform: translateX(-100%)` → `translateX(0)`.

**Structure (in order):**
1. Close button (`#closePanelBtn`)
2. Auth section (`#sidePanelAuth`) — Login/Signup or email + Logout
3. Navigation section — links to other pages
4. Actions section — Game, Dark Mode, Download buttons
5. Documents section — `+ New Note` button + `#mobileDocList`

**Key behaviours:**
- Overlay backdrop (`#sidePanelOverlay`) closes panel on click
- `populateMobileDocList()` called on open and on every `renderTabs()` call
- Active note highlighted with `.doc-item-active` class
- Each doc item has a `✕` delete button

---

## Dark Mode System

1. **Pre-render:** Inline `<script>` in `<head>` adds `html.dark-init` class before CSS loads (prevents flash)
2. **On init:** `Header.syncDarkModeIcon()` reads `localStorage('darkMode')`, adds `body.dark` if true
3. **On toggle:** `Header.toggleDarkMode()` toggles `body.dark`, persists to localStorage
4. **CSS:** All colors use CSS variables (`--bg`, `--text`, `--muted`, `--accent`, `--header-btn-*`) defined in `:root` (light) and `body.dark` (dark)

---

## Editor & Save System

### Save flow
```
User types
  → handleEditorInput()
      ├── this.notes[currentNote] = editor.innerHTML  (immediate, in-memory)
      ├── updateStatus()
      └── scheduleSave()  (debounce 800ms)
            └── saveNotes()
                  ├── Guard: if _saving → scheduleSave() again, return
                  ├── _saving = true
                  ├── setDoc(merge: true) to Firestore
                  └── _saving = false
```

### Note switch flow
```
switchNote(name)
  ├── Cancel pending debounce timer
  ├── Save current note to this.notes[currentNote]
  ├── this.currentNote = name
  ├── editor.innerHTML = this.notes[name]
  ├── saveNotes() immediately
  └── renderTabs() → populateMobileDocList()
```

---

## Toolbar System

Desktop toolbar is always visible below the header. Buttons call global functions exposed by `Toolbar.exposeToGlobal()`:

| Button | Function | Command |
|---|---|---|
| B | `formatText('bold')` | `execCommand('bold')` |
| I | `formatText('italic')` | `execCommand('italic')` |
| U | `formatText('underline')` | `execCommand('underline')` |
| S | `formatText('strikeThrough')` | `execCommand('strikeThrough')` |
| `"` | Quote | `execCommand('formatBlock', 'blockquote')` |
| `{;}` | Code | `execCommand('formatBlock', 'pre')` |
| `1.` | Ordered list | `execCommand('insertOrderedList')` |
| `•` | Bullet list | `execCommand('insertUnorderedList')` |
| H1/H2 | Headings | `execCommand('formatBlock', 'h1/h2')` |
| A- / A+ | Font size | Custom px manipulation |
| 🎨 | Color picker | `execCommand('foreColor')` |
| ⚡ | Custom shortcuts | Dialog |
| Clear | Remove format | `execCommand('removeFormat')` |

Mobile: floating toolbar at bottom with a "more" popup for additional options.

---

## Snake Game

- Opens in a draggable modal (`#gameBox`)
- Canvas-based rendering (`#gameCanvas`)
- Grid: `this.gridSize × this.gridSize` tiles
- **Wall behaviour:** Snake wraps through walls (portal mode — always on)
- Game loop via `setInterval` with speed based on difficulty
- Power-ups spawn randomly, each with a duration bar
- Difficulty levels affect base speed and power-up frequency

---

## Firebase Configuration

```js
// public/js/firebase/firebase.js
apiKey: "AIzaSyB25gCbsB330Z3ACjOmKNLDjUzU4ZXvwwY"
authDomain: "notepad-2-e34b1.firebaseapp.com"
projectId: "notepad-2-e34b1"
storageBucket: "notepad-2-e34b1.firebasestorage.app"
messagingSenderId: "454576192778"
appId: "1:454576192778:web:d087965f804ec594914ef3"
measurementId: "G-Y1XR5RDXR1"
```

Firestore region: `asia-south1`

---

## Local Development

```bash
# Install Firebase CLI (once)
npm install -g firebase-tools

# Login
firebase login

# Install dependencies
npm install

# Serve locally (http://localhost:5000)
firebase serve

# With emulators
firebase emulators:start
```

No build step required — edit files and refresh.

---

## Deployment

```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy everything (hosting + firestore rules)
firebase deploy
```

---

## Known Issues & TODOs

| Issue | Status |
|---|---|
| `firestore.rules` allows open read/write until 2025-09-22 | ⚠️ Needs proper auth-based rules |
| Firebase SDK version mismatch: `package.json` has `^12.1.0` but CDN uses `11.0.0` | ⚠️ Should align |
| `sync.js` in `data/` is unused (different Firestore path) | 🗑️ Can be deleted |
| `app.js` is fully commented out legacy code | 🗑️ Can be deleted |
| `HeaderTemplate.js`, `FooterTemplate.js`, `ModalTemplate.js` are unused | 🗑️ Can be deleted |
| Contact form requires login — anonymous feedback not possible | 📋 Future improvement |
| No offline support / service worker | 📋 Future improvement |
