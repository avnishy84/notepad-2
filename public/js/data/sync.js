import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, serverTimestamp } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { app } from "../firebase/firebase.js";

const db = getFirestore(app);

// Save (or overwrite) a note for a user
export async function saveNote(userId, noteName, content) {
  const noteRef = doc(db, "notes", userId, "userNotes", noteName);
  await setDoc(noteRef, {
    content,
    updatedAt: serverTimestamp()
  });
  console.log(`Note "${noteName}" saved for user ${userId}`);
}

// Load a single note
export async function loadNote(userId, noteName) {
  const noteRef = doc(db, "notes", userId, "userNotes", noteName);
  const snap = await getDoc(noteRef);
  return snap.exists() ? snap.data().content : null;
}

// Load all notes for a user
export async function loadAllNotes(userId) {
  const notesCol = collection(db, "notes", userId, "userNotes");
  const snapshot = await getDocs(notesCol);
  let notes = [];
  snapshot.forEach(docSnap => {
    notes.push({ id: docSnap.id, ...docSnap.data() });
  });
  return notes;
}

// Delete a note
export async function deleteNote(userId, noteName) {
  const noteRef = doc(db, "notes", userId, "userNotes", noteName);
  await deleteDoc(noteRef);
  console.log(`Note "${noteName}" deleted for user ${userId}`);
}
