import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

export default function Appointment() {
  const { salonId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  const [tarih, setTarih] = useState("");
  const [saat, setSaat] = useState("");
  const [mesaj, setMesaj] = useState("");

  const saatler = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  useEffect(() => {
    async function getSalon() {
      const docRef = doc(db, "salons", salonId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setSalon({ id: docSnap.id, ...docSnap.data() });
    }
    getSalon();
  }, [salonId]);

  async function handleRandevu() {
    if (!tarih || !saat) {
      setMesaj("Lütfen tarih ve saat seçin!");
      return;
    }

    // Çakışma kontrolü
    const snapshot = await getDocs(collection(db, "randevular"));
    const cakisan = snapshot.docs.find(
      (d) =>
        d.data().salonId === salonId &&
        d.data().tarih === tarih &&
        d.data().saat === saat,
    );

    if (cakisan) {
      setMesaj("Bu saat dolu! Lütfen başka saat seçin.");
      return;
    }

    await addDoc(collection(db, "randevular"), {
      salonId,
      salonAdi: salon.name,
      kullanici: currentUser.email,
      tarih,
      saat,
      durum: "beklemede",
    });

    setMesaj("✅ Randevunuz alındı!");
    setTimeout(() => navigate("/"), 2000);
  }

  if (!salon)
    return <p style={{ textAlign: "center", marginTop: 100 }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: 500, margin: "50px auto", textAlign: "center" }}>
      <h1>📅 Randevu Al</h1>
      <h2>{salon.name}</h2>
      <p>📍 {salon.address}</p>

      <div style={{ textAlign: "left", marginTop: 20 }}>
        <label>Tarih:</label>
        <input
          type="date"
          value={tarih}
          onChange={(e) => setTarih(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: 8,
            marginBottom: 15,
          }}
        />

        <label>Saat:</label>
        <select
          value={saat}
          onChange={(e) => setSaat(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            padding: 8,
            marginBottom: 15,
          }}
        >
          <option value="">Saat seçin</option>
          {saatler.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {mesaj && (
        <p style={{ color: mesaj.includes("✅") ? "green" : "red" }}>{mesaj}</p>
      )}

      <button
        onClick={handleRandevu}
        style={{
          padding: "10px 30px",
          background: "pink",
          border: "none",
          borderRadius: 8,
          fontSize: 16,
        }}
      >
        Randevu Onayla
      </button>
    </div>
  );
}
