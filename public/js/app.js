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

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-btn';
        closeBtn.textContent = '❌';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeNote(name);
        };
        tab.appendChild(closeBtn);

        tabsContainer.appendChild(tab);
    });
}

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

// Dark mode toggle
darkToggle.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
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