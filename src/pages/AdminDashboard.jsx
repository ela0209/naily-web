import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ManageAppointments from "../admin/ManageAppointments";
import ManageServices from "../admin/ManageServices";
import ManageWorkingHours from "../admin/ManageWorkingHours";
import ManageComments from "../admin/ManageComments";
import AdminAtama from "../admin/AdminAtama";

/* ─────────────────────────────────────────
   Veri
───────────────────────────────────────── */
const SEKMELER = [
  { id: "randevular", label: "Randevular", icon: "📅" },
  { id: "salonlar", label: "Salonlar", icon: "🏪" },
  { id: "saatler", label: "Çalışma Saatleri", icon: "🕐" },
  { id: "yorumlar", label: "Yorumlar", icon: "💬" },
  { id: "atama", label: "Admin Atamaları", icon: "🔑" },
];

const STATLER = [
  { icon: "📅", val: "24", label: "Randevu", renk: "#e8638c" },
  { icon: "🏪", val: "8", label: "Salon", renk: "#9b72cf" },
  { icon: "👥", val: "142", label: "Kullanıcı", renk: "#e8638c" },
  { icon: "⭐", val: "4.9", label: "Ort. Puan", renk: "#9b72cf" },
];

/* ─────────────────────────────────────────
   CSS
───────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  /* ── Reset / base ── */
  .adm * { box-sizing: border-box; margin: 0; padding: 0; }
  .adm {
    font-family: 'Outfit', sans-serif;
    background: #faf8f5;
    min-height: 100vh;
    animation: fadeIn 0.35s ease both;
    color: #1a1625;
  }

  /* ── Hero ── */
  .adm-hero {
    position: relative;
    overflow: hidden;
    background: linear-gradient(160deg, #ffffff 0%, #faf8f5 50%, #f3eeff 100%);
    border-bottom: 1px solid #ede8e0;
    padding: 40px 24px 36px;
  }
  .adm-blob1 {
    position: absolute;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(232,99,140,0.07) 0%, transparent 70%);
    top: -200px; right: -100px;
    pointer-events: none;
  }
  .adm-blob2 {
    position: absolute;
    width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(155,114,207,0.08) 0%, transparent 70%);
    bottom: -100px; left: -80px;
    pointer-events: none;
  }
  .adm-hero-inner {
    position: relative;
    z-index: 1;
    max-width: 1100px;
    margin: 0 auto;
  }

  /* Avatar + başlık satırı */
  .adm-hero-row {
    display: flex;
    align-items: center;
    gap: 20px;
    animation: fadeUp 0.4s 0.05s ease both;
  }
  .adm-avatar {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 2px solid rgba(232,99,140,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    flex-shrink: 0;
    box-shadow: 0 4px 16px rgba(155,114,207,0.14);
  }
  .adm-badge {
    font-size: 11px; font-weight: 700;
    color: #e8638c;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .adm-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(22px, 3.5vw, 34px);
    font-weight: 700;
    color: #1a1625;
    line-height: 1.15;
    margin: 0 0 4px;
  }
  .adm-title-accent {
    background: linear-gradient(135deg, #e8638c, #9b72cf);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .adm-subtitle {
    font-size: 12px;
    color: #8b829a;
  }

  /* Stat kartları */
  .adm-stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 28px;
    animation: fadeUp 0.4s 0.15s ease both;
  }
  .adm-stat {
    flex: 1 1 130px;
    background: white;
    border-radius: 18px;
    border: 1px solid rgba(232,99,140,0.08);
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: 0 2px 12px rgba(155,114,207,0.07);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: default;
  }
  .adm-stat:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(155,114,207,0.13);
  }
  .adm-stat-icon { font-size: 20px; margin-bottom: 2px; }
  .adm-stat-val {
    font-family: 'Cormorant Garamond', serif;
    font-size: 30px;
    font-weight: 700;
    background: linear-gradient(135deg, #e8638c, #9b72cf);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1;
  }
  .adm-stat-label {
    font-size: 11px;
    color: #8b829a;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  /* ── Tab bar ── */
  .adm-tabs-wrap {
    background: white;
    border-bottom: 1px solid #ede8e0;
    position: sticky;
    top: 0;
    z-index: 100;
    box-shadow: 0 2px 12px rgba(155,114,207,0.06);
  }
  .adm-tabs {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    gap: 0;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .adm-tabs::-webkit-scrollbar { display: none; }

  .adm-tab {
    font-family: 'Outfit', sans-serif;
    background: none;
    border: none;
    border-bottom: 2.5px solid transparent;
    margin-bottom: -1px;
    padding: 16px 22px;
    font-size: 13px;
    font-weight: 500;
    color: #8b829a;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 7px;
    white-space: nowrap;
    transition: all 0.2s;
  }
  .adm-tab:hover {
    color: #9b72cf;
    background: rgba(155,114,207,0.04);
  }
  .adm-tab.aktif {
    color: #9b72cf;
    border-bottom-color: #9b72cf;
    font-weight: 600;
  }
  .adm-tab-pip {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e8638c, #9b72cf);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .adm-tab.aktif .adm-tab-pip { opacity: 1; }

  /* ── İçerik alanı ── */
  .adm-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px 24px 64px;
    animation: fadeUp 0.3s ease both;
  }

  /* Section header */
  .adm-section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }
  .adm-section-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 26px;
    font-weight: 700;
    color: #1a1625;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .adm-section-pill {
    display: inline-flex;
    align-items: center;
    background: linear-gradient(135deg, rgba(232,99,140,0.07), rgba(155,114,207,0.09));
    border: 1px solid rgba(155,114,207,0.15);
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 700;
    color: #9b72cf;
  }

  /* İçerik sarmalayıcı (alt bileşenler için kart zemini) */
  .adm-card-wrap {
    background: white;
    border-radius: 20px;
    border: 1px solid rgba(232,99,140,0.08);
    box-shadow: 0 2px 16px rgba(155,114,207,0.07);
    overflow: hidden;
  }

  /* Çıkış butonu */
  .adm-logout {
    font-family: 'Outfit', sans-serif;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 18px;
    border-radius: 12px;
    border: 1.5px solid rgba(232,99,140,0.2);
    background: rgba(232,99,140,0.05);
    color: #e8638c;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    text-decoration: none;
    margin-top: 2px;
  }
  .adm-logout:hover {
    background: rgba(232,99,140,0.1);
    border-color: rgba(232,99,140,0.35);
    transform: translateY(-1px);
  }

  /* Divider çizgisi */
  .adm-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(155,114,207,0.15), transparent);
    margin: 0;
  }
