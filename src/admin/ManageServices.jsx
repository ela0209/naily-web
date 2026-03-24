import { useEffect, useState } from "react";
import { getSalonlar } from "../services/salonService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ManageServices() {
  const [salonlar, setSalonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duzenle, setDuzenle] = useState(null);
  const [yeniAd, setYeniAd] = useState("");
  const [yeniTelefon, setYeniTelefon] = useState("");

  useEffect(() => {
    async function getVeri() {
      const data = await getSalonlar();
      setSalonlar(data);
      setLoading(false);
    }
    getVeri();
  }, []);

  async function handleGuncelle(id) {
    await updateDoc(doc(db, "salons", id), {
      name: yeniAd,
      phone: yeniTelefon,
    });
    setSalonlar(
      salonlar.map((s) =>
        s.id === id ? { ...s, name: yeniAd, phone: yeniTelefon } : s,
      ),
    );
    setDuzenle(null);
  }

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h2>🏪 Salon Yönetimi</h2>
      {salonlar.map((s) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
          }}
        >
          {duzenle === s.id ? (
            <>
              <input
                value={yeniAd}
                onChange={(e) => setYeniAd(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: 8,
                  padding: 6,
                }}
              />
              <input
                value={yeniTelefon}
                onChange={(e) => setYeniTelefon(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  marginBottom: 8,
                  padding: 6,
                }}
              />
              <button
                onClick={() => handleGuncelle(s.id)}
                style={{
                  padding: "6px 15px",
                  background: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  marginRight: 8,
                }}
              >
                💾 Kaydet
              </button>
              <button
                onClick={() => setDuzenle(null)}
                style={{
                  padding: "6px 15px",
                  background: "#ccc",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                İptal
              </button>
            </>
          ) : (
            <>
              <p>
                <strong>{s.name}</strong>
              </p>
              <p>📍 {s.address}</p>
              <p>📞 {s.phone}</p>
              <button
                onClick={() => {
                  setDuzenle(s.id);
                  setYeniAd(s.name);
                  setYeniTelefon(s.phone);
                }}
                style={{
                  padding: "6px 15px",
                  background: "#ff69b4",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                }}
              >
                ✏️ Düzenle
              </button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
