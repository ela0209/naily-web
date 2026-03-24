import { useState } from "react";

export function useLocation() {
  const [konum, setKonum] = useState(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  function konumAl() {
    setYukleniyor(true);
    setHata("");
    if (!navigator.geolocation) {
      setHata("Tarayıcın konum desteklemiyor.");
      setYukleniyor(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setKonum({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setYukleniyor(false);
      },
      () => {
        setHata("Konum alınamadı. Lütfen izin ver.");
        setYukleniyor(false);
      },
    );
  }

  return { konum, hata, yukleniyor, konumAl };
}
