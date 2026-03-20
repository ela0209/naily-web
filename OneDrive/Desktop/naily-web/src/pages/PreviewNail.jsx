import { useRef, useState, useEffect } from "react";

// ── Renkler ──────────────────────────────────────────────
const RENKLER = [
  { ad: "Kırmızı",      kod: "#e74c3c" },
  { ad: "Koyu Kırmızı", kod: "#c0392b" },
  { ad: "Pembe",        kod: "#ff69b4" },
  { ad: "Açık Pembe",   kod: "#ffb6c1" },
  { ad: "Mor",          kod: "#9b59b6" },
  { ad: "Leylak",       kod: "#c39bd3" },
  { ad: "Lacivert",     kod: "#2c3e50" },
  { ad: "Mavi",         kod: "#3498db" },
  { ad: "Turkuaz",      kod: "#1abc9c" },
  { ad: "Yeşil",        kod: "#2ecc71" },
  { ad: "Nude",         kod: "#c9956c" },
  { ad: "Bej",          kod: "#f5e6d3" },
  { ad: "Beyaz",        kod: "#f5f5f5" },
  { ad: "Siyah",        kod: "#1a1a1a" },
  { ad: "Altın",        kod: "#f1c40f" },
  { ad: "Gümüş",        kod: "#bdc3c7" },
];

const SEKILLER = [
  { id: "oval",     ad: "Oval" },
  { id: "kare",     ad: "Kare" },
  { id: "badem",    ad: "Badem" },
  { id: "stiletto", ad: "Stiletto" },
];

const EFEKTLER = [
  { id: "normal",  ad: "Normal",  emoji: "💅" },
  { id: "mat",     ad: "Mat",     emoji: "🪨" },
  { id: "simli",   ad: "Simli",   emoji: "✨" },
  { id: "fransiz", ad: "Fransız", emoji: "🤍" },
];

