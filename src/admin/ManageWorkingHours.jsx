import { useEffect, useState } from "react";
import { getSalonlar } from "../services/salonService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ManageWorkingHours() {
  const [salonlar, setSalonlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [duzenle, setDuzenle] = useState(null);
  const [saatler, setSaatler] = useState({ acilis: "", kapanis: "" });

  useEffect(() => {
    async function getVeri() {
      const data = await getSalonlar();
      setSalonlar(data);
      setLoading(false);
    }
    getVeri();
  }, []);

  async function handleGuncelle(id) {
    await updateDoc(doc(db, "salons", id), { saatler });
    setSalonlar(salonlar.map((s) => (s.id === id ? { ...s, saatler } : s)));
    setDuzenle(null);
  }

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h2>🕐 Çalışma Saatleri</h2>
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
          <p>
            <strong>{s.name}</strong>
          </p>
          <p>
            🕐{" "}
            {s.saatler
              ? `${s.saatler.acilis} - ${s.saatler.kapanis}`
              : "Saat girilmemiş"}
          </p>
          {duzenle === s.id ? (
            <>
              <input
                type="time"
                value={saatler.acilis}
                onChange={(e) =>
                  setSaatler({ ...saatler, acilis: e.target.value })
                }
                style={{ marginRight: 10, padding: 6 }}
              />
              <input
                type="time"
                value={saatler.kapanis}
                onChange={(e) =>
                  setSaatler({ ...saatler, kapanis: e.target.value })
                }
                style={{ marginRight: 10, padding: 6 }}
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
            <button
              onClick={() => {
                setDuzenle(s.id);
                setSaatler(s.saatler || { acilis: "", kapanis: "" });
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
          )}
        </div>
      ))}
    </div>
  );
}
