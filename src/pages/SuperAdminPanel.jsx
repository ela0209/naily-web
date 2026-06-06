import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { logActivity } from "../services/logActivity";

const SUPER_ADMIN_EMAIL = "elakaracay2005@gmail.com";

const SEKMELER = [
  { id: "kullanicilar",   label: "Kullanıcılar",    icon: "👥" },
  { id: "salon_sahipleri",label: "Salon Sahipleri",  icon: "🏪" },
  { id: "salonlar",       label: "Salonlar",         icon: "🗂️" },
  { id: "yorumlar",       label: "Yorumlar",         icon: "💬" },
  { id: "loglar",         label: "İşlem Logları",    icon: "📋" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
  @keyframes spin    { to{transform:rotate(360deg)} }

  .sa * { box-sizing:border-box; margin:0; padding:0; }
  .sa { font-family:'Outfit',sans-serif; background:#faf8f5; min-height:100vh; animation:fadeIn 0.35s ease both; color:#1a1625; }

  .sa-hero { position:relative; overflow:hidden; background:linear-gradient(160deg,#fff 0%,#faf8f5 50%,#f3eeff 100%); border-bottom:1px solid #ede8e0; padding:40px 24px 36px; }
  .sa-blob1 { position:absolute; width:500px; height:500px; border-radius:50%; background:radial-gradient(circle,rgba(232,99,140,.07) 0%,transparent 70%); top:-200px; right:-100px; pointer-events:none; }
  .sa-blob2 { position:absolute; width:400px; height:400px; border-radius:50%; background:radial-gradient(circle,rgba(155,114,207,.08) 0%,transparent 70%); bottom:-100px; left:-80px; pointer-events:none; }
  .sa-hero-inner { position:relative; z-index:1; max-width:1100px; margin:0 auto; }
  .sa-hero-row { display:flex; align-items:center; gap:20px; animation:fadeUp .4s .05s ease both; }
  .sa-avatar { width:64px; height:64px; border-radius:18px; background:linear-gradient(135deg,#fdeef4,#f3eeff); border:2px solid rgba(232,99,140,.15); display:flex; align-items:center; justify-content:center; font-size:28px; flex-shrink:0; box-shadow:0 4px 16px rgba(155,114,207,.14); }
  .sa-badge { font-size:11px; font-weight:700; color:#e8638c; letter-spacing:.08em; text-transform:uppercase; margin:0 0 4px; }
  .sa-title { font-family:'Cormorant Garamond',serif; font-size:clamp(22px,3.5vw,34px); font-weight:700; color:#1a1625; line-height:1.15; margin:0 0 4px; }
  .sa-title-accent { background:linear-gradient(135deg,#e8638c,#9b72cf); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
  .sa-subtitle { font-size:12px; color:#8b829a; }

  .sa-tabs-wrap { background:white; border-bottom:1px solid #ede8e0; position:sticky; top:0; z-index:100; box-shadow:0 2px 12px rgba(155,114,207,.06); }
  .sa-tabs { max-width:1100px; margin:0 auto; padding:0 24px; display:flex; overflow-x:auto; scrollbar-width:none; }
  .sa-tabs::-webkit-scrollbar { display:none; }
  .sa-tab { font-family:'Outfit',sans-serif; background:none; border:none; border-bottom:2.5px solid transparent; margin-bottom:-1px; padding:16px 22px; font-size:13px; font-weight:500; color:#8b829a; cursor:pointer; display:flex; align-items:center; gap:7px; white-space:nowrap; transition:all .2s; }
  .sa-tab:hover { color:#9b72cf; background:rgba(155,114,207,.04); }
  .sa-tab.aktif { color:#9b72cf; border-bottom-color:#9b72cf; font-weight:600; }

  .sa-content { max-width:1100px; margin:0 auto; padding:32px 24px 64px; animation:fadeUp .3s ease both; }
  .sa-sh { display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
  .sa-sh-title { font-family:'Cormorant Garamond',serif; font-size:26px; font-weight:700; color:#1a1625; display:flex; align-items:center; gap:10px; }
  .sa-pill { display:inline-flex; align-items:center; background:linear-gradient(135deg,rgba(232,99,140,.07),rgba(155,114,207,.09)); border:1px solid rgba(155,114,207,.15); border-radius:20px; padding:4px 14px; font-size:12px; font-weight:700; color:#9b72cf; }

  .sa-table-wrap { background:white; border-radius:20px; border:1px solid rgba(232,99,140,.08); box-shadow:0 2px 16px rgba(155,114,207,.07); overflow:hidden; }
  .sa-table { width:100%; border-collapse:collapse; }
  .sa-table th { background:linear-gradient(135deg,rgba(232,99,140,.06),rgba(155,114,207,.08)); padding:12px 16px; text-align:left; font-size:11px; font-weight:700; color:#8b829a; text-transform:uppercase; letter-spacing:.06em; }
  .sa-table td { padding:14px 16px; border-top:1px solid rgba(232,99,140,.06); font-size:13px; color:#4a4458; vertical-align:middle; }
  .sa-table tr:hover td { background:rgba(155,114,207,.03); }

  .rol-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .rol-superadmin { background:rgba(245,158,11,.12); color:#b45309; border:1px solid rgba(245,158,11,.25); }
  .rol-admin      { background:rgba(155,114,207,.12); color:#9b72cf; border:1px solid rgba(155,114,207,.25); }
  .rol-user       { background:rgba(16,185,129,.10);  color:#065f46; border:1px solid rgba(16,185,129,.2); }
  .rol-banli      { background:rgba(232,99,140,.12);  color:#9f1239; border:1px solid rgba(232,99,140,.25); }
  .rol-kisitli    { background:rgba(245,158,11,.12);  color:#92400e; border:1px solid rgba(245,158,11,.25); }

  .sa-btn { font-family:'Outfit',sans-serif; border:none; border-radius:8px; padding:6px 12px; font-size:11px; font-weight:600; cursor:pointer; transition:all .18s; white-space:nowrap; }
  .sa-btn-warn  { background:rgba(245,158,11,.10); color:#b45309; border:1px solid rgba(245,158,11,.25); }
  .sa-btn-warn:hover  { background:rgba(245,158,11,.2); }
  .sa-btn-dang  { background:rgba(232,99,140,.08); color:#e8638c; border:1px solid rgba(232,99,140,.2); }
  .sa-btn-dang:hover  { background:rgba(232,99,140,.16); }
  .sa-btn-succ  { background:rgba(16,185,129,.08); color:#065f46; border:1px solid rgba(16,185,129,.2); }
  .sa-btn-succ:hover  { background:rgba(16,185,129,.16); }
  .sa-btn-prim  { background:linear-gradient(135deg,#e8638c,#9b72cf); color:white; box-shadow:0 4px 14px rgba(232,99,140,.22); }
  .sa-btn-prim:hover  { transform:translateY(-1px); box-shadow:0 6px 20px rgba(232,99,140,.3); }
  .sa-btn-gap { display:flex; gap:6px; flex-wrap:wrap; }

  .sa-modal-bg  { position:fixed; inset:0; background:rgba(26,22,37,.45); z-index:500; display:flex; align-items:center; justify-content:center; padding:20px; animation:fadeIn .2s ease; }
  .sa-modal     { background:white; border-radius:24px; padding:32px; max-width:500px; width:100%; box-shadow:0 24px 64px rgba(155,114,207,.2); animation:fadeUp .25s ease both; max-height:90vh; overflow-y:auto; }
  .sa-modal h3  { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; margin-bottom:12px; color:#1a1625; }
  .sa-modal p   { font-size:13px; color:#6b6278; line-height:1.6; margin-bottom:20px; }
  .sa-modal-btns { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
  .sa-modal label { font-size:12px; font-weight:600; color:#4a4458; display:block; margin-bottom:4px; margin-top:12px; }
  .sa-modal input, .sa-modal select, .sa-modal textarea { font-family:'Outfit',sans-serif; width:100%; padding:10px 14px; border-radius:12px; border:1.5px solid #e8e2d9; font-size:13px; outline:none; color:#1a1625; background:#faf8f5; transition:border .2s; }
  .sa-modal input:focus, .sa-modal select:focus, .sa-modal textarea:focus { border-color:rgba(155,114,207,.45); background:white; }
  .sa-modal textarea { resize:vertical; min-height:80px; }

  .sa-select { font-family:'Outfit',sans-serif; padding:6px 10px; border-radius:10px; border:1.5px solid #e8e2d9; font-size:12px; color:#1a1625; background:#faf8f5; cursor:pointer; outline:none; }
  .sa-select:focus { border-color:rgba(155,114,207,.45); }

  .sa-spinner { width:32px; height:32px; border-radius:50%; border:3px solid #f3eeff; border-top-color:#9b72cf; animation:spin .8s linear infinite; margin:60px auto; }
  .sa-empty { text-align:center; padding:48px 24px; color:#8b829a; font-size:14px; }
  .sa-empty span { display:block; font-size:40px; margin-bottom:12px; }

  .sa-logout { font-family:'Outfit',sans-serif; display:inline-flex; align-items:center; gap:7px; padding:8px 18px; border-radius:12px; border:1.5px solid rgba(232,99,140,.2); background:rgba(232,99,140,.05); color:#e8638c; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; }
  .sa-logout:hover { background:rgba(232,99,140,.1); border-color:rgba(232,99,140,.35); transform:translateY(-1px); }

  .sa-search { font-family:'Outfit',sans-serif; padding:10px 14px; border-radius:12px; border:1.5px solid #e8e2d9; font-size:13px; color:#1a1625; background:white; outline:none; width:260px; transition:all .22s; }
  .sa-search:focus { border-color:rgba(155,114,207,.45); box-shadow:0 0 0 3px rgba(155,114,207,.1); }

  .sa-log-item { display:flex; gap:14px; padding:14px 20px; border-top:1px solid rgba(232,99,140,.06); align-items:flex-start; }
  .sa-log-item:first-child { border-top:none; }
  .sa-log-icon { width:36px; height:36px; border-radius:10px; background:linear-gradient(135deg,rgba(232,99,140,.08),rgba(155,114,207,.1)); display:flex; align-items:center; justify-content:center; font-size:16px; flex-shrink:0; }
  .sa-log-meta { font-size:11px; color:#8b829a; margin-top:3px; }

  .sa-stats { display:flex; gap:12px; flex-wrap:wrap; margin-top:28px; animation:fadeUp .4s .15s ease both; }
  .sa-stat { flex:1 1 130px; background:white; border-radius:18px; border:1px solid rgba(232,99,140,.08); padding:18px 20px; box-shadow:0 2px 12px rgba(155,114,207,.07); }
  .sa-stat-val { font-family:'Cormorant Garamond',serif; font-size:30px; font-weight:700; background:linear-gradient(135deg,#e8638c,#9b72cf); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1; }
  .sa-stat-label { font-size:11px; color:#8b829a; font-weight:600; text-transform:uppercase; letter-spacing:.06em; margin-top:4px; }

  .salon-aktif { color:#065f46; background:rgba(16,185,129,.08); border:1px solid rgba(16,185,129,.2); padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .salon-banli { color:#9f1239; background:rgba(232,99,140,.08); border:1px solid rgba(232,99,140,.2); padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }

  /* Salon sahibi kartları */
  .sahip-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:16px; }
  .sahip-kart { background:white; border-radius:20px; border:1px solid rgba(232,99,140,.08); box-shadow:0 2px 16px rgba(155,114,207,.07); padding:20px; transition:transform .2s, box-shadow .2s; }
  .sahip-kart:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(155,114,207,.12); }
  .sahip-kart-header { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .sahip-avatar { width:46px; height:46px; border-radius:14px; background:linear-gradient(135deg,rgba(232,99,140,.1),rgba(155,114,207,.15)); display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
  .sahip-email { font-size:13px; font-weight:600; color:#1a1625; word-break:break-all; }
  .sahip-salon { font-size:12px; color:#8b829a; margin-top:2px; }
  .sahip-info-row { display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-top:1px solid rgba(232,99,140,.06); font-size:12px; color:#6b6278; }
  .sahip-info-key { font-weight:600; color:#4a4458; }
  .sahip-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:14px; padding-top:14px; border-top:1px solid rgba(232,99,140,.06); }

  /* Yetki toggle */
  .yetki-liste { display:flex; flex-direction:column; gap:10px; margin:16px 0; }
  .yetki-item { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#faf8f5; border-radius:12px; border:1px solid #ede8e0; }
  .yetki-label { font-size:13px; font-weight:600; color:#1a1625; }
  .yetki-desc { font-size:11px; color:#8b829a; margin-top:2px; }
  .toggle-wrap { position:relative; width:44px; height:24px; flex-shrink:0; }
  .toggle-inp { opacity:0; width:0; height:0; position:absolute; }
  .toggle-slider { position:absolute; inset:0; border-radius:24px; background:#e8e2d9; cursor:pointer; transition:.3s; }
  .toggle-slider:before { content:''; position:absolute; width:18px; height:18px; border-radius:50%; background:white; bottom:3px; left:3px; transition:.3s; box-shadow:0 1px 4px rgba(0,0,0,.15); }
  .toggle-inp:checked + .toggle-slider { background:linear-gradient(135deg,#e8638c,#9b72cf); }
  .toggle-inp:checked + .toggle-slider:before { transform:translateX(20px); }

  /* Ban info card */
  .ban-info { background:rgba(232,99,140,.05); border:1px solid rgba(232,99,140,.15); border-radius:14px; padding:14px 16px; margin-bottom:16px; }
  .ban-info-title { font-size:12px; font-weight:700; color:#e8638c; margin-bottom:4px; }
  .ban-info-text { font-size:12px; color:#6b6278; }

  @media(max-width:700px) {
    .sa-table th:nth-child(3), .sa-table td:nth-child(3) { display:none; }
    .sa-stats .sa-stat:nth-child(n+3) { display:none; }
    .sahip-grid { grid-template-columns:1fr; }
  }
`;

/* ─────────────────────────────────────────
   ANA BİLEŞEN
───────────────────────────────────────── */
export default function SuperAdminPanel() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser || currentUser.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div style={{ minHeight:"60vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"Outfit,sans-serif", gap:16 }}>
        <span style={{ fontSize:52 }}>🚫</span>
        <h2 style={{ color:"#1a1625" }}>Yetkisiz Erişim</h2>
        <p style={{ color:"#8b829a", fontSize:14 }}>Bu sayfa yalnızca süper admin içindir.</p>
        <button onClick={() => navigate("/")} style={{ padding:"10px 24px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#e8638c,#9b72cf)", color:"white", fontFamily:"Outfit,sans-serif", fontWeight:700, cursor:"pointer" }}>
          Ana Sayfaya Dön
        </button>
      </div>
    );
  }

  const [sekme, setSekme] = useState("kullanicilar");
  const [istatistikler, setIstatistikler] = useState({ kullanici:0, salon:0, randevu:0, yorum:0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [k, s, r, y] = await Promise.all([
          getDocs(collection(db, "users")),
          getDocs(collection(db, "salons")),
          getDocs(collection(db, "randevular")),
          getDocs(collection(db, "yorumlar")),
        ]);
        setIstatistikler({ kullanici:k.size, salon:s.size, randevu:r.size, yorum:y.size });
      } catch (_) {}
    }
    fetchStats();
  }, []);

  async function handleCikis() {
    try { if (logout) await logout(); navigate("/login"); } catch (_) {}
  }

  return (
    <div className="sa">
      <style>{CSS}</style>

      <section className="sa-hero">
        <div className="sa-blob1" /><div className="sa-blob2" />
        <div className="sa-hero-inner">
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
            <div className="sa-hero-row">
              <div className="sa-avatar">👑</div>
              <div>
                <p className="sa-badge">Süper Admin Paneli</p>
                <h1 className="sa-title">Sistem <span className="sa-title-accent">Yönetimi</span></h1>
                <p className="sa-subtitle">{currentUser.email}</p>
              </div>
            </div>
            <button className="sa-logout" onClick={handleCikis}>🚪 Çıkış Yap</button>
          </div>
          <div className="sa-stats">
            {[
              { icon:"👥", val:istatistikler.kullanici, label:"Kullanıcı" },
              { icon:"🏪", val:istatistikler.salon,     label:"Salon"     },
              { icon:"📅", val:istatistikler.randevu,   label:"Randevu"   },
              { icon:"💬", val:istatistikler.yorum,     label:"Yorum"     },
            ].map(st => (
              <div key={st.label} className="sa-stat">
                <span style={{ fontSize:20 }}>{st.icon}</span>
                <div className="sa-stat-val">{st.val}</div>
                <div className="sa-stat-label">{st.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="sa-tabs-wrap">
        <div className="sa-tabs">
          {SEKMELER.map(s => (
            <button key={s.id} className={`sa-tab ${sekme === s.id ? "aktif" : ""}`} onClick={() => setSekme(s.id)}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sa-content" key={sekme}>
        {sekme === "kullanicilar"    && <KullanicilarTab />}
        {sekme === "salon_sahipleri" && <SalonSahipleriTab />}
        {sekme === "salonlar"        && <SalonlarTab />}
        {sekme === "yorumlar"        && <YorumlarTab />}
        {sekme === "loglar"          && <LoglarTab />}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   KULLANICILAR TABI
════════════════════════════════════════ */
function KullanicilarTab() {
  const { currentUser } = useAuth();
  const [kullanicilar, setKullanicilar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [modal, setModal] = useState(null);
  const [banModal, setBanModal] = useState(null); // { kullanici }
  const [banForm, setBanForm] = useState({ neden:"", sure:"" });

  useEffect(() => { fetchKullanicilar(); }, []);

  async function fetchKullanicilar() {
    setYukleniyor(true);
    try {
      const snap = await getDocs(collection(db, "users"));
      setKullanicilar(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (_) {}
    setYukleniyor(false);
  }

  async function rolDegistir(kullanici, yeniRol) {
    try {
      await updateDoc(doc(db, "users", kullanici.id), { role: yeniRol });
      await logActivity(currentUser.uid, currentUser.email, "rol_degistir", {
        hedefEmail: kullanici.email, eskiRol: kullanici.role, yeniRol
      });
      fetchKullanicilar();
      setModal(null);
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function kullaniciBanla(kullanici) {
    const simdi = new Date();
    let bitis = null;
    if (banForm.sure && banForm.sure !== "daimi") {
      bitis = new Date(simdi.getTime() + parseInt(banForm.sure) * 24 * 60 * 60 * 1000);
    }
    try {
      await updateDoc(doc(db, "users", kullanici.id), {
        banlı: true,
        banNeden: banForm.neden || "Belirtilmedi",
        banTarihi: simdi.toISOString(),
        banBitis: bitis ? bitis.toISOString() : null,
      });
      await logActivity(currentUser.uid, currentUser.email, "kullanici_banla", {
        hedefEmail: kullanici.email, neden: banForm.neden, sure: banForm.sure
      });
      fetchKullanicilar();
      setBanModal(null);
      setBanForm({ neden:"", sure:"" });
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function kullaniciBanKaldir(kullanici) {
    try {
      await updateDoc(doc(db, "users", kullanici.id), {
        banlı: false, banNeden: null, banTarihi: null, banBitis: null
      });
      await logActivity(currentUser.uid, currentUser.email, "kullanici_bansiz", { hedefEmail: kullanici.email });
      fetchKullanicilar();
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function yorumKisitlaToggle(kullanici) {
    const yeni = !kullanici.yorumKisitli;
    try {
      await updateDoc(doc(db, "users", kullanici.id), { yorumKisitli: yeni });
      await logActivity(currentUser.uid, currentUser.email, yeni ? "yorum_kisitla" : "yorum_kisit_kaldir", { hedefEmail: kullanici.email });
      fetchKullanicilar();
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function kullaniciSil(kullanici) {
    try {
      await deleteDoc(doc(db, "users", kullanici.id));
      await logActivity(currentUser.uid, currentUser.email, "kullanici_sil", { hedefEmail: kullanici.email });
      fetchKullanicilar();
      setModal(null);
    } catch (e) { alert("Hata: " + e.message); }
  }

  const filtreli = kullanicilar.filter(k =>
    (k.email || "").toLowerCase().includes(arama.toLowerCase()) ||
    (k.name || "").toLowerCase().includes(arama.toLowerCase())
  );

  const rolBadge = (k) => {
    if (k.email === SUPER_ADMIN_EMAIL) return <span className="rol-badge rol-superadmin">👑 Süper Admin</span>;
    if (k.banlı) return <span className="rol-badge rol-banli">🚫 Banlı</span>;
    if (k.yorumKisitli) return <span className="rol-badge rol-kisitli">⚠️ Kısıtlı</span>;
    if (k.role === "admin") return <span className="rol-badge rol-admin">⚡ Admin</span>;
    return <span className="rol-badge rol-user">👤 Kullanıcı</span>;
  };

  return (
    <>
      <div className="sa-sh">
        <h2 className="sa-sh-title">👥 Kullanıcılar <span className="sa-pill">{filtreli.length}</span></h2>
        <input className="sa-search" placeholder="E-posta veya isim ara..." value={arama} onChange={e => setArama(e.target.value)} />
      </div>

      <div className="sa-table-wrap">
        {yukleniyor ? <div className="sa-spinner" /> : filtreli.length === 0 ? (
          <div className="sa-empty"><span>🔍</span>Sonuç bulunamadı.</div>
        ) : (
          <table className="sa-table">
            <thead>
              <tr>
                <th>E-posta / İsim</th>
                <th>Durum</th>
                <th>Rol</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtreli.map(k => (
                <tr key={k.id}>
                  <td>
                    <div style={{ fontWeight:500 }}>{k.email}</div>
                    {k.name && <div style={{ fontSize:11, color:"#8b829a" }}>{k.name}</div>}
                  </td>
                  <td>{rolBadge(k)}</td>
                  <td>
                    {k.email !== SUPER_ADMIN_EMAIL && (
                      <select className="sa-select" value={k.role || "user"}
                        onChange={e => setModal({ tip:"rol", kullanici:k, yeniRol:e.target.value })}>
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {k.email === SUPER_ADMIN_EMAIL ? (
                      <span style={{ fontSize:12, color:"#8b829a" }}>Düzenlenemez</span>
                    ) : (
                      <div className="sa-btn-gap">
                        {/* Yorum Kısıtlama */}
                        <button
                          className={`sa-btn ${k.yorumKisitli ? "sa-btn-succ" : "sa-btn-warn"}`}
                          onClick={() => yorumKisitlaToggle(k)}
                          title={k.yorumKisitli ? "Yorum kısıtlamasını kaldır" : "Yorum yapmasını kısıtla"}
                        >
                          {k.yorumKisitli ? "💬 Kısıt Kaldır" : "🔇 Yorum Kısıtla"}
                        </button>

                        {/* Ban */}
                        {k.banlı ? (
                          <button className="sa-btn sa-btn-succ" onClick={() => kullaniciBanKaldir(k)}>
                            ✅ Banı Kaldır
                          </button>
                        ) : (
                          <button className="sa-btn sa-btn-warn" onClick={() => { setBanModal({ kullanici:k }); setBanForm({ neden:"", sure:"7" }); }}>
                            🚫 Banla
                          </button>
                        )}

                        {/* Sil */}
                        <button className="sa-btn sa-btn-dang" onClick={() => setModal({ tip:"sil", kullanici:k })}>
                          🗑 Sil
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rol değiştirme onay modalı */}
      {modal?.tip === "rol" && (
        <OnayModal
          baslik="Rol Değiştir"
          mesaj={`${modal.kullanici.email} kullanıcısının rolü "${modal.yeniRol === "admin" ? "Admin" : "Kullanıcı"}" olarak değiştirilsin mi?`}
          onOnayla={() => rolDegistir(modal.kullanici, modal.yeniRol)}
          onIptal={() => setModal(null)}
        />
      )}

      {/* Silme onay modalı */}
      {modal?.tip === "sil" && (
        <OnayModal
          baslik="Kullanıcıyı Sil"
          mesaj={`${modal.kullanici.email} kullanıcısı kalıcı olarak silinsin mi? Bu işlem geri alınamaz.`}
          onOnayla={() => kullaniciSil(modal.kullanici)}
          onIptal={() => setModal(null)}
          tehlikeli
        />
      )}

      {/* Ban detay modalı */}
      {banModal && (
        <div className="sa-modal-bg" onClick={() => setBanModal(null)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <h3>🚫 Kullanıcıyı Banla</h3>
            <p style={{ marginBottom:4 }}><strong>{banModal.kullanici.email}</strong> kullanıcısı banlanacak.</p>
            <label>Ban Süresi</label>
            <select value={banForm.sure} onChange={e => setBanForm(f => ({ ...f, sure:e.target.value }))}>
              <option value="1">1 Gün</option>
              <option value="3">3 Gün</option>
              <option value="7">7 Gün</option>
              <option value="30">30 Gün</option>
              <option value="daimi">Daimi</option>
            </select>
            <label>Ban Sebebi</label>
            <textarea
              placeholder="Ban sebebini yazın (isteğe bağlı)..."
              value={banForm.neden}
              onChange={e => setBanForm(f => ({ ...f, neden:e.target.value }))}
            />
            <div className="sa-modal-btns">
              <button className="sa-btn sa-btn-succ" onClick={() => setBanModal(null)}>İptal</button>
              <button className="sa-btn sa-btn-dang" onClick={() => kullaniciBanla(banModal.kullanici)}>Banla</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════
   SALON SAHİPLERİ TABI  ← YENİ
════════════════════════════════════════ */
function SalonSahipleriTab() {
  const { currentUser } = useAuth();
  const [sahipler, setSahipler] = useState([]);
  const [salonlar, setSalonlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [yetkiModal, setYetkiModal] = useState(null); // { sahip }
  const [salonAtaModal, setSalonAtaModal] = useState(null); // { sahip }
  const [secilenSalon, setSecilenSalon] = useState("");
  const [yetkiler, setYetkiler] = useState({});

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setYukleniyor(true);
    try {
      const [usersSnap, salonsSnap] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "salons")),
      ]);
      const tumKullanicilar = usersSnap.docs.map(d => ({ id:d.id, ...d.data() }));
      // Admin rolündekiler = salon sahibi adayları
      const adminler = tumKullanicilar.filter(k =>
        k.role === "admin" && k.email !== SUPER_ADMIN_EMAIL
      );
      setSahipler(adminler);
      setSalonlar(salonsSnap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (_) {}
    setYukleniyor(false);
  }

  function yetkiModalAc(sahip) {
    setYetkiler({
      randevuGorebilir:    sahip.yetkiler?.randevuGorebilir    ?? true,
      randevuYonetebilir:  sahip.yetkiler?.randevuYonetebilir  ?? true,
      yorumGorebilir:      sahip.yetkiler?.yorumGorebilir      ?? true,
      yorumSilebilir:      sahip.yetkiler?.yorumSilebilir      ?? false,
      salonDuzenleyebilir: sahip.yetkiler?.salonDuzenleyebilir ?? true,
      istatistikGorebilir: sahip.yetkiler?.istatistikGorebilir ?? true,
    });
    setYetkiModal({ sahip });
  }

  async function yetkiKaydet() {
    try {
      await updateDoc(doc(db, "users", yetkiModal.sahip.id), { yetkiler });
      await logActivity(currentUser.uid, currentUser.email, "salon_sahibi_yetki_guncelle", {
        hedefEmail: yetkiModal.sahip.email,
        yetkiler: JSON.stringify(yetkiler)
      });
      fetchData();
      setYetkiModal(null);
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function salonAta() {
    if (!secilenSalon) return alert("Lütfen bir salon seçin.");
    try {
      await updateDoc(doc(db, "users", salonAtaModal.sahip.id), { salonId: secilenSalon });
      const salonAdi = salonlar.find(s => s.id === secilenSalon)?.name || secilenSalon;
      await logActivity(currentUser.uid, currentUser.email, "salon_sahibi_salon_ata", {
        hedefEmail: salonAtaModal.sahip.email, salonAdi
      });
      fetchData();
      setSalonAtaModal(null);
      setSecilenSalon("");
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function salonKaldir(sahip) {
    try {
      await updateDoc(doc(db, "users", sahip.id), { salonId: null });
      await logActivity(currentUser.uid, currentUser.email, "salon_sahibi_salon_kaldir", { hedefEmail: sahip.email });
      fetchData();
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function adminYetkisiAlKaldir(sahip) {
    try {
      await updateDoc(doc(db, "users", sahip.id), { role:"user", salonId:null });
      await logActivity(currentUser.uid, currentUser.email, "admin_yetki_kaldir", { hedefEmail: sahip.email });
      fetchData();
    } catch (e) { alert("Hata: " + e.message); }
  }

  const filtreli = sahipler.filter(s =>
    (s.email || "").toLowerCase().includes(arama.toLowerCase()) ||
    (s.name || "").toLowerCase().includes(arama.toLowerCase())
  );

  const YETKI_TANIMLARI = [
    { key:"randevuGorebilir",    label:"Randevuları Görebilir",    desc:"Salon randevularını listeleyip görebilir" },
    { key:"randevuYonetebilir",  label:"Randevuları Yönetebilir",  desc:"Randevuları onaylayıp iptal edebilir"    },
    { key:"yorumGorebilir",      label:"Yorumları Görebilir",      desc:"Salona gelen yorumları görebilir"        },
    { key:"yorumSilebilir",      label:"Yorum Silebilir",          desc:"Kendi salonuna gelen yorumları silebilir"},
    { key:"salonDuzenleyebilir", label:"Salonu Düzenleyebilir",    desc:"Salon bilgilerini güncelleyebilir"       },
    { key:"istatistikGorebilir", label:"İstatistikleri Görebilir", desc:"Salon istatistiklerine erişebilir"       },
  ];

  return (
    <>
      <div className="sa-sh">
        <h2 className="sa-sh-title">🏪 Salon Sahipleri <span className="sa-pill">{filtreli.length}</span></h2>
        <input className="sa-search" placeholder="E-posta veya isim ara..." value={arama} onChange={e => setArama(e.target.value)} />
      </div>

      {yukleniyor ? <div className="sa-spinner" /> : filtreli.length === 0 ? (
        <div className="sa-empty"><span>🏪</span>Salon sahibi bulunamadı. Kullanıcılar sekmesinden admin rolü verin.</div>
      ) : (
        <div className="sahip-grid">
          {filtreli.map(sahip => {
            const atanenSalon = salonlar.find(s => s.id === sahip.salonId);
            return (
              <div key={sahip.id} className="sahip-kart">
                <div className="sahip-kart-header">
                  <div className="sahip-avatar">🏪</div>
                  <div>
                    <div className="sahip-email">{sahip.email}</div>
                    <div className="sahip-salon">
                      {atanenSalon
                        ? <span style={{ color:"#9b72cf", fontWeight:600 }}>📍 {atanenSalon.name}</span>
                        : <span style={{ color:"#e8638c" }}>⚠️ Salon atanmamış</span>}
                    </div>
                  </div>
                </div>

                {/* Yetki özeti */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                  {Object.entries(sahip.yetkiler || {}).map(([k, v]) => v && (
                    <span key={k} style={{ fontSize:10, padding:"2px 8px", borderRadius:20, background:"rgba(155,114,207,.1)", color:"#9b72cf", fontWeight:600 }}>
                      ✓ {YETKI_TANIMLARI.find(y => y.key === k)?.label || k}
                    </span>
                  ))}
                  {!sahip.yetkiler && (
                    <span style={{ fontSize:11, color:"#8b829a" }}>Varsayılan yetkiler</span>
                  )}
                </div>

                <div className="sahip-actions">
                  <button className="sa-btn sa-btn-prim" onClick={() => yetkiModalAc(sahip)}>
                    🔑 Yetkileri Düzenle
                  </button>
                  <button className="sa-btn sa-btn-warn" onClick={() => { setSalonAtaModal({ sahip }); setSecilenSalon(sahip.salonId || ""); }}>
                    🏪 {atanenSalon ? "Salonu Değiştir" : "Salon Ata"}
                  </button>
                  {atanenSalon && (
                    <button className="sa-btn sa-btn-dang" onClick={() => salonKaldir(sahip)}>
                      ✂️ Salonu Kaldır
                    </button>
                  )}
                  <button className="sa-btn sa-btn-dang" onClick={() => adminYetkisiAlKaldir(sahip)} title="Admin yetkisini kaldır">
                    🚫 Yetkiyi Al
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Yetki düzenleme modalı */}
      {yetkiModal && (
        <div className="sa-modal-bg" onClick={() => setYetkiModal(null)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <h3>🔑 Yetki Düzenle</h3>
            <p>{yetkiModal.sahip.email} için salon yönetim yetkilerini ayarlayın.</p>
            <div className="yetki-liste">
              {YETKI_TANIMLARI.map(y => (
                <div key={y.key} className="yetki-item">
                  <div>
                    <div className="yetki-label">{y.label}</div>
                    <div className="yetki-desc">{y.desc}</div>
                  </div>
                  <label className="toggle-wrap">
                    <input
                      type="checkbox"
                      className="toggle-inp"
                      checked={yetkiler[y.key] ?? false}
                      onChange={e => setYetkiler(prev => ({ ...prev, [y.key]: e.target.checked }))}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
              ))}
            </div>
            <div className="sa-modal-btns">
              <button className="sa-btn sa-btn-dang" onClick={() => setYetkiModal(null)}>İptal</button>
              <button className="sa-btn sa-btn-prim" onClick={yetkiKaydet}>💾 Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* Salon atama modalı */}
      {salonAtaModal && (
        <div className="sa-modal-bg" onClick={() => setSalonAtaModal(null)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <h3>🏪 Salon Ata</h3>
            <p><strong>{salonAtaModal.sahip.email}</strong> kullanıcısına salon atayın.</p>
            <label>Salon Seç</label>
            <select value={secilenSalon} onChange={e => setSecilenSalon(e.target.value)}>
              <option value="">— Salon seçin —</option>
              {salonlar.map(s => (
                <option key={s.id} value={s.id}>{s.name} {s.address ? `(${s.address})` : ""}</option>
              ))}
            </select>
            <div className="sa-modal-btns">
              <button className="sa-btn sa-btn-dang" onClick={() => setSalonAtaModal(null)}>İptal</button>
              <button className="sa-btn sa-btn-prim" onClick={salonAta}>✅ Ata</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ════════════════════════════════════════
   SALONLAR TABI
════════════════════════════════════════ */
function SalonlarTab() {
  const { currentUser } = useAuth();
  const [salonlar, setSalonlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [modal, setModal] = useState(null);
  const [duzenleme, setDuzenleme] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { fetchSalonlar(); }, []);

  async function fetchSalonlar() {
    setYukleniyor(true);
    try {
      const snap = await getDocs(collection(db, "salons"));
      setSalonlar(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (_) {}
    setYukleniyor(false);
  }

  async function salonBanla(salon) {
    const yeni = !salon.banlı;
    try {
      await updateDoc(doc(db, "salons", salon.id), { banlı: yeni });
      await logActivity(currentUser.uid, currentUser.email, yeni ? "salon_banla" : "salon_bansiz", { salonAdi:salon.name });
      fetchSalonlar();
      setModal(null);
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function salonSil(salon) {
    try {
      await deleteDoc(doc(db, "salons", salon.id));
      await logActivity(currentUser.uid, currentUser.email, "salon_sil", { salonAdi:salon.name });
      fetchSalonlar();
      setModal(null);
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function salonKaydet() {
    try {
      await updateDoc(doc(db, "salons", duzenleme.id), {
        name:    form.name    || duzenleme.name,
        address: form.address || duzenleme.address,
        phone:   form.phone   || duzenleme.phone || "",
      });
      await logActivity(currentUser.uid, currentUser.email, "salon_duzenle", { salonAdi:duzenleme.name });
      fetchSalonlar();
      setDuzenleme(null);
    } catch (e) { alert("Hata: " + e.message); }
  }

  const filtreli = salonlar.filter(s =>
    (s.name || "").toLowerCase().includes(arama.toLowerCase()) ||
    (s.address || "").toLowerCase().includes(arama.toLowerCase())
  );

  return (
    <>
      <div className="sa-sh">
        <h2 className="sa-sh-title">🗂️ Salonlar <span className="sa-pill">{filtreli.length}</span></h2>
        <input className="sa-search" placeholder="Salon adı veya adres..." value={arama} onChange={e => setArama(e.target.value)} />
      </div>

      <div className="sa-table-wrap">
        {yukleniyor ? <div className="sa-spinner" /> : filtreli.length === 0 ? (
          <div className="sa-empty"><span>🏪</span>Salon bulunamadı.</div>
        ) : (
          <table className="sa-table">
            <thead>
              <tr><th>Salon Adı</th><th>Adres</th><th>Durum</th><th>İşlemler</th></tr>
            </thead>
            <tbody>
              {filtreli.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight:600 }}>{s.name}</td>
                  <td style={{ color:"#8b829a", fontSize:12 }}>{s.address || "-"}</td>
                  <td>
                    {s.banlı
                      ? <span className="salon-banli">🚫 Banlı</span>
                      : <span className="salon-aktif">✅ Aktif</span>}
                  </td>
                  <td>
                    <div className="sa-btn-gap">
                      <button className="sa-btn sa-btn-prim" onClick={() => { setDuzenleme(s); setForm({ name:s.name, address:s.address, phone:s.phone }); }}>
                        ✏️ Düzenle
                      </button>
                      <button className={`sa-btn ${s.banlı ? "sa-btn-succ" : "sa-btn-warn"}`} onClick={() => setModal({ tip:"ban", salon:s })}>
                        {s.banlı ? "✅ Banı Kaldır" : "🚫 Banla"}
                      </button>
                      <button className="sa-btn sa-btn-dang" onClick={() => setModal({ tip:"sil", salon:s })}>🗑 Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {duzenleme && (
        <div className="sa-modal-bg" onClick={() => setDuzenleme(null)}>
          <div className="sa-modal" onClick={e => e.stopPropagation()}>
            <h3>✏️ Salon Düzenle</h3>
            <p>Salon bilgilerini güncelleyin.</p>
            {[["name","Salon Adı"],["address","Adres"],["phone","Telefon"]].map(([alan, etiket]) => (
              <div key={alan}>
                <label>{etiket}</label>
                <input value={form[alan] || ""} onChange={e => setForm(f => ({ ...f, [alan]:e.target.value }))} />
              </div>
            ))}
            <div className="sa-modal-btns">
              <button className="sa-btn sa-btn-dang" onClick={() => setDuzenleme(null)}>İptal</button>
              <button className="sa-btn sa-btn-prim" onClick={salonKaydet}>Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {modal?.tip === "ban" && (
        <OnayModal
          baslik={modal.salon.banlı ? "Banı Kaldır" : "Salonu Banla"}
          mesaj={`"${modal.salon.name}" salonu ${modal.salon.banlı ? "ban'dan çıkarılsın" : "banlansın"} mı?`}
          onOnayla={() => salonBanla(modal.salon)}
          onIptal={() => setModal(null)}
          tehlikeli={!modal.salon.banlı}
        />
      )}
      {modal?.tip === "sil" && (
        <OnayModal
          baslik="Salonu Sil"
          mesaj={`"${modal.salon.name}" kalıcı olarak silinsin mi?`}
          onOnayla={() => salonSil(modal.salon)}
          onIptal={() => setModal(null)}
          tehlikeli
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════
   YORUMLAR TABI
════════════════════════════════════════ */
function YorumlarTab() {
  const { currentUser } = useAuth();
  const [yorumlar, setYorumlar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [arama, setArama] = useState("");
  const [modal, setModal] = useState(null);
  const [filtre, setFiltre] = useState("tumu"); // tumu | gizli | gorunur | dusuk_puan

  useEffect(() => { fetchYorumlar(); }, []);

  async function fetchYorumlar() {
    setYukleniyor(true);
    try {
      const snap = await getDocs(collection(db, "yorumlar"));
      setYorumlar(snap.docs.map(d => ({ id:d.id, ...d.data() })));
    } catch (_) {}
    setYukleniyor(false);
  }

  async function yorumSil(yorum) {
    try {
      await deleteDoc(doc(db, "yorumlar", yorum.id));
      await logActivity(currentUser.uid, currentUser.email, "yorum_sil", { yorumId:yorum.id, kullanici:yorum.kullanici });
      fetchYorumlar();
      setModal(null);
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function yorumGizle(yorum) {
    const yeni = !yorum.gizli;
    try {
      await updateDoc(doc(db, "yorumlar", yorum.id), { gizli:yeni });
      await logActivity(currentUser.uid, currentUser.email, yeni ? "yorum_gizle" : "yorum_goster", { yorumId:yorum.id });
      fetchYorumlar();
    } catch (e) { alert("Hata: " + e.message); }
  }

  async function yorumOnayla(yorum) {
    try {
      await updateDoc(doc(db, "yorumlar", yorum.id), { onaylandi:true, gizli:false });
      await logActivity(currentUser.uid, currentUser.email, "yorum_onayla", { yorumId:yorum.id });
      fetchYorumlar();
    } catch (e) { alert("Hata: " + e.message); }
  }

  // Kullanıcının tüm yorumlarını toplu gizle
  async function kullaniciyiYorumKisitla(kullaniciEmail) {
    try {
      const kisitlanacaklar = yorumlar.filter(y => y.kullanici === kullaniciEmail);
      await Promise.all(kisitlanacaklar.map(y =>
        updateDoc(doc(db, "yorumlar", y.id), { gizli:true })
      ));
      await logActivity(currentUser.uid, currentUser.email, "kullanici_yorumlari_gizle", { hedef:kullaniciEmail, adet:kisitlanacaklar.length });
      fetchYorumlar();
    } catch (e) { alert("Hata: " + e.message); }
  }

  let filtreli = yorumlar.filter(y =>
    (y.kullanici || "").toLowerCase().includes(arama.toLowerCase()) ||
    (y.yorum || y.metin || "").toLowerCase().includes(arama.toLowerCase())
  );
  if (filtre === "gizli")     filtreli = filtreli.filter(y => y.gizli);
  if (filtre === "gorunur")   filtreli = filtreli.filter(y => !y.gizli);
  if (filtre === "dusuk_puan")filtreli = filtreli.filter(y => (y.puan || 0) <= 2);

  return (
    <>
      <div className="sa-sh">
        <h2 className="sa-sh-title">💬 Yorumlar <span className="sa-pill">{filtreli.length}</span></h2>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <select className="sa-select" value={filtre} onChange={e => setFiltre(e.target.value)}>
            <option value="tumu">Tümü</option>
            <option value="gorunur">Görünür</option>
            <option value="gizli">Gizli</option>
            <option value="dusuk_puan">Düşük Puan (≤2)</option>
          </select>
          <input className="sa-search" style={{ width:200 }} placeholder="Kullanıcı veya içerik..." value={arama} onChange={e => setArama(e.target.value)} />
        </div>
      </div>

      <div className="sa-table-wrap">
        {yukleniyor ? <div className="sa-spinner" /> : filtreli.length === 0 ? (
          <div className="sa-empty"><span>💬</span>Yorum bulunamadı.</div>
        ) : (
          <table className="sa-table">
            <thead>
              <tr><th>Kullanıcı</th><th>Yorum</th><th>Puan</th><th>Durum</th><th>İşlemler</th></tr>
            </thead>
            <tbody>
              {filtreli.map(y => (
                <tr key={y.id}>
                  <td>
                    <div style={{ fontSize:12, color:"#6b6278", fontWeight:500 }}>{y.kullanici || "-"}</div>
                    <button
                      style={{ fontSize:10, color:"#e8638c", background:"none", border:"none", cursor:"pointer", padding:0, marginTop:2 }}
                      onClick={() => kullaniciyiYorumKisitla(y.kullanici)}
                      title="Bu kullanıcının tüm yorumlarını gizle"
                    >
                      🔇 Tüm yorumları gizle
                    </button>
                  </td>
                  <td style={{ maxWidth:200 }}>
                    <span style={{ display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", fontSize:13 }}>
                      {y.yorum || y.metin || "-"}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: (y.puan || 0) <= 2 ? "#e8638c" : "#065f46", fontWeight:700 }}>
                      {"⭐".repeat(y.puan || 0)} {y.puan}/5
                    </span>
                  </td>
                  <td>
                    {y.gizli
                      ? <span style={{ fontSize:11, color:"#b45309", background:"rgba(245,158,11,.1)", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>🙈 Gizli</span>
                      : y.onaylandi
                        ? <span style={{ fontSize:11, color:"#065f46", background:"rgba(16,185,129,.08)", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>✅ Onaylı</span>
                        : <span style={{ fontSize:11, color:"#9b72cf", background:"rgba(155,114,207,.08)", padding:"2px 8px", borderRadius:20, fontWeight:700 }}>⏳ Bekliyor</span>}
                  </td>
                  <td>
                    <div className="sa-btn-gap">
                      {!y.onaylandi && !y.gizli && (
                        <button className="sa-btn sa-btn-succ" onClick={() => yorumOnayla(y)}>✅ Onayla</button>
                      )}
                      <button className={`sa-btn ${y.gizli ? "sa-btn-succ" : "sa-btn-warn"}`} onClick={() => yorumGizle(y)}>
                        {y.gizli ? "👁 Göster" : "🙈 Gizle"}
                      </button>
                      <button className="sa-btn sa-btn-dang" onClick={() => setModal({ yorum:y })}>🗑 Sil</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal?.yorum && (
        <OnayModal
          baslik="Yorumu Sil"
          mesaj="Bu yorum kalıcı olarak silinsin mi?"
          onOnayla={() => yorumSil(modal.yorum)}
          onIptal={() => setModal(null)}
          tehlikeli
        />
      )}
    </>
  );
}

/* ════════════════════════════════════════
   LOGLAR TABI
════════════════════════════════════════ */
function LoglarTab() {
  const [loglar, setLoglar] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    async function fetchLoglar() {
      try {
        const snap = await getDocs(query(collection(db, "activity_logs"), orderBy("zaman", "desc")));
        setLoglar(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      } catch (_) {}
      setYukleniyor(false);
    }
    fetchLoglar();
  }, []);

  const islemIcon = (islem) => {
    if (islem?.includes("sil"))     return "🗑";
    if (islem?.includes("ban"))     return "🚫";
    if (islem?.includes("bansiz"))  return "✅";
    if (islem?.includes("rol"))     return "🔑";
    if (islem?.includes("gizle"))   return "🙈";
    if (islem?.includes("duzenle")) return "✏️";
    if (islem?.includes("yetki"))   return "🔐";
    if (islem?.includes("kisit"))   return "🔇";
    if (islem?.includes("ata"))     return "📎";
    return "📋";
  };

  const islemEtiket = (islem) => ({
    rol_degistir:               "Rol Değiştirildi",
    kullanici_banla:            "Kullanıcı Banlandı",
    kullanici_bansiz:           "Ban Kaldırıldı",
    kullanici_sil:              "Kullanıcı Silindi",
    yorum_kisitla:              "Yorum Kısıtlandı",
    yorum_kisit_kaldir:         "Yorum Kısıtı Kaldırıldı",
    kullanici_yorumlari_gizle:  "Kullanıcı Yorumları Gizlendi",
    salon_banla:                "Salon Banlandı",
    salon_bansiz:               "Salon Ban'dan Çıkarıldı",
    salon_sil:                  "Salon Silindi",
    salon_duzenle:              "Salon Düzenlendi",
    salon_sahibi_yetki_guncelle:"Salon Sahibi Yetkileri Güncellendi",
    salon_sahibi_salon_ata:     "Salon Atandı",
    salon_sahibi_salon_kaldir:  "Salon Kaldırıldı",
    admin_yetki_kaldir:         "Admin Yetkisi Alındı",
    yorum_sil:                  "Yorum Silindi",
    yorum_gizle:                "Yorum Gizlendi",
    yorum_goster:               "Yorum Gösterildi",
    yorum_onayla:               "Yorum Onaylandı",
  }[islem] || islem);

  return (
    <>
      <div className="sa-sh">
        <h2 className="sa-sh-title">📋 İşlem Logları</h2>
        <span className="sa-pill">Son 100 İşlem</span>
      </div>

      <div className="sa-table-wrap">
        {yukleniyor ? <div className="sa-spinner" /> : loglar.length === 0 ? (
          <div className="sa-empty"><span>📋</span>Henüz log kaydı yok.</div>
        ) : (
          loglar.slice(0, 100).map(log => (
            <div key={log.id} className="sa-log-item">
              <div className="sa-log-icon">{islemIcon(log.islem)}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:13, color:"#1a1625" }}>{islemEtiket(log.islem)}</div>
                <div className="sa-log-meta">
                  {log.yapanEmail} •{" "}
                  {log.detay && Object.entries(log.detay).map(([k,v]) => `${k}: ${v}`).join(", ")} •{" "}
                  {log.zaman?.seconds ? new Date(log.zaman.seconds * 1000).toLocaleString("tr-TR") : "-"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

/* ════════════════════════════════════════
   ONAY MODALI
════════════════════════════════════════ */
function OnayModal({ baslik, mesaj, onOnayla, onIptal, tehlikeli = false }) {
  return (
    <div className="sa-modal-bg" onClick={onIptal}>
      <div className="sa-modal" onClick={e => e.stopPropagation()}>
        <h3>{baslik}</h3>
        <p>{mesaj}</p>
        <div className="sa-modal-btns">
          <button className="sa-btn sa-btn-succ" onClick={onIptal}>İptal</button>
          <button className={`sa-btn ${tehlikeli ? "sa-btn-dang" : "sa-btn-prim"}`} onClick={onOnayla}>Onayla</button>
        </div>
      </div>
    </div>
  );
}