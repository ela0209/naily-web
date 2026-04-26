import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); // "admin" | "user" | null
  const [salonId, setSalonId] = useState(null); // adminin bağlı olduğu salon
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        // Firestore'dan kullanıcı rolünü ve salonId'sini oku
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setRole(data.role || "user");
          setSalonId(data.salonId || null); // admin hangi salona bağlı
        } else {
          setRole("user");
          setSalonId(null);
        }
      } else {
        setRole(null);
        setSalonId(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ currentUser, role, salonId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
export { AuthContext };
