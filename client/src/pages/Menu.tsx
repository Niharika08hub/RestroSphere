import { useState } from "react";
import { motion } from "framer-motion";

import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import MenuHero from "../components/Menu/MenuHero";
import SearchBar from "../components/Menu/SearchBar";
import CategoryFilter from "../components/Menu/CategoryFilter";
import FeaturedDishes from "../components/Menu/FeaturedDishes";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <Navbar />

      <MenuHero />

      <SearchBar
        search={search}
        setSearch={setSearch}
      />

      {/* CATEGORIES */}
<div id="menu-categories">
  <CategoryFilter
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
  />
</div>



      {/* POPULAR / FEATURED */}
      <div id="featured-dishes">
        <FeaturedDishes
          category={selectedCategory}
          search={search}
        />
      </div>

      <Footer />
    </motion.div>
  );
}