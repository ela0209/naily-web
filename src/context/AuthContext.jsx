import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const AuthContext = createContext(null);

const SUPER_ADMIN_EMAIL = "elakaracay2005@gmail.com";

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null);
  const [salonId, setSalonId] = useState(null);
  const [salonAdi, setSalonAdi] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();

            // ── Ban kontrolü ──
            // Firestore'da hem "banned" hem "banlı" alanı olabilir
            if (data.banned || data.banlı) {
              await signOut(auth);
              alert("Hesabınız engellendi. Lütfen yönetici ile iletişime geçin.");
              setLoading(false);
              return;
            }

            // ── Rol tespiti ──
            // Firestore'da hem "role" hem "rol" alanı olabilir
            const hammRol = data.rol || data.role || "user";

            // Süper admin e-posta kontrolü (güvenlik katmanı)
            const gercekRol = user.email === SUPER_ADMIN_EMAIL
              ? "superadmin"
              : hammRol;

            setRole(gercekRol);

            // ── Salon ID ──
            const atananSalonId = data.salonId || null;
            setSalonId(atananSalonId);

            // Salon adını çek (admin ise)
            if (atananSalonId && gercekRol === "admin") {
              try {
                const salonDoc = await getDoc(doc(db, "salons", atananSalonId));
                if (salonDoc.exists()) {
                  setSalonAdi(salonDoc.data().name || null);
                }
              } catch (_) {
                setSalonAdi(null);
              }
            } else {
              setSalonAdi(null);
            }

          } else {
            // Firestore'da kullanıcı belgesi yok (yeni kayıt)
            setRole(user.email === SUPER_ADMIN_EMAIL ? "superadmin" : "user");
            setSalonId(null);
            setSalonAdi(null);
          }
        } catch (err) {
          // Offline / bağlantı hatası — uygulamayı çökertme
          console.warn("AuthContext: Kullanıcı verisi alınamadı:", err.message);
          setRole(user.email === SUPER_ADMIN_EMAIL ? "superadmin" : "user");
          setSalonId(null);
          setSalonAdi(null);
        }
      } else {
        setRole(null);
        setSalonId(null);
        setSalonAdi(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
  }

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ currentUser, role, salonId, salonAdi, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };