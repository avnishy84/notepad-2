// Import Firebase modules
import { auth, db } from "../firebase/firebase.js";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
    deleteField
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { GoogleAuthProvider, signInWithPopup } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
const editor = document.getElementById('editor');
const darkToggle = document.getElementById('darkToggle');
const downloadBtn = document.getElementById('downloadBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const tabsContainer = document.getElementById('tabs');
const status = document.getElementById('status');

let notes = { "Note 1": "" };
let deletedNotes = {};
let currentNote = Object.keys(notes)[0];
const provider = new GoogleAuthProvider();

// ---------------- Editor Font Size ----------------
const MIN_FONT_PX = 12;
const MAX_FONT_PX = 48;
const FONT_STEP_PX = 2;
const DEFAULT_FONT_PX = 16;

function applyEditorFontSize(px) {
    const clamped = Math.max(MIN_FONT_PX, Math.min(MAX_FONT_PX, px));
    editor.style.fontSize = clamped + 'px';
}

function loadEditorFontSize() {
    const stored = localStorage.getItem('editorFontSizePx');
    const size = stored ? parseInt(stored, 10) : DEFAULT_FONT_PX;
    applyEditorFontSize(isNaN(size) ? DEFAULT_FONT_PX : size);
}

function saveEditorFontSize(px) {
    localStorage.setItem('editorFontSizePx', String(px));
}

function increaseFontSize() {
    const current = parseInt(window.getComputedStyle(editor).fontSize, 10) || DEFAULT_FONT_PX;
    const next = Math.min(current + FONT_STEP_PX, MAX_FONT_PX);
    applyEditorFontSize(next);
    saveEditorFontSize(next);
}

function decreaseFontSize() {
    const current = parseInt(window.getComputedStyle(editor).fontSize, 10) || DEFAULT_FONT_PX;
    const next = Math.max(current - FONT_STEP_PX, MIN_FONT_PX);
    applyEditorFontSize(next);
    saveEditorFontSize(next);
}

// Expose for toolbar buttons
window.increaseFontSize = increaseFontSize;
window.decreaseFontSize = decreaseFontSize;

// Shift + Mouse Wheel to adjust font size
editor.addEventListener('wheel', function (event) {
    if (event.shiftKey) {
        event.preventDefault();
        if (event.deltaY < 0) {
            increaseFontSize();
        } else if (event.deltaY > 0) {
            decreaseFontSize();
        }
    }
}, { passive: false });

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

function linkMobileButtons() {
  // Link new note button
  const newNoteBtnMobile = document.getElementById("newNoteBtnMobile");
  if (newNoteBtnMobile) {
    newNoteBtnMobile.addEventListener("click", () => {
      newNoteBtn.click();
      toggleMenu();
    });
  }

  // Link dark mode toggle
  const darkToggleMobile = document.getElementById("darkToggleMobile");
  if (darkToggleMobile) {
    darkToggleMobile.addEventListener("click", () => {
      darkToggle.click();
    });
  }

  // Link download button
  const downloadBtnMobile = document.getElementById("downloadBtnMobile");
  if (downloadBtnMobile) {
    downloadBtnMobile.addEventListener("click", () => {
      downloadBtn.click();
      toggleMenu();
    });
  }

  // Link logout button
  const logoutBtnMobile = document.getElementById("logoutBtnMobile");
  if (logoutBtnMobile) {
    logoutBtnMobile.addEventListener("click", () => {
      logout();
      toggleMenu();
    });
  }
}
// Run when page is loaded
// Run when page is loaded
window.addEventListener("DOMContentLoaded", function() {
  linkMobileButtons();
  renderTabs();
  editor.innerHTML = notes[currentNote];
  updateStatus();
  loadEditorFontSize();
  // Apply last used font color to future selections via picker default
  const picker = document.getElementById('fontColorPicker');
  const colorSwatch = document.getElementById('colorSwatch');
  const savedColor = localStorage.getItem('editorFontColor');
  if (picker && savedColor) {
      picker.value = savedColor;
      if (colorSwatch) colorSwatch.style.backgroundColor = savedColor;
  }
  // Color picker: apply on change only (no live updates)
  if (picker) {
      picker.addEventListener('mousedown', saveCurrentSelectionRange);
      picker.addEventListener('focus', saveCurrentSelectionRange);
      picker.addEventListener('change', () => {
          if (colorSwatch) colorSwatch.style.backgroundColor = picker.value;
          editor.focus();
      });
  }
  // Attach close panel handler
  const closeBtn = document.getElementById("closePanelBtn");
  if (closeBtn) {
      closeBtn.addEventListener("click", () => {
          const panel = document.getElementById("sidePanel");
          if (panel) panel.classList.remove("open");
      });
  }
  // Ensure reusable confirm dialog exists
  ensureConfirmDialog();
});
// Close menu when clicking outside
document.addEventListener("click", (e) => {
    const menu = document.getElementById("menu");
    const hamburger = document.querySelector(".hamburger");

    if ((menu && !menu.contains(e.target)) &&
        (hamburger && !hamburger.contains(e.target))) {
        if (menu) menu.style.display = "none";
    }
});

function closeNote(name) {
    if (Object.keys(notes).length === 1) {
        alert("You can't close the last note!");
        return;
    }
    // Confirm if note contains content
    const html = notes[name] || "";
    const tmpDiv = document.createElement('div');
    tmpDiv.innerHTML = html;
    const plain = (tmpDiv.textContent || tmpDiv.innerText || "").trim();
    if (plain.length > 0) {
        showConfirmDialog({
            title: 'Delete note?',
            message: 'This note contains content. Do you really want to delete it?',
            okText: 'Delete',
            cancelText: 'Cancel'
        }).then((confirmed) => {
            if (confirmed) {
                actuallyCloseNote(name);
            }
        });
        return;
    }
    actuallyCloseNote(name);
}

function actuallyCloseNote(name) {
    // Mark as deleted locally
    const deletionInfo = { deleted: true, deletedAt: new Date().toISOString() };
    deletedNotes[name] = deletionInfo;

    // Optimistically update UI
    delete notes[name];
    if (currentNote === name) {
        currentNote = Object.keys(notes)[0];
        editor.innerHTML = notes[currentNote];
    }
    updateStatus();
    renderTabs();
    saveNotes();

    // Persist deletion to Firestore: remove from notes, add to deletedNotes
    if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        setDoc(userDocRef, {
            notes: { [name]: deleteField() },
            deletedNotes: { [name]: { deleted: true, deletedAt: new Date().toISOString() } }
        }, { merge: true }).catch((err) => {
            console.error("Failed to persist deletion:", err);
        });
    }
}