// ── Renk yardımcıları ────────────────────────────────────
function lightenColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function darkenColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ── Tırnak Çizici ────────────────────────────────────────
function tirnakCiz(ctx, x, y, r, sekil, renk, efekt) {
  ctx.save();

  const sekilPath = () => {
    ctx.beginPath();
    switch (sekil) {
      case "oval":
        ctx.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2);
        break;
      case "kare":
        ctx.roundRect(x - r * 0.7, y - r, r * 1.4, r * 1.8, r * 0.2);
        break;
      case "badem":
        ctx.moveTo(x - r * 0.6, y + r * 0.5);
        ctx.bezierCurveTo(x - r * 0.7, y - r * 0.2, x - r * 0.3, y - r, x, y - r * 1.2);
        ctx.bezierCurveTo(x + r * 0.3, y - r, x + r * 0.7, y - r * 0.2, x + r * 0.6, y + r * 0.5);
        ctx.bezierCurveTo(x + r * 0.4, y + r * 0.8, x - r * 0.4, y + r * 0.8, x - r * 0.6, y + r * 0.5);
        break;
      case "stiletto":
        ctx.moveTo(x - r * 0.6, y + r * 0.5);
        ctx.bezierCurveTo(x - r * 0.6, y - r * 0.3, x - r * 0.2, y - r * 0.8, x, y - r * 1.5);
        ctx.bezierCurveTo(x + r * 0.2, y - r * 0.8, x + r * 0.6, y - r * 0.3, x + r * 0.6, y + r * 0.5);
        ctx.bezierCurveTo(x + r * 0.4, y + r * 0.8, x - r * 0.4, y + r * 0.8, x - r * 0.6, y + r * 0.5);
        break;
      default:
        ctx.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2);
    }
  };

  sekilPath();

  if (efekt === "fransiz") {
    ctx.fillStyle = "#fff5f0cc";
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fillRect(x - r, y - r * 1.6, r * 2, r * 0.5);
    ctx.fill();
    ctx.restore();
  } else if (efekt === "simli") {
    const grad = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, 0, x, y, r * 1.2);
    grad.addColorStop(0, lightenColor(renk, 60) + "ee");
    grad.addColorStop(0.5, renk + "dd");
    grad.addColorStop(1, darkenColor(renk, 40) + "cc");
    ctx.fillStyle = grad;
    ctx.fill();
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * r * 0.8;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist, Math.random() * 2.5 + 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.8 + 0.2})`;
      ctx.fill();
    }
  } else if (efekt === "mat") {
    ctx.fillStyle = renk + "f0";
    ctx.fill();
  } else {
    const grad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.4, r * 0.05, x, y, r * 1.1);
    grad.addColorStop(0, lightenColor(renk, 50) + "cc");
    grad.addColorStop(0.4, renk + "ee");
    grad.addColorStop(1, darkenColor(renk, 30) + "dd");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x - r * 0.2, y - r * 0.5, r * 0.25, r * 0.12, -0.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
  }

  sekilPath();
  ctx.strokeStyle = darkenColor(renk, 20) + "99";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();
}

// ── Ana Bileşen ──────────────────────────────────────────
export default function PreviewNail() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [kaynak, setKaynak] = useState("dosya");
  const [resim, setResim] = useState(null);
  const [kameraAcik, setKameraAcik] = useState(false);
  const [kameralar, setKameralar] = useState([]); // tüm kamera cihazları
  const [seciliKameraId, setSeciliKameraId] = useState(null);
  const [seciliRenk, setSeciliRenk] = useState("#ff69b4");
  const [ozelRenk, setOzelRenk] = useState("#ff69b4");
  const [seciliSekil, setSeciliSekil] = useState("oval");
  const [seciliEfekt, setSeciliEfekt] = useState("normal");
  const [noktalar, setNoktalar] = useState([]);
  const [mesaj, setMesaj] = useState("");

  // ── Canvas yeniden çiz ───────────────────────────────
  useEffect(() => {
    if (!resim) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = resim;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      noktalar.forEach(({ x, y, renk, sekil, efekt }) => {
        const r = Math.max(canvas.width, canvas.height) * 0.032;
        tirnakCiz(ctx, x, y, r, sekil, renk, efekt);
      });
    };
  }, [resim, noktalar]);

  // ── Kamera cihazlarını listele ───────────────────────
  async function kameralariListele() {
    try {
      // Önce izin al (izin olmadan label bilgisi gelmiyor)
      await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      // Konsola logla — hangisi harici kamera belli olsun
      console.log("=== Bulunan Kameralar ===");
      videoDevices.forEach((d, i) => {
        console.log(`[${i}] ID: ${d.deviceId} | Label: ${d.label}`);
      });

      return videoDevices;
    } catch (err) {
      console.error("Kamera listelenemedi:", err);
      return [];
    }
  }

  // ── Harici kamerayı akıllıca seç ────────────────────
  function hariciKameraSeç(videoDevices) {
    if (videoDevices.length === 0) return null;

    // USB/harici kamera anahtar kelimeleri (büyük/küçük harf duyarsız)
    const hariciAnahtarlar = [
      "usb", "logitech", "external", "webcam", "web cam",
      "c920", "c922", "c930", "brio", "streamcam",
      "hp", "microsoft lifecam", "razer", "elgato",
    ];

    // İsme göre harici kamera ara
    const harici = videoDevices.find((d) =>
      hariciAnahtarlar.some((k) => d.label.toLowerCase().includes(k))
    );

    if (harici) {
      console.log(`✅ Harici kamera bulundu: ${harici.label}`);
      return harici.deviceId;
    }

    // Harici bulunamazsa: birden fazla kamera varsa index 1'i dene
    if (videoDevices.length > 1) {
      console.log(`ℹ️ Harici kamera bulunamadı, index 1 deneniyor: ${videoDevices[1].label}`);
      return videoDevices[1].deviceId;
    }

    // Son çare: tek kamera varsa onu kullan
    console.log(`ℹ️ Tek kamera var, o kullanılıyor: ${videoDevices[0].label}`);
    return videoDevices[0].deviceId;
  }

  // ── Kamera aç ───────────────────────────────────────
  async function kameraAc(deviceId = null) {
    try {
      // Cihaz listesini al
      const videoDevices = await kameralariListele();
      setKameralar(videoDevices);

      // Hangi kamera kullanılacak?
      const hedefId = deviceId || hariciKameraSeç(videoDevices);
      setSeciliKameraId(hedefId);

      // Seçilen kamerayla stream aç
      const constraints = {
        video: hedefId
          ? { deviceId: { exact: hedefId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { width: { ideal: 1280 }, height: { ideal: 720 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setKameraAcik(true);
      setMesaj("");
    } catch (err) {
      console.error("Kamera açılamadı:", err);
      setMesaj("⚠️ Kamera açılamadı: " + err.message);
    }
  }

  // ── Kamera kapat ────────────────────────────────────
  function kameraKapat() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setKameraAcik(false);
    setKameralar([]);
  }

  // ── Fotoğraf çek ────────────────────────────────────
  function fotografCek() {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setResim(canvas.toDataURL("image/png"));
    setNoktalar([]);
    kameraKapat();
  }

  // ── Dosya yükle ─────────────────────────────────────
  function handleResimYukle(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setResim(ev.target.result); setNoktalar([]); };
    reader.readAsDataURL(file);
  }

  // ── Canvas tıklama ──────────────────────────────────
  function handleCanvasTikla(e) {
    if (!resim) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setNoktalar((prev) => [...prev, { x, y, renk: seciliRenk, sekil: seciliSekil, efekt: seciliEfekt }]);
  }

  // ── PNG indir ───────────────────────────────────────
  function indir() {
    const link = document.createElement("a");
    link.download = "naily-onizleme.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setMesaj("✅ İndirildi!");
    setTimeout(() => setMesaj(""), 2000);
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.baslik}>💅 Tırnak Önizleme</h1>
      <p style={styles.aciklama}>Fotoğraf yükle veya kamera kullan, tırnaklarına tıklayarak renk & şekil uygula!</p>

      {/* Kaynak Seçimi */}
      <div style={styles.row}>
        <button
          onClick={() => { setKaynak("dosya"); kameraKapat(); }}
          style={{ ...styles.kaynakBtn, ...(kaynak === "dosya" ? styles.aktif : {}) }}
        >
          📁 Dosya Yükle
        </button>
        <button
          onClick={() => setKaynak("kamera")}
          style={{ ...styles.kaynakBtn, ...(kaynak === "kamera" ? styles.aktif : {}) }}
        >
          📷 Kamera
        </button>
      </div>

      {/* Dosya */}
      {kaynak === "dosya" && (
        <label style={styles.dosyaLabel}>
          📂 Fotoğraf Seç
          <input type="file" accept="image/*" onChange={handleResimYukle} style={{ display: "none" }} />
        </label>
      )}

      {/* Kamera */}
      {kaynak === "kamera" && (
        <div style={styles.kameraBox}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ ...styles.video, display: kameraAcik ? "block" : "none" }}
          />

          {/* Kamera seçici — birden fazla kamera varsa göster */}
          {kameraAcik && kameralar.length > 1 && (
            <div style={styles.kameraSecici}>
              <label style={{ fontSize: 13, color: "#6b7280", marginRight: 8 }}>Kamera:</label>
              <select
                value={seciliKameraId || ""}
                onChange={(e) => { kameraKapat(); setTimeout(() => kameraAc(e.target.value), 300); }}
                style={styles.select}
              >
                {kameralar.map((k, i) => (
                  <option key={k.deviceId} value={k.deviceId}>
                    {k.label || `Kamera ${i + 1}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {!kameraAcik ? (
            <button onClick={() => kameraAc()} style={styles.pinkBtn}>📷 Kamerayı Aç</button>
          ) : (
            <div style={styles.row}>
              <button onClick={fotografCek} style={styles.pinkBtn}>📸 Fotoğraf Çek</button>
              <button onClick={kameraKapat} style={styles.beyazBtn}>✕ Kapat</button>
            </div>
          )}
        </div>
      )}

      {mesaj && <p style={styles.mesaj}>{mesaj}</p>}

      {/* Kontroller */}
      {resim && (
        <>
          {/* Renk */}
          <div style={styles.bolum}>
            <div style={styles.bolumBaslik}>🎨 Renk Seç</div>
            <div style={styles.renkGrid}>
              {RENKLER.map((r) => (
                <div
                  key={r.kod}
                  onClick={() => setSeciliRenk(r.kod)}
                  title={r.ad}
                  style={{
                    ...styles.renkDaire,
                    background: r.kod,
                    border: seciliRenk === r.kod ? "3px solid #111" : "2px solid #ddd",
                    transform: seciliRenk === r.kod ? "scale(1.2)" : "scale(1)",
                  }}
                />
              ))}
              {/* Özel renk */}
              <div style={{ ...styles.renkDaire, background: ozelRenk, border: seciliRenk === ozelRenk ? "3px solid #111" : "2px solid #ddd", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                <input
                  type="color"
                  value={ozelRenk}
                  onChange={(e) => { setOzelRenk(e.target.value); setSeciliRenk(e.target.value); }}
                  style={{ opacity: 0, position: "absolute", inset: 0, cursor: "pointer", width: "100%", height: "100%" }}
                />
                🎨
              </div>
            </div>
            <div style={styles.row}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: seciliRenk, border: "2px solid #e5e7eb" }} />
              <span style={{ fontSize: 12, color: "#6b7280" }}>{seciliRenk}</span>
            </div>
          </div>

          {/* Şekil */}
          <div style={styles.bolum}>
            <div style={styles.bolumBaslik}>✨ Tırnak Şekli</div>
            <div style={styles.row}>
              {SEKILLER.map((s) => (
                <button key={s.id} onClick={() => setSeciliSekil(s.id)}
                  style={{ ...styles.tagBtn, ...(seciliSekil === s.id ? styles.aktif : {}) }}>
                  {s.ad}
                </button>
              ))}
            </div>
          </div>

          {/* Efekt */}
          <div style={styles.bolum}>
            <div style={styles.bolumBaslik}>🖌️ Efekt</div>
            <div style={styles.row}>
              {EFEKTLER.map((e) => (
                <button key={e.id} onClick={() => setSeciliEfekt(e.id)}
                  style={{ ...styles.tagBtn, ...(seciliEfekt === e.id ? styles.aktif : {}) }}>
                  {e.emoji} {e.ad}
                </button>
              ))}
            </div>
          </div>

          {/* Aksiyonlar */}
          <div style={{ ...styles.row, marginBottom: 16 }}>
            <button onClick={() => setNoktalar([])} style={styles.beyazBtn}>🔄 Sıfırla</button>
            <button onClick={indir} style={styles.pinkBtn}>💾 PNG İndir</button>
          </div>
        </>
      )}

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasTikla}
        style={{ ...styles.canvas, display: resim ? "block" : "none" }}
      />

      {!resim && kaynak !== "kamera" && (
        <div style={styles.placeholder}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
          <p style={{ color: "#9ca3af", margin: 0 }}>Fotoğraf yükle veya kamerayı aç</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 720, margin: "0 auto", padding: "40px 20px", fontFamily: "'Segoe UI', sans-serif", textAlign: "center" },
  baslik: { fontSize: 30, fontWeight: 800, color: "#111827", margin: "0 0 8px" },
  aciklama: { color: "#6b7280", fontSize: 15, margin: "0 0 20px" },
  row: { display: "flex", gap: 10, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: 8 },
  kaynakBtn: { padding: "9px 22px", borderRadius: 12, border: "2px solid #e5e7eb", background: "white", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  aktif: { background: "linear-gradient(135deg, #ec4899, #f472b6)", border: "2px solid transparent", color: "white" },
  dosyaLabel: { display: "inline-block", padding: "10px 24px", background: "white", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 14, fontWeight: 600, color: "#374151", cursor: "pointer", marginBottom: 16 },
  kameraBox: { marginBottom: 16 },
  video: { width: "100%", maxWidth: 500, borderRadius: 16, border: "2px solid #fce7f3", marginBottom: 10 },
  kameraSecici: { display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  select: { padding: "6px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, maxWidth: 280 },
  pinkBtn: { padding: "10px 24px", background: "linear-gradient(135deg, #ec4899, #f472b6)", color: "white", border: "none", borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: "pointer" },
  beyazBtn: { padding: "10px 20px", background: "white", border: "2px solid #e5e7eb", borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#374151" },
  mesaj: { fontSize: 14, color: "#ec4899", margin: "8px 0" },
  bolum: { background: "white", borderRadius: 16, padding: "16px 20px", marginBottom: 12, border: "1px solid #f3f4f6", textAlign: "left" },
  bolumBaslik: { fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 12 },
  renkGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  renkDaire: { width: 36, height: 36, borderRadius: "50%", cursor: "pointer", transition: "transform 0.15s", flexShrink: 0 },
  tagBtn: { padding: "7px 16px", borderRadius: 20, border: "2px solid #e5e7eb", background: "white", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  canvas: { maxWidth: "100%", borderRadius: 16, border: "2px solid #fce7f3", margin: "0 auto", cursor: "crosshair" },
  placeholder: { marginTop: 32, padding: 48, border: "2px dashed #fce7f3", borderRadius: 16 },
};