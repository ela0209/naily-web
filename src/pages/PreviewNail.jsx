import { useRef, useState, useEffect } from "react";


const NAIL_TIPS = [4, 8, 12, 16, 20];

const RENKLER = [
  { ad: "Kırmızı", kod: "#e74c3c" },
  { ad: "Koyu Kırmızı", kod: "#c0392b" },
  { ad: "Pembe", kod: "#ff69b4" },
  { ad: "Açık Pembe", kod: "#ffb6c1" },
  { ad: "Mor", kod: "#9b59b6" },
  { ad: "Lila", kod: "#c39bd3" },
  { ad: "Lacivert", kod: "#2c3e50" },
  { ad: "Turkuaz", kod: "#1abc9c" },
  { ad: "Yeşil", kod: "#27ae60" },
  { ad: "Nude", kod: "#c9956c" },
  { ad: "Bej", kod: "#f5deb3" },
  { ad: "Beyaz", kod: "#f8f8f8" },
  { ad: "Siyah", kod: "#1a1a1a" },
  { ad: "Altın", kod: "#f1c40f" },
  { ad: "Gümüş", kod: "#bdc3c7" },
];

const SEKILLER = ["Oval", "Kare", "Badem", "Stiletto"];
const EFEKTLER = ["Normal", "Mat", "Simli", "Fransız"];

const TIRNAK_POZISYONLARI = [
  { id: 0, ad: "Baş Parmak", cx: 156, cy: 342, w: 44, h: 30, aci: -28 },
  { id: 1, ad: "İşaret", cx: 262, cy: 168, w: 40, h: 28, aci: -6 },
  { id: 2, ad: "Orta", cx: 348, cy: 138, w: 42, h: 28, aci: 0 },
  { id: 3, ad: "Yüzük", cx: 432, cy: 158, w: 40, h: 28, aci: 6 },
  { id: 4, ad: "Serçe", cx: 508, cy: 212, w: 32, h: 22, aci: 14 },
];

const EL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <radialGradient id="palmGrad" cx="50%" cy="60%" r="55%">
      <stop offset="0%" stop-color="#f9d4a8"/>
      <stop offset="100%" stop-color="#f0b882"/>
    </radialGradient>
    <radialGradient id="fingerGrad" cx="40%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#fce0b8"/>
      <stop offset="100%" stop-color="#f0b882"/>
    </radialGradient>
    <filter id="softShadow">
      <feDropShadow dx="2" dy="4" stdDeviation="6" flood-color="rgba(180,120,60,0.25)"/>
    </filter>
  </defs>
  <rect width="800" height="600" fill="#fdf6f0"/>

  <!-- Avuç içi -->
  <ellipse cx="340" cy="490" rx="155" ry="105" fill="url(#palmGrad)" filter="url(#softShadow)"/>

  <!-- Baş parmak -->
  <g transform="rotate(-28,156,420)">
    <rect x="124" y="340" width="64" height="130" rx="32" fill="url(#fingerGrad)"/>
  </g>

  <!-- İşaret parmağı -->
  <g transform="rotate(-6,262,310)">
    <rect x="234" y="155" width="56" height="175" rx="28" fill="url(#fingerGrad)"/>
  </g>

  <!-- Orta parmak -->
  <g transform="rotate(0,348,300)">
    <rect x="319" y="120" width="58" height="195" rx="29" fill="url(#fingerGrad)"/>
  </g>

  <!-- Yüzük parmağı -->
  <g transform="rotate(6,432,310)">
    <rect x="404" y="140" width="56" height="180" rx="28" fill="url(#fingerGrad)"/>
  </g>

  <!-- Serçe parmak -->
  <g transform="rotate(14,508,340)">
    <rect x="482" y="195" width="44" height="155" rx="22" fill="url(#fingerGrad)"/>
  </g>

  <!-- Parmak eklem çizgileri — baş parmak -->
  <g transform="rotate(-28,156,420)" opacity="0.12">
    <line x1="124" y1="415" x2="188" y2="415" stroke="#8b6040" stroke-width="1.5"/>
    <line x1="124" y1="455" x2="188" y2="455" stroke="#8b6040" stroke-width="1.5"/>
  </g>

  <!-- Parmak eklem çizgileri — işaret -->
  <g transform="rotate(-6,262,310)" opacity="0.12">
    <line x1="234" y1="245" x2="290" y2="245" stroke="#8b6040" stroke-width="1.5"/>
    <line x1="234" y1="290" x2="290" y2="290" stroke="#8b6040" stroke-width="1.5"/>
  </g>

  <!-- Parmak eklem çizgileri — orta -->
  <g transform="rotate(0,348,300)" opacity="0.12">
    <line x1="319" y1="225" x2="377" y2="225" stroke="#8b6040" stroke-width="1.5"/>
    <line x1="319" y1="272" x2="377" y2="272" stroke="#8b6040" stroke-width="1.5"/>
  </g>

  <!-- Parmak eklem çizgileri — yüzük -->
  <g transform="rotate(6,432,310)" opacity="0.12">
    <line x1="404" y1="238" x2="460" y2="238" stroke="#8b6040" stroke-width="1.5"/>
    <line x1="404" y1="282" x2="460" y2="282" stroke="#8b6040" stroke-width="1.5"/>
  </g>

  <!-- Parmak eklem çizgileri — serçe -->
  <g transform="rotate(14,508,340)" opacity="0.12">
    <line x1="482" y1="284" x2="526" y2="284" stroke="#8b6040" stroke-width="1.5"/>
    <line x1="482" y1="320" x2="526" y2="320" stroke="#8b6040" stroke-width="1.5"/>
  </g>

  <!-- Avuç üstü parlaklık -->
  <ellipse cx="310" cy="440" rx="80" ry="50" fill="rgba(255,255,255,0.12)"/>
