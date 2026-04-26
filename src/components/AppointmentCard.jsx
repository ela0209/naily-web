/* ─────────────────────────────────────────────────────────────
   AppointmentCard.jsx
   Kullanım:
     <AppointmentCard
       randevu={{
         id: "abc123",
         musteriAdi: "Ayşe Kaya",
         musteriEmail: "ayse@mail.com",
         salonAdi: "Naily Studio",
         hizmet: "Protez Tırnak",
         tarih: "2025-06-15",
         saat: "14:30",
         durum: "bekliyor",        // "bekliyor" | "onaylandi" | "iptal"
         fiyat: "350",
         notlar: "Pembe renk tercih ediyorum",
       }}
       onOnayla={(id) => ...}      // sadece admin için
       onIptal={(id) => ...}
       onDetay={(randevu) => ...}
       isAdmin={true}              // false ise Onayla butonu gizlenir
     />
─────────────────────────────────────────────────────────────── */

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

  @keyframes acCard {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .appc {
    font-family: 'Outfit', sans-serif;
    background: #ffffff;
    border-radius: 20px;
    border: 1px solid rgba(232,99,140,0.10);
    box-shadow: 0 2px 16px rgba(155,114,207,0.07);
    overflow: hidden;
    animation: acCard 0.35s ease both;
    transition: box-shadow 0.25s, transform 0.25s;
  }
  .appc:hover {
    box-shadow: 0 8px 32px rgba(155,114,207,0.14);
    transform: translateY(-2px);
  }

  /* Renkli üst şerit */
  .appc-stripe {
    height: 4px;
    width: 100%;
  }
  .appc-stripe.bekliyor  { background: linear-gradient(90deg, #f9c74f, #f8961e); }
  .appc-stripe.onaylandi { background: linear-gradient(90deg, #43aa8b, #90be6d); }
  .appc-stripe.iptal     { background: linear-gradient(90deg, #e8638c, #c9184a); }

  /* Gövde */
  .appc-body { padding: 20px 22px 16px; }

  /* Üst satır: isim + durum etiketi */
  .appc-toprow {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
  }
  .appc-musteri {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .appc-avatar {
    width: 44px; height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fdeef4, #f3eeff);
    border: 1.5px solid rgba(155,114,207,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .appc-ad {
    font-family: 'Cormorant Garamond', serif;
    font-size: 19px;
    font-weight: 700;
    color: #1a1625;
    line-height: 1.2;
  }
  .appc-email {
    font-size: 11px;
    color: #8b829a;
    margin-top: 1px;
  }

  /* Durum etiketi */
  .appc-durum {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .appc-durum.bekliyor  { background: rgba(249,199,79,0.14);  color: #b57c00; border: 1px solid rgba(249,199,79,0.35); }
  .appc-durum.onaylandi { background: rgba(67,170,139,0.12);  color: #2a7a5c; border: 1px solid rgba(67,170,139,0.3); }
  .appc-durum.iptal     { background: rgba(232,99,140,0.10);  color: #c9184a; border: 1px solid rgba(232,99,140,0.25); }
  .appc-durum-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
  }
  .bekliyor  .appc-durum-dot { background: #f8961e; }
  .onaylandi .appc-durum-dot { background: #43aa8b; }
  .iptal     .appc-durum-dot { background: #e8638c; }

  /* Bilgi grid */
  .appc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 14px;
  }
  @media (max-width: 400px) {
    .appc-grid { grid-template-columns: 1fr; }
  }
  .appc-info {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }
  .appc-info-icon {
    width: 30px; height: 30px;
    border-radius: 9px;
    background: linear-gradient(135deg, rgba(232,99,140,0.07), rgba(155,114,207,0.09));
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .appc-info-label {
    font-size: 10px;
    color: #8b829a;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 1px;
  }
  .appc-info-val {
    font-size: 13px;
    font-weight: 600;
    color: #1a1625;
  }

  /* Not satırı */
  .appc-not {
    background: rgba(155,114,207,0.05);
    border-left: 3px solid rgba(155,114,207,0.3);
    border-radius: 0 8px 8px 0;
    padding: 8px 12px;
    font-size: 12px;
    color: #5a5070;
    margin-bottom: 14px;
    line-height: 1.5;
  }
  .appc-not-label {
    font-size: 10px;
    font-weight: 700;
    color: #9b72cf;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 2px;
  }

  /* Ayırıcı */
  .appc-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(155,114,207,0.12), transparent);
    margin: 0 0 14px;
  }

  /* Butonlar */
  .appc-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .appc-btn {
    font-family: 'Outfit', sans-serif;
    flex: 1;
    min-width: 80px;
    padding: 9px 14px;
    border-radius: 12px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .appc-btn-onayla {
    background: linear-gradient(135deg, #43aa8b, #52b788);
    color: white;
    box-shadow: 0 3px 10px rgba(67,170,139,0.28);
  }
  .appc-btn-onayla:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(67,170,139,0.38);
  }
  .appc-btn-iptal {
    background: rgba(232,99,140,0.08);
    color: #e8638c;
    border: 1.5px solid rgba(232,99,140,0.2);
  }
  .appc-btn-iptal:hover {
    background: rgba(232,99,140,0.15);
    border-color: rgba(232,99,140,0.35);
    transform: translateY(-1px);
  }
  .appc-btn-detay {
    background: rgba(155,114,207,0.07);
    color: #9b72cf;
    border: 1.5px solid rgba(155,114,207,0.18);
  }
  .appc-btn-detay:hover {
    background: rgba(155,114,207,0.13);
    border-color: rgba(155,114,207,0.32);
    transform: translateY(-1px);
  }
  .appc-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none !important;
  }
`;

const DURUM_ICON = {
  bekliyor: "⏳",
  onaylandi: "✅",
  iptal: "❌",
};

const DURUM_LABEL = {
  bekliyor: "Bekliyor",
  onaylandi: "Onaylandı",
  iptal: "İptal",
};

export default function AppointmentCard({
  randevu = {},
  onOnayla,
  onIptal,
  onDetay,
  isAdmin = false,
}) {
  const {
    id,
    musteriAdi = "İsimsiz",
    musteriEmail = "",
    salonAdi = "",
    hizmet = "—",
    tarih = "—",
    saat = "—",
    durum = "bekliyor",
    fiyat = "",
    notlar = "",
  } = randevu;

  const durumKey = ["bekliyor", "onaylandi", "iptal"].includes(durum)
    ? durum
    : "bekliyor";

  /* Tarih formatla: 2025-06-15 → 15 Haz 2025 */
  function formatTarih(t) {
    if (!t || t === "—") return "—";
    const d = new Date(t);
    if (isNaN(d)) return t;
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* İsmin baş harflerinden avatar emoji yedeği */
  function initials(name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="appc">
        {/* Renkli şerit */}
        <div className={`appc-stripe ${durumKey}`} />

        <div className="appc-body">
          {/* Üst satır */}
          <div className="appc-toprow">
            <div className="appc-musteri">
              <div className="appc-avatar">{initials(musteriAdi)}</div>
              <div>
                <div className="appc-ad">{musteriAdi}</div>
                {musteriEmail && (
                  <div className="appc-email">{musteriEmail}</div>
                )}
              </div>
            </div>

            <span className={`appc-durum ${durumKey}`}>
              <span className="appc-durum-dot" />
              {DURUM_LABEL[durumKey]}
            </span>
          </div>

          {/* Bilgi grid */}
          <div className="appc-grid">
            <div className="appc-info">
              <div className="appc-info-icon">💅</div>
              <div>
                <div className="appc-info-label">Hizmet</div>
                <div className="appc-info-val">{hizmet}</div>
              </div>
            </div>

            <div className="appc-info">
              <div className="appc-info-icon">📅</div>
              <div>
                <div className="appc-info-label">Tarih</div>
                <div className="appc-info-val">{formatTarih(tarih)}</div>
              </div>
            </div>

            <div className="appc-info">
              <div className="appc-info-icon">🕐</div>
              <div>
                <div className="appc-info-label">Saat</div>
                <div className="appc-info-val">{saat}</div>
              </div>
            </div>

            {salonAdi && (
              <div className="appc-info">
                <div className="appc-info-icon">🏪</div>
                <div>
                  <div className="appc-info-label">Salon</div>
                  <div className="appc-info-val">{salonAdi}</div>
                </div>
              </div>
            )}

            {fiyat && (
              <div className="appc-info">
                <div className="appc-info-icon">💰</div>
                <div>
                  <div className="appc-info-label">Ücret</div>
                  <div className="appc-info-val">{fiyat} ₺</div>
                </div>
              </div>
            )}
          </div>

          {/* Notlar */}
          {notlar && (
            <div className="appc-not">
              <div className="appc-not-label">📝 Müşteri Notu</div>
              {notlar}
            </div>
          )}

          <div className="appc-divider" />

          {/* Aksiyon butonları */}
          <div className="appc-actions">
            {/* Onayla – sadece admin ve bekliyor durumunda */}
            {isAdmin && durumKey === "bekliyor" && onOnayla && (
              <button
                className="appc-btn appc-btn-onayla"
                onClick={() => onOnayla(id)}
              >
                ✔ Onayla
              </button>
            )}

            {/* İptal – iptal olmamışsa göster */}
            {durumKey !== "iptal" && onIptal && (
              <button
                className="appc-btn appc-btn-iptal"
                onClick={() => onIptal(id)}
              >
                ✕ İptal
              </button>
            )}

            {/* Detay */}
            {onDetay && (
              <button
                className="appc-btn appc-btn-detay"
                onClick={() => onDetay(randevu)}
              >
                🔍 Detay
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
