import { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link, useLocation } from "react-router-dom";

function DurumBadge({ durum }) {
  const renkler = {
    onaylandi: {
      bg: "rgba(16,185,129,0.08)",
      text: "#065f46",
      border: "rgba(16,185,129,0.2)",
      etiket: "✅ Onaylandı",
    },
    iptal: {
      bg: "rgba(232,99,140,0.08)",
      text: "#9f1239",
      border: "rgba(232,99,140,0.2)",
      etiket: "❌ İptal",
    },
    beklemede: {
      bg: "rgba(245,158,11,0.08)",
      text: "#92400e",
      border: "rgba(245,158,11,0.2)",
      etiket: "⏳ Beklemede",
    },
  };
  const r = renkler[durum] || renkler.beklemede;
  return (
    <span
      style={{
        background: r.bg,
        color: r.text,
        border: `1px solid ${r.border}`,
        padding: "5px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {r.etiket}
    </span>
  );
}

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const randevularRef = useRef(null);
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("hepsi");

  // URL'de ?tab=randevular varsa otomatik scroll
  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "randevular") {
      const el = randevularRef.current;
      if (el) {
        setTimeout(() => {
          const top = el.getBoundingClientRect().top + window.scrollY - 120;
          window.scrollTo({ top, behavior: "smooth" });
        }, 100);
      }
    } else {
      // ?tab yoksa sayfanın en üstüne git
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.search, loading]);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    async function getRandevular() {
      const q = query(
        collection(db, "randevular"),
        where("kullanici", "==", currentUser.email),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih));
      setRandevular(data);
      setLoading(false);
    }
    getRandevular();
  }, [currentUser]);

  const filtrelenmis =
    filtre === "hepsi"
      ? randevular
      : randevular.filter((r) => r.durum === filtre);

  const istatistik = {
    toplam: randevular.length,
    onaylandi: randevular.filter((r) => r.durum === "onaylandi").length,
    beklemede: randevular.filter((r) => r.durum === "beklemede").length,
    iptal: randevular.filter((r) => r.durum === "iptal").length,
  };

  if (loading)
    return (
      <div style={s.loadingPage}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center" }}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Yükleniyor...</p>
        </div>
      </div>
    );

  const kullaniciAdi = currentUser.email.split("@")[0];

  return (
    <div style={s.page}>
      <style>{CSS}</style>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.heroContent}>
          <div style={s.heroMain}>
            <div style={s.avatar}>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#e8638c,#9b72cf)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {currentUser.email[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p style={s.heroEtiket}>Naily Üyesi</p>
              <h1 style={s.heroAd}>{kullaniciAdi}</h1>
              <span style={s.heroEmail}>✉️ {currentUser.email}</span>
            </div>
          </div>

          {/* Stat kartları */}
          <div style={s.statRow}>
            {[
              {
                ikon: "📅",
                deger: istatistik.toplam,
                label: "Toplam",
                renk: null,
              },
              {
                ikon: "✅",
                deger: istatistik.onaylandi,
                label: "Onaylı",
                renk: "#10b981",
              },
              {
                ikon: "⏳",
                deger: istatistik.beklemede,
                label: "Bekleyen",
                renk: "#f59e0b",
              },
              {
                ikon: "❌",
                deger: istatistik.iptal,
                label: "İptal",
                renk: "#e8638c",
              },
            ].map((st) => (
              <div key={st.label} style={s.statKart} className="stat-kart">
                <span style={{ fontSize: 18 }}>{st.ikon}</span>
                <span
                  style={{
                    ...s.statDeger,
                    ...(st.renk
                      ? { background: "none", WebkitTextFillColor: st.renk }
                      : {}),
                  }}
                >
                  {st.deger}
                </span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İçerik */}
      <div style={s.icerik}>
        {/* Filtre tab bar */}
        <div style={s.tabBar} ref={randevularRef}>
          {[
            { key: "hepsi", label: "Tümü", sayi: istatistik.toplam },
            {
              key: "beklemede",
              label: "⏳ Bekleyen",
              sayi: istatistik.beklemede,
            },
            {
              key: "onaylandi",
              label: "✅ Onaylı",
              sayi: istatistik.onaylandi,
            },
            { key: "iptal", label: "❌ İptal", sayi: istatistik.iptal },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={`tab-btn ${filtre === f.key ? "aktif" : ""}`}
              style={s.tabBtn}
            >
              {f.label}
              <span
                style={{
                  ...s.tabSayi,
                  background:
                    filtre === f.key
                      ? "rgba(155,114,207,0.12)"
                      : "rgba(0,0,0,0.05)",
                  color: filtre === f.key ? "#9b72cf" : "#8b829a",
                }}
              >
                {f.sayi}
              </span>
            </button>
          ))}
        </div>

        {/* Boş durum */}
        {filtrelenmis.length === 0 && (
          <div style={s.bosPanel} className="bos-panel">
            <span style={{ fontSize: 44 }}>📅</span>
            <p style={s.bosPanelBaslik}>
              {filtre === "hepsi"
                ? "Henüz randevunuz yok"
                : "Bu kategoride randevu yok"}
            </p>
            <p style={s.bosPanelAlt}>
              {filtre === "hepsi"
                ? "Beğendiğiniz salonu bulun ve ilk randevunuzu alın."
                : "Farklı bir filtre seçebilirsiniz."}
            </p>
            {filtre === "hepsi" && (
              <Link to="/salons" style={{ textDecoration: "none" }}>
                <button style={s.salonBtn} className="salon-btn">
                  💅 Salon Bul →
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Randevu listesi */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtrelenmis.map((r, i) => (
            <div
              key={r.id}
              style={{ ...s.randevuKart, animationDelay: `${i * 0.05}s` }}
              className="randevu-kart"
            >
              <div style={s.randevuLeft}>
                <div style={s.randevuIkon}>📅</div>
                <div>
                  <h3 style={s.salonAdi}>{r.salonAdi}</h3>
                  <div style={s.randevuMeta}>
                    <span style={s.metaChip}>
                      🗓️{" "}
                      {new Date(r.tarih).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span style={s.metaAyrac}>·</span>
                    <span style={s.metaChip}>🕐 {r.saat}</span>
                  </div>
                </div>
              </div>
              <div style={s.randevuRight}>
                <DurumBadge durum={r.durum} />
                <Link to={`/salons`} style={{ textDecoration: "none" }}>
                  <button style={s.detayBtn} className="detay-btn">
                    Salona Git
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alt CTA — sadece randevu yoksa */}
      {randevular.length === 0 && (
        <div style={s.altCta}>
          <div style={s.altCtaInner}>
            <div>
              <h3
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#1a1625",
                  margin: "0 0 4px",
                }}
              >
                İlk randevunuzu almaya hazır mısınız?
              </h3>
              <p style={{ fontSize: 13, color: "#8b829a", margin: 0 }}>
                Yüzlerce salon arasından size en uygununu bulun.
              </p>
            </div>
            <Link to="/salons" style={{ textDecoration: "none" }}>
              <button className="randevu-btn" style={s.randevuBtn}>
                💅 Salonları Keşfet →
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }

  .stat-kart:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(155,114,207,0.14)!important; }
  .tab-btn { transition:all 0.2s; cursor:pointer; }
  .tab-btn.aktif { color:#9b72cf!important; border-bottom-color:#9b72cf!important; font-weight:600!important; }
  .tab-btn:hover { color:#9b72cf!important; }
  .randevu-kart { animation: fadeUp 0.3s ease both; }
  .randevu-kart:hover { border-color:rgba(155,114,207,0.22)!important; box-shadow:0 6px 24px rgba(155,114,207,0.11)!important; }
  .detay-btn:hover { background:linear-gradient(135deg,#e8638c,#9b72cf)!important; color:white!important; border-color:transparent!important; }
  .salon-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(232,99,140,0.35)!important; }
  .randevu-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(232,99,140,0.38)!important; }
  .bos-panel { animation: fadeUp 0.3s ease both; }
`;

const s = {
  page: {
    fontFamily: "'Outfit',sans-serif",
    background: "#faf8f5",
    minHeight: "100vh",
  },
  loadingPage: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Outfit',sans-serif",
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "3px solid #f3eeff",
    borderTopColor: "#9b72cf",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto 16px",
  },
  loadingText: { color: "#8b829a", fontSize: 14 },

  hero: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg,#ffffff 0%,#faf8f5 50%,#f3eeff 100%)",
    borderBottom: "1px solid #ede8e0",
    padding: "40px 24px 0",
  },
  blob1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(232,99,140,0.07) 0%,transparent 70%)",
    top: -200,
    right: -100,
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(155,114,207,0.08) 0%,transparent 70%)",
    bottom: -100,
    left: -80,
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1000,
    margin: "0 auto",
  },

  heroMain: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 20,
    background: "linear-gradient(135deg,#fdeef4,#f3eeff)",
    border: "2px solid rgba(232,99,140,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 16px rgba(155,114,207,0.14)",
  },
  heroEtiket: {
    fontSize: 12,
    fontWeight: 600,
    color: "#e8638c",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: "0 0 4px",
  },
  heroAd: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: "clamp(24px,4vw,36px)",
    fontWeight: 700,
    color: "#1a1625",
    margin: "0 0 6px",
    lineHeight: 1.15,
  },
  heroEmail: { fontSize: 13, color: "#8b829a" },

  statRow: { display: "flex", gap: 12, flexWrap: "wrap" },
  statKart: {
    flex: "1 1 100px",
    background: "white",
    border: "1px solid rgba(232,99,140,0.08)",
    borderRadius: "16px 16px 0 0",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    boxShadow: "0 2px 12px rgba(155,114,207,0.08)",
    transition: "all 0.22s",
  },
  statDeger: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 22,
    fontWeight: 700,
    background: "linear-gradient(135deg,#e8638c,#9b72cf)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  statLabel: { fontSize: 11, color: "#8b829a", fontWeight: 500 },

  icerik: { maxWidth: 1000, margin: "0 auto", padding: "0 24px 48px" },

  tabBar: {
    display: "flex",
    borderBottom: "2px solid #f0eaf8",
    marginBottom: 28,
    marginTop: 4,
    gap: 0,
    overflowX: "auto",
  },
  tabBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    padding: "14px 18px",
    fontSize: 14,
    fontWeight: 500,
    color: "#8b829a",
    display: "flex",
    alignItems: "center",
    gap: 7,
    whiteSpace: "nowrap",
  },
  tabSayi: {
    fontSize: 11,
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: 20,
    transition: "all 0.2s",
  },

  bosPanel: { textAlign: "center", padding: "56px 0" },
  bosPanelBaslik: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 22,
    fontWeight: 700,
    color: "#1a1625",
    margin: "12px 0 6px",
  },
  bosPanelAlt: { fontSize: 14, color: "#8b829a", margin: "0 0 24px" },
  salonBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "linear-gradient(135deg,#e8638c,#9b72cf)",
    color: "white",
    border: "none",
    padding: "12px 28px",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(232,99,140,0.28)",
    transition: "all 0.25s",
  },

  randevuKart: {
    background: "white",
    borderRadius: 18,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "18px 22px",
    boxShadow: "0 2px 12px rgba(155,114,207,0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    transition: "all 0.22s",
  },
  randevuLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    flex: 1,
    minWidth: 200,
  },
  randevuIkon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "linear-gradient(135deg,#fdeef4,#f3eeff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 20,
    flexShrink: 0,
    border: "1px solid rgba(232,99,140,0.10)",
  },
  salonAdi: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 18,
    fontWeight: 700,
    color: "#1a1625",
    margin: "0 0 6px",
  },
  randevuMeta: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  metaChip: { fontSize: 12, color: "#8b829a", fontWeight: 500 },
  metaAyrac: { color: "#d4cde0", fontSize: 14 },
  randevuRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  detayBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "white",
    color: "#9b72cf",
    border: "1.5px solid rgba(155,114,207,0.25)",
    padding: "7px 14px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.22s",
    whiteSpace: "nowrap",
  },

  altCta: {
    background: "linear-gradient(135deg,#fdeef4,#f3eeff)",
    borderTop: "1px solid rgba(232,99,140,0.10)",
    padding: "36px 24px",
  },
  altCtaInner: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  randevuBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "linear-gradient(135deg,#e8638c,#9b72cf)",
    color: "white",
    border: "none",
    padding: "12px 24px",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(232,99,140,0.28)",
    transition: "all 0.25s",
  },
};
