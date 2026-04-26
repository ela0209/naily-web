export function ortalamaPuan(yorumlar) {
  if (!yorumlar || yorumlar.length === 0) return 0;
  const toplam = yorumlar.reduce((acc, y) => acc + y.puan, 0);
  return (toplam / yorumlar.length).toFixed(1);
}
