import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { Link } from "react-router-dom";

function mesafeHesapla(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function SalonList() {
  const [salons, setSalons] = useState([]);
  const [yakinSalonlar, setYakinSalonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [konumHata, setKonumHata] = useState("");
  const [konumAranıyor, setKonumAranıyor] = useState(false);

  useEffect(() => {
    async function getSalons() {
      const snapshot = await getDocs(collection(db, "salons"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSalons(data);
      setLoading(false);
    }
    getSalons();
  }, []);

  function konumBul() {
    setKonumAranıyor(true);
    setKonumHata("");
    if (!navigator.geolocation) {
      setKonumHata("Tarayıcın konum desteklemiyor.");
      setKonumAranıyor(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const mesafeli = salons.map((s) => ({
          ...s,
          mesafe: mesafeHesapla(latitude, longitude, s.lat, s.lng),
        }));
        mesafeli.sort((a, b) => a.mesafe - b.mesafe);
        setYakinSalonlar(mesafeli.slice(0, 3));
        setKonumAranıyor(false);
      },
      () => {
        setKonumHata("Konum alınamadı. Lütfen izin ver.");
        setKonumAranıyor(false);
      },
    );
  }

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 100 }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
      <h1>💅 Tırnak Salonları</h1>

      <button
        onClick={konumBul}
        style={{
          padding: "10px 25px",
          background: "#ff69b4",
          color: "white",
          border: "none",
          borderRadius: 20,
          fontSize: 16,
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        {konumAranıyor
          ? "📍 Konum aranıyor..."
          : "📍 Bana En Yakın 3 Salonu Göster"}
      </button>

      {konumHata && <p style={{ color: "red" }}>{konumHata}</p>}

      {yakinSalonlar.length > 0 && (
        <>
          <h2>📍 Sana En Yakın 3 Salon</h2>
          {yakinSalonlar.map((salon) => (
            <div
              key={salon.id}
              style={{
                border: "2px solid #ff69b4",
                borderRadius: 10,
                padding: 20,
                margin: "15px 0",
                textAlign: "left",
                background: "#fff0f6",
              }}
            >
              <h2>{salon.name}</h2>
              <p>📍 {salon.address}</p>
              <p>📞 {salon.phone}</p>
              <p>⭐ {salon.rating}</p>
              <p>
                🗺️ <strong>{salon.mesafe.toFixed(1)} km uzakta</strong>
              </p>
              <Link to={`/salons/${salon.id}`}>
                <button
                  style={{
                    padding: "8px 20px",
                    background: "#ff69b4",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                  }}
                >
                  Detayları Gör
                </button>
              </Link>
            </div>
          ))}
          <hr />
        </>
      )}

      <h2>Tüm Salonlar</h2>
      {salons.map((salon) => (
        <div
          key={salon.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 20,
            margin: "15px 0",
            textAlign: "left",
          }}
        >
          <h2>{salon.name}</h2>
          <p>📍 {salon.address}</p>
          <p>📞 {salon.phone}</p>
          <p>⭐ {salon.rating}</p>
          <Link to={`/salons/${salon.id}`}>
            <button style={{ padding: "8px 20px" }}>Detayları Gör</button>
          </Link>
        </div>
      ))}
    </div>
  );
}
