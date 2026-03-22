# Implementation Plan: Hamburger Side Panel

## Overview

Consolidate all header action buttons into the hamburger side panel. The header top row will contain only the hamburger button. The side panel becomes the single hub for auth, navigation, actions, and the document list. Changes are confined to `public/index.html`, `public/css/style.css`, and `public/js/components/Header.js`.

## Tasks

- [x] 1. Clean up `index.html` — strip header-top of everything except the hamburger
  - Remove the `.actions` div (auth buttons, nav links, game/dark mode/download buttons) from `.header-top`
  - Remove legacy mobile-only duplicate buttons: `#gameBtnMobile`, `#darkToggleMobile`, `#downloadBtnMobile`, `#logoutBtnMobile`
  - Ensure `.header-top` contains only the `.hamburger` button after cleanup
  - _Requirements: 1.1, 1.2, 1.4, 7.1_

- [x] 2. Redesign the side panel markup in `index.html`
  - [x] 2.1 Add auth section inside `#sidePanel`
    - Add a `<div id="sidePanelAuth">` block with Login and Signup buttons (shown when logged out) and Logout button + email span (shown when logged in)
    - _Requirements: 2.1, 2.2_

  - [x] 2.2 Add nav links section inside `#sidePanel`
    - Add a labelled section ("Navigation") with `<a href="about.html">About</a>` and `<a href="settings.html">Settings</a>`
    - _Requirements: 3.1, 3.2, 6.1, 6.2_

  - [x] 2.3 Add action buttons section inside `#sidePanel`
    - Add a labelled section ("Actions") with Game (`#gameBtnPanel`), Dark Mode (`#darkTogglePanel`), and Download (`#downloadBtnPanel`) buttons
    - _Requirements: 4.1, 4.2, 4.4, 6.1, 6.2_

  - [x] 2.4 Add document list section inside `#sidePanel`
    - Add a labelled section ("Your Documents") containing `#newNoteBtn` and `#mobileDocList`
    - Add an empty-state `<li>` with text "No documents yet" as the default list content
    - _Requirements: 5.1, 5.3, 5.5, 6.1, 6.2_

- [x] 3. Update `style.css` for the new side panel layout
  - [x] 3.1 Remove or update CSS rules that targeted the now-deleted header-top buttons (`.actions`, auth button wrappers, mobile-only button rules)
    - _Requirements: 1.1, 7.1_

  - [x] 3.2 Style the side panel sections
    - Add styles for `#sidePanelAuth`, nav section, actions section, and doc list section with clear visual separation (borders, padding, or spacing)
    - Ensure the panel is scrollable when content overflows (`overflow-y: auto` on `#sidePanel`)
    - Style section labels to be visually distinct (e.g. uppercase, muted colour)
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 3.3 Ensure the hamburger is always visible
    - Remove any media queries that hide `.hamburger` at wider viewports
    - _Requirements: 1.3_

- [x] 4. Update `Header.js` — wire up side panel interactions
  - [x] 4.1 Remove event listener wiring for deleted header-top buttons
    - Delete any `querySelector` / `addEventListener` calls targeting `.actions` buttons, `#gameBtnMobile`, `#darkToggleMobile`, `#downloadBtnMobile`, `#logoutBtnMobile`
    - _Requirements: 7.2_

  - [x] 4.2 Wire auth section in the side panel
    - Attach click handlers on `#sidePanelAuth` Login/Signup buttons: close panel → call `window.auth.openModal()`
    - Attach click handler on Logout button: close panel → call `window.auth.logout()`
    - _Requirements: 2.4, 2.5_

  - [x] 4.3 Wire action buttons in the side panel
    - Game button (`#gameBtnPanel`): close panel → call `window.game.openGame()`
    - Download button (`#downloadBtnPanel`): close panel → call `window.editor.downloadNote()`
    - Dark mode toggle (`#darkTogglePanel`): toggle dark mode, persist to `localStorage('darkMode')`, update button icon
    - _Requirements: 4.5, 4.6, 4.7_

  - [x] 4.4 Update `updateAuthUI()` to target side panel auth elements
    - When logged out: show Login/Signup buttons in `#sidePanelAuth`, hide logout/email
    - When logged in: show email + Logout button in `#sidePanelAuth`, hide Login/Signup
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 4.5 Update dark mode icon sync to target `#darkTogglePanel`
    - On page load and on toggle, set the correct icon (🌙 / ☀️) on `#darkTogglePanel`
    - _Requirements: 4.3_

  - [x] 4.6 Update doc list close-on-click behaviour
    - When a note in `#mobileDocList` is clicked: close panel → switch note
    - When `#newNoteBtn` is clicked: close panel → create new note
    - _Requirements: 5.2, 5.4_

- [x] 5. Checkpoint — smoke test all interactions
  - Ensure all tests pass, ask the user if questions arise.
  - Verify: hamburger opens/closes panel, auth buttons work, nav links navigate, game/download/dark mode work from panel, note switching works, outside-click closes panel
  - _Requirements: 1–7_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- No build step — changes take effect immediately via `firebase serve`
- `#formatToggle` is explicitly out of scope; do not touch it
- All button IDs in the side panel use a `Panel` suffix (e.g. `#darkTogglePanel`) to avoid conflicts with any remaining references
