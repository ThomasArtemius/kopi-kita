export function formatRupiah(price: number): string {
  return `Rp ${price.toLocaleString("id-ID")}`;
}
