import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─── Giriş yapmış herkes ─── */
export function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

/* ─── Sadece salon sahibi (admin) ─── */
export function AdminRoute({ children }) {
  const { currentUser, role } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role !== "admin" && role !== "superadmin") return <ErisimReddedildi />;
  return children;
}

/* ─── Sadece superadmin ─── */
export function SuperAdminRoute({ children }) {
  const { currentUser, role } = useAuth();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role !== "superadmin") return <ErisimReddedildi />;
  return children;
}

/* ─── Erişim reddedildi ekranı ─── */
function ErisimReddedildi() {
  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Outfit:wght@400;500;600&display=swap');
      `}</style>
      <div style={s.kart}>
        <div style={s.ikon}>🔒</div>
        <h2 style={s.baslik}>Erişim Reddedildi</h2>
        <p style={s.aciklama}>
          Bu sayfayı görüntülemek için gerekli yetkiye sahip değilsiniz.
        </p>
        <a href="/" style={s.btn}>Ana Sayfaya Dön</a>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
    background: "#faf8f5", fontFamily: "Outfit, sans-serif",
  },
  kart: {
    background: "white", borderRadius: 24, padding: "48px 40px",
    textAlign: "center", boxShadow: "0 4px 32px rgba(155,114,207,0.12)",
    maxWidth: 380, width: "100%",
    border: "1px solid rgba(232,99,140,0.08)",
  },
  ikon: { fontSize: 52, marginBottom: 16 },
  baslik: {
    fontFamily: "Cormorant Garamond, serif", fontSize: 26, fontWeight: 700,
    color: "#1a1625", margin: "0 0 10px",
  },
  aciklama: { color: "#8b829a", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 },
  btn: {
    display: "inline-block",
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
    color: "white", padding: "11px 28px", borderRadius: 14,
    textDecoration: "none", fontWeight: 700, fontSize: 14,
    boxShadow: "0 4px 16px rgba(232,99,140,0.25)",
  },
};