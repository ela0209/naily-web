import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .register-page {
    min-height: 100vh;
    background: #f7f4f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
    padding: 40px 16px;
    box-sizing: border-box;
  }

  .register-page::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(233, 100, 167, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .register-page::after {
    content: '';
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(160, 100, 220, 0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .register-card {
    background: #ffffff;
    border-radius: 28px;
    padding: 52px 52px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 4px 40px rgba(180, 100, 160, 0.10), 0 1px 4px rgba(0,0,0,0.04);
    position: relative;
    z-index: 1;
    animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .register-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 28px;
  }

  .register-logo-icon {
    font-size: 28px;
    margin-right: 8px;
  }

  .register-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, #d63384, #9b59b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .nail-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 24px;
  }

  .nail-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .register-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #1a1a2e;
    text-align: center;
    margin: 0 0 8px 0;
  }

  .register-subtitle {
    text-align: center;
    color: #888;
    font-size: 14px;
    font-weight: 300;
    margin: 0 0 32px 0;
    line-height: 1.5;
  }

  .input-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  .input-group {
    margin-bottom: 16px;
    position: relative;
  }

  .input-group.no-margin {
    margin-bottom: 0;
  }

  .input-label {
    display: block;
    font-size: 11px;
    font-weight: 500;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 7px;
  }

  .register-input {
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid #eee;
    border-radius: 14px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a2e;
    background: #fafafa;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    box-sizing: border-box;
    outline: none;
  }

  .register-input::placeholder {
    color: #bbb;
    font-weight: 300;
  }

  .register-input:focus {
    border-color: #d63384;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(214, 51, 132, 0.08);
  }

  .register-input.error-border {
    border-color: #f06292;
    background: #fff8fb;
  }

  .password-wrapper {
    position: relative;
  }

  .password-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #bbb;
    font-size: 16px;
    padding: 0;
    line-height: 1;
    transition: color 0.2s;
  }

  .password-toggle:hover {
    color: #d63384;
  }

  .password-strength {
    margin-top: 8px;
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .strength-bar {
    flex: 1;
    height: 3px;
    border-radius: 99px;
    background: #eee;
    transition: background 0.3s;
  }

  .strength-label {
    font-size: 11px;
    color: #bbb;
    margin-left: 6px;
    min-width: 48px;
    text-align: right;
    transition: color 0.3s;
  }

  .terms-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin: 20px 0 24px;
  }

  .terms-checkbox {
    width: 18px;
    height: 18px;
    min-width: 18px;
    accent-color: #d63384;
    margin-top: 1px;
    cursor: pointer;
  }

  .terms-text {
    font-size: 13px;
    color: #888;
    line-height: 1.5;
  }

  .terms-link {
    color: #d63384;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .terms-link:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  .register-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #e83e8c, #9b59b6);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 15px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 18px rgba(214, 51, 132, 0.30);
    letter-spacing: 0.02em;
  }

  .register-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(214, 51, 132, 0.38);
  }

  .register-btn:active {
    transform: translateY(0);
    opacity: 0.9;
  }

  .register-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .error-msg {
    background: #fff0f5;
    border: 1px solid #ffc0d8;
    color: #c0376b;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: shake 0.3s ease;
  }

  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%,60%  { transform: translateX(-4px); }
    40%,80%  { transform: translateX(4px); }
  }

  .success-msg {
    background: #f0fff8;
    border: 1px solid #a8f0cf;
    color: #1a7a4a;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .login-text {
    text-align: center;
    font-size: 14px;
    color: #999;
    margin-top: 20px;
    margin-bottom: 0;
  }

  .login-link {
    color: #d63384;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .login-link:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  .field-hint {
    font-size: 11px;
    color: #bbb;
    margin-top: 5px;
    padding-left: 2px;
  }
`;

const STRENGTH_LEVELS = [
  { label: "Zayıf", color: "#f06292" },
  { label: "Orta", color: "#ffb74d" },
  { label: "İyi", color: "#81c784" },
  { label: "Güçlü", color: "#4caf50" },
];

function getStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-4
}

export default function Register() {
  const [form, setForm] = useState({
    displayName: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = form.password ? getStrength(form.password) : 0;
  const strengthInfo = form.password
    ? STRENGTH_LEVELS[Math.min(strength - 1, 3)]
    : null;

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleRegister() {
    setHata("");

    if (!form.displayName.trim()) return setHata("Lütfen adınızı girin.");
    if (!form.email) return setHata("Lütfen e-posta adresinizi girin.");
    if (form.password.length < 6)
      return setHata("Şifre en az 6 karakter olmalıdır.");
    if (form.password !== form.passwordConfirm)
      return setHata("Şifreler eşleşmiyor.");
    if (!termsAccepted)
      return setHata(
        "Devam etmek için kullanım koşullarını kabul etmelisiniz.",
      );

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.password,
      );
      await updateProfile(userCredential.user, {
        displayName: form.displayName.trim(),
      });

      // Firestore'a kullanıcı belgesi oluştur
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: form.displayName.trim(),
        email: form.email,
        role: "user",        // varsayılan rol
        salonId: null,       // salon sahibi değil
        olusturulma: new Date().toISOString(),
      });

      navigate("/");
    } catch (err) {
      const mesajlar = {
        "auth/email-already-in-use": "Bu e-posta adresi zaten kullanımda.",
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/weak-password": "Şifre çok zayıf. Daha güçlü bir şifre seçin.",
      };
      setHata(mesajlar[err.code] || "Kayıt başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleRegister();
  }

  return (
    <>
      <style>{styles}</style>
      <div className="register-page">
        <div className="register-card">
          {/* Logo */}
          <div className="register-logo">
            <span className="register-logo-icon">💅</span>
            <span className="register-logo-text">Naily</span>
          </div>

          {/* Nail dots */}
          <div className="nail-dots">
            {["#e83e8c", "#f06292", "#ce93d8", "#ab47bc", "#f48fb1"].map(
              (c, i) => (
                <div key={i} className="nail-dot" style={{ background: c }} />
              ),
            )}
          </div>

          <h1 className="register-title">Hesap Oluştur ✨</h1>
          <p className="register-subtitle">
            Binlerce tırnak tasarımını keşfetmeye başla
          </p>

          {/* Error */}
          {hata && (
            <div className="error-msg">
              <span>⚠️</span> {hata}
            </div>
          )}

          {/* Ad Soyad */}
          <div className="input-group">
            <label className="input-label">Ad Soyad</label>
            <input
              className="register-input"
              type="text"
              name="displayName"
              placeholder="Adın ve soyadın"
              value={form.displayName}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* E-posta */}
          <div className="input-group">
            <label className="input-label">E-posta</label>
            <input
              className="register-input"
              type="email"
              name="email"
              placeholder="ornek@mail.com"
              value={form.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Şifre */}
          <div className="input-group">
            <label className="input-label">Şifre</label>
            <div className="password-wrapper">
              <input
                className="register-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="En az 6 karakter"
                value={form.password}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            {form.password && (
              <div className="password-strength">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="strength-bar"
                    style={{
                      background: i <= strength ? strengthInfo?.color : "#eee",
                    }}
                  />
                ))}
                <span
                  className="strength-label"
                  style={{ color: strengthInfo?.color }}
                >
                  {strengthInfo?.label}
                </span>
              </div>
            )}
          </div>

          {/* Şifre Tekrar */}
          <div className="input-group">
            <label className="input-label">Şifre Tekrar</label>
            <input
              className={`register-input${
                form.passwordConfirm && form.password !== form.passwordConfirm
                  ? " error-border"
                  : ""
              }`}
              type={showPassword ? "text" : "password"}
              name="passwordConfirm"
              placeholder="Şifreni tekrar gir"
              value={form.passwordConfirm}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            {form.passwordConfirm && form.password !== form.passwordConfirm && (
              <p className="field-hint" style={{ color: "#f06292" }}>
                Şifreler eşleşmiyor
              </p>
            )}
            {form.passwordConfirm && form.password === form.passwordConfirm && (
              <p className="field-hint" style={{ color: "#4caf50" }}>
                ✓ Şifreler eşleşiyor
              </p>
            )}
          </div>

          {/* Kullanım Koşulları */}
          <div className="terms-row">
            <input
              type="checkbox"
              className="terms-checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="terms-text">
              <a href="/terms" className="terms-link">
                Kullanım Koşulları
              </a>
              'nı ve{" "}
              <a href="/privacy" className="terms-link">
                Gizlilik Politikası
              </a>
              'nı okudum, kabul ediyorum.
            </label>
          </div>

          <button
            className="register-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Hesap oluşturuluyor..." : "Kayıt Ol →"}
          </button>

          <p className="login-text">
            Zaten hesabın var mı?{" "}
            <Link to="/login" className="login-link">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
