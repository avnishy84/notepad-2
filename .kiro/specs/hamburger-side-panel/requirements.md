# Requirements Document

## Introduction

This feature consolidates all header action buttons into the hamburger side panel, making the header cleaner and the side panel the single hub for navigation, auth, and actions. The hamburger ☰ button becomes the only interactive element in the header (alongside the tabs row). The side panel is redesigned to cleanly accommodate: an auth section, nav links, action buttons, and the document list. The format toggle button (#formatToggle) is a separate floating element and is out of scope.

## Glossary

- **Header**: The `<header>` element at the top of `index.html`, containing the header-top row and the tabs row.
- **Header_Top**: The `.header-top` div inside the header, currently holding auth buttons, action buttons, and the hamburger.
- **Side_Panel**: The `#sidePanel` drawer element that slides in from the side when the hamburger is clicked.
- **Hamburger**: The `.hamburger` button (☰) that toggles the Side_Panel open/closed.
- **Auth_Section**: The login/signup buttons shown to unauthenticated users, or the logout button shown to authenticated users.
- **Nav_Links**: The About and Settings anchor links currently in `.actions`.
- **Action_Buttons**: The Game (🎮), Dark Mode toggle (🌙/☀️), and Download (⬇️) buttons currently in `.actions`.
- **Doc_List**: The `#mobileDocList` unordered list showing the user's note names inside the Side_Panel.
- **New_Note_Button**: The `#newNoteBtn` button that creates a new note.
- **Header_Component**: The `Header` class in `public/js/components/Header.js`.
- **Format_Toggle**: The `#formatToggle` floating button — out of scope for this feature.

---

## Requirements

### Requirement 1: Hamburger is the only interactive element in the header top row

**User Story:** As a user, I want a clean, minimal header so that the interface is uncluttered and I can focus on writing.

#### Acceptance Criteria

1. THE Header_Top SHALL contain only the Hamburger button as an interactive element after this feature is implemented.
2. THE Header_Component SHALL hide the Auth_Section, Nav_Links, and Action_Buttons from the Header_Top.
3. THE Hamburger SHALL be visible at all times, regardless of screen width or viewport size.
4. WHEN the page loads, THE Header_Top SHALL render with only the Hamburger visible (no auth buttons, no action buttons, no nav links).

---

### Requirement 2: Side panel contains the auth section

**User Story:** As a user, I want to log in, sign up, or log out from the side panel so that auth actions are accessible without cluttering the header.

#### Acceptance Criteria

1. WHEN the user is not authenticated, THE Side_Panel SHALL display Login and Signup buttons.
2. WHEN the user is authenticated, THE Side_Panel SHALL display the Logout button and the authenticated user's email address.
3. WHEN the auth state changes, THE Side_Panel SHALL update its auth section to reflect the new state without requiring a page reload.
4. WHEN a Login or Signup button in the Side_Panel is clicked, THE Side_Panel SHALL close and the corresponding auth modal SHALL open.
5. WHEN the Logout button in the Side_Panel is clicked, THE Side_Panel SHALL close and the logout action SHALL execute.

---

### Requirement 3: Side panel contains navigation links

**User Story:** As a user, I want to navigate to About and Settings pages from the side panel so that all navigation is in one place.

#### Acceptance Criteria

1. THE Side_Panel SHALL contain a link to `about.html` labelled "About".
2. THE Side_Panel SHALL contain a link to `settings.html` labelled "Settings".
3. WHEN a nav link in the Side_Panel is clicked, THE browser SHALL navigate to the corresponding page.

---

### Requirement 4: Side panel contains action buttons

**User Story:** As a user, I want to access the Game, Dark Mode toggle, and Download actions from the side panel so that all actions are reachable from one place.

#### Acceptance Criteria

1. THE Side_Panel SHALL contain a Game button that opens the Snake game.
2. THE Side_Panel SHALL contain a Dark Mode toggle button.
3. WHEN Dark Mode is active, THE Dark_Mode_Button in the Side_Panel SHALL display the 🌙 icon; WHEN Dark Mode is inactive, THE Dark_Mode_Button SHALL display the ☀️ icon.
4. THE Side_Panel SHALL contain a Download button that triggers the current note download.
5. WHEN the Game button in the Side_Panel is clicked, THE Side_Panel SHALL close and the Snake game SHALL open.
6. WHEN the Download button in the Side_Panel is clicked, THE Side_Panel SHALL close and the current note SHALL be downloaded.
7. WHEN the Dark Mode toggle in the Side_Panel is clicked, THE Header_Component SHALL toggle dark mode and persist the preference to `localStorage`.

---

### Requirement 5: Side panel contains the document list and new note action

**User Story:** As a user, I want to see and switch between my notes from the side panel so that document management is accessible in one place.

#### Acceptance Criteria

1. WHEN the Side_Panel is opened, THE Doc_List SHALL be populated with the names of all current notes.
2. WHEN a note name in the Doc_List is clicked, THE Side_Panel SHALL close and THE Editor SHALL switch to that note.
3. THE Side_Panel SHALL contain the New_Note_Button so that users can create a new note from the panel.
4. WHEN the New_Note_Button in the Side_Panel is clicked, THE Side_Panel SHALL close and a new note SHALL be created.
5. WHEN the Side_Panel is opened and no notes exist, THE Doc_List SHALL display an empty state message "No documents yet".

---

### Requirement 6: Side panel layout and visual design

**User Story:** As a user, I want the side panel to be well-organised and easy to scan so that I can find actions quickly.

#### Acceptance Criteria

1. THE Side_Panel SHALL organise its content into clearly separated sections in this order: close button, auth section, nav links, action buttons, document list.
2. THE Side_Panel SHALL display section labels (e.g. "Navigation", "Actions", "Your Documents") to visually separate each group.
3. THE Side_Panel SHALL be scrollable WHEN its content exceeds the viewport height.
4. WHEN the Side_Panel is open and the user clicks outside of it, THE Side_Panel SHALL close.
5. THE Side_Panel SHALL include a visible close button (✖) that closes the panel WHEN clicked.

---

### Requirement 7: Backward compatibility — no duplicate hidden buttons

**User Story:** As a developer, I want the old duplicate mobile-only buttons removed so that the codebase is clean and there are no redundant DOM elements.

#### Acceptance Criteria

1. THE Header_Component SHALL remove the legacy `#gameBtnMobile`, `#darkToggleMobile`, `#downloadBtnMobile`, and `#logoutBtnMobile` duplicate button elements from the DOM.
2. THE Header_Component SHALL wire action button event listeners directly to the canonical Side_Panel buttons rather than delegating through hidden header buttons.
3. THE Side_Panel SHALL NOT contain duplicate button sets for the same action.
