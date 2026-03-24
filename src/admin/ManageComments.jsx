import { useEffect, useState } from "react";
import { getSalonlar, getYorumlar } from "../services/salonService";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function ManageComments() {
  const [yorumlar, setYorumlar] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getVeri() {
      const salonlar = await getSalonlar();
      let tumYorumlar = [];
      for (const salon of salonlar) {
        const y = await getYorumlar(salon.id);
        y.forEach((yorum) =>
          tumYorumlar.push({
            ...yorum,
            salonAdi: salon.name,
            salonId: salon.id,
          }),
        );
      }
      setYorumlar(tumYorumlar);
      setLoading(false);
    }
    getVeri();
  }, []);

  async function handleSil(salonId, yorumId) {
    await deleteDoc(doc(db, "salons", salonId, "yorumlar", yorumId));
    setYorumlar(yorumlar.filter((y) => y.id !== yorumId));
  }

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div>
      <h2>💬 Yorum Yönetimi</h2>
      {yorumlar.length === 0 && <p>Henüz yorum yok.</p>}
      {yorumlar.map((y) => (
        <div
          key={y.id}
          style={{
            border: "1px solid #ccc",
            borderRadius: 10,
            padding: 15,
            marginBottom: 15,
          }}
        >
          <p>
            <strong>Salon:</strong> {y.salonAdi}
          </p>
          <p>
            <strong>Kullanıcı:</strong> {y.email}
          </p>
          <p>
            <strong>Puan:</strong> ⭐ {y.puan}
          </p>
          <p>
            <strong>Yorum:</strong> {y.yorum}
          </p>
          <button
            onClick={() => handleSil(y.salonId, y.id)}
            style={{
              padding: "6px 15px",
              background: "#f44336",
              color: "white",
              border: "none",
              borderRadius: 6,
            }}
          >
            🗑️ Sil
          </button>
        </div>
      ))}
    </div>
  );
}
