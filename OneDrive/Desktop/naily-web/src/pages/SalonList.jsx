import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";

function mesafeHesapla(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function Yildizlar({ puan }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(puan) ? "#f59e0b" : "#d1d5db", fontSize: 14 }}>
          ★
        </span>
      ))}
      <span style={{ marginLeft: 4, fontSize: 13, color: "#6b7280", fontWeight: 600 }}>
        {puan}
      </span>
    </div>
  );
}

function MesafeBadge({ mesafe }) {
  const renk =
    mesafe < 2
      ? { bg: "#dcfce7", text: "#16a34a" }
      : mesafe < 5
        ? { bg: "#fef9c3", text: "#ca8a04" }
        : { bg: "#fee2e2", text: "#dc2626" };
  return (
    <span style={{ background: renk.bg, color: renk.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      📍 {mesafe.toFixed(1)} km
    </span>
  );
}

export default function SalonList() {
  const [salons, setSalons] = useState([]);
  const [filtrelenmis, setFiltrelenmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [konumDurumu, setKonumDurumu] = useState("bekliyor");
  const [konumHata, setKonumHata] = useState("");
  const [tumSalonlar, setTumSalonlar] = useState(false);

  useEffect(() => {
    async function getSalons() {
      const snapshot = await getDocs(collection(db, "salons"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSalons(data);
      setLoading(false);
      konumAl(data);
    }
    getSalons();
  }, []);

  function konumAl(salonData) {
    if (!navigator.geolocation) {
      setKonumDurumu("hata");
      setKonumHata("Tarayıcınız konum özelliğini desteklemiyor.");
      setFiltrelenmis(salonData);
      return;
    }
    setKonumDurumu("bekliyor");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setKonumDurumu("alindi");
        const mesafeli = salonData
          .filter((s) => s.lat && s.lng)
          .map((s) => ({ ...s, mesafe: mesafeHesapla(latitude, longitude, s.lat, s.lng) }))
          .sort((a, b) => a.mesafe - b.mesafe);
        const koordinatsiz = salonData
          .filter((s) => !s.lat || !s.lng)
          .map((s) => ({ ...s, mesafe: null }));
        setFiltrelenmis([...mesafeli, ...koordinatsiz]);
      },
      (err) => {
        setKonumDurumu(err.code === 1 ? "izin_yok" : "hata");
        if (err.code !== 1) setKonumHata(err.message);
        setFiltrelenmis(salonData);
      },
      { timeout: 10000, maximumAge: 300000 }
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <p style={{ color: "#9ca3af" }}>Salonlar yükleniyor...</p>
      </div>
    );
  }

  const gosterilecek = tumSalonlar ? filtrelenmis : filtrelenmis.slice(0, 3);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.baslik}>💅 Tırnak Salonları</h1>

        {konumDurumu === "bekliyor" && (
          <div style={{ ...styles.banner, ...styles.bannerMavi }}>⟳ Konumunuz alınıyor...</div>
        )}
        {konumDurumu === "alindi" && (
          <div style={{ ...styles.banner, ...styles.bannerYesil }}>
            ✅ Konumunuz alındı — size en yakın <strong>3 salon</strong> gösteriliyor
          </div>
        )}
        {konumDurumu === "izin_yok" && (
          <div style={{ ...styles.banner, ...styles.bannerSari }}>
            ⚠️ Konum izni verilmedi — tüm salonlar listeleniyor
            <button onClick={() => konumAl(salons)} style={styles.tekrarDene}>
              Tekrar İzin Ver
            </button>
          </div>
        )}
        {konumDurumu === "hata" && (
          <div style={{ ...styles.banner, ...styles.bannerKirmizi }}>
            ❌ {konumHata || "Konum alınamadı"} — tüm salonlar listeleniyor
          </div>
        )}
      </div>

      <div style={styles.kartGrid}>
        {gosterilecek.length === 0 && (
          <div style={styles.bos}><p>Henüz salon eklenmemiş.</p></div>
        )}

        {gosterilecek.map((salon, index) => (
          <div key={salon.id} style={styles.kart}>
            {konumDurumu === "alindi" && salon.mesafe !== null && index < 3 && (
              <div style={styles.siraBadge}>#{index + 1}</div>
            )}
            <div style={styles.kartIcerik}>
              <h2 style={styles.salonAdi}>{salon.name}</h2>
              <div style={styles.bilgiSatir}>
                <span>📍</span><span style={styles.bilgiText}>{salon.address}</span>
              </div>
              <div style={styles.bilgiSatir}>
                <span>📞</span><span style={styles.bilgiText}>{salon.phone}</span>
              </div>
              <div style={styles.bilgiSatir}>
                <Yildizlar puan={salon.rating} />
              </div>
              {salon.mesafe !== null && salon.mesafe !== undefined && (
                <div style={{ marginTop: 8 }}>
                  <MesafeBadge mesafe={salon.mesafe} />
                </div>
              )}
            </div>
            <div style={styles.kartAlt}>
              <Link to={`/salons/${salon.id}`} style={styles.detayLink}>
                <button style={styles.detayBtn}>Detayları Gör →</button>
              </Link>
              <Link to={`/appointment/${salon.id}`} style={styles.randevuLink}>
                <button style={styles.randevuBtn}>📅 Randevu Al</button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filtrelenmis.length > 3 && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button onClick={() => setTumSalonlar(!tumSalonlar)} style={styles.tumBtn}>
            {tumSalonlar ? "⬆ Daha Az Göster" : `Tüm ${filtrelenmis.length} Salonu Göster ⬇`}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 720, margin: "0 auto", padding: "40px 20px", fontFamily: "'Segoe UI', sans-serif" },
  loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: 300 },
  header: { textAlign: "center", marginBottom: 32 },
  baslik: { fontSize: 32, fontWeight: 800, color: "#1f2937", margin: "0 0 16px", letterSpacing: -0.5 },
  banner: { display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 500, marginBottom: 8 },
  bannerMavi: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  bannerYesil: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  bannerSari: { background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a", flexDirection: "column", gap: 6 },
  bannerKirmizi: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  tekrarDene: { background: "#f59e0b", color: "white", border: "none", borderRadius: 8, padding: "5px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  kartGrid: { display: "flex", flexDirection: "column", gap: 16 },
  kart: { background: "white", border: "1px solid #f3f4f6", borderRadius: 16, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", position: "relative" },
  siraBadge: { position: "absolute", top: 16, right: 16, background: "linear-gradient(135deg, #ec4899, #f472b6)", color: "white", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 },
  kartIcerik: { marginBottom: 16 },
  salonAdi: { fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 12px" },
  bilgiSatir: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  bilgiText: { color: "#4b5563", fontSize: 14 },
  kartAlt: { display: "flex", gap: 10, borderTop: "1px solid #f3f4f6", paddingTop: 14 },
  detayLink: { textDecoration: "none", flex: 1 },
  randevuLink: { textDecoration: "none", flex: 1 },
  detayBtn: { width: "100%", padding: "9px 0", background: "white", border: "2px solid #e5e7eb", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" },
  randevuBtn: { width: "100%", padding: "9px 0", background: "linear-gradient(135deg, #ec4899, #f472b6)", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "white", cursor: "pointer" },
  bos: { textAlign: "center", color: "#9ca3af", padding: 40 },
  tumBtn: { background: "white", border: "2px solid #e5e7eb", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer" },
};
