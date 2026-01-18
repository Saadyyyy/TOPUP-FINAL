import { useCurrency } from "@/contexts/CurrencyContext";
import { BoxIcon, CoinIcon } from "@/components/icons";
import { ShoppingCart } from "lucide-react";

interface ProductGridProps {
  products: any[];
  selectedProduct: any | null;
  onSelectProduct: (product: any) => void;
  isLoading?: boolean;
}

export default function ProductGrid({
  products,
  selectedProduct,
  onSelectProduct,
  isLoading = false,
}: ProductGridProps) {
  const { formatPrice } = useCurrency();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-white to-cyan-50/30 rounded-2xl overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gradient-to-br from-cyan-100 to-blue-100" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-yellow-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 bg-white/60 rounded-2xl border-2 border-dashed border-cyan-300">
        <div className="text-6xl mb-4">🎮</div>
        <p className="text-gray-600 font-semibold text-lg">
          Produk tidak ditemukan
        </p>
        <p className="text-gray-500 text-sm mt-2">
          Coba kategori atau pencarian lain
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
      {products.map((product) => {
        const isSelected = selectedProduct?.id === product.id;

        return (
          <div
            key={product.id}
            onClick={() => onSelectProduct(product)}
            className={`
              group relative bg-gradient-to-br from-white to-cyan-50/30 rounded-2xl overflow-hidden 
              cursor-pointer transition-all duration-300 shadow-md
              ${
                isSelected
                  ? "ring-4 ring-cyan-500 shadow-2xl shadow-cyan-500/40 scale-[1.02]"
                  : "hover:shadow-xl hover:scale-[1.02]"
              }
            `}
          >
            {/* Selected Badge - Top Right */}
            {isSelected && (
              <div className="absolute top-2 right-2 z-10 animate-in zoom-in">
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full p-1.5 shadow-lg">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            )}

            {/* Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-cyan-100 via-blue-50 to-purple-50 overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isSelected ? "scale-110" : "group-hover:scale-110"
                  }`}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingCart className="w-16 h-16 text-cyan-300 opacity-40" />
                </div>
              )}

              {/* Gradient Overlay at Bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent" />

              {/* Product Name Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-center gap-x-2">
                <CoinIcon />
                <p className="text-white text-xs md:text-sm font-bold text-center drop-shadow-lg line-clamp-2">
                  {product.name}
                </p>
              </div>
            </div>

            {/* Product Info */}
            <div
              className={`p-3 md:p-4 space-y-2 transition-colors ${isSelected ? "bg-cyan-50/50" : "bg-white"}`}
            >
              {/* Box/Package Info */}
              {product.box && (
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                  <BoxIcon />
                  <span className="truncate font-medium">{product.box}</span>
                </div>
              )}

              {/* Price Button */}
              <div className="pt-1">
                <div
                  className={`
                  bg-gradient-to-r from-yellow-400 to-yellow-500 
                  text-center py-2 md:py-2.5 rounded-xl shadow-md
                  transition-all duration-300
                  ${isSelected ? "shadow-lg shadow-yellow-500/50 scale-105" : "group-hover:shadow-lg"}
                `}
                >
                  <p className="text-sm md:text-base font-black text-gray-900">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>

              {/* Selection Hint */}
              <div
                className={`
                text-xs font-semibold text-center transition-all
                ${isSelected ? "text-cyan-600" : "text-gray-400 group-hover:text-cyan-500"}
              `}
              >
                {isSelected ? "✓ Terpilih" : "Klik untuk pilih"}
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div
              className={`h-1 transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                  : "bg-gradient-to-r from-gray-200 to-gray-300 group-hover:from-cyan-400 group-hover:to-blue-500"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
