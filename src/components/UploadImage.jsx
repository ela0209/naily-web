import { useRef, useState } from "react";
import { uploadService } from "../services/uploadService";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  .up-wrap { font-family: 'Outfit', sans-serif; }

  .up-zone {
    border: 2px dashed rgba(155,114,207,0.30);
    border-radius: 20px;
    background: linear-gradient(135deg, rgba(232,99,140,0.03), rgba(155,114,207,0.04));
    padding: 36px 24px;
    display: flex; flex-direction: column;
    align-items: center; gap: 10px;
    cursor: pointer; transition: all 0.2s;
    text-align: center;
  }
  .up-zone:hover, .up-zone.dragover {
    border-color: rgba(155,114,207,0.55);
    background: linear-gradient(135deg, rgba(232,99,140,0.06), rgba(155,114,207,0.07));
  }

  .up-ikon {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.15);
    display: flex; align-items: center; justify-content: center; font-size: 24px;
  }
  .up-baslik {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; font-weight: 700; color: #1a1625;
  }
  .up-alt { font-size: 12px; color: #8b829a; line-height: 1.5; }

  .up-pill {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(155,114,207,0.08);
    border: 1px solid rgba(155,114,207,0.18);
    border-radius: 20px; padding: 4px 12px;
    font-size: 11px; font-weight: 700; color: #9b72cf;
  }

  .up-onizleme {
    margin-top: 14px; border-radius: 16px;
    overflow: hidden; border: 1.5px solid rgba(155,114,207,0.15);
    position: relative; animation: fadeUp 0.25s ease both;
  }
  .up-onizleme img { width: 100%; height: 160px; object-fit: cover; display: block; }
  .up-sil {
    position: absolute; top: 8px; right: 8px;
    background: rgba(232,99,140,0.85); border: none;
    border-radius: 8px; color: white;
    font-size: 12px; font-weight: 700;
    padding: 4px 10px; cursor: pointer;
    font-family: 'Outfit', sans-serif;
    transition: background 0.2s;
  }
  .up-sil:hover { background: rgba(232,99,140,1); }

  .up-btn {
    font-family: 'Outfit', sans-serif;
    width: 100%; margin-top: 12px;
    padding: 12px 20px; border-radius: 14px;
    font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    background: linear-gradient(135deg, #e8638c, #9b72cf);
    border: none; color: white;
    box-shadow: 0 4px 14px rgba(232,99,140,0.22);
  }
  .up-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(232,99,140,0.30); }
  .up-btn:disabled { opacity: 0.55; cursor: not-allowed; }

  .up-mesaj {
    margin-top: 10px; border-radius: 12px;
    padding: 10px 14px; font-size: 13px; font-weight: 500;
    display: flex; align-items: center; gap: 8px;
  }
  .up-mesaj-ok  { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.20); color: #065f46; }
  .up-mesaj-err { background: rgba(232,99,140,0.08); border: 1px solid rgba(232,99,140,0.22); color: #9f1239; }
`;

export default function UploadImage({ salonId, onYuklendi }) {
  const inputRef = useRef();
  const [dosya, setDosya] = useState(null);
  const [onizleme, setOnizleme] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [mesaj, setMesaj] = useState(null); // { tip: "ok"|"err", metin }
  const [dragOver, setDragOver] = useState(false);

  function dosyaSec(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setDosya(file);
    setOnizleme(URL.createObjectURL(file));
    setMesaj(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    dosyaSec(e.dataTransfer.files[0]);
  }

  function handleKaldir() {
    setDosya(null);
    setOnizleme(null);
    setMesaj(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleYukle() {
    if (!dosya || !salonId) return;
    setYukleniyor(true);
    setMesaj(null);
    try {
      const url = await uploadService(salonId, dosya);
      setMesaj({ tip: "ok", metin: "Fotoğraf başarıyla yüklendi!" });
      onYuklendi?.(url);
      handleKaldir();
    } catch {
      setMesaj({ tip: "err", metin: "Yükleme başarısız. Tekrar deneyin." });
    } finally {
      setYukleniyor(false);
    }
  }

  return (
    <div className="up-wrap">
      <style>{CSS}</style>

      {/* Sürükle-bırak alanı */}
      <div
        className={`up-zone${dragOver ? " dragover" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="up-ikon">🖼️</div>
        <div className="up-baslik">Fotoğraf Yükle</div>
        <div className="up-alt">
          Sürükle & bırak veya tıkla
          <br />
          PNG, JPG — maks. 5MB
        </div>
        <span className="up-pill">📎 Dosya Seç</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => dosyaSec(e.target.files[0])}
        />
      </div>

      {/* Önizleme */}
      {onizleme && (
        <div className="up-onizleme">
          <img src={onizleme} alt="Önizleme" />
          <button className="up-sil" onClick={handleKaldir}>
            ✕ Kaldır
          </button>
        </div>
      )}

      {/* Yükle butonu */}
      {dosya && (
        <button className="up-btn" onClick={handleYukle} disabled={yukleniyor}>
          {yukleniyor ? "☁️ Yükleniyor..." : "☁️ Firebase'e Yükle"}
        </button>
      )}

      {/* Mesaj */}
      {mesaj && (
        <div className={`up-mesaj up-mesaj-${mesaj.tip}`}>
          {mesaj.tip === "ok" ? "✅" : "⚠️"} {mesaj.metin}
        </div>
      )}
    </div>
  );
}
