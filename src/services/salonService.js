import { db } from "./firebase";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";

export async function getSalonlar() {
  const snapshot = await getDocs(collection(db, "salons"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getSalon(id) {
  const docRef = doc(db, "salons", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) return { id: docSnap.id, ...docSnap.data() };
  return null;
}

export async function getYorumlar(salonId) {
  const snapshot = await getDocs(collection(db, "salons", salonId, "yorumlar"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function yorumEkle(salonId, yorum) {
  return await addDoc(collection(db, "salons", salonId, "yorumlar"), yorum);
}
