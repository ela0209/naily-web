import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RatingStars from "../components/RatingStars";

function Yildizlar({ puan, buyuk = false }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          style={{
            color: i <= Math.round(puan) ? "#f59e0b" : "#e5dff0",
            fontSize: buyuk ? 18 : 13,
          }}
        >
          ★
        </span>
      ))}
      <span
        style={{
          marginLeft: 6,
          fontSize: buyuk ? 16 : 12,
          color: "#8b829a",
          fontWeight: 600,
        }}
      >
        {puan}
      </span>
    </div>
  );
}

export default function SalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [salon, setSalon] = useState(null);
  const [yorumlar, setYorumlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aktifTab, setAktifTab] = useState("hakkinda");
  const [yeniYorum, setYeniYorum] = useState("");
  const [yeniPuan, setYeniPuan] = useState(5);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    async function fetchSalon() {
      try {
        const snap = await getDoc(doc(db, "salons", id));
        if (snap.exists()) setSalon({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    async function fetchYorumlar() {
      try {
        const q = query(
          collection(db, "comments"),
          where("salonId", "==", id),
          orderBy("createdAt", "desc"),
        );
        const snap = await getDocs(q);
        setYorumlar(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
    }
    fetchSalon();
    fetchYorumlar();
  }, [id]);

  async function handleYorumGonder() {
    if (!yeniYorum.trim()) return;
    setGonderiyor(true);
    try {
      const docRef = await addDoc(collection(db, "comments"), {
        salonId: id,
        comment: yeniYorum,
        rating: yeniPuan,
        userEmail: currentUser.email,
        userName: currentUser.email.split("@")[0],
        createdAt: serverTimestamp(),
      });

      // Tekrar fetch etmek yerine direkt state'e ekle
      const yeniYorumObj = {
        id: docRef.id,
        salonId: id,
        comment: yeniYorum,
        rating: yeniPuan,
        userEmail: currentUser.email,
        userName: currentUser.email.split("@")[0],
        createdAt: { seconds: Date.now() / 1000, toDate: () => new Date() },
      };
      setYorumlar((prev) => [yeniYorumObj, ...prev]);

      setYeniYorum("");
      setYeniPuan(5);
      setMesaj("✅ Yorumunuz eklendi!");
      setTimeout(() => setMesaj(""), 2000);
    } catch (e) {
      setMesaj("Hata: " + e.message);
    }
    setGonderiyor(false);
  }

  async function handleYorumSil(yorumId) {
    try {
      await deleteDoc(doc(db, "comments", yorumId));
      setYorumlar((prev) => prev.filter((y) => y.id !== yorumId));
    } catch (e) {
      console.error("Yorum silinemedi:", e);
    }
  }

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

  if (!salon)
    return (
      <div style={s.loadingPage}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center" }}>
          <span style={{ fontSize: 52 }}>😔</span>
          <p style={{ color: "#8b829a", marginTop: 12 }}>Salon bulunamadı.</p>
          <button onClick={() => navigate("/salons")} style={s.geriBtn}>
            ← Salonlara Dön
          </button>
        </div>
      </div>
    );

  const hizmetler = salon.services || [];
  const calismaGunleri = salon.workingHours || {};

  return (
    <div style={s.page}>
      <style>{CSS}</style>

      <section style={s.hero}>
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.heroContent}>
          <button
            onClick={() => navigate("/salons")}
            style={s.geriBtn}
            className="geri-btn"
          >
            ← Salonlar
          </button>
          <div style={s.heroMain}>
            <div style={s.heroLeft}>
              <div style={s.avatar}>
                <span style={{ fontSize: 36 }}>💅</span>
              </div>
              <div>
                <h1 style={s.salonAdi}>{salon.name}</h1>
                <div style={s.heroMeta}>
                  <Yildizlar puan={salon.rating || 0} buyuk />
                  <span style={s.ayrac}>·</span>
                  <span style={s.metaText}>📍 {salon.address}</span>
                </div>
                {salon.phone && (
                  <div style={{ marginTop: 5 }}>
                    <span style={s.metaText}>📞 {salon.phone}</span>
                  </div>
                )}
              </div>
            </div>
            <div style={s.heroRight}>
              <Link
                to={`/appointment/${salon.id}`}
                style={{ textDecoration: "none" }}
              >
                <button className="randevu-btn" style={s.randevuBtn}>
                  📅 Randevu Al
                </button>
              </Link>
              {salon.phone && (
                <a
                  href={`tel:${salon.phone}`}
                  style={{ textDecoration: "none" }}
                >
                  <button className="ara-btn" style={s.araBtn}>
                    📞 Ara
                  </button>
                </a>
              )}
            </div>
          </div>

          <div style={s.statRow}>
            {[
              { ikon: "⭐", deger: salon.rating || "—", label: "Puan" },
              { ikon: "💬", deger: yorumlar.length, label: "Yorum" },
              { ikon: "💅", deger: hizmetler.length || "—", label: "Hizmet" },
              { ikon: "🕐", deger: salon.openTime || "09:00", label: "Açılış" },
            ].map((st) => (
              <div key={st.label} style={s.statKart} className="stat-kart">
                <span style={{ fontSize: 20 }}>{st.ikon}</span>
                <span style={s.statDeger}>{st.deger}</span>
                <span style={s.statLabel}>{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={s.icerik}>
        <div style={s.tabBar}>
          {[
            { key: "hakkinda", label: "Hakkında" },
            { key: "hizmetler", label: `Hizmetler (${hizmetler.length})` },
            { key: "yorumlar", label: `Yorumlar (${yorumlar.length})` },
          ].map((t) => (
            <button
              key={t.key}
              className={`tab-btn ${aktifTab === t.key ? "aktif" : ""}`}
              style={s.tabBtn}
              onClick={() => setAktifTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {aktifTab === "hakkinda" && (
          <div className="tab-panel">
            <div style={s.ikiKolon}>
              <div style={{ flex: "1 1 300px" }}>
                {salon.description && (
                  <div style={s.bolum}>
                    <h3 style={s.bolumBaslik}>✦ Hakkımızda</h3>
                    <p style={s.bolumMetin}>{salon.description}</p>
                  </div>
                )}
                <div style={s.bolum}>
                  <h3 style={s.bolumBaslik}>📍 Konum</h3>
                  <div style={s.infoKart}>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#6b6278",
                        lineHeight: 1.6,
                        marginBottom: 12,
                      }}
                    >
                      {salon.address}
                    </p>
                    {salon.lat && salon.lng && (
                      <a
                        href={`https://maps.google.com/?q=${salon.lat},${salon.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none" }}
                      >
                        <button style={s.outlineBtn} className="outline-btn">
                          🗺️ Google Maps'te Aç
                        </button>
                      </a>
                    )}
                  </div>
                </div>
              </div>
              <div style={{ flex: "1 1 240px" }}>
                <div style={s.bolum}>
                  <h3 style={s.bolumBaslik}>🕐 Çalışma Saatleri</h3>
                  <div style={s.infoKart}>
                    {(Object.keys(calismaGunleri).length > 0
                      ? Object.entries(calismaGunleri)
                      : [
                          ["Pzt – Cum", "09:00 – 20:00"],
                          ["Cumartesi", "10:00 – 19:00"],
                          ["Pazar", "Kapalı"],
                        ]
                    ).map(([gun, saat]) => (
                      <div key={gun} style={s.saatSatir}>
                        <span
                          style={{
                            fontSize: 13,
                            color: "#4a4458",
                            fontWeight: 500,
                          }}
                        >
                          {gun}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: saat === "Kapalı" ? "#e8638c" : "#10b981",
                          }}
                        >
                          {saat}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {aktifTab === "hizmetler" && (
          <div className="tab-panel">
            {hizmetler.length === 0 ? (
              <div style={s.bosPanel}>
                <span style={{ fontSize: 40 }}>💅</span>
                <p style={s.bosPanelText}>Henüz hizmet eklenmemiş.</p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {hizmetler.map((h, i) => (
                  <div key={i} style={s.hizmetKart} className="hizmet-kart">
                    <div style={s.hizmetIkon}>💅</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1a1625",
                          marginBottom: 2,
                        }}
                      >
                        {typeof h === "string" ? h : h.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        {h.price && (
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              background:
                                "linear-gradient(135deg,#e8638c,#9b72cf)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            {h.price} ₺
                          </span>
                        )}
                        {h.duration && (
                          <span style={{ fontSize: 12, color: "#8b829a" }}>
                            ⏱ {h.duration} dk
                          </span>
                        )}
                      </div>
                    </div>
                    <Link
                      to={`/appointment/${salon.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <button style={s.hizmetBtn} className="hizmet-btn">
                        Randevu
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {aktifTab === "yorumlar" && (
          <div className="tab-panel">
            {currentUser && (
              <div style={s.yorumForm}>
                <h3 style={s.bolumBaslik}>✍️ Yorum Yaz</h3>
                <div style={{ marginBottom: 12 }}>
                  <RatingStars
                    puan={yeniPuan}
                    onChange={(p) => setYeniPuan(p)}
                  />
                </div>
                <textarea
                  value={yeniYorum}
                  onChange={(e) => setYeniYorum(e.target.value)}
                  placeholder="Deneyiminizi paylaşın..."
                  style={s.textarea}
                />
                {mesaj && (
                  <p
                    style={{
                      color: mesaj.includes("✅") ? "#10b981" : "#e8638c",
                      fontSize: 13,
                      margin: "8px 0",
                    }}
                  >
                    {mesaj}
                  </p>
                )}
                <button
                  onClick={handleYorumGonder}
                  disabled={gonderiyor}
                  style={s.randevuBtn}
                >
                  {gonderiyor ? "Gönderiliyor..." : "💬 Yorum Gönder"}
                </button>
              </div>
            )}

            {!currentUser && (
              <div style={s.uyariBant}>
                💬 Yorum yapmak için{" "}
                <Link
                  to="/login"
                  style={{ color: "#9b72cf", fontWeight: 600, marginLeft: 4 }}
                >
                  giriş yap
                </Link>
              </div>
            )}

            {yorumlar.length === 0 ? (
              <div style={s.bosPanel}>
                <span style={{ fontSize: 40 }}>💬</span>
                <p style={s.bosPanelText}>
                  Henüz yorum yok. İlk yorumu sen yaz!
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginTop: 20,
                }}
              >
                {yorumlar.map((y) => (
                  <div key={y.id} style={s.yorumKart} className="yorum-kart">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div style={s.yorumAvatar}>
                        {(y.userName || y.userEmail || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#1a1625",
                            marginBottom: 3,
                          }}
                        >
                          {y.userName ||
                            y.userEmail?.split("@")[0] ||
                            "Kullanıcı"}
                        </div>
                        <RatingStars
                          puan={y.rating || 5}
                          kucuk={true}
                          etiket={false}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#8b829a",
                          marginLeft: "auto",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span>
                          {y.createdAt?.toDate
                            ? y.createdAt.toDate().toLocaleDateString("tr-TR")
                            : ""}
                        </span>
                        {y.userEmail === currentUser?.email && (
                          <button
                            onClick={() => handleYorumSil(y.id)}
                            style={{
                              background: "none",
                              border: "1.5px solid rgba(232,99,140,0.3)",
                              color: "#e8638c",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 600,
                              padding: "3px 8px",
                              borderRadius: 8,
                              fontFamily: "'Outfit',sans-serif",
                              transition: "all 0.2s",
                            }}
                            className="sil-btn"
                          >
                            🗑 Sil
                          </button>
                        )}
                      </div>
                    </div>
                    {y.comment && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "#6b6278",
                          lineHeight: 1.65,
                          margin: 0,
                        }}
                      >
                        {y.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
              {salon.name} ile randevu almaya hazır mısın?
            </h3>
            <p style={{ fontSize: 13, color: "#8b829a", margin: 0 }}>
              Hızlı ve kolay — sadece birkaç adım.
            </p>
          </div>
          <Link
            to={`/appointment/${salon.id}`}
            style={{ textDecoration: "none" }}
          >
            <button className="randevu-btn" style={s.randevuBtn}>
              📅 Hemen Randevu Al →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes tabIn { from{opacity:0;transform:translateX(8px)} to{opacity:1;transform:translateX(0)} }
  .tab-panel { animation: tabIn 0.25s ease both; }
  .geri-btn:hover { background:rgba(155,114,207,0.08)!important; color:#9b72cf!important; border-color:#c9aff0!important; }
  .randevu-btn:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(232,99,140,0.38)!important; }
  .ara-btn:hover { border-color:#c9aff0!important; color:#9b72cf!important; background:rgba(155,114,207,0.06)!important; }
  .stat-kart:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(155,114,207,0.14)!important; }
  .tab-btn { transition:all 0.2s; cursor:pointer; }
  .tab-btn.aktif { color:#9b72cf!important; border-bottom-color:#9b72cf!important; font-weight:600!important; }
  .tab-btn:hover { color:#9b72cf!important; }
  .hizmet-kart:hover { border-color:rgba(155,114,207,0.25)!important; box-shadow:0 6px 20px rgba(155,114,207,0.10)!important; }
  .hizmet-btn:hover { background:linear-gradient(135deg,#e8638c,#9b72cf)!important; color:white!important; border-color:transparent!important; }
  .outline-btn:hover { background:linear-gradient(135deg,#e8638c,#9b72cf)!important; color:white!important; border-color:transparent!important; }
  .yorum-kart:hover { border-color:rgba(155,114,207,0.15)!important; }
  .sil-btn:hover { background:rgba(232,99,140,0.08)!important; border-color:#e8638c!important; }
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
  geriBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "white",
    border: "1.5px solid #e8e2d9",
    borderRadius: 12,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 500,
    color: "#6b6278",
    cursor: "pointer",
    transition: "all 0.22s",
    marginBottom: 24,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  heroMain: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 28,
  },
  heroLeft: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    flex: 1,
    minWidth: 260,
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
  salonAdi: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: "clamp(24px,4vw,38px)",
    fontWeight: 700,
    color: "#1a1625",
    margin: "0 0 8px",
    lineHeight: 1.15,
  },
  heroMeta: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  ayrac: { color: "#d4cde0", fontSize: 16 },
  metaText: { fontSize: 13, color: "#8b829a" },
  heroRight: {
    display: "flex",
    gap: 10,
    alignItems: "center",
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
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  araBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "white",
    color: "#4a4458",
    border: "1.5px solid #e8e2d9",
    padding: "12px 20px",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.25s",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
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
  },
  tabBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    marginBottom: -2,
    padding: "14px 20px",
    fontSize: 14,
    fontWeight: 500,
    color: "#8b829a",
  },
  ikiKolon: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  bolum: { marginBottom: 28 },
  bolumBaslik: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1625",
    margin: "0 0 12px",
  },
  bolumMetin: { fontSize: 14, color: "#6b6278", lineHeight: 1.7, margin: 0 },
  infoKart: {
    background: "white",
    borderRadius: 16,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "16px 20px",
    boxShadow: "0 2px 12px rgba(155,114,207,0.06)",
  },
  saatSatir: {
    display: "flex",
    justifyContent: "space-between",
    padding: "9px 0",
    borderBottom: "1px solid rgba(232,99,140,0.06)",
  },
  outlineBtn: {
    fontFamily: "'Outfit',sans-serif",
    background: "white",
    color: "#4a4458",
    border: "1.5px solid #e8e2d9",
    padding: "8px 16px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.22s",
  },
  hizmetKart: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "white",
    borderRadius: 16,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "14px 18px",
    boxShadow: "0 2px 10px rgba(155,114,207,0.06)",
    transition: "all 0.22s",
  },
  hizmetIkon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "linear-gradient(135deg,#fdeef4,#f3eeff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    flexShrink: 0,
  },
  hizmetBtn: {
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
  uyariBant: {
    display: "flex",
    gap: 6,
    alignItems: "center",
    background: "linear-gradient(135deg,#fdeef4,#f3eeff)",
    border: "1px solid rgba(155,114,207,0.12)",
    borderRadius: 14,
    padding: "12px 18px",
    fontSize: 13,
    color: "#6b6278",
    marginBottom: 20,
  },
  yorumKart: {
    background: "white",
    borderRadius: 16,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "16px 20px",
    boxShadow: "0 2px 10px rgba(155,114,207,0.06)",
    transition: "all 0.22s",
  },
  yorumAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg,#e8638c,#9b72cf)",
    color: "white",
    fontWeight: 700,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  bosPanel: { textAlign: "center", padding: "48px 0" },
  bosPanelText: { color: "#8b829a", fontSize: 14, marginTop: 12 },
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
  yorumForm: {
    background: "white",
    borderRadius: 16,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "20px 24px",
    marginBottom: 24,
    boxShadow: "0 2px 12px rgba(155,114,207,0.06)",
  },
  textarea: {
    width: "100%",
    minHeight: 80,
    padding: "10px 14px",
    borderRadius: 12,
    border: "1.5px solid #e8e2d9",
    fontSize: 13,
    fontFamily: "'Outfit',sans-serif",
    resize: "vertical",
    marginBottom: 12,
    outline: "none",
    boxSizing: "border-box",
  },
};
