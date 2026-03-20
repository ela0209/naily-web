import { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [randevular, setRandevular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    async function getRandevular() {
      const snapshot = await getDocs(collection(db, "randevular"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRandevular(data);
      setLoading(false);
    }
    getRandevular();
  }, [currentUser]);

  async function handleDurum(id, yeniDurum) {
    await updateDoc(doc(db, "randevular", id), { durum: yeniDurum });
    setRandevular(
      randevular.map((r) => (r.id === id ? { ...r, durum: yeniDurum } : r)),
    );
  }

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 100 }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: 700, margin: "50px auto" }}>
      <h1>🛠️ Admin Paneli</h1>
      <h2>Tüm Randevular</h2>

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

          <div style={{ marginTop: 10 }}>
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
        </div>
      ))}
    </div>
  );
}
