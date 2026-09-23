export function formatRupiah(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
