import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Superadmin işlemlerini activity_logs koleksiyonuna kaydeder.
 * @param {string} yapanUid   - İşlemi yapan kullanıcının UID'i
 * @param {string} yapanEmail - İşlemi yapan kullanıcının e-postası
 * @param {string} islem      - İşlem türü (örn: "rol_degistir", "kullanici_banla")
 * @param {object} detay      - İşleme ait ek bilgiler
 */
export async function logActivity(yapanUid, yapanEmail, islem, detay = {}) {
  try {
    await addDoc(collection(db, "activity_logs"), {
      yapanUid,
      yapanEmail,
      islem,
      detay,
      zaman: serverTimestamp(),
    });
  } catch (err) {
    console.error("Log kaydedilemedi:", err);
  }
}