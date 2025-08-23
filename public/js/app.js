const editor = document.getElementById('editor');
const darkToggle = document.getElementById('darkToggle');
const downloadBtn = document.getElementById('downloadBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const tabsContainer = document.getElementById('tabs');
const status = document.getElementById('status');

let notes = JSON.parse(localStorage.getItem('notes')) || { "Note 1": "" };
let currentNote = Object.keys(notes)[0];

// Render tabs with close buttons
function renderTabs() {
    tabsContainer.innerHTML = '';
    Object.keys(notes).forEach(name => {
        const tab = document.createElement('div');
        tab.className = 'tab' + (name === currentNote ? ' active' : '');

        // Tab name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        nameSpan.onclick = () => switchNote(name);
        tab.appendChild(nameSpan);

        // Close span
        const closeSpan = document.createElement('span');
        closeSpan.className = 'close-btn cursor-pointer subscript';
        closeSpan.textContent = 'X';
        closeSpan.onclick = (e) => {
            e.stopPropagation();
            closeNote(name);
        };
        tab.appendChild(closeSpan);

        tabsContainer.appendChild(tab);
    });
    const addBtn = document.createElement('button');
    addBtn.className = 'tab add-btn';
    addBtn.textContent = '+';
    addBtn.onclick = () => newNoteBtn.click();
    tabsContainer.appendChild(addBtn);
}
function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}
function linkMobileButtons() {
    const mappings = [
        { mobile: "darkToggleMobile", desktop: "darkToggle" },
        { mobile: "downloadBtnMobile", desktop: "downloadBtn" },
        { mobile: "newNoteBtnMobile", desktop: "newNoteBtn" },
    ];

    mappings.forEach(({ mobile, desktop }) => {
        const mobileBtn = document.getElementById(mobile);
        const desktopBtn = document.getElementById(desktop);

        if (mobileBtn && desktopBtn) {
            mobileBtn.addEventListener("click", () => {
                desktopBtn.click();   // trigger same logic
                toggleMenu();         // close menu after click
            });
        }
    });
}
// Run when page is loaded
window.addEventListener("DOMContentLoaded", linkMobileButtons);

// Close menu when clicking outside
document.addEventListener("click", (e) => {
    const menu = document.getElementById("menu");
    const hamburger = document.querySelector(".hamburger");
    if (!menu.contains(e.target) && !hamburger.contains(e.target)) {
        menu.style.display = "none";
    }
});
// Switch between notes
function switchNote(name) {
    notes[currentNote] = editor.value;
    currentNote = name;
    editor.value = notes[name];
    updateStatus();
    renderTabs();
    saveNotes();
}

// Close a note
function closeNote(name) {
    if (Object.keys(notes).length === 1) {
        alert("You can't close the last note!");
        return;
    }
    delete notes[name];
    if (currentNote === name) {
        currentNote = Object.keys(notes)[0];
        editor.value = notes[currentNote];
    }
    updateStatus();
    renderTabs();
    saveNotes();
}

// Save notes to localStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Update word/char count
function updateStatus() {
    const text = editor.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    status.textContent = `Words: ${words} | Chars: ${chars}`;
}

if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    darkToggle.textContent = '🌙'; // show sun for light mode option
} else {
    darkToggle.textContent = '☀️'; // show moon for dark mode option
}

// Dark mode toggle
darkToggle.onclick = () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    darkToggle.textContent = isDark ? '🌙' : '☀️';
};

// Download note
downloadBtn.onclick = () => {
    const blob = new Blob([editor.value], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentNote + '.txt';
    link.click();
};

// Add new note
newNoteBtn.onclick = () => {
    const name = prompt('Enter note name:', `Note ${Object.keys(notes).length + 1}`);
    if (name && !notes[name]) {
        notes[name] = '';
        switchNote(name);
    } else {
        alert('Invalid or duplicate note name.');
    }
};

// Save text changes
editor.addEventListener('input', () => {
    notes[currentNote] = editor.value;
    updateStatus();
    saveNotes();
});

// Initialize
renderTabs();
editor.value = notes[currentNote];
updateStatus();
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
}