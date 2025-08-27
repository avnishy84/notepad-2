# Component-Based Architecture Documentation

## Overview
The notepad application has been restructured into a modular, component-based architecture for better maintainability and scalability.

## Folder Structure

```
public/
├── js/
│   ├── app/
│   │   ├── main.js                 # Main application orchestrator
│   │   └── app.js                  # Legacy app file (deprecated)
│   ├── components/
│   │   ├── Header.js               # Header component (auth, tabs, mobile menu)
│   │   ├── Footer.js               # Footer component (status, back-to-top)
│   │   ├── Toolbar.js              # Toolbar component (text formatting)
│   │   ├── Editor.js               # Editor component (note management)
│   │   ├── Auth.js                 # Authentication component
│   │   ├── About.js                # About page component
│   │   └── shared/
│   │       ├── HeaderTemplate.js   # Shared header HTML templates
│   │       ├── FooterTemplate.js   # Shared footer HTML templates
│   │       └── ModalTemplate.js    # Shared modal HTML templates
│   ├── firebase/
│   │   └── firebase.js             # Firebase configuration
│   └── data/
│       └── sync.js                 # Data synchronization utilities
├── css/
│   ├── style.css                   # Main styles
│   └── about.css                   # About page styles
├── index.html                      # Main editor page
└── about.html                      # About page
```

## Component Architecture

### 1. Main App (`main.js`)
- **Purpose**: Orchestrates all components and manages their lifecycle
- **Responsibilities**:
  - Initialize components based on current page
  - Set up component communication
  - Expose methods to global scope
  - Handle page-specific component loading

### 2. Header Component (`Header.js`)
- **Purpose**: Manages the application header and navigation
- **Responsibilities**:
  - Authentication state management
  - Tab rendering and management
  - Mobile menu functionality
  - Dark mode toggle
  - Navigation between pages

### 3. Footer Component (`Footer.js`)
- **Purpose**: Manages the application footer
- **Responsibilities**:
  - Word/character count display
  - Back-to-top functionality
  - Status updates

### 4. Toolbar Component (`Toolbar.js`)
- **Purpose**: Handles text formatting and editor controls
- **Responsibilities**:
  - Text formatting (bold, italic, etc.)
  - Font size management
  - Color picker functionality
  - Keyboard shortcuts
  - Selection management

### 5. Editor Component (`Editor.js`)
- **Purpose**: Manages the main editor functionality
- **Responsibilities**:
  - Note creation, editing, and deletion
  - Note switching and management
  - Content saving and loading
  - Download functionality
  - Confirm dialogs

### 6. Auth Component (`Auth.js`)
- **Purpose**: Handles all authentication-related functionality
- **Responsibilities**:
  - User registration and login
  - Google authentication
  - Firebase integration
  - Modal management
  - Auth state management

### 7. About Component (`About.js`)
- **Purpose**: Manages about page specific functionality
- **Responsibilities**:
  - Contact form handling
  - FAQ functionality
  - Social sharing
  - Tech stack display

## Shared Templates

### HeaderTemplate
- Provides consistent header HTML across pages
- Supports both editor and about page variants

### FooterTemplate
- Provides consistent footer HTML across pages
- Supports both editor and about page variants

### ModalTemplate
- Provides authentication modal HTML
- Reusable across all pages

## Component Communication

Components communicate through:
1. **Global scope**: Methods exposed via `window` object
2. **Event listeners**: Direct event handling
3. **Component references**: Direct component instance access

## Adding New Pages

To add a new page:

1. **Create the HTML file** (e.g., `settings.html`)
2. **Create a new component** (e.g., `Settings.js`)
3. **Add the component to main.js**:
   ```javascript
   if (this.isSettingsPage()) {
       this.components.settings = new Settings();
   }
   ```
4. **Add page detection method**:
   ```javascript
   isSettingsPage() {
       return window.location.pathname === '/settings.html';
   }
   ```

### Example: Settings Page

A complete example of adding a new page is included in the codebase:

- **HTML**: `public/settings.html` - Complete settings page with form controls
- **Component**: `public/js/components/Settings.js` - Handles all settings functionality
- **CSS**: Added to `public/css/style.css` - Styling for settings page
- **Integration**: Updated `public/js/app/main.js` to include the Settings component

The Settings page demonstrates:
- Form handling and validation
- Local storage for settings persistence
- Integration with existing components (Auth, Header, Footer)
- User account management (export data, delete account)
- Theme and font customization

## Benefits of This Architecture

1. **Modularity**: Each component has a single responsibility
2. **Reusability**: Components can be reused across pages
3. **Maintainability**: Easy to locate and modify specific functionality
4. **Scalability**: Easy to add new features and pages
5. **Testability**: Components can be tested in isolation
6. **Code Organization**: Clear separation of concerns

## Migration Notes

- The old `app.js` file is deprecated but kept for reference
- All functionality has been moved to appropriate components
- Global functions are still available for backward compatibility
- The new structure maintains all existing functionality

## Future Enhancements

1. **State Management**: Consider implementing a centralized state manager
2. **Routing**: Add client-side routing for better navigation
3. **Component Lifecycle**: Add proper component lifecycle methods
4. **Error Boundaries**: Add error handling for component failures
5. **Performance**: Implement lazy loading for components