`;

/* ─────────────────────────────────────────
   Bileşen
───────────────────────────────────────── */
export default function AdminDashboard() {
  const { currentUser, logout, role } = useAuth();
  const navigate = useNavigate();
  const [aktifSekme, setAktifSekme] = useState("randevular");

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  // Süper admin tüm sekmeleri görür, normal admin atama sekmesini görmez
  const gorunenSekmeler =
    role === "superadmin"
      ? SEKMELER
      : SEKMELER.filter((s) => s.id !== "atama");

  const aktifLabel = SEKMELER.find((s) => s.id === aktifSekme);
  const kullaniciAdi = currentUser.email.split("@")[0];

  async function handleCikis() {
    try {
      if (logout) await logout();
      navigate("/login");
    } catch (_) {}
  }

  return (
    <div className="adm">
      <style>{CSS}</style>

      {/* ── Hero ── */}
      <section className="adm-hero">
        <div className="adm-blob1" />
        <div className="adm-blob2" />
        <div className="adm-hero-inner">
          {/* Üst satır: avatar + başlık + çıkış */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div className="adm-hero-row">
              <div className="adm-avatar">⚡</div>
              <div>
                <p className="adm-badge">Admin Paneli</p>
                <h1 className="adm-title">
                  Hoş geldin,{" "}
                  <span className="adm-title-accent">{kullaniciAdi}</span>
                </h1>
                <p className="adm-subtitle">{currentUser.email}</p>
              </div>
            </div>

            <button className="adm-logout" onClick={handleCikis}>
              🚪 Çıkış Yap
            </button>
          </div>

          {/* İstatistikler */}
          <div className="adm-stats">
            {STATLER.map((st) => (
              <div key={st.label} className="adm-stat">
                <span className="adm-stat-icon">{st.icon}</span>
                <span className="adm-stat-val">{st.val}</span>
                <span className="adm-stat-label">{st.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tab bar ── */}
      <div className="adm-tabs-wrap">
        <div className="adm-tabs">
          {gorunenSekmeler.map((s) => (
            <button
              key={s.id}
              className={`adm-tab ${aktifSekme === s.id ? "aktif" : ""}`}
              onClick={() => setAktifSekme(s.id)}
            >
              <span>{s.icon}</span>
              {s.label}
              <span className="adm-tab-pip" />
            </button>
          ))}
        </div>
      </div>

      {/* ── İçerik ── */}
      <div className="adm-content" key={aktifSekme}>
        <div className="adm-section-head">
          <h2 className="adm-section-title">
            {aktifLabel?.icon} {aktifLabel?.label}
          </h2>
          <span className="adm-section-pill">Yönet</span>
        </div>

        <div className="adm-card-wrap">
          <div className="adm-divider" />
          {aktifSekme === "randevular" && <ManageAppointments />}
          {aktifSekme === "salonlar" && <ManageServices />}
          {aktifSekme === "saatler" && <ManageWorkingHours />}
          {aktifSekme === "yorumlar" && <ManageComments />}
          {aktifSekme === "atama" && <AdminAtama />}
        </div>
      </div>
    </div>
  );
}
