import { useRef, useState, useEffect } from "react";

const NAIL_TIPS = [4, 8, 12, 16, 20];
const NAIL_DIPS = [3, 7, 11, 15, 19];

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

  // Gölge
  ctx.shadowColor = "rgba(0,0,0,0.22)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.shadowOffsetX = 1;

  // Temel renk dolgusu
  tirnaKYolu(ctx, w, h, sekil);
  ctx.fillStyle = renk;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Efekt gradyanı
  let grad;
  if (efekt === "Fransız") {
    grad = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
    grad.addColorStop(0, "#fff8f8");
    grad.addColorStop(0.55, "#fff8f8");
    grad.addColorStop(0.56, renk);
    grad.addColorStop(1, renk);
  } else if (efekt === "Mat") {
    grad = ctx.createLinearGradient(0, h / 2, 0, -h / 2);
    grad.addColorStop(0, renk);
    grad.addColorStop(1, renk);
  } else if (efekt === "Simli") {
    grad = ctx.createLinearGradient(-w / 2, h / 2, w / 2, -h / 2);
    grad.addColorStop(0, renk);
    grad.addColorStop(0.4, "#ffffff");
    grad.addColorStop(0.7, renk);
    grad.addColorStop(1, renk);
  } else {
    grad = ctx.createLinearGradient(-w * 0.4, 0, w * 0.4, 0);
    grad.addColorStop(0, renk);
    grad.addColorStop(0.3, "#ffffff");
    grad.addColorStop(0.55, renk);
    grad.addColorStop(1, renk);
  }

  tirnaKYolu(ctx, w, h, sekil);
  ctx.fillStyle = grad;
  ctx.fill();

  // Parlama efekti (Mat hariç)
  if (efekt !== "Mat") {
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.1, w * 0.22, h * 0.13, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();
  }

  // Simli efekt parıltıları
  if (efekt === "Simli") {
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(
        (Math.random() - 0.5) * w * 0.8,
        (Math.random() - 0.5) * h * 0.8,
        Math.random() * 1.5 + 0.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fill();
    }
  }

  // Gerçekçi kenar çizgisi
  tirnaKYolu(ctx, w, h, sekil);
  ctx.strokeStyle = "rgba(180,140,120,0.18)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Tırnak dibi cilt geçiş efekti
  const skinGrad = ctx.createLinearGradient(0, h / 2, 0, h * 0.1);
  skinGrad.addColorStop(0, "rgba(220,180,160,0.22)");
  skinGrad.addColorStop(1, "rgba(220,180,160,0)");
  tirnaKYolu(ctx, w, h, sekil);
  ctx.fillStyle = skinGrad;
  ctx.fill();

  ctx.restore();
}

