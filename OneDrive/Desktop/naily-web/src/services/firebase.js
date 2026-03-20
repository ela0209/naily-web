import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCKrFnyr4ObXWuS5GX1XZK2e62W3gl8lhA",
  authDomain: "naily--web-c1e81.firebaseapp.com",
  projectId: "naily--web-c1e81",
  storageBucket: "naily--web-c1e81.firebasestorage.app",
  messagingSenderId: "177045910850",
  appId: "1:177045910850:web:afb004e494cad7481504db",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
