const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sc-kart {
    background: white;
    border-radius: 20px;
    border: 1px solid rgba(232,99,140,0.10);
    box-shadow: 0 2px 16px rgba(155,114,207,0.08);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    animation: fadeUp 0.25s ease both;
    transition: box-shadow 0.2s;
    font-family: 'Outfit', sans-serif;
  }
  .sc-kart:hover { box-shadow: 0 6px 28px rgba(155,114,207,0.13); }

  .sc-sol { display: flex; gap: 14px; align-items: flex-start; flex: 1; min-width: 0; }

  .sc-ikon {
    width: 48px; height: 48px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.13);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }

  .sc-adi {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px; font-weight: 700; color: #1a1625; margin-bottom: 4px;
  }
  .sc-meta { font-size: 12px; color: #8b829a; font-weight: 500; margin-bottom: 3px; }

  .sc-puan {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(251,191,36,0.10);
    border: 1px solid rgba(251,191,36,0.25);
    border-radius: 20px; padding: 3px 10px;
    font-size: 12px; font-weight: 700; color: #92690b; margin-top: 5px;
  }

  .sc-btn {
    font-family: 'Outfit', sans-serif;
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 14px;
    font-size: 13px; font-weight: 700;
    cursor: pointer; transition: all 0.2s;
    background: linear-gradient(135deg, #e8638c, #9b72cf);
    border: none; color: white;
    box-shadow: 0 4px 14px rgba(232,99,140,0.22);
    white-space: nowrap;
  }
  .sc-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(232,99,140,0.32); }
`;

export default function SalonCard({ salon, onRandevu }) {
  const ortPuan = salon.ortPuan ?? null;
  const yorumSayisi = salon.yorumSayisi ?? 0;

  return (
    <div className="sc-kart">
      <style>{CSS}</style>

      <div className="sc-sol">
        <div className="sc-ikon">💅</div>
        <div>
          <div className="sc-adi">{salon.name}</div>
          {salon.address && <div className="sc-meta">📍 {salon.address}</div>}
          {salon.saatler?.acilis && salon.saatler?.kapanis && (
            <div className="sc-meta">
              🕐 {salon.saatler.acilis} — {salon.saatler.kapanis}
            </div>
          )}
          {ortPuan !== null && (
            <div className="sc-puan">
              ⭐ {Number(ortPuan).toFixed(1)} · {yorumSayisi} yorum
            </div>
          )}
        </div>
      </div>

      <button className="sc-btn" onClick={() => onRandevu?.(salon.id)}>
        📅 Randevu Al
      </button>
    </div>
  );
}
