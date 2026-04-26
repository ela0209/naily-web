import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

// Gerçek tırnak görselleri — Unsplash
const NAIL_IMAGES = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    label: "Fransız",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    label: "Glitter",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=400&q=80",
    label: "Nude",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    label: "Ombre",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=400&q=80",
    label: "Berry",
  },
  {
    id: 6,
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80",
    label: "Lavanta",
  },
];

// Gerçek görseller için daha iyi URL seti
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=85",
  "https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=600&q=85",
  "https://images.unsplash.com/photo-1604669099698-08a8f0afb3bd?w=600&q=85",
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=85",
];

export default function Home() {
  const { currentUser } = useAuth();

  return (
    <div style={s.page}>
      {/* Global CSS animasyonları */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Outfit:wght@300;400;500;600;700&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }

        .anim-1 { animation: fadeUp 0.55s 0.05s ease both; }
        .anim-2 { animation: fadeUp 0.55s 0.15s ease both; }
        .anim-3 { animation: fadeUp 0.55s 0.25s ease both; }
        .anim-4 { animation: fadeUp 0.55s 0.35s ease both; }
        .anim-img { animation: scaleIn 0.65s 0.2s ease both; }

        .nail-img-card:hover {
          transform: translateY(-6px) scale(1.04) !important;
          box-shadow: 0 20px 48px rgba(155,114,207,0.28) !important;
          z-index: 10;
        }
        .glass-badge:hover {
          background: rgba(255,255,255,0.38) !important;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 40px rgba(232,99,140,0.38) !important;
        }
        .btn-outline:hover {
          border-color: #c9aff0 !important;
          color: #9b72cf !important;
          background: rgba(155,114,207,0.06) !important;
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(155,114,207,0.12);
        }
      `}</style>

      {/* ── Hero ── */}
      <section style={s.hero}>
        <div style={s.heroLayout}>
          {/* Sol — metin */}
          <div style={s.heroText}>
            <span style={s.chip} className="anim-1">
              ✦ Tırnak Tasarım Platformu
            </span>

            <h1 style={s.heroTitle} className="anim-2">
              Güzelliğini
              <br />
              <span style={s.heroGrad}>Yeniden Keşfet</span>
            </h1>

            <p style={s.heroSub} className="anim-3">
              {currentUser
                ? `Hoş geldin, ${currentUser.email.split("@")[0]} ✨ Salonlarını keşfetmeye hazır mısın?`
                : "En yakın tırnak salonlarını bul, tasarımını canlı önizle, online randevu al."}
            </p>

            <div style={s.heroBtns} className="anim-4">
              <Link to="/salons" style={s.btnPrimary} className="btn-primary">
                📍 Salon Bul
              </Link>
              <Link to="/preview" style={s.btnOutline} className="btn-outline">
                💅 Önizleme
              </Link>
            </div>

            <div style={s.miniStats} className="anim-4">
              {[
                { n: "500+", l: "Salon" },
                { n: "12K+", l: "Kullanıcı" },
                { n: "4.9★", l: "Puan" },
              ].map((x) => (
                <div key={x.l} style={s.miniStat}>
                  <span style={s.miniN}>{x.n}</span>
                  <span style={s.miniL}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sağ — Fotoğraf Galerisi + Cam Efekti */}
          <div style={s.nailShowcase} className="anim-img">
            {/* Ana görsel grid */}
            <div style={s.imageGrid}>
              {/* Büyük sol görsel */}
              <div style={s.imgLarge} className="nail-img-card">
                <img
                  src="https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&w=500&q=85"
                  alt="Nail art"
                  style={s.imgFill}
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&w=500&q=85";
                  }}
                />
                {/* Cam overlay */}
                <div style={s.glassOverlay}>
                  <span style={s.glassTag}>🌸 Fransız Manikür</span>
                </div>
              </div>

              {/* Sağ iki küçük görsel */}
              <div style={s.imgColRight}>
                <div
                  style={{ ...s.imgSmall, animationDelay: "0.1s" }}
                  className="nail-img-card"
                >
                  <img
                    src="https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&w=300&q=85"
                    alt="Nail art 2"
                    style={s.imgFill}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1604669099698-08a8f0afb3bd?auto=format&w=300&q=85";
                    }}
                  />
                  <div style={s.glassOverlaySmall}>
                    <span style={s.glassTagSm}>✨ Glitter</span>
                  </div>
                </div>

                <div
                  style={{ ...s.imgSmall, animationDelay: "0.18s" }}
                  className="nail-img-card"
                >
                  <img
                    src="https://images.unsplash.com/photo-1604669099698-08a8f0afb3bd?auto=format&w=300&q=85"
                    alt="Nail art 3"
                    style={s.imgFill}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&w=300&q=85";
                    }}
                  />
                  <div style={s.glassOverlaySmall}>
                    <span style={s.glassTagSm}>💜 Lavanta</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt görsel şeridi */}
            <div style={s.imgStrip}>
              {[
                {
                  url: "https://images.unsplash.com/photo-1604902396830-aca29e19b067?auto=format&w=200&q=80",
                  label: "Nude",
                },
                {
                  url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&w=200&q=80",
                  label: "Ombré",
                },
                {
                  url: "https://images.unsplash.com/photo-1582160438889-c58c27c4c5ec?auto=format&w=200&q=80",
                  label: "Berry",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    ...s.stripCard,
                    animationDelay: `${0.25 + i * 0.07}s`,
                  }}
                  className="nail-img-card"
                >
                  <img
                    src={item.url}
                    alt={item.label}
                    style={s.stripImg}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentNode.style.background =
                        "linear-gradient(135deg,#c0392b,#7b1a1a)";
                    }}
                  />
                  <div style={s.stripGlass}>
                    <span style={s.stripLabel}>{item.label}</span>
                  </div>
                </div>
              ))}

              {/* Daha fazla badge */}
              <div style={s.moreBadge}>
                <span style={{ fontSize: 18, lineHeight: 1 }}>+47</span>
                <span style={{ fontSize: 10, opacity: 0.8 }}>Tasarım</span>
              </div>
            </div>

            {/* Yüzen cam kartlar */}
            <div
              style={{
                ...s.floatCard,
                animation: "floatY 4s 0s ease-in-out infinite",
              }}
              className="glass-badge"
            >
              <span style={s.floatIcon}>🎨</span>
              <div>
                <div style={s.floatTitle}>Canlı Önizleme</div>
                <div style={s.floatSub}>Kameranla dene</div>
              </div>
            </div>

            <div
              style={{
                ...s.floatCard2,
                animation: "floatY 4s 0.7s ease-in-out infinite",
              }}
              className="glass-badge"
            >
              <span style={s.floatIcon}>📅</span>
              <div>
                <div style={s.floatTitle}>Hızlı Randevu</div>
                <div style={s.floatSub}>2 dakikada al</div>
              </div>
            </div>
          </div>
        </div>

        {/* Arka plan dekor */}
        <div style={s.bgBlob1} />
        <div style={s.bgBlob2} />
        <div style={s.bgBlob3} />
      </section>

      {/* ── Özellikler ── */}
      <section style={s.features}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={s.sectionTitle}>Neden Naily?</h2>
          <p style={s.sectionSub}>Tüm ihtiyacınız tek bir yerde.</p>
        </div>
        <div style={s.featureGrid}>
          {[
            {
              icon: "📍",
              title: "Konum Tabanlı Arama",
              desc: "GPS ile konumunuzu alır, en yakın 3 salonu mesafeye göre sıralar.",
              bg: "#fdeef4",
            },
            {
              icon: "💅",
              title: "Canlı Önizleme",
              desc: "Kamera veya fotoğrafınıza renk, şekil ve efektler uygulayın.",
              bg: "#f3eeff",
            },
            {
              icon: "📅",
              title: "Online Randevu",
              desc: "Salonlara anında randevu alın, takip edin.",
              bg: "#fdeef4",
            },
            {
              icon: "⭐",
              title: "Gerçek Yorumlar",
              desc: "Kullanıcı deneyimlerini okuyun, salonları puanlayın.",
              bg: "#f3eeff",
            },
          ].map((f) => (
            <div
              key={f.title}
              style={{ ...s.featureCard, background: f.bg }}
              className="feature-card"
            >
              <div style={s.featureIcon}>{f.icon}</div>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      {!currentUser && (
        <section style={s.cta}>
          <img src="/images/Naily.png" alt="Naily" style={s.ctaLogo} />
          <h2 style={s.ctaTitle}>Hemen Başla</h2>
          <p style={s.ctaSub}>
            Ücretsiz hesap oluştur, dakikalar içinde randevu al.
          </p>
          <div style={s.ctaBtns}>
            <Link to="/register" style={s.btnPrimary} className="btn-primary">
              Ücretsiz Kayıt Ol →
            </Link>
            <Link to="/login" style={s.btnGhost}>
              Giriş Yap
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <img src="/images/Naily.png" alt="Naily" style={s.footerLogo} />
            <p style={s.footerTagline}>Güzelliğini yeniden keşfet.</p>
          </div>
          <div style={s.footerLinks}>
            <a href="/salons" style={s.footerLink}>
              Salonlar
            </a>
            <a href="/preview" style={s.footerLink}>
              Önizleme
            </a>
            <a href="/register" style={s.footerLink}>
              Kayıt Ol
            </a>
            <a href="/login" style={s.footerLink}>
              Giriş Yap
            </a>
          </div>
          <p style={s.footerCopy}>© 2025 Naily. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page: {
    fontFamily: "'Outfit', sans-serif",
    background: "#faf8f5",
    minHeight: "100vh",
  },

  // Hero
  hero: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(160deg, #ffffff 0%, #faf8f5 50%, #f3eeff 100%)",
    borderBottom: "1px solid #ede8e0",
    padding: "72px 24px 64px",
  },
  heroLayout: {
    maxWidth: 1040,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: 52,
    position: "relative",
    zIndex: 1,
    flexWrap: "wrap",
  },
  heroText: { flex: "1 1 340px", minWidth: 280 },

  chip: {
    display: "inline-block",
    background: "linear-gradient(135deg, #fdeef4, #f3eeff)",
    border: "1px solid #e8e2d9",
    borderRadius: 100,
    padding: "6px 18px",
    fontSize: 13,
    fontWeight: 600,
    color: "#9b72cf",
    marginBottom: 24,
    letterSpacing: "0.04em",
  },
  heroTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(40px, 6vw, 64px)",
    fontWeight: 700,
    color: "#1a1625",
    lineHeight: 1.1,
    marginBottom: 18,
    letterSpacing: "-0.02em",
  },
  heroGrad: {
    background: "linear-gradient(135deg, #e8638c 0%, #9b72cf 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 16,
    color: "#8b829a",
    lineHeight: 1.7,
    marginBottom: 32,
    maxWidth: 420,
  },
  heroBtns: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 36 },

  miniStats: { display: "flex", gap: 24 },
  miniStat: { display: "flex", flexDirection: "column", gap: 2 },
  miniN: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 700,
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  miniL: { fontSize: 12, color: "#8b829a", fontWeight: 500 },

  // ─── Nail Showcase (görseller) ───
  nailShowcase: {
    flex: "1 1 420px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minWidth: 320,
  },

  // Ana grid: büyük sol + sağ iki küçük
  imageGrid: {
    display: "flex",
    gap: 10,
    height: 280,
  },

  imgLarge: {
    flex: "1.4",
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 8px 32px rgba(155,114,207,0.16)",
  },
  imgColRight: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  imgSmall: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 6px 24px rgba(155,114,207,0.14)",
    animation: "scaleIn 0.65s ease both",
  },
  imgFill: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  // Cam overlay — büyük
  glassOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "28px 16px 14px",
    background:
      "linear-gradient(to top, rgba(26,22,37,0.55) 0%, transparent 100%)",
    backdropFilter: "blur(0px)",
    display: "flex",
    alignItems: "flex-end",
  },
  glassTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.22)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.35)",
    borderRadius: 100,
    padding: "5px 14px",
    fontSize: 12,
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "0.03em",
  },

  // Cam overlay — küçük
  glassOverlaySmall: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "20px 10px 8px",
    background:
      "linear-gradient(to top, rgba(26,22,37,0.5) 0%, transparent 100%)",
    display: "flex",
    alignItems: "flex-end",
  },
  glassTagSm: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    background: "rgba(255,255,255,0.20)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.30)",
    borderRadius: 100,
    padding: "4px 10px",
    fontSize: 11,
    fontWeight: 600,
    color: "#fff",
  },

  // Alt şerit
  imgStrip: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  stripCard: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 16px rgba(155,114,207,0.12)",
    animation: "scaleIn 0.65s ease both",
  },
  stripImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  stripGlass: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top, rgba(26,22,37,0.52) 0%, transparent 60%)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: "0 4px 6px",
  },
  stripLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: "#fff",
    letterSpacing: "0.04em",
  },

  // +47 badge
  moreBadge: {
    width: 64,
    height: 80,
    borderRadius: 14,
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    color: "#fff",
    fontWeight: 700,
    fontSize: 15,
    boxShadow: "0 4px 16px rgba(232,99,140,0.28)",
    cursor: "pointer",
    flexShrink: 0,
  },

  // Yüzen cam kartlar
  floatCard: {
    position: "absolute",
    bottom: 88,
    left: -20,
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 28px rgba(155,114,207,0.16)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    zIndex: 5,
    transition: "background 0.2s",
  },
  floatCard2: {
    position: "absolute",
    top: 0,
    right: -20,
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 8px 28px rgba(155,114,207,0.16)",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    zIndex: 5,
    transition: "background 0.2s",
  },
  floatIcon: { fontSize: 22 },
  floatTitle: { fontSize: 13, fontWeight: 700, color: "#1a1625" },
  floatSub: { fontSize: 11, color: "#8b829a" },

  // BG blobs
  bgBlob1: {
    position: "absolute",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(232,99,140,0.07) 0%, transparent 70%)",
    top: -200,
    right: -150,
    pointerEvents: "none",
  },
  bgBlob2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(155,114,207,0.08) 0%, transparent 70%)",
    bottom: -100,
    left: -80,
    pointerEvents: "none",
  },
  bgBlob3: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,183,77,0.05) 0%, transparent 70%)",
    top: "40%",
    left: "45%",
    pointerEvents: "none",
  },

  // Buttons
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg, #e8638c, #9b72cf)",
    color: "white",
    textDecoration: "none",
    padding: "13px 28px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 600,
    boxShadow: "0 8px 28px rgba(232,99,140,0.28)",
    transition: "all 0.25s",
    fontFamily: "'Outfit', sans-serif",
    border: "none",
    cursor: "pointer",
  },
  btnOutline: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "white",
    color: "#4a4458",
    textDecoration: "none",
    border: "1.5px solid #e8e2d9",
    padding: "13px 28px",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 500,
    transition: "all 0.25s",
    fontFamily: "'Outfit', sans-serif",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    background: "transparent",
    color: "#8b829a",
    textDecoration: "none",
    border: "none",
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    padding: "13px 16px",
  },

  // Features
  features: { maxWidth: 1000, margin: "0 auto", padding: "64px 24px" },
  sectionTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(28px, 4vw, 40px)",
    fontWeight: 700,
    color: "#1a1625",
    marginBottom: 8,
  },
  sectionSub: { fontSize: 15, color: "#8b829a" },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
  },
  featureCard: {
    borderRadius: 20,
    padding: "28px 24px",
    border: "1px solid rgba(232,99,140,0.10)",
    transition: "all 0.25s",
  },
  featureIcon: { fontSize: 28, marginBottom: 14 },
  featureTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 700,
    color: "#1a1625",
    marginBottom: 8,
  },
  featureDesc: { fontSize: 14, color: "#8b829a", lineHeight: 1.65 },

  // CTA
  cta: {
    maxWidth: 1000,
    margin: "0 auto 80px",
    background: "linear-gradient(135deg, #fdeef4, #f3eeff)",
    borderRadius: 24,
    padding: "56px 40px",
    textAlign: "center",
    border: "1px solid rgba(232,99,140,0.12)",
  },
  ctaTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(28px, 4vw, 40px)",
    fontWeight: 700,
    color: "#1a1625",
    marginBottom: 12,
  },
  ctaSub: { fontSize: 16, color: "#8b829a", marginBottom: 32, lineHeight: 1.6 },
  ctaBtns: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },

  // CTA logo
  ctaLogo: {
    height: 64,
    width: "auto",
    marginBottom: 20,
    filter: "drop-shadow(0 4px 12px rgba(232,99,140,0.3))",
    display: "block",
    margin: "0 auto 20px",
  },

  // Footer
  footer: {
    background: "#1a1625",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "15px 15px 15px",
    margin: "-0 -24px -24px",
  },
  footerInner: {
    maxWidth: 1000,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    textAlign: "center",
  },
  footerBrand: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  footerLogo: {
    height: 200,
    width: "auto",
    filter: "drop-shadow(0 2px 12px rgba(232,99,140,0.4)) brightness(1.1)",
  },
  footerTagline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic",
    margin: 0,
  },
  footerLinks: {
    display: "flex",
    gap: 15,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerLink: {
    fontFamily: "'Outfit', sans-serif",
    fontSize: 13,
    fontWeight: 500,
    color: "rgba(255,255,255,0.45)",
    textDecoration: "none",
    padding: "6px 14px",
    borderRadius: 8,
    transition: "color 0.2s",
  },
  footerCopy: {
    fontSize: 15,
    color: "rgba(255,255,255,0.25)",
    fontFamily: "'Outfit', sans-serif",
    margin: 0,
  },
};
