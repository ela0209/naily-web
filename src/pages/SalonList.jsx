import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../services/firebase";  // auth ekle
import { onAuthStateChanged } from "firebase/auth"; // bunu ekle
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
        <span
          key={i}
          style={{
            color: i <= Math.round(puan) ? "#f59e0b" : "#e5dff0",
            fontSize: 13,
          }}
        >
          ★
        </span>
      ))}
      <span style={{ marginLeft: 5, fontSize: 12, color: "#8b829a", fontWeight: 600 }}>
        {puan}
      </span>
    </div>
  );
}

// Salon kartı için sahte renk paleti (id'ye göre)
const CARD_ACCENTS = [
  { from: "#fdeef4", to: "#f3eeff", dot: "#e8638c" },
  { from: "#f3eeff", to: "#eef4ff", dot: "#9b72cf" },
  { from: "#fff4ee", to: "#fdeef4", dot: "#f59e0b" },
  { from: "#eef8f4", to: "#f3eeff", dot: "#10b981" },
];

export default function SalonList() {
  const [salons, setSalons] = useState([]);
  const [filtrelenmis, setFiltrelenmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [konumDurumu, setKonumDurumu] = useState("bekliyor");
  const [konumHata, setKonumHata] = useState("");
  const [tumSalonlar, setTumSalonlar] = useState(false);
  const [aramaMetni, setAramaMetni] = useState("");
  const [siralama, setSiralama] = useState("mesafe"); // mesafe | puan | isim

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      async function getSalons() {
        const snapshot = await getDocs(collection(db, "salons"));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSalons(data);
        setLoading(false);
        konumAl(data);
      }
      getSalons();
    } else {
      setLoading(false);
    }
  });
  return () => unsubscribe();
}, []);

  function konumAl(salonData) {
    if (!navigator.geolocation) {
      setKonumDurumu("hata");
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

  // Arama + sıralama
  const gosterilecekTum = filtrelenmis
    .filter((s) =>
      aramaMetni
        ? s.name?.toLowerCase().includes(aramaMetni.toLowerCase()) ||
          s.address?.toLowerCase().includes(aramaMetni.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (siralama === "puan") return (b.rating || 0) - (a.rating || 0);
      if (siralama === "isim") return (a.name || "").localeCompare(b.name || "");
      // mesafe varsayılan
      if (a.mesafe == null) return 1;
      if (b.mesafe == null) return -1;
      return a.mesafe - b.mesafe;
    });

  const gosterilen = tumSalonlar ? gosterilecekTum : gosterilecekTum.slice(0, 6);

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; } 50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .salon-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          animation: fadeUp 0.4s ease both;
        }
        .salon-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 56px rgba(155,114,207,0.18) !important;
        }
        .detay-btn:hover {
          background: white !important;
          border-color: #c9aff0 !important;
          color: #9b72cf !important;
        }
        .randevu-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(232,99,140,0.36) !important;
        }
        .siralama-btn.aktif {
          background: linear-gradient(135deg, rgba(232,99,140,0.10), rgba(155,114,207,0.12));
          color: #9b72cf;
          border-color: rgba(155,114,207,0.25);
          font-weight: 600;
        }
        .siralama-btn:hover {
          border-color: #c9aff0;
          color: #9b72cf;
        }
        .arama-input:focus {
          outline: none;
          border-color: #c9aff0;
          box-shadow: 0 0 0 3px rgba(155,114,207,0.10);
        }
        .tum-btn:hover {
          border-color: #c9aff0;
          color: #9b72cf;
          background: rgba(155,114,207,0.05);
        }
      `}</style>

      {/* ── Hero başlık ── */}
      <section style={s.hero}>
        <div style={s.bgBlob1} />
        <div style={s.bgBlob2} />

        <div style={s.heroContent}>
          <span style={s.chip}>📍 Konum Tabanlı Arama</span>
          <h1 style={s.heroTitle}>
            Sana En Yakın<br />
            <span style={s.heroGrad}>Tırnak Salonları</span>
          </h1>
          <p style={s.heroSub}>
            GPS ile konumunu al, en yakın salonları mesafeye göre sırala, hemen randevu al.
          </p>

          {/* Konum durum bandı */}
          <div style={s.konumBant}>
            {konumDurumu === "bekliyor" && (
              <div style={{ ...s.bant, ...s.bantMavi }}>
                <span style={s.spinner}>⟳</span>
                Konumunuz alınıyor...
              </div>
            )}
            {konumDurumu === "alindi" && (
              <div style={{ ...s.bant, ...s.bantYesil }}>
                ✅ Konum alındı — en yakın salonlar gösteriliyor
              </div>
            )}
            {konumDurumu === "izin_yok" && (
              <div style={{ ...s.bant, ...s.bantSari }}>
                ⚠️ Konum izni verilmedi
                <button onClick={() => konumAl(salons)} style={s.tekrarBtn}>
                  Tekrar Dene
                </button>
              </div>
            )}
            {konumDurumu === "hata" && (
              <div style={{ ...s.bant, ...s.bantKirmizi }}>
                ❌ {konumHata || "Konum alınamadı"}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Filtreler ── */}
      <div style={s.filterWrap}>
        <div style={s.filterInner}>
          {/* Arama kutusu */}
          <div style={s.aramaWrap}>
            <span style={s.aramaIkon}>🔍</span>
            <input
              className="arama-input"
              style={s.aramaInput}
              placeholder="Salon adı veya adres ara..."
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
            />
            {aramaMetni && (
              <button
                onClick={() => setAramaMetni("")}
                style={{ position: "absolute", right: 10, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#8b829a" }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Sıralama */}
          <div style={s.siralamaGrup}>
            {[
              { key: "mesafe", label: "📍 Mesafe" },
              { key: "puan", label: "⭐ Puan" },
              { key: "isim", label: "🔤 İsim" },
            ].map((opt) => (
              <button
                key={opt.key}
                className={`siralama-btn ${siralama === opt.key ? "aktif" : ""}`}
                style={s.siralamaBtn}
                onClick={() => setSiralama(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sonuç sayısı */}
        <div style={s.sonucSayisi}>
          <span style={s.sonucN}>{gosterilecekTum.length}</span>
          <span style={s.sonucL}>salon bulundu</span>
        </div>
      </div>

      {/* ── Salon Grid ── */}
      <div style={s.gridWrap}>
        {loading ? (
          <div style={s.loadingWrap}>
            <div style={s.loadingDots}>
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    ...s.dot,
                    animationDelay: `${i * 0.15}s`,
                    animation: "pulse 1.2s ease-in-out infinite",
                  }}
                />
              ))}
            </div>
            <p style={s.loadingText}>Salonlar yükleniyor...</p>
          </div>
        ) : gosterilen.length === 0 ? (
          <div style={s.bosWrap}>
            <span style={{ fontSize: 48 }}>💅</span>
            <p style={s.bosText}>
              {aramaMetni ? `"${aramaMetni}" için sonuç bulunamadı` : "Henüz salon eklenmemiş."}
            </p>
          </div>
        ) : (
          <div style={s.grid}>
            {gosterilen.map((salon, index) => {
              const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
              const isYakin = konumDurumu === "alindi" && salon.mesafe !== null && index < 3;

              return (
                <div
                  key={salon.id}
                  className="salon-card"
                  style={{
                    ...s.kart,
                    animationDelay: `${index * 0.06}s`,
                  }}
                >
                  {/* Üst renkli bant */}
                  <div
                    style={{
                      ...s.kartBant,
                      background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                    }}
                  >
                    {/* Sıra rozeti */}
                    {isYakin && (
                      <div style={{ ...s.sirabadge, background: accent.dot }}>
                        #{index + 1}
                      </div>
                    )}

                    {/* Salon ikonu */}
                    <div style={{ ...s.salonIkon, background: accent.dot + "22", borderColor: accent.dot + "33" }}>
                      <span style={{ fontSize: 22 }}>💅</span>
                    </div>

                    {/* Mesafe chip */}
                    {salon.mesafe != null && (
                      <div style={s.mesafeChip}>
                        <span style={{
                          color: salon.mesafe < 2 ? "#10b981" : salon.mesafe < 5 ? "#f59e0b" : "#e8638c",
                          fontWeight: 700, fontSize: 12,
                        }}>
                          📍 {salon.mesafe.toFixed(1)} km
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Kart içeriği */}
                  <div style={s.kartBody}>
                    <h2 style={s.salonAdi}>{salon.name}</h2>

                    <div style={s.bilgiSatir}>
                      <span style={s.bilgiIkon}>📍</span>
                      <span style={s.bilgiText}>{salon.address}</span>
                    </div>
                    <div style={s.bilgiSatir}>
                      <span style={s.bilgiIkon}>📞</span>
                      <span style={s.bilgiText}>{salon.phone}</span>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <Yildizlar puan={salon.rating || 0} />
                    </div>

                    {/* Hizmet etiketleri (varsa) */}
                    {salon.services && salon.services.length > 0 && (
                      <div style={s.tagRow}>
                        {salon.services.slice(0, 3).map((srv, i) => (
                          <span key={i} style={s.tag}>{srv}</span>
                        ))}
                        {salon.services.length > 3 && (
                          <span style={s.tagMore}>+{salon.services.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Butonlar */}
                  <div style={s.kartAlt}>
                    <Link to={`/salons/${salon.id}`} style={{ textDecoration: "none", flex: 1 }}>
                      <button className="detay-btn" style={s.detayBtn}>
                        Detayları Gör
                      </button>
                    </Link>
                    <Link to={`/appointment/${salon.id}`} style={{ textDecoration: "none", flex: 1 }}>
                      <button className="randevu-btn" style={s.randevuBtn}>
                        📅 Randevu Al
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tümünü göster */}
        {!loading && gosterilecekTum.length > 6 && (
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <button
              className="tum-btn"
              style={s.tumBtn}
              onClick={() => setTumSalonlar((v) => !v)}
            >
              {tumSalonlar
                ? "⬆ Daha Az Göster"
                : `Tüm ${gosterilecekTum.length} Salonu Gör →`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'Outfit', sans-serif",
    background: "#faf8f5",
    minHeight: "100vh",
  },

  // Hero
  hero: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg, #ffffff 0%, #faf8f5 50%, #f3eeff 100%)",
    borderBottom: "1px solid #ede8e0",
    padding: "56px 24px 48px",
    textAlign: "center",
  },
  bgBlob1: {
    position: "absolute", width: 500, height: 500, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(232,99,140,0.07) 0%, transparent 70%)",
    top: -200, right: -100, pointerEvents: "none",
  },
  bgBlob2: {
    position: "absolute", width: 400, height: 400, borderRadius: "50%",
    background: "radial-gradient(circle, rgba(155,114,207,0.08) 0%, transparent 70%)",
    bottom: -100, left: -80, pointerEvents: "none",
  },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 640, margin: "0 auto" },

  chip: {
    display: "inline-block",
    background: "linear-gradient(135deg, #fdeef4, #f3eeff)",
    border: "1px solid #e8e2d9", borderRadius: 100,
    padding: "5px 16px", fontSize: 12, fontWeight: 600,
    color: "#9b72cf", marginBottom: 20, letterSpacing: "0.04em",
  },
  heroTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(32px, 5vw, 52px)",
    fontWeight: 700, color: "#1a1625",
    lineHeight: 1.15, marginBottom: 14, letterSpacing: "-0.02em",
  },
  heroGrad: {
    background: "linear-gradient(135deg, #e8638c 0%, #9b72cf 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: { fontSize: 15, color: "#8b829a", lineHeight: 1.7, marginBottom: 24 },

  // Konum bandı
  konumBant: { display: "flex", justifyContent: "center" },
  bant: {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 20px", borderRadius: 14, fontSize: 13, fontWeight: 500,
  },
  bantMavi: { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" },
  bantYesil: { background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" },
  bantSari: { background: "#fefce8", color: "#854d0e", border: "1px solid #fde68a" },
  bantKirmizi: { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" },
  spinner: { display: "inline-block", animation: "spin 1s linear infinite" },
  tekrarBtn: {
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
    color: "white", border: "none", borderRadius: 8,
    padding: "5px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600,
    fontFamily: "'Outfit', sans-serif",
  },

  // Filtreler
  filterWrap: {
    maxWidth: 1100, margin: "0 auto",
    padding: "28px 24px 0",
    display: "flex", alignItems: "center",
    gap: 16, flexWrap: "wrap",
    justifyContent: "space-between",
  },
  filterInner: { display: "flex", gap: 10, flexWrap: "wrap", flex: 1 },

  aramaWrap: {
    position: "relative", display: "flex", alignItems: "center",
    flex: "1 1 220px", minWidth: 180,
  },
  aramaIkon: {
    position: "absolute", left: 12,
    fontSize: 14, pointerEvents: "none",
  },
  aramaInput: {
    width: "100%", padding: "10px 36px 10px 36px",
    border: "1.5px solid #e8e2d9", borderRadius: 12,
    fontSize: 13, fontFamily: "'Outfit', sans-serif",
    background: "white", color: "#1a1625",
    transition: "all 0.2s", boxSizing: "border-box",
  },
  siralamaGrup: { display: "flex", gap: 6, alignItems: "center" },
  siralamaBtn: {
    padding: "9px 14px", borderRadius: 12,
    border: "1.5px solid #e8e2d9",
    background: "white", color: "#6b6278",
    fontSize: 12, fontWeight: 500,
    cursor: "pointer", transition: "all 0.2s",
    fontFamily: "'Outfit', sans-serif",
    whiteSpace: "nowrap",
  },

  sonucSayisi: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 },
  sonucN: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 28, fontWeight: 700,
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    lineHeight: 1,
  },
  sonucL: { fontSize: 11, color: "#8b829a", fontWeight: 500 },

  // Grid
  gridWrap: { maxWidth: 1100, margin: "0 auto", padding: "24px 24px 64px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },

  // Kart
  kart: {
    background: "white",
    borderRadius: 20,
    border: "1px solid rgba(232,99,140,0.08)",
    boxShadow: "0 4px 20px rgba(155,114,207,0.10)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  kartBant: {
    height: 80,
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  sirabadge: {
    position: "absolute", top: 10, right: 10,
    color: "white", width: 28, height: 28, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 12, fontWeight: 800,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  salonIkon: {
    width: 52, height: 52, borderRadius: 16,
    display: "flex", alignItems: "center", justifyContent: "center",
    border: "1.5px solid",
    background: "rgba(255,255,255,0.6)",
    backdropFilter: "blur(8px)",
  },
  mesafeChip: {
    position: "absolute", bottom: 8, left: 12,
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(8px)",
    borderRadius: 20, padding: "3px 10px",
    border: "1px solid rgba(255,255,255,0.6)",
  },

  kartBody: { padding: "18px 20px 12px", flex: 1 },
  salonAdi: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20, fontWeight: 700, color: "#1a1625",
    margin: "0 0 12px", lineHeight: 1.2,
  },
  bilgiSatir: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 },
  bilgiIkon: { fontSize: 13, flexShrink: 0, marginTop: 1 },
  bilgiText: { fontSize: 13, color: "#6b6278", lineHeight: 1.4 },

  tagRow: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 },
  tag: {
    display: "inline-block",
    background: "linear-gradient(135deg, rgba(232,99,140,0.08), rgba(155,114,207,0.10))",
    border: "1px solid rgba(155,114,207,0.15)",
    borderRadius: 20, padding: "3px 10px",
    fontSize: 11, color: "#9b72cf", fontWeight: 500,
  },
  tagMore: {
    display: "inline-block",
    background: "#f3f4f6", borderRadius: 20,
    padding: "3px 10px", fontSize: 11, color: "#8b829a",
  },

  // Kart alt butonlar
  kartAlt: {
    display: "flex", gap: 8,
    padding: "12px 16px 16px",
    borderTop: "1px solid rgba(232,99,140,0.07)",
  },
  detayBtn: {
    width: "100%", padding: "9px 0",
    background: "white",
    border: "1.5px solid #e8e2d9",
    borderRadius: 12, fontSize: 13, fontWeight: 600,
    color: "#4a4458", cursor: "pointer",
    transition: "all 0.22s",
    fontFamily: "'Outfit', sans-serif",
  },
  randevuBtn: {
    width: "100%", padding: "9px 0",
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
    border: "none", borderRadius: 12,
    fontSize: 13, fontWeight: 600, color: "white",
    cursor: "pointer", transition: "all 0.22s",
    boxShadow: "0 4px 14px rgba(232,99,140,0.24)",
    fontFamily: "'Outfit', sans-serif",
  },

  // Loading
  loadingWrap: { textAlign: "center", padding: "80px 0" },
  loadingDots: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 },
  dot: {
    width: 10, height: 10, borderRadius: "50%",
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
  },
  loadingText: { color: "#8b829a", fontSize: 14 },

  // Boş
  bosWrap: { textAlign: "center", padding: "80px 0" },
  bosText: { color: "#8b829a", fontSize: 15, marginTop: 12 },

  // Tümü butonu
  tumBtn: {
    background: "white", border: "1.5px solid #e8e2d9",
    borderRadius: 14, padding: "12px 28px",
    fontSize: 14, fontWeight: 600, color: "#4a4458",
    cursor: "pointer", transition: "all 0.22s",
    fontFamily: "'Outfit', sans-serif",
  },
};