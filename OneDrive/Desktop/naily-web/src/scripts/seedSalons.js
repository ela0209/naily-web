// src/scripts/seedSalons.js
// Bu dosyayı bir kez çalıştır, salonlara lat/lng ekler.
// Kullanım: tarayıcı konsolunda import edip çalıştır VEYA
// geçici bir sayfa oluşturup orada çağır.

import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";

// Örnek salon verileri (İzmir bölgesi)
const salonVerileri = [
  {
    name: "Güzellik Salonu Ela",
    address: "Alsancak, İzmir",
    phone: "0232 000 00 01",
    rating: 4.5,
    lat: 38.4389,
    lng: 27.1430,
  },
  {
    name: "Nail Studio Rose",
    address: "Karşıyaka, İzmir",
    phone: "0232 000 00 02",
    rating: 4.8,
    lat: 38.4600,
    lng: 27.1120,
  },
  {
    name: "Glamour Nails",
    address: "Bornova, İzmir",
    phone: "0232 000 00 03",
    rating: 4.2,
    lat: 38.4680,
    lng: 27.2180,
  },
  {
    name: "Pink Nail Bar",
    address: "Konak, İzmir",
    phone: "0232 000 00 04",
    rating: 4.6,
    lat: 38.4120,
    lng: 27.1390,
  },
  {
    name: "Bella Nail Atelier",
    address: "Çiğli, İzmir",
    phone: "0232 000 00 05",
    rating: 4.3,
    lat: 38.5100,
    lng: 27.0700,
  },
];

// Mevcut salonları güncelle (lat/lng ekle)
export async function salonlaraKoordEkle() {
  const snapshot = await getDocs(collection(db, "salons"));
  if (snapshot.empty) {
    console.log("Firestore'da salon yok, yeni salonlar ekleniyor...");
    for (const salon of salonVerileri) {
      await addDoc(collection(db, "salons"), salon);
      console.log(`✅ Eklendi: ${salon.name}`);
    }
  } else {
    console.log(`${snapshot.docs.length} salon bulundu, koordinat güncelleniyor...`);
    snapshot.docs.forEach(async (docSnap, i) => {
      if (salonVerileri[i]) {
        await updateDoc(doc(db, "salons", docSnap.id), {
          lat: salonVerileri[i].lat,
          lng: salonVerileri[i].lng,
        });
        console.log(`✅ Güncellendi: ${docSnap.data().name}`);
      }
    });
  }
  console.log("🎉 Tamamlandı!");
}

// Sadece yeni salon eklemek için:
export async function yeniSalonEkle(salon) {
  // salon = { name, address, phone, rating, lat, lng }
  await addDoc(collection(db, "salons"), salon);
  console.log(`✅ Yeni salon eklendi: ${salon.name}`);
}