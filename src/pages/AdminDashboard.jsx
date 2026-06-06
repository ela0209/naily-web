import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ManageAppointments from "../admin/ManageAppointments";
import ManageServices from "../admin/ManageServices";
import ManageWorkingHours from "../admin/ManageWorkingHours";
import ManageComments from "../admin/ManageComments";

const SEKMELER = [
  { id: "randevular", label: "Randevular",       icon: "📅" },
  { id: "salonlar",   label: "Salon Bilgileri",  icon: "🏪" },
  { id: "saatler",    label: "Çalışma Saatleri", icon: "🕐" },
  { id: "yorumlar",   label: "Yorumlar",          icon: "💬" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }

  .adm * { box-sizing:border-box; margin:0; padding:0; }
  .adm { font-family:'Outfit',sans-serif; background:#faf8f5; min-height:100vh; animation:fadeIn .35s ease both; color:#1a1625; }

  .adm-hero { position:relative; overflow:hidden; background:linear-gradient(160deg,#fff 0%,#faf8f5 50%,#f3eeff 100%); border-bottom:1px solid #ede8e0; padding:40px 24px 36px; }
  .adm-blob1 { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(232,99,140,.07) 0%,transparent 70%); top:-200px; right:-100px; pointer-events:none; }
  .adm-blob2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(155,114,207,.08) 0%,transparent 70%); bottom:-100px; left:-80px; pointer-events:none; }
  .adm-hero-inner { position:relative; z-index:1; max-width:1100px; margin:0 auto; }

  .adm-hero-row { display:flex; align-items:center; gap:20px; animation:fadeUp .4s .05s ease both; }
  .adm-avatar { width:64px; height:64px; border-radius:18px; background:linear-gradient(135deg,#fdeef4,#f3eeff); border:2px solid rgba(232,99,140,.15); display:flex; align-items:center; justify-content:center; font-size:28px; flex-shrink:0; box-shadow:0 4px 16px rgba(155,114,207,.14); }
  .adm-badge { font-size:11px; font-weight:700; color:#e8638c; letter-spacing:.08em; text-transform:uppercase; margin:0 0 4px; }
  .adm-title { font-family:'Cormorant Garamond',serif; font-size:clamp(22px,3.5vw,34px); font-weight:700; color:#1a1625; line-height:1.15; margin:0 0 4px; }
  .adm-title-accent { background:linear-gradient(135deg,#e8638c,#9b72cf); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .adm-subtitle { font-size:12px; color:#8b829a; }
  .adm-salon-bant { display:inline-flex; align-items:center; gap:8px; margin-top:10px; background:linear-gradient(135deg,rgba(232,99,140,.07),rgba(155,114,207,.09)); border:1px solid rgba(155,114,207,.15); border-radius:20px; padding:5px 14px; font-size:12px; font-weight:600; color:#9b72cf; }

  .adm-tabs-wrap { background:white; border-bottom:1px solid #ede8e0; position:sticky; top:0; z-index:100; box-shadow:0 2px 12px rgba(155,114,207,.06); }
  .adm-tabs { max-width:1100px; margin:0 auto; padding:0 24px; display:flex; overflow-x:auto; scrollbar-width:none; }
  .adm-tabs::-webkit-scrollbar { display:none; }
  .adm-tab { font-family:'Outfit',sans-serif; background:none; border:none; border-bottom:2.5px solid transparent; margin-bottom:-1px; padding:16px 22px; font-size:13px; font-weight:500; color:#8b829a; cursor:pointer; display:flex; align-items:center; gap:7px; white-space:nowrap; transition:all .2s; }
  .adm-tab:hover { color:#9b72cf; background:rgba(155,114,207,.04); }
  .adm-tab.aktif { color:#9b72cf; border-bottom-color:#9b72cf; font-weight:600; }
  .adm-tab-pip { width:6px; height:6px; border-radius:50%; background:linear-gradient(135deg,#e8638c,#9b72cf); opacity:0; transition:opacity .2s; }
  .adm-tab.aktif .adm-tab-pip { opacity:1; }

  .adm-content { max-width:1100px; margin:0 auto; padding:32px 24px 64px; animation:fadeUp .3s ease both; }
  .adm-section-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
  .adm-section-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:700; color:#1a1625; display:flex; align-items:center; gap:10px; }
  .adm-section-pill { display:inline-flex; align-items:center; background:linear-gradient(135deg,rgba(232,99,140,.07),rgba(155,114,207,.09)); border:1px solid rgba(155,114,207,.15); border-radius:20px; padding:4px 14px; font-size:12px; font-weight:700; color:#9b72cf; }
  .adm-card-wrap { background:white; border-radius:20px; border:1px solid rgba(232,99,140,.08); box-shadow:0 2px 16px rgba(155,114,207,.07); overflow:hidden; }
  .adm-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(155,114,207,.15),transparent); }

  .adm-logout { font-family:'Outfit',sans-serif; display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:12px; border:1.5px solid rgba(232,99,140,.2); background:rgba(232,99,140,.05); color:#e8638c; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; }
  .adm-logout:hover { background:rgba(232,99,140,.1); border-color:rgba(232,99,140,.35); transform:translateY(-1px); }

  .adm-uyari { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:60px 24px; text-align:center; gap:12px; }
  .adm-uyari-icon { font-size:48px; }
  .adm-uyari h3 { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:700; color:#1a1625; }
  .adm-uyari p { font-size:14px; color:#8b829a; max-width:320px; line-height:1.6; }
`;

export default function AdminDashboard() {
  const { currentUser, logout, role, salonId, salonAdi } = useAuth();
  const navigate = useNavigate();
  const [aktifSekme, setAktifSekme] = useState("randevular");

  const isSuperAdmin = role === "superadmin";
  const kullaniciAdi = currentUser?.email?.split("@")[0] || "";
  const aktifLabel = SEKMELER.find((s) => s.id === aktifSekme);

  // SuperAdmin bu sayfaya girerse /superadmin'e yönlendir
  // navigate() useEffect içinde çağrılmalı
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    } else if (isSuperAdmin) {
      navigate("/superadmin");
    }
  }, [currentUser, isSuperAdmin, navigate]);

  // Yönlendirme beklenirken boş render
  if (!currentUser || isSuperAdmin) return null;

  async function handleCikis() {
    try { if (logout) await logout(); navigate("/login"); } catch (_) {}
  }

  return (
    <div className="adm">
      <style>{CSS}</style>

      {/* Hero */}
      <section className="adm-hero">
        <div className="adm-blob1" /><div className="adm-blob2" />
        <div className="adm-hero-inner">
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div className="adm-hero-row">
              <div className="adm-avatar">⚡</div>
              <div>
                <p className="adm-badge">Salon Yönetim Paneli</p>
                <h1 className="adm-title">
                  Hoş geldin, <span className="adm-title-accent">{kullaniciAdi}</span>
                </h1>
                <p className="adm-subtitle">{currentUser.email}</p>
                {salonAdi && (
                  <div className="adm-salon-bant">🏪 {salonAdi}</div>
                )}
                {!salonId && (
                  <div className="adm-salon-bant" style={{ color:"#b45309", borderColor:"rgba(245,158,11,.25)", background:"rgba(245,158,11,.08)" }}>
                    ⚠️ Henüz salon atanmamış
                  </div>
                )}
              </div>
            </div>
            <button className="adm-logout" onClick={handleCikis}>🚪 Çıkış Yap</button>
          </div>
        </div>
      </section>

      {/* Salon atanmamışsa uyarı */}
      {!salonId ? (
        <div className="adm-content">
          <div className="adm-card-wrap">
            <div className="adm-uyari">
              <span className="adm-uyari-icon">🔑</span>
              <h3>Salon Ataması Bekleniyor</h3>
              <p>Hesabınıza henüz bir salon atanmamış. Sistem yöneticisiyle iletişime geçerek salon atamasının yapılmasını isteyin.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Tab bar */}
          <div className="adm-tabs-wrap">
            <div className="adm-tabs">
              {SEKMELER.map((s) => (
                <button key={s.id} className={`adm-tab ${aktifSekme === s.id ? "aktif" : ""}`} onClick={() => setAktifSekme(s.id)}>
                  <span>{s.icon}</span>{s.label}<span className="adm-tab-pip" />
                </button>
              ))}
            </div>
          </div>

          {/* İçerik */}
          <div className="adm-content" key={aktifSekme}>
            <div className="adm-section-head">
              <h2 className="adm-section-title">{aktifLabel?.icon} {aktifLabel?.label}</h2>
              <span className="adm-section-pill">Yönet</span>
            </div>
            <div className="adm-card-wrap">
              <div className="adm-divider" />
              {aktifSekme === "randevular" && <ManageAppointments />}
              {aktifSekme === "salonlar"   && <ManageServices />}
              {aktifSekme === "saatler"    && <ManageWorkingHours />}
              {aktifSekme === "yorumlar"   && <ManageComments />}
            </div>
          </div>
        </>
      )}
    </div>
  );
}