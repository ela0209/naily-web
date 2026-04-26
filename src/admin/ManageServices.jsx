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

  .ms-wrap { padding: 24px; font-family: 'Outfit', sans-serif; }

  .ms-kart {
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
  .ms-kart:hover { box-shadow: 0 6px 28px rgba(155,114,207,0.13); }

  .ms-kart-edit {
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.18);
    flex-direction: column;
  }

  .ms-kart-sol { display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 0; width: 100%; }

  .ms-ikon {
    width: 44px; height: 44px;
    border-radius: 13px;
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.13);
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; flex-shrink: 0;
  }

  .ms-salon-adi {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; font-weight: 700; color: #1a1625; margin-bottom: 5px;
  }
  .ms-meta { font-size: 12px; color: #8b829a; font-weight: 500; margin-bottom: 3px; }

  /* Edit form */
  .ms-edit-alan { flex: 1; min-width: 0; width: 100%; }
  .ms-edit-baslik { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 700; color: #1a1625; margin-bottom: 16px; }

  .ms-label {
    display: block; font-size: 11px; font-weight: 700;
    color: #9b72cf; text-transform: uppercase;
    letter-spacing: 0.06em; margin-bottom: 6px;
  }
  .ms-input {
    font-family: 'Outfit', sans-serif;
    width: 100%; padding: 10px 14px;
    border-radius: 12px;
    border: 1.5px solid rgba(155,114,207,0.22);
    background: white; font-size: 13px; color: #1a1625;
    outline: none; margin-bottom: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .ms-input:focus {
    border-color: rgba(155,114,207,0.50);
    box-shadow: 0 0 0 3px rgba(155,114,207,0.08);
  }

  /* Butonlar */
  .ms-btn {
    font-family: 'Outfit', sans-serif;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 12px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    border: 1.5px solid transparent; letter-spacing: 0.01em;
  }
  .ms-btn-duzenle {
    background: linear-gradient(135deg, rgba(155,114,207,0.08), rgba(109,70,193,0.05));
    border-color: rgba(155,114,207,0.25); color: #6d46c1;
  }
  .ms-btn-duzenle:hover {
    background: linear-gradient(135deg, rgba(155,114,207,0.15), rgba(109,70,193,0.10));
    border-color: rgba(155,114,207,0.40);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(155,114,207,0.15);
  }
  .ms-btn-kaydet {
    background: linear-gradient(135deg, #e8638c, #9b72cf);
    border-color: transparent; color: white;
    box-shadow: 0 4px 14px rgba(232,99,140,0.22);
  }
  .ms-btn-kaydet:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(232,99,140,0.32);
  }
  .ms-btn-iptal {
    background: rgba(155,114,207,0.07);
    border-color: rgba(155,114,207,0.18); color: #8b829a;
  }
  .ms-btn-iptal:hover {
    background: rgba(155,114,207,0.12);
    border-color: rgba(155,114,207,0.28); color: #6d46c1;
  }
  .ms-btn-grup { display: flex; gap: 8px; flex-wrap: wrap; }

  .ms-bos { text-align: center; padding: 48px 24px; color: #8b829a; font-size: 14px; }
  .ms-yukleniyor { text-align: center; padding: 48px 24px; color: #8b829a; font-size: 14px; }
`;

export default function ManageServices() {
  const { salonId, role } = useAuth();
  const superadmin = role === "superadmin";
  const [salonlar, setSalonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duzenle, setDuzenle] = useState(null);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniTelefon, setYeniTelefon] = useState("");

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
    await updateDoc(doc(db, "salons", id), {
      name: yeniAd,
      phone: yeniTelefon,
    });
    setSalonlar((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, name: yeniAd, phone: yeniTelefon } : s,
      ),
    );
    setDuzenle(null);
  }

  function handleDuzenleAc(s) {
    setDuzenle(s.id);
    setYeniAd(s.name);
    setYeniTelefon(s.phone);
  }

  return (
    <div className="ms-wrap">
      <style>{CSS}</style>

      {loading && <p className="ms-yukleniyor">⏳ Yükleniyor...</p>}

      {!loading && !superadmin && !salonId && (
        <p className="ms-bos">⚠️ Hesabınıza henüz bir salon atanmamış. Lütfen sistem yöneticisiyle iletişime geçin.</p>
      )}

      {!loading && (superadmin || salonId) && salonlar.length === 0 && (
        <p className="ms-bos">🏪 Henüz salon bulunmuyor.</p>
      )}

      {salonlar.map((s) =>
        duzenle === s.id ? (
          /* ── Düzenleme modu ── */
          <div key={s.id} className="ms-kart ms-kart-edit">
            <div className="ms-kart-sol">
              <div className="ms-ikon">✏️</div>
              <div className="ms-edit-alan">
                <div className="ms-edit-baslik">{s.name}</div>

                <label className="ms-label">Salon Adı</label>
                <input
                  className="ms-input"
                  value={yeniAd}
                  onChange={(e) => setYeniAd(e.target.value)}
                  placeholder="Salon adı"
                />

                <label className="ms-label">Telefon</label>
                <input
                  className="ms-input"
                  value={yeniTelefon}
                  onChange={(e) => setYeniTelefon(e.target.value)}
                  placeholder="Telefon numarası"
                />

                <div className="ms-btn-grup">
                  <button
                    className="ms-btn ms-btn-kaydet"
                    onClick={() => handleGuncelle(s.id)}
                  >
                    💾 Kaydet
                  </button>
                  <button
                    className="ms-btn ms-btn-iptal"
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
          <div key={s.id} className="ms-kart">
            <div className="ms-kart-sol">
              <div className="ms-ikon">🏪</div>
              <div>
                <div className="ms-salon-adi">{s.name}</div>
                <div className="ms-meta">📍 {s.address}</div>
                <div className="ms-meta">📞 {s.phone}</div>
              </div>
            </div>
            <button
              className="ms-btn ms-btn-duzenle"
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
