const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const db = getFirestore();

/* ─────────────────────────────────────────────────────────────
   1. RANDEVU ÇAKIŞMA KONTROLÜ
   Yeni randevu eklendiğinde aynı salon + tarih + saat dolu mu kontrol eder.
   Doluysa randevuyu iptal eder ve reason alanı ekler.
───────────────────────────────────────────────────────────── */
exports.randevuCakismaKontrol = onDocumentCreated(
  "randevular/{randevuId}",
  async (event) => {
    const yeniRandevu = event.data.data();
    const yeniId = event.params.randevuId;

    const { salonId, tarih, saat } = yeniRandevu;
    if (!salonId || !tarih || !saat) return;

    // Aynı salon + tarih + saatte ONAYLANMIŞ veya BEKLEYEN başka randevu var mı?
    const snapshot = await db
      .collection("randevular")
      .where("salonId", "==", salonId)
      .where("tarih", "==", tarih)
      .where("saat", "==", saat)
      .where("durum", "in", ["bekliyor", "onaylandi"])
      .get();

    // Kendisi hariç başka randevu varsa çakışma var
    const cakisan = snapshot.docs.filter((d) => d.id !== yeniId);

    if (cakisan.length > 0) {
      await db.collection("randevular").doc(yeniId).update({
        durum: "iptal",
        iptalNedeni: "Bu saat dolu. Lütfen farklı bir saat seçin.",
      });
      console.log(`Çakışma: ${yeniId} randevusu iptal edildi.`);
    }
  }
);

/* ─────────────────────────────────────────────────────────────
   2. ROL ATAMA (Güvenli — sadece superadmin yapabilir)
   Client tarafından çağrılır: rolAta({ uid: "...", rol: "admin", salonId: "..." })
───────────────────────────────────────────────────────────── */
exports.rolAta = onCall(async (request) => {
  // Çağıranın kimliğini kontrol et
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Giriş yapmanız gerekiyor.");
  }

  // Çağıranın Firestore'daki rolünü kontrol et
  const arayanDoc = await db.collection("users").doc(request.auth.uid).get();
  if (!arayanDoc.exists || arayanDoc.data().role !== "superadmin") {
    throw new HttpsError("permission-denied", "Bu işlem için superadmin yetkisi gerekiyor.");
  }

  const { uid, rol, salonId } = request.data;

  if (!uid || !rol) {
    throw new HttpsError("invalid-argument", "uid ve rol zorunludur.");
  }

  const gecerliRoller = ["user", "admin", "superadmin"];
  if (!gecerliRoller.includes(rol)) {
    throw new HttpsError("invalid-argument", "Geçersiz rol.");
  }

  // Kullanıcı belgesini güncelle
  await db.collection("users").doc(uid).update({
    role: rol,
    salonId: salonId || null,
    rolGuncelleme: FieldValue.serverTimestamp(),
  });

  console.log(`Rol atandı: ${uid} → ${rol}`);
  return { basarili: true, mesaj: `${uid} kullanıcısına ${rol} rolü atandı.` };
});

/* ─────────────────────────────────────────────────────────────
   3. YORUM MODERASYONu (Tetikleyici)
   Yeni yorum eklendiğinde hassas kelime içeriyorsa gizler.
───────────────────────────────────────────────────────────── */
const HASSAS_KELIMELER = [
  "aptal", "salak", "gerize", "orospu", "kaltak", "fahişe",
  "çirkin", "şişman", "pis", "iğrenç", "rezil", "berbat",
];

exports.yorumModerasyonu = onDocumentCreated(
  "comments/{yorumId}",
  async (event) => {
    const yorum = event.data.data();
    const yorumId = event.params.yorumId;

    const metin = (yorum.text || yorum.yorum || "").toLowerCase();

    const hassasKelimeBulundu = HASSAS_KELIMELER.some((k) =>
      metin.includes(k)
    );

    if (hassasKelimeBulundu) {
      await db.collection("comments").doc(yorumId).update({
        gizli: true,
        moderasyonNotu: "Uygunsuz içerik tespit edildi.",
      });
      console.log(`Yorum gizlendi: ${yorumId}`);
    }
  }
);