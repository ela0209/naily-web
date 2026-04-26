import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSalon, getSalonlar } from "../services/salonService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .mw-wrap { padding: 24px; font-family: 'Outfit', sans-serif; }

  .mw-kart {
    background: white;
    border-radius: 20px;
    border: 1px solid rgba(232,99,140,0.10);
    box-shadow: 0 2px 16px rgba(155,114,207,0.08);
    padding: 20px 24px;
    margin-bottom: 14px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    animation: fadeUp 0.25s ease both;
    transition: box-shadow 0.2s;
  }
  .mw-kart:hover { box-shadow: 0 6px 28px rgba(155,114,207,0.13); }

  .mw-kart-edit {
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.18);
    flex-direction: column;
  }

  .mw-kart-sol { display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 0; width: 100%; }

  .mw-ikon {
    width: 44px; height: 44px;
    border-radius: 13px;
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.13);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }

  .mw-salon-adi {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; font-weight: 700; color: #1a1625; margin-bottom: 6px;
  }

  .mw-saat-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, rgba(155,114,207,0.08), rgba(232,99,140,0.06));
    border: 1px solid rgba(155,114,207,0.15);
    border-radius: 20px; padding: 4px 12px;
    font-size: 12px; font-weight: 600; color: #6d46c1; margin-top: 2px;
  }
  .mw-saat-bos { font-size: 12px; color: #c4b8d4; margin-top: 4px; font-style: italic; }

  /* Edit */
  .mw-edit-alan { flex: 1; min-width: 0; width: 100%; }
  .mw-edit-baslik {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; font-weight: 700; color: #1a1625; margin-bottom: 16px;
  }

  .mw-saat-row {
    display: flex; gap: 12px; align-items: flex-end;
    flex-wrap: wrap; margin-bottom: 16px;
  }
  .mw-saat-grup { flex: 1; min-width: 120px; }

  .mw-label {
    display: block; font-size: 11px; font-weight: 700;
    color: #9b72cf; text-transform: uppercase;
    letter-spacing: 0.06em; margin-bottom: 6px;
  }
  .mw-time-input {
    font-family: 'Outfit', sans-serif;
    width: 100%; padding: 10px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(155,114,207,0.22);
    background: white; font-size: 13px; color: #1a1625;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .mw-time-input:focus {
    border-color: rgba(155,114,207,0.50);
    box-shadow: 0 0 0 3px rgba(155,114,207,0.08);
  }
  .mw-ok { font-size: 18px; color: #c4b8d4; padding-bottom: 10px; flex-shrink: 0; }

  /* Butonlar */
  .mw-btn {
    font-family: 'Outfit', sans-serif;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 12px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    border: 1.5px solid transparent; letter-spacing: 0.01em;
  }
  .mw-btn-duzenle {
    background: linear-gradient(135deg, rgba(155,114,207,0.08), rgba(109,70,193,0.05));
    border-color: rgba(155,114,207,0.25); color: #6d46c1;
  }
  .mw-btn-duzenle:hover {
    background: linear-gradient(135deg, rgba(155,114,207,0.15), rgba(109,70,193,0.10));
    border-color: rgba(155,114,207,0.40);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(155,114,207,0.15);
  }
  .mw-btn-kaydet {
    background: linear-gradient(135deg, #e8638c, #9b72cf);
    border-color: transparent; color: white;
    box-shadow: 0 4px 14px rgba(232,99,140,0.22);
  }
  .mw-btn-kaydet:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(232,99,140,0.32);
  }
  .mw-btn-iptal {
    background: rgba(155,114,207,0.07);
    border-color: rgba(155,114,207,0.18); color: #8b829a;
  }
  .mw-btn-iptal:hover {
    background: rgba(155,114,207,0.12);
    border-color: rgba(155,114,207,0.28); color: #6d46c1;
  }
  .mw-btn-grup { display: flex; gap: 8px; flex-wrap: wrap; }

  .mw-bos { text-align: center; padding: 48px 24px; color: #8b829a; font-size: 14px; }
  .mw-yukleniyor { text-align: center; padding: 48px 24px; color: #8b829a; font-size: 14px; }
`;

export default function ManageWorkingHours() {
  const { salonId, role } = useAuth();
  const superadmin = role === "superadmin";
  const [salonlar, setSalonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duzenle, setDuzenle] = useState(null);
  const [saatler, setSaatler] = useState({ acilis: "", kapanis: "" });

  useEffect(() => {
    async function getVeri() {
      if (superadmin) {
        // Superadmin: tüm salonlar
        const data = await getSalonlar();
        setSalonlar(data);
      } else {
        // Normal admin: sadece kendi salonu
        if (!salonId) { setLoading(false); return; }
        const salon = await getSalon(salonId);
        if (salon) setSalonlar([salon]);
      }
      setLoading(false);
    }
    getVeri();
  }, [salonId, superadmin]);

  async function handleGuncelle(id) {
    await updateDoc(doc(db, "salons", id), { saatler });
    setSalonlar((prev) =>
      prev.map((s) => (s.id === id ? { ...s, saatler } : s)),
    );
    setDuzenle(null);
  }

  function handleDuzenleAc(s) {
    setDuzenle(s.id);
    setSaatler(s.saatler || { acilis: "", kapanis: "" });
  }

  return (
    <div className="mw-wrap">
      <style>{CSS}</style>

      {loading && <p className="mw-yukleniyor">⏳ Yükleniyor...</p>}

      {!loading && !superadmin && !salonId && (
        <p className="mw-bos">⚠️ Hesabınıza henüz bir salon atanmamış. Lütfen sistem yöneticisiyle iletişime geçin.</p>
      )}

      {!loading && (superadmin || salonId) && salonlar.length === 0 && (
        <p className="mw-bos">🏪 Henüz salon bulunmuyor.</p>
      )}

      {salonlar.map((s) =>
        duzenle === s.id ? (
          /* ── Düzenleme modu ── */
          <div key={s.id} className="mw-kart mw-kart-edit">
            <div className="mw-kart-sol">
              <div className="mw-ikon">✏️</div>
              <div className="mw-edit-alan">
                <div className="mw-edit-baslik">{s.name}</div>

                <div className="mw-saat-row">
                  <div className="mw-saat-grup">
                    <label className="mw-label">Açılış Saati</label>
                    <input
                      type="time"
                      className="mw-time-input"
                      value={saatler.acilis}
                      onChange={(e) =>
                        setSaatler({ ...saatler, acilis: e.target.value })
                      }
                    />
                  </div>
                  <span className="mw-ok">→</span>
                  <div className="mw-saat-grup">
                    <label className="mw-label">Kapanış Saati</label>
                    <input
                      type="time"
                      className="mw-time-input"
                      value={saatler.kapanis}
                      onChange={(e) =>
                        setSaatler({ ...saatler, kapanis: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="mw-btn-grup">
                  <button
                    className="mw-btn mw-btn-kaydet"
                    onClick={() => handleGuncelle(s.id)}
                  >
                    💾 Kaydet
                  </button>
                  <button
                    className="mw-btn mw-btn-iptal"
                    onClick={() => setDuzenle(null)}
                  >
                    ✕ Vazgeç
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── Normal görünüm ── */
          <div key={s.id} className="mw-kart">
            <div className="mw-kart-sol">
              <div className="mw-ikon">🕐</div>
              <div>
                <div className="mw-salon-adi">{s.name}</div>
                {s.saatler?.acilis && s.saatler?.kapanis ? (
                  <div className="mw-saat-badge">
                    🕐 {s.saatler.acilis} — {s.saatler.kapanis}
                  </div>
                ) : (
                  <div className="mw-saat-bos">Henüz saat girilmemiş</div>
                )}
              </div>
            </div>
            <button
              className="mw-btn mw-btn-duzenle"
              onClick={() => handleDuzenleAc(s)}
            >
              ✏️ Düzenle
            </button>
          </div>
        ),
      )}
    </div>
  );
}
