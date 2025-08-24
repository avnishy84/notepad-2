// Import Firebase modules
import { auth, db } from "./firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const editor = document.getElementById('editor');
const darkToggle = document.getElementById('darkToggle');
const downloadBtn = document.getElementById('downloadBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const tabsContainer = document.getElementById('tabs');
const status = document.getElementById('status');

let notes = { "Note 1": "" };
let currentNote = Object.keys(notes)[0];

// ---------------- Tabs ----------------
function renderTabs() {
    tabsContainer.innerHTML = '';
    Object.keys(notes).forEach(name => {
        const tab = document.createElement('div');
        tab.className = 'tab' + (name === currentNote ? ' active' : '');

        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        nameSpan.onclick = () => switchNote(name);
        tab.appendChild(nameSpan);

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

function switchNote(name) {
    notes[currentNote] = editor.innerHTML;
    currentNote = name;
    editor.innerHTML = notes[name];
    updateStatus();
    renderTabs();
    saveNotes();
}

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

// ---------------- Save / Load ----------------
async function saveNotes() {
    if (!auth.currentUser) return;
    await setDoc(doc(db, "users", auth.currentUser.uid), {
        notes: notes
    });
}

async function loadNotes(uid) {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        notes = docSnap.data().notes;
        currentNote = Object.keys(notes)[0];
        editor.innerHTML = notes[currentNote];
        renderTabs();
        updateStatus();
    } else {
        notes = { "Note 1": "" };
        currentNote = "Note 1";
        await saveNotes();
        renderTabs();
    }
}

// ---------------- Status ----------------
function updateStatus() {
    const text = editor.innerText.trim();
    const words = text ? text.split(/\s+/).length : 0;
    const chars = text.length;
    status.textContent = `Words: ${words} | Chars: ${chars}`;
}

// ---------------- Dark Mode ----------------
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

// ---------------- Download ----------------
downloadBtn.onclick = () => {
    const blob = new Blob([editor.innerHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = currentNote + '.html';
    link.click();
};

// ---------------- New Note ----------------
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

// ---------------- Typing ----------------
editor.addEventListener("input", () => {
    notes[currentNote] = editor.innerHTML;
    saveNotes();
    updateStatus();
});

// MutationObserver for placeholder
const observer = new MutationObserver(updateStatus);
observer.observe(editor, { childList: true, characterData: true, subtree: true });

// ---------------- Init ----------------
renderTabs();
editor.innerHTML = notes[currentNote];
updateStatus();

// ---------------- Formatting ----------------
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
}
function clearFormatting() {
    document.execCommand('removeFormat', false, null);
    editor.focus();
}

// ---------------- Shortcuts ----------------
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

// ---------------- Auth ----------------

window.signup = async function () {
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("Signed up:", email);
        closeModal("signupPopup");
    } catch (err) {
        alert(err.message);
    }
};

window.login = async function () {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Logged in:", email);
        closeModal("loginPopup");
    } catch (err) {
        alert(err.message);
    }
};

window.logout = async function () {
    await signOut(auth);
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("authButtons").style.display = "none";
        document.getElementById("logoutSection").style.display = "block";
        console.log("User logged in:", user.email);
        // loadNotes(user.uid);  // Only if you have notes sync
    } else {
        document.getElementById("authButtons").style.display = "block";
        document.getElementById("logoutSection").style.display = "none";
        console.log("No user logged in");
    }
});
