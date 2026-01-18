export function generateWhatsAppUrl(
  phoneNumber: string,
  customerName: string,
  product: { name: string; price: number },
): string {
  const message = `Halo, saya ${customerName}

Saya ingin membeli produk:
📦 ${product.name}
💰 Rp ${product.price.toLocaleString("id-ID")}

Mohon informasi lebih lanjut untuk melakukan pemesanan. Terima kasih!`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}

export function openWhatsApp(
  phoneNumber: string,
  customerName: string,
  product: { name: string; price: number },
): void {
  const url = generateWhatsAppUrl(phoneNumber, customerName, product);
  window.open(url, "_blank");
}