export default function PreviewNail() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);
  const handsRef = useRef(null);
  const canliNoktalarRef = useRef([]);
  const elImgRef = useRef(null);

  const [mod, setMod] = useState("hazir");
  const [imgObj, setImgObj] = useState(null);
  const [seciliRenk, setSeciliRenk] = useState("#ff69b4");
  const [sekil, setSekil] = useState("Oval");
  const [efekt, setEfekt] = useState("Normal");
  const [boyaliTirnaklar, setBoyaliTirnaklar] = useState({});
  const [fotoNoktalar, setFotoNoktalar] = useState([]);
  const [ozelRenk, setOzelRenk] = useState("#ff69b4");
  const [hazirNoktalar, setHazirNoktalar] = useState([]);
  const [hazirYuklendi, setHazirYuklendi] = useState(false);
  const [hazirAlgilaniyor, setHazirAlgilaniyor] = useState(true);
  const [fotoMod, setFotoMod] = useState(false);

  const [kameraAcik, setKameraAcik] = useState(false);
  const [kameraListesi, setKameraListesi] = useState([]);
  const [seciliKamera, setSeciliKamera] = useState("");
  const [kameraHata, setKameraHata] = useState("");
  const [kameraYukleniyor, setKameraYukleniyor] = useState(false);
  const [canliNoktalar, setCanliNoktalar] = useState([]);

  // Sürükle-bırak konum ayar modu
  const [ayarModu, setAyarModu] = useState(false);
  const [suruklenen, setSuruklenen] = useState(null);

  const seciliRenkRef = useRef(seciliRenk);
  const sekilRef = useRef(sekil);
  const efektRef = useRef(efekt);
  const hazirNoktalarRef = useRef([]);
  const boyaliTirnaklarRef = useRef({});

  useEffect(() => { seciliRenkRef.current = seciliRenk; }, [seciliRenk]);
  useEffect(() => { sekilRef.current = sekil; }, [sekil]);
  useEffect(() => { efektRef.current = efekt; }, [efekt]);
  useEffect(() => { hazirNoktalarRef.current = hazirNoktalar; }, [hazirNoktalar]);
  useEffect(() => { boyaliTirnaklarRef.current = boyaliTirnaklar; }, [boyaliTirnaklar]);

  // MediaPipe başlat (sadece kamera modu için)
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

          const pts = NAIL_TIPS.map((tipIdx, i) => {
            const dipIdx = NAIL_DIPS[i];
            const tipX = lm[tipIdx].x * canvas.width;
            const tipY = lm[tipIdx].y * canvas.height;
            const dipX = lm[dipIdx].x * canvas.width;
            const dipY = lm[dipIdx].y * canvas.height;
            const dx = tipX - dipX;
            const dy = tipY - dipY;
            const len = Math.sqrt(dx * dx + dy * dy);
            const aci = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
            const boyut = Math.max(14, len * 0.85);
            const yukseklik = Math.max(20, len * 1.15);
            const cx = tipX - (dx / len) * (yukseklik * 0.32);
            const cy = tipY - (dy / len) * (yukseklik * 0.32);
            return { x: cx, y: cy, boyut, yukseklik, aci };
          });

          canliNoktalarRef.current = pts;
          setCanliNoktalar(pts);
          setFotoNoktalar(pts);
          setHazirNoktalar(pts);
          setHazirAlgilaniyor(false);
        }
      });
      handsRef.current = hands;

      // Hazır el fotoğrafını yükle — sabit koordinatlarla
      const img = new Image();
      img.crossOrigin = "anonymous";
      const base = import.meta.env.BASE_URL || "/";
      img.src = base.endsWith("/") ? `${base}el.jpg` : `${base}/el.jpg`;

      img.onload = () => {
        elImgRef.current = img;
        setHazirYuklendi(true);
        setHazirAlgilaniyor(false);
        setFotoMod(false);

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const w = img.naturalWidth;
        const h = img.naturalHeight;

        // Sabit tırnak koordinatları (el.jpg el arkası pozisyonu için)
        const pts = [
  // Başparmak
  { x: w * 0.295, y: h * 0.360, boyut: w * 0.048, yukseklik: w * 0.062, aci: -44 },
  // İşaret
  { x: w * 0.370, y: h * 0.225, boyut: w * 0.048, yukseklik: w * 0.065, aci: -10 },
  // Orta
  { x: w * 0.505, y: h * 0.170, boyut: w * 0.048, yukseklik: w * 0.065, aci: 2 },
  // Yüzük
  { x: w * 0.628, y: h * 0.230, boyut: w * 0.044, yukseklik: w * 0.060, aci: 14 },
  // Serçe
  { x: w * 0.740, y: h * 0.310, boyut: w * 0.036, yukseklik: w * 0.050, aci: 26 },
];

        setHazirNoktalar(pts);
      };

      img.onerror = () => {
        console.error("el.jpg yüklenemedi — public/ klasörünü kontrol et");
        setHazirYuklendi(false);
        setHazirAlgilaniyor(false);
      };
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
  }, []);

  // Hazır mod canvas çizimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mod !== "hazir" || !elImgRef.current) return;
    const ctx = canvas.getContext("2d");
    const img = elImgRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    hazirNoktalarRef.current.forEach((pt, i) => {
      // Ayar modunda küçük kılavuz nokta çiz
      if (ayarModu) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = suruklenen === i ? "#e8638c" : "rgba(155,114,207,0.8)";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (boyaliTirnaklarRef.current[i]) {
        const { renk, sekil: s, efekt: e } = boyaliTirnaklarRef.current[i];
        tirnaKCiz(ctx, pt.x, pt.y, pt.boyut, pt.yukseklik, pt.aci, s, renk, e);
      }
    });
  }, [mod, boyaliTirnaklar, hazirNoktalar, ayarModu, suruklenen]);

  // Fotoğraf modu canvas çizimi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || mod !== "foto" || !imgObj) return;
    const ctx = canvas.getContext("2d");
    canvas.width = imgObj.naturalWidth;
    canvas.height = imgObj.naturalHeight;
    ctx.drawImage(imgObj, 0, 0);
    fotoNoktalar.forEach(({ x, y, renk, sekil: s, efekt: e, boyut, yukseklik, aci }) => {
      tirnaKCiz(ctx, x, y, boyut, yukseklik ?? boyut * 1.4, aci ?? 0, s, renk, e);
    });
  }, [mod, fotoNoktalar, imgObj]);

  async function kameralariGetir() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videos = devices.filter((d) => d.kind === "videoinput");
      setKameraListesi(videos);
      if (videos.length > 0 && !seciliKamera) setSeciliKamera(videos[0].deviceId);
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
      const liste = kameraListesi.length > 0 ? kameraListesi : await kameralariGetir();
      if (liste.length === 0) { setKameraYukleniyor(false); return; }
      const constraints = {
        video: seciliKamera ? { deviceId: { exact: seciliKamera } } : { facingMode: "environment" },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play();
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

    // ↓ DÜZELTME: sekil ve efekt direkt ref'ten okunuyor
    canliNoktalarRef.current.forEach(({ x, y, boyut, yukseklik, aci }) => {
      tirnaKCiz(
        ctx,
        x, y,
        boyut,
        yukseklik ?? boyut * 1.4,
        aci ?? 0,
        sekilRef.current,      // ← artık güncel şekil
        seciliRenkRef.current, // ← artık güncel renk
        efektRef.current       // ← artık güncel efekt
      );
    });

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

  // Sürükle-bırak: mouse down
  function handleMouseDown(e) {
    if (mod !== "hazir") return;
    if (!ayarModu) {
      handleHazirTikla(e);
      return;
    }
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    let enYakin = null, enMesafe = 999;
    hazirNoktalar.forEach((pt, i) => {
      const d = Math.sqrt((mx - pt.x) ** 2 + (my - pt.y) ** 2);
      if (d < enMesafe) { enMesafe = d; enYakin = i; }
    });
    if (enYakin !== null && enMesafe < 80) setSuruklenen(enYakin);
  }

  // Sürükle-bırak: mouse move
  function handleMouseMove(e) {
    if (!ayarModu || suruklenen === null || mod !== "hazir") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    setHazirNoktalar(prev => {
      const yeni = [...prev];
      yeni[suruklenen] = { ...yeni[suruklenen], x: mx, y: my };
      return yeni;
    });
  }

  // Sürükle-bırak: mouse up
  function handleMouseUp() {
    setSuruklenen(null);
  }

  // Koordinatları konsola yazdır
  function koordinatlariYazdir() {
    const w = elImgRef.current?.naturalWidth || 1000;
    const h = elImgRef.current?.naturalHeight || 1000;
    const isimler = ["Başparmak", "İşaret", "Orta", "Yüzük", "Serçe"];
    const cikti = hazirNoktalar.map((pt, i) =>
      `// ${isimler[i]}\n{ x: w * ${(pt.x / w).toFixed(3)}, y: h * ${(pt.y / h).toFixed(3)}, boyut: w * ${(pt.boyut / w).toFixed(3)}, yukseklik: w * ${(pt.yukseklik / w).toFixed(3)}, aci: ${pt.aci} },`
    ).join('\n');
    console.log("=== YENİ KOORDİNATLAR ===\n" + cikti);
    alert("Koordinatlar konsola yazdırıldı!\nF12 > Console sekmesine bak ve kopyala.");
  }

  function handleHazirTikla(e) {
    if (mod !== "hazir") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (fotoMod || hazirNoktalar.length === 0) {
      const boyut = canvas.width * 0.038;
      setBoyaliTirnaklar((prev) => ({
        ...prev,
        [Date.now()]: { x: mx, y: my, renk: seciliRenk, sekil, efekt, boyut, yukseklik: boyut * 1.4, aci: 0, manuel: true },
      }));
      return;
    }

    let enYakin = null;
    let enYakinMesafe = 999;
    hazirNoktalar.forEach((pt, i) => {
      const d = Math.sqrt((mx - pt.x) ** 2 + (my - pt.y) ** 2);
      if (d < enYakinMesafe) {
        enYakinMesafe = d;
        enYakin = i;
      }
    });
    const tolerans = hazirNoktalar[enYakin]?.boyut * 2.5 ?? 80;
    if (enYakin !== null && enYakinMesafe < tolerans) {
      setBoyaliTirnaklar((prev) => ({
        ...prev,
        [enYakin]: { renk: seciliRenk, sekil, efekt },
      }));
    }
  }

  function handleFotoTikla(e) {
    if (mod !== "foto" || !imgObj) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const boyut = canvas.width * 0.038;
    setFotoNoktalar((prev) => [
      ...prev,
      { x, y, renk: seciliRenk, sekil, efekt, boyut, yukseklik: boyut * 1.5, aci: 0 },
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
    if (mod === "hazir" && hazirNoktalar.length > 0) {
      const yeni = {};
      hazirNoktalar.forEach((_, i) => {
        yeni[i] = { renk: seciliRenk, sekil, efekt };
      });
      setBoyaliTirnaklar(yeni);
    }
  }

  function handleSifirla() {
    setBoyaliTirnaklar({});
    setFotoNoktalar([]);
    setCanliNoktalar([]);
    canliNoktalarRef.current = [];

    if (mod === "hazir" && elImgRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(elImgRef.current, 0, 0);
    }
  }

  function handleIndir() {
    const canvas = canvasRef.current;
    const link = document.createElement("a");
    link.download = "naily-tirnak.png";
    link.href = canvas.toDataURL();
    link.click();
  }

  const MODLAR = [
    { key: "hazir", label: "🖐 Hazır Model", aciklama: "Hazır el fotoğrafına uygula" },
    { key: "foto", label: "📸 Fotoğrafım", aciklama: "Kendi elinin fotoğrafını yükle" },
    { key: "kamera", label: "📷 Canlı Kamera", aciklama: "Kameranla gerçek zamanlı dene" },
  ];

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
                      boxShadow: seciliRenk === r.kod ? `0 0 0 3px white, 0 0 0 5px ${r.kod}` : "none",
                      transform: seciliRenk === r.kod ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                ))}
                <div style={{ ...s.renkTop, overflow: "hidden", padding: 0 }} title="Özel Renk">
                  <input
                    type="color"
                    value={ozelRenk}
                    onChange={(e) => { setOzelRenk(e.target.value); setSeciliRenk(e.target.value); }}
                    style={{ width: "200%", height: "200%", margin: "-50%", cursor: "pointer", border: "none" }}
                  />
                </div>
              </div>
              <div style={s.seciliRenkGoster}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: seciliRenk, border: "2px solid rgba(0,0,0,0.1)" }} />
                <span style={{ fontSize: 12, color: "#6b6278" }}>Seçili: {seciliRenk}</span>
              </div>
            </div>

            {/* Şekil */}
            <div style={s.panelKart}>
              <h3 style={s.panelBaslik}>✦ Şekil</h3>
              <div style={s.chipRow}>
                {SEKILLER.map((sv) => (
                  <button key={sv} onClick={() => setSekil(sv)} style={{ ...s.chip, ...(sekil === sv ? s.chipAktif : {}) }} className="chip-btn">
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
                  <button key={ef} onClick={() => setEfekt(ef)} style={{ ...s.chip, ...(efekt === ef ? s.chipAktif : {}) }} className="chip-btn">
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
                  <button onClick={tumunuBoya} style={s.aksiyon1} className="aksiyon-btn" disabled={hazirNoktalar.length === 0}>
                    ✨ Tümüne Uygula
                  </button>
                )}
                <button onClick={handleSifirla} style={s.aksiyon2} className="aksiyon-btn2">
                  🔄 Sıfırla
                </button>
                <button onClick={handleIndir} style={s.aksiyon1} className="aksiyon-btn">
                  💾 PNG İndir
                </button>
                {/* Konum ayar modu — sadece hazır modda */}
                {mod === "hazir" && (
                  <>
                    <button
                      onClick={() => { setAyarModu(m => !m); setSuruklenen(null); }}
                      style={{ ...s.aksiyon2, color: ayarModu ? "#9b72cf" : "#6b6278", borderColor: ayarModu ? "#9b72cf" : "#e8e2d9" }}
                      className="aksiyon-btn2"
                    >
                      {ayarModu ? "✅ Ayar Modu Açık" : "🎯 Konum Ayarla"}
                    </button>
                    {ayarModu && (
                      <button onClick={koordinatlariYazdir} style={s.aksiyon1} className="aksiyon-btn">
                        📋 Koordinatları Kaydet
                      </button>
                    )}
                  </>
                )}
              </div>
              {ayarModu && (
                <p style={{ fontSize: 11, color: "#9b72cf", marginTop: 8, lineHeight: 1.5 }}>
                  🎯 Mor noktaları sürükleyerek tırnakları doğru konuma getir. Bitince "Koordinatları Kaydet"e bas.
                </p>
              )}
            </div>
          </div>

          {/* Sağ panel */}
          <div style={s.sagPanel}>
            {/* Kamera kontrolleri */}
            {mod === "kamera" && (
              <div style={s.kameraKontrol}>
                {kameraListesi.length > 0 && (
                  <div style={s.kameraSecimRow}>
                    <label style={s.kameraLabel}>📷 Kamera Seç</label>
                    <select
                      value={seciliKamera}
                      onChange={(e) => {
                        setSeciliKamera(e.target.value);
                        if (kameraAcik) { kameraKapat(); setTimeout(kameraAc, 300); }
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
                  {kameraYukleniyor ? "⏳ Bağlanıyor..." : kameraAcik ? "⏹ Kamerayı Kapat" : "▶ Kamerayı Aç"}
                </button>
              </div>
            )}

            {/* Fotoğraf yükleme */}
            {mod === "foto" && !imgObj && (
              <label style={s.yukleAlani} className="yukle-alani">
                <span style={{ fontSize: 44 }}>📁</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#4a4458" }}>Fotoğraf Seç</span>
                <span style={{ fontSize: 12, color: "#8b829a" }}>JPG, PNG desteklenir</span>
                <input type="file" accept="image/*" onChange={handleResimYukle} style={{ display: "none" }} />
              </label>
            )}

            {/* Hazır mod yükleniyor */}
            {mod === "hazir" && hazirAlgilaniyor && (
              <div style={s.placeholder}>
                <div style={s.spinner} />
                <p style={{ fontWeight: 600, color: "#4a4458", margin: "16px 0 4px" }}>Yükleniyor...</p>
                <p style={{ fontSize: 13, color: "#8b829a", margin: 0 }}>El fotoğrafı hazırlanıyor</p>
              </div>
            )}

            {/* Hazır mod hata */}
            {mod === "hazir" && !hazirAlgilaniyor && !hazirYuklendi && (
              <div style={s.hataBant}>
                ⚠️ el.jpg yüklenemedi. public/ klasöründe olduğundan emin ol.
              </div>
            )}

            <video ref={videoRef} style={{ display: "none" }} playsInline muted />

            <canvas
              ref={canvasRef}
              onMouseDown={mod === "hazir" ? handleMouseDown : mod === "foto" ? handleFotoTikla : undefined}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                ...s.canvas,
                cursor: mod === "kamera" ? "default" : ayarModu ? "grab" : "pointer",
                display: canvasGorunur && !(mod === "hazir" && hazirAlgilaniyor) ? "block" : "none",
              }}
            />

            {mod === "kamera" && !kameraAcik && !kameraYukleniyor && (
              <div style={s.placeholder}>
                <span style={{ fontSize: 52 }}>📷</span>
                <p style={{ fontWeight: 600, color: "#4a4458", margin: "12px 0 4px" }}>Kamera Hazır</p>
                <p style={{ fontSize: 13, color: "#8b829a", margin: 0 }}>
                  {kameraListesi.length > 0
                    ? `${kameraListesi.length} kamera bulundu`
                    : "Kamera listesi yükleniyor..."}
                </p>
              </div>
            )}

            {mod === "hazir" && !hazirAlgilaniyor && hazirNoktalar.length > 0 && !ayarModu && (
              <p style={s.ipucu}>💡 Tırnağa tıklayarak boyayabilirsin</p>
            )}
            {mod === "foto" && imgObj && (
              <p style={s.ipucu}>💡 Tırnakların üstüne tıklayarak boyayabilirsin</p>
            )}
            {mod === "kamera" && kameraAcik && (
              <p style={s.ipucu}>💡 Elini kameraya tut — yapay zeka tırnaklarını otomatik bulur</p>
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
  .renk-top { transition:all 0.18s; cursor:pointer; }
  .renk-top:hover { transform:scale(1.18)!important; }
  .chip-btn { transition:all 0.18s; cursor:pointer; }
  .chip-btn:hover { color:#9b72cf!important; }
  .aksiyon-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,99,140,0.35)!important; }
  .aksiyon-btn2:hover { color:#9b72cf!important; }
  .yukle-alani:hover { background:rgba(155,114,207,0.04)!important; }
`;

const s = {
  page: { fontFamily: "'Outfit',sans-serif", background: "#faf8f5", minHeight: "100vh" },
  hero: { position: "relative", overflow: "hidden", background: "linear-gradient(160deg,#ffffff 0%,#faf8f5 50%,#f3eeff 100%)", borderBottom: "1px solid #ede8e0", padding: "40px 24px 36px" },
  blob1: { position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle,rgba(232,99,140,0.07) 0%,transparent 70%)", top: -200, right: -100, pointerEvents: "none" },
  blob2: { position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(155,114,207,0.08) 0%,transparent 70%)", bottom: -100, left: -80, pointerEvents: "none" },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" },
  heroMain: { display: "flex", alignItems: "center", gap: 20 },
  avatar: { width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg,#fdeef4,#f3eeff)", border: "2px solid rgba(232,99,140,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 16px rgba(155,114,207,0.14)" },
  heroEtiket: { fontSize: 12, fontWeight: 600, color: "#e8638c", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" },
  heroBaslik: { fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#1a1625", margin: "0 0 6px", lineHeight: 1.15 },
  heroAlt: { fontSize: 13, color: "#8b829a", margin: 0 },
  icerik: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" },
  modRow: { display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" },
  modBtn: { flex: "1 1 160px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "16px 12px", borderRadius: 16, border: "1.5px solid #e8e2d9", background: "white", fontFamily: "'Outfit',sans-serif", color: "#4a4458", boxShadow: "0 2px 10px rgba(155,114,207,0.06)", cursor: "pointer" },
  modBtnAktif: { background: "linear-gradient(135deg,#fdeef4,#f3eeff)", border: "1.5px solid rgba(232,99,140,0.2)", color: "#1a1625" },
  anaGrid: { display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, alignItems: "start" },
  solPanel: { display: "flex", flexDirection: "column", gap: 14 },
  panelKart: { background: "white", borderRadius: 18, border: "1px solid rgba(232,99,140,0.08)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(155,114,207,0.07)" },
  panelBaslik: { fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 700, color: "#1a1625", margin: "0 0 14px" },
  renkGrid: { display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 10 },
  renkTop: { width: 32, height: 32, borderRadius: "50%", transition: "all 0.18s" },
  seciliRenkGoster: { display: "flex", alignItems: "center", gap: 8, marginTop: 4 },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 7 },
  chip: { fontFamily: "'Outfit',sans-serif", padding: "6px 14px", borderRadius: 20, border: "1.5px solid #e8e2d9", background: "white", fontSize: 12, fontWeight: 500, color: "#4a4458", cursor: "pointer" },
  chipAktif: { background: "linear-gradient(135deg,#e8638c,#9b72cf)", color: "white", border: "1.5px solid transparent", fontWeight: 600, boxShadow: "0 3px 12px rgba(232,99,140,0.25)" },
  aksiyon1: { fontFamily: "'Outfit',sans-serif", width: "100%", padding: "11px 16px", background: "linear-gradient(135deg,#e8638c,#9b72cf)", color: "white", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(232,99,140,0.24)", transition: "all 0.22s" },
  aksiyon2: { fontFamily: "'Outfit',sans-serif", width: "100%", padding: "11px 16px", background: "white", color: "#6b6278", border: "1.5px solid #e8e2d9", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.22s" },
  sagPanel: { display: "flex", flexDirection: "column", gap: 16 },
  kameraKontrol: { background: "white", borderRadius: 18, border: "1px solid rgba(232,99,140,0.08)", padding: "18px 20px", boxShadow: "0 2px 12px rgba(155,114,207,0.07)", display: "flex", flexDirection: "column", gap: 12 },
  kameraSecimRow: { display: "flex", flexDirection: "column", gap: 6 },
  kameraLabel: { fontSize: 13, fontWeight: 600, color: "#4a4458" },
  kameraSelect: { fontFamily: "'Outfit',sans-serif", padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e8e2d9", fontSize: 13, color: "#1a1625", background: "#faf8f5", outline: "none", cursor: "pointer" },
  hataBant: { background: "rgba(232,99,140,0.08)", border: "1px solid rgba(232,99,140,0.2)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#9f1239" },
  yukleAlani: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: "56px 24px", borderRadius: 20, border: "2px dashed rgba(155,114,207,0.25)", background: "white", cursor: "pointer", transition: "all 0.22s", minHeight: 240 },
  canvas: { maxWidth: "100%", borderRadius: 20, boxShadow: "0 4px 32px rgba(155,114,207,0.12)", border: "1px solid rgba(232,99,140,0.08)" },
  placeholder: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, background: "white", borderRadius: 20, border: "1px solid rgba(232,99,140,0.08)", padding: "48px 24px", textAlign: "center", boxShadow: "0 2px 12px rgba(155,114,207,0.07)" },
  spinner: { width: 36, height: 36, borderRadius: "50%", border: "3px solid #f3eeff", borderTopColor: "#9b72cf", animation: "spin 0.9s linear infinite" },
  ipucu: { fontSize: 12, color: "#8b829a", textAlign: "center", margin: "8px 0 0", fontStyle: "italic" },
};