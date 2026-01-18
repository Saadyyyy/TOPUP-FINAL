import { useState, useEffect } from "react";
import { useBanners } from "@/hooks/useBanners";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Search, Menu, X, Sparkles } from "lucide-react";
import CurrencySwitch from "@/components/common/CurrencySwitch";
import { LogoIcon } from "@/components/icons";
import TopUpForm from "@/components/home/TopUpForm";
import ProductGrid from "@/components/home/ProductGrid";
import CategoryFilter from "@/components/home/CategoryFilter";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: banners = [] } = useBanners(true);
  const { data: categories = [] } = useCategories();

  // Using server-side filtering for category and sorting/pagination
  // Client-side search for now to match perceived behavior or strictly server-side?
  // Let's use server-side search if the API supports it (it does).
  const { data: productsResponse, isLoading } = useProducts(
    selectedCategory || undefined,
    false,
    currentPage,
    limit,
    debouncedSearch,
  );

  const products = productsResponse?.data || [];
  const pagination = productsResponse?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 font-sans">
      {/* Header */}
      <header className="bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 shadow-xl sticky top-0 z-50 border-b-4 border-yellow-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <LogoIcon />
              <div className="relative hidden md:block">
                <h1 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
                  DREAMCOINS
                </h1>
                <p className="text-xs font-bold text-yellow-300 tracking-wider">
                  STORE
                </p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
                <input
                  type="text"
                  placeholder="Cari produk impianmu..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all shadow-lg placeholder:text-gray-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CurrencySwitch />
              <button
                className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
              {/* Admin Link - Desktop */}
              <Link
                to="/admin/login"
                className="hidden md:flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-full hover:shadow-2xl hover:scale-105 transition-all text-sm shadow-lg"
              >
                Admin Area
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20 animate-in slide-in-from-top-2">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-600" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/95 border-2 border-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <Link
                to="/admin/login"
                className="block text-center py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-xl shadow-lg"
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 w-full">
        {/* Hero Banner Section */}
        {banners.length > 0 && (
          <section className="mb-8 md:mb-12">
            <div className="relative h-40 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-4 border-cyan-400/30 transform hover:scale-[1.01] transition-transform duration-500">
              {banners[0].image_url && (
                <img
                  src={banners[0].image_url}
                  alt={banners[0].title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/70 via-blue-900/40 to-transparent flex items-end">
                <div className="p-6 md:p-10 text-white">
                  <h2 className="text-2xl md:text-4xl font-black mb-2 drop-shadow-lg">
                    {banners[0].title}
                  </h2>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Categories & Products */}
          <div className="flex-1 order-2 lg:order-1">
            {/* Categories Tabs */}
            {categories.length > 0 && (
              <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(id) => {
                    setSelectedCategory(id);
                    setCurrentPage(1);
                    setSelectedProduct(null); // Reset product selection on category change
                  }}
                />
              </div>
            )}

            {/* Header for Product Section */}
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-600 to-blue-700 bg-clip-text text-transparent">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name
                  : "Pilih Item"}
              </h2>
            </div>

            {/* Product Grid Component */}
            <ProductGrid
              products={products}
              selectedProduct={selectedProduct}
              onSelectProduct={setSelectedProduct}
              isLoading={isLoading}
            />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-6 py-2 bg-white cursor-pointer border-2 border-cyan-300 text-cyan-700 rounded-xl font-bold hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                >
                  Previous
                </button>
                <span className="text-sm font-bold text-gray-700 bg-white px-4 py-2 rounded-xl border-2 border-cyan-200 shadow-md">
                  {currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-6 py-2 bg-white cursor-pointer border-2 border-cyan-300 text-cyan-700 rounded-xl font-bold hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Top Up Form (Sticky) */}
          <aside className="lg:w-[400px] order-1 lg:order-2">
            <div className="sticky top-24 z-30">
              <TopUpForm selectedProduct={selectedProduct} />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-700 text-white mt-12 md:mt-16 shadow-2xl">
        <div className="border-t-4 border-yellow-400"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div>
              <h3 className="text-xl font-black mb-4 text-yellow-300 flex items-center gap-2">
                <LogoIcon /> DreamCoins
              </h3>
              <p className="text-cyan-50 text-sm leading-relaxed max-w-xs">
                Platform top up game dan e-wallet tercepat dan terpercaya di
                Indonesia. Nikmati pengalaman top up anti ribet!
              </p>
            </div>

            {/* Simple Footer Links */}
            <div>
              <h4 className="font-bold text-yellow-300 mb-4">Layanan</h4>
              <ul className="space-y-2 text-sm text-cyan-50">
                <li>
                  <p className="">Bantuan 24/7</p>
                </li>
                <li>
                  <p className="">Metode Pembayaran</p>
                </li>
                <li>
                  <p className="">Testimoni</p>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-yellow-300 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-cyan-50">
                <li>
                  <p className="">Syarat & Ketentuan</p>
                </li>
                <li>
                  <p className="">Kebijakan Privasi</p>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-cyan-500/30 mt-8 pt-6 text-center text-sm text-cyan-100/80">
            © 2026 DreamCoins Store. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
