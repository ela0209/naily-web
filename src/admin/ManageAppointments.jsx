import { useEffect, useState } from "react";
import { getRandevular, randevuGuncelle } from "../services/appointmentService";

export default function ManageAppointments() {
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVeri() {
      const data = await getRandevular();
      setRandevular(data);
      setLoading(false);
    }
    getVeri();
  }, []);

  async function handleDurum(id, yeniDurum) {
    await randevuGuncelle(id, yeniDurum);
    setRandevular(
      randevular.map((r) => (r.id === id ? { ...r, durum: yeniDurum } : r)),
    );
  }

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h2>📅 Randevu Yönetimi</h2>
      {randevular.length === 0 && <p>Henüz randevu yok.</p>}
      {randevular.map((r) => (
        <div
          key={r.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
            background:
              r.durum === "onaylandi"
                ? "#e8f5e9"
                : r.durum === "iptal"
                  ? "#ffebee"
                  : "#fff8e1",
          }}
        >
          <p>
            <strong>Salon:</strong> {r.salonAdi}
          </p>
          <p>
            <strong>Kullanıcı:</strong> {r.kullanici}
          </p>
          <p>
            <strong>Tarih:</strong> {r.tarih} — {r.saat}
          </p>
          <p>
            <strong>Durum:</strong>{" "}
            {r.durum === "onaylandi"
              ? "✅ Onaylandı"
              : r.durum === "iptal"
                ? "❌ İptal"
                : "⏳ Beklemede"}
          </p>
          <button
            onClick={() => handleDurum(r.id, "onaylandi")}
            style={{
              padding: "6px 15px",
              marginRight: 10,
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: 6,
            }}
          >
            ✅ Onayla
          </button>
          <button
            onClick={() => handleDurum(r.id, "iptal")}
            style={{
              padding: "6px 15px",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 6,
            }}
          >
            ❌ İptal Et
          </button>
        </div>
      ))}
    </div>
  );
}
