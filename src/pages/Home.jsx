import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div style={styles.badge}>✨ Tırnak Tasarım Platformu</div>
        <h1 style={styles.baslik}>
          Naily'e <span style={styles.vurgu}>Hoş Geldin</span>{" "}
          <span>💅</span>
        </h1>

        {currentUser ? (
          <p style={styles.alt}>
            Merhaba,{" "}
            <strong style={{ color: "#ec4899" }}>{currentUser.email}</strong>!
          </p>
        ) : (
          <p style={styles.alt}>
            En yakın tırnak salonlarını bul, önizle, randevu al.
          </p>
        )}

        <div style={styles.butonlar}>
          <Link to="/salons" style={{ textDecoration: "none" }}>
            <button style={styles.anaBtn}>📍 Yakınımdaki Salonlar</button>
          </Link>
          <Link to="/preview" style={{ textDecoration: "none" }}>
            <button style={styles.ikinciBtn}>💅 Tırnak Önizle</button>
          </Link>
        </div>

        {currentUser ? (
          <button onClick={handleLogout} style={styles.cikisBtn}>
            Çıkış Yap
          </button>
        ) : (
          <div style={styles.authLinks}>
            <Link to="/login" style={styles.authLink}>Giriş Yap</Link>
            <span style={{ color: "#d1d5db" }}>•</span>
            <Link to="/register" style={styles.authLink}>Kayıt Ol</Link>
          </div>
        )}
      </div>

      <div style={styles.ozellikler}>
        {[
          { emoji: "📍", baslik: "Konum Tabanlı", aciklama: "En yakın 3 salonu otomatik bul" },
          { emoji: "💅", baslik: "Tırnak Önizleme", aciklama: "Fotoğrafına renk uygula" },
          { emoji: "📅", baslik: "Online Randevu", aciklama: "Anında randevu oluştur" },
        ].map((o) => (
          <div key={o.baslik} style={styles.ozellikKart}>
            <div style={styles.ozellikEmoji}>{o.emoji}</div>
            <div style={styles.ozellikBaslik}>{o.baslik}</div>
            <div style={styles.ozellikAciklama}>{o.aciklama}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 56px)",
    background: "linear-gradient(160deg, #fff0f6 0%, #fdf2f8 40%, #f0f9ff 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 20px 40px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  hero: { textAlign: "center", maxWidth: 560 },
  badge: {
    display: "inline-block",
    background: "white",
    border: "1px solid #fce7f3",
    color: "#ec4899",
    borderRadius: 20,
    padding: "5px 16px",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 20,
    boxShadow: "0 2px 8px rgba(236,72,153,0.1)",
  },
  baslik: {
    fontSize: 42,
    fontWeight: 800,
    color: "#111827",
    margin: "0 0 12px",
    lineHeight: 1.2,
    letterSpacing: -1,
  },
  vurgu: {
    background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  alt: { fontSize: 17, color: "#6b7280", margin: "0 0 32px", lineHeight: 1.6 },
  butonlar: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 },
  anaBtn: {
    background: "linear-gradient(135deg, #ec4899, #f472b6)",
    color: "white",
    border: "none",
    borderRadius: 14,
    padding: "13px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(236,72,153,0.35)",
  },
  ikinciBtn: {
    background: "white",
    color: "#374151",
    border: "2px solid #e5e7eb",
    borderRadius: 14,
    padding: "13px 24px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  cikisBtn: {
    background: "transparent",
    border: "none",
    color: "#9ca3af",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    marginTop: 8,
  },
  authLinks: { display: "flex", gap: 12, justifyContent: "center", alignItems: "center", marginTop: 12 },
  authLink: { color: "#6b7280", fontSize: 14, textDecoration: "none", fontWeight: 500 },
  ozellikler: { display: "flex", gap: 16, marginTop: 60, flexWrap: "wrap", justifyContent: "center", maxWidth: 640 },
  ozellikKart: {
    background: "white",
    borderRadius: 16,
    padding: "24px 20px",
    textAlign: "center",
    width: 180,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid #f3f4f6",
  },
  ozellikEmoji: { fontSize: 28, marginBottom: 10 },
  ozellikBaslik: { fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 6 },
  ozellikAciklama: { fontSize: 13, color: "#6b7280", lineHeight: 1.4 },
};