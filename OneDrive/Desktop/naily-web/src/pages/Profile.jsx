import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

function DurumBadge({ durum }) {
  const renkler = {
    onaylandi: { bg: "#dcfce7", text: "#16a34a", etiket: "✅ Onaylandı" },
    iptal: { bg: "#fee2e2", text: "#dc2626", etiket: "❌ İptal" },
    beklemede: { bg: "#fef9c3", text: "#ca8a04", etiket: "⏳ Beklemede" },
  };
  const r = renkler[durum] || renkler.beklemede;
  return (
    <span style={{ background: r.bg, color: r.text, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>
      {r.etiket}
    </span>
  );
}

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState("hepsi");

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }

    async function getRandevular() {
      const q = query(
        collection(db, "randevular"),
        where("kullanici", "==", currentUser.email)
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

  const filtrelenmis = filtre === "hepsi"
    ? randevular
    : randevular.filter((r) => r.durum === filtre);

  const istatistik = {
    toplam: randevular.length,
    onaylandi: randevular.filter((r) => r.durum === "onaylandi").length,
    beklemede: randevular.filter((r) => r.durum === "beklemede").length,
    iptal: randevular.filter((r) => r.durum === "iptal").length,
  };

  if (loading) return (
    <div style={styles.loadingContainer}>
      <p style={{ color: "#9ca3af" }}>Yükleniyor...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Profil Kartı */}
      <div style={styles.profilKart}>
        <div style={styles.avatar}>
          {currentUser.email[0].toUpperCase()}
        </div>
        <div>
          <h2 style={styles.profilAd}>{currentUser.email}</h2>
          <p style={styles.profilAlt}>Naily Üyesi</p>
        </div>
      </div>

      {/* İstatistikler */}
      <div style={styles.istatGrid}>
        {[
          { label: "Toplam", deger: istatistik.toplam, renk: "#6b7280" },
          { label: "Onaylı", deger: istatistik.onaylandi, renk: "#16a34a" },
          { label: "Bekleyen", deger: istatistik.beklemede, renk: "#ca8a04" },
          { label: "İptal", deger: istatistik.iptal, renk: "#dc2626" },
        ].map((s) => (
          <div key={s.label} style={styles.istatKart}>
            <div style={{ ...styles.istatSayi, color: s.renk }}>{s.deger}</div>
            <div style={styles.istatLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filtre */}
      <div style={styles.filtreContainer}>
        {[
          { key: "hepsi", label: "Tümü" },
          { key: "beklemede", label: "⏳ Bekleyen" },
          { key: "onaylandi", label: "✅ Onaylı" },
          { key: "iptal", label: "❌ İptal" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            style={{
              ...styles.filtreBtn,
              ...(filtre === f.key ? styles.filtreBtnAktif : {}),
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Randevu Listesi */}
      <div style={styles.randevuListesi}>
        {filtrelenmis.length === 0 && (
          <div style={styles.bos}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>📅</p>
            <p style={{ color: "#9ca3af", margin: 0 }}>
              {filtre === "hepsi" ? "Henüz randevunuz yok." : "Bu kategoride randevu yok."}
            </p>
            {filtre === "hepsi" && (
              <Link to="/salons" style={styles.salonLink}>
                Salon Bul →
              </Link>
            )}
          </div>
        )}

        {filtrelenmis.map((r) => (
          <div key={r.id} style={styles.randevuKart}>
            <div style={styles.randevuUst}>
              <div>
                <h3 style={styles.salonAdi}>{r.salonAdi}</h3>
                <p style={styles.randevuTarih}>
                  📅 {r.tarih} — 🕐 {r.saat}
                </p>
              </div>
              <DurumBadge durum={r.durum} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: 680, margin: "0 auto", padding: "40px 20px", fontFamily: "'Segoe UI', sans-serif" },
  loadingContainer: { display: "flex", justifyContent: "center", alignItems: "center", height: 300 },
  profilKart: {
    display: "flex", alignItems: "center", gap: 20,
    background: "white", borderRadius: 16, padding: 24,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20,
    border: "1px solid #f3f4f6",
  },
  avatar: {
    width: 56, height: 56, borderRadius: "50%",
    background: "linear-gradient(135deg, #ec4899, #f472b6)",
    color: "white", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0,
  },
  profilAd: { fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 4px" },
  profilAlt: { fontSize: 13, color: "#9ca3af", margin: 0 },
  istatGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 },
  istatKart: {
    background: "white", borderRadius: 12, padding: "16px 12px",
    textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    border: "1px solid #f3f4f6",
  },
  istatSayi: { fontSize: 28, fontWeight: 800, marginBottom: 4 },
  istatLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  filtreContainer: { display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  filtreBtn: {
    padding: "7px 16px", borderRadius: 20, border: "2px solid #e5e7eb",
    background: "white", color: "#6b7280", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  filtreBtnAktif: {
    background: "linear-gradient(135deg, #ec4899, #f472b6)",
    border: "2px solid transparent", color: "white",
  },
  randevuListesi: { display: "flex", flexDirection: "column", gap: 12 },
  randevuKart: {
    background: "white", borderRadius: 14, padding: "18px 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #f3f4f6",
  },
  randevuUst: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  salonAdi: { fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" },
  randevuTarih: { fontSize: 13, color: "#6b7280", margin: 0 },
  bos: { textAlign: "center", padding: "48px 0" },
  salonLink: {
    display: "inline-block", marginTop: 16,
    background: "linear-gradient(135deg, #ec4899, #f472b6)",
    color: "white", padding: "9px 24px", borderRadius: 12,
    textDecoration: "none", fontWeight: 700, fontSize: 14,
  },
};