</svg>`;

function tirnaKYolu(ctx, w, h, sekil) {
  ctx.beginPath();
  if (sekil === "Kare") {
    const r = w * 0.12;
    ctx.moveTo(-w / 2 + r, -h / 2);
    ctx.lineTo(w / 2 - r, -h / 2);
    ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + r, r);
    ctx.lineTo(w / 2, h / 2 - r);
    ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    ctx.lineTo(-w / 2 + r, h / 2);
    ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    ctx.lineTo(-w / 2, -h / 2 + r);
    ctx.arcTo(-w / 2, -h / 2, -w / 2 + r, -h / 2, r);
  } else if (sekil === "Stiletto") {
    ctx.moveTo(-w / 2, h / 2);
    ctx.quadraticCurveTo(-w / 2, -h * 0.1, 0, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h * 0.1, w / 2, h / 2);
    ctx.quadraticCurveTo(0, h / 2 + h * 0.05, -w / 2, h / 2);
  } else if (sekil === "Badem") {
    ctx.moveTo(-w / 2, h / 2 - h * 0.1);
    ctx.quadraticCurveTo(-w / 2, -h * 0.05, 0, -h / 2);
    ctx.quadraticCurveTo(w / 2, -h * 0.05, w / 2, h / 2 - h * 0.1);
    ctx.quadraticCurveTo(0, h / 2 + h * 0.04, -w / 2, h / 2 - h * 0.1);
  } else {
    // Oval — gerçekçi tırnak şekli
    ctx.moveTo(-w / 2, h / 2 - h * 0.15);
    ctx.quadraticCurveTo(-w / 2, -h * 0.05, -w * 0.35, -h / 2 + h * 0.12);
    ctx.quadraticCurveTo(0, -h / 2 - h * 0.04, w * 0.35, -h / 2 + h * 0.12);
    ctx.quadraticCurveTo(w / 2, -h * 0.05, w / 2, h / 2 - h * 0.15);
    ctx.quadraticCurveTo(0, h / 2 + h * 0.04, -w / 2, h / 2 - h * 0.15);
  }
  ctx.closePath();
}

function tirnaKCiz(ctx, cx, cy, w, h, aci, sekil, renk, efekt) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((aci * Math.PI) / 180);
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.shadowOffsetX = 1;

  let grad;
  if (efekt === "Fransız") {
    grad = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
    grad.addColorStop(0, "#fff8f8");
    grad.addColorStop(0.55, "#fff8f8");
    grad.addColorStop(0.56, renk);
    grad.addColorStop(1, renk);
  } else if (efekt === "Mat") {
    grad = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
    grad.addColorStop(0, renk + "cc");
    grad.addColorStop(1, renk + "ee");
  } else if (efekt === "Simli") {
    grad = ctx.createLinearGradient(-w / 2, h / 2, w / 2, -h / 2);
    grad.addColorStop(0, renk);
    grad.addColorStop(0.4, "#ffffff99");
    grad.addColorStop(0.7, renk);
    grad.addColorStop(1, renk + "cc");
  } else {
    // Normal — soldan sağa parlama
    grad = ctx.createLinearGradient(-w * 0.4, 0, w * 0.4, 0);
    grad.addColorStop(0, renk + "cc");
    grad.addColorStop(0.3, "#ffffffaa");
    grad.addColorStop(0.55, renk + "ee");
    grad.addColorStop(1, renk + "bb");
  }

  tirnaKYolu(ctx, w, h, sekil);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Üst parlama — tırnağın üst ortasında
  if (efekt !== "Mat") {
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.1, w * 0.22, h * 0.13, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
  }

  // Simli efekt için parıltılar
  if (efekt === "Simli") {
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(
        (Math.random() - 0.5) * w * 0.8,
        (Math.random() - 0.5) * h * 0.8,
        Math.random() * 1.5 + 0.5,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();
    }
  }

  // Kenar çizgisi
  tirnaKYolu(ctx, w, h, sekil);
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.restore();
}

export default function PreviewNail() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);
  const handsRef = useRef(null);
  // canliNoktalar'ı ref olarak da tut — closure sorunundan kaçınmak için
  const canliNoktalarRef = useRef([]);

  const [mod, setMod] = useState("hazir");
  const [imgObj, setImgObj] = useState(null);
  const [seciliRenk, setSeciliRenk] = useState("#ff69b4");
  const [sekil, setSekil] = useState("Oval");
  const [efekt, setEfekt] = useState("Normal");
  const [boyaliTirnaklar, setBoyaliTirnaklar] = useState({});
  const [fotoNoktalar, setFotoNoktalar] = useState([]);
  const [ozelRenk, setOzelRenk] = useState("#ff69b4");

  const [kameraAcik, setKameraAcik] = useState(false);
  const [kameraListesi, setKameraListesi] = useState([]);
  const [seciliKamera, setSeciliKamera] = useState("");
  const [kameraHata, setKameraHata] = useState("");
  const [kameraYukleniyor, setKameraYukleniyor] = useState(false);
  const [canliNoktalar, setCanliNoktalar] = useState([]);

  // seciliRenk, sekil, efekt değişince ref'leri güncelle (closure fix)
  const seciliRenkRef = useRef(seciliRenk);
  const sekilRef = useRef(sekil);
  const efektRef = useRef(efekt);
  useEffect(() => {
    seciliRenkRef.current = seciliRenk;
  }, [seciliRenk]);
  useEffect(() => {
    sekilRef.current = sekil;
  }, [sekil]);
  useEffect(() => {
    efektRef.current = efekt;
  }, [efekt]);

  // MediaPipe başlat — CDN üzerinden dinamik yükleme (production uyumlu)
  useEffect(() => {
    const CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915";

    function initHands() {
      const hands = new window.Hands({
        locateFile: (f) => `${CDN}/${f}`,
      });
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      hands.onResults((results) => {
        if (results.multiHandLandmarks?.length > 0) {
          const lm = results.multiHandLandmarks[0];
          const canvas = canvasRef.current;
          if (!canvas) return;
          const pts = NAIL_TIPS.map((idx) => ({
            x: lm[idx].x * canvas.width,
            y: lm[idx].y * canvas.height,
            renk: seciliRenkRef.current,
            sekil: sekilRef.current,
            efekt: efektRef.current,
            boyut: canvas.width * 0.045,
          }));
          canliNoktalarRef.current = pts;
          setCanliNoktalar(pts);
          setFotoNoktalar(pts);
        }
      });
      handsRef.current = hands;
    }

    if (window.Hands) {
      initHands();
    } else {
      const script = document.createElement("script");
      script.src = `${CDN}/hands.js`;
      script.onload = initHands;
      document.head.appendChild(script);
    }

    return () => {
      handsRef.current?.close?.();
    };
  }, []); // boş dependency — sadece bir kere başlat

  async function kameralariGetir() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === "videoinput");
      setKameraListesi(videos);
      if (videos.length > 0 && !seciliKamera)
        setSeciliKamera(videos[0].deviceId);
      return videos;
    } catch (e) {
      setKameraHata("Kamera erişim izni verilmedi.");
      return [];
    }
  }

  async function kameraAc() {
    setKameraHata("");
    setKameraYukleniyor(true);
    try {
      const liste =
        kameraListesi.length > 0 ? kameraListesi : await kameralariGetir();
      if (liste.length === 0) {
        setKameraYukleniyor(false);
        return;
      }

      const constraints = {
        video: seciliKamera
          ? { deviceId: { exact: seciliKamera } }
          : { facingMode: "environment" },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
        // Önce state'i güncelle, sonra döngüyü setTimeout ile başlat
        setKameraAcik(true);
        setKameraYukleniyor(false);
        setTimeout(() => canliDongu(), 150);
      };
    } catch (e) {
      setKameraHata(`Kamera açılamadı: ${e.message}`);
      setKameraYukleniyor(false);
    }
  }

  function kameraKapat() {
    const video = videoRef.current;
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setKameraAcik(false);
    setCanliNoktalar([]);
    canliNoktalarRef.current = [];
  }

  function canliDongu() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !handsRef.current) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    async function frame() {
      if (!videoRef.current?.srcObject) return;
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-canvas.width, 0);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      await handsRef.current.send({ image: canvas });

      // State yerine ref kullan — closure sorunu olmaz
      canliNoktalarRef.current.forEach(
        ({ x, y, renk: r, sekil: s, efekt: ef, boyut }) => {
          tirnaKCiz(ctx, x, y, boyut, boyut * 1.4, 0, s, r, ef);
        },
      );

      animFrameRef.current = requestAnimationFrame(frame);
    }
    frame();
  }

  useEffect(() => {
    if (mod === "kamera") {
      kameralariGetir();
    } else {
      kameraKapat();
    }
  }, [mod]);

  // Hazır el çizimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mod !== "hazir") return;
    const ctx = canvas.getContext("2d");
    canvas.width = 800;
    canvas.height = 600;
    const svgBlob = new Blob([EL_SVG], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, 800, 600);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      TIRNAK_POZISYONLARI.forEach((t) => {
        if (boyaliTirnaklar[t.id]) {
          const { renk, sekil: s, efekt: e } = boyaliTirnaklar[t.id];
          tirnaKCiz(ctx, t.cx, t.cy, t.w, t.h, t.aci, s, renk, e);
        }
      });
    };
    img.src = url;
  }, [mod, boyaliTirnaklar]);

  // Fotoğraf çizimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mod !== "foto" || !imgObj) return;
    const ctx = canvas.getContext("2d");
    canvas.width = imgObj.naturalWidth;
    canvas.height = imgObj.naturalHeight;
    ctx.drawImage(imgObj, 0, 0);
    fotoNoktalar.forEach(({ x, y, renk, sekil: s, efekt: e, boyut }) => {
      tirnaKCiz(ctx, x, y, boyut, boyut * 1.4, 0, s, renk, e);
    });
  }, [mod, fotoNoktalar, imgObj]);

  function handleHazirTikla(e) {
    if (mod !== "hazir") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    let enYakin = null,
      enYakinMesafe = 999;
    TIRNAK_POZISYONLARI.forEach((t) => {
      const d = Math.sqrt((mx - t.cx) ** 2 + (my - t.cy) ** 2);
      if (d < enYakinMesafe) {
        enYakinMesafe = d;
        enYakin = t;
      }
    });
    if (enYakin && enYakinMesafe < 80) {
      setBoyaliTirnaklar((prev) => ({
        ...prev,
        [enYakin.id]: { renk: seciliRenk, sekil, efekt },
      }));
    }
  }

  function handleFotoTikla(e) {
    if (mod !== "foto" || !imgObj) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    setFotoNoktalar((prev) => [
      ...prev,
      { x, y, renk: seciliRenk, sekil, efekt, boyut: canvas.width * 0.05 },
    ]);
  }

  function handleResimYukle(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target.result;
      img.onload = async () => {
        setImgObj(img);
        setFotoNoktalar([]);
        if (handsRef.current) await handsRef.current.send({ image: img });
      };
    };
    reader.readAsDataURL(file);
  }

  function tumunuBoya() {
    const yeni = {};
    TIRNAK_POZISYONLARI.forEach((t) => {
      yeni[t.id] = { renk: seciliRenk, sekil, efekt };
    });
    setBoyaliTirnaklar(yeni);
  }

  function handleSifirla() {
    setBoyaliTirnaklar({});
    setFotoNoktalar([]);
    setCanliNoktalar([]);
    canliNoktalarRef.current = [];
  }

  function handleIndir() {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "naily-tirnak.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  const MODLAR = [
    {
      key: "hazir",
      label: "🖐 Hazır Model",
      aciklama: "Hazır el modeline uygula",
    },
    {
      key: "foto",
      label: "📸 Fotoğrafım",
      aciklama: "Kendi elinin fotoğrafını yükle",
    },
    {
      key: "kamera",
      label: "📷 Canlı Kamera",
      aciklama: "Kameranla gerçek zamanlı dene",
    },
  ];

  // Canvas'ın görünür olup olmadığını belirle
  const canvasGorunur =
    mod === "hazir" ||
    (mod === "foto" && imgObj) ||
    (mod === "kamera" && kameraAcik);

  return (
    <div style={s.page}>
      <style>{CSS}</style>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.blob1} />
        <div style={s.blob2} />
        <div style={s.heroContent}>
          <div style={s.heroMain}>
            <div style={s.avatar}>
              <span style={{ fontSize: 32 }}>💅</span>
            </div>
            <div>
              <p style={s.heroEtiket}>Sanal Deneme</p>
              <h1 style={s.heroBaslik}>Tırnak Önizleme</h1>
              <p style={s.heroAlt}>Renk, şekil ve efekti gerçek zamanlı dene</p>
            </div>
          </div>
        </div>
      </section>

      <div style={s.icerik}>
        {/* Mod seçici */}
        <div style={s.modRow}>
          {MODLAR.map((m) => (
            <button
              key={m.key}
              onClick={() => setMod(m.key)}
              className={`mod-btn ${mod === m.key ? "aktif" : ""}`}
              style={{ ...s.modBtn, ...(mod === m.key ? s.modBtnAktif : {}) }}
            >
              <span style={{ fontSize: 18 }}>{m.label.split(" ")[0]}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {m.label.split(" ").slice(1).join(" ")}
              </span>
              <span style={{ fontSize: 11, opacity: 0.7, fontWeight: 400 }}>
                {m.aciklama}
              </span>
            </button>
          ))}
        </div>

        <div style={s.anaGrid}>
          {/* Sol panel */}
          <div style={s.solPanel}>
            {/* Renk */}
            <div style={s.panelKart}>
              <h3 style={s.panelBaslik}>🎨 Renk</h3>
              <div style={s.renkGrid}>
                {RENKLER.map((r) => (
                  <div
                    key={r.kod}
                    onClick={() => setSeciliRenk(r.kod)}
                    className="renk-top"
                    title={r.ad}
                    style={{
                      ...s.renkTop,
                      background: r.kod,
                      boxShadow:
                        seciliRenk === r.kod
                          ? `0 0 0 3px white, 0 0 0 5px ${r.kod}`
                          : "none",
                      transform:
                        seciliRenk === r.kod ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
                <div
                  style={{ ...s.renkTop, overflow: "hidden", padding: 0 }}
                  title="Özel Renk"
                >
                  <input
                    type="color"
                    value={ozelRenk}
                    onChange={(e) => {
                      setOzelRenk(e.target.value);
                      setSeciliRenk(e.target.value);
                    }}
                    style={{
                      width: "200%",
                      height: "200%",
                      margin: "-50%",
                      cursor: "pointer",
                      border: "none",
                    }}
                  />
                </div>
              </div>
              <div style={s.seciliRenkGoster}>
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    background: seciliRenk,
                    border: "2px solid rgba(0,0,0,0.1)",
                  }}
                />
                <span style={{ fontSize: 12, color: "#6b6278" }}>
                  Seçili: {seciliRenk}
                </span>
              </div>
            </div>

            {/* Şekil */}
            <div style={s.panelKart}>
              <h3 style={s.panelBaslik}>✦ Şekil</h3>
              <div style={s.chipRow}>
                {SEKILLER.map((sv) => (
                  <button
                    key={sv}
                    onClick={() => setSekil(sv)}
                    style={{ ...s.chip, ...(sekil === sv ? s.chipAktif : {}) }}
                    className="chip-btn"
                  >
                    {sv}
                  </button>
                ))}
              </div>
            </div>

            {/* Efekt */}
            <div style={s.panelKart}>
              <h3 style={s.panelBaslik}>✨ Efekt</h3>
              <div style={s.chipRow}>
                {EFEKTLER.map((ef) => (
                  <button
                    key={ef}
                    onClick={() => setEfekt(ef)}
                    style={{ ...s.chip, ...(efekt === ef ? s.chipAktif : {}) }}
                    className="chip-btn"
                  >
                    {ef}
                  </button>
                ))}
              </div>
            </div>

            {/* Aksiyonlar */}
            <div style={s.panelKart}>
              <h3 style={s.panelBaslik}>⚡ İşlemler</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mod === "hazir" && (
                  <button
                    onClick={tumunuBoya}
                    style={s.aksiyon1}
                    className="aksiyon-btn"
                  >
                    ✨ Tümüne Uygula
                  </button>
                )}
                <button
                  onClick={handleSifirla}
                  style={s.aksiyon2}
                  className="aksiyon-btn2"
                >
                  🔄 Sıfırla
                </button>
                <button
                  onClick={handleIndir}
                  style={s.aksiyon1}
                  className="aksiyon-btn"
                >
                  💾 PNG İndir
                </button>
              </div>
            </div>
          </div>

          {/* Sağ — canvas alanı */}
          <div style={s.sagPanel}>
            {/* Kamera modu kontrolleri */}
            {mod === "kamera" && (
              <div style={s.kameraKontrol}>
                {kameraListesi.length > 0 && (
                  <div style={s.kameraSecimRow}>
                    <label style={s.kameraLabel}>📷 Kamera Seç</label>
                    <select
                      value={seciliKamera}
                      onChange={(e) => {
                        setSeciliKamera(e.target.value);
                        if (kameraAcik) {
                          kameraKapat();
                          setTimeout(kameraAc, 300);
                        }
                      }}
                      style={s.kameraSelect}
                    >
                      {kameraListesi.map((k) => (
                        <option key={k.deviceId} value={k.deviceId}>
                          {k.label || `Kamera ${kameraListesi.indexOf(k) + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {kameraHata && <div style={s.hataBant}>⚠️ {kameraHata}</div>}
                <button
                  onClick={kameraAcik ? kameraKapat : kameraAc}
                  disabled={kameraYukleniyor}
                  style={{ ...s.aksiyon1, opacity: kameraYukleniyor ? 0.7 : 1 }}
                  className="aksiyon-btn"
                >
                  {kameraYukleniyor
                    ? "⏳ Bağlanıyor..."
                    : kameraAcik
                      ? "⏹ Kamerayı Kapat"
                      : "▶ Kamerayı Aç"}
                </button>
              </div>
            )}

            {/* Fotoğraf yükleme */}
            {mod === "foto" && !imgObj && (
              <label style={s.yukleAlani} className="yukle-alani">
                <span style={{ fontSize: 44 }}>📁</span>
                <span
                  style={{ fontSize: 15, fontWeight: 600, color: "#4a4458" }}
                >
                  Fotoğraf Seç
                </span>
                <span style={{ fontSize: 12, color: "#8b829a" }}>
                  JPG, PNG desteklenir
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleResimYukle}
                  style={{ display: "none" }}
                />
              </label>
            )}

            {/* Video — her zaman gizli, sadece kaynak */}
            <video
              ref={videoRef}
              style={{ display: "none" }}
              playsInline
              muted
            />

            {/* ✅ DÜZELTME: Canvas her zaman DOM'da — sadece display değişiyor */}
            <canvas
              ref={canvasRef}
              onClick={
                mod === "hazir"
                  ? handleHazirTikla
                  : mod === "foto"
                    ? handleFotoTikla
                    : undefined
              }
              style={{
                ...s.canvas,
                cursor: mod === "kamera" ? "default" : "pointer",
                display: canvasGorunur ? "block" : "none",
              }}
            />

            {/* Kamera kapalıysa placeholder */}
            {mod === "kamera" && !kameraAcik && !kameraYukleniyor && (
              <div style={s.placeholder}>
                <span style={{ fontSize: 52 }}>📷</span>
                <p
                  style={{
                    fontWeight: 600,
                    color: "#4a4458",
                    margin: "12px 0 4px",
                  }}
                >
                  Kamera Hazır
                </p>
                <p style={{ fontSize: 13, color: "#8b829a", margin: 0 }}>
                  {kameraListesi.length > 0
                    ? `${kameraListesi.length} kamera bulundu — yukarıdan seçip "Kamerayı Aç" butonuna basın`
                    : "Kamera listesi yükleniyor..."}
                </p>
              </div>
            )}

            {mod === "hazir" && (
              <p style={s.ipucu}>💡 Tırnağa tıklayarak boyayabilirsin</p>
            )}
            {mod === "foto" && imgObj && (
              <p style={s.ipucu}>
                💡 Tırnakların üstüne tıklayarak boyayabilirsin
              </p>
            )}
            {mod === "kamera" && kameraAcik && (
              <p style={s.ipucu}>
                💡 Elini kameraya tut — yapay zeka tırnaklarını otomatik bulur
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin { to{transform:rotate(360deg)} }

  .mod-btn { transition:all 0.22s; cursor:pointer; }
  .mod-btn:hover { background:rgba(155,114,207,0.04)!important; }
  .mod-btn.aktif { border:1.5px solid rgba(232,99,140,0.25)!important; }

  .renk-top { transition:all 0.18s; cursor:pointer; }
  .renk-top:hover { transform:scale(1.18)!important; }

  .chip-btn { transition:all 0.18s; cursor:pointer; }
  .chip-btn:hover { color:#9b72cf!important; }

  .aksiyon-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,99,140,0.35)!important; }
  .aksiyon-btn2:hover { color:#9b72cf!important; }

  .yukle-alani:hover { background:rgba(155,114,207,0.04)!important; }
`;

const s = {
  page: {
    fontFamily: "'Outfit',sans-serif",
    background: "#faf8f5",
    minHeight: "100vh",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    background: "linear-gradient(160deg,#ffffff 0%,#faf8f5 50%,#f3eeff 100%)",
    borderBottom: "1px solid #ede8e0",
    padding: "40px 24px 36px",
  },
  blob1: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(232,99,140,0.07) 0%,transparent 70%)",
    top: -200,
    right: -100,
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background:
      "radial-gradient(circle,rgba(155,114,207,0.08) 0%,transparent 70%)",
    bottom: -100,
    left: -80,
    pointerEvents: "none",
  },
  heroContent: {
    position: "relative",
    zIndex: 1,
    maxWidth: 1100,
    margin: "0 auto",
  },
  heroMain: { display: "flex", alignItems: "center", gap: 20 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 18,
    background: "linear-gradient(135deg,#fdeef4,#f3eeff)",
    border: "2px solid rgba(232,99,140,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 16px rgba(155,114,207,0.14)",
  },
  heroEtiket: {
    fontSize: 12,
    fontWeight: 600,
    color: "#e8638c",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    margin: "0 0 4px",
  },
  heroBaslik: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: "clamp(24px,4vw,36px)",
    fontWeight: 700,
    color: "#1a1625",
    margin: "0 0 6px",
    lineHeight: 1.15,
  },
  heroAlt: { fontSize: 13, color: "#8b829a", margin: 0 },

  icerik: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" },

  modRow: { display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" },
  modBtn: {
    flex: "1 1 160px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "16px 12px",
    borderRadius: 16,
    border: "1.5px solid #e8e2d9",
    background: "white",
    fontFamily: "'Outfit',sans-serif",
    color: "#4a4458",
    boxShadow: "0 2px 10px rgba(155,114,207,0.06)",
    cursor: "pointer",
  },
  modBtnAktif: {
    background: "linear-gradient(135deg,#fdeef4,#f3eeff)",
    border: "1.5px solid rgba(232,99,140,0.2)",
    color: "#1a1625",
  },

  anaGrid: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 24,
    alignItems: "start",
  },

  solPanel: { display: "flex", flexDirection: "column", gap: 14 },
  panelKart: {
    background: "white",
    borderRadius: 18,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "18px 20px",
    boxShadow: "0 2px 12px rgba(155,114,207,0.07)",
  },
  panelBaslik: {
    fontFamily: "'Cormorant Garamond',serif",
    fontSize: 17,
    fontWeight: 700,
    color: "#1a1625",
    margin: "0 0 14px",
  },

  renkGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(6,1fr)",
    gap: 8,
    marginBottom: 10,
  },
  renkTop: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    transition: "all 0.18s",
  },
  seciliRenkGoster: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },

  chipRow: { display: "flex", flexWrap: "wrap", gap: 7 },
  chip: {
    fontFamily: "'Outfit',sans-serif",
    padding: "6px 14px",
    borderRadius: 20,
    border: "1.5px solid #e8e2d9",
    background: "white",
    fontSize: 12,
    fontWeight: 500,
    color: "#4a4458",
    cursor: "pointer",
  },
  chipAktif: {
    background: "linear-gradient(135deg,#e8638c,#9b72cf)",
    color: "white",
    border: "1.5px solid transparent",
    fontWeight: 600,
    boxShadow: "0 3px 12px rgba(232,99,140,0.25)",
  },

  aksiyon1: {
    fontFamily: "'Outfit',sans-serif",
    width: "100%",
    padding: "11px 16px",
    background: "linear-gradient(135deg,#e8638c,#9b72cf)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(232,99,140,0.24)",
    transition: "all 0.22s",
  },
  aksiyon2: {
    fontFamily: "'Outfit',sans-serif",
    width: "100%",
    padding: "11px 16px",
    background: "white",
    color: "#6b6278",
    border: "1.5px solid #e8e2d9",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.22s",
  },

  sagPanel: { display: "flex", flexDirection: "column", gap: 16 },

  kameraKontrol: {
    background: "white",
    borderRadius: 18,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "18px 20px",
    boxShadow: "0 2px 12px rgba(155,114,207,0.07)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  kameraSecimRow: { display: "flex", flexDirection: "column", gap: 6 },
  kameraLabel: { fontSize: 13, fontWeight: 600, color: "#4a4458" },
  kameraSelect: {
    fontFamily: "'Outfit',sans-serif",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1.5px solid #e8e2d9",
    fontSize: 13,
    color: "#1a1625",
    background: "#faf8f5",
    outline: "none",
    cursor: "pointer",
  },
  hataBant: {
    background: "rgba(232,99,140,0.08)",
    border: "1px solid rgba(232,99,140,0.2)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#9f1239",
  },

  yukleAlani: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "56px 24px",
    borderRadius: 20,
    border: "2px dashed rgba(155,114,207,0.25)",
    background: "white",
    cursor: "pointer",
    transition: "all 0.22s",
    minHeight: 240,
  },

  canvas: {
    maxWidth: "100%",
    borderRadius: 20,
    boxShadow: "0 4px 32px rgba(155,114,207,0.12)",
    border: "1px solid rgba(232,99,140,0.08)",
  },

  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    background: "white",
    borderRadius: 20,
    border: "1px solid rgba(232,99,140,0.08)",
    padding: "48px 24px",
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(155,114,207,0.07)",
  },

  ipucu: {
    fontSize: 12,
    color: "#8b829a",
    textAlign: "center",
    margin: "8px 0 0",
    fontStyle: "italic",
  },
};