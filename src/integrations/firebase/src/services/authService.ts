import { auth, db } from "@/integrations/firebase/client";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export async function signUp(
  email: string,
  password: string,
  profile: { name: string; phoneNumber: string; address: { city: string; state: string; country: string } }
) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "users", user.uid), profile);
  return user;
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logout() {
  return signOut(auth);
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string) {
  const docSnap = await getDoc(doc(db, "users", uid));
  return docSnap.exists() ? docSnap.data() : null;
}