function ensureConfirmDialog() {
    if (document.getElementById('confirmDialogModal')) return;
    const modal = document.createElement('div');
    modal.id = 'confirmDialogModal';
    modal.className = 'modal';
    modal.style.display = 'none';

    modal.innerHTML = `
      <div class="popup-content">
        <div style="font-size: x-large;font-weight: 600;" id="confirmDialogTitle">Confirm</div>
        <p style="margin:0; padding:0;" id="confirmDialogMessage">Are you sure?</p>
        <div class="modal-actions" style="display:flex; gap:8px; justify-content:flex-end; margin-top:12px;">
          <button id="confirmDialogCancel">Cancel</button>
          <button id="confirmDialogOk" class="danger">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const cancelBtn = modal.querySelector('#confirmDialogCancel');
    const okBtn = modal.querySelector('#confirmDialogOk');
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        const resolver = modal.__resolver;
        if (resolver) resolver(false);
        modal.__resolver = null;
    });
    okBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        const resolver = modal.__resolver;
        if (resolver) resolver(true);
        modal.__resolver = null;
    });
}

function showConfirmDialog(options = {}) {
    ensureConfirmDialog();
    const { title = 'Confirm', message = 'Are you sure?', okText = 'OK', cancelText = 'Cancel' } = options;
    const modal = document.getElementById('confirmDialogModal');
    if (!modal) return Promise.resolve(false);
    modal.querySelector('#confirmDialogTitle').textContent = title;
    modal.querySelector('#confirmDialogMessage').textContent = message;
    modal.querySelector('#confirmDialogOk').textContent = okText;
    modal.querySelector('#confirmDialogCancel').textContent = cancelText;
    modal.style.display = 'flex';
    return new Promise((resolve) => {
        modal.__resolver = resolve;
    });
}

//example to use confirm dialog
// showConfirmDialog({
//     title: 'Warning',
//     message: 'Perform this action?',
//     okText: 'Proceed',
//     cancelText: 'Cancel'
//   }).then(confirmed => {
//     if (confirmed) {
//       // do action
//     }
//   });

// ---------------- Save / Load ----------------
async function saveNotes() {
    if (!auth.currentUser) return;
    try {
        await setDoc(doc(db, "users", auth.currentUser.uid), {
            notes: notes
        }, { merge: true }); // merge to avoid overwriting user doc
        console.log("Notes saved for", auth.currentUser.email);
    } catch (err) {
        console.error("Error saving notes:", err);
    }
}

async function loadNotes(uid) {
    try {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.notes && Object.keys(data.notes).length > 0) {
                notes = data.notes;
                deletedNotes = data.deletedNotes || {};
                currentNote = Object.keys(notes)[0];
                editor.innerHTML = notes[currentNote];
                console.log("Notes loaded for", uid);
            } else {
                // No notes stored → create default
                notes = { "Note 1": "" };
                currentNote = "Note 1";
                await saveNotes();
                console.log("New user – default note created");
            }
        } else {
            // First time user doc → create with default note
            notes = { "Note 1": "" };
            currentNote = "Note 1";
            await saveNotes();
            console.log("New user – doc created");
        }

        renderTabs();
        updateStatus();
    } catch (err) {
        console.error("Error loading notes:", err);
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

// ---------------- Mobile Side Panel ----------------
function toggleMenu() {
    const sidePanel = document.getElementById("sidePanel");
    if (!sidePanel) return;
    sidePanel.classList.toggle("open");

    const panelButtons = document.getElementById("sidePanelButtons");
    if (panelButtons) panelButtons.innerHTML = "";

    // Populate mobile document list
    const docList = document.getElementById("mobileDocList");
    if (docList) {
        docList.innerHTML = "";
        Object.keys(notes).forEach((name) => {
            const li = document.createElement("li");
            li.textContent = name;
            li.classList.add("doc-item");
            li.onclick = () => {
                openNote(name);
                sidePanel.classList.remove("open");
            };
            docList.appendChild(li);
        });
    }

    // Link mobile buttons to their functionality
    linkMobileButtons();
}

// Expose for hamburger button
window.toggleMenu = toggleMenu;

// ---------------- Formatting ----------------
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    editor.focus();
}
function clearFormatting() {
    document.execCommand('removeFormat', false, null);
    editor.focus();
}

// ---------------- Font Color ----------------
function applyFontColorToSelection(colorHex) {
    editor.focus();
    try {
        document.execCommand('foreColor', false, colorHex);
    } catch (e) {
        console.warn('foreColor execCommand failed', e);
    }
}

function setFontColor(colorHex) {
    if (!colorHex) return;
    localStorage.setItem('editorFontColor', colorHex);
    // Restore selection in case the color input stole focus
    restoreSavedSelectionRange();
    applyFontColorToSelection(colorHex);
}

// Expose for toolbar
window.setFontColor = setFontColor;

// ---------------- Color Picker UX Enhancements ----------------
let savedSelectionRange = null;

function saveCurrentSelectionRange() {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    // Only save if the selection is within the editor
    if (editor.contains(range.startContainer) && editor.contains(range.endContainer)) {
        savedSelectionRange = range.cloneRange();
    }
}

function restoreSavedSelectionRange() {
    if (!savedSelectionRange) return;
    const selection = window.getSelection();
    if (!selection) return;
    try {
        selection.removeAllRanges();
        selection.addRange(savedSelectionRange);
    } catch (_) { /* ignore */ }
}

// Keep the saved selection updated while user selects text in the editor
document.addEventListener('selectionchange', () => {
    const active = document.activeElement;
    if (active === editor) {
        saveCurrentSelectionRange();
    }
});

// Ensure coloring uses inline CSS styles for better cross-browser behavior
try { document.execCommand('styleWithCSS', false, true); } catch (_) {}

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

        loadNotes(user.uid); // ✅ fetch notes when logged in
    } else {
        document.getElementById("authButtons").style.display = "block";
        document.getElementById("logoutSection").style.display = "none";
        console.log("No user logged in");

        // Reset local notes when logged out
        notes = { "Note 1": "" };
        currentNote = "Note 1";
        editor.innerHTML = notes[currentNote];
        renderTabs();
        updateStatus();
    }
});

    function openModal(id) {
      document.getElementById(id).style.display = "flex";
    }
    function closeModal(id) {
      document.getElementById(id).style.display = "none";
    }
    window.onclick = function (event) {
      const loginModal = document.getElementById("loginPopup");
      const signupModal = document.getElementById("signupPopup");
      if (event.target === loginModal) loginModal.style.display = "none";
      if (event.target === signupModal) signupModal.style.display = "none";
    }
    window.googleLogin = async function () {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Google login success:", user.email);
        closeModal("loginPopup"); // auto close popup
    } catch (err) {
        alert("Google login failed: " + err.message);
        console.error(err);
    }
};
// expose for mobile menu
window.notes = notes;
window.openNote = openNote;
function openNote(noteName) {
  // Save current note content before switching
  notes[currentNote] = editor.innerHTML;
  
  // Switch to the selected note
  currentNote = noteName;
  editor.innerHTML = notes[noteName] || "";
  
  // Update UI
  updateStatus();
  renderTabs();
  saveNotes();
  
  console.log("Opened note:", noteName);
}