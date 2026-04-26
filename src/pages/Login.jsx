import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase";
import { useNavigate, Link } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500&display=swap');

  .login-page {
    min-height: 100vh;
    background: #f7f4f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }

  .login-page::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(233, 100, 167, 0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-page::after {
    content: '';
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(160, 100, 220, 0.10) 0%, transparent 70%);
    pointer-events: none;
  }

  .login-card {
    background: #ffffff;
    border-radius: 28px;
    padding: 56px 52px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 4px 40px rgba(180, 100, 160, 0.10), 0 1px 4px rgba(0,0,0,0.04);
    position: relative;
    z-index: 1;
    animation: fadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 32px;
  }

  .login-logo-icon {
    font-size: 28px;
    margin-right: 8px;
  }

  .login-logo-text {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, #d63384, #9b59b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .login-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px;
    font-weight: 700;
    color: #1a1a2e;
    text-align: center;
    margin: 0 0 8px 0;
  }

  .login-subtitle {
    text-align: center;
    color: #888;
    font-size: 14px;
    font-weight: 300;
    margin: 0 0 36px 0;
    line-height: 1.5;
  }

  .input-group {
    margin-bottom: 16px;
    position: relative;
  }

  .input-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }

  .login-input {
    width: 100%;
    padding: 14px 18px;
    border: 1.5px solid #eee;
    border-radius: 14px;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a2e;
    background: #fafafa;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    box-sizing: border-box;
    outline: none;
  }

  .login-input::placeholder {
    color: #bbb;
    font-weight: 300;
  }

  .login-input:focus {
    border-color: #d63384;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(214, 51, 132, 0.08);
  }

  .forgot-link {
    display: block;
    text-align: right;
    font-size: 12px;
    color: #d63384;
    text-decoration: none;
    margin-top: 6px;
    transition: opacity 0.2s;
  }

  .forgot-link:hover {
    opacity: 0.75;
  }

  .login-btn {
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
    margin-top: 24px;
    transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    box-shadow: 0 4px 18px rgba(214, 51, 132, 0.30);
    letter-spacing: 0.02em;
  }

  .login-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(214, 51, 132, 0.38);
  }

  .login-btn:active {
    transform: translateY(0);
    opacity: 0.9;
  }

  .login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    color: #ccc;
    font-size: 12px;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #eee;
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

  .register-text {
    text-align: center;
    font-size: 14px;
    color: #999;
    margin-top: 24px;
    margin-bottom: 0;
  }

  .register-link {
    color: #d63384;
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }

  .register-link:hover {
    opacity: 0.75;
    text-decoration: underline;
  }

  .nail-dots {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 28px;
  }

  .nail-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hata, setHata] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin() {
    if (!email || !password) {
      setHata("Lütfen e-posta ve şifrenizi girin.");
      return;
    }
    setLoading(true);
    setHata("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      const mesajlar = {
        "auth/user-not-found": "Bu e-posta ile kayıtlı bir hesap bulunamadı.",
        "auth/wrong-password": "Şifreniz hatalı. Lütfen tekrar deneyin.",
        "auth/invalid-email": "Geçersiz e-posta adresi.",
        "auth/too-many-requests": "Çok fazla deneme. Lütfen biraz bekleyin.",
      };
      setHata(mesajlar[err.code] || "Giriş başarısız. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleLogin();
  }

  return (
    <>
      <style>{styles}</style>
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">
            <span className="login-logo-icon">💅</span>
            <span className="login-logo-text">Naily</span>
          </div>

          <div className="nail-dots">
            {["#e83e8c", "#f06292", "#ce93d8", "#ab47bc", "#f48fb1"].map(
              (c, i) => (
                <div key={i} className="nail-dot" style={{ background: c }} />
              ),
            )}
          </div>

          <h1 className="login-title">Hoş Geldin ✨</h1>
          <p className="login-subtitle">
            Tırnak tasarımlarını keşfetmek için giriş yap
          </p>

          {hata && (
            <div className="error-msg">
              <span>⚠️</span> {hata}
            </div>
          )}

          <div className="input-group">
            <label className="input-label">E-posta</label>
            <input
              className="login-input"
              type="email"
              placeholder="ornek@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Şifre</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <a href="/forgot-password" className="forgot-link">
              Şifremi unuttum
            </a>
          </div>

          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
          </button>

          <p className="register-text">
            Hesabın yok mu?{" "}
            <Link to="/register" className="register-link">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
