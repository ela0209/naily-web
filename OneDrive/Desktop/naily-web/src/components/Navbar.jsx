import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate("/login");
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.logo}>
        💅 Naily
      </Link>

      <div style={styles.linkler}>
        <Link to="/salons" style={styles.link}>Salonlar</Link>
        <Link to="/preview" style={styles.link}>Tırnak Önizle</Link>

        {currentUser ? (
          <>
            {role === "admin" && (
              <Link to="/admin" style={styles.adminLink}>
                🛠️ Admin
              </Link>
            )}
            <Link to="/profile" style={styles.profilLink}>
              <div style={styles.avatarKucuk}>
                {currentUser.email[0].toUpperCase()}
              </div>
            </Link>
            <span style={styles.email}>{currentUser.email}</span>
            <button onClick={handleLogout} style={styles.cikisBtn}>
              Çıkış
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Giriş Yap</Link>
            <Link to="/register" style={styles.kayitBtn}>Kayıt Ol</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: "#ff69b4",
    padding: "12px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { color: "white", fontWeight: "bold", fontSize: 22, textDecoration: "none" },
  linkler: { display: "flex", gap: 15, alignItems: "center" },
  link: { color: "white", textDecoration: "none", fontSize: 14 },
  adminLink: {
    color: "white",
    textDecoration: "none",
    fontSize: 14,
    background: "rgba(255,255,255,0.2)",
    padding: "4px 12px",
    borderRadius: 20,
    fontWeight: 600,
  },
  profilLink: { textDecoration: "none" },
  avatarKucuk: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "white",
    color: "#ff69b4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    cursor: "pointer",
  },
  email: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  cikisBtn: {
    background: "white",
    color: "#ff69b4",
    border: "none",
    padding: "6px 15px",
    borderRadius: 20,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 13,
  },
  kayitBtn: {
    color: "#ff69b4",
    background: "white",
    textDecoration: "none",
    fontSize: 13,
    padding: "5px 14px",
    borderRadius: 20,
    fontWeight: 700,
  },
};