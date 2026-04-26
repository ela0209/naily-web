import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function AdminAtama() {
  const { role } = useAuth();
  const [adminler, setAdminler] = useState([]);
  const [salonlar, setSalonlar] = useState([]);
  const [secimler, setSecimler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kayitDurumu, setKayitDurumu] = useState({});
  const [hata, setHata] = useState(null);

  // Superadmin değilse hiç render etme
  if (role !== "superadmin") {
    return (
      <div style={styles.yetkisiz}>
        <span>🔒</span>
        <p>Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  useEffect(() => {
    const veriCek = async () => {
      setYukleniyor(true);
      setHata(null);
      try {
        // Sadece role: "admin" olanları çek (superadmin hariç)
        const adminQuery = query(
          collection(db, "users"),
          where("role", "==", "admin")
        );
        const adminSnap = await getDocs(adminQuery);
        const adminListesi = adminSnap.docs.map((d) => ({
          uid: d.id,
          ...d.data(),
        }));
        setAdminler(adminListesi);

        // Mevcut seçimleri doldur
        const mevcutSecimler = {};
        adminListesi.forEach((a) => {
          mevcutSecimler[a.uid] = a.salonId || "";
        });
        setSecimler(mevcutSecimler);

        // Tüm salonları çek
        const salonSnap = await getDocs(collection(db, "salons"));
        const salonListesi = salonSnap.docs.map((d) => ({
          id: d.id,
          ad: d.data().name || d.id,
          adres: d.data().address || "",
        }));
        setSalonlar(salonListesi);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        setHata("Veriler yüklenirken hata oluştu: " + err.message);
      } finally {
        setYukleniyor(false);
      }
    };

    veriCek();
  }, []);

  const handleSecim = (uid, salonId) => {
    setSecimler((prev) => ({ ...prev, [uid]: salonId }));
    // Kayıt durumunu temizle
    setKayitDurumu((prev) => ({ ...prev, [uid]: null }));
  };

  const handleKaydet = async (uid) => {
    setKayitDurumu((prev) => ({ ...prev, [uid]: "yukleniyor" }));
    try {
      await updateDoc(doc(db, "users", uid), {
        salonId: secimler[uid] || null,
      });
      setKayitDurumu((prev) => ({ ...prev, [uid]: "basarili" }));
      // Admini güncelle
      setAdminler((prev) =>
        prev.map((a) =>
          a.uid === uid ? { ...a, salonId: secimler[uid] } : a
        )
      );
      setTimeout(
        () => setKayitDurumu((prev) => ({ ...prev, [uid]: null })),
        2500
      );
    } catch (err) {
      console.error("Kayıt hatası:", err);
      setKayitDurumu((prev) => ({ ...prev, [uid]: "hata" }));
    }
  };

  const handleSalonKaldir = async (uid) => {
    setSecimler((prev) => ({ ...prev, [uid]: "" }));
    setKayitDurumu((prev) => ({ ...prev, [uid]: "yukleniyor" }));
    try {
      await updateDoc(doc(db, "users", uid), { salonId: null });
      setAdminler((prev) =>
        prev.map((a) => (a.uid === uid ? { ...a, salonId: null } : a))
      );
      setKayitDurumu((prev) => ({ ...prev, [uid]: "kaldirildi" }));
      setTimeout(
        () => setKayitDurumu((prev) => ({ ...prev, [uid]: null })),
        2000
      );
    } catch (err) {
      setKayitDurumu((prev) => ({ ...prev, [uid]: "hata" }));
    }
  };

  if (yukleniyor) {
    return (
      <div style={styles.yukleniyor}>
        <div style={styles.spinner} />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (hata) {
    return (
      <div style={styles.hataKutu}>
        <span>⚠️</span> {hata}
      </div>
    );
  }

  const atananAdminler = adminler.filter((a) => a.salonId);
  const atanmayanAdminler = adminler.filter((a) => !a.salonId);

  return (
    <div style={styles.kapsayici}>
      <div style={styles.baslik}>
        <h2 style={styles.h2}>🔑 Admin Salon Atamaları</h2>
        <p style={styles.aciklama}>
          Her admin yalnızca atandığı salonun randevu, yorum ve çalışma
          saatlerini görebilir. Salon atanmayan adminler panele giremez.
        </p>
      </div>

      {/* Özet */}
      <div style={styles.ozetSatir}>
        <div style={styles.ozetKart}>
          <span style={styles.ozetSayi}>{adminler.length}</span>
          <span style={styles.ozetEtiket}>Toplam Admin</span>
        </div>
        <div style={{ ...styles.ozetKart, borderColor: "#22c55e" }}>
          <span style={{ ...styles.ozetSayi, color: "#22c55e" }}>
            {atananAdminler.length}
          </span>
          <span style={styles.ozetEtiket}>Salon Atanmış</span>
        </div>
        <div style={{ ...styles.ozetKart, borderColor: "#f59e0b" }}>
          <span style={{ ...styles.ozetSayi, color: "#f59e0b" }}>
            {atanmayanAdminler.length}
          </span>
          <span style={styles.ozetEtiket}>Atanmamış</span>
        </div>
        <div style={{ ...styles.ozetKart, borderColor: "#6366f1" }}>
          <span style={{ ...styles.ozetSayi, color: "#6366f1" }}>
            {salonlar.length}
          </span>
          <span style={styles.ozetEtiket}>Toplam Salon</span>
        </div>
      </div>

      {adminler.length === 0 ? (
        <div style={styles.bosKutu}>
          <p>Henüz hiç admin kullanıcı yok.</p>
          <small>
            Kullanıcıları Firebase Console'dan role: "admin" yapabilirsiniz.
          </small>
        </div>
      ) : (
        <div style={styles.liste}>
          {adminler.map((admin) => {
            const durum = kayitDurumu[admin.uid];
            const mevcutSalon = salonlar.find((s) => s.id === admin.salonId);
            const seciliSalon = salonlar.find(
              (s) => s.id === secimler[admin.uid]
            );
            const degistiMi = secimler[admin.uid] !== (admin.salonId || "");

            return (
              <div key={admin.uid} style={styles.adminKart}>
                <div style={styles.adminBilgi}>
                  <div style={styles.avatarDaire}>
                    {(admin.displayName || admin.email || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={styles.adminAd}>
                      {admin.displayName || "—"}
                    </div>
                    <div style={styles.adminEmail}>{admin.email}</div>
                    <div style={styles.mevcutAtama}>
                      {mevcutSalon ? (
                        <span style={styles.atanmisBadge}>
                          ✅ {mevcutSalon.ad}
                          <button
                            style={styles.kaldir}
                            onClick={() => handleSalonKaldir(admin.uid)}
                            title="Salon atamasını kaldır"
                          >
                            ✕
                          </button>
                        </span>
                      ) : (
                        <span style={styles.atanmamisBadge}>
                          ⚠️ Salon atanmamış
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.secimAlani}>
                  <select
                    style={styles.select}
                    value={secimler[admin.uid] || ""}
                    onChange={(e) => handleSecim(admin.uid, e.target.value)}
                  >
                    <option value="">— Salon seçin —</option>
                    {salonlar.map((salon) => (
                      <option key={salon.id} value={salon.id}>
                        {salon.ad} {salon.adres ? `(${salon.adres})` : ""}
                      </option>
                    ))}
                  </select>

                  <button
                    style={{
                      ...styles.kaydetBtn,
                      opacity: !degistiMi || durum === "yukleniyor" ? 0.5 : 1,
                    }}
                    disabled={!degistiMi || durum === "yukleniyor"}
                    onClick={() => handleKaydet(admin.uid)}
                  >
                    {durum === "yukleniyor"
                      ? "⏳"
                      : durum === "basarili"
                      ? "✅ Kaydedildi"
                      : durum === "hata"
                      ? "❌ Hata"
                      : durum === "kaldirildi"
                      ? "🗑️ Kaldırıldı"
                      : "💾 Kaydet"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  kapsayici: {
    padding: "24px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  baslik: { marginBottom: "24px" },
  h2: { margin: "0 0 8px", fontSize: "22px", color: "#1e293b" },
  aciklama: { margin: 0, color: "#64748b", fontSize: "14px" },
  ozetSatir: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  ozetKart: {
    flex: 1,
    minWidth: "120px",
    padding: "16px",
    borderRadius: "10px",
    border: "2px solid #e2e8f0",
    background: "#fff",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  ozetSayi: { fontSize: "28px", fontWeight: "700", color: "#1e293b" },
  ozetEtiket: { fontSize: "12px", color: "#94a3b8" },
  liste: { display: "flex", flexDirection: "column", gap: "12px" },
  adminKart: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  adminBilgi: { display: "flex", alignItems: "center", gap: "12px" },
  avatarDaire: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    background: "#6366f1",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "18px",
    flexShrink: 0,
  },
  adminAd: { fontWeight: "600", fontSize: "15px", color: "#1e293b" },
  adminEmail: { fontSize: "13px", color: "#64748b" },
  mevcutAtama: { marginTop: "4px" },
  atanmisBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "12px",
    background: "#dcfce7",
    color: "#16a34a",
    padding: "2px 8px",
    borderRadius: "20px",
  },
  atanmamisBadge: {
    fontSize: "12px",
    background: "#fef9c3",
    color: "#b45309",
    padding: "2px 8px",
    borderRadius: "20px",
    display: "inline-block",
  },
  kaldir: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#16a34a",
    fontWeight: "700",
    fontSize: "13px",
    padding: "0 2px",
  },
  secimAlani: { display: "flex", gap: "8px", alignItems: "center" },
  select: {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    minWidth: "200px",
    background: "#f8fafc",
    cursor: "pointer",
  },
  kaydetBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "none",
    background: "#6366f1",
    color: "#fff",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "opacity 0.2s",
  },
  yukleniyor: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px",
    color: "#64748b",
    gap: "12px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTop: "3px solid #6366f1",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  hataKutu: {
    padding: "20px",
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "10px",
    color: "#dc2626",
  },
  bosKutu: {
    textAlign: "center",
    padding: "40px",
    color: "#94a3b8",
    background: "#f8fafc",
    borderRadius: "12px",
  },
  yetkisiz: {
    textAlign: "center",
    padding: "60px",
    color: "#94a3b8",
    fontSize: "16px",
  },
};