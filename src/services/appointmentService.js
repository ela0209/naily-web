import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export async function getRandevular() {
  const snapshot = await getDocs(collection(db, "randevular"));
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function randevuEkle(randevu) {
  return await addDoc(collection(db, "randevular"), randevu);
}

export async function randevuGuncelle(id, yeniDurum) {
  return await updateDoc(doc(db, "randevular", id), { durum: yeniDurum });
}
