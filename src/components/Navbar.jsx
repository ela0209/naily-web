import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try { await signOut(auth); navigate("/"); } catch (e) { console.error(e); }
  };

  const isActive = (path) => location.pathname === path;
  const isAdmin      = role === "admin";
  const isSuperAdmin = role === "superadmin";
  const isUser       = !isAdmin && !isSuperAdmin;

  const navLinks = [
    { to: "/",        label: "Ana Sayfa", icon: "✦" },
    { to: "/salons",  label: "Salonlar",  icon: "📍" },
    { to: "/preview", label: "Önizleme", icon: "💅" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');

        @keyframes navSlideDown { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes dropFade { from{opacity:0;transform:translateY(6px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes mobileSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        .nav-root { position:fixed; top:0; left:0; right:0; z-index:1000; animation:navSlideDown .5s ease both; font-family:'Outfit',sans-serif; }

        .nav-inner { margin:10px 20px; border-radius:20px; padding:0 24px; height:100px; display:flex; align-items:center; justify-content:space-between; transition:all .35s ease; border:1px solid rgba(255,255,255,.18); }
        .nav-inner.flat { background:rgba(255,255,255,.72); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); box-shadow:0 4px 24px rgba(155,114,207,.08); }
        .nav-inner.scrolled { background:rgba(255,255,255,.92); backdrop-filter:blur(28px); -webkit-backdrop-filter:blur(28px); box-shadow:0 8px 40px rgba(155,114,207,.16); border-color:rgba(232,99,140,.12); }

        .nav-logo { display:flex; align-items:center; gap:8px; text-decoration:none; flex-shrink:0; }
        .nav-logo img { height:86px; width:auto; object-fit:contain; display:block; }
        .nav-logo-fallback { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; background:linear-gradient(135deg,#e8638c,#9b72cf); -webkit-background-clip:text; -webkit-text-fill-color:transparent; letter-spacing:-.02em; }

        .nav-links { display:flex; align-items:center; gap:2px; list-style:none; margin:0; padding:0; }
        .nav-link { position:relative; text-decoration:none; font-size:14px; font-weight:500; color:#6b6278; padding:7px 14px; border-radius:12px; transition:all .22s; display:flex; align-items:center; gap:5px; white-space:nowrap; }
        .nav-link:hover { color:#1a1625; background:rgba(155,114,207,.08); }
        .nav-link.active { color:#9b72cf; background:linear-gradient(135deg,rgba(232,99,140,.08),rgba(155,114,207,.10)); font-weight:600; }
        .nav-link.active::after { content:''; position:absolute; bottom:3px; left:50%; transform:translateX(-50%); width:16px; height:2px; border-radius:2px; background:linear-gradient(90deg,#e8638c,#9b72cf); }
        .nav-link-icon { font-size:11px; opacity:.75; }

        .nav-actions { display:flex; align-items:center; gap:8px; }

        .btn-login { font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:500; color:#6b6278; text-decoration:none; padding:7px 16px; border-radius:12px; border:1.5px solid #e8e2d9; background:transparent; transition:all .22s; cursor:pointer; }
        .btn-login:hover { border-color:#c9aff0; color:#9b72cf; background:rgba(155,114,207,.06); }

        .btn-register { font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:600; color:white; text-decoration:none; padding:8px 18px; border-radius:12px; background:linear-gradient(135deg,#e8638c,#9b72cf); box-shadow:0 4px 16px rgba(232,99,140,.26); transition:all .22s; border:none; cursor:pointer; display:inline-flex; align-items:center; gap:6px; }
        .btn-register:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(232,99,140,.36); }

        .user-menu-wrap { position:relative; }
        .user-avatar { width:36px; height:36px; border-radius:12px; background:linear-gradient(135deg,#e8638c,#9b72cf); display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; color:white; cursor:pointer; border:2px solid rgba(255,255,255,.7); box-shadow:0 4px 14px rgba(155,114,207,.26); transition:all .22s; user-select:none; }
        .user-avatar:hover { transform:scale(1.07); box-shadow:0 6px 20px rgba(155,114,207,.36); }

        .user-dropdown { position:absolute; top:calc(100% + 10px); right:0; min-width:210px; background:rgba(255,255,255,.95); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(232,99,140,.10); border-radius:18px; box-shadow:0 16px 48px rgba(155,114,207,.18); padding:8px; animation:dropFade .2s ease both; z-index:200; }
        .dropdown-header { padding:10px 12px; border-bottom:1px solid rgba(232,99,140,.08); margin-bottom:6px; }
        .dropdown-name { font-size:13.5px; font-weight:600; color:#1a1625; margin-bottom:2px; display:flex; align-items:center; gap:6px; }
        .dropdown-email { font-size:11px; color:#8b829a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:190px; }
        .dropdown-item { display:flex; align-items:center; gap:9px; padding:9px 12px; border-radius:10px; font-size:13px; font-weight:500; color:#4a4458; text-decoration:none; cursor:pointer; transition:all .18s; background:transparent; border:none; width:100%; text-align:left; font-family:'Outfit',sans-serif; }
        .dropdown-item:hover { background:rgba(155,114,207,.08); color:#9b72cf; }
        .dropdown-item.danger:hover { background:rgba(232,99,140,.08); color:#e8638c; }
        .dropdown-divider { height:1px; background:rgba(232,99,140,.08); margin:5px 0; }

        .admin-pill { display:inline-flex; align-items:center; background:linear-gradient(135deg,rgba(232,99,140,.12),rgba(155,114,207,.14)); border:1px solid rgba(155,114,207,.2); border-radius:6px; padding:2px 7px; font-size:9.5px; font-weight:700; color:#9b72cf; letter-spacing:.05em; text-transform:uppercase; }
        .superadmin-pill { display:inline-flex; align-items:center; background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(245,158,11,.12)); border:1px solid rgba(245,158,11,.25); border-radius:6px; padding:2px 7px; font-size:9.5px; font-weight:700; color:#b45309; letter-spacing:.05em; text-transform:uppercase; }

        .hamburger { display:none; flex-direction:column; justify-content:center; gap:5px; width:36px; height:36px; cursor:pointer; padding:6px; border-radius:10px; border:1.5px solid #e8e2d9; background:transparent; transition:all .22s; }
        .hamburger:hover { border-color:#c9aff0; background:rgba(155,114,207,.06); }
        .hamburger span { display:block; height:1.5px; background:#6b6278; border-radius:2px; transition:all .25s; transform-origin:center; }
        .hamburger.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
        .hamburger.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }

        .mobile-menu { margin:0 20px; border-radius:0 0 20px 20px; background:rgba(255,255,255,.96); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(232,99,140,.10); border-top:none; padding:10px 12px 14px; animation:mobileSlide .22s ease both; box-shadow:0 16px 40px rgba(155,114,207,.13); }
        .mobile-link { display:flex; align-items:center; gap:10px; padding:11px 14px; border-radius:12px; font-size:14px; font-weight:500; color:#6b6278; text-decoration:none; transition:all .18s; }
        .mobile-link:hover, .mobile-link.active { background:linear-gradient(135deg,rgba(232,99,140,.07),rgba(155,114,207,.09)); color:#9b72cf; }
        .mobile-divider { height:1px; background:rgba(232,99,140,.08); margin:6px 0; }
        .mobile-actions { display:flex; gap:8px; margin-top:8px; padding-top:10px; border-top:1px solid rgba(232,99,140,.08); }
        .mobile-actions > * { flex:1; text-align:center; justify-content:center; }

        @media (max-width:720px) { .nav-links{display:none} .btn-login,.btn-register{display:none} .hamburger{display:flex} }
        @media (min-width:721px) { .mobile-menu{display:none!important} .hamburger{display:none!important} }
      `}</style>

      <nav className="nav-root">
        <div className={`nav-inner ${scrolled ? "scrolled" : "flat"}`}>

          {/* Logo */}
          <Link to="/" className="nav-logo">
            <img src="/images/Naily.png" alt="Naily"
              onError={(e) => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }} />
            <span className="nav-logo-fallback" style={{ display:"none" }}>Naily</span>
          </Link>

          {/* Orta linkler */}
          <ul className="nav-links">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={`nav-link ${isActive(l.to) ? "active" : ""}`}>
                  <span className="nav-link-icon">{l.icon}</span>{l.label}
                </Link>
              </li>
            ))}

            {/* Sadece normal kullanıcı → Randevularım */}
            {currentUser && isUser && (
              <li>
                <Link to="/profile?tab=randevular" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
                  <span className="nav-link-icon">📅</span>Randevularım
                </Link>
              </li>
            )}

            {/* Sadece salon sahibi (admin) → Admin Paneli */}
            {isAdmin && (
              <li>
                <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>
                  <span className="nav-link-icon">⚡</span>Admin Paneli
                </Link>
              </li>
            )}

            {/* Sadece superadmin → Süper Admin (Admin Paneli YOK) */}
            {isSuperAdmin && (
              <li>
                <Link to="/superadmin" className={`nav-link ${isActive("/superadmin") ? "active" : ""}`}>
                  <span className="nav-link-icon">👑</span>Süper Admin
                </Link>
              </li>
            )}
          </ul>

          {/* Sağ alan */}
          <div className="nav-actions">
            {currentUser ? (
              <div className="user-menu-wrap">
                <div className="user-avatar" onClick={() => setUserMenuOpen((v) => !v)} title={currentUser.email}>
                  {currentUser.email.charAt(0).toUpperCase()}
                </div>

                {userMenuOpen && (
                  <>
                    <div style={{ position:"fixed", inset:0, zIndex:99 }} onClick={() => setUserMenuOpen(false)} />
                    <div className="user-dropdown">
                      <div className="dropdown-header">
                        <div className="dropdown-name">
                          {currentUser.email.split("@")[0]}
                          {isSuperAdmin && <span className="superadmin-pill">👑 Süper Admin</span>}
                          {isAdmin      && <span className="admin-pill">⚡ Admin</span>}
                        </div>
                        <div className="dropdown-email">{currentUser.email}</div>
                      </div>

                      {/* SuperAdmin dropdown — sadece Süper Admin Paneli */}
                      {isSuperAdmin && (
                        <Link to="/superadmin" className="dropdown-item">
                          👑 Süper Admin Paneli
                        </Link>
                      )}

                      {/* Admin dropdown — sadece Admin Paneli */}
                      {isAdmin && (
                        <Link to="/admin" className="dropdown-item">
                          ⚡ Admin Paneli
                        </Link>
                      )}

                      {/* Normal kullanıcı dropdown */}
                      {isUser && (
                        <>
                          <Link to="/profile" className="dropdown-item">👤 Profilim</Link>
                          <Link to="/profile?tab=randevular" className="dropdown-item">📅 Randevularım</Link>
                        </>
                      )}

                      <div className="dropdown-divider" />
                      <button className="dropdown-item danger" onClick={handleLogout}>🚪 Çıkış Yap</button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-login">Giriş Yap</Link>
                <Link to="/register" className="btn-register">Kayıt Ol ✦</Link>
              </>
            )}

            <button className={`hamburger ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen((v) => !v)} aria-label="Menü">
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* Mobil menü */}
        {menuOpen && (
          <div className="mobile-menu">
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className={`mobile-link ${isActive(l.to) ? "active" : ""}`}>
                <span>{l.icon}</span>{l.label}
              </Link>
            ))}

            {currentUser && isUser && (
              <Link to="/profile?tab=randevular" className={`mobile-link ${isActive("/profile") ? "active" : ""}`}>
                <span>📅</span>Randevularım
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className={`mobile-link ${isActive("/admin") ? "active" : ""}`}>
                <span>⚡</span>Admin Paneli
              </Link>
            )}
            {isSuperAdmin && (
              <Link to="/superadmin" className={`mobile-link ${isActive("/superadmin") ? "active" : ""}`}>
                <span>👑</span>Süper Admin
              </Link>
            )}

            <div className="mobile-divider" />
            {currentUser ? (
              <>
                {isUser && <Link to="/profile" className="mobile-link">👤 Profilim</Link>}
                <div className="mobile-actions">
                  <button className="btn-register" onClick={handleLogout} style={{ border:"none", cursor:"pointer" }}>
                    🚪 Çıkış Yap
                  </button>
                </div>
              </>
            ) : (
              <div className="mobile-actions">
                <Link to="/login" className="btn-login">Giriş Yap</Link>
                <Link to="/register" className="btn-register">Kayıt Ol ✦</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <div style={{ height: 120 }} />
    </>
  );
}