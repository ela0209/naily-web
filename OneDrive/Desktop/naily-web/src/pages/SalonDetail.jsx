import { useEffect, useState } from "react";
import { doc, getDoc, collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SalonDetail() {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [salon, setSalon] = useState(null);
  const [yorumlar, setYorumlar] = useState([]);
  const [yeniYorum, setYeniYorum] = useState("");
  const [puan, setPuan] = useState(5);

  useEffect(() => {
    async function getSalon() {
      const docRef = doc(db, "salons", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSalon({ id: docSnap.id, ...docSnap.data() });
      }
    }

    async function getYorumlar() {
      const snapshot = await getDocs(collection(db, "salons", id, "yorumlar"));
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setYorumlar(data);
    }

    getSalon();
    getYorumlar();
  }, [id]);

  async function handleYorumEkle() {
    if (!yeniYorum.trim()) return;
    await addDoc(collection(db, "salons", id, "yorumlar"), {
      yorum: yeniYorum,
      puan: puan,
      email: currentUser.email,
      tarih: new Date().toLocaleDateString("tr-TR"),
    });
    setYeniYorum("");
    const snapshot = await getDocs(collection(db, "salons", id, "yorumlar"));
    setYorumlar(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  if (!salon)
    return <p style={{ textAlign: "center", marginTop: 100 }}>Yükleniyor...</p>;

  return (
    <div style={{ maxWidth: 600, margin: "50px auto" }}>
      <Link to="/salons">← Geri</Link>
      <h1>{salon.name}</h1>
      <p>📍 {salon.address}</p>
      <p>📞 {salon.phone}</p>
      <p>⭐ {salon.rating}</p>

      <Link to={`/appointment/${salon.id}`}>
        <button
          style={{ padding: "10px 30px", margin: "10px 0", background: "pink" }}
        >
          📅 Randevu Al
        </button>
      </Link>

      <hr />
      <h2>Yorumlar</h2>

      {yorumlar.length === 0 && <p>Henüz yorum yok.</p>}
      {yorumlar.map((y) => (
        <div
          key={y.id}
          style={{
            border: "1px solid #eee",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
          }}
        >
          <strong>{y.email}</strong> — ⭐ {y.puan}
          <p>{y.yorum}</p>
          <small>{y.tarih}</small>
        </div>
      ))}

      {currentUser && (
        <div style={{ marginTop: 20 }}>
          <h3>Yorum Yap</h3>
          <select
            value={puan}
            onChange={(e) => setPuan(Number(e.target.value))}
            style={{ marginBottom: 10, padding: 5 }}
          >
            {[1, 2, 3, 4, 5].map((p) => (
              <option key={p} value={p}>
                {p} ⭐
              </option>
            ))}
          </select>
          <br />
          <textarea
            value={yeniYorum}
            onChange={(e) => setYeniYorum(e.target.value)}
            placeholder="Yorumunuzu yazın..."
            style={{ width: "100%", height: 80, padding: 8, marginBottom: 10 }}
          />
          <br />
          <button onClick={handleYorumEkle} style={{ padding: "8px 20px" }}>
            Yorum Gönder
          </button>
        </div>
      )}
    </div>
  );
}
