type Props = {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
};

const categories = [
  "All",
  "Pizza",
  "Burgers",
  "Pasta",
  "Starters",
  "Main Course",
  "Desserts",
  "Drinks",
];
function CategoryFilter({
  selectedCategory,
  setSelectedCategory,
}: Props) {
  return (
    <section className="bg-[#FCF8F3] py-8">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-wrap justify-center gap-4">

          {categories.map((category) => (

            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full transition font-medium
              ${
                selectedCategory === category
                  ? "bg-orange-600 text-white"
                  : "bg-white hover:bg-orange-100"
              }`}
            >
              {category}
            </button>

          ))}

        </div>

      </div>
    </section>
  );
}

export default CategoryFilter;