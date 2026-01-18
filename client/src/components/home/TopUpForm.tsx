import { useState } from "react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, User } from "lucide-react";
import { BoxIcon, CoinIcon } from "@/components/icons";

interface TopUpFormProps {
  selectedProduct: {
    id: number;
    name: string;
    price: number;
    box?: string;
  } | null;
}

export default function TopUpForm({ selectedProduct }: TopUpFormProps) {
  const [name, setName] = useState("");
  const { formatPrice } = useCurrency();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !selectedProduct) return;

    const adminWhatsApp =
      import.meta.env.VITE_ADMIN_WHATSAPP || "6287817649178";

    // Construct the message
    const message = `Halo Admin, saya ingin top up:

🎮 *Detail Akun*
Nama: ${name}

📦 *Detail Pesanan*
Item: ${selectedProduct.name}
${selectedProduct.box ? `Box: ${selectedProduct.box}` : ""}
Harga: ${formatPrice(selectedProduct.price)}

Mohon diproses ya! Terima kasih.`;

    const url = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border-2 border-cyan-200 p-6 sticky top-24">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            Top Up
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Masukkan data akun kamu dengan benar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {/* UID Input */}
            <div className="space-y-2">
              <Label
                htmlFor="uid"
                className="text-cyan-700 font-bold flex items-center gap-2"
              >
                <User className="w-4 h-4" /> Nama
              </Label>
              <Input
                id="name"
                placeholder="Masukkan Nama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-white border-2 border-cyan-300 focus:border-cyan-500 focus:ring-cyan-200 rounded-xl"
              />
            </div>
          </div>

          <div className="border-t-2 border-dashed border-cyan-200 my-4"></div>

          {/* Selected Product Summary */}
          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold">
              Item yang dipilih:
            </Label>
            {selectedProduct ? (
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-xl border border-cyan-200 animate-in fade-in zoom-in duration-300">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CoinIcon />
                      <h3 className="font-bold text-gray-800">
                        {selectedProduct.name}
                      </h3>
                    </div>
                    {selectedProduct.box && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <BoxIcon />
                        <span>{selectedProduct.box}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-sm font-black px-3 py-1 rounded-full shadow-sm">
                    {formatPrice(selectedProduct.price)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                <p>Silakan pilih produk terlebih dahulu</p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={!selectedProduct || !name.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <Send className="w-5 h-5 mr-2" />
            Pesan Sekarang
          </Button>

          <p className="text-xs text-center text-gray-500">
            Transaksi aman & terpercaya via WhatsApp
          </p>
        </form>
      </div>
    </div>
  );
}
