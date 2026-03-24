import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Sadece giriş yapmış kullanıcılar için
export function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

// Sadece adminler için
export function AdminRoute({ children }) {
  const { currentUser, role } = useAuth();

  if (!currentUser) return <Navigate to="/login" replace />;

  if (role !== "admin") {
    return (
      <div style={styles.container}>
        <div style={styles.kart}>
          <div style={styles.ikon}>🔒</div>
          <h2 style={styles.baslik}>Erişim Reddedildi</h2>
          <p style={styles.aciklama}>
            Bu sayfayı görüntülemek için admin yetkisine ihtiyacınız var.
          </p>
          <a href="/" style={styles.link}>
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  return children;
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fdf2f8",
    fontFamily: "'Segoe UI', sans-serif",
  },
  kart: {
    background: "white",
    borderRadius: 20,
    padding: "48px 40px",
    textAlign: "center",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    maxWidth: 380,
    width: "100%",
  },
  ikon: { fontSize: 52, marginBottom: 16 },
  baslik: { fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 10px" },
  aciklama: { color: "#6b7280", fontSize: 15, margin: "0 0 24px", lineHeight: 1.5 },
  link: {
    display: "inline-block",
    background: "linear-gradient(135deg, #ec4899, #f472b6)",
    color: "white",
    padding: "10px 28px",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 14,
  },
};