import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { randevuGuncelle } from "../services/appointmentService";
import { db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .ma-wrap { padding: 24px; font-family: 'Outfit', sans-serif; }

  .ma-kart {
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
  .ma-kart:hover { box-shadow: 0 6px 28px rgba(155,114,207,0.13); }

  .ma-kart-sol { display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 0; }

  .ma-ikon {
    width: 44px; height: 44px;
    border-radius: 13px;
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.13);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }

  .ma-salon { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 700; color: #1a1625; margin-bottom: 4px; }

  .ma-meta { font-size: 12px; color: #8b829a; font-weight: 500; margin-bottom: 3px; display: flex; align-items: center; gap: 6px; }
  .ma-dot { width: 3px; height: 3px; border-radius: 50%; background: #d4c8e8; display: inline-block; }

  .ma-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 12px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.04em; margin-top: 8px;
  }
  .ma-badge-beklemede { background: rgba(251,191,36,0.10); border: 1px solid rgba(251,191,36,0.25); color: #92690b; }
  .ma-badge-onaylandi { background: rgba(16,185,129,0.08);  border: 1px solid rgba(16,185,129,0.20); color: #065f46; }
  .ma-badge-iptal     { background: rgba(232,99,140,0.08);  border: 1px solid rgba(232,99,140,0.22); color: #9f1239; }

  .ma-badge-dot { width: 6px; height: 6px; border-radius: 50%; }
  .ma-badge-dot-beklemede { background: #f59e0b; }
  .ma-badge-dot-onaylandi { background: #10b981; }
  .ma-badge-dot-iptal     { background: #e8638c; }

  .ma-btn-grup { display: flex; gap: 8px; align-items: center; flex-shrink: 0; flex-wrap: wrap; }

  .ma-btn {
    font-family: 'Outfit', sans-serif;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 18px; border-radius: 12px;
    font-size: 13px; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
    border: 1.5px solid transparent; letter-spacing: 0.01em;
  }
  .ma-btn-onayla {
    background: linear-gradient(135deg, rgba(16,185,129,0.08), rgba(5,150,105,0.06));
    border-color: rgba(16,185,129,0.25); color: #065f46;
  }
  .ma-btn-onayla:hover {
    background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.12));
    border-color: rgba(16,185,129,0.40);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16,185,129,0.15);
  }
  .ma-btn-iptal {
    background: linear-gradient(135deg, rgba(232,99,140,0.07), rgba(185,28,79,0.05));
    border-color: rgba(232,99,140,0.22); color: #9f1239;
  }
  .ma-btn-iptal:hover {
    background: linear-gradient(135deg, rgba(232,99,140,0.13), rgba(185,28,79,0.10));
    border-color: rgba(232,99,140,0.38);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(232,99,140,0.14);
  }
  .ma-btn:disabled { opacity: 0.40; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

  .ma-bos { text-align: center; padding: 48px 24px; color: #8b829a; font-size: 14px; }
  .ma-yukleniyor { text-align: center; padding: 48px 24px; color: #8b829a; font-size: 14px; }
`;

const DURUM_CONFIG = {
  beklemede: {
    label: "Beklemede",
    badgeClass: "ma-badge-beklemede",
    dotClass: "ma-badge-dot-beklemede",
    ikon: "📅",
  },
  onaylandi: {
    label: "Onaylandı",
    badgeClass: "ma-badge-onaylandi",
    dotClass: "ma-badge-dot-onaylandi",
    ikon: "✅",
  },
  iptal: {
    label: "İptal",
    badgeClass: "ma-badge-iptal",
    dotClass: "ma-badge-dot-iptal",
    ikon: "❌",
  },
};

export default function ManageAppointments() {
  const { salonId } = useAuth();
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVeri() {
      if (!salonId) {
        setLoading(false);
        return;
      }
      // Sadece bu adminin salonuna ait randevuları çek
      const q = query(
        collection(db, "randevular"),
        where("salonId", "==", salonId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRandevular(data);
      setLoading(false);
    }
    getVeri();
  }, [salonId]);

  async function handleDurum(id, yeniDurum) {
    await randevuGuncelle(id, yeniDurum);
    setRandevular((prev) =>
      prev.map((r) => (r.id === id ? { ...r, durum: yeniDurum } : r)),
    );
  }

  const cfg = (durum) => DURUM_CONFIG[durum] ?? DURUM_CONFIG.beklemede;

  return (
    <div className="ma-wrap">
      <style>{CSS}</style>

      {loading && <p className="ma-yukleniyor">⏳ Yükleniyor...</p>}

      {!loading && !salonId && (
        <p className="ma-bos">⚠️ Hesabınıza henüz bir salon atanmamış. Lütfen sistem yöneticisiyle iletişime geçin.</p>
      )}

      {!loading && salonId && randevular.length === 0 && (
        <p className="ma-bos">📭 Henüz randevu bulunmuyor.</p>
      )}

      {randevular.map((r) => {
        const c = cfg(r.durum);
        return (
          <div key={r.id} className="ma-kart">
            <div className="ma-kart-sol">
              <div className="ma-ikon">{c.ikon}</div>
              <div>
                <div className="ma-salon">{r.salonAdi}</div>
                <div className="ma-meta">👤 {r.kullanici}</div>
                <div className="ma-meta">
                  🗓️ {r.tarih}
                  <span className="ma-dot" />
                  🕐 {r.saat}
                </div>
                <div className={`ma-badge ${c.badgeClass}`}>
                  <span className={`ma-badge-dot ${c.dotClass}`} />
                  {c.label}
                </div>
              </div>
            </div>

            <div className="ma-btn-grup">
              <button
                className="ma-btn ma-btn-onayla"
                onClick={() => handleDurum(r.id, "onaylandi")}
                disabled={r.durum === "onaylandi"}
              >
                ✓ Onayla
              </button>
              <button
                className="ma-btn ma-btn-iptal"
                onClick={() => handleDurum(r.id, "iptal")}
                disabled={r.durum === "iptal"}
              >
                ✕ İptal Et
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
