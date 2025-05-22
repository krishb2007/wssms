import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Optional: import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: AIzaSyAg0Im0xRga3b_mN2NiXItQ0Vx_pWt7Ms4,
  authDomain: wssms-cc2ec.firebaseapp.com,
  projectId: wssms-cc2ec,
  storageBucket: wssms-cc2ec.firebasestorage.app,
  messagingSenderId: 501889851311,
  appId: 1:501889851311:web:9b99ebca446864e389995a,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// Optional: export const storage = getStorage(app);
