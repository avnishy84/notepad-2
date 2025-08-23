import { getFirestore, doc, setDoc, getDoc } 
  from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { app } from "./firebase.js";

const db = getFirestore(app);

export async function saveNote(noteName, content) {
  await setDoc(doc(db, "notes", noteName), { content });
  console.log(`Note "${noteName}" saved to cloud`);
}

export async function loadNote(noteName) {
  const ref = doc(db, "notes", noteName);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().content : null;
}
