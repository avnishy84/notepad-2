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

// Switch between notes
function switchNote(name) {
    notes[currentNote] = editor.innerHTML;  // save old note
    currentNote = name;
    editor.innerHTML = notes[name];         // load new note
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
        editor.innerHTML = notes[currentNote];
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
    const text = editor.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    status.textContent = `Words: ${words} | Chars: ${chars}`;
}

// Dark mode toggle
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
    darkToggle.textContent = '🌙';
} else {
    darkToggle.textContent = '☀️';
}
darkToggle.onclick = () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    darkToggle.textContent = isDark ? '🌙' : '☀️';
};

// Download note
downloadBtn.onclick = () => {
    const blob = new Blob([editor.innerHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentNote + '.html';
    link.click();
};

// Add new note
newNoteBtn.onclick = () => {
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, '0');
    const name = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    if (!notes[name]) {
        notes[name] = '';
        switchNote(name);
    } else {
        alert('Duplicate note name. Try again.');
    }
};

// Save changes on typing
editor.addEventListener("input", () => {
    notes[currentNote] = editor.innerHTML;
    saveNotes();
    updateStatus();
});

// Placeholder support for contenteditable
const observer = new MutationObserver(updateStatus);
observer.observe(editor, { childList: true, characterData: true, subtree: true });

// Initialize
renderTabs();
editor.innerHTML = notes[currentNote];
updateStatus();

// Formatting
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
}
function clearFormatting() {
    document.execCommand('removeFormat', false, null);
    editor.focus();
}

// Shortcuts (same as your code, unchanged)
document.addEventListener("keydown", function (e) {
    const ctrl = e.ctrlKey || e.metaKey;

    if (ctrl) {
        switch (e.key.toLowerCase()) {
            case "b": e.preventDefault(); document.execCommand("bold"); break;
            case "i": e.preventDefault(); document.execCommand("italic"); break;
            case "u": e.preventDefault(); document.execCommand("underline"); break;
            case "z": e.preventDefault(); document.execCommand(e.shiftKey ? "redo" : "undo"); break;
            case "7": if (e.shiftKey) { e.preventDefault(); document.execCommand("insertOrderedList"); } break;
            case "8": if (e.shiftKey) { e.preventDefault(); document.execCommand("insertUnorderedList"); } break;
            case "1": if (e.altKey) { e.preventDefault(); document.execCommand("formatBlock", false, "h1"); } break;
            case "2": if (e.altKey) { e.preventDefault(); document.execCommand("formatBlock", false, "h2"); } break;
            case "\\": e.preventDefault(); document.execCommand("removeFormat"); document.execCommand("formatBlock", false, "p"); break;
        }
    }
});
