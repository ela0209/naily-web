import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Appointment() {
  const { salonId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [basarili, setBasarili] = useState(false);

  const saatler = [
    "10:00", "11:00", "12:00", "13:00",
    "14:00", "15:00", "16:00", "17:00",
  ];

  useEffect(() => {
    async function getSalon() {
      const docRef = doc(db, "salons", salonId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setSalon({ id: docSnap.id, ...docSnap.data() });
    }
    getSalon();
  }, [salonId]);

  async function handleRandevu() {
    if (!tarih || !saat) {
      setMesaj("Lütfen tarih ve saat seçin!");
      return;
    }

    setYukleniyor(true);
    setMesaj("");

    try {
      const snapshot = await getDocs(collection(db, "randevular"));
      const cakisan = snapshot.docs.find(
        (d) =>
          d.data().salonId === salonId &&
          d.data().tarih === tarih &&
          d.data().saat === saat
      );

      if (cakisan) {
        setMesaj("Bu saat dolu! Lütfen başka bir saat seçin.");
        setYukleniyor(false);
        return;
      }

      await addDoc(collection(db, "randevular"), {
        salonId,
        salonAdi: salon.name,
        kullanici: currentUser.email,
        tarih,
        saat,
        durum: "beklemede",
      });

      setBasarili(true);
      setMesaj("Randevunuz başarıyla alındı!");
      setTimeout(() => navigate("/"), 2500);
    } catch (e) {
      setMesaj("Bir hata oluştu. Lütfen tekrar deneyin.");
      setYukleniyor(false);
    }
  }

  if (!salon)
    return (
      <div style={s.loadingPage}>
        <style>{CSS}</style>
        <div style={{ textAlign: "center" }}>
          <div style={s.spinner} />
          <p style={s.loadingText}>Yükleniyor...</p>
        </div>
      </div>
    );

  const bugun = new Date().toISOString().split("T")[0];

  return (
    <div style={s.page}>
      <style>{CSS}</style>

      {/* Hero şerit */}
      <section style={s.hero}>
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.heroContent}>
          <button onClick={() => navigate(-1)} style={s.geriBtn} className="geri-btn">
            ← Salona Dön
          </button>
          <div style={s.heroMain}>
            <div style={s.avatar}><span style={{ fontSize: 32 }}>📅</span></div>
            <div>
              <p style={s.heroEtiket}>Randevu Al</p>
              <h1 style={s.salonAdi}>{salon.name}</h1>
              <span style={s.heroAdres}>📍 {salon.address}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Kart */}
      <div style={s.icerik}>
        <div style={s.kart} className="form-kart">

          {/* Adımlar */}
          <div style={s.adimlarRow}>
            {[
              { no: "1", label: "Tarih Seç", ikon: "🗓️" },
              { no: "2", label: "Saat Seç", ikon: "🕐" },
              { no: "3", label: "Onayla", ikon: "✅" },
            ].map((a, i) => (
              <div key={a.no} style={s.adim}>
                <div style={{
                  ...s.adimNo,
                  background: (i === 0 && tarih) || (i === 1 && saat) || (i === 2 && basarili)
                    ? "linear-gradient(135deg,#e8638c,#9b72cf)"
                    : "rgba(155,114,207,0.10)",
                  color: (i === 0 && tarih) || (i === 1 && saat) || (i === 2 && basarili)
                    ? "white"
                    : "#9b72cf",
                }}>
                  {((i === 0 && tarih) || (i === 1 && saat) || (i === 2 && basarili)) ? "✓" : a.no}
                </div>
                <span style={s.adimLabel}>{a.label}</span>
                {i < 2 && <div style={s.adimCizgi} />}
              </div>
            ))}
          </div>

          <div style={s.ayrac} />

          {/* Tarih */}
          <div style={s.formGrup}>
            <label style={s.label}>🗓️ Tarih Seçin</label>
            <div style={s.inputWrapper} className="input-wrapper">
              <input
                type="date"
                value={tarih}
                min={bugun}
                onChange={(e) => { setTarih(e.target.value); setMesaj(""); }}
                style={s.input}
                className="form-input"
              />
            </div>
          </div>

          {/* Saat grid */}
          <div style={s.formGrup}>
            <label style={s.label}>🕐 Saat Seçin</label>
            <div style={s.saatGrid}>
              {saatler.map((sa) => (
                <button
                  key={sa}
                  onClick={() => { setSaat(sa); setMesaj(""); }}
                  className="saat-btn"
                  style={{
                    ...s.saatBtn,
                    ...(saat === sa ? s.saatBtnAktif : {}),
                  }}
                >
                  {sa}
                </button>
              ))}
            </div>
          </div>

          {/* Özet */}
          {(tarih || saat) && (
            <div style={s.ozet} className="ozet">
              <h4 style={s.ozetBaslik}>📋 Randevu Özeti</h4>
              <div style={s.ozetRow}>
                <div style={s.ozetItem}>
                  <span style={s.ozetLabel}>Salon</span>
                  <span style={s.ozetDeger}>{salon.name}</span>
                </div>
                {tarih && (
                  <div style={s.ozetItem}>
                    <span style={s.ozetLabel}>Tarih</span>
                    <span style={s.ozetDeger}>
                      {new Date(tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
                {saat && (
                  <div style={s.ozetItem}>
                    <span style={s.ozetLabel}>Saat</span>
                    <span style={s.ozetDeger}>{saat}</span>
                  </div>
                )}
                <div style={s.ozetItem}>
                  <span style={s.ozetLabel}>Durum</span>
                  <span style={{ ...s.ozetDeger, color: "#10b981" }}>Beklemede</span>
                </div>
              </div>
            </div>
          )}

          {/* Mesaj */}
          {mesaj && (
            <div style={{ ...s.mesajBant, ...(basarili ? s.mesajBasarili : s.mesajHata) }}>
              {basarili ? "✅" : "⚠️"} {mesaj}
              {basarili && <span style={{ marginLeft: 8, fontSize: 12, opacity: 0.75 }}>Yönlendiriliyorsunuz...</span>}
            </div>
          )}

          {/* Onayla */}
          <button
            onClick={handleRandevu}
            disabled={yukleniyor || basarili}
            className="onayla-btn"
            style={{ ...s.onaylaBtn, opacity: yukleniyor || basarili ? 0.72 : 1 }}
          >
            {yukleniyor ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <span style={s.btnSpinner} /> İşleniyor...
              </span>
            ) : basarili ? "✅ Randevu Alındı!" : "📅 Randevuyu Onayla"}
          </button>

          <p style={s.altNot}>
            Randevunuzu iptal etmek isterseniz profilinizdeki randevularım bölümünden işlem yapabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes ozetIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .form-kart { animation: fadeUp 0.35s ease both; }
  .ozet { animation: ozetIn 0.25s ease both; }

  .geri-btn:hover { background:rgba(155,114,207,0.08)!important; color:#9b72cf!important; border-color:#c9aff0!important; }

  .input-wrapper:focus-within { border-color:rgba(155,114,207,0.45)!important; box-shadow:0 0 0 3px rgba(155,114,207,0.10)!important; }
  .form-input { outline:none; }
  .form-input::-webkit-calendar-picker-indicator { cursor:pointer; opacity:0.6; }

  .saat-btn { transition:all 0.18s; cursor:pointer; }
  .saat-btn:hover { border-color:rgba(155,114,207,0.4)!important; color:#9b72cf!important; background:rgba(155,114,207,0.05)!important; transform:translateY(-1px); }

  .onayla-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(232,99,140,0.38)!important; }
  .onayla-btn:active:not(:disabled) { transform:translateY(0); }
  .onayla-btn { transition:all 0.25s; cursor:pointer; }
  .onayla-btn:disabled { cursor:not-allowed; }
`;

const s = {
  page: { fontFamily: "'Outfit',sans-serif", background: "#faf8f5", minHeight: "100vh" },
  loadingPage: { minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Outfit',sans-serif" },
  spinner: { width: 40, height: 40, borderRadius: "50%", border: "3px solid #f3eeff", borderTopColor: "#9b72cf", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" },
  btnSpinner: { display: "inline-block", width: 16, height: 16, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", animation: "spin 0.7s linear infinite" },
  loadingText: { color: "#8b829a", fontSize: 14 },

  hero: { position: "relative", overflow: "hidden", background: "linear-gradient(160deg,#ffffff 0%,#faf8f5 50%,#f3eeff 100%)", borderBottom: "1px solid #ede8e0", padding: "40px 24px 36px" },
  blob1: { position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(232,99,140,0.07) 0%,transparent 70%)", top: -200, right: -100, pointerEvents: "none" },
  blob2: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(155,114,207,0.08) 0%,transparent 70%)", bottom: -100, left: -80, pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 620, margin: "0 auto" },
  heroMain: { display: "flex", alignItems: "center", gap: 18, marginTop: 4 },
  avatar: { width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#fdeef4,#f3eeff)", border: "2px solid rgba(232,99,140,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(155,114,207,0.14)" },
  heroEtiket: { fontSize: 12, fontWeight: 600, color: "#e8638c", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" },
  salonAdi: { fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, color: "#1a1625", margin: "0 0 6px", lineHeight: 1.15 },
  heroAdres: { fontSize: 13, color: "#8b829a" },

  geriBtn: { fontFamily: "'Outfit',sans-serif", background: "white", border: "1.5px solid #e8e2d9", borderRadius: 12, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#6b6278", cursor: "pointer", transition: "all 0.22s", marginBottom: 20, display: "inline-flex", alignItems: "center", gap: 6 },

  icerik: { maxWidth: 620, margin: "0 auto", padding: "32px 24px 60px" },

  kart: { background: "white", borderRadius: 24, border: "1px solid rgba(232,99,140,0.08)", boxShadow: "0 4px 32px rgba(155,114,207,0.10)", padding: "32px 32px 28px" },

  adimlarRow: { display: "flex", alignItems: "center", gap: 0, marginBottom: 28 },
  adim: { display: "flex", alignItems: "center", gap: 8, flex: 1 },
  adimNo: { width: 28, height: 28, borderRadius: "50%", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" },
  adimLabel: { fontSize: 12, color: "#8b829a", fontWeight: 500, whiteSpace: "nowrap" },
  adimCizgi: { flex: 1, height: 1, background: "rgba(232,99,140,0.12)", margin: "0 8px" },

  ayrac: { height: 1, background: "linear-gradient(90deg,transparent,rgba(232,99,140,0.15),transparent)", margin: "0 0 28px" },

  formGrup: { marginBottom: 24 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#4a4458", marginBottom: 10 },

  inputWrapper: { borderRadius: 14, border: "1.5px solid #e8e2d9", overflow: "hidden", transition: "all 0.22s", background: "#faf8f5" },
  input: { fontFamily: "'Outfit',sans-serif", width: "100%", padding: "12px 16px", fontSize: 14, color: "#1a1625", background: "transparent", border: "none", boxSizing: "border-box" },

  saatGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 },
  saatBtn: { fontFamily: "'Outfit',sans-serif", padding: "11px 8px", borderRadius: 12, border: "1.5px solid #e8e2d9", background: "white", fontSize: 14, fontWeight: 500, color: "#4a4458" },
  saatBtnAktif: { background: "linear-gradient(135deg,#e8638c,#9b72cf)", color: "white", border: "1.5px solid transparent", fontWeight: 600, boxShadow: "0 4px 16px rgba(232,99,140,0.28)" },

  ozet: { background: "linear-gradient(135deg,#fdeef4,#f3eeff)", borderRadius: 16, border: "1px solid rgba(155,114,207,0.12)", padding: "18px 20px", marginBottom: 24 },
  ozetBaslik: { fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "#1a1625", margin: "0 0 14px" },
  ozetRow: { display: "flex", flexWrap: "wrap", gap: 16 },
  ozetItem: { display: "flex", flexDirection: "column", gap: 2 },
  ozetLabel: { fontSize: 11, color: "#8b829a", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" },
  ozetDeger: { fontSize: 14, fontWeight: 600, color: "#1a1625" },

  mesajBant: { borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 500, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 },
  mesajBasarili: { background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#065f46" },
  mesajHata: { background: "rgba(232,99,140,0.08)", border: "1px solid rgba(232,99,140,0.2)", color: "#9f1239" },

  onaylaBtn: { fontFamily: "'Outfit',sans-serif", width: "100%", padding: "14px 24px", background: "linear-gradient(135deg,#e8638c,#9b72cf)", color: "white", border: "none", borderRadius: 16, fontSize: 15, fontWeight: 700, boxShadow: "0 6px 24px rgba(232,99,140,0.28)", letterSpacing: "0.01em" },

  altNot: { fontSize: 11, color: "#8b829a", textAlign: "center", margin: "18px 0 0", lineHeight: 1.6 },
};