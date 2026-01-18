import { Category } from "@/hooks/useCategories";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {/* All Categories Button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 ${
          selectedCategory === null
            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
            : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
        }`}
      >
        🌟 Semua
      </button>

      {/* Category Buttons */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={`group relative px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 overflow-hidden ${
            selectedCategory === category.id
              ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 shadow-lg shadow-yellow-500/50"
              : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
          }`}
        >
          {/* Background animation */}
          <div
            className={`absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-10 transition-opacity ${
              selectedCategory === category.id ? "opacity-20" : ""
            }`}
          />

          <span className="relative flex items-center gap-2">
            {category.image_url && (
              <div className="relative w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={category.image_url}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {category.name}
          </span>
        </button>
      ))}
    </div>
  );
}
