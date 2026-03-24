import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ManageAppointments from "../admin/ManageAppointments";
import ManageServices from "../admin/ManageServices";
import ManageWorkingHours from "../admin/ManageWorkingHours";
import ManageComments from "../admin/ManageComments";

export default function AdminDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [aktifSekme, setAktifSekme] = useState("randevular");

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  const sekmeler = [
    { id: "randevular", label: "📅 Randevular" },
    { id: "salonlar", label: "🏪 Salonlar" },
    { id: "saatler", label: "🕐 Çalışma Saatleri" },
    { id: "yorumlar", label: "💬 Yorumlar" },
  ];

  return (
    <div style={{ maxWidth: 800, margin: "50px auto", padding: "0 20px" }}>
      <h1>🛠️ Admin Paneli</h1>
      <p style={{ color: "#888" }}>Hoş geldin, {currentUser.email}</p>

      {/* Sekmeler */}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}
      >
        {sekmeler.map((s) => (
          <button
            key={s.id}
            onClick={() => setAktifSekme(s.id)}
            style={{
              padding: "10px 20px",
              background: aktifSekme === s.id ? "#ff69b4" : "#f0f0f0",
              color: aktifSekme === s.id ? "white" : "#333",
              border: "none",
              borderRadius: 20,
              cursor: "pointer",
              fontWeight: aktifSekme === s.id ? "bold" : "normal",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* İçerik */}
      {aktifSekme === "randevular" && <ManageAppointments />}
      {aktifSekme === "salonlar" && <ManageServices />}
      {aktifSekme === "saatler" && <ManageWorkingHours />}
      {aktifSekme === "yorumlar" && <ManageComments />}
    </div>
  );
}
