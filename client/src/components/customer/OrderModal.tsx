import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { BoxIcon, CoinIcon } from "@/components/icons";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    price: number;
    box?: string;
  } | null;
}

export default function OrderModal({
  isOpen,
  onClose,
  product,
}: OrderModalProps) {
  const [customerName, setCustomerName] = useState("");
  const { formatPrice } = useCurrency();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !product) return;

    const adminWhatsApp =
      import.meta.env.VITE_ADMIN_WHATSAPP || "6287817649178";
    const message = `Halo, saya ${customerName}

Saya ingin membeli produk:
📦 ${product.name}
💰 ${formatPrice(product.price)}

Mohon informasi lebih lanjut untuk melakukan pemesanan. Terima kasih!`;

    const url = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(
      message,
    )}`;
    window.open(url, "_blank");

    // Reset and close
    setCustomerName("");
    onClose();
  };

  const handleClose = () => {
    setCustomerName("");
    onClose();
  };

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-yellow-50 border-4 border-cyan-400">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            Pesan Sekarang!
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Info */}
          <div className="bg-gradient-to-r space-y-2 from-cyan-50 to-blue-50 p-4 rounded-xl border-2 border-cyan-200">
            {/* <h3 className="font-bold text-cyan-700 mb-2">{product.name}</h3> */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CoinIcon />
                <h3 className="font-bold text-cyan-700">{product.name}</h3>
              </div>
              {product.box && (
                <div className="flex items-center">
                  <BoxIcon />
                  <h3 className="font-bold text-cyan-700">{product.box}</h3>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 rounded-full">
                <p className="text-sm font-black text-gray-900">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-cyan-700 font-bold">
              Nama Anda *
            </Label>
            <Input
              id="name"
              placeholder="Masukkan nama lengkap Anda"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="border-2 border-cyan-300 focus:border-cyan-500 focus:ring-cyan-200 bg-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-2 border-gray-300 hover:bg-gray-100"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!customerName.trim()}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-4 h-4 mr-2" />
              Pesan via WhatsApp
            </Button>
          </div>
        </form>

        {/* Info Note */}
        <p className="text-xs text-gray-600 text-center">
          Anda akan diarahkan ke WhatsApp untuk melanjutkan pemesanan
        </p>
      </DialogContent>
    </Dialog>
  );
}
