import { useState } from "react";

const CSS = `
  .rs-wrap { display: inline-flex; align-items: center; gap: 4px; font-family: 'Outfit', sans-serif; }

  .rs-star {
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.15s;
    user-select: none;
  }
  .rs-star.dolu { filter: drop-shadow(0 0 3px rgba(251,191,36,0.45)); }
  .rs-star.bos  { filter: grayscale(1); opacity: 0.30; }

  .rs-star.interaktif:hover { transform: scale(1.22); }

  .rs-star.kucuk { font-size: 15px; cursor: default; }
  .rs-star.kucuk:hover { transform: none; }

  .rs-label {
    font-size: 12px; font-weight: 600; color: #8b829a;
    margin-left: 4px;
  }
`;

export default function RatingStars({
  puan = 0, // mevcut puan (0–5)
  onChange, // verilirse interaktif mod
  kucuk = false, // readonly küçük gösterim
  etiket = true, // "X / 5" yazısı
}) {
  const [hover, setHover] = useState(0);
  const interaktif = !!onChange;
  const gosterilen = interaktif ? hover || puan : puan;

  return (
    <div className="rs-wrap">
      <style>{CSS}</style>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={[
            "rs-star",
            n <= gosterilen ? "dolu" : "bos",
            kucuk ? "kucuk" : "",
            interaktif ? "interaktif" : "",
          ].join(" ")}
          onClick={() => interaktif && onChange(n)}
          onMouseEnter={() => interaktif && setHover(n)}
          onMouseLeave={() => interaktif && setHover(0)}
        >
          ⭐
        </span>
      ))}
      {etiket && <span className="rs-label">{puan} / 5</span>}
    </div>
  );
}
