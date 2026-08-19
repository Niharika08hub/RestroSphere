import { Search } from "lucide-react";

type Props = {
  search: string;
  setSearch: (value: string) => void;
};

function SearchBar({ search, setSearch }: Props) {
  return (
    <section className="bg-[#FCF8F3] pb-6">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex items-center bg-white rounded-2xl shadow-lg px-5 py-4">

          <Search className="text-gray-400" size={22} />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search your favourite dish..."
            className="w-full ml-4 outline-none text-lg"
          />

        </div>

      </div>
    </section>
  );
}

export default SearchBar